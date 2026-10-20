# 03 — Client Information Architecture

## Areas (preserved, four)

| # | Area | Purpose | Available from | Existing view id |
|---|---|---|---|---|
| 01 | OVERVIEW | Where the foundation stands and the one next step | INTAKE_COMPLETE | `OVERVIEW` |
| 02 | ROADMAP | Seven client stages; workstreams during setup | INTAKE_COMPLETE | `ROADMAP` (+ `STAGE`) |
| 03 | NEEDS YOU | Decisions, access and details only the client can give | INTAKE_COMPLETE | `NEEDS_YOU` |
| 04 | RECORDS | What exists, documented; sensitive records behind a verified view | INTAKE_COMPLETE (intake summary) | `RECORDS`, `RECORD` |

**Change from today.** The areas open at INTAKE_COMPLETE, not after payment, so the client has one persistent experience (direction 10 and 11). This is a client view-list change in `portalViewsForPayload` / `resolveDfRoute`. The server surface is not altered. P01–P03 remain the intake. P04/P05 become the PROPOSAL/ACCEPTANCE/PAYMENT pages reached from OVERVIEW and NEEDS YOU, and P06 becomes CONFIRMATION.

## Page inventory (families A–S)

| Family | Page | Reached from | View id (proposed) |
|---|---|---|---|
| A | Post-intake review | submission; OVERVIEW while INTAKE_COMPLETE / RECOMMENDATION_READY | `OVERVIEW` (review posture) |
| B | Overview | area 01 | `OVERVIEW` |
| C | Roadmap | area 02 | `ROADMAP` |
| D | Needs you · action detail | area 03 | `NEEDS_YOU`, `ACTION` (new history-state view) |
| E | Records · record detail | area 04 | `RECORDS`, `RECORD` |
| F | Save your foundation (+ approved launch on cold entry) | menu / sidebar / review page | sheet over current view; launch veil on `/foundation/return` |
| G | ~~Access card~~ | — | **RETIRED** (LOCK1). No view, no tab, no section |
| H | Secure reentry | `/foundation/return` | separate route (public) |
| I | Proposal | OVERVIEW CTA, NEEDS YOU item | `P04` (re-skinned) |
| J | Options | proposal | `P04` (options section) |
| K | Acceptance | proposal | `P05` (acceptance posture) |
| L | Awaiting payment | OVERVIEW CTA, NEEDS YOU item | `P05` (payment posture) |
| M | Payment confirmation | Stripe return | `P06` |
| N | In progress | ROADMAP, OVERVIEW | `ROADMAP` (workstreams) |
| O | Final verification | ROADMAP | `ROADMAP` (verification posture) |
| P | Completion | COMPLETE / BUILD_UPSELL surface | `OVERVIEW` (established) |
| Q | Activity | OVERVIEW link, UW status column | `ACTIVITY` (new history-state view) |
| R | Updates by email | menu / sidebar | `COMM_PREFS` |
| S | Errors / empty / blocked | anywhere | system panel |

The new view ids (`ACTION`, `ACTIVITY`) are history-state views inside `/foundation/:token`, like the existing ones. They are not paths.

## Navigation per tier

| Tier | Areas | Utilities (SAVE YOUR FOUNDATION, updates, help, sign out) |
|---|---|---|
| M 320–767 | fixed bottom bar, 4 × 64px, icon + label, NEEDS YOU badge | menu drawer (full screen) |
| TP 768–1023 | tab strip under header | menu drawer (right, 400) |
| TL 1024–1279 | 112px icon rail, label under icon | menu drawer |
| D 1280–1919 | 272px sidebar: areas 01–04, then utilities | sidebar + drawer for help/sign out |
| UW 1920+ | 312px sidebar; 420px activity column | sidebar |

Boards: X02, M20, TP01, TL01, D01, UW01.

## Global elements

- Header: SITE 00 / YOUR FOUNDATION (M) or DIGITAL FOUNDATION · YOUR FOUNDATION (TP+). TL+ shows the business name, REF and a SECURE SESSION indicator. Menu.
- Footer: SITE 00 —— IDNTY / 0xx. This is the existing grammar.
- Status as-of + REFRESH sits in the truth strip on TP+ and at the bottom on M.
- The trust line matches the posture: "NO PAYMENT IS TAKEN DURING REVIEW." / "SAFE. SECURE. ON TRACK."
