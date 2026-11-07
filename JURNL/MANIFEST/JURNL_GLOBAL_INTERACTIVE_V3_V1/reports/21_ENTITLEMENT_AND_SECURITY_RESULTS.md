# 21 · Entitlement and security results

* No authorization moved to the UI: lock / unlock states are presentation of the resolved entitlements; no surface grants
  access; dismissing UNLOCK changes nothing.
* No checkout, no price, no purchase success, no billing provider, no subscription was created; `upgradeSurfaceAllowedIn`
  is untouched (no family paywall appears).
* FOUNDER_FULL: read only from the server-resolved `internalGrants`; suppresses upsell; never consulted by financial or
  security code (report 10).
* Unknown entitlement state fails closed (E3).
* No new permanent grant, no RLS change, no secret printed. PAID_PROVIDER_SPEND 0.
