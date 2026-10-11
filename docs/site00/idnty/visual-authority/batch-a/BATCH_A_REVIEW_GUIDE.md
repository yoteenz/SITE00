# Batch A review — client interaction details

Four mobile screens. Same Digital Foundation shell as the approved P07–P10 boards. Nothing here is built. Founder approval is pending.

Fixture copy uses Anthony Transport so the screens match the approved boards. It is design fixture content.

## A01 — Project messages

Private correspondence with SITE 00 on the foundation. Parent: project overview.

Founder and client rows share the white surface. A red rule marks the founder. There are no colored bubbles. Composer: YOUR MESSAGE, ATTACH, SEND. Read and delivered states come from `read_by_*_at` and `delivery_state`.

The paperclip is **design proposed — functional contract pending**. `ProjectMessage` has no attachment field.

## A02 — Approval detail

The client reviews one decision before approving. Parent: Needs You.

Shown: AWAITING APPROVAL, requested by SITE 00 founder, date, decision APPROVE DNS CHANGE, version 1, a short summary, and a related DNS record. Actions: APPROVE, REQUEST CHANGES, BACK TO NEEDS YOU.

Maps to `ApprovalRecord` (subject, version, status REQUESTED) and `ClientActionRequest` type `APPROVE_DNS_CHANGE`. No signature was drawn.

## A03 — Request changes

Feedback instead of approval. Parent: approval detail.

Context line, a large notes field, SUBMIT REQUEST, CANCEL. The live contract stores the note as optional, so the label says OPTIONAL rather than inventing a required field. No attachment: the contract has none.

## A04 — Stage detail, needs you

Why professional email is waiting, and the one action that moves it. Parent: roadmap.

Completed steps stay quiet. The current step and the button use red. The blocker is client authorization (`CLIENT_AUTH_REQUIRED` on stage `03_PROFESSIONAL_EMAIL`, status `NEEDS_CLIENT`). It is not an error page.

## Shared decisions

- One phone per image, 2016×3584, ratio 9:16.
- Header, hamburger, red `#E50107`, and the red period match the approved boards.
- Architecture stays in the corners so the content stays readable.
- First generation of each screen was accepted. Nothing was regenerated.

## What to mark

APPROVED, APPROVED WITH SURGICAL REVISIONS, REVISION REQUIRED, or REJECTED. Opus implements only what you approve.
