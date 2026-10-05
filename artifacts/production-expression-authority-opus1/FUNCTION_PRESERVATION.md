# FUNCTION PRESERVATION

The previous Expression sub-screens were presentation-only, apart from the narrative judgment. Every function they had is kept below, under the same test id where one existed.

| Previous function | Where it lives now | Test id |
|---|---|---|
| Narrative Story / Structure / Momentum tabs | Routes `/narrative/story`, `/structure`, `/momentum` (plus `/proof`) | `expression-tab-*` |
| Narrative founder judgment (APPROVE / REFINE / RECOMPILE) using `postNarrativeMomentumJudgment` and `postCompileNarrativeMomentum`, then engine `reload` | `NarrativeApproval` on the narrative routes and on Review approval detail | `narrative-approve`, `narrative-refine`, `narrative-recompile` |
| Engine plan precedence (`nme.plan` over canonical compile) | `usePlan()` | — |
| Casting role rows (character, actor, assigned / unresolved) | `/casting`, `/casting/roles` | `casting-role-row` |
| Open actor catalogue | Casting root and roles | `casting-open-catalogue` |
| Creative actor search (`castingCreativeSearch`) | `/casting/actors` | `acting-catalogue-search`, `actor-row-<SW-###>` |
| Cast gate / missing authorities note | `/casting/roles`, Cast Gate panel | `casting-gate` |
| Wardrobe character select + era segment | Every Look + Wardrobe route | `wardrobe-character-select`, `wardrobe-era` |
| Wardrobe Looks / Hair / Makeup fields | `/wardrobe/looks`, `/hair`, `/makeup` (plus outfits, accessories, fittings, continuity) | `look-*` |
| Open fitting in expression engine | Look routes | `wardrobe-open-engine` |
| Performance character select; Behavior / Movement / Voice / Emotion | Performance root and beats (lens segment) | `performance-character-select`, `performance-lens` |
| Open performance in expression engine | Performance gate | `performance-open-engine` |
| Sets empty states + set details + open environment library | Sets routes (environment, set and zone kept distinct) | `sets-empty`, `sets-details`, `sets-open-libraries` |
| Storyboard status + open storyboard in engine | Storyboard routes | `storyboard-open-engine` |
| Review package checklist | `/review` (rows link to approval detail) | `review-package`, `review-package-row` |
| Lock production package (disabled until all ready) | `/review` handoff | `lock-production-package` |
| Send to storyboard handoff (disabled until all ready) | `/review` handoff | `handoff-send` |
| Review checklist links to sub-workspaces | Approval detail, "OPEN <FAMILY>" | `review-open-family` |
| Previous screen test ids | Kept on each family body | `expression-sub-screen-{narrative,casting,wardrobe,performance,sets,storyboard,review}` |
| `?entry=` campaign context | Every in-family link carries `?entry=` (tested on all 40 routes) | — |
| Character Fabrication | Unchanged (own surface) | — |
| Expression root (Production Floor) | Unchanged | `production-expression-shell` |

## Existing actions newly reachable in Expression (no new API)
- **Storyboard approve / request revision:** uses the hub's `decideStoryboard`, the same action Hub and Inbox use. It is enabled only when the founder gate is open, on storyboard, and decidable in Hub.

## Unchanged
- Router, auth guards, API calls and data contracts.
- Production registry (8 Expression sub-workspaces).
- Host header and bottom nav.
