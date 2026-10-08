# Readiness for P0.JURNL.EMAILS.FIRST-8-AUTHORITY-BATCH1

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

The next sprint designs one full email authority per contract (mobile and desktop), with sample copy from the contract, for founder review. It must not decompose assets or implement templates.

Each authority prompt carries, from the contract folder:
- family, artifact grammar and mood (00_SYSTEM/creative-doctrine.md, families.md)
- primary gesture, secondary detail, contrast anchor, environment and avoid list (Composition section)
- the draft copy and the live-content list — the authority shows sample copy, but every word, figure and button stays reproducible as HTML
- the restraint formula and the lineage group, so A01/A04, A02/A08 and A03/A06 share materials

| Email | Family | Artifact | Lineage | Environment |
|---|---|---|---|---|
| A01 WELCOME TO JURNL | E01 | WELCOME_LETTER / INVITATION | ARRIVAL | ARRIVAL still life: morning light on stone and linen, one olive sprig — no arch. |
| A02 VERIFY YOUR EMAIL | E06 | ACCESS_CREDENTIAL / PRIVATE_CORRESPONDENCE | SECURE_CORRESPONDENCE | NONE — security mail carries no environment art. |
| A03 FINISH SETTING UP JURNL | E05 | PINNED_NOTE / ANNOTATED_NOTE | DESK_NOTE | NONE — a desk-surface crop at most. |
| A04 YOUR SAFE TO SPEND IS READY | E01 | ENTRY_CARD / EDITORIAL_EXPLAINER | ARRIVAL | ARRIVAL lineage (reused from A01), cropped differently. |
| A05 YOUR WEEK IN JURNL | E03 | BRIEFING_SHEET / LEDGER_INSERT / CLIPBOARD_BRIEF | BRIEFING | BRIEFING lineage: a narrow desk crop (stone, linen, a pen) at the head only. |
| A06 A PURCHASE MAY NEED A SECOND LOOK | E05 | DESK_SLIP / SMALL_MEMO | DESK_NOTE | NONE. |
| A07 YOU REACHED A MILESTONE | E04 | MILESTONE_CARD / CEREMONIAL_NOTE | CEREMONIAL | CEREMONIAL lineage: a stronger still life (linen, brass, olive), one classical fragment at most. |
| A08 RESET YOUR ACCESS | E06 | ACCESS_CREDENTIAL / FORMAL_NOTICE | SECURE_CORRESPONDENCE | NONE. |

Outputs land in each contract folder as `AUTHORITY_MOBILE` / `AUTHORITY_DESKTOP` with state AUTHORITY_IN_REVIEW. Founder approval is never inferred.
