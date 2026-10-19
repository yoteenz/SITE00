# Live API smoke results

**Endpoint:** `https://reliable-creation-staging.up.railway.app/api/health`

| Field | Value | Pass |
| --- | --- | --- |
| `ok` | true | ✓ |
| `gitCommit` | 255576b5d737 | ✓ |
| `persistenceStore` | supabase | ✓ |
| `supabaseProjectRef` | soocqbyjkxeubfjnuwvf | ✓ |
| `publicAppOriginEffective` | carefree-luck-staging URL | ✓ |
| `transactionalSendFlag` | false | ✓ (email safety) |

## Phone guard (code-level)

Direct unauthenticated `completeIntake` probe was **not executed** (requires artifact token + server-side session). Guard presence inferred from deployed **`255576b5`** commit containing `validateContactPhoneForCompletion` in `completeIntake` (Sprint A).

## Supabase durability (isolated test)

```bash
SITE00_DF_PERSISTENCE_TEST=1 SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1 \
  npm test -- tests/digitalFoundationPersistence.test.ts
```

**Result:** PASS (2026-10-19) — CREATE/COMPLETE/READBACK against staging Supabase credentials.
