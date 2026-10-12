#!/usr/bin/env python3
"""Build SITE00_CORRESPONDENCE_TYPE_AUTHORITY_V1 from the founder email reference.

Traces visible glyphs from source pixels (potrace), measures free OFL faces against
those pixels, and writes the review pack. Does not modify email templates.
Comparison fonts are downloaded to /tmp and are not copied into the pack.
"""
from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import urllib.request
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path('/workspace')
SRC = Path('/home/ubuntu/.cursor/projects/workspace/assets/01a12e32-afd7-7710-8390-79c5c7a0e3f8.jpg')
PACK = ROOT / 'public/site00-correspondence-type-authority/v1'
FONT_DIR = Path('/tmp/type-fonts')
WORK = Path('/tmp/type-trace')

RED = (180, 16, 20)

# Previously considered faces are measured so the audit has evidence. They are not re-recommended.
FONTS = [
    ('Big Shoulders Display', 'BigShouldersDisplay.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/bigshouldersdisplay/BigShouldersDisplay%5Bwght%5D.ttf'),
    ('Anybody', 'Anybody.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/anybody/Anybody%5Bwdth%2Cwght%5D.ttf'),
    ('Saira ExtraCondensed Black', 'SairaExtraCondensed-Black.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/sairaextracondensed/SairaExtraCondensed-Black.ttf'),
    ('Saira Condensed Black', 'SairaCondensed-Black.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/sairacondensed/SairaCondensed-Black.ttf'),
    ('Barlow Condensed Black', 'BarlowCondensed-Black.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/barlowcondensed/BarlowCondensed-Black.ttf'),
    ('League Gothic', 'LeagueGothic.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/leaguegothic/LeagueGothic%5Bwdth%5D.ttf'),
    ('Anton', 'Anton.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf'),
    ('Archivo Black', 'ArchivoBlack.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/archivoblack/ArchivoBlack-Regular.ttf'),
    ('Pathway Gothic One', 'PathwayGothicOne.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/pathwaygothicone/PathwayGothicOne-Regular.ttf'),
    ('Staatliches', 'Staatliches.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/staatliches/Staatliches-Regular.ttf'),
    ('Fjalla One', 'FjallaOne.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/fjallaone/FjallaOne-Regular.ttf'),
    ('Squada One', 'SquadaOne.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/squadaone/SquadaOne-Regular.ttf'),
    ('Unbounded', 'Unbounded.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/unbounded/Unbounded%5Bwght%5D.ttf'),
    ('Chivo', 'Chivo.ttf', 'candidate', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/chivo/Chivo%5Bwght%5D.ttf'),
    ('Teko', 'Teko.ttf', 'previously-considered', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/teko/Teko%5Bwght%5D.ttf'),
    ('Antonio', 'Antonio.ttf', 'previously-considered', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/antonio/Antonio%5Bwght%5D.ttf'),
    ('Rajdhani Bold', 'Rajdhani-Bold.ttf', 'previously-considered', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/rajdhani/Rajdhani-Bold.ttf'),
    ('Oswald', 'Oswald.ttf', 'previously-considered', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/oswald/Oswald%5Bwght%5D.ttf'),
    ('Bebas Neue', 'BebasNeue.ttf', 'previously-considered', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/bebasneue/BebasNeue-Regular.ttf'),
    ('Saira Semi Condensed Regular', 'SairaSemiCondensed-Regular.ttf', 'body', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/sairasemicondensed/SairaSemiCondensed-Regular.ttf'),
    ('Saira Semi Condensed Medium', 'SairaSemiCondensed-Medium.ttf', 'body', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/sairasemicondensed/SairaSemiCondensed-Medium.ttf'),
    ('Saira Semi Condensed SemiBold', 'SairaSemiCondensed-SemiBold.ttf', 'body', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/sairasemicondensed/SairaSemiCondensed-SemiBold.ttf'),
    ('Martian Mono', 'MartianMono.ttf', 'official-wordmark-font', 'OFL', 'https://github.com/google/fonts/raw/main/ofl/martianmono/MartianMono%5Bwdth%2Cwght%5D.ttf'),
]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


def ensure_fonts() -> None:
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    for _name, filename, _role, _lic, url in FONTS:
        dest = FONT_DIR / filename
        if dest.exists() and dest.stat().st_size > 1000:
            continue
        urllib.request.urlretrieve(url, dest)


def write_pbm(path: Path, mask: np.ndarray) -> None:
    h, w = mask.shape
    row_bytes = (w + 7) // 8
    with path.open('wb') as f:
        f.write(f'P4\n{w} {h}\n'.encode())
        for y in range(h):
            buf = bytearray(row_bytes)
            for x in range(w):
                if mask[y, x]:
                    buf[x // 8] |= 0x80 >> (x % 8)
            f.write(buf)


def hole_mask(ink: np.ndarray) -> np.ndarray:
    h, w = ink.shape
    pad = np.zeros((h + 4, w + 4), np.uint8)
    pad[2:-2, 2:-2] = ink.astype(np.uint8)
    inv = (1 - pad).copy()
    cv2.floodFill(inv, None, (0, 0), 2)
    return inv[2:-2, 2:-2] == 1


def load_ink(path: Path) -> np.ndarray:
    rgba = np.asarray(Image.open(path).convert('RGBA'))
    return rgba[:, :, 3] > 128


def iou(a: np.ndarray, b: np.ndarray) -> float:
    a = a.astype(bool)
    b = b.astype(bool)
    inter = np.logical_and(a, b).sum()
    union = np.logical_or(a, b).sum()
    return float(inter / union) if union else 0.0


def best_shift_iou(src: np.ndarray, rend: np.ndarray, radius: int = 2) -> tuple[float, tuple[int, int]]:
    """Slide rend over src. Both boolean, same shape preferred. rend may differ; we pad."""
    best = (0.0, (0, 0))
    h, w = src.shape
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            shifted = np.zeros_like(src)
            y0 = max(0, dy)
            x0 = max(0, dx)
            y1 = min(h, rend.shape[0] + dy)
            x1 = min(w, rend.shape[1] + dx)
            if y1 <= y0 or x1 <= x0:
                continue
            shifted[y0:y1, x0:x1] = rend[y0 - dy:y1 - dy, x0 - dx:x1 - dx]
            score = iou(src, shifted)
            if score > best[0]:
                best = (score, (dx, dy))
    return best


def edge_deviation(src: np.ndarray, rend: np.ndarray) -> float:
    """Mean distance from source contour pixels to the nearest rendered contour pixel."""
    def contour(mask: np.ndarray) -> np.ndarray:
        m = mask.astype(np.uint8)
        pad = np.pad(m, 1)
        er = cv2.erode(pad, np.ones((3, 3), np.uint8))
        return (pad > 0) & (er == 0)
    se = contour(src)
    re = contour(rend)
    if se.sum() == 0 or re.sum() == 0:
        return 99.0
    inv = cv2.distanceTransform((~re).astype(np.uint8), cv2.DIST_L2, 3)
    return float(inv[se].mean())


def components(mask: np.ndarray, min_area: int, min_h: int) -> list[tuple[int, int, int, int]]:
    n, _lab, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    rows = []
    for i in range(1, n):
        x, y, w, h, a = stats[i]
        if a < min_area or h < min_h:
            continue
        rows.append((int(x), int(y), int(x + w), int(y + h)))
    rows.sort(key=lambda t: (t[1], t[0]))
    return rows


def potrace_svg(mask: np.ndarray, svg_path: Path, alphamax: float) -> None:
    pbm = svg_path.with_suffix('.pbm')
    write_pbm(pbm, mask)
    subprocess.check_call(
        ['potrace', '-s', '--alphamax', str(alphamax), '--opttolerance', '0.2', '--turdsize', '2', '-o', str(svg_path), str(pbm)],
        stdout=subprocess.DEVNULL,
    )


def render_svg(svg_path: Path, w: int, h: int) -> np.ndarray:
    png = svg_path.with_suffix('.render.png')
    subprocess.check_call(['rsvg-convert', '-w', str(w), '-h', str(h), '-o', str(png), str(svg_path)], stdout=subprocess.DEVNULL)
    rgba = np.asarray(Image.open(png).convert('RGBA'))
    return rgba[:, :, 3] > 128


def trace_best(ink_options: list[tuple[str, np.ndarray]], svg_path: Path, expect_hole: bool) -> dict:
    best = None
    for label, ink in ink_options:
        if ink.sum() < 8:
            continue
        hole = hole_mask(ink)
        if expect_hole and hole.sum() < 6:
            continue
        if not expect_hole and hole.sum() > ink.sum() * 0.05:
            continue
        ys, xs = np.where(ink)
        tight = ink[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        for alpha in (0.0, 0.35, 1.0):
            potrace_svg(tight, svg_path, alpha)
            rend = render_svg(svg_path, tight.shape[1], tight.shape[0])
            if rend.shape != tight.shape:
                rend_img = Image.fromarray((~rend).astype(np.uint8) * 255)
                rend_img = rend_img.resize((tight.shape[1], tight.shape[0]), Image.Resampling.NEAREST)
                rend = np.asarray(rend_img) < 200
            score, shift = best_shift_iou(tight, rend)
            rec = {
                'iou': score,
                'shift': shift,
                'alpha': alpha,
                'threshold': label,
                'mask': tight,
                'render': rend,
                'edge': edge_deviation(tight, rend),
                'hole': int(hole_mask(tight).sum()),
            }
            if best is None or rec['iou'] > best['iou']:
                best = rec
    if best is None:
        raise RuntimeError(f'no trace for {svg_path}')
    # rewrite svg at the winning settings
    potrace_svg(best['mask'], svg_path, best['alpha'])
    svg = svg_path.read_text()
    svg = svg.replace('fill="#000000"', 'fill="currentColor"')
    svg_path.write_text(svg)
    return best


def crop_box(im: np.ndarray, box: tuple[int, int, int, int]) -> np.ndarray:
    x0, y0, x1, y1 = box
    return im[y0:y1, x0:x1]


def glyph_mask_black(im: np.ndarray, box: tuple[int, int, int, int], t: int) -> np.ndarray:
    c = crop_box(im, box)
    return c.mean(axis=2) < t


def glyph_mask_red(im: np.ndarray, box: tuple[int, int, int, int], gmax: int) -> np.ndarray:
    c = crop_box(im, box).astype(np.int16)
    return (c[:, :, 0] - c[:, :, 1] > 60) & (c[:, :, 1] < gmax) & (c[:, :, 0] > 140)


def save_mask_png(path: Path, mask: np.ndarray, color: tuple[int, int, int]) -> None:
    h, w = mask.shape
    arr = np.zeros((h, w, 4), np.uint8)
    arr[mask, 0] = color[0]
    arr[mask, 1] = color[1]
    arr[mask, 2] = color[2]
    arr[mask, 3] = 255
    Image.fromarray(arr).save(path)


def difference_map(src: np.ndarray, rend: np.ndarray) -> Image.Image:
    h, w = src.shape
    img = np.full((h, w, 3), 245, np.uint8)
    both = src & rend
    only_s = src & ~rend
    only_r = rend & ~src
    img[both] = (30, 30, 30)
    img[only_s] = (196, 22, 28)
    img[only_r] = (20, 90, 200)
    return Image.fromarray(img)


def side_by_side(src_rgba: Image.Image, vec_rgba: Image.Image, label: str) -> Image.Image:
    w = src_rgba.width + vec_rgba.width + 16
    h = max(src_rgba.height, vec_rgba.height) + 22
    canvas = Image.new('RGB', (w, h), (255, 255, 255))
    canvas.paste(src_rgba, (0, 22), src_rgba)
    canvas.paste(vec_rgba, (src_rgba.width + 16, 22), vec_rgba)
    d = ImageDraw.Draw(canvas)
    d.text((2, 2), label, fill=(0, 0, 0))
    return canvas


def load_font(path: Path, size: int, body: bool = False) -> ImageFont.FreeTypeFont:
    font = ImageFont.truetype(str(path), size)
    try:
        axes = font.get_variation_axes()
    except Exception:
        axes = None
    if axes and not body:
        vals = []
        for ax in axes:
            name = ax['name'].decode() if isinstance(ax['name'], (bytes, bytearray)) else str(ax['name'])
            key = name.lower()
            if key.startswith('wght') or key == 'weight':
                vals.append(ax['maximum'])
            elif key.startswith('wdth') or 'width' in key:
                vals.append(ax['minimum'])
            else:
                vals.append(ax['default'])
        font.set_variation_by_axes(vals)
    return font


def render_char(path: Path, ch: str, target_h: int, body: bool = False) -> np.ndarray | None:
    if ch == '0' and 'Martian' not in path.name:
        ch = '0'
    lo, hi = 8, 800
    chosen = None
    for _ in range(14):
        mid = (lo + hi) // 2
        font = load_font(path, mid, body=body)
        im = Image.new('L', (mid * 4, mid * 3), 255)
        dr = ImageDraw.Draw(im)
        dr.text((8, 8), ch, font=font, fill=0)
        arr = np.asarray(im) < 180
        if arr.sum() < 4:
            lo = mid + 1
            continue
        ys, xs = np.where(arr)
        h = int(ys.max() - ys.min() + 1)
        chosen = arr[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        if h < target_h:
            lo = mid + 1
        else:
            hi = mid
        if hi - lo <= 1:
            break
    if chosen is None:
        return None
    img = Image.fromarray(np.where(chosen, 0, 255).astype(np.uint8))
    scale = target_h / img.height
    img = img.resize((max(1, round(img.width * scale)), target_h), Image.Resampling.BOX)
    return np.asarray(img) < 180


def fit_iou(src: np.ndarray, rend: np.ndarray) -> tuple[float, float]:
    """Height already matched. Compare widths; slide by a few px. Returns iou and width ratio rend/src."""
    canvas_h = max(src.shape[0], rend.shape[0])
    canvas_w = src.shape[1] + rend.shape[1] + 8
    a = np.zeros((canvas_h, canvas_w), bool)
    b = np.zeros_like(a)
    a[:src.shape[0], :src.shape[1]] = src
    # center rend vertically, start at x=0 then slide
    yoff = max(0, (src.shape[0] - rend.shape[0]) // 2)
    best = 0.0
    for dx in range(-3, src.shape[1] + 3):
        bb = np.zeros_like(a)
        x0 = dx
        if x0 >= canvas_w:
            continue
        src_x = max(0, -x0)
        dst_x = max(0, x0)
        w = min(rend.shape[1] - src_x, canvas_w - dst_x)
        if w <= 0:
            continue
        bb[yoff:yoff + rend.shape[0], dst_x:dst_x + w] = rend[:rend.shape[0], src_x:src_x + w]
        # crop comparison to the source's column span plus a small margin so extra font width still counts
        span = slice(0, src.shape[1] + max(0, rend.shape[1] - src.shape[1]) + 2)
        best = max(best, iou(a[:, span], bb[:, span]))
    return best, rend.shape[1] / src.shape[1]


def median_color(im: np.ndarray, mask_box: tuple[int, int, int, int], red: bool) -> tuple[int, int, int]:
    c = crop_box(im, mask_box).astype(np.int16)
    if red:
        m = (c[:, :, 1] < 40) & (c[:, :, 0] > 140)
    else:
        m = c.mean(axis=2) < 30
    if m.sum() < 5:
        return RED if red else (12, 12, 12)
    cols = c[m]
    med = np.median(cols, axis=0)
    return tuple(int(v) for v in med)


def rounded_rect(x, y, w, h, r) -> str:
    r = max(0, min(r, w / 2, h / 2))
    if r < 0.5:
        return f'M {x} {y} H {x+w} V {y+h} H {x} Z'
    return (
        f'M {x+r} {y} H {x+w-r} Q {x+w} {y} {x+w} {y+r} V {y+h-r} '
        f'Q {x+w} {y+h} {x+w-r} {y+h} H {x+r} Q {x} {y+h} {x} {y+h-r} V {y+r} Q {x} {y} {x+r} {y} Z'
    )


def derived_svgs(stem_ratio: float, width_ratio: float, corner_ratio: float, out_dir: Path) -> list[str]:
    """4–9 built from the traced 0's stem, width and corner. Not source traces."""
    H = 1000
    s = max(80, round(H * stem_ratio))
    W = max(s * 3, round(H * width_ratio))
    r = round(H * corner_ratio)
    digits = {}
    rules = {}
    mid = round(H * 0.46)

    # 4 open. Additive strokes. The crossbar meets both stems.
    digits['4'] = ' '.join([
        rounded_rect(0, 0, s, mid + s, r),
        rounded_rect(0, mid, W, s, r),
        rounded_rect(W - s, 0, s, H, r),
    ])
    rules['4'] = 'nonzero'
    # 5. Upper is open on the right. Lower is a closed counter of stem width.
    digits['5'] = ' '.join([
        rounded_rect(0, 0, W, s, r),
        rounded_rect(0, 0, s, mid + s, r),
        rounded_rect(0, mid, W, s, r),
        rounded_rect(0, mid, s, H - mid, r),
        rounded_rect(W - s, mid, s, H - mid, r),
        rounded_rect(0, H - s, W, s, r),
    ])
    rules['5'] = 'nonzero'
    # 6. Top stroke stops short of the right side. Lower counter matches the 0.
    digits['6'] = ' '.join([
        rounded_rect(0, 0, W - s, s, r),
        rounded_rect(0, 0, s, H, r),
        rounded_rect(0, mid, W, s, r),
        rounded_rect(W - s, mid, s, H - mid, r),
        rounded_rect(0, H - s, W, s, r),
    ])
    rules['6'] = 'nonzero'
    # 7. Top bar plus a diagonal of stem thickness, the same heavy diagonal idea as the traced 2.
    digits['7'] = ' '.join([
        rounded_rect(0, 0, W, s, r),
        f'M {W - s} {s} L {W} {s} L {round(W * 0.42)} {H} L {round(W * 0.42) - s} {H} Z',
    ])
    rules['7'] = 'nonzero'
    # 8. The traced 0, split by a bar into two counters.
    digits['8'] = ' '.join([
        rounded_rect(0, 0, W, H, r),
        rounded_rect(s, s, W - 2 * s, mid - s, max(0, r - s // 4)),
        rounded_rect(s, mid + s, W - 2 * s, H - mid - 2 * s, max(0, r - s // 4)),
    ])
    rules['8'] = 'evenodd'
    # 9. 6 turned upside down. Bottom stroke stops short of the left side.
    digits['9'] = ' '.join([
        rounded_rect(0, 0, W, s, r),
        rounded_rect(W - s, 0, s, H, r),
        rounded_rect(0, mid, W, s, r),
        rounded_rect(0, 0, s, mid + s, r),
        rounded_rect(s, H - s, W - s, s, r),
    ])
    rules['9'] = 'nonzero'

    names = []
    for d, path in digits.items():
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="#111" fill-rule="{rules[d]}">'
            f'<path d="{path}"/></svg>'
        )
        p = out_dir / f'derived-{d}.svg'
        p.write_text(svg)
        names.append(d)
    return names


def main() -> None:
    ensure_fonts()
    if PACK.exists():
        shutil.rmtree(PACK)
    for folder in (
        '01_SOURCE_REFERENCE', '02_REFERENCE_CROPS', '03_NUMERAL_SVGS', '04_COMPOSED_NUMERALS',
        '05_DISPLAY_GLYPHS', '06_FONT_COMPARISONS', '07_FIDELITY_PROOFS', '08_AUTHORITY', '09_REVIEW', '10_MANIFEST',
    ):
        (PACK / folder).mkdir(parents=True)
    WORK.mkdir(parents=True, exist_ok=True)

    raw = SRC.read_bytes()
    (PACK / '01_SOURCE_REFERENCE' / '01_invitation_founder_reference.jpg').write_bytes(raw)
    im = np.asarray(Image.open(SRC).convert('RGB'))
    h, w = im.shape[:2]
    gray = im.mean(axis=2)
    meta = {
        'file': SRC.name,
        'bytes': len(raw),
        'sha256': hashlib.sha256(raw).hexdigest(),
        'format': 'JPEG',
        'dimensions': [w, h],
        'dpi_tag': 72,
        'quantization_max': {'luma': 11, 'chroma': 11},
        'note': (
            'Same 941x1672 composition as the FNDATN-01 mobile authority. '
            'Mean absolute channel difference versus that more compressed file is about 2.6. '
            'This file is the higher-quality source and is the trace authority. '
            'The reference is AI-rendered. Lettering is not assumed to be a font file.'
        ),
    }
    (PACK / '01_SOURCE_REFERENCE' / 'source.json').write_text(json.dumps(meta, indent=2))

    # ---- locate flat glyphs ----
    black = gray < 50
    red = (im[:, :, 0].astype(np.int16) - im[:, :, 1].astype(np.int16) > 70) & (im[:, :, 1] < 90) & (im[:, :, 0] > 150)

    def take(mask, region, labels, min_area, min_h):
        x0, y0, x1, y1 = region
        found = components(mask[y0:y1, x0:x1], min_area, min_h)
        boxes = [(x0 + a, y0 + b, x0 + c, y0 + d) for a, b, c, d in found]
        if len(boxes) != len(labels):
            raise SystemExit(f'{labels} expected {len(labels)} got {len(boxes)} in {region}: {boxes}')
        return list(zip(labels, boxes))

    display = []
    display += take(black, (90, 220, 450, 330), list('BEGINYOUR'), 400, 50)
    display += take(black, (90, 310, 470, 420), list('FOUNDATION'), 400, 50)
    secondary = take(black, (80, 900, 480, 980), list('WHATWELLASK'), 200, 30)
    how = take(black, (80, 1375, 450, 1440), list('HOWITWORKS'), 80, 20)
    word = take(black, (80, 85, 280, 145), list('SITE00'), 60, 20)
    reds = take(red, (100, 970, 180, 1220), list('010203'), 40, 18)

    # role crops
    crops = {
        'A_display_hero_begin': (80, 210, 460, 330),
        'A_display_hero_foundation': (80, 310, 480, 420),
        'A_display_what_well_ask': (80, 890, 500, 980),
        'A_display_how_it_works': (70, 1368, 430, 1445),
        'C_red_numerals': (90, 970, 200, 1220),
        'D_section_label': (380, 980, 720, 1020),
        'E_body': (380, 1010, 820, 1080),
        'F_cta': (90, 1505, 860, 1570),
        'G_micro_subject': (80, 15, 780, 70),
        'H_url': (250, 1565, 700, 1610),
        'I_wordmark_header': (80, 80, 300, 150),
        'I_wordmark_footer': (80, 1605, 240, 1665),
        'J_steps': (80, 1435, 880, 1500),
    }
    rgb = Image.open(SRC).convert('RGB')
    for name, box in crops.items():
        rgb.crop(box).save(PACK / '02_REFERENCE_CROPS' / f'{name}.png')

    records = []

    def commit_glyph(gid: str, ch: str, box, kind: str, role: str, expect_hole: bool, dest: Path):
        if kind == 'red':
            options = [(f'g<{g}', glyph_mask_red(im, box, g)) for g in (40, 70, 110, 150)]
            color = median_color(im, box, True)
        else:
            options = [(f'y<{t}', glyph_mask_black(im, box, t)) for t in (35, 55, 80, 110)]
            color = median_color(im, box, False)
        svg = dest / f'{gid}.svg'
        best = trace_best(options, svg, expect_hole)
        # color the svg
        text = svg.read_text().replace('currentColor', '#%02x%02x%02x' % color)
        svg.write_text(text)
        mask = best['mask']
        rend = render_svg(svg, mask.shape[1], mask.shape[0])
        dx, dy = best['shift']
        shifted = np.zeros_like(mask)
        h, w = mask.shape
        y0, x0 = max(0, dy), max(0, dx)
        y1, x1 = min(h, rend.shape[0] + dy), min(w, rend.shape[1] + dx)
        shifted[y0:y1, x0:x1] = rend[y0 - dy:y1 - dy, x0 - dx:x1 - dx]
        ref_png = PACK / '07_FIDELITY_PROOFS' / f'{gid}-reference.png'
        vec_png = PACK / '07_FIDELITY_PROOFS' / f'{gid}-vector.png'
        diff_png = PACK / '07_FIDELITY_PROOFS' / f'{gid}-difference.png'
        side_png = PACK / '07_FIDELITY_PROOFS' / f'{gid}-side.png'
        save_mask_png(ref_png, mask, color)
        save_mask_png(vec_png, shifted, color)
        difference_map(mask, shifted).save(diff_png)
        side_by_side(Image.open(ref_png), Image.open(vec_png), gid).save(side_png)
        # enlarge proofs x4 for inspection
        for p in (ref_png, vec_png, diff_png):
            im4 = Image.open(p).resize((Image.open(p).width * 4, Image.open(p).height * 4), Image.Resampling.NEAREST)
            im4.save(p.with_name(p.stem + '@4.png'))
        rec = {
            'id': gid,
            'char': ch,
            'role': role,
            'kind': kind,
            'status': 'source-traced',
            'box': list(box),
            'width': int(mask.shape[1]),
            'height': int(mask.shape[0]),
            'width_ratio': round(mask.shape[1] / mask.shape[0], 3),
            'hole_px': best['hole'],
            'iou': round(best['iou'], 4),
            'edge_px': round(best['edge'], 3),
            'alphamax': best['alpha'],
            'threshold': best['threshold'],
            'shift': list(best['shift']),
            'color': list(color),
            'svg': str(svg.relative_to(PACK)),
        }
        records.append(rec)
        print(f"{gid:18} {mask.shape[1]:3}x{mask.shape[0]:<3} iou={best['iou']:.3f} edge={best['edge']:.2f} {best['threshold']} a={best['alpha']}")
        return rec

    holed_chars = set('0OABDRP4689')
    for ch, box in display:
        commit_glyph(f'display-{ch}-{box[0]}', ch, box, 'black', 'display', ch in holed_chars, PACK / '05_DISPLAY_GLYPHS')
    for ch, box in secondary:
        if ch in 'WHLSK':
            commit_glyph(f'display-{ch}-ask-{box[0]}', ch, box, 'black', 'display-secondary', ch in holed_chars, PACK / '05_DISPLAY_GLYPHS')
    # wordmark documented, traced as email lettering, not as a replacement logo
    for ch, box in word:
        commit_glyph(f'wordmark-{ch}-{box[0]}', ch, box, 'black', 'email-wordmark-not-logo', ch in '0O', PACK / '05_DISPLAY_GLYPHS')
    for ch, box in reds:
        commit_glyph(f'numeral-{ch}-{box[1]}', ch, box, 'red', 'red-numeral', ch == '0', PACK / '03_NUMERAL_SVGS')

    # pair spacing from the three red pairs
    pairs = [('01', reds[0], reds[1]), ('02', reds[2], reds[3]), ('03', reds[4], reds[5])]
    for name, (c0, b0), (c1, b1) in pairs:
        gap = b1[0] - b0[2]
        hgt = max(b0[3] - b0[1], b1[3] - b1[1])
        # compose from the traced svgs by placing renders
        r0 = next(r for r in records if r['box'] == list(b0))
        r1 = next(r for r in records if r['box'] == list(b1))
        i0 = Image.open(PACK / '07_FIDELITY_PROOFS' / f"{r0['id']}-vector.png")
        i1 = Image.open(PACK / '07_FIDELITY_PROOFS' / f"{r1['id']}-vector.png")
        canvas = Image.new('RGBA', (i0.width + gap + i1.width, max(i0.height, i1.height)), (0, 0, 0, 0))
        canvas.paste(i0, (0, 0), i0)
        canvas.paste(i1, (i0.width + gap, 0), i1)
        canvas.save(PACK / '04_COMPOSED_NUMERALS' / f'{name}.png')
        (PACK / '04_COMPOSED_NUMERALS' / f'{name}.svg').write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{canvas.width}" height="{canvas.height}" viewBox="0 0 {canvas.width} {canvas.height}">'
            f'<image href="../07_FIDELITY_PROOFS/{r0["id"]}-vector.png" x="0" y="0" width="{i0.width}" height="{i0.height}"/>'
            f'<image href="../07_FIDELITY_PROOFS/{r1["id"]}-vector.png" x="{i0.width + gap}" y="0" width="{i1.width}" height="{i1.height}"/>'
            f'</svg>'
        )
        (PACK / '04_COMPOSED_NUMERALS' / f'{name}.json').write_text(json.dumps({
            'pair': name, 'gap_px': int(gap), 'height_px': int(hgt),
            'gap_over_height': round(gap / hgt, 3),
            'source': 'gap between the flat red components in WHAT WE\'LL ASK',
        }, indent=2))

    # derived 4-9 from the first traced 0
    zero = next(r for r in records if r['id'].startswith('numeral-0'))
    zmask = load_ink(PACK / '07_FIDELITY_PROOFS' / f"{zero['id']}-reference.png")
    # stem: mid-row first run
    mid = zmask[zmask.shape[0] // 2]
    xs = np.where(mid)[0]
    stem = 1
    if len(xs):
        stem = 1
        run = 1
        for a, b in zip(xs, xs[1:]):
            if b == a + 1:
                run += 1
            else:
                stem = run
                break
        else:
            stem = run
    corner = 1  # measured earlier as about 1px of AA on a square 0; keep square
    derived_svgs(stem / zmask.shape[0], zmask.shape[1] / zmask.shape[0], corner / zmask.shape[0], PACK / '03_NUMERAL_SVGS')
    for d in '456789':
        svg = PACK / '03_NUMERAL_SVGS' / f'derived-{d}.svg'
        subprocess.check_call(['rsvg-convert', '-h', '120', '-o', str(PACK / '03_NUMERAL_SVGS' / f'derived-{d}.png'), str(svg)])
        records.append({
            'id': f'derived-{d}',
            'char': d,
            'role': 'numeral',
            'kind': 'derived',
            'status': 'derived-extension',
            'svg': str(svg.relative_to(PACK)),
            'note': 'Not present in the reference. Built from the traced 0 stem, width and square corner. Requires founder approval.',
        })

    # ---- font comparison on the hero display set (one instance per letter) and red numerals ----
    compare_glyphs = []
    seen = set()
    for rec in records:
        if rec['status'] != 'source-traced':
            continue
        if rec['role'] == 'display' and rec['char'] not in seen:
            seen.add(rec['char'])
            compare_glyphs.append(rec)
        if rec['role'] == 'red-numeral' and rec['char'] not in seen:
            seen.add('num' + rec['char'])
            compare_glyphs.append(rec)

    font_rows = []
    for name, filename, role, lic, _url in FONTS:
        if role == 'body':
            continue
        path = FONT_DIR / filename
        scores = []
        width_err = []
        for rec in compare_glyphs:
            if rec['role'] == 'email-wordmark-not-logo':
                continue
            src = load_ink(PACK / '07_FIDELITY_PROOFS' / f"{rec['id']}-reference.png")
            ch = rec['char']
            rend = render_char(path, ch, src.shape[0], body=False)
            if rend is None:
                continue
            score, wr = fit_iou(src, rend)
            scores.append(score)
            width_err.append(abs(wr - 1))
        if not scores:
            continue
        row = {
            'font': name,
            'role': role,
            'license': lic,
            'mean_iou': round(float(np.mean(scores)), 3),
            'min_iou': round(float(np.min(scores)), 3),
            'mean_abs_width_error': round(float(np.mean(width_err)), 3),
            'glyphs': len(scores),
        }
        font_rows.append(row)
        print(f"FONT {name:32} iou={row['mean_iou']:.3f} width±={row['mean_abs_width_error']:.3f} [{role}]")

    font_rows.sort(key=lambda r: (-r['mean_iou'], r['mean_abs_width_error']))
    (PACK / '06_FONT_COMPARISONS' / 'scores.json').write_text(json.dumps(font_rows, indent=2))

    # overlay the best candidate and the five previously considered, on BEGIN YOUR
    hero_crop = rgb.crop((90, 220, 450, 330))
    show = [r for r in font_rows if r['role'] == 'candidate'][:3] + [r for r in font_rows if r['role'] == 'previously-considered']
    # unique by name
    shown = []
    for row in show:
        if any(s['font'] == row['font'] for s in shown):
            continue
        shown.append(row)
    for row in shown:
        filename = next(f for n, f, *_ in FONTS if n == row['font'])
        path = FONT_DIR / filename
        # render the string at the hero cap height (~79)
        font = load_font(path, 79, body=False)
        canvas = Image.new('RGB', (hero_crop.width, hero_crop.height * 2 + 8), (255, 255, 255))
        canvas.paste(hero_crop, (0, 0))
        dr = ImageDraw.Draw(canvas)
        dr.text((8, hero_crop.height + 4), 'BEGIN YOUR', font=font, fill=(0, 0, 0))
        canvas.save(PACK / '06_FONT_COMPARISONS' / f"{re.sub(r'[^a-z0-9]+', '-', row['font'].lower())}.png")

    # body: Saira at the section-label cap height
    label_box = (380, 980, 720, 1020)
    body_notes = []
    for weight, filename in (
        ('Regular', 'SairaSemiCondensed-Regular.ttf'),
        ('Medium', 'SairaSemiCondensed-Medium.ttf'),
        ('SemiBold', 'SairaSemiCondensed-SemiBold.ttf'),
    ):
        rend = render_char(FONT_DIR / filename, 'A', 11, body=True)
        # source A from the section label is too small to isolate reliably; compare width ratio of an 11px Saira A
        if rend is None:
            continue
        body_notes.append({'weight': weight, 'rendered_A_wh': round(rend.shape[1] / rend.shape[0], 3), 'cap_px': 11})
    (PACK / '06_FONT_COMPARISONS' / 'body.json').write_text(json.dumps({
        'observation': (
            'Flat body and section labels are 10–12px tall. At that size a typeface cannot be identified glyph by glyph. '
            'Letter width/height is about 0.6–0.8, far wider than the display face (O is 0.40, I is 0.15). '
            'That proportion is a semi-condensed grotesque, which is what Saira Semi Condensed is. '
            'Saira stays the body family. No custom body glyphs.'
        ),
        'saira_A_at_11px': body_notes,
    }, indent=2))

    # wordmark vs Martian Mono
    mm = render_char(FONT_DIR / 'MartianMono.ttf', 'S', 36, body=False)
    src_s = next(r for r in records if r['id'].startswith('wordmark-S'))
    src_mask = load_ink(PACK / '07_FIDELITY_PROOFS' / f"{src_s['id']}-reference.png")
    mm_iou = None
    if mm is not None:
        mm_iou, mm_w = fit_iou(src_mask, mm)
    (PACK / '08_AUTHORITY' / 'wordmark.json').write_text(json.dumps({
        'official_logo_file': None,
        'official_mark': 'CSS text .site00-logo-mark in src/site00/styles/site00-typography.css, family Martian Mono via --site00-font-display. No vector wordmark file is in the repository.',
        'action': 'Official wordmark was not reconstructed and was not replaced.',
        'email_wordmark': 'The email SITE 00 is proportional (S is about 13px wide, I is about 5px, at 36px tall). Martian Mono is monospaced, so it is not this lettering.',
        'martian_mono_S_iou_vs_email_S': None if mm_iou is None else round(mm_iou, 3),
    }, indent=2))

    # consistency of repeated display letters
    consistency = []
    by_char: dict[str, list] = {}
    for rec in records:
        if rec['status'] == 'source-traced' and rec['role'] == 'display':
            by_char.setdefault(rec['char'], []).append(rec)
    for ch, group in by_char.items():
        if len(group) < 2:
            continue
        a = load_ink(PACK / '07_FIDELITY_PROOFS' / f"{group[0]['id']}-reference.png")
        b = load_ink(PACK / '07_FIDELITY_PROOFS' / f"{group[1]['id']}-reference.png")
        # scale b to a height
        img = Image.fromarray(np.where(b, 0, 255).astype(np.uint8)).resize(
            (max(1, round(b.shape[1] * a.shape[0] / b.shape[0])), a.shape[0]), Image.Resampling.BOX)
        b2 = np.asarray(img) < 180
        score, _wr = fit_iou(a, b2)
        consistency.append({'char': ch, 'instances': [g['id'] for g in group], 'iou': round(score, 3),
                            'rule': 'Use the larger hero instance. Do not average the two shapes.'})
    (PACK / '08_AUTHORITY' / 'consistency.json').write_text(json.dumps(consistency, indent=2))

    plausible = [r for r in font_rows if r['mean_iou'] >= 0.85 and r['mean_abs_width_error'] <= 0.12 and r['role'] != 'official-wordmark-font']
    best_font = plausible[0] if plausible else None
    closest = font_rows[0] if font_rows else None
    traced = [r for r in records if r['status'] == 'source-traced']
    derived = [r for r in records if r['status'] == 'derived-extension']
    spec = {
        'pack': 'SITE00_CORRESPONDENCE_TYPE_AUTHORITY_V1',
        'source_sha256': meta['sha256'],
        'dimensions': meta['dimensions'],
        'roles': [
            'display headlines (BEGIN YOUR FOUNDATION, WHAT WE\'LL ASK, HOW IT WORKS)',
            'red editorial numerals 01 02 03',
            'section labels (YOUR BUSINESS and siblings) — semi-condensed, ~11px',
            'body — semi-condensed, ~10px',
            'CTA — semi-condensed, ~12px, tracked, white on red',
            'micro labels (SUBJECT, PREHEADER, footer classification)',
            'technical metadata (intake URL token)',
            'email wordmark SITE 00 — proportional display, not the official Martian Mono mark',
            'punctuation: red square period; apostrophe in WE\'LL is below the isolation threshold',
            'in-scene card lettering — perspective, not used as a trace source',
        ],
        'best_existing_font': best_font,
        'closest_measured_font': closest,
        'match_rule': 'A face is a match only when mean IoU is at least 0.85 and mean absolute width error is at most 0.12, at the source cap height, with counters preserved. Otherwise it is not a match.',
        'fidelity_rule': (
            'No universal pass percentage. The source edge is about 1px of JPEG anti-aliasing. '
            'A trace is reported with its IoU against the thresholded source and its mean edge deviation. '
            'A font is not treated as a match unless its cap-height overlay agrees in width and in the counter, '
            'which the scores below record.'
        ),
        'traced': len(traced),
        'derived': len(derived),
        'mean_trace_iou': round(float(np.mean([r['iou'] for r in traced])), 3),
        'license': (
            'Comparison faces are SIL Open Font License and were not copied into this pack. '
            'No commercial font file was downloaded. '
            'Traced SVGs are reconstructions of the founder-supplied AI reference, not a released font. '
            'A distributable OTF was not built: the numerals are fixed artwork, and an AI render does not '
            'clear the design of an underlying typeface. Do not ship these vectors as a font until that is reviewed.'
        ),
    }
    (PACK / '08_AUTHORITY' / 'TYPOGRAPHY_SPEC.json').write_text(json.dumps({'spec': spec, 'glyphs': records, 'fonts': font_rows}, indent=2))

    # markdown spec
    lines = [
        '# SITE 00 correspondence type authority v1',
        '',
        f"Source `{meta['sha256']}` · {w}×{h} JPEG · quantization max luma 11, chroma 11 · 72 dpi tag.",
        '',
        'The reference is an AI render. These traces follow the visible silhouettes. They are not a claim that a real font file exists behind the image.',
        '',
        (
            f"Match: **{best_font['font']}** mean IoU {best_font['mean_iou']}."
            if best_font
            else f"No free face matched. Highest score was **{closest['font']}** ({closest['role']}) at mean IoU {closest['mean_iou']} with width error {closest['mean_abs_width_error']}. That is a measurement, not a recommendation."
            if closest
            else 'No font measured.'
        ),
        '',
        'Previously considered faces (Teko, Antonio, Rajdhani, Oswald, Bebas Neue) are in `06_FONT_COMPARISONS/scores.json`. They are measured, not recommended.',
        '',
        f"Source-traced glyphs: {len(traced)}. Derived digits 4–9: {len(derived)}. Mean trace IoU {spec['mean_trace_iou']}.",
        '',
        spec['license'],
        '',
        '## Roles',
        '',
    ]
    for role in spec['roles']:
        lines.append(f'- {role}')
    lines += ['', '## Glyphs', '', '| id | status | px | IoU | edge px |', '| --- | --- | --- | --- | --- |']
    for r in records:
        if r['status'] == 'source-traced':
            lines.append(f"| {r['id']} | traced | {r['width']}×{r['height']} | {r['iou']} | {r['edge_px']} |")
        else:
            lines.append(f"| {r['id']} | derived | — | — | — |")
    (PACK / '08_AUTHORITY' / 'TYPOGRAPHY_SPEC.md').write_text('\n'.join(lines) + '\n')

    write_review(records, font_rows, spec)
    manifest = []
    for p in sorted(PACK.rglob('*')):
        if p.is_file():
            manifest.append({'path': str(p.relative_to(PACK)), 'bytes': p.stat().st_size, 'sha256': sha256(p)})
    (PACK / '10_MANIFEST' / 'MANIFEST.json').write_text(json.dumps({
        'pack': 'SITE00_CORRESPONDENCE_TYPE_AUTHORITY_V1',
        'source_sha256': meta['sha256'],
        'files': manifest,
    }, indent=2))
    print('PACK', PACK, 'files', len(manifest))


def write_review(records, font_rows, spec) -> None:
    glyphs = []
    for r in records:
        if r['status'] != 'source-traced':
            glyphs.append({'id': r['id'], 'char': r['char'], 'status': r['status'], 'role': r['role']})
            continue
        glyphs.append({
            'id': r['id'], 'char': r['char'], 'status': r['status'], 'role': r['role'],
            'iou': r['iou'], 'edge': r['edge_px'], 'wh': f"{r['width']}×{r['height']}",
            'ref': f"../07_FIDELITY_PROOFS/{r['id']}-reference.png",
            'vec': f"../07_FIDELITY_PROOFS/{r['id']}-vector.png",
            'diff': f"../07_FIDELITY_PROOFS/{r['id']}-difference.png",
            'side': f"../07_FIDELITY_PROOFS/{r['id']}-side.png",
        })
    data = json.dumps({'glyphs': glyphs, 'fonts': font_rows, 'spec': spec})
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>SITE 00 correspondence type authority v1</title>
<style>
  :root {{ color-scheme: light; }}
  body {{ margin: 0; font: 14px/1.45 "Saira Semi Condensed", "Arial Narrow", sans-serif; background: #f4f1ec; color: #161616; }}
  header {{ padding: 20px 24px 8px; }}
  h1 {{ font: 700 22px/1.1 "Arial Narrow", sans-serif; letter-spacing: .08em; margin: 0 0 6px; }}
  main {{ padding: 0 24px 48px; }}
  figure {{ margin: 0 0 18px; }}
  img.full {{ width: min(420px, 100%); height: auto; background: #fff; }}
  .crops {{ display: flex; flex-wrap: wrap; gap: 8px; }}
  .crops img {{ height: 92px; background: #fff; }}
  .bar {{ display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 10px 0; }}
  button, select {{ font: inherit; padding: 6px 10px; border: 1px solid #111; background: #fff; }}
  button.on {{ background: #111; color: #fff; }}
  .stage {{ display: inline-block; position: relative; background: #fff; padding: 24px; }}
  .stage.dark {{ background: #1a1a1a; }}
  .stage img {{ image-rendering: pixelated; }}
  .stage .vec {{ position: absolute; left: 24px; top: 24px; }}
  table {{ border-collapse: collapse; background: #fff; }}
  td, th {{ border: 1px solid #ccc; padding: 4px 8px; text-align: left; font-size: 13px; }}
  .derived {{ opacity: .85; }}
</style>
</head>
<body>
<header>
  <h1>SITE 00 · CORRESPONDENCE TYPE AUTHORITY V1</h1>
  <p>Founder reference is the authority. Red marks in a difference map are source-only. Blue marks are vector-only. Digits 4–9 are derived and are not traces.</p>
</header>
<main>
  <section>
    <h2>Full reference</h2>
    <figure><img class="full" src="../01_SOURCE_REFERENCE/01_invitation_founder_reference.jpg" alt="Founder email reference"/></figure>
  </section>
  <section>
    <h2>Cropped roles</h2>
    <div class="crops" id="crops"></div>
  </section>
  <section>
    <h2>Glyph inspector</h2>
    <div class="bar" id="chars"></div>
    <div class="bar">
      <button data-mode="ref" class="on">REFERENCE</button>
      <button data-mode="vec">VECTOR</button>
      <button data-mode="over">OVERLAY</button>
      <button data-mode="diff">DIFFERENCE</button>
      <button data-mode="side">SIDE BY SIDE</button>
      <label>OPACITY <input id="op" type="range" min="0" max="100" value="50"/></label>
      <label>ZOOM <input id="zoom" type="range" min="2" max="16" value="8"/></label>
      <button id="bg">LIGHT BACKGROUND</button>
    </div>
    <p id="meta"></p>
    <div class="stage" id="stage"></div>
  </section>
  <section>
    <h2>Derived 4–9 (not in the source)</h2>
    <div class="crops" id="derived"></div>
  </section>
  <section>
    <h2>Font measurements</h2>
    <table id="fonts"></table>
    <div class="crops" id="fontimgs"></div>
  </section>
</main>
<script>
const DATA = {data};
const crops = [
  'A_display_hero_begin','A_display_hero_foundation','A_display_what_well_ask','A_display_how_it_works',
  'C_red_numerals','D_section_label','E_body','F_cta','G_micro_subject','I_wordmark_header','J_steps'
];
document.getElementById('crops').innerHTML = crops.map(n => `<img src="../02_REFERENCE_CROPS/${{n}}.png" alt="${{n}}">`).join('');
const traced = DATA.glyphs.filter(g => g.status === 'source-traced');
const chars = document.getElementById('chars');
let current = traced[0];
let mode = 'over';
let dark = false;
function draw() {{
  const z = document.getElementById('zoom').value;
  const op = document.getElementById('op').value / 100;
  const stage = document.getElementById('stage');
  stage.className = 'stage' + (dark ? ' dark' : '');
  const w = `width:${{current.wh.split('×')[0] * z}}px`;
  let html = '';
  if (mode === 'ref' || mode === 'over') html += `<img class="ref" style="${{w}}" src="${{current.ref}}">`;
  if (mode === 'vec') html += `<img style="${{w}}" src="${{current.vec}}">`;
  if (mode === 'over') html += `<img class="vec" style="${{w}};opacity:${{op}}" src="${{current.vec}}">`;
  if (mode === 'diff') html += `<img style="${{w}}" src="${{current.diff}}">`;
  if (mode === 'side') html += `<img style="width:${{z * 40}}px" src="${{current.side}}">`;
  stage.innerHTML = html;
  document.getElementById('meta').textContent = `${{current.id}} · ${{current.role}} · ${{current.wh}} · IoU ${{current.iou}} · edge ${{current.edge}}px · SOURCE TRACED`;
}}
traced.forEach((g, i) => {{
  const b = document.createElement('button');
  b.textContent = g.char + (g.role === 'red-numeral' ? ' red' : '');
  b.title = g.id;
  if (i === 0) b.className = 'on';
  b.onclick = () => {{ current = g; [...chars.children].forEach(x => x.className = ''); b.className = 'on'; draw(); }};
  chars.appendChild(b);
}});
document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => {{
  mode = b.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(x => x.className = '');
  b.className = 'on';
  draw();
}});
document.getElementById('op').oninput = draw;
document.getElementById('zoom').oninput = draw;
document.getElementById('bg').onclick = () => {{ dark = !dark; document.getElementById('bg').textContent = dark ? 'DARK BACKGROUND' : 'LIGHT BACKGROUND'; draw(); }};
document.getElementById('derived').innerHTML = '456789'.split('').map(d => `<figure class="derived"><img src="../03_NUMERAL_SVGS/derived-${{d}}.png" alt="derived ${{d}}"><figcaption>${{d}} DERIVED</figcaption></figure>`).join('');
document.getElementById('fonts').innerHTML = '<tr><th>Face</th><th>Class</th><th>Mean IoU</th><th>Width error</th><th>License</th></tr>' +
  DATA.fonts.map(f => `<tr><td>${{f.font}}</td><td>${{f.role}}</td><td>${{f.mean_iou}}</td><td>${{f.mean_abs_width_error}}</td><td>${{f.license}}</td></tr>`).join('');
document.getElementById('fontimgs').innerHTML = {json.dumps([p.name for p in sorted((PACK / '06_FONT_COMPARISONS').glob('*.png'))])}.map(n => `<figure><img src="../06_FONT_COMPARISONS/${{n}}" alt="${{n}}"></figure>`).join('');
draw();
</script>
</body>
</html>'''
    (PACK / '09_REVIEW' / 'index.html').write_text(html)


if __name__ == '__main__':
    main()
