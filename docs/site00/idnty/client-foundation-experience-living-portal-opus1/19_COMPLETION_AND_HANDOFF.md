# 19 — Completion and Handoff (Families O, P)

Boards: **M18, M19**, TP10, TL10, D19, UW04.

## Final verification (O)

- **Hero:** "FINAL VERIFICATION."; "SITE 00 IS CHECKING EVERY PART OF YOUR FOUNDATION BEFORE HANDOFF."
- **CHECKS list:** DOMAIN RESOLVES · EMAIL SENDS AND RECEIVES · SPF · DKIM · DMARC · YOUR PHONE SIGNS IN · RECORDS COMPLETE. Each row has its real state and date ("PASSED · OCT 20") or NOT STARTED.
- When all checks pass, the last row becomes NEEDS YOU: "READY FOR YOUR REVIEW", with the CTA REVIEW MY HANDOFF RECORD (client action REVIEW_FINAL_RECORD, which exists).

## Completion (P): "YOUR FOUNDATION IS ESTABLISHED"

- **Hero** (locked headline): "YOUR FOUNDATION IS ESTABLISHED." / "YOUR DOMAIN, EMAIL AND SECURITY ARE IN PLACE, VERIFIED AND OWNED BY YOU. YOUR RECORDS ARE READY."
- **Strip:** all 7 stages DONE.
- **WHAT YOU OWN:** DOMAIN · BUSINESS EMAIL · SECURITY · RECORDS. CTA VIEW MY RECORDS.
- **WHEN YOU'RE READY** (secondary column):
  - "BUILD ON YOUR FOUNDATION — A WEBSITE OR STOREFRONT ON THE DOMAIN YOU NOW OWN. NOTHING IS SCHEDULED OR CHARGED. TELL US ONLY IF YOU'RE INTERESTED."
  - The link "I'M INTERESTED" uses the existing `build-interest` action.
  - After it is used, the line reads "YOU ASKED US ABOUT THIS ON <date>. SITE 00 WILL REPLY BY EMAIL." with the chip INTEREST SENT (BUILD_OPPORTUNITY / BUILD_UPSELL surface).
- **Trust line:** "YOUR FOUNDATION STAYS YOURS. THIS LINK STAYS OPEN FOR YOUR RECORDS."

**No automatic upsell.** There are no modals, pricing, countdowns or pre-checked boxes. The build opportunity is preserved as a quiet opt-in, as direction 15 requires.

## Source

`DigitalFoundationCompleteSurface` (sentence case, older stylesheet) is replaced by this composition inside the DF grammar. Its `build-interest` behaviour is kept.
