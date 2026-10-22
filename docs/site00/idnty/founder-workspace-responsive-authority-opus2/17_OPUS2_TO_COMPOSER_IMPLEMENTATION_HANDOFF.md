# 17 · OPUS2 → Composer implementation handoff

**This sprint implements nothing.** The handoff extends OPUS1 `COMPOSER_IMPLEMENTATION_HANDOFF.md`. **Production implementation is not yet authorized:** no phase may start before the founder approves its R-items (16 §3).

## 1. Per-component mapping

Every one of the 124 components is mapped in `registry/component-registry-responsive.json` and `.csv` (`09_COMPONENT_VARIANT_MATRIX.md` is the readable view). Each row has:
- component ID, existing source, proposed source and parent;
- mobile, TP, TL, desktop and ultra-wide authority;
- typography, layout, interaction, overflow / wrapping and accessibility;
- visual acceptance boards, regression check and OPUS2 phase.

**Reference implementation of every rule:** `boards/src/ws.css`, `ws-kit.js`, `ws-pages.js` and `ws-overlays.js`. They are proposal code: port the rules, not the files. The app must never import from `docs/`.

## 2. Phases

| Phase | Scope | Components | Depends on | Acceptance |
| --- | --- | --- | --- | --- |
| **0 · Baseline + persistence protection** | Capture current admin / R7 visual baselines. Pin the persistence repair (#1657 / a99d914d): durable create, referral source, token continuity, save / resume errors. Pin the form-control implementation already on the integration branch: Phase 1 tokens / labels / NF-01 / NF-02 / C-1 (#1659) and Phase 2 `IdntySelect` sheet + listbox (#1660). Add regression tests that fail if any of these regress. | — | — | Existing suites green (`digitalFoundationArtifactHandler`, `founderReadinessE2e`, `digitalFoundationCriticalRepair` …) |
| **1 · Responsive shell + grid** | Shell grid areas, tiers, sidebar / rail / bottom nav, top bar, dock rule, short-height rule, stage container | SH-01–SH-11, SH-15 | R-02, R-03, R-04, R-05; FD-W1, FD-W6 | D-01, TP-01, TL-01 at the 16 viewports; no horizontal overflow |
| **2 · Type reflow + tokens** | Tier type tokens, tracking, wrap / truncation utilities, density classes, 10 px floor, 16 px phone inputs | SC-01–SC-18 (tokens), SH-16 | R-01, R-11; FD-W8 | C-03 measured values match `tokens/typography-tokens.json` |
| **3 · Overview + foundations** | Overview areas; registry grid with `reg` container; toolbar; registry inspector | OV-01–OV-08, FN-01–FN-10 | R-06; G-01 for INTAKE / list lifecycle (otherwise ship without those cells) | D-02, D-03, TP-02/03, TL-02/03, C-05 |
| **4 · Record + quote** | Record header, progress journey, two zones, intake / recommendations / quote | CR-01–CR-13 | — (quote display only; calculations unchanged) | D-05–D-07, TP-05, TL-05 |
| **5 · Reviews** | Workbench `wb` grid, `dec` container, sticky phone bar | RV-01–RV-07 | R-07; FD-W15 | D-08, D-09, TL-06, C-06 |
| **6 · Operations + correspondence** | Ops workbench; correspondence index / thread / context; 68ch measure | OP-01–OP-11, CO-01–CO-08 | R-08, R-09; FD-W13, FD-W16; G-04, G-09 | D-10, D-11, TP-07/08, TL-07/08 |
| **7 · System + test lab** | Console rows, verdict, attention order; lab grid | SY-01–SY-13 | R-10; FD-W7, FD-W18; G-08 | D-12, D-13, C-07 |
| **8 · Overlays + inspector** | Overlay host with per-tier container modes; inspector host; feedback host; keyboard-aware sizing; popover anchoring | OL-01–OL-20, SH-12–SH-14, SC-08/09/11/14 | R-03 | D-14, TP-10, TL-10 |
| **9 · Accessibility + multi-viewport** | Contracts in 13; port `audit-layout.mjs` checks to Playwright against the real routes (16 viewports) | all | — | 0 hard findings; axe clean; VoiceOver pass |
| **10 · Founder acceptance + visual regression** | Founder review on iPhone Safari, iPad Safari (both orientations) and desktop; screenshot baselines per board | all | Founder | Founder sign-off recorded in 16 |

## 3. Do not change (§31, carried)

The following must not change:
- Supabase schemas;
- API contracts;
- Artifact persistence;
- client tokens;
- intake state;
- quote calculations;
- payment behaviour;
- email delivery;
- operations execution logic;
- founder authentication;
- authorization boundaries.

**Do not invent API actions:** unavailable actions stay disabled with their gap id. The persistence work of PR #1657 / a99d914d and the form-control Phases 1–2 (#1659, #1660) must not be overwritten, and no outdated visual-authority branch may be used to revert newer production fixes.

## 4. Per-family regression checks

| Family | Regression |
| --- | --- |
| Shell | At 16 viewports: no document / stage overflow; inspector never docked with stage < 680; nav labels never truncated |
| Type | Computed sizes match tokens per tier; no text < 10 px; no font fallback |
| Registry | Column set per width: < 600 cards, 600–919 three, ≥ 920 five; sort single-column; no multi-select |
| Workbenches | Pane count per stage width (1 / 2 / 3); decision never shows SAVED before the server confirms |
| Overlays | Container mode per tier; max-height respects the keyboard; focus trap + return; ESC |
| Create | LINK READY only after the confirmed durable write; failure keeps entries |
