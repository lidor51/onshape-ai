import json
from datetime import datetime, timezone

import pytest

from geometry import Rejected
from run import main
from safety import environment_versions, source_hashes, verify_preflight


def test_live_command_is_blocked_without_reading_credentials(monkeypatch):
    import os
    monkeypatch.setattr(os, "getenv", lambda *args: pytest.fail("Environment credentials accessed"))
    with pytest.raises(Rejected, match="fresh-key"):
        main(["live"])


def test_preflight_stale_code_and_dependencies_rejected(tmp_path):
    report = {"status": "PASS", "passed": 38, "failed": 0, "source_hashes": {"old": "hash"},
              "environment": environment_versions(), "created_at": datetime.now(timezone.utc).isoformat()}
    path = tmp_path / "preflight.json"
    path.write_text(json.dumps(report))
    with pytest.raises(Rejected, match="Stale preflight source"):
        verify_preflight(path)
    report["source_hashes"] = source_hashes()
    report["environment"] = {"wrong-version": "0"}
    path.write_text(json.dumps(report))
    with pytest.raises(Rejected, match="Stale preflight dependencies"):
        verify_preflight(path)


def test_public_schemas_do_not_claim_selected_part_step_support():
    from safety import ROOT
    schema = json.loads((ROOT / "research/public-schema.json").read_text())
    properties = schema["components"]["schemas"]["BTBStepExportParams"]["properties"]
    assert "partIds" not in properties
    assert "configuration" not in properties