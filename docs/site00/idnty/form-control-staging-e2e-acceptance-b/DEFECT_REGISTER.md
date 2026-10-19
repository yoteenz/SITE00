# Defect register

| ID | Sev | Summary | Status |
| --- | --- | --- | --- |
| B-01 | P0 | Staging API deploy @ `1152f25f` — missing #1661 phone guard | OPEN — redeploy required |
| B-02 | P0 | Staging SPA pre–Sprint A bundle — missing phone UI, System B, custom selector | OPEN — rebuild + redeploy |
| B-03 | P1 | Live founder E2E blocked without Supabase session on staging | OPEN — founder QA |
| B-04 | P2 | Live Supabase vitest race on duplicate token (fixed Sprint B) | **FIXED** in `tests/digitalFoundationPersistence.test.ts` |

## Fixes in Sprint B branch

- Persistence test: `createArtifactForLeadDurable` + wait for scheduled persist
- `build-founder-staging-spa.sh`: default `VITE_DF_CUSTOM_INDUSTRY_SELECT=1`
- Staging parity + responsive verification scripts

No P0 code defects found in integration HEAD beyond deploy gap.
