# Git and deployment baseline

**Timestamp:** 2026-10-19T17:07Z UTC

## Integration branch

| Field | Value |
| --- | --- |
| Branch | `cursor/idnty-founder-readiness-e2e-be3b` |
| HEAD SHA | `255576b5d737a660ea930c646d366e1f034fe7ae` |
| Sprint A PR #1661 | **MERGED** @ 2026-10-19T16:52:02Z |
| Persistence repair #1657 | Present (`a99d914d` ancestor) |

## Sprint A scope verified in tree

- `shared/site00-digital-foundation/contactPhone.ts`
- System B CSS + `DfCheckMark` usage
- `completeIntake` phone guard in `api/_lib/digitalFoundation/service.ts`

## Merge-readiness (pre-merge retrospective)

PR #1661 was reviewed via automated regression suites on integration HEAD after merge. No schema migrations. No unrelated founder workspace changes in Sprint A diff.

## Deployment authorization

Sprint B did **not** deploy to Railway (no agent deploy credentials). Staging must be redeployed by founder/Railway from integration HEAD.
