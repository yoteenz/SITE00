# iPhone Safari founder QA

**Status:** PENDING FOUNDER QA (agent did not run physical device)

**Prerequisite:** Redeploy staging to integration @ `255576b5` and confirm `VITE_DF_CUSTOM_INDUSTRY_SELECT=1` in SPA build.

## Manual script (20 steps)

1. Open https://carefree-luck-staging.up.railway.app/admin/site00/foundation-readiness and sign in with founder account.
2. Create test client — display name prefix: `IDNTY E2E ACCEPTANCE — SYNTHETIC`.
3. Copy the personalized `/foundation/…` link.
4. Open the link in **Safari** on iPhone.
5. Focus **Business name** text field — confirm Safari does not zoom unexpectedly (16px inputs).
6. Tap **BUSINESS TYPE** — confirm **editorial sheet** (not native wheel picker).
7. Confirm sheet title **SELECT BUSINESS TYPE** and squared panel with red edge.
8. Tap a type — sheet closes; value updates on trigger.
9. Tap **CANCEL** on a second open — value unchanged.
10. On **P03**, tap a service row — confirm **System B** checked mark (red period in ink box).
11. Tap again — confirm single toggle (no double flip).
12. Leave **CONTACT NUMBER** empty; attempt **CONTINUE** — message: `ENTER A CONTACT NUMBER TO CONTINUE.`
13. Enter `12` — attempt continue — `ENTER A VALID CONTACT NUMBER.`
14. Enter valid US or `+44 20 7946 0958` — continue when other fields satisfied.
15. Wait for **SAVED** only after save succeeds.
16. Pull to refresh — all values remain.
17. Close Safari tab completely.
18. Reopen the same link — values remain.
19. Complete intake when workflow allows — confirm completion layout unchanged.
20. On readiness desk, confirm client state matches intake.

## Optional VoiceOver

- Business Type trigger announces as button/combobox.
- Sheet options announce on selection.
- Checkbox checked/unchecked states announce.
- Required field and error messages announce once (no duplicate alerts).

## Record result

Reply with: PASS / FAIL + step number for any failure.
