# SITE 00 — Parent–Child Navigation Linkage (P0.PCI.2)

**Experience tree + navigation tree must agree.** Child routes must be wired from the parent surface that introduces them.

## Doctrine

Parent visual authority + parent navigation intent + child function = coherent branch.

Every child/grandchild requires:

1. Resolved experience parent (PCI.1)
2. Resolved navigation origin
3. Real route/surface target
4. Valid interaction that reaches it
5. Valid back/return path
6. Functional QA

## Module

| Path | Role |
|------|------|
| `navigationLinkage/types.ts` | `ParentChildLinkageContract`, `NavigationOrigin`, `LinkageRepairPlan` |
| `parentNavigationIntentResolver.ts` | Resolve claimed targets from handlers, not labels alone |
| `interactionIntentClassifier.ts` | NAVIGATION vs MUTATION/FILTER/etc. |
| `interactiveSurfaceGraph.ts` | PAGE/TAB/MODAL/WORKFLOW_STEP graph |
| `linkageContractBuilder.ts` | Contract + orphan/dead/miswire detection |
| `linkageRepair.ts` | Safe auto-repair + ambiguous review |
| `navigationChainQA.ts` | Parent → child → grandchild chains |
| `navigationLinkageAudit.ts` | Primary orchestrator + site-wide matrix |
| `designWorkspacePilotRegistries.ts` | MORE · PAGES · ASSETS · SKINS · future-site pilots |
| `childExperienceReadiness.ts` | CURRENT = visual + wiring pass |
| `integratedExperienceAudit.ts` | PCI.1 + PCI.2 combined |
| `pageCompletionLinkageIntegration.ts` | `PAGE_CHILD_LINK_MISSING` blocker |

## UI

Design → MORE → **CHILD EXPERIENCE MATRIX** (footer link) → linkage matrix with EXPERIENCE ✓ / WIRING ✓ columns.

## Tests

```bash
npm test -- tests/parentChildNavigationLinkageP0PCI2.test.ts
```

## Gaps (next sprint)

- Live Playwright click-through runner wired to audit
- Persist linkage contracts to Supabase
- Auto-repair applied to React components (not manifest-only)
