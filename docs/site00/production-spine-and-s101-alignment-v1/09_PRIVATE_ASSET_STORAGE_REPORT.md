# 09 — Private asset storage report

Sprint `P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1`, §21 and decision D-04. Branch `claude/studioworld-production-record-spine`. Code: `shared/site00-production-spine/media.ts` and `node/localMedia.ts`, `node/supabaseMedia.ts`.

## 1. Verdict

| Item | Status |
| --- | --- |
| Storage contract (`MediaStore`) | IMPLEMENTED and tested |
| Local private adapter (development, agent-session pilot, tests) | IMPLEMENTED and tested |
| Supabase private-bucket adapter | IMPLEMENTED; contract-tested against a stand-in client |
| **Live private storage** | **BLOCKED.** No `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` or private production bucket exists in this environment, and no authenticated transfer was made. Production storage is not claimed to work. |

## 2. Contract

| §21 requirement | Implementation |
| --- | --- |
| Private uploads | `put()` writes owner-only files (local) or to a bucket that must be private (Supabase) |
| Content hashes | SHA-256 of the bytes; the storage reference contains it: `spine-media://<adapter>/<bucket>/<project>/<sha256>.<ext>` |
| Asset metadata | ASSET record: MIME type, size, hash, adapter, verification time, lineage |
| Permanent storage references | the `spine-media://` reference never changes and names no host |
| Expiring signed reads | local: HMAC-SHA256 over project, reference and expiry, at most 15 minutes, served by `/api/site00/production-spine?action=media`; Supabase: `createSignedUrl`, capped at 15 minutes |
| Access control | a signed read names its project; signing or reading another project's media is refused; the workspace and decision endpoints need an admin session |
| Download verification | `verify()` re-reads the stored copy and compares hashes. Capture refuses an asset whose copy does not match the provider output. APPROVE, SELECT FOR EDIT and frame extraction re-check the hash first. |
| Source-to-output lineage | ASSET lineage: source job, source take, derived-from asset, provider operation, provider host |

## 3. What the code refuses

- **A public bucket.** The Supabase adapter refuses `live-preview` and whatever `STUDIO_ASSETS_BUCKET` names, because the codebase creates those public. It also refuses any bucket that `getBucket` reports as public.
- **Creating or reconfiguring buckets.** The private bucket must be created by the founder or an operator.
- **Media inside the repository.** The local adapter refuses a root inside the repository; large media is never committed.
- **A provider URL as master.** The provider's temporary URL is used once, to fetch the output. Records keep only the host. The record validator refuses any URL in any record.
- **Test media in the live catalogue.** The runner refuses a fake transport against a live store; live and test stores cannot be mixed.

## 4. Tests

`tests/productionSpine.test.ts` → "private media storage (§21)":

- content addressing and duplicate puts;
- signed reads: valid, expired, tampered, cross-project, and over the TTL cap;
- corruption detection;
- owner-only file mode, and refusal of a repository root;
- Supabase: a public bucket refused by name and by flag; upload, verify, sign (capped at 900 s) and a full `liveTransferCheck` round trip, all against a stand-in storage client.

The dry run (deliverable 12, step 18) reads a captured take back through the spine API's signed read. The bytes hash to the take's recorded SHA-256.

## 5. To make live storage operational

1. Create a **private** Supabase Storage bucket for production masters, for example `site00-production-masters`.
2. Set `SITE00_PRODUCTION_MEDIA_BUCKET` and a 32+ character `SITE00_MEDIA_SIGNING_SECRET` on the API service. Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set there as well; other server features read them, but this session could not check the deployed values.
3. Run `SupabasePrivateMediaStore.liveTransferCheck()` once from the server. It uploads a probe, reads it back, compares hashes, signs a read and deletes the probe. Record the result.
4. Only then report production storage as operational.
