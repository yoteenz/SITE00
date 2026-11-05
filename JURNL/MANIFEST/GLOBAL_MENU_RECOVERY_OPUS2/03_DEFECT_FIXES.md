# 03 · Defect fixes

## D-02 · Safe to Spend buffer currency unit

`data/f09/safetyBuffer.ts` is now the single owner of the buffer field.

* **Root cause.** The buffer was typed in the display currency but stored and subtracted as USD. Also, `AccountScreen` drew a
  hard-coded `$`.
* **Fix.**
  * **Storage.** Canonical USD in `settings.safeToSpendBuffer`, kept to 4 decimals so a re-save does not drift.
  * **Display.** Stored USD × the display rate, rounded to the currency's own digits (JPY has none).
  * **No rate** (non-USD display, rate missing or older than 7 days): nothing is converted and nothing is saved. The field is
    disabled and says why.
  * **Cached rate** (stale, between 1 and 7 days): it still converts, and the notice says the rate is cached.
  * **Legacy values** were already applied as USD, so their meaning does not change and nothing is migrated.
  * **Formula unchanged.** `safetyBufferFromSettings()` and the Safe to Spend formula (`safeToSpend.ts:328`) are untouched, so the
    amount is converted only once.
  * **Labels.** The page, the drawer and the menu label the field with the currency code and the correct symbol.
* **Tests.** Unit B1–B8 cover:
  * USD, non-USD, switching currency;
  * repeated saves, stale rate, expired or missing rate;
  * persistence, derivation, the legacy value, no double conversion;
  * the disabled save.

  E2E R4 checks that 92 EUR is stored as USD 100 and reads back as 92 after a reload.

## D-01 · ASK JURNL CONTEXT consent

* **Root cause.**
  * `consentSync.ts:21-22` wrote `ASK_JURNL_CONTEXT = naturalLanguage || personalizedInsights` on every AI sync.
  * `askJurnl.ts:39` also opened on `AI_NATURAL_LANGUAGE`.
  * `setAsk` turned `naturalLanguage` on whenever context was granted.
* **Fix.** The context is its own consent. Only its own switch writes it (`useAskContextConsent`), the AI sync never touches it, and
  the explanation opens only when it is granted.
* **Tests.** Unit C1–C5: AI on does not imply context; OFF stays OFF through repeated syncs; ON survives AI off; the gate; the
  switch state. E2E R5: OFF stays OFF after saving the AI choices and after a reload.

## D-05 · Misleading data-export confirmation

* **Root cause.** F01.11 set `device.exportRequested` and showed "WE'LL SEND YOUR DATA TO YOUR EMAIL SOON." with no pipeline behind
  it (claim C10, already flagged).
* **Fix.**
  * The sheet says "NOT AVAILABLE YET … NOTHING HAS BEEN REQUESTED, AND NOTHING WILL BE SENT".
  * There is no request button, and no file formats are promised.
  * C10 is now `WITHHELD`.
  * A device that recorded a request in an earlier preview is told that nothing was ever prepared or sent.
* **Tests.** Unit E1 and E2E R6.

## D-03 · Sign-out normalization

* **Root cause.** At all three entries (menu, ACCOUNT page, drawer), sign-out happened with no confirmation, the surface stayed open,
  and the user stayed on the app route as PREVIEW GUEST.
* **Fix.** One `SignOutConfirm` (the F01.04 copy) does, in order:
  1. `signOut()` (unchanged: the session resets, and Supabase `signOut` runs in production);
  2. closes every panel;
  3. goes to `F01.00` (entry).

  The entry route also clears the stack, and the corner chrome is hidden there.
* **Tests.** E2E R7 checks: cancel keeps the session; confirm lands on `/entry`; no overlay remains; the session is `SIGNED_OUT`.

## D-04 · No-op and placeholder controls

See 02 (ten placeholders). Also, DISABLE AI FEATURES now syncs to the repository consent records, where before it only changed the
device toggles.

## MR-5 · Currency disclosure

`ExchangeDisclosure` (under the currency list) shows:
* `RATE UPDATED <date> · USD <rate> <code>`, or `CACHED RATE …` when the rate is stale;
* the source ("OPEN EXCHANGE RATES API, USD BASED … NOTHING IS EXCHANGED");
* when there is no rate: "NO EXCHANGE RATE AVAILABLE. AMOUNTS ARE SHOWN IN USD".

When a currency has no rate, the sheet stays open and says so. The previous code closed it silently.
