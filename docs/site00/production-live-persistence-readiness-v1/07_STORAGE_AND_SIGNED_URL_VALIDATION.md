# 07 — Storage and signed URL validation

Sprint §11. **Live verification is BLOCKED.** No isolated Supabase Storage bucket was available or approved:

- `site00-staging` has no buckets and was not approved for changes;
- production is out of scope.

Nothing below claims a live success. Each result names where it ran.

## 1. Results

| Check (§11) | Where it ran | Result |
| --- | --- | --- |
| Bucket is private; a public bucket is refused | Stand-in Storage client (unit test); migration on PostgreSQL 16 (`public = false`) | PASS (isolated) |
| Upload is content-addressed and idempotent | Stand-in client; local private adapter | PASS (isolated) |
| Hash on upload and on re-read | Memory, local and stand-in adapters; dry run step 9 | PASS (isolated) |
| Metadata recorded with provenance | PostgreSQL 16: the provenance constraint refuses a foreign project or a mismatched hash | PASS (isolated) |
| Permanent reference, no provider URL in any record | Dry run step 8; record validation; OpenArt contract test | PASS (isolated) |
| Signed URL works before expiry | API handler in-process (dry run step 18): 200, bytes hash-match | PASS (isolated) |
| Signed URL refused after expiry | Same link one second after expiry: 403 `SIGNED_READ_EXPIRED` | PASS (isolated) |
| Tampered expiry or signature refused | 403 `SIGNED_READ_INVALID` | PASS (isolated) |
| Cross-project link refused | An Exchange link presented as `ndxbook`: 403 | PASS (isolated) |
| Revocation: a ref no record names is not served | API media endpoint checks the project's asset records | PASS (isolated, unit) |
| Download verification before approval | Corrupted copy → `MEDIA_UNVERIFIED`, nothing approved | PASS (isolated) |
| Local masters outside the repository, `0600` | Local adapter test; dry run step 8 | PASS |
| Live Supabase upload / download / signed URL / expiry | — | **BLOCKED**: no approved staging bucket |

## 2. To verify live (founder-run, after the staging migration)

```
SITE00_SPINE_VERIFY_TARGET=STAGING SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… SUPABASE_ANON_KEY=… \
  npx tsx scripts/production/verify-spine-supabase.ts
```

On staging, the script checks:

- the bucket exists and is private;
- the public URL path is refused;
- anon is refused;
- one probe object makes a full round trip (upload, read-back hash, signed URL, removal);
- records round-trip, with compare-and-set and cross-project scoping.

`PRODUCTION_READ_ONLY` mode only reads.
