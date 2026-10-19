# Founder Workspace route map

Base path: `/admin/site00/founder-workspace`

| # | Destination | Path | Notes |
| --- | --- | --- | --- |
| 01 | Overview | `/overview` | Default after auth return |
| 02 | Foundations | `/foundations` | Registry + inspector; five-column desktop |
| 03 | Create | Overlay **OL-01** | Mobile bottom nav **Create** |
| 04 | Client detail | `/foundations/:artifactId` | Full record |
| 05 | Reviews | `/reviews` | |
| 06 | Operations | `/operations` | |
| 07 | Correspondence | `/correspondence` | |
| 06 | Referrals | `/referrals` | Mobile: **Menu** only (not bottom tab) |
| 07 | System | `/system` | Includes embedded readiness desk |

## Legacy entry

| Route | Behavior |
| --- | --- |
| `/admin/site00/foundation-readiness` | **Redirect** → `/admin/site00/founder-workspace/system` |

## Direct tunnel links (after login)

Replace `{PREVIEW_ORIGIN}` with your tunnel base URL (no trailing slash):

- Overview: `{PREVIEW_ORIGIN}/admin/site00/founder-workspace/overview`
- Foundations: `{PREVIEW_ORIGIN}/admin/site00/founder-workspace/foundations`
- Referrals: `{PREVIEW_ORIGIN}/admin/site00/founder-workspace/referrals`

## Intake (must stay working)

Client intake remains at `/foundation/:public_token` (unchanged).
