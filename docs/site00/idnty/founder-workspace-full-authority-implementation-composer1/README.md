# Founder Workspace — full authority implementation (Composer1)

**Sprint:** `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.FULL-AUTHORITY-IMPLEMENTATION.COMPOSER1`  
**Integration branch:** `cursor/idnty-founder-readiness-e2e-be3b`  
**Implementation branch:** `cursor/founder-workspace-full-authority-implementation-composer1-be3b`

## Status

First implementation slice landed: real React shell, seven destinations, overlay host + create client, registry wired to list API (including G-01 `intake_state`), referrals + Card Studio policy gates, System embeds Test Lab readiness desk. Legacy `/admin/site00/foundation-readiness` redirects to workspace System.

Remaining: full overlay family UIs, deeper page parity vs Opus boards, authenticated staging E2E, staging deploy approval.

## Authority sources (on branch)

| Source | Path | Commit |
| --- | --- | --- |
| Opus1 | `docs/site00/idnty/founder-workspace-visual-authority-opus1/` | `b82ca64e4` (authority branch) |
| Opus2 | `docs/site00/idnty/founder-workspace-responsive-authority-opus2/` | `81407c694` |
| Opus3 | `docs/site00/idnty/founder-workspace-referrals-authority-opus3/` | `890fc40b6` |
| Policy | `docs/site00/idnty/referral-commission-policy-founder-lock1/` | `ca708271` (policy branch) |

## Application entry

- `/admin/site00/founder-workspace/overview` (auth return path)
- Module: `src/site00/admin/founder-workspace/`

## Tests

`tests/idntyFounderWorkspaceImplementation.test.ts`
