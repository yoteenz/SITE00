#!/usr/bin/env python3
"""Render the founder-workspace component registry (registry_data.py) into JSON, CSV and two Markdown documents.

Run from anywhere:  python3 -I docs/site00/idnty/founder-workspace-visual-authority-opus1/registry/build-registry.py
"""
import csv
import json
import runpy
from pathlib import Path

HERE = Path(__file__).resolve().parent
PKG = HERE.parent
data = runpy.run_path(str(HERE / 'registry_data.py'))
R, ST, A11Y, ERR = data['R'], data['ST'], data['A11Y'], data['ERR']
by_id = {c['id']: c for c in R}

COLS = [
    ('id', 'COMPONENT ID'), ('family', 'PAGE FAMILY'), ('name', 'COMPONENT NAME'), ('existing', 'EXISTING SOURCE PATH'),
    ('proposed', 'PROPOSED SOURCE PATH'), ('parent', 'PARENT COMPONENT'), ('children', 'CHILD COMPONENTS'), ('purpose', 'PURPOSE'),
    ('visual', 'VISUAL AUTHORITY'), ('states', 'INTERACTION STATES'), ('mobile', 'MOBILE VARIANT'), ('tablet', 'TABLET VARIANT'),
    ('desktop', 'DESKTOP VARIANT'), ('data', 'DATA SOURCE'), ('api', 'API DEPENDENCY'), ('a11y', 'ACCESSIBILITY CONTRACT'),
    ('error', 'ERROR HANDLING'), ('phase', 'IMPLEMENTATION PHASE'), ('approval', 'FOUNDER APPROVAL STATUS'),
]


def resolve(c):
    out = dict(c)
    out['states'] = ST[c['states']] if isinstance(c['states'], str) else c['states']
    out['states_set'] = c['states'] if isinstance(c['states'], str) else 'custom'
    out['a11y'] = A11Y.get(c['a11y'], c['a11y'])
    out['error'] = ERR.get(c['error'], c['error'])
    if c['family'] == 'OVERLAY' and c['parent'] in by_id:  # overlays ship with their parent's phase
        out['phase'] = by_id[c['parent']]['phase']
    out['visual'] = f"Boards {c['visual']}"
    return out


rows = [resolve(c) for c in R]
fams = []
for r in rows:
    if r['family'] not in fams:
        fams.append(r['family'])

# JSON + CSV (machine-readable registry)
(HERE / 'component-registry.json').write_text(json.dumps({'status': 'PROPOSED — not founder-approved', 'columns': [c[1] for c in COLS], 'components': rows}, indent=2) + '\n')
with open(HERE / 'component-registry.csv', 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow([c[1] for c in COLS])
    for r in rows:
        w.writerow([' · '.join(r[k]) if isinstance(r[k], list) else r[k] for k, _ in COLS])

cell = lambda v: (' · '.join(v) if isinstance(v, list) else str(v)).replace('|', '\\|')
code = lambda v: v if v in ('—', 'none') or v.startswith('none') or ' ' in v.split('/')[0] else f'`{v}`'

# COMPLETE_COMPONENT_INVENTORY.md
md = [
    '# Complete component inventory (registry)',
    '',
    '**Status:** PROPOSED. No component is founder-approved. The registry is generated from `registry/registry_data.py` by `registry/build-registry.py`; the same data is in `registry/component-registry.json` and `registry/component-registry.csv` with all 19 required columns (§40).',
    '',
    f'**Count:** {len(rows)} components in {len(fams)} families: ' + ', '.join(f"{f} {sum(1 for r in rows if r['family'] == f)}" for f in fams) + '.',
    '',
    '**Reading a row:** `EXISTING SOURCE PATH` is what ships today (or `none`). `PROPOSED SOURCE PATH` is a suggested location under `src/site00/admin/founder-workspace/` that Composer confirms in Phase 0. `VISUAL AUTHORITY` names the boards in `boards/`. `INTERACTION STATES` are expanded in COMPONENT_STATE_MATRIX.md. `API DEPENDENCY` actions are on `/api/admin/site00-foundation` unless stated; `(G-xx)` marks a data gap from DATA_CONTRACT_MAPPING.md §9.',
    '',
    '**Readiness rule:** a component is implementation-ready only when every column below is filled and its phase dependencies (COMPOSER_IMPLEMENTATION_HANDOFF.md) are met. Rows that depend on G-04 (operations persistence) are buildable, but their actions must surface the persistence limit honestly.',
    '',
    '## Summary',
    '',
    '| ID | Family | Component | Existing | Boards | Phase | Approval |',
    '| --- | --- | --- | --- | --- | --- | --- |',
]
for r in rows:
    md.append(f"| {r['id']} | {r['family']} | {cell(r['name'])} | {cell(r['existing'])} | {cell(r['visual'][7:])} | {r['phase']} | {r['approval']} |")
md += ['', '## Component tree', '', '```']
for f in fams:
    md.append(f)
    for r in [x for x in rows if x['family'] == f]:
        md.append(f"  ├── {r['id']} {r['name']}" + (f"  ← {r['parent']}" if r['parent'] not in ('—',) else ''))
md += ['```', '', '## Registry', '']
for f in fams:
    md += [f'### {f}', '']
    for r in [x for x in rows if x['family'] == f]:
        md += [f"#### {r['id']} · {r['name']}", '', '| Column | Value |', '| --- | --- |']
        for k, label in COLS:
            v = cell(r[k])
            if k in ('existing', 'proposed') and v not in ('—',):
                v = code(v) if '(' not in v else v
            md.append(f'| {label} | {v} |')
        md.append('')
(PKG / 'COMPLETE_COMPONENT_INVENTORY.md').write_text('\n'.join(md) + '\n')

# COMPONENT_STATE_MATRIX.md
sm = [
    '# Component state matrix',
    '',
    '**Status:** PROPOSED. Generated with the registry (`registry/build-registry.py`). Every interactive component uses one of the shared **state sets** below, or a custom list where its states come from a real enum (task status, stage status). Visuals for each state are on boards 24 (overlays and states) and 27 (component system).',
    '',
    '## State sets',
    '',
    '| Set | States | Visual rule | Accessibility |',
    '| --- | --- | --- | --- |',
]
VIS = {
    'nav': 'Current = red index + red rule (sidebar), red top rule (bottom nav); badge = red count chip',
    'button': 'Focus = 1 px red frame + 1 px inset; busy keeps width and label “WORKING…”; disabled-by-policy hatched with lock + reason',
    'field': 'Focus = red frame + red square before label; invalid = red frame + message with red square; data values keep case',
    'row': 'Hover = surface white; selected = 2 px red inset rule; skeleton mirrors geometry',
    'list': 'Skeleton rows; filtered-empty names the filter + CLEAR; error banner + RETRY; stale banner with time',
    'panel': 'Section skeleton; section error with RETRY; data gaps as “—”',
    'overlay': '2 px red top rule; scrim 46 % ink; sheet from bottom (phone) / dialog centred (tablet, desktop)',
    'decision': 'Primary ink; consequence named; confirmation sheet/dialog; success toast; failure keeps context',
    'chip': 'ok green outline · needs-founder red outline · policy hatched + lock · unverified dashed · failed red solid · test ink outline · warn amber',
    'mark': 'founder red solid · client hollow ink · work ink solid · blocked hollow red · done grey · idle hollow grey · test hatched',
    'tabs': 'Selected = ink label + 2 px red underline; counts as count chips; phone strips scroll with the selected tab kept in view',
    'search': 'Results grouped (clients, reviews, go to); highlighted row = red inset rule',
    'toast': 'Success ink; error white with red border, persists until dismissed',
    'send': 'Status chips mirror SendIntentStatus; DELIVERED only from webhook; gated sends show the failing gate',
}
A11 = {'nav': 'nav', 'button': 'button', 'field': 'field', 'row': 'row', 'list': 'list', 'panel': 'region', 'overlay': 'overlay', 'decision': 'decision', 'chip': 'chip', 'mark': 'mark', 'tabs': 'tabs', 'search': 'search', 'toast': 'toast', 'send': 'decision'}
for k, states in ST.items():
    sm.append(f"| `{k}` | {' · '.join(states)} | {VIS[k]} | {A11Y[A11[k]]} |")
sm += ['', '## Matrix (component × state set)', '', '| ID | Component | State set | States |', '| --- | --- | --- | --- |']
for r in rows:
    sm.append(f"| {r['id']} | {cell(r['name'])} | `{r['states_set']}` | {cell(r['states'])} |")
sm += [
    '',
    '## Cross-cutting state rules',
    '',
    '1. **No optimistic success.** A mutation shows busy, then success only from the API response (toast + refreshed data). Failure leaves the form or overlay open with values intact.',
    '2. **Unavailable is visible.** Actions the API does not support (resend invitation G-05, archive/revoke G-06) render as disabled with a reason (FD-W5 decides shown-disabled vs hidden). Nothing is a silent no-op.',
    '3. **Persistence honesty.** Actions that do not persist alone (G-04) carry a small “NOT SAVED ACROSS RESTART” note in their confirmation until the persistence workstream closes the gap.',
    '4. **Stale ≠ live.** Data older than one refresh cycle after a failed refresh shows the stale banner with its age.',
    '5. **Gaps are “—”.** Missing fields (G-01, G-02) never fall back to mock or sample values.',
    '6. **Case.** Application copy is uppercase by CSS; email, domain, link, token, id, template id and environment names render in `.fw-data` and are never transformed.',
]
(PKG / 'COMPONENT_STATE_MATRIX.md').write_text('\n'.join(sm) + '\n')
print(f'{len(rows)} components · {len(fams)} families · overlays {sum(1 for r in rows if r["family"] == "OVERLAY")}')
