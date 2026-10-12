#!/usr/bin/env python3
"""Export two-color ? and ! PNG marks for live UI and FNDATN-01 display headlines."""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFont

ROOT = Path(__file__).resolve().parents[2]
TTF = Path('/tmp/site00-correspondence-display.ttf')
if not TTF.is_file():
    TTF = ROOT / 'public/site00-correspondence-studio/fndatn-01/fonts/site00-correspondence-display.woff2'
OUT = ROOT / 'public/site00-correspondence-studio/fndatn-01/marks'
INK = (12, 12, 12)
RED = (206, 16, 23)
SIZE = 320


def colorize(mask: Image.Image, ch: str) -> Image.Image:
    arr = np.array(mask)
    rgba = np.zeros((arr.shape[0], arr.shape[1], 4), dtype=np.uint8)
    ink_rows = np.where(arr.max(axis=1) > 16)[0]
    gaps = np.where(np.diff(ink_rows) > 2)[0]
    split = int(ink_rows[gaps[-1]] + 1) if len(gaps) else 0
    color = np.zeros((*arr.shape, 3), dtype=np.uint8)
    color[:split] = INK
    color[split:] = RED
    rgba[..., :3] = color
    rgba[..., 3] = arr
    return Image.fromarray(rgba, 'RGBA')


def main() -> None:
    if not TTF.suffix == '.ttf':
        raise SystemExit('Run build_type_authority or place TTF at /tmp/site00-correspondence-display.ttf')
    font = ImageFont.truetype(str(TTF), SIZE)
    OUT.mkdir(parents=True, exist_ok=True)
    for ch, name in [('?', 'question.png'), ('!', 'exclamation.png')]:
        m = font.getmask(ch, mode='L')
        im = Image.new('L', m.size, 0)
        im.putdata(list(m))
        rgba = colorize(im, ch)
        bbox = rgba.getbbox()
        if bbox:
            rgba = rgba.crop(bbox)
        rgba.save(OUT / name)
        print(name, rgba.size)


if __name__ == '__main__':
    main()
