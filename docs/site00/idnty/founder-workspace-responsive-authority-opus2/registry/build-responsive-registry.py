#!/usr/bin/env python3
"""Builds the OPUS2 responsive component registry from the OPUS1 registry (124 components, ids unchanged).

Adds, per component: responsive authority for M / TP / TL / D / UW, typography, layout, interaction, overflow,
accessibility additions, OPUS2 handoff phase (0–10), visual acceptance boards and regression check.
Run from anywhere: python3 build-responsive-registry.py  → component-registry-responsive.json / .csv
"""
import csv, json
from pathlib import Path

here = Path(__file__).resolve().parent
src = here.parents[1] / 'founder-workspace-visual-authority-opus1' / 'registry' / 'component-registry.json'
base = json.loads(src.read_text())

# id: (M, TP, TL, D, UW, typography, layout, interaction, overflow, boards)
R = {
 # ── Shell ──────────────────────────────────────────────────────────────────
 'SH-01': ('top 52 + stage + bottom nav 72', 'rail 80 + top 56 + stage', 'rail 80 + stage; inspector docks ≥ 1100', 'sidebar 224 (248 ≥ 1600) + stage + inspector clamp(344,24vw,420)', 'sidebar 248 + stage (content ≤ 1760, centred) + inspector clamp(420,18vw,480)', 'tier tokens on :root', 'grid areas "nav top insp" / "nav stage insp"; stage is the `stage` container', 'skip link → stage; landmarks nav/main/aside', 'stage scrolls; shell never scrolls horizontally', 'D01 TP01 TL01 C05'),
 'SH-02': ('in MENU drawer', 'rail foot plate (opens OL-18)', 'rail foot plate', 'sidebar foot: plate + FOUNDER + ADMIN · SIGNED IN', 'same', 'name 12/700 · meta 12/500', 'flex row, meta ellipsis', 'button → OL-18 account menu', 'meta ellipsis with title', 'D01 TP01'),
 'SH-03': ('header tag 16 h', 'rail tooltip + top bar crumb', 'same as TP', 'brand tag under SITE 00', 'same', 'tag 9/700 (raised to 10 px floor)', 'inline', 'none', 'nowrap', 'D01'),
 'SH-04': ('icon → OL-04 full screen', 'icon → OL-04 palette 640', 'field clamp(200,26vw,420) + ⌘K', 'field clamp(200,26vw,420) + ⌘K', 'field 420', 'placeholder 12/500 .12em; typed value 16 (M) / 14 (D) data', 'flex; kbd fixed, text flex 1', '⌘K / / open; ↑↓ ↵ ESC', 'placeholder ellipsis allowed', 'D01 TP01 D14'),
 'SH-05': ('OL-05 bottom sheet', 'OL-05 popover 400 anchored to bell', 'popover 400', 'popover 400, flips above when short', 'same', 'act rows 14/600 + meta 12', 'list of act rows', 'focus trap; ESC; returns focus to bell', 'body scrolls inside popover', 'D01 D14 TP10 TL10'),
 'SH-06': ('centre CREATE block 46×38 in bottom nav', 'rail NEW block 48×44', 'rail NEW', 'sidebar NEW FOUNDATION (block, 40 h)', 'same', 'btn 12/600 .14em', 'block in sidebar', 'N via palette', 'never truncated (padding 12)', 'D01 D04'),
 'SH-07': ('rows in MENU drawer', 'OL-18 popover 280 from rail foot', 'same', 'OL-18 popover opening upward from sidebar foot', 'same', 'menu 11/700 .14em', 'menu rows 44 h', 'arrow keys; ESC', 'labels ellipsis + title', 'D01'),
 'SH-08': ('visible: 1fr 1.3fr 64 1fr 1fr (FOUNDATIONS fits at 320)', 'hidden', 'hidden', 'hidden', 'hidden', 'nav 10/700 .04em', 'grid row 72 + safe area', 'aria-current; badge count', 'labels never truncate (widths sized for 320)', 'D14 TP01'),
 'SH-09': ('OL-03 right drawer min(340,86vw)', 'OL-03 left drawer 320 (tools + account)', 'same', 'not used — sidebar carries tools', 'not used', 'menu 11/700', 'menu list', 'focus trap', 'scrolls', 'D14 TP01'),
 'SH-10': ('—', 'visible 80: icon + word (10/700)', 'visible 80', '—', '—', 'nav 10/700 .06em', 'column of 72×58 targets', 'aria-current; badge', 'words fit 72 (OPS, MAIL shortened in rail only)', 'TP01 TL01'),
 'SH-11': ('—', '—', '—', 'visible 224 / 248', 'visible 248', 'nav 12/700 .12em; tools 11/700 (wrap to 2 lines by design)', 'idx 22 · rule 14 · label · count', 'aria-current', 'primary labels never truncate; tools may wrap', 'D01 C04'),
 'SH-12': ('bottom sheet below the header, 2 px red edge', 'right sheet min(420,88vw) + scrim', 'docks at ≥ 1100 (340), sheet below', 'docked clamp(344,24vw,420)', 'docked clamp(420,18vw,480)', 'insp head 16/700 name; body tokens', 'flex column: head / body scroll / foot', 'ESC closes; focus returns to the row', 'body scrolls; foot fixed', 'D03 TL03 C05'),
 'SH-13': ('sheet / full / drawer / action', 'dialog / popover / palette / sheet-r / drawer', 'same as TP', 'dialog / popover / palette / inline', 'same, sizes capped', 'ov h2 min(fs-h2,30)', 'per-family container (data-m/t/d)', 'focus trap, ESC, inert background', 'body scroll, sticky head/foot', 'D14 TP10 TL10'),
 'SH-14': ('toast above bottom nav (12 inset)', 'bottom-left of stage, ≤ 440', 'same', 'bottom-left of stage, 440', 'same', 'toast 11/700', 'single toast', 'role=status / alert', 'text wraps (2 lines max)', 'D14'),
 'SH-15': ('< 768', '768–1023', '1024–1279', '1280–1919', '≥ 1920', 'switches tier tokens', 'media queries for the shell; container queries for pages', '—', '—', 'D01 C03'),
 'SH-16': ('rail index + title clamp(40,13.3vw,50)', 'title 48 (index rail hidden; crumb carries it)', 'title 48 (44 when height ≤ 860)', 'title 52 (44 when height ≤ 860)', 'title 60', 'display 900, lh .86, balance', 'grid: title block | actions; object ≤ 104 tall', 'h1 per page', 'balance; never ellipsis', 'D02 C03 C04'),
 # ── Overview ───────────────────────────────────────────────────────────────
 'OV-01': ('focus · signals · work · movement · milestone', 'focus · signals · needs | movement · work · milestone', 'stage 944: 7/5 grid, work full width', 'stage ≥ 1100: focus | needs · signals · work | movement', 'stage ≥ 1440: focus | needs | signals · work | movement', 'relaxed density', 'grid-template-areas per stage tier', 'J/K not used; links', 'no horizontal scroll', 'D02 TP02 TL02'),
 'OV-02': ('4-up (2×2 below 360)', '4-up strip', '4-up strip', '4-up strip', '2×2 block beside the queue', 'numeral 30/34/40/44; label 10–12', 'grid; bars 2 px', 'each cell links to a filtered registry', 'labels nowrap except phone', 'D02 C04'),
 'OV-03': ('card: label, identity, statement, CTA', 'card full width', 'card 7fr', 'card 7fr: identity + statement top, CTA row bottom', 'card 6fr', 'statement fs-statement+2 (26–34), ≤ 22ch', 'grid rows auto auto 1fr auto', 'one primary CTA', 'statement balance', 'D02 C04'),
 'OV-04': ('hidden (Reviews tab owns it)', 'panel beside movement', 'panel 5fr', 'panel 5fr', 'panel 3fr', 'name 14/700 · meta 12', 'q-item rows', 'rows link to the review', 'names ellipsis + title', 'D02'),
 'OV-05': ('registry card rows', 'registry CLIENT/STATUS/NEXT', 'registry 5 columns (full width)', 'registry 3 columns in 7fr (5 columns ≥ 1300 px of width)', 'registry 5 columns', 'registry tokens', 'reg container decides columns', 'row → record', 'see FN-05', 'D02'),
 'OV-06': ('panel', 'panel beside needs', 'panel', 'panel 5fr beside work', 'panel 3fr', 'act 14/600 + meta 12', 'act rows', 'none', 'sub-lines wrap', 'D02'),
 'OV-07': ('panel', 'panel', 'panel', 'panel under work', 'panel', 'stage label 11/700', 'stage rail 7 cells (numbers only < 700 px)', 'none', 'labels clamp 2 lines', 'D02'),
 'OV-08': ('inline states', 'same', 'same', 'same', 'same', 'empty h2', 'empty / loading skeleton / error + OL-20', 'RETRY', '—', 'D02'),
 # ── Foundations ────────────────────────────────────────────────────────────
 'FN-01': ('search + filter/sort icons · tabs · card rows', 'search row · tabs row · CLIENT/STATUS/NEXT', '1024: toolbar one row · 5 columns; 1194 + inspector: 3 columns', 'toolbar one row · 5 columns (3 with inspector)', '5 columns with capped widths; extra space trails', 'standard density', 'reg container: < 600 cards · 600–919 three · ≥ 920 five', 'J/K/↵ / ⌘K; single-column sort', 'no horizontal scroll at any width', 'D03 TP03 TL03 C05'),
 'FN-02': ('field 44 h, icon + text', 'field 44 h', 'field 40 h, 260–340', 'field 40 h, 260–340', 'same', 'typed value 16 (M) / 14 data', 'grid area search', '/ focuses; ESC clears', 'placeholder ellipsis', 'D03'),
 'FN-03': ('scrolling tabs + fade', 'own row, scroll + fade', 'beside search', 'beside search', 'beside search', 'tab 10–12/700 .16em; counts 10', 'scroll strip, mask fade 28', 'arrow keys (tablist)', 'scroll, never crushed', 'D03 C03'),
 'FN-04': ('OL-07 sheet', 'OL-07 popover 360 below FILTER', 'same', 'same', 'same', 'choice 14/700', 'popover', 'APPLY / RESET', 'body scroll', 'D03 D14'),
 'FN-05': ('card: plate · name/cat · status + time · segments', 'CLIENT · STATUS (state, segments, time · step) · NEXT (owner + action)', 'five columns', 'five or three by width', 'five, capped', 'name 14/700 .1em · body 14/600 · meta 12', 'grid row, 56 h standard', 'row is a link; ⋯ menu', 'name ellipsis + title; status wraps ≤ 2 lines; next action clamp 2', 'D03 C03 C05'),
 'FN-06': ('push to record', 'right sheet (OL-19)', 'sheet < 1100, docked ≥ 1100', 'docked', 'docked', 'name 16/700; journey abbreviated', 'insp head/body/foot', 'ESC; ↵ opens record', 'email nowrap ellipsis + title', 'D03 C05'),
 'FN-07': ('OL-01 full screen', 'OL-01 dialog min(600, 100vw−48)', 'dialog 600, keyboard-aware', 'dialog 600', 'dialog 600', 'h2 30; fields 15–16', 'two-column name row at ≥ 480 px', 'focus → BUSINESS NAME; ENTER submits from last field', 'body scroll, sticky footer', 'D04 TP04 TL04'),
 'FN-08': ('banner in form', 'same', 'same', 'same', 'same', 'banner 12/600', 'inline', 'none', 'wraps', 'D04'),
 'FN-09': ('inline', 'inline', 'inline', 'inline', 'inline', '—', 'empty / loading rows / stale banner', 'CLEAR SEARCH, RETRY', '—', 'D03'),
 'FN-10': ('OL-06 action sheet', 'OL-06 popover 280 anchored to ⋯', 'same', 'same', 'same', 'menu 11/700', 'menu', 'arrow keys; unavailable items aria-disabled with reason', 'labels ellipsis', 'D03 D14'),
 # ── Client record ─────────────────────────────────────────────────────────
 'CR-01': ('header · progress · tabs · section · context below', 'same, actions under name', 'two zones: section | context 300–360', 'two zones: section | 360', 'section | 400', 'relaxed', 'rec-body grid', 'tabs; ⋯ menu', 'no horizontal scroll', 'D05 TP05 TL05'),
 'CR-02': ('plate · title 36 · cat + email', 'plate | title + sub; actions row', 'same', 'plate | title + sub | actions (one baseline)', 'same', 'title fs-title − 6', 'grid areas', 'h1', 'email wraps anywhere (data)', 'D05'),
 'CR-03': ('4-up icon buttons (62 h, 2-line allowed)', 'out buttons sm, wrap', 'same', 'out buttons sm', 'same', 'btn 12/600', 'flex', 'unavailable shown disabled with gap id', 'labels never truncate', 'D05'),
 'CR-04': ('abbreviated labels + dates', 'abbreviated', 'full labels (stage ≥ 920)', 'full labels, max 1180', 'beside status column (300 + journey)', 'label 11/700 .1em; date 10', 'grid 8 columns, fixed rhythm', 'aria-current=step', 'labels nowrap', 'D05 C04'),
 'CR-05': ('card', 'card', 'card', 'card with two CTAs', 'card', 'statement 30', 'grid', 'primary + secondary CTA', 'balance', 'D05'),
 'CR-06': ('groups, one column', 'groups, one column', 'groups, two columns (≥ 760 px)', 'two columns', 'two columns', 'kv: dt 11/700 · dd 14/600', 'ans-group + ans-grid', 'none', 'data wraps anywhere', 'D06 TP05'),
 'CR-07': ('list with reasons', 'same', 'same', 'same', 'same', 'name 14/700 · reasons 12', 'rec-item grid', 'none', 'wraps', 'D06'),
 'CR-08': ('table (type + unit hidden < 560) + decision below', 'same', 'table | decision 320', 'table | decision 320', 'same', 'tabular numerals; totals 15/700', 'qt-wrap grid', 'APPROVE (OL-08), REVISE (OL-09)', 'amounts nowrap', 'D07 TP05 TL05'),
 'CR-09': ('stage numbers + tasks', 'same', 'stage labels + tasks', 'same', 'same', 'task tokens', 'see OP-03/OP-04', 'opens Operations', '—', 'D05'),
 'CR-10': ('list + OL-10 full', 'panel + OL-10 dialog', 'same', 'same', 'same', '—', 'panel', 'MARK COMPLETE gated', '—', 'D10'),
 'CR-11': ('thread', 'thread', 'thread', 'thread (68ch)', 'same', 'read 15–16', 'see CO-03', 'composer', '—', 'D11'),
 'CR-12': ('list', 'list', 'list', 'list', 'list', 'act tokens', 'act rows', 'none', '—', 'D05'),
 'CR-13': ('scrolling tabs (8)', 'scrolling tabs', 'all 8 visible at 944', 'all 8 visible', 'same', 'tab tokens', 'scroll strip', 'tablist', 'scroll, never crushed', 'D05 TP05'),
 # ── Reviews ───────────────────────────────────────────────────────────────
 'RV-01': ('queue → pushed detail + sticky bar', 'queue in two columns → pushed detail + sticky bar', 'queue | context, decision footer', 'stage ≥ 1160: queue | context | decision', 'queue 360 | context | decision 400', 'standard', 'wb grid (stage container)', 'J/K; ↵ opens', 'panes scroll independently', 'D08 TP06 TL06 C06'),
 'RV-02': ('scrolling tabs', 'scrolling tabs', 'tabs', 'tabs', 'tabs', 'tab tokens', 'strip', 'tablist', 'scroll', 'D08'),
 'RV-03': ('q-item', 'q-item (2-up)', 'q-item', 'q-item', 'q-item', 'name 14/700', 'grid', 'option role in listbox', 'ellipsis + title', 'D08'),
 'RV-04': ('pushed page', 'pushed page', 'context pane', 'context pane', 'context pane (kv two columns ≥ 720)', 'kv tokens', 'ctx container', 'OPEN RECORD', 'data wraps', 'D09'),
 'RV-05': ('sticky bar: REQUEST REVISION · APPROVE (wraps at 320)', 'same', 'footer grid: choices | note | CTA (dec ≥ 560)', 'pane: stacked choices, note, CTA', 'same', 'choice 14/700', 'dec container', 'radio group; CONFIRM; never SAVED before the server', 'buttons wrap rows, never truncate', 'D09 TL06 C06'),
 'RV-06': ('tab', 'tab', 'tab', 'tab', 'tab', '—', 'list', '—', '—', 'D08'),
 'RV-07': ('inline', 'inline', 'inline', 'inline', 'inline', '—', 'saving / not saved / empty', 'RETRY', '—', 'D09'),
 # ── Operations ────────────────────────────────────────────────────────────
 'OP-01': ('runbook strip · main · context below', 'same', 'runbooks | main; context 3-up below', 'stage < 1440: runbooks | main; context 3-up below', 'runbooks | main | context', 'standard', 'ops grid (stage container)', 'J/K tasks', 'no horizontal scroll', 'D10 TP07 TL07'),
 'OP-02': ('horizontal card strip', 'card strip', 'list 280', 'list 280–300', 'list 320', 'name 14/700', 'proj rows: plate | who / status / segments', 'select', 'name ellipsis', 'D10'),
 'OP-03': ('numbers only', 'numbers only', 'labels (2-line clamp)', 'labels', 'labels', 'stage 11/700 .1em', '7-column grid', 'aria-current', 'numbers-only below 700 px of width', 'D10 C04'),
 'OP-04': ('row: box · title/key · mode + status stacked', 'same', 'row', 'row (text ≤ 480, status after)', 'same', 'name 14/700 · key 12 (data case)', 'task grid', 'select → OL-12', 'title ellipsis + title', 'D10'),
 'OP-05': ('OL-12 sheet', 'sheet', 'docked ≥ 1100', 'docked', 'docked', 'insp tokens', 'insp', 'MARK COMPLETE / BLOCK', 'body scroll', 'D10 TL07'),
 'OP-06': ('list', 'list', 'list', 'segmented view', 'same', '—', '—', 'segmented control', '—', 'D10'),
 'OP-07': ('panel', 'panel', '3-up row', 'side column at stage ≥ 1440', 'side', 'meta 12', 'panel', 'none', 'keys ellipsis', 'D10'),
 'OP-08': ('panel', 'panel', '3-up row', 'side', 'side', '—', 'panel', 'none', '—', 'D10'),
 'OP-09': ('OL-13 sheet', 'OL-13 dialog 500', 'dialog', 'dialog', 'dialog', '—', 'dialog', 'SET BLOCKER', '—', 'D10 TP07'),
 'OP-10': ('sheet', 'dialog', 'dialog', 'dialog', 'dialog', '—', 'dialog', '—', '—', 'D10'),
 'OP-11': ('sheet', 'dialog', 'dialog', 'inspector', 'inspector', '—', '—', '—', '—', 'D10'),
 # ── Correspondence ────────────────────────────────────────────────────────
 'CO-01': ('index → pushed thread', 'index → pushed thread', 'index | thread', 'index | thread | context (stage ≥ 1160)', 'same; thread stays 68ch centred', 'standard; read 15–16', 'wb grid', 'J/K threads', 'panes scroll', 'D11 TP08 TL08'),
 'CO-02': ('list', 'list', 'list', 'table', 'table', '—', '—', '—', '—', 'D11'),
 'CO-03': ('thread + composer above keyboard', 'same', 'thread pane', 'thread pane, max 68ch + 96', 'same', 'read 15/400 sentence case (user text)', 'flex column', 'composer ↵ newline, ⌘↵ send', 'messages wrap; never wider than 88%', 'D11 TP08'),
 'CO-04': ('table in a scrolling panel', 'same', 'table', 'table', 'table', 'body 14/600; trigger data', 'table', 'row → preview', 'panel scrolls horizontally if needed', 'D11 TP08'),
 'CO-05': ('sheet', 'sheet', 'docked ≥ 1100', 'docked', 'docked', '—', 'insp', '—', '—', 'D11'),
 'CO-06': ('OL-15 sheet', 'OL-15 dialog 540', 'dialog', 'dialog', 'dialog', '—', 'dialog', 'approval tick per send (FD-W16)', '—', 'D13'),
 'CO-07': ('row', 'button', 'button', 'header button', 'same', '—', '—', 'opens Studio', '—', 'D11'),
 'CO-08': ('row', 'kv', 'kv', 'context pane kv', 'same', '—', '—', '—', '—', 'D11'),
 # ── System ────────────────────────────────────────────────────────────────
 'SY-01': ('tabs · verdict · console rows', 'same', 'full console row at ≥ 960', 'console + attention order beside at stage ≥ 1440', 'same', 'compact density', 'sys-grid', 'module → OL-16', 'no horizontal scroll', 'D12 TP09 TL09 C07'),
 'SY-02': ('band, chips wrap', 'band', 'band + chips right (≥ 760)', 'same', 'same', 'statement ≤ 26', 'verdict grid', 'RE-RUN REPORT', 'chips wrap', 'D12'),
 'SY-03': ('row: icon · module + detail · status', 'same', 'MODULE / STATUS / AREA / DETAIL / CHECKED', 'same', 'same', 'name 14/700 · detail 12', 'con grid (own container)', 'select row', 'detail ellipsis on narrow, wraps on wide', 'D12 C07'),
 'SY-04': ('console rows', 'same', 'same', 'same', 'same', '—', 'con', '—', '—', 'D12'),
 'SY-05': ('console rows', 'same', 'same', 'same', 'same', '—', 'con', '—', '—', 'D12'),
 'SY-06': ('console rows', 'same', 'same', 'same', 'same', '—', 'con', '—', '—', 'D12'),
 'SY-07': ('stacked', 'stacked', 'console', 'console', 'console', '—', 'con', '—', '—', 'D12'),
 'SY-08': ('details in sheet', 'details in sheet', 'details in inspector', 'details', 'details', 'names only, data case', 'kv', 'expand', 'names ellipsis + title', 'D12'),
 'SY-09': ('line', 'line', 'line', 'line', 'line', 'meta 12 + data', '—', '—', 'wraps', 'D12'),
 'SY-10': ('panel', 'panel', '2-up', '2-up', '3-up', '—', 'lab grid', 'CREATE TEST CLIENT', '—', 'D13'),
 'SY-11': ('panel', 'panel', '2-up', '2-up', '3-up', '—', 'task rows', 'RUN per step (existing actions only)', '—', 'D13'),
 'SY-12': ('panel', 'panel', '2-up', '2-up', '3-up', '—', 'act rows', 'SEND TEST (OL-15)', '—', 'D13'),
 'SY-13': ('panel', 'panel', '2-up', '2-up', '3-up', '—', 'rows + chips', 'none (UNVERIFIED)', '—', 'D13'),
 # ── Shared components ─────────────────────────────────────────────────────
 'SC-01': ('44 / 64 / 36 / 30', 'same', 'same', 'same', 'same', 'display 900 initials', '—', 'aria-hidden (name is text)', '—', 'D15'),
 'SC-02': ('mark 7 + label 10/700', 'label 11', 'label 11', 'label 11', 'label 12', 'label .14em', 'flex, mark aligned to first line', '—', 'wraps ≤ 2 lines, never ellipsis', 'D15'),
 'SC-03': ('segments + abbreviated journey', 'abbreviated', 'full ≥ 920', 'full, max 1180', 'same', 'label 11/700', 'grid 8', 'aria-current', 'nowrap labels', 'D15 C04'),
 'SC-04': ('chip 22 h, 10/700', 'same', 'same', 'same', 'same', '10/700 .12em', '—', '—', 'nowrap', 'D15'),
 'SC-05': ('time 52 · mark · text', 'same', 'same', 'same', 'same', 'body 13–15 · meta 11–12', 'grid', '—', 'wraps', 'D15'),
 'SC-06': ('44 h (36 sm, 30 xs), 11 px', '44 h', '44 h', '40 h (34 sm, 30 xs), 12 px', 'same', 'btn .18em (.14 sm)', 'width by content; block only in footers', 'focus ring 2 px red', 'single line, never truncated', 'D15 C04'),
 'SC-07': ('46 h, 16 px input', '46 h, 15 px', '46 h, 15 px', '42 h, 14 px', 'same', 'label 10–12/700; value data case', 'FD-1…FD-6 grammar', 'aria-invalid / describedby', 'value ellipsis; textarea wraps', 'D15'),
 'SC-08': ('action sheet', 'popover', 'popover', 'popover', 'popover', 'menu 11/700', 'menu', 'arrow keys', 'ellipsis + title', 'D14'),
 'SC-09': ('bottom sheet, square, 2 px red edge (FD-6)', 'right sheet', 'right sheet', '—', '—', '—', '—', 'focus trap', 'body scroll', 'D14'),
 'SC-10': ('scroll strip', 'scroll strip', 'scroll strip', 'inline', 'inline', 'tab 10–12/700', 'strip + fade', 'tablist / radiogroup', 'scroll', 'D15'),
 'SC-11': ('sheet or full screen', 'dialog min(w, 100vw−48)', 'same, keyboard-aware', 'dialog, max h min(100dvh−96, 820)', 'same', 'h2 ≤ 30', 'head / body / foot', 'focus trap; ESC', 'body scroll', 'D14'),
 'SC-12': ('dashed panel', 'same', 'same', 'same', 'same', 'h2', '—', 'one action', '—', 'D02 D03'),
 'SC-13': ('skeleton rows', 'same', 'same', 'same', 'same', '—', '—', 'aria-busy', '—', 'D02'),
 'SC-14': ('above bottom nav', 'stage bottom-left', 'same', 'same', 'same', '11/700', '—', 'status / alert', 'wraps', 'D14'),
 'SC-15': ('banner + details', 'same', 'same', 'same, max 760', 'same', '12/600', '—', 'RETRY; details', 'wraps', 'D02'),
 'SC-16': ('crown ≤ 104 h in title', 'same', 'same', 'right of header, ≤ 104 h', 'same', '—', 'absolute, aria-hidden', '—', 'never overlaps content', 'D02 D12'),
 'SC-17': ('dt 34% / dd', 'same', 'two columns ≥ 720', 'same', 'same', 'dt 11/700 · dd 14/600', 'grid', '—', 'data wraps anywhere', 'D15'),
 'SC-18': ('44 h block', 'same', 'same', 'same', 'same', 'code 13 data', 'flex', 'COPY', 'ellipsis + full value on copy', 'D05'),
}

# Overlay families: container per tier (matches ws-overlays.js).
OL = {
 'OL-01': ('full', 'dialog 600', 'dialog 600', 'dialog 600'), 'OL-02': ('full', 'dialog 560', 'dialog 560', 'dialog 560'),
 'OL-03': ('drawer right', 'drawer left 320', 'drawer left 320', 'n/a (sidebar)'), 'OL-04': ('full + keyboard', 'palette 640', 'palette 640', 'palette 680'),
 'OL-05': ('sheet', 'popover 400', 'popover 400', 'popover 400'), 'OL-06': ('action sheet', 'popover 280', 'popover 280', 'popover 280'),
 'OL-07': ('sheet', 'popover 360', 'popover 360', 'popover 360'), 'OL-08': ('sheet', 'dialog 500', 'dialog 500', 'dialog 500'),
 'OL-09': ('full', 'dialog 720', 'dialog 720', 'dialog 720'), 'OL-10': ('full', 'dialog 560', 'dialog 560', 'dialog 560'),
 'OL-11': ('sheet + keyboard', 'dialog 520', 'inline decision footer', 'inline decision pane'), 'OL-12': ('inspector sheet', 'inspector sheet', 'inspector docked ≥ 1100', 'inspector docked'),
 'OL-13': ('sheet', 'dialog 500', 'dialog 500', 'dialog 500'), 'OL-14': ('inline composer + keyboard', 'inline composer', 'inline composer', 'inline composer'),
 'OL-15': ('sheet', 'dialog 540', 'dialog 540', 'dialog 540'), 'OL-16': ('inspector sheet', 'inspector sheet', 'docked ≥ 1100', 'docked'),
 'OL-17': ('sheet + keyboard', 'dialog 500', 'dialog 500', 'dialog 500'), 'OL-18': ('in MENU drawer', 'popover 280 from rail foot', 'popover 280', 'popover 280, opens upward'),
 'OL-19': ('push to record', 'inspector sheet', 'sheet < 1100 / docked', 'docked'), 'OL-20': ('inline details', 'inline details', 'inline details', 'inline details, max 760'),
}
for k, (m, t, tl, d) in OL.items():
    R[k] = (m, t, tl, d, d, 'ov h2 ≤ 30; body tokens', f'container modes data-m/t/d (see INSPECTOR_AND_OVERLAY_RESPONSIVENESS.md)', 'focus trap · ESC · return focus · inert background', 'max-height = viewport − margins − keyboard; body scrolls; head and foot sticky', 'D14 TP10 TL10')

PHASE = {'SH': 1, 'OV': 3, 'FN': 3, 'CR': 4, 'RV': 5, 'OP': 6, 'CO': 6, 'SY': 7, 'SC': 2, 'OL': 8}
PHASE_OVERRIDE = {'SH-12': 8, 'SH-13': 8, 'SH-14': 8, 'SH-16': 2, 'SY-10': 7, 'SY-11': 7, 'SY-12': 7, 'SY-13': 7}

cols = ['COMPONENT ID', 'PAGE FAMILY', 'COMPONENT NAME', 'EXISTING SOURCE PATH', 'PROPOSED SOURCE PATH', 'PARENT COMPONENT',
        'MOBILE (<768)', 'TABLET PORTRAIT (768–1023)', 'TABLET LANDSCAPE (1024–1279)', 'DESKTOP STANDARD (1280–1919)', 'DESKTOP ULTRA-WIDE (≥1920)',
        'TYPOGRAPHY', 'LAYOUT', 'INTERACTION', 'OVERFLOW / WRAPPING', 'ACCESSIBILITY', 'VISUAL ACCEPTANCE (BOARDS)', 'REGRESSION CHECK', 'OPUS2 PHASE', 'STATUS']
rows = []
missing = []
for c in base['components']:
    r = R.get(c['id'])
    if not r:
        missing.append(c['id'])
        continue
    m, tp, tl, d, uw, ty, lay, inter, ovf, boards = r
    ph = PHASE_OVERRIDE.get(c['id'], PHASE[c['id'].split('-')[0]])
    rows.append({
        'id': c['id'], 'family': c['family'], 'name': c['name'], 'existing': c['existing'], 'proposed': c['proposed'], 'parent': c['parent'],
        'mobile': m, 'tablet_portrait': tp, 'tablet_landscape': tl, 'desktop': d, 'ultrawide': uw,
        'typography': ty, 'layout': lay, 'interaction': inter, 'overflow': ovf,
        'a11y': c['a11y'], 'boards': boards,
        'regression': f"audit-layout.mjs: 0 hard findings for every state rendering {c['id']} at the 16 viewports; visual baseline per board {boards.split()[0]}",
        'phase': ph, 'status': 'RESPONSIVE REFINEMENT · PROPOSED',
    })
assert not missing, missing
out = {'status': 'PROPOSED — founder visual review required; production implementation not authorized', 'source': 'OPUS1 component-registry.json (ids unchanged)', 'columns': cols, 'count': len(rows), 'components': rows}
(here / 'component-registry-responsive.json').write_text(json.dumps(out, indent=2, ensure_ascii=False) + '\n')
keys = ['id', 'family', 'name', 'existing', 'proposed', 'parent', 'mobile', 'tablet_portrait', 'tablet_landscape', 'desktop', 'ultrawide', 'typography', 'layout', 'interaction', 'overflow', 'a11y', 'boards', 'regression', 'phase', 'status']
with open(here / 'component-registry-responsive.csv', 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(cols)
    for r in rows:
        w.writerow([r[k] for k in keys])
print(len(rows), 'components')
