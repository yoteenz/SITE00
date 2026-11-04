# 10 · Founder entitlement compatibility

#1708 (not in this base) resolves FOUNDER_FULL on the trusted backend and attaches
`internalGrants: { active: ['FOUNDER_FULL'], enforcementSource: 'INTERNAL_GRANT' }` to the resolved entitlements.
This sprint reads exactly that field (`hasFounderAccess`) and nothing else:

* FOUNDER_FULL → YOUR PLAN reads **FOUNDER ACCESS** (bronze pill); ACTIVE ADD-ONS reads ALL ADD-ONS · INCLUDED WITH FOUNDER
  ACCESS; every add-on reads FOUNDER ACCESS; the billing notice and the add-on prompt are **hidden** (no upsell).
* Without the grant (this base, every customer today) → the real plan; no founder wording appears.
* The UI never grants anything: authorization stays on the server (`serverAuthorization.ts`); a dismissed prompt grants
  nothing; FOUNDER_FULL never bypasses financial or security checks (it is not read by any financial code).

Tests: E2 (founder suppression), E5 (`hasFounderAccess`), E3 (fail closed). On merge with #1708, no code change is needed.
