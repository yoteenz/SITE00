# Foundation launch rollback plan (Gate A)

## Triggers

- Intake saves appear successful but Supabase rows missing
- Cross-client token access suspected
- Checkout reachable when intake-only expected
- Critical mobile form regression on production SPA

## Rollback order (reverse of deploy)

1. **Stop sending new client links** (founder manual — no code).
2. **Railway API:** Set `SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY=0` only if paid clients blocked incorrectly; prefer scoped fixes first.
3. **Railway API:** Set `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=0` **only as emergency** — new intakes become memory-only; document data at risk.
4. **Railway:** Redeploy previous known-good API deploy from Railway history (record deploy id before launch).
5. **GoDaddy:** Restore previous `public_html` ZIP from last GitHub Release (e.g. pre–2026-10-10 v5) — verify bundle filename in `index.html`.
6. **Supabase:** Do **not** drop tables; fix forward with migrations.

## Verification after rollback

- `GET /api/health` → expected `gitCommit`
- site00.com → expected `index.*.js` hash
- Disposable intake test or disable public DF links until re-certified

## Forward recovery

Re-run Gate A checklist (`FOUNDATION_GATE_A_LAUNCH_CHECKLIST.md`) before re-enabling Anthony link.
