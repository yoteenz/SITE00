# 06 — Asset integration changelog

- Added `public/site00/idnty/referral-card/aio/*.jpg` (founder originals).
- Added `config/referralCardAssets.ts` (AIO-only mapping, `REFERRAL_CARD_PRINT_READY = false`).
- `FounderCard`: approved partners render `<img>`; others keep CSS placeholder.
- Card studio caption updated to state artwork is approved but link/QR unverified.
- Tests: `tests/idntyReferralCardAssets.test.ts`.

No Card Studio layout redesign. No referral policy or Stripe changes.
