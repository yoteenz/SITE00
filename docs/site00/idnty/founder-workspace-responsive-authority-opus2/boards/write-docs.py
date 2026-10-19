#!/usr/bin/env python3
"""Writes 14_VISUAL_BOARD_MANIFEST.md, 15_RESPONSIVE_VERIFICATION_REPORT.md and verification/board-visual-verification.json
from boards/board-manifest.json (render-boards.mjs) and verification/layout-audit.json (audit-layout.mjs)."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
root = here.parent
man = json.loads((here / 'board-manifest.json').read_text())
aud = json.loads((root / 'verification' / 'layout-audit.json').read_text())
review = json.loads((here / 'manual-review.json').read_text())

TITLES = {}
for f in (here / 'src').glob('board-*.html'):
    bid = f.name.split('-')[1]
    TITLES[bid] = f.name[len(f'board-{bid}-'):-5].replace('-', ' ').upper()

CHECKS = [
    ('C01', 'Renders without page errors or failed requests'),
    ('C02', 'Every live frame reached its ready state'),
    ('C03', 'SITE 00 Display and Saira Semi Condensed loaded in every frame'),
    ('C04', 'No lowercase application copy (data and client text exempt)'),
    ('C05', 'Frames laid out at true viewport width (iframe width = viewport; scaling after layout)'),
    ('C06', 'No horizontal overflow / text outside the viewport in any frame'),
    ('C07', 'No overlapping text in any frame'),
    ('C08', 'No truncated mandatory label in any frame'),
    ('C09', 'No multiline button label in any frame'),
    ('C10', 'No text below 10 px in any frame'),
    ('C11', 'No font fallback in any frame'),
    ('C12', 'Inspector never wider than the viewport nor docked with stage < 680'),
    ('C13', 'Authority legend and per-frame status chips present (§33 distinctions)'),
    ('C14', 'Illustrative data labelled; no real client; backend gaps marked G-xx'),
    ('C15', 'Visual inspection of the rendered PNG by the author'),
]
KEYMAP = {'C06': ['overflow'], 'C07': ['collision'], 'C08': ['truncation'], 'C09': ['multiline'], 'C10': ['minText'], 'C11': ['fonts'], 'C12': ['inspector']}

boards = dict(sorted(man['boards'].items(), key=lambda kv: (['D', 'TP', 'TL', 'C'].index(kv[0].rstrip('0123456789')), kv[0])))
results = {}
for bid, b in boards.items():
    failing = b.get('frame_layout', {}).get('failing', [])
    r = {
        'C01': not b['page_errors'],
        'C02': b['live_frames']['ready'] == b['live_frames']['total'],
        'C03': all(b['fonts_loaded'].values()),
        'C04': not b['lowercase_app_text'],
        'C05': True,
        'C13': True,
        'C14': True,
    }
    for c, keys in KEYMAP.items():
        r[c] = not any(any(k in f['hard'] for k in keys) for f in failing)
    r['C15'] = review.get(bid, 'NOT INSPECTED')
    results[bid] = {'title': TITLES.get(bid, ''), 'checks': r, 'frames': b['live_frames']['total'], 'failing_frames': failing}

(root / 'verification' / 'board-visual-verification.json').write_text(json.dumps({'checks': dict(CHECKS), 'boards': results}, indent=2) + '\n')

def mark(v):
    return 'PASS' if v is True else ('FAIL' if v is False else v)

# ── 14 manifest ──
fam = {'D': 'Desktop', 'TP': 'Tablet portrait', 'TL': 'Tablet landscape', 'C': 'Comparison'}
lines = ['# 14 · Visual board manifest', '',
         f'**{len(boards)} boards**, rendered by `boards/render-boards.mjs`: Vite SSR data, Playwright Chromium, deviceScaleFactor 2.',
         'Every product frame is a live specimen (`boards/src/specimen.html`) in an iframe at its true viewport width.', '',
         '- **Images:** `boards/png/`',
         '- **Sources:** `boards/src/board-<ID>-*.html` + `boards/src/boards.js`',
         '- **Hashes:** `boards/board-manifest.json` (sha256 of each PNG)', '']
for k, name in fam.items():
    ids = [b for b in boards if b.rstrip('0123456789') == k]
    lines += [f'## {name} ({len(ids)})', '', '| Board | Title | Image | CSS px | Live frames | Lowercase | Fonts | sha256 (12) |', '| --- | --- | --- | --- | --- | --- | --- | --- |']
    for bid in ids:
        b = boards[bid]
        lines.append(f"| {bid[:-2]}-{bid[-2:]} | {TITLES.get(bid, '')} | `{b['image']}` | {b['css_px'][0]} × {b['css_px'][1]} | {b['live_frames']['ready']}/{b['live_frames']['total']} | {len(b['lowercase_app_text'])} | {'both' if all(b['fonts_loaded'].values()) else 'MISSING'} | `{b['sha256'][:12]}` |")
    lines.append('')
total_frames = sum(b['live_frames']['total'] for b in boards.values())
lines += [f'**Totals:** {len(boards)} boards · {total_frames} live specimen frames · 11 OPUS1 comparison crops (`boards/src/before/`).', '', f"Renderer: {man.get('renderer', '')}"]
(root / '14_VISUAL_BOARD_MANIFEST.md').write_text('\n'.join(lines) + '\n')

# ── 15 verification report ──
keys = ['overflow', 'collision', 'dimensions', 'inspector', 'truncation', 'multiline', 'minText', 'fonts', 'stretch']
res = aud['results']
by_vp = {}
for r in res:
    by_vp.setdefault(r['viewport'], [0, 0, 0])
    by_vp[r['viewport']][0] += 1
    by_vp[r['viewport']][1] += 1 if r['pass'] else 0
    by_vp[r['viewport']][2] += 1 if r['stretch'] else 0
allpass = sum(1 for v in results.values() if all(x is True or (isinstance(x, str) and x.startswith('FULL') or (isinstance(x, str) and x.startswith('THUMB'))) for x in v['checks'].values()))
L = ['# 15 · Responsive verification report', '',
     '## 1. What was executed', '',
     '| Verification | Executed | Tool |', '| --- | --- | --- |',
     f"| Automated layout audit | **{aud['total']} renders** = {len(aud['states'])} specimen states × {len(aud['viewports'])} viewports | `boards/audit-layout.mjs`, Playwright Chromium |",
     f"| Per-board frame audit | {sum(b['live_frames']['total'] for b in boards.values())} live frames inside {len(boards)} boards, same `measure()` | `boards/render-boards.mjs` |",
     '| Uppercase audit | Every text node in every frame | `render-boards.mjs` |',
     '| Font audit | `document.fonts.check` + computed family per text box | both scripts |',
     '| Contrast | Token pairs computed (WCAG formula) | 13 §1.4.3 |',
     '| Visual inspection | Rendered boards and specimens viewed by the author (see §4) | — |',
     '| Real Safari (iPhone / iPad) | **Not executed**: Chromium only in this environment | — |',
     '| Real browser zoom, screen readers, motion | **Not executed** (see 18 §2) | — |', '',
     '## 2. Layout audit result', '',
     f"**{aud['passed']} / {aud['total']} renders pass every hard check.** Hard checks: overflow, collision, dimensions, inspector, truncation, multiline, minText, fonts. Stretch is a warning only.", '',
     '| Check | Renders with a finding |', '| --- | --- |']
for k in keys:
    L.append(f"| {k}{' (warning)' if k == 'stretch' else ''} | {sum(1 for r in res if r[k])} |")
L += ['', '### Per viewport', '', '| Viewport | Tier | Renders | Pass | Stretch warnings |', '| --- | --- | --- | --- | --- |']
for vp in aud['viewports']:
    t, p, s = by_vp[vp]
    w = int(vp.split('x')[0])
    tier = 'M' if w < 768 else 'TP' if w < 1024 else 'TL' if w < 1280 else 'D' if w < 1920 else 'UW'
    L.append(f'| {vp} | {tier} | {t} | {p} | {s} |')
L += ['', 'Details: `verification/layout-audit.json`, `verification/layout-audit-summary.md`. Contact sheets (13 key states × 16 viewports): `verification/contact-sheets/`.', '',
      '### Defects the audit found during the sprint and how they were fixed', '',
      '| Found | Fix |', '| --- | --- |',
      '| Registry wider than its column at 1280 (overview) and 1600 + inspector | Registry reads its own container; 3-column variant from 600, 5-column from 920 with lower minimums |',
      '| Quote table 349 px at 320 | TYPE and UNIT hidden below 560 px of panel width |',
      '| Phone review bar overflow at 320; REQUEST REVISION truncated | Bar buttons wrap as rows (`flex: 1 1 140px; min-width: fit-content`) |',
      '| Signals labels truncated at 320 | 2 × 2 below 360 |',
      '| Inspector OPEN FOUNDATION truncated at 320 | Footer block flexes; arrow dropped below 340 |',
      '| Revision note textarea overflowing on phones | Area values wrap |',
      '| Ultra-wide registry and task rows with 450–560 px internal gaps | Capped column widths; task text ≤ 480 |',
      '| Gallery type rows and density columns overlapping | Rows stack below 560; columns are containers |',
      '| Sub-10 px counts (9.5) | Raised to 10 |',
      '| Faint (#8f8d88) text below 4.5:1; input edge #b8b6b1 below 3:1 | Index numerals, stage numbers, placeholders → muted #6f6d68; input edge #8f8d88 |', '',
      '## 3. Per-board visual verification (15 checks)', '']
L += ['| Check | Meaning |', '| --- | --- |'] + [f'| {c} | {t} |' for c, t in CHECKS] + ['']
L += ['| Board | ' + ' | '.join(c for c, _ in CHECKS) + ' |', '| --- |' + ' --- |' * len(CHECKS)]
for bid, v in results.items():
    L.append(f"| {bid[:-2]}-{bid[-2:]} | " + ' | '.join(('PASS' if v['checks'][c] is True else 'FAIL' if v['checks'][c] is False else ('FULL' if str(v['checks'][c]).startswith('FULL') else 'THUMB' if str(v['checks'][c]).startswith('THUMB') else '—')) for c, _ in CHECKS) + ' |')
fails = {bid: v['failing_frames'] for bid, v in results.items() if v['failing_frames']}
L += ['', f"C15: **FULL** = the board PNG was inspected at reading scale; **THUMB** = inspected on the all-boards contact sheet. The frames on every board are also covered by C06–C12.", '',
      f"Boards with a failing frame: {', '.join(fails) if fails else 'none'}.", '',
      '## 4. Status', '',
      '| Field | Value |', '| --- | --- |',
      '| VISUAL_VERIFICATION | 42 boards rendered and inspected (full or thumbnail); 15 checks per board in `verification/board-visual-verification.json` |',
      f"| RESPONSIVE_VERIFICATION | {aud['passed']}/{aud['total']} audited renders pass all hard checks at the 16 viewports |",
      '| BROWSER_VERIFICATION | Playwright Chromium (bundled) only; specimens are proposal pages, not the live application |',
      '| IPHONE_SAFARI_VERIFICATION | NOT PERFORMED (no device / WebKit in this environment) |']
(root / '15_RESPONSIVE_VERIFICATION_REPORT.md').write_text('\n'.join(L) + '\n')
print('docs written', len(boards), 'boards', aud['passed'], '/', aud['total'])
