# Marketing email authority — registration

Sprint: `P0.SITE00.IDNTY.MARKETING-EMAIL-AUTHORITY-DIRECT-URL-REGISTRATION-RECOVERY2`  
Date: 2026-10-10  
Status: **REGISTERED**

The founder-approved marketing email poster is registered from a **direct signed Supabase URL** (raw HTTP GET). The response bytes were checksum-verified before commit. Chat attachments are no longer the intake path for this asset.

## Canonical asset

| Field | Value |
| --- | --- |
| File | `SITE00_MARKETING_EMAIL_APPROVED_AUTHORITY_V1.jpg` |
| SHA256 | `e814042c318f7f45d7db07a6d11e4878fcc20888c583a76537828cfa3c2ede83` |
| Bytes | 491,267 |
| MIME | `image/jpeg` |
| Pixels | 1086 × 1448 |

Machine-readable record: `MARKETING_EMAIL_AUTHORITY_MANIFEST.json`.

## Authority role

This image is the **visual authority** for SITE 00 marketing email design language (lifecycle, quote/proposal, activation/journey, and campaign/newsletter-style sends). Typography rhythm for generated email art should follow **uppercase display/body** aligned to SITE 00 visual language unless a future founder brief overrides it.

## Conventions for future sprints

- OpenArt and Grok batch-generation sprints must bind this **repo file** as the reference asset (`canonical_file` in the manifest). Do not block on chat attachment checksum recovery once this commit is on the working branch.
- Do not re-export, screenshot, or re-encode this JPEG for registration; replace only when the founder supplies a new file with an updated expected SHA256.
- Prior blocked state and chat re-encode forensics: `MARKETING_EMAIL_AUTHORITY_CHECKSUM_RECOVERY.md`.

## Mass production linkage

| Item | Value |
| --- | --- |
| MARKETING_AUTHORITY | REGISTERED |
| CANONICAL_FILE_COMMITTED | YES |
| BATCH_I_IMAGES | 3 (unchanged) |
| REVISED_CREDIT_CEILING | 6,340 (unchanged) |
| FOUNDER_BUDGET_APPROVAL | PENDING |

PR: **#1597** (`cursor/df-mass-production-scope-a9f7`). No merge or deploy in this sprint.
