#!/usr/bin/env fontforge
"""Build the correspondence display face from the traced specimen.

Heavy A–Z and red 0–9 are the traced outlines. The apostrophe and the
square period are not on the sheet; they exist so WE'VE and the red
headline stop can stay in the same face.
"""
import json
import subprocess
from pathlib import Path

import fontforge

ROOT = Path('/workspace')
PACK = ROOT / 'public/site00-correspondence-type-authority/v1/11_SPECIMEN_TRACE'
OUT_TTF = Path('/tmp/site00-correspondence-display.ttf')
OUT_WOFF = ROOT / 'public/site00-correspondence-studio/fndatn-01/fonts/site00-correspondence-display.woff2'

CAP = 800
LSB = 14
RSB = 14
# Letters only. Numbers stay at the traced width.
LETTER_WIDEN = 1.10

meta = json.loads((PACK / 'metrics.json').read_text())
glyphs = meta['glyphs']
heavy = [g for g in glyphs if g['role'] == 'heavy']
nums = [g for g in glyphs if g['role'] == 'numeral']
cap_px = sorted(g['height'] for g in heavy if g['char'] != 'Q')[len(heavy) // 2]
scale_px = CAP / cap_px
q = next(g for g in heavy if g['char'] == 'Q')
row = [g for g in heavy if abs(g['box'][1] - q['box'][1]) < 30 and g['char'] != 'Q']
baseline = sorted(g['box'][3] for g in row)[len(row) // 2]
q_desc_px = max(0, q['box'][3] - baseline)

font = fontforge.font()
font.ascent = 860
font.descent = 200
font.em = 1060
font.familyname = 'SITE 00 Display'
font.fontname = 'SITE00Display-Heavy'
font.fullname = 'SITE 00 Display Heavy'
font.weight = 'Heavy'
font.copyright = 'SITE 00 correspondence reconstruction of the founder specimen. For SITE 00 correspondence only.'
font.version = '1.1'
font.encoding = 'UnicodeFull'

def place(ch: str, svg: Path, px_h: int, desc_px: float, widen: float = 1.0) -> None:
    g = font.createChar(ord(ch))
    g.importOutlines(str(svg))
    xmin, ymin, xmax, ymax = g.boundingBox()
    cur_h = ymax - ymin
    if cur_h <= 0:
        raise SystemExit(f'empty outline {ch}')
    factor = (px_h * scale_px) / cur_h
    g.transform((factor, 0, 0, factor, 0, 0))
    xmin, ymin, xmax, ymax = g.boundingBox()
    desc = desc_px * scale_px
    g.transform((1, 0, 0, 1, LSB - xmin, -desc - ymin))
    if widen != 1.0:
        xmin, ymin, xmax, ymax = g.boundingBox()
        g.transform((widen, 0, 0, 1, xmin * (1 - widen), 0))
    xmin, ymin, xmax, ymax = g.boundingBox()
    g.width = int(round(xmax + RSB))
    print(f'{ch} width {g.width} box {tuple(round(v) for v in g.boundingBox())}')

for g in heavy:
    desc = q_desc_px if g['char'] == 'Q' else 0
    place(g['char'], ROOT / 'public/site00-correspondence-type-authority/v1' / g['svg'], g['height'], desc, LETTER_WIDEN)

for g in nums:
    place(g['char'], ROOT / 'public/site00-correspondence-type-authority/v1' / g['svg'], g['height'], 0)

space = font.createChar(ord(' '))
space.width = int(round(CAP * 0.22 * LETTER_WIDEN))

# Square period. Not on the specimen. Sits on the baseline at stem width.
period = font.createChar(ord('.'))
pen = period.glyphPen()
s = int(round(CAP * 0.15))
pen.moveTo((LSB, 0))
pen.lineTo((LSB + s, 0))
pen.lineTo((LSB + s, s))
pen.lineTo((LSB, s))
pen.closePath()
period.width = LSB + s + RSB

# Apostrophe for WE'VE. Not on the specimen. A stem-weight mark at the cap.
apos = font.createChar(ord("'"))
pen = apos.glyphPen()
w = int(round(CAP * 0.08 * LETTER_WIDEN))
h = int(round(CAP * 0.22))
top = CAP
pen.moveTo((LSB, top - h))
pen.lineTo((LSB + w, top - h))
pen.lineTo((LSB + w, top))
pen.lineTo((LSB, top))
pen.closePath()
apos.width = LSB + w + RSB

font.generate(str(OUT_TTF))
print('ttf', OUT_TTF, OUT_TTF.stat().st_size)

subprocess.check_call([
    'python3', '-c',
    (
        'from fontTools.ttLib import TTFont;'
        f'f=TTFont("{OUT_TTF}");f.flavor="woff2";'
        f'f.save("{OUT_WOFF}")'
    ),
])
print('woff2', OUT_WOFF, OUT_WOFF.stat().st_size)
