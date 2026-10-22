# Founder policy decisions (lock 1)

All amounts **USD**, stored as **integer minor units** (cents).

## FD-R01 — Compensation type

**FIXED dollar amount per qualifying client.** No percentage-based commissions. Partner-specific fees may differ only within approved bands and the universal cap, with founder-authorized terms.

## FD-R02 — Commission basis

**$500 IDNTY Digital Foundation base package only** (`50000` minor units). Excluded: add-on mailboxes, domains, transfers, migration, recovery, routing, device setup, DNS cleanup, expedited services, third-party charges, taxes, future digital-location builds, other SITE 00 products. One qualifying base purchase → at most one fixed referral fee.

## FD-R03 — Fee schedule and cap

| Band | Fee (USD) | Minor units | Notes |
| --- | ---: | ---: | --- |
| Standard partner | $25 | 2500 | Default band |
| Established / high-performing | $35 | 3500 | **Not automatic** — requires founder-authorized agreement |
| Strategic partner | up to $50 | 5000 max | Founder-set within cap |
| AIO (All In One Enterprises Inc.) | $50 | 5000 | Planned founding strategic partner |
| **Universal cap** | **$50** | **5000** | Engine **must reject** any higher amount |

**Rejected:** $75 proposal, 15% reference imagery, percentage fallbacks.

## FD-R04 — Eligibility

Requires: valid attribution · new qualifying IDNTY client · verified **base package** payment (server-side evidence) · not disqualified (duplicate/self/existing-client rules) · **14-day holding period** satisfied · **founder approval** before payout.

Not sufficient: visit alone · completed intake · quote acceptance · checkout redirect · unverified webhook.

## FD-R05 — Payout

**Monthly**, target **15th**; **no minimum** threshold. Only commissions that passed hold, attribution, evidence, no open dispute, founder approval, payee documentation, and not previously paid. **Manual external payment**; workspace **record-only**. RECORD PAYMENT ≠ SEND PAYMENT (SEND not authorized).

## FD-R06 — Refunds and disputes

Pre-payout full refund → reverse unpaid commission. Dispute/chargeback → held/disputed pending verification. Post-payout → auditable adjustment, founder review; no silent deletion; no automated bank clawback.

## FD-R07 — Attribution window

**90 days.** Attribution durably attached at artifact creation; not removed because browser cookies expire.

## FD-R08 — Collisions

**Manual founder review.** No automatic partner switching. One commission per qualifying base purchase.

## FD-R09 — Disqualifiers

Self-referral and duplicate referral **disqualified**. Existing client repeat purchase **no new commission**; do not silently overwrite prior valid attribution. Related-party/ambiguous → founder review.

## FD-R16 — Payout execution

**Record-only** founder workspace with full audit fields (partner, commission ids, amount, date, external method/reference, actor, timestamp, evidence).

## FD-R17 — AIO

**Planned** strategic partner at **$50**. Do not infer signed agreement or auto-activate. Surface `ACTIVE` fixture + null `agreement_version` conflict until resolved.
