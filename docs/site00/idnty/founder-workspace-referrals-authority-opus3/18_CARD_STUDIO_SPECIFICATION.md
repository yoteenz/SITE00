# 18 · Card Studio specification

Boards: R26–R28 (studio), R29–R34 (artwork, QR, share, print), R36 (portal). Components RF-070…RF-079; overlays RO-07…RO-10.

**Scope: System B only** — IDNTY Digital Foundation referral cards that lead prospects into the DF entry flow (`/invite/:code`). System A (SITE 00 studio business cards) is out of scope and never mixed in. Card Studio is **connected to attribution, not decorative**: every card is bound to one partner, one link and one template version.

## 1. Layout
| Tier | Composition |
| --- | --- |
| Desktop (stage ≥ 1440) | Partner picker (280) \| stage: card ≤ 520 + FRONT/BACK + template picker A/B/C \| controls (380): referral link, print gate, share / digital PNG / print package |
| Tablet landscape / stage 920–1439 | Stage \| controls |
| Tablet portrait, mobile | Partner line → FRONT/BACK → card (full width) → templates → link → print gate → share |

## 2. The fifteen functions

| # | Function | Behaviour | Gate / rule | Overlay / component |
| --- | --- | --- | --- | --- |
| 1 | Select partner | Picker lists ACTIVE partners; PLANNED partners can be previewed as DESIGN ONLY | No link for non-ACTIVE | RF-070 |
| 2 | Select template | Territory A / B / C (radiogroup) | Template version recorded | RF-073 |
| 3 | Flip front / back | Segmented control | — | RF-071 |
| 4 | Preview at true ratio | 3.5 × 2 in, cqw-scaled type | Card never overflows | RF-071 |
| 5 | Bind referral link | Shows masked `site00.com/invite/••••••`, route, target, status | Only an issued, ACTIVE code | RF-036 |
| 6 | Generate QR | Real QR from `renderInvitationQrSvg` **only after** validation; otherwise a non-scannable placeholder labelled NOT VALID FOR PRINT | QR payload = public URL only | RF-072 |
| 7 | Validate QR / link | HTTPS · resolves to this partner · target = DF entry · production origin · no admin path or secret · real-device scan recorded | All must pass | RO-07, RF-076 |
| 8 | Record device scan | Founder scans with a phone, confirms landing, records device + time | Required for print | RO-07 |
| 9 | Copy link | Copies the full URL to the clipboard; display stays masked | ACTIVE code | RF-075 |
| 10 | Share digital card | Web Share API sheet → partner's own apps; SITE 00 sends nothing | FD-R15 | RO-08 |
| 11 | Download digital PNG | Front/back PNG for screens (not for print) with the real QR once validated | Validation pass | RO-09 |
| 12 | Print proof | Bleed / trim / safe proof with real artwork; APPROVE / REJECT | Gate items 1–5 | RO-10, RF-077 |
| 13 | Print gate | Checklist: partner exists · link valid · QR verified · template approved · copy approved · print spec confirmed | All six → export enabled | RF-074 |
| 14 | Export print package | Per-side PDF (CMYK, bleed) for the printer | Gate passed; never with placeholder or staging QR | RF-078 |
| 15 | Track batch | NOT_PRINTED → PROOF → PRINTED → DISTRIBUTED → RETIRED (existing `print_status`) | Revoking the code retires the batch | RF-079 |

## 3. States
- **DESIGN ONLY:** a planned partner, or a partner with no link. QR placeholder; export disabled.
- **DIGITAL READY:** link valid + QR validated (staging allowed for digital testing only, marked TEST).
- **PRINT BLOCKED · n OPEN:** at least one gate item is open (the specimen shows *BLOCKED · 5 OPEN*).
- **PRINT READY:** all six pass. Export is enabled and the proof is approved.
- **RETIRED:** code revoked. Cards resolve to the public *no longer active* page.

## 4. Copy (all PROPOSED, FD-R13)
- **Front:** `SITE 00` · `DIGITAL FOUNDATION.` · `DOMAIN · PROFESSIONAL EMAIL / SECURITY · OWNERSHIP RECORDS`.
- **Back:** `SCAN TO BEGIN / YOUR DIGITAL FOUNDATION` · `THE SITE 00 SETUP FOR YOUR BUSINESS IDENTITY ONLINE` · `site00.com/invite/<code>` · `INTRODUCED BY / <PARTNER DISPLAY NAME>`.
- **Never on a card:** rates, terms, partner email, partner id, admin ids, banking data, secrets, or the words *partner referral* (prospect-facing copy names the product, not the programme).

## 5. Print path (mandatory order; board R33)
POLICY APPROVED → PARTNER CREATED → DURABLE LINK → STAGING VERIFIED → PRODUCTION URL VERIFIED → TEMPLATE APPROVED → REAL QR → PHONE SCAN → EXPORT → PRINTER PROOF → PRINT.
Skipping any step is not possible in the UI and is rejected by the server.
