#!/usr/bin/env python3
"""
F05 MONEY DOT 01 (ACCOUNTS) — layers from the founder's V9 handoff (941 x 1672 SIDEKICKs + 22 transparent PNGs).

Measured first (doc 04): each SIDEKICK is pixel-aligned with exactly one screen authority (ECC, identity transform):
SK01 = 01 MONEY parent, SK02 = 02 BANK ACCOUNT, SK03 = 26 CAPTURE RECEIPT. The other 34 authorities are separate
renders of the same design and align with no SIDEKICK. So:

  * parent (SK01): the four account papers, the title paper and the seal become real-alpha layers; the panel under
    the papers and the covered areas are reconstructed from the same image (pilot method, extract_layers.py);
  * SK02 / SK03 are used whole where their baked papers ARE the page (02 BANK, 26 CAPTURE), and as a FIELD variant
    elsewhere: their baked content papers are replaced by the olive ground they sit on (low frequency from the image
    itself, grain from SK01's own text-free olive band), so every other page lays its live papers on a clean underlay
    with no double paper edges;
  * the 22 motion PNGs are trimmed to their alpha box, scaled for the board and written as WebP with alpha.

Deterministic (fixed seed, no generative fill, no new imagery). Output paths are fixed; inputs are the V9 package.
"""

import argparse
import hashlib
import json
import os
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extract_layers as X  # noqa: E402

W, H = 941, 1672
# SK01 — measured on the SIDEKICK (GrabCut + grid, doc 04)
CARDS = {
    'bank': (49, 776, 457, 969),
    'payout': (481, 774, 892, 969),
    'cash': (49, 988, 458, 1187),
    'credit': (482, 988, 892, 1187),
}
RADIUS = 21
TITLE_RECT = (60, 320, 560, 290)
SEAL_RECT = (20, 300, 160, 170)
PANEL_INTERIOR = (34, 766, 906, 1196)
PANEL_DONOR = (24, 744, 924, 1300)
SEAM_A, SEAM_C = 900, 1190
EDGE_STRIP = (722, 812, 40, 900)
OLIVE_BAND = (70, 596, 900, 742)        # SK01: text-free olive ground of the summary band (x0, y0, x1, y1)
# SK02 / SK03 — baked content papers replaced in the FIELD variants (x0, y0, x1, y1)
FIELD_RECT = {'SK02': (22, 588, 919, 1548), 'SK03': (22, 568, 919, 1530)}
# SK02 papers (= authority 02 BANK ACCOUNT), bottom to top; GrabCut rects (x, y, w, h), fitted on the SIDEKICK
SK02_PAPERS = [
    ('scenic', (20, 850, 900, 320)),
    ('balance', (25, 585, 425, 305)),
    ('stats', (440, 585, 480, 305)),
    ('strip_1', (20, 1150, 900, 140)),
    ('strip_2', (20, 1275, 900, 140)),
    ('strip_3', (20, 1400, 900, 150)),
]
# SK03 papers (= authority 26 CAPTURE RECEIPT), bottom to top
SK03_PAPERS = [
    ('sheet', (30, 1180, 880, 350)),
    ('frame', (40, 560, 870, 490)),
    ('strip', (30, 1040, 880, 170)),
]
MOTION_MAX = 1200  # px, long side of each motion PNG after trimming
NAV_PAPER_RECT = (14, 1462, 912, 200)  # SK01's torn nav paper (x, y, w, h): the approved dock background on child pages
ELASTIC = (980, 1180)                  # field band (y0, y1) tiled into the extra height of tall phones


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def parent(sk, out, qa, report):
    shape = sk.shape
    seal = X.grabcut(sk, SEAL_RECT)
    title_gc = X.grabcut(sk, TITLE_RECT)
    title = X.fill_holes(title_gc)
    title = cv2.bitwise_and(title, cv2.bitwise_not(cv2.dilate(seal, np.ones((5, 5), np.uint8))))
    hull = np.zeros_like(title)
    cnts, _ = cv2.findContours(X.fill_holes(cv2.bitwise_or(title_gc, cv2.dilate(seal, np.ones((3, 3), np.uint8)))), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(hull, [cv2.convexHull(max(cnts, key=cv2.contourArea))], -1, 255, -1)
    hsv = cv2.cvtColor(sk, cv2.COLOR_BGR2HSV)
    leafish = ((hsv[..., 0] > 18) & (hsv[..., 0] < 75) & (hsv[..., 1] > 45) & (hsv[..., 2] < 200)).astype(np.uint8) * 255
    leaves = cv2.bitwise_and(cv2.bitwise_and(hull, cv2.bitwise_not(seal)), leafish)
    leaves = cv2.morphologyEx(leaves, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    leaves[:, 200:] = 0
    title = cv2.bitwise_and(title, cv2.bitwise_not(cv2.dilate(leaves, np.ones((3, 3), np.uint8))))

    m_cards = np.zeros(shape[:2], np.uint8)
    layers = {}
    for k, r in CARDS.items():
        rm = X.rounded_rect_mask(shape, r, RADIUS)
        m_cards |= (rm > 0).astype(np.uint8) * 255
        layers[f'card_{k}'] = X.crop_rgba(sk, rm)
    m_shadow = cv2.dilate(m_cards, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19)))
    shifted = np.zeros_like(m_shadow)
    shifted[9:, 4:] = m_shadow[:-9, :-4]
    m_panel = ((m_shadow | shifted | X.rounded_rect_mask(shape, PANEL_INTERIOR, 24)) > 0).astype(np.uint8) * 255

    x0, y0, x1, y1 = PANEL_DONOR
    region = X.box_mask(shape, PANEL_DONOR)
    med = np.median(sk[y0:y1, x0:x1].reshape(-1, 3).astype(np.float32), axis=0)
    dist = np.linalg.norm(sk.astype(np.float32) - med, axis=2)
    donor = ((dist < 34) & (region > 0) & (cv2.dilate(m_panel, np.ones((7, 7), np.uint8)) == 0)).astype(np.uint8) * 255
    env = X.synth_fill(sk, m_panel, donor, seed_offset=4, hp_sigma=10.0, lf_mode='poly', P=20, amp=1.0, grow=2, feather=2.0)
    m_covered = cv2.bitwise_or(cv2.erode(title, np.ones((19, 19), np.uint8)), cv2.erode(seal, np.ones((3, 3), np.uint8)))
    env_cov = X.covered_fill(env, m_covered)
    layers['title_paper'] = X.crop_rgba(sk, X.soft_alpha(title))
    layers['wax_seal'] = X.crop_rgba(sk, X.soft_alpha(seal))

    bx0, by0, _, _ = CARDS['bank']
    paper_tile = sk[by0 + 24:by0 + 144, bx0 + 24:bx0 + 180]
    panel_tile = X.seamless_tile(env_cov, SEAM_A, SEAM_C)
    ey0, ey1, ex0, ex1 = EDGE_STRIP
    edge = X.torn_edge_strip(env_cov, ey0, ey1, ex0, ex1)

    cv2.imwrite(os.path.join(out, 'F05_MOTION_SIDEKICK.webp'), env_cov, [cv2.IMWRITE_WEBP_QUALITY, 86])
    cv2.imwrite(os.path.join(out, 'F05_MOTION_PANEL_TILE.webp'), panel_tile, [cv2.IMWRITE_WEBP_QUALITY, 86])
    cv2.imwrite(os.path.join(out, 'F05_MOTION_PAPER_TILE.webp'), paper_tile, [cv2.IMWRITE_WEBP_QUALITY, 90])
    cv2.imwrite(os.path.join(out, 'F05_MOTION_TORN_EDGE.webp'), edge, [cv2.IMWRITE_WEBP_QUALITY, 90])
    geometry = {}
    for name, (layer, box) in layers.items():
        cv2.imwrite(os.path.join(out, f'F05_MOTION_{name.upper()}.webp'), layer, [cv2.IMWRITE_WEBP_QUALITY, 92])
        cv2.imwrite(os.path.join(qa, f'sk01_layer_{name}.png'), layer)
        geometry[name] = {'box': list(box), 'w': box[2] - box[0], 'h': box[3] - box[1]}
        report['parent_layers'][name] = {'box': list(box), **X.qa_alpha(name, layer, qa)}
    for k, r in CARDS.items():
        geometry[f'card_{k}']['rect'] = [float(v) for v in r]
        geometry[f'card_{k}']['radius'] = RADIUS
    geometry['seams'] = {'a': SEAM_A, 'c': SEAM_C}
    geometry['source'] = {'w': W, 'h': H, 'profile': 'SK01'}
    envelopes = {'title_paper': {'origin': [0.18, 0.70], 'scale': 1.014, 'rotate_deg': 0.0}, 'wax_seal': {'origin': [0.5, 0.5], 'scale': 1.04, 'rotate_deg': 0.0}}
    geometry['envelopes'] = envelopes
    report['parent_motion_envelope_uncovered_px'] = {}
    for name, e in envelopes.items():
        layer, (bx0_, by0_, _, _) = layers[name]
        h_, w_ = layer.shape[:2]
        org = (e['origin'][0] * w_, e['origin'][1] * h_)
        report['parent_motion_envelope_uncovered_px'][name] = {
            'any_layer_pixel': X.envelope_check(layer[..., 3], org, e['scale'], e['rotate_deg']),
            'covered_fill_exposed': X.envelope_check(layer[..., 3], org, e['scale'], e['rotate_deg'], covered=m_covered[by0_:by0_ + h_, bx0_:bx0_ + w_]),
        }
    with open(os.path.join(out, 'F05_MOTION_GEOMETRY.json'), 'w') as fh:
        json.dump(geometry, fh, indent=2)
    # zero-motion composite vs the SIDEKICK (must be ~identical: the layers sit back where they came from)
    comp = env_cov.astype(np.float32)
    for name in ('title_paper', 'wax_seal', 'card_bank', 'card_payout', 'card_cash', 'card_credit'):
        layer, (x0_, y0_, x1_, y1_) = layers[name]
        al = layer[..., 3:4].astype(np.float32) / 255
        comp[y0_:y1_, x0_:x1_] = layer[..., :3] * al + comp[y0_:y1_, x0_:x1_] * (1 - al)
    comp = comp.astype(np.uint8)
    d = np.abs(comp.astype(np.int16) - sk.astype(np.int16)).max(axis=2)
    report['parent_zero_motion_vs_sk01'] = {'changed_pct_gt24': round(float((d > 24).mean()) * 100, 2), 'mean_abs': round(float(d.mean()), 2)}
    report['parent_reconstructed_px'] = {'panel_under_cards': int(np.count_nonzero(m_panel)), 'covered_under_title_and_seal': int(np.count_nonzero(m_covered))}
    cv2.imwrite(os.path.join(qa, 'sk01_zero_motion_composite.png'), comp)
    cv2.imwrite(os.path.join(qa, 'sk01_env_text_free.png'), env_cov)
    return CARDS


def olive_grain(sk01):
    """High-frequency grain of SK01's text-free olive band, mirrored into a seamless 2x2 tile."""
    x0, y0, x1, y1 = OLIVE_BAND
    band = sk01[y0:y1, x0:x1].astype(np.float32)
    hp = band - cv2.GaussianBlur(band, (0, 0), 6)
    # keep the grain, drop the band's few small ornaments (outliers): clip and de-spike
    lum = np.abs(hp).max(axis=2)
    spikes = cv2.dilate((lum > 3.0 * np.median(lum) + 6).astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
    hp[spikes] = 0
    hp = np.clip(hp, -10, 10)
    tile = np.vstack([np.hstack([hp, hp[:, ::-1]]), np.hstack([hp[::-1], hp[::-1, ::-1]])])
    return tile


def field_variant(sk, rect, grain, seed, papers_mask=None):
    """Replace the baked content papers (the whole rect, or just under papers_mask) with the olive ground they sit on."""
    x0, y0, x1, y1 = rect
    hsv = cv2.cvtColor(sk, cv2.COLOR_BGR2HSV)
    # paper / wood / pills are light or warm; the ground is dark olive
    region = np.zeros(sk.shape[:2], np.uint8)
    region[y0:y1, x0:x1] = 255
    dark_olive = ((hsv[..., 2] < 92) & (hsv[..., 0] > 20) & (hsv[..., 0] < 75)).astype(np.uint8) * 255
    # the whole content rect is replaced (dark baked pills and wood would otherwise pass for ground and leave ghosts);
    # the ground colour is sampled outside it: the margins and the band under the heading paper
    outside = cv2.bitwise_not(cv2.dilate(region, np.ones((9, 9), np.uint8)))
    if papers_mask is not None:
        # only under the papers (and their shadows): the real olive gaps between them stay as painted
        replace = cv2.dilate(papers_mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (23, 23)))
        replace = cv2.bitwise_and(replace, region)
        outside = cv2.bitwise_not(replace)
    ground = cv2.morphologyEx(cv2.bitwise_and(dark_olive, outside), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    if papers_mask is None:
        replace = region.copy()
    # low frequency: the image's own olive ground only (block medians of ground pixels, heavily smoothed); blocks with
    # no ground fall back to the global ground median, so red fabric and paper never bleed into the field
    gpx = sk[ground > 0].astype(np.float32)
    gmed = np.median(gpx, axis=0)
    B = 48
    nby, nbx = (H + B - 1) // B, (W + B - 1) // B
    lfs = np.zeros((nby, nbx, 3), np.float32)
    wts = np.zeros((nby, nbx), np.float32)
    for by in range(nby):
        for bx in range(nbx):
            sl = (slice(by * B, (by + 1) * B), slice(bx * B, (bx + 1) * B))
            g = ground[sl] > 0
            if g.sum() > 60:
                lfs[by, bx] = np.median(sk[sl][g].astype(np.float32), axis=0)
                wts[by, bx] = 1.0
            else:
                lfs[by, bx] = gmed
    lfs = cv2.GaussianBlur(lfs, (0, 0), 2.2)
    lf = cv2.GaussianBlur(cv2.resize(lfs, (W, H), interpolation=cv2.INTER_CUBIC), (0, 0), 24)
    # high frequency: SK01's olive grain, tiled with a seeded offset
    rs = np.random.RandomState(X.SEED + seed)
    th, tw = grain.shape[:2]
    oy, ox = rs.randint(0, th), rs.randint(0, tw)
    reps = (H // th + 3, W // tw + 3, 1)
    big = np.tile(grain, reps)[oy:oy + H, ox:ox + W]
    filled = np.clip(lf + big, 0, 255)
    alpha = cv2.GaussianBlur(replace.astype(np.float32) / 255, (0, 0), 3)[..., None]
    out = (filled * alpha + sk.astype(np.float32) * (1 - alpha)).astype(np.uint8)
    return out, replace


def paper_layers(sk, papers, prefix, out_dir, qa, report):
    """Each baked paper as a real-alpha layer; overlaps go to the paper on top. Returns the union mask."""
    masks = []
    for name, r in papers:
        m = X.fill_holes(X.grabcut(sk, r))
        masks.append((name, m))
    union = np.zeros(sk.shape[:2], np.uint8)
    geo = {}
    for i, (name, m) in enumerate(masks):
        above = np.zeros_like(m)
        for _, m2 in masks[i + 1:]:
            above |= m2
        own = cv2.bitwise_and(m, cv2.bitwise_not(above))
        union |= m
        layer, box = X.crop_rgba(sk, X.soft_alpha(own))
        fname = f'F05_DOT01_{prefix}_{name.upper()}.webp'
        cv2.imwrite(os.path.join(out_dir, fname), layer, [cv2.IMWRITE_WEBP_QUALITY, 90])
        geo[name] = {'box': [int(v) for v in box], 'file': fname}
        report['paper_layers'][f'{prefix}.{name}'] = {'box': [int(v) for v in box], **X.qa_alpha(f'{prefix}_{name}', layer, qa)}
    return union, geo


def motion_pngs(src_dir, out_dir, qa, report):
    os.makedirs(out_dir, exist_ok=True)
    for batch in sorted(os.listdir(src_dir)):
        for n in sorted(os.listdir(os.path.join(src_dir, batch))):
            p = os.path.join(src_dir, batch, n)
            im = cv2.imread(p, cv2.IMREAD_UNCHANGED)
            a = im[..., 3]
            ys, xs = np.nonzero(a > 8)
            pad = 6
            bx0, by0 = max(0, xs.min() - pad), max(0, ys.min() - pad)
            bx1, by1 = min(im.shape[1], xs.max() + 1 + pad), min(im.shape[0], ys.max() + 1 + pad)
            crop = im[by0:by1, bx0:bx1]
            s = min(1.0, MOTION_MAX / max(crop.shape[:2]))
            if s < 1:
                crop = cv2.resize(crop, (round(crop.shape[1] * s), round(crop.shape[0] * s)), interpolation=cv2.INTER_AREA)
            name = 'F05_DOT01_' + os.path.splitext(n)[0] + '.webp'
            cv2.imwrite(os.path.join(out_dir, name), crop, [cv2.IMWRITE_WEBP_QUALITY, 88])
            report['motion_pngs'][n] = {'batch': batch, 'source_sha256': sha(p), 'source_size': [im.shape[1], im.shape[0]], 'alpha_box': [int(bx0), int(by0), int(bx1), int(by1)],
                                        'output': name, 'output_size': [crop.shape[1], crop.shape[0]], 'scale': round(s, 4),
                                        'alpha_interior_p50': int(np.percentile(a[a > 0], 50)), 'transparent_pct': round(float((a == 0).mean()) * 100, 2)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--package', required=True, help='V9 package root (extracted)')
    ap.add_argument('--parent-out', required=True)
    ap.add_argument('--dot01-out', required=True)
    ap.add_argument('--qa', required=True)
    a = ap.parse_args()
    for d in (a.parent_out, a.dot01_out, a.qa):
        os.makedirs(d, exist_ok=True)
    skp = {k: os.path.join(a.package, '02_SHARED_SIDEKICKS', f) for k, f in (('SK01', 'SK01_PARENT_MONEY.png'), ('SK02', 'SK02_ACCOUNT_DETAILS.png'), ('SK03', 'SK03_RECEIPT_OVERLAYS.png'))}
    sk = {k: cv2.imread(p, cv2.IMREAD_COLOR) for k, p in skp.items()}
    for k, v in sk.items():
        assert v is not None and v.shape[:2] == (H, W), f'{k} must be 941 x 1672'
    report = {'seed': X.SEED, 'sidekicks': {k: {'sha256': sha(p)} for k, p in skp.items()}, 'parent_layers': {}, 'fields': {}, 'paper_layers': {}, 'motion_pngs': {}}
    parent(sk['SK01'], a.parent_out, a.qa, report)
    grain = olive_grain(sk['SK01'])
    dot01_geo = {'source': {'w': W, 'h': H}}
    for i, k in enumerate(('SK02', 'SK03')):
        cv2.imwrite(os.path.join(a.dot01_out, f'F05_DOT01_{k}.webp'), sk[k], [cv2.IMWRITE_WEBP_QUALITY, 86])
        union, geo = paper_layers(sk[k], SK02_PAPERS if k == 'SK02' else SK03_PAPERS, k, a.dot01_out, a.qa, report)
        dot01_geo[k] = geo
        # SK02: fill only under its papers (gaps stay as painted); SK03: its baked frame / pills fill the rect, replace it whole
        field, m = field_variant(sk[k], FIELD_RECT[k], grain, seed=10 + i, papers_mask=union if k == 'SK02' else None)
        # zero-motion check: field + layers back in place vs the SIDEKICK
        comp = field.astype(np.float32)
        for name, g in geo.items():
            lay = cv2.imread(os.path.join(a.dot01_out, g['file']), cv2.IMREAD_UNCHANGED)
            bx0, by0, bx1, by1 = g['box']
            al = lay[..., 3:4].astype(np.float32) / 255
            comp[by0:by1, bx0:bx1] = lay[..., :3] * al + comp[by0:by1, bx0:bx1] * (1 - al)
        dd = np.abs(comp.astype(np.int16) - sk[k].astype(np.int16)).max(axis=2)
        report['fields'][f'{k}_zero_motion_vs_sidekick'] = {'changed_pct_gt24': round(float((dd > 24).mean()) * 100, 2)}
        tile = X.seamless_tile(field, ELASTIC[0], ELASTIC[1])
        cv2.imwrite(os.path.join(a.dot01_out, f'F05_DOT01_{k}_FIELD_TILE.webp'), tile, [cv2.IMWRITE_WEBP_QUALITY, 86])
        dot01_geo[k + '_elastic'] = {'y0': ELASTIC[0], 'y1': ELASTIC[1], 'tile_h': int(tile.shape[0])}
        cv2.imwrite(os.path.join(a.dot01_out, f'F05_DOT01_{k}_FIELD.webp'), field, [cv2.IMWRITE_WEBP_QUALITY, 86])
        cv2.imwrite(os.path.join(a.qa, f'{k.lower()}_field.png'), field)
        over = sk[k].copy()
        over[m > 0] = (over[m > 0] * 0.45 + np.array((0, 255, 0)) * 0.55).astype(np.uint8)
        cv2.imwrite(os.path.join(a.qa, f'{k.lower()}_field_mask.png'), over)
        report['fields'][k] = {'rect': list(FIELD_RECT[k]), 'reconstructed_px': int(np.count_nonzero(m))}
    nav = X.fill_holes(X.grabcut(sk['SK01'], NAV_PAPER_RECT))
    nav_layer, nav_box = X.crop_rgba(sk['SK01'], X.soft_alpha(nav))
    cv2.imwrite(os.path.join(a.dot01_out, 'F05_DOT01_NAV_PAPER.webp'), nav_layer, [cv2.IMWRITE_WEBP_QUALITY, 90])
    dot01_geo['nav_paper'] = {'box': [int(v) for v in nav_box], 'file': 'F05_DOT01_NAV_PAPER.webp'}
    report['paper_layers']['SK01.nav_paper'] = {'box': [int(v) for v in nav_box], **X.qa_alpha('sk01_nav_paper', nav_layer, a.qa)}
    with open(os.path.join(a.dot01_out, 'F05_DOT01_GEOMETRY.json'), 'w') as fh:
        json.dump(dot01_geo, fh, indent=2)
    motion_pngs(os.path.join(a.package, '03_MOTION_PNG_ASSETS'), a.dot01_out, a.qa, report)
    with open(os.path.join(a.qa, 'dot01_extraction_report.json'), 'w') as fh:
        json.dump(report, fh, indent=2)
    print(json.dumps({k: v for k, v in report.items() if k not in ('motion_pngs', 'parent_layers')}, indent=1))


if __name__ == '__main__':
    main()
