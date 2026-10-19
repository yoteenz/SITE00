# Live SPA smoke results

## Asset routing

| Request | Status | Content-Type |
| --- | ---: | --- |
| `/assets/chunk.deleted-by-deploy.js` | **404** | `text/plain` (not HTML) |

**PASS** — no HTML-as-JS regression.

## Form-control runtime smoke

Script: `staging-live-spa-form-control-smoke.mjs`

| Check | Result |
| --- | --- |
| `/foundation/review#df-r-P02` loads | PASS |
| Business Type control | **`button`** (editorial select enabled) |
| CONTACT NUMBER label | visible |
| Screenshot | `/opt/cursor/artifacts/staging-parity-recovery-composer1/staging-p02-mobile.png` |

## API target in bundle

Entry bundle references **`reliable-creation-staging.up.railway.app`** (also contains production hostname string from shared module graph — runtime uses build-time `VITE_API_BASE` on staging deploy).

## Not run on live staging

- Full authenticated synthetic client create (requires founder Supabase sign-in)
- Save/resume browser journey
- Intake completion E2E
- iPhone Safari / VoiceOver
