# 15 · Currency & exchange audit

**CURRENCY_EXCHANGE_STATUS: ACTIVE_BUT_PARTIAL and HIDDEN.** Display-currency conversion from canonical USD works, with live rates and
honest fallback. It is reachable only via PREFERENCES → AccountDrawer or the ACCOUNT page. A historical rate disclosure was lost. No
standalone converter exists, and none was invented.

## Current (VERIFIED_CURRENT_CODE @ `4ddbac6ce`)

| Capability | Evidence |
|---|---|
| Canonical currency | `data/home/currency.ts:3,18`: "Stored amounts stay in canonical USD", `BASE_CURRENCY = 'USD'` |
| Supported currencies | 20 codes (USD, EUR, GBP, CAD, AUD, JPY, CHF, CNY, INR, MXN, BRL, KRW, SGD, HKD, NZD, ZAR, AED, NGN, GHS, JMD) from `JURNL/MANIFEST/JURNL_CURRENCY_CATALOG.json` (`currency.ts:8`) |
| Formatting | `Intl.formatToParts`, symbol position prefix or suffix (`currency.ts:67-77`) |
| Display preference | localStorage `jurnl.currency` (`:10,133`) **and** repository `settings.displayCurrency` (`data/foundation/settings.ts:6,30`), written only on success (`runtime/screens/SettingsScreens.tsx:22`) |
| Rate source | `https://open.er-api.com/v6/latest/USD` (`currency.ts:12`), keyless; contract `JURNL/MANIFEST/JURNL_EXCHANGE_RATE_CONTRACT.json` |
| Rate timestamp and cache | fresh for 24 h, usable up to 7 days; `RateBook.retrievedAt` / `providerUpdatedAt` (`currency.ts:16-17,30-36`) |
| Fallback | "Missing rates stay in USD. They never become a fake symbol swap." (`:452-455`). `setCurrency` returns false with `RATE_UNAVAILABLE_COPY` (`:282-287`) |
| Selection UI | `CurrencySheet` (`SettingsScreens.tsx:8-33`), opened from the ACCOUNT page (`AccountScreens.tsx:203`) and the drawer (`:355`) |
| Transaction currency | Quick Add stores `originalAmount / originalCurrency / conversionRateUsed / conversionTimestamp` (`currency.ts:458-474`; `runtime/global/GlobalSheets.tsx:123,159,164`; `data/home/moneyTypes.ts:66`). No other entry path does. |
| Cross-currency accounts | **NOT_PRESENT**: `JurnlAccountRecord.currency` exists (`accounts.ts:21`) but is always `'USD'` (`accountMutations.ts:34`, `accountSeed.ts:36`) |
| Converter / estimate tool | **NOT_PRESENT**: `resetCurrency` / `clearRateBook` exist (`currency.ts:343,261`) but are unexported and unused |
| FX execution | **NOT_PRESENT, and must not be implied** |

## Historical (VERIFIED_HISTORICAL_CODE)

| SHA | Date | Finding |
|---|---|---|
| `d2915e32d^` | before 2026-10-05 | `currency.ts:2-3`: "Changing the preference changes the symbol. It does not convert historical amounts. There is no foreign-exchange rate." Only USD / EUR / GBP. |
| `d2915e32d` | 2026-10-05 | "fix(jurnl): convert display amounts from canonical USD". The currency sheet in `runtime/screens/HomeScreens.tsx:302-308` showed **rate status**: `{fx.error ? …}` and `{fx.disclosure ? <p className="jrn-currency__rate">RATE UPDATED … · USD x CODE</p>}` |
| `4c1d19378` | 2026-10-05 (Wave 1) | the selector moved to Settings; **the rate disclosure was dropped**. `useExchangeState` / `disclosure` are still exported (`data/home/money.ts:24,27`), but nothing in `runtime/` reads them. |

**Regression CUR-R1 (confirmed):**
* Before: the currency sheet disclosed the rate and its update time, and showed fetch errors.
* Since `4c1d19378`: neither is shown.
* Also: the sheet closes silently on failure (`SettingsScreens.tsx:21-24`).

The exchange contract still says "The Ask Jurnl sheet may show RATE UPDATED and 1 USD = X TARGET". The current Ask sheet shows no rate.

## Other defects

* **CUR-D1.** The two stores can disagree. Ask context reads `settings.displayCurrency` (`data/foundation/askJurnl.ts:33`), while `formatMoney` reads the
  localStorage value.
* **CUR-D2.** The buffer currency-unit defect (14 BUF-1).

## Required distinctions (sprint §15) for the UI

| Concept | UI | Status |
|---|---|---|
| DISPLAY CURRENCY | selector; "AMOUNTS ARE STORED IN USD AND SHOWN IN EUR" | exists (hidden) |
| CURRENCY CONVERSION ESTIMATE | rate line "1 USD = 0.92 EUR · RATE UPDATED 9:00 AM · ESTIMATE" plus an optional calculator | disclosure lost (CUR-R1); calculator never existed: PROPOSED_FUTURE_FEATURE (FD-08) |
| ACTUAL FX EXECUTION | never offered; copy "JURNL DOES NOT EXCHANGE MONEY" | — |
| Multi-currency accounts | blocked by FI audit OD-04 (scenario 32 quarantines non-USD) | — |

## States needing a composition

* CURRENCY & EXCHANGE as a menu destination (selector, rate disclosure, stale or unavailable states, optional estimate calculator). The
  current `CurrencySheet` is a `JurnlDrawer` list with no editorial composition. It goes in batch B08.
