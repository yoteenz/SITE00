# 11 · Page-by-page responsive mapping

**Machine-readable:** `tokens/page-mappings.json`. Every row has a live specimen (`boards/src/specimen.html?<query>`) and a board.

## Overview: editorial command center (RELAXED)

| Tier | Composition | Board |
| --- | --- | --- |
| M | Header (rail 01 + title) → focus → signals 4-up (2 × 2 < 360) → active work (card rows) → movement → milestone. NEEDS YOU lives in Reviews. | D-14 phone frames, approved direction |
| TP | Focus → signal strip → needs \| movement → active work (3 columns) → milestone | TP-02 |
| TL | Focus \| needs (7 / 5) → strip → active work full width (5 columns) → milestone \| movement | TL-02 |
| D | ≥ 1100 stage: focus \| needs → strip → work (3 columns in 7fr) \| movement → milestone | D-02 |
| UW | Focus 6 \| needs 3 \| signals 2 × 2 → work \| movement → milestone | D-02 §03 |

The focus statement leads; the decision queue sits beside it; numbers support it. OPUS1's stacked hero is removed. States: loading (skeleton), empty (create first), error with technical detail (OL-20).

## Foundations registry (STANDARD)

| Tier | Columns | Notes |
| --- | --- | --- |
| M | Card rows: plate · name / category · status + time · segments | Search + icon FILTER / SORT; tabs scroll |
| TP | **CLIENT / STATUS / NEXT ACTION** | Status = state + segments + "time · step"; preview as a right sheet |
| TL | 1024: five columns; 1194 with inspector: three | No crushed toolbar (P-07 fixed) |
| D | **CLIENT / LIFECYCLE / INTAKE / NEXT ACTION / LAST ACTIVITY**; three with the inspector docked below 920 px of registry | Sort: one column, `aria-sort`. J / K / ↵ |
| UW | Five, capped widths | Remainder trails |

**Backend dependency:** INTAKE and the list-level lifecycle need the extended `list` response (**G-01**, unresolved). Until then those cells read from `detail` for the selected client only. The board marks the column G-01.

## Create client (dialog)

| Tier | Container |
| --- | --- |
| M | Full screen |
| TP / TL | Dialog min(600, 100vw − 48), keyboard-aware |
| D / UW | Dialog 600 |

The layout is the same at every tier:
- Choice of client foundation or synthetic test client.
- Business name \| contact name (two columns ≥ 480 px).
- Contact email.
- Referral source (optional).

**No success before the durable write:** CREATE → CREATING… (fields locked) → LINK READY only on confirmed persistence; otherwise NOT CREATED + RETRY with the entries kept. The duplicate-email notice is client-side only (**G-11**: the API does not reject duplicates; rejection would be a product decision).

## Client record (RELAXED)

| Tier | Composition |
| --- | --- |
| M | Back header → band → plate → title 36 → status / step → segments → quick actions 4-up → tabs (scroll) → section |
| TP | Plate + title; actions wrap below; journey **condensed** (abbreviated labels, dates); context panels below the section |
| TL | Section \| context 300–360; full labels at stage ≥ 920 |
| D | Header with actions on the baseline; **horizontal journey** (max 1180) in a progress panel; section \| 360 context column (personal link, contact, movement) |
| UW | Journey beside the status block; context 400 |

Intake (§02): grouped two-column answers. Recommendations (§03): reasoned list, manual-review flagged. Quote (§04): see below. Other sections use the same two-zone layout.

## Client intake + recommendations

Answers are grouped by intake section (business information · domain · email + services) with the save time, in a two-column `dl` from 760 px. Case-sensitive values are untransformed. Recommendations carry a reason under each line; the automated recommendation is labelled NOT YET REVIEWED.

## Client quote

The table shows ITEM / TYPE / QTY / UNIT / AMOUNT; TYPE and UNIT are hidden below 560 px. Amounts are right-aligned with tabular numerals, followed by the subtotal. The decision column holds APPROVE (OL-08), REVISE (OL-09) and versions. **Quote calculations are unchanged:** amounts are displayed from the record and never recalculated.

## Reviews workbench (STANDARD): queue / context / decision

| Stage width | Composition |
| --- | --- |
| < 640 | Queue → pushed detail; sticky bar REQUEST REVISION · APPROVE (wraps on 320) |
| 640–919 | Queue in two columns → pushed detail |
| 920–1159 | Queue \| context; decision docked as a footer |
| ≥ 1160 | **Queue \| context \| decision** (280–320 \| fluid \| 320–360; 360 \| fluid \| 400 at ≥ 1440) |

The negative outcome is REQUEST REVISION with a note; there is no reject state (FD-W15, open). States: saving, not saved (note kept).

## Operations (STANDARD): production workbench, not Kanban

| Stage width | Composition |
| --- | --- |
| < 920 | Runbook card strip → runbook header + stage rail (numbers) → task table → gate / client actions / verification |
| 920–1439 | Runbooks \| main; context as a 3-up row beneath |
| ≥ 1440 | Runbooks \| main \| context |

Task detail is the inspector (OL-12); SET BLOCKER is OL-13; MARK COMPLETE (OL-10) stays disabled while the gate is open. **G-04:** ops persistence is unresolved.

## Correspondence (STANDARD): index / thread / context

| Stage width | Composition |
| --- | --- |
| < 920 | Index → pushed thread; composer above the keyboard |
| 920–1159 | Index \| thread; context as the thread's footer |
| ≥ 1160 | Index \| thread \| context |

Thread reading width: **68ch** + padding, centred. Lifecycle email is a table with the policy banner (send disabled, dry run, **G-09**). The preview is in the inspector with SEND DISABLED BY POLICY. Templates link out to Correspondence Studio (FD-W13).

## System: compact console (COMPACT)

Verdict band (statement + chips + RE-RUN) → console rows ordered by severity → build line (names only, no secret values). From 960 px: MODULE / STATUS / AREA / DETAIL / CHECKED. From stage 1440: attention order beside. Module detail in the inspector (OL-16). **G-08:** API health and Stripe webhook probes do not exist and are shown UNVERIFIED.

## Test lab (COMPACT)

Synthetic client · journey steps (existing actions only: prepare invitation, submit intake (test) with a fictional 555-01XX number, quote ready + queue email) · email events (G-09) · continuity checks (UNVERIFIED, FD-W18). Panels: 1 / 2 / 3 columns. RESET (OL-17) requires typing RESET; SEND TEST (OL-15) requires the approval tick.
