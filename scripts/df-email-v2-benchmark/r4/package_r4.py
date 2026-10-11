#!/usr/bin/env python3
"""Email V2 R4 — assemble the client review ZIP (review artifact first, files second).

Usage: python3 package_r4.py [/tmp/out_dir]   ·   needs render.mjs output in R4_OUT and the PNG originals in originals/
"""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import sys
import zipfile
from pathlib import Path

from PIL import Image

from build_review_r4 import DOCS, RENDERS, assets_in, write_data

HERE = Path(__file__).resolve().parent
R3 = HERE.parent / "r3"
NAME = "SITE00_EMAIL_V2_R4_PREMIUM_EDITORIAL"
README = """SITE 00 · EMAIL V2 · R4 PREMIUM EDITORIAL PACK · 20 EMAILS
STATUS: FOUNDER REVIEW PENDING. NOTHING HAS BEEN SENT.

START HERE
  Open review/index.html in a browser (double-click works; no server needed).
  - VIEW · EMAIL: inbox-style list by family, the live email, art class, photograph, family relationship, QA.
  - DEVICE: MOBILE 390 / TABLET 768 / DESKTOP 1024 / ALL 3.
  - VERSION: R4 / R3 / COMPARE for the invitation, foundation-complete and M06.
  - VIEW · FAMILY WALL: all twenty side by side. VIEW · ASSETS: the ten photographs and what each serves.
  - Arrow keys step through the list. The address bar keeps your place.

FOLDERS
  review/            the review artifact
  emails/            20 review emails (sample values, dotted underlines) + pack.json
  emails/templates/  20 send templates with {{tokens}}, {{asset_base}} and {{font_base}}
  assets/ fonts/     everything the emails load
  previews/          1x mobile and desktop previews
  renders/           2x renders at 390 / 768 / 1024 with web fonts, plus render_report.json
  contact-sheets/    desktop + mobile per email
  docs/              creative authority, asset matrix, cost report, provenance, QA report
  originals/         the ten OpenArt PNG originals (R4-G01 ... R4-G10)
  r3/                the R3 benchmark emails, for the COMPARE view
  SHA256SUMS.txt     checksums for every file in this package
"""


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> None:
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/SITE00_EMAIL_V2_R4")
    root = out / NAME
    if root.exists():
        shutil.rmtree(root)
    root.mkdir(parents=True)
    pack = json.loads((HERE / "emails/pack.json").read_text(encoding="utf-8"))
    ids = [e["template_id"] for e in pack["emails"]]

    shutil.copytree(HERE / "emails", root / "emails")
    used: set[str] = set()
    for i in ids:
        used.update(assets_in((HERE / "emails" / f"{i}.html").read_text(encoding="utf-8")))
    data_js = (HERE / "review/data.js").read_text(encoding="utf-8")
    data = json.loads(data_js.split("window.R4_DATA = ", 1)[1].rstrip().rstrip(";"))
    used.update(a["thumb"] for a in data["assets"])
    for f in sorted(used):
        (root / "assets" / f).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(HERE / "assets" / f, root / "assets" / f)
    shutil.copytree(HERE / "fonts", root / "fonts")
    shutil.copytree(HERE / "previews", root / "previews")
    (root / "review").mkdir()
    shutil.copy2(HERE / "review/index.html", root / "review/index.html")
    write_data(root / "review/data.js", data, {"emails": "../emails/", "assets": "../assets/", "previews": "../previews/", "r3": "../r3/emails/"})

    (root / "r3/emails").mkdir(parents=True)
    for b in ("B01_R3", "B02_R3", "B03_R3"):
        shutil.copy2(R3 / "emails" / f"{b}.html", root / "r3/emails" / f"{b}.html")
    shutil.copytree(R3 / "assets", root / "r3/assets")
    shutil.copytree(R3 / "fonts", root / "r3/fonts")

    for view in ("MOBILE", "TABLET", "DESKTOP"):
        (root / "renders" / view).mkdir(parents=True)
        for i in ids:
            Image.open(RENDERS / view / f"{i}_{view}.png").convert("RGB").save(root / "renders" / view / f"{i}_{view}.jpg", quality=85, optimize=True)
    shutil.copy2(RENDERS / "render_report.json", root / "renders/render_report.json")
    (root / "contact-sheets").mkdir()
    for i in ids:
        d = Image.open(RENDERS / "DESKTOP" / f"{i}_DESKTOP.png").convert("RGB")
        m = Image.open(RENDERS / "MOBILE" / f"{i}_MOBILE.png").convert("RGB")
        d = d.resize((d.width // 2, d.height // 2))
        m = m.resize((m.width // 2, m.height // 2))
        sheet = Image.new("RGB", (d.width + m.width + 60, max(d.height, m.height) + 40), (226, 224, 219))
        sheet.paste(d, (20, 20))
        sheet.paste(m, (d.width + 40, 20))
        sheet.save(root / "contact-sheets" / f"{i}.jpg", quality=82, optimize=True)

    (root / "docs").mkdir()
    for f in sorted(DOCS.iterdir()):
        if f.is_file():
            shutil.copy2(f, root / "docs" / f.name)
    shutil.copy2(HERE / "qa/R4_QA.json", root / "docs/R4_QA.json")
    shutil.copytree(HERE / "originals", root / "originals")
    (root / "README.txt").write_text(README, encoding="utf-8")

    files = sorted(p for p in root.rglob("*") if p.is_file())
    (root / "SHA256SUMS.txt").write_text("".join(f"{sha256(p)}  {p.relative_to(root).as_posix()}\n" for p in files), encoding="utf-8")
    zpath = out / f"{NAME}.zip"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(root.rglob("*")):
            if p.is_file():
                z.write(p, f"{NAME}/{p.relative_to(root).as_posix()}")
    (out / "README.txt").write_text(README, encoding="utf-8")
    print(f"{zpath} · {zpath.stat().st_size / 1e6:.1f} MB · {len(files) + 1} files · sha256 {sha256(zpath)}")


if __name__ == "__main__":
    os.chdir(HERE)
    main()
