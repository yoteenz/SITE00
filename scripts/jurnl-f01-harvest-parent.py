#!/usr/bin/env python3
"""Forensic crop harvest from F01.00 parent production PNG into canonical asset IDs."""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "JURNL" / "F01_ENTRY"
PARENT = ROOT / "PARENT" / "F01.00_WELCOME_GENERATED.png"
OUT = ROOT / "ASSETS"

# Normalized boxes (x0, y0, x1, y1) as fractions of image size — tuned for 1296×2304 parent.
CROPS: dict[str, tuple[float, float, float, float]] = {
    "ENTRY.ARCH.ARCHWAY.001": (0.52, 0.02, 0.98, 0.42),
    "ENTRY.ARCH.COAST.001": (0.58, 0.04, 0.96, 0.28),
    "ENTRY.MATERIAL.PLASTER.001": (0.02, 0.08, 0.48, 0.55),
    "ENTRY.MATERIAL.TRAVERTINE.001": (0.35, 0.55, 0.98, 0.88),
    "ENTRY.MATERIAL.TEXTILE.ROSE.001": (0.48, 0.38, 0.78, 0.58),
    "ENTRY.MATERIAL.CURTAIN.001": (0.72, 0.12, 0.98, 0.72),
    "ENTRY.OBJECT.BUST.001": (0.42, 0.48, 0.62, 0.68),
    "ENTRY.OBJECT.BOWL.001": (0.58, 0.62, 0.78, 0.78),
    "ENTRY.OBJECT.BOOKS.001": (0.62, 0.68, 0.92, 0.86),
    "ENTRY.OBJECT.JURNLBOOK.001": (0.68, 0.72, 0.88, 0.84),
    "ENTRY.BOTANICAL.FOREGROUND.001": (0.0, 0.55, 0.28, 0.95),
    "ENTRY.BOTANICAL.ACCENT.001": (0.02, 0.02, 0.12, 0.12),
    "ENTRY.LIGHT.SUN.001": (0.0, 0.05, 0.35, 0.45),
    "ENTRY.LOGO.PLACEMENT.001": (0.03, 0.03, 0.18, 0.14),
    "ENTRY.BUTTON.PRIMARY.001": (0.08, 0.82, 0.92, 0.88),
    "ENTRY.BUTTON.SECONDARY.001": (0.08, 0.89, 0.92, 0.95),
    "ENTRY.PAPER.001": (0.05, 0.35, 0.45, 0.75),
}


def main() -> None:
    if not PARENT.is_file():
        raise SystemExit(f"Missing parent: {PARENT}")
    OUT.mkdir(parents=True, exist_ok=True)
    im = Image.open(PARENT).convert("RGB")
    w, h = im.size
    lineage: list[dict] = []
    for asset_id, box in CROPS.items():
        x0, y0, x1, y1 = box
        crop = im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
        dest = OUT / f"{asset_id}.png"
        crop.save(dest, optimize=True)
        lineage.append(
            {
                "ASSET_ID": asset_id,
                "SOURCE_SCREEN": "F01.00",
                "SOURCE_GENERATION": "WjkVD1jNeggB0iWBABM6",
                "STATUS": "CANONICAL",
                "FILE": str(dest.relative_to(ROOT.parent.parent)),
                "USED_BY": ["F01_ENTRY_FAMILY"],
                "ALLOWED_TRANSFORMS": ["crop", "scale", "mask", "responsive reposition", "subtle tonal adjustment"],
                "NOT_ALLOWED": ["redesign", "arbitrary recolor", "material replacement", "style drift"],
            }
        )
    manifest = ROOT / "MANIFEST" / "asset_lineage_harvest.json"
    manifest.write_text(json.dumps(lineage, indent=2), encoding="utf-8")
    print(f"Harvested {len(lineage)} assets → {OUT}")


if __name__ == "__main__":
    main()
