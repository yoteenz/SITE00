#!/usr/bin/env python3
"""Contact sheet for Family 1 parent asset kit (discrete assets only)."""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "jurnl" / "f01-asset-first" / "assets"
OUT = ROOT / "JURNL" / "F01_ENTRY" / "ASSET_FIRST_TEST1" / "FAMILY1_PARENT_ASSET_CONTACT_SHEET.jpg"


def font(size: int):
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def checker(w: int, h: int) -> Image.Image:
    img = Image.new("RGB", (w, h), (230, 226, 218))
    d = ImageDraw.Draw(img)
    cell = 14
    for y in range(0, h, cell):
        for x in range(0, w, cell):
            if ((x // cell) + (y // cell)) % 2 == 0:
                d.rectangle((x, y, x + cell, y + cell), fill=(214, 208, 198))
    return img


def main() -> None:
    files = sorted(ASSETS.glob("ENTRY.*"))
    cols = 3
    cell_w, cell_h = 420, 460
    rows = math.ceil(len(files) / cols)
    sheet = Image.new("RGB", (cols * cell_w + 40, rows * cell_h + 80), (245, 241, 233))
    draw = ImageDraw.Draw(sheet)
    draw.text((16, 16), "FAMILY 1 PARENT ASSET KIT", fill=(20, 20, 20), font=font(22))
    for i, path in enumerate(files):
        col, row = i % cols, i // cols
        x, y = 16 + col * cell_w, 60 + row * cell_h
        im = Image.open(path)
        thumb = im.convert("RGBA")
        thumb.thumbnail((380, 340))
        bg = checker(380, 340)
        bg.paste(thumb, ((380 - thumb.width) // 2, (340 - thumb.height) // 2), thumb if thumb.mode == "RGBA" else None)
        sheet.paste(bg, (x, y))
        draw.text((x, y + 348), path.stem, fill=(30, 30, 30), font=font(12))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT, quality=85)
    print(OUT)


if __name__ == "__main__":
    main()
