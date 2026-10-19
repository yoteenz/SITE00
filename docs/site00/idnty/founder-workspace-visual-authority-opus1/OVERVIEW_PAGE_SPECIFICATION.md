# 01 · Overview page specification

**Status:** PROPOSED. Boards 03 (mobile), 04 (desktop), 28. Registry OV-01…OV-08. Reference B (01 DIGITAL FOUNDATION).
**Route:** `/admin/site00/foundation/overview` (new; FD-W6).
**Question:** what needs me right now?

## 1. What changes from the reference

Reference B shows four metric tiles and a recent-activity list, which is a report. The founder's feedback asks for action over reporting. The overview therefore:
1. leads with **one** current focus (the oldest founder decision) and its action;
2. compresses the four metrics into one selectable **signal rail**;
3. shows active work, then movement, then the next milestone.

There is no System content and no full client list.

## 2. Zones

| Zone | Component | Content | Source |
| --- | --- | --- | --- |
| A · Identity | Page title | `01 ——` · DIGITAL FOUNDATION · "CLIENTS · PROGRESS · NEXT ACTIONS" · crown object (phone) / hero object (desktop) | — |
| B · Current focus | OV-03 | Red mark "CURRENT FOCUS · FOUNDER DECISION", age; plate + client + category; display line (e.g. "INTAKE COMPLETE — READY FOR YOUR REVIEW"); primary action; "1 OF 3 DECISIONS" | Oldest item of the §4 review queue |
| C · Signals | OV-02 | ACTIVE · NEEDS REVIEW (red when > 0) · AWAITING CLIENT · COMPLETE | DATA_CONTRACT_MAPPING.md §3 |
| D · Needs you (desktop) | OV-04 | The other decisions, oldest first, one line each | §4 queue |
| E · Active work | OV-05 | Three most relevant clients (phone) or a table (desktop): whose move, step, next action, last activity | `list` (+ G-01) |
| F · Recent movement | OV-06 | Time · mark · client · event | `detail.events` merged (G-03, memory-only) |
| G · Next milestone | OV-07 | Project nearest completion: stage rail slice + "2 OF 6 TASKS LEFT" | `pipeline` / `project-command` (G-04) |

## 3. Behaviour

- **Signal tap** filters Active Work in place (no navigation). The selected signal inverts to ink; tapping again clears it. "ALL FOUNDATIONS →" opens 02 with the same view applied.
- **Focus action** opens the review detail for that item. After a decision, the focus advances to the next decision; when none remain, the calm state reads "NOTHING NEEDS YOU · N CLIENTS MOVING".
- **Synthetic clients** are excluded from signals and lists unless the TEST filter is on (FD-W12).
- **Refresh**: on load, on window focus, and after any mutation in the workspace.

## 4. States

| State | Presentation | Board |
| --- | --- | --- |
| Loading | Skeleton focus block + four signal skeletons + three row skeletons | 24 |
| Populated | Zones A–G | 03, 04 |
| Signal selected | Inverted signal, filtered active work, "CLEAR" | 03 |
| No decisions | Calm focus (ink rule, no red) | — |
| Empty (first use) | "NO FOUNDATIONS YET." + NEW FOUNDATION (red) | 03 |
| Error | Banner "COULDN'T LOAD FOUNDATIONS" + RETRY; signals show "—", **never 0** (zero would be a false statement) | 03 |
| Stale | Banner with age after a failed refresh; previous values kept | 24 |

## 5. Data

| UI value | Source | Gap |
| --- | --- | --- |
| Signal counts | `list` derivations | Business name and industry not in list (G-01) |
| Focus item | §4 derivation over `list` + `detail` | No stored queue |
| Movement | `detail.events` | Memory-only (G-03): lost on API restart |
| Next milestone | `pipeline.next_action` | Memory ops (G-04) |

## 6. Acceptance

- The primary action is visible above the fold at 390 × 844 and at 1440 × 900.
- No metric renders "0" on a failed load.
- No System or diagnostic content appears.
- Every count matches the 02 registry view it links to.
