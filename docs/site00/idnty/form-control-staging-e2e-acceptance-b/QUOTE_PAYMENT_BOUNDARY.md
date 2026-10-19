# Quote and payment boundary

## Scope

Form-control Sprint B does **not** require Stripe checkout E2E.

## Verified in tests

- Intake completion distinct from `payment_state: PAID` locking (`updateIntake` throws after payment)
- Commerce tests use `completeIntakeWithContactPhone` without creating fake paid records

## Live staging

NOT RUN — no checkout triggered.

| Area | Status |
| --- | --- |
| Quote readiness | NOT RUN live |
| Payment readiness | NOT RUN live |
