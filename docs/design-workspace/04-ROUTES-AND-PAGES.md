# Deliverable 3 + 4 — Route Map and Page Hierarchy

## Deliverable 3 — `DesignWorkspaceRouteMap`

`sourceRoute` is `/projects/:projectSlug/design/twin-opus-direct` for every row.
Note the param is `:projectSlug`, and the reconstruction currently ignores it —
the header hardcodes `PROJECT: NDXBOOK`. Binding the page to its route param is
the first thing productionization must fix, because every destination below
depends on it.

### Destination classes used

`SAME_VIEW` · `SAME_ROUTE_STATE` · `MODAL` · `DRAWER` · `FULLSCREEN` ·
`CHILD_ROUTE` · `GRANDCHILD_ROUTE` · `EXTERNAL`

### Navigating interactions

| source | destination | type | exists | new route needed | params | return | preserved state |
|---|---|---|---|---|---|---|---|
| DW-HDR-001 `SITE 00` | `/` | `EXTERNAL` to the workspace | yes | no | — | browser back | authority session persists in localStorage |
| DW-HDR-003 `PROJECT: NDXBOOK` | `/projects/:projectSlug` | `CHILD_ROUTE` of the project root | yes | no | `projectSlug` | browser back | authority session persists |
| DW-NAV-002 `REFERENCES` | `/projects/site00/design?project=<slug>&tab=references` | `SAME_ROUTE_STATE` on the live workspace | yes | no | `project`, `tab` | tab switch | authority session persists; presentation state resets |
| DW-NAV-003 `ASSETS` | `…&tab=assets` | `SAME_ROUTE_STATE` | yes | no | same | tab switch | same |
| DW-NAV-004 `PAGES` | `…&tab=pages` | `SAME_ROUTE_STATE` | yes | no | same | tab switch | same |
| DW-NAV-005 `SKINS` | `…&tab=skins` | `SAME_ROUTE_STATE` | yes | no | same | tab switch | same |
| DW-NAV-006 `HISTORY` | `…&tab=history` | `SAME_ROUTE_STATE` | yes | no | same | tab switch | same |
| DW-NAV-007 `MORE` | `…&tab=more` | `SAME_ROUTE_STATE` | yes | no | same | tab switch | same |
| DW-REC-014 `SOURCE` | archive entity — unresolved | `CHILD_ROUTE` or `DRAWER` | no | unresolved | — | — | — |

Nine navigating interactions. Everything else on the page stays on this route.

### Non-navigating interactions that change what is shown

| source | destination | type | deep-linkable |
|---|---|---|---|
| DW-VIEW-002/003 | `?` none — sessionStorage | `SAME_ROUTE_STATE` | no, by design |
| DW-VP-002/003/004 | in-place | `SAME_VIEW` | no |
| DW-GAL-004 candidate card | in-place | `SAME_VIEW` | no |
| DW-GAL-002 `COMPARE CONCEPTS` | comparison overlay | `MODAL` (sheet on mobile) | recommended |
| DW-CAND-001 `REFINE` | refinement drawer | `DRAWER` | no |
| DW-CAND-002 `REGENERATE` | confirm then inline | `MODAL` then `SAME_VIEW` | no |
| DW-CAND-003 `INSPECT` | candidate inspector | `DRAWER` | recommended |
| DW-CAND-004 / DW-HERO-006 / DW-AUTH-008 / DW-AUTH-012 / DW-OUT-009 / DW-REC-007 | artifact inspection | `FULLSCREEN` | recommended |
| DW-HERO-012 / DW-HERO-013 / DW-OUT-011 (assets module) | asset manifest drawer | `DRAWER` | recommended |
| DW-OUT-011 (other modules) | module detail drawer | `DRAWER` | recommended |
| DW-AUTH-016 `PAIR REVIEW` | in-place disclosure | `SAME_VIEW` | no |
| DW-AUTH-014/015/018, DW-AUTH-013 | confirmation | `MODAL` | no |
| DW-PIPE-013 / DW-PIPE-017 / DW-PIPE-018 | readiness drawer | `DRAWER` | recommended |
| DW-PIPE-023 | technical details drawer | `DRAWER` | no |
| DW-REC-001..005 | in-place tab | `SAME_VIEW` | optional |
| DW-AMD-007 | amendment drawer | `DRAWER` | recommended |
| DW-DOCK-002/003/004 | dock drawers | `DRAWER` | recommended |
| DW-DOCK-001 | closes overlays | `SAME_VIEW` | — |
| DW-DOCK-005 / DW-PIPE-021 | resolves to one of the above | varies | — |

## Deliverable 4 — `DesignWorkspacePageHierarchy`

```
PARENT PAGE
  /projects/:projectSlug/design            the design workspace
    └─ tab state: references · assets · pages · skins · history · more

  (the reconstruction under /design/twin-opus-direct is a design-bench
   isolate of the same parent, not a page in its own right)

CHILD PAGES        none
GRANDCHILD PAGES   none

INLINE EXPERIENCES
  authority pair block          accordion
  pair review                   disclosure, shown when both masters promoted
  candidate gallery             horizontal rail
  structured output review      five module cards
  pipeline / readiness          panel
  concept record                tab panel

OVERLAY EXPERIENCES            see doc 05 — 4 modals, 7 drawers, 2 fullscreen
```

### Structured output child-page analysis

The sprint asks explicitly whether `/grounding`, `/blueprint`, `/overlay`,
`/assets`, `/function-map` deserve to exist. Assessed one at a time, against the
rule that a card is not a page.

| candidate route | verdict | reasoning |
|---|---|---|
| `/grounding` | `DRAWER_DETAIL` | `inspect_project_grounding` is described as "**Secondary** grounding/provenance inspection". Secondary inspection of the thing you are already reviewing is a drawer. It has no independent existence away from the candidate. |
| `/blueprint` | `DRAWER_DETAIL` | `inspect_blueprint` must be able to render "NOT YET GENERATED / AWAITING LOCK". A route whose most common state is an empty placeholder is a bad route. Note a global `/blueprints` route already exists for a different concept — adding a design-scoped `/blueprint` would collide conceptually. |
| `/overlay` | `DRAWER_DETAIL` | `inspect_overlay` is "Overlay inspection **when available**" — conditional existence, so it cannot be a stable destination. |
| `/assets` | `DRAWER_DETAIL` | `inspect_assets` is "Canonical asset manifest — not random gallery". The manifest is scoped to this entry's evidence pack, and `/projects/:projectSlug/product-assets` already owns project-level assets. A second assets route would compete with it. |
| `/function-map` | `DRAWER_DETAIL` | `inspect_function_mapping` is "Host/client ownership mapping — **recessed**". The manifest asks for less prominence; a dedicated route is more. |

All five are `DRAWER_DETAIL`. None becomes a route.

### Other page candidates assessed

| candidate | verdict | reasoning |
|---|---|---|
| Design history | `DRAWER_DETAIL` | `design_history` allows `INLINE`, `DOCK`, `SHEET`, `DRAWER`. The dock item is its entry point. No route exists. |
| Feature change history | `DRAWER_DETAIL` | same, and it is also reachable as record tab DW-REC-003. |
| Master amendment status | `DRAWER_DETAIL` | same, and also record tab DW-REC-004. |
| Technical details | `DRAWER_DETAIL` | `technical_details` is specified as "Recessed bottom sheet / drawer". The manifest names the treatment. |
| Compare concepts | `MODAL_DETAIL` | `compare_concepts` is "Side-by-side swipe or switcher comparison" — a focused two-up surface, transient by nature. |
| Candidate inspector | `DRAWER_DETAIL` | `inspect_candidate` is "Fullscreen or scaled inspection" — drawer is the scaled half, fullscreen is the other. |
| Fullscreen artifact | `FULLSCREEN` | the other half of the same feature. |
| Build | `FOUNDER_DECISION_REQUIRED` | BUILD is a real readiness scope, but whether entering it navigates anywhere is unresolved. FD-08. |
| `/compare` route | no | no route exists, and legacy `tab=compare` already maps to REFERENCES on the live workspace. |

### Why zero child pages is the right answer

The feature manifest gives every inspection feature the same
`allowablePresentationModes`: `INLINE`, `DOCK`, `SHEET`, `DRAWER`. Not `ROUTE`.
That is a deliberate architectural position — the design workspace keeps the
founder in one place while inspecting many things, because the workflow is
comparative. Every route added is a context the founder has to navigate back
from mid-decision.

Composer must not create routes for these surfaces. If child pages are wanted
later, they are a founder decision, not an implementation detail.
