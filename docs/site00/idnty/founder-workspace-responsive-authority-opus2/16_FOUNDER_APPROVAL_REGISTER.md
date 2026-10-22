# 16 · Founder approval register (OPUS2 responsive refinement)

**Status:** DESKTOP + TABLET AUTHORITY REFINED — FOUNDER VISUAL REVIEW REQUIRED. Nothing new in this package is approved by silence.

## 1. Founder classifications received for this sprint (recorded, not reinterpreted)

| Area | Founder classification |
| --- | --- |
| Mobile visual direction | **APPROVED, SUBJECT TO SHARED SYSTEM CONSISTENCY** |
| Desktop visual direction | **APPROVED CONCEPTUALLY — REFINEMENT REQUIRED** |
| Tablet | **INSUFFICIENT COVERAGE — REFINEMENT REQUIRED** |
| Production implementation | **NOT YET AUTHORIZED** |

## 2. Four separate statuses (§33)

| Status | Meaning in this package | Items |
| --- | --- | --- |
| **VISUAL DIRECTION APPROVED** | The founder approved the direction; OPUS2 preserves it | Palette and marks, plates, red period, rail index, square geometry, mobile compositions, form-control decisions FD-1 to FD-6 (approved in the form-control OPUS2 sprint) |
| **RESPONSIVE REFINEMENT REQUIRED → PROPOSED HERE** | Founder review of the OPUS2 boards decides | R-01 to R-12 below |
| **PRODUCT DECISION STILL OPEN** | Not decided by this sprint | FD-W1 to FD-W20 (OPUS1 register) remain OPEN. FD-W2 and FD-W20 are revised by R-03 and R-02, which are also proposals. |
| **BACKEND DEPENDENCY UNRESOLVED** | The UI shows the absence, never a fake | G-01 list fields · G-03 events · G-04 ops persistence · G-05 resend · G-06 revoke / rotate · G-08 probes · G-09 send intents · G-10 notification store · G-11 duplicate email |

## 3. Responsive decisions for founder review

| ID | Decision | Proposal | Boards | Status |
| --- | --- | --- | --- | --- |
| R-01 | Desktop type scale | Title 52 (44 short-height), labels 11, meta 12, body 14, buttons 12; UW +1 step | C-03, C-04, D-15 | PROPOSED |
| R-02 | Breakpoints | M < 768 · TP 768–1023 · TL 1024–1279 · D 1280–1919 · UW ≥ 1920; short-height rule ≤ 860 | D-01, TP-01, TL-01 | PROPOSED (revises FD-W20) |
| R-03 | Inspector dock rule | Dock when `viewport − nav − inspector ≥ 680`; widths clamp(344, 24vw, 420) / clamp(420, 18vw, 480) | D-01, C-05 | PROPOSED (refines FD-W2) |
| R-04 | Tablet portrait grammar | Labelled 80 rail, push detail, right sheets, 2-column queues | TP-01 to TP-10 | PROPOSED |
| R-05 | Tablet landscape grammar | Rail + two panes, short header, docking from 1100 | TL-01 to TL-10 | PROPOSED |
| R-06 | Registry columns | Desktop CLIENT / LIFECYCLE / INTAKE / NEXT ACTION / LAST ACTIVITY; tablet CLIENT / STATUS / NEXT ACTION; chosen by registry width | D-03, TP-03, TL-03, C-05 | PROPOSED · INTAKE column depends on G-01 |
| R-07 | Reviews workbench | Queue / context / decision; decision footer 920–1159 | D-08, D-09, C-06 | PROPOSED |
| R-08 | Operations workbench | Runbooks / main / context, no Kanban | D-10 | PROPOSED |
| R-09 | Correspondence | Index / thread (68ch) / context | D-11 | PROPOSED |
| R-10 | System console | Status-first rows replace module cards | D-12, C-07 | PROPOSED |
| R-11 | Density classes | RELAXED (Overview, Record, Create) · STANDARD (Foundations, Reviews, Operations, Correspondence) · COMPACT (System, Test lab) | D-15 | PROPOSED |
| R-12 | Ultra-wide | Content max 1760 centred; capped component widths | D-01, C-05, C-07 | PROPOSED |

## 4. Not auto-approved (explicit)

These stay unapproved even though the boards show where they would sit:

| Item | Shown as | Status |
| --- | --- | --- |
| Resend invitation | Row menu / quick action disabled: RESEND · N/A · G-05 | PRODUCT DECISION OPEN + BACKEND UNRESOLVED |
| Link revocation / rotation | REVOKE LINK · N/A · G-06 | PRODUCT DECISION OPEN + BACKEND UNRESOLVED |
| Duplicate email rejection | Client-side notice only; the API still accepts (G-11) | PRODUCT DECISION OPEN |
| Added list fields | INTAKE column and list-level lifecycle marked G-01 | BACKEND UNRESOLVED |
| Completion calculations | Eight phases, STEP n OF 8, no percentage (G-02) | PRODUCT DECISION OPEN |
| Notification persistence | Derived feed; MARK SEEN local (FD-W19, G-10) | PRODUCT DECISION OPEN |
| Email send policy changes | Send disabled by policy; approval tick per send (FD-W16) | PRODUCT DECISION OPEN |

## 5. How to record a decision

For each R-xx, record one of: APPROVED · APPROVED WITH CHANGES (note) · ALTERNATIVE · REJECTED, with the date. Composer may not start a handoff phase whose R-items are not approved (see 17).
