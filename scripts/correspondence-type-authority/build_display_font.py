#!/usr/bin/env fontforge
"""Build the correspondence display face from the traced specimen.

Heavy A–Z and red 0–9 are the traced outlines. The apostrophe and the
square period are not on the sheet; they exist so WE'VE and the red
headline stop can stay in the same face. The exclamation and the question
mark use that same square as their base.
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
font.version = '1.2'
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
# The exclamation and the question use this same square as their base.
STEM = int(round(CAP * 0.15))
DOT_GAP = int(round(CAP * 0.07))


def square(pen, x, y, s):
    pen.moveTo((x, y))
    pen.lineTo((x + s, y))
    pen.lineTo((x + s, y + s))
    pen.lineTo((x, y + s))
    pen.closePath()


def corner(pen, a, b, c):
    """Quarter-turn cubic from a (current point) through the corner to c."""
    k = 0.5523
    ax, ay = a
    bx, by = b
    cx, cy = c
    pen.curveTo((ax + (bx - ax) * k, ay + (by - ay) * k), (cx + (bx - cx) * k, cy + (by - cy) * k), c)


period = font.createChar(ord('.'))
pen = period.glyphPen()
square(pen, LSB, 0, STEM)
period.width = LSB + STEM + RSB

# Exclamation: the square period, then a stem of the same width up to the cap.
bang = font.createChar(ord('!'))
pen = bang.glyphPen()
square(pen, LSB, 0, STEM)
stem_bot = STEM + DOT_GAP
pen.moveTo((LSB, stem_bot))
pen.lineTo((LSB + STEM, stem_bot))
pen.lineTo((LSB + STEM, CAP))
pen.lineTo((LSB, CAP))
pen.closePath()
bang.width = LSB + STEM + RSB
bang.correctDirection()

# Question: heavy hook in the condensed stem weight, same square centered under it.
hook_left = LSB
hook_right = LSB + STEM + 36 + STEM
hook_top = CAP
term_y = 500
inner_left = hook_left + STEM
inner_top = hook_top - STEM
stem_left = hook_right - STEM
radius = 64
quest = font.createChar(ord('?'))
pen = quest.glyphPen()
pen.moveTo((stem_left, stem_bot))
pen.lineTo((hook_right, stem_bot))
pen.lineTo((hook_right, hook_top - radius))
corner(pen, (hook_right, hook_top - radius), (hook_right, hook_top), (hook_right - radius, hook_top))
pen.lineTo((hook_left + radius, hook_top))
corner(pen, (hook_left + radius, hook_top), (hook_left, hook_top), (hook_left, hook_top - radius))
pen.lineTo((hook_left, term_y))
pen.lineTo((inner_left, term_y))
pen.lineTo((inner_left, inner_top))
pen.lineTo((stem_left, inner_top))
pen.closePath()
mark_mid = (hook_left + hook_right) / 2
square(pen, int(round(mark_mid - STEM / 2)), 0, STEM)
quest.width = hook_right + RSB
quest.correctDirection()

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
