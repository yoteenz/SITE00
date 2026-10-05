# P0.STUDIOOS.PRODUCTION.EXPRESSION.RESPONSIVE-AUTHORITY-CONVERGENCE.OPUS1

Expression is now one family system: 10 families and 40 routes in one shell, mounted in the shared Production authority frame. That frame provides the shared host header, the bottom nav with EXPRESSION active, and no page scroll.

- **Authority pack:** `STUDIOOS_EXPRESSION_AUTHORITY_LITE_v2`. README, manifest, ROUTE_PAIRING_AUDIT (40/40 PAIRED) and the OPUS sprint brief were read.
- **Routes:** all 40 live under the existing `expression/*` wildcard. The router is unchanged; one route model (`expressionRoutes.ts`) resolves them.
- **Data:** everything comes from canonical sources: Entry 002 narrative plan, cast state, acting catalogue and hub graph/frames. Missing material is shown as honest EMPTY or UNMOUNTED states.

## Code
| File | Role |
|---|---|
| `src/site00/components/productionAuthority/expression/expressionRoutes.ts` | 10 families, 40 routes, authority pairing, resolver, hrefs, frame screen id |
| `src/site00/components/productionAuthority/expression/expressionData.ts` | Read model for every route; keeps ROLE, ACTOR and CHARACTER as separate records |
| `src/site00/components/productionAuthority/expression/ExpressionFamilyShell.tsx` | Shared shell (hero, breadcrumb, status strip, family tabs, panel grid) and primitives |
| `src/site00/components/productionAuthority/expression/families/*.tsx` | Narrative, Casting, Look, Performance, Sets, Storyboard, Review, and Downstream (Format → Package → Campaign) |
| `src/site00/components/production/ExpressionSubScreens.tsx` | Route → family dispatcher; keeps the previous exports and `expression-sub-screen-*` ids |
| `src/site00/pages/production/ExpressionProductionShellPage.tsx` | Deeper switch: families, character-fabrication, landing |
| `src/site00/pages/production/ProductionWorkspaceProjectHubPage.tsx` | Mounts family routes in `ProductionAuthorityFrame screen="expression-<family>"` |
| `src/site00/components/productionAuthority/HubBody.tsx` | `LiveStatusBar` takes an optional `context` (family / route cell) |
| `src/site00/styles/site00-production-expression-family.css` | No-scroll contract, responsive 12/6-column panel grid, primitives |
| `tests/productionExpressionAuthorityConvergenceOpus1.test.ts` | 66 tests |

## Proof
- `ROUTE_MATRIX.md`, `AUTHORITY_MATRIX.md`, `RESPONSIVE_MATRIX.md`, `NO_SCROLL_MATRIX.md`, `FUNCTION_PRESERVATION.md`, `BEFORE_AFTER.md`, `RESIDUALS.md`
- `NO_SCROLL_REPORT.json` covers 40 routes × 5 viewports, live. `NO_SCROLL_REPORT_BEFORE.json` holds the "before" measurement of the 8 pre-existing routes.
- `TOP_NAV_CLIP_REPORT.json`: header ink-clip detector, 6 Expression routes × 7 widths, 42/42 clean.
- `<NN-family>/<route>/<mobile|tablet|desktop>/authority-vs-live.jpg`: 120 pairs, authority on the left and live on the right.
- `BEFORE_AFTER_DESKTOP.jpg`, `BEFORE_AFTER_MOBILE.jpg`

## Status
Draft PR only. Not merged and not deployed; founder review is required.
