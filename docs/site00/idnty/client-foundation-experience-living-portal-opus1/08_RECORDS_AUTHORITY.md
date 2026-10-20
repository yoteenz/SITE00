# 08 — Records Authority (Family E)

Boards: **M07**, TP07, TL07, D09, UW05, X08.

## Rule

**A record is shown as ready only when it exists.** Records not yet created are listed in a separate "NOT CREATED YET" section with a dashed border, a muted title, "NOT CREATED YET · APPEARS WHEN IT EXISTS" and a PENDING chip. They are never shown with a view affordance.

## Catalogue

| Record | Exists when | Sensitive | Source |
|---|---|---|---|
| INTAKE SUMMARY | intake COMPLETE | no | `payload.intake` (new row, G-03) |
| PROPOSAL V# · ACCEPTED | acceptance recorded | no | quote + acceptance |
| PAYMENT RECEIPT | PAID | no | `buildClientRecords` payment row |
| DOMAIN OWNERSHIP RECORD | domain stage complete | **yes** | `buildClientRecords` domain row |
| EMAIL ACCOUNTS | email stage complete | **yes** | email row |
| SECURITY RECORD | security stage complete | **yes** | security row |
| FOUNDATION HANDOFF | completion | **yes** | project-plan row / handoff doc (G-26) |

## Verified view (sensitive records)

- A sensitive row shows a lock and "VERIFIED VIEW".
- Opening it without a step-up session shows the "CONFIRM IT'S YOU" page and the overlay OL-C04. The client gets a one-time link to the lead email, valid 15 minutes and usable once.
- The verified view:
  - shows "OPENED … · CLOSES WHEN YOU SIGN OUT OR AFTER 30 MINUTES IDLE";
  - is a spec block plus DOWNLOAD PDF;
  - carries the permanent note "NO PASSWORDS ARE STORED IN RECORDS. SITE 00 NEVER SHOWS A PASSWORD HERE."
- Backend: G-10.

## Layout

| Tier | Layout |
|---|---|
| M · TP · TL | One column: READY, then NOT CREATED YET |
| D · UW | Same column. The status column explains the verified view |

## Source

`RecordsLibrary` (ALL/DOMAIN/EMAIL/SECURITY/PAYMENTS/PROJECT categories) and `RecordDetail` exist unwired. Keep the categories as a filter on D/UW only. On phone the list is short enough without them.
