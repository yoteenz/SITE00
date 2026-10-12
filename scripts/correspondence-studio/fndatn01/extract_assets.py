#!/usr/bin/env python3
"""Decompose the FNDATN-01 founder visual authority into email parts.

Usage:
  pip install opencv-python-headless   # once; Pillow and numpy are already required
  python3 scripts/correspondence-studio/fndatn01/extract_assets.py

Reads only the committed authority JPEGs under public/site00-correspondence-studio/fndatn-01/authority/.
Every output is a crop of an authority image. Baked headline copy, client names, dates, amounts,
references, scope lists and card CTAs are removed by masked inpainting from the surrounding pixels of
the same image, so the live HTML can carry that content. Nothing is generated, upscaled from nothing,
or substituted. Writes assets plus ASSET_PROVENANCE.json describing each output's source rectangle
and the regions that were erased.
"""
import hashlib
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[3]
AUTH = ROOT / 'public/site00-correspondence-studio/fndatn-01/authority'
OUT = ROOT / 'public/site00-correspondence-studio/fndatn-01/assets'
PUBLIC = '/site00-correspondence-studio/fndatn-01/assets'
PROVENANCE = ROOT / 'docs/site00/correspondence/fndatn-01/FNDATN_01_ASSET_PROVENANCE.json'

DESKTOP_HERO_HEIGHT = 330  # CSS px at the 680 px canvas
DESKTOP_CANVAS = 680
MOBILE_CANVAS = 390

records = []


def load(slug, device):
    return cv2.imread(str(AUTH / slug / f'{device}.jpg'))


def text_mask(img, box, red_y1=None, dark_delta=28, sat_max=0.38, k=61, abs_dark=105, red=True):
    x0, y0, x1, y1 = box
    roi = img[y0:y1, x0:x1]
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    lum = gray.astype(np.int16)
    bg = cv2.medianBlur(gray, k).astype(np.int16)
    sat = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)[..., 1] / 255.0
    dark = (((bg - lum) > dark_delta) | (lum < abs_dark)) & ((sat < sat_max) | (lum < 70))
    b, g, r = (roi[..., i].astype(np.int16) for i in range(3))
    redm = (r - g > 70) & (r - b > 60) if red else np.zeros_like(dark)
    if red_y1 is not None:
        redm[max(0, red_y1 - y0):, :] = False
    m = np.zeros(img.shape[:2], np.uint8)
    m[y0:y1, x0:x1] = ((dark | redm) * 255).astype(np.uint8)
    return m


def quad_mask(img, quad, dark_delta=22, k=31):
    """Text on paper inside a tilted quadrilateral (card field blocks)."""
    poly = np.zeros(img.shape[:2], np.uint8)
    cv2.fillPoly(poly, [np.array(quad, np.int32)], 255)
    xs = [p[0] for p in quad]
    ys = [p[1] for p in quad]
    box = (max(0, min(xs) - 40), max(0, min(ys) - 40), min(img.shape[1], max(xs) + 40), min(img.shape[0], max(ys) + 40))
    m = text_mask(img, box, dark_delta=dark_delta, sat_max=0.5, k=k, abs_dark=150)
    return cv2.bitwise_and(m, poly)


def erase(img, mask, dilate=4, seed=7):
    m = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=dilate)
    f = 4
    small = cv2.resize(img, (img.shape[1] // f, img.shape[0] // f), interpolation=cv2.INTER_AREA)
    ms = cv2.resize(m, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_AREA)
    ms = cv2.dilate((ms > 0).astype(np.uint8) * 255, np.ones((3, 3), np.uint8), iterations=1)
    fill = cv2.resize(cv2.inpaint(small, ms, 5, cv2.INPAINT_TELEA), (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC)
    fine = cv2.inpaint(img, m, 3, cv2.INPAINT_TELEA).astype(np.float32)
    core = cv2.erode(m, np.ones((3, 3), np.uint8), iterations=3)
    w = cv2.GaussianBlur(core.astype(np.float32) / 255.0, (0, 0), 3)[..., None]
    out = fine * (1 - w) + fill.astype(np.float32) * w
    grain = np.random.default_rng(seed).normal(0, 2.2, img.shape).astype(np.float32)
    mw = cv2.GaussianBlur(m.astype(np.float32) / 255.0, (0, 0), 2)[..., None]
    out = np.where(m[..., None] > 0, out, img.astype(np.float32)) + grain * mw
    return np.clip(out, 0, 255).astype(np.uint8)


def save_jpg(img, rel, quality=84):
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(path), img, [cv2.IMWRITE_JPEG_QUALITY, quality, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
    return path


def save_png(img, rel):
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(path), img, [cv2.IMWRITE_PNG_COMPRESSION, 9])
    return path


def record(path, slug, device, rect, erased, note, css_size=None):
    h, w = cv2.imread(str(path), cv2.IMREAD_UNCHANGED).shape[:2]
    records.append({
        'asset': str(path.relative_to(OUT)),
        'public_path': f'{PUBLIC}/{path.relative_to(OUT)}',
        'source_authority': f'{slug}/{device}.jpg',
        'source_rect': {'x0': rect[0], 'y0': rect[1], 'x1': rect[2], 'y1': rect[3]},
        'pixels': {'width': w, 'height': h},
        'css_size': css_size,
        'erased_regions': erased,
        'note': note,
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
    })


def crop_resize(img, rect, width):
    x0, y0, x1, y1 = rect
    c = img[y0:y1, x0:x1]
    h = round(c.shape[0] * width / c.shape[1])
    return cv2.resize(c, (width, h), interpolation=cv2.INTER_AREA)


# ---------------------------------------------------------------------------------------------
# Hero art. Text boxes list (box, red_y1); red text is only removed above red_y1 so red glass in
# the lower scene survives. Card quads cover tilted field blocks (client, values, scope lists).

HEROES = {
    '01_invitation': {
        'desktop': {'rows': (70, 660), 'x1': 1400, 'text': [((50, 110, 495, 480), 360), ((50, 480, 175, 565), None)],
                    'quads': [[(808, 372), (1084, 384), (1078, 483), (805, 477)]]},
        'mobile': {'rect': (62, 155, 879, 882), 'text': [((90, 188, 466, 523), 408)],
                   'quads': [[(334, 612), (578, 625), (555, 724), (317, 711)]]},
    },
    '02_intake_received': {
        'desktop': {'rows': (72, 643), 'x1': 1360, 'text': [((50, 120, 550, 455), 345), ((50, 455, 255, 535), None)],
                    'quads': [[(811, 350), (1134, 365), (1128, 512), (808, 490)]]},
        'mobile': {'rect': (0, 91, 880, 1048), 'text': [((52, 148, 437, 585), 457)],
                   'quads': [[(247, 666), (590, 680), (600, 855), (243, 827)]]},
    },
    '03_recommendation_quote': {
        'desktop': {'rows': (70, 676), 'x1': 1390, 'text': [((50, 120, 585, 500), 425), ((50, 500, 180, 590), None)],
                    'quads': [[(819, 355), (1112, 364), (1106, 528), (816, 507)], [(1231, 370), (1322, 376), (1319, 470), (1228, 464)]]},
        'mobile': {'rect': (0, 92, 838, 1070), 'text': [((51, 147, 459, 560), 430), ((51, 560, 200, 660), None)],
                   'quads': [[(171, 744), (526, 762), (491, 936), (167, 911)], [(629, 780), (732, 787), (729, 886), (626, 879)]]},
    },
    '04_payment_received': {
        'desktop': {'rows': (70, 685), 'x1': 1480, 'text': [((50, 120, 465, 470), 405), ((50, 470, 340, 560), None)],
                    'quads': [[(787, 389), (1080, 400), (1076, 569), (784, 554)]]},
        'mobile': {'rect': (131, 106, 811, 621), 'text': [((160, 127, 490, 608), 498)], 'quads': []},
    },
    '05_foundation_complete': {
        'desktop': {'rows': (70, 656), 'x1': 1440, 'text': [((50, 120, 510, 520), 440), ((50, 520, 275, 620), None)],
                    'quads': []},
        'mobile': {'rect': (0, 92, 838, 880), 'text': [((51, 143, 413, 560), 422), ((51, 560, 260, 633), None)], 'quads': []},
    },
    '06_resume_intake': {
        'desktop': {'rows': (70, 682), 'x1': 1460, 'text': [((55, 120, 585, 520), 415), ((55, 520, 190, 615), None)],
                    'quads': []},
        'mobile': {'rect': (0, 88, 838, 935), 'text': [((51, 132, 431, 520), 500), ((51, 520, 376, 610), None), ((51, 640, 175, 724), None)],
                   'quads': []},
    },
    '07_quote_expiry': {
        'desktop': {'rows': (70, 668), 'x1': 1490, 'text': [((50, 120, 465, 540), 410), ((50, 540, 180, 625), None)],
                    'quads': [[(816, 383), (1073, 392), (1067, 542), (813, 521)], [(1176, 383), (1276, 389), (1273, 483), (1173, 477)]]},
        'mobile': {'rect': (0, 88, 838, 905), 'text': [((51, 143, 413, 540), 403), ((51, 540, 160, 614), None)],
                   'quads': [[(340, 653), (566, 665), (547, 794), (338, 775)], [(616, 674), (705, 682), (703, 768), (614, 761)]]},
    },
}


def build_hero(slug, device, cfg):
    img = load(slug, device)
    mask = np.zeros(img.shape[:2], np.uint8)
    erased = []
    for box, red_y1 in cfg['text']:
        mask |= text_mask(img, box, red_y1=red_y1)
        erased.append({'kind': 'baked_copy', 'box': list(box)})
    for quad in cfg['quads']:
        mask |= quad_mask(img, quad)
        erased.append({'kind': 'card_fields', 'quad': [list(p) for p in quad]})
    clean = erase(img, mask)
    if device == 'desktop':
        y0, y1 = cfg['rows']
        width = round((y1 - y0) * DESKTOP_CANVAS / DESKTOP_HERO_HEIGHT)
        x1 = cfg['x1']
        x0 = x1 - width
        rect = (x0, y0, x1, y1)
        out = cv2.resize(clean[y0:y1, x0:x1], (DESKTOP_CANVAS * 2, DESKTOP_HERO_HEIGHT * 2), interpolation=cv2.INTER_AREA)
        css = [DESKTOP_CANVAS, DESKTOP_HERO_HEIGHT]
    else:
        rect = cfg['rect']
        out = crop_resize(clean, rect, MOBILE_CANVAS * 2)
        css = [MOBILE_CANVAS, round(out.shape[0] / 2)]
    path = save_jpg(out, f'{slug}/hero-{device}.jpg')
    record(path, slug, device, rect, erased, f'{device} hero art; live headline, copy and record fields render over or beside it', css)
    return clean


# ---------------------------------------------------------------------------------------------
# Plain crops (no erasure): image strips that carry only brand words, the blueprint, the laptop.

STRIPS = {
    '01_invitation': {'desktop': {'left': (0, 818, 502, 948), 'right': (1080, 818, 1536, 948)}, 'mobile': {'strip': (62, 1242, 879, 1369)}},
    '02_intake_received': {'desktop': {'left': (0, 815, 510, 952), 'right': (1025, 815, 1536, 952)},
                           'mobile': {'strip': (0, 1367, 419, 1559), 'cta_side': (611, 1571, 880, 1694)}},
    '03_recommendation_quote': {'desktop': {'left': (0, 790, 477, 948), 'right': (1068, 835, 1536, 948)}, 'mobile': {'strip': (0, 1673, 838, 1806)}},
    '04_payment_received': {'desktop': {'left': (0, 803, 485, 952), 'right': (1218, 855, 1536, 952)}, 'mobile': {'blueprint': (131, 1040, 811, 1266)}},
    '05_foundation_complete': {'desktop': {'left': (0, 783, 480, 948), 'right': (1065, 819, 1536, 948)}, 'mobile': {'strip': (0, 1617, 838, 1783)}},
    '06_resume_intake': {'desktop': {'left': (0, 800, 517, 933)}, 'mobile': {'strip': (0, 1617, 838, 1788)}},
    '07_quote_expiry': {'desktop': {'left': (0, 798, 387, 942)}, 'mobile': {'strip': (0, 1656, 838, 1806)}},
}


def build_strips(slug):
    for device, parts in STRIPS[slug].items():
        img = load(slug, device)
        for name, rect in parts.items():
            x0, y0, x1, y1 = rect
            c = img[y0:y1, x0:x1]
            path = save_jpg(c, f'{slug}/{name}-{device}.jpg')
            record(path, slug, device, rect, [], f'{device} {name} crop')


# ---------------------------------------------------------------------------------------------
# 04 mobile receipt: the flat torn-paper receipt keeps its printed labels; only values are erased so
# live values sit in the value column.

RECEIPT_RECT = (131, 621, 811, 1040)
RECEIPT_VALUE_BOXES = [
    (345, 725, 560, 925),   # client .. status values
    (185, 975, 430, 1010),  # next step copy
    (515, 975, 690, 1008),  # project state value
]


def build_receipt():
    img = load('04_payment_received', 'mobile')
    mask = np.zeros(img.shape[:2], np.uint8)
    for box in RECEIPT_VALUE_BOXES:
        mask |= text_mask(img, box, dark_delta=22, sat_max=0.55, k=31, abs_dark=150)
    clean = erase(img, mask)
    out = crop_resize(clean, RECEIPT_RECT, MOBILE_CANVAS * 2)
    path = save_jpg(out, '04_payment_received/receipt-mobile.jpg')
    record(path, '04_payment_received', 'mobile', RECEIPT_RECT, [{'kind': 'receipt_values', 'box': list(b)} for b in RECEIPT_VALUE_BOXES],
           'mobile receipt paper with printed labels and PAID seal; live values overlay the value column', [MOBILE_CANVAS, round(out.shape[0] / 2)])


# ---------------------------------------------------------------------------------------------
# Marble band texture: 01 desktop info band with every glyph, icon and divider removed.

def build_marble():
    img = load('01_invitation', 'desktop')
    rect = (0, 666, 1536, 812)
    band = img[rect[1]:rect[3], rect[0]:rect[2]].copy()
    gray = cv2.cvtColor(band, cv2.COLOR_BGR2GRAY)
    bg = cv2.medianBlur(gray, 41).astype(np.int16)
    b, g, r = (band[..., i].astype(np.int16) for i in range(3))
    mask = (((bg - gray.astype(np.int16)) > 14) | ((r - g > 50) & (r - b > 40))).astype(np.uint8) * 255
    clean = erase(band, mask, dilate=5)
    path = save_jpg(clean, 'shared/marble-band.jpg', quality=80)
    record(path, '01_invitation', 'desktop', rect, [{'kind': 'band_copy_icons_dividers', 'box': [0, 0, 1536, 146]}], 'marble texture for info bands and panels')


# ---------------------------------------------------------------------------------------------
# Icons: transparent PNGs keyed from the dark ink of the authority icon set.

ICONS = {
    'person': ('01_invitation', (193, 980, 245, 1038)),
    'target': ('01_invitation', (193, 1065, 248, 1124)),
    'layers': ('01_invitation', (188, 1152, 248, 1212)),
    'magnifier': ('02_intake_received', (147, 1149, 196, 1201)),
    'bubble': ('02_intake_received', (419, 1149, 471, 1201)),
    'document': ('02_intake_received', (686, 1149, 733, 1201)),
    'globe': ('03_recommendation_quote', (180, 1144, 235, 1199)),
    'envelope': ('03_recommendation_quote', (180, 1229, 235, 1280)),
    'shield': ('03_recommendation_quote', (180, 1311, 235, 1366)),
    'device': ('03_recommendation_quote', (180, 1394, 235, 1449)),
    'records': ('03_recommendation_quote', (180, 1474, 235, 1533)),
    'square': ('04_payment_received', (212, 1324, 255, 1369)),
    'cube': ('06_resume_intake', (178, 1306, 226, 1357)),
    'gear': ('06_resume_intake', (176, 1388, 227, 1440)),
}
STATUS_ICONS = {
    'check-red': ('05_foundation_complete', (611, 1011, 658, 1058), 'red'),
    'check-ink': ('06_resume_intake', (569, 1060, 605, 1097), 'ink'),
    'ring-red': ('06_resume_intake', (569, 1229, 607, 1267), 'red'),
    'ring-pending': ('06_resume_intake', (569, 1311, 607, 1350), 'ink'),
}


def key_icon(crop, mode):
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY).astype(np.float32)
    paper = np.percentile(gray, 92)
    if mode == 'red':
        g = crop[..., 1].astype(np.float32)
        alpha = np.clip((np.percentile(g, 92) - g) / max(1.0, np.percentile(g, 92) - 40), 0, 1)
        color = np.array([28, 18, 214], np.float32)  # BGR, sampled red family of the authority
    else:
        ink = np.percentile(gray, 3)
        alpha = np.clip((paper - gray) / max(1.0, paper - ink), 0, 1)
        color = np.array([17, 17, 17], np.float32)
    alpha[alpha < 0.08] = 0
    ys, xs = np.nonzero(alpha > 0.25)
    pad = 3
    y0, y1 = max(0, ys.min() - pad), min(alpha.shape[0], ys.max() + pad + 1)
    x0, x1 = max(0, xs.min() - pad), min(alpha.shape[1], xs.max() + pad + 1)
    out = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
    out[..., :3] = color
    out[..., 3] = (alpha[y0:y1, x0:x1] * 255).astype(np.uint8)
    side = max(out.shape[:2])
    square = np.zeros((side, side, 4), np.uint8)
    oy, ox = (side - out.shape[0]) // 2, (side - out.shape[1]) // 2
    square[oy:oy + out.shape[0], ox:ox + out.shape[1]] = out
    return square


def build_icons():
    for name, (slug, rect) in ICONS.items():
        img = load(slug, 'mobile')
        x0, y0, x1, y1 = rect
        path = save_png(key_icon(img[y0:y1, x0:x1], 'ink'), f'icons/{name}.png')
        record(path, slug, 'mobile', rect, [], f'{name} icon, ink keyed to transparency')
    for name, (slug, rect, mode) in STATUS_ICONS.items():
        img = load(slug, 'mobile')
        x0, y0, x1, y1 = rect
        path = save_png(key_icon(img[y0:y1, x0:x1], mode), f'icons/{name}.png')
        record(path, slug, 'mobile', rect, [], f'{name} status mark keyed to transparency')


def main():
    for slug, devices in HEROES.items():
        for device, cfg in devices.items():
            build_hero(slug, device, cfg)
        build_strips(slug)
    build_receipt()
    build_marble()
    build_icons()
    PROVENANCE.write_text(json.dumps({
        'pack': 'FNDATN-01',
        'method': 'Crops of the committed authority JPEGs. Baked copy and variable fields removed by masked OpenCV '
                  'inpainting (Telea) from surrounding pixels of the same image. No generation, no stock imagery.',
        'script': 'scripts/correspondence-studio/fndatn01/extract_assets.py',
        'assets': records,
    }, indent=2) + '\n')
    print(f'wrote {len(records)} assets')


if __name__ == '__main__':
    main()
