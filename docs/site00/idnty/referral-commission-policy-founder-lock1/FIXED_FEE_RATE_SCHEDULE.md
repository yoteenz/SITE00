# Fixed fee rate schedule

## Currency

USD only for this policy version.

## Approved amounts (minor units)

```text
STANDARD_PARTNER_FEE_MINOR     = 2500   ($25.00)
ESTABLISHED_PARTNER_FEE_MINOR  = 3500   ($35.00)
STRATEGIC_PARTNER_FEE_MAX_MINOR = 5000  ($50.00)
AIO_INITIAL_FEE_MINOR          = 5000   ($50.00)
ABSOLUTE_COMMISSION_CAP_MINOR  = 5000   ($50.00)
QUALIFYING_BASE_PACKAGE_MINOR  = 50000  ($500.00)
```

## Engine rules (implementation phase)

1. Commission amount is **fixed per terms version**, not computed from revenue percentage.
2. **Reject** any proposed fee `> 5000` minor units.
3. **Reject** percentage-based calculation paths for referral fees.
4. Partner band changes require **new founder-authorized terms** — no automatic tier promotion.
5. Add-on line items **must not** increase referral fee.

## Qualifying product identifier

Align with existing DF catalog: **IDNTY Digital Foundation base package** at **$500** list (see `base_price_minor` 50000 in repository today). Implementation must map paid SKUs/line items to this qualifying product explicitly.
