# Client record specification

**Status:** PROPOSED. Boards 09 (mobile), 10 (desktop), 11 (intake and recommendations), 12 (quote), 24 (mark complete). Registry CR-01…CR-13. Reference D (client record).
**Route:** `/admin/site00/foundation/:id` (R2 path kept), `?section=`.

## 1. Header

| Element | Phone | Desktop |
| --- | --- | --- |
| Navigation | ← FOUNDATIONS · ⋯ | Breadcrumb `02 FOUNDATIONS / NAME` |
| Imagery | Slim threshold band (DF corner + crown objects) instead of the reference's hero photo (FD-W3) | None (plate only) |
| Identity | Plate 64, name (display), category | Plate, name (52 px), category · email (data) |
| State | Status mark + label · "STEP n OF 8 · PHASE" · eight segments | Journey panel with full labels and dates; "NEXT: … · WHOSE MOVE" |
| Quick actions | 5-up: COPY LINK · CLIENT VIEW · MESSAGE · RESEND (N/A, G-05) · MORE | COPY LINK · CLIENT VIEW · MESSAGE · ⋯ |

The reference's "70% COMPLETE · STEP 2 OF 5" becomes "STEP n OF 8": no percentage exists (G-02), and the eight display phases come from canonical state (FD-W11).

## 2. Sections

| Section | Contents | Founder actions | API |
| --- | --- | --- | --- |
| OVERVIEW | Next step (whose move + action), journey, 3 tiles (intake, recommendation, quote), personal link ("ACTIVE · NO EXPIRY"; quotes expire after 14 days), recent movement | Primary action per state | `detail` |
| INTAKE | Saved answers grouped by step; section status derived from fields present; case-sensitive values unchanged; missing answers marked "NOT PROVIDED" | None (no founder editing introduced) | `detail.intake` |
| RECOMMENDATIONS | Three layers: **automated** (engine + manual-review reasons), **founder decision** (selections), **client-facing** (after commercial ready). Never implies the automated set was approved. | Adjust selections | `update-quote` |
| QUOTE | Lines from catalog prices, subtotal, turnaround (2–3 business days + review items), expiry, acceptance, payment, third-party notice (verbatim), version history | APPROVE QUOTE (confirm), REVISE (adjustment → new version), PREVIEW AS CLIENT | `quote-commercial-ready`, `update-quote`, `manual-adjustment` (G-04) |
| OPERATIONS | Stage rail, current stage tasks, completion gate (former R4 + R5 JSON) | Task actions → 04 inspector | `project-command`, `workbench` |
| RECORDS | Ownership records, completion gate reasons, MARK COMPLETE (PAID + gate) | Mark complete with explicit ownership values (FD-W17) | `completion-gate`, `mark-complete` (G-04) |
| COMMUNICATIONS | Portal thread + email intents for this client | Message | `messages`, `send-message`, `email-timeline` |
| ACTIVITY | Full event list | — | `detail.events` (G-03) |

On a phone, OVERVIEW · INTAKE · QUOTE · OPS are tabs and the other four sit under MORE. Desktop shows all eight.

## 3. Quote decision boundary (board 12)

- On a phone, the decision bar (REVISE · APPROVE QUOTE) is fixed above the bottom nav with a hairline gap and white background.
- On desktop, the decision is an ink-bordered panel beside the quote.
- **APPROVE** opens a confirmation that names the consequence: "THE CLIENT WILL SEE THIS QUOTE AND CAN ACCEPT AND PAY $X. YOU CAN STILL REVISE IT UNTIL THEY ACCEPT." Quote-ready email is DRY RUN on staging, and the dialog does not imply an email.
- **REVISE** opens an adjustment sheet that creates the next version. Until G-04 closes it carries: "MANUAL ADJUSTMENTS ARE NOT SAVED TO THE DATABASE YET. A RESTART LOSES THEM."
- After ACCEPTED or PAID the quote is locked (`QUOTE_LOCKED`) and the controls read "LOCKED · ACCEPTED".

## 4. Mark complete (board 24)

R2 today sends hard-coded ownership values (`registrar: 'TBD'`, …) with no confirmation, busy state or error handling. The proposal:
- shows the completion-gate reasons;
- asks for the ownership values with no defaults;
- keeps MARK COMPLETE disabled while the gate is open ("MARK COMPLETE · GATE OPEN");
- confirms before sending.

## 5. Copy link

- COPY LINK uses the clipboard API and shows a toast plus a 2 s ink underline on the button.
- If the clipboard fails, the link is shown in a selectable field.
- The link is a permanent token (no expiry, no revoke, G-06). The UI never describes it as expiring.

## 6. States

| State | Presentation |
| --- | --- |
| Founder move | Red mark; founder CTA in NEXT STEP |
| Client move | Hollow ink mark; **no founder CTA**; "WAITING ON CLIENT · SINCE …" |
| Blocked | Hollow red; blocker reason + the task link |
| Test client | Hatched plate, TEST tag, banner "SYNTHETIC CLIENT · STAGING ONLY" |
| Complete | Grey; records available |
| Loading / error / not found | Section skeletons; section error with RETRY; "FOUNDATION NOT FOUND" with BACK TO FOUNDATIONS (404 when persistence is on) |
