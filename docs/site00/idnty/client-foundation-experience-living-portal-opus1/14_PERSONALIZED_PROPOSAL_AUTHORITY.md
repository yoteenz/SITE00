# 14 — Personalized Proposal Authority (Family I)

Boards: **M13**, TP03, TL03, D13, UW02.

## Composition

- **Hero:** rail `03 —— PERSONALIZED PROPOSAL`; headline "YOUR PROPOSAL IS READY."; lede "PREPARED FOR <BUSINESS>. APPROVED BY SITE 00 BEFORE IT REACHED YOU."; version chip `PROPOSAL V2 · OCT 15`.
- **Version notice** (when v > 1): "YOUR PROPOSAL WAS UPDATED — SITE 00 ADDED DNS CLEANUP AFTER REVIEW (+$150). PROPOSAL V1 CAN NO LONGER BE ACCEPTED OR PAID. NOTHING CHANGED WITHOUT TELLING YOU." V1 is shown struck (`cf-ver--old`) next to `V2 · CURRENT`.
- **Founder note** (optional): an ink notice "A NOTE FROM SITE 00" with the founder's own sentence. It needs a client-safe `client_note` on the quote (G-23).
- **YOUR SCOPE:** a quote table.
  - Each row has name, sub-line, price and a classification: BASE · RECOMMENDED · REQUIRED · OPTIONAL. Items the founder added carry an `ADDED BY SITE 00` chip.
  - The total row has a white fill, 1.5px ink top rule and a 34px display figure. Its caption: "USD · THIRD-PARTY SUBSCRIPTIONS MAY BE SEPARATE".
- **WHY THIS SCOPE** (D/UW right column; below on phone): three facts drawn from the intake. Recommendation reasons come from G-25.
- **TIMING:** "2–3 BUSINESS DAYS AFTER PAYMENT AND WHAT WE NEED FROM YOU. NOT A GUARANTEED DATE."
- **Actions:** REVIEW MY OPTIONS (outline) · ACCEPT PROPOSAL V2 (primary) · REQUEST CLARIFICATION (link).

## Pricing (example only)

| Item | Example price |
|---|---|
| Base Digital Foundation | $500 |
| Mailbox | $75 |
| Domain | $100 |
| Transfer | $100 |
| Recovery | $150 |
| Migration | $200 |
| Multi-user | $150 |
| Routing | $100 |
| Signature | $150 |
| Device | $50 |
| DNS cleanup | $150 |
| Site conflict | $150 |

These are the sprint's **example** figures. Boards label them "EXAMPLE PRICING · NOT A CHARGE", and pages carry "EXAMPLE PRICING FOR AUTHORITY REVIEW — NOT A LIVE CHARGE. THE LIVE CATALOG IS THE SOURCE OF TRUTH." The live amounts come from `addonCatalog` / `commercialConfig` and the quote engine. The UI never hard-codes a price.

## Rules

- A proposal is visible only after founder approval (G-02).
- Prices never change silently. Any change is a new version with a notice and re-acceptance.
- No "limited time", no strike-through discount theatre, no urgency copy. Quote expiry (14 days) is stated only on the acceptance page and in the reminder email.

## Request clarification (CF-CLARIFY)

The REQUEST CLARIFICATION link opens a short message sheet: "ASK SITE 00 ABOUT YOUR PROPOSAL", a text field and SEND.
- Success: "SENT · SITE 00 WILL REPLY BY EMAIL".
- Today `send-message` requires PAID, so this needs a pre-payment message channel (G-18).
- Until then, the link falls back to "REPLY TO YOUR PROPOSAL EMAIL" guidance.
