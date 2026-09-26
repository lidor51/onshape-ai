import asyncio
import json
import os
import re
import sys
import time
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "vendor"))
from onshape_mcp import server

server.logger.remove()
RUN = Path(os.environ["TRIAL_RUN"])
assert RUN.parent == ROOT / "runs"
LIVE = os.environ.get("TRIAL_LIVE") == "yes"
ledger_path = ROOT / "creation-ledger.json"
ledger = json.loads(ledger_path.read_text()) if ledger_path.exists() else []
state_path = RUN / "state.json"
state = json.loads(state_path.read_text()) if state_path.exists() else {}
owned = state.get("documentId")
translations = set(state.get("translations", []))
request_count = 0


async def before_request(request):
    global request_count
    if not LIVE:
        raise RuntimeError("OFFLINE_NETWORK_DENIED")
    if request.url.scheme != "https" or request.url.host != "cad.onshape.com" or request.url.port not in (None, 443):
        raise RuntimeError("DESTINATION_DENIED")
    path = request.url.path
    if request.method not in ("GET", "POST"):
        raise RuntimeError("METHOD_DENIED")
    if request.method == "POST" and re.fullmatch(r"/api/v\d+/documents", path):
        body = json.loads(request.content)
        if owned or len(ledger) >= 3 or body.get("isPublic") is not True:
            raise RuntimeError("CREATE_DENIED")
        ledger.append({"run": RUN.name, "attemptedAt": time.time()})
        ledger_path.write_text(json.dumps(ledger, indent=2))
    else:
        document = re.search(r"/d/([a-f0-9]{24})(?:/|$)", path) or re.search(r"/documents/([a-f0-9]{24})$", path)
        translation = re.fullmatch(r"/api/v\d+/translations/([a-f0-9]{24})", path)
        if not owned or not ((document and document.group(1) == owned) or (translation and translation.group(1) in translations)):
            raise RuntimeError("OWNERSHIP_DENIED")
        if request.method == "POST" and not re.match(r"/api/v\d+/(featurestudios|partstudios)/d/", path):
            raise RuntimeError("WRITE_DENIED")
    request_count += 1
    if request_count > 100:
        raise RuntimeError("REQUEST_BUDGET")
    request.extensions["trial_started"] = time.perf_counter()
    with (RUN / "http.jsonl").open("a") as output:
        output.write(json.dumps({"event": "request", "method": request.method, "path": path}) + "\n")


async def after_response(response):
    global owned
    await response.aread()
    path = response.request.url.path
    entry = {"event": "response", "method": response.request.method, "path": path,
             "status": response.status_code, "elapsedMs": (time.perf_counter() - response.request.extensions["trial_started"]) * 1000}
    if response.is_success and response.request.method == "POST" and re.fullmatch(r"/api/v\d+/documents", path):
        data = response.json()
        entry.update({"documentId": data.get("id"), "public": data.get("public", data.get("isPublic"))})
        ledger[-1].update(entry)
        ledger_path.write_text(json.dumps(ledger, indent=2))
        if entry["public"] is not True:
            raise RuntimeError("PUBLIC_NOT_CONFIRMED")
        owned = data["id"]
        state.update({"documentId": owned, "public": True, "workspaceId": data.get("defaultWorkspace", {}).get("id")})
        state_path.write_text(json.dumps(state, indent=2))
    if response.is_success and response.request.method == "POST" and path.endswith("/translations"):
        translations.add(response.json()["id"])
        state.update(json.loads(state_path.read_text()))
        state["translations"] = sorted(translations)
        state_path.write_text(json.dumps(state, indent=2))
    with (RUN / "http.jsonl").open("a") as output:
        output.write(json.dumps(entry) + "\n")


async def main():
    server.EXPORT_DIR = str(RUN)
    async with httpx.AsyncClient(timeout=60, trust_env=False, follow_redirects=False,
                                 transport=httpx.AsyncHTTPTransport(retries=0),
                                 event_hooks={"request": [before_request], "response": [after_response]}) as transport:
        server.client._client = transport
        server.client._own_client = False
        await server.main_stdio()


if __name__ == "__main__":
    asyncio.run(main())