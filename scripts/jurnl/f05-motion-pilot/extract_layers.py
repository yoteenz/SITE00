#!/usr/bin/env python3
"""
F05 MONEY parent motion pilot — deterministic layer extraction from the founder-approved composite.

Input:  the approved parent (1024 x 1536 RGB, no alpha). It is the only native-resolution source in the pilot package.
Output: a text-free SIDEKICK environment, independently movable layers with real alpha, CSS texture tiles, and QA.

Method (no generative fill, no AI models, fixed random seeds):
  * Silhouettes: OpenCV GrabCut seeded with a rectangle (seal, title paper, JURNL tag), or exact geometry (cards).
  * Text and UI removal: ink masks (local median contrast) filled by a two-band reconstruction:
      low frequency  = Telea inpaint of a 1/4-resolution copy (smooth tone, no streaks),
      high frequency = grain copied from clean patches of the SAME material in the SAME image (overlap-blended).
    Every filled pixel is labelled RECONSTRUCTED, never "extracted".
  * Covered reconstruction: where a movable layer always covers its own footprint (its motion envelope only scales it
    up about an interior point), the environment under it is edge-continued by inpainting. Those pixels are never
    meant to be seen; frame QA in the runtime verifies they are not exposed.

Usage:
  python3 extract_layers.py --src approved_parent.png --out <runtime asset dir> --qa <qa dir>
Requires: opencv-python-headless==4.10.0.84, numpy.
"""

import argparse
import json
import os

import cv2
import numpy as np

SEED = 20261103

# ----------------------------------------------------------------------------------------------------------------------
# Measured geometry (source px of the 1024 x 1536 approved parent). See 02_ASSET_READINESS_REPORT.md.
# ----------------------------------------------------------------------------------------------------------------------
W_SRC, H_SRC = 1024, 1536
TAG_RECT = (18, 38, 236, 166)            # GrabCut rect (x, y, w, h)
TAG_TEXT = (52, 84, 228, 152)
SEARCH_CHIP = (798, 30, 884, 106)        # translucent chip behind the magnifier
PLUS_CHIP = (903, 33, 979, 107)
SEAL_RECT = (28, 276, 146, 146)
TITLE_RECT = (70, 280, 602, 285)
TITLE_TEXT = (158, 345, 600, 512)
BAND_TEXT = (100, 572, 965, 668)
BAND_DIVIDERS = [(291, 575, 304, 663), (510, 575, 523, 663), (751, 575, 764, 663)]
CARDS = {
    # approximate outer rects (x0, y0, x1, y1); exact edges are fitted below
    'bank': (72, 734, 501, 929),
    'payout': (522, 734, 951, 929),
    'cash': (72, 946, 501, 1163),
    'credit': (522, 946, 951, 1163),
}
CARD_TEXT = {
    'bank': (104, 762, 292, 908),
    'payout': (554, 762, 752, 908),
    'cash': (104, 972, 288, 1136),
    'credit': (554, 972, 690, 1136),
}
CHEVRONS = {'bank': (448, 868, 478, 910), 'payout': (898, 868, 928, 910), 'cash': (448, 1106, 478, 1148), 'credit': (898, 1106, 928, 1148)}
DOTS = (466, 1200, 558, 1226)
NAV_UI = (60, 1360, 966, 1494)
NAV_PILL = (235, 1363, 425, 1490)
PANEL_DONOR_BOX = (30, 700, 990, 1250)
PANEL_INTERIOR = (52, 731, 962, 1180)   # everything inside the panel's torn edges (cards, gaps, shadows, dots)
# Responsive seams of the environment (runtime): rows above SEAM_A are the top slice, below SEAM_C the bottom slice;
# the panel interior between them is the elastic zone (a seamless tile of the reconstructed panel).
SEAM_A, SEAM_C = 800, 1090


def rng():
    return np.random.default_rng(SEED)


def lab_L(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2LAB)[..., 0].astype(np.float32)


def ink_mask(img, box, dark=True, thr=10.0, dil=7, bg_k=41):
    """Text/icon pixels: local contrast against a median-blurred background, dilated to include anti-aliasing."""
    H, W = img.shape[:2]
    L = lab_L(img)
    x0, y0, x1, y1 = box
    roi = L[y0:y1, x0:x1]
    bg = cv2.medianBlur(np.clip(roi, 0, 255).astype(np.uint8), bg_k).astype(np.float32)
    diff = (bg - roi) if dark else (roi - bg)
    m = (diff > thr).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (dil, dil)), iterations=1)
    full = np.zeros((H, W), np.uint8)
    full[y0:y1, x0:x1] = m
    return full


def box_mask(shape, box, pad=0):
    m = np.zeros(shape[:2], np.uint8)
    x0, y0, x1, y1 = box
    m[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad] = 255
    return m


def window_ok(donor_mask, P):
    """Top-left positions where a (2P x 2P) window lies fully inside donor_mask (integral image)."""
    d = (donor_mask > 0).astype(np.uint8)
    ii = cv2.integral(d, sdepth=cv2.CV_32S)
    S = 2 * P
    tot = ii[S:, S:] - ii[:-S, S:] - ii[S:, :-S] + ii[:-S, :-S]
    ys, xs = np.where(tot == S * S)
    return ys, xs


def poly_lf(img, mask, donor_mask, pad=70, deg=3, sigma=5.0, decay=22.0, grow=12, limit=None):
    """Smooth lighting for large regions: a low-order polynomial fitted to clean material around the region, plus the
    boundary residual diffused inward so the fill meets its surroundings exactly."""
    H, W = img.shape[:2]
    f = cv2.GaussianBlur(img.astype(np.float32), (0, 0), sigma)
    ys, xs = np.where(mask > 0)
    y0, y1, x0, x1 = max(0, ys.min() - pad), min(H, ys.max() + pad), max(0, xs.min() - pad), min(W, xs.max() + pad)
    dm = donor_mask[y0:y1, x0:x1] > 0
    py, px = np.where(dm)
    r = np.random.default_rng(SEED)
    if len(py) > 30000:
        k = r.choice(len(py), 30000, replace=False)
        py, px = py[k], px[k]
    hh, ww = y1 - y0, x1 - x0
    def mono(yy, xx):
        u = xx / max(ww - 1, 1) * 2 - 1
        v = yy / max(hh - 1, 1) * 2 - 1
        return np.stack([u ** i * v ** j for i in range(deg + 1) for j in range(deg + 1 - i)], axis=-1)
    A = mono(py.astype(np.float32), px.astype(np.float32))
    region = f[y0:y1, x0:x1]
    gy, gx = np.mgrid[0:hh, 0:ww].astype(np.float32)
    M = mono(gy, gx)
    lf_box = np.zeros((hh, ww, 3), np.float32)
    for c in range(3):
        coef, *_ = np.linalg.lstsq(A, region[py, px, c], rcond=None)
        lf_box[..., c] = M @ coef
    # boundary residual diffusion. The replaced zone includes the blend feather around the mask, so no blurred ink
    # from the original can leak into the fill; the residual is read on a ring outside that zone.
    mk = (cv2.dilate(mask[y0:y1, x0:x1], cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * grow + 1, 2 * grow + 1))) > 0).astype(np.uint8) * 255
    resid = region - lf_box
    if limit is not None:
        lim = limit[y0:y1, x0:x1] > 0
        mk = np.where(lim, mk, 0).astype(np.uint8)
        resid = np.where(lim[..., None], resid, 0)  # other materials beyond the paper edge do not tint the fill
    res8 = np.clip(resid + 128, 0, 255).astype(np.uint8)
    res_in = cv2.inpaint(res8, mk, 9, cv2.INPAINT_TELEA).astype(np.float32) - 128
    dist = cv2.distanceTransform(mk, cv2.DIST_L2, 5)
    wgt = np.exp(-dist / decay)[..., None]
    out = f.copy()
    out[y0:y1, x0:x1] = np.where(mk[..., None] > 0, lf_box + res_in * wgt, region)
    return out


def synth_fill(img, mask, donor_mask, seed_offset=0, lf_sigma=7.0, hp_sigma=3.5, P=12, feather=3.0, lf_mode='inpaint', limit=None, amp=1.15, grow=12):
    """Two-band reconstruction of `mask` pixels from the same image's clean `donor_mask` material."""
    H, W = img.shape[:2]
    f = img.astype(np.float32)
    if lf_mode == 'poly':
        lf = poly_lf(img, mask, donor_mask, limit=limit, grow=grow)
    else:
        small = cv2.resize(img, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
        msmall = (cv2.resize(mask, (W // 4, H // 4), interpolation=cv2.INTER_AREA) > 10).astype(np.uint8) * 255
        msmall = cv2.dilate(msmall, np.ones((3, 3), np.uint8))
        lf_small = cv2.inpaint(small, msmall, 5, cv2.INPAINT_TELEA)
        lf = cv2.GaussianBlur(cv2.resize(lf_small, (W, H), interpolation=cv2.INTER_CUBIC).astype(np.float32), (0, 0), lf_sigma)
    hp = f - cv2.GaussianBlur(f, (0, 0), hp_sigma)
    # clip grain outliers (single bright fibres would otherwise repeat visibly)
    sd = hp[donor_mask > 0].std() if np.any(donor_mask) else 1.0
    hp = np.clip(hp, -2.6 * sd, 2.6 * sd)
    clean = cv2.erode(donor_mask, np.ones((3, 3), np.uint8))
    ys_ok, xs_ok = window_ok(clean, P)
    while len(ys_ok) < 40 and P > 4:
        P -= 2
        ys_ok, xs_ok = window_ok(clean, P)
    if len(ys_ok) == 0:
        raise RuntimeError('no clean donor window for synth_fill')
    r = np.random.default_rng(SEED + seed_offset)
    ys, xs = np.where(mask > 0)
    if len(ys) == 0:
        return img.copy()
    by0, by1, bx0, bx1 = max(0, ys.min() - P), min(H, ys.max() + 1 + P), max(0, xs.min() - P), min(W, xs.max() + 1 + P)
    th, tw = by1 - by0, bx1 - bx0
    tex = np.zeros((th, tw, 3), np.float32)
    wsum = np.zeros((th, tw, 1), np.float32)
    win = (np.outer(np.hanning(2 * P), np.hanning(2 * P))[..., None] + 1e-3).astype(np.float32)
    for ty in range(-P, th, P):
        for tx in range(-P, tw, P):
            k = r.integers(0, len(ys_ok))
            oy, ox = ys_ok[k], xs_ok[k]
            patch = hp[oy:oy + 2 * P, ox:ox + 2 * P]
            if r.random() < 0.5:
                patch = patch[:, ::-1]
            yA, xA = max(0, ty), max(0, tx)
            yB, xB = min(th, ty + 2 * P), min(tw, tx + 2 * P)
            if yB <= yA or xB <= xA:
                continue
            tex[yA:yB, xA:xB] += patch[yA - ty:yB - ty, xA - tx:xB - tx] * win[yA - ty:yB - ty, xA - tx:xB - tx]
            wsum[yA:yB, xA:xB] += win[yA - ty:yB - ty, xA - tx:xB - tx]
    tex /= np.maximum(wsum, 1e-3)
    ref = hp[donor_mask > 0].std()
    tex *= min(amp, ref / max(tex.std(), 1e-3))
    fill = lf.copy()
    fill[by0:by1, bx0:bx1] += tex
    soft = cv2.GaussianBlur(cv2.dilate(mask, np.ones((5, 5), np.uint8)).astype(np.float32) / 255, (0, 0), feather)[..., None]
    soft = np.clip(soft * 1.25, 0, 1)
    soft = np.maximum(soft, (mask > 0).astype(np.float32)[..., None])
    if limit is not None:
        soft = soft * (limit > 0).astype(np.float32)[..., None]
    return np.clip(f * (1 - soft) + fill * soft, 0, 255).astype(np.uint8)


def covered_fill(img, mask):
    """Edge continuation under an always-covering movable layer (never meant to be visible)."""
    H, W = img.shape[:2]
    small = cv2.resize(img, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
    ms = (cv2.resize(mask, (W // 2, H // 2), interpolation=cv2.INTER_AREA) > 10).astype(np.uint8) * 255
    filled = cv2.resize(cv2.inpaint(small, ms, 9, cv2.INPAINT_TELEA), (W, H), interpolation=cv2.INTER_CUBIC)
    near = cv2.inpaint(img, mask, 5, cv2.INPAINT_TELEA)
    # near the boundary use the full-resolution continuation, deeper inside the smooth one
    dist = cv2.distanceTransform((mask > 0).astype(np.uint8), cv2.DIST_L2, 5)
    w = np.clip(dist / 14.0, 0, 1)[..., None]
    out = near.astype(np.float32) * (1 - w) + filled.astype(np.float32) * w
    m3 = (mask > 0)[..., None]
    return np.where(m3, out, img.astype(np.float32)).astype(np.uint8)


def grabcut(img, rect, iters=8):
    mask = np.zeros(img.shape[:2], np.uint8)
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.setRNGSeed(SEED)
    cv2.grabCut(img, mask, rect, bgd, fgd, iters, cv2.GC_INIT_WITH_RECT)
    m = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    if n > 1:
        k = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        m = np.where(lab == k, 255, 0).astype(np.uint8)
    return cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))


def fill_holes(m):
    """Fill interior holes (letter counters, ink) of a binary silhouette; holes open to the outside stay open."""
    h, w = m.shape
    flood = m.copy()
    ff = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(flood, ff, (0, 0), 255)
    return m | cv2.bitwise_not(flood)


def soft_alpha(m, sigma=0.8):
    """Anti-aliased alpha from a binary mask: shrink by half a pixel, then blur (no background halo)."""
    e = cv2.erode(m, np.ones((2, 2), np.uint8))
    return cv2.GaussianBlur(e.astype(np.float32), (0, 0), sigma).clip(0, 255).astype(np.uint8)


def rounded_rect_mask(shape, rect, radius, ss=4):
    """Exact anti-aliased rounded rectangle (supersampled)."""
    H, W = shape[:2]
    x0, y0, x1, y1 = rect
    big = np.zeros((H * ss, W * ss), np.uint8)
    r = int(radius * ss)
    X0, Y0, X1, Y1 = int(x0 * ss), int(y0 * ss), int(x1 * ss), int(y1 * ss)
    cv2.rectangle(big, (X0 + r, Y0), (X1 - r, Y1), 255, -1)
    cv2.rectangle(big, (X0, Y0 + r), (X1, Y1 - r), 255, -1)
    for cx, cy in ((X0 + r, Y0 + r), (X1 - r, Y0 + r), (X0 + r, Y1 - r), (X1 - r, Y1 - r)):
        cv2.circle(big, (cx, cy), r, 255, -1)
    return cv2.resize(big, (W, H), interpolation=cv2.INTER_AREA)


def fit_card(img, approx):
    """Fit the card's outer rect from its raised rim: GrabCut inside a padded rect, then the robust bounding box."""
    x0, y0, x1, y1 = approx
    m = grabcut(img, (x0, y0, x1 - x0, y1 - y0), iters=6)
    ys, xs = np.where(m > 0)
    # robust extents (ignore a few stray pixels)
    fx0, fx1 = np.percentile(xs, 0.4), np.percentile(xs, 99.6)
    fy0, fy1 = np.percentile(ys, 0.4), np.percentile(ys, 99.6)
    return (float(fx0), float(fy0), float(fx1 + 1), float(fy1 + 1)), m


def rgba(img, alpha):
    return np.dstack([img, alpha])


def crop_rgba(img, alpha, pad=2):
    ys, xs = np.where(alpha > 0)
    y0, y1, x0, x1 = max(0, ys.min() - pad), min(img.shape[0], ys.max() + 1 + pad), max(0, xs.min() - pad), min(img.shape[1], xs.max() + 1 + pad)
    return rgba(img[y0:y1, x0:x1], alpha[y0:y1, x0:x1]), (int(x0), int(y0), int(x1), int(y1))


def checker(h, w, s=12):
    yy, xx = np.mgrid[0:h, 0:w]
    c = (((yy // s) + (xx // s)) % 2).astype(np.uint8)
    return np.where(c[..., None] == 1, np.array([205, 205, 205], np.uint8), np.array([250, 250, 250], np.uint8)).astype(np.uint8)


def qa_alpha(name, layer, qa_dir):
    """Layer over checkerboard, magenta, black and white; plus 4x edge zoom over magenta (halo inspection)."""
    a = layer[..., 3:4].astype(np.float32) / 255
    rgb = layer[..., :3].astype(np.float32)
    h, w = layer.shape[:2]
    bgs = [checker(h, w), np.full((h, w, 3), (180, 0, 180), np.uint8), np.zeros((h, w, 3), np.uint8), np.full((h, w, 3), 255, np.uint8)]
    tiles = [(rgb * a + b.astype(np.float32) * (1 - a)).astype(np.uint8) for b in bgs]
    sheet = np.hstack(tiles) if w < 600 else np.vstack(tiles)
    cv2.imwrite(os.path.join(qa_dir, f'alpha_{name}.png'), sheet)
    # edge zoom: the first contour segment with partial alpha
    edge = np.where((layer[..., 3] > 10) & (layer[..., 3] < 245))
    if len(edge[0]):
        k = len(edge[0]) // 3
        cy, cx = edge[0][k], edge[1][k]
        y0, x0 = max(0, cy - 30), max(0, cx - 30)
        z = tiles[1][y0:y0 + 60, x0:x0 + 60]
        cv2.imwrite(os.path.join(qa_dir, f'halo_{name}.png'), cv2.resize(z, None, fx=4, fy=4, interpolation=cv2.INTER_NEAREST))
    return {
        'alpha_min': int(layer[..., 3].min()),
        'alpha_max': int(layer[..., 3].max()),
        'transparent_px': int((layer[..., 3] == 0).sum()),
        'partial_px': int(((layer[..., 3] > 0) & (layer[..., 3] < 255)).sum()),
        'opaque_px': int((layer[..., 3] == 255).sum()),
    }


def seamless_tile(env, y0, y1, x0=0, x1=W_SRC, blend=56):
    """Vertical tile of env rows [y0, y1) whose TOP rows cross-fade into the rows just below y1. Placed after row y1 - 1
    and repeated, every junction is continuous: (y1 - 1) -> tile top ~ y1, tile bottom (y1 - 1) -> tile top, and the
    last tile bottom (y1 - 1) -> the bottom slice starting at y1."""
    t = env[y0:y1, x0:x1].astype(np.float32).copy()
    below = env[y1:y1 + blend, x0:x1].astype(np.float32)
    w = np.linspace(1, 0, blend, dtype=np.float32)[:, None, None]
    t[:blend] = below * w + t[:blend] * (1 - w)
    # Flatten the vertical lighting ramp so repeats do not read as bands: each row's (smoothed) mean over the panel
    # parchment is moved to the mean of the tile's last rows, which meet the bottom slice.
    cols = slice(60, 960)
    row_mean = cv2.GaussianBlur(t[:, cols].mean(axis=1, keepdims=True), (0, 0), sigmaX=0.1, sigmaY=24)
    target = row_mean[-8:].mean(axis=0, keepdims=True)
    t += (target - row_mean)
    return np.clip(t, 0, 255).astype(np.uint8)


def torn_edge_strip(img, y0=676, y1=772, x0=36, x1=982):
    """The panel paper's torn top edge with real alpha (parchment against the dark band), for dressing paper sheets."""
    roi = img[y0:y1].copy()
    L = lab_L(roi)
    a = np.clip((L - 95.0) / 45.0, 0, 1)
    a[:, :x0] = 0
    a[:, x1:] = 0
    # below the edge the panel is solid parchment
    a[60:, x0:x1] = 1.0
    a = cv2.GaussianBlur(a, (0, 0), 0.7)
    return np.dstack([roi, (a * 255).astype(np.uint8)])[:, x0:x1]


def envelope_check(alpha, origin, s_max, rot_deg, steps=16, covered=None):
    """Max count of originally opaque pixels left uncovered while the layer scales s_max -> 1 and turns rot_deg -> 0
    about `origin` (layer px). 0 means the environment under the layer is never exposed."""
    h, w = alpha.shape
    pad = 24
    base = cv2.copyMakeBorder(alpha, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
    ox, oy = origin[0] + pad, origin[1] + pad
    worst = 0
    for t in np.linspace(0, 1, steps):
        s_ = 1 + (s_max - 1) * t
        r_ = rot_deg * t
        M = cv2.getRotationMatrix2D((ox, oy), -r_, s_)
        warped = cv2.warpAffine(base, M, (base.shape[1], base.shape[0]), flags=cv2.INTER_LINEAR, borderValue=0)
        exposed = (base > 200) & (warped < 128)
        if covered is not None:
            exposed &= cv2.copyMakeBorder(covered, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0) > 0
        worst = max(worst, int(exposed.sum()))
    return worst


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--qa', required=True)
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    os.makedirs(args.qa, exist_ok=True)
    src = cv2.imread(args.src, cv2.IMREAD_COLOR)
    assert src is not None and src.shape[:2] == (H_SRC, W_SRC), 'approved parent must be 1024 x 1536'
    report = {'source': os.path.basename(args.src), 'size': [W_SRC, H_SRC], 'seed': SEED, 'layers': {}, 'reconstructed_regions': {}, 'covered_regions': {}}
    shape = src.shape

    # --- silhouettes ---------------------------------------------------------------------------------------------------
    seal = grabcut(src, SEAL_RECT)
    tag = grabcut(src, TAG_RECT)
    title_gc = grabcut(src, TITLE_RECT)
    title = fill_holes(title_gc)
    title = cv2.bitwise_and(title, cv2.bitwise_not(cv2.dilate(seal, np.ones((5, 5), np.uint8))))
    # front leaves: inside the title paper's hull but excluded by GrabCut and not the seal (olive leaves over the paper)
    hull = np.zeros_like(title)
    cnts, _ = cv2.findContours(fill_holes(cv2.bitwise_or(title_gc, cv2.dilate(seal, np.ones((3, 3), np.uint8)))), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(hull, [cv2.convexHull(max(cnts, key=cv2.contourArea))], -1, 255, -1)
    hsv = cv2.cvtColor(src, cv2.COLOR_BGR2HSV)
    leafish = ((hsv[..., 0] > 18) & (hsv[..., 0] < 75) & (hsv[..., 1] > 45) & (hsv[..., 2] < 200)).astype(np.uint8) * 255
    leaves = cv2.bitwise_and(cv2.bitwise_and(cv2.bitwise_and(hull, cv2.bitwise_not(title)), cv2.bitwise_not(seal)), leafish)
    leaves = cv2.morphologyEx(leaves, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    leaves[:, 200:] = 0  # the olive branch at the left only
    # leaves also sit in front of the title paper inside the paper: remove them from the title alpha
    title = cv2.bitwise_and(title, cv2.bitwise_not(cv2.dilate(leaves, np.ones((3, 3), np.uint8))))

    # --- text / UI masks ------------------------------------------------------------------------------------------------
    m_tag_text = cv2.bitwise_and(ink_mask(src, TAG_TEXT, dark=True, thr=8, dil=7), tag)
    m_title_text = cv2.bitwise_and(ink_mask(src, TITLE_TEXT, dark=True, thr=7, dil=9), title)
    m_band = ink_mask(src, BAND_TEXT, dark=False, thr=10, dil=7)
    for b in BAND_DIVIDERS:
        m_band |= box_mask(shape, b)
    m_chips = box_mask(shape, SEARCH_CHIP) | box_mask(shape, PLUS_CHIP)
    m_dots = box_mask(shape, DOTS)
    m_nav = ink_mask(src, NAV_UI, dark=True, thr=9, dil=9) | box_mask(shape, NAV_PILL, pad=4)

    # --- cards --------------------------------------------------------------------------------------------------------
    card_geo = {}
    m_cards = np.zeros(shape[:2], np.uint8)
    for k, approx in CARDS.items():
        rect, _ = fit_card(src, approx)
        card_geo[k] = rect
        r = rounded_rect_mask(shape, rect, 19)
        m_cards |= (r > 0).astype(np.uint8) * 255
    # card shadows fall below and right on the panel: include them in the panel reconstruction
    m_card_shadow = cv2.dilate(m_cards, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19)))
    shifted = np.zeros_like(m_card_shadow)
    shifted[8:, 4:] = m_card_shadow[:-8, :-4]
    m_panel_fill = cv2.bitwise_or(m_card_shadow, shifted) | m_dots | rounded_rect_mask(shape, PANEL_INTERIOR, 24)
    m_panel_fill = (m_panel_fill > 0).astype(np.uint8) * 255

    # --- materials (donor masks): clean pixels of the same material --------------------------------------------------
    def near_color(box, excl, tol):
        x0, y0, x1, y1 = box
        region = box_mask(shape, box)
        roi = src[y0:y1, x0:x1].reshape(-1, 3).astype(np.float32)
        med = np.median(roi, axis=0)
        d = np.linalg.norm(src.astype(np.float32) - med, axis=2)
        return ((d < tol) & (region > 0) & (excl == 0)).astype(np.uint8) * 255

    excl_title = cv2.dilate(m_title_text, np.ones((7, 7), np.uint8)) | cv2.bitwise_not(cv2.erode(title, np.ones((25, 25), np.uint8)))
    donor_title = near_color((90, 300, 660, 545), excl_title, 38)
    excl_band = cv2.dilate(m_band, np.ones((9, 9), np.uint8)) | title | leaves
    donor_band = near_color((100, 560, 975, 696), excl_band, 30)
    excl_tag = cv2.dilate(m_tag_text, np.ones((7, 7), np.uint8)) | cv2.bitwise_not(cv2.erode(tag, np.ones((9, 9), np.uint8)))
    donor_tag = near_color((18, 38, 254, 204), excl_tag, 44)
    excl_panel = cv2.dilate(m_panel_fill, np.ones((7, 7), np.uint8))
    donor_panel = near_color(PANEL_DONOR_BOX, excl_panel, 30)
    excl_nav = cv2.dilate(m_nav, np.ones((9, 9), np.uint8))
    donor_nav = near_color((20, 1372, 1004, 1500), excl_nav, 30)
    stone_region = box_mask(shape, (780, 0, 1024, 30)) | box_mask(shape, (884, 30, 903, 100)) | box_mask(shape, (979, 24, 1024, 96)) | box_mask(shape, (760, 0, 800, 100))
    stone_med = np.median(src[stone_region > 0].reshape(-1, 3).astype(np.float32), axis=0)
    donor_stone = ((np.linalg.norm(src.astype(np.float32) - stone_med, axis=2) < 46) & (stone_region > 0) & (cv2.dilate(m_chips, np.ones((9, 9), np.uint8)) == 0)).astype(np.uint8) * 255

    # --- SIDEKICK (text-free environment) -----------------------------------------------------------------------------
    env = src.copy()
    env = synth_fill(env, m_chips, donor_stone, seed_offset=1, P=8)
    env = synth_fill(env, m_tag_text, donor_tag, seed_offset=2, P=8, lf_mode='poly', limit=cv2.erode(tag, np.ones((3, 3), np.uint8)))
    env = synth_fill(env, m_band, donor_band, seed_offset=3)
    env = synth_fill(env, m_panel_fill, donor_panel, seed_offset=4, hp_sigma=10.0, lf_mode='poly', P=20, amp=1.0, grow=2, feather=2.0)
    env = synth_fill(env, m_nav, donor_nav, seed_offset=5, P=10, lf_mode='poly')
    # title text is removed from the title LAYER (below); the environment under the title and the seal is covered.
    title_paper_clean = synth_fill(src, m_title_text, donor_title, seed_offset=6, hp_sigma=3.5, lf_sigma=7.0)
    # Under the title, keep a 9 px ring of the paper's own (text-free) pixels: anything a notch could ever expose during
    # the settle is paper, never the edge-continued fill. Under the seal the envelope never exposes anything.
    m_covered = cv2.bitwise_or(cv2.erode(title, np.ones((19, 19), np.uint8)), cv2.erode(seal, np.ones((3, 3), np.uint8)))
    env = np.where(cv2.dilate(title, np.ones((3, 3), np.uint8))[..., None] > 0, title_paper_clean, env)
    env_covered = covered_fill(env, m_covered)

    # --- layers ---------------------------------------------------------------------------------------------------
    layers = {}
    a_title = soft_alpha(title)
    layers['title_paper'] = crop_rgba(title_paper_clean, a_title)
    layers['wax_seal'] = crop_rgba(src, soft_alpha(seal))
    # The olive leaves in front of the title paper stay in the SIDEKICK; the title layer carries matching notches
    # (GrabCut excluded them) and its settle is anchored beside them, so a separate leaf layer is not needed.
    card_clean = src.copy()
    for k in CARDS:
        rect = card_geo[k]
        rm = rounded_rect_mask(shape, rect, 19)
        txt = cv2.bitwise_and(ink_mask(src, CARD_TEXT[k], dark=True, thr=9, dil=7), (rm > 250).astype(np.uint8) * 255)
        chev = ink_mask(src, CHEVRONS[k], dark=True, thr=14, dil=5)
        x0, y0, x1, y1 = (int(round(v)) for v in rect)
        excl = cv2.dilate(txt | chev, np.ones((9, 9), np.uint8)) | cv2.bitwise_not(cv2.erode((rm > 250).astype(np.uint8) * 255, np.ones((21, 21), np.uint8)))
        donor = near_color((x0, y0, min(x1, CARD_TEXT[k][2] + 30), y1), excl, 26)
        card_clean = synth_fill(card_clean, txt, donor, seed_offset=10 + len(k), P=8)
        chev_donor = near_color((CHEVRONS[k][0] - 26, CHEVRONS[k][1] - 22, CHEVRONS[k][2] + 10, CHEVRONS[k][3] + 8), cv2.dilate(chev, np.ones((7, 7), np.uint8)), 30)
        if np.count_nonzero(chev) and len(window_ok(chev_donor, 5)[0]):
            card_clean = synth_fill(card_clean, chev, chev_donor, seed_offset=20 + len(k), P=5, feather=1.5)
        layers[f'card_{k}'] = crop_rgba(card_clean, rm)
        report['reconstructed_regions'][f'card_{k}_text'] = int(np.count_nonzero(txt))
        report['reconstructed_regions'][f'card_{k}_chevron'] = int(np.count_nonzero(chev))

    # texture tile for CSS papers (empty slots, action papers): clean parchment of the bank card
    bx0, by0, bx1, by1 = (int(round(v)) for v in card_geo['bank'])
    # clean parchment only: left of the village painting's torn edge (x ≈ 270 at the card's foot)
    paper_tile = card_clean[by0 + 20:by0 + 140, bx0 + 20:bx0 + 176]
    # elastic panel tile (repeat-y), from the reconstructed panel interior
    panel_tile = seamless_tile(env_covered, SEAM_A, SEAM_C)
    edge_strip = torn_edge_strip(env_covered)

    # --- write ------------------------------------------------------------------------------------------------------
    q = [cv2.IMWRITE_WEBP_QUALITY, 90]
    cv2.imwrite(os.path.join(args.out, 'F05_MOTION_SIDEKICK.webp'), env_covered, [cv2.IMWRITE_WEBP_QUALITY, 86])
    cv2.imwrite(os.path.join(args.out, 'F05_MOTION_PANEL_TILE.webp'), panel_tile, [cv2.IMWRITE_WEBP_QUALITY, 86])
    cv2.imwrite(os.path.join(args.out, 'F05_MOTION_PAPER_TILE.webp'), paper_tile, q)
    cv2.imwrite(os.path.join(args.out, 'F05_MOTION_TORN_EDGE.webp'), edge_strip, [cv2.IMWRITE_WEBP_QUALITY, 90])
    report['layers_extra'] = {'torn_edge': qa_alpha('torn_edge', edge_strip, args.qa)}
    geometry = {}
    for name, (layer, box) in layers.items():
        cv2.imwrite(os.path.join(args.out, f'F05_MOTION_{name.upper()}.webp'), layer, [cv2.IMWRITE_WEBP_QUALITY, 92])
        cv2.imwrite(os.path.join(args.qa, f'layer_{name}.png'), layer)
        geometry[name] = {'box': list(box), 'w': box[2] - box[0], 'h': box[3] - box[1]}
        report['layers'][name] = {'box': list(box), **qa_alpha(name, layer, args.qa)}
    for k, rect in card_geo.items():
        geometry[f'card_{k}']['rect'] = [round(v, 1) for v in rect]
        geometry[f'card_{k}']['radius'] = 19
    geometry['seams'] = {'a': SEAM_A, 'c': SEAM_C}
    # Motion envelopes used by the runtime (jurnl-f05-motion.css). Origins are fractions of the layer box.
    envelopes = {'title_paper': {'origin': [0.18, 0.70], 'scale': 1.014, 'rotate_deg': 0.0}, 'wax_seal': {'origin': [0.5, 0.5], 'scale': 1.06, 'rotate_deg': -3.0}}
    geometry['envelopes'] = envelopes
    report['motion_envelope_uncovered_px'] = {}
    for name, env_ in envelopes.items():
        layer, (bx0, by0, bx1, by1) = layers[name]
        h_, w_ = layer.shape[:2]
        org = (env_['origin'][0] * w_, env_['origin'][1] * h_)
        report['motion_envelope_uncovered_px'][name] = {
            'any_layer_pixel': envelope_check(layer[..., 3], org, env_['scale'], env_['rotate_deg']),
            'covered_fill_exposed': envelope_check(layer[..., 3], org, env_['scale'], env_['rotate_deg'], covered=m_covered[by0:by1, bx0:bx1]),
        }
    geometry['source'] = {'w': W_SRC, 'h': H_SRC}
    with open(os.path.join(args.out, 'F05_MOTION_GEOMETRY.json'), 'w') as fh:
        json.dump(geometry, fh, indent=2)

    # QA images: masks overlay, text-free environment, covered regions, zero-motion composite vs source
    over = src.copy()
    for m, col in ((m_title_text, (0, 0, 255)), (m_band, (0, 200, 255)), (m_tag_text, (255, 0, 255)), (m_chips, (255, 0, 0)), (m_panel_fill, (0, 255, 0)), (m_nav, (255, 255, 0)), (m_covered, (128, 0, 255))):
        over[m > 0] = (over[m > 0] * 0.45 + np.array(col) * 0.55).astype(np.uint8)
    cv2.imwrite(os.path.join(args.qa, 'masks_overlay.png'), over)
    cv2.imwrite(os.path.join(args.qa, 'sidekick_text_free.png'), env_covered)
    cv2.imwrite(os.path.join(args.qa, 'sidekick_visible_regions_only.png'), env)  # before covered fill (what is visible)
    comp = env_covered.astype(np.float32)
    for name in ('title_paper', 'wax_seal', 'card_bank', 'card_payout', 'card_cash', 'card_credit'):
        layer, (x0, y0, x1, y1) = layers[name]
        a = layer[..., 3:4].astype(np.float32) / 255
        comp[y0:y1, x0:x1] = layer[..., :3] * a + comp[y0:y1, x0:x1] * (1 - a)
    comp = comp.astype(np.uint8)
    cv2.imwrite(os.path.join(args.qa, 'zero_motion_composite_text_free.png'), comp)
    diff = np.abs(comp.astype(np.int16) - src.astype(np.int16)).max(axis=2)
    report['composite_vs_source'] = {
        'changed_px_gt24': int((diff > 24).sum()),
        'changed_pct_gt24': round(float((diff > 24).mean()) * 100, 2),
        'expected_changes': 'text, values, icons, chips, dots, nav pill and card shadows (redrawn live / by CSS)',
    }
    cv2.imwrite(os.path.join(args.qa, 'zero_motion_diff.png'), cv2.applyColorMap(np.clip(diff * 3, 0, 255).astype(np.uint8), cv2.COLORMAP_INFERNO))
    report['reconstructed_regions'].update({
        'chips': int(np.count_nonzero(m_chips)), 'tag_text': int(np.count_nonzero(m_tag_text)), 'title_text': int(np.count_nonzero(m_title_text)),
        'band_text': int(np.count_nonzero(m_band)), 'panel_under_cards': int(np.count_nonzero(m_panel_fill)), 'nav_ui': int(np.count_nonzero(m_nav)),
    })
    report['covered_regions'] = {'under_title_paper_and_seal': int(np.count_nonzero(m_covered))}
    with open(os.path.join(args.qa, 'extraction_report.json'), 'w') as fh:
        json.dump(report, fh, indent=2)
    print(json.dumps({k: v for k, v in report.items() if k != 'layers'}, indent=1))
    print({k: v['box'] for k, v in report['layers'].items()})


if __name__ == '__main__':
    main()
