#!/usr/bin/env python3
"""Write VISUAL_BOARD_MANIFEST.md from board-manifest.json (produced by render-boards.mjs)."""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
PKG = HERE.parent
m = json.loads((HERE / 'board-manifest.json').read_text())
boards = m['boards']

# Review round, viewport coverage and frame captions per board (captions read from each board module).
ROUND = {**{k: 'A' for k in ('01', '02')}, **{f'{i:02d}': 'B' for i in range(3, 9)}, **{f'{i:02d}': 'C' for i in range(9, 17)},
         **{f'{i:02d}': 'D' for i in range(17, 21)}, **{f'{i:02d}': 'E' for i in range(21, 24)}, **{f'{i:02d}': 'F' for i in range(24, 29)}}
VIEW = {
    '01': 'M', '02': 'D T', '03': 'M', '04': 'D', '05': 'M', '06': 'D', '07': 'M', '08': 'D', '09': 'M', '10': 'D', '11': 'M D', '12': 'M D',
    '13': 'M', '14': 'D', '15': 'M', '16': 'D', '17': 'M', '18': 'D', '19': 'M', '20': 'D', '21': 'M', '22': 'D', '23': 'M D',
    '24': 'M D', '25': 'M T D', '26': '—', '27': '—', '28': 'M',
}


def info(src):
    js = (HERE / src.replace('.html', '.js')).read_text()
    title = re.search(r"header\(\{ num: '\d+', title: '([^']+)'", js).group(1)
    frames = [f for f in re.findall(r"\btitle: '([A-Z0-9][^']*)'", js) if f != title and '<br>' not in f and f not in ('SYSTEM', 'FOUNDATIONS', 'OVERVIEW', 'REVIEWS')]
    return title, frames


rows = []
counts = {'M': 0, 'T': 0, 'D': 0}
for k in sorted(boards):
    b = boards[k]
    title, frames = info(b['source'])
    for v in VIEW[k].split():
        if v in counts:
            counts[v] += 1
    audit = 'PASS' if not b['lowercase_app_text'] and not b['page_errors'] and all(b['fonts_loaded'].values()) else 'FAIL'
    rows.append((k, title, ROUND[k], VIEW[k], frames, b, audit))

out = [
    '# Visual board manifest',
    '',
    '**Status:** PROPOSED. Generated from `boards/board-manifest.json` by `boards/write-manifest-doc.py` after `boards/render-boards.mjs`. Boards are static Chromium renders at device scale 2; they are not screenshots of an implemented workspace.',
    '',
    f"**Renderer:** `{m['renderer']}`. Data is loaded from source through the repository's Vite server (icons, business types, commercial config, add-on catalog, DF threshold objects).",
    '',
    f"**Totals:** {len(rows)} boards · boards with phone frames {counts['M']} · tablet {counts['T']} · desktop {counts['D']} · audits passed {sum(1 for r in rows if r[6] == 'PASS')}/{len(rows)}.",
    '',
    '**Audit** = both fonts loaded (SITE 00 Display, Saira Semi Condensed) · no lowercase application text outside `.fw-data` · no page errors.',
    '',
    '**Viewports:** M = iPhone Safari frame 390 × 844 · T = iPad 834 × 1112 / 1194 × 834 · D = desktop 1440 × 900 (plus 560 / 760 crops for menus and dialogs).',
    '',
    '| # | Board | Round | Viewports | Image | Pixels | Audit | SHA-256 (first 16) |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
]
for k, title, rnd, view, frames, b, audit in rows:
    out.append(f"| {k} | {title} | {rnd} | {view} | `boards/{b['image']}` | {b['image_px'][0]}×{b['image_px'][1]} | {audit} | `{b['sha256'][:16]}` |")
out += ['', '## Frames per board', '']
for k, title, rnd, view, frames, b, audit in rows:
    out.append(f"- **{k} · {title}:** " + (' · '.join(dict.fromkeys(frames)) if frames else 'diagram / specimen sheet'))
out += [
    '',
    '## Required board coverage (§37)',
    '',
    '| Requirement | Boards |',
    '| --- | --- |',
    '| Global shell, mobile + desktop + tablet | 01, 02, 25 |',
    '| Overview, Foundations, create flow | 03–08 |',
    '| Client record incl. intake, recommendations, quote | 09–12 |',
    '| Reviews queue + detail | 13–16 |',
    '| Operations | 17, 18 |',
    '| Correspondence | 19, 20 |',
    '| System + test lab | 21–23 |',
    '| Overlays + interaction states | 24 |',
    '| Responsive component authority | 25 |',
    '| Navigation + page tree | 26 |',
    '| Component system | 27 |',
    '| End-to-end founder workflow | 28 |',
    '',
    'Founder reference images (inputs, not outputs): `references/founder-reference-mobile-set-1.png`, `references/founder-reference-mobile-set-2.jpg`.',
]
(PKG / 'VISUAL_BOARD_MANIFEST.md').write_text('\n'.join(out) + '\n')
print(f"{len(rows)} boards · M {counts['M']} · T {counts['T']} · D {counts['D']}")
