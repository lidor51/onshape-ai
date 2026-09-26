from datetime import datetime, timezone

import pytest

from fixtures import synthetic_snapshot
from geometry import Rejected
from safety import BoundedRequests, Ledger, require_live_authorization, source_hashes
from snapshot import capture_snapshot


class SimulatedPublicResponses:
    def __init__(self, step):
        self.step = step
        self.calls = []

    def __call__(self, method, url, body):
        self.calls.append((method, url, body))
        if url.endswith("/documents"):
            result = {"id": "owned", "isPublic": True, "defaultWorkspace": {"id": "workspace"}}
        elif url.endswith("/versions"):
            result = {"id": "immutable", "documentId": "owned", "microversion": "microversion",
                      "createdAt": datetime.now(timezone.utc).isoformat()}
        elif "/features?" in url:
            result = {"isComplete": True, "microversionSkew": False, "sourceMicroversion": "microversion",
                      "featureStates": {"extrude": {"featureStatus": "OK"}}}
        elif "/parts/" in url:
            result = [{"elementId": "plate", "partId": "part", "bodyType": "solid", "isMesh": False}]
        elif url.endswith("/export/step") or "/translations/" in url:
            result = {"id": "translation", "documentId": "owned", "versionId": "immutable",
                      "workspaceId": None, "requestElementId": "plate", "requestState": "DONE",
                      "resultExternalDataIds": ["file"], "resultElementIds": None}
        else:
            result = self.step.read_bytes()
        return {"status": 200, "body": result}


def test_mock_snapshot_version_binding_and_cost(tmp_path):
    step, synthetic = synthetic_snapshot(tmp_path / "fixture", "B")
    ledger = Ledger(tmp_path / "ledger.json", initialize=True)
    sender = SimulatedPublicResponses(step)
    requests = BoundedRequests(ledger, sender)
    try:
        requests.request("create_document", "setup")
        def measurements(requests, state, revision):
            event = requests.ledger.begin("simulated_exact_measurement", revision, "POST")
            requests.ledger.finish(event, 200)
            return {"state": state, "measurements": synthetic["measurements"]}
        snapshot = capture_snapshot(requests, "plate", "B", tmp_path / "snapshot", measurements)
        assert snapshot["state"]["kind"] == "PROTOCOL_SIMULATION"
        assert snapshot["api_cost"]["phase_successes"] == {"setup": 1, "revision": 0, "A": 0, "B": 6}
        assert (tmp_path / "snapshot/source.step").read_bytes() == step.read_bytes()
        assert all("/v/immutable/" in url or "/v/immutable?" in url for _, url, _ in sender.calls
                   if "/parts/" in url or "/partstudios/" in url)
    finally:
        ledger.close()


def test_live_denied_before_any_credential_loader(tmp_path):
    with pytest.raises(Rejected, match="fresh-key"):
        require_live_authorization(False, True, tmp_path / "absent.json")
    with pytest.raises(Rejected, match="NEW PUBLIC"):
        require_live_authorization(True, False, tmp_path / "absent.json")


def test_current_key_authorization_is_not_rotation(tmp_path, monkeypatch):
    monkeypatch.setattr("safety.verify_preflight", lambda path: {"status": "PASS"})
    require_live_authorization(False, True, tmp_path / "preflight.json",
                               bindings_verified=True, current_key_confirmation=True)
    ledger = Ledger(tmp_path / "ledger.json", initialize=True)
    try:
        ledger.acknowledge(current_key=True, rotated=False)
        assert ledger.state["authorization"]["current_key_acknowledged"] is True
        assert ledger.state["authorization"]["rotation_confirmed"] is False
        assert ledger.summary()["attempted"] == 0
        assert ledger.state["quota"]["remaining"] == 2227
    finally:
        ledger.close()


def test_persisted_eighty_attempt_limit(tmp_path):
    path = tmp_path / "ledger.json"
    ledger = Ledger(path, initialize=True)
    for index in range(80):
        ledger.finish(ledger.begin("setup_test", "setup", "GET"), 200)
    ledger.close()
    resumed = Ledger(path)
    try:
        with pytest.raises(Rejected, match="80 attempted"):
            resumed.begin("setup_test", "setup", "GET")
        assert resumed.summary()["attempted"] == 80
    finally:
        resumed.close()


def test_ambiguous_create_never_retried_or_replaced(tmp_path):
    path = tmp_path / "ledger.json"
    ledger = Ledger(path, initialize=True)
    def timeout(*args):
        raise TimeoutError("Secret-bearing raw error must not escape")
    try:
        with pytest.raises(Rejected, match="raw error suppressed"):
            BoundedRequests(ledger, timeout).request("create_document", "setup")
    finally:
        ledger.close()
    resumed = Ledger(path)
    try:
        assert resumed.summary()["unknown"] == 1
        assert resumed.state["create_reserved"]
        with pytest.raises(Rejected, match="ambiguous"):
            resumed.begin("create_document", "setup", "POST")
    finally:
        resumed.close()


@pytest.mark.parametrize("operation", ["delete", "share", "arbitrary", "features"])
def test_foreign_documents_denied(tmp_path, operation):
    ledger = Ledger(tmp_path / "ledger.json", initialize=True)
    try:
        with pytest.raises(Rejected, match="owned document"):
            BoundedRequests(ledger, lambda *args: pytest.fail("Network reached")).request(
                operation, "setup", document="existingrobot")
        assert ledger.summary()["attempted"] == 0
    finally:
        ledger.close()


@pytest.mark.parametrize("status", [302, 403, 409, 429, 500])
def test_failures_and_redirects_stop(tmp_path, status):
    ledger = Ledger(tmp_path / "ledger.json", initialize=True)
    try:
        requests = BoundedRequests(ledger, lambda *args: {"status": status, "body": {}})
        with pytest.raises(Rejected):
            requests.request("create_document", "setup")
        assert ledger.state["halted"]
        assert ledger.summary()["attempted"] == 1
        assert ledger.summary()["successful"] == int(status == 302)
    finally:
        ledger.close()


def test_lock_and_one_document_max(tmp_path):
    ledger = Ledger(tmp_path / "ledger.json", initialize=True)
    try:
        with pytest.raises(Rejected, match="locked"):
            Ledger(tmp_path / "ledger.json")
        event = ledger.begin("create_document", "setup", "POST")
        ledger.finish(event, 200)
        with pytest.raises(Rejected, match="One new"):
            ledger.begin("create_document", "setup", "POST")
    finally:
        ledger.close()


def test_wrong_export_version_stops(tmp_path):
    from snapshot import bind_translation
    with pytest.raises(Rejected, match="immutable"):
        bind_translation({"documentId": "owned", "requestElementId": "plate", "versionId": "old"},
                         {"document": "owned", "element": "plate", "version": "new"})


def test_public_schema_matches_implemented_request_fields():
    import json
    from safety import ROOT
    schema = json.loads((ROOT / "research/public-schema.json").read_text())
    step = schema["components"]["schemas"]["BTBStepExportParams"]["properties"]
    assert {"stepUnit", "storeInDocument", "isYAxisUp", "grouping"} <= step.keys()
    assert "MILLIMETER" in schema["components"]["schemas"]["GBTExportUnit"]["enum"]
    assert source_hashes()["research/public-schema.json"]


def test_native_edits_require_owned_feature_and_native_type(tmp_path):
    ledger = Ledger(tmp_path / "ledger.json", initialize=True)
    ledger.state.update(owned_document="owned", workspace="workspace", element="plate", feature_ids=["mine"])
    requests = BoundedRequests(ledger, lambda *args: pytest.fail("Network reached"))
    try:
        with pytest.raises(Rejected, match="native plane"):
            requests.request("native_add", "setup", document="owned", workspace="workspace", element="plate",
                             payload={"feature": {"featureType": "customGenerator"}})
        with pytest.raises(Rejected, match="Unowned feature"):
            requests.request("native_update", "revision", document="owned", workspace="workspace", element="plate",
                             resource="foreign", payload={"feature": {"featureType": "extrude", "featureId": "foreign"}})
        assert ledger.summary()["attempted"] == 0
    finally:
        ledger.close()


def test_actual_public_response_shape_preserves_single_document(tmp_path):
    ledger = Ledger(tmp_path / "ledger.json", initialize=True)
    try:
        requests = BoundedRequests(ledger, lambda *args: {"status": 200, "body": {
            "id": "owned", "public": True, "defaultWorkspace": {"id": "workspace"}}})
        requests.request("create_document", "setup")
        assert ledger.state["owned_document"] == "owned"
        assert ledger.state["create_reserved"]
        assert ledger.summary()["attempted"] == 1
    finally:
        ledger.close()