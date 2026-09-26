import hashlib
import importlib.metadata
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

from geometry import Rejected, digest, require

ROOT = Path(__file__).resolve().parent
LEDGER_PATH = ROOT / "artifacts/private/call-ledger.json"
QUOTA = {"source": "Parent-provided official OAuth quota snapshot; not this trial's call",
         "reported_on": "2026-09-11", "used": 273, "limit": 2500, "remaining": 2227,
         "native_reserve": 120, "manufacturing_reserve": 80, "official_reserve": 100,
         "annual_safety": 500}


def atomic_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".pending")
    with temporary.open("w", encoding="utf-8") as stream:
        json.dump(value, stream, indent=2, sort_keys=True)
        stream.write("\n")
        stream.flush()
        os.fsync(stream.fileno())
    os.replace(temporary, path)


def source_hashes():
    files = sorted(ROOT.glob("*.py")) + sorted(ROOT.glob("*.fs")) + [ROOT / "requirements.txt", ROOT / "intent.test-only.json"]
    files += [ROOT / "research/public-schema.json"]
    if (ROOT / "requirements.lock").exists():
        files.append(ROOT / "requirements.lock")
    return {str(path.relative_to(ROOT)).replace("\\", "/"): digest(path) for path in files}


def environment_versions():
    return {distribution.metadata["Name"]: distribution.version
            for distribution in importlib.metadata.distributions()}


def verify_preflight(path):
    report = json.loads(Path(path).read_text())
    require(report.get("status") == "PASS" and report.get("failed") == 0 and report.get("passed", 0) >= 22,
            "Offline preflight has not passed")
    require(report.get("source_hashes") == source_hashes(), "Stale preflight source hashes")
    require(report.get("environment") == environment_versions(), "Stale preflight dependencies")
    age = (datetime.now(timezone.utc) - datetime.fromisoformat(report["created_at"])).total_seconds()
    require(0 <= age <= 86400, "Preflight older than 24 hours")
    for relative, expected in report.get("artifacts", {}).items():
        artifact = (ROOT / relative).resolve()
        require(artifact.is_relative_to(ROOT / "artifacts/offline"), "Preflight artifact outside offline scope")
        require(digest(artifact) == expected, "Stale preflight artifact hash")
    require(len(report.get("artifacts", {})) >= 8, "A/B output evidence missing")
    return report


def require_live_authorization(fresh_key_confirmation, new_public_confirmation, preflight,
                   bindings_verified=False, current_key_confirmation=False):
    require(fresh_key_confirmation is True or current_key_confirmation is True,
        "BLOCKED: explicit current-key authorization or fresh-key confirmation missing")
    require(new_public_confirmation is True, "BLOCKED: NEW PUBLIC document confirmation missing")
    verify_preflight(preflight)
    require(QUOTA["remaining"] >= 120 + 80 + 100 + 500, "BLOCKED: combined annual reserve unavailable")
    require(bindings_verified is True,
            "BLOCKED: native fixture construction and exact server measurement bindings remain unverified; credentials not loaded")


class Ledger:
    def __init__(self, path=LEDGER_PATH, initialize=False):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.lock = self.path.with_suffix(".lock")
        try:
            self.lock_descriptor = os.open(self.lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        except FileExistsError:
            raise Rejected("Ledger locked; no automatic stale-lock recovery") from None
        try:
            if not self.path.exists():
                require(initialize, "Missing persisted ledger; explicit initialization required")
                atomic_json(self.path, {"schema": 1, "attempt_limit": 80, "events": [],
                            "create_reserved": False, "owned_document": None, "workspace": None,
                            "halted": False, "quota": QUOTA})
            self.state = json.loads(self.path.read_text())
            require(self.state["attempt_limit"] == 80 and len(self.state["events"]) <= 80,
                    "Invalid persisted budget")
        except BaseException:
            self.close()
            raise

    def close(self):
        os.close(self.lock_descriptor)
        self.lock.unlink()

    def save(self):
        atomic_json(self.path, self.state)

    def acknowledge(self, current_key=False, rotated=False):
        require(current_key is True or rotated is True, "Explicit key authorization required")
        self.state["authorization"] = {"current_key_acknowledged": current_key,
                                       "rotation_confirmed": rotated,
                                       "new_public_synthetic_only": True,
                                       "recorded_at": datetime.now(timezone.utc).isoformat()}
        self.state["quota"] = QUOTA
        self.save()

    def recover_known_creation(self):
        require(self.state["halted"] and self.state["create_reserved"] and not self.state["owned_document"],
            "Not a recoverable creation binding")
        require(len(self.state["events"]) == 1, "Creation recovery requires exactly one retained attempt")
        event = self.state["events"][0]
        require(event["operation"] == "create_document" and event["outcome"] == "SUCCESS" and
            200 <= event["status"] < 300, "Unknown creation cannot be recovered or replayed")
        evidence = json.loads((self.path.parent / event["evidence"]).read_text())
        require(evidence["request"]["path"] == "/documents" and
            evidence["request"]["body"]["isPublic"] is True and evidence["body"].get("public") is True,
            "Retained public creation evidence missing")
        self.state["owned_document"] = evidence["body"]["id"]
        self.state["workspace"] = evidence["body"]["defaultWorkspace"]["id"]
        self.state.setdefault("recoveries", []).append({"attempt": event["attempt"],
            "reason": "Bind known HTTP success: document response uses public, request uses isPublic",
            "replayed": False, "at": datetime.now(timezone.utc).isoformat()})
        self.state["halted"] = False
        self.save()

    def begin(self, operation, phase, method):
        require(phase in ("setup", "revision", "A", "B"), "Unclassified API expense")
        require(not self.state["halted"] and all(event["outcome"] != "UNKNOWN" for event in self.state["events"]),
                "Halted or ambiguous prior request; no automatic retry")
        require(len(self.state["events"]) < 80, "80 attempted request maximum reached")
        if phase in ("A", "B"):
            require(sum(event["phase"] == phase for event in self.state["events"]) < 10,
                    "Milestone request target exhausted")
        if operation == "create_document":
            require(not self.state["create_reserved"], "One new document maximum")
            self.state["create_reserved"] = True
        event = {"attempt": len(self.state["events"]) + 1, "operation": operation, "phase": phase,
                 "method": method, "outcome": "UNKNOWN", "status": None, "retry": False,
                 "started_at": datetime.now(timezone.utc).isoformat()}
        self.state["events"].append(event)
        self.save()
        return event

    def finish(self, event, status):
        event["status"] = status
        event["outcome"] = "SUCCESS" if 200 <= status < 400 else "FAILURE"
        if not 200 <= status < 300:
            self.state["halted"] = True
        self.save()

    def halt(self):
        self.state["halted"] = True
        self.save()

    def summary(self):
        events = self.state["events"]
        return {"attempted": len(events), "successful": sum(event["outcome"] == "SUCCESS" for event in events),
                "failed": sum(event["outcome"] == "FAILURE" for event in events),
                "unknown": sum(event["outcome"] == "UNKNOWN" for event in events), "retries": 0,
                "remaining_attempt_reserve": 80 - len(events),
                "phase_successes": {phase: sum(event["phase"] == phase and event["outcome"] == "SUCCESS"
                                              for event in events) for phase in ("setup", "revision", "A", "B")}}


class BoundedRequests:
    def __init__(self, ledger, sender):
        self.ledger = ledger
        self.sender = sender
        self.translations = set()
        self.external_data = set()
        self.versions = set(ledger.state.get("versions", {}))

    def request(self, operation, phase, *, document=None, workspace=None, version=None,
                element=None, resource=None, payload=None):
        owned = self.ledger.state["owned_document"]
        if operation != "create_document":
            require(document and document == owned, "Only the newly owned document is accessible")
        require(all(value is None or (isinstance(value, str) and value.replace("_", "").isalnum())
                    for value in (document, workspace, version, element, resource)), "Invalid resource identifier")
        body = None
        if operation == "create_document":
            method, path = "POST", "/documents"
            body = {"name": "Manufacturing package synthetic plate TEST ONLY", "isPublic": True}
        elif operation == "version":
            require(workspace == self.ledger.state["workspace"], "Unowned workspace")
            method, path = "POST", f"/documents/d/{document}/versions"
            body = {"documentId": document, "workspaceId": workspace, "name": f"Package {phase}"}
        elif operation == "elements":
            require(workspace == self.ledger.state["workspace"], "Unowned workspace")
            method, path = "GET", f"/documents/d/{document}/w/{workspace}/elements?withThumbnails=false"
        elif operation in ("workspace_features", "native_add", "native_update", "frame_measure"):
            require(workspace == self.ledger.state["workspace"] and
                    element == self.ledger.state.get("element") and element, "Unowned modeling target")
            base = f"/partstudios/d/{document}/w/{workspace}/e/{element}"
            if operation == "workspace_features":
                method, path = "GET", base + "/features?rollbackBarIndex=-1"
            elif operation == "frame_measure":
                require(isinstance(payload, dict) and "script" in payload, "Missing read-only measurement")
                method, path, body = "POST", base + "/featurescript?rollbackBarIndex=-1", payload
            else:
                feature = payload.get("feature", {}) if isinstance(payload, dict) else {}
                require(feature.get("featureType") in ("cPlane", "newSketch", "extrude"),
                        "Only native plane, sketch and extrude features allowed")
                require(not feature.get("namespace"), "Custom feature namespace denied")
                method, path, body = "POST", base + "/features", payload
                if operation == "native_update":
                    require(resource in self.ledger.state.get("feature_ids", []) and
                            feature.get("featureId") == resource, "Unowned feature edit")
                    path += f"/featureid/{resource}"
        elif operation == "measure":
            require(version in self.versions and element == self.ledger.state.get("element"),
                    "Unknown immutable measurement target")
            require(isinstance(payload, dict) and "script" in payload, "Missing read-only measurement")
            method, path, body = "POST", f"/partstudios/d/{document}/v/{version}/e/{element}/featurescript?rollbackBarIndex=-1", payload
        elif operation in ("features", "parts", "export"):
            require(version in self.versions and element, "Unknown immutable version or element")
            if operation == "parts":
                method, path = "GET", f"/parts/d/{document}/v/{version}?elementId={element}&withThumbnails=false"
            else:
                method = "POST" if operation == "export" else "GET"
                suffix = "export/step" if operation == "export" else "features?rollbackBarIndex=-1"
                path = f"/partstudios/d/{document}/v/{version}/e/{element}/{suffix}"
                if operation == "export":
                    body = {"storeInDocument": False, "grouping": True, "isYAxisUp": False,
                            "stepUnit": "MILLIMETER", "stepVersionString": "AP242", "notifyUser": False,
                            "triggerAutoDownload": False}
        elif operation == "poll":
            require(resource in self.translations, "Unbound translation")
            method, path = "GET", f"/translations/{resource}"
        elif operation == "download":
            require(resource in self.external_data, "Unbound external data")
            method, path = "GET", f"/documents/d/{document}/externaldata/{resource}"
        else:
            raise Rejected("Operation denied: no existing-document edits, sharing, deletion, or arbitrary requests")
        event = self.ledger.begin(operation, phase, method)
        started = time.monotonic()
        try:
            response = self.sender(method, "https://cad.onshape.com/api/v17" + path, body)
            event["elapsed_seconds"] = round(time.monotonic() - started, 3)
            event["path"] = path
            response_body = response["body"]
            evidence_path = self.ledger.path.parent / "responses" / f"{event['attempt']:03d}-{operation}.json"
            atomic_json(evidence_path, {"request": {"method": method, "path": path, "body": body},
                        "status": response["status"], "body": response_body if not isinstance(response_body, bytes)
                        else {"bytes": len(response_body), "sha256": bytes_hash(response_body)}})
            event["evidence"] = str(evidence_path.relative_to(self.ledger.path.parent)).replace("\\", "/")
            self.ledger.finish(event, response["status"])
            require(200 <= response["status"] < 300, "HTTP failure/redirect; stopped without retry")
            require(not response.get("redirected", False), "Redirect rejected")
            result = response["body"]
            if operation == "create_document":
                require(result.get("public", result.get("isPublic")) is True and result.get("id"), "Public visibility not verified")
                self.ledger.state["owned_document"] = result["id"]
                self.ledger.state["workspace"] = result["defaultWorkspace"]["id"]
                self.ledger.save()
            if operation == "version":
                require(result.get("documentId") == document and result.get("id") and result.get("microversion"),
                        "Version response identity missing")
                self.versions.add(result["id"])
                self.ledger.state.setdefault("versions", {})[result["id"]] = result
                self.ledger.save()
            if operation in ("native_add", "native_update") and result.get("feature", {}).get("featureId"):
                feature_id = result["feature"]["featureId"]
                if feature_id not in self.ledger.state.setdefault("feature_ids", []):
                    self.ledger.state["feature_ids"].append(feature_id)
                self.ledger.save()
            return result
        except BaseException as error:
            self.ledger.halt()
            if isinstance(error, Rejected):
                raise
            raise Rejected("Request outcome unavailable; stopped, no retry; raw error suppressed") from None


def bytes_hash(value):
    return hashlib.sha256(value).hexdigest()