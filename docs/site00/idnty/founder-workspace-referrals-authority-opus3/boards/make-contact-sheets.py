#!/usr/bin/env python3
"""Tiles the audit screenshots (verification/contact-sheets/_*.jpg) into one sheet per state, then removes the tiles.
Each tile is the full viewport screenshot scaled to a common height, labelled with its viewport."""
import json, re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

d = Path(__file__).resolve().parent.parent / 'verification' / 'contact-sheets'
font_path = Path(__file__).resolve().parents[6] / 'public/site00-correspondence-studio/fndatn-01/fonts'
H = 260
groups = {}
for f in sorted(d.glob('_*.jpg')):
    m = re.match(r'_(.+)__(\d+)x(\d+)\.jpg$', f.name)
    groups.setdefault(m.group(1), []).append((int(m.group(2)), int(m.group(3)), f))
for state, items in groups.items():
    items.sort()
    tiles = []
    for w, h, f in items:
        im = Image.open(f).convert('RGB')
        im = im.resize((max(1, round(im.width * H / im.height)), H))
        tiles.append((w, h, im))
    rows = [tiles[:9], tiles[9:]]
    width = max(sum(t[2].width for t in r) + 16 * (len(r) + 1) for r in rows)
    sheet = Image.new('RGB', (width, 2 * (H + 40) + 16), (233, 232, 228))
    draw = ImageDraw.Draw(sheet)
    y = 16
    for r in rows:
        x = 16
        for w, h, im in r:
            sheet.paste(im, (x, y + 22))
            draw.text((x, y + 4), f'{w} x {h}', fill=(12, 12, 12))
            x += im.width + 16
        y += H + 40
    sheet.save(d / f'{state}.jpg', quality=80)
    for _, _, f in items:
        f.unlink()
    print(state, sheet.size)
