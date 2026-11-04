# 16 · Founder review

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.


## See it

- `/production/jurnl/runtime/money?parent=motion` opens the parent (authority 01). Then:
  - a place → its page (02–05);
  - VIEW ALL ACCOUNTS → 06.
- From an account page: history (07–10), a row (11), details (12), balance review (13).
- `/money/transactions` → 31.
- Every overlay opens from the strips and buttons on those pages; doc 03 lists each one.

## Decisions for you

1. **Stat labels on 02:** keep SET ASIDE / NOT LEFT YET / ON ITS WAY IN, or use your AVAILABLE / HELD / PENDING? The values are canonical either way.
2. **Chips on 30–37:** your screens show search + add instead of back. I followed them; Escape and each screen's CANCEL / KEEP / BACK still close. Keep that, or add a back chip?
3. **Global menu on child pages:** no DOT 01 authority shows the shell's menu chip, so it is hidden there (it is on the parent). OK?
4. **Card payment guard in the DOT 02 transfer sheet:** DOT 01 refuses paying a card more than it owes, and cash below 0. Apply the same guard there?
5. **Making DOT 01 the default:** today it is active with the parent pilot (`?parent=motion`).

## Asset requests (would make more screens exact)

- the keychain, amphora and coin art (03–05) as layers;
- the engraved icon set;
- per-screen seal art.

The other 34 authorities are separate renders from the SIDEKICKs. Pixel-exact versions of those screens would need SIDEKICKs that match them.

## Blockers

| Blocker | Status |
|---|---|
| Live RLS proof | **PREREQUISITE_BLOCKED**: QA secrets are not available here; not run, not reported as failed |
| Cloud receipt storage | not built; needs your decision (private bucket + RLS). Photos stay on the device. |
| Paid OCR / AI extraction | not used; needs your approval before any spend |
| Real iPhone (Safari) receipt test | not available in this environment. HEIC photos decode only in Safari, and the tests ran in Chromium. |
