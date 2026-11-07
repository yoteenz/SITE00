#!/usr/bin/env python3
"""
F05 DOT 01 — evidence sheets for the authority-scene sprint.

  all 37   <id>_AUTHORITY_BEFORE_AFTER.webp     authority (fitted to the capture's height) · BEFORE · AFTER at 471 × 836
  03–05    <id>_ENLARGED.webp                   authority / BEFORE / AFTER in authority px (941 × 1672), side by side
           <id>_OVERLAY.webp, <id>_DIFF.webp    from compare_dot01_account_scenes.py (edges: red authority, cyan runtime,
                                                white coincident; diff: |runtime − authority|, live-text boxes dimmed)
           <id>_LAYERS.webp                     L0 SK02 field → + scene band (+ seal) → + strip papers → + live text / chips
           <id>_SOURCE_MAP.webp                 every region of the AFTER board coloured by where its pixels come from

Run: python -I build_dot01_scene_evidence.py --auth <dir> --before <probe dir> --after <probe dir> --cmp-before <dir>
       --cmp-after <dir> --repo <SITE00 root> --out <dir>
"""
import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 941, 1672
NAMES = {}


def font(sz):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        if Path(p).exists():
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def labelled(ims, labels, h, pad=10, head=34, bg=(26, 24, 20)):
    fitted = [im.convert('RGB').resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS) for im in ims]
    wt = sum(i.width for i in fitted) + pad * (len(fitted) + 1)
    out = Image.new('RGB', (wt, h + head + pad), bg)
    d = ImageDraw.Draw(out)
    x = pad
    for im, lb in zip(fitted, labels):
        out.paste(im, (x, head))
        d.text((x + 4, 8), lb, fill=(240, 226, 196), font=font(18))
        x += im.width + pad
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--auth', required=True)
    ap.add_argument('--before', required=True)
    ap.add_argument('--after', required=True)
    ap.add_argument('--cmp-before', required=True)
    ap.add_argument('--cmp-after', required=True)
    ap.add_argument('--repo', required=True)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    out = Path(a.out)
    (out / 'before_after').mkdir(parents=True, exist_ok=True)
    (out / 'priority').mkdir(parents=True, exist_ok=True)
    auth = {p.name[:2]: p for p in Path(a.auth).glob('[0-3][0-9]_*.png')}
    for sid, p in sorted(auth.items()):
        b = Path(a.before) / f'{sid}-471x836.png'
        f = Path(a.after) / f'{sid}-471x836.png'
        ims = [Image.open(p)] + [Image.open(x) for x in (b, f) if x.exists()]
        labs = [f'{sid} AUTHORITY {p.stem[3:]}'[:46], 'BEFORE f7e2739c', 'AFTER (this sprint)'][: len(ims)]
        labelled(ims, labs, 836).save(out / 'before_after' / f'{sid}_AUTHORITY_BEFORE_AFTER.webp', 'WEBP', quality=80, method=6)
    repo = Path(a.repo)
    dot = repo / 'src/projects/jurnl/families/F05_MONEY/DOT01'
    scenes = json.loads((dot / 'SCENES/F05_DOT01_SCENES.json').read_text())['scenes']
    geo = json.loads((dot / 'F05_DOT01_GEOMETRY.json').read_text())['SK02']
    field = Image.open(dot / 'F05_DOT01_SK02_FIELD.webp').convert('RGBA')
    strips = [Image.open(dot / f'F05_DOT01_SK02_STRIP_{i}.webp').convert('RGBA') for i in (1, 2, 3)]
    sbox = [geo[f'strip_{i}']['box'] for i in (1, 2, 3)]
    for sid in ('03', '04', '05'):
        sc = scenes[sid]
        ab = Image.open(auth[sid]).convert('RGB')
        bb = Image.open(Path(a.cmp_before) / f'{sid}_before_board.png')
        fb = Image.open(Path(a.cmp_after) / f'{sid}_after_board.png')
        labelled([ab, bb, fb], [f'{sid} AUTHORITY', 'BEFORE (generic SK02 template)', 'AFTER (authority scene)'], 1672).resize((1462, 857), Image.LANCZOS).save(out / 'priority' / f'{sid}_ENLARGED.webp', 'WEBP', quality=82, method=6)
        for kind in ('overlay', 'diff'):
            labelled([Image.open(Path(a.cmp_before) / f'{sid}_before_{kind}.png'), Image.open(Path(a.cmp_after) / f'{sid}_after_{kind}.png')],
                     [f'{sid} BEFORE {kind.upper()}', f'{sid} AFTER {kind.upper()}'], 1672).resize((970, 857), Image.LANCZOS).save(out / 'priority' / f'{sid}_{kind.upper()}.webp', 'WEBP', quality=82, method=6)
        # layers, at authority px
        x0, y0, x1, y1 = sc['band']
        scene = Image.open(dot / 'SCENES' / sc['runtime']).convert('RGBA')
        l0 = field.copy()
        l1 = l0.copy()
        l1.alpha_composite(scene, (x0, y0))
        if 'seal' in sc:
            bx, by_, bw, bh = sc['seal']['box']
            l1.alpha_composite(Image.open(dot / 'SCENES' / sc['seal']['runtime']).convert('RGBA'), (bx, by_))
        l2 = l1.copy()
        for i, (x, y, w, h) in enumerate(sc['strips']):
            s = sbox[i % 3]
            ph = round((s[3] - s[1]) / (s[2] - s[0]) * w)
            l2.alpha_composite(strips[i % 3].resize((w, ph), Image.LANCZOS), (x, round(y + h / 2 - ph / 2)))
        labelled([l0, l1, l2, fb], ['L0 SK02 FIELD (V9)', 'L1 + SCENE BAND' + (' + SEAL' if 'seal' in sc else ''), 'L1 + SK02 STRIP PAPERS', 'L2/L3 + LIVE TEXT, ICONS, CHIPS'], 1672).resize((1930, 857), Image.LANCZOS).save(out / 'priority' / f'{sid}_LAYERS.webp', 'WEBP', quality=82, method=6)
        # source map
        m = fb.convert('RGBA')
        ov = Image.new('RGBA', m.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(ov)
        d.rectangle([0, 0, W, y0], fill=(80, 140, 255, 70), outline=(80, 140, 255, 255), width=4)
        d.rectangle([x0, y0, x1, y1], fill=(255, 170, 40, 60), outline=(255, 170, 40, 255), width=4)
        if 'seal' in sc:
            bx, by_, bw, bh = sc['seal']['box']
            d.rectangle([bx, by_, bx + bw, by_ + bh], outline=(255, 60, 200, 255), width=5)
        for x, y, w, h in sc['strips']:
            d.rectangle([x, y, x + w, y + h], fill=(80, 220, 120, 50), outline=(80, 220, 120, 255), width=3)
        for k, s in sc['slots'].items():
            d.rectangle([s['x'], s['y'], s['x'] + s['w'], s['y'] + s['size'] * (s.get('lines') or 1) * 1.05], outline=(255, 255, 255, 255), width=3)
        st = sc['stats']
        for r in st['rows']:
            d.rectangle([st['x'], r, st['x'] + st['w'], r + st['size'] * 1.4], outline=(255, 255, 255, 255), width=2)
        m.alpha_composite(ov)
        legend = Image.new('RGB', (W, 300), (26, 24, 20))
        dl = ImageDraw.Draw(legend)
        rows = [((80, 140, 255), 'SK02 FIELD + heading (V9) · live title, JURNL, chips'),
                ((255, 170, 40), f'SCENE BAND {sid}: authority pixels, text px rebuilt'),
                *([((255, 60, 200), 'SEAL 03: authority pixels (car emblem)')] if 'seal' in sc else []),
                ((80, 220, 120), 'ACTION ROWS: SK02 strip papers + live labels, icons'),
                ((255, 255, 255), 'LIVE TEXT: canonical figures (never in the art)')]
        for i, (c, t) in enumerate(rows):
            dl.rectangle([20, 24 + i * 54, 60, 58 + i * 54], fill=c)
            dl.text((76, 28 + i * 54), t, fill=(240, 226, 196), font=font(28))
        sm = Image.new('RGB', (W, H + 300))
        sm.paste(m.convert('RGB'), (0, 0))
        sm.paste(legend, (0, H))
        sm.resize((W // 2, (H + 300) // 2), Image.LANCZOS).save(out / 'priority' / f'{sid}_SOURCE_MAP.webp', 'WEBP', quality=82, method=6)
        print(sid, 'priority evidence written')


if __name__ == '__main__':
    main()
