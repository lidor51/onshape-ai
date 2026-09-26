import base64
import hashlib
import hmac
import json
import secrets
from email.utils import formatdate
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener

from geometry import Rejected, require
from safety import ROOT


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, new_url):
        return None


def signature(method, url, nonce, date, content_type, access, secret):
    target = urlsplit(url)
    canonical = "\n".join([method, nonce, date, content_type, target.path, target.query, ""]).lower()
    encoded = base64.b64encode(hmac.new(secret.encode(), canonical.encode(), hashlib.sha256).digest()).decode()
    return "On " + access + ":HmacSHA256:" + encoded


class AuthenticatedSender:
    def __init__(self, ledger):
        authorization = ledger.state.get("authorization", {})
        require(authorization.get("current_key_acknowledged") or authorization.get("rotation_confirmed"),
                "Credential access denied without acknowledgment")
        values = {}
        try:
            for line in (ROOT.parent.parent / ".env.local").read_text(encoding="utf-8-sig").splitlines():
                if not line.strip() or line.lstrip().startswith("#") or "=" not in line:
                    continue
                name, value = line.split("=", 1)
                values[name.strip()] = value.strip().strip("\"'")
            self.access = values.get("ONSHAPE_ACCESS_KEY", "")
            self.secret = values.get("ONSHAPE_SECRET_KEY", "")
            require(values.get("ONSHAPE_BASE_URL", "https://cad.onshape.com").rstrip("/") ==
                    "https://cad.onshape.com", "Only the authorized HTTPS origin is allowed")
            require(bool(self.access and self.secret), "Required credential fields missing")
        except Rejected:
            raise
        except BaseException:
            raise Rejected("Credential load failed; details suppressed") from None
        self.opener = build_opener(ProxyHandler({}), NoRedirect())
        ledger.state["credential_loads"] = ledger.state.get("credential_loads", 0) + 1
        ledger.save()

    def sanitize(self, value):
        if isinstance(value, str):
            return value.replace(self.access, "[REDACTED]").replace(self.secret, "[REDACTED]")
        if isinstance(value, list):
            return [self.sanitize(item) for item in value]
        if isinstance(value, dict):
            return {key: self.sanitize(item) for key, item in value.items()
                    if key.lower() not in {"authorization", "headers", "creator", "lastmodifier", "owner"}}
        return value

    def __call__(self, method, url, body):
        target = urlsplit(url)
        require(target.scheme == "https" and target.netloc == "cad.onshape.com" and
                target.path.startswith("/api/v17/") and not target.fragment,
                "Disallowed request origin")
        require(method in ("GET", "POST"), "Disallowed HTTP method")
        date, nonce, content_type = formatdate(usegmt=True), secrets.token_hex(16), "application/json"
        request = Request(url, data=None if body is None else json.dumps(body).encode(), method=method,
                          headers={"Date": date, "On-Nonce": nonce, "Content-Type": content_type,
                                   "Accept": "application/json, application/octet-stream",
                                   "Authorization": signature(method, url, nonce, date, content_type,
                                                              self.access, self.secret)})
        try:
            try:
                response = self.opener.open(request, timeout=60)
            except HTTPError as response_error:
                response = response_error
            with response:
                status = response.code
                data = response.read()
                if "/externaldata/" in target.path and 200 <= status < 300:
                    result = data
                else:
                    try:
                        result = self.sanitize(json.loads(data))
                    except (ValueError, UnicodeError):
                        result = {"unparsed_response_bytes": len(data)}
                return {"status": status, "body": result, "redirected": 300 <= status < 400}
        except BaseException:
            raise Rejected("HTTPS outcome unknown; raw exception suppressed; no retry") from None