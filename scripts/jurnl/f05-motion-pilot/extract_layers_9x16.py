#!/usr/bin/env python3
"""
F05 MONEY motion pilot — layer extraction, 9:16 profile (V2).

Inputs (founder references, 941 x 1672 RGB, no alpha):
  --sidekick  the text-free environment render (no title, figures, names, amounts, chips, dots, nav labels or icons)
  --reference the matching composition with its text (used only for the JURNL tag paper, which the SIDEKICK omits,
              and for type placement / fidelity). The two are separate renders: not pixel-aligned (doc 18).

Compared with the 2:3 profile (extract_layers.py) almost nothing needs reconstructing: the title paper, summary band,
card faces, nav paper and chips are text-free in the source. What still needs reconstruction:
  * the panel parchment under the four papers (they are painted on it), so papers can move and re-flow;
  * COVERED fill under the title paper and the seal (never exposed by their verified motion envelopes);
  * the JURNL ink on the tag paper (taken from the reference, then lifted with real alpha).

Deterministic (fixed seed, no generative fill). Shares its primitives with extract_layers.py.
"""

import argparse
import json
import os
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extract_layers as X  # noqa: E402

W, H = 941, 1672
# Card rects (x0, y0, x1, y1), fitted on the SIDEKICK with GrabCut; card 1's right edge follows the 404 px card width
# (GrabCut stops short at its dark painting).
CARDS = {
    'bank': (54, 794, 458, 988),
    'payout': (485, 794, 889, 990),
    'cash': (53, 1014, 456, 1226),
    'credit': (486, 1016, 890, 1228),
}
RADIUS = 20
TITLE_RECT = (70, 320, 550, 290)
SEAL_RECT = (26, 312, 140, 142)
TAG_RECT = (16, 26, 204, 136)          # on the reference
TAG_TEXT = (48, 62, 200, 116)
PANEL_INTERIOR = (34, 784, 906, 1240)
PANEL_DONOR = (24, 740, 924, 1262)
SEAM_A, SEAM_C = 905, 1195
EDGE_STRIP = (730, 826, 40, 900)       # y0, y1, x0, x1 of the panel's torn top edge


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sidekick', required=True)
    ap.add_argument('--reference', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--qa', required=True)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    os.makedirs(a.qa, exist_ok=True)
    sk = cv2.imread(a.sidekick, cv2.IMREAD_COLOR)
    ref = cv2.imread(a.reference, cv2.IMREAD_COLOR)
    assert sk is not None and sk.shape[:2] == (H, W), 'sidekick must be 941 x 1672'
    assert ref is not None and ref.shape[:2] == (H, W), 'reference must be 941 x 1672'
    shape = sk.shape
    report = {'profile': '9x16', 'sidekick': os.path.basename(a.sidekick), 'reference': os.path.basename(a.reference), 'size': [W, H], 'seed': X.SEED, 'layers': {}, 'reconstructed_regions': {}, 'covered_regions': {}}

    # silhouettes on the SIDEKICK
    seal = X.grabcut(sk, SEAL_RECT)
    title_gc = X.grabcut(sk, TITLE_RECT)
    title = X.fill_holes(title_gc)
    title = cv2.bitwise_and(title, cv2.bitwise_not(cv2.dilate(seal, np.ones((5, 5), np.uint8))))
    # olive leaves in front of the paper (left edge): keep them in the SIDEKICK, out of the paper's alpha
    hull = np.zeros_like(title)
    cnts, _ = cv2.findContours(X.fill_holes(cv2.bitwise_or(title_gc, cv2.dilate(seal, np.ones((3, 3), np.uint8)))), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(hull, [cv2.convexHull(max(cnts, key=cv2.contourArea))], -1, 255, -1)
    hsv = cv2.cvtColor(sk, cv2.COLOR_BGR2HSV)
    leafish = ((hsv[..., 0] > 18) & (hsv[..., 0] < 75) & (hsv[..., 1] > 45) & (hsv[..., 2] < 200)).astype(np.uint8) * 255
    leaves = cv2.bitwise_and(cv2.bitwise_and(hull, cv2.bitwise_not(seal)), leafish)
    leaves = cv2.morphologyEx(leaves, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    leaves[:, 200:] = 0
    title = cv2.bitwise_and(title, cv2.bitwise_not(cv2.dilate(leaves, np.ones((3, 3), np.uint8))))

    # cards: exact rounded rectangles, faces are text-free in the source
    m_cards = np.zeros(shape[:2], np.uint8)
    layers = {}
    for k, r in CARDS.items():
        rm = X.rounded_rect_mask(shape, r, RADIUS)
        m_cards |= (rm > 0).astype(np.uint8) * 255
        layers[f'card_{k}'] = X.crop_rgba(sk, rm)

    # panel under the cards (+ their shadows): two-band reconstruction from the visible panel parchment
    m_shadow = cv2.dilate(m_cards, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19)))
    shifted = np.zeros_like(m_shadow)
    shifted[9:, 4:] = m_shadow[:-9, :-4]
    m_panel = ((m_shadow | shifted | X.rounded_rect_mask(shape, PANEL_INTERIOR, 24)) > 0).astype(np.uint8) * 255

    def near(box, excl, tol):
        x0, y0, x1, y1 = box
        region = X.box_mask(shape, box)
        med = np.median(sk[y0:y1, x0:x1].reshape(-1, 3).astype(np.float32), axis=0)
        d = np.linalg.norm(sk.astype(np.float32) - med, axis=2)
        return ((d < tol) & (region > 0) & (excl == 0)).astype(np.uint8) * 255

    donor_panel = near(PANEL_DONOR, cv2.dilate(m_panel, np.ones((7, 7), np.uint8)), 34)
    env = X.synth_fill(sk, m_panel, donor_panel, seed_offset=4, hp_sigma=10.0, lf_mode='poly', P=20, amp=1.0, grow=2, feather=2.0)

    # covered fill under the title paper (inside a 9 px ring of its own paper) and the seal
    m_covered = cv2.bitwise_or(cv2.erode(title, np.ones((19, 19), np.uint8)), cv2.erode(seal, np.ones((3, 3), np.uint8)))
    env_cov = X.covered_fill(env, m_covered)

    layers['title_paper'] = X.crop_rgba(sk, X.soft_alpha(title))
    layers['wax_seal'] = X.crop_rgba(sk, X.soft_alpha(seal))

    # JURNL tag paper: from the reference (absent from the SIDEKICK), ink removed, real alpha
    tag = X.grabcut(ref, TAG_RECT)
    m_tag_text = cv2.bitwise_and(X.ink_mask(ref, TAG_TEXT, dark=True, thr=8, dil=7), tag)
    excl_tag = cv2.dilate(m_tag_text, np.ones((7, 7), np.uint8)) | cv2.bitwise_not(cv2.erode(tag, np.ones((9, 9), np.uint8)))
    x0, y0, x1, y1 = TAG_RECT[0], TAG_RECT[1], TAG_RECT[0] + TAG_RECT[2], TAG_RECT[1] + TAG_RECT[3]
    med = np.median(ref[y0:y1, x0:x1].reshape(-1, 3).astype(np.float32), axis=0)
    donor_tag = ((np.linalg.norm(ref.astype(np.float32) - med, axis=2) < 44) & (X.box_mask(shape, (x0, y0, x1 + 18, y1 + 18)) > 0) & (excl_tag == 0)).astype(np.uint8) * 255
    tag_clean = X.synth_fill(ref, m_tag_text, donor_tag, seed_offset=2, P=8, lf_mode='poly', limit=cv2.erode(tag, np.ones((3, 3), np.uint8)))
    layers['tag_paper'] = X.crop_rgba(tag_clean, X.soft_alpha(tag))

    # textures
    bx0, by0, _, _ = CARDS['bank']
    paper_tile = sk[by0 + 22:by0 + 142, bx0 + 22:bx0 + 178]
    panel_tile = X.seamless_tile(env_cov, SEAM_A, SEAM_C)
    ey0, ey1, ex0, ex1 = EDGE_STRIP
    edge = X.torn_edge_strip(env_cov, ey0, ey1, ex0, ex1)

    # write
    cv2.imwrite(os.path.join(a.out, 'F05_MOTION_SIDEKICK.webp'), env_cov, [cv2.IMWRITE_WEBP_QUALITY, 86])
    cv2.imwrite(os.path.join(a.out, 'F05_MOTION_PANEL_TILE.webp'), panel_tile, [cv2.IMWRITE_WEBP_QUALITY, 86])
    cv2.imwrite(os.path.join(a.out, 'F05_MOTION_PAPER_TILE.webp'), paper_tile, [cv2.IMWRITE_WEBP_QUALITY, 90])
    cv2.imwrite(os.path.join(a.out, 'F05_MOTION_TORN_EDGE.webp'), edge, [cv2.IMWRITE_WEBP_QUALITY, 90])
    report['layers_extra'] = {'torn_edge': X.qa_alpha('torn_edge', edge, a.qa)}
    geometry = {}
    for name, (layer, box) in layers.items():
        cv2.imwrite(os.path.join(a.out, f'F05_MOTION_{name.upper()}.webp'), layer, [cv2.IMWRITE_WEBP_QUALITY, 92])
        cv2.imwrite(os.path.join(a.qa, f'layer_{name}.png'), layer)
        geometry[name] = {'box': list(box), 'w': box[2] - box[0], 'h': box[3] - box[1]}
        report['layers'][name] = {'box': list(box), **X.qa_alpha(name, layer, a.qa)}
    for k, r in CARDS.items():
        geometry[f'card_{k}']['rect'] = [float(v) for v in r]
        geometry[f'card_{k}']['radius'] = RADIUS
    geometry['seams'] = {'a': SEAM_A, 'c': SEAM_C}
    geometry['source'] = {'w': W, 'h': H, 'profile': '9x16'}
    envelopes = {'title_paper': {'origin': [0.18, 0.70], 'scale': 1.014, 'rotate_deg': 0.0}, 'wax_seal': {'origin': [0.5, 0.5], 'scale': 1.06, 'rotate_deg': -3.0}}
    geometry['envelopes'] = envelopes
    report['motion_envelope_uncovered_px'] = {}
    for name, e in envelopes.items():
        layer, (bx0_, by0_, bx1_, by1_) = layers[name]
        h_, w_ = layer.shape[:2]
        org = (e['origin'][0] * w_, e['origin'][1] * h_)
        report['motion_envelope_uncovered_px'][name] = {
            'any_layer_pixel': X.envelope_check(layer[..., 3], org, e['scale'], e['rotate_deg']),
            'covered_fill_exposed': X.envelope_check(layer[..., 3], org, e['scale'], e['rotate_deg'], covered=m_covered[by0_:by1_, bx0_:bx1_]),
        }
    with open(os.path.join(a.out, 'F05_MOTION_GEOMETRY.json'), 'w') as fh:
        json.dump(geometry, fh, indent=2)

    # QA: masks, text-free env, zero-motion composite vs SIDEKICK (should be ~identical) and vs reference
    over = sk.copy()
    for m, col in ((m_panel, (0, 255, 0)), (m_covered, (128, 0, 255))):
        over[m > 0] = (over[m > 0] * 0.45 + np.array(col) * 0.55).astype(np.uint8)
    cv2.imwrite(os.path.join(a.qa, 'masks_overlay.png'), over)
    cv2.imwrite(os.path.join(a.qa, 'sidekick_text_free.png'), env_cov)
    cv2.imwrite(os.path.join(a.qa, 'sidekick_visible_regions_only.png'), env)
    comp = env_cov.astype(np.float32)
    for name in ('title_paper', 'wax_seal', 'card_bank', 'card_payout', 'card_cash', 'card_credit', 'tag_paper'):
        layer, (x0_, y0_, x1_, y1_) = layers[name]
        al = layer[..., 3:4].astype(np.float32) / 255
        comp[y0_:y1_, x0_:x1_] = layer[..., :3] * al + comp[y0_:y1_, x0_:x1_] * (1 - al)
    comp = comp.astype(np.uint8)
    cv2.imwrite(os.path.join(a.qa, 'zero_motion_composite_text_free.png'), comp)
    for tag_, base in (('vs_sidekick', sk), ('vs_reference', ref)):
        d = np.abs(comp.astype(np.int16) - base.astype(np.int16)).max(axis=2)
        report[f'composite_{tag_}'] = {'changed_pct_gt24': round(float((d > 24).mean()) * 100, 2), 'mean_abs': round(float(np.abs(comp.astype(np.int16) - base.astype(np.int16)).mean()), 2)}
        cv2.imwrite(os.path.join(a.qa, f'zero_motion_diff_{tag_}.png'), cv2.applyColorMap(np.clip(d * 3, 0, 255).astype(np.uint8), cv2.COLORMAP_INFERNO))
    report['reconstructed_regions'] = {'panel_under_cards': int(np.count_nonzero(m_panel)), 'tag_text': int(np.count_nonzero(m_tag_text))}
    report['covered_regions'] = {'under_title_paper_and_seal': int(np.count_nonzero(m_covered))}
    with open(os.path.join(a.qa, 'extraction_report.json'), 'w') as fh:
        json.dump(report, fh, indent=2)
    print(json.dumps({k: v for k, v in report.items() if k != 'layers'}, indent=1))
    print({k: v['box'] for k, v in report['layers'].items()})


if __name__ == '__main__':
    main()
