#!/usr/bin/env python3
"""Derive the four canonical JURNL utility buttons (CLOSE, MENU, SEARCH, ADD) from the founder-supplied masters.

Sprint: P0.JURNL.F05-MONEY.CANONICAL-UTILITY-ICON-FAMILY-INTEGRATION.OPUS1. Founder-supplied artwork: nothing is redrawn,
regenerated or simplified. The masters are kept byte-for-byte; the runtime copies are derived by four mechanical steps:

  1. alpha dust: pixels with alpha <= 2 (0.8 %) are cleared. They carry saturated red / yellow colour from the source's
     background removal (visible only in viewers that ignore alpha) and could bleed into neighbours when resampled.
     Maximum visible change: 2 / 255.
  2. disc measurement: the cream disc is the pixels with alpha >= 240 and luminance > 120; its bounding box gives the visible
     diameter and centre (the canvas centre is NOT the disc centre: the shadows are offset).
  3. crop: a square of 1.24 x the disc diameter centred on the disc, so every disc sits at the same optical centre and the same
     fraction of its image, and every soft shadow fits inside (transparent padding where the crop leaves the canvas).
  4. resample to 256 x 256 with premultiplied alpha (no dark or coloured halo), then WebP: lossy q95 kept only if its
     composites over parchment and olive are >= 42 dB PSNR against the lossless resample, else lossless.

Usage: python3 -I derive_utility_icons.py <masters dir> <runtime dir> <report json>
"""
import hashlib, io, json, math, os, sys
from PIL import Image
import numpy as np

CROP = 1.24
OUT_PX = 256
PSNR_MIN = 42.0
ASSETS = [
    # (stable id, runtime id, master filename, kind, upload filename, accessible name in its first target)
    ('F05.UTILITY.CLOSE.GOLD', 'UTILITY_CLOSE_GOLD', '01_F05_UTILITY_CLOSE_GOLD.png', 'close', '9d97de54-image.png'),
    ('F05.UTILITY.MENU.GOLD', 'UTILITY_MENU_GOLD', '02_F05_UTILITY_MENU_GOLD.png', 'menu', 'e8e81e14-image.png'),
    ('F05.UTILITY.SEARCH.GOLD', 'UTILITY_SEARCH_GOLD', '03_F05_UTILITY_SEARCH_GOLD.png', 'search', '85eec5a0-image.png'),
    ('F05.UTILITY.ADD.GOLD', 'UTILITY_ADD_GOLD', '04_F05_UTILITY_ADD_GOLD.png', 'add', '8c6e740e-image.png'),
]
BACKGROUNDS = {'parchment': (232, 214, 178), 'olive': (43, 40, 16), 'oxblood': (92, 22, 18)}


def sha(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def psnr(a: np.ndarray, b: np.ndarray) -> float:
    mse = float(np.mean((a.astype(float) - b.astype(float)) ** 2))
    return 99.0 if mse == 0 else 10 * math.log10(255.0 ** 2 / mse)


def over(rgba: Image.Image, bg) -> np.ndarray:
    base = Image.new('RGBA', rgba.size, bg + (255,))
    return np.asarray(Image.alpha_composite(base, rgba).convert('RGB'))


def measure(a: np.ndarray):
    al = a[..., 3]
    lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    disc = (al >= 240) & (lum > 120)
    ys, xs = np.nonzero(disc)
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    d = x1 - x0 + 1
    yy, xx = np.mgrid[0:al.shape[0], 0:al.shape[1]]
    inner = np.hypot(xx - cx, yy - cy) < 0.72 * d / 2
    g = inner & (lum < 90) & (al >= 240)
    gy, gx = np.nonzero(g)
    gb = [int(gx.min()), int(gx.max()), int(gy.min()), int(gy.max())]
    return dict(disc_bbox=[x0, x1, y0, y1], disc_center=[cx, cy], disc_w=d, disc_h=y1 - y0 + 1,
                glyph_bbox=gb, glyph_w=gb[1] - gb[0] + 1, glyph_h=gb[3] - gb[2] + 1,
                glyph_offset=[round((gb[0] + gb[1]) / 2 - cx, 1), round((gb[2] + gb[3]) / 2 - cy, 1)])


def main(masters: str, runtime: str, report: str):
    os.makedirs(runtime, exist_ok=True)
    out = []
    for sid, rid, fname, kind, upload in ASSETS:
        raw = open(os.path.join(masters, fname), 'rb').read()
        im = Image.open(io.BytesIO(raw))
        src_mode = im.mode
        rgba = im.convert('RGBA')
        a = np.asarray(rgba).copy()
        al = a[..., 3]
        stats = dict(alpha_min=int(al.min()), alpha_max=int(al.max()), fully_opaque_px=int((al == 255).sum()),
                     disc_alpha_p50=int(np.percentile(al[al >= 200], 50)), transparent_pct=round(float((al == 0).mean() * 100), 1),
                     partial_pct=round(float(((al > 0) & (al < 255)).mean() * 100), 1))
        R, G, B = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
        dust = (al > 0) & (al <= 2)
        coloured = dust & (((R > 200) & (G < 80)) | ((R > 200) & (G > 200) & (B < 80)))
        stats.update(dust_px_cleared=int(dust.sum()), coloured_fringe_px=int(coloured.sum()))
        a[dust] = 0
        m = measure(a)
        d = m['disc_w']
        side = int(round(CROP * d))
        cx, cy = m['disc_center']
        left, top = int(round(cx - side / 2)), int(round(cy - side / 2))
        canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        clean = Image.fromarray(a, 'RGBA')
        canvas.paste(clean.crop((max(0, left), max(0, top), min(clean.width, left + side), min(clean.height, top + side))), (max(0, -left), max(0, -top)))
        # anything of the source outside the crop (it must be nothing visible)
        lost = a.copy()
        lost[max(0, top):top + side, max(0, left):left + side] = 0
        lost_alpha_max = int(lost[..., 3].max())
        res = canvas.convert('RGBa').resize((OUT_PX, OUT_PX), Image.LANCZOS).convert('RGBA')
        # encode
        lossless = io.BytesIO(); res.save(lossless, 'WEBP', lossless=True, exact=True, method=6)
        lossy = io.BytesIO(); res.save(lossy, 'WEBP', quality=95, alpha_quality=100, method=6)
        dec = Image.open(io.BytesIO(lossy.getvalue())).convert('RGBA')
        scores = {k: round(psnr(over(res, v), over(dec, v)), 2) for k, v in BACKGROUNDS.items()}
        use_lossy = min(scores.values()) >= PSNR_MIN and len(lossy.getvalue()) < len(lossless.getvalue())
        data = lossy.getvalue() if use_lossy else lossless.getvalue()
        fn = f'{rid}.webp'
        open(os.path.join(runtime, fn), 'wb').write(data)
        rm = measure(np.asarray(Image.open(io.BytesIO(data)).convert('RGBA')))
        out.append(dict(
            id=sid, runtime_id=rid, kind=kind, provenance='FOUNDER-SUPPLIED ARTWORK', approval='FOUNDER-SUPPLIED, PLACEMENT PENDING FOUNDER REVIEW',
            source_upload=upload, master_file=fname, source_sha256=sha(raw), source_bytes=len(raw), source_px=[im.width, im.height], source_mode=src_mode,
            transparency=dict(stats, verdict='TRUE ALPHA (no checkerboard, no opaque background); disc alpha 251-254 (about 1 % translucent, kept); edge dust alpha <= 2 cleared'),
            source_geometry=dict(m, disc_to_canvas=round(d / im.width, 3), glyph_w_to_disc=round(m['glyph_w'] / d, 3), glyph_h_to_disc=round(m['glyph_h'] / d, 3)),
            crop=dict(side=side, left=left, top=top, factor=CROP, source_alpha_outside_crop_max=lost_alpha_max),
            runtime=dict(file=fn, px=[OUT_PX, OUT_PX], sha256=sha(data), bytes=len(data), encoding='lossy q95' if use_lossy else 'lossless', psnr_db=scores,
                         disc_w=rm['disc_w'], disc_center=rm['disc_center'], disc_to_image=round(rm['disc_w'] / OUT_PX, 3)),
        ))
        print(sid, fname, 'disc', d, 'crop', side, 'runtime', fn, 'disc', rm['disc_w'], '/', OUT_PX, out[-1]['runtime']['encoding'], len(data), 'B', scores, 'dust', stats['dust_px_cleared'], 'lost', lost_alpha_max)
    json.dump(dict(sprint='P0.JURNL.F05-MONEY.CANONICAL-UTILITY-ICON-FAMILY-INTEGRATION.OPUS1', crop_factor=CROP, runtime_px=OUT_PX, psnr_min=PSNR_MIN, assets=out), open(report, 'w'), indent=1)
    # typed registry
    lines = [
        '/* GENERATED by scripts/jurnl/utility-icons/derive_utility_icons.py — do not edit by hand.',
        ' * The four canonical JURNL utility buttons (founder-supplied artwork, P0.JURNL.F05-MONEY.CANONICAL-UTILITY-ICON-FAMILY-',
        ' * INTEGRATION.OPUS1). Each runtime file is the master cropped to 1.24 x its visible disc, centred on the disc, so every',
        ' * button shares one optical centre and one disc fraction (`UTILITY_DISC_FRACTION`). Masters (byte-for-byte):',
        ' * JURNL/F05_MONEY/UTILITY_ICONS/ORIGINAL_PNG_MASTERS. */',
    ]
    for r in out:
        lines.append(f"import {r['runtime_id'].lower()} from './{r['runtime']['file']}';")
    lines += [
        '',
        "export type UtilityArtKind = 'close' | 'menu' | 'search' | 'add';",
        'export type UtilityArt = { id: string; kind: UtilityArtKind; src: string; px: number; sha256: string; bytes: number; encoding: string; sourceSha256: string; sourcePx: [number, number]; sourceDisc: number; provenance: string };',
        f'/** The visible disc is this fraction of each runtime image (disc diameter / image side). */',
        f"export const UTILITY_DISC_FRACTION = {round(1 / CROP, 4)};",
        'export const UTILITY_ART: Record<UtilityArtKind, UtilityArt> = {',
    ]
    for r in out:
        rt = r['runtime']
        lines.append(f"  {r['kind']}: {{ id: '{r['id']}', kind: '{r['kind']}', src: {r['runtime_id'].lower()}, px: {OUT_PX}, sha256: '{rt['sha256']}', bytes: {rt['bytes']}, encoding: '{rt['encoding']}', sourceSha256: '{r['source_sha256']}', sourcePx: [{r['source_px'][0]}, {r['source_px'][1]}], sourceDisc: {r['source_geometry']['disc_w']}, provenance: 'FOUNDER-SUPPLIED ARTWORK' }},")
    lines += ['};', '']
    open(os.path.join(runtime, 'registry.ts'), 'w').write('\n'.join(lines))


if __name__ == '__main__':
    main(*sys.argv[1:4])
