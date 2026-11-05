#!/usr/bin/env python3
"""
F05 DOT 01 — structural comparison of all 37 states against their V9 authority, BEFORE and AFTER, in the authority's
coordinate space at the capture's own scale.

Each probe capture (471 × 836, DSF 1: the board at u = 0.5346, cropped 30 board px each side as on every phone) is cut to
the board rect the probe recorded, and the authority is resized to the same board size. Then, over the part of the board
that is on screen:
  edge_recall      the share of authority edges (Sobel) that the capture reproduces within 2 px
  edge_precision   the share of capture edges that lie within 2 px of an authority edge
  mean_abs_diff    mean |capture − authority| over RGB (0–255)
Nothing is masked here (the live text is included, so a screen whose figures differ from the authority's sample figures
never reaches 1.0). The text-masked comparison of 02–05 is compare_dot01_account_scenes.py.

Run: python -I compare_dot01_all_screens.py --auth <authority dir> --before <probe dir> --after <probe dir> --out <dir>
"""
import argparse
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

W, H = 941, 1672


def edges(g):
    g = cv2.GaussianBlur(g, (3, 3), 0)
    m = cv2.magnitude(cv2.Sobel(g, cv2.CV_32F, 1, 0), cv2.Sobel(g, cv2.CV_32F, 0, 1))
    return m > 70


def metrics_for(rows, label, sid, vp):
    for r in rows:
        if r['id'] == sid and r['viewport'] == vp:
            return r
    return None


def compare(auth_png, cap_png, board):
    cap = np.array(Image.open(cap_png).convert('RGB')).astype(np.float32)
    bl, bt, bw, bh = board
    u = bw / W
    a = np.array(Image.open(auth_png).convert('RGB').resize((int(round(W * u)), int(round(H * u))), Image.LANCZOS)).astype(np.float32)
    # the board's pixels on the capture (board origin at bl, bt in css px; DSF 1); a negative origin means the board
    # starts off screen (cropped sides; an overlay scrolled by a few px), so the authority is cut by the same amount
    x0, y0 = max(0, int(round(-bl))), max(0, int(round(-bt)))
    sx0, sy0 = max(0, int(round(bl))), max(0, int(round(bt)))
    w = min(a.shape[1] - x0, cap.shape[1] - sx0)
    h = min(a.shape[0] - y0, cap.shape[0] - sy0)
    ca = a[y0:y0 + h, x0:x0 + w]
    cc = cap[sy0:sy0 + h, sx0:sx0 + w]
    ea, ec = edges(ca.mean(2)), edges(cc.mean(2))
    k = np.ones((5, 5), np.uint8)
    rec = float((ea & (cv2.dilate(ec.astype(np.uint8), k) > 0)).sum() / max(1, ea.sum()))
    pre = float((ec & (cv2.dilate(ea.astype(np.uint8), k) > 0)).sum() / max(1, ec.sum()))
    mad = float(np.abs(cc - ca).mean())
    return dict(edge_recall=round(rec, 4), edge_precision=round(pre, 4), mean_abs_diff=round(mad, 2), compared_px=[int(w), int(h)])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--auth', required=True)
    ap.add_argument('--before', required=True)
    ap.add_argument('--after', required=True)
    ap.add_argument('--before-metrics', required=True)
    ap.add_argument('--after-metrics', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--viewport', default='471x836')
    a = ap.parse_args()
    auth = sorted(p for p in Path(a.auth).glob('[0-3][0-9]_*.png'))
    bm = [json.loads(l) for l in Path(a.before_metrics).read_text().splitlines() if l.strip()]
    am = [json.loads(l) for l in Path(a.after_metrics).read_text().splitlines() if l.strip()]
    out = dict(method=__doc__.strip().split('\n\n')[1], viewport=a.viewport, screens={})
    for p in auth:
        sid = p.name[:2]
        row = dict(authority=p.name)
        for label, d, m in (('before', a.before, bm), ('after', a.after, am)):
            cap = Path(d) / f'{sid}-{a.viewport}.png'
            r = metrics_for(m, label, sid, a.viewport)
            if cap.exists() and r and r.get('board'):
                row[label] = compare(p, cap, r['board'])
        if 'before' in row and 'after' in row:
            row['delta_recall'] = round(row['after']['edge_recall'] - row['before']['edge_recall'], 4)
            row['delta_precision'] = round(row['after']['edge_precision'] - row['before']['edge_precision'], 4)
            row['delta_mad'] = round(row['after']['mean_abs_diff'] - row['before']['mean_abs_diff'], 2)
        out['screens'][sid] = row
        print(sid, json.dumps({k: row.get(k) for k in ('before', 'after', 'delta_recall')}))
    Path(a.out).mkdir(parents=True, exist_ok=True)
    (Path(a.out) / 'compare_all_37.json').write_text(json.dumps(out, indent=1) + '\n')


if __name__ == '__main__':
    main()
