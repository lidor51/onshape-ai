import ast
import hashlib
import json
from pathlib import Path
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parent
DESTINATION = ROOT / "vendor" / "cq_gears"


def fetch():
    if (DESTINATION / "provenance.json").exists():
        return
    with urlopen("https://api.github.com/repos/meadiode/cq_gears/commits/main", timeout=30) as response:
        commit = json.load(response)["sha"]
    entries = {}
    for source in ["cq_gears/spur_gear.py", "cq_gears/utils.py", "LICENSE", "README.md"]:
        url = "https://raw.githubusercontent.com/meadiode/cq_gears/" + commit + "/" + source
        with urlopen(url, timeout=30) as response:
            data = response.read()
        if source.endswith(".py"):
            tree = ast.parse(data)
            prohibited = {"os", "sys", "subprocess", "socket", "urllib", "requests", "shutil"}
            for node in ast.walk(tree):
                if isinstance(node, ast.Import) and any(alias.name.split(".")[0] in prohibited for alias in node.names):
                    raise ValueError("Unexpected source import")
                if isinstance(node, ast.ImportFrom) and (node.module or "").split(".")[0] in prohibited:
                    raise ValueError("Unexpected source import")
        DESTINATION.mkdir(parents=True, exist_ok=True)
        destination = DESTINATION / source.split("/")[-1]
        destination.write_bytes(data)
        entries[destination.name] = {"url": url, "sha256": hashlib.sha256(data).hexdigest()}
    (DESTINATION / "provenance.json").write_text(json.dumps({"repository": "https://github.com/meadiode/cq_gears", "commit": commit, "files": entries, "installation": "Two source modules only; no setup.py, pip build hooks, package initialization or unknown install scripts executed", "license": "Apache-2.0; original license and headers retained"}, indent=2) + "\n")
    print(json.dumps({"commit": commit, "files": list(entries)}))


if __name__ == "__main__":
    fetch()