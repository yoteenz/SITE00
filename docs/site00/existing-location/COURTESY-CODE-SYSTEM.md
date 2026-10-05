# Courtesy Code System

`ServiceCourtesyCode`: hashed storage (`code_hash` only in DB), discount types PERCENT_100 / FIXED_AMOUNT / DIAGNOSIS_ONLY / LABOR_ONLY / SPECIFIC_SERVICE / FULL_CASE_COMP.

Admin creates codes via `/api/admin/site00-existing-location?action=create-courtesy-code`. **No hard-coded friend codes in repo.**

Redemptions recorded; $0 checkout still creates case + quote + redemption + entitlement.

Validation: server-only (eligibility, expiry, redemption limits, email/client restrictions).
