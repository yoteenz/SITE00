#!/usr/bin/env python3
"""Email V2 benchmark — contact sheet, review ZIP, manifest, and zip verification."""
from __future__ import annotations

import hashlib
import json
import shutil
import sys
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
DOCS = REPO / "docs/site00/idnty/visual-authority/email-v2"
PACK = Path("/tmp/SITE00_EMAIL_V2_BENCHMARK")
ZIP = Path("/tmp/SITE00_EMAIL_V2_NDX_BENCHMARK.zip")
AUTHORITY = Path("/tmp/df-email-assets/AUTHORITY.jpg")
AUTHORITY_SHA = "e814042c318f7f45d7db07a6d11e4878fcc20888c583a76537828cfa3c2ede83"

EMAILS = [
    ("B01_personal-foundation-invitation", "01", "PERSONAL FOUNDATION INVITATION", "PERSONAL LETTER"),
    ("B02_foundation-complete", "02", "FOUNDATION COMPLETE", "MILESTONE RECORD"),
    ("B03_M06-bldr-introduction", "03", "M06 — BLDR INTRODUCTION", "EDITORIAL FEATURE"),
]


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def font(weight: int, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(HERE / "source/fonts" / f"SairaSemiCondensed-{weight}.ttf"), size)


def contact_sheet() -> Path:
    dw, mw, gap, col_gap, margin, head = 560, 216, 22, 64, 72, 230
    cols = []
    for eid, *_ in EMAILS:
        d = Image.open(PACK / "RENDERS/DESKTOP" / f"{eid}_DESKTOP.png").convert("RGB")
        m = Image.open(PACK / "RENDERS/MOBILE" / f"{eid}_MOBILE.png").convert("RGB")
        d = d.resize((dw, round(d.height * dw / d.width)), Image.LANCZOS)
        m = m.resize((mw, round(m.height * mw / m.width)), Image.LANCZOS)
        cols.append((d, m))
    col_w = dw + gap + mw
    W = margin * 2 + col_w * 3 + col_gap * 2
    H = head + max(max(d.height, m.height) for d, m in cols) + 90 + margin
    sheet = Image.new("RGB", (W, H), (233, 231, 227))
    dr = ImageDraw.Draw(sheet)
    red, ink, mute = (217, 12, 12), (20, 20, 20), (96, 94, 90)
    dr.text((margin, 54), "SITE 00", font=font(700, 34), fill=ink)
    dr.text((margin + 168, 64), "CORRESPONDENCE V2 · THREE-EMAIL EDITORIAL BENCHMARK", font=font(500, 20), fill=mute)
    dr.rectangle([margin, 112, margin + 70, 115], fill=red)
    dr.text((W - margin - 640, 64), "FOUNDER REVIEW · OPENART GENERATIONS 0 · NOT SENT", font=font(500, 18), fill=mute)
    x = margin
    for (eid, no, title, comp), (d, m) in zip(EMAILS, cols):
        dr.text((x, 150), no, font=font(600, 22), fill=red)
        dr.text((x + 40, 150), title, font=font(600, 22), fill=ink)
        dr.text((x + 40, 182), comp + "  ·  DESKTOP 600  ·  MOBILE 390", font=font(500, 15), fill=mute)
        sheet.paste(d, (x, head))
        sheet.paste(m, (x + dw + gap, head))
        x += col_w + col_gap
    dr.text((margin, H - margin - 24), "SAME BRAND. DIFFERENT CONVERSATIONS. REUSED PLATES: DF-I01 · DF-I02 · DF-I03. CODE-NATIVE: SLAB MONUMENT, THREE BLUEPRINT PLANS.", font=font(500, 16), fill=mute)
    out = PACK / "CONTACT_SHEET" / "SITE00_EMAIL_V2_BENCHMARK_CONTACT_SHEET.jpg"
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, quality=90, optimize=True)
    return out


def copy_tree() -> None:
    for sub in ("AUTHORITY", "EDITORIAL_INTENT", "COPY", "REVIEW", "REFERENCE", "EDITABLE_SOURCE"):
        shutil.rmtree(PACK / sub, ignore_errors=True)
    for f in (DOCS / "authority").glob("*.md"):
        (PACK / "AUTHORITY").mkdir(parents=True, exist_ok=True)
        shutil.copy2(f, PACK / "AUTHORITY" / f.name)
    for eid, no, *_ in EMAILS:
        bdir = DOCS / "benchmarks" / eid
        for kind, dest in (("EDITORIAL_INTENT.md", "EDITORIAL_INTENT"), ("COPY.md", "COPY")):
            (PACK / dest).mkdir(parents=True, exist_ok=True)
            shutil.copy2(bdir / kind, PACK / dest / f"{eid}_{kind}")
    (PACK / "REVIEW").mkdir(parents=True, exist_ok=True)
    for f in sorted(DOCS.glob("*.md")) + sorted((DOCS / "qa").glob("*")):
        if f.name != "README.md":
            shutil.copy2(f, PACK / "REVIEW" / f.name)
    (PACK / "REFERENCE").mkdir(parents=True, exist_ok=True)
    if sha(AUTHORITY) != AUTHORITY_SHA:
        sys.exit("authority checksum mismatch")
    shutil.copy2(AUTHORITY, PACK / "REFERENCE" / "SITE00_MARKETING_EMAIL_APPROVED_AUTHORITY_V1.jpg")
    src = PACK / "EDITABLE_SOURCE"
    shutil.copytree(HERE / "source", src / "source")
    for f in ("prepare_assets.py", "render.mjs", "qa_copy.py", "package.py", "README.md"):
        shutil.copy2(HERE / f, src / f)
    shutil.copy2(DOCS / "README.md", PACK / "00_START_HERE.md")


def build_zip() -> dict:
    files = sorted(p for p in PACK.rglob("*") if p.is_file() and p.name != "MANIFEST.json")
    manifest = {
        "package": "SITE00_EMAIL_V2_NDX_BENCHMARK",
        "openart_generations": 0,
        "openart_credits": 0,
        "emails_sent": 0,
        "renders": {"desktop": 3, "mobile": 3, "total": 6},
        "authority_sha256": AUTHORITY_SHA,
        "files": {str(p.relative_to(PACK)): sha(p) for p in files},
    }
    (PACK / "MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n")
    if ZIP.exists():
        ZIP.unlink()
    with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(PACK.rglob("*")):
            if p.is_file():
                z.write(p, Path(PACK.name) / p.relative_to(PACK))
    return manifest


def verify(manifest: dict) -> None:
    with zipfile.ZipFile(ZIP) as z:
        if z.testzip() is not None:
            sys.exit("zip CRC failure")
        names = set(z.namelist())
        for rel, digest in manifest["files"].items():
            name = f"{PACK.name}/{rel}"
            if name not in names:
                sys.exit(f"missing in zip: {rel}")
            if hashlib.sha256(z.read(name)).hexdigest() != digest:
                sys.exit(f"hash mismatch: {rel}")
        renders = [n for n in names if "/RENDERS/" in n and n.endswith(".png")]
        if len(renders) != 6:
            sys.exit(f"expected 6 renders, found {len(renders)}")
    print(f"verified {len(manifest['files'])} files · 6 renders · {ZIP} · {ZIP.stat().st_size // 1024} KB · sha256 {sha(ZIP)}")


if __name__ == "__main__":
    copy_tree()
    print("contact sheet", contact_sheet())
    verify(build_zip())
