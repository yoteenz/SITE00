# Founder approval register

Nothing in this package is approved. Each decision below stays **OPEN** until the founder selects an option. Composer must not start the phase it gates before then.

## The seven review questions

| Question | Where to look |
| --- | --- |
| 1. Does this selector feel native to SITE 00? | Board 01A section 01 (A, B and C side by side on P02) |
| 2. Is the mobile interaction sophisticated without sacrificing usability? | Board 06 (keyboard, Safari toolbar, landscape, 320 px) |
| 3. Do all the form controls feel visually related? | Board 07 sections 02–04 (one type scale, one state table) |
| 4. Does the system preserve the approved Digital Foundation page design? | Board 01A section 00 (closed field unchanged); Board 02 section 04 (before and after) |
| 5. Are the error, saving and completion states visually consistent? | Board 05 |
| 6. Does the system scale across mobile, tablet and desktop? | Boards 01A and 01B; `RESPONSIVE_INTERACTION_AUTHORITY.md` |
| 7. Can Composer implement it safely without affecting intake data? | `OPUS_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md` §3 checklist |

## Decisions

| ID | Decision | Options | Opus recommendation | Gates | Boards | Status |
| --- | --- | --- | --- | --- | --- | --- |
| **FD-1** | Selector pattern: sheet vs listbox (Business Type, FC-004) | **(a)** IdntySelect: B sheet on phones, A listbox elsewhere · (b) A everywhere · (c) B everywhere · (d) C inline for Business Type | **(a)** | Phase 2 (FC-004) | 01A, 01B, 06 | **OPEN** |
| **FD-3** | Checkbox visual system (P03 services, P05 disclosures, portal preferences) | **(A)** red check, one mark everywhere · (B) red period inside an ink box | **(A)**, including portal preferences | Phase 3 (FC-027, FC-036, FC-024) | 03 | **OPEN** |
| **FD-4** | Completion surface treatment (FC-038) | **(a)** align the controls now (DfButton plus ink done marks), keep the layout; full rebuild later with Board 04 · (b) leave it until the Board 04 rebuild · (c) rebuild now | **(a)** | Phase 3 (completion CTAs) | 07 §07 | **OPEN** |
| FD-2 | Phone: optional forever, or required? (raised by the audit) | Optional (today) / required | No visual recommendation. The boards show it optional with the `OPTIONAL` tag; if required, the tag drops and the existing error pattern applies. | Field copy only | 02 | **OPEN** (carried from the audit) |
| **FD-5** | In-page progress nodes | Keep the #1573 round nodes / adopt the index strip derived from the approved drawer | Index strip | Phase 3 (DfProgress) | 04 §02 | **OPEN**. The #1573 reference board is not in the repository, so the round nodes may already be a founder choice. |
| **FD-6** | Sheet geometry for every overlay | Square with the 2 px red threshold edge / the #1573 rounded sheet with a handle | Square red-edge, unless the #1573 reference board was the founder's decision | Phase 3 (sheets); the B sheet follows whichever is chosen | 07 §06, 01A | **OPEN**, same provenance gap |

## Unresolved items (no decision needed now, tracked)

| ID | Item | Note |
| --- | --- | --- |
| U-1 | `BUSINESS_TYPES` list | `model.ts`: "Pending founder ratification". The boards use it verbatim and change nothing. |
| U-2 | Proposed copy | `UNSAVED CHANGES`, `RESTORED`, `OFFLINE — NOT SAVED`, `CONFIRM EACH ITEM TO CONTINUE`, `N ITEMS NEED ATTENTION`, `WELCOME BACK. YOUR SAVED ANSWERS ARE RESTORED.`, `SUBMITTED`, `OPTIONAL`, `CLEAR SELECTION`, `OPTIONAL · CHOOSE ONE`, the page banner lines, the toast lines. Founder voice review before shipping. |
| U-3 | DfToggle pill switch | From #1573 and unused in client flows. Proposal: keep it out of IDNTY client surfaces rather than redesign it. |
| U-4 | Restored timestamp | Needs an intake saved-at field in the client payload (an API change, out of scope). Until then RESTORED shows no time (NF-04). |
| U-5 | Admin readiness desk inputs (FC-039–041) | Out of client scope; schedule separately |
| U-6 | Device verification | No iPhone, WebKit or VoiceOver run in this sprint (`VERIFICATION_AND_RECOMMENDATIONS.md`) |

## How to answer

Reply with the IDs and choices, for example: `FD-1 a · FD-3 A · FD-4 a · FD-5 strip · FD-6 square`. Composer then updates this register to **APPROVED (founder, date)** before it implements.
