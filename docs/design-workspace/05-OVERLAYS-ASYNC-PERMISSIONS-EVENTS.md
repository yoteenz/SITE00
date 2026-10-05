# Deliverable 8 to 12 — Overlays, Permissions, Async States, Cost Guards, Events

## Deliverable 8 — `OverlayInteractionMap`

Thirteen overlays: four modals, seven drawers, two fullscreen surfaces.

Existing components that already model these treatments and should be reused
rather than reinvented: `DesignDetailsDrawer`, `DesignVisualComparisonDrawer`,
`ReplaceDesignAuthorityDialog`, `DesignAuthorityHistoryDialog`,
`Site00ImageInspectLightbox`.

### Universal overlay rules

These apply to all thirteen and are not repeated per entry.

```
CLOSE           X control, Escape, scrim click (except confirmations), and
                browser back
BACK            browser back closes the topmost overlay and must not leave the
                workspace. On mobile this is the primary close gesture and is
                not optional.
FOCUS TRAPPING  focus moves into the overlay on open, is trapped while open, and
                returns to the trigger element on close
STACKING        one overlay at a time, except that a confirmation may open above
                an inspection overlay
STATE           overlays are Tier C: opening or closing one never mutates
                workspace data
SCROLL          body scroll locked while open
```

### Modals

| id | trigger | content | close | mobile | deep-link |
|---|---|---|---|---|---|
| `OV-CONFIRM-PROMOTE` | DW-AUTH-014 / 015 | which candidate becomes which viewport master, which master it supersedes, that promotion is forward-only | confirm or cancel only — no scrim dismiss | centred sheet | no |
| `OV-CONFIRM-REPLACE` | DW-AUTH-013 | which master is cleared, that lineage is preserved, that the pair is dissolved | confirm or cancel only | centred sheet | no |
| `OV-CONFIRM-LOCK` | DW-AUTH-018 | what becomes immutable, which actions are disabled afterwards, **that there is no unlock** | confirm or cancel only | centred sheet | no |
| `OV-COMPARE` | DW-GAL-002 | two candidates side by side with a switcher for the right slot | standard | full-height sheet, swipe between candidates | recommended |

`OV-CONFIRM-*` deliberately refuse scrim dismissal. An approval that can be
completed or dismissed by a stray tap is not an approval.

### Drawers

| id | trigger | content | deep-link |
|---|---|---|---|
| `OV-CANDIDATE-INSPECT` | DW-CAND-003 | candidate id, version, lineage parent, generation batch, territory, per-viewport authority state, grounding manifest id, image hash | recommended |
| `OV-MODULE-DETAIL` | DW-OUT-011 | one structured-output module's record; five instances distinguished by module id; renders the module's empty and blocked states honestly | recommended |
| `OV-ASSETS` | DW-HERO-012, DW-HERO-013, DW-OUT-011 (assets) | the canonical asset manifest for this entry's evidence pack — not a free gallery | recommended |
| `OV-READINESS` | DW-PIPE-013, and DW-PIPE-017 / 018 when count > 0 | every gate, result and detail from the receipt; opens filtered when entered from blockers or warnings | recommended |
| `OV-TECHNICAL` | DW-PIPE-023 | pair checksum, image hashes, manifest version, lineage ids, derivation status | no |
| `OV-HISTORY` | DW-DOCK-002 / 003 / 004, DW-AMD-007 | four datasets behind one drawer shell: authority pipeline events, feature change lineage, master amendment status, single amendment detail | recommended |
| `OV-REFINE` | DW-CAND-001 | bounded refinement input plus the cost confirmation | no |

`OV-HISTORY` is one shell with four datasets rather than four components,
because the record tabs DW-REC-003 / 004 / 005 show the same data inline. One
renderer, two entry points, no divergence.

### Fullscreen

| id | trigger | content | actions inside |
|---|---|---|---|
| `OV-ARTIFACT-FULLSCREEN` | DW-CAND-004, DW-HERO-006, DW-AUTH-008, DW-AUTH-012, DW-OUT-009, DW-REC-007 | the artifact at full viewport | inspection only — zoom and pan. **No authority actions.** |
| `OV-PAIR-FULLSCREEN` | inside pair review | both masters at full viewport for comparison | inspection only |

Excluding authority actions from fullscreen is a deliberate safety property:
promotion and locking require the surrounding workflow context, and a lightbox
removes it.

---

## Deliverable 9 — Permissions and approvals

### Roles that actually exist

`shared/site00-projects/projectViewMode.ts`:

```
FOUNDER · ADMIN · PROJECT_OWNER · CLIENT · COLLABORATOR · REVIEWER
```

`shared/site00-client-project-room/types.ts`:

```
CLIENT_OWNER · CLIENT_COLLABORATOR · CLIENT_VIEWER
```

Founder identity: `ADMIN_EMAILS` / `VITE_ADMIN_EMAILS` and
`FOUNDER_PRIVILEGED_ADMIN_EMAIL` in `src/utils/adminAuth.ts`.

**There is no `EDITOR` and no `VIEWER` role** in the project taxonomy. The
sprint's suggested list is not adopted verbatim; the real names are used.

### What is enforced today

**Nothing, on this workflow.** No design-workspace action checks a role. The
pipeline functions take `promotedBy = 'founder'` and `lockedBy = 'founder'` as
*defaults*, not as authorization — they record who acted, they do not verify it.
The design benches boot without CTRL ROOM sign-in at all.

Supabase RLS on SITE 00 tables is predominantly `service_role_all`, so there is
no row-level enforcement to inherit either.

### Required permissions

This is the contract's position, derived from the pipeline's own `promotedBy` /
`lockedBy` attribution and from the client-room precedent that generation is
admin-only. It is a proposal where the architecture is silent, and it is marked
as such.

| action | required | basis |
|---|---|---|
| View anything on the page | any authenticated project member | no gate exists today |
| DW-VIEW, DW-VP, DW-GAL-004, DW-REC tabs, all inspection | any authenticated project member | read and focus only |
| DW-AUTH-001 / 003 select for viewport | `FOUNDER` | pipeline attributes selection to the founder |
| DW-AUTH-013 replace | `FOUNDER` | destructive, supersedes an authority object |
| DW-AUTH-014 / 015 promote | `FOUNDER` | `promotedBy` defaults to `founder` |
| DW-AUTH-018 lock | `FOUNDER` | `lockedBy` defaults to `founder`; irreversible |
| DW-CAND-001 / 002 generate | `FOUNDER` | spends money; client room already restricts `CAN_GENERATE` / `CAN_REGENERATE` to admin |
| DW-PIPE-022 move to build | `FOUNDER` | gate description names "founder translation approval" |
| Amendment creation | unresolved | no amendment authoring UI exists |

**Unresolved:** whether `PROJECT_OWNER`, `ADMIN` or `REVIEWER` share any of the
founder-gated actions, and whether a non-founder sees these controls disabled or
absent. → FD-06 covers the permission model as a whole.

---

## Deliverable 10 — Loading, error and empty states

Every asynchronous or conditional surface.

| action / surface | `IDLE` | `LOADING` | `SUCCESS` | `ERROR` | other |
|---|---|---|---|---|---|
| DW-CAND-001 refine | button enabled | pending card in the gallery rail, action row disabled | new child candidate appears and becomes selected | inline message with the provider reason, no card created, prior selection retained | `DISABLED` when no selection, pair locked, or a generation is in flight · `PROVIDER_FAILURE` when `FAL_KEY` absent (503) or the provider returns 429 · `BLOCKED` when spend is unconfirmed |
| DW-CAND-002 regenerate | as above | as above | new sibling candidate | as above | as above |
| DW-AUTH-001 / 003 select | enabled | synchronous, no spinner | `SELECTED` renders | named pipeline error | `DISABLED` while `PAIR_LOCKED` |
| DW-AUTH-014 / 015 promote | enabled when a selection exists | confirm modal busy state | master slot fills, pair advances | named precondition error with plain text | `DISABLED` with reason when no selection or locked |
| DW-AUTH-013 replace | enabled when a master exists | confirm busy state | slot empties | named error | `DISABLED` while locked |
| DW-AUTH-018 lock | enabled only when the gate passes | confirm busy state | `PAIR_LOCKED` | `gate.errors[0]` surfaced with its reason | `BLOCKED` showing the specific failing gate, never a bare disabled control |
| DW-PIPE readiness compile | last receipt shown | checks skeleton, stale value dimmed not hidden | receipt renders | `UNKNOWN` per the manifest's allowed vocabulary | `STALE` when the manifest moved under the receipt |
| DW-PIPE-022 move to build | — | — | build phase entered | gate reason | `BLOCKED` in every currently reachable state (`buildPass` is hardcoded false) |
| Asset fetch / `OV-ASSETS` | — | item skeletons | manifest renders | retry affordance | `EMPTY` — "no evidence attached", which is a legitimate state |
| Structured output modules | — | tile skeleton | preview renders | source line shows the failure | `EMPTY` = `NOT YET GENERATED` · `BLOCKED` = `AWAITING LOCK`, both named by `inspect_blueprint` |
| Candidate gallery | — | card skeletons | cards render | retry | `EMPTY` — "no candidates generated yet", with generation as the next action |
| History drawers | — | row skeletons | events render | retry | `EMPTY` — "no history yet" |
| Any action | — | — | — | — | `OFFLINE` — authority state is local-first, so reads keep working and mutations queue or refuse explicitly rather than failing silently |

**Rule.** No fabricated value may ever appear in place of a missing one. The
manifest's phrasing — "READY MISSING BLOCKED UNKNOWN STALE — no fake metrics" —
applies to every status surface on the page, not only to compiler readiness.

---

## Deliverable 11 — Cost and provider guards

Two elements on this page spend money: DW-CAND-001 and DW-CAND-002.

### What exists

The server already enforces a guard. FAL-backed endpoints require
`founderConfirmedSpend` on the request, and `runMobileTwinFalPipeline` throws
`SPEND_GUARD` when it is missing. Endpoints include
`api/site00/twin-v3-design-page-authority.ts`,
`api/site00/twin-v2-visual-concept.ts`,
`api/site00/twin-v2-atomic-concept-generation.ts`. Missing `FAL_KEY` yields 503.
`MobileProviderCostRecord` and `totalProviderCostUsd` provide cost accounting.

### The gap

Client code today frequently sets `founderConfirmedSpend: true` automatically.
The flag is satisfied without the founder ever confirming anything, which makes
the guard a formality.

### Contract

```
1. Generation actions MUST send founderConfirmedSpend, and the value MUST come
   from an explicit founder confirmation in the UI. Composer must not hardcode
   true. This is the single most important guard in the contract, because
   DW-CAND-001 and DW-CAND-002 sit next to each other in a four-button row and
   are one mis-tap apart.

2. REFINE confirms inside OV-REFINE, alongside the bounded instruction input —
   the founder is already deliberating there, so it costs no extra step.

3. REGENERATE confirms in a modal, because it has no input surface of its own
   and would otherwise be a single unguarded tap that spends money.

4. Concurrency: at most one generation in flight per workspace. Both actions
   disable while generationState is LOADING. This is what prevents the unbounded
   generation loop the sprint warns about.

5. Provider failure is a first-class state, not a toast that disappears.
   Missing key (503), rate limit (429) and provider error each render a distinct
   message, and none of them creates a candidate.

6. Cost accounting uses the existing MobileProviderCostRecord shape. No new
   accounting model.
```

**Unresolved:** whether a per-session or per-project spend ceiling should
additionally block generation. No budget cap exists in the architecture. → FD-07's
neighbour, recorded under FD-06's permission umbrella; a cap is a founder policy,
not an implementation default.

---

## Deliverable 12 — History and audit events

### Events that exist — use these names exactly

`AuthorityPipelineEventType` in `designWorkspaceAuthorityTypes.ts`:

```
VIEWPORT_SELECTED · VIEWPORT_UNSELECTED · VIEWPORT_MASTER_PROMOTED
VIEWPORT_MASTER_SUPERSEDED · PAIR_LOCKED · PAIR_SUPERSEDED
DERIVATION_MARKED_STALE · FOUNDER_AUTHORITY_INJECTION
```

Stored on `DesignWorkspaceAuthorityPipelineState.events`. In-session; no audit
table exists.

### Mapping the sprint's proposed taxonomy onto reality

| sprint's name | real name | note |
|---|---|---|
| `candidate_selected` | — | **not an event.** Gallery focus is not auditable. Committing a candidate to a viewport is `VIEWPORT_SELECTED`. |
| `mobile_promoted` | `VIEWPORT_MASTER_PROMOTED` | one event with a viewport field, not two events |
| `desktop_promoted` | `VIEWPORT_MASTER_PROMOTED` | same |
| `authority_review_started` | — | **does not exist.** Pair review is a disclosure. Not invented here. |
| `authority_pair_locked` | `PAIR_LOCKED` | |
| `candidate_refined` | — | no event type exists in the authority union |
| `candidate_regenerated` | — | same |
| `amendment_created` | — | no event type; amendments carry lifecycle status instead |
| `move_to_build` | — | a feature id, not an event type |

### Contract

Authority actions emit the existing union and nothing else. Generation and build
actions have no event type today; rather than inventing entries in a typed union
that the pipeline validates, they are recorded as needing new members, which is a
schema change and therefore a founder decision. → FD-08.

What DW-DOCK-002 `DESIGN HISTORY` renders is precisely
`pipeline.events` — "concepts selections promotions locks lineage" in the feature
description matches that union member for member. That is the drawer's dataset,
already available, no new plumbing required.

`feature_change_history` renders `WorkspaceFeatureChangeSet` records with status
`DRAFT | APPROVED | APPLIED | SUPERSEDED`. A different dataset, a different
drawer, per doc 01.
