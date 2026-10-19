# 03 · Reviews page specification

**Status:** PROPOSED. Boards 13, 14 (queue), 15, 16 (detail). Registry RV-01…RV-07. References E (03 REVIEWS) and F (review detail).
**Routes:** `/admin/site00/foundation/reviews?tab=`, `/admin/site00/foundation/reviews/:kind/:id` (new).
**Question:** what must I decide?

## 1. The queue is derived

There is **no queue table and no review flag** on the artifact. The queue is the union of derivation rules in DATA_CONTRACT_MAPPING.md §4.
- Each item carries its own source and timestamp.
- Urgency is never invented: there are no deadlines and no priority scores.
- Order is oldest first.

| Tab | Rule (summary) | Primary action | API |
| --- | --- | --- | --- |
| INTAKES | Intake complete / recommendation ready, quote not commercially ready | REVIEW INTAKE | none (opens record); then `update-quote` |
| RECOMMEND | `recommendation.manual_review = true` | REVIEW | `update-quote` (selections) |
| QUOTES | Quote READY / CLIENT_REVIEW and `founder_commercial_ready = false`; or payability MANUAL_REVIEW_PENDING / CUSTOM_PRICING_PENDING | REVIEW QUOTE → APPROVE / REVISE | `quote-commercial-ready`, `manual-adjustment` / `update-quote` |
| REQUESTS | Approvals REQUESTED (client REQUEST_CHANGE), open client actions needing a founder response | REVIEW REQUEST → APPROVE CHANGE / REQUEST REVISION | `approval-resolve` (G-04) |
| EXCEPTIONS | Tasks BLOCKED or FAILED verification; payment FAILED / DISPUTED; completion-gate failures | OPEN EXCEPTION (outline) | `escalate-task`, `set-blocker`, `verify-task` |
| HISTORY | Resolved approvals, quotes marked ready, verified tasks | read-only | events (G-03) |

Reference E's ACTIONS tab maps to REQUESTS. Reference E has no RECOMMEND tab, and RECOMMEND appears only when manual-review items exist.

## 2. Queue item

Each item is:
- plate (red edge) + client + "TYPE REVIEW" + age;
- a "why it needs you" line with its mark: red for decisions, hollow red for exceptions;
- one sub-line of evidence;
- **one** full-width primary action, ink for decisions and outline for exceptions.

Colour carries meaning, not decoration. On desktop the queue is a table: CLIENT · REVIEW · WHY IT NEEDS YOU · WAITING · LAST EVENT · action. Selection opens the inspector with OPEN FULL REVIEW.

## 3. Detail: understand → compare → decide → confirm

| Step | Phone (board 15) | Desktop (board 16) |
| --- | --- | --- |
| Understand | Header: plate, name, category, status, age, eight-phase journey | Header + "why" block |
| Compare | Tabs OVERVIEW · INTAKE · RECOMMEND · NOTES; evidence rows (client information, business, domain and email, recommended services, generated quote) open as sheets | Two panels side by side: what the client asked for vs what the quote proposes (or the current vs the requested version) |
| Decide | Fixed bar: ADD NOTE · DECIDE → decision sheet with the supported outcomes only | Ink-bordered DECISION panel; each option shows its real API action in small type |
| Confirm | Confirmation names the consequence; busy; success toast; the resulting state comes from the server response | Same |

**Only outcomes the API supports:**
- **Intake:** READY TO QUOTE (opens the quote; nothing sent) or ASK THE CLIENT FOR MORE (`client-action` PROVIDE_BUSINESS_DETAILS; G-04).
- **Quote:** APPROVE (`quote-commercial-ready`) or REQUEST REVISION (new version via `update-quote` / `manual-adjustment`).
- **Client request:** APPROVE CHANGE or REQUEST REVISION (`approval-resolve` APPROVED / REVISION_REQUESTED + note).

**No reject state exists**, and none is designed. "Requires clarification" maps to REVISION_REQUESTED plus a note (FD-W15).

## 4. Edge states

| State | Presentation |
| --- | --- |
| Already decided elsewhere | "THIS REVIEW WAS COMPLETED IN ANOTHER TAB. NOTHING WAS CHANGED." |
| Decision failed | "YOUR DECISION WASN'T SAVED (NETWORK). TRY AGAIN — NOTHING WAS SENT." + TRY AGAIN |
| Not persisted alone (G-04) | Confirmation note "NOT SAVED ON SERVER RESTART YET" |
| All clear | "ALL CLEAR." with the last decision time and a link to HISTORY |
| Loading / error | Item skeletons; banner + RETRY |
