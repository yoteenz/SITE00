# Existing workspace audit (pre-implementation)

| Existing route | Component | Replacement |
| --- | --- | --- |
| `/admin/site00/foundation-readiness` | `FoundationReadinessPage` | Redirect → `/founder-workspace/system` (embedded desk) |
| `/admin/site00/foundation` | `FoundationAdminListPage` | `/founder-workspace/foundations` (registry UI) |
| `/admin/site00/foundation/:id` | `FoundationAdminDetailPage` | `/founder-workspace/foundations/:id` + legacy link |
| `/admin/site00/foundation/pipeline` | `FoundationPipelinePage` | Reviews + Operations pages (pipeline API) |
| `/admin/site00/foundation/communications` | `CommunicationsCommandPage` | Correspondence page + legacy link |
| `/admin/site00/foundation/:id/workbench` | `FoundationWorkbenchPage` | Linked from client record |
| Client intake `/foundation/:token` | `foundation-client/*` | **Unchanged** (intake nonregression) |

Auth: existing admin Bearer via `apiFetch` / `resolveAdminAuth` — unchanged.

Data: `foundationAdminApi`, `foundationReadinessApi`, `/api/admin/site00-foundation`.
