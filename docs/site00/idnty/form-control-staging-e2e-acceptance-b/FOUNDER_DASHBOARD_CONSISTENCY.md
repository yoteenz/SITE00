# Founder dashboard consistency

## Live staging

**NOT RUN** — readiness API returned 401 without Supabase founder session (expected).

## Automated

- `tests/founderReadinessE2e.test.ts` — PASS on integration HEAD
- Synthetic journey helpers include test phone for completion paths

## Post-deploy checkpoints

After create / partial save / complete: verify same artifact appears in readiness desk list and Supabase row counts increase for synthetic label prefix.
