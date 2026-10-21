# Known backend and policy gates

## Referral compensation (founder-locked)

| Rule | Value |
| --- | --- |
| Standard | $25 |
| Established | $35 |
| Strategic max / cap | $50 |
| AIO | $50 proposed — **not auto-active** |
| Payout execution | Manual external — **blocked in UI** |

## Referral activity

- No `GET /api/admin/referrals/events` — activity section shows **registry attribution snapshots** only.

## Commissions / payouts overlays

- Safe **blocked** panels; no payable rows without payment evidence.

## Preview tunnel intake

- `SITE00_INTAKES_USE_MEMORY=1` on this pin — intake persistence is **ephemeral** until Vite restarts (dev-only). Production intake on staging/production DB unchanged.

## Payments / email

- No real Stripe charge execution or transactional email sends in this dev pin.

## API origin on tunnel

- Pinned script uses **local Vite `/api`** for admin foundation routes during review — not a Railway staging overwrite.
