#!/usr/bin/env python3
"""Build a client delivery ZIP from approved Opus benchmark rows (design-only sample)."""
from __future__ import annotations

import hashlib
import json
import shutil
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_ROOT = Path("/tmp/SITE00_CORRESPONDENCE_SAMPLE_DELIVERY")
ZIP_PATH = Path("/tmp/SITE00_CORRESPONDENCE_SAMPLE_DELIVERY.zip")

# Sample: three Opus benchmarks at founder_review — founder must approve before real client send.
SAMPLE_EMAILS = [
    ("B01", "personal-foundation-invitation", "WELCOME"),
    ("B02", "foundation-complete", "MILESTONE"),
    ("B03", "M06", "BLDR_INTRODUCTION"),
]

RENDERS = Path("/tmp/SITE00_EMAIL_V2_BENCHMARK/RENDERS")
DOCS = ROOT / "docs/site00/idnty/visual-authority/email-v2/benchmarks"


def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main() -> None:
    if OUT_ROOT.exists():
        shutil.rmtree(OUT_ROOT)
    start = OUT_ROOT / "00_START_HERE"
    start.mkdir(parents=True)
    (start / "CONTENTS.md").write_text(
        "# CLIENT DELIVERY (SAMPLE)\n\n"
        "DESIGN-ONLY SCOPE. Responsive review HTML lives in the founder Correspondence Studio — "
        "not production ESP table HTML.\n\n"
        "Includes: copy documents, device preview PNGs when renders exist, manifests.\n",
        encoding="utf-8",
    )
    (start / "APPROVAL_SUMMARY.md").write_text(
        "FOUNDER REVIEW PENDING — do not treat as delivered to a client.\n",
        encoding="utf-8",
    )

    emails_dir = OUT_ROOT / "01_EMAILS"
    copy_dir = OUT_ROOT / "03_COPY"
    manifests = OUT_ROOT / "05_MANIFESTS"
    copy_dir.mkdir(parents=True)
    manifests.mkdir(parents=True)

    files: dict[str, str] = {}
    for bench, template_id, slug in SAMPLE_EMAILS:
        folder = emails_dir / slug
        folder.mkdir(parents=True, exist_ok=True)
        bdir = DOCS / {
            "B01": "B01_personal-foundation-invitation",
            "B02": "B02_foundation-complete",
            "B03": "B03_M06-bldr-introduction",
        }[bench]
        for name in ("COPY.md", "EDITORIAL_INTENT.md"):
            src = bdir / name
            if src.exists():
                dest = folder / name if name == "COPY.md" else folder / "EDITORIAL_INTENT.md"
                shutil.copy2(src, dest)
                if name == "COPY.md":
                    shutil.copy2(src, copy_dir / f"{template_id}_COPY.md")
        for view, file in (("MOBILE", "MOBILE"), ("DESKTOP", "DESKTOP")):
            stem = {
                "B01": "B01_personal-foundation-invitation",
                "B02": "B02_foundation-complete",
                "B03": "B03_M06-bldr-introduction",
            }[bench]
            png = RENDERS / view / f"{stem}_{view}.png"
            if png.exists():
                dest = folder / f"PREVIEW_{view}.png"
                shutil.copy2(png, dest)
        (folder / "SCOPE.md").write_text(
            "DESIGN-ONLY — no production EMAIL.html in this sample package.\n",
            encoding="utf-8",
        )

    impl = OUT_ROOT / "04_IMPLEMENTATION"
    impl.mkdir()
    (impl / "RESPONSIVE_REQUIREMENTS.md").write_text(
        "Mobile 390 · Tablet 768 · Desktop 680 reading width. Production ESP HTML is a separate authorization.\n",
        encoding="utf-8",
    )

    for p in OUT_ROOT.rglob("*"):
        if p.is_file():
            files[str(p.relative_to(OUT_ROOT))] = sha256(p)

    manifest = {
        "package": "SITE00_CORRESPONDENCE_SAMPLE_DELIVERY",
        "design_only": True,
        "internal_comments_included": False,
        "emails": [t[1] for t in SAMPLE_EMAILS],
        "files": files,
    }
    (manifests / "DELIVERY_MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    (manifests / "CHECKSUMS.sha256").write_text(
        "\n".join(f"{h}  {rel}" for rel, h in sorted(files.items())) + "\n",
        encoding="utf-8",
    )

    if ZIP_PATH.exists():
        ZIP_PATH.unlink()
    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(OUT_ROOT.rglob("*")):
            if p.is_file():
                z.write(p, p.relative_to(OUT_ROOT.parent))
    if zipfile.ZipFile(ZIP_PATH).testzip() is not None:
        sys.exit("zip CRC failure")
    print(f"verified sample delivery · {ZIP_PATH} · {ZIP_PATH.stat().st_size // 1024} KB · sha256 {sha256(ZIP_PATH)}")


if __name__ == "__main__":
    main()
