# 31 — Founder Approval Register

## A. Locked (founder-approved direction §00; applied, not re-opened)

| # | Direction | Where applied |
|---|---|---|
| 1 | Intake before payment | `02`, `04` |
| 2 | Personalized recommendation | `14`, `15` |
| 3 | Straightforward intakes auto-prepared for founder approval | `05` (G-02) |
| 4 | Complex intakes go to founder review | `05` (closer-look notice, G-01) |
| 5 | Founder approves / adjusts scope | `14` (versioned notice + founder note) |
| 6 | Personalized proposal | `14` |
| 7 | Client accepts the exact quote version | `16` |
| 8 | Payment via Stripe hosted checkout | `17` |
| 9 | Verified payment activates the project | `17` (webhook-only) |
| 10 | One persistent foundation experience | `03` (areas from INTAKE_COMPLETE) |
| 11 | Client can return after submission | `13` |
| 12 | Save to home screen is primary | `09` |
| 13 | Downloadable access card is secondary | `11` |
| 14 | Email is primary for recovery and notifications | `13`, `20` |
| 15 | Never show fabricated review or progress | `05`, `06`, `18`, `20`, `25` |
| — | Access priority home screen › access card › email | AH01, everywhere |

## B. Approvals requested (visual authority)

| ID | Item | Boards | Recommendation |
|---|---|---|---|
| FA-01 | Post-intake review composition and locked copy | M01, D02 | approve |
| FA-02 | Four areas available from INTAKE_COMPLETE (pre-payment content) | M02, D03 | approve |
| FA-03 | Seven client roadmap stages + dot grammar; no percentages | M04, X04 | approve |
| FA-04 | Mobile bottom bar for the four areas (live client uses drawer only) | M02–M05, X02 | approve |
| FA-05 | Tier compositions: tabs (TP), icon rail (TL), sidebar + status column (D), activity column (UW) | X01, X02 | approve |
| FA-06 | Five Needs You states | M05, D07 | approve |
| FA-07 | Records ready vs not-created-yet; verified view for sensitive records | M07, D09 | approve |
| FA-08 | App icon composed from existing grammar; label MY FOUNDATION | AH05 | approve |
| FA-09 | Access card design (dark default, printable light, wallet-style image) | AH06–AH08 | approve |
| FA-10 | Recommendation cards with five answers; required-decline returns to review | M14, D14 | approve |
| FA-11 | Payment and confirmation copy ("READY TO BEGIN" / "UNDERWAY") | M16, M17 | approve |
| FA-12 | Eight workstreams | M18, D18 | approve |
| FA-13 | Completion with opt-in build line | M19, D19 | approve |
| FA-14 | Email designs (subjects, CTA) — design only | X12 | approve copy; sending stays off |

## C. Open decisions

| ID | Decision | Options | Recommendation |
|---|---|---|---|
| OD-01 | Minimum text size 10px in the client (live uses 7.5–9.5px) | keep live / adopt 10px | adopt 10px |
| OD-02 | Threshold red `#ce1017` (code) vs `#E50107` (fidelity doc) | code / doc | keep code value |
| OD-03 | iOS non-Safari browsers: claim Share → Add to Home Screen or send to Safari | verify per iOS version | send to Safari until verified |
| OD-04 | `/foundation/review` inside the manifest scope | keep / move to `/admin` | move eventually; not blocking |
| OD-05 | G-02 shape: DRAFT quote until founder approval (a) or payload withholding (b) | a / b | **a** |
| OD-06 | Apple / Google Wallet passes | none / build pass infrastructure | none for now; wallet-style image only |
| OD-07 | When the access card is issued | after INTAKE_COMPLETE + verified email / after payment | after INTAKE_COMPLETE + verified email |
| OD-08 | Darken `--df-muted` to `#6b6964` for AA contrast (4.23 → 4.9:1) | keep / darken | darken (client + founder workspace consistency to be checked) |
| OD-09 | Session length on a device | 7 / 30 / 90 days | 30 days, step-up for sensitive |
| OD-10 | Merge path for this authority (draft PR into the integration branch) | merge after review / keep as reference | merge after founder review |

**Nothing in this package is authorized for production until the founder approves B and resolves C.** This authority must not merge until the founder reviews it.
