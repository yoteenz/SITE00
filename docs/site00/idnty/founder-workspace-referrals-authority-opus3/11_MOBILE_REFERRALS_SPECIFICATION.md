# 11 · Mobile REFERRALS specification (< 768; references 320, 375, 390, 430)

Boards: R01, R06, R09, R12, R16, R21, R26, R35–R37.

## 1. Shell and navigation (non-negotiable)

- **Header:** SITE 00 / FOUNDER / env tag · search · notifications · MENU.
- **Bottom bar:** HOME · FOUNDATIONS · CREATE (red, centre) · REVIEWS · SYSTEM.
  - Unchanged and never six items.
  - REFERRALS never replaces SYSTEM; FOUNDATIONS is never renamed CLIENTS.
- **Reaching REFERRALS:**
  - MENU opens the workspace drawer (RO-M). Row `06 · REFERRALS` is marked active and carries a badge.
  - While REFERRALS is open, **no bottom item is selected**.
- **Page header:** `06` index, `REFERRALS.` display headline, subline, spec tag (specimens), actions CARD STUDIO · NEW PARTNER.
- **Sections:** a full-width section-select button (`SECTION · OVERVIEW ⌄`) opens the RO-S sheet with all seven sections (FD-1…FD-6 editorial selection sheet). The tab row is hidden below 640.

## 2. Pages

| Page | Mobile composition |
| --- | --- |
| Overview | Signals 2-up (5th spans 2); NEEDS YOU focus card with REVIEW COMMISSION; partners list (thumb, name, type, status, large count); commissions/payouts list; Card Studio; activity |
| Partners | Search; status tabs scroll horizontally; two-line rows with the referral count on the right; NEW PARTNER → full-screen RO-01 |
| Partner detail | Plate full width; name; status / type / owner; contact; spec tag; actions SHARE CARD · COPY LINK · MESSAGE · MORE (two rows); section row scrolls horizontally (seven sections); content stacked |
| Attribution | Signals 2-up; banner; view tabs; composite rows (client + partner · via \| state) |
| Source trace | Timeline with evidence tags; linked records below |
| Commissions | Signals 2×2; state tabs; composite rows (client + partner \| amount + state); detail as full-height sheet with APPROVE / ADJUST in a sticky footer |
| Payouts | Policy banner; signals; composite rows; RECORD PAYMENT full screen with keyboard-safe footer |
| Card Studio | Partner line; FRONT / BACK segmented control; card at full width (≤ 358 at 390); template picker 3-up; link panel; print gate; share sheet RO-08 |
| Activity | Search + export; filter tabs scroll; timeline |

## 3. Mobile density rules
1. **Lists:** two-line rows (≥ 64 px); right column holds the number or amount and the state chip; chevron only when the row navigates.
2. **Numbers** in display type: 26–30 px for counts, `--ws-fs-num` for signals.
3. **Chips** are never truncated. Secondary meta lines may ellipsize (via / card name) because the full value is on the detail.
4. **Overlays:**
   - Full screen: create / edit / terms / QR validation / export / proof / adjust / record / reversal / exception / correction.
   - Bottom sheet: invite / status / link / share / approve / confirm / revoke / section.
   - Sticky footers with CANCEL + primary.
5. **Keyboard:** the field in focus stays visible and the footer stays above the keyboard (R21 frame 4).
6. **320 px:** labels wrap (SPECIMEN tag wraps to two lines), signals stay 2-up, and buttons never wrap to two lines.

## 4. Partner-portal mobile (separate app)

- Brand `SITE 00 / PARTNER`.
- Four-tab bottom bar: HOME · MY CARD · EARNINGS · TERMS. This is a different product, so the founder bar does not apply.
- Masked client labels (`F•••• & E••••`).
- Doc 22.
