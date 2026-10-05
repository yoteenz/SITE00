"""OPUS3 pixel refinement — AUTHORITY_MATRIX / NO_SCROLL_REPORT / UNRESOLVED_AUTHORITY_GAPS from the shared detector.

usage: python3 build_reports.py <visual_diff.json> <route-authority-map.json> <before_dir> <after_dir> <out_dir>

AUTHORITY      FOUND / PARTIAL / CONFLICTING / MISSING        (from the recovered route authority map)
LIVE STATUS    worst detector class across the 14 viewports, then the reviewed classes below (side-by-side review of
               authority vs live; the detector cannot prove MATCH, so a clean detector row is NEAR_MATCH unless reviewed).
"""
import json
import sys
from collections import Counter, defaultdict

VD, RMAP, BEFORE, AFTER, OUT = sys.argv[1:6]
AUTH = {'EXACT_AUTHORITY_FOUND': 'FOUND', 'PARTIAL_AUTHORITY': 'PARTIAL', 'MULTIPLE_CONFLICTING_AUTHORITIES': 'CONFLICTING', 'NO_AUTHORITY_FOUND': 'MISSING'}
ORDER = ['STRUCTURAL_DRIFT', 'MEDIA_DRIFT', 'CROP_DRIFT', 'INTERACTION_DRIFT', 'SPACING_DRIFT', 'TYPOGRAPHY_DRIFT', 'STALE_COMPONENT', 'NEAR_MATCH', 'MATCH']
VPS = ['m390', 'm393', 'm430', 'm390s', 'm360', 't768', 't820', 't1024p', 't1024l', 'd1440', 'd1680', 'd1920', 'd1440s', 'd1280']

# Reviewed against the recovered authority boards this sprint (authority | live before | live after side by side).
REVIEWED = {
    'expression-*': ('STRUCTURAL_DRIFT', 'NEAR_MATCH',
                     'EXPR2 family hero: heading was EXPRESSION with the family as a sub-line, no subject on the suspended screen, '
                     'status strip above the tabs. Now: family / record title is the heading (crumb EXPRESSION / FAMILY), project lead '
                     'subject monochrome on the central screen (ndxbook only), tagline + side list back on media-focus routes, status '
                     'band after the tabs, phone media-focus hero 86 -> 108px (short phones 64 -> 68px).'),
    'design-*': ('MEDIA_DRIFT', 'NEAR_MATCH',
                 'T12 desktop authority shows the pipeline stage objects at ~70-80px (1440 basis). Live 56/50/36/26px -> '
                 '76 desktop, 58 short desktop, 64 tablet, 52 short tablet, 46 phone, 32 short phone (76px sources, never upscaled).'),
    'expression-character-fabrication*': ('SPACING_DRIFT', 'SPACING_DRIFT',
                                          'CF is authored on the 432x768 authority canvas and zoomed to device width; on 19.5:9 phones ~100px '
                                          'of slack sits under the catalogue. Not recomposed (fixed-px fidelity system + resident wiring); open.'),
    'expression-production-floor': None,  # floor route is ExpressionBody, not the family shell: detector classes stand
    'library-characters-detail': ('NEAR_MATCH', 'NEAR_MATCH',
                                  'Resident media already leads the detail (large portrait + inspector). The authority hero is a landscape '
                                  'world crop; forcing a portrait resident into it would crush the face. Left.'),
}


def reviewed(key):
    best = None
    for pat, v in REVIEWED.items():
        if (pat.endswith('*') and key.startswith(pat[:-1])) or pat == key:
            if best is None or len(pat) > len(best[0]):
                best = (pat, v)
    return best[1] if best else None  # an explicit None entry opts a route out of a wildcard


def classes(v, side):
    m = v.get(side) or {}
    c = set()
    if m.get('frame_overflow', 0) > 1 or m.get('doc_overflow', 0) > 0 or m.get('doc_moved', 0) > 0 or m.get('h_overflow', 0) > 0:
        c.add('STRUCTURAL_DRIFT')
    if m.get('strips'):
        c.add('CROP_DRIFT')
    if m.get('clipped'):
        c.add('CROP_DRIFT')
    if m.get('page_errors') or m.get('unmarked_panes'):
        c.add('INTERACTION_DRIFT')
    if (m.get('dead_band') or 0) >= 48:
        c.add('SPACING_DRIFT')
    if (m.get('min_font') or 99) < 8.5:
        c.add('TYPOGRAPHY_DRIFT')
    return c


def worst(cs):
    for o in ORDER:
        if o in cs:
            return o
    return 'NEAR_MATCH'


vd = json.load(open(VD))
rmap = {r['route']: r for r in json.load(open(RMAP))['routes']}
matrix, noscroll = [], []
tot = Counter()
fam = defaultdict(Counter)
for r in vd['routes']:
    a = r['authority'] or {}
    full = rmap.get(a.get('route')) or {}
    auth = AUTH.get(a.get('classification'), 'MISSING')
    cb, ca = set(), set()
    per = {}
    for vp in VPS:
        v = r['viewports'].get(vp)
        if not v:
            continue
        b, af = classes(v, 'before'), classes(v, 'after')
        cb |= b
        ca |= af
        per[vp] = {'before': sorted(b), 'after': sorted(af)}
        mb, ma = v.get('before') or {}, v.get('after') or {}
        noscroll.append({'key': r['key'], 'path': r['path'], 'family': r['family'], 'vp': vp,
                         'before': {k: mb.get(k) for k in ('frame_overflow', 'doc_overflow', 'doc_moved', 'h_overflow')},
                         'after': {k: ma.get(k) for k in ('frame_overflow', 'doc_overflow', 'doc_moved', 'h_overflow')}})
    lb, la = worst(cb), worst(ca)
    note = None
    rv = reviewed(r['key'])
    if rv:
        lb = rv[0] if ORDER.index(rv[0]) < ORDER.index(lb) else lb
        la_rev = rv[1]
        la = la if ORDER.index(la) < ORDER.index(la_rev) else la_rev
        note = rv[2]
    row = {'key': r['key'], 'path': r['path'], 'family': r['family'], 'kind': full.get('kind'), 'authority': auth,
           'authority_route': a.get('route'), 'governing': full.get('governing'),
           'mobile_authority': a.get('mobile_authority', []), 'tablet_authority': a.get('tablet_authority', []),
           'desktop_authority': a.get('desktop_authority', []),
           'live_before': lb, 'live_after': la, 'reviewed': bool(rv), 'refinement': note,
           'refined': bool(rv) and lb != la, 'detector_by_viewport': per}
    matrix.append(row)
    tot['routes'] += 1
    tot[f'authority_{auth}'] += 1
    tot[f'before_{lb}'] += 1
    tot[f'after_{la}'] += 1
    f = fam[r['family']]
    f['routes'] += 1
    f['with_authority'] += auth in ('FOUND', 'PARTIAL', 'CONFLICTING')
    f['refined'] += row['refined']
    f[f'after_{la}'] += 1

viol = lambda side: sum(1 for n in noscroll if (n[side]['doc_overflow'] or 0) > 0 or (n[side]['doc_moved'] or 0) > 0 or (n[side]['frame_overflow'] or 0) > 1)
hviol = lambda side: sum(1 for n in noscroll if (n[side]['h_overflow'] or 0) > 0)
json.dump({'sprint': 'P0.STUDIOOS.PRODUCTION.FULL-AUTHORITY-PIXEL-PERFECT-REFINEMENT.OPUS3',
           'legend': {'authority': ['FOUND', 'PARTIAL', 'CONFLICTING', 'MISSING'], 'live': ORDER},
           'method': __doc__, 'totals': tot, 'by_family': fam, 'routes': matrix}, open(f'{OUT}/AUTHORITY_MATRIX.json', 'w'), indent=1)
json.dump({'viewports': VPS, 'rows': len(noscroll),
           'page_scroll_violations': {'before': viol('before'), 'after': viol('after')},
           'horizontal_overflow_violations': {'before': hviol('before'), 'after': hviol('after')},
           'violations_after': [n for n in noscroll if (n['after']['doc_overflow'] or 0) > 0 or (n['after']['doc_moved'] or 0) > 0 or (n['after']['frame_overflow'] or 0) > 1 or (n['after']['h_overflow'] or 0) > 0],
           'rows_detail': noscroll}, open(f'{OUT}/NO_SCROLL_REPORT.json', 'w'), indent=1)
print(dict(tot))
print({k: dict(v) for k, v in fam.items()})
print('page scroll', viol('before'), '->', viol('after'), '· h overflow', hviol('before'), '->', hviol('after'))
