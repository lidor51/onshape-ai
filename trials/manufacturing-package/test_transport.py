import base64
import hashlib
import hmac

import pytest

from geometry import Rejected
from transport import AuthenticatedSender, NoRedirect, signature


def test_hmac_matches_documented_canonicalization():
    canonical = "get\nnonce0123456789abcd\nfri, 11 sep 2026 12:00:00 gmt\napplication/json\n/api/v17/documents\na=hello\n"
    expected = base64.b64encode(hmac.new(b"fake-secret", canonical.encode(), hashlib.sha256).digest()).decode()
    assert signature("GET", "https://cad.onshape.com/api/v17/documents?A=Hello",
                     "Nonce0123456789ABCD", "Fri, 11 Sep 2026 12:00:00 GMT", "application/json",
                     "fake-access", "fake-secret") == "On fake-access:HmacSHA256:" + expected


def test_sender_denies_foreign_host_before_network():
    sender = AuthenticatedSender.__new__(AuthenticatedSender)
    with pytest.raises(Rejected, match="origin"):
        sender("GET", "https://example.com/api/v17/documents", None)


def test_no_redirect_or_secret_echo():
    assert NoRedirect().redirect_request(None, None, 307, "", {}, "https://example.com") is None
    sender = AuthenticatedSender.__new__(AuthenticatedSender)
    sender.access, sender.secret = "fake-access", "fake-secret"
    assert sender.sanitize({"headers": "hidden", "message": "fake-secret fake-access"}) == {
        "message": "[REDACTED] [REDACTED]"}