# P0.VR.DESIGN-PRODUCTION1R1 — persistence audit

## EXISTING_TABLES_REVIEWED

- `site00_design_pages` / `site00_design_families` (design control plane bridge) — page/family metadata, not authority workflow
- `site00_mobile_twin_package_approvals` / `site00_mobile_twin_implementation_*` — mobile twin R8M pipeline, adjacent but not twin-opus-direct composer production state
- `site00:design-page-v3-authority:v1` (browser) — legacy Twin V3 gallery session, separate from DESIGN-PRODUCTION1 state

## REUSED

- Supabase persistence policy (`shared/site00-studio-world-execution/persistencePolicy.ts`)
- API auth pattern (`getAuthUser`, `isFounderPrivilegedAccount`, `assertFounderProjectAccess`)
- Store adapter pattern (`memory` in Vitest, Supabase + service role in production)

## EXTENDED

- None (no existing table matched `DesignWorkspaceAuthoritySession` semantics)

## NEW

- `site00_design_workspace_authority_sessions` — canonical session row `(project_id, page_id)` + optimistic `session_version`
- `site00_design_workspace_authority_events` — append-only semantic history
- `site00_design_workspace_build_packages` — durable MOVE TO BUILD packages

API: `GET|POST /api/site00/design-workspace-production`

Browser: `site00:design-workspace-production:cache:v2:{projectId}` — cache only; server wins on hydrate.
