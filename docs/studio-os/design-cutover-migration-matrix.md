# Production design cutover — legacy capability matrix

Sprint: **P0.STUDIOOS.PRODUCTION.DESIGN-CUTOVER1**

| Old capability | Legacy route / component | Still used? | New design equivalent | Migration | Disposition |
| --- | --- | --- | --- | --- | --- |
| Page concept gallery / generation | `DesignWorkspaceCore` / twin-opus-direct | Yes (production ops) | COMPILER mode (seed UI) + shared `site00-design-workspace-production` services | Logic retained in shared package; UI re-homed incrementally | **Internal services retained** |
| Mobile concept selection / authority | `pageConceptPipeline/*` | Yes | COMPILER / SURFACES | Hooks unchanged; new workspace surfaces decisions | **Retained as services** |
| Desktop / tablet expression generation | GPT2 viewport family rail | Yes | SURFACES / COMPILER | Same backend modules | **Retained as services** |
| Page system review / family / interactions | `designPageSystemReview` | Yes | EXPERIENCE / COMPILER | New mode UX; same shared modules callable from legacy | **Mapped — full UI parity deferred** |
| Asset manifest / Grok staging | `designGrokAssetModel` | Yes | ASSETS mode | New ASSETS center; legacy dock not embedded | **Mapped** |
| Pipeline / readiness rows | `useDesignWorkspacePipeline` | Yes | On-your-table + pipeline strip in unified workspace | Presentation migrated | **Migrated (UX)** |
| References / pages / skins tabs | `/design/references` etc. | Low | BRAND / SURFACES / ASSETS | Section routes **redirect** to `/design` | **Retired as routes** |
| Opus / Grok direct controls | Twin opus direct screen | Admin | Not in unified shell | Legacy UI at `/design-legacy/*` only | **Legacy-only** |
| Production handoff / promotion | `designProductionProjection` | Yes | COMPILER / ASSETS | Shared module | **Retained as services** |
| Founder judgments / decisions | localStorage + pipeline state | Yes | `dwsState` decisions | Parallel store in unified workspace | **Migrated (new store)** |

**Canonical route:** `/production/:projectSlug/design`  
**Alias redirect:** `/production/:projectSlug/design-workspace` → `/design`  
**Legacy debug UI:** `/production/:projectSlug/design-legacy/*` (hidden from nav)
