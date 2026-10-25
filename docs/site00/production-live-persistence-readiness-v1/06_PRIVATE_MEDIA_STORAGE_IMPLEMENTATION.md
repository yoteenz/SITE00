# 06 — Private media storage implementation

Sprint §10. Code: `shared/site00-production-spine/media.ts`, `node/supabaseMedia.ts`, `node/localMedia.ts`; bucket in migration `20261026100000`.

## 1. Design

| Concern | Implementation |
| --- | --- |
| Bucket | `site00-production-masters`, created by the migration with `public = false`, 500 MB per object, mp4/mov/png/jpeg/webp. There is no `storage.objects` policy, so only the service role reads or writes. |
| Refusing public buckets | `SupabasePrivateMediaStore` refuses `live-preview` and `STUDIO_ASSETS_BUCKET` by name. Before the first read or write it asks Storage whether the bucket is public (`assertPrivateBucket`). A missing or public bucket is refused (`BUCKET_UNAVAILABLE`, `PUBLIC_BUCKET_REFUSED`). Supabase mode will not open without it. |
| Upload | Content-addressed key `<project>/<sha256>.<ext>`, `upsert: false`. A second upload of the same bytes is a no-op ("already exists" is accepted only because the key is the hash). |
| Hashing | SHA-256 of the provider's bytes before upload, then **re-read from storage and hashed again** (`verify`) before any record is written |
| Metadata | `ASSET` record: media type, MIME type, adapter, storage ref, sha256, byte size, verification time, lineage (source job / take / derived asset, provider operation, provider *host* only). Take records add probed runtime, resolution, frame rate, aspect, audio. |
| Permanent reference | `spine-media://SUPABASE_PRIVATE/site00-production-masters/<project>/<sha256>.<ext>`. The database checks it against the row's adapter, project and hash (provenance constraint). |
| Provider URLs | Used once, to copy bytes in. Records refuse any URL value (`validate.ts`). Only the host is kept. |
| Reads | The server reads directly. The browser gets short signed links: Supabase `createSignedUrl` for the bucket, or the API's HMAC link for the local/test adapters. Previews last 5 minutes; nothing signs for more than 15 (`MAX_SIGNED_READ_SEC = 900`). |
| Download verification | Every approve / select-for-edit / frame extraction re-verifies the stored copy's hash first (`MEDIA_UNVERIFIED` otherwise) |
| Cross-project isolation | A ref carries its project. Signing refuses another project's ref (`CROSS_PROJECT_DENIED`). The API's media endpoint serves a ref only if the signature names that project **and** an asset record of that project holds the ref. |
| Revocation | Removing or replacing an asset record revokes the API's media links at once (the endpoint checks the record). Rotating `SITE00_MEDIA_SIGNING_SECRET` revokes every API link. A Supabase signed URL cannot be revoked individually before it expires: it lasts at most 5 minutes for previews, and deleting or moving the object ends it. |
| Retention | `RETENTION` in `store.ts`: masters of rejected takes may be archived by founder decision after 90 days. The record and hash stay. |

## 2. Adapters

| Adapter | Live | Where | Status |
| --- | --- | --- | --- |
| `SUPABASE_PRIVATE` | yes | Private Supabase bucket | Implemented; contract-tested against a stand-in Storage client; **live transfer BLOCKED** (no approved staging bucket) |
| `LOCAL_PRIVATE` | dev / tests | A directory outside the repository, files `0600`, dirs `0700` | Implemented and tested; refuses a root inside the repository |
| `MEMORY_TEST` | tests | Memory | Tests only; never live |

**Repository mode** (no durable store configured) has no media store: capture is refused with `STORE_READ_ONLY` instead of writing to a temporary directory. The previous temp-directory fallback was removed.

## 3. What a production master looks like

```
record   ASSET-JOB-S1-01-SH01-VIDEO-01-A01
ref      spine-media://SUPABASE_PRIVATE/site00-production-masters/the-exchange/<sha256>.mp4
object   site00-production-masters / the-exchange/<sha256>.mp4   (private; service role only)
read     signed URL, ≤ 5 min, issued per request to a project member
```

No production master exists yet. Nothing has been generated.
