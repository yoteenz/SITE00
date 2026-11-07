# 20 · FOUNDER ACCEPTANCE SCENARIO — 33 / 33

Test: `tests/jurnl/banking/founderAcceptance.test.ts`. It is deterministic and uses **synthetic values only**.

**Real in this test:**
- the JURNL server banking service;
- every JURNL migration, run on disposable Postgres;
- the encrypted vault;
- the atomic sync;
- webhooks;
- disconnect;
- the client import and reconciliation;
- the device repository in PRODUCTION mode;
- Safe to Spend;
- the compare-and-swap snapshot.

**Synthetic:**
- the institutions (scripted provider);
- the auth user rows in steps 1–3. These model Supabase Auth's record and do not exercise a real Auth server or email delivery.

**This is not live banking verification.**

| # | Step | Assertion |
|---|---|---|
| 01 | registers | an auth user row is created |
| 02 | verifies email | sign-in is refused until the address is confirmed |
| 03 | signs in | the real account starts **empty** (no sample data) |
| 04 | founder entitlement | server-side grant: SERVER_VERIFIED, FOUNDER_FULL, no subscription |
| 05 | connects checking | server exchange, encrypted token, first sync |
| 06 | connects the rideshare card | separate Item |
| 07 | connects a credit card | 3 Items |
| 08 | balances imported | provider available balance, card owed and limit |
| 09 | transactions imported | both provider rows present |
| 10 | rideshare payout identified | KNOWN_PAYER, RIDESHARE PAYOUT |
| 11 | cash tips | daily earnings: payout + 22 cash; income = 146.80 + 22 (counted once) |
| 12 | cash purchase | Cash on Hand 40 + 22 − 15 |
| 13 | grocery imported | via webhook → sync: CREDIT_PURCHASE · FOOD · GROCERIES |
| 14 | checking → card transfer imported | both legs |
| 15 | legs matched | AUTO_MATCHED TRANSFER; income unchanged |
| 16 | card payment imported | both sides |
| 17 | one liability payment | CREDIT_PAYMENT on both legs; spending excludes it; card owed from the provider |
| 18 | monthly subscription | 15.99 · MONTHLY |
| 19 | upcoming bill | 900 due on the 12th, in the bill lines |
| 20 | reserve for the bill | 300 set aside; no bank movement fabricated |
| 21 | Safe to Spend recalculates | reserved 300 inside the bill (the value is unchanged); cash = provider balances + manual cash; bank facts dated |
| 22 | modified pending | pending 38 → 41.50 |
| 23 | no double count | pending → posted on one entry; spending counts 41.50 once |
| 24 | category edited | HEALTH · PHARMACY (YOUR_CORRECTION) |
| 25 | sync again | provider revises the merchant; the original updates |
| 26 | override intact | still HEALTH; no duplicate ids |
| 27 | signs out | snapshot saved (revision 1); device cache purged |
| 28 | signs in again | revision-based hydrate → USE_SERVER |
| 29 | records restore | transactions, accounts and Safe to Spend equal |
| 30 | another device | no local copy at all |
| 31 | same server state | equal; a stale write is refused (JR409) |
| 32 | disconnects an institution | provider revoked; history kept |
| 33 | accurate status | DISCONNECTED; the others UP TO DATE; it cannot sync or reconnect without a new Link |

## Defects found by this scenario and fixed

- A daily-earnings leg recorded after the bank's balance timestamp was added on top of a provider balance that already contained the matched payout. Fixed: a user entry the bank already reported never adds to the provider balance.
