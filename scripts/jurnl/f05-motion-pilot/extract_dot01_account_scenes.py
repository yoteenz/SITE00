#!/usr/bin/env python3
"""
F05 DOT 01 — authority scenes for the account pages 03 RIDESHARE CARD, 04 CASH ON HAND and 05 CREDIT CARD.

Why: V9 supplied one text-free account SIDEKICK (SK02), built from screen 02, and no separate layer for the keychain,
the amphora or the coin on red fabric. The only full-scale source of those objects, and of each page's own ground,
summary parchment and landscape, is the approved authority render itself. This script lifts each page's SCENE BAND
(from under the title paper to just above the first action row) out of the lossless V9 authority PNG, so the runtime
sets that page's own composition instead of re-using 02's.

Nothing is generated. The only pixels that change are the live-text pixels (the balance label and figure, the summary
labels and values): they are detected inside fixed authority boxes and reconstructed from the surrounding pixels of the
same image (OpenCV inpainting). Every object, rule, parchment edge, engraving and botanical element is the authority's
own pixel. The live values are then set by the runtime at the authority's own coordinates (geometry JSON).

Inputs: the V9 package authorities (01_MOBILE_SCREEN_AUTHORITIES/*.png, 941 × 1672, lossless).
Outputs (families/F05_MONEY/DOT01/SCENES/):
  F05_DOT01_SCENE_<id>.webp   the text-free scene band with a feathered top and bottom (alpha)
  F05_DOT01_SEAL_03.webp      the RIDESHARE seal (car emblem) that 03 draws in place of SK02's laurel
  F05_DOT01_SCENES.json       source SHA-256, band box, masked boxes, the live-text slots, stat rows, action rows

Run:  python -I extract_dot01_account_scenes.py --auth <dir with 03_/04_/05_ PNGs> --out <repo>/src/projects/jurnl/families/F05_MONEY/DOT01/SCENES
"""
import argparse
import hashlib
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

FEATHER = 22  # px of alpha ramp at the band's top and bottom, so it seats into SK02's field without a seam

# Authority coordinates (941 × 1672), measured on the V9 PNGs (doc 09). Boxes are [x0, y0, x1, y1].
# mask: (box, 'light' = light text on the olive ground | 'dark' = ink on parchment)
SCENES = {
    '03': dict(
        file='03_RIDESHARE_CARD.png', band=[0, 548, 941, 1172],
        mask=[([88, 598, 342, 698], 'light'), ([84, 700, 368, 812], 'light'),
              ([92, 878, 330, 926], 'dark'), ([470, 872, 606, 928], 'dark'),
              ([92, 948, 290, 996], 'dark'), ([520, 944, 606, 998], 'dark'),
              ([92, 1018, 352, 1066], 'dark'), ([440, 1016, 606, 1068], 'dark')],
        # the live text the runtime sets: x / y the text box's top-left, w its width, size the font size (board px),
        # track the letter-spacing and leading the line-height (em); calibrated by compare_dot01_account_scenes.py
        slots=dict(label=dict(x=100, y=610, w=300, lines=2, size=42, track=0.03, leading=0.92, align='left', tone='cream'),
                   value=dict(x=90, y=700, w=290, size=116, align='left', tone='gold')),
        # summary rows: label size, value size (em of the label), label leading where a label takes two lines
        stats=dict(x=100, w=497, rows=[882, 952, 1022], size=34, value_em=1.1),
        strip_label=35,
        strips=[[30, 1180, 876, 132], [30, 1325, 876, 132], [30, 1470, 876, 140]],
        seal=dict(cx=103, cy=410, rx=76, ry=78),
    ),
    '04': dict(
        file='04_CASH_ON_HAND.png', band=[0, 542, 941, 1138],
        mask=[([418, 588, 834, 642], 'light'), ([492, 640, 764, 750], 'light'),
              ([408, 792, 690, 842], 'dark'), ([800, 790, 894, 846], 'dark'),
              ([408, 860, 690, 910], 'dark'), ([770, 858, 894, 914], 'dark'),
              ([408, 926, 664, 978], 'dark'), ([740, 924, 894, 980], 'dark')],
        slots=dict(label=dict(x=420, y=590, w=410, lines=1, size=40, track=0.14, align='center', tone='cream'),
                   value=dict(x=420, y=641, w=410, size=107, align='center', tone='cream')),
        stats=dict(x=415, w=467, rows=[794, 864, 933], size=32.5, track=0.02, value_em=1.15),
        strip_label=37,
        strips=[[40, 1139, 856, 120], [40, 1256, 856, 120], [40, 1375, 856, 120], [40, 1494, 856, 122]],
    ),
    '05': dict(
        file='05_CREDIT_CARD.png', band=[0, 548, 941, 1044],
        mask=[([84, 632, 442, 678], 'light'), ([118, 690, 424, 818], 'light'), ([96, 834, 432, 884], 'light'),
              ([496, 598, 712, 650], 'dark'), ([752, 596, 896, 652], 'dark'),
              ([496, 664, 680, 742], 'dark'), ([752, 668, 896, 728], 'dark'),
              ([496, 752, 672, 802], 'dark'), ([752, 750, 896, 806], 'dark')],
        slots=dict(label=dict(x=88, y=639, w=350, lines=1, size=30, track=0.11, align='center', tone='cream'),
                   value=dict(x=88, y=697, w=350, size=111, align='center', tone='cream'),
                   caption=dict(x=88, y=838, w=350, size=31, track=0.22, align='center', tone='cream')),
        stats=dict(x=505, w=382, rows=[596, 670, 750], size=25.5, value_em=1.6, leading=1.18),
        strip_label=35,
        strips=[[40, 1032, 862, 118], [40, 1154, 862, 120], [40, 1284, 862, 120], [40, 1415, 862, 122]],
    ),
}


def text_mask(rgb: np.ndarray, boxes) -> np.ndarray:
    """Live-text pixels only: inside each box, light glyphs on the dark ground or dark ink on parchment."""
    lum = rgb.mean(2)
    m = np.zeros(lum.shape, np.uint8)
    for (x0, y0, x1, y1), mode in boxes:
        sub = lum[y0:y1, x0:x1]
        if mode == 'light':
            ground = np.percentile(sub, 35)
            hit = sub > max(ground + 45, 105)
        else:
            paper = np.percentile(sub, 70)
            hit = sub < min(paper - 55, 150)
        m[y0:y1, x0:x1][hit] = 255
    m = cv2.dilate(m, np.ones((3, 3), np.uint8), iterations=2)
    return m


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--auth', required=True)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    meta = dict(note='Scene bands lifted from the V9 authorities; only live-text pixels are reconstructed (inpainted). Coordinates are authority px (941 × 1672).', scenes={})
    for sid, s in SCENES.items():
        src = Path(a.auth) / s['file']
        raw = src.read_bytes()
        im = np.array(Image.open(src).convert('RGB'))
        x0, y0, x1, y1 = s['band']
        mask = text_mask(im, s['mask'])
        bgr = cv2.cvtColor(im, cv2.COLOR_RGB2BGR)
        fixed = cv2.cvtColor(cv2.inpaint(bgr, mask, 7, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB)
        band = fixed[y0:y1, x0:x1]
        alpha = np.full(band.shape[:2], 255, np.uint8)
        ramp = np.linspace(0, 255, FEATHER).astype(np.uint8)
        alpha[:FEATHER, :] = ramp[:, None]
        alpha[-FEATHER:, :] = ramp[::-1][:, None]
        rgba = np.dstack([band, alpha])
        dst = out / f'F05_DOT01_SCENE_{sid}.webp'
        Image.fromarray(rgba, 'RGBA').save(dst, 'WEBP', quality=90, method=6, exact=True)
        entry = dict(source=s['file'], source_sha256=hashlib.sha256(raw).hexdigest(), band=s['band'], masked_boxes=[b for b, _ in s['mask']],
                     masked_px=int((mask[y0:y1, x0:x1] > 0).sum()), band_px=int((y1 - y0) * (x1 - x0)), runtime=dst.name, runtime_bytes=dst.stat().st_size,
                     slots=s['slots'], stats=s['stats'], strips=s['strips'], strip_label=s['strip_label'])
        if 'seal' in s:
            c = s['seal']
            bx0, by0, bx1, by1 = c['cx'] - c['rx'] - 6, c['cy'] - c['ry'] - 6, c['cx'] + c['rx'] + 6, c['cy'] + c['ry'] + 6
            crop = im[by0:by1, bx0:bx1]
            yy, xx = np.mgrid[by0:by1, bx0:bx1]
            d = ((xx - c['cx']) / c['rx']) ** 2 + ((yy - c['cy']) / c['ry']) ** 2
            sa = np.clip((1.06 - d) / 0.12, 0, 1)  # soft elliptical edge
            seal = np.dstack([crop, (sa * 255).astype(np.uint8)])
            sd = out / f'F05_DOT01_SEAL_{sid}.webp'
            Image.fromarray(seal, 'RGBA').save(sd, 'WEBP', quality=92, method=6, exact=True)
            entry['seal'] = dict(box=[bx0, by0, bx1 - bx0, by1 - by0], runtime=sd.name)
        meta['scenes'][sid] = entry
        print(sid, entry['runtime'], entry['runtime_bytes'], 'masked', entry['masked_px'], 'of', entry['band_px'])
    (out / 'F05_DOT01_SCENES.json').write_text(json.dumps(meta, indent=1) + '\n')


if __name__ == '__main__':
    main()
