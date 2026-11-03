# 08 — Director Composer integration

Director Composer remains a **shared** Studio World tool. Project association is via:

- Active production URL project slug (`the-exchange`)
- Fiction production modules on open PR branches (`shared/site00-fiction-production/`, PR #1692+)
- `productionSpine: true` on managed record (compatible with PR #1697 spine)

This sprint does **not** relocate Composer implementation into `THE_EXCHANGE/`.
