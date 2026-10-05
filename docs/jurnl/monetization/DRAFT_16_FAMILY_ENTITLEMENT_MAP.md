# JURNL — DRAFT 16-FAMILY ENTITLEMENT MAP (FOR FOUNDER REVIEW)

**Architectural planning only — not founder-approved pricing policy.** Source of truth in code:
`src/projects/jurnl/data/monetization/entitlementMap.ts` (`founderApproved: false` on every row).

Candidates: `CORE_FREE_CANDIDATE` · `PLUS_CANDIDATE` · `PRO_CANDIDATE` · `BUSINESS_CANDIDATE` · `ADD_ON_CANDIDATE` · `UNDECIDED`

| # | Family | Default access | Family candidate | Major capabilities → candidate | Rationale |
|---|--------|----------------|------------------|--------------------------------|-----------|
| 01 | ENTRY | FULL | CORE_FREE | CORE_ACCOUNT_SECURITY → FREE · CORE_PERSONAL_DATA_CONTROL → FREE (user right) | Access, security and privacy are never monetized. No upgrade surface. |
| 02 | SETUP | FULL | CORE_FREE | CORE_GUIDED_SETUP → FREE | Onboarding must not become a paywall; value first. |
| 03 | TODAY | FULL | CORE_FREE | CORE_TODAY_OVERVIEW → FREE · AI_EXPLAIN_BASIC → FREE (safety floor) · AI_PLANNING_GUIDANCE → PLUS | Daily habit; Ask JURNL depth scales by plan. |
| 04 | ACTIVITY | FULL | CORE_FREE | CORE_TRANSACTION_TRACKING → FREE · BUSINESS_CATEGORIZATION → BUSINESS | Core organization. |
| 05 | MONEY | FULL | CORE_FREE | CORE_ACCOUNT_OVERVIEW → FREE (linked-account limit UNDECIDED) · BUSINESS_CASH_FLOW → BUSINESS | Seeing your money is core. |
| 06 | INCOME | FULL | CORE_FREE | CORE_INCOME_TRACKING → FREE · ADVANCED_FORECASTING → UNDECIDED (irregular income: PLUS or PRO?) | Visibility core; prediction premium. |
| 07 | UPCOMING | FULL | CORE_FREE | CORE_UPCOMING_BILLS → FREE · ADVANCED_AUTOMATION → PLUS | Knowing what is due protects users. |
| 08 | PLAN | FULL | CORE_FREE | CORE_BASIC_BUDGETING → FREE · ADVANCED_SCENARIOS → PLUS · ADVANCED_AUTOMATION → PLUS | Scenario comparisons + automation are the PLUS story. |
| 09 | SAFE TO SPEND | LIMITED | CORE_FREE | CORE_SAFE_TO_SPEND → FREE · ADVANCED_SAFE_TO_SPEND → PLUS | The number is free; advanced projections are feature-gated (no locked family). |
| 10 | PURCHASES | LIMITED | CORE_FREE | CORE_PURCHASE_CHECK → FREE (independent verdict) · ADVANCED_PURCHASE_ANALYSIS → PRO (also MAJOR PURCHASE PREP add-on) · COMMERCE_PRICE_COMPARISON → UNDECIDED (disabled) | CAN I BUY IT? stays financially independent; shopping only after the verdict. |
| 11 | TRIPS | FREE_PREVIEW | ADD_ON | CORE_TRIP_AFFORDABILITY → FREE · ADVANCED_TRIP_PLANNING → ADD-ON (TRAVEL; PRO inclusion UNDECIDED) · TRAVEL_BOOKING_REFERRALS → UNDECIDED (disabled) | Booking links never steer the verdict. |
| 12 | CREDIT | FULL | CORE_FREE | CORE_CREDIT_OVERVIEW → FREE · ADVANCED_CREDIT_PLANNING → PRO (also PREMIUM CREDIT add-on) · FINANCIAL_SERVICE_REFERRALS → UNDECIDED (regulated, disabled) | Card offers need compliance review. |
| 13 | PAYDOWN | FULL | CORE_FREE | CORE_PAYDOWN_BASICS → FREE · ADVANCED_DEBT_STRATEGY → PLUS | Getting out of debt is never paywalled at the basics. |
| 14 | GOALS | FULL | CORE_FREE | CORE_BASIC_GOALS → FREE · ADVANCED_AUTOMATION → UNDECIDED | Goals are core motivation. |
| 15 | AHEAD | FREE_PREVIEW | PRO | CORE_BASIC_FORECAST → FREE · ADVANCED_FORECASTING → PRO · AI_MULTI_SCENARIO_ANALYSIS → PRO · BUSINESS_FORECASTING → BUSINESS | Basic forecast for everyone; decision-grade forecasting is the PRO story. |
| 16 | RECORDS | LIMITED | BUSINESS | RECORDS_BASIC → FREE · RECORDS_ADVANCED → PLUS · BUSINESS_PNL → BUSINESS · BUSINESS_TAX_PREP → BUSINESS · BUSINESS_TAX_ADVANCED → ADD-ON | Personal records core; business records / tax / accountant export are BUSINESS. |

Plan shape implied by the draft (also DRAFT in `plans.ts`):

- **FREE**: all CORE_* + RECORDS_BASIC + AI_EXPLAIN_BASIC (+ commerce / referral surfaces once enabled).
- **PLUS** (includes FREE): ADVANCED_SAFE_TO_SPEND, ADVANCED_SCENARIOS, ADVANCED_AUTOMATION, ADVANCED_DEBT_STRATEGY, RECORDS_ADVANCED, AI_PLANNING_GUIDANCE.
- **PRO** (includes PLUS): ADVANCED_FORECASTING, ADVANCED_PURCHASE_ANALYSIS, ADVANCED_CREDIT_PLANNING, AI_MULTI_SCENARIO_ANALYSIS, AI_HIGHER_USAGE.
- **BUSINESS** (includes FREE core, not PRO): receipts, mileage, categorization, P&L, cash flow, tax prep, accountant export, business forecasting, RECORDS_ADVANCED, AI_BUSINESS_ANALYSIS.
- **ADD-ONS**: TRAVEL (advanced trip planning) · PREMIUM CREDIT (credit strategy) · MAJOR PURCHASE PREP (purchase impact) · BUSINESS TAX (advanced business tax, BUSINESS only).
