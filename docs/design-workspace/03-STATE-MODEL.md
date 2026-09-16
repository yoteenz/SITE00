# Deliverable 5 + 6 — State Model and State Transitions

## Deliverable 5 — `DesignWorkspaceStateContract`

State splits into three tiers, and the tier decides persistence. Conflating them
is how a view switch ends up resetting a promotion.

- **Tier A — workspace data.** The authority session. Persisted, audited, shared
  by both renderers. Today: `localStorage` `site00:design-page-v3-authority:v1`.
- **Tier B — workspace focus.** What the founder is currently operating on.
  Shared by both renderers, not audited, not persisted across visits.
- **Tier C — presentation.** How the workspace is drawn. Never affects data.

| key | tier | type | values | default | persistence | scope | writers | readers | depends on |
|---|---|---|---|---|---|---|---|---|---|
| `workspace.viewMode` | C | union | `canonical` `list` | `canonical` | sessionStorage `site00:twin-opus-direct:view-mode:v1` | local | DW-VIEW-002/003 | shell renderer registry | — |
| `viewport` | B | union | `MOBILE` `TABLET` `DESKTOP` | `MOBILE` | none | local | DW-VP-002/003/004 | DW-AUTH labels, DW-GAL ticks, next-action resolver | FD-05 for `TABLET` |
| `selectedCandidate` | B | id | any `candidateCollection` id | first candidate | none | local | DW-GAL-004 | hero, record, output, candidate actions | `candidateCollection` |
| `candidateCollection` | A | array | generated candidates with lineage | server / session gallery | session | shared | generation actions | gallery, compare, record | project, territory |
| `authorityPair` | A | object or null | status union in doc 02 | null | session | shared | promote, replace, lock | DW-STG-004, pair review, readiness | both masters |
| `mobileMaster` | A | object or null | status `PROMOTED` `PAIR_LOCKED` `SUPERSEDED` | null | session | shared | promote, replace, lock | DW-AUTH-006..009, readiness | `viewportSelection.mobile` |
| `desktopMaster` | A | object or null | same | null | session | shared | promote, replace, lock | DW-AUTH-010..013, readiness | `viewportSelection.desktop` |
| `viewportSelection` | A | `{ mobile, desktop }` refs | candidate refs or null | both null | session | shared | select / unselect | DW-AUTH-001/003, promote guards | `candidateCollection` |
| `candidateViewportStates` | A | map | `GENERATED` `NOT_SELECTED` `SELECTED` `PROMOTED` `SUPERSEDED` `REJECTED` per viewport | `GENERATED` | session | shared | select, promote, replace | gallery ticks | — |
| `authorityStatus` | A | derived | `pairStatusLabel(session)` | derived | derived | shared | — (derived) | DW-STG-004 | pair, masters |
| `authorityCollapsed` | C | boolean | true / false | expanded (`false`) | none | local | DW-AUTH-005 | authority block | — |
| `readiness` | A | receipt | `CompilerReadinessReceipt` | computed | derived | shared | compiler | DW-PIPE-003..013, next action | pair, manifest, assets |
| `checks` | A | array | gate rows with `PASS` `FAIL` `BLOCKED` `NOT_APPLICABLE` | from receipt | derived | shared | compiler | DW-PIPE-010..012 | `readiness` |
| `statusCounts` | A | derived | blockers and warnings counts | from receipt | derived | shared | compiler | DW-PIPE-017/018 | `checks`; approved/pending unresolved FD-07 |
| `currentHistoryTab` | C | index 0–4 | the five record tabs | `0` | none | local | DW-REC-001..005 | record panel | — |
| `navSelection` | B | index 0–5 | the six primary tabs | `0` | URL `?tab=` on the live workspace | local | DW-NAV-002..007 | workspace body | routes |
| `dockSelection` | C | index 0–4 | the five dock items | `0` (`WORKSPACE`) | none | local | DW-DOCK-001..005 | dock drawers | — |
| `currentStage` | A | string | e.g. `REVIEW_ACTIVE_CONCEPT` | from session | session | shared | workflow | DW-STG-002 | pair status |
| `currentEntry` | A | object | entry id, artifact type, page role | from project | session | shared | target selection (FD-04) | DW-TGT, DW-HERO | project |
| `activeAmendment` | A | object or null | `MasterAuthorityAmendment` | seeded `maa-r5f1-authority-selection-v1` | session | shared | amendment workflow | DW-AMD, DW-REC-005 | feature manifest |
| `generationState` | B | union | `IDLE` `LOADING` `SUCCESS` `ERROR` | `IDLE` | none | local | DW-CAND-001/002 | gallery pending card, action disabling | provider |
| `overlay` | C | union or null | see doc 05 | `null` | none | local | every overlay trigger | overlay host | — |
| `compareSelection` | C | `{ left, right }` | candidate ids | left = selected, right = next | none | local | DW-GAL-002 | compare overlay | `candidateCollection` |

**The firewall rule.** Tier C is the only state a view-mode switch may touch, and
`viewMode` is the only Tier C key a view-mode switch actually writes. Tiers A and
B are byte-identical across the switch. This is already enforced by
`useTwinOpusDirectWorkspace` holding one state object above both renderers, and
it must stay that way: a renderer that introduces its own copy of
`selectedCandidate` breaks the contract.

## Deliverable 6 — `DesignWorkspaceStateTransitions`

| action | from | to | mutates | persists | audit event | canonical | list |
|---|---|---|---|---|---|---|---|
| Switch view mode | `canonical` | `list` | `viewMode` | sessionStorage | none | n/a | n/a |
| Select viewport | `MOBILE` | `DESKTOP` | `viewport` | no | none | same | same |
| Select candidate | candidate A focused | candidate B focused | `selectedCandidate` | no | none | same | same |
| Select for mobile | `NOT_SELECTED` | `SELECTED` (mobile) | `viewportSelection.mobile`, `candidateViewportStates` | yes | `VIEWPORT_SELECTED` | same | same |
| Select for desktop | `NOT_SELECTED` | `SELECTED` (desktop) | `viewportSelection.desktop`, `candidateViewportStates` | yes | `VIEWPORT_SELECTED` | same | same |
| Unselect viewport | `SELECTED` | `NOT_SELECTED` | `viewportSelection[v]` | yes | `VIEWPORT_UNSELECTED` | same | same |
| Promote master | selection, no master | master `PROMOTED` v1 | `mobileMaster` or `desktopMaster`, `authorityPair`, candidate state | yes | `VIEWPORT_MASTER_PROMOTED` | same | same |
| Promote over existing | master v1 | master v2, prior `SUPERSEDED` | masters, `supersededMasters`, `derivationStatus` | yes | `VIEWPORT_MASTER_PROMOTED` + `VIEWPORT_MASTER_SUPERSEDED` (+ `DERIVATION_MARKED_STALE`) | same | same |
| Replace master | master `PROMOTED` | slot empty, prior `SUPERSEDED` | master → null, `supersededMasters`, `authorityPair` → null | yes | `VIEWPORT_MASTER_SUPERSEDED` | same | same |
| Second promotion completes pair | `MOBILE_ONLY` | `PAIR_READY` | `authorityPair` | yes | `VIEWPORT_MASTER_PROMOTED` | same | same |
| Open pair review | `PAIR_READY` | `PAIR_READY` | `pairReviewOpen` only | no | none | inline disclosure | inline disclosure |
| Lock pair | `PAIR_READY` | `PAIR_LOCKED` | pair, both masters, `executionIntent`, `inventionBudget`, `founderReview` | yes | `PAIR_LOCKED` | same | same |
| Refine concept | `IDLE` | `SUCCESS` with new child candidate | `candidateCollection`, `selectedCandidate`, `generationState` | yes | `candidate_refined` | same | same |
| Regenerate concept | `IDLE` | `SUCCESS` with new sibling | `candidateCollection`, `selectedCandidate`, `generationState` | yes | `candidate_regenerated` | same | same |
| Toggle authority pair block | expanded | collapsed | `authorityCollapsed` | no | none | caret | section header |
| Select record tab | tab 0 | tab n | `currentHistoryTab` | no | none | same | same |
| Select dock item | `WORKSPACE` | drawer n | `dockSelection`, `overlay` | no | none | same | same |
| Open any inspection overlay | `null` | overlay id | `overlay` | no | none | same | same |
| Move to build | `PAIR_LOCKED`, gates pass | build phase | `ImplementationPackageStatus` | yes | `move_to_build` | same | same |

Every row is identical in CANONICAL and LIST because both call the same actions
on the same state. That is the parity guarantee, verified in doc 06.
