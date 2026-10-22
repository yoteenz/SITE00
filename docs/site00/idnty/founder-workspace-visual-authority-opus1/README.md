# SITE 00 · IDNTY · Founder workspace visual authority (Opus 1)

**Sprint:** `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.VISUAL-AUTHORITY-OPUS1`
**Status:** PROPOSED. Founder review required. **Nothing in this package is founder-approved**, and nothing here is wired into the application.
**Audited source:** `392ac76d5`, the integration branch `cursor/idnty-founder-readiness-e2e-be3b` including persistence fix #1657.
**Environment context:** Railway staging (frontend `carefree-luck`, API `reliable-creation`). Nothing was executed against staging for this package.

## What this is

The Digital Foundation founder surface today is seven unconnected admin pages (R1–R7). Only the Readiness Desk uses the admin shell, three of the pages print raw JSON, and about 22 admin API actions have no UI (EXISTING_SYSTEM_FORENSIC_MAP.md).

This package is the **visual authority** for one founder workspace: six destinations, a global shell, a create flow, a client record, overlays and states, on phone, tablet and desktop. It answers the founder's feedback on the previous round:

| Founder asked for | How the package responds |
| --- | --- |
| Progressive disclosure over information dumping | One verdict or focus first; detail sits in inspectors, sheets and sections, never in permanent panels |
| Action over reporting | Every page leads with the founder's next decision (focus block, review queue, task to start, the one next system action) |
| Visual hierarchy over text density | Display headlines, square status marks, phase segments and chips carry state; prose is limited to reasons and consequences |
| Contextual depth over permanent clutter | The desktop inspector exists only while something is selected; System detail opens per module |

## How to review (§45 rounds)

| Round | Boards | Decide |
| --- | --- | --- |
| A · Global shell + navigation | 01, 02 | FD-W1 mobile navigation, FD-W2 inspector model |
| B · Overview + Foundations | 03–08 | Focus-first overview, registry row, create flow |
| C · Client record + Reviews | 09–16 | Record sections, quote decision boundary, review grammar |
| D · Operations + Correspondence | 17–20 | Runbook workspace, send-policy presentation |
| E · System + Test Lab | 21–23 | Category-first diagnostics, FD-W7 Readiness Desk retirement |
| F · Shared components + responsive | 24–28 | Overlays, breakpoints, type scale (FD-W8), end-to-end flow |

Open the boards in `boards/` in order. Each board carries status chips: LOCKED, FOUNDER REFERENCE, IMPLEMENTED, PROPOSED, ALTERNATIVE, TECHNICAL CONSTRAINT, DATA GAP, FOUNDER DECISION and UNRESOLVED. **No board contains a LOCKED item other than the two-font rule, which the founder set.**

## Package contents

| # | File | Contains |
| --- | --- | --- |
| 01 | README.md | This page |
| 02 | EXISTING_SYSTEM_FORENSIC_MAP.md | Source-grounded audit: routes, pages, shell, fonts, references |
| 03 | COMPLETE_ROUTE_AND_PAGE_TREE.md | Route map (current → proposed) and the full page tree |
| 04 | COMPLETE_COMPONENT_INVENTORY.md | The §40 component registry, 124 components, 19 columns (generated) |
| 05 | COMPONENT_STATE_MATRIX.md | State sets and every component's states (generated) |
| 06 | FOUNDER_WORKSPACE_INFORMATION_ARCHITECTURE.md | Six destinations, what lives where, why |
| 07 | VISUAL_AUTHORITY_FOUNDATION.md | Fonts, tokens, type scale, status grammar, imagery rules |
| 08–10 | MOBILE / TABLET / DESKTOP_LAYOUT_AUTHORITY.md | Per-viewport layout rules |
| 11 | GLOBAL_SHELL_SPECIFICATION.md | Header, navigation, search, notifications, create, account |
| 12–18 | *_PAGE_SPECIFICATION.md, CLIENT_RECORD_SPECIFICATION.md | One spec per destination plus the client record |
| 19 | OVERLAY_AND_MODAL_INVENTORY.md | Every sheet, dialog, menu, palette and toast |
| 20 | ACCESSIBILITY_AND_INTERACTION_CONTRACTS.md | Keyboard, screen reader, focus, targets, motion, case |
| 21 | DATA_CONTRACT_MAPPING.md | Every UI value → API field; gaps G-01…G-11 |
| 22 | RESPONSIVE_COMPONENT_MATRIX.md | Component × breakpoint behaviour |
| 23 | VISUAL_BOARD_MANIFEST.md | 28 boards, sizes, hashes, audit results (generated) |
| 24 | FOUNDER_APPROVAL_REGISTER.md | Every open founder decision (FD-W1…) |
| 25 | COMPOSER_IMPLEMENTATION_HANDOFF.md | Phases 0–10 with dependencies, acceptance criteria and tests |
| 26 | COVERAGE_AND_OMISSION_REPORT.md | Every existing capability → destination (the §41 gate) |

Supporting material:
- `references/`: the founder's six mobile reference screens.
- `boards/`: 28 rendered PNG boards, `board-manifest.json`, and the board sources in `boards/src/` (static HTML/JS plus the proposal stylesheet `fw.css`).
- `registry/`: `registry_data.py` (source of truth), `build-registry.py`, `component-registry.json`, `component-registry.csv`.

## How the boards are made

`boards/render-boards.mjs` starts the repository's own Vite server, loads **real values from source** (DF icon glyphs, business types, commercial config, add-on catalog and prices, the DF threshold objects rendered by React from `objects.tsx`), and renders each `boards/src/board-NN-*.html` in Playwright Chromium at device scale 2.

The renderer audits every board: both fonts loaded, **no lowercase application text** outside `.fw-data` (case-sensitive data), and no page errors. All 28 pass (VISUAL_BOARD_MANIFEST.md).

Re-render from the repository root:

```bash
node docs/site00/idnty/founder-workspace-visual-authority-opus1/boards/render-boards.mjs        # all boards
node docs/site00/idnty/founder-workspace-visual-authority-opus1/boards/render-boards.mjs 21 22  # selected
python3 -I docs/site00/idnty/founder-workspace-visual-authority-opus1/registry/build-registry.py  # registry docs
```

`boards/src/make-shells.py` regenerates the HTML shells after a new `board-NN-*.js` module is added.

## Ground rules this package follows

- **Two fonts only:** SITE 00 Display and Saira Semi Condensed, the IDNTY intake faces (`src/site00/styles/site00-correspondence-fonts.css`). Martian Mono (admin shell) and Barlow Condensed (Correspondence Studio) are not used inside the workspace.
- **Uppercase application copy;** email addresses, domains, links, tokens, IDs, template IDs and environment names keep their case.
- **Fictional clients only:** Horizon Freight, Carter & Lane, Atelier Bloom, Summit Wellness, Field & Ember, Vela Boutique, Avery Studio, Nova Creative, and `SYNTH · Founder E2E Client`. Emails use `.invalid`. No real client appears; counts and times are layout values only.
- **No invented capability:** every live action maps to an existing admin API action. Missing actions (resend invitation, archive, revoke) are drawn as unavailable with their gap ID.
- **No secrets:** System shows environment variable names and presence only.

## What was not done (and not claimed)

- No application code, route, API, database, grant, payment, email or persistence change. The only repository changes are inside this folder.
- No live browser verification of an implemented workspace (none exists). The boards are static renders.
- No iPhone Safari device testing. Phone frames are 390 × 844 CSS px renders in Chromium.
- No email was sent. No staging data was read or modified.
