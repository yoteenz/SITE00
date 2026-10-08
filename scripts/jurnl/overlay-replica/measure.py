"""F09 overlay replicas: measure the founder's Quick Add and account drawer sources (941 x 1672) and emit the layout.

Sprint: replicate the reference authorities (JURNL/F09_SAFE/AUTHORITIES/F09_*_OVERLAY_SOURCE.jpg) on the handoff shells
(JURNL/F09_SAFE/OVERLAYS/F09_*_OVERLAY_SHELL.png). Boxes below were read off gridded zooms; for every line of type the
ink is found inside its search box and scripts/jurnl/reference-replica/fit.mjs fits face, size, tracking and line top
with the real fonts (dev server on :5174).

  python scripts/jurnl/overlay-replica/measure.py   →  src/projects/jurnl/runtime/layout/overlayReferenceLayout.ts
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SRC = {
    'qa': os.path.join(ROOT, 'JURNL/F09_SAFE/AUTHORITIES/F09_QUICK_ADD_OVERLAY_SOURCE.jpg'),
    'drawer': os.path.join(ROOT, 'JURNL/F09_SAFE/AUTHORITIES/F09_ACCOUNT_DRAWER_OVERLAY_SOURCE.jpg'),
}
WORK = os.environ.get('REPLICA_WORK', '/tmp/jurnl-overlay-replica')
os.makedirs(WORK, exist_ok=True)
_img = {k: np.asarray(Image.open(v).convert('L')).astype(float) for k, v in SRC.items()}


def ink(screen, box, mode='dark', frac=0.45, minthr=25):
    x0, y0, x1, y1 = box
    a = _img[screen][y0:y1, x0:x1]
    bg = np.median(a)
    d = (bg - a) if mode == 'dark' else (a - bg)
    thr = max(minthr, frac * np.percentile(d, 99.7))
    ys, xs = np.nonzero(d > thr)
    if not len(xs):
        raise SystemExit(f'no ink in {screen} {box}')
    return [int(x0 + xs.min()), int(y0 + ys.min()), int(x0 + xs.max() + 1), int(y0 + ys.max() + 1)]


# (id, text, family, weight, search box, align, mode). Sizes are fixed (SIZE): each line's cap height was read from its
# row profile at sub-pixel precision (50% of the profile peak) in the source and in a capture of the build at the same
# scale, and the build's size scaled by their ratio. That cancels the measurement's own bias; tracking, top and anchor
# are then fitted per line by fit.mjs.
SIZE = {
    'qa': {
        'titleQuick': 84, 'titleAdd': 84, 'sub': 21.5, 'nameLabel': 20, 'amountLabel': 20, 'typeLabel': 20, 'accountLabel': 20, 'namePh': 23.6,
        'cur': 53.3, 'amountPh': 53, 'expense': 20.2, 'income': 20.2, 'checking': 20.2, 'card': 20.2, 'save': 25.7,
    },
    'drawer': {
        'desc1': 12.4, 'desc2': 12.4, 'title': 74.4,
        'profileKicker': 16.6, 'profileTitle': 24.1, 'profileGray': 17.1,
        'currencyKicker': 17.3, 'currencyTitle': 30.9, 'currencyChange': 17.2,
        'connectionKicker': 17.1, 'connectionTitle': 32.7, 'connectionSetup': 17,
        'askKicker': 18.2, 'ask1': 18, 'ask2': 18, 'ask3': 18, 'ask4': 18,
        'bufferKicker': 18.1, 'buffer1': 17.3, 'buffer2': 17.7, 'bufferValue': 33.5, 'save': 18.6,
        'privacyKicker': 18, 'privacy1': 16.9, 'privacy2': 16.6, 'signout': 18.2,
    },
}
# Lines set in a narrower face in the reference than JURNL Authority Serif: drawn at the reference's cap height and
# condensed horizontally (sx), with tracking fitted to the uncondensed width.
CONDENSE = {'qa': {'titleQuick': 0.88, 'titleAdd': 0.88}, 'drawer': {}}
TYPE = {
    'qa': [
        # The two words are fitted apart: the reference's word gap is wider than the face's space at this tracking.
        ('titleQuick', 'QUICK', 'serif', 600, (255, 765, 515, 855), 'left', 'dark'),
        ('titleAdd', 'ADD', 'serif', 600, (515, 765, 700, 850), 'left', 'dark'),
        ('sub', 'ADD A TRANSACTION IN SECONDS.', 'sans', 400, (235, 858, 720, 894), 'center', 'dark'),
        ('nameLabel', 'NAME', 'sans', 400, (64, 916, 170, 946), 'left', 'dark'),
        ('namePh', 'WHAT WAS THIS FOR?', 'sans', 400, (88, 975, 450, 1012), 'left', 'dark'),
        ('amountLabel', 'AMOUNT', 'sans', 400, (64, 1058, 200, 1088), 'left', 'dark'),
        ('cur', '$', 'serif', 400, (88, 1108, 140, 1178), 'left', 'dark'),
        ('amountPh', '0.00', 'serif', 400, (160, 1112, 310, 1176), 'left', 'dark'),
        ('typeLabel', 'TYPE', 'sans', 400, (64, 1216, 150, 1246), 'left', 'dark'),
        ('expense', 'EXPENSE', 'sans', 400, (248, 1280, 390, 1311), 'left', 'light'),
        ('income', 'INCOME', 'sans', 400, (668, 1280, 795, 1311), 'left', 'dark'),
        ('accountLabel', 'ACCOUNT', 'sans', 400, (64, 1358, 210, 1390), 'left', 'dark'),
        ('checking', 'CHECKING', 'sans', 400, (198, 1428, 355, 1459), 'left', 'dark'),
        ('card', 'CARD', 'sans', 400, (608, 1428, 705, 1459), 'left', 'dark'),
        ('save', 'SAVE TRANSACTION', 'sans', 400, (285, 1545, 660, 1586), 'center', 'light'),
    ],
    'drawer': [
        ('desc1', 'FINANCIAL LIFE.', 'sans', 400, (343, 224, 500, 242), 'left', 'dark'),
        ('desc2', 'BEAUTIFULLY ORGANIZED.', 'sans', 400, (343, 240, 600, 258), 'left', 'dark'),
        ('title', 'ACCOUNT', 'serif', 600, (330, 295, 700, 362), 'left', 'dark'),
        ('profileKicker', 'PROFILE', 'sans', 500, (538, 428, 630, 451), 'left', 'dark'),
        ('profileTitle', 'PREVIEW GUEST', 'serif', 600, (538, 461, 735, 494), 'left', 'dark'),
        ('profileGray', 'NO EMAIL ON DEVICE', 'sans', 400, (538, 497, 770, 521), 'left', 'dark'),
        ('currencyKicker', 'DISPLAY CURRENCY', 'sans', 500, (366, 588, 575, 611), 'left', 'dark'),
        ('currencyTitle', 'USD · US DOLLAR', 'serif', 600, (366, 617, 635, 654), 'left', 'dark'),
        ('currencyChange', 'CHANGE', 'sans', 500, (735, 608, 830, 632), 'left', 'dark'),
        ('connectionKicker', 'CONNECTION', 'sans', 500, (369, 706, 512, 729), 'left', 'dark'),
        ('connectionTitle', 'NOT SET', 'serif', 600, (369, 735, 515, 772), 'left', 'dark'),
        ('connectionSetup', 'SET UP', 'sans', 500, (750, 729, 832, 752), 'left', 'dark'),
        ('askKicker', 'ASK JURNL CONTEXT', 'sans', 500, (429, 833, 665, 856), 'left', 'dark'),
        ('ask1', 'HELP JURNL GIVE YOU', 'sans', 400, (431, 866, 700, 889), 'left', 'dark'),
        ('ask2', 'PERSONALIZED INSIGHTS', 'sans', 400, (431, 891, 715, 914), 'left', 'dark'),
        ('ask3', 'BASED ON YOUR SPENDING,', 'sans', 400, (431, 916, 745, 939), 'left', 'dark'),
        ('ask4', 'PLANS AND GOALS.', 'sans', 400, (431, 941, 660, 964), 'left', 'dark'),
        ('bufferKicker', 'SAFE TO SPEND BUFFER', 'sans', 500, (431, 1026, 705, 1049), 'left', 'dark'),
        ('buffer1', 'AMOUNT TO KEEP AS A BUFFER', 'sans', 400, (432, 1058, 775, 1081), 'left', 'dark'),
        ('buffer2', 'IN YOUR SAFE TO SPEND CALCULATION.', 'sans', 400, (432, 1083, 880, 1106), 'left', 'dark'),
        ('bufferValue', '$500', 'serif', 500, (455, 1128, 545, 1168), 'left', 'dark'),
        ('save', 'SAVE BUFFER', 'sans', 500, (585, 1209, 750, 1234), 'left', 'light'),
        ('privacyKicker', 'PRIVACY & CONSENTS', 'sans', 500, (473, 1329, 715, 1353), 'left', 'dark'),
        ('privacy1', 'MANAGE YOUR PRIVACY', 'sans', 400, (473, 1359, 715, 1384), 'left', 'dark'),
        ('privacy2', 'SETTINGS AND DATA CONSENTS.', 'sans', 400, (473, 1385, 800, 1409), 'left', 'dark'),
        ('signout', 'SIGN OUT', 'sans', 500, (455, 1515, 572, 1539), 'left', 'dark'),
    ],
}

# Boxes [x0, y0, x1, y1] in source px (gridded zooms, 1.5–1.6×).
BOX = {
    'qa': {
        'sheetTop': [0, 686, 941, 1672],
        'handle': [422, 702, 520, 710],
        'close': [826, 726, 899, 798],
        'closeX': [849, 749, 876, 776],
        'nameField': [67, 953, 877, 1031],
        'amountField': [67, 1094, 877, 1194],
        'amountDivider': [149, 1117, 151, 1174],
        'expense': [67, 1253, 463, 1337],
        'expenseIcon': [163, 1274, 208, 1318],
        'expenseDivider': [233, 1274, 235, 1318],
        'income': [479, 1253, 877, 1337],
        'incomeIcon': [577, 1272, 624, 1319],
        'incomeDivider': [652, 1274, 654, 1318],
        'checking': [67, 1397, 463, 1489],
        'checkingIcon': [107, 1425, 148, 1461],
        'checkingDivider': [180, 1417, 182, 1468],
        'checkingChevron': [417, 1437, 437, 1449],
        'cardOpt': [479, 1397, 877, 1489],
        'cardIcon': [517, 1425, 557, 1459],
        'cardDivider': [589, 1417, 591, 1468],
        'cardChevron': [822, 1437, 842, 1449],
        'save': [66, 1517, 877, 1611],
        'saveDivider': [749, 1541, 751, 1586],
        'saveArrow': [800, 1552, 836, 1579],
    },
    'drawer': {
        'close': [849, 90, 917, 159],
        'closeX': [871, 112, 895, 136],
        'sprig': [353, 120, 425, 175],
        'word': [347, 185, 505, 215],
        'rule': [340, 376, 465, 379],
        'profile': [340, 393, 917, 557],
        'thumb': [357, 410, 493, 537],
        'divProfile': [519, 423, 521, 527],
        'arrowProfile': [855, 465, 881, 487],
        'currency': [340, 570, 917, 673],
        'divCurrency': [698, 593, 700, 647],
        'arrowCurrency': [855, 609, 881, 631],
        'connection': [340, 687, 917, 797],
        'divConnection': [698, 713, 700, 767],
        'arrowConnection': [855, 730, 881, 751],
        'ask': [403, 808, 917, 987],
        'toggle': [785, 855, 885, 908],
        'buffer': [403, 1003, 917, 1267],
        'bufferField': [438, 1117, 898, 1177],
        'save': [438, 1190, 898, 1252],
        'saveArrow': [843, 1215, 866, 1231],
        'privacy': [340, 1280, 917, 1470],
        'privacyArrow': [862, 1359, 889, 1381],
        'signout': [340, 1483, 917, 1572],
        'signoutIcon': [375, 1508, 414, 1545],
        'signoutArrow': [859, 1517, 885, 1539],
    },
}


def main():
    items = []
    for screen, rows in TYPE.items():
        for (iid, text, fam, w, box, align, mode) in rows:
            item = {'id': f'{screen}.{iid}', 'text': text, 'family': fam, 'weight': w, 'ink': ink(screen, box, mode), 'align': align}
            item['size'] = SIZE[screen][iid]
            sx = CONDENSE[screen].get(iid)
            if sx:
                i0 = item['ink']
                item['ink'] = [i0[0], i0[1], round(i0[0] + (i0[2] - i0[0]) / sx), i0[3]]
            items.append(item)
    inp, out = os.path.join(WORK, 'items.json'), os.path.join(WORK, 'fit.json')
    json.dump(items, open(inp, 'w'))
    subprocess.run(['node', os.path.join(ROOT, 'scripts/jurnl/reference-replica/fit.mjs'), inp, out], check=True, cwd=ROOT, stdout=subprocess.DEVNULL)
    fit = {r['id']: r for r in json.load(open(out))}
    lines = [
        '/**',
        ' * F09 overlay replicas: layout measured from the founder sources (941 × 1672).',
        ' * Generated by scripts/jurnl/overlay-replica/measure.py — do not edit by hand.',
        ' */',
        "import type { RefBox, RefType } from './referenceLayout';",
        '',
    ]
    for screen, name in (('qa', 'OVR_QUICK_ADD'), ('drawer', 'OVR_DRAWER')):
        lines.append(f'export const {name} = {{')
        lines.append('  box: {')
        for k, v in BOX[screen].items():
            lines.append(f'    {k}: [{v[0]}, {v[1]}, {v[2]}, {v[3]}],')
        lines.append('  } satisfies Record<string, RefBox>,')
        lines.append('  text: {')
        for (iid, _t, fam, w, _b, align, _m) in TYPE[screen]:
            r = fit[f'{screen}.{iid}']
            it = next(i for i in items if i['id'] == f'{screen}.{iid}')
            anchor = f"cx: {r['cx']}" if 'cx' in r else f"left: {r['left']}"
            ib = ink(screen, _b, _m)
            sx = CONDENSE[screen].get(iid)
            cond = f', sx: {sx}' if sx else ''
            lines.append(f"    {iid}: {{ family: '{fam}', weight: {w}, size: {r['size']}, ls: {r['ls']}, top: {r['top']}, {anchor}{cond}, ink: [{ib[0]}, {ib[1]}, {ib[2]}, {ib[3]}] }},")
        lines.append('  } satisfies Record<string, RefType>,')
        lines.append('} as const;')
        lines.append('')
    path = os.path.join(ROOT, 'src/projects/jurnl/runtime/layout/overlayReferenceLayout.ts')
    open(path, 'w').write('\n'.join(lines))
    print('wrote', os.path.relpath(path, ROOT))
    for r in fit.values():
        print(r['id'], 'size', r['size'], 'ls', r['ls'], 'inkW', r['inkW'], 'refW', r['refW'], 'inkH', r['inkH'], 'refH', r['refH'])


if __name__ == '__main__':
    main()
