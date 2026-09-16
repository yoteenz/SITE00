# Design Workspace Interaction Contract

**Sprint:** `P0.VR.DESIGNBENCH.OPUS-INTERACTION-CONTRACT1`
**Subject route:** `/projects/:projectSlug/design/twin-opus-direct`
**Status:** pre-Composer functional contract. Nothing here is implemented by this sprint.

The design tells us what exists. This contract defines what it means.

Composer implements the approved visual contract plus this approved interaction
contract, and nothing else. Where this contract says `FOUNDER_DECISION_REQUIRED`,
Composer must stop rather than choose.

## Document set

| File | Deliverables |
|---|---|
| [`01-ELEMENT-INVENTORY.md`](./01-ELEMENT-INVENTORY.md) | 1 Master element inventory · 2 Classification taxonomy |
| [`02-AUTHORITY-STATE-MACHINE.md`](./02-AUTHORITY-STATE-MACHINE.md) | Section 09 authority state machine |
| [`03-STATE-MODEL.md`](./03-STATE-MODEL.md) | 5 State model · 6 State transition table |
| [`04-ROUTES-AND-PAGES.md`](./04-ROUTES-AND-PAGES.md) | 3 Route map · 4 Page hierarchy |
| [`05-OVERLAYS-ASYNC-PERMISSIONS-EVENTS.md`](./05-OVERLAYS-ASYNC-PERMISSIONS-EVENTS.md) | 8 Overlay map · 9 Permissions · 10 Async states · 11 Cost guards · 12 History events |
| [`06-PARITY-RESPONSIVE-ACCESSIBILITY.md`](./06-PARITY-RESPONSIVE-ACCESSIBILITY.md) | 7 Interaction surfaces · 13 Canonical/List parity · 14 Responsive · 15 Accessibility |
| [`07-INHERITANCE-AND-FOUNDER-DECISIONS.md`](./07-INHERITANCE-AND-FOUNDER-DECISIONS.md) | 16 Inherited patterns · 17 Unresolved founder decisions |
| [`composer-contract.json`](./composer-contract.json) | 18 Composer handoff contract (machine-readable) |

## The one thing to understand first

The page under contract is a **visual reconstruction**, not a wired product surface.

`TwinOpusDirectScreen` reads every string from static constants in
`twinOpusDirectContent.ts` and holds seven pieces of local UI state. Six actions
are wired (`selectViewport`, `selectNavSection`, `selectCandidate`,
`toggleAuthorityPair`, `selectRecordTab`, `selectDockDestination`); every other
button renders and does nothing. No API call, no Supabase write, no navigation.

The real workflow this page depicts already exists elsewhere in the repository,
in `shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/`.
That is where select, promote, replace, lock, the readiness gate and the event
taxonomy actually live. **This contract binds the reconstruction to that existing
architecture rather than inventing a parallel one.**

## Source of truth order used

Every semantic claim in these documents was resolved in this order, and each
entry cites which rung it came from.

1. **Existing confirmed SITE 00 product architecture** — chiefly the design
   workspace feature manifest `DESIGN_WORKSPACE_FEATURE_DEFINITIONS_V1` in
   `shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceFeatureAuthority/featureDefinitionsV1.ts`.
   Twenty-nine features map almost one-to-one onto the sections of this page and
   carry founder-authored descriptions. This is the strongest evidence available
   and it decides most of the contract.
2. **Current repository routes / state / business logic** — `designWorkspaceAuthorityPipeline.ts`,
   `designWorkspaceAuthorityTypes.ts`, `src/site00/config/routes.ts`,
   `src/routes/Site00Routes.tsx`.
3. **Current Design Workspace implementation** — the live `?tab=` workspace at
   `/projects/site00/design` and the `DesignPageV3Authority*` panels.
4. **Approved page semantics** — the golden reference and prior sprint records.
5. **Founder intent already encoded in the project** — feature prompt markers,
   MEMORY entries.
6. **Visual affordance** — used only where rungs 1 to 5 are silent, and always
   labelled as such.

Where rung 6 was the only available evidence for something load-bearing, the
element is marked `FOUNDER_DECISION_REQUIRED` instead of guessed.

## Vocabulary warning: the mock strings lie in three places

The reconstruction is faithful to the golden image, and the golden image contains
copy that contradicts the real product model. Composer must implement the
architecture, not the mock string.

| Mock string on the page | What the architecture actually says |
|---|---|
| `82%` readiness ring, `LAYOUT SYSTEM / TYPE SCALE / ASSET LINKS / FUNCTION MAP / ACCESSIBILITY` | Feature `compiler_readiness` is specified as "READY MISSING BLOCKED UNKNOWN STALE — **no fake metrics**". Real readiness is a PASS/FAIL/BLOCKED gate receipt, not a percentage. |
| `APPROVED ELEMENTS 18 / PENDING 2 / BLOCKERS 0 / WARNINGS 1` | No such aggregation exists. Real blockers come from `CompilerReadinessReceipt.blockers`. |
| `AMENDMENT … ACTIVE`, `AMENDMENT TYPE: AUTHORITY SELECTION` | `MasterAuthorityAmendment.status` is `DRAFT | APPROVED | APPLIED | SUPERSEDED`. There is no `ACTIVE`. The canonical record `maa-r5f1-authority-selection-v1` has `amendmentType: 'FEATURE_ADDITION'` and `status: 'APPROVED'`. |

`PAIR: UNLOCKED` is a fourth trap of a different kind: it is a legitimate state
label, but no unlock transition exists in the pipeline. See
[`02-AUTHORITY-STATE-MACHINE.md`](./02-AUTHORITY-STATE-MACHINE.md).

## Contract counts

| Measure | Count |
|---|---|
| Elements inventoried | 145 |
| Interactive | 56 |
| Non-interactive (decorative, label, status, readonly data, media) | 89 |
| Navigation actions | 12 |
| State actions | 16 |
| Approval / authority actions | 8 |
| Generation actions | 2 |
| Modals specified | 4 |
| Drawers specified | 7 |
| Fullscreen experiences specified | 2 |
| Child pages confirmed | 0 |
| Grandchild pages confirmed | 0 |
| Founder decisions required | 9 |

Child page count is zero deliberately. Every inspection surface on this page
resolves to an inline, drawer, sheet or modal treatment, because the feature
manifest specifies those presentation modes and because a card is not a page.
See [`04-ROUTES-AND-PAGES.md`](./04-ROUTES-AND-PAGES.md) for the reasoning per
candidate route.
