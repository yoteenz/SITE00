#!/usr/bin/env python3
"""Render the correspondence symbol sheet from the rebuilt display face.

Periods are the red square. Exclamation and question marks use that same
square in red, with the mark above it in black.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path('/workspace')
TTF = Path('/tmp/site00-correspondence-display.ttf')
OUT = ROOT / 'public/site00-correspondence-type-authority/v1/09_REVIEW/SYMBOLS.png'
INK = (17, 17, 17)
RED = (206, 16, 23)
MUTE = (120, 120, 120)
WHITE = (255, 255, 255)

# em 1060, cap 800. Sheet type size is the em, matching the letter specimen.
CAP_RATIO = 800 / 1060


def load(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(TTF), size)


def mask_of(font: ImageFont.FreeTypeFont, ch: str) -> Image.Image:
    m = font.getmask(ch, mode='L')
    im = Image.new('L', m.size, 0)
    im.putdata(list(m))
    return im


def colorize(mask: Image.Image, ch: str) -> Image.Image:
    arr = np.array(mask)
    rgba = np.zeros((arr.shape[0], arr.shape[1], 4), dtype=np.uint8)
    if ch not in '!?':
        color = RED if ch == '.' else INK
        rgba[..., 0] = color[0]
        rgba[..., 1] = color[1]
        rgba[..., 2] = color[2]
        rgba[..., 3] = arr
        return Image.fromarray(rgba, 'RGBA')
    ink_rows = np.where(arr.max(axis=1) > 16)[0]
    if len(ink_rows) == 0:
        return Image.fromarray(rgba, 'RGBA')
    gaps = np.where(np.diff(ink_rows) > 2)[0]
    split = int(ink_rows[gaps[-1]] + 1) if len(gaps) else 0
    color = np.zeros((*arr.shape, 3), dtype=np.uint8)
    color[:split] = INK
    color[split:] = RED
    rgba[..., :3] = color
    rgba[..., 3] = arr
    return Image.fromarray(rgba, 'RGBA')


def draw_run(canvas: Image.Image, text: str, font: ImageFont.FreeTypeFont, baseline: int, gap: int) -> None:
    glyphs = []
    for ch in text:
        img = colorize(mask_of(font, ch), ch)
        bbox = font.getbbox(ch, anchor='ls')
        glyphs.append((img, bbox, font.getlength(ch)))
    width = sum(adv for _, _, adv in glyphs) + gap * (len(glyphs) - 1)
    x = (canvas.width - width) / 2
    for img, bbox, adv in glyphs:
        canvas.alpha_composite(img, (int(round(x + bbox[0])), int(round(baseline + bbox[1]))))
        x += adv + gap


def caption(canvas: Image.Image, text: str) -> None:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
    draw = ImageDraw.Draw(canvas)
    tracking = 1.4
    widths = [font.getlength(ch) + tracking for ch in text]
    total = sum(widths) - tracking
    x = (canvas.width - total) / 2
    for ch, w in zip(text, widths):
        draw.text((x, 28), ch, font=font, fill=MUTE)
        x += w


def main() -> None:
    sample = load(200)
    hero = load(420)
    sample_cap = int(round(200 * CAP_RATIO))
    width = 1400
    # gap is extra space between glyphs. after is the pad below that line's ink.
    lines = [
        (sample, 'FOUNDATION.', 0, 16),
        (sample, 'READY!', 0, 16),
        (sample, 'SURE?', 0, 64),
        (hero, '......', 28, 48),
        (hero, '!!!!!!', 28, 48),
        (hero, '??????', 28, 0),
    ]
    ink_top = 78
    baselines = []
    for font, text, _gap, after in lines:
        bbox = font.getbbox(text[0], anchor='ls')
        baselines.append(ink_top - bbox[1])
        ink_top += (bbox[3] - bbox[1]) + after
    height = ink_top + 48
    canvas = Image.new('RGBA', (width, height), WHITE + (255,))
    caption(canvas, 'PERIODS RED  ·  EXCLAMATION AND QUESTION: BASE PERIOD RED, TOP BLACK')
    for (font, text, gap, _after), baseline in zip(lines, baselines):
        draw_run(canvas, text, font, baseline, gap)
    rgb = Image.new('RGB', canvas.size, WHITE)
    rgb.paste(canvas, mask=canvas.split()[-1])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    rgb.save(OUT, 'PNG')
    art = Path('/opt/cursor/artifacts/symbol-specimen.png')
    art.parent.mkdir(parents=True, exist_ok=True)
    rgb.save(art, 'PNG')
    print(rgb.size, OUT)


if __name__ == '__main__':
    main()
