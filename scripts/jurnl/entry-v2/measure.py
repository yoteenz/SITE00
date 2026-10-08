"""ENTRY v2 first seven pages: measure the approved authorities and emit the live layout.

Sprint P0.JURNL.ENTRY-V2.FIRST-7.AUTHORITY-PLUS-PLATE-LIVE-WIRING1. The authority (ENTRY v2/<screen>/authority/*.png)
is the layout; its plate (registered to it within a pixel) is the environment. Frame: 1008 × 1792 (half the 2016 × 3584
source). Each line of type is found as ink inside its search box, in the coordinates of the surface it is printed on
(geometry.py), and scripts/jurnl/reference-replica/fit.mjs fits size, tracking, top and anchor with the real fonts
(dev server on :5174). SIZE fixes sizes calibrated against a capture of the build (cap height, row profile).

  <venv with numpy, pillow, opencv> python scripts/jurnl/entry-v2/measure.py
    → src/projects/jurnl/runtime/layout/entryV2Layout.ts
"""
import json, os, subprocess, sys
import numpy as np
import cv2

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from geometry import FH, FW, SURFACES, css_matrix3d  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
WORK = os.environ.get('ENTRY_V2_WORK', '/tmp/jurnl-entry-v2-measure')
os.makedirs(WORK, exist_ok=True)

PAGES = {
    'welcome': ('01_WELCOME', 'welcome'),
    'value': ('02_VALUE_PROPOSITION', 'value-proposition'),
    'benefits': ('03_KEY_BENEFITS', 'key-benefits'),
    'begin': ('04_GET_STARTED', 'get-started'),
    'create': ('05_CREATE_ACCOUNT', 'create-account'),
    'verify': ('06_EMAIL_VERIFICATION', 'email-verification'),
    'signin': ('07_SIGN_IN', 'sign-in'),
}


def authority(page):
    d, n = PAGES[page]
    p = os.path.join(ROOT, 'ENTRY v2', d, 'authority', f'entry-v2-{n}-authority.png')
    return cv2.resize(cv2.imread(p, cv2.IMREAD_GRAYSCALE), (FW, FH), interpolation=cv2.INTER_AREA)


_cache = {}


def surface_img(page, surf):
    key = (page, surf)
    if key not in _cache:
        a = authority(page)
        _cache[key] = a.astype(float) if surf is None else cv2.warpPerspective(a, SURFACES[page][surf], (FW, FH), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP).astype(float)
    return _cache[key]


def ink(page, surf, box, mode='dark', frac=0.45, minthr=22):
    x0, y0, x1, y1 = box
    a = surface_img(page, surf)[y0:y1, x0:x1]
    bg = np.median(a)
    d = (bg - a) if mode == 'dark' else (a - bg)
    thr = max(minthr, frac * np.percentile(d, 99.7))
    ys, xs = np.nonzero(d > thr)
    if not len(xs):
        raise SystemExit(f'no ink: {page} {surf} {box}')
    return [int(x0 + xs.min()), int(y0 + ys.min()), int(x0 + xs.max() + 1), int(y0 + ys.max() + 1)]


# (id, text, family, weight, surface, search box, align, mode)
TYPE = {
    'welcome': [
        ('brand', 'JURNL', 'serif', 400, None, (150, 112, 330, 162), 'left', 'light'),
        ('brandLine', 'FINANCIAL LIFE. BEAUTIFULLY ORGANIZED.', 'serif', 400, None, (62, 184, 468, 206), 'left', 'light'),
        ('h1', 'A CALMER,', 'serif', 400, None, (55, 266, 500, 372), 'left', 'light'),
        ('h2', 'RICHER,', 'serif', 400, None, (55, 368, 485, 472), 'left', 'light'),
        ('h3', 'MORE', 'serif', 400, None, (55, 468, 375, 568), 'left', 'light'),
        ('h4', 'INTENTIONAL', 'serif', 400, None, (55, 568, 500, 668), 'left', 'light'),
        ('h5', 'YOU.', 'serif', 400, None, (55, 670, 305, 770), 'left', 'light'),
        ('tag1', 'PLAN TODAY.', 'serif', 400, None, (62, 826, 345, 864), 'left', 'light'),
        ('tag2', 'GROW FREELY.', 'serif', 400, None, (62, 866, 375, 904), 'left', 'light'),
        ('getStarted', 'GET STARTED', 'serif', 400, None, (90, 1535, 350, 1595), 'center', 'light'),
        ('signIn', 'SIGN IN', 'serif', 400, None, (120, 1640, 320, 1700), 'center', 'dark'),
    ],
    'value': [
        ('h1', 'WHAT', 'serif', 600, None, (45, 318, 700, 500), 'left', 'dark'),
        ('h2', 'JURNL', 'serif', 600, None, (30, 535, 730, 750), 'left', 'dark'),
        ('h3', 'IS FOR.', 'serif', 600, None, (45, 752, 715, 930), 'left', 'dark'),
        ('b1', 'A CLEARER READING', 'serif', 600, None, (55, 1090, 600, 1146), 'left', 'dark'),
        ('b2', 'OF YOUR MONEY.', 'serif', 600, None, (55, 1150, 520, 1206), 'left', 'dark'),
        ('b3', 'WHAT IS SAFE TO SPEND.', 'serif', 600, None, (55, 1210, 690, 1266), 'left', 'dark'),
        ('b4', 'WHAT YOU ARE ARRANGING.', 'serif', 600, None, (55, 1270, 780, 1326), 'left', 'dark'),
        ('b5', 'WHAT YOU OWE.', 'serif', 600, None, (55, 1330, 520, 1386), 'left', 'dark'),
        ('cont', 'CONTINUE', 'serif', 600, None, (140, 1550, 430, 1605), 'center', 'light'),
    ],
    'benefits': [
        ('brand', 'JURNL', 'serif', 600, None, (70, 88, 500, 200), 'left', 'dark'),
        ('o1', 'WHAT JURNL', 'serif', 400, 'olive', (350, 415, 700, 468), 'left', 'light'),
        ('o2', 'HELPS YOU DO.', 'serif', 400, 'olive', (350, 474, 750, 522), 'left', 'light'),
        ('s1a', 'SEE WHAT IS', 'serif', 500, 'slip1', (330, 630, 620, 675), 'left', 'dark'),
        ('s1b', 'SAFE TO SPEND.', 'serif', 500, 'slip1', (330, 682, 680, 727), 'left', 'dark'),
        ('s2a', 'KEEP PLACES', 'serif', 500, 'slip2', (305, 852, 640, 895), 'left', 'dark'),
        ('s2b', 'AND DEBTS APART.', 'serif', 500, 'slip2', (305, 900, 760, 945), 'left', 'dark'),
        ('s3a', 'GIVE YOUR MONEY', 'serif', 500, 'slip3', (290, 1048, 720, 1093), 'left', 'dark'),
        ('s3b', 'A PLAN.', 'serif', 500, 'slip3', (290, 1100, 480, 1146), 'left', 'dark'),
        ('s4a', 'CHECK A', 'serif', 500, 'slip4', (270, 1240, 470, 1290), 'left', 'dark'),
        ('s4b', 'PURCHASE FIRST.', 'serif', 500, 'slip4', (270, 1292, 650, 1340), 'left', 'dark'),
        ('cont', 'CONTINUE', 'serif', 400, None, (380, 1555, 640, 1600), 'center', 'light'),
    ],
    'begin': [
        ('brand', 'JURNL', 'serif', 400, None, (70, 244, 310, 288), 'left', 'dark'),
        ('h', 'BEGIN.', 'serif', 500, None, (70, 380, 530, 500), 'left', 'dark'),
        ('sub', 'A FEW DETAILS TO GET STARTED.', 'serif', 400, None, (70, 516, 580, 548), 'left', 'dark'),
        ('getStarted', 'GET STARTED', 'serif', 400, 'card', (505, 1230, 712, 1268), 'center', 'light'),
        ('signIn', 'SIGN IN', 'serif', 400, 'card', (540, 1322, 680, 1356), 'center', 'dark'),
    ],
    'create': [
        ('brand', 'JURNL', 'serif', 400, 'sheet', (415, 252, 625, 296), 'center', 'dark'),
        ('h1', 'CREATE', 'serif', 400, 'sheet', (350, 355, 690, 440), 'center', 'dark'),
        # Fitted as two words: the face's word space at this tracking is narrower than the authority's.
        ('h2a', 'YOUR', 'serif', 400, 'sheet', (190, 440, 435, 528), 'left', 'dark'),
        ('h2b', 'ACCOUNT.', 'serif', 400, 'sheet', (435, 440, 845, 528), 'left', 'dark'),
        ('sub1', 'A FEW DETAILS', 'serif', 400, 'sheet', (355, 555, 685, 590), 'center', 'dark'),
        ('sub2', 'TO GET STARTED.', 'serif', 400, 'sheet', (330, 598, 715, 634), 'center', 'dark'),
        ('first', 'FIRST NAME', 'serif', 400, 'sheet', (158, 712, 330, 745), 'left', 'dark'),
        ('last', 'LAST NAME', 'serif', 400, 'sheet', (158, 830, 320, 862), 'left', 'dark'),
        ('email', 'EMAIL ADDRESS', 'serif', 400, 'sheet', (158, 946, 385, 978), 'left', 'dark'),
        ('password', 'CREATE PASSWORD', 'serif', 400, 'sheet', (158, 1066, 420, 1098), 'left', 'dark'),
        ('agree', 'I AGREE TO THE TERMS OF SERVICE AND PRIVACY POLICY', 'serif', 400, 'sheet', (215, 1186, 810, 1216), 'left', 'dark'),
        ('apple', 'CONTINUE WITH APPLE', 'serif', 400, 'sheet', (250, 1292, 480, 1320), 'left', 'dark'),
        ('google', 'CONTINUE WITH GOOGLE', 'serif', 400, 'sheet', (615, 1295, 870, 1324), 'left', 'dark'),
        ('submit', 'CREATE ACCOUNT', 'serif', 400, 'sheet', (370, 1400, 670, 1442), 'center', 'light'),
        ('foot', 'ALREADY HAVE AN ACCOUNT? SIGN IN.', 'serif', 400, 'sheet', (295, 1505, 730, 1538), 'center', 'dark'),
    ],
    'verify': [
        ('brand', 'JURNL', 'serif', 400, None, (68, 88, 225, 124), 'left', 'dark'),
        ('h1', 'CHECK', 'serif', 500, None, (58, 198, 400, 290), 'left', 'dark'),
        ('h2', 'YOUR EMAIL.', 'serif', 500, None, (58, 294, 680, 390), 'left', 'dark'),
        ('lead', 'WE SENT A VERIFICATION LINK TO', 'serif', 400, None, (68, 406, 635, 442), 'left', 'dark'),
        ('address', 'YOUR EMAIL ADDRESS.', 'serif', 400, None, (68, 446, 440, 480), 'left', 'dark'),
        ('open', 'OPEN EMAIL APP', 'serif', 400, None, (120, 560, 460, 600), 'center', 'light'),
        ('resend', 'RESEND EMAIL', 'serif', 400, None, (150, 665, 430, 705), 'center', 'dark'),
        ('different', 'USE A DIFFERENT EMAIL', 'serif', 400, None, (70, 752, 395, 780), 'left', 'dark'),
    ],
    'signin': [
        ('brand', 'JURNL', 'serif', 400, 'card', (475, 512, 650, 552), 'center', 'dark'),
        ('h1', 'WELCOME', 'serif', 400, 'card', (325, 592, 825, 682), 'center', 'dark'),
        ('h2', 'BACK.', 'serif', 400, 'card', (425, 684, 720, 778), 'center', 'dark'),
        ('emailLabel', 'EMAIL ADDRESS', 'sans', 400, 'card', (290, 855, 505, 885), 'left', 'dark'),
        ('passwordLabel', 'PASSWORD', 'sans', 400, 'card', (290, 972, 440, 1000), 'left', 'dark'),
        ('submit', 'SIGN IN', 'serif', 400, 'card', (470, 1126, 665, 1166), 'center', 'light'),
        ('forgot', 'FORGOT PASSWORD?', 'sans', 400, 'card', (430, 1248, 700, 1278), 'center', 'dark'),
        ('create', 'CREATE ACCOUNT', 'sans', 400, 'card', (445, 1311, 690, 1340), 'center', 'dark'),
    ],
}

# Boxes [x0, y0, x1, y1] in surface coordinates (gridded zooms of the straightened surfaces).
BOX = {
    'welcome': {
        'sprig': [72, 112, 132, 178],
        'rule': [72, 806, 385, 808],
        'getStarted': [64, 1519, 373, 1608],
        'signIn': [64, 1622, 373, 1716],
    },
    'value': {
        'cont': [65, 1525, 502, 1630],
    },
    'benefits': {
        'cont': [298, 1515, 740, 1658],
    },
    'begin': {
        'getStarted': [472, 1212, 744, 1283],
        'signIn': [472, 1302, 744, 1372],
    },
    'create': {
        'firstRule': [165, 789, 865, 791],
        'lastRule': [165, 906, 865, 908],
        'emailRule': [165, 1022, 865, 1024],
        'passwordRule': [165, 1139, 865, 1141],
        'check': [167, 1184, 198, 1215],
        'apple': [162, 1263, 512, 1348],
        'appleIcon': [202, 1287, 230, 1322],
        'google': [532, 1265, 883, 1350],
        'googleIcon': [563, 1292, 598, 1326],
        'submit': [162, 1375, 885, 1465],
    },
    'verify': {
        'open': [75, 535, 502, 622],
        'resend': [75, 640, 502, 727],
        'differentRule': [80, 781, 383, 783],
    },
    'signin': {
        'emailRule': [296, 913, 828, 915],
        'passwordRule': [296, 1028, 828, 1030],
        'submit': [293, 1088, 834, 1208],
    },
}

# Where cream type crosses the bright wall its ink cannot be thresholded; the line's right end is read off a zoom.
INK_RIGHT = {'welcome.h1': 605, 'welcome.h4': 733}
# Where the ink test picks up a plate object beside the type, the line's extent is read from authority − plate.
INK_X = {'benefits.brand': (79, 478)}

# One size per style group (lines of one style share it; tracking is fitted per line). Calibrated against a capture.
_g = lambda size, *ids: {i: size for i in ids}
SIZE = {
    'welcome': {'brand': 35, 'brandLine': 17.4, **_g(116, 'h1', 'h2', 'h3', 'h4', 'h5'), **_g(30, 'tag1', 'tag2'), 'getStarted': 30.8, 'signIn': 31.2},
    'value': {**_g(217, 'h1', 'h2', 'h3'), **_g(51, 'b1', 'b2', 'b3', 'b4', 'b5'), 'cont': 46.2},
    'benefits': {'brand': 125.8, **_g(49, 'o1', 'o2'), **_g(44.8, 's1a', 's1b', 's2a', 's2b', 's3a', 's3b', 's4a', 's4b'), 'cont': 35.7},
    'begin': {'brand': 35.6, 'h': 134, 'sub': 23.1, **_g(21.3, 'getStarted', 'signIn')},
    'create': {'brand': 34.4, 'h1': 85.6, **_g(85.6, 'h2a', 'h2b'), **_g(27, 'sub1', 'sub2'), **_g(19.6, 'first', 'last', 'email', 'password'), 'agree': 16.2, **_g(16.6, 'apple', 'google'), 'submit': 24.6, 'foot': 16.2},
    'verify': {'brand': 31, **_g(108, 'h1', 'h2'), **_g(26.4, 'lead', 'address'), 'open': 29.1, 'resend': 27.1, 'different': 21.9},
    'signin': {'brand': 26.6, **_g(105, 'h1', 'h2'), **_g(18.8, 'emailLabel', 'passwordLabel'), 'submit': 30.2, **_g(18.3, 'forgot', 'create')},
}
# Live parts the authority does not draw in its default state (notes, kept controls), in the frame; kept inside the crop.
UI_EXTRA = {'signin': [296, 780, 830, 1420], 'create': [160, 630, 890, 1640], 'verify': [60, 400, 640, 800]}
# Crop focus and the live layer's extent per page (frame coordinates): the crop keeps the live layer on screen.
# Focus x leans toward each page's hero object (bust, column, capital, envelope); the live layer still clamps the crop.
FOCAL = {'welcome': (0.9, 0.5), 'value': (0.6, 0.5), 'benefits': (0.5, 0.5), 'begin': (0.62, 0.5), 'create': (0.5, 0.5), 'verify': (0.7, 0.5), 'signin': (0.56, 0.5)}


# Word spacing where the authority's word gap is wider than the face's (fit.mjs fits tracking with it).
WS = {'value': {k: 12 for k in ('b1', 'b2', 'b3', 'b4', 'b5')}}

# Which surface each box is drawn on (default: the frame itself).
BOX_SURFACE = {'begin': {'getStarted': 'card', 'signIn': 'card'}, 'create': {k: 'sheet' for k in BOX['create']}, 'signin': {k: 'card' for k in BOX['signin']}}


def to_frame(page, surf, b):
    """A surface box's extent in the frame (its four corners mapped by the surface's H)."""
    if not surf:
        return b
    H = SURFACES[page][surf]
    pts = np.array([[b[0], b[1], 1], [b[2], b[1], 1], [b[2], b[3], 1], [b[0], b[3], 1]], float) @ H.T
    pts = pts[:, :2] / pts[:, 2:]
    return [int(np.floor(pts[:, 0].min())), int(np.floor(pts[:, 1].min())), int(np.ceil(pts[:, 0].max())), int(np.ceil(pts[:, 1].max()))]


def main():
    items = []
    for page, rows in TYPE.items():
        for (iid, text, fam, w, surf, box, align, mode) in rows:
            b = ink(page, surf, box, mode)
            if f'{page}.{iid}' in INK_RIGHT:
                b[2] = INK_RIGHT[f'{page}.{iid}']
            if f'{page}.{iid}' in INK_X:
                b[0], b[2] = INK_X[f'{page}.{iid}']
            it = {'id': f'{page}.{iid}', 'text': text, 'family': fam, 'weight': w, 'ink': b, 'align': align}
            if iid in SIZE[page]:
                it['size'] = SIZE[page][iid]
            if iid in WS.get(page, {}):
                it['ws'] = WS[page][iid]
            items.append(it)
    inp, out = os.path.join(WORK, 'items.json'), os.path.join(WORK, 'fit.json')
    json.dump(items, open(inp, 'w'))
    subprocess.run(['node', os.path.join(ROOT, 'scripts/jurnl/reference-replica/fit.mjs'), inp, out], check=True, cwd=ROOT, stdout=subprocess.DEVNULL)
    fit = {r['id']: r for r in json.load(open(out))}
    L = ['/**', ' * ENTRY v2 first seven pages: live layout measured from the approved authorities (frame 1008 × 1792).',
         ' * Generated by scripts/jurnl/entry-v2/measure.py — do not edit by hand.', ' */',
         "import type { RefBox, RefType } from './referenceLayout';", '',
         'export type EntrySurfaceId = string;',
         'export type EntryType = RefType & { readonly surface?: EntrySurfaceId };', '']
    for page in PAGES:
        rows = TYPE[page]
        ui = None
        for (iid, _t, _f, _w, surf, *_r) in rows:
            b = to_frame(page, surf, next(i for i in items if i['id'] == f'{page}.{iid}')['ink'])
            ui = b if ui is None else [min(ui[0], b[0]), min(ui[1], b[1]), max(ui[2], b[2]), max(ui[3], b[3])]
        for k, b in BOX[page].items():
            b = to_frame(page, BOX_SURFACE.get(page, {}).get(k), b)
            ui = [min(ui[0], b[0]), min(ui[1], b[1]), max(ui[2], b[2]), max(ui[3], b[3])]
        ui = [min(ui[0], UI_EXTRA.get(page, ui)[0]), min(ui[1], UI_EXTRA.get(page, ui)[1]), max(ui[2], UI_EXTRA.get(page, ui)[2]), max(ui[3], UI_EXTRA.get(page, ui)[3])]
        L.append(f'export const ENTRY_V2_{page.upper()} = {{')
        L.append(f'  focal: [{FOCAL[page][0]}, {FOCAL[page][1]}],')
        L.append(f'  ui: [{ui[0]}, {ui[1]}, {ui[2]}, {ui[3]}] as RefBox,')
        surfs = SURFACES.get(page, {})
        L.append('  surfaces: {' + ', '.join(f"{k}: '{css_matrix3d(v)}'" for k, v in surfs.items()) + '},')
        L.append('  box: {')
        for k, v in BOX[page].items():
            L.append(f'    {k}: [{v[0]}, {v[1]}, {v[2]}, {v[3]}],')
        L.append('  } satisfies Record<string, RefBox>,')
        L.append('  text: {')
        for (iid, _t, fam, w, surf, _b, align, _m) in rows:
            r = fit[f'{page}.{iid}']
            it = next(i for i in items if i['id'] == f'{page}.{iid}')
            anchor = f"cx: {r['cx']}" if 'cx' in r else f"left: {r['left']}"
            ib = it['ink']
            s = f", surface: '{surf}'" if surf else ''
            if iid in WS.get(page, {}):
                s = f", ws: {WS[page][iid]}" + s
            L.append(f"    {iid}: {{ family: '{fam}', weight: {w}, size: {r['size']}, ls: {r['ls']}, top: {r['top']}, {anchor}{s}, ink: [{ib[0]}, {ib[1]}, {ib[2]}, {ib[3]}] }},")
        L.append('  } satisfies Record<string, EntryType>,')
        L.append('} as const;')
        L.append('')
    path = os.path.join(ROOT, 'src/projects/jurnl/runtime/layout/entryV2Layout.ts')
    open(path, 'w').write('\n'.join(L))
    print('wrote', os.path.relpath(path, ROOT))
    for r in fit.values():
        print(r['id'].ljust(22), 'size', str(r['size']).ljust(7), 'ls', str(r['ls']).ljust(7), 'inkH', r['inkH'], 'refH', r['refH'], 'refW', r['refW'])


if __name__ == '__main__':
    main()
