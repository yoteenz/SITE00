#!/usr/bin/env python3
"""
F05 DOT 01 — reproducible pixel comparison of the account pages (02–05) against their V9 authorities, in the authority's
own coordinate space (941 × 1672).

A capture is taken at a viewport whose board shows the authority 1:1 in width (471 × 836 at DSF 2: u = 0.5346, the board
cropped 30 px each side as on every phone). Each capture is mapped back into authority px with the board rect the page
reports (rects.json from the capture script), then compared on three levels:

  1  LIVE TEXT    for every live-text box (label, figure, summary rows, strip labels) the tight glyph box is found in the
                  authority and in the runtime with the same detector (light glyphs on the olive ground / ink on paper),
                  and the left / top / right / bottom offsets and the cap-height ratio are reported.
  2  STRUCTURE    a Sobel edge map of both, outside the live-text boxes only; the share of authority edges that the
                  runtime reproduces within 3 px (edge recall) and the reverse (edge precision), per region (scene band,
                  action rows, heading).
  3  DIFF MAP     |runtime − authority| (mean of RGB) outside the live-text boxes, as a heat image, plus the mean.

Only the live-text boxes are masked; no illustration or structural region is excluded.

Run: python -I compare_dot01_account_scenes.py --auth <authority dir> --cap <capture dir> --scenes <F05_DOT01_SCENES.json> --out <dir>
"""
import argparse
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

AUTH = {'02': '02_BANK_ACCOUNT.png', '03': '03_RIDESHARE_CARD.png', '04': '04_CASH_ON_HAND.png', '05': '05_CREDIT_CARD.png'}
W, H = 941, 1672
VISIBLE_X = (30, 911)

# Live-text boxes on 02 (SK02 geometry; the bank page is unchanged by this sprint) and the strip-label boxes of every
# page, measured on the authorities. Boxes are [x0, y0, x1, y1, mode].
TEXT_02 = [[88, 628, 410, 718, 'dark', 'label'], [80, 722, 420, 800, 'dark', 'value'],
           [520, 630, 660, 666, 'dark', 'stat-1-label'], [800, 626, 884, 668, 'dark', 'stat-1-value'],
           [520, 708, 640, 744, 'dark', 'stat-2-label'], [840, 704, 884, 746, 'dark', 'stat-2-value'],
           [520, 786, 680, 822, 'dark', 'stat-3-label'], [840, 782, 884, 824, 'dark', 'stat-3-value']]
STRIP_LABEL = {'02': [[1149, 1286], [1272, 1419], [1405, 1548]],
               '03': [[1180, 1312], [1325, 1457], [1470, 1610]],
               '04': [[1140, 1260], [1262, 1382], [1384, 1504], [1505, 1627]],
               '05': [[1040, 1158], [1162, 1282], [1288, 1408], [1415, 1537]]}
STRIP_LABEL_X = {'02': (330, 760), '03': (340, 760), '04': (330, 780), '05': (330, 780)}


def glyph_box(rgb, box, mode):
    x0, y0, x1, y1 = box
    sub = rgb[y0:y1, x0:x1].mean(2)
    if mode == 'light':
        hit = sub > max(np.percentile(sub, 35) + 45, 105)
    else:
        hit = sub < min(np.percentile(sub, 70) - 55, 150)
    hit = cv2.morphologyEx(hit.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8)) > 0
    ys, xs = np.nonzero(hit)
    if len(xs) < 12:
        return None
    return [int(x0 + xs.min()), int(y0 + ys.min()), int(x0 + xs.max()), int(y0 + ys.max())]


def to_board(cap_png, board_rect, dsf):
    """Resample a capture into authority px (941 × 1672); returns RGB and a validity mask (the part on screen)."""
    im = np.array(Image.open(cap_png).convert('RGB')).astype(np.float32)
    bl, bt, bw, _ = board_rect
    u = bw / W
    xs = (np.arange(W) * u + bl) * dsf
    ys = (np.arange(H) * u + bt) * dsf
    mx, my = np.meshgrid(xs, ys)
    out = cv2.remap(im, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_AREA if u * dsf < 1 else cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    valid = (mx >= 0) & (mx <= im.shape[1] - 1) & (my >= 0) & (my <= im.shape[0] - 1)
    return out.clip(0, 255).astype(np.uint8), valid


def edges(rgb):
    g = cv2.GaussianBlur(rgb.mean(2).astype(np.float32), (3, 3), 0)
    m = cv2.magnitude(cv2.Sobel(g, cv2.CV_32F, 1, 0), cv2.Sobel(g, cv2.CV_32F, 0, 1))
    return m > 60


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--auth', required=True)
    ap.add_argument('--cap', required=True)
    ap.add_argument('--scenes', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--viewport', default='471x836')
    ap.add_argument('--dsf', type=float, default=2)
    ap.add_argument('--label', default='after')
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    scenes = json.loads(Path(a.scenes).read_text())['scenes']
    rects = json.loads((Path(a.cap) / 'rects.json').read_text())
    report = dict(method=__doc__.strip().split('\n\n')[1], viewport=a.viewport, dsf=a.dsf, label=a.label, screens={})
    for sid, fn in AUTH.items():
        key = f'{sid}-{a.viewport}'
        if key not in rects:
            continue
        auth = np.array(Image.open(Path(a.auth) / fn).convert('RGB'))
        run, valid = to_board(Path(a.cap) / f'{key}.png', rects[key]['board'], a.dsf)
        valid[:, :VISIBLE_X[0]] = False
        valid[:, VISIBLE_X[1]:] = False
        boxes = []
        if sid == '02':
            boxes += [dict(id=b[5], box=b[:4], mode=b[4]) for b in TEXT_02]
        else:
            sc = scenes[sid]
            names = ['label', 'value'] + (['caption'] if sid == '05' else [])
            light = [b for b in sc['masked_boxes']][: len(names)]
            boxes += [dict(id=n, box=b, mode='light') for n, b in zip(names, light)]
            dark = sc['masked_boxes'][len(names):]
            for i, b in enumerate(dark):
                boxes.append(dict(id=f'stat-{i // 2 + 1}-{"label" if i % 2 == 0 else "value"}', box=b, mode='dark'))
        sx0, sx1 = STRIP_LABEL_X[sid]
        for i, (y0, y1) in enumerate(STRIP_LABEL[sid]):
            boxes.append(dict(id=f'strip-{i + 1}-label', box=[sx0, y0 + 24, sx1, y1 - 24], mode='dark'))
        text_mask = np.zeros((H, W), bool)
        rows = []
        for b in boxes:
            x0, y0, x1, y1 = b['box']
            text_mask[y0:y1, x0:x1] = True
            ga = glyph_box(auth, b['box'], b['mode'])
            on_screen = bool(valid[y0:y1, x0:x1].all())
            gr = glyph_box(run, b['box'], b['mode']) if on_screen else None
            row = dict(id=b['id'], box=b['box'], authority=ga, runtime=gr, on_screen=on_screen)
            if ga and gr:
                row['d_left'], row['d_top'], row['d_right'], row['d_bottom'] = [gr[k] - ga[k] for k in range(4)]
                row['height_ratio'] = round((gr[3] - gr[1] + 1) / (ga[3] - ga[1] + 1), 3)
                row['width_ratio'] = round((gr[2] - gr[0] + 1) / (ga[2] - ga[0] + 1), 3)
            rows.append(row)
        keep = valid & ~text_mask
        ea, er = edges(auth), edges(run)
        k = np.ones((7, 7), np.uint8)
        near_r = cv2.dilate(er.astype(np.uint8), k) > 0
        near_a = cv2.dilate(ea.astype(np.uint8), k) > 0
        regions = dict(heading=(0, 548), scene=(548, scenes[sid]['band'][3] if sid != '02' else 1172), rows=(scenes[sid]['band'][3] if sid != '02' else 1149, 1560))
        reg = {}
        for name, (r0, r1) in regions.items():
            m = keep.copy()
            m[:r0] = False
            m[r1:] = False
            ra = (ea & m).sum()
            rr = (er & m).sum()
            diff = np.abs(run.astype(np.int16) - auth.astype(np.int16)).mean(2)
            reg[name] = dict(y=[r0, r1], edge_recall=round(float((ea & near_r & m).sum() / max(1, ra)), 4), edge_precision=round(float((er & near_a & m).sum() / max(1, rr)), 4),
                             mean_abs_diff=round(float(diff[m].mean()) if m.any() else -1, 2))
        diff = np.abs(run.astype(np.int16) - auth.astype(np.int16)).mean(2)
        diff[~valid] = 0
        heat = cv2.applyColorMap(np.clip(diff * 3, 0, 255).astype(np.uint8), cv2.COLORMAP_INFERNO)
        heat[text_mask & valid] = (heat[text_mask & valid] * 0.35).astype(np.uint8)
        Image.fromarray(cv2.cvtColor(heat, cv2.COLOR_BGR2RGB)).save(out / f'{sid}_{a.label}_diff.png')
        # alignment overlay: authority edges red, runtime edges cyan, coincident white
        ov = (auth * 0.35).astype(np.uint8)
        ov[ea & ~er] = (230, 40, 40)
        ov[er & ~ea] = (40, 220, 230)
        ov[ea & er] = (255, 255, 255)
        ov[~valid] = (ov[~valid] * 0.3).astype(np.uint8)
        Image.fromarray(ov).save(out / f'{sid}_{a.label}_overlay.png')
        Image.fromarray(run).save(out / f'{sid}_{a.label}_board.png')
        report['screens'][sid] = dict(authority=fn, text=rows, regions=reg, visible_board_rows=[0, int(valid[:, 470].nonzero()[0].max()) + 1])
        print(sid, json.dumps(reg))
    (out / f'compare_{a.label}.json').write_text(json.dumps(report, indent=1) + '\n')


if __name__ == '__main__':
    main()
