# 11 · Referral overlay (RO-01…RO-20) visual contract

**State:** the referral families are registered (`REFERRAL_OVERLAY_IDS`) and rendered by `ReferralOverlayBody.tsx` in the generic host. The policy gate overlay is retained.

**Authority:** OPUS3 `rf-overlays.js` (doc 07 §3 of the OPUS3 package). Presentation per tier:
- full: RO-01, 02, 05, 07, 09, 10, 13, 15, 17, 18, 19;
- sheet: RO-03, 04, 06, 08, 12, 16, 20;
- dialog on tablet and desktop;
- popovers: RO-06 and RO-08;
- inspectors: RO-11 and RO-14.

**Guardrails kept:**
- SEND PAYMENT is absent.
- APPROVE does not pay.
- Print export stays disabled until the six gates pass.
- No terms are pre-filled.

**Not changed in this pass.** It rides on the shared overlay-host recovery (doc 10) once the founder approves the Overview proof.

**Not claimed:** visual verification of the 20 referral overlays.
