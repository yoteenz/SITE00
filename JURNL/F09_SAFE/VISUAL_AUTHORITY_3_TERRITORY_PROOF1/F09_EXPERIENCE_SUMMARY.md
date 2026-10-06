# F09 SAFE TO SPEND — Experience Summary

**What this is.** The experience truth the territories were built on. It was assembled before any concepting from:
- the F09 brief and expression tree
- the structural blueprint
- the formula (`data/f09/safeToSpend.ts`)
- the firewalled functional forensic of the current screens: function only, no layout

**No Experience Brain contract.** JURNL has no Workspace Experience Brain contract. This summary is the closest substitute, and it is **not** a canonical contract. See the scorecard.

## The answers

**WHAT DOES SAFE TO SPEND ACTUALLY HELP THE USER DECIDE?**
Whether, and how much, they can spend on discretionary things *right now* without breaking anything they have already committed to. Commitments are:
- bills
- what the plan assigns
- goal set-asides
- trip and purchase reserves
- their own protected amount and safety buffer

It is a permission signal, not a budget: *Give a clear signal after obligations and intentions.*

**WHAT MUST BE UNDERSTOOD IN UNDER FIVE SECONDS?**
1. **The figure, with its sign.** CLEAR TO SPEND $X, or OVER BY $X when `value < 0`.
2. **How sure the reading is.** The completeness state in plain words: a full reading, an estimate, or cannot say yet.
3. **That something is already held back, and roughly how much.** The relationship, not the line items.

**WHAT SHOULD ONLY APPEAR ON INSPECTION?**
- Each held-back amount and its source: ACCOUNTS / MOCK, SETUP, PLAN, GOALS.
- Cash total and where it comes from.
- How each factor can be changed.
- The full reading (F09.WHY).

The brief is explicit: *Why stays closed.*

**WHAT IS THE MOST IMPORTANT NUMBER / STATE / RELATIONSHIP?**
`value` relative to what is held back from cash, together with its completeness. The bare number alone is F03 TODAY's job (*Today previews the figure inside a journal. This room is only the signal.*). F09 must show the number *as a remainder*.

**WHAT CAN CHANGE THAT NUMBER?**

| Field | Changed by |
|---|---|
| cash | F05 add / edit / archive place · Quick Add MOVEMENT · F06 receive income · F10 mark bought · F04 edit / delete of added rows |
| upcoming | F07 add / edit / end an obligation; setup obligations without amounts (→ PARTIAL) |
| protected | F02.06 setup · F09 CHANGE WHAT’S HELD |
| safetyBuffer | F09 CHANGE WHAT’S HELD · Account settings |
| assigned | F08 assign / remove |
| goalReserved | F14 set aside (stops counting when the goal completes) |
| tripReserved | F11 FUND THE TRIP (target alone does not count) |
| purchaseReserved | no UI writes it today (functional gap) |
| *not* an input | F13 paydown simulation; targets alone; income sources (except received income) |

**WHAT DOES THE USER DO NEXT?**
- **Act with confidence outside the app.** Most of the time this is the real next step.
- **SEE THE FULL BREAKDOWN** (`safe/why`, the primary action on the page).
- **CHANGE WHAT’S HELD** (hold sheet → confirm → save).
- **PLAN.**
- **Consider one purchase in F10.** *Purchases asks about one object inside that breath.* F10 reads the value; there is no direct F09 → F10 link today.
- **Recover a weak reading.** Finish setup, add a cash place, or add bill amounts. These recovery actions are **not built**. See the open decisions.

## Contract fields

**PRIMARY USER QUESTION**
WHAT CAN I ACTUALLY SPEND WITHOUT UNDERMINING MY PLANS? (in the UI: WHAT CAN I SPEND WITHOUT UNDOING THE PLAN?)

**PRIMARY DECISION**
Spend now / hold off.

**PRIMARY OBJECT**
The safe-to-spend value as the open remainder of cash after what is held back.

**PRIMARY ACTION**
SEE THE FULL BREAKDOWN → `safe/why`.

**SECONDARY ACTIONS**
- CHANGE WHAT’S HELD (sheet)
- PLAN (→ `plan`)
- ASK JURNL (chrome; consent-gated; explanation only)
- ACCOUNT (chrome)
- BACK TO TODAY (chrome)
- QUICK ADD (nav +, MOVEMENT)
- NEXT / BACK TO SCREEN n (pagination)

**DATA INPUTS**
- cash: eligible accounts plus the ADDED ledger delta, or MOCK
- upcoming: all active obligations, no date window
- protected
- safetyBuffer
- assigned
- goalReserved
- purchaseReserved
- tripReserved
- setup flags: started, accounts, cadence, amount

**DERIVED VALUES**
- `value = cash − Σ held`. In UNSTATED, upcoming is not deducted.
- `heldTotal = max(0, cash − value)`
- `below = value < 0`
- completeness
- source fields
- `unknownUpcoming`

**DEPENDENCIES**
- Registry: F05 and F07.
- In practice: F02, F04, F05, F06, F07, F08, F10, F11, F14, settings and Quick Add.

**UPSTREAM FAMILIES**
F02 SETUP · F04 ACTIVITY · F05 MONEY · F06 INCOME · F07 UPCOMING · F08 PLAN · F10 PURCHASES · F11 TRIPS · F14 GOALS.

**DOWNSTREAM FAMILIES**
- F03 TODAY: same value, read-only, with its own SEE WHY that does not open F09.
- F10 PURCHASES: affordability verdicts NOW / WAIT / NOT_YET.
- F11 TRIPS: “TODAY · $X SAFE TO SPEND”.
- F15 AHEAD: SAFE TO SPEND NOW.
- Ask JURNL context.

**STATES**

| State | Exact trigger | Current state line (verbatim) |
|---|---|---|
| COMPLETE | otherwise | WHAT YOU CAN SPEND NOW WITHOUT TOUCHING BILLS, PLANS OR WHAT YOU’RE HOLDING. |
| PARTIAL | an obligation has no amount | AN ESTIMATE. SOME BILLS OR AMOUNTS ARE STILL MISSING. |
| UNSTATED | accounts skipped, or no cadence and no amount | NOT ENOUGH IS KNOWN YET TO SAY. |
| NEEDS_SETUP | setup not started | AN ESTIMATE. FINISH SETUP FOR A FULL READING. |
| NEEDS_ACCOUNT | no eligible cash place | ADD A CASH PLACE IN MONEY TO SEE WHAT’S SAFE TO SPEND. |
| BELOW ZERO | `value < 0` | label OVER BY |
| NOTHING HELD | all held-back amounts are 0 | NOTHING IS HELD BACK YET. BILLS, PLANS AND RESERVES WILL APPEAR HERE. |

**EMPTY STATES**
- NOTHING HELD.
- A device without setup reads NEEDS_SETUP with a seeded 8,420 account.

**LOADING STATES**
None. The repository is synchronous; LOADING is planned in the blueprint but not built.

**ERROR STATES**
None specific to F09. Global sync toasts only (SAVE FAILED, SESSION ENDED). ERROR is planned, not built.

**EDGE CASES**
- A negative value is not clamped.
- Zero shows CLEAR TO SPEND $0.
- A non-numeric F05 balance gives NaN.
- A goal completes and stops deducting.
- A hold save flips `started`.
- LOAN counts as cash (flagged).
- CARD ADDED expenses reduce cash (flagged).
- Completeness can change after a reload (re-seeding).

**USER CONFIDENCE REQUIREMENTS**
- The reading must say how sure it is.
- Estimates are labelled.
- Only real values.
- Zero bands hidden.
- HELD and OWED never netted.
- No “live bank data” claim. Ask says EXPLANATION ONLY — NOT LIVE BANK DATA.

**EXPLANATION REQUIREMENTS**
- The parent answers; the explanation stays closed.
- F09.WHY is the full reading of every factor with its source.
- Today's short SEE WHY is not the full reading (FF.SEE_WHY_VS_F09 open).

**ASK JURNL RELATIONSHIP**
- Global chrome control (ASK JURNL, info glyph). It opens the explanation sheet with context: value, obligation count, completeness, currency.
- Gated by consent, which defaults to DENIED.
- Never a calculation source.

**QUICK ADD RELATIONSHIP**
- Nav + opens Quick Add. On F09 it offers MOVEMENT only.
- A saved movement changes cash, so the number changes immediately.
- There is no live region announcing the change today.

**NAVIGATION RELATIONSHIP**
- Not a nav item. HOME is current on F09.
- Reached from:
  - TODAY MORE
  - PLAN “PLAN AROUND”
  - PURCHASES and TRIPS hubs
  - direct URL
- Back is fixed to TODAY. WHY goes back to SAFE.

**MUTATIONS**
- The hold sheet calls `patchSetup({ protectedAmount })` and `patchSettings({ safeToSpendBuffer })`.
- Everything else is owned upstream.

**PERSISTENCE**
- The value is never stored.
- Inputs live in the per-user device snapshot. In production that snapshot syncs to `jurnl_user_snapshots` (RLS).

**RESPONSIVE BEHAVIOR**
- CENTER_STAGE on every viewport.
- Phone: field = 340 nav footprint on the + axis.
- Tablet and desktop: 560 stage on the same axis.
- Atomic pagination and context-aware back.
- No F09-specific responsive rule exists.

## Emotional target and restraint (canonical brief)

**Emotion.** *Clarity, relief, confidence.*

**Restraint:**
- *One signal. Almost no secondary matter.*
- *A signal, not a journal.*
- *Still.*
- *More air.*

**Risks:**
- *Looking empty.*
- *Copying today’s journal.*

**Forbidden world departure that matters here:** `DARK_BANK_VAULT`. “Safe” must not become a strongbox.
