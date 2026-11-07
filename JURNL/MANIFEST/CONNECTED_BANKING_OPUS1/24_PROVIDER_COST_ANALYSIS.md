# 24 · PROVIDER COST ANALYSIS (PLAID)

**Spend so far: $0.** Nothing was purchased and no paid product was enabled. The sandbox has not been called in this session.

## What Plaid publishes

This session's network does not allow plaid.com, so the pages themselves could not be opened. The facts below come from search results on plaid.com and support.plaid.com. **Re-check them in the Plaid dashboard before you approve anything.**

- **No dollar price list is published.** Pay-as-you-go and Growth prices are shown only on the last page of the Production access request. The JURNL per-Item rate is therefore **UNKNOWN until the founder starts that request.**
- **Pay-as-you-go:** no minimum spend or commitment.
- **Billing model per product:**

| Product | Billing model | Used by JURNL? |
|---|---|---|
| Transactions (`/transactions/sync`) | **Subscription: a monthly fee per Item, for as long as the Item exists** | **Yes** (the core product) |
| Cached balances (`/accounts/get`) | Not listed as a separate billed product | Yes |
| Balance (`/accounts/balance/get`, real time) | Per request (flat fee) | **No.** The code never calls it. |
| Transactions Refresh (`/transactions/refresh`) | Per request | **No** |
| Auth | One-time fee per Item | **Off by default.** `JURNL_PLAID_AUTH=optional` or `required` turns it on. JURNL never moves money. |

- **Stopping charges:** `/item/remove` ends the Transactions subscription for that Item. JURNL's DISCONNECT calls it first.
- **Trial plan:** US / Canada teams created on or after **2026-04-15** can use real production data **at no cost, up to 10 Production Items**. If a subscription product such as Transactions was added to an Item during the trial, **charging starts on upgrade** to a paid plan.
- **Older teams:** teams created before 2026-04-15 have **Limited Production** (free and capped). A pending or approved Production application, or existing Limited Production access, makes the Trial plan unavailable.

## Forecast for the founder's intended accounts

| Item | Plaid products | Monthly | One-time |
|---|---|---|---|
| Checking | Transactions | 1 × T | 0 (Auth off) |
| Rideshare payout card (only if listed and connectable) | Transactions | 1 × T | 0 |
| Credit card | Transactions | 1 × T | 0 |
| One additional supported account | Transactions | 1 × T | 0 |
| **Total** | | **3–4 × T per month** | **0** (or 3–4 × A if Auth is enabled) |

T is Plaid's Transactions per-Item monthly rate; A is its Auth one-time rate. Neither is published; both are visible in the Production request.

- **Under the Trial plan:** $0 for up to 10 Items while it lasts. From the upgrade date: 3–4 × T per month.
- **Extra cost risk:** none from JURNL's code. It makes no real-time balance calls, no refresh calls and no paid add-ons.

## Founder decision required (F-5)

Approve, or decline:
1. the Plaid plan (Trial, or Pay-as-you-go), after reading T and A on the Production request page;
2. whether Auth is enabled (it is not needed for read-only Money).

Sources (search results; the pages could not be opened from this environment):
- [Pricing (US & Canada)](https://plaid.com/pricing/)
- [Pricing and billing (docs)](https://plaid.com/docs/account/billing/)
- [How much does Plaid cost, and what are the pricing models?](https://support.plaid.com/hc/en-us/articles/16194632655895-How-much-does-Plaid-cost-and-what-are-the-pricing-models)
- [What is the Plaid Trial plan?](https://support.plaid.com/hc/en-us/articles/39994173227159-What-is-the-Plaid-Trial-plan)
- [How are Sandbox, Production, Trial plan, and Limited Production different?](https://support.plaid.com/hc/en-us/articles/16110110883479-How-are-Sandbox-Production-Trial-plan-and-Limited-Production-different)
- [How do I stop billing for Plaid products I'm no longer using?](https://support.plaid.com/hc/en-us/articles/18785119002263-How-do-I-stop-billing-for-Plaid-products-I-m-no-longer-using)
