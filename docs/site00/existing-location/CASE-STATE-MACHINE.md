# Case State Machine

Canonical statuses in `case-state-machine.json`. Client may transition: DRAFT → INTAKE_COMPLETE → ACCESS_REQUIRED; QUOTE_READY → APPROVED → CHECKOUT_PENDING → PAID | COMPLIMENTARY_APPROVED.

Founder/operator transitions (diagnosis, quote creation, access connected) via admin API.

Terminal: COMPLETE, CANCELLED.
