# Founder approval register

**Status:** every item is **OPEN**. Nothing in this package is founder-approved; approval is never assumed from silence (§45). The only LOCKED rule is the founder's own: the two IDNTY intake fonts with uppercase application copy.

**How to use:** review the boards by round (README.md). For each item, record APPROVED, APPROVED WITH CHANGES (note), ALTERNATIVE CHOSEN or REJECTED, with a date. Composer may not implement past an OPEN item that its phase depends on (COMPOSER_IMPLEMENTATION_HANDOFF.md).

## Locked (founder authority, not open)

| ID | Rule | Source |
| --- | --- | --- |
| L-1 | Two fonts only: SITE 00 Display + Saira Semi Condensed (the IDNTY intake fonts) | Founder sprint brief |
| L-2 | Uppercase application copy; case-sensitive data not transformed | Founder sprint brief |
| L-3 | Mobile is first-class; desktop and tablet are required | Founder sprint brief |

## Open decisions

| ID | Round | Decision | Proposal (recommended) | Alternatives | Implementation implication | Boards | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FD-W1 | A | Mobile navigation | Bottom nav HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM (reference) + labelled MENU drawer for OPERATIONS, CORRESPONDENCE, tools, account | Swap SYSTEM → OPERATIONS once G-04 closes; or a 6-item bottom nav (cramped at 375) | Phase 1 shell | 01, 25 | OPEN |
| FD-W2 | A | Desktop inspector model | Inspector 392 px only while something is selected; stage reflows | Permanent right panel (rejected by founder feedback on clutter); overlay drawer over the stage | Phase 1 host; every page's selection model | 02, 04, 06, 14, 18, 20, 22 | OPEN |
| FD-W3 | B | Client imagery | Typographic plate (initials + threshold sliver); image slot reserved; slim threshold band on the record instead of a hero photo | Real client photos (none exist; would need an approved asset source); generic illustrations (forbidden) | SC-01, CR-02 | 05, 09, 27 | OPEN |
| FD-W4 | A | Control geometry | Rectilinear 3 px radius create block and square journey nodes, matching the form-control authority | Circular create and nodes as in the references | Shell, SC-03 | 01, 09, 27 | OPEN |
| FD-W5 | B | Unavailable actions | Shown disabled with their reason and gap ID (e.g. RESEND · N/A · G-05) | Hidden until the API exists | Row menu, quick actions, overlays | 09, 24 | OPEN |
| FD-W6 | A | Workspace routes and landing | Static segments under `/admin/site00/foundation`; admin nav item "DIGITAL FOUNDATION" → `/overview`; R1–R6 keep resolving (R3–R5 redirect) | Land on `/admin/site00/foundation` (the registry) | Phase 1 routing; `control-nav.ts` entry | 26 | OPEN |
| FD-W7 | E | Readiness Desk retirement | R7 keeps rendering until SYSTEM reaches verified parity; then R7 renders SYSTEM at the same path (auth return path preserved) | Keep both permanently | Phase 8 | 22, 26 | OPEN |
| FD-W8 | F | Minimum text size | Phone minimums: labels and meta 10 px, row titles and data 12 px, in rem | Keep the shipped DF-client micro scale (7.5–9 px labels) exactly as drawn | Type tokens; visual regression baselines | 27 | OPEN |
| FD-W9 | C | Decision button colour | Ink for decisions; red only for create and destructive | Red for all primaries | SC-06 | 12, 15, 16, 27 | OPEN |
| FD-W10 | A | Fonts inside vs outside the workspace | Martian Mono and Barlow not used inside the workspace; the admin shell and Correspondence Studio keep their own fonts | Convert the whole admin shell (out of scope) | Workspace CSS scope | 27 | OPEN |
| FD-W11 | B | Progress representation | Eight display phases from canonical state, "STEP n OF 8", no percentage | Reference five steps (INVITED → COMPLETE) with "%" (no data source, G-02) | SC-03, CR-04 | 05, 09, 15, 25 | OPEN |
| FD-W12 | B | Synthetic clients in lists | Excluded from signals and the registry by default; TEST filter shows them, hatched | Always shown | Registry filters, Overview metrics | 05, 23 | OPEN |
| FD-W13 | D | Correspondence placement | 05 CORRESPONDENCE for client communication and send policy; templates stay in Correspondence Studio (link out) | Merge the Studio into the workspace | Phase 7 scope | 19, 20 | OPEN |
| FD-W14 | A | Threshold objects | DF objects at most once per destination title; decorative only | No architectural accents | SC-16 | 03, 04, 21, 22 | OPEN |
| FD-W15 | C | Negative review outcome | REQUEST REVISION (REVISION_REQUESTED + note); no reject | Add a reject state (needs a backend change, out of scope) | RV-05 | 15, 16 | OPEN |
| FD-W16 | D | Send approval | One approval tick for every send, including queued lifecycle emails (fixes R7's ungated lifecycle send) | Keep R7 behaviour | CO-06, SY-12 | 19, 23 | OPEN |
| FD-W17 | C | Mark complete | Collect ownership values (no defaults) behind the completion gate, with confirmation | Keep R2's hard-coded `TBD` values | CR-10, OL-10 | 24 | OPEN |
| FD-W18 | E | Continuity checks | Show restart, link and resume checks as UNVERIFIED placeholders until the persistence workstream supplies probes | Omit until probes exist | SY-13 | 23 | OPEN |
| FD-W19 | A | Notification center | Derived from the review queue and events; "mark seen" local to the browser | Wait for a notification store (G-10) | SH-05 | 01, 24 | OPEN |
| FD-W20 | F | Breakpoints | < 768 phone · 768–1279 rail · ≥ 1280 sidebar · dock when width − nav ≥ 1100 | 1024 desktop threshold | SH-15 | 25 | OPEN |

## Dependent approvals carried from the form-control sprint

The field, choice and focus grammar comes from `docs/site00/idnty/form-control-visual-authority-opus1/` (draft PR #1658). It is also **PROPOSED**, and its decisions remain open there. If the founder changes that grammar, boards 07, 08, 12, 23 and 27 inherit the change.

## Data-gap decisions (product and backend, outside this visual sprint)

These are not visual decisions, but the workspace shows their absence. Each needs a founder or product call before the related UI can go live.

| Gap | Decision needed |
| --- | --- |
| G-05 | Approve a "resend invitation" endpoint and its send policy |
| G-06 | Decide whether archive, revoke or rotate link should exist |
| G-02 | Approve a deterministic intake-completion calculation, or confirm "no percentage" |
| G-01 | Approve extending the `list` response (backend sprint) |
| G-11 | Decide whether the API should reject duplicate emails |
