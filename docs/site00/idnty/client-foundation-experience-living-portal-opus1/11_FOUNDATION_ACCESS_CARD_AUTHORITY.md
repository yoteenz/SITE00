# 11 — Foundation Access Card Authority (Family G)

Boards: **M09**, AH06–AH10, TP08, TL08, D11.

The access card is the secondary convenience: a card the client keeps in their photos or prints for their desk. It is **not** a key (`12`).

## Face (340 × 214 design units, credit-card ratio 1.586)

| Zone | Content |
|---|---|
| Brand (top left) | SITE 00 (Saira 600, 0.26em) / DIGITAL FOUNDATION (10px, 0.28em, muted) |
| Title (left, centred vertically) | MY / FOUNDATION + red square period ('SITE 00 Display' 900, 34px) |
| Meta (bottom left) | Business name (from intake) · REF `<client-safe reference>` · CARD `<n>` · hairline · SCAN · CONFIRM BY EMAIL |
| Code (bottom right) | 84px QR on a `#f3f2ef` tile, error-correction M, quiet zone inside the tile · SCAN TO RETURN |
| Accent | Red-glass bar (44 × 112) top right, with a pale glass outline. The palette is `DfCrownObject`'s |

Variants:
- **dark**: the default; `#0c0c0c` background.
- **light**: printable; `#f9f8f6` with a hairline and no glass bar, to save ink.
- **tall**: wallet-style image, 250 × 404, with the QR at the bottom.
- **void**: superseded preview, with a red VOID over the QR.

**Distinct from the referral card.** It does not reuse AIO / referral card art, layout or QR system. Referral codes keep their own namespace and routes (`site00-referrals`), and the access card has its own card id namespace on `/foundation/return`.

## Outputs

| Output | Spec | Delivery |
|---|---|---|
| PNG | 1600 × 1008 (≈ 4.7× the design), sRGB, metadata stripped | DOWNLOAD IMAGE → file `my-foundation-card.png` |
| Share image | 1080 × 1350 portrait: the card on `#f3f2ef` with the line "SITE 00 · MY FOUNDATION · SCAN, THEN CONFIRM BY EMAIL" | SHARE IMAGE → `navigator.share({ files })`, falling back to download. Shares the **image only, never a link** |
| PDF | A4 landscape (Letter alternative): the card at true size 85.6 × 54 mm with a dashed cut line, how-to-return steps and a footer stating nothing secret is printed | SAVE AS PDF |
| Wallet-style image | 750 × 1212 tall card | SAVE TO PHOTOS. Copy says "WALLET-STYLE IMAGE — NOT AN APPLE WALLET OR GOOGLE WALLET PASS" |
| Preview | The card at 300 (M) / 420 (TP) / 460 (TL+) | inline |

No "ADD TO APPLE WALLET" or "SAVE TO GOOGLE WALLET" button exists until there is pass infrastructure and founder approval (OD-06).

## Page composition (`ACCESS_CARD` view)

Hero "YOUR ACCESS CARD" → preview → DOWNLOAD IMAGE (primary) · SHARE IMAGE (outline) · SAVE AS PDF (ghost) → REPLACE MY CARD link → WHAT THE CODE DOES (3 rows) → NEVER ON YOUR CARD. On TL+ the preview and actions sit in the left column and the explanations in the right.

## States

| State | Copy / UI |
|---|---|
| Generating | Button busy "PREPARING YOUR CARD…" |
| Download confirmed | Toast "ACCESS CARD SAVED · PNG · 1600 × 1008" |
| Share opened | Toast "SHARE SHEET OPENED · IMAGE ONLY, NO LINK" |
| Save failed | Red toast "COULDN'T SAVE THE IMAGE · TRY AGAIN" |
| Replace | Dialog: VOID preview + "YOUR CURRENT CARD (CARD 2) STOPS WORKING IMMEDIATELY…" with REPLACE CARD / KEEP CURRENT CARD |
| Not available | No verified session: the ACCESS CARD entry asks the client to confirm by email first (the card is issued only to a verified session) |
| Reentry error | Scanning a replaced card leads to the reentry state REVOKED (`13`) |

## Interaction (CF-ACCESS-CARD)

| Field | Value |
|---|---|
| Purpose | Give the client a physical or photo reminder that leads back |
| Trigger | ACCESS CARD in the menu / sidebar / status column |
| Initial | Preview of the current card version |
| Data | `card_id`, `card_version`, `business_name`, `client_ref` (server-issued, G-11) |
| Action | Download, share, PDF, wallet-style, replace |
| Loading | PREPARING YOUR CARD… |
| Success | Toast per output |
| Error | Save failed toast; replace failed: alert, the old card stays valid |
| Disabled | No verified session · artifact ARCHIVED |
| Responsive | Stacked (M/TP) · two columns (TL+) |
| Accessibility | Card is `role=img` with `aria-label`; actions are buttons; the QR has the text alternative "SCAN TO RETURN — OPENS SITE00.COM/FOUNDATION/RETURN" |
| Security | Card id only (`12`). Generated from the verified session. No token, PII or secrets in pixels or metadata |
| Owner | Composer (client render) + API (card id issue/revoke, G-11) |
