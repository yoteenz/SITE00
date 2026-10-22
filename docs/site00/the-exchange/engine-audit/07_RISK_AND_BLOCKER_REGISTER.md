# 07 — Risk and blocker register

Verified limitations only.

| ID | Category | Blocker / risk | Evidence | Severity |
|----|----------|----------------|----------|----------|
| R-01 | Persistence | Expression **creative entries in-memory**; restart loses canon | `api/_lib/site00ExpressionEngine/entryStore.ts` | **P0** |
| R-02 | Schema drift | `site00_creative_entries` migration exists; API not wired | migration `20260907160000_*`, capability genome notes "unused" | **P0** |
| R-03 | Property coupling | Entry 002/003 pipelines hard-bound to NDX narrative | `entry002*.ts` cluster, assets under `entry-002/` | **P0** for Exchange reuse |
| R-04 | Format gap | No **episode part** (1/3) entity or edit assembly | End-to-end trace § missing | **P0** for Exchange format |
| R-05 | Screenplay | No screenplay ingest / scene breakdown parser | Inventory search | **P1** |
| R-06 | Video dispatch | `autoDispatch: false`; klingBlocked bootstraps | `productionRouting.ts`, B41 tests | **P1** |
| R-07 | Kling 4 | Not on `main`; manual Artlist path unmerged (#1683) | Branch diff | **P2** until merged |
| R-08 | Casting gate | Pre-casting blocks production generation | `preCastingMode.ts`, P05E.5 tests | **P1** (correct for safety) |
| R-09 | Model default | Creative path defaults **Sonnet**, not Opus | `config.ts` | **P2** (configurable) |
| R-10 | LLM live proof | CI uses deterministic fallback without `ANTHROPIC_API_KEY` | C19* tests | **P2** |
| R-11 | NDX API shortcuts | ndxbook special cases in projects + intelligence | grep / audit JSON | **P2** |
| R-12 | Commercial terms | Artlist/Kling commercial use **UNVERIFIED** in prior Kling audit | External docs only | **P2** legal |
| R-13 | Generation ledger | Audit MA-019 — run ledger gaps for scale | `audit/findings.json` | **P2** ops |

## First blocking dependency (canonical)

**Durable, project-scoped fiction canon + episode/part data model** connected to APIs (not NDX Entry 002 in-memory pattern).
