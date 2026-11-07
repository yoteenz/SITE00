"""OPUS3A / OPUS3B evidence builder — reads the 37-state probe rows (before / after, CONTROLS=1 TEXT=1 ICONS=1) and the
captures, and writes: per-screen AUTHORITY · BEFORE · AFTER comparison sheets, the control matrix, the typography / title
matrix, the parchment / text-containment matrix and a summary JSON. Every number in the reports comes from these files.

Run: python -I build_dot01_artwork_type_evidence.py <before dir> <after dir> <authority png dir> <out dir>
"""
import glob, json, os, sys
from collections import Counter, defaultdict
from PIL import Image, ImageDraw

BEFORE, AFTER, AUTH, OUT = sys.argv[1:5]
os.makedirs(os.path.join(OUT, 'compare'), exist_ok=True)
os.makedirs(os.path.join(OUT, 'compare_compact'), exist_ok=True)


def rows(d):
    f = glob.glob(os.path.join(d, 'metrics-*.jsonl'))[0]
    out = {}
    for line in open(f):
        r = json.loads(line)
        out[(r['id'], r['viewport'])] = r
    return out


B, A = rows(BEFORE), rows(AFTER)
IDS = sorted({k[0] for k in A})
NAMES = {k[0]: r['name'] for k, r in A.items()}
OVERLAY = {i for i in IDS if 14 <= int(i) <= 37 and i not in ('22', '31', '32', '35')}  # 22 / 31 / 32 / 35 are pages

# ---- control classification (what the visible surface actually is) ----
def classify(c):
    s, cls, t = c['surface'], c['cls'] or '', c['trigger'] or ''
    if s.startswith('PAPER:F05_DOT01_PILL_SK03'):
        return 'ILLUSTRATED', 'EXACT_APPROVED_SOURCE', 'A', 'SK03 SIDEKICK action pill (' + s.split('_')[-1].split('.')[0] + ')'
    if s.startswith('PAPER:F05_DOT01_19') or s.startswith('PAPER:F05_DOT01_09') or s.startswith('PAPER:F05_DOT01_17') or s.startswith('PAPER:F05_DOT01_20'):
        return 'ILLUSTRATED', 'EXACT_APPROVED_SOURCE', 'A', 'V9 motion asset ' + s.split(':')[1].replace('.webp', '')
    if 'ACTION06' in s or 'CARD06' in s:
        return 'ILLUSTRATED', 'EXACT_APPROVED_SOURCE', 'B', 'authority 06 lift ' + s.split(':')[1].replace('.webp', '')
    if 'F05_MOTION_CARD' in s or 'F05_MOTION_PAPER' in s:
        return 'ILLUSTRATED', 'EXACT_APPROVED_SOURCE', 'A', 'V9 motion art ' + s.split(':')[1].replace('.webp', '')
    if s.startswith('IMG:F05.D01.CTRL.BACK.PARCHMENT.LIGHT'):
        return 'ILLUSTRATED', 'PARTIAL_SOURCE_CANDIDATE', 'A', 'B05_01 back tile (founder review pending)'
    if s.startswith('IMG:F05.D01.'):
        return 'ILLUSTRATED', 'PARTIAL_SOURCE_CANDIDATE', 'A', 'micro-asset ' + s[4:]
    if s == 'NONE':
        if cls.startswith('jrn-btn'):
            return 'DOCK', 'EXACT_APPROVED_SOURCE', 'A', 'canonical dock (nav paper)'
        return 'ON_PAPER', 'EXACT_APPROVED_SOURCE', 'A', 'hit area on an exact paper / scene (' + (cls.split(' ')[0] or t) + ')'
    # CSS surfaces
    if 'd01-btn' in cls:
        return 'GENERIC', 'CSS_RECONSTRUCTION', 'C', 'destructive terracotta stadium (GAP-TERRACOTTA-PILL)'
    if cls.startswith('jrn-sel') or c['trigger'] in ('d01-merchant', 'd01-amount', 'd01-notes') or any(k in t for k in ('-amount', '-notes', '-name', '-balance', '-last4', '-reason', 'search')):
        return 'FIELD', 'CSS_RECONSTRUCTION', 'C', 'light cream field with ink rim (authority: deckled cream field)'
    if cls.startswith('d01-chipbtn'):
        return 'CHIP', 'CSS_RECONSTRUCTION', 'C', 'smooth cream / olive pill (authority 21 / 31 draw smooth pills)'
    if cls.startswith('jrn-d01__chip'):
        return 'CHIP', 'CSS_RECONSTRUCTION', 'C', 'amber translucent back tile (authority 06–10)'
    if cls.startswith('jv3-'):
        return 'V3', 'CSS_RECONSTRUCTION', 'C', 'V3 editorial pill (OPUS2 overlay system)'
    if t.startswith('d01-up-') or t.startswith('d01-down-'):
        return 'GENERIC', 'CSS_RECONSTRUCTION', 'C', 'reorder step button (authority 32: small engraved arrows)'
    return 'GENERIC', 'CSS_RECONSTRUCTION', 'C', 'css ' + (cls.split(' ')[0] or t)


def ctrl_stats(r):
    s = Counter(); src = Counter()
    for c in r.get('controls') or []:
        kind, prov, meth, _ = classify(c)
        s[kind] += 1; src[prov] += 1
    return s, src


def text_stats(r):
    t = r.get('text') or {}
    ti = t.get('title') or {}
    return {
        'title_inside': ti.get('inside'), 'title_font': round(ti.get('font') or 0, 1) if ti else None,
        'lines': ti.get('lines'), 'leaks': t.get('leaks') or [], 'collide': t.get('collide') or [],
    }


# ---- each title line against the VISIBLE paper (not only its heading box) ----
# SK03 heading paper: right edge by board y, measured on F05_DOT01_SK03_FIELD.webp (its torn lower-right corner rises from
# y 470); the wide banner: the alpha edge of F05_DOT01_12_WIDE_TORN_BANNER mirrored at x 0, y 298, 724 x 199.
ENV_EDGE = [(318, 600), (330, 636), (340, 640), (420, 640), (440, 628), (460, 617), (480, 607), (500, 590), (520, 550), (540, 480), (555, 300)]
WIDE_STATES_AFTER = {'16', '20', '29', '30'}
_ban = Image.open(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'src/projects/jurnl/families/F05_MONEY/DOT01/F05_DOT01_12_WIDE_TORN_BANNER.webp')).convert('RGBA').resize((724, 199))
_ba = _ban.split()[3].load()
def wide_edge(y):
    yy = int(round(y - 298))
    if yy < 0 or yy >= 199: return 0
    # mirrored: the torn end is the image's left end, drawn at the right
    for x in range(724):
        if _ba[x, yy] > 128: return 724 - x
    return 0
def env_edge(y):
    pts = ENV_EDGE
    if y <= pts[0][0]: return pts[0][1]
    for (y0, x0), (y1, x1) in zip(pts, pts[1:]):
        if y0 <= y <= y1: return x0 + (x1 - x0) * (y - y0) / (y1 - y0)
    return pts[-1][1]
def title_vs_paper(r, wide):
    t = (r.get('text') or {}).get('title') or {}
    if not t or not t.get('lines') or not r.get('board'): return None
    bl, bt, bw, bh = r['board']; u = bw / 941.0
    bx, by_, bw_, bh_ = t['box']
    out = []
    for ln in t['lines']:
        right = (bx + bw_ - ln['r'] - bl) / u
        top = (by_ + ln['t'] - bt) / u; bottom = (by_ + bh_ - ln['b'] - bt) / u
        # the caps sit in the lower ~70 % of the em box: test the edge at the cap band's top and bottom
        cap_top = top + (bottom - top) * 0.18
        edge = min((wide_edge if wide else env_edge)(y) for y in (cap_top, bottom))
        out.append({'text': ln['text'], 'right': round(right), 'paper_edge': round(edge), 'overrun': round(right - edge)})
    return out


VP = '471x836'
summary = {'screens': {}}
for i in IDS:
    a, b = A.get((i, VP)), B.get((i, VP))
    if not a:
        continue
    ca, pa = ctrl_stats(a)
    cb, pb = ctrl_stats(b) if b else (Counter(), Counter())
    ta, tb = text_stats(a), text_stats(b) if b else {}
    summary['screens'][i] = {
        'name': NAMES[i], 'overlay': i in OVERLAY,
        'controls_after': dict(ca), 'controls_before': dict(cb), 'provenance_after': dict(pa), 'provenance_before': dict(pb),
        'title_after': {k: ta[k] for k in ('title_inside', 'title_font')}, 'title_before': {k: tb.get(k) for k in ('title_inside', 'title_font')},
        'leaks_after': len(ta['leaks']), 'leaks_before': len(tb.get('leaks') or []), 'collide_after': len(ta['collide']), 'collide_before': len(tb.get('collide') or []),
        'leaks_after_list': ta['leaks'], 'leaks_before_list': tb.get('leaks') or [],
        'title_paper_after': title_vs_paper(a, i in WIDE_STATES_AFTER) if i in OVERLAY else None,
        'title_paper_before': title_vs_paper(b, False) if (b and i in OVERLAY) else None,
        'page_scroll': {vp: (A[(i, vp)]['page_scroll_x'] or A[(i, vp)]['page_scroll_y']) for (j, vp) in A if j == i},
        'offscreen': {vp: len(A[(i, vp)]['offscreen_controls']) for (j, vp) in A if j == i},
    }

# ---- per-control inventory (after, 471 x 836) ----
inv = []
for i in IDS:
    r = A.get((i, VP))
    if not r:
        continue
    for c in r.get('controls') or []:
        kind, prov, meth, desc = classify(c)
        inv.append({'screen': i, 'name': NAMES[i], 'control': c['trigger'], 'class': c['cls'], 'kind': kind, 'provenance': prov, 'method': meth, 'surface': c['surface'], 'desc': desc, 'w': c['w'], 'h': c['h'], 'shadow': c['shadow'], 'font': c['font'], 'overflow': c['overflow']})
summary['inventory_counts'] = {'controls': len(inv), 'by_kind': dict(Counter(x['kind'] for x in inv)), 'by_provenance': dict(Counter(x['provenance'] for x in inv)), 'by_method': dict(Counter(x['method'] for x in inv))}
json.dump(inv, open(os.path.join(OUT, 'control_inventory_after.json'), 'w'), indent=1)

# before inventory with the same classifier (button surfaces before were CSS)
invb = []
for i in IDS:
    r = B.get((i, VP))
    if not r:
        continue
    for c in r.get('controls') or []:
        kind, prov, meth, desc = classify(c)
        invb.append({'screen': i, 'control': c['trigger'], 'kind': kind, 'provenance': prov, 'surface': c['surface'], 'class': c['cls']})
summary['inventory_counts_before'] = {'controls': len(invb), 'by_kind': dict(Counter(x['kind'] for x in invb)), 'by_provenance': dict(Counter(x['provenance'] for x in invb))}
gen_b = [x for x in invb if 'd01-btn' in (x['class'] or '') and x['surface'] == 'CSS']
gen_a = [x for x in inv if 'd01-btn' in (x['class'] or '') and x['surface'] == 'CSS']
summary['d01_btn_css_before'] = len(gen_b)
summary['d01_btn_css_after'] = len(gen_a)
summary['d01_btn_css_after_list'] = [(x['screen'], x['control']) for x in gen_a]
summary['d01_btn_total_after'] = len([x for x in inv if 'd01-btn' in (x['class'] or '')])

# ---- icons ----
icons = Counter(); icons_b = Counter()
for src, cnt in ((A, icons), (B, icons_b)):
    for (i, vp), r in src.items():
        if vp == VP:
            for c in r.get('icons') or []:
                cnt[c['source'].split(':')[0]] += 1
summary['icons_after'] = dict(icons); summary['icons_before'] = dict(icons_b)

# ---- responsive: every viewport in the after rows ----
resp = defaultdict(dict)
for (i, vp), r in A.items():
    t = r.get('text') or {}
    ti = t.get('title') or {}
    resp[vp][i] = {'scroll': r['page_scroll_x'] or r['page_scroll_y'], 'off': len(r['offscreen_controls']), 'title_inside': ti.get('inside') if ti else None, 'leaks': len(t.get('leaks') or []), 'collide': len(t.get('collide') or []), 'status': r['status']}
if os.environ.get('RESP_DIR'):
    for (i, vp), r in rows(os.environ['RESP_DIR']).items():
        t = r.get('text') or {}
        ti = t.get('title') or {}
        resp[vp][i] = {'scroll': r['page_scroll_x'] or r['page_scroll_y'], 'off': len(r['offscreen_controls']), 'title_inside': ti.get('inside') if ti else None, 'leaks': len(t.get('leaks') or []), 'collide': len(t.get('collide') or []), 'status': r['status']}
summary['responsive'] = resp
json.dump(summary, open(os.path.join(OUT, 'summary.json'), 'w'), indent=1)

# ---- comparison sheets ----
def auth_png(i):
    g = glob.glob(os.path.join(AUTH, f'{i}_*.png'))
    return g[0] if g else None


H = 836
for i in IDS:
    tiles = []
    ap = auth_png(i)
    for label, path in (('AUTHORITY', ap), ('BEFORE', os.path.join(BEFORE, f'{i}-{VP}.png')), ('AFTER', os.path.join(AFTER, f'{i}-{VP}.png'))):
        if path and os.path.exists(path):
            im = Image.open(path).convert('RGB')
            im = im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
        else:
            im = Image.new('RGB', (470, H), (200, 200, 200))
        tiles.append((label, im))
    W = sum(t.width for _, t in tiles) + 20 * (len(tiles) - 1)
    sheet = Image.new('RGB', (W, H + 30), 'white')
    d = ImageDraw.Draw(sheet)
    x = 0
    for label, t in tiles:
        sheet.paste(t, (x, 30)); d.text((x + 4, 8), f'{i} {NAMES[i]} — {label}', fill='black'); x += t.width + 20
    sheet.save(os.path.join(OUT, 'compare', f'{i}.webp'), 'WEBP', quality=90)
    small = sheet.resize((sheet.width // 3, sheet.height // 3), Image.LANCZOS)
    small.save(os.path.join(OUT, 'compare_compact', f'{i}.webp'), 'WEBP', quality=72)
print(json.dumps({k: v for k, v in summary.items() if k not in ('screens', 'responsive')}, indent=1))
