# Production approval checklist — Anthony Gate A

**Order matters.** Do not skip stability review.

## A. Supabase (project `hyycomvcaqxxvyrfupes`)

- [ ] Founder accepts **NOT CERTIFIED** or completes G1/G4 sign-off (`SUPABASE_STABILITY_CERTIFICATION.md`).  
- [ ] **Approve** applying migrations v1 + v2 (see `DF_MIGRATION_RECONCILIATION.md`).  
- [ ] Ops runs migrations; verification SQL shows `site00_df_*` tables.  
- [ ] **No** composer/agent applies DDL without explicit reply.

## B. Railway (`api.site00.com`)

- [ ] Confirm health: `gitCommit` matches intended `main` SHA (currently **3cd487e** — OK).  
- [ ] Confirm `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1`.  
- [ ] Confirm `SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY=1` for intake-only launch.  
- [ ] **Redeploy only if** env or code changed after migrations.

## C. GoDaddy (`site00.com`)

- [ ] Build ZIP from approved `main` commit.  
- [ ] Upload + extract + hard refresh.  
- [ ] Verify bundle hash ≠ `index.D8Jaygrd.js`.

## D. Shared workload (optional before Gate A)

- [ ] Review SITE00 PR **#1604** (bounded queries) — **recommended**, not blocking once DB stable.  
- [ ] Apply fsbw patch (`docs/frontal-slayer/shared-supabase/fsbw-workload-containment.patch`) — **defer** unless admin globe load returns.

## E. E2E

- [ ] Approve disposable production E2E (`ANTHONY_GATE_A_E2E_PLAN.md`).  
- [ ] Document evidence in `FOUNDATION_LIVE_INTAKE_E2E_PROOF.md` (update PASS/FAIL).

## F. Anthony

- [ ] All E2E PASS.  
- [ ] Founder explicit **GO** to mint and send Anthony personalized link.  
- [ ] Record token handling in secure channel (not in git).

**Current aggregate:** **NOT APPROVED** — migrations pending, frontend stale, E2E not run.
