#!/usr/bin/env python3
"""
F05 MONEY carousel — paper art for collections 02 (transfers), 03 (commitments) and 04 (outlook).

Inputs: the founder's carousel screens (941 x 1672 RGB, no alpha), separate renders of one parent design. Only their
four papers are used. The shell (statue, arch, title paper, band, panel, nav paper) is NOT taken from these screens;
every collection is drawn on the one shared SIDEKICK (extract_layers_9x16.py), so the environment never changes.

Per paper: rect fitted with GrabCut (left / top / bottom; width 404 like every paper in the set), exact rounded-rect
alpha (r = 20), text and chevron removed only inside measured text boxes and only where dark ink lies on light
parchment (the art is never touched), then resampled to the SIDEKICK slot size (<= 2 % scale).

Deterministic (fixed seed, no generative fill).
"""

import argparse
import json
import os
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extract_layers as X  # noqa: E402

PAPER_W = 404
RADIUS = 20
SLOT = {  # SIDEKICK slots (x0, y0, x1, y1): the papers land exactly here at rest
    0: (54, 794, 458, 988),
    1: (485, 794, 889, 990),
    2: (53, 1014, 456, 1226),
    3: (486, 1016, 890, 1228),
}
# Per screen: per slot (left, top, bottom) fitted with GrabCut, and the text boxes measured on the screen.
SCREENS = {
    'transfers': {
        'rects': [(54, 791, 982), (484, 791, 982), (54, 1007, 1216), (484, 1008, 1217)],
        'text': [[(70, 800, 268, 945)], [(500, 800, 690, 965)], [(70, 1030, 280, 1185)], [(500, 1030, 702, 1185)]],
        'names': ['in_transit', 'pending', 'scheduled', 'recent'],
    },
    'commitments': {
        'rects': [(52, 788, 988), (484, 793, 987), (52, 1012, 1224), (486, 1012, 1224)],
        'text': [[(70, 800, 302, 980)], [(500, 800, 660, 980)], [(70, 1030, 272, 1210)], [(500, 1035, 688, 1200)]],
        'names': ['bills', 'savings', 'upcoming', 'reserved'],
    },
    'outlook': {
        'rects': [(55, 789, 981), (485, 790, 982), (53, 1007, 1217), (485, 1007, 1217)],
        'text': [[(70, 800, 240, 975)], [(500, 800, 655, 975)], [(70, 1025, 262, 1180)], [(500, 1025, 690, 1180)]],
        'names': ['safe_to_spend', 'next_income', 'forecast', 'insights'],
    },
}


def paper(img, left, top, bottom, text_boxes, seed):
    shape = img.shape
    rect = (left, top, left + PAPER_W, bottom)
    rm = X.rounded_rect_mask(shape, rect, RADIUS)
    inside = (rm > 250).astype(np.uint8) * 255
    bgL = cv2.medianBlur(X.lab_L(img).clip(0, 255).astype(np.uint8), 31)
    light = (bgL > 150).astype(np.uint8) * 255
    ink = np.zeros(shape[:2], np.uint8)
    for b in text_boxes:
        ink |= X.ink_mask(img, b, dark=True, thr=9, dil=7)
    # the chevron on the torn corner paper (bottom right)
    chev = X.ink_mask(img, (left + 352, bottom - 78, left + 398, bottom - 14), dark=True, thr=12, dil=5)
    m = cv2.bitwise_and(cv2.bitwise_and(ink | chev, inside), light)
    x0, y0, x1, y1 = rect
    excl = cv2.dilate(m, np.ones((9, 9), np.uint8)) | cv2.bitwise_not(cv2.erode(inside, np.ones((21, 21), np.uint8)))
    region = X.box_mask(shape, (x0, y0, x0 + 250, y1))
    med = np.median(img[y0 + 20:y1 - 20, x0 + 20:x0 + 120].reshape(-1, 3).astype(np.float32), axis=0)
    donor = ((np.linalg.norm(img.astype(np.float32) - med, axis=2) < 26) & (region > 0) & (excl == 0)).astype(np.uint8) * 255
    clean = X.synth_fill(img, m, donor, seed_offset=seed, P=8)
    layer, box = X.crop_rgba(clean, rm)
    return layer, box, int(np.count_nonzero(m))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--transfers', required=True)
    ap.add_argument('--commitments', required=True)
    ap.add_argument('--outlook', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--qa', required=True)
    ap.add_argument('--geometry', help='F05_MOTION_GEOMETRY.json: land the papers in its card rects (default: the V2 slots)')
    a = ap.parse_args()
    if a.geometry:
        g = json.load(open(a.geometry))
        for i, k in enumerate(('card_bank', 'card_payout', 'card_cash', 'card_credit')):
            SLOT[i] = tuple(round(v) for v in g[k]['rect'])
    os.makedirs(a.out, exist_ok=True)
    os.makedirs(a.qa, exist_ok=True)
    report = {'seed': X.SEED, 'papers': {}}
    sheets = []
    for coll, path in (('transfers', a.transfers), ('commitments', a.commitments), ('outlook', a.outlook)):
        img = cv2.imread(path, cv2.IMREAD_COLOR)
        assert img is not None and img.shape[:2] == (1672, 941), f'{coll}: expected 941 x 1672'
        spec = SCREENS[coll]
        row = []
        for i, ((left, top, bottom), boxes, name) in enumerate(zip(spec['rects'], spec['text'], spec['names'])):
            layer, box, removed = paper(img, left, top, bottom, boxes, seed=40 + i + 10 * len(coll))
            sx0, sy0, sx1, sy1 = SLOT[i]
            # crop_rgba pads 2 px around the rect: resample the whole layer so its rect lands on the slot rect
            w_rect, h_rect = PAPER_W, bottom - top
            sw, sh = sx1 - sx0, sy1 - sy0
            kx, ky = sw / w_rect, sh / h_rect
            out = cv2.resize(layer, (round(layer.shape[1] * kx), round(layer.shape[0] * ky)), interpolation=cv2.INTER_CUBIC)
            out[..., 3] = np.clip(out[..., 3], 0, 255)
            fname = f'F05_PAPER_{coll.upper()}_{name.upper()}.webp'
            cv2.imwrite(os.path.join(a.out, fname), out, [cv2.IMWRITE_WEBP_QUALITY, 92])
            cv2.imwrite(os.path.join(a.qa, f'paper_{coll}_{name}.png'), out)
            report['papers'][f'{coll}.{name}'] = {
                'file': fname, 'source_rect': [left, top, left + PAPER_W, bottom], 'slot': list(SLOT[i]),
                'scale': [round(kx, 4), round(ky, 4)], 'text_px_reconstructed': removed, **X.qa_alpha(f'{coll}_{name}', out, a.qa),
            }
            a3 = out[..., 3:4].astype(np.float32) / 255
            row.append((out[..., :3] * a3 + np.array([60, 80, 90]) * (1 - a3)).astype(np.uint8))
        h = max(r.shape[0] for r in row)
        sheets.append(np.hstack([cv2.copyMakeBorder(r, 0, h - r.shape[0], 0, 8, cv2.BORDER_CONSTANT, value=(255, 255, 255)) for r in row]))
    wmax = max(s.shape[1] for s in sheets)
    cv2.imwrite(os.path.join(a.qa, 'carousel_papers_contact.png'), np.vstack([cv2.copyMakeBorder(s, 0, 8, 0, wmax - s.shape[1], cv2.BORDER_CONSTANT, value=(255, 255, 255)) for s in sheets]))
    with open(os.path.join(a.qa, 'carousel_papers_report.json'), 'w') as fh:
        json.dump(report, fh, indent=2)
    print(json.dumps({k: {x: v[x] for x in ('scale', 'text_px_reconstructed')} for k, v in report['papers'].items()}, indent=1))


if __name__ == '__main__':
    main()
