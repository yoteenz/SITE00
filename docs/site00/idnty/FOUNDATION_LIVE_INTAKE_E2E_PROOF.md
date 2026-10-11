# Foundation live intake E2E proof

**Status:** **NOT RUN** — blocked by Supabase data path + stale public frontend.  
**Sprint:** Anthony infrastructure recovery (execution 5)

## Preconditions (all required)

- [ ] Supabase `SELECT 1` + `site00_df_*` schema verified
- [ ] Migrations 160000 + 170000 applied (founder approved)
- [ ] Railway API deployed to current `main`; health shows persist + intake-only
- [ ] `action=payload` returns in < 3 s (404 or 200), not 500/timeout
- [ ] cPanel SPA updated from 2026-10-10 release (not September bundle)
- [ ] Disposable artifact minted (not Anthony production link)

## Test matrix (to execute when unblocked)

| Step | Surface | Viewport | Pass criteria |
| --- | --- | --- | --- |
| P01 ENTRY | `site00.com/foundation/:token` | 393×852 | Loads; vector chamber; BEGIN works |
| P02 INTAKE | same | 393×852 | Fields editable; panels filled |
| P03 CONFIG | same | 393×852 | Selections stick |
| SAVE | PATCH/POST intake | — | 200; no 503 |
| RESUME | Hard refresh | — | Same business name / selections |
| SUBMIT | Intake-only gate | — | `INTAKE_SUBMITTED`; checkout blocked |
| FOUNDER | Admin detail | — | Same record as client |

## Evidence captured this sprint (infrastructure only)

| Probe | Result |
| --- | --- |
| `GET api.site00.com/api/health` | 200 — flags ON |
| `GET …?action=catalog` | 200 ~0.14 s |
| `GET …?action=payload&token=<uuid>` | **500 ~20 s** — **FAIL** |
| `site00.com` bundle | `index.D8Jaygrd.js` Sep 2026 — **FAIL** |

## Screenshots

None on production Anthony path this sprint. Prior dev evidence remains in `ANTHONY_GATE_A_EVIDENCE.md` (memory store / tunnel — **not** production durability proof).

## Restart test (Group D)

**Not authorized / not run.** Requires disposable persisted row + founder approval for controlled API restart.
