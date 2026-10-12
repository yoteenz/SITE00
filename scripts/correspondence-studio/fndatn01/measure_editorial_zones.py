#!/usr/bin/env python3
"""Measure FNDATN-01 hero text geometry from the founder authority.

Usage:
  python3 scripts/correspondence-studio/fndatn01/measure_editorial_zones.py

The cleaned hero art is the authority crop with the baked copy erased, so the per-pixel difference
between the two is exactly where the founder placed text. For every hero and device this writes, in
hero CSS pixels (680 x 300 desktop, 390 x H mobile):

  authority_lines   one box per approved text line (kicker, headline, body, tagline)
  authority_blocks  lines grouped by vertical gaps
  art_edge          per 10 px row band, the first x right of the copy column where the art becomes
                    busy (gradient energy) or dark, i.e. where readable ink-on-art ends

Output: docs/site00/correspondence/fndatn-01/FNDATN_01_EDITORIAL_ZONES_MEASURED.json
The authored zone contracts in shared/site00-correspondence-studio/fndatn01/zones.ts must stay inside
these measurements; tests/correspondenceEditorialZones.test.ts enforces it.
"""
import hashlib
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[3]
AUTH = ROOT / 'public/site00-correspondence-studio/fndatn-01/authority'
ASSETS = ROOT / 'public/site00-correspondence-studio/fndatn-01/assets'
OUT = ROOT / 'docs/site00/correspondence/fndatn-01/FNDATN_01_EDITORIAL_ZONES_MEASURED.json'


def heroes():
    src = (Path(__file__).parent / 'extract_assets.py').read_text()
    start = src.index('HEROES = {')
    end = src.index('\n}\n', start) + 3
    ns = {}
    exec(src[start:end], ns)
    return ns['HEROES']


def crop_rect(dev, cfg):
    if dev == 'desktop':
        y0, y1 = cfg['rows']
        w = round((y1 - y0) * 680 / 300)
        return (cfg['x1'] - w, y0, cfg['x1'], y1)
    return cfg['rect']


def lines_from_mask(mask, min_gap=2, min_h=3):
    rows = mask.any(axis=1)
    out = []
    y = 0
    h = len(rows)
    while y < h:
        if not rows[y]:
            y += 1
            continue
        y0 = y
        gap = 0
        while y < h and gap <= min_gap:
            gap = 0 if rows[y] else gap + 1
            y += 1
        y1 = y - gap
        if y1 - y0 >= min_h:
            cols = np.where(mask[y0:y1].any(axis=0))[0]
            out.append([int(cols.min()), int(y0), int(cols.max()) + 1, int(y1)])
    return out


def blocks_from_lines(lines, gap=9):
    blocks = []
    for ln in lines:
        if blocks and ln[1] - blocks[-1][3] <= gap:
            b = blocks[-1]
            blocks[-1] = [min(b[0], ln[0]), b[1], max(b[2], ln[2]), ln[3]]
        else:
            blocks.append(list(ln))
    return blocks


def art_edges(hero_gray, text_right, band=10, energy=26.0, dark=92):
    """First busy or dark column right of the copy for each row band (CSS px)."""
    gx = cv2.Sobel(hero_gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(hero_gray, cv2.CV_32F, 0, 1, ksize=3)
    mag = cv2.GaussianBlur(np.sqrt(gx * gx + gy * gy), (0, 0), 3)
    lum = cv2.GaussianBlur(hero_gray.astype(np.float32), (0, 0), 3)
    h, w = hero_gray.shape
    edges = []
    for y0 in range(0, h, band):
        y1 = min(h, y0 + band)
        e = mag[y0:y1].mean(axis=0)
        l = lum[y0:y1].mean(axis=0)
        busy = (e > energy) | (l < dark)
        x = text_right
        while x < w and not busy[x:x + 6].all():
            x += 1
        edges.append({'y0': y0, 'y1': y1, 'x': int(min(x, w))})
    return edges


def main():
    report = {'schema': 'SITE00_EDITORIAL_ZONES_MEASURED_V1', 'pack': 'FNDATN-01', 'units': 'hero CSS px', 'heroes': {}}
    for slug, devs in heroes().items():
        report['heroes'][slug] = {}
        for dev, cfg in devs.items():
            auth = cv2.imread(str(AUTH / slug / f'{dev}.jpg'))
            hero_path = ASSETS / slug / f'hero-{dev}.jpg'
            hero = cv2.imread(str(hero_path))
            x0, y0, x1, y1 = crop_rect(dev, cfg)
            crop = cv2.resize(auth[y0:y1, x0:x1], (hero.shape[1], hero.shape[0]), interpolation=cv2.INTER_AREA)
            diff = np.abs(crop.astype(np.int16) - hero.astype(np.int16)).max(axis=2) > 60
            # Only the baked copy boxes; card field quads are not editorial copy.
            sx = hero.shape[1] / (x1 - x0)
            sy = hero.shape[0] / (y1 - y0)
            keep = np.zeros_like(diff)
            for (bx0, by0, bx1, by1), _ in cfg['text']:
                cx0 = max(0, int((bx0 - x0) * sx))
                cy0 = max(0, int((by0 - y0) * sy))
                cx1 = min(hero.shape[1], int((bx1 - x0) * sx) + 1)
                cy1 = min(hero.shape[0], int((by1 - y0) * sy) + 1)
                keep[cy0:cy1, cx0:cx1] = True
            mask = cv2.morphologyEx((diff & keep).astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8)) > 0
            css_w, css_h = hero.shape[1] // 2, hero.shape[0] // 2
            small = cv2.resize(mask.astype(np.uint8), (css_w, css_h), interpolation=cv2.INTER_AREA) > 0
            lines = lines_from_mask(small)
            blocks = blocks_from_lines(lines)
            text_right = max((ln[2] for ln in lines), default=0)
            gray = cv2.cvtColor(cv2.resize(hero, (css_w, css_h), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
            report['heroes'][slug][dev] = {
                'hero_asset': f'assets/{slug}/hero-{dev}.jpg',
                'hero_sha256': hashlib.sha256(hero_path.read_bytes()).hexdigest(),
                'canvas': [css_w, css_h],
                'authority_lines': lines,
                'authority_blocks': blocks,
                'authority_text_right': int(text_right),
                'art_edge': art_edges(gray, int(text_right)),
            }
            print(f'{slug:26s} {dev:7s} lines={len(lines):2d} blocks={len(blocks)} text_right={text_right}')
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, indent=1) + '\n')
    print(f'wrote {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
