# Gate A launch checklist (founder-facing)

Use before sending Anthony a personalized intake link.

- [ ] **Correct link** — Minted from founder console on **production** API; not a dev/tunnel bookmark.
- [ ] **API SHA** — `curl -sS https://api.site00.com/api/health | jq .gitCommit` matches intended `main` merge (≥ #1577 / #1578).
- [ ] **SPA SHA** — site00.com `index.html` references current release bundle (not stale e.g. `index.D8Jaygrd.js` only).
- [ ] **Supabase project** — Dashboard shows `hyycomvcaqxxvyrfupes` (matches API health `supabaseHost`).
- [ ] **Migrations** — `site00_df_artifacts` and related tables exist (see migration audit).
- [ ] **Persist flag** — Railway `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1`; health shows `persistSupabaseEnv: true` after diagnostics deploy.
- [ ] **Intake-only flag** — Railway `SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY=1`; checkout blocked in disposable test.
- [ ] **Disposable E2E** — Full intake → refresh → new session → submit; Supabase row matches screens.
- [ ] **API restart** — After restart/redeploy, same token restores intake (private proof doc).
- [ ] **Founder visibility** — Admin detail shows same business/contact/needs as client.
- [ ] **Mobile** — P01–P03 usable at 393×852 (screenshots on file).
- [ ] **No live checkout** — Client cannot complete Stripe on intake-only path.
- [ ] **No marketing email** — Transactional sends remain disabled unless separately certified.
- [ ] **Rollback** — Previous cPanel ZIP + Railway deploy id recorded.
- [ ] **Founder release approval** — Explicit go for Anthony link only.

**If any box unchecked → NO-GO.**
