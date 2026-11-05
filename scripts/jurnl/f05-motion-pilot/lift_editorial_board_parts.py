"""EDITORIAL OVERLAYS (founder eight-panel board) — lift the board's own decorative subjects as cut-outs, so every global
overlay draws the authority's imagery instead of rectangular scene crops and stretched papers.

Two sources, both approved, nothing generated:
  * the founder board itself (JURNL/MANIFEST/JURNL_EDITORIAL_OVERLAYS_OPUS2_V1/input/FOUNDER_EIGHT_PANEL_BOARD.webp,
    1448 x 1086): the subjects drawn only there — the money-bag, classical-head and caution laurel medallions, the coin
    stack, the red wax direction seal, the copper paper clip, the stack of ledgers, the columns, the coin and the
    amphora, the red drapes and the painted landscapes. Each is a crop of the panel, resampled 2x (Lanczos) and given an
    alpha from a graph-cut segmentation (OpenCV GrabCut, seeded by measured boxes / polygons) or a colour key.
  * the parent SIDEKICK SK01 (JURNL/F05_MONEY_DOT01/INPUT_V9/SIDEKICKS/SK01_PARENT_MONEY.png, 941 x 1672) for the
    same classical bust and arch the board draws, at 2.7x the board's resolution.

The lettering on the ledgers' spines is removed (classical Telea inpainting from the spine's own pixels): no text is
baked into the artwork. Nothing is painted by hand and no image model is used.

Run: python -I scripts/jurnl/f05-motion-pilot/lift_editorial_board_parts.py
Writes src/projects/jurnl/families/F05_MONEY/EDITORIAL/F05_ED_*.webp and F05_ED_PARTS.json (provenance + geometry).
"""
import hashlib, json, os, sys
import cv2
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
BOARD = os.path.join(ROOT, 'JURNL/MANIFEST/JURNL_EDITORIAL_OVERLAYS_OPUS2_V1/input/FOUNDER_EIGHT_PANEL_BOARD.webp')
SK01 = os.path.join(ROOT, 'JURNL/F05_MONEY_DOT01/INPUT_V9/SIDEKICKS/SK01_PARENT_MONEY.png')
OUT = os.path.join(ROOT, 'src/projects/jurnl/families/F05_MONEY/EDITORIAL')
PREVIEW = os.environ.get('JURNL_ED_PREVIEW')  # optional: a folder for checker-board previews of every cut-out

# the eight panels on the board: origin (x, y) and size (w, h), board px
COLS = [(18, 364), (378, 715), (728, 1070), (1083, 1432)]
ROWS = [(140, 600), (644, 1058)]
PANELS = {f'{i + 1:02d}': (COLS[i % 4][0], ROWS[i // 4][0], COLS[i % 4][1] - COLS[i % 4][0], ROWS[i // 4][1] - ROWS[i // 4][0]) for i in range(8)}
Z = 2  # every board lift is stored at 2x the board (Lanczos)


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def grabcut(rgb, box, fg=(), bg=(), probable_fg=(), iters=6):
    """GrabCut inside `box` (x0, y0, x1, y1 in rgb px); polygons seed definite fg / bg / probable fg. Returns 0..255."""
    h, w = rgb.shape[:2]
    m = np.full((h, w), cv2.GC_BGD, np.uint8)
    x0, y0, x1, y1 = box
    m[max(0, y0):min(h, y1), max(0, x0):min(w, x1)] = cv2.GC_PR_BGD
    for poly in probable_fg:
        cv2.fillPoly(m, [np.array(poly, np.int32)], cv2.GC_PR_FGD)
    for poly in fg:
        cv2.fillPoly(m, [np.array(poly, np.int32)], cv2.GC_FGD)
    for poly in bg:
        cv2.fillPoly(m, [np.array(poly, np.int32)], cv2.GC_BGD)
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), m, None, bgd, fgd, iters, cv2.GC_INIT_WITH_MASK)
    a = np.where((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    return a


def clean(a, open_px=1, close_px=2, feather=0.9, keep_largest=True):
    if close_px:
        a = cv2.morphologyEx(a, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * close_px + 1,) * 2))
    if open_px:
        a = cv2.morphologyEx(a, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * open_px + 1,) * 2))
    if keep_largest:
        n, lab, st, _ = cv2.connectedComponentsWithStats((a > 127).astype(np.uint8))
        if n > 1:
            big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
            keep = np.zeros_like(a)
            # keep every component at least 6 % of the largest (a wreath's separate leaves)
            for k in range(1, n):
                if st[k, cv2.CC_STAT_AREA] >= 0.06 * st[big, cv2.CC_STAT_AREA]:
                    keep[lab == k] = 255
            a = keep
    if feather:
        a = cv2.GaussianBlur(a, (0, 0), feather)
    return a


def board_crop(panel, box):
    """A panel region (x0, y0, x1, y1 panel px) of the board, resampled Z x. Returns the RGB array and the board box."""
    px, py, _, _ = PANELS[panel]
    x0, y0, x1, y1 = box
    im = Image.open(BOARD).convert('RGB').crop((px + x0, py + y0, px + x1, py + y1))
    im = im.resize((im.width * Z, im.height * Z), Image.LANCZOS)
    return np.asarray(im).copy(), [px + x0, py + y0, px + x1, py + y1]


def S(points):
    """Scale panel-relative polygon points (already offset to the crop) by Z."""
    return [(int(round(x * Z)), int(round(y * Z))) for x, y in points]


def rel(box, poly):
    return S([(x - box[0], y - box[1]) for x, y in poly])


def disc_mask(w, h, cx, cy, r, ss=4):
    W, H = w * ss, h * ss
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    xx = (xx + 0.5) / ss; yy = (yy + 0.5) / ss
    m = (((xx - cx) ** 2 + (yy - cy) ** 2) <= r * r).reshape(h, ss, w, ss).mean(axis=(1, 3))
    return (m * 255).round().astype(np.uint8)


def red_key(rgb, s_min=0.42, v_min=0.16, v_max=0.86):
    """Crimson / oxblood drapery: hue near red, saturated, not too bright (excludes the cream papers, gold and leaves)."""
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
    hue, s, v = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
    red = ((hue <= 14) | (hue >= 340)) & (s >= s_min) & (v >= v_min) & (v <= v_max)
    return np.where(red, 255, 0).astype(np.uint8)


def sharpen(im):
    return im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))


def save(name, rgb, alpha, meta, parts, src_label, sharpen_rgb=True):
    a = alpha.astype(np.uint8)
    ys, xs = np.where(a > 8)
    if not len(xs):
        raise SystemExit(f'{name}: empty alpha')
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    pad = 2
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(a.shape[1], x1 + pad), min(a.shape[0], y1 + pad)
    rgba = np.dstack([rgb, a])[y0:y1, x0:x1]
    im = Image.fromarray(rgba, 'RGBA')
    if sharpen_rgb:
        r, g, b, al = im.split()
        im = Image.merge('RGBA', (*sharpen(Image.merge('RGB', (r, g, b))).split(), al))
    fn = f'F05_ED_{name}.webp'
    path = os.path.join(OUT, fn)
    im.save(path, 'WEBP', quality=90, method=6)
    meta = dict(meta)
    meta.update({'runtime': fn, 'size': list(im.size), 'bytes': os.path.getsize(path), 'trim': [int(x0), int(y0), int(x1), int(y1)], 'source': src_label})
    parts[name] = meta
    print(f'{name:16s} {im.size[0]:4d} x {im.size[1]:4d}  {os.path.getsize(path):7d} B')
    if PREVIEW:
        os.makedirs(PREVIEW, exist_ok=True)
        ch = Image.new('RGBA', im.size, (60, 160, 60, 255))
        ch.alpha_composite(im)
        ch.convert('RGB').save(os.path.join(PREVIEW, f'{name}.png'))


def lift_board(name, panel, box, parts, mode='grabcut', fg=(), bg=(), probable_fg=(), disc=None, post=None, note='', anchor=None):
    """Cut a subject out of a board panel. `box` = crop (panel px). Polygons in panel px."""
    rgb, bbox = board_crop(panel, box)
    h, w = rgb.shape[:2]
    if mode == 'grabcut':
        a = grabcut(rgb, (2, 2, w - 2, h - 2), fg=[rel(box, p) for p in fg], bg=[rel(box, p) for p in bg], probable_fg=[rel(box, p) for p in probable_fg])
        a = clean(a)
    elif mode == 'disc':
        cx, cy, r = disc
        a = disc_mask(w, h, (cx - box[0]) * Z, (cy - box[1]) * Z, r * Z)
    elif mode == 'red':
        a = red_key(rgb)
        a = clean(a, open_px=2, close_px=3, feather=1.2, keep_largest=False)
        for p in bg:
            cv2.fillPoly(a, [np.array(rel(box, p), np.int32)], 0)
    elif mode == 'copper':
        hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
        hue, sat, val = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
        a = np.where((hue >= 8) & (hue <= 42) & (sat >= 0.42) & (val >= 0.22) & (val <= 0.95), 255, 0).astype(np.uint8)
        a = clean(a, open_px=0, close_px=1, feather=0)
        n, lab, st, _ = cv2.connectedComponentsWithStats((a > 127).astype(np.uint8))
        a = np.where(lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])), 255, 0).astype(np.uint8)
        if bg:  # the clip's axis (two points): keep only the wire within 9 panel px of it (not the paper's torn fringe)
            axis = np.zeros_like(a)
            cv2.line(axis, *[tuple(int(v) for v in pt) for pt in rel(box, bg[0])], 255, 7 * 2 * Z)
            a &= axis
        a = cv2.GaussianBlur(a, (0, 0), 0.7)
    elif mode == 'poly':
        a = np.zeros((h, w), np.uint8)
        for p in fg:
            cv2.fillPoly(a, [np.array(rel(box, p), np.int32)], 255)
        a = cv2.GaussianBlur(a, (0, 0), 1.0)
    else:
        raise ValueError(mode)
    if post:
        rgb, a = post(rgb, a, box)
    # panel-px geometry of the lift's box (where it sits on its panel) — after trimming it is re-derived in the runtime
    meta = {'panel': panel, 'panel_size': list(PANELS[panel][2:]), 'panel_box': list(box), 'board_box': bbox, 'scale': Z, 'mode': mode, 'note': note}
    if anchor:
        meta['anchor'] = anchor
    save(name, rgb, a, meta, parts, 'FOUNDER_EIGHT_PANEL_BOARD.webp')
    # record where the trimmed image sits on the panel (panel px), for the CSS geometry
    t = parts[name]['trim']
    parts[name]['panel_rect'] = [round(box[0] + t[0] / Z, 1), round(box[1] + t[1] / Z, 1), round((t[2] - t[0]) / Z, 1), round((t[3] - t[1]) / Z, 1)]


def inpaint_lettering(rgb, a, box):
    """Ledger spines: remove the gilt lettering (bright, warm, on the dark green leather) with Telea inpainting."""
    lum = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    bgl = cv2.medianBlur(lum.astype(np.uint8), 31).astype(np.float32)
    gilt = (lum - bgl) > 14
    m = np.zeros(rgb.shape[:2], np.uint8)
    # only inside the three spine bands (panel px polygons, measured), never on the gilt end bands
    for poly in SPINES:
        band = np.zeros_like(m)
        cv2.fillPoly(band, [np.array(rel(box, poly), np.int32)], 255)
        m |= np.where(gilt & (band > 0), 255, 0).astype(np.uint8)
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    out = cv2.inpaint(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), m, 9, cv2.INPAINT_TELEA)
    return cv2.cvtColor(out, cv2.COLOR_BGR2RGB), a


def fill_drape(rgb, a, box):
    """07: the folio is one oxblood drape. Its extent (the convex hull of the visible drape, inside the measured folio
    edge) is the alpha, except where the board lettered or laid cards on it (those areas, feathered, are left to the
    runtime's flat oxblood ground, under its own live text and papers): no lettering survives, nothing is synthesised."""
    raw = red_key(rgb)
    n, lab, st, _ = cv2.connectedComponentsWithStats((raw > 0).astype(np.uint8))
    big = max(st[1:, cv2.CC_STAT_AREA]) if n > 1 else 0
    keep = np.isin(lab, [k for k in range(1, n) if st[k, cv2.CC_STAT_AREA] >= 0.02 * big])
    pts = cv2.findNonZero(keep.astype(np.uint8))
    outline = np.zeros(raw.shape, np.uint8)
    cv2.fillConvexPoly(outline, cv2.convexHull(pts), 255)
    edge = np.zeros_like(outline)
    cv2.fillPoly(edge, [np.array(rel(box, FOLIO07), np.int32)], 255)
    outline &= edge
    cut = np.zeros_like(outline)
    for poly in FLAT07:
        cv2.fillPoly(cut, [np.array(rel(box, poly), np.int32)], 255)
    cut = cv2.GaussianBlur(cut, (0, 0), 7)
    alpha = (cv2.GaussianBlur(outline, (0, 0), 1.2).astype(np.float32) * (1 - cut.astype(np.float32) / 255)).astype(np.uint8)
    # the residual non-drape specks inside the kept area (stray glyph edges) are inpainted from the drape (small radius)
    specks = ((alpha > 40) & ~keep).astype(np.uint8) * 255
    out = cv2.inpaint(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), cv2.dilate(specks, np.ones((3, 3), np.uint8)), 4, cv2.INPAINT_TELEA)
    return cv2.cvtColor(out, cv2.COLOR_BGR2RGB), alpha


# where 07's board lettered (title, note) or laid papers (medallion, BLOCKERS, RESOLVE, CLOSE) on the drape (panel px)
FLAT07 = [
    [(112, 40), (322, 40), (322, 146), (112, 146)],
    [(22, 28), (120, 28), (120, 130), (22, 130)],
    [(28, 150), (318, 150), (318, 392), (28, 392)],
]
# the torn edge of 07's oxblood folio (panel px, measured)
FOLIO07 = [(16, 22), (60, 14), (200, 18), (300, 12), (330, 24), (334, 200), (326, 330), (330, 396), (200, 402), (60, 398), (14, 390), (18, 200)]


# the lettered band of each spine (panel 05 px): ACCOUNTS, TRANSACTIONS, CATEGORIES
SPINES = [
    [(8, 232), (96, 218), (100, 258), (12, 270)],
    [(6, 288), (100, 276), (104, 312), (8, 322)],
    [(8, 336), (98, 322), (102, 360), (10, 372)],
]


def lift_sk01(name, box, parts, fg=(), bg=(), probable_fg=(), note=''):
    im = Image.open(SK01).convert('RGB').crop(box)
    rgb = np.asarray(im).copy()
    h, w = rgb.shape[:2]
    off = lambda poly: [(int(x - box[0]), int(y - box[1])) for x, y in poly]
    a = grabcut(rgb, (1, 1, w - 1, h - 1), fg=[off(p) for p in fg], bg=[off(p) for p in bg], probable_fg=[off(p) for p in probable_fg], iters=8)
    a = clean(a, open_px=1, close_px=3, feather=1.0)
    save(name, rgb, a, {'sk01_box': list(box), 'note': note}, parts, 'SK01_PARENT_MONEY.png', sharpen_rgb=False)


def main():
    os.makedirs(OUT, exist_ok=True)
    parts = {}
    which = set(sys.argv[1:])
    run = lambda n: not which or n in which

    # ── SK01: the classical bust (head, neck and shoulder; the heading paper's torn edge is its lower cut) ──
    if run('BUST'):
        lift_sk01('BUST', (150, 0, 560, 352), parts,
                  fg=[[(240, 40), (470, 40), (500, 140), (470, 250), (380, 300), (330, 340), (250, 340), (210, 250), (200, 120)]],
                  bg=[[(150, 0), (190, 0), (175, 352), (150, 352)], [(150, 0), (222, 0), (212, 92), (150, 104)], [(520, 0), (560, 0), (560, 352), (505, 352), (500, 250), (540, 150)],
                      [(150, 0), (560, 0), (560, 4), (150, 4)]],
                  probable_fg=[[(165, 20), (515, 10), (520, 150), (470, 300), (420, 345), (165, 345)]],
                  note='SK01 bust (the same marble head the board draws in 01 / 03 / 08); GrabCut, lower cut at the SK01 heading paper.')

    # ── 01 MONEY ACTION SHEET ──
    if run('B01_AMPHORA'):
        lift_board('B01_AMPHORA', '01', (214, 170, 306, 282), parts,
                   fg=[[(240, 200), (262, 182), (282, 196), (288, 232), (272, 268), (244, 268), (232, 236)]],
                   bg=[[(214, 170), (246, 170), (240, 184), (226, 204), (221, 240), (214, 240)], [(214, 240), (222, 240), (224, 282), (214, 282)], [(214, 277), (306, 277), (306, 282), (214, 282)]],
                   note='the copper amphora over the end of ADD A POCKET')
    if run('B01_COIN'):
        lift_board('B01_COIN', '01', (214, 284, 326, 396), parts, mode='disc', disc=(270.5, 340, 50.5), note='the silver coin over the end of MOVE MONEY')
    if run('B01_COAST'):
        lift_board('B01_COAST', '01', (0, 398, 264, 460), parts, mode='poly',
                   fg=[[(0, 404), (30, 401), (44, 410), (110, 412), (190, 413), (248, 416), (264, 422), (264, 460), (0, 460)]],
                   note='the painted coastal village at the lower left')
    if run('B01_FABRIC'):
        lift_board('B01_FABRIC', '01', (0, 0, 346, 460), parts, mode='red', note='the red drapes behind the papers (colour key)')

    # ── 02 ADD A POCKET ──
    if run('B02_MEDALLION'):
        lift_board('B02_MEDALLION', '02', (14, 0, 132, 106), parts,
                   fg=[[(50, 25), (95, 25), (110, 55), (95, 85), (50, 85), (35, 55)]],
                   probable_fg=[[(22, 6), (122, 6), (128, 55), (118, 100), (26, 100), (16, 55)]],
                   note='the bronze laurel medallion with the money bag')
    if run('B02_COINS'):
        lift_board('B02_COINS', '02', (200, 330, 312, 402), parts,
                   fg=[[(262, 342), (300, 342), (302, 392), (262, 392)], [(232, 360), (250, 360), (252, 392), (232, 392)]],
                   bg=[[(200, 330), (255, 330), (226, 364), (204, 372), (200, 372)], [(200, 393), (312, 393), (312, 402), (200, 402)], [(200, 355), (214, 355), (210, 378), (200, 378)]],
                   note='the coin stack beside the opening balance')
    if run('B02_FABRIC'):
        lift_board('B02_FABRIC', '02', (0, 0, 337, 460), parts, mode='red', note='the red drape behind the medallion')

    # ── 03 MOVE MONEY ──
    if run('B03_SEAL'):
        lift_board('B03_SEAL', '03', (136, 190, 210, 246), parts,
                   fg=[[(156, 202), (190, 202), (200, 218), (190, 236), (156, 236), (146, 218)]],
                   note='the red wax direction seal with its white arrows')

    # ── 04 MANAGE POCKET ──
    if run('B04_CLIP'):
        lift_board('B04_CLIP', '04', (46, 124, 110, 200), parts, mode='copper', bg=[[(101, 131), (58, 190)]],
                   note='the copper paper clip')
    if run('B04_FABRIC'):
        lift_board('B04_FABRIC', '04', (0, 150, 200, 400), parts, mode='red', bg=[[(38, 150), (200, 150), (200, 368), (38, 368)]], note='the red drape under the fragment')

    # ── 05 SEARCH ──
    if run('B05_BOOKS'):
        lift_board('B05_BOOKS', '05', (0, 204, 114, 378), parts, mode='poly',
                   fg=[[(0, 214), (60, 206), (102, 208), (106, 222), (103, 268), (105, 276), (106, 320), (103, 330), (104, 372), (60, 376), (0, 378)]],
                   post=inpaint_lettering, note='the stack of three ledgers (spine lettering inpainted away)')
    if run('B05_FABRIC'):
        lift_board('B05_FABRIC', '05', (0, 330, 200, 414), parts, mode='red', note='the red drape under the ledgers')

    # ── 06 YOUR ACCOUNT ──
    if run('B06_MEDALLION'):
        lift_board('B06_MEDALLION', '06', (6, 0, 146, 126), parts,
                   fg=[[(48, 22), (108, 22), (122, 60), (108, 100), (48, 100), (34, 60)]],
                   probable_fg=[[(14, 4), (138, 4), (144, 64), (130, 122), (22, 122), (8, 64)]],
                   note='the bronze laurel medallion with the classical head')
    if run('B06_COLUMNS'):
        lift_board('B06_COLUMNS', '06', (0, 276, 70, 414), parts, mode='poly',
                   fg=[[(0, 282), (66, 280), (66, 300), (60, 304), (60, 414), (0, 414)]],
                   note='the two columns at the lower left')
    if run('B06_LANDSCAPE'):
        lift_board('B06_LANDSCAPE', '06', (54, 336, 337, 414), parts, mode='poly',
                   fg=[[(54, 352), (120, 342), (200, 346), (260, 338), (300, 336), (337, 340), (337, 414), (54, 414)]],
                   note='the painted landscape under SIGN OUT')
    if run('B06_FABRIC'):
        lift_board('B06_FABRIC', '06', (0, 60, 60, 300), parts, mode='red', note='the red drape at the left edge')

    # ── 07 ARCHIVE BLOCKED ──
    if run('B07_MEDALLION'):
        lift_board('B07_MEDALLION', '07', (16, 20, 122, 132), parts,
                   fg=[[(48, 50), (92, 50), (104, 76), (92, 104), (48, 104), (36, 76)]],
                   probable_fg=[[(22, 26), (116, 26), (120, 76), (112, 128), (28, 128), (18, 76)]],
                   note='the bronze laurel medallion with the caution sign')
    if run('B07_COLUMN'):
        lift_board('B07_COLUMN', '07', (288, 196, 342, 414), parts, mode='poly',
                   fg=[[(300, 204), (342, 198), (342, 414), (288, 414), (292, 394), (307, 386), (307, 236), (300, 232)]],
                   note='the column at the right')
    if run('B07_FABRIC'):
        lift_board('B07_FABRIC', '07', (0, 0, 342, 414), parts, mode='red', post=fill_drape, note='the oxblood drape as one sheet: its outline filled and every hole (lettering, medallion, cards) inpainted from the drape itself')

    # ── 08 MENU ──
    if run('B08_FABRIC'):
        lift_board('B08_FABRIC', '08', (0, 0, 60, 414), parts, mode='red', note='the red drape along the left edge')

    meta_path = os.path.join(OUT, 'F05_ED_PARTS.json')
    prev = json.load(open(meta_path)) if os.path.exists(meta_path) and which else {}
    prev.update(parts)
    doc = {'note': 'Editorial overlay parts lifted from the founder eight-panel board (and the same bust from SK01); crop + Lanczos 2x + segmentation alpha. No pixel is generated.',
           'board': {'file': os.path.relpath(BOARD, ROOT), 'sha256': sha(BOARD), 'panels': PANELS},
           'sk01': {'file': os.path.relpath(SK01, ROOT), 'sha256': sha(SK01)},
           'parts': prev.get('parts', prev) if which else parts}
    if which:
        doc['parts'] = {**json.load(open(meta_path)).get('parts', {}), **parts} if os.path.exists(meta_path) else parts
    json.dump(doc, open(meta_path, 'w'), indent=1)


if __name__ == '__main__':
    main()
