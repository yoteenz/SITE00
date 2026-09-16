# Deliverable 16 + 17 — Inherited Patterns and Unresolved Founder Decisions

## Deliverable 16 — `InheritedInteractionPatterns`

Composer will derive further design-workspace pages from this approved parent.
These nine patterns become the workspace grammar. A child page reuses the
pattern; it does not redesign it.

### 1. `WorkspaceViewControl`

```
SEMANTIC CONTRACT   a presentation-only mode switch over one shared state model.
                    Switching never mutates workspace data and never resets
                    focus state.
VISUAL INHERITANCE  slim dedicated row directly below the project context bar,
                    above workspace content. Real-pixel sizing so it stays
                    legible under artboard scaling. Black fill with lime text
                    for the active cell.
BEHAVIOR INHERITANCE  radiogroup semantics, arrow-key switching, sessionStorage
                    persistence per page.
CHILD MAY OVERRIDE  the mode names and how many modes.
CHILD MAY NOT       move it into the header, make it route-based, give each mode
                    its own state store, or persist it in localStorage.
```

### 2. `SelectableCandidateCard`

```
SEMANTIC CONTRACT   the whole card selects; selection is workspace focus, not
                    commitment. One gesture, one meaning. Committing to a slot
                    is always a separate, labelled control.
VISUAL INHERITANCE  square geometry, version tag, selected tick, lime accent on
                    the selected card.
BEHAVIOR INHERITANCE  aria-pressed, Enter and Space, swipe rail on touch.
CHILD MAY OVERRIDE  card contents and rail direction.
CHILD MAY NOT       add a double-tap behaviour, add a nested select control, or
                    make selection commit anything.
```

### 3. `ViewportPartitionedAuthority`

```
SEMANTIC CONTRACT   a viewport selector chooses the slot the workspace operates
                    on. Every select, promote and replace carries that viewport.
                    Slots are independent; the same candidate can hold both.
VISUAL INHERITANCE  viewport control in the band above content; slot rows
                    labelled MOBILE / DESKTOP MASTER.
BEHAVIOR INHERITANCE  selection reversible, promotion forward-only, replace
                    immediate with lineage preserved.
CHILD MAY OVERRIDE  which viewports exist, subject to FD-05.
CHILD MAY NOT       merge the slots, or make the viewport control a preview
                    resizer.
```

### 4. `ApprovalControl`

```
SEMANTIC CONTRACT   an action that advances the authority workflow. Always
                    confirmed, always audited, always named in full. Never
                    triggered implicitly by another action — no silent auto-lock.
VISUAL INHERITANCE  full-width or rail-mounted, full text label, lime for the
                    primary and ink for the terminal action.
BEHAVIOR INHERITANCE  disabled state names its blocking gate rather than showing
                    a bare greyed control. Confirmation focuses cancel first.
                    Irreversible actions say so in the confirmation.
CHILD MAY OVERRIDE  the label and the specific gate.
CHILD MAY NOT       drop the confirmation, hide the blocking reason, or place an
                    approval inside a fullscreen inspection surface.
```

### 5. `ReadinessBlock`

```
SEMANTIC CONTRACT   renders a gate receipt. Allowed vocabulary is READY,
                    MISSING, BLOCKED, UNKNOWN, STALE. No fake metrics — a value
                    with no computation behind it is not displayed.
VISUAL INHERITANCE  readiness figure, check list, status counts, VIEW DETAILS.
BEHAVIOR INHERITANCE  counts above zero open the detail drawer filtered; zero is
                    not interactive. Stale values dim rather than disappear.
CHILD MAY OVERRIDE  which gates appear.
CHILD MAY NOT       invent a percentage, or render a placeholder that looks like
                    real data.
```

### 6. `InspectionAction`

```
SEMANTIC CONTRACT   two consistent affordances throughout the workspace.
                    Image means look closer, and opens fullscreen.
                    Document icon means read the record, and opens a drawer.
VISUAL INHERITANCE  small document glyph in the module footer; the media surface
                    itself is the fullscreen trigger.
BEHAVIOR INHERITANCE  focus returns to the trigger; back closes; no workflow
                    actions inside fullscreen.
CHILD MAY OVERRIDE  drawer contents.
CHILD MAY NOT       swap the two meanings, or add a third inspection gesture.
```

### 7. `FullscreenMedia`

```
SEMANTIC CONTRACT   inspection only. Zoom and pan. No state mutation of any kind.
VISUAL INHERITANCE  true full viewport, minimal chrome.
BEHAVIOR INHERITANCE  Escape and browser back close it; focus trapped; focus
                    returns to the trigger.
CHILD MAY OVERRIDE  zoom limits and whether adjacent artifacts can be paged.
CHILD MAY NOT       host approval, generation or destructive actions.
```

### 8. `RecordTabStrip`

```
SEMANTIC CONTRACT   tabs swap a panel in place. They are not routes and not
                    deep-linked by default. Content is lazy on first activation.
VISUAL INHERITANCE  compact strip with an active underline.
BEHAVIOR INHERITANCE  tablist / tab / tabpanel roles, arrow keys, Home and End,
                    horizontally scrollable on mobile without truncation.
CHILD MAY OVERRIDE  the tab set.
CHILD MAY NOT       turn tabs into routes, or reset workspace state on switch.
```

### 9. `ContextualNextAction`

```
SEMANTIC CONTRACT   exactly one primary call to action, derived from workflow
                    state by a single shared resolver. Never hardcoded copy.
VISUAL INHERITANCE  NEXT ACTION block plus the matching dock item.
BEHAVIOR INHERITANCE  every surface showing the next action reads the same
                    resolver, so they cannot disagree. The action inherits the
                    class of whatever it resolves to.
CHILD MAY OVERRIDE  the derivation table for its own workflow.
CHILD MAY NOT       hardcode the label, or show two competing primaries.
```

---

## Deliverable 17 — `FOUNDER_DECISIONS_REQUIRED`

Nine decisions. Each one is genuinely unresolved after inspecting the repository
— none is here to avoid doing the work, and everything resolvable was resolved.

### FD-01 — Header overflow menu contents

```
DECISION            what DW-HDR-008 (⋮) contains
WHY UNRESOLVED      no overflow menu exists anywhere in the design workspace to
                    inherit from. Its contents are pure invention otherwise.
OPTION A            workspace utilities: export, share, print, keyboard help
OPTION B            project switching and project settings
OPTION C            remove it — the dock and nav already cover navigation
IMPACT              A and B need a menu component and per-item contracts; C
                    removes an element from the golden, which is a visual change
                    and would need its own sprint
```

### FD-02 — Hamburger versus the visible nav

```
DECISION            what DW-NAV-001 opens, given a complete visible nav beside it
WHY UNRESOLVED      no drawer navigation exists in the design workspace; the
                    live workspace navigates with query tabs only
OPTION A            a wider workspace menu: other project modules beyond DESIGN
OPTION B            the same six tabs, as a mobile overflow when the strip
                    cannot fit — makes it a duplicate by design
OPTION C            remove it
IMPACT              A needs a module list and a drawer; B is redundant on this
                    layout because the strip already scrolls; C is a visual change
```

### FD-03 — Is PROJECT CREATIVE CONTEXT a destination

```
DECISION            whether DW-CTX-003 opens anything
WHY UNRESOLVED      getProjectCreativeContextVersion and the
                    DESIGN_AUTHORITY_CONTEXT_STALE gate prove the concept is
                    real, but no creative-context route or panel exists.
                    /projects/:projectSlug/creative-direction is a different
                    surface with a different name.
OPTION A            status only — the dot shows freshness, nothing opens
OPTION B            opens a drawer showing the pinned context version and what
                    changed when it goes stale
OPTION C            links to /projects/:projectSlug/creative-direction
IMPACT              B is the most useful, because CONTEXT_STALE can block the
                    lock and the founder needs to see why. C risks conflating
                    two different concepts.
```

### FD-04 — Is TARGET navigable

```
DECISION            whether DW-TGT-002/003/004 are readonly context or a way to
                    change the active target
WHY UNRESOLVED      active_design_target says "clear active artifact/page/stage
                    context" — context, not navigation. But nothing says how the
                    founder switches to a different entry.
OPTION A            readonly, as contracted. Target switching happens elsewhere.
OPTION B            the block becomes a selector: tapping it opens an entry
                    picker
OPTION C            each line links to its own object, requiring entry and
                    page-role routes that do not exist
IMPACT              A is the current contract and needs no work. B is a small
                    drawer. C invents two route families and is not recommended.
```

### FD-05 — TABLET has no authority slot

```
DECISION            what DW-VP-003 does
WHY UNRESOLVED      DesignWorkspaceViewport is 'MOBILE' | 'DESKTOP'. The
                    authority pair has exactly two slots. Yet the feature
                    manifest says "MOBILE TABLET DESKTOP workspace controls" and
                    the golden shows three.
OPTION A            TABLET is preview-only: it changes how the artifact is
                    displayed but has no slot, no selection and no promotion.
                    The authority controls disable while it is active.
OPTION B            add a third authority slot, making it a triple rather than a
                    pair. This changes the pair checksum, the readiness gate,
                    the lock and every label containing the word PAIR.
OPTION C            remove TABLET from the control
IMPACT              A is cheap but creates a viewport where half the page is
                    inert, which needs a clear empty state. B is a substantial
                    change to a locked, shipped model. C is a visual change.
                    This is the highest-impact unresolved decision on the page.
```

### FD-06 — REVIEW AUTHORITY, and the permission model behind it

```
DECISION            what DW-AUTH-017 does, and who may perform authority actions
WHY UNRESOLVED      one feature (review_authority_pair) claims both strings in
                    featurePromptMarkers; there is no handler, route or panel
                    named REVIEW AUTHORITY; and no design-workspace action
                    checks a role today.
OPTION A            remove DW-AUTH-017 as a duplicate of PAIR REVIEW
OPTION B            make it a distinct step: PAIR REVIEW compares the two
                    masters visually, REVIEW AUTHORITY audits provenance —
                    hashes, context version, manifest version, coverage — before
                    locking. This is a real gap: the lock gate checks exactly
                    those things, and the founder currently has no surface that
                    shows them before committing.
OPTION C            leave both, rendering the same surface
IMPACT              B is the most defensible and would reuse the OV-TECHNICAL
                    content at approval time. C ships a duplicate control.
                    Whichever is chosen, the permission question needs an answer:
                    are these founder-only, and do non-founders see the controls
                    disabled or absent?
```

### FD-07 — The readiness percentage and the status counts

```
DECISION            what 82%, APPROVED ELEMENTS and PENDING DECISIONS mean
WHY UNRESOLVED      compiler_readiness explicitly forbids fake metrics, and no
                    computation produces any of these three values. BLOCKERS and
                    WARNINGS are fine — they come from the receipt.
OPTION A            replace the ring with the receipt's own vocabulary: READY,
                    MISSING, BLOCKED, UNKNOWN, STALE. Most faithful to the
                    manifest, but changes the golden's most distinctive element.
OPTION B            define readiness as passed gates over applicable gates. A
                    real computation, easy to explain, and it keeps the ring.
                    Approved elements then means passed gates, and pending
                    decisions means gates awaiting founder action.
OPTION C            reuse weightedCoveragePercent from
                    buildWeightedAuthorityCoverageReceipt. Real and already
                    weighted, but it measures visual coverage, not pipeline
                    readiness, so the label would mislead.
IMPACT              B preserves the design and satisfies the no-fake-metrics
                    rule. It needs the gate set agreed first, since the golden's
                    five check labels do not match the real gate names.
```

### FD-08 — What MOVE TO BUILD does on success, and its event

```
DECISION            what happens after the build gates pass, and what is recorded
WHY UNRESOLVED      BUILD is a real readiness scope and move_to_build is a real
                    feature, but buildPass is hardcoded false, no build
                    destination exists, and AuthorityPipelineEventType has no
                    member for it or for generation actions.
OPTION A            state only: ImplementationPackageStatus advances to
                    APPROVED_FOR_BUILD and the founder stays on the page
OPTION B            navigates to a build surface that does not yet exist
OPTION C            hands off to Composer — contradicted by
                    founderApprovalTriggersComposerAutomatically() returning
                    false, so it would be a policy change
IMPACT              A is implementable now and matches the architecture. Any
                    option needs new members in the event union for
                    move_to_build, candidate_refined and candidate_regenerated,
                    which is a typed schema change.
```

### FD-09 — Where SOURCE resolves

```
DECISION            what DW-REC-014 (ENTRY001-CAMPAIGN-ARCHIVE) links to
WHY UNRESOLVED      it is the only field in the record that names an entity
                    rather than a value, but no campaign-archive route or drawer
                    exists
OPTION A            readonly, like the other five fields
OPTION B            opens a provenance drawer showing the source archive and the
                    grounding manifest derived from it
OPTION C            links to a campaign archive page that would need creating
IMPACT              B fits the grounding model already in the pipeline and needs
                    no new route. C adds a route family for one link.
```

---

## What is not on this list

Everything below looked unresolved at the start of the sprint and was resolved
from the architecture. Recording them here so the same questions are not
reopened later.

| question | resolved by |
|---|---|
| Does COMPARE CONCEPTS open a mode, a modal or a page? | `compare_concepts`: "Side-by-side swipe or switcher comparison" — a comparison overlay |
| Does PROMOTE mean candidate→master or master→pair? | `promoteViewportMaster`: candidate→master. The pair forms automatically from two masters. |
| Is SELECT FOR MOBILE a promotion? | `select_mobile_master_candidate`: "reversible, **not promotion**" |
| Is REPLACE staged or immediate? | `beginViewportMasterReplacement` clears the slot immediately; no pending state exists |
| Is PAIR REVIEW a page? | live product renders it inline when both masters are promoted |
| Can the pair be unlocked? | no unlock function exists; the only path forward is superseding |
| Do the structured output modules deserve routes? | no — all five features allow only `INLINE`, `DOCK`, `SHEET`, `DRAWER` |
| Is VIEW TECHNICAL DETAILS a page? | `technical_details`: "Recessed bottom sheet / drawer" |
| Is CONTEXTUAL NEXT ACTION a static page? | `contextual_next_action`: "One primary CTA from state" — a derivation |
| Do the dock items route? | no routes exist for any of them; they are drawers |
| Does the whole candidate card select? | yes, and there is no double action — inspection has its own controls |
| Is the status-strip lock icon a control? | no — `lock_authority_pair` forbids silent auto-lock, and the explicit control exists |
| Are REFINE and REGENERATE the same? | refine is bounded and descends from the parent; regenerate produces a sibling |
| Do generation actions need a cost guard? | yes — the server already throws `SPEND_GUARD` without `founderConfirmedSpend` |
