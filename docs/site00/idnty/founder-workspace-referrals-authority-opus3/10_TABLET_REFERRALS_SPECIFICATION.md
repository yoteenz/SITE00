# 10 · Tablet REFERRALS specification

Boards: R02, R03, R07, R13, R17, R22, R27, R35 (tablet frame), R41, R42.

Tablets are designed per orientation; the landscape layout is not the portrait layout stretched.

## 1. Tablet portrait (768–1023; reference 834 × 1112)

**Shell:**
- 80 px rail (NEW · HOME · FOUNDATIONS · REVIEWS · OPS · MAIL · **REFERRALS** · SYSTEM), with the REFERRALS glyph red when active.
- Top bar: breadcrumb, search icon and notifications.
- Stage gutter 24.

| Page | Layout |
| --- | --- |
| Overview | Signals 3-up then 2 rows (5 metrics); focus card full width; partners \| commissions/payouts; Card Studio \| activity |
| Partners | Registry at 600–899 container width: PARTNER · TYPE / STATUS · REFERRALS; inspector as a **bottom sheet** |
| Partner detail | Header with plate, actions wrap to a second row; tabs; main column then context stacked |
| Attribution | Signals 3-up; ledger 4 columns REFERRAL · CLIENT · PARTNER · COMMISSION |
| Commissions | Ledger CLIENT · AMOUNT · STATE · DATE; detail as sheet |
| Payouts | Policy banner; ledger 4 columns; detail as sheet |
| Card Studio | Stage then controls stacked; template picker 3-up |
| Activity | Single timeline column |

**Overlays:**
- Dialogs centred at 560–640.
- RO-06 and RO-08 as popovers.
- Menu drawer RO-M from the left.
- No section sheet (tabs are visible).

## 2. Tablet landscape (1024–1279; reference 1194 × 834)

**Shell:** rail as in portrait; stage gutter 28.

| Page | Layout |
| --- | --- |
| Overview | Signals 5-up; partners \| money + activity; focus card hidden from a 1100 stage |
| Partners | Registry seven columns when no inspector; with a selection, the inspector **docks** (stage ≥ 680 kept) and the registry drops to four columns |
| Partner detail | Main + context columns side by side |
| Attribution / Commissions / Payouts | Seven-column ledgers; detail docks |
| Card Studio | Stage \| controls (two columns from a 920 stage) |

## 3. Tablet-specific rules
1. Touch targets ≥ 44 px; row heights ≥ 56; chips 24 high.
2. Inspector sheets have a 24 px top grab area and close on swipe-down or the × button. Focus returns to the row.
3. The software keyboard (simulated 398 px) never hides the active field or the dialog footer.
4. Rail badges mirror the sidebar badges.
5. In portrait, the reference’s three-panel desktop composition is **not** reproduced. Partner detail moves into its own page.
