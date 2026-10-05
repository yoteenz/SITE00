"""Visual diff report — BEFORE (tunnel SHA) vs AFTER (working branch), same detector, same 14 viewports.

usage: python3 visual_diff.py <before_dir> <after_dir> <interactions.json> <route-authority-map.json> <routes.json> <out.json>
<before_dir>/<after_dir> hold rows.jsonl + screenshots written by the live capture (qa/cap.mjs).

Categories per route × viewport (each with before / after values and a status):
  geometry     frame / document vertical overflow, document scroll, horizontal overflow nodes
  media_scale  largest primary-media box and its share of the body (banners excluded)
  spacing      longest full-width empty band in the body (from the screenshot)
  crop         primary media crushed into strips (w/h >= 3.2 and h < 20% of body, or h < 64 and w >= 180);
               clipped (overflow-hidden) content outside declared panes
  type         smallest visible text size vs the 8.5px floor
  interaction  page errors + undeclared scroll panes (and the interaction-authority checks, per family)
Hero / world-panel bands are authority banners (U-18): listed as BANNER, never counted as media strips.
"""
import json
import sys
from collections import Counter, defaultdict

import numpy as np
from PIL import Image

BANNER = ('expression-family-hero', 'expression-hero', 'authority-hero', 'experience-hero', 'library-hero')
FLOOR = 8.5
DEAD_BAND = 48
VPS = ['m390', 'm393', 'm430', 'm390s', 'm360', 't768', 't820', 't1024p', 't1024l', 'd1440', 'd1680', 'd1920', 'd1440s', 'd1280']


def load(d):
    rows = {}
    for line in open(f'{d}/rows.jsonl'):
        r = json.loads(line)
        rows[(r['key'], r['vp'])] = r
    return rows


def dead_band(path, top=72, bottom=64):
    try:
        a = np.asarray(Image.open(path).convert('L')).astype(np.float32)
    except Exception:
        return None
    body = a[top:a.shape[0] - bottom]
    flat = (body.std(axis=1) < 2.5) & (body.mean(axis=1) > 200)
    best = cur = 0
    for f in flat:
        cur = cur + 1 if f else 0
        best = max(best, cur)
    return int(best)


def split_strips(r):
    s = r.get('strips') or []
    return [x for x in s if not any(b in x for b in BANNER)], [x for x in s if any(b in x for b in BANNER)]


def primary(r):
    for m in r.get('media') or []:
        if not any(b in (m.get('tid') or '') for b in BANNER):
            return m
    return None


def metrics(r, shots):
    if r is None:
        return None
    if r.get('error'):
        return {'error': r['error'][:160]}
    strips, banners = split_strips(r)
    p = primary(r)
    return {
        'frame_overflow': r.get('frameOverflow'),
        'doc_overflow': r.get('docOverflow'),
        'doc_moved': r.get('docMoved'),
        'h_overflow': len(r.get('hOver') or []),
        'body_h': r.get('bodyH'),
        'primary': f"{p['w']}x{p['h']}@{p.get('tid') or p.get('cls')}" if p else None,
        'primary_area': (p['w'] * p['h']) if p else 0,
        'largest_share': r.get('largestMedia'),
        'media_count': r.get('mediaCount'),
        'strips': strips,
        'banners': banners,
        'clipped': r.get('clipped') or [],
        'min_font': r.get('minFont'),
        'page_errors': len(r.get('errs') or []),
        'unmarked_panes': [x for x in (r.get('scrollPanes') or []) if '!unmarked' in x],
        'dead_band': dead_band(f"{shots}/{r['file']}") if r.get('file') else None,
    }


def bad(cat, m):
    if m is None or 'error' in m:
        return True
    if cat == 'geometry':
        return (m['frame_overflow'] or 0) > 1 or (m['doc_overflow'] or 0) > 1 or bool(m['doc_moved']) or m['h_overflow'] > 0
    if cat == 'spacing':
        return (m['dead_band'] or 0) > DEAD_BAND
    if cat == 'crop':
        return bool(m['strips']) or bool(m['clipped'])
    if cat == 'type':
        return (m['min_font'] or 99) < FLOOR
    if cat == 'interaction':
        return m['page_errors'] > 0 or bool(m['unmarked_panes'])
    return False


def status(cat, b, a):
    if cat == 'media_scale':
        if not b or not a or 'error' in b or 'error' in a:
            return 'N/A'
        if a['primary_area'] > b['primary_area'] * 1.1:
            return 'INCREASED'
        if a['primary_area'] < b['primary_area'] * 0.9:
            return 'REDUCED'
        return 'UNCHANGED'
    vb, va = bad(cat, b), bad(cat, a)
    if vb and not va:
        return 'RESOLVED'
    if not vb and va:
        return 'REGRESSED'
    if vb and va:
        return 'OPEN'
    return 'OK'


def main():
    before_dir, after_dir, inter_path, map_path, routes_path, out = sys.argv[1:7]
    B, A = load(before_dir), load(after_dir)
    routes = json.load(open(routes_path))
    amap = json.load(open(map_path))['routes']
    key_of = {}
    for r in amap:
        key = '-'.join(filter(None, ''.join(c if c.isalnum() else '-' for c in f"{r['family']}-{r['state']}".lower()).split('-')))
        key_of.setdefault(key, r)
    inter = json.load(open(inter_path))
    cats = ['geometry', 'media_scale', 'spacing', 'crop', 'type', 'interaction']
    out_routes = []
    fam = defaultdict(lambda: defaultdict(Counter))
    totals = {'before': Counter(), 'after': Counter()}
    for rt in routes:
        a_route = key_of.get(rt['key'])
        entry = {
            'key': rt['key'], 'path': rt['path'], 'family': rt['family'],
            'authority': {k: a_route[k] for k in ('route', 'classification', 'mobile_authority', 'tablet_authority', 'desktop_authority')} if a_route else None,
            'viewports': {},
        }
        for vp in VPS:
            b = metrics(B.get((rt['key'], vp)), before_dir)
            a = metrics(A.get((rt['key'], vp)), after_dir)
            st = {c: status(c, b, a) for c in cats}
            drift = [c for c in cats if c != 'media_scale' and bad(c, a)]
            entry['viewports'][vp] = {'before': b, 'after': a, 'status': st, 'drift_after': drift}
            for c in cats:
                fam[rt['family']][c][st[c]] += 1
            for side, m in (('before', b), ('after', a)):
                totals[side]['rows'] += 1
                for c in cats:
                    if c != 'media_scale' and bad(c, m):
                        totals[side][c] += 1
                if m and 'error' not in m:
                    if m['strips']:
                        totals[side]['media_strip_rows'] += 1
                    if (m['frame_overflow'] or 0) > 1 or (m['doc_overflow'] or 0) > 1 or m['doc_moved']:
                        totals[side]['page_scroll_rows'] += 1
                    if m['h_overflow']:
                        totals[side]['h_overflow_rows'] += 1
                    if (m['min_font'] or 99) < FLOOR:
                        totals[side]['type_floor_rows'] += 1
                    if m['banners']:
                        totals[side]['banner_rows'] += 1
        out_routes.append(entry)
    inter_summary = Counter()
    for r in inter:
        ok = not r.get('error') and r.get('opened') and r.get('closed') is not False and (not r.get('fit') or r['fit']['inView']) and (not r.get('image') or r['image']['ok']) and not r.get('errs')
        inter_summary['passed' if ok else 'failed'] += 1
    report = {
        'sprint': 'P0.STUDIOOS.PRODUCTION.FULL-AUTHORITY-FORENSIC-AUDIT.PIXEL-PERFECT-REFINEMENT.OPUS2',
        'method': {
            'before': 'tunnel SHA served on its own dev server', 'after': 'working branch', 'viewports': VPS,
            'detector': __doc__.strip(), 'type_floor_px': FLOOR, 'dead_band_px': DEAD_BAND,
        },
        'totals': {k: dict(v) for k, v in totals.items()},
        'by_family': {f: {c: dict(v) for c, v in d.items()} for f, d in sorted(fam.items())},
        'interaction_authorities': {'summary': dict(inter_summary), 'checks': inter},
        'routes': out_routes,
    }
    json.dump(report, open(out, 'w'), separators=(',', ':'))
    print(json.dumps(report['totals'], indent=1))
    print(json.dumps({f: {c: d[c] for c in ('geometry', 'crop', 'type', 'spacing')} for f, d in report['by_family'].items()}, indent=0)[:3000])


if __name__ == '__main__':
    main()
