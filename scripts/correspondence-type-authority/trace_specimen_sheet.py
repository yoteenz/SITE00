#!/usr/bin/env python3
"""Trace the founder specimen sheet. Every letter and numeral on that sheet is visible.

Heavy caps, light caps, and the red numerals are traced from the sheet pixels.
Nothing on this sheet is derived.
"""
from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PACK = ROOT / 'public/site00-correspondence-type-authority/v1'
SRC = Path('/home/ubuntu/.cursor/projects/workspace/assets/01a12e69-aad9-707a-9b32-f5330b83498c.jpg')
OUT = PACK / '11_SPECIMEN_TRACE'
WORK = Path('/tmp/site00-specimen-trace')
ALPHAMAX = '0.6'
HEAVY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
RED = (220, 3, 12)
BLACK = (12, 12, 12)


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


def potrace(mask: np.ndarray, svg_path: Path, fill: str) -> None:
    svg_path.parent.mkdir(parents=True, exist_ok=True)
    pbm = svg_path.with_suffix('.pbm')
    write_pbm(pbm, mask)
    subprocess.check_call(
        ['potrace', '-s', '--alphamax', ALPHAMAX, '--opttolerance', '0.2', '--turdsize', '2', '-o', str(svg_path), str(pbm)],
        stdout=subprocess.DEVNULL,
    )
    pbm.unlink(missing_ok=True)
    text = svg_path.read_text()
    text = text.replace('fill="#000000"', f'fill="{fill}"')
    # potrace 1.16 emits fill on the group
    if f'fill="{fill}"' not in text:
        text = text.replace('fill="#000000"', f'fill="{fill}"')
        text = text.replace('<g ', f'<g fill="{fill}" ', 1) if 'fill=' not in text.split('<g ', 1)[-1][:80] else text
    svg_path.write_text(text)


def render(svg: Path, w: int, h: int) -> np.ndarray:
    png = WORK / (svg.stem + f'-{w}x{h}.png')
    subprocess.check_call(['rsvg-convert', '-w', str(w), '-h', str(h), '-o', str(png), str(svg)], stdout=subprocess.DEVNULL)
    rgba = np.asarray(Image.open(png).convert('RGBA'))
    if rgba.shape[0] != h or rgba.shape[1] != w:
        rgba = np.asarray(Image.fromarray(rgba).resize((w, h), Image.Resampling.BILINEAR))
    return rgba


def iou(a: np.ndarray, b: np.ndarray) -> float:
    inter = np.logical_and(a, b).sum()
    union = np.logical_or(a, b).sum()
    return float(inter / union) if union else 1.0


def components(mask: np.ndarray, min_area: int) -> list[dict]:
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    rows = []
    for i in range(1, n):
        x, y, w, h, area = (int(v) for v in stats[i])
        if area < min_area:
            continue
        rows.append({'x': x, 'y': y, 'w': w, 'h': h, 'area': area, 'label': i, 'labels': labels})
    return rows


def glyph_mask(labels: np.ndarray, label: int, box: tuple[int, int, int, int]) -> np.ndarray:
    x, y, w, h = box
    return labels[y:y + h, x:x + w] == label


def attach_descenders(glyphs: list[dict], orphans: list[dict], labels: np.ndarray) -> list[dict]:
    """A Q tail can threshold as its own component. Join it to the letter above."""
    for orphan in orphans:
        ox, oy, ow, oh = orphan['x'], orphan['y'], orphan['w'], orphan['h']
        host = None
        best = 1e9
        for g in glyphs:
            gap = oy - (g['y'] + g['h'])
            overlap = min(ox + ow, g['x'] + g['w']) - max(ox, g['x'])
            if gap < -4 or gap > 20 or overlap < ow * 0.4:
                continue
            if gap < best:
                best = gap
                host = g
        if host is None:
            continue
        x0 = min(host['x'], ox)
        y0 = min(host['y'], oy)
        x1 = max(host['x'] + host['w'], ox + ow)
        y1 = max(host['y'] + host['h'], oy + oh)
        crop_labels = labels[y0:y1, x0:x1]
        mask = (crop_labels == host['label']) | (crop_labels == orphan['label'])
        host.update({'x': x0, 'y': y0, 'w': x1 - x0, 'h': y1 - y0, 'mask': mask, 'joined_tail': True})
    return glyphs


def row_glyphs(mask: np.ndarray, alphabet: str) -> list[dict]:
    labels_img = None
    comps = components(mask, 400)
    if not comps:
        return []
    # rebuild labels once
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    glyphs = []
    orphans = []
    heights = [int(stats[i, cv2.CC_STAT_HEIGHT]) for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] >= 400]
    typical = int(np.median(heights))
    for i in range(1, n):
        x, y, w, h, area = (int(v) for v in stats[i])
        if area < 400:
            continue
        item = {'x': x, 'y': y, 'w': w, 'h': h, 'area': area, 'label': i}
        if h < typical * 0.45:
            orphans.append(item)
        else:
            glyphs.append(item)
    glyphs = attach_descenders(glyphs, orphans, labels)
    glyphs.sort(key=lambda g: (g['y'], g['x']))
    # split into rows by a vertical gap
    rows: list[list[dict]] = []
    for g in glyphs:
        if not rows or g['y'] > rows[-1][0]['y'] + rows[-1][0]['h'] * 0.45:
            rows.append([g])
        else:
            rows[-1].append(g)
    for row in rows:
        row.sort(key=lambda g: g['x'])
    flat = [g for row in rows for g in row]
    if len(flat) != len(alphabet):
        raise SystemExit(f'expected {len(alphabet)} glyphs, found {len(flat)}: {[ (g["x"], g["y"], g["w"], g["h"]) for g in flat ]}')
    for g, ch in zip(flat, alphabet):
        g['char'] = ch
        x, y, w, h = g['x'], g['y'], g['w'], g['h']
        if 'mask' not in g:
            g['mask'] = labels[y:y + h, x:x + w] == g['label']
    return flat


def trace_group(glyphs: list[dict], folder: Path, fill: str, role: str) -> list[dict]:
    records = []
    for g in glyphs:
        ch = g['char']
        svg = folder / f'{ch}.svg'
        potrace(g['mask'], svg, fill)
        rgba = render(svg, g['w'], g['h'])
        got = rgba[:, :, 3] > 128
        score = iou(g['mask'], got)
        records.append({
            'char': ch,
            'role': role,
            'status': 'source-traced',
            'box': [g['x'], g['y'], g['x'] + g['w'], g['y'] + g['h']],
            'width': g['w'],
            'height': g['h'],
            'iou': round(score, 4),
            'joined_tail': bool(g.get('joined_tail')),
            'svg': str(svg.relative_to(PACK)),
        })
        print(f'  {role} {ch} {g["w"]}x{g["h"]} IoU {score:.4f}' + (' tail' if g.get('joined_tail') else ''))
    return records


def paste_group(canvas: Image.Image, glyphs: list[dict], folder: Path, color: tuple[int, int, int]) -> None:
    for g in glyphs:
        rgba = render(folder / f'{g["char"]}.svg', g['w'], g['h'])
        sprite = np.zeros_like(rgba)
        sprite[:, :, 0] = color[0]
        sprite[:, :, 1] = color[1]
        sprite[:, :, 2] = color[2]
        sprite[:, :, 3] = rgba[:, :, 3]
        canvas.paste(Image.fromarray(sprite), (g['x'], g['y']), Image.fromarray(sprite))


def main() -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / 'heavy').mkdir(parents=True)
    (OUT / 'light').mkdir(parents=True)
    (OUT / 'numerals').mkdir(parents=True)
    raw = SRC.read_bytes()
    (OUT / 'source.jpg').write_bytes(raw)
    im = np.asarray(Image.open(SRC).convert('RGB'))
    h, w = im.shape[:2]
    gray = im.mean(axis=2)
    red = (im[:, :, 0] > 160) & (im[:, :, 1] < 90) & (im[:, :, 2] < 90)
    black = (gray < 128) & ~red
    print('heavy+light')
    letters = row_glyphs(black, HEAVY + HEAVY)
    heavy = letters[:26]
    light = letters[26:]
    print('numerals')
    digits = row_glyphs(red, '0123456789')
    heavy_recs = trace_group(heavy, OUT / 'heavy', '#0c0c0c', 'heavy')
    light_recs = trace_group(light, OUT / 'light', '#0c0c0c', 'light')
    digit_recs = trace_group(digits, OUT / 'numerals', '#dc030c', 'numeral')
    records = heavy_recs + light_recs + digit_recs
    mean = float(np.mean([r['iou'] for r in records]))
    worst = min(records, key=lambda r: r['iou'])
    print(f'mean IoU {mean:.4f} worst {worst["role"]} {worst["char"]} {worst["iou"]}')

    canvas = Image.new('RGBA', (w, h), (255, 255, 255, 255))
    paste_group(canvas, heavy, OUT / 'heavy', BLACK)
    paste_group(canvas, light, OUT / 'light', BLACK)
    paste_group(canvas, digits, OUT / 'numerals', RED)
    sheet = PACK / '09_REVIEW' / 'SHEET.png'
    canvas.convert('RGB').save(sheet, optimize=True)
    canvas.convert('RGB').save(OUT / 'SHEET.png', optimize=True)

    # difference against the source ink
    src_ink = black | red
    vec = np.asarray(canvas)
    vec_ink = vec[:, :, 3] > 128
    # the vector paste is opaque white around glyphs; ink is the nonwhite
    vec_rgb = np.asarray(canvas.convert('RGB'))
    vec_ink = vec_rgb.mean(axis=2) < 200
    diff = np.full((h, w, 3), 255, np.uint8)
    only_src = src_ink & ~vec_ink
    only_vec = vec_ink & ~src_ink
    diff[only_src] = (220, 40, 40)
    diff[only_vec] = (30, 70, 220)
    Image.fromarray(diff).save(OUT / 'difference.png', optimize=True)
    print('diff src-only', int(only_src.sum()), 'vec-only', int(only_vec.sum()), 'union', int((src_ink | vec_ink).sum()))

    meta = {
        'source': 'founder specimen sheet attached 2026-10-12',
        'file': '11_SPECIMEN_TRACE/source.jpg',
        'sha256': hashlib.sha256(raw).hexdigest(),
        'dimensions': [w, h],
        'note': 'Heavy A–Z, light A–Z, and red 0–9 are traced from this sheet. No letter on this sheet is derived.',
        'mean_iou': round(mean, 4),
        'worst': worst,
        'glyphs': records,
    }
    (OUT / 'metrics.json').write_text(json.dumps(meta, indent=2) + '\n')
    (PACK / '08_AUTHORITY' / 'specimen.json').write_text(json.dumps({
        'authority': '11_SPECIMEN_TRACE/source.jpg',
        'sha256': meta['sha256'],
        'dimensions': [w, h],
        'heavy': '11_SPECIMEN_TRACE/heavy/A.svg through Z.svg',
        'light': '11_SPECIMEN_TRACE/light/A.svg through Z.svg',
        'numerals': '11_SPECIMEN_TRACE/numerals/0.svg through 9.svg',
        'mean_iou': meta['mean_iou'],
        'derived_letters': [],
        'note': 'The specimen sheet replaced the earlier derived C J M P Q V X Z and derived 4–9. Every glyph on the sheet is a source trace.',
    }, indent=2) + '\n')
    print('wrote', sheet, sheet.stat().st_size)


if __name__ == '__main__':
    main()
