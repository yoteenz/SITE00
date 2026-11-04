#!/usr/bin/env python3
"""
F05 DOT 01 — the ALL ACCOUNTS (authority 06) layers: four illustrated account papers, the two action surfaces and
their two glyphs.

Why: 06 was drawn on SK02_FIELD (the bank-detail SIDEKICK with its papers removed: plain reconstructed olive field
from y 588 to 1548) with the cards and the action strip in document flow at the top of the content region. That
environment has none of 06's lower composition (the parchment sheet that carries the actions, the engraved coastal
landscape, the laurel and red fabric at its left), and the cards were the parent's small card thumbnails. 06 is an
independent render in the SK01 family: its environment below the title paper (sheet, landscape, botanicals, torn nav
paper) is SK01's, but its four account papers (bank village, rideshare lemon branch, cash amphora, credit coin on
oxblood) are larger and set higher, and exist ONLY in the 06 authority. The authority is therefore the only full-scale
source of those papers and of its two action surfaces.

Nothing is generated. Each paper is cut from the lossless V9 authority PNG along its own torn edge (GrabCut seeded with
the measured paper box, kept to its largest component, holes closed). The only pixels that change are the
live-text pixels (the pocket name and figure on each paper, the label and glyph on each action surface): ink pixels are
detected inside fixed authority boxes and reconstructed from the surrounding pixels of the same image (OpenCV Telea
inpainting). The two glyphs are lifted as alpha (|authority − inpainted|) so the runtime can draw them in their exact
authority shape and dim them for a disabled state. Names, figures and labels are then set live at the authority's own
coordinates (JSON).

Inputs: the V9 authority 06_ALL_ACCOUNTS.png (941 × 1672, lossless; SHA-256 checked against the V9 manifest).
Outputs (families/F05_MONEY/DOT01/SCENES/):
  F05_DOT01_CARD06_{BANK,PAYOUT,CASH,CREDIT}.webp   text-free account papers (alpha), cropped to their box
  F05_DOT01_ACTION06_{ADD,REORDER}.webp             text-free action surfaces (alpha)
  F05_DOT01_ICON06_{ADD,REORDER}.webp               the two authority glyphs (alpha)
  F05_DOT01_SCENE06.json                            source SHA-256, boxes, masked boxes, live-text slots

Run:  python -I extract_dot01_directory_scene.py --auth <dir with 06_ALL_ACCOUNTS.png> --out <repo>/src/projects/jurnl/families/F05_MONEY/DOT01/SCENES
"""
import argparse
import hashlib
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

SOURCE = '06_ALL_ACCOUNTS.png'
SOURCE_SHA = '4161e4075db14d2e7dd324385ab204da7dd052cc18ae8a6a63e5413f48113859'
# 22 EMPTY ACCOUNTS: its scene band (the wallet / temple card / coins / coastal print under the title paper, the large
# sheet with its rule, the four account-type papers and the two strips) lifted whole, text-free; the env's own landscape
# follows below it. A tile of plain sheet (under the copy, above the type papers) lets a tall phone grow the sheet there.
EMPTY_SOURCE = '22_EMPTY_ACCOUNTS.png'
EMPTY_SHA = '4f70fa1e61de3b38d8a01564d9aec7eaf40a93e0cd4cb34c27bcfc0ed8a96a12'
EMPTY = dict(
    band=[0, 552, 941, 1540],
    # (box, tone) — every system label on the band; the glyphs, rule, dividers and arrows stay (fixed art)
    ink=[([214, 808, 730, 864], 'dark'), ([206, 900, 738, 978], 'dark'),
         ([86, 1028, 258, 1102], 'dark'), ([508, 1028, 700, 1102], 'dark'),
         ([86, 1178, 254, 1252], 'dark'), ([508, 1178, 640, 1252], 'dark'),
         ([282, 1354, 722, 1410], 'light'), ([286, 1470, 708, 1518], 'dark')],
    tile=[978, 994],
    feather=22,
    # 22 seals its title paper with the temple (bank) emblem, not SK02's laurel: lifted along its own edge
    seal=[16, 314, 172, 468],
)

# Authority boxes [x0, y0, x1, y1] (941 × 1672), measured on the V9 PNG. `seed` is the GrabCut rectangle (a few px
# outside the torn edge); `ink` are the live-text boxes (dark ink on parchment) that are reconstructed.
PAPERS = {
    'BANK': dict(slot=0, seed=[30, 624, 472, 876], ink=[[70, 666, 266, 744], [70, 768, 246, 828]]),
    'PAYOUT': dict(slot=1, seed=[474, 624, 916, 876], ink=[[506, 666, 722, 744], [506, 768, 674, 828]]),
    'CASH': dict(slot=2, seed=[28, 874, 470, 1120], ink=[[70, 912, 252, 984], [70, 1008, 206, 1062]]),
    'CREDIT': dict(slot=3, seed=[474, 874, 916, 1118], ink=[[506, 912, 660, 984], [506, 1006, 664, 1062]]),
}
# the two action surfaces and, inside each, the glyph and the two-line label
ACTIONS = {
    'ADD': dict(seed=[78, 1158, 476, 1306], glyph=[140, 1190, 222, 1268], label=[244, 1192, 426, 1268], ink='light'),
    'REORDER': dict(seed=[484, 1156, 888, 1302], glyph=[536, 1192, 614, 1266], label=[638, 1194, 840, 1266], ink='dark'),
}


def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def cut(img_bgr: np.ndarray, seed, body: int = 0):
    """The paper's own torn edge: GrabCut from the seed rectangle, largest component, holes filled."""
    x0, y0, x1, y1 = seed
    m = np.zeros(img_bgr.shape[:2], np.uint8)
    bg, fg = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img_bgr, m, (x0, y0, x1 - x0, y1 - y0), bg, fg, 8, cv2.GC_INIT_WITH_RECT)
    mm = ((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD)).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(mm)
    mm = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    # fill interior holes (a dark coin rim, an amphora shadow) and smooth the boundary by one pixel
    cnts, _ = cv2.findContours(mm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    solid = np.zeros_like(mm)
    cv2.drawContours(solid, cnts, -1, 1, thickness=cv2.FILLED)
    solid = cv2.morphologyEx(solid, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    if body:
        # the small chevron tab in a paper's lower-right corner is its own torn slip, so GrabCut can leave it out: the
        # paper's body (its box inset past the torn edge, corners rounded as drawn) is always paper
        bx0, by0, bx1, by1 = x0 + body, y0 + body, x1 - body, y1 - body
        rr = np.zeros_like(solid)
        r = 26
        cv2.rectangle(rr, (bx0 + r, by0), (bx1 - r, by1), 1, cv2.FILLED)
        cv2.rectangle(rr, (bx0, by0 + r), (bx1, by1 - r), 1, cv2.FILLED)
        for cx, cy in ((bx0 + r, by0 + r), (bx1 - r, by0 + r), (bx0 + r, by1 - r), (bx1 - r, by1 - r)):
            cv2.circle(rr, (cx, cy), r, 1, cv2.FILLED)
        solid = solid | rr
    alpha = cv2.GaussianBlur(solid.astype(np.float32), (3, 3), 0.8)
    return np.clip(alpha, 0, 1)


def ink_mask(rgb: np.ndarray, box, tone: str) -> np.ndarray:
    """Text pixels inside a box: dark ink on parchment, or light ink on the dark olive surface; dilated to the halo."""
    x0, y0, x1, y1 = box
    m = np.zeros(rgb.shape[:2], np.uint8)
    roi = rgb[y0:y1, x0:x1].astype(np.int32)
    lum = roi.mean(2)
    if tone == 'dark':
        sel = lum < np.median(lum) - 38
    else:
        sel = lum > np.median(lum) + 45
    m[y0:y1, x0:x1] = sel.astype(np.uint8)
    return cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))


def save_rgba(rgb: np.ndarray, alpha: np.ndarray, box, path: Path, q=92) -> int:
    x0, y0, x1, y1 = box
    a = (alpha[y0:y1, x0:x1] * 255).round().astype(np.uint8)
    im = np.dstack([rgb[y0:y1, x0:x1], a])
    Image.fromarray(im, 'RGBA').save(path, 'WEBP', quality=q, method=6, exact=True)
    return path.stat().st_size


def bbox(alpha: np.ndarray, pad=2):
    ys, xs = np.where(alpha > 0.02)
    return [int(xs.min()) - pad, int(ys.min()) - pad, int(xs.max()) + 1 + pad, int(ys.max()) + 1 + pad]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--auth', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--review', help='optional PNG: the reconstructed authority with the cuts outlined')
    args = ap.parse_args()
    src = Path(args.auth) / SOURCE
    digest = sha256(src)
    if digest != SOURCE_SHA:
        raise SystemExit(f'{SOURCE}: SHA-256 {digest} does not match the V9 manifest')
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    rgb = np.array(Image.open(src).convert('RGB'))
    bgr = np.ascontiguousarray(rgb[:, :, ::-1])

    # 1. every live-text and glyph pixel, reconstructed once over the whole image
    mask = np.zeros(rgb.shape[:2], np.uint8)
    for p in PAPERS.values():
        for b in p['ink']:
            mask |= ink_mask(rgb, b, 'dark')
    for a in ACTIONS.values():
        for key in ('glyph', 'label'):
            mask |= ink_mask(rgb, a[key], a['ink'])
    clean = cv2.inpaint(bgr, mask, 6, cv2.INPAINT_TELEA)[:, :, ::-1]

    manifest = {
        'note': 'ALL ACCOUNTS (06) layers lifted from the V9 authority; only live-text and glyph pixels are reconstructed (inpainted). Authority px (941 x 1672).',
        'source': SOURCE,
        'source_sha256': digest,
        'masked_px': int(mask.sum()),
        'papers': {},
        'actions': {},
    }
    # 2. the four account papers
    for name, p in PAPERS.items():
        alpha = cut(bgr, p['seed'], body=12)
        box = bbox(alpha)
        f = out / f'F05_DOT01_CARD06_{name}.webp'
        size = save_rgba(clean, alpha, box, f)
        manifest['papers'][name] = dict(slot=p['slot'], box=box, seed=p['seed'], masked_boxes=p['ink'], runtime=f.name, runtime_bytes=size)
    # 3. the two action surfaces and their glyphs
    for name, a in ACTIONS.items():
        alpha = cut(bgr, a['seed'])
        box = bbox(alpha)
        f = out / f'F05_DOT01_ACTION06_{name}.webp'
        size = save_rgba(clean, alpha, box, f)
        # the glyph: what the inpainting removed inside the glyph box, as alpha over the glyph's own colour
        gx0, gy0, gx1, gy1 = a['glyph']
        d = np.abs(rgb[gy0:gy1, gx0:gx1].astype(np.float32) - clean[gy0:gy1, gx0:gx1].astype(np.float32)).mean(2)
        ga = np.clip((d - 10) / 70, 0, 1)
        ink = rgb[gy0:gy1, gx0:gx1][ga > 0.8]
        colour = ink.mean(0).round().astype(int).tolist() if len(ink) else [0, 0, 0]
        glyph = np.dstack([np.full(ga.shape + (3,), colour, np.uint8), (ga * 255).round().astype(np.uint8)])
        gf = out / f'F05_DOT01_ICON06_{name}.webp'
        Image.fromarray(glyph, 'RGBA').save(gf, 'WEBP', quality=95, method=6, exact=True)
        manifest['actions'][name] = dict(box=box, seed=a['seed'], glyph_box=a['glyph'], label_box=a['label'], glyph_colour=colour, runtime=f.name, runtime_bytes=size, glyph=gf.name)
    (out / 'F05_DOT01_SCENE06.json').write_text(json.dumps(manifest, indent=1) + '\n')
    # 22 EMPTY ACCOUNTS
    esrc = Path(args.auth) / EMPTY_SOURCE
    edigest = sha256(esrc)
    if edigest != EMPTY_SHA:
        raise SystemExit(f'{EMPTY_SOURCE}: SHA-256 {edigest} does not match the V9 manifest')
    erg = np.array(Image.open(esrc).convert('RGB'))
    emask = np.zeros(erg.shape[:2], np.uint8)
    for b, tone in EMPTY['ink']:
        emask |= ink_mask(erg, b, tone)
    eclean = cv2.inpaint(np.ascontiguousarray(erg[:, :, ::-1]), emask, 6, cv2.INPAINT_TELEA)[:, :, ::-1]
    x0, y0, x1, y1 = EMPTY['band']
    a = np.ones(erg.shape[:2], np.float32)
    f = EMPTY['feather']
    ramp = np.linspace(0, 1, f, dtype=np.float32)
    a[y0:y0 + f, :] = ramp[:, None]
    a[y1 - f:y1, :] = ramp[::-1, None]
    ef = out / 'F05_DOT01_SCENE_22.webp'
    esize = save_rgba(eclean, a, EMPTY['band'], ef, q=90)
    t0, t1 = EMPTY['tile']
    tf = out / 'F05_DOT01_SCENE_22_TILE.webp'
    Image.fromarray(np.ascontiguousarray(eclean[t0:t1, x0:x1]), 'RGB').save(tf, 'WEBP', quality=90, method=6)
    salpha = cut(np.ascontiguousarray(erg[:, :, ::-1]), EMPTY['seal'])
    sbox = bbox(salpha)
    sf = out / 'F05_DOT01_SEAL_22.webp'
    save_rgba(erg, salpha, sbox, sf)
    manifest['empty_seal'] = dict(box=sbox, seed=EMPTY['seal'], runtime=sf.name)
    manifest['empty'] = dict(source=EMPTY_SOURCE, source_sha256=edigest, band=EMPTY['band'], masked_boxes=[b for b, _ in EMPTY['ink']], masked_px=int(emask.sum()), feather=f, tile=EMPTY['tile'], runtime=ef.name, runtime_bytes=esize, tile_runtime=tf.name)
    (out / 'F05_DOT01_SCENE06.json').write_text(json.dumps(manifest, indent=1) + '\n')
    if args.review:
        Image.fromarray(np.ascontiguousarray(eclean)).save(str(args.review).replace('.png', '_22.png'))
    if args.review:
        # the reconstructed authority with every cut outlined (evidence only; not a runtime asset)
        review = np.ascontiguousarray(clean.copy())
        for p in manifest['papers'].values():
            x0, y0, x1, y1 = p['box']
            cv2.rectangle(review, (x0, y0), (x1, y1), (255, 0, 255), 2)
        for a in manifest['actions'].values():
            x0, y0, x1, y1 = a['box']
            cv2.rectangle(review, (x0, y0), (x1, y1), (0, 255, 255), 2)
        Image.fromarray(review).save(args.review)
    print(json.dumps({k: v['box'] for k, v in manifest['papers'].items()}), json.dumps({k: v['box'] for k, v in manifest['actions'].items()}))


if __name__ == '__main__':
    main()
