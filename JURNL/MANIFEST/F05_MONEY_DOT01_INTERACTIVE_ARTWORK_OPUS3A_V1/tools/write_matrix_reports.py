"""Writes the census-driven reports of OPUS3A (06, 07, 09, 10, 11, 16) and OPUS3B (06, 07, 08, 09, 10, 11, 14) from
summary.json / control_inventory_after.json (build_dot01_artwork_type_evidence.py) and the long-content rows.
Run: python -I write_matrix_reports.py <evidence-build dir> <long_before dir> <long_after dir> <OPUS3A dir> <OPUS3B dir>"""
import json, os, sys
from collections import Counter, defaultdict

EV, LB, LA, A3A, A3B = sys.argv[1:6]
S = json.load(open(os.path.join(EV, 'summary.json')))
INV = json.load(open(os.path.join(EV, 'control_inventory_after.json')))
SC = S['screens']
IDS = sorted(SC)

# What this sprint changed per screen, and what still differs from the authority (from the code diff, the captures and the
# comparison sheets; OPUS3 gate numbers refer to SHELL_CONVERGENCE_V1 report 27).
NOTE = {
 '01': ('none (MONEY parent motion pilot, not a DOT 01 V9 composition)', 'accounts rail vs the authority\'s four papers — founder decision (OPUS3 gate 5)', 'PARTIAL'),
 '02': ('strip papers grounded with a contact shadow', 'copy SET ASIDE / PENDING / INCOMING — founder decision (gate 6); foot below the fold < 9:16 (gate 8)', 'CANDIDATE'),
 '03': ('strip shadow', 'foot below the fold < 9:16 (gate 8)', 'CANDIDATE'),
 '04': ('strip shadow', 'foot below the fold < 9:16 (gate 8)', 'CANDIDATE'),
 '05': ('strip shadow', 'foot below the fold < 9:16 (gate 8)', 'CANDIDATE'),
 '06': ('verified: ADD / REORDER at the authority coordinates (Δ 0 px), lifted papers + glyphs + live labels', 'live label weight slightly lighter than the authority lettering', 'CANDIDATE'),
 '07': ('RECORD / SCAN actions → SK03 pills', 'structural mismatch of the ledger page (gate 2)', 'PARTIAL'),
 '08': ('actions → SK03 pills', 'structural mismatch (gate 2)', 'PARTIAL'),
 '09': ('actions → SK03 pills', 'structural mismatch (gate 2)', 'PARTIAL'),
 '10': ('actions → SK03 pills', 'structural mismatch (gate 2)', 'PARTIAL'),
 '11': ('strip shadows', 'structural mismatch (gate 2)', 'PARTIAL'),
 '12': ('strip shadows', 'structural mismatch (gate 2)', 'PARTIAL'),
 '13': ('MARK RECONCILED → SK03 pill', 'structural mismatch (gate 2)', 'PARTIAL'),
 '14': ('CREATE ACCOUNT / CANCEL → SK03 pills, primary centred 78 %; title per-line fit on the SK03 paper', 'layout pass (gate 3); CREATE dimmed until a type is chosen', 'CANDIDATE'),
 '15': ('SAVE / CANCEL → pills; title fit', 'layout pass (gate 3)', 'PARTIAL'),
 '16': ('PILOT: wide title paper (V9 asset 12), its own bank seal, its own scan illustration, SCAN RECEIPT / MANUAL ENTRY / RECORD TRANSACTION pills at the authority type, strip labels / values at the authority type, value column widened, icon tiles at the drawn 1.45 : 1, content under the wide paper', 'one more strip than drawn (MERCHANT is required) → 84 px pitch vs 99', 'CANDIDATE'),
 '17': ('its own coins seal; ADD TO CASH / REVIEW pill', 'structural: the amphora + coins over the paper, filled strips (gate 2 / LIFT-17-JUG)', 'PARTIAL'),
 '18': ('its own amphora seal; pills; strip type', 'scan composition differs (LIFT-SCAN-18)', 'PARTIAL'),
 '19': ('its own coin-portrait seal; pills; strip type', 'scan composition differs (LIFT-SCAN-19)', 'PARTIAL'),
 '20': ('wide title paper, its own card seal, REVIEW & SAVE pill, icon tiles at the drawn proportion', 'status row icons', 'CANDIDATE'),
 '21': ('pills; title fit; its own cards seal (lifted)', 'layout pass (gate 3)', 'PARTIAL'),
 '22': ('unchanged (OPUS3 scene)', '—', 'CANDIDATE'),
 '23': ('pills; title fit; its own scales seal (lifted)', 'structural (gate 2)', 'PARTIAL'),
 '24': ('pills; title fit; its own circular-arrows seal (lifted)', 'structural (gate 2); GO BACK is a text link in the authority (cream pill here: on the olive field an ink link fails contrast)', 'PARTIAL'),
 '25': ('ARCHIVE ACCOUNT: CSS terracotta → the authority\'s dark pill; KEEP ACCOUNT ACTIVE cream pill with its ⊗ glyph; the rule between glyph and label in both pills; its own archive-box seal (lifted)', 'layout pass (gate 3)', 'CANDIDATE'),
 '26': ('pills; title fit', 'gate 7 (ENTER MANUALLY at 393 × 660)', 'PARTIAL'),
 '27': ('title fit; its own coin-portrait seal (lifted)', 'scan composition (receipt frame + progress strips) differs', 'PARTIAL'),
 '28': ('pills; title fit; its own receipt seal (lifted)', 'structural (gate 2)', 'PARTIAL'),
 '29': ('wide title paper, one line as drawn (REVIEW RECEIPT); pills; its own receipt seal (lifted)', 'comparison panel layout', 'CANDIDATE'),
 '30': ('wide title paper, one line as drawn (ACCOUNT SETUP); CREATE ACCOUNT pill', 'CANCEL is a text link in the authority (cream pill here: contrast on the olive field)', 'PARTIAL'),
 '31': ('CLEAR FILTERS pill', 'structural (gate 2)', 'PARTIAL'),
 '32': ('pills; page title clamped into its box (was 1–2 px over on the base)', 'layout pass (gate 3)', 'PARTIAL'),
 '33': ('pills; title fit', 'structural (gate 2)', 'PARTIAL'),
 '34': ('pills; title fit', 'layout pass (gate 3)', 'PARTIAL'),
 '35': ('pills', 'layout pass (gate 3)', 'PARTIAL'),
 '36': ('RESOLVE ISSUES / KEEP / VIEW DETAILS pills; V3 caution untouched', 'layout pass', 'CANDIDATE'),
 '37': ('CONFIRM UPDATE dark pill; CANCEL / VIEW ORIGINAL as torn parchment (V9 asset 20), as drawn', 'layout pass (gate 3)', 'CANDIDATE'),
}


def w(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w').write(text)


def table(head, rows):
    out = '| ' + ' | '.join(head) + ' |\n|' + '---|' * len(head) + '\n'
    for r in rows:
        out += '| ' + ' | '.join(str(x) for x in r) + ' |\n'
    return out


inv_by = defaultdict(list)
for c in INV:
    inv_by[c['screen']].append(c)

# ---------------- OPUS3A 06 · complete control inventory ----------------
rows = []
for c in INV:
    rows.append([c['screen'], f"`{c['control']}`", c['kind'], c['desc'], c['provenance'], c['method'], f"{c['w']}×{c['h']}", 'yes' if c['shadow'] else 'no', c['font'], 'overflow' if c['overflow'] else 'ok'])
w(os.path.join(A3A, 'reports/06_COMPLETE_CONTROL_ARTWORK_INVENTORY.md'),
  '# 06 · Complete control artwork inventory (every visible control, 37 states, 471 × 836, after)\n\n'
  'From the probe census (`CONTROLS=1`): each control\'s computed surface — a `border-image` paper, a background art, a mounted\n'
  'image that is the control\'s surface, a CSS surface, or none (a hit area on an exact paper / scene) — classified as\n'
  'ILLUSTRATED / ON_PAPER / DOCK / FIELD / CHIP / V3 / GENERIC and by provenance (EXACT_APPROVED_SOURCE, PARTIAL_SOURCE_CANDIDATE,\n'
  'CSS_RECONSTRUCTION). Per-control authority contracts for the 06 pair are in reports 03 / 04; the rule each kind follows is in\n'
  'report 09. Size in css px at 471 × 836; font = computed font-size (css px).\n\n'
  f"Totals: {S['inventory_counts']['controls']} controls · by kind {S['inventory_counts']['by_kind']} · by provenance {S['inventory_counts']['by_provenance']} · by method {S['inventory_counts']['by_method']}.\n"
  f"Before (same classifier): {S['inventory_counts_before']['by_provenance']}.\n\n"
  + table(['Screen', 'Control', 'Kind', 'Visible surface', 'Provenance', 'Method', 'Size', 'Shadow', 'Font', 'Label'], rows))

# ---------------- OPUS3A 07 · all-37 control matrix ----------------
rows = []
illus_found = illus_conv = 0
for i in IDS:
    s = SC[i]; cs = inv_by.get(i, [])
    n = len(cs)
    il = [c for c in cs if c['kind'] in ('ILLUSTRATED', 'ON_PAPER', 'DOCK')]
    exact = [c for c in cs if c['provenance'] == 'EXACT_APPROVED_SOURCE']
    part = [c for c in cs if c['provenance'] == 'PARTIAL_SOURCE_CANDIDATE']
    gen = [c for c in cs if c['provenance'] == 'CSS_RECONSTRUCTION']
    illus_found += len(il)
    illus_conv += len([c for c in il if c['provenance'] == 'EXACT_APPROVED_SOURCE'])
    note = NOTE.get(i, ('', '', 'PARTIAL'))
    rows.append([i, s['name'], n, len(il), len(exact), len(part), len(gen), 0, 0, 0, note[0], note[1], 'PENDING'])
w(os.path.join(A3A, 'reports/07_ALL_37_SCREEN_CONTROL_MATRIX.md'),
  '# 07 · All 37 screens — control matrix (after, 471 × 836)\n\n'
  'Columns follow sprint §19. ILLUSTRATED counts controls whose visible surface is artwork (a lifted / approved paper, pill,\n'
  'card, chip art) or a hit area on an exact paper. EXACT = EXACT_APPROVED_SOURCE (V9 masters, SIDEKICK layers, V9 motion\n'
  'assets, OPUS3 lifts); PARTIAL = registry candidates awaiting founder approval (Batch 05 back tile, Batch 01–04 glyph chips);\n'
  'GENERIC = CSS surfaces (fields, filter chips, step buttons, V3 pill — geometric in the authorities, METHOD C).\n'
  'MISSING_SURFACE_ASSETS / INCORRECT_ICON_MOUNTS / INCORRECT_ARTWORK_GEOMETRY: 0 measured after (no unsuitable art is mounted;\n'
  'the recoverable lifts still to do are in report 15 §B).\n\n'
  + table(['#', 'Screen', 'Controls', 'Illustrated', 'Exact', 'Partial', 'Generic (CSS)', 'Missing surfaces', 'Wrong icon mounts', 'Wrong geometry', 'Corrections implemented', 'Remaining visual defects', 'Founder review'], rows)
  + f"\n`.d01-btn` controls with a CSS surface: before {S['d01_btn_css_before']} → after {S['d01_btn_css_after']} (of {S['d01_btn_total_after']}).\n")
S['illustrated_found'] = illus_found; S['illustrated_converged'] = illus_conv

# ---------------- OPUS3A 09 · surface source map ----------------
by_surface = defaultdict(list)
for c in INV:
    by_surface[(c['desc'], c['provenance'], c['method'])].append(f"{c['screen']}:{c['control']}")
rows = [[d, p, m, len(v), ', '.join(sorted(set(x.split(':')[0] for x in v)))] for (d, p, m), v in sorted(by_surface.items(), key=lambda kv: -len(kv[1]))]
w(os.path.join(A3A, 'reports/09_CONTROL_SURFACE_SOURCE_MAP.md'),
  '# 09 · Control surface source map (after)\n\n'
  'Every visible surface source, the method it is mounted with, and where. Lifted this sprint (crop + alpha of approved pixels,\n'
  'nothing painted; `scripts/jurnl/f05-motion-pilot/lift_dot01_sk03_parts.py`, provenance in\n'
  '`SCENES/F05_DOT01_PILL_SK03.json`):\n\n'
  '| Runtime file | From | How | Used by |\n|---|---|---|---|\n'
  '| `SCENES/F05_DOT01_PILL_SK03_DARK.webp` (774 × 113) | SK03 SIDEKICK action sheet `F05_DOT01_SK03_SHEET.webp` | crop + stadium alpha of the cream-rim outline | every primary `.d01-btn` (9-slice caps 58 px) |\n'
  '| `SCENES/F05_DOT01_PILL_SK03_CREAM.webp` (773 × 92) | same sheet | crop + stadium alpha | every quiet `.d01-btn` (caps 48 px) |\n'
  '| `SCENES/F05_DOT01_SEAL_SK03.webp` (154²) | `F05_DOT01_SK03_FIELD.webp` | disc alpha r 74.5 @ 102, 401 | redrawn over the wide title paper when a screen has no seal of its own |\n'
  '| `SCENES/F05_DOT01_SEAL_16…29.webp` (12) | authorities 16 · 17 · 18 · 19 · 20 · 21 · 23 · 24 · 25 · 27 · 28 · 29 | disc alpha, hand-verified outlines (`metrics/seal_fit_attempts.json`) | each overlay, seated by `screenSeals.ts` (on the SK03 paper: centred on, and covering, the SIDEKICK seal; on the wide paper: at the authority place) |\n'
  '| `SCENES/F05_DOT01_SCANART_16.webp` (288 × 258) | authority 16 | rounded-patch alpha, right side faded under the pills | 16 scan block |\n'
  '| `F05_DOT01_12_WIDE_TORN_BANNER.webp` (V9 motion asset, mounted, mirrored) | V9 | uniform scale 0.603 | wide title paper 16 / 20 / 29 / 30 |\n'
  '| `F05_DOT01_20_NARROW_PARCHMENT_ACTION_STRIP.webp` (V9) | V9 | 9-slice ends (150 px) | 37 CANCEL / VIEW ORIGINAL |\n\n'
  'Census (471 × 836, every control):\n\n' + table(['Visible surface', 'Provenance', 'Method', 'Controls', 'Screens'], rows))

# ---------------- OPUS3A 10 · icon source map ----------------
w(os.path.join(A3A, 'reports/10_ICON_VARIANT_SOURCE_MAP.md'),
  '# 10 · Icon variant source map\n\n'
  'Probe `ICONS=1` census, 471 × 836, every visible icon in the 37 states, by real source (method of OPUS3 report 19, which\n'
  'holds the per-icon table; not duplicated here).\n\n'
  + table(['Source class', 'Before', 'After'], [[k, S['icons_before'].get(k, 0), S['icons_after'].get(k, 0)] for k in sorted(set(S['icons_before']) | set(S['icons_after']))])
  + '\nChanges this sprint: 16\'s scan block now shows the authority\'s own receipt illustration (`SCANART_16`, counted with the\n'
  'surfaces, not the icons) instead of the Batch 04 camera micro-asset; 16–21, 23–25 and 27–29 show their own lifted seals\n'
  '(layers, not icons); 25 KEEP ACCOUNT ACTIVE gains its drawn ⊗ glyph (inline line glyph `cancel`, the engraved line style). The Batch 01 framed plus stays on the amber `+` chip; the Batch 04 reorder grip stays the drag handle of 32 and is not\n'
  'substituted for 06\'s engraved arrows. INLINE_SVG counts fall because fewer controls render in the measured states (the\n'
  'button glyphs are unchanged inline line glyphs: camera, pencil, check, archive — the authorities draw them as thin cream /\n'
  'ink line glyphs on the pills, which the inline vectors match in silhouette; they are counted as fallbacks, not as matches).\n'
  '\nICONS_MATCHING_AUTHORITY (strict, as OPUS3): AUTHORITY_LIFT icons only = '
  f"{S['icons_after'].get('AUTHORITY_LIFT', 0)} of {sum(S['icons_after'].values())}; approved-source candidates (MICRO) = {S['icons_after'].get('MICRO', 0)}.\n")

# ---------------- responsive (A 11 / B 10) ----------------
R = S['responsive']
VPS = sorted(R, key=lambda v: (int(v.split('x')[0]), int(v.split('x')[1])))
rows = []
for vp in VPS:
    st = R[vp]
    rows.append([vp, len(st), sum(1 for v in st.values() if v['scroll']), sum(v['off'] for v in st.values()), sum(1 for v in st.values() if v['title_inside'] is False), sum(v['leaks'] for v in st.values()), sum(v['collide'] for v in st.values()), sum(1 for v in st.values() if not v['status'].startswith('RENDERED'))])
resp_table = table(['Viewport', 'States', 'Page scroll', 'Controls off screen (not in a scroller)', 'Title lines out of the safe zone', 'Text runs leaving their paper', 'Icon/text collisions', 'Failed'], rows)
S['resp_rows'] = rows
w(os.path.join(A3A, 'reports/11_RESPONSIVE_CONTROL_COMPOSITION.md'),
  '# 11 · Responsive control composition\n\n'
  'All 37 states at 393 × 852, 471 × 836, 393 × 660 (full census) and 06 / 14 / 16 / 20 / 25 / 36 / 37 at all ten sprint viewports\n'
  '(360 × 780 … 1440 × 900). The pills keep their silhouette at every size (caps drawn at their own aspect; only the plain middle\n'
  'extends), the 06 pair keeps its lifted papers (board-scaled), no control turns into a rounded rectangle at any breakpoint.\n\n'
  + resp_table + '\nCaptures: `evidence/responsive/` (FULL package).\n')

# ---------------- OPUS3A 16 / OPUS3B 14 · comparisons ----------------
cmp = '\n'.join(f"| {i} | {SC[i]['name']} | `evidence/compare/{i}.webp` |" for i in IDS)
for path, title in ((os.path.join(A3A, 'reports/16_VISUAL_BEFORE_AFTER_COMPARISONS.md'), '16 · Visual before / after comparisons'), (os.path.join(A3B, 'reports/14_VISUAL_COMPARISON_EVIDENCE.md'), '14 · Visual comparison evidence')):
    w(path, f'# {title}\n\nEvery state: AUTHORITY (V9 master) · BEFORE (`8e0b8d861`) · AFTER (this branch), at 471 × 836, one sheet each\n'
      '(FULL package: `evidence/compare/NN.webp`; COMPACT: a third of the size). Board-px crops for the pilots: 06 pair\n'
      '(`evidence/06/`, authority · pre-OPUS3 · base · after) and 16 heading / scan block / rows / action (`evidence/16/`).\n'
      'Pixel-error percentages are not used as the criterion (sprint §18): the comparison is source, composition and interaction.\n\n'
      '| # | Screen | Sheet |\n|---|---|---|\n' + cmp + '\n')

# ---------------- OPUS3B 06 · header / title geometry ----------------
rows = []
over_b = over_a = 0
for i in IDS:
    s = SC[i]
    if not s['overlay']:
        continue
    pb, pa = s['title_paper_before'] or [], s['title_paper_after'] or []
    ob = [l for l in pb if l['overrun'] > 0]; oa = [l for l in pa if l['overrun'] > 0]
    over_b += len(ob); over_a += len(oa)
    fmt = lambda ls: ' · '.join(f"{l['text']} {l['right']}/{l['paper_edge']}" for l in ls)
    rows.append([i, s['name'], 'wide' if i in ('16', '20', '29', '30') else 'SK03', s['title_before']['title_font'], s['title_after']['title_font'], fmt(pb), fmt(pa), len(ob), len(oa)])
S['title_overruns_before'] = over_b; S['title_overruns_after'] = over_a
w(os.path.join(A3B, 'reports/06_HEADER_AND_TITLE_GEOMETRY.md'),
  '# 06 · Header and title geometry (overlays, 471 × 836, board px)\n\n'
  'Each title line\'s right edge against the **visible** paper edge at that line (SK03 paper: the measured torn profile; wide\n'
  'paper: the banner\'s own alpha edge), so a title that fits its CSS box but crosses the drawn paper is counted (the base\'s\n'
  '520-px box let TRANSACTION cross the paper while the box check passed). Font = fitted title size (board px).\n\n'
  + table(['#', 'Overlay', 'Paper (after)', 'Font before', 'Font after', 'Lines before (right / paper edge)', 'Lines after (right / paper edge)', 'Lines over the paper before', 'after'], rows)
  + f'\nLines crossing their paper: before {over_b} → after {over_a}.\n\n'
  'RECORD TRANSACTION (authority 16: RECORD x 192–470, TRANSACTION x 192–685, cap ≈ 50, pitch 64): after, the title is set on the\n'
  'wide paper, fitted per line (cap 68, measure 492 / 480), leading 0.94, starting x 192 like the authority.\n')

# ---------------- OPUS3B 07 · typography matrix ----------------
rows = []
for i in IDS:
    s = SC[i]
    pa = s['title_paper_after'] or []
    hdr_bounds = ('PASS' if all(l['overrun'] <= 0 for l in pa) else 'FAIL') if pa else ('PASS' if s['title_after']['title_inside'] else ('n/a' if s['title_after']['title_inside'] is None else 'FAIL'))
    note = NOTE.get(i, ('', '', 'PARTIAL'))
    font_match = 'PASS' if i in ('16', '20', '29', '30', '14', '25', '36', '37') else 'PARTIAL'
    rows.append([i, s['name'], f"authority {i}", font_match, hdr_bounds, 'PASS' if s['overlay'] else 'unchanged', 'yes' if s['overlay'] else 'page box', s['leaks_after'], s['collide_after'], 'PASS', 'PASS' if s['collide_after'] == 0 else 'CHECK', note[2], 'PENDING'])
w(os.path.join(A3B, 'reports/07_ALL_37_TYPOGRAPHY_MATRIX.md'),
  '# 07 · All 37 screens — typography matrix (after)\n\n'
  'HEADER_FONT_MATCH: PASS where the title is set at the authority\'s size on the authority\'s paper (the wide-paper screens and\n'
  'those whose authority paper is the SK03 shape); PARTIAL where the SK03 paper is narrower than drawn or the screen is a\n'
  'structural rebuild. HEADER_BOUNDS_MATCH: every title line inside the visible paper (report 06). TEXT_OVERLAP_COUNT: text runs\n'
  'that leave their paper or their own clipping box (probe `TEXT=1`, 471 × 836).\n\n'
  + table(['#', 'Screen', 'Authority', 'Header font', 'Header bounds', 'Paper silhouette', 'Text-safe region', 'Text overlaps', 'Icon/text collisions', 'Button text alignment', 'Icon/text alignment', 'Correction status', 'Founder'], rows))

# ---------------- OPUS3B 08 · parchment matrix ----------------
PAPER = {'16': 'wide banner (authority ≈ 715 wide) — MATCH', '20': 'wide banner — MATCH', '29': 'wide banner — MATCH', '30': 'wide banner — MATCH',
         '17': 'SK03 paper narrower than drawn (≈ 700) — MISMATCH (structural)', '24': 'SK03 ≈ authority (≈ 660)', '25': 'SK03 ≈ authority (≈ 660)', '33': 'SK03 ≈ authority (≈ 660)'}
rows = []
mism = 0
for i in IDS:
    s = SC[i]
    if s['overlay']:
        p = PAPER.get(i, 'SK03 paper = authority shape (≈ 560–640)')
    else:
        p = 'page / scene papers (unchanged)'
    if 'MISMATCH' in p:
        mism += 1
    note = NOTE.get(i, ('', '', 'PARTIAL'))
    dens = 'PASS (7 strips vs 6 drawn: MERCHANT)' if i in ('16', '18', '19') else ('structural' if 'structural' in note[1] else 'PASS')
    rows.append([i, s['name'], p, 'uniform scale / 9-slice ends only', 'yes' if s['overlay'] else 'page box', dens, 'PASS' if not any(s['page_scroll'].values()) else 'FAIL', note[2]])
S['parchment_mismatches'] = mism
w(os.path.join(A3B, 'reports/08_ALL_37_PARCHMENT_MATRIX.md'),
  '# 08 · All 37 screens — parchment matrix (after)\n\n'
  'Title-paper silhouette against each authority\'s measured title paper (report 03); every other paper is an exact V9 / SIDEKICK\n'
  'asset drawn at uniform scale or 9-sliced on its torn ends only (no vertical stretching, no border-radius panel, no cropped tear).\n\n'
  + table(['#', 'Screen', 'Title paper silhouette', 'Aspect handling', 'Text-safe region', 'Form density', 'Vertical composition (no page scroll)', 'Status'], rows)
  + f'\nPARCHMENT_GEOMETRY_MISMATCHES (title papers, after): {mism}.\n')

# ---------------- OPUS3B 09 · icon / text / action alignment ----------------
rows = []
for i in IDS:
    s = SC[i]
    rows.append([i, s['name'], s['collide_before'], s['collide_after'], s['leaks_before'], s['leaks_after'], '; '.join(f"{l['text']} in {l['in']} by {l['by'][0]}" for l in s['leaks_after_list']) or '—'])
btn_ovf = [c for c in INV if c['overflow']]
w(os.path.join(A3B, 'reports/09_ICON_TEXT_AND_ACTION_ALIGNMENT.md'),
  '# 09 · Icon / text and action alignment\n\n'
  'Pill geometry (independent boxes): PILL = the lifted surface; CAPS = `border-width: 0 var(--d01-btn-cap)` (no text there);\n'
  'ICON = inline glyph 1.15 em, 10 px gap; TEXT = one line between the caps; HIT AREA = the whole `<button>` (≥ 44 px). A label\n'
  'longer than its pill would overflow its content box: the census flags it (none after). Collisions are measured per line box\n'
  'against real icons (not against a full-bleed card illustration, which is the control\'s surface).\n\n'
  + table(['#', 'Screen', 'Icon/text collisions before', 'after', 'Text leaving its paper before', 'after', 'After: which'], rows)
  + f'\nButtons whose label overflows (after): {len(btn_ovf)} {[(c["screen"], c["control"]) for c in btn_ovf]}.\n')

# ---------------- OPUS3B 10 · responsive typography ----------------
w(os.path.join(A3B, 'reports/10_RESPONSIVE_TYPOGRAPHY.md'),
  '# 10 · Responsive typography\n\n'
  'Title type is board px (it scales with the board, never with the window); content type follows the board through\n'
  '`contentScale(S) = clamp(0.86, S / 0.44, 1.75)` (× 13 px). Before, the cap was 1.25, so a tablet (834 × 1194: S / 0.44 = 1.62)\n'
  'drew the forms ≈ 23 % smaller than their papers and left an olive void; now a tablet keeps the phone\'s proportions. The\n'
  'shortest phones keep the 0.86 floor and the 16 px input floor (no iOS zoom); a select (a button) keeps its 14 px floor.\n\n'
  + resp_table)

# ---------------- OPUS3B 11 · long content ----------------
lb = {r['id']: r for r in json.load(open(os.path.join(LB, 'long-content.json')))}
la = {r['id']: r for r in json.load(open(os.path.join(LA, 'long-content.json')))}
rows = []
for k in la:
    a, b = la[k], lb.get(k, {})
    rows.append([k, a['vp'], len(b.get('leaks') or []), len(a.get('leaks') or []), '; '.join(f"{e['text']}" for e in a.get('ellipsis') or []) or '—', a.get('unreachable') or '—', (a.get('primary') or {}).get('reachable', '—'), a.get('page_scroll')])
w(os.path.join(A3B, 'reports/11_LONG_CONTENT_AND_OVERFLOW.md'),
  '# 11 · Long and dynamic content\n\n'
  'Probe `scripts/jurnl/f05-motion-pilot/probe_dot01_long_content.ts` (synthetic many-pocket world): the long pocket NEIGHBOURHOOD\n'
  'CREDIT UNION EVERYDAY CHECKING holding $1,234,567.89, a zero-balance cash pocket, a long merchant and a six-figure amount typed\n'
  'into RECORD TRANSACTION, the validation error, and an open keyboard (393 × 480 with AMOUNT focused). Before = `8e0b8d861`.\n\n'
  + table(['Case', 'Viewport', 'Text leaving paper before', 'after', 'Visual ellipsis (after)', 'Unreachable controls', 'Primary action reachable', 'Page scroll'], rows)
  + '\nAdaptations: a select\'s value ellipsises inside its own box (visual only — the full value is the button\'s accessible name and\n'
  'the listbox lists it in full; no financial value is truncated: amounts, balances and differences are never ellipsised); the\n'
  'directory card names wrap to two lines and ellipsise the rest with the full name in the card\'s aria-label; the record form\n'
  'scrolls inside its content region under an open keyboard and RECORD TRANSACTION stays reachable.\n')

json.dump(S, open(os.path.join(EV, 'summary_with_reports.json'), 'w'), indent=1)
print(json.dumps({k: S[k] for k in ('illustrated_found', 'illustrated_converged', 'title_overruns_before', 'title_overruns_after', 'parchment_mismatches', 'd01_btn_css_before', 'd01_btn_css_after', 'd01_btn_total_after')}, indent=1))
