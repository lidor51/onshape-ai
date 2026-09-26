import hashlib
import json
from pathlib import Path
import urllib.request
from urllib.parse import urlparse
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2] / ".cache/reference-cad/materials"
SOURCES = {
    "tuffak-gp.pdf": "https://plaskolite.com/docs/default-source/pds/PDS004_TUF_GP.pdf",
    "tuffak-fabrication.pdf": "https://plaskolite.com/docs/default-source/fab/fab015_tuf_en.pdf",
}


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    receipts = []
    for name, url in SOURCES.items():
        path = ROOT / name
        if not path.exists():
            request = urllib.request.Request(url, headers={"User-Agent": "Local engineering reference inspection"})
            with urllib.request.urlopen(request, timeout=45) as response:
                if urlparse(response.url).hostname != "plaskolite.com":
                    raise ValueError("Unexpected source origin")
                content = response.read(30 * 1024 * 1024 + 1)
            if len(content) > 30 * 1024 * 1024 or not content.startswith(b"%PDF"):
                raise ValueError("Source size or PDF header mismatch")
            path.write_bytes(content)
        content = path.read_bytes()
        reader = PdfReader(path)
        pages = [(index + 1, page.extract_text() or "") for index, page in enumerate(reader.pages)]
        receipt = {"url": url, "file": name, "bytes": len(content), "sha256": hashlib.sha256(content).hexdigest(), "pages": len(pages)}
        receipts.append(receipt)
        selected = [(index, text) for index, text in pages if name == "tuffak-gp.pdf" or any(term in text.lower() for term in ("stress crack", "thread", "modulus", "drilling", "fasten"))]
        (ROOT / (name + ".txt")).write_text("\n\n".join("PAGE " + str(index) + "\n" + text for index, text in selected), encoding="utf8")
        print(json.dumps(receipt), flush=True)
        if name == "tuffak-gp.pdf":
            print("\n".join(text for index, text in pages)[:14000])
    (ROOT / "receipts.json").write_text(json.dumps(receipts, indent=2) + "\n")


if __name__ == "__main__":
    main()