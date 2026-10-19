# 28 · Visual board manifest

**44 boards** (minimum 44), rendered by `boards/render-boards.mjs`:
- Vite server, with real icons, objects and config loaded from source;
- Playwright Chromium at device scale factor 2;
- every product frame is a **live specimen** (`boards/src/specimen.html`) in an iframe at its true viewport, scaled after layout.

**184 live frames** in total. Machine-readable manifest: `boards/board-manifest.json`, with sha256, sizes, frame readiness, fonts, lowercase scan and per-frame layout checks.

## Classification
| CLASS | COUNT | BOARDS |
| --- | --- | --- |
| MOBILE | 10 | R01 R06 R09 R12 R16 R21 R26 R35 R36 R37 |
| TABLET | 6 | R02 R03 R07 R17 R22 R27 |
| DESKTOP | 9 | R04 R05 R08 R10 R13 R18 R23 R28 R38 |
| CARD DESIGN | 6 | R29 R30 R31 R32 R33 R34 |
| CROSS-TIER / SYSTEM | 13 | R11 R14 R15 R19 R20 R24 R25 R39 R40 R41 R42 R43 R44 |

Every board also embeds frames from other tiers where useful (for example R14 has desktop + tablet, R15 has desktop + mobile). The classes above follow each board's primary subject.

## Boards
| ID | GROUP | TITLE | TIER / SUBJECT | IMAGE | PX | FRAMES READY | FONTS | LOWERCASE | LAYOUT FAILS | SHA256 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R01 | A · OVERVIEW | Referrals overview · mobile | MOBILE 320–767 | `png/board-R01-overview-mobile.png` | 3160×4340 | 8/8 | YES | 0 | 0 | ea4be4a4a898 |
| R02 | A · OVERVIEW | Referrals overview · tablet portrait | TABLET PORTRAIT 768–1023 | `png/board-R02-overview-tablet-portrait.png` | 3327×5018 | 4/4 | YES | 0 | 0 | cfd30cb2646b |
| R03 | A · OVERVIEW | Referrals overview · tablet landscape | TABLET LANDSCAPE 1024–1279 | `png/board-R03-overview-tablet-landscape.png` | 3368×3808 | 3/3 | YES | 0 | 0 | 234722695e67 |
| R04 | A · OVERVIEW | Referrals overview · desktop | DESKTOP 1280–1919 | `png/board-R04-overview-desktop.png` | 3208×3715 | 4/4 | YES | 0 | 0 | e2e1932e54fb |
| R05 | A · OVERVIEW | Referrals overview · wide and ultra-wide | ≥ 1920 | `png/board-R05-overview-ultra-wide.png` | 3148×3640 | 3/3 | YES | 0 | 0 | 338aa6e894e2 |
| R06 | B · PARTNERS | Partner registry · mobile | MOBILE | `png/board-R06-partners-mobile.png` | 3160×4286 | 8/8 | YES | 0 | 0 | c1fd8b6156ce |
| R07 | B · PARTNERS | Partner registry · tablet | TABLET PORTRAIT + LANDSCAPE | `png/board-R07-partners-tablet.png` | 3374×4120 | 4/4 | YES | 0 | 0 | 055589903af1 |
| R08 | B · PARTNERS | Partner registry · desktop | DESKTOP | `png/board-R08-partners-desktop.png` | 3148×3014 | 4/4 | YES | 0 | 0 | 192a52d5d3a5 |
| R09 | B · PARTNERS | Partner detail · mobile | MOBILE | `png/board-R09-partner-detail-mobile.png` | 3160×4325 | 8/8 | YES | 0 | 0 | 77cb50215ce5 |
| R10 | B · PARTNERS | Partner detail · desktop | DESKTOP | `png/board-R10-partner-detail-desktop.png` | 3148×4993 | 5/5 | YES | 0 | 0 | 3f941465bb66 |
| R11 | B · PARTNERS | Partner creation and terms | OVERLAYS RO-01 · RO-02 · RO-03 · RO-05 | `png/board-R11-partner-creation-terms.png` | 3400×3178 | 5/5 | YES | 0 | 0 | f192110cb50b |
| R12 | C · ATTRIBUTION | Referral history · mobile | MOBILE | `png/board-R12-referral-history-mobile.png` | 3160×2468 | 4/4 | YES | 0 | 0 | 48b0d10fe999 |
| R13 | C · ATTRIBUTION | Attribution ledger · desktop + tablet | ALL TIERS ≥ 768 | `png/board-R13-attribution-ledger-desktop.png` | 3179×4932 | 3/3 | YES | 0 | 0 | d886a18dfc4c |
| R14 | C · ATTRIBUTION | Source trace | EVIDENCE CLASSES | `png/board-R14-source-trace.png` | 3212×2546 | 2/2 | YES | 0 | 0 | 4d60c43e0287 |
| R15 | C · ATTRIBUTION | Attribution exception | RO-18 · RO-19 · 21 EDGE CASES | `png/board-R15-attribution-exception.png` | 3397×3636 | 3/3 | YES | 0 | 0 | 86c91e706f49 |
| R16 | D · COMMISSIONS | Commission ledger · mobile | MOBILE | `png/board-R16-commissions-mobile.png` | 3160×2468 | 4/4 | YES | 0 | 0 | 4be36e17044b |
| R17 | D · COMMISSIONS | Commission ledger · tablet | TABLET PORTRAIT + LANDSCAPE | `png/board-R17-commissions-tablet.png` | 3400×4148 | 4/4 | YES | 0 | 0 | d5d5bcb186f4 |
| R18 | D · COMMISSIONS | Commission ledger · desktop | DESKTOP | `png/board-R18-commissions-desktop.png` | 3148×2254 | 2/2 | YES | 0 | 0 | 1f822f324244 |
| R19 | D · COMMISSIONS | Commission detail | CALCULATION · HISTORY | `png/board-R19-commission-detail.png` | 3302×2702 | 2/2 | YES | 0 | 0 | f17d3c37fdc0 |
| R20 | D · COMMISSIONS | Commission approval | RO-12 · RO-13 | `png/board-R20-commission-approval.png` | 3169×2520 | 3/3 | YES | 0 | 0 | 99af33800c11 |
| R21 | E · PAYOUTS | Payouts · mobile | MOBILE | `png/board-R21-payouts-mobile.png` | 3160×2468 | 4/4 | YES | 0 | 0 | 1261365d9438 |
| R22 | E · PAYOUTS | Payouts · tablet | TABLET PORTRAIT + LANDSCAPE | `png/board-R22-payouts-tablet.png` | 3358×2834 | 2/2 | YES | 0 | 0 | 32fabfe2ad9e |
| R23 | E · PAYOUTS | Payouts · desktop | DESKTOP | `png/board-R23-payouts-desktop.png` | 3148×1832 | 2/2 | YES | 0 | 0 | a2cda5eff574 |
| R24 | E · PAYOUTS | Payout detail | RO-14 · RO-17 | `png/board-R24-payout-detail.png` | 3152×1526 | 3/3 | YES | 0 | 0 | 99a7fc2252c1 |
| R25 | E · PAYOUTS | Record payment and confirmation | RECORD ≠ SEND | `png/board-R25-record-payment.png` | 3152×2161 | 3/3 | YES | 0 | 0 | 3fa1f8f012e2 |
| R26 | F · CARD STUDIO | Card Studio · mobile | MOBILE | `png/board-R26-card-studio-mobile.png` | 3160×2468 | 4/4 | YES | 0 | 0 | 21b2d4f97202 |
| R27 | F · CARD STUDIO | Card Studio · tablet | TABLET PORTRAIT + LANDSCAPE | `png/board-R27-card-studio-tablet.png` | 3400×2862 | 2/2 | YES | 0 | 0 | b7ce2bd265a2 |
| R28 | F · CARD STUDIO | Card Studio · desktop | DESKTOP | `png/board-R28-card-studio-desktop.png` | 3148×3678 | 3/3 | YES | 0 | 0 | ff5d502a2fe5 |
| R29 | F · CARD DESIGN | Referral card · front concepts | THREE TERRITORIES · 3.5 × 2 IN | `png/board-R29-card-front-concepts.png` | 3400×2880 | 6/6 | NO | 0 | 0 | b1f86c513f5c |
| R30 | F · CARD DESIGN | Referral card · back concepts | QR SIDE | `png/board-R30-card-back-concepts.png` | 3152×2240 | 6/6 | NO | 0 | 0 | 32f105ab216c |
| R31 | F · CARD DESIGN | QR validation | RO-07 · LINK CONTRACT | `png/board-R31-qr-validation.png` | 3287×2702 | 3/3 | YES | 0 | 0 | 32c58366da3b |
| R32 | F · CARD DESIGN | Digital card sharing | SHARE · COPY · DOWNLOAD | `png/board-R32-digital-card-share.png` | 3353×3798 | 7/7 | YES | 0 | 0 | 45a31699b7fa |
| R33 | F · CARD DESIGN | Print preview and proof | RO-10 | `png/board-R33-print-preview.png` | 3148×2172 | 2/2 | YES | 0 | 0 | 0fc395cf4203 |
| R34 | F · CARD DESIGN | Print-production specimen | BLEED · SAFE · CMYK · QR | `png/board-R34-print-production-specimen.png` | 3343×3334 | 3/3 | YES | 0 | 0 | e6c99997aa9f |
| R35 | G · PARTNER PORTAL | Partner portal · mobile home | SEPARATE SURFACE | `png/board-R35-partner-portal-mobile-home.png` | 3303×3082 | 4/4 | YES | 0 | 0 | a088114f7b71 |
| R36 | G · PARTNER PORTAL | Partner portal · my card | MOBILE | `png/board-R36-partner-portal-mobile-card.png` | 3140×2602 | 3/3 | YES | 0 | 0 | 00b663c0865e |
| R37 | G · PARTNER PORTAL | Partner portal · earnings | MOBILE | `png/board-R37-partner-portal-mobile-earnings.png` | 3140×2602 | 3/3 | YES | 0 | 0 | 642668812168 |
| R38 | G · PARTNER PORTAL | Partner portal · desktop | DESKTOP | `png/board-R38-partner-portal-desktop.png` | 3148×3678 | 3/3 | YES | 0 | 0 | fa70431a10fb |
| R39 | H · SHARED | Referral activity | ALL TIERS | `png/board-R39-referral-activity.png` | 3140×2180 | 3/3 | YES | 0 | 0 | dd87f81b01a2 |
| R40 | H · SHARED | Overlay system | RO-01 … RO-20 | `png/board-R40-overlay-system.png` | 3140×5451 | 20/20 | YES | 0 | 0 | 97eafc1d1be1 |
| R41 | H · SHARED | Responsive component matrix | M · TP · TL · D | `png/board-R41-responsive-component-matrix.png` | 3140×3146 | 4/4 | YES | 0 | 0 | e007c7c3aa57 |
| R42 | H · SHARED | Navigation and route tree | SIDEBAR · RAIL · MENU · BOTTOM BAR | `png/board-R42-navigation-route-tree.png` | 3400×2746 | 3/3 | YES | 0 | 0 | 3e5b62e5b4d5 |
| R43 | H · SHARED | End-to-end attribution journey | PARTNER → DF ARTIFACT | `png/board-R43-e2e-attribution-journey.png` | 3248×2808 | 4/4 | NO | 0 | 0 | f565f0e73e0d |
| R44 | H · SHARED | End-to-end commission and payout journey | PAYMENT → AUDIT | `png/board-R44-e2e-commission-payout-journey.png` | 3160×2189 | 4/4 | YES | 0 | 0 | 5ecd34e572fc |

## Card alternatives (three territories)

| Territory | Front | Back | Physical mockup | Finish + complexity |
| --- | --- | --- | --- | --- |
| A · ARCHITECTURAL EDITORIAL | R29 §01 | R30 §01 | R29 §02 | R29 §03 · doc 19 §2 |
| B · MINIMAL ACCESS CARD | R29 §01 | R30 §01 | R29 §02 | R29 §03 · doc 19 §3 |
| C · RED STRUCTURAL SIGNATURE | R29 §01 | R30 §01 | R29 §02 | R29 §03 · doc 19 §4 |

Each QR on these boards is a placeholder labelled **NOT VALID FOR PRINT**.

## Reproduce
```
python3 docs/site00/idnty/founder-workspace-referrals-authority-opus3/boards/src/make-shells.py
node docs/site00/idnty/founder-workspace-referrals-authority-opus3/boards/render-boards.mjs          # all, or: R01 R29 …
node docs/site00/idnty/founder-workspace-referrals-authority-opus3/boards/audit-layout.mjs           # 16 viewports
python3 docs/site00/idnty/founder-workspace-referrals-authority-opus3/boards/write-docs.py
```
