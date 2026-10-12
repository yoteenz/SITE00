#!/usr/bin/env python3
"""One specimen sheet of the correspondence display reconstruction.

Traced glyphs stay traced. C J M P Q V X Z are not in the invitation; they are
built from the traced strokes and marked on the sheet. Digits 4–9 stay the
existing derived extensions.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
PACK = ROOT / 'public/site00-correspondence-type-authority/v1'
WORK = Path('/tmp/site00-specimen')
CAP = 640  # working resolution

PICKS = {
    'A': '05_DISPLAY_GLYPHS/display-A-285.svg',
    'B': '05_DISPLAY_GLYPHS/display-B-101.svg',
    'D': '05_DISPLAY_GLYPHS/display-D-249.svg',
    'E': '05_DISPLAY_GLYPHS/display-E-141.svg',
    'F': '05_DISPLAY_GLYPHS/display-F-101.svg',
    'G': '05_DISPLAY_GLYPHS/display-G-174.svg',
    'H': '05_DISPLAY_GLYPHS/display-H-ask-148.svg',
    'I': '05_DISPLAY_GLYPHS/display-I-213.svg',
    'K': '05_DISPLAY_GLYPHS/display-K-ask-430.svg',
    'L': '05_DISPLAY_GLYPHS/display-L-ask-321.svg',
    'N': '05_DISPLAY_GLYPHS/display-N-231.svg',
    'O': '05_DISPLAY_GLYPHS/display-O-136.svg',
    'R': '05_DISPLAY_GLYPHS/display-R-399.svg',
    'S': '05_DISPLAY_GLYPHS/display-S-ask-403.svg',
    'T': '05_DISPLAY_GLYPHS/display-T-319.svg',
    'U': '05_DISPLAY_GLYPHS/display-U-362.svg',
    'W': '05_DISPLAY_GLYPHS/display-W-ask-100.svg',
    'Y': '05_DISPLAY_GLYPHS/display-Y-287.svg',
    '0': '03_NUMERAL_SVGS/numeral-0-990.svg',
    '1': '03_NUMERAL_SVGS/numeral-1-990.svg',
    '2': '03_NUMERAL_SVGS/numeral-2-1076.svg',
    '3': '03_NUMERAL_SVGS/numeral-3-1163.svg',
    '4': '03_NUMERAL_SVGS/derived-4.svg',
    '5': '03_NUMERAL_SVGS/derived-5.svg',
    '6': '03_NUMERAL_SVGS/derived-6.svg',
    '7': '03_NUMERAL_SVGS/derived-7.svg',
    '8': '03_NUMERAL_SVGS/derived-8.svg',
    '9': '03_NUMERAL_SVGS/derived-9.svg',
}

TRACED_LETTERS = set('ABDEFGHIKLNORSTUWY')
DERIVED_LETTERS = set('CJMPQVXZ')
DERIVED_DIGITS = set('456789')
RED = (197, 17, 22)
INK = (12, 12, 12)
PAPER = (255, 255, 255)


def write_pbm(path: Path, mask: np.ndarray) -> None:
    h, w = mask.shape
    row_bytes = (w + 7) // 8
    with path.open('wb') as f:
        f.write(f'P4\n{w} {h}\n'.encode())
        for y in range(h):
            buf = bytearray(row_bytes)
            for x in range(w):
                if mask[y, x]:
                    buf[x // 8] |= 0x80 >> (x % 8)
            f.write(buf)


def render_svg(rel: str, cap: int) -> np.ndarray:
    svg = PACK / rel
    png = WORK / (Path(rel).stem + f'-{cap}.png')
    subprocess.check_call(['rsvg-convert', '-h', str(cap), '-o', str(png), str(svg)], stdout=subprocess.DEVNULL)
    rgba = np.asarray(Image.open(png).convert('RGBA'))
    return rgba[:, :, 3] > 140


def hole_mask(ink: np.ndarray) -> np.ndarray:
    h, w = ink.shape
    pad = np.zeros((h + 4, w + 4), np.uint8)
    pad[2:-2, 2:-2] = ink.astype(np.uint8)
    inv = (1 - pad).copy()
    cv2.floodFill(inv, None, (0, 0), 2)
    return inv[2:-2, 2:-2] == 1


def trim(mask: np.ndarray, pad: int = 0) -> np.ndarray:
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return mask
    y0, y1 = max(0, ys.min() - pad), min(mask.shape[0], ys.max() + 1 + pad)
    x0, x1 = max(0, xs.min() - pad), min(mask.shape[1], xs.max() + 1 + pad)
    return mask[y0:y1, x0:x1]


def stem_width(mask: np.ndarray) -> int:
    cols = mask.mean(axis=0)
    solid = np.where(cols > 0.72)[0]
    if len(solid) >= 4:
        # longest run
        best = cur = 1
        for i in range(1, len(solid)):
            if solid[i] == solid[i - 1] + 1:
                cur += 1
                best = max(best, cur)
            else:
                cur = 1
        return best
    return max(8, mask.shape[1] // 5)


def left_stem_right(mask: np.ndarray, y: int) -> int:
    row = mask[y]
    xs = np.where(row)[0]
    if len(xs) == 0:
        return stem_width(mask)
    start = xs[0]
    x = start
    while x < mask.shape[1] and mask[y, x]:
        x += 1
    return x


def open_c(o: np.ndarray) -> np.ndarray:
    """O with the right wall opened through the middle of the counter."""
    c = o.copy()
    hole = hole_mask(o)
    ys = np.where(hole.any(1))[0]
    if len(ys) == 0:
        return c
    y0, y1 = int(ys[0]), int(ys[-1])
    span = y1 - y0
    a = y0 + int(span * 0.18)
    b = y0 + int(span * 0.82)
    for y in range(a, b):
        xs = np.where(hole[y])[0]
        if len(xs) == 0:
            continue
        c[y, xs[-1] + 1 :] = False
    return trim(c)


def make_p(r: np.ndarray) -> np.ndarray:
    """R with the leg removed, bowl kept."""
    h, w = r.shape
    stems = []
    counter_rows = []
    for y in range(int(h * 0.15), int(h * 0.5)):
        if not r[y, 0]:
            continue
        x = 0
        while x < w and r[y, x]:
            x += 1
        if x >= int(w * 0.55):
            continue
        z = x
        while z < w and not r[y, z]:
            z += 1
        if z < w and r[y, z]:
            stems.append(x)
            counter_rows.append(y)
    if not stems:
        return trim(r)
    stem_r = int(np.median(stems))
    y = counter_rows[-1] + 1
    while y < h - 1 and r[y].mean() < 0.82:
        y += 1
    while y < h - 1 and r[y].mean() > 0.82:
        y += 1
    p = r.copy()
    p[y:, stem_r:] = False
    return trim(p)


def make_v(a: np.ndarray) -> np.ndarray:
    """A turned onto its apex, crossbar cleared, so the top is open."""
    v = np.flipud(a)
    hole = hole_mask(v)
    ys = np.where(hole.any(1))[0]
    if len(ys) == 0:
        return trim(v)
    s = stem_width(a)
    y = int(ys[0]) - 1
    cleared = 0
    while y > 0 and cleared < s * 3:
        row = v[y]
        xs = np.where(row)[0]
        if len(xs) == 0:
            break
        interior = row[xs[0] : xs[-1] + 1]
        if not interior.all():
            break
        v[y, xs[0] + s : xs[-1] - s + 1] = False
        cleared += 1
        y -= 1
    return trim(v)


def make_m(h_mask: np.ndarray) -> np.ndarray:
    """Outer stems plus a V to the baseline. Width follows the traced W."""
    height = h_mask.shape[0]
    s = stem_width(h_mask)
    width = int(round(height * 0.92))
    m = np.zeros((height, width), dtype=bool)
    m[:, :s] = True
    m[:, width - s :] = True

    def stroke(x0: float, y0: float, x1: float, y1: float) -> None:
        steps = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        half = s / 2
        for i in range(steps):
            t = i / max(1, steps - 1)
            x = x0 + (x1 - x0) * t
            y = y0 + (y1 - y0) * t
            y0i = max(0, int(y - half * 0.35))
            y1i = min(height, int(y + half * 0.35) + 1)
            x0i = max(0, int(x - half))
            x1i = min(width, int(x + half) + 1)
            m[y0i:y1i, x0i:x1i] = True

    stroke(s * 0.5, 0, width / 2, height - 1)
    stroke(width - s * 0.5, 0, width / 2, height - 1)
    m[:, :s] = True
    m[:, width - s :] = True
    return m


def make_x(k: np.ndarray) -> np.ndarray:
    """K's two arms, mirrored, joined through the center."""
    # The waist of K is solid, so column density cannot find the stem.
    # The top row's first run is the stem.
    y = 2
    xs = np.where(k[y])[0]
    if len(xs) == 0:
        return trim(k)
    x = int(xs[0])
    while x < k.shape[1] and k[y, x]:
        x += 1
    arms = k.copy()
    arms[:, :x] = False
    arms = trim(arms)
    if not arms.any():
        return trim(k)
    mir = np.fliplr(arms)
    overlap = max(6, arms.shape[1] // 10)
    width = arms.shape[1] * 2 - overlap
    canvas = np.zeros((arms.shape[0], width), dtype=bool)
    canvas[:, : mir.shape[1]] |= mir
    canvas[:, width - arms.shape[1] :] |= arms
    return trim(canvas)


def make_z(e: np.ndarray, stem: int) -> np.ndarray:
    """Top and bottom bars taken from E, with a stem-weight diagonal."""
    rows = e.mean(axis=1)
    top = 0
    while top < len(rows) and rows[top] > 0.85:
        top += 1
    bot = 0
    while bot < len(rows) and rows[-(bot + 1)] > 0.85:
        bot += 1
    top = max(top, stem // 2)
    bot = max(bot, stem // 2)
    h, w = e.shape
    z = np.zeros_like(e)
    z[:top, :] = True
    z[-bot:, :] = True
    # diagonal from the right end of the top bar to the left end of the bottom bar
    y0, y1 = top - 1, h - bot
    span = max(1, y1 - y0)
    for y in range(y0, y1 + 1):
        t = (y - y0) / span
        cx = int(round((w - 1) * (1 - t)))
        half = stem // 2
        z[y, max(0, cx - half) : min(w, cx + half + 1)] = True
    # keep the diagonal meeting the bars
    z[:top, :] = True
    z[-bot:, :] = True
    return z


def make_j(u: np.ndarray) -> np.ndarray:
    """Right stem of U, with a short bottom hook. U's counter is open, so it is not a hole."""
    h, w = u.shape
    top = u[: int(h * 0.55)]
    empty = np.where(top.mean(0) < 0.08)[0]
    if len(empty) == 0:
        return trim(u)
    valley_right = int(empty.max())
    mid = int(np.median(empty))
    bowl = h - 1
    for y in range(h):
        if u[y, mid]:
            bowl = y
            break
    j = u.copy()
    j[:bowl, : valley_right + 1] = False
    hook_left = max(0, valley_right - (w - valley_right) // 2)
    j[bowl:, :hook_left] = False
    return trim(j)


def make_q(o: np.ndarray, r: np.ndarray) -> np.ndarray:
    """O plus a short tail cut from the leg of R."""
    hole = hole_mask(r)
    ys = np.where(hole.any(1))[0]
    if len(ys) == 0:
        return o
    y_mid = int((ys[0] + ys[-1]) / 2)
    stem_r = left_stem_right(r, y_mid)
    bowl_bottom = int(ys[-1])
    leg = np.zeros_like(r)
    leg[bowl_bottom:, stem_r:] = r[bowl_bottom:, stem_r:]
    leg = trim(leg)
    if leg.size == 0 or not leg.any():
        return o
    # scale the leg down to about a third of the cap
    target_h = max(12, o.shape[0] // 3)
    scale = target_h / leg.shape[0]
    target_w = max(8, int(round(leg.shape[1] * scale)))
    leg_img = Image.fromarray((leg * 255).astype(np.uint8))
    leg_img = leg_img.resize((target_w, target_h), Image.Resampling.NEAREST)
    leg_s = np.asarray(leg_img) > 128
    qh = o.shape[0] + leg_s.shape[0] // 3
    qw = o.shape[1] + leg_s.shape[1] // 4
    canvas = np.zeros((qh, qw), dtype=bool)
    canvas[: o.shape[0], : o.shape[1]] = o
    y = o.shape[0] - leg_s.shape[0] + leg_s.shape[0] // 5
    x = o.shape[1] - leg_s.shape[1] // 2
    y = max(0, min(y, qh - leg_s.shape[0]))
    x = max(0, min(x, qw - leg_s.shape[1]))
    canvas[y : y + leg_s.shape[0], x : x + leg_s.shape[1]] |= leg_s
    return trim(canvas)


def potrace(mask: np.ndarray, svg_path: Path) -> None:
    svg_path.parent.mkdir(parents=True, exist_ok=True)
    write_pbm(svg_path.with_suffix('.pbm'), mask)
    subprocess.check_call(
        ['potrace', '-s', '--alphamax', '0.4', '--opttolerance', '0.2', '--turdsize', '2', '-o', str(svg_path), str(svg_path.with_suffix('.pbm'))],
        stdout=subprocess.DEVNULL,
    )
    svg_path.with_suffix('.pbm').unlink(missing_ok=True)


def mask_to_sprite(mask: np.ndarray, cap: int, color: tuple[int, int, int]) -> Image.Image:
    mask = trim(mask)
    h, w = mask.shape
    scale = cap / h
    nw = max(1, int(round(w * scale)))
    img = Image.fromarray((mask * 255).astype(np.uint8)).resize((nw, cap), Image.Resampling.LANCZOS)
    alpha = np.asarray(img)
    rgba = np.zeros((cap, nw, 4), np.uint8)
    rgba[:, :, 0] = color[0]
    rgba[:, :, 1] = color[1]
    rgba[:, :, 2] = color[2]
    rgba[:, :, 3] = alpha
    return Image.fromarray(rgba)


def line_width(sprites: list[Image.Image | None], gap: int, space: int) -> int:
    w = 0
    for i, sp in enumerate(sprites):
        if sp is None:
            w += space
        else:
            w += sp.width
            if i < len(sprites) - 1 and sprites[i + 1] is not None:
                w += gap
    return w


def draw_line(canvas: Image.Image, sprites: list[Image.Image | None], x: int, baseline: int, gap: int, space: int) -> None:
    for i, sp in enumerate(sprites):
        if sp is None:
            x += space
            continue
        canvas.paste(sp, (x, baseline - sp.height), sp)
        x += sp.width
        if i < len(sprites) - 1 and sprites[i + 1] is not None:
            x += gap


def main() -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    masks = {ch: render_svg(rel, CAP) for ch, rel in PICKS.items() if ch in TRACED_LETTERS or ch in '0123'}
    stem = stem_width(masks['I'])
    derived = {
        'C': open_c(masks['O']),
        'J': make_j(masks['U']),
        'M': make_m(masks['H']),
        'P': make_p(masks['R']),
        'Q': make_q(masks['O'], masks['R']),
        'V': make_v(masks['A']),
        'X': make_x(masks['K']),
        'Z': make_z(masks['E'], stem),
    }
    out_dir = PACK / '05_DISPLAY_GLYPHS'
    for ch, mask in derived.items():
        potrace(mask, out_dir / f'derived-{ch}.svg')
        masks[ch] = mask

    for d in '456789':
        masks[d] = render_svg(PICKS[d], CAP)

    # median ink-to-ink gap on the hero, as a fraction of cap height
    spec = json.loads((PACK / '08_AUTHORITY/TYPOGRAPHY_SPEC.json').read_text())
    hero = [g for g in spec['glyphs'] if g['role'] == 'display']
    lines_y: dict[int, list] = {}
    for g in hero:
        key = round(g['box'][1] / 20) * 20
        lines_y.setdefault(key, []).append(g)
    gaps = []
    for row in lines_y.values():
        row.sort(key=lambda g: g['box'][0])
        for a, b in zip(row, row[1:]):
            gap = b['box'][0] - a['box'][2]
            if 0 <= gap < a['height']:
                gaps.append(gap / a['height'])
    gap_ratio = float(np.median(gaps)) if gaps else 0.1
    # The invitation is tracked tight. The sheet opens that slightly so each glyph reads alone.
    gap_ratio = max(gap_ratio, 0.1)
    print('gap_ratio', round(gap_ratio, 3), 'n', len(gaps), 'stem', stem)

    # sheet
    W = 1400
    margin = 72
    content = W - margin * 2
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 22)
    font_sm = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)

    def fit_cap(text: str, target_cap: int, letter_gap_ratio: float) -> tuple[int, int, int]:
        """Return cap, gap, space that fit `text` in the content width."""
        cap = target_cap
        while cap > 40:
            gap = max(2, int(round(cap * letter_gap_ratio)))
            space = max(gap * 2, int(round(cap * 0.28)))
            sprites = []
            for ch in text:
                if ch == ' ':
                    sprites.append(None)
                else:
                    sprites.append(mask_to_sprite(masks[ch], cap, INK))
            if line_width(sprites, gap, space) <= content:
                return cap, gap, space
            cap -= 4
        return 40, 4, 12

    sample_cap, sample_gap, sample_space = fit_cap('FOUNDATION', 280, gap_ratio)
    alpha_cap, alpha_gap, _ = fit_cap('ABCDEFGHIJKLM', 210, gap_ratio * 0.85)
    num_cap, num_gap, _ = fit_cap('0123456789', 240, gap_ratio)

    def sprites_for(text: str, cap: int, color: tuple[int, int, int]) -> list[Image.Image | None]:
        return [None if ch == ' ' else mask_to_sprite(masks[ch], cap, color) for ch in text]

    lines = [
        ('kicker', 36),
        ('sample', sample_cap, 'BEGIN YOUR'),
        ('gap', 28),
        ('sample', sample_cap, 'FOUNDATION'),
        ('gap', 64),
        ('rule', 1),
        ('gap', 48),
        ('alpha', alpha_cap, 'ABCDEFGHIJKLM'),
        ('gap', 36),
        ('alpha', alpha_cap, 'NOPQRSTUVWXYZ'),
        ('gap', 64),
        ('rule', 1),
        ('gap', 48),
        ('nums', num_cap, '0123456789'),
        ('gap', 28),
        ('legend', 56),
        ('footer', 72),
    ]
    height = margin
    for item in lines:
        kind = item[0]
        if kind in ('sample', 'alpha', 'nums'):
            height += item[1]
        else:
            height += item[1]
    height += margin

    canvas = Image.new('RGB', (W, height), PAPER)
    draw = ImageDraw.Draw(canvas)
    y = margin
    marks: list[tuple[str, int, int, int]] = []  # char, x center, baseline, cap

    def place(text: str, cap: int, gap: int, space: int, color: tuple[int, int, int], y_top: int) -> None:
        sps = sprites_for(text, cap, color)
        width = line_width(sps, gap, space)
        x = margin + (content - width) // 2
        baseline = y_top + cap
        cursor = x
        for i, ch in enumerate(text):
            sp = sps[i]
            if sp is None:
                cursor += space
                continue
            canvas.paste(sp, (cursor, baseline - sp.height), sp)
            if ch in DERIVED_LETTERS or ch in DERIVED_DIGITS:
                marks.append((ch, cursor + sp.width // 2, baseline, cap))
            cursor += sp.width
            if i < len(text) - 1 and text[i + 1] != ' ':
                cursor += gap

    for item in lines:
        kind = item[0]
        if kind == 'kicker':
            label = 'SITE 00  ·  CORRESPONDENCE'
            bbox = draw.textbbox((0, 0), label, font=font)
            draw.text(((W - (bbox[2] - bbox[0])) / 2, y), label, fill=(90, 90, 90), font=font)
            y += item[1]
        elif kind == 'sample':
            place(item[2], sample_cap, sample_gap, sample_space, INK, y)
            y += sample_cap
        elif kind == 'alpha':
            place(item[2], alpha_cap, alpha_gap, alpha_gap, INK, y)
            y += alpha_cap
        elif kind == 'nums':
            place(item[2], num_cap, num_gap, num_gap, RED, y)
            y += num_cap
        elif kind == 'rule':
            draw.rectangle([margin, y, W - margin, y + 1], fill=(220, 220, 220))
            y += 1
        elif kind == 'legend':
            note = 'A red square marks a character that was not in the email.'
            bbox = draw.textbbox((0, 0), note, font=font_sm)
            draw.text(((W - (bbox[2] - bbox[0])) / 2, y + 8), note, fill=(120, 120, 120), font=font_sm)
            y += item[1]
        elif kind == 'footer':
            note = '0 1 2 3 are traced from the red numerals. Everything else black is traced from the headlines.'
            bbox = draw.textbbox((0, 0), note, font=font_sm)
            draw.text(((W - (bbox[2] - bbox[0])) / 2, y), note, fill=(120, 120, 120), font=font_sm)
            y += item[1]
        else:
            y += item[1]

    # derived marks, drawn after so they sit on the paper
    for _ch, cx, baseline, cap in marks:
        s = max(6, cap // 28)
        draw.rectangle([cx - s // 2, baseline + s + 4, cx + s // 2, baseline + s + 4 + s], fill=RED)

    sheet = PACK / '09_REVIEW' / 'SHEET.png'
    canvas.save(sheet, optimize=True)
    # also a tight preview
    canvas.save(WORK / 'SHEET.png', optimize=True)
    print('sheet', canvas.size, sheet, 'bytes', sheet.stat().st_size)

    meta = {
        'traced_letters': sorted(TRACED_LETTERS),
        'derived_letters': sorted(DERIVED_LETTERS),
        'derived_letter_note': 'C J M P Q V X Z are not in the invitation. They are built from the traced O, U, W, R, A, K, and E. They are not source traces.',
        'traced_digits': ['0', '1', '2', '3'],
        'derived_digits': ['4', '5', '6', '7', '8', '9'],
        'gap_ratio': round(gap_ratio, 4),
        'sheet': '09_REVIEW/SHEET.png',
    }
    (PACK / '08_AUTHORITY' / 'specimen.json').write_text(json.dumps(meta, indent=2) + '\n')


if __name__ == '__main__':
    main()
