# FAMILY PRODUCTION CONTRACT (PROJECT-AGNOSTIC)

Version: `SITE00.FAMILY_PRODUCTION_CONTRACT.V1`
Schema: `shared/site00-product-families/familyProductionContract.ts`
Gate + completeness: `shared/site00-product-families/familyGate.ts`
First instance: JURNL F01 ENTRY — `src/projects/jurnl/data/f01/contract.ts`

The schema names no project. A test strips comments from every shared module and fails on any project name.
Any SITE 00 product (personal or client) declares its families with this shape. The DESIGN workspace reads them generically
(`src/projects/families.ts` → `ProjectFamilyChamber` / inspector).

## Fields

| Field | Meaning |
|-------|---------|
| `familyId`, `familyName`, `projectId`, `purpose` | Identity + why the family exists |
| `parentScreen` | Approved parent (visual DNA lock) |
| `screens[]` | `FamilyScreenNode`: id, name, role `PARENT / CHILD / GRANDCHILD`, parentId, runtimeRoute, authorityFile, approvalStatus, implementationStatus, stateIds, bridgeTo |
| `states[]` | State authorities (id, screenId, label, authority sheet) |
| `interactions[]` | Interaction inventory (trigger, type, surface, componentRef, source screen, authority) |
| `dataObjects[]` | Data the family reads / writes |
| `globalComponents[]`, `familyComponents[]` | Component refs (mapped to runtime implementations by the project) |
| `globalAssets[]`, `familyAssets[]` | `FamilyAssetRequirement` with asset class + status `CANONICAL / CODE_CONSTRUCTED / REFERENCE_ONLY / MISSING / NOT_CANONICAL` |
| `iconRequirements[]` | Icon contract (e.g. LIVE_CODE_SVG) |
| `responsive[]` | Responsive targets + rules |
| `brandExpressionLevel` | How much brand expression the family carries |
| `generationSettings`, `generationBudget` | Budget contract (see `BUDGET_CONTRACT.md`) |
| `assetPolicy` | Asset-first resolution (see `ASSET_FIRST_POLICY.md`) |
| `approvalStatus` | `NOT_STARTED → GENERATED → IN_REVIEW → IMPLEMENTATION_READY → FOUNDER_APPROVED → CANONICAL` (+ `SUPERSEDED / REJECTED`) |
| `implementationStatus`, `qaStatus` | Build + live QA status |
| `founderApproval` | `{ approved, approvedAt, note }` — only the founder sets it; never inferred from generated assets |
| `lineage`, `supersession` | Sprint lineage; what this family supersedes / is superseded by |
| `journeys?` | Named paths through the tree (e.g. NEW, SIGN_IN, RETURNING, RECOVERY) |
| `claims?` | Copy-claim substantiation summary (withheld / flagged) |

## Interaction-first QA rule

**`SCREEN_COMPLETE != FAMILY_COMPLETE`.** `evaluateFamilyGate(contract, runtimeCoverage)` checks the runtime's declared coverage
against the contract:

| Gate key | Passes when |
|----------|-------------|
| `SCREENS_READY` | every screen id has a live route |
| `STATES_READY` | every state authority is reachable |
| `INTERACTIONS_READY` | every interaction id is bound to a live trigger |
| `COMPONENTS_READY` | every componentRef used by interactions has a runtime implementation |
| `RESPONSIVE_READY` | every responsive target is implemented |
| `ASSET_POLICY_RESOLVED` | `RESOLVED`, or `LEGACY_EXCEPTION` **with a documented reason** |
| `QA_READY` | `qaStatus = LIVE_PASS` (live browser QA, not unit tests) |

- `implementationReady` = no gate key FAIL.
- `screenComplete` = screens only. A family with all screens and nothing else **fails** the gate (test-enforced).
- `familyComplete` = implementationReady **and** founder approval.

The 16-item **family completeness contract** (`FAMILY_COMPLETENESS_CONTRACT`): product purpose, screen tree, parent authority,
children, grandchildren where required, state authorities, interaction inventory, interaction authorities, component mapping,
asset contract, icon contract, responsive behaviour, data dependencies, implementation, live QA, founder approval.

## JURNL F01 today

Gate: SCREENS / STATES / INTERACTIONS / COMPONENTS / RESPONSIVE / QA = PASS · ASSET_POLICY_RESOLVED = LEGACY_EXCEPTION →
`implementationReady = true`, `familyComplete = false` (founder runtime review pending). Completeness: 15/16 (FOUNDER_APPROVAL open).
Visible in DESIGN: `/production/jurnl/design?mode=compiler&inspect=gate`.

## Adding a family (F02+) or another project

1. Write the contract instance under `src/projects/<slug>/data/<family>/contract.ts` (data only).
2. Write the runtime coverage the runtime actually provides.
3. Register it in `src/projects/families.ts`.
4. If the family has live UI: add screens to the project runtime; the host needs no change (runtime registry entry once per project).
5. The gate stays red until coverage, asset policy and live QA are real.
