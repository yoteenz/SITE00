# Deployment preflight

## Source

| Item | Value |
| --- | --- |
| Branch | `cursor/idnty-founder-readiness-e2e-be3b` |
| HEAD @ check | `255576b5` (#1661 merged) |
| Later merges affecting DF form-control | **None** ahead of HEAD at verification time |
| PR #1662 (Sprint B docs) | **Not merged** (per sprint) |

## Railway

| Check | Result |
| --- | --- |
| Project | empowering-clarity (founder-named) |
| Environment | staging |
| Backend service | reliable-creation-staging → `reliable-creation-staging.up.railway.app` |
| Frontend service | carefree-luck-staging → `carefree-luck-staging.up.railway.app` |
| Supabase ref (API health) | `soocqbyjkxeubfjnuwvf` (staging isolation flag true) |
| Production targeting | **Not observed** in health public origins |
| Destructive migration | **None** in this sprint |

## Agent deployment access

**Railway CLI:** not installed; no deploy credentials in agent environment.  
Recovery verified **after** an existing staging redeploy; future redeploys use founder dashboard steps in `RAILWAY_SERVICE_CONFIGURATION.md`.
