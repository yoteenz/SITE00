# Batch A — Opus handoff corrections (founder-approved direction)

Batch A visual direction is **approved**. These two copy/validation fixes apply at **implementation** time. Do **not** regenerate the approved OpenArt plates for these items alone.

## Correction 01 — DF-A02 Approval detail

While `ApprovalRecord.status === 'REQUESTED'`, do **not** show confirmation copy such as “YOUR DECISION HAS BEEN RECORDED” or “YOUR DECISION IS RECORDED.”

Show confirmation only after a successful server response that resolves the approval (for example `APPROVED` or `REVISION_REQUESTED`).

## Correction 02 — DF-A03 Revision request

If the live approval contract requires a revision reason for a given action, the reason field must **not** be labeled optional and validation must match the authoritative contract.

Today `completeClientAction` accepts optional notes for `REQUEST_CHANGE`; the visual may show required copy when product binds stricter validation. Align labels and validation with the server gate at implementation time.
