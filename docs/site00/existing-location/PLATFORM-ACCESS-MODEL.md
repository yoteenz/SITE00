# Platform Access Model

`AccessRequirement` fields: platform, access_type, permission_scope, required_or_optional, purpose, read_only_supported, write_required, temporary_supported, instructions, status, connected_at, revoked_at.

**Client states:** NOT_REQUESTED → REQUESTED → CONNECTED | INSUFFICIENT_ACCESS | REVOKED | EXPIRED

**Never:** primary account passwords in free-text fields or chat inputs.

**Shopify (first adapter):** collaborator, theme development, GitHub read-only, custom app scopes — see `SHOPIFY-DIAGNOSTIC-ADAPTER.md`.
