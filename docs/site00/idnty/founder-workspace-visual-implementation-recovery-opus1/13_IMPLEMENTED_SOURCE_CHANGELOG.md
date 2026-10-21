# 13 · Implemented source changelog (`b446db3f` → `ba4012d59`)

| File | Component | Authority | Reason | Difference | Responsive impact | Interaction impact | Tests |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `scripts/vite-site00-local-api.mjs` | Dev local-API loader | — | Compile failure (doc 01) | Vite's esbuild; metafile-based rebuild; cache-busted import | None | Admin API works in dev | Recovery test #1 |
| `src/site00/admin/founder-workspace/styles/ifw-authority.css` (new) | Workspace stylesheet | OPUS2 `ws.css` (81407c694) | Authority never ported | Verbatim port, scoped to `.ws`; link reset; `svg.ws-ic`; safe area | All tiers + container rules | Focus ring, buttons | Recovery test #3 |
| `shell/wsKit.tsx` (new) | Primitives | OPUS2 `ws-kit.js` | Shared markup | DF icons, marks, status, plates, segments, buttons, panels, banner, activity, brand | — | — | via pages |
| `shell/FounderWorkspaceShell.tsx` | Shell | `ws-kit app()/sidebar/rail/topbar/bnav` | Generic header/nav | Rebuilt markup; props now `crumb`, `density` | M / TP / TL / D / UW | Same overlays (OL-01/03/04/05/18), ⌘K | Recovery test #2; existing nav tests |
| `shell/FounderWorkspacePageFrame.tsx` | Page header | `phead()` | No index rail, object or authority header | `ws-phead` + `ws-page`; title/sub/actions/arch overrides | Title scale per tier | — | — |
| `pages/OverviewPage.tsx` | Overview | `ws-pages overview()` | Generic metrics page | Focus, signals, needs you, registry, movement, empty, error; real API | Container-driven | Rows → client record; retry; create | Recovery test #6 |
| `data/lifecycle.ts` (new) | State mapping | OPUS1 lifecycle + status kinds | Real state → approved grammar | 17 states + payment exceptions + pipeline blockers | — | — | Recovery tests #4–5 |
| `overlays/bodies/WorkspaceMenuRows.tsx` (new), `WorkspaceOverlayBody.tsx` | OL-03 body | `ws-overlays OL-03` + OPUS3 nav | Menu listed 3 rows | All seven destinations + current + tools | — | Links close the menu | Existing overlay tests |
| `tests/idntyFounderWorkspaceVisualRecovery.test.ts` (new) | Tests | — | Lock the recovery | 6 tests | — | — | — |

No database, payment, auth, intake, Railway or production file changed.
