"""Email V2 R4 — prepare premium assets.

originals/R4-G##.png   provider output (not committed; checksums and CDN URLs live in the provenance file)
docs/.../r4/premium-assets/R4-G##.jpg   archival JPEG of each original (quality 90)
assets/gen/*.jpg       email crops at 2x their display width

Usage: python3 prepare_r4.py
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
ORIG = HERE / "originals"
GEN = HERE / "assets" / "gen"
ARCHIVE = ROOT / "docs/site00/idnty/visual-authority/email-v2/r4/premium-assets"

# name: (source, (x0, y0, x1, y1) as fractions, output width in px, display width in px)
CROPS: dict[str, tuple[str, tuple[float, float, float, float], int, int]] = {
    # G01 THE OPEN DOOR
    "door_col": ("R4-G01", (0.0, 0.0, 1.0, 1.0), 496, 248),
    "door_band_m": ("R4-G01", (0.0, 0.30, 1.0, 0.64), 780, 390),
    "door_floor": ("R4-G01", (0.30, 0.66, 1.0, 0.86), 1088, 544),
    "door_floor_m": ("R4-G01", (0.30, 0.62, 1.0, 0.90), 780, 390),
    # G02 GROUND LAID
    "slab": ("R4-G02", (0.0, 0.08, 1.0, 0.92), 1280, 640),
    "slab_m": ("R4-G02", (0.30, 0.10, 1.0, 0.86), 780, 390),
    # G03 THE COVER (nameplate composite is rendered separately)
    "cover_base": ("R4-G03", (0.0, 0.0, 1.0, 1.0), 1344, 640),
    "pavilion_band": ("R4-G03", (0.0, 0.44, 1.0, 0.80), 1280, 640),
    # G04 THE SCOPE MODEL
    "model": ("R4-G04", (0.0, 0.0, 1.0, 1.0), 1280, 640),
    "model_m": ("R4-G04", (0.0, 0.18, 0.80, 1.0), 780, 390),
    "model_detail": ("R4-G04", (0.24, 0.30, 0.56, 0.62), 520, 260),
    # G05 THE THRESHOLD
    "threshold": ("R4-G05", (0.0, 0.0, 1.0, 1.0), 1280, 640),
    "threshold_m": ("R4-G05", (0.22, 0.0, 0.92, 1.0), 780, 390),
    "threshold_slot": ("R4-G05", (0.0, 0.50, 1.0, 0.74), 1280, 640),
    # G06 SETTING OUT
    "setout": ("R4-G06", (0.0, 0.0, 1.0, 1.0), 1280, 640),
    "setout_m": ("R4-G06", (0.30, 0.0, 0.94, 1.0), 780, 390),
    # G07 THE ARCHIVE
    "archive": ("R4-G07", (0.0, 0.0, 1.0, 1.0), 1280, 640),
    "archive_m": ("R4-G07", (0.04, 0.20, 0.62, 0.98), 780, 390),
    # G08 THE CREDIT
    "credit_col": ("R4-G08", (0.0, 0.10, 0.66, 0.92), 560, 280),
    "credit_m": ("R4-G08", (0.0, 0.26, 1.0, 0.80), 780, 390),
    # G09 THE SECTION (callout composite is rendered separately)
    "section_base": ("R4-G09", (0.0, 0.0, 1.0, 1.0), 1280, 640),
    # G10 AFTER
    "after": ("R4-G10", (0.0, 0.0, 1.0, 1.0), 1280, 640),
    "after_m": ("R4-G10", (0.0, 0.0, 0.70, 1.0), 780, 390),
    "after_strip": ("R4-G10", (0.0, 0.70, 1.0, 1.0), 1280, 640),
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    GEN.mkdir(parents=True, exist_ok=True)
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    sources = sorted(ORIG.glob("R4-G*.png"))
    if len(sources) != 10:
        raise SystemExit(f"expected 10 originals in {ORIG}, found {len(sources)}")
    checks = {}
    for src in sources:
        im = Image.open(src).convert("RGB")
        im.save(ARCHIVE / f"{src.stem}.jpg", quality=90, optimize=True)
        checks[src.stem] = {"png_sha256": sha256(src), "width": im.width, "height": im.height, "png_bytes": src.stat().st_size}
    used = set()
    for name, (stem, (x0, y0, x1, y1), out_w, _disp) in CROPS.items():
        im = Image.open(ORIG / f"{stem}.png").convert("RGB")
        box = (round(x0 * im.width), round(y0 * im.height), round(x1 * im.width), round(y1 * im.height))
        crop = im.crop(box)
        out_h = round(crop.height * out_w / crop.width)
        crop.resize((out_w, out_h), Image.LANCZOS).save(GEN / f"{name}.jpg", quality=80, optimize=True, progressive=True)
        used.add(stem)
    unused = {s.stem for s in sources} - used
    if unused:
        raise SystemExit(f"originals with no crop: {sorted(unused)}")
    (HERE / "qa" / "originals_checksums.json").write_text(json.dumps(checks, indent=2) + "\n", encoding="utf-8")
    print(f"{len(CROPS)} crops from {len(sources)} originals → {GEN.relative_to(HERE)}")


if __name__ == "__main__":
    main()
