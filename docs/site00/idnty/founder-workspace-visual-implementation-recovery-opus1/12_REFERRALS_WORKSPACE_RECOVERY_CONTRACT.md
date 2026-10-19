# 12 · Referrals workspace recovery contract

**Preserved now:**
- the REFERRALS route `/admin/site00/founder-workspace/referrals`;
- sidebar `06 REFERRALS`, its rail item, and the menu row;
- the bottom bar shows nothing selected on REFERRALS (verified at 390);
- the referral policy config (`config/referralPolicy.ts`) is untouched: STANDARD $25 · ESTABLISHED $35 · STRATEGIC MAX $50 · AIO initial proposal $50 · absolute cap $50 · qualifying product $500 IDNTY base · attribution 90 days · payment hold 14 days · payout target monthly 15th · manual external payout only;
- no automatic commission or payout, no AIO activation, no unsecured partner portal, and no print-ready claim.

**Next checkpoint (after approval):** port the OPUS3 page compositions with the same method as the Overview:
- `rf.css` → scoped stylesheet;
- `rf-kit` / `rf-pages` markup → React (signals, partner registry, partner detail with seven sections, attribution ledger and trace, commissions ledger and inspector, payouts with RECORD ≠ SEND, Card Studio with placeholder QR labelled NOT VALID FOR PRINT, activity).

Bind each to the existing data where it exists, and show policy and gap states where it does not.
