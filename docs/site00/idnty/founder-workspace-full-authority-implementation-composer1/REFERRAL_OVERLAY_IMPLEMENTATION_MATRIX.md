# Referral overlay implementation matrix (RO-01 … RO-20)

| ID | Title | Trigger on Referrals page | Functional write | Status |
| --- | --- | --- | --- | --- |
| RO-01 | Create partner | Partners section | None | BLOCKED BY BACKEND |
| RO-02 | Edit partner | Partners section | None | BLOCKED BY BACKEND |
| RO-03 | Invite partner | Partners section | None | BLOCKED BY POLICY |
| RO-04 | Partner status change | Partners section | None | BLOCKED BY BACKEND |
| RO-05 | Commission terms editor | Commissions | None | BLOCKED BY POLICY |
| RO-06 | Referral link preview | Card studio | Copy path (local) | COMPLETE (read-only) |
| RO-07 | QR validation | Card studio | None | BLOCKED BY POLICY |
| RO-08 | Card share sheet | Card studio | Copy (local) | COMPLETE |
| RO-09 | Card export | Card studio | Export disabled | BLOCKED BY POLICY |
| RO-10 | Print proof | Card studio | None | BLOCKED BY POLICY |
| RO-11 | Commission detail | Commissions | None | BLOCKED BY BACKEND |
| RO-12 | Commission approval | Commissions | None | BLOCKED BY POLICY |
| RO-13 | Commission adjustment | Commissions | None | BLOCKED BY POLICY |
| RO-14 | Payout detail | Payouts | None | BLOCKED BY BACKEND |
| RO-15 | Record payment | Payouts | None | BLOCKED BY POLICY |
| RO-16 | Confirm payment | Payouts | None | BLOCKED BY POLICY |
| RO-17 | Payout reversal | Payouts | None | BLOCKED BY POLICY |
| RO-18 | Attribution exception | Attribution | None | BLOCKED BY BACKEND |
| RO-19 | Manual attribution correction | Attribution | None | BLOCKED BY POLICY |
| RO-20 | Partner access revocation | Partners | None | BLOCKED BY POLICY |

All RO families mount via `ReferralOverlayBody.tsx` with truthful blocked explanations.
