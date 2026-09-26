from pathlib import Path
import json
from datetime import datetime, timezone

from geometry import compare, extract, require
from safety import atomic_json, bytes_hash


def complete_cached_download(ledger, revision, destination):
    destination = Path(destination)
    require(not (destination / "snapshot.json").exists(), "Completed snapshot is immutable")
    require(all(event["outcome"] == "SUCCESS" for event in ledger.state["events"]),
        "Cached recovery cannot resolve failed or unknown requests")
    checkpoint = ledger.state["snapshots"][revision]
    version, measured = checkpoint["version"], checkpoint["measured"]
    state = {"kind": "ONSHAPE", "document": ledger.state["owned_document"],
         "element": ledger.state["element"], "version": version["id"],
         "microversion": version["microversion"], "configuration": "default",
         "part": checkpoint["parts"][0]["partId"]}
    require(measured["state"] == state and measured["response_source_microversion"] == state["microversion"],
        "Retained measurement identity mismatch")
    features = checkpoint["features"]
    require(features["sourceMicroversion"] == state["microversion"] and features["isComplete"] and
        not features["microversionSkew"] and all(item["featureStatus"] == "OK"
        for item in features["featureStates"].values()), "Retained feature health mismatch")
    translation = checkpoint["translation"]
    bind_translation(translation, state)
    require(translation["requestState"] == "DONE" and len(translation["resultExternalDataIds"]) == 1,
        "No completed retained export")
    event = ledger.state["events"][-1]
    require(event["operation"] == "download" and event["phase"] == revision, "No retained milestone download")
    evidence = json.loads((ledger.path.parent / event["evidence"]).read_text())
    require(evidence["request"]["path"] == "/documents/d/" + state["document"] + "/externaldata/" +
        translation["resultExternalDataIds"][0], "Cached download job mismatch")
    original = (destination / "source.step").read_bytes()
    require(bytes_hash(original) == evidence["body"]["sha256"] and len(original) == evidence["body"]["bytes"],
        "Cached original bytes changed")
    actual = extract(destination / "source.step")
    compare(actual, measured["measurements"])
    manifest = {"schema": 1, "revision": revision, "state": state, "measurement_state": dict(state),
        "export_state": dict(state), "step_sha256": bytes_hash(original),
        "measurements": measured["measurements"], "measurement_origin": "EXACT_SERVER_EVALUATION",
        "measurement_response_source_microversion": measured["response_source_microversion"],
        "feature_health": "PASS", "translation_id": translation["id"],
        "source_timestamp": version["createdAt"], "api_cost": ledger.summary(), "release": "NOT_FOR_MANUFACTURE"}
    atomic_json(destination / "snapshot.json", manifest)
    ledger.state.setdefault("recoveries", []).append({"attempt": event["attempt"], "replayed": False,
    "reason": "Validated retained original metre-unit STEP using trimmed-surface adaptor; no network",
    "at": datetime.now(timezone.utc).isoformat()})
    ledger.state["halted"] = False
    ledger.save()
    return manifest


def bind_translation(response, state, translation_id=None):
    require(response.get("documentId") == state["document"] and
            response.get("requestElementId") == state["element"] and
            response.get("versionId") == state["version"] and not response.get("workspaceId"),
            "Export did not bind to the immutable version")
    require(response.get("id") and (translation_id is None or response["id"] == translation_id),
            "Translation ID mismatch")
    require(response.get("requestState") in ("ACTIVE", "DONE"), "Export failed or unsupported state")
    require(response.get("resultDocumentId") in (None, state["document"]), "Foreign result document")


def capture_snapshot(requests, element, revision, destination, measure_version, *, simulation=True, wait=None):
    require(revision in ("A", "B"), "Unsupported revision")
    require(callable(measure_version), "Exact server measurement adapter is required before snapshot calls")
    destination = Path(destination)
    require(not destination.exists(), "Immutable cache destination already exists")
    ledger = requests.ledger
    document, workspace = ledger.state["owned_document"], ledger.state["workspace"]
    try:
        checkpoint = ledger.state.setdefault("snapshots", {}).setdefault(revision, {})
        def retained(key, action):
            if key not in checkpoint:
                checkpoint[key] = action()
                ledger.save()
            return checkpoint[key]
        version = retained("version", lambda: requests.request("version", revision, document=document, workspace=workspace))
        state = {"kind": "PROTOCOL_SIMULATION" if simulation else "ONSHAPE", "document": document,
                 "element": element, "version": version["id"], "microversion": version["microversion"],
                 "configuration": "default"}
        options = {"document": document, "version": version["id"], "element": element}
        features = retained("features", lambda: requests.request("features", revision, **options))
        require(features.get("isComplete") is True and features.get("microversionSkew") is False and
                features.get("sourceMicroversion") == state["microversion"], "Feature snapshot mismatch")
        require(features.get("featureStates") and all(feature.get("featureStatus") == "OK"
                for feature in features["featureStates"].values()), "Unhealthy or missing native features")
        parts = retained("parts", lambda: requests.request("parts", revision, **options))
        require(len(parts) == 1 and parts[0].get("bodyType") == "solid" and not parts[0].get("isMesh", False)
                and parts[0].get("elementId") == element and parts[0].get("partId"),
                "STEP endpoint requires a single-solid default-configuration fixture")
        state["part"] = parts[0]["partId"]
        measured = retained("measured", lambda: measure_version(requests, state, revision))
        require(measured["state"] == state, "Measurement source state mismatch")
        translation = retained("translation", lambda: requests.request("export", revision, **options))
        bind_translation(translation, state)
        translation_id = translation["id"]
        requests.translations.add(translation_id)
        for poll_index in range(4):
            if translation["requestState"] == "DONE":
                break
            require(simulation or callable(wait), "Live polling requires a bounded backoff scheduler")
            if wait:
                wait(min(2 ** (poll_index + 1), 8))
            translation = requests.request("poll", revision, document=document, resource=translation_id)
            checkpoint["translation"] = translation
            ledger.save()
            bind_translation(translation, state, translation_id)
        require(translation["requestState"] == "DONE", "Bounded export polling exhausted")
        foreign_ids = translation.get("resultExternalDataIds")
        require(isinstance(foreign_ids, list) and len(foreign_ids) == 1 and not translation.get("resultElementIds"),
                "Expected exactly one external STEP file")
        requests.external_data.add(foreign_ids[0])
        original = requests.request("download", revision, document=document, resource=foreign_ids[0])
        require(isinstance(original, bytes) and len(original) > 100, "Missing STEP bytes")
        destination.mkdir(parents=True)
        step = destination / "source.step"
        step.write_bytes(original)
        actual = extract(step)
        compare(actual, measured["measurements"])
        manifest = {"schema": 1, "revision": revision, "state": state,
                    "measurement_state": measured["state"], "export_state": dict(state),
                    "step_sha256": bytes_hash(original), "measurements": measured["measurements"],
                    "measurement_origin": "MOCK_NOT_ONSHAPE" if simulation else "EXACT_SERVER_EVALUATION",
                    "measurement_response_source_microversion": measured.get("response_source_microversion"),
                    "feature_health": "PASS", "translation_id": translation_id,
                    "source_timestamp": version.get("createdAt"),
                    "api_cost": ledger.summary(), "release": "NOT_FOR_MANUFACTURE"}
        atomic_json(destination / "snapshot.json", manifest)
        return manifest
    except BaseException:
        ledger.halt()
        raise