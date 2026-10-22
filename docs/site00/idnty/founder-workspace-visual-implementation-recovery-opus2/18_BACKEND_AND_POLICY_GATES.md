# 18 · Backend and policy gates

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


| Gate | State |
| --- | --- |
| Backend / API / schema files changed | none |
| Database schema | unchanged |
| Authentication | unchanged (AdminGuard untouched) |
| Railway staging | not modified |
| Production deploy | none |
| Staging transactional email | not enabled; workspace never flips the flag; every test send needs a per-send tick and the server flag/allowlist |
| Client messages sent during the sprint | none (capture harness refuses every POST) |
| Commission execution | OFF — no commission is created, approved or adjusted; RO-05/11/12/13 disabled |
| Payout execution | OFF — no provider, record-only by policy; RO-14…17 disabled |
| Payable commissions from missing Stripe evidence | impossible from the UI (no ledger; PAID clients read “EVIDENCE NOT LINKED”) |
| AIO activation | not automatic (`autoActive: false`), shown PLANNED · NOT ACTIVE |
| Partner authentication flow | none introduced |
| Print | no print-ready status, no production QR, no physical order |
| Fee policy | $25 standard · $35 established · $50 strategic max · AIO proposed $50 · $50 cap · $500 base package only · 90-day window · 14-day hold · monthly on the 15th · manual external record-only |
| Mock data | none in source; fixtures only in the capture harness |

REFERRAL_POLICY_GATES: ENFORCED · AIO_ACTIVATED: NO · COMMISSION_EXECUTION: OFF · PAYOUT_EXECUTION: OFF · PRINT_READY: NO
