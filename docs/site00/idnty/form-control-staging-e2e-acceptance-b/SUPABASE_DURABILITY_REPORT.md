# Supabase durability report

**Gate D — P0 persistence**

## Method

Vitest live integration (not memory store):

```bash
SITE00_DF_PERSISTENCE_TEST=1 SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1 \
  npm test -- tests/digitalFoundationPersistence.test.ts
```

**Result:** **PASS** (2026-10-19T17:07Z)

## Scenario

1. `createArtifactForLeadDurable` with label `IDNTY E2E ACCEPTANCE — SYNTHETIC <timestamp>`
2. Complete intake with test contact phone helper
3. Wait for async `schedulePersist` flush
4. `reloadArtifactFromSupabaseForTest(public_token)` → same `artifact_id`, `intake_state: COMPLETE`

## Test fix (Sprint B)

Removed duplicate `persistArtifactGraph` call that raced with `schedulePersist` (duplicate `public_token` INSERT).

## Not verified in this run

- Full browser refresh/resume on **live staging** (blocked by deploy parity)
- Founder dashboard listing after create (requires authenticated founder session on staging)

## Isolation

Uses staging Supabase credentials from cloud secrets; synthetic naming convention applied. No production Supabase.
