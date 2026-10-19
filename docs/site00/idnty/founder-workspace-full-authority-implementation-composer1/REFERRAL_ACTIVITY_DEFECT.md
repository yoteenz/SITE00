# Referral activity defect (P1 / R39)

## Authority

Opus3 R39 — ordered referral event timeline with partner association and detail selection.

## Backend

Registry specifies `GET /api/admin/referrals/events` — **not implemented** in repo (grep: no route).

## UI behavior (slice 3)

- `referralActivityFromRegistry()` builds **one attribution snapshot per attributed artifact** from `foundationAdminApi.list()` (real persisted rows).  
- Empty stream when no `referral_source_id` on artifacts.  
- Load/error/empty distinguished in `ReferralsPage` activity section.  
- **No** fabricated commission, payout, or partner-commerce events.

## Verification state

| State | Result |
| --- | --- |
| IMPLEMENTED (honest gate) | Yes |
| LIVE COMMERCE EVENTS | Blocked on backend |
| AUTHENTICATED VISUAL | No |
