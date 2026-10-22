# 24 · Referrals activity and analytics specification

Boards: R39 (activity at 1440 / 834 / 390), R14 (evidence classes), R04 (signals). Components RF-090…RF-092.

## 1. Source of truth
`site00_referral_business_events` is append-only, with a unique `idempotency_key`. The 16 existing event types are extended with:
- PARTNER_CREATED, PARTNER_STATUS_CHANGED;
- TERMS_VERSION_CREATED;
- LINK_ISSUED, LINK_REVOKED;
- QR_VALIDATED, QR_DEVICE_SCAN_RECORDED;
- PROOF_APPROVED, PRINT_PACKAGE_EXPORTED;
- ATTRIBUTION_EXCEPTION_OPENED, ATTRIBUTION_CORRECTED;
- COMMISSION_APPROVED, COMMISSION_ADJUSTED, COMMISSION_DISPUTED;
- PAYOUT_CREATED, PAYMENT_RECORDED, PAYOUT_REVERSED;
- PORTAL_ACCESS_INVITED, PORTAL_ACCESS_REVOKED.

The activity view shows **recorded events only, never inferred**.

## 2. Timeline row
`TIME (founder time zone) · VERB (bold) · SUBJECT (partner / client / ref) · ACTOR TAG (SYSTEM · FOUNDER · CLIENT · PARTNER)`. Rows link to their record. Red mark: needs the founder. Hollow mark: system-observed.

## 3. Filters and search
ALL · PARTNERS · ATTRIBUTION · COMMISSIONS · PAYOUTS · CARDS. Search across partner, client and event; export CSV (export is logged). Times are in the founder's time zone, with UTC kept in the record.

## 4. Where activity appears
| Surface | Scope |
| --- | --- |
| REFERRALS › ACTIVITY | All referral events |
| Overview › REFERRAL ACTIVITY | Latest 5 |
| Partner › ACTIVITY | Events for that partner |
| Client record › ACTIVITY (CR-12) | Referral events for that client (e.g. ATTRIBUTION CAPTURED), founder-only |
| Notifications (RF-005) | Events needing action |

## 5. Analytics evidence classes
| Class | Definition | May drive money |
| --- | --- | --- |
| OBSERVED | Recorded by SITE 00 at the time (scan resolved, payment webhook) | Yes |
| ATTRIBUTED | Derived by approved policy from observed events | Yes, once policy is approved |
| ESTIMATED | Planned or expected (next payout date, projected conversion) | No |
| UNAVAILABLE | Cannot be measured (card handed out, cross-device) | No |

Every metric declares its class. The workspace shows no decorative charts and no sparklines without a defined, stored series. Trend lines are deferred until at least one full period of OBSERVED data exists (Phase 12).
