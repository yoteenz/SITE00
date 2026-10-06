#!/usr/bin/env python3
"""Three-up founder review board for F09 corrected 4K candidates."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1/REFERENCE_CANDIDATES_4K"

PANELS = [
    (
        "01 THE SURVEYED COURTYARD",
        "THE OPEN FLOOR",
        "NEGATIVE SPACE IS THE MONEY",
        "F09_T01_SURVEYED_COURTYARD_MOBILE_9x16_4K.png",
    ),
    (
        "02 THE ANSWER IN RAKING LIGHT",
        "THE PLAIN ANSWER",
        "ONLY HELD-BACK WORDS ARE METAL",
        "F09_T02_ANSWER_IN_RAKING_LIGHT_MOBILE_9x16_4K.png",
    ),
    (
        "03 THE SORTING RACK",
        "THE OPEN ENVELOPE",
        "THE BROKEN SEAL",
        "F09_T03_SORTING_RACK_MOBILE_9x16_4K.png",
    ),
]

THUMB_H = 1400
PAD = 48
LABEL_H = 220
BG = (249, 246, 239)


def main() -> None:
    thumbs: list[Image.Image] = []
    for _title, _struct, _idea, fname in PANELS:
        im = Image.open(OUT_DIR / fname).convert("RGB")
        w = int(im.width * (THUMB_H / im.height))
        thumbs.append(im.resize((w, THUMB_H), Image.Resampling.LANCZOS))

    total_w = sum(t.width for t in thumbs) + PAD * (len(thumbs) + 1)
    total_h = THUMB_H + LABEL_H + PAD * 2
    board = Image.new("RGB", (total_w, total_h), BG)
    draw = ImageDraw.Draw(board)
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
        font_meta = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
    except OSError:
        font_title = ImageFont.load_default()
        font_meta = font_title

    x = PAD
    for (title, struct, idea, _fname), thumb in zip(PANELS, thumbs, strict=True):
        board.paste(thumb, (x, PAD))
        y0 = PAD + THUMB_H + 16
        draw.text((x, y0), title, fill=(15, 61, 50), font=font_title)
        draw.text((x, y0 + 40), f"STRUCTURAL: {struct}", fill=(80, 80, 80), font=font_meta)
        draw.text((x, y0 + 72), f"IDEA: {idea}", fill=(80, 80, 80), font=font_meta)
        x += thumb.width + PAD

    out = OUT_DIR / "F09_FOUNDER_REVIEW_BOARD_CORRECTED_4K.png"
    board.save(out, optimize=True)
    print("Wrote", out, board.size)


if __name__ == "__main__":
    main()
