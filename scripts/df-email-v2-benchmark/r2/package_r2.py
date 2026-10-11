#!/usr/bin/env python3
"""Email V2 R2 — build the founder review ZIP (offline review artifact + renders + rationale + QA + manifest)."""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
BENCH = HERE.parent
REPO = HERE.parents[2]
DOCS = REPO / "docs/site00/idnty/visual-authority/email-v2"
RENDERS = Path(os.environ.get("R2_OUT", "/tmp/SITE00_EMAIL_V2_R2/RENDERS"))
NAME = "SITE00_EMAIL_V2_R2_TERRITORIES"
STAGE = Path("/tmp") / NAME
ZIP = Path("/tmp") / f"{NAME}.zip"

START = """<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=df-email-v2-benchmark/r2/review/index.html">
<title>SITE 00 · EMAIL V2 · R2</title><a href="df-email-v2-benchmark/r2/review/index.html">OPEN THE R2 ART DIRECTION REVIEW</a>
"""

README = """SITE 00 · EMAIL V2 · R2 ART DIRECTION TERRITORIES
==================================================

START HERE: open START_HERE.html in a browser (or df-email-v2-benchmark/r2/review/index.html).

Choose an email (B01 / B02 / B03), a direction (A / B / C) or R1, and a device (mobile 390 / tablet 768 / desktop 1024).
Tick COMPARE WITH R1 to see the direction beside the approved R1 baseline. The right panel explains each direction.

B01 INVITATION      A PRIVATE CORRESPONDENCE · B ARCHITECTURAL OPENING · C PERSONAL EDITORIAL
B02 COMPLETION      A MONUMENT ESTABLISHED · B ARCHITECTURAL RECORD · C MILESTONE REVEAL
B03 BLDR (M06)      A ARCHITECTURAL MANIFESTO · B ENTER THE LOCATION · C THE UNBUILT POSSIBILITY

The copy is the approved benchmark copy, unchanged (QA/R2_COPY_PRESERVATION_QA.json).
Imagery is re-art-directed from existing plates. OpenArt generations: 0. Credits: 0.
Nothing is approved. Pick one direction per email. Full 20-email rollout not authorized. No sending.

RENDERS/            27 PNGs (9 directions x mobile, tablet, desktop) + R1 at tablet
CONTACT_SHEETS/     R1 beside A/B/C per email (tablet) and A/B/C on mobile
ART_DIRECTION_R2.md the nine concepts, premium asset candidates, email-safe build notes
MANIFEST.json       file list with SHA-256
"""


def main() -> None:
    if STAGE.exists():
        shutil.rmtree(STAGE)
    root = STAGE / "df-email-v2-benchmark"
    ignore = shutil.ignore_patterns("__pycache__", "*.pyc", "_*.mjs")
    shutil.copytree(BENCH / "source", root / "source", ignore=ignore)
    shutil.copytree(HERE, root / "r2", ignore=ignore)
    shutil.copytree(RENDERS, STAGE / "RENDERS")
    shutil.copytree(RENDERS.parent / "CONTACT_SHEETS", STAGE / "CONTACT_SHEETS")
    shutil.copytree(DOCS / "r2/qa", STAGE / "QA")
    shutil.copy(DOCS / "r2/ART_DIRECTION_R2.md", STAGE / "ART_DIRECTION_R2.md")
    for b in sorted((DOCS / "benchmarks").iterdir()):
        dest = STAGE / "COPY" / f"{b.name}_COPY.md"
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(b / "COPY.md", dest)
    (STAGE / "START_HERE.html").write_text(START)
    (STAGE / "README.txt").write_text(README)

    files = sorted(p for p in STAGE.rglob("*") if p.is_file())
    manifest = {
        "package": NAME,
        "status": "FOUNDER_SELECTION_PENDING",
        "territories": 9,
        "openart_generations": 0,
        "openart_credits": 0,
        "files": [{"path": str(p.relative_to(STAGE)), "bytes": p.stat().st_size,
                   "sha256": hashlib.sha256(p.read_bytes()).hexdigest()} for p in files],
    }
    (STAGE / "MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n")

    if ZIP.exists():
        ZIP.unlink()
    with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(STAGE.rglob("*")):
            if p.is_file():
                z.write(p, f"{NAME}/{p.relative_to(STAGE)}")
    print(ZIP, round(ZIP.stat().st_size / 1e6, 1), "MB", len(files) + 1, "files")


if __name__ == "__main__":
    main()
