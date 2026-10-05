#!/usr/bin/env python3
"""Build SHEET A — F01 Canonical Harvest from actual cropped parent assets."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / "JURNL" / "F01_ENTRY"
ASSETS = ROOT / "ASSETS"
OVERLAYS = ROOT / "OVERLAYS"
OUT = ROOT / "SHEETS" / "SHEET_A_F01_CANONICAL_HARVEST.png"

COLS = 2
CELL_W = 640
CELL_H = 420
PAD = 24
HEADER = 120


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for name in ("DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main() -> None:
    pngs = sorted(ASSETS.glob("ENTRY.*.png"))
    pngs += sorted(OVERLAYS.glob("ENTRY.*.png"))
    if not pngs:
        raise SystemExit("No harvested assets")
    rows = (len(pngs) + COLS - 1) // COLS
    w = COLS * CELL_W + PAD * (COLS + 1)
    h = HEADER + rows * CELL_H + PAD * (rows + 1)
    sheet = Image.new("RGB", (w, h), (245, 241, 233))
    draw = ImageDraw.Draw(sheet)
    title_f = load_font(28)
    label_f = load_font(16)
    meta_f = load_font(13)
    draw.text((PAD, PAD), "F01 CANONICAL HARVEST — SHEET A", fill=(30, 30, 30), font=title_f)
    draw.text((PAD, PAD + 36), "SOURCE: F01.00 PARENT (RE-EXTRACTED) · RECOVERY1 · IN REVIEW", fill=(80, 80, 80), font=meta_f)

    for i, path in enumerate(pngs):
        col = i % COLS
        row = i // COLS
        x = PAD + col * (CELL_W + PAD)
        y = HEADER + PAD + row * (CELL_H + PAD)
        draw.rectangle((x, y, x + CELL_W, y + CELL_H), outline=(200, 195, 188), width=2, fill=(255, 252, 248))
        thumb = Image.open(path).convert("RGB")
        thumb.thumbnail((CELL_W - 20, CELL_H - 70))
        tx = x + (CELL_W - thumb.width) // 2
        ty = y + 48
        sheet.paste(thumb, (tx, ty))
        asset_id = path.stem
        draw.text((x + 12, y + 12), asset_id, fill=(20, 20, 20), font=label_f)
        draw.text((x + 12, y + CELL_H - 28), "CANONICAL · PARENT HARVEST", fill=(100, 100, 100), font=meta_f)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT, optimize=True)
    print(f"Wrote {OUT} ({len(pngs)} assets)")


if __name__ == "__main__":
    main()
