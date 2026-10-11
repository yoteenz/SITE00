# Multi-brand data contract

## Brand firewall

- **Studio shell** may remain SITE 00-branded (admin control UI).
- **Email canvas** must render the campaign’s `brand_authority_id`.
- Digital Foundation uses `site00-dna` (`uses_site00_visual_dna: true`).
- External client campaigns must register a separate `BrandAuthorityContract` with `uses_site00_visual_dna: false`.

## Required brand authority fields

| Field | Purpose |
|---|---|
| `brand_authority_id` | Stable key on campaigns and projects |
| `uses_site00_visual_dna` | Prevents accidental SITE 00 palette on client sends |
| `colors`, `typography`, `voice_ref`, `logo_ref` | Client-specific DNA when not SITE 00 |
| `approval_requirements` | Who must sign off before delivery |

## Tenant safety (V1)

Workspace is founder-only. Manifests are scoped by `organization_id` and `project_id`. No client portal. Export builder rejects cross-project asset paths (future hardening).

Code: `shared/site00-correspondence-studio/brandFirewall.ts`
