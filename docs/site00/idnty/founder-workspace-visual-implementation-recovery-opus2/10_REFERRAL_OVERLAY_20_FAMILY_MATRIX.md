# 10 · Referral overlay families RO-01…RO-20

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`

| ID | Family | Modes (phone · tablet · desktop) | Captured | In view | Notes |
| --- | --- | --- | --- | --- | --- |
| RO-01 | Create partner | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · dismiss on scrim |
| RO-02 | Edit partner | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · dismiss on scrim |
| RO-03 | Invite partner | sheet · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · dismiss on scrim |
| RO-04 | Partner status change | sheet · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · scrim-locked |
| RO-05 | Commission terms editor | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · scrim-locked |
| RO-06 | Referral link preview | sheet · popover · popover | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · dismiss on scrim |
| RO-07 | QR validation result | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · dismiss on scrim |
| RO-08 | Card share sheet | sheet · popover · popover | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · dismiss on scrim |
| RO-09 | Card export dialog | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · dismiss on scrim |
| RO-10 | Print proof | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · dismiss on scrim |
| RO-11 | Commission detail | sheet · sheet-r · sheet-r | 390x844, 820x1180, 1440x900 | YES | inspector sheet · calculation rules, no entry |
| RO-12 | Commission approval | sheet · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · scrim-locked |
| RO-13 | Commission adjustment | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · scrim-locked |
| RO-14 | Payout detail | sheet · sheet-r · sheet-r | 390x844, 820x1180, 1440x900 | YES | inspector sheet · record-only payout rules, no entry |
| RO-15 | Record payment | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · scrim-locked |
| RO-16 | Confirm payment | sheet · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · scrim-locked |
| RO-17 | Payout reversal | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · scrim-locked |
| RO-18 | Attribution exception | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · dismiss on scrim |
| RO-19 | Manual attribution correction | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · scrim-locked |
| RO-20 | Partner access revocation | sheet · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | primary disabled · gated (policy or backend) · scrim-locked |

All 20 families: RECOVERED 20 / 20 · VISUALLY VERIFIED 20 / 20 (`evidence/overlays/RO-*.jpg`). Modes follow
`opus3/data/overlay-modes.json`. Every mutation is disabled and explains its gate: policy (fixed fees, $50 cap, $500 base
package, verified payment + 14-day hold, manual external record-only payouts) or missing backend (partner / link /
ledger tables, G-RF). Nothing is sent, saved, paid or activated; no partner authentication flow is introduced (RO-03).
