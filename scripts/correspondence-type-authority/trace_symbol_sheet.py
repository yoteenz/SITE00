#!/usr/bin/env python3
"""Trace the founder symbol sheet and paint the period dots red.

The marks are the pixels on the sheet. Nothing is redrawn. A dot is red when
it is a period: the standalone period, the base of ! and ?, both colon dots,
the semicolon dot, the comma head, and the three ellipsis dots. Tails, stems,
and every other mark stay black.
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
PACK = ROOT / 'public/site00-correspondence-type-authority/v1'
SRC = Path('/home/ubuntu/.cursor/projects/workspace/assets/01a12fd5-a5b8-7e05-93de-64c6cc07d282.jpg')
OUT = PACK / '12_SYMBOL_TRACE'
SHEET = PACK / '09_REVIEW/SYMBOLS.png'
WORK = Path('/tmp/site00-symbol-trace')
INK = (17, 17, 17)
RED = (206, 16, 23)
# Parenthesis height on the sheet. That is the cap.
CAP_PX = 245

# Reading order, one tuple of characters per row.
ROWS = [
    list('!?.,:;\'"'),
    list('()[]{}') + ['/', '\\'],
    ['-', '–', '—', '_', '+', '='],
    list('&@#$%*'),
    ['•', '…', '|', '<', '>'],
]


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


def potrace(mask: np.ndarray, svg_path: Path) -> None:
    svg_path.parent.mkdir(parents=True, exist_ok=True)
    pbm = svg_path.with_suffix('.pbm')
    write_pbm(pbm, mask)
    subprocess.check_call(
        ['potrace', '-s', '--alphamax', '0.6', '--opttolerance', '0.2', '--turdsize', '2', '-o', str(svg_path), str(pbm)],
        stdout=subprocess.DEVNULL,
    )
    pbm.unlink(missing_ok=True)


def render(svg: Path, w: int, h: int) -> np.ndarray:
    png = WORK / f'{svg.stem}-{w}x{h}.png'
    subprocess.check_call(
        ['rsvg-convert', '-w', str(max(w, 1)), '-h', str(max(h, 1)), '-o', str(png), str(svg)],
        stdout=subprocess.DEVNULL,
    )
    rgba = np.asarray(Image.open(png).convert('RGBA'))
    if rgba.shape[1] != w or rgba.shape[0] != h:
        rgba = np.asarray(Image.fromarray(rgba).resize((w, h), Image.Resampling.LANCZOS))
    return rgba


def iou(a: np.ndarray, b: np.ndarray) -> float:
    inter = np.logical_and(a, b).sum()
    union = np.logical_or(a, b).sum()
    return float(inter / union) if union else 1.0


def components(mask: np.ndarray) -> list[dict]:
    n, labels, stats, cent = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    rows = []
    for i in range(1, n):
        x, y, w, h, area = (int(v) for v in stats[i])
        if area < 400:
            continue
        rows.append({
            'x': x, 'y': y, 'w': w, 'h': h, 'area': area,
            'cx': int(cent[i][0]), 'cy': int(cent[i][1]),
            'label': i, 'labels': labels,
        })
    return rows


def crop(labels: np.ndarray, label: int, box: tuple[int, int, int, int]) -> np.ndarray:
    x, y, w, h = box
    return labels[y:y + h, x:x + w] == label


def row_index(cy: int) -> int:
    if cy < 370:
        return 0
    if cy < 660:
        return 1
    if cy < 840:
        return 2
    if cy < 1140:
        return 3
    return 4


def is_dot(comp: dict) -> bool:
    w, h, area = comp['w'], comp['h'], comp['area']
    ratio = max(w, h) / max(1, min(w, h))
    return area < 2200 and ratio < 1.45 and min(w, h) > 24


def split_tail(mask: np.ndarray) -> tuple[np.ndarray, np.ndarray] | None:
    """A comma is a square period with a narrower tail. Keep the square as the dot."""
    widths = mask.sum(axis=1)
    if widths.size < 40 or widths.max() < 20:
        return None
    full = float(np.percentile(widths[widths > 0], 90))
    cut = None
    for i, w in enumerate(widths):
        if w < full * 0.6:
            cut = i
            break
    if cut is None or cut < 24 or mask.shape[0] - cut < 12:
        return None
    if max(cut, mask.shape[1]) / max(1, min(cut, mask.shape[1])) > 1.45:
        return None
    head = mask.copy()
    tail = mask.copy()
    head[cut:] = False
    tail[:cut] = False
    if head.sum() < 200 or tail.sum() < 80:
        return None
    return head, tail


def cluster(comps: list[dict]) -> list[list[dict]]:
    rows: list[list[dict]] = [[] for _ in ROWS]
    for comp in comps:
        rows[row_index(comp['cy'])].append(comp)
    glyphs = []
    for row in rows:
        row.sort(key=lambda c: c['x'])
        groups: list[list[dict]] = []
        for comp in row:
            if not groups:
                groups.append([comp])
                continue
            prev = groups[-1]
            px1 = max(p['x'] + p['w'] for p in prev)
            gap = comp['x'] - px1
            overlap = min(comp['x'] + comp['w'], px1) - max(comp['x'], min(p['x'] for p in prev))
            if gap < 28 or overlap > 0:
                groups[-1].append(comp)
            else:
                groups.append([comp])
        glyphs.append(groups)
    return glyphs


def union_mask(group: list[dict]) -> tuple[np.ndarray, tuple[int, int, int, int]]:
    x0 = min(c['x'] for c in group)
    y0 = min(c['y'] for c in group)
    x1 = max(c['x'] + c['w'] for c in group)
    y1 = max(c['y'] + c['h'] for c in group)
    mask = np.zeros((y1 - y0, x1 - x0), dtype=bool)
    for comp in group:
        part = crop(comp['labels'], comp['label'], (comp['x'], comp['y'], comp['w'], comp['h']))
        mask[comp['y'] - y0:comp['y'] - y0 + comp['h'], comp['x'] - x0:comp['x'] - x0 + comp['w']] |= part
    return mask, (x0, y0, x1 - x0, y1 - y0)


def redact(mask: np.ndarray, group: list[dict], origin: tuple[int, int]) -> tuple[np.ndarray, np.ndarray]:
    """Return red-dot and black-body masks inside the glyph box."""
    ox, oy = origin
    red = np.zeros_like(mask)
    black = np.zeros_like(mask)
    for comp in group:
        part = crop(comp['labels'], comp['label'], (comp['x'], comp['y'], comp['w'], comp['h']))
        local = np.zeros_like(mask)
        y, x = comp['y'] - oy, comp['x'] - ox
        local[y:y + comp['h'], x:x + comp['w']] = part
        if is_dot(comp):
            red |= local
            continue
        split = split_tail(part)
        if split is not None:
            head, tail = split
            red[y:y + comp['h'], x:x + comp['w']] |= head
            black[y:y + comp['h'], x:x + comp['w']] |= tail
            continue
        black |= local
    return red, black


def valign_for(ch: str) -> str:
    if ch in '-–—+=•|<>':
        return 'center'
    if ch == '_':
        return 'below'
    return 'baseline'


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    WORK.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SRC, OUT / 'source.jpg')
    gray = np.asarray(Image.open(SRC).convert('L'))
    ink = gray < 128
    comps = components(ink)
    grouped = cluster(comps)
    if [len(g) for g in grouped] != [len(r) for r in ROWS]:
        raise SystemExit(f'glyph counts {[len(g) for g in grouped]} != {[len(r) for r in ROWS]}')

    # Baselines, in source pixels, for the rows whose marks sit on a shared line.
    # Row 1: bottom of the period dots. Row 2: parenthesis bottom. Row 4: ampersand bottom.
    row_baseline = {}
    records = []
    pieces = []
    for row_i, (groups, chars) in enumerate(zip(grouped, ROWS)):
        for group, ch in zip(groups, chars):
            mask, (x, y, w, h) = union_mask(group)
            red, black = redact(mask, group, (x, y))
            if red.sum() + black.sum() == 0:
                raise SystemExit(f'empty {ch}')
            slug = f'u{ord(ch):04X}'
            svg = OUT / 'svg' / f'{slug}.svg'
            potrace(mask, svg)
            recon = render(svg, w, h)
            score = iou(recon[..., 3] > 128, mask)
            red_svg = black_svg = None
            if red.any():
                red_svg = OUT / 'svg' / f'{slug}-dot.svg'
                potrace(red, red_svg)
            if black.any():
                black_svg = OUT / 'svg' / f'{slug}-body.svg'
                potrace(black, black_svg)
            records.append({
                'char': ch,
                'cp': ord(ch),
                'row': row_i,
                'svg': str(svg.relative_to(PACK)),
                'x': x, 'y': y, 'w': w, 'h': h,
                'iou': round(score, 4),
                'has_dot': bool(red.any()),
                'valign': valign_for(ch),
            })
            pieces.append((ch, x, y, w, h, red_svg, black_svg, svg, score))
            print(f'{ch!r} iou {score:.4f} box {w}x{h} dot {bool(red.any())} valign {valign_for(ch)}')

    # Baselines from the traced boxes.
    by_char = {rec['char']: rec for rec in records}
    row_baseline[0] = by_char['.']['y'] + by_char['.']['h']
    row_baseline[1] = by_char['(']['y'] + by_char['(']['h']
    row_baseline[3] = by_char['&']['y'] + by_char['&']['h']
    row_baseline[4] = by_char['…']['y'] + by_char['…']['h']
    for rec in records:
        if rec['valign'] != 'baseline':
            rec['baseline_from_bottom_px'] = 0
            continue
        base = row_baseline[rec['row']]
        rec['baseline_from_bottom_px'] = (rec['y'] + rec['h']) - base
    meta = {'cap_px': CAP_PX, 'source': str(SRC.name), 'glyphs': records}
    (OUT / 'metrics.json').write_text(json.dumps(meta, indent=2, ensure_ascii=False))
    worst = min(records, key=lambda r: r['iou'])
    print(f'mean iou {sum(r["iou"] for r in records)/len(records):.4f} worst {worst["char"]!r} {worst["iou"]}')

    # Specimen in the sheet's own arrangement.
    xs = [p[1] for p in pieces]
    ys = [p[2] for p in pieces]
    x1 = max(p[1] + p[3] for p in pieces)
    y1 = max(p[2] + p[4] for p in pieces)
    margin = 90
    inner = 1240
    scale = inner / (x1 - min(xs))
    width = 1400
    height = int(margin + 36 + (y1 - min(ys)) * scale + margin)
    canvas = Image.new('RGBA', (width, height), (255, 255, 255, 255))
    ox = (width - inner) / 2 - min(xs) * scale
    oy = margin + 28 - min(ys) * scale
    for _ch, x, y, w, h, red_svg, black_svg, svg, _score in pieces:
        dx, dy = int(round(ox + x * scale)), int(round(oy + y * scale))
        sw, sh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
        layers = []
        if black_svg is not None:
            layers.append((black_svg, INK))
        elif red_svg is None:
            layers.append((svg, INK))
        if red_svg is not None:
            layers.append((red_svg, RED))
        for layer, color in layers:
            rgba = render(layer, sw, sh)
            tint = np.zeros_like(rgba)
            tint[..., 0] = color[0]
            tint[..., 1] = color[1]
            tint[..., 2] = color[2]
            tint[..., 3] = rgba[..., 3]
            canvas.alpha_composite(Image.fromarray(tint, 'RGBA'), (dx, dy))
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
    caption = 'TRACED SYMBOLS  ·  PERIOD DOTS RED'
    tracking = 1.4
    widths = [font.getlength(c) + tracking for c in caption]
    tx = (width - (sum(widths) - tracking)) / 2
    for c, tw in zip(caption, widths):
        draw.text((tx, 28), c, font=font, fill=(120, 120, 120))
        tx += tw
    rgb = Image.new('RGB', canvas.size, (255, 255, 255))
    rgb.paste(canvas, mask=canvas.split()[-1])
    rgb.save(SHEET, 'PNG')
    art = Path('/opt/cursor/artifacts/symbol-specimen.png')
    rgb.save(art, 'PNG')
    print(rgb.size, SHEET)


if __name__ == '__main__':
    main()
