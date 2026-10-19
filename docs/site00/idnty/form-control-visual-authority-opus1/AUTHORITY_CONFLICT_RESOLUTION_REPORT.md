# Authority conflict resolution report

Sprint `P0.SITE00.IDNTY.FORM-CONTROL-FOUNDER-AUTHORITY-FINALIZATION.OPUS2`.

Every OPUS1 board and document was audited against the founder decisions FD-1 to FD-6. Each conflict below was **resolved in the canonical guidance itself**, not by appending a note. Superseded visuals stay on the boards as greyed, stamped history (`NOT APPROVED`) so the exploration remains readable.

## 1. Conflicts found and how each was resolved

| # | Conflict type (sprint §06) | Where it was | Resolution | Updated in |
| --- | --- | --- | --- | --- |
| C-01 | Territory A shown as a mobile option with equal weight | Board 01A §01, §02 (A on iPhone, A on 375 × 667) | B moved first and stamped FD-1 FOUNDER SELECTED. A-on-phone frames greyed: "ON PHONES: NOT APPROVED · A IS THE DESKTOP COMPANION". Comparison table relabelled "historical" with decision outcomes. | Board 01A; SELECTOR_TERRITORIES.md |
| C-02 | B shown as a desktop option; C as a Business Type option | Board 01B §01; Board 01A §01 | B-on-desktop and C frames greyed and stamped. C marked "reserved for justified short lists". | Boards 01A, 01B; SELECTOR_TERRITORIES.md |
| C-03 | "Opus recommends" language on the selector decision | Board 01A decision box; SELECTOR_TERRITORIES.md "Recommendation" | Replaced with the recorded founder decision | Board 01A; SELECTOR_TERRITORIES.md; README |
| C-04 | System A presented as preferred; System B as the alternative | Board 03 §01 + decision; COMPONENT_STATE_SPECIFICATIONS §1.7; register | System B is the selected authority with a full state row; System A greyed "SUPERSEDED BY FD-3". | Board 03; specs §1.6–1.9; ACCESSIBILITY_CONTRACTS C-05; register |
| C-05 | P03 service rows "locked" with the red-filled chosen check | Board 03 §02; specs §1.6; VISUAL_AUTHORITY_FOUNDATION §2 ("red check for a chosen service") | FD-3 names service selections, so the chosen mark becomes System B. Row layout, red active frame and the ink included check stay locked. This is a verified conflict between an implemented locked detail and a later explicit founder decision; the later decision wins. | Board 03; specs §1.6; foundation §2 |
| C-06 | Portal preferences, add-ons and P05 drawn with the red check | Board 03 §03; Board 04 P05 frame | Redrawn with System B. Locked and accepted marks keep ink + white check. | Boards 03, 04 |
| C-07 | Board 07 state grammar: "SELECTED · CHOSEN · red (check)" | Board 07 §04 | Row rewritten: red period in an ink-edged box (checkboxes), red period (lists), red dot (radios) | Board 07; specs |
| C-08 | Index strip promoted as the in-page progress | Board 04 §02; specs §4; handoff family map ("FD-5 outcome (index strip)") | Strip moved to "REJECTED PROPOSALS · HISTORICAL ONLY". DfProgress, drawer and rail marked FD-5 · PRESERVE. Handoff progression row now reads "no change". | Board 04; specs §4; handoff |
| C-09 | Other Board 04 proposals (back text link, blocked summary, P05 counter line, resume banner) | Board 04 §03–04; specs §4; source mapping FC-008, 021, 029 | All rejected and greyed; the implemented behaviour is shown as the authority | Board 04; specs §4; SOURCE_COMPONENT_MAPPING |
| C-10 | Board 05 severity ladder rung 02 "SECTION" = the rejected blocked summary | Board 05 §02; specs §5.2 | Rung greyed and struck: "NOT APPROVED — THE BOARD 04 BLOCKED SUMMARY WAS REJECTED (FD-5)". Ladder is now field → page → system. | Board 05; specs §5.2 |
| C-11 | P05 counter "1 OF 3 / CONFIRM 2 MORE ITEMS" (Board 04, rejected) vs legend count "2 OF 3" (Board 03, approved) | Boards 03 and 04 | Split by surface. The **legend count** is a choice-control treatment (approved under FD-3); the **CTA counter line** is a progression treatment (rejected under FD-5). | Boards 03, 04; register |
| C-12 | Completion example implying a later full rebuild "with Board 04" | Board 07 §07 note; specs §1.16; register FD-4 | Notes now say: composition preserved; a rebuild needs its own founder-approved sprint. The Board 04 link is removed (Board 04's proposals are rejected). | Board 07; specs §1.16 |
| C-13 | Sheet geometry: rounded #1573 sheet presented as an equal option | Board 07 §06; specs §1.12; tokens `--df-radius-sheet` | Rounded skin greyed "SKIN SUPERSEDED · FD-6"; peek, snap and focus behaviour kept. Square red-edge sheet approved for all sheets. | Board 07; specs §1.12; DESIGN_TOKEN_MAPPING |
| C-14 | Phone field labelled OPTIONAL | Board 02 matrix, family and before/after; Board 06 frames; kit `p02Page`; specs §1.1; source mapping FC-007 | Field is now `CONTACT NUMBER *` with the founder helper everywhere (kit `phoneField`); `OPTIONAL` and `US NUMBERS FORMAT AS YOU TYPE` removed; new state set on Boards 02 and 05 | Boards 01A, 02, 04, 05, 06, 07; specs; mapping; CONTACT_NUMBER_REQUIREMENT.md |
| C-15 | "Required is the default; only optional fields are marked. No asterisk." | specs §1.1 | Superseded for CONTACT NUMBER by the founder's `*` label. Convention for other fields opened as U-7 with a recommendation. | specs §1.1; U-7 |
| C-16 | Component tables carrying "P" (proposed) on items now approved | SOURCE_COMPONENT_MAPPING, DESIGN_TOKEN_MAPPING, Board 07 chips | Status column re-keyed: **A** (founder-approved), **I**, **L**, **R** (rejected), **U-n** | Mapping docs; Board 07 |
| C-17 | Handoff gates "Do not start before FD-1, FD-3 and FD-4" and a phase plan with the index strip | OPUS_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md | Rewritten as the finalized seven-phase handoff (§11 of the sprint) | Handoff |
| C-18 | "Nothing here is approved" / "FOUNDER REVIEW REQUIRED" banners | README, board headers and footers | Board headers now read "FOUNDER AUTHORITY INCORPORATED"; README status updated | All boards; README |
| C-19 | Status-line proposals presented as one approval unit | Board 05 §01; specs §5.1 | Split: the **marks** follow the Board 07 grammar (approved); the **new words** stay U-2 | Board 05; specs §5.1 |
| C-20 | Board 03 P05 invalid edge "after an attempt" vs the preserved disabled gate | Board 03; specs §1.7 | Appearance approved; trigger opened as U-8 (no attempt event exists while the CTA is disabled) | Board 03; specs §1.7; U-8 |

## 2. Verified conflicts the founder's decisions did not foresee

The founder asked not to reopen decisions without a verified conflict. Only two items qualify, and neither reopens a decision:

1. **P03 red check vs FD-3 (C-05).** The red-filled chosen check is implemented and appears in the founder's own P03 screenshot. FD-3 explicitly lists "service selections". Resolution: FD-3 is the later, explicit decision, so the mark changes and nothing else on the row does. Flagged here so the founder sees the consequence on the P03 page.
2. **The required marker (C-15 → U-7).** The founder copy puts an asterisk on one field. Applying it alone is correct per FD-2, but it may make the other required fields look optional. Raised as U-7 with a recommendation, not decided.

## 3. New defect found while finalizing (not a decision conflict)

**NF-06: unchecked checkbox edge contrast.**
- `site00-df-components.css` sets the `.df-check` rest edge to 1 px `#b8b6b1`.
- It loads after `site00-df-client.css` (`FoundationClient.tsx:19-20`) and overrides that sheet's 1.5 px `#8f8d88`.
- Measured live: `1px solid rgb(184, 182, 177)` (`evidence/finding-measurements.json`), which is 2.03:1 on white and under WCAG 1.4.11's 3:1.

FD-5 allows "repair verified accessibility defects". The System B rest edge on the boards uses the existing `#8f8d88` (3.32:1). Phase 1 ports it.

## 4. What was deliberately not changed

- No decision was reopened, and no OPUS1 recommendation was substituted for a founder selection.
- No production code, styles, tests, API, database or deployment was touched; boards link the live stylesheets read-only.
- Rejected visuals were not deleted: they remain on the boards as history, greyed and stamped.
- `BUSINESS_TYPES` values, intake keys, autosave and the persistence repair (#1657) are untouched.
