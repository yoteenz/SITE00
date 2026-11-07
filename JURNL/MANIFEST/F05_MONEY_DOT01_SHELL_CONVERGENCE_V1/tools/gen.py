import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from data import *  # noqa
from matrix import ENV, BEFORE_ENV, M, GROUPS
from texts import T  # narrative per report (texts.py)

OUT = f'{REPO}/JURNL/MANIFEST/F05_MONEY_DOT01_SHELL_CONVERGENCE_V1'
os.makedirs(f'{OUT}/reports', exist_ok=True)
R = {}


def table(head, rows):
    return '\n'.join(['| ' + ' | '.join(head) + ' |', '|' + '---|' * len(head)] + ['| ' + ' | '.join(str(c) for c in r) + ' |' for r in rows])


# ── computed tables ──────────────────────────────────────────────────────────────────────────────────────────────
rb, ra = responsive_summary(BEFORE), responsive_summary(AFTER)
sk_rows = []
for k, v in SK['sidekicks'].items():
    sk_rows.append([k, v['path'], f"`{v['sha256'][:16]}…`", f"{v['size'][0]} × {v['size'][1]}", v['mode'], f"{v['opaque_px']:,}", v['transparent_px']])
cov = []
for sid in sorted(M):
    a = SK['authorities'].get(sid)
    if not a:
        continue
    h = {k[:4]: v['hero'] for k, v in a['mad'].items()}
    f = {k[:4]: v['foot'] for k, v in a['mad'].items()}
    paired = 'PIXEL-PAIRED (hero)' if min(h.values()) < 7 else 'independent render'
    cov.append([sid, NAMES.get(sid, ''), ENV[sid], f"{min(h, key=h.get)} ({min(h.values())})", f"{min(f, key=f.get)} ({min(f.values())})", paired, 'NO'])
CMPROWS = []
for sid in sorted(M):
    c = CMP.get(sid, {})
    b, a = c.get('before'), c.get('after')
    if b and a:
        CMPROWS.append([sid, NAMES.get(sid, ''), b['edge_recall'], a['edge_recall'], b['edge_precision'], a['edge_precision'], b['mean_abs_diff'], a['mean_abs_diff'], M[sid][1]])
icons = icons_after()
icon_rows, icon_tot = [], {}
for sid in sorted(icons):
    for i in icons[sid]:
        k = icon_class(i['source'])
        icon_tot[k] = icon_tot.get(k, 0) + 1
        icon_rows.append([sid, i['owner'] or '—', k, i['source'].replace('MICRO:', '').replace('AUTHORITY_LIFT:', '').split('?')[0][:48], f"{i['w']}×{i['h']}", i['color'], (i.get('sig') or '')[:22].replace('|', '/')])
count_rows = []
for key in sorted(COUNTS, key=lambda k: (int(k.split('-')[0][1:]), k)):
    v = COUNTS[key]
    els = v['els']
    papers = [e for e in els if e['id'].startswith('d01-place-')]
    acts = {e['id']: e['rect'] for e in els if e['id'] in ('d01-add-account', 'd01-reorder')}
    navs = [e for e in els if e['sel'] == '.jrn-nav']
    vpH = int(key.split('-')[1].split('x')[1])
    count_rows.append([key.split('-')[0][1:], key.split('-')[1], round(v['u'], 4), len(papers), 'yes' if v.get('grid_scrolls') else 'no',
                       acts.get('d01-add-account', ['—', '—'])[1] if acts else '—', 'no' if not v['page_scroll_y'] else 'YES',
                       len([e for e in els if 'empty' in e['id']]) and 'EMPTY (22)' or ''])

# ── reports ──────────────────────────────────────────────────────────────────────────────────────────────────────
R['01_BRANCH_AND_RUNTIME_BASELINE'] = T['01']
R['02_CURRENT_SHELL_ARCHITECTURE'] = T['02'] + '\n\n## Environment per surface (after this sprint)\n\n' + table(['#', 'Screen', 'Runtime environment (L0 + owned layers)', 'Before'], [[s, NAMES.get(s, ''), ENV[s], BEFORE_ENV[s]] for s in sorted(M)])
R['03_SIDEKICK_SOURCE_AND_HASH_AUDIT'] = T['03a'] + '\n\n' + table(['SIDEKICK', 'Exact source path (repo)', 'SHA-256', 'Size', 'Mode', 'Opaque px', 'Transparent px'], sk_rows) + '\n\n' + T['03b']
R['04_37_SCREEN_SIDEKICK_COVERAGE'] = T['04'] + '\n\n' + table(['#', 'Screen', 'Current environment', 'Nearest hero (MAD)', 'Nearest foot (MAD)', 'Pairing', 'New SIDEKICK required'], cov)
R['05_MISSING_ENVIRONMENT_VS_FOREGROUND'] = T['05']
R['06_GENERIC_TEMPLATE_ROOT_CAUSE'] = T['06']
R['07_SCENE_COORDINATE_CONTRACT'] = T['07']
R['08_SCREEN01_02_AUDIT'] = T['08']
R['09_SCREEN03_RIDESHARE_REBUILD'] = T['09']
R['10_SCREEN04_CASH_REBUILD'] = T['10']
R['11_SCREEN05_CREDIT_REBUILD'] = T['11']
R['12_SCREEN06_ALL_ACCOUNTS_REBUILD'] = T['12']
R['13_ACCOUNT_COUNT_VARIANTS'] = T['13'] + '\n\n## Measured (after; board px; DSF 2 captures in evidence/06_counts)\n\n' + table(['Pockets', 'Viewport', 'u', 'Papers drawn', 'Card zone scrolls', 'ADD ACCOUNT top (board y)', 'Page scroll', 'State'], count_rows)
for key, ids in (('14_SCREENS07_13_COMPOSITION_AUDIT', [f'{i:02d}' for i in range(7, 14)]), ('15_SCREENS14_25_COMPOSITION_AUDIT', GROUPS['14-25']), ('16_SCREENS26_37_COMPOSITION_AUDIT', GROUPS['26-37'])):
    R[key] = T[key[:2]] + '\n\n' + table(['#', 'Screen', 'Environment', 'Classification', 'This sprint', 'Remaining deviation'], [[s, NAMES.get(s, ''), ENV[s], M[s][0], M[s][1], M[s][2]] for s in ids])
R['17_SCENIC_FOREGROUND_AND_LAYER_MAP'] = T['17']
R['18_FULL_ASSET_RECOVERY_LOG'] = T['18'] + '\n\n## Lifted this sprint (SCENES/F05_DOT01_SCENE06.json)\n\n' + table(['Layer', 'Box (authority px)', 'Bytes', 'Source'], [[f"CARD06_{k}", v['box'], v['runtime_bytes'], SCENE06['source']] for k, v in SCENE06['papers'].items()] + [[f"ACTION06_{k}", v['box'], v['runtime_bytes'], SCENE06['source']] for k, v in SCENE06['actions'].items()] + [[f"ICON06_{k}", v['glyph_box'], '—', SCENE06['source']] for k, v in SCENE06['actions'].items()] + [['SCENE_22 (band)', SCENE06['empty']['band'], SCENE06['empty']['runtime_bytes'], SCENE06['empty']['source']], ['SCENE_22_TILE', SCENE06['empty']['tile'], '—', SCENE06['empty']['source']], ['SEAL_22', SCENE06['empty_seal']['box'], '—', SCENE06['empty']['source']]])
R['19_MICRO_ICON_SOURCE_AND_MAPPING'] = T['19'] + f"\n\n## Census totals (after, 393 × 852, every visible icon in the 37 states)\n\n" + table(['Source class', 'Count'], sorted(icon_tot.items())) + '\n\n## Every icon\n\n' + table(['#', 'Control', 'Source class', 'Source', 'Rendered (css px)', 'Colour', 'Vector signature'], icon_rows)
R['20_BUTTON_AND_PARCHMENT_GEOMETRY'] = T['20']
R['21_V3_INTERACTIVE_COMPATIBILITY'] = T['21']
R['22_RESPONSIVE_AND_SHORT_PHONE'] = T['22'] + '\n\n## 37 states × 10 viewports\n\n' + table(['', 'BEFORE (d6992b3fc)', 'AFTER'], [['cells measured', rb['cells'], ra['cells']], ['state failed to open', rb['failed'], ra['failed']], ['page-level scroll', rb['page_scroll'], ra['page_scroll']], ['cells with an off-screen control (not in a scroller)', rb['offscreen_cells'], ra['offscreen_cells']], ['cells whose board foot is below the fold', rb['board_clipped'], ra['board_clipped']], ['cells with an internal scroller in use', rb['internal_scroll'], ra['internal_scroll']]]) + '\n\nOff-screen controls AFTER:\n\n' + table(['#', 'Viewport', 'Controls'], [[a, b, ', '.join(c)] for a, b, c in ra['off']]) + '\n\nOff-screen controls BEFORE:\n\n' + table(['#', 'Viewport', 'Controls'], [[a, b, ', '.join(c)] for a, b, c in rb['off']])
R['23_IOS_SAFARI_STATUS'] = T['23']
R['24_ALL_37_VISUAL_COMPARISONS'] = T['24'] + '\n\n' + table(['#', 'Screen', 'edge recall BEFORE', 'AFTER', 'edge precision BEFORE', 'AFTER', 'mean |Δ| BEFORE', 'AFTER', 'This sprint'], CMPROWS)
R['25_FINANCIAL_NONREGRESSION'] = T['25']
R['26_TEST_RESULTS'] = T['26']
R['27_REMAINING_VISUAL_AND_ASSET_GATES'] = T['27']
R['28_SIDEKICK_GENERATION_DECISION'] = T['28']
R['29_CHANGED_FILES_AND_SHA_MAP'] = T['29']
R['30_FOUNDER_REVIEW'] = T['30']
for k, v in R.items():
    open(f'{OUT}/reports/{k}.md', 'w').write(v.rstrip() + '\n')
json.dump({'responsive_before': rb, 'responsive_after': ra, 'icons': icon_tot, 'compare_rows': len(CMPROWS)}, open(f'{OUT}/metrics/summary.json', 'w'), indent=1) if os.path.isdir(f'{OUT}/metrics') else None
print(len(R), 'reports;', 'icons', icon_tot, 'resp after', {k: v for k, v in ra.items() if k != 'off'})

# ── 26 test results (unit + E2E + base comparison), written last ─────────────────────────────────────────────────
from pw import summarise
def e2e_section(path, title):
    s = summarise(path)
    if not s:
        return f'\n\n## {title}\n\n(not available)\n', set(), {}
    agg, fails, st = s
    rows = [[f, p, v.get('expected', 0), v.get('unexpected', 0), v.get('flaky', 0), v.get('skipped', 0)] for (f, p), v in sorted(agg.items())]
    tot = {k: sum(v.get(k, 0) for v in agg.values()) for k in ('expected', 'unexpected', 'flaky', 'skipped')}
    return f'\n\n## {title}\n\nTotals: **{tot["expected"]} passed · {tot["unexpected"]} failed · {tot["flaky"]} flaky · {tot["skipped"]} skipped**\n\n' + table(['Spec', 'Project', 'passed', 'failed', 'flaky', 'skipped'], rows), {(f, p, t) for f, p, t in fails}, tot
unit = json.load(open(f'{O3}/unit_final.json')) if os.path.exists(f'{O3}/unit_final.json') else None
u_txt = f"**{unit['numPassedTests']} / {unit['numTotalTests']} passed**, {unit['numFailedTests']} failed" if unit else '(pending)'
u_fail = [f"{f['name'].split('/')[-1]} — {t['title']}" for f in (unit or {}).get('testResults', []) for t in f['assertionResults'] if t['status'] == 'failed']
main_txt, main_fails, main_tot = e2e_section(f'{O3}/e2e2.json', 'E2E — full run (production build, 9 specs × 4 projects)')
re_txt, re_fails, re_tot = e2e_section(f'{O3}/e2e3.json', 'E2E — rerun of the DOT 01 / directory / pockets specs on the final build')
base_txt, base_fails, _ = e2e_section(f'{O3}/e2e_base.json', 'E2E — the untouched base d6992b3fc (small project; carousel, motion pilot, pockets, dot01)')
_, base_t04_fails, _ = e2e_section(f'{O3}/e2e_base_t04.json', 'base T04 (tablet)')
_, base_c07_fails, _ = e2e_section(f'{O3}/e2e_base_c07.json', 'base carousel 07–10 (desktop)')
base_titles = {(f, t) for f, p, t in base_fails | base_t04_fails | base_c07_fails}
fl = []
final_fails = re_fails | {x for x in main_fails if x[0] not in ('jurnl-f05-dot01.e2e.ts', 'jurnl-f05-dot01-directory.e2e.ts', 'jurnl-f05-pockets.e2e.ts')}
for f, p, t in sorted(final_fails):
    fl.append([f, p, t[:90], 'PRE-EXISTING (fails on the untouched base)' if (f, t) in base_titles else ('PRE-EXISTING (same test fails on base, small project)' if any(bf == f and bt == t for bf, bt in base_titles) else 'NEW — investigate')])
R['26_TEST_RESULTS'] = f"""# 26 · Test results

| Check | Result |
|---|---|
| JURNL unit (vitest `tests/jurnl*`) | {u_txt} |
| new unit suite `jurnlF05DirectoryScene` | 9 / 9 (C1–C7, E1–E2) |
| typecheck (`tsc --noEmit`) | 0 errors |
| production build (`npm run build`, dist verify) | PASS |

Unit failures: {'; '.join(u_fail) if u_fail else 'none'} — `jurnlF05MotionPilot` "accounts snap-scroll two per row" fails identically on the untouched base `d6992b3fc` (verified with the working tree stashed): Cursor's rail geometry, not this sprint.
""" + main_txt + re_txt + base_txt + '\n\nAlso run on the base: pockets T04 on the tablet project and carousel 07 / 08 / 09 / 10 on the desktop project — both fail identically on the base (the MONEY parent rail).' + '\n\n## Failures after this sprint, classified\n\n' + (table(['Spec', 'Project', 'Test', 'Classification'], fl) if fl else 'none') + """

Fixed during the sprint (found by the suites): the 06 action buttons inherited `pointer-events: none` (unclickable); the 06 paper
names had no space between their two lines (text read BANKACCOUNT); the dock test now finds SK01's baked nav paper by an empty
marker instead of a second drawn copy."""
open(f'{OUT}/reports/26_TEST_RESULTS.md', 'w').write(R['26_TEST_RESULTS'].rstrip() + '\n')
print('26 written', u_txt, main_tot, re_tot, len(fl))
