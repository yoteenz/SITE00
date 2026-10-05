"""AUTHORITY / BEFORE / AFTER contact sheets per family and viewport class.

usage: python3 before_after_sheets.py <inventory_with_disk.json> <route-authority-map.json> <before_dir> <after_dir> <out_dir>
One sheet per family × {mobile m390, tablet t1024l, desktop d1440}: a row per representative route, three columns —
the recovered authority view for that viewport class (split from desktop+tablet / three-view boards when needed),
the live capture at the tunnel SHA, and the live capture on the working branch.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13)
SMALL = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
CLASSES = {'mobile': ('m390', 380), 'tablet': ('t1024l', 250), 'desktop': ('d1440', 250)}
PICK = {
    'HUB': ['hub-root'],
    'INBOX': ['inbox-needs-you', 'inbox-all-inbox', 'inbox-decision-detail', 'inbox-system'],
    'DESIGN': ['design-brand', 'design-compiler', 'design-assets', 'design-viewport'],
    'EXPERIENCE': ['experience-tab-root', 'experience-world-root', 'experience-world-detail', 'experience-zones-root', 'experience-zones-detail'],
    'EXPRESSION': ['expression-production-floor', 'expression-casting-root', 'expression-casting-character-profile', 'expression-look-root',
                   'expression-storyboard-root', 'expression-performance-takes'],
    'LIBRARY': ['library-tab-root', 'library-authorities-index', 'library-authorities-detail', 'library-characters-detail', 'library-assets-detail'],
    'ACTIVITY': ['activity-root-domain-x-time', 'activity-inspector-drawer', 'activity-domain-people'],
}


def gutter(im):
    a = np.asarray(im.convert('L')).astype(float)
    h, w = a.shape
    std = a[int(h * 0.08):int(h * 0.92), :].std(axis=0)
    lo, hi = int(w * 0.42), int(w * 0.78)
    best, cur = (0, 0), None
    for x in range(lo, hi):
        if std[x] < 4:
            cur = x if cur is None else cur
        else:
            if cur is not None and x - cur > best[1] - best[0]:
                best = (cur, x)
            cur = None
    if cur is not None and hi - cur > best[1] - best[0]:
        best = (cur, hi)
    if best[1] - best[0] < 3:
        x = lo + int(np.argmin(std[lo:hi]))
        best = (x, x + 1)
    return best


def three(im):
    a = np.asarray(im.convert('L')).astype(float)
    h, w = a.shape
    std = a[int(h * 0.1):int(h * 0.9), :].std(axis=0)
    cuts = []
    for lo, hi in ((0.45, 0.62), (0.75, 0.88)):
        L, H = int(w * lo), int(w * hi)
        cuts.append(L + int(np.argmin(std[L:H])))
    return cuts


def authority_view(e, vc):
    im = Image.open(e['_disk']).convert('RGB')
    if e['viewport'] == 'desktop+tablet':
        g0, g1 = gutter(im)
        return im.crop((0, 0, g0, im.height)) if vc == 'desktop' else im.crop((g1, 0, im.width, im.height))
    if e['viewport'] == 'desktop+tablet+mobile':
        c1, c2 = three(im)
        return {'desktop': im.crop((0, 0, c1, im.height)), 'tablet': im.crop((c1, 0, c2, im.height)), 'mobile': im.crop((c2, 0, im.width, im.height))}[vc]
    return im


def fit(im, h):
    return im.resize((max(1, int(im.width * h / im.height)), h))


def main():
    inv_path, map_path, before_dir, after_dir, out_dir = sys.argv[1:6]
    os.makedirs(out_dir, exist_ok=True)
    by = {e['authority_id']: e for e in json.load(open(inv_path))['inventory']}
    amap = json.load(open(map_path))['routes']
    key_of = {}
    for r in amap:
        key = '-'.join(filter(None, ''.join(c if c.isalnum() else '-' for c in f"{r['family']}-{r['state']}".lower()).split('-')))
        key_of.setdefault(key, r)
    rows_b = {(json.loads(l)['key'], json.loads(l)['vp']): json.loads(l) for l in open(f'{before_dir}/rows.jsonl')}
    rows_a = {(json.loads(l)['key'], json.loads(l)['vp']): json.loads(l) for l in open(f'{after_dir}/rows.jsonl')}
    written = []
    for fam, keys in PICK.items():
        for vc, (vp, h) in CLASSES.items():
            lines = []
            for k in keys:
                r = key_of.get(k)
                auth, aid = None, None
                if r:
                    ids = sorted(r[f'{vc}_authority'], key=lambda i: 0 if any(t in i for t in ('EXPR2', ':EL:', 'IBX2', 'HUBREF', 'CF:', 'DWS')) else 1)
                    for i in ids:
                        if i in by and by[i].get('_disk') and os.path.exists(by[i]['_disk']):
                            auth, aid = authority_view(by[i], vc), i
                            break
                b, a = rows_b.get((k, vp)), rows_a.get((k, vp))
                bi = Image.open(f"{before_dir}/{b['file']}").convert('RGB') if b and b.get('file') else None
                ai = Image.open(f"{after_dir}/{a['file']}").convert('RGB') if a and a.get('file') else None
                if not (bi or ai):
                    continue
                lines.append((k, aid, auth, bi, ai))
            if not lines:
                continue
            cells = [[fit(x, h) if x is not None else None for x in (l[2], l[3], l[4])] for l in lines]
            colw = [max((c[i].width if c[i] else 160) for c in cells) for i in range(3)]
            W = sum(colw) + 4 * 10
            H = len(lines) * (h + 58) + 34
            sheet = Image.new('RGB', (W, H), (244, 244, 246))
            d = ImageDraw.Draw(sheet)
            d.text((10, 8), f'{fam} · {vc.upper()} ({vp}) — AUTHORITY / BEFORE (tunnel) / AFTER (working branch)', font=FONT, fill=(20, 20, 24))
            y = 34
            for (k, aid, *_), row in zip(lines, cells):
                x = 10
                for i, (title, sub, im) in enumerate(zip(('AUTHORITY', 'BEFORE', 'AFTER'), ((aid or 'NONE RECOVERED').replace('UP:', ''), k, k), row)):
                    fits = max(8, int(colw[i] / 6.4))
                    d.text((x, y), title, font=SMALL, fill=(200, 20, 20) if i == 0 else (40, 40, 44))
                    d.text((x, y + 13), sub if len(sub) <= fits else '…' + sub[-(fits - 1):], font=SMALL, fill=(110, 110, 118))
                    if im is not None:
                        sheet.paste(im, (x, y + 30))
                    else:
                        d.rectangle([x, y + 30, x + colw[i], y + 30 + h], outline=(190, 190, 196))
                        d.text((x + 8, y + 40), 'NO AUTHORITY RECOVERED', font=SMALL, fill=(150, 150, 156))
                    x += colw[i] + 10
                y += h + 58
            path = f'{out_dir}/{fam.lower()}__{vc}.jpg'
            sheet.save(path, quality=66, optimize=True)
            written.append(path)
    print(len(written), 'sheets')


if __name__ == '__main__':
    main()
