# IDNTY form-control visual authority (Opus 1)

**Sprint:** `P0.SITE00.IDNTY.FORM-CONTROL-VISUAL-AUTHORITY.OPUS1`
**Status:** VISUAL AUTHORITY COMPLETE, FOUNDER REVIEW REQUIRED. Nothing here is approved.
**Builds on:** `../form-control-authority-audit1/` (Composer audit, commit `5f4d26c3`, PR #1656)
**Branch:** `claude/digital-foundation-authority-audit-8d42xk`, cut from the integration branch `cursor/idnty-founder-readiness-e2e-be3b` at `5f4d26c3`
**Production code changed:** none. **Deployed:** nothing.

## Review this first: the boards

| Board | Image |
| --- | --- |
| 01A · Selector territories · iPhone | [`boards/board-01a-selector-territories-mobile.png`](boards/board-01a-selector-territories-mobile.png) |
| 01B · Selector territories · desktop | [`boards/board-01b-selector-territories-desktop.png`](boards/board-01b-selector-territories-desktop.png) |
| 02 · Text input system | [`boards/board-02-text-input-system.png`](boards/board-02-text-input-system.png) |
| 03 · Choice control system | [`boards/board-03-choice-control-system.png`](boards/board-03-choice-control-system.png) |
| 04 · Progression system | [`boards/board-04-progression-system.png`](boards/board-04-progression-system.png) |
| 05 · Validation + feedback | [`boards/board-05-validation-feedback.png`](boards/board-05-validation-feedback.png) |
| 06 · Mobile interaction states | [`boards/board-06-mobile-interaction-states.png`](boards/board-06-mobile-interaction-states.png) |
| 07 · Component system overview | [`boards/board-07-component-system-overview.png`](boards/board-07-component-system-overview.png) |

## The idea in one paragraph

SITE 00 already ends every headline with a small red square. This package makes that **red period** the single mark for "selected", "current" and "needs attention" across every control. It makes the P03 active row's **2 px red frame** the single sign of focus or "open". It keeps **ink** for anything included or done.

The closed Business Type field the founder likes stays exactly as it is. What changes is what opens:
- on phones, a square editorial selection sheet with the red threshold edge (Territory B)
- on desktop, the field's own anchored list (Territory A)

Everything else (checkboxes, preferences, add-ons, status line, progress) is re-presented in the same grammar on the existing component layer. There are no new colours, typefaces or data changes.

## Decisions waiting for the founder

| ID | Decision |
| --- | --- |
| **FD-1** | Selector pattern: sheet vs listbox |
| **FD-3** | Checkbox system |
| **FD-4** | Completion surface |
| FD-5 | Progress nodes (raised by this sprint) |
| FD-6 | Sheet geometry (raised by this sprint) |
| FD-2 | Phone optional (carried from the audit) |

See [`FOUNDER_APPROVAL_REGISTER.md`](FOUNDER_APPROVAL_REGISTER.md).

## Documents

| # | File | Purpose |
| --- | --- | --- |
| 01 | `README.md` | This page |
| 02 | [`VISUAL_AUTHORITY_FOUNDATION.md`](VISUAL_AUTHORITY_FOUNDATION.md) | Authority hierarchy, locked vs implemented vs proposed, the grammar, new findings NF-01 to NF-05 and C-1 |
| 03 | [`SELECTOR_TERRITORIES.md`](SELECTOR_TERRITORIES.md) | FC-004: territories A, B and C, every state, comparison, recommendation |
| 04 | [`COMPONENT_STATE_SPECIFICATIONS.md`](COMPONENT_STATE_SPECIFICATIONS.md) | All audit family rows, every state, progression (§4), feedback (§5), findings coverage |
| 05 | [`RESPONSIVE_INTERACTION_AUTHORITY.md`](RESPONSIVE_INTERACTION_AUTHORITY.md) | Breakpoints, iPhone Safari specifics, overlay rules |
| 06 | [`ACCESSIBILITY_CONTRACTS.md`](ACCESSIBILITY_CONTRACTS.md) | Contracts C-01 to C-10 |
| 07 | [`OPUS_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md`](OPUS_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md) | Family-by-family implementation map, collisions, data checklist, phases 1–4 |
| 08 | [`FOUNDER_APPROVAL_REGISTER.md`](FOUNDER_APPROVAL_REGISTER.md) | Decisions and unresolved items |
| 09 | [`VISUAL_BOARD_MANIFEST.md`](VISUAL_BOARD_MANIFEST.md) | Board paths, sizes, hashes, pipeline, reproduction |
| 10 | `boards/` | 8 PNG boards, HTML sources, renderer, finding verifier |
| 11 | [`SOURCE_COMPONENT_MAPPING.md`](SOURCE_COMPONENT_MAPPING.md) | FC-001 to FC-052, mapped to source, family, board, treatment |
| 12 | [`DESIGN_TOKEN_MAPPING.md`](DESIGN_TOKEN_MAPPING.md) | Every token used and whether it changes |
| 13 | [`VERIFICATION_AND_RECOMMENDATIONS.md`](VERIFICATION_AND_RECOMMENDATIONS.md) | What was and was not verified; recommendations |
| — | `evidence/` | Current Chromium captures and finding measurements |

## Isolation

- Board sources live under `docs/` and link the live stylesheets read-only. The application never imports them.
- `npm run build` passes, and `dist/` contains no board content.
- The proposal CSS (`boards/src/proposal.css`) is a reference for Composer, not a stylesheet to import.
