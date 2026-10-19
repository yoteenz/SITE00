# 15 · Attribution edge cases

21 cases (minimum required: 20). Source: `data/attribution-edge-cases.json`; rendered on board R15. Each becomes an automated test in Phase 4 (doc 32). Where a case depends on an open policy, the **interim behaviour** (until decided) is the safest one: no automatic attribution, exception for founder review.

| ID | SCENARIO | SERVER SIGNAL | OUTCOME | POLICY |
| --- | --- | --- | --- | --- |
| E01 | Card scanned → DF entry started in the same session | Server-held referral context from /invite/:code is attached when the artifact is created. | ATTRIBUTED · OBSERVED | — |
| E02 | QR scanned, prospect leaves, returns later by typing site00.com | No server context survives unless within an approved window on the same browser. | UNATTRIBUTED until FD-R07; RO-19 manual correction with evidence | FD-R07 |
| E03 | Return on the same device inside the approved window | First-party, httpOnly referral context (opaque id, server-side lookup) still valid. | ATTRIBUTED · OBSERVED | FD-R07 |
| E04 | Return after the window has closed | Context expired server-side. | UNATTRIBUTED; correction allowed only with evidence | FD-R07 |
| E05 | Two different partner links touched before the artifact exists | Both touches recorded as visits. | ATTRIBUTION EXCEPTION (RO-18) → manual review until FD-R08 | FD-R08 |
| E06 | Partner link opened after the client's artifact already exists | Visit recorded; artifact attribution is immutable once set. | PRESERVE PRIOR · no change | FD-R08 |
| E07 | Prospect is an existing SITE 00 / DF client | Email or business match to an existing artifact. | DISQUALIFIED (existing client) pending founder review | FD-R09 |
| E08 | Partner refers itself, its owner or a related business | Email domain / payee / owner match. | DISQUALIFIED (self-referral) pending review | FD-R09 |
| E09 | Revoked code scanned | Code status REVOKED. | Public page: card no longer active · BEGIN WITHOUT A REFERRAL · no attribution | — |
| E10 | Suspended partner's code scanned | Partner SUSPENDED; code paused. | Begin unattributed; existing commissions follow FD-R19 | FD-R19 |
| E11 | Staging or test code used | Code issued in a non-production environment. | TEST banner; never creates production attribution | — |
| E12 | Guessed, malformed or tampered code | Code not found; high-entropy codes make guessing impractical. | Generic invalid page; rate-limited; security event logged; no partner name revealed | — |
| E13 | Partner id supplied by the client (query string, form field, local storage) | Ignored; only the server-resolved code is evidence. | Never attributes; logged as tamper signal | — |
| E14 | Prospect forwards the link to another business | Same code resolves for the second business. | ATTRIBUTED to the code's partner; FORWARDED signal noted for review | FD-R08 |
| E15 | Scan on phone, finish on desktop | Server context lives on the phone browser only. | UNAVAILABLE across devices unless continued via the private DF link; correction with evidence | FD-R18 |
| E16 | Duplicate artifacts for the same business | Two artifacts created by mistake. | One attribution per client; duplicate flagged; commission only on the surviving artifact | FD-R09 |
| E17 | Payment refunded before eligibility | Refund evidence before the trigger is satisfied. | Commission never becomes ELIGIBLE (stays NOT YET ELIGIBLE → REVERSED) | FD-R06 |
| E18 | Partial refund after approval, before payout | Basis reduced. | ADJUSTED with a correction entry; approval re-required | FD-R06 |
| E19 | Chargeback after the payout was recorded PAID | Dispute evidence from the processor. | DISPUTED; clawback / netting per FD-R06; payout reversal RO-17 only by founder | FD-R06 |
| E20 | Partner terminated between referral and client payment | Partner TERMINATED. | Commission handled per FD-R19; no automatic forfeiture | FD-R19 |
| E21 | Verbal referral, no card or link used | No digital touch exists. | Manual attribution with written evidence (RO-19); evidence class UNAVAILABLE | FD-R18 |

## Invariants across all cases
1. Attribution evidence comes only from server-resolved codes and server-held context. Client-supplied partner ids never count (E13).
2. There is one attribution per DF artifact, written once and idempotently (E06, E16).
3. Money follows only OBSERVED or ATTRIBUTED evidence under approved policy (E02, E15, E21 need a founder correction).
4. Public pages never reveal why a code is invalid, paused or revoked beyond *no longer active* (E09, E10, E12).
5. Test and staging codes never create production attribution (E11).
