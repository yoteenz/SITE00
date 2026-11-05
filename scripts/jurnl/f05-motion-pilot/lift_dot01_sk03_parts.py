"""OPUS3A / OPUS3B — lift the two action pills of the SK03 SIDEKICK's own action sheet (F05_DOT01_SK03_SHEET.webp) as
standalone surfaces: the dark-olive pill with its cream rim (primary: SCAN RECEIPT, RECORD TRANSACTION, CREATE ACCOUNT,
RESOLVE ISSUES …) and the cream pill with its rim (secondary: MANUAL ENTRY, KEEP …), exactly as authorities 14–37 draw
them. A crop + a stadium alpha mask of the measured outline — no pixel is painted, nothing is generated. The baked
shadow below each pill is left out (the runtime casts a CSS drop-shadow, so the pill also casts it on any paper).

It also lifts the SK03 SIDEKICK's own laurel wax seal (F05_DOT01_SK03_FIELD.webp, a disc of radius 74.5 centred at
board 102, 401): where an overlay mounts the wide title paper over the SIDEKICK's heading paper, the frame redraws this
seal above it, so the seal is never hidden and never substituted.

Run: python -I scripts/jurnl/f05-motion-pilot/lift_dot01_sk03_parts.py   (writes SCENES/F05_DOT01_PILL_SK03_*.webp,
SCENES/F05_DOT01_SEAL_SK03.webp + F05_DOT01_PILL_SK03.json)
"""
import hashlib, json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
DOT01 = os.path.join(ROOT, 'src/projects/jurnl/families/F05_MONEY/DOT01')
SRC = os.path.join(DOT01, 'F05_DOT01_SK03_SHEET.webp')
# measured outlines (outer edge of the cream rim) on the 887 x 348 sheet: x0, y0, x1, y1 (exclusive)
PILLS = {
    'DARK': (59, 36, 829, 145),
    'CREAM': (59, 160, 828, 248),
}
PAD = 2  # transparent px kept around the outline (anti-aliased edge)


def stadium(w, h, x0, y0, x1, y1, ss=4):
    """Anti-aliased stadium (rounded ends of radius h/2) mask, supersampled."""
    W, H = w * ss, h * ss
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    xx = (xx + 0.5) / ss; yy = (yy + 0.5) / ss
    r = (y1 - y0) / 2.0
    cy = (y0 + y1) / 2.0
    cx = np.clip(xx, x0 + r, x1 - r)
    inside = ((xx - cx) ** 2 + (yy - cy) ** 2) <= r * r
    m = inside.reshape(h, ss, w, ss).mean(axis=(1, 3))
    return (m * 255).round().astype(np.uint8)


SEAL_SRC = os.path.join(DOT01, 'F05_DOT01_SK03_FIELD.webp')
SEAL = (102.0, 401.0, 74.5)  # centre x, centre y, radius (board px) — measured on the gold rim


def disc(w, h, cx, cy, r, ss=4):
    W, H = w * ss, h * ss
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    xx = (xx + 0.5) / ss; yy = (yy + 0.5) / ss
    m = (((xx - cx) ** 2 + (yy - cy) ** 2) <= r * r).reshape(h, ss, w, ss).mean(axis=(1, 3))
    return (m * 255).round().astype(np.uint8)


def main():
    src = Image.open(SRC).convert('RGBA')
    sha = hashlib.sha256(open(SRC, 'rb').read()).hexdigest()
    out = {'note': 'Action pills lifted from the SK03 SIDEKICK action sheet: crop + stadium alpha of the measured rim outline; no pixels painted.', 'source': os.path.basename(SRC), 'source_sha256': sha, 'source_size': list(src.size), 'pills': {}}
    for name, (x0, y0, x1, y1) in PILLS.items():
        cx0, cy0, cx1, cy1 = x0 - PAD, y0 - PAD, x1 + PAD, y1 + PAD
        crop = src.crop((cx0, cy0, cx1, cy1))
        w, h = crop.size
        mask = stadium(w, h, PAD, PAD, w - PAD, h - PAD)
        a = np.asarray(crop).copy()
        a[..., 3] = (a[..., 3].astype(np.uint16) * mask // 255).astype(np.uint8)
        im = Image.fromarray(a, 'RGBA')
        fn = f'F05_DOT01_PILL_SK03_{name}.webp'
        path = os.path.join(DOT01, 'SCENES', fn)
        im.save(path, 'WEBP', quality=92, method=6)
        r = (y1 - y0) / 2
        out['pills'][name] = {'runtime': fn, 'crop': [cx0, cy0, cx1, cy1], 'outline': [x0, y0, x1, y1], 'size': [w, h], 'radius': r, 'cap_slice': int(round(r + PAD + 2)), 'bytes': os.path.getsize(path)}
        print(name, w, h, os.path.getsize(path))
    cx, cy, r = SEAL
    x0, y0, x1, y1 = int(cx - r - PAD), int(cy - r - PAD), int(cx + r + PAD + 1), int(cy + r + PAD + 1)
    env = Image.open(SEAL_SRC).convert('RGBA')
    crop = env.crop((x0, y0, x1, y1))
    w, h = crop.size
    a = np.asarray(crop).copy()
    a[..., 3] = disc(w, h, cx - x0, cy - y0, r)
    path = os.path.join(DOT01, 'SCENES', 'F05_DOT01_SEAL_SK03.webp')
    Image.fromarray(a, 'RGBA').save(path, 'WEBP', quality=92, method=6)
    out['seal'] = {'runtime': 'F05_DOT01_SEAL_SK03.webp', 'source': os.path.basename(SEAL_SRC), 'source_sha256': hashlib.sha256(open(SEAL_SRC, 'rb').read()).hexdigest(), 'centre': [cx, cy], 'radius': r, 'box': [x0, y0, x1, y1], 'bytes': os.path.getsize(path)}
    print('SEAL', w, h, os.path.getsize(path))
    # per-screen wax seals of the record flow (OPUS3 gate 1): each authority's own seal, lifted with a disc alpha slightly
    # inside its measured rim (the authority text never reaches the seal; nothing is painted). Discs measured on the
    # 941 x 1672 authority PNGs (centre x, centre y, radius) and checked by overlay (evidence: seals_lift_check).
    auth = os.environ.get('JURNL_AUTHORITY_PNG')  # the V9 authority masters are not in the repository
    out['seals'] = {}
    if auth:
        import glob
        SEALS = {'16': (96, 374, 68), '17': (93, 414, 75), '18': (95, 407, 74), '19': (112, 422, 87), '20': (95, 400, 72)}
        for k, (sx, sy, sr) in SEALS.items():
            src_p = glob.glob(os.path.join(auth, f'{k}_*.png'))[0]
            im = Image.open(src_p).convert('RGBA')
            assert im.size == (941, 1672), im.size
            rr = sr - 1.5
            bx0, by0, bx1, by1 = int(sx - sr - PAD), int(sy - sr - PAD), int(sx + sr + PAD + 1), int(sy + sr + PAD + 1)
            c = np.asarray(im.crop((bx0, by0, bx1, by1))).copy()
            c[..., 3] = disc(c.shape[1], c.shape[0], sx - bx0, sy - by0, rr)
            fn = f'F05_DOT01_SEAL_{k}.webp'
            path = os.path.join(DOT01, 'SCENES', fn)
            Image.fromarray(c, 'RGBA').save(path, 'WEBP', quality=92, method=6)
            out['seals'][k] = {'runtime': fn, 'source': os.path.basename(src_p), 'source_sha256': hashlib.sha256(open(src_p, 'rb').read()).hexdigest(), 'centre': [sx, sy], 'radius': sr, 'mask_radius': rr, 'box': [bx0, by0, bx1, by1], 'bytes': os.path.getsize(path)}
            print('SEAL', k, c.shape[1], c.shape[0], os.path.getsize(path))
        # 16 RECORD TRANSACTION's scan-block illustration (receipt with its cart inside the white capture brackets, on the
        # recessed tan patch): authority 16's own pixels — no letters in it — cut on the patch's rounded outline; its right
        # side fades where the patch runs under the SCAN RECEIPT / MANUAL ENTRY pills in the authority.
        src_p = glob.glob(os.path.join(auth, '16_*.png'))[0]
        im = Image.open(src_p).convert('RGBA')
        cx0, cy0, cx1, cy1 = 58, 547, 346, 805
        c = np.asarray(im.crop((cx0, cy0, cx1, cy1))).copy()
        h, w = c.shape[:2]
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        px0, py0, py1, rad = 61 - cx0, 550 - cy0, 802 - cy0, 40.0
        # rounded left corners (the patch's outline), straight right side faded over 30 px
        dx = np.maximum(px0 + rad - xx, 0); dy = np.maximum(np.maximum(py0 + rad - yy, yy - (py1 - rad)), 0)
        inside = np.where((xx < px0 + rad) & ((yy < py0 + rad) | (yy > py1 - rad)), np.hypot(dx, dy) <= rad, (xx >= px0) & (yy >= py0) & (yy <= py1))
        m = inside.astype(np.float32)
        m *= np.clip((w - 1 - xx) / 30.0, 0, 1)
        from PIL import ImageFilter
        mi = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
        c[..., 3] = np.asarray(mi)
        path = os.path.join(DOT01, 'SCENES', 'F05_DOT01_SCANART_16.webp')
        Image.fromarray(c, 'RGBA').save(path, 'WEBP', quality=90, method=6)
        out['scan_art_16'] = {'runtime': 'F05_DOT01_SCANART_16.webp', 'source': os.path.basename(src_p), 'crop': [cx0, cy0, cx1, cy1], 'patch_outline': [61, 550, 'under the pills', 802], 'corner_radius': rad, 'right_fade_px': 30, 'bytes': os.path.getsize(path)}
        print('SCANART 16', w, h, os.path.getsize(path))
    with open(os.path.join(DOT01, 'SCENES', 'F05_DOT01_PILL_SK03.json'), 'w') as f:
        json.dump(out, f, indent=1)


if __name__ == '__main__':
    sys.exit(main())
