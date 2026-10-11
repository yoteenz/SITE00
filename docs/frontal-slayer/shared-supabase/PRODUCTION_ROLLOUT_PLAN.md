# Production rollout plan

**Founder approval:** PENDING  
**Database mutations:** NONE in this sprint  
**Auto-deploy:** NOT authorized

## Phase 1 — Review (current)

1. Review SITE00 PR (API + docs + tests).
2. Review fsbw PR (admin API + revenue poll).
3. Confirm no regression for admin/marketing/ASSTS UX (limits exceed expected row counts today).

## Phase 2 — Deploy API layers

| Order | Target | Action |
| --- | --- | --- |
| 1 | Railway `site00-api` | Deploy SITE00 `main` after merge |
| 2 | Vercel fsbw | Deploy API routes + revenue page |

**No GoDaddy SPA deploy required** unless founder UI bundles change beyond fsbw admin (SITE00 SPA unchanged).

## Phase 3 — Database (separate founder gate)

1. Apply indexes from `DATABASE_INDEX_PROPOSALS.md` one at a time off-peak.
2. Optional: analytics retention / live-presence snapshot table (see admin-globe remediation plan).

## Phase 4 — Verify stability gates

Use `docs/frontal-slayer/admin-globe/SUPABASE_RECOVERY_STABILITY_GATES.md`:

- `SELECT 1` connectivity
- Supabase dashboard memory / disk I/O not pegged
- p95 live-presence < 500ms when heartbeats active (if applicable)

## Rollback

- **Code:** revert PRs and redeploy prior API builds.
- **Indexes:** `DROP INDEX` statements in index doc (only if phase 3 executed).

## STOP conditions

- Founder has not approved merge/deploy.
- Any migration applied without index window plan.
