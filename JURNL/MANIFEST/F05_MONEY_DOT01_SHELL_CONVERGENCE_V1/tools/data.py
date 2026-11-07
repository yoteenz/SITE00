"""OPUS3 evidence loader: probe metrics (before / after), icon census, SIDEKICK audit, count captures, comparisons."""
import json, os, re
SP = '/tmp/claude-0/-home-user/334ce893-7840-52d9-a9d4-209cc4b29b39/scratchpad'
O3 = f'{SP}/o3'
REPO = '/home/user/SITE00'
M = f'{REPO}/JURNL/MANIFEST/F05_MONEY_DOT01_SHELL_CONVERGENCE_V1'
VPS = ['360x780', '375x667', '393x660', '393x852', '430x932', '471x836', '768x1024', '834x1194', '1024x768', '1440x900']
NAMES = {}


def rows(label):
    p = f'{O3}/{label}/metrics-{label}.jsonl'
    return [json.loads(l) for l in open(p)] if os.path.exists(p) else []


BEFORE = rows('before')
AFTER = rows('after')
for r in AFTER or BEFORE:
    NAMES[r['id']] = r['name']
SK = json.load(open(f'{O3}/an/sidekick_audit.json'))
CMP = json.load(open(f'{O3}/cmp/compare.json')) if os.path.exists(f'{O3}/cmp/compare.json') else {}
COUNTS = json.load(open(f'{O3}/after_counts/rects.json')) if os.path.exists(f'{O3}/after_counts/rects.json') else {}
COUNTS_BEFORE = json.load(open(f'{O3}/before_counts/rects.json')) if os.path.exists(f'{O3}/before_counts/rects.json') else {}
SCENE06 = json.load(open(f'{REPO}/src/projects/jurnl/families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENE06.json'))


def cell(rs, sid, vp):
    for r in rs:
        if r['id'] == sid and r['viewport'] == vp:
            return r
    return None


def responsive_summary(rs):
    out = {'cells': len(rs), 'page_scroll': 0, 'offscreen_cells': 0, 'failed': 0, 'board_clipped': 0, 'internal_scroll': 0, 'off': []}
    for r in rs:
        if r.get('status', 'RENDERED') != 'RENDERED':
            out['failed'] += 1
            continue
        if r.get('page_scroll_y') or r.get('page_scroll_x'):
            out['page_scroll'] += 1
        if r.get('offscreen_controls'):
            out['offscreen_cells'] += 1
            out['off'].append((r['id'], r['viewport'], r['offscreen_controls']))
        if (r.get('board_clipped_bottom') or 0) > 0:
            out['board_clipped'] += 1
        if (r.get('internal_scroll') or {}).get('scrolls'):
            out['internal_scroll'] += 1
    return out


def icons_after():
    out = {}
    for r in AFTER:
        if r['viewport'] == '393x852' and r.get('icons') is not None:
            out[r['id']] = r['icons']
    return out


def icon_class(src):
    if src.startswith('AUTHORITY_LIFT'):
        return 'AUTHORITY_LIFT'
    if src.startswith('MICRO:'):
        return 'MICRO_ASSET'
    if src == 'DOCK_COMPONENT':
        return 'DOCK_COMPONENT'
    if src.startswith('IMG:'):
        return 'OTHER_IMAGE'
    return 'INLINE_SVG'
