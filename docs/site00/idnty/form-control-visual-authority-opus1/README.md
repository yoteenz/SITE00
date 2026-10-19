# IDNTY form-control visual authority (Opus 1)

**Sprint:** `P0.SITE00.IDNTY.FORM-CONTROL-VISUAL-AUTHORITY.OPUS1`
**Status:** FOUNDER AUTHORITY INCORPORATED — IMPLEMENTATION HANDOFF READY.
- OPUS1 produced the exploration.
- **OPUS2** (`P0.SITE00.IDNTY.FORM-CONTROL-FOUNDER-AUTHORITY-FINALIZATION.OPUS2`) records founder decisions **FD-1 to FD-6 as APPROVED** and finalizes the boards, specifications and handoff around them.
- Everything else stays open in `UNRESOLVED_ITEMS_REGISTER.md`.
**Builds on:** `../form-control-authority-audit1/` (Composer audit, commit `5f4d26c3`, PR #1656)
**Branch:** `claude/digital-foundation-authority-audit-8d42xk`, cut from the integration branch `cursor/idnty-founder-readiness-e2e-be3b` at `5f4d26c3`. It later merged the integration branch at `a99d914d` (persistence repair #1657), so its diff against the integration branch is `docs/` only.
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

## The founder's decisions (OPUS2)

| ID | Decision | Boards |
| --- | --- | --- |
| **FD-1** | **Option B**, the editorial selection sheet, on mobile; **Territory A**, the anchored listbox, as the desktop companion; Territory C only for justified short lists. One `IdntySelect`. | 01A, 01B, 06 |
| **FD-2** | **CONTACT NUMBER is required**, as a backup contact for urgent account, domain or email issues. Never marketing or automated-message consent. | 02, 05 |
| **FD-3** | **System B** (red period inside an ink-edged box) for every checkbox surface, plus the compatible Board 03 proposals | 03 |
| **FD-4** | Align the completion controls; **keep the completion page composition** | 07 §07 |
| **FD-5** | **Preserve the implemented progression**; reject the index strip and the other Board 04 proposals | 04 |
| **FD-6** | **Square sheets with the 2 px red threshold edge**; no rounded floating sheets | 07 §06 |

Board 07's proposed treatments are approved under these specific decisions. Details, sources, regression coverage and dependencies are in [`FOUNDER_APPROVAL_REGISTER.md`](FOUNDER_APPROVAL_REGISTER.md).

## The idea in one paragraph

SITE 00 already ends every headline with a small red square. This package makes that **red period** the single mark for "selected", "current" and "needs attention" across every control. Inside a checkbox it sits in an ink-edged box (System B). The P03 active row's **2 px red frame** is the single sign of focus or "open". **Ink** marks anything included or done.

The closed Business Type field the founder likes stays exactly as it is. What changes is what opens:
- on phones, the square editorial selection sheet with the red threshold edge (Territory B)
- on desktop, the field's own anchored list (Territory A)

The implemented progression (rail, drawer, progress, CTAs) is untouched. There are no new colours, typefaces or data changes. The one rule change is the required CONTACT NUMBER.

## Documents

| # | File | Purpose |
| --- | --- | --- |
| 01 | `README.md` | This page |
| ★ | [`FOUNDER_APPROVAL_REGISTER.md`](FOUNDER_APPROVAL_REGISTER.md) | FD-1 to FD-6 approved: source, date, families, implementation, regression, dependencies |
| ★ | [`AUTHORITY_CONFLICT_RESOLUTION_REPORT.md`](AUTHORITY_CONFLICT_RESOLUTION_REPORT.md) | Every OPUS1 conflict with the founder decisions and how it was resolved |
| ★ | [`CONTACT_NUMBER_REQUIREMENT.md`](CONTACT_NUMBER_REQUIREMENT.md) | FD-2 field, states, validation, payload, existing-data compatibility, consent boundary, tests |
| ★ | [`UNRESOLVED_ITEMS_REGISTER.md`](UNRESOLVED_ITEMS_REGISTER.md) | U-1 to U-10, kept separate from the approved decisions |
| 02 | [`VISUAL_AUTHORITY_FOUNDATION.md`](VISUAL_AUTHORITY_FOUNDATION.md) | Authority hierarchy, locked vs implemented vs proposed, the grammar, new findings NF-01 to NF-05 and C-1 |
| 03 | [`SELECTOR_TERRITORIES.md`](SELECTOR_TERRITORIES.md) | FC-004: territories A, B and C, every state, comparison, recommendation |
| 04 | [`COMPONENT_STATE_SPECIFICATIONS.md`](COMPONENT_STATE_SPECIFICATIONS.md) | All audit family rows, every state, progression (§4), feedback (§5), findings coverage |
| 05 | [`RESPONSIVE_INTERACTION_AUTHORITY.md`](RESPONSIVE_INTERACTION_AUTHORITY.md) | Breakpoints, iPhone Safari specifics, overlay rules |
| 06 | [`ACCESSIBILITY_CONTRACTS.md`](ACCESSIBILITY_CONTRACTS.md) | Contracts C-01 to C-10 |
| 07 | [`OPUS_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md`](OPUS_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md) | **Finalized:** phases 1–7, each with files, components, contracts, visual and functional acceptance, tests, device checks, rollback and dependencies; persistence protection |
| 08 | [`FOUNDER_APPROVAL_REGISTER.md`](FOUNDER_APPROVAL_REGISTER.md) | Founder decisions (approved) |
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
