# Deliverable 1 + 2 — Master Element Inventory and Classification Taxonomy

`DesignWorkspaceInteractionInventory`

Every meaningful visible element of `/projects/:projectSlug/design/twin-opus-direct`
carries a `DW-[SECTION]-[NUMBER]` id. Ids are stable and must not be renumbered;
new elements append.

## Deliverable 2 — classification taxonomy

Every element is exactly one of these. No element is left as "interactive thing"
or "card-like".

| Class | Meaning |
|---|---|
| `DECORATIVE` | Carries no information and no action. Rules, dots, glyphs, textures. |
| `LABEL` | Static naming text for an adjacent value or region. |
| `STATUS` | Renders a system-derived value the user cannot edit here. |
| `READONLY_DATA` | Renders a record field. Same as STATUS but sourced from an entity, not a computation. |
| `MEDIA` | An image or rendered artifact surface. |
| `THUMBNAIL` | A small image standing in for a larger artifact. |
| `PROGRESS` | A quantitative completion indicator. |
| `NAVIGATION` | Moves the user to another route or workspace section. |
| `LINK` | Navigates to a specific entity or external target. |
| `TAB` | Switches the content of a panel in place. |
| `SELECTOR` | Picks one of a small fixed set, changing what the workspace shows. |
| `TOGGLE` | Two-state switch. |
| `WORKSPACE_MODE` | Changes how the whole workspace is presented without changing what it is. |
| `BUTTON` | Generic action with no state or approval semantics. |
| `CARD` | Grouping surface, not itself selectable. |
| `SELECTABLE_CARD` | Grouping surface whose activation selects the entity it represents. |
| `ACCORDION` | Expands and collapses a titled region in place. |
| `DISCLOSURE` | Reveals additional detail in place, without a titled region. |
| `MODAL_TRIGGER` | Opens a focus-trapping centred overlay. |
| `DRAWER_TRIGGER` | Opens an edge-anchored overlay. |
| `FULLSCREEN_TRIGGER` | Opens a full-viewport inspection surface. |
| `STATE_ACTION` | Mutates workspace state. Reversible, no approval semantics. |
| `APPROVAL_ACTION` | Advances the authority workflow. Founder-gated, audited. |
| `DESTRUCTIVE_ACTION` | Supersedes or clears an authority object. |
| `SYSTEM_ACTION` | Invokes a provider or compiler. Has cost or duration. |
| `CONTEXT_MENU` | Opens an overflow list of secondary actions. |
| `INPUT` | Accepts typed or chosen user data. |

## Field dictionary and default rule

The full field set required by the sprint is recorded for every element. To keep
it readable, the per-section tables carry the fields that vary, and this default
rule supplies the rest.

**Default rule.** For any element classed `DECORATIVE`, `LABEL`, `STATUS`,
`READONLY_DATA`, `MEDIA` or `PROGRESS` and marked `interactive: NO`, all of the
following hold unless the table says otherwise:

```
interactionType        NONE
primaryAction          NONE
secondaryAction        NONE
destinationRoute       NONE
opensChildPage         NO      opensGrandchildPage  NO
opensModal             NO      opensDrawer          NO
opensFullscreen        NO      expandsInline        NO
writesState            NONE
persistent             N/A
permissions            ANY_VIEWER
disabledConditions     N/A
loadingState           inherits panel skeleton
successState           N/A     errorState           renders EM DASH placeholder
canonicalBehavior      identical    listBehavior     identical
mobile/tablet/desktop  identical semantics, presentation may differ
accessibilityRole      none (text) / img with alt (media)
keyboardBehavior       not focusable
analyticsEvent         NONE
```

`currentRoute` is `/projects/:projectSlug/design/twin-opus-direct` for every
element and is not repeated per row.

**Implementation status values.** `WIRED` (works today), `RENDER_ONLY` (element
exists, handler absent), `CONTRACT_ONLY` (behaviour specified here, nothing built).

**Source of truth values.** `FEATURE_MANIFEST`, `PIPELINE`, `ROUTES`,
`LIVE_WORKSPACE`, `CURRENT_IMPL`, `VISUAL_ONLY`.

---

## Section 01 — SITE 00 host header · `DW-HDR`

Feature: `design_workspace_context` — "SITE 00 host, active project, DESIGN page,
workflow legible".

The header is a breadcrumb plus a system status cluster. The route audit is
decisive here: `/projects/:projectSlug` and `/projects/:projectSlug/design` both
exist, so the first two crumbs have real destinations and the third is the
current page.

| id | label | class | interactive | destination | reads | writes | impl | source |
|---|---|---|---|---|---|---|---|---|
| DW-HDR-001 | `SITE 00` | `NAVIGATION` | YES | `/` (SITE 00 root) | — | — | RENDER_ONLY | ROUTES |
| DW-HDR-002 | `>` separator | `DECORATIVE` | NO | — | — | — | RENDER_ONLY | VISUAL_ONLY |
| DW-HDR-003 | `PROJECT: NDXBOOK` | `NAVIGATION` | YES | `/projects/:projectSlug` | `currentProject` | — | RENDER_ONLY | ROUTES |
| DW-HDR-004 | `>` separator | `DECORATIVE` | NO | — | — | — | RENDER_ONLY | VISUAL_ONLY |
| DW-HDR-005 | `DESIGN` | `LABEL` | NO | current page, not a link | — | — | RENDER_ONLY | ROUTES |
| DW-HDR-006 | `COMPILER: READY` | `STATUS` | NO | — | `compilerReadiness.status` | — | RENDER_ONLY | FEATURE_MANIFEST |
| DW-HDR-007 | compiler dot | `STATUS` | NO | — | `compilerReadiness.status` | — | RENDER_ONLY | FEATURE_MANIFEST |
| DW-HDR-008 | overflow `⋮` | `CONTEXT_MENU` | YES | opens menu | — | `headerMenuOpen` | RENDER_ONLY | VISUAL_ONLY |

**DW-HDR-005 is not a link.** It names the route the user is already on. Giving
it a destination would be a self-navigation.

**DW-HDR-006 / 007 are status only and must not display a fabricated value.**
The feature manifest specifies `compiler_readiness` as "READY MISSING BLOCKED
UNKNOWN STALE — no fake metrics". The five allowed renderings are exactly those
words, derived from `CompilerReadinessReceipt.overall`. The mock currently
hardcodes `READY`.

**DW-HDR-008 contents are unresolved.** No overflow menu exists anywhere in the
design workspace to copy from. → `FOUNDER_DECISION_REQUIRED` FD-01.

---

## Section 02 — Primary design navigation · `DW-NAV`

Feature: `design_workspace_navigation` — "REFERENCES ASSETS PAGES SKINS HISTORY
MORE — SKINS dedicated".

This is the most important route finding in the contract. These five labels are
**not path routes**. The live design workspace implements them as query tabs on
a single route, and `/projects/:projectSlug/design` redirects into it.

```
/projects/site00/design?project=ndxbook&tab=references|assets|pages|skins|history|more
```

Each tab has a real panel component today: `DesignReferencesTab`,
`DesignAssetsWizard`, the pages wizard / `PageFamilyWorkspace`,
`DesignSkinsWizard`, `DesignHistoryTab`.

Composer must therefore treat these as **route-level tab navigation that replaces
the workspace body**, not as in-page tabs and not as new child routes.

| id | label | class | interactive | destination | reads | writes | impl | source |
|---|---|---|---|---|---|---|---|---|
| DW-NAV-001 | hamburger | `DRAWER_TRIGGER` | YES | workspace menu drawer | — | `navDrawerOpen` | RENDER_ONLY | VISUAL_ONLY |
| DW-NAV-002 | `REFERENCES` | `NAVIGATION` | YES | `?tab=references` | `navSelection` | `navSelection` | WIRED (state only) | LIVE_WORKSPACE |
| DW-NAV-003 | `ASSETS` | `NAVIGATION` | YES | `?tab=assets` | `navSelection` | `navSelection` | WIRED (state only) | LIVE_WORKSPACE |
| DW-NAV-004 | `PAGES` | `NAVIGATION` | YES | `?tab=pages` | `navSelection` | `navSelection` | WIRED (state only) | LIVE_WORKSPACE |
| DW-NAV-005 | `SKINS` | `NAVIGATION` | YES | `?tab=skins` | `navSelection` | `navSelection` | WIRED (state only) | LIVE_WORKSPACE |
| DW-NAV-006 | `HISTORY` | `NAVIGATION` | YES | `?tab=history` | `navSelection` | `navSelection` | WIRED (state only) | LIVE_WORKSPACE |
| DW-NAV-007 | `MORE` | `NAVIGATION` | YES | `?tab=more` | `navSelection` | `navSelection` | RENDER_ONLY | LIVE_WORKSPACE |
| DW-NAV-008 | MORE caret | `DECORATIVE` | NO | — | — | — | RENDER_ONLY | VISUAL_ONLY |

`DESIGN_WORKSPACE_PRIMARY_TABS` in `p0vr6/designWorkspaceUxTypes.ts` includes
`MORE` as a sixth peer tab, so DW-NAV-007 navigates like the others rather than
opening a menu. The caret is decoration inherited from the golden.

**Active state.** `aria-current="page"` on the active cell, which the current
implementation already does. Nav selection does **not** persist: arriving fresh
at the workspace lands on the default tab.

**State across destinations.** Authority pipeline state lives on the session in
`localStorage` under `site00:design-page-v3-authority:v1`, so it survives moving
between tabs. Presentation state (`viewMode`, `recordTabIndex`, `dockIndex`) is
page-local and resets.

**DW-NAV-001 is unresolved.** A hamburger next to a complete visible nav is
either a duplicate or a wider workspace menu. → `FOUNDER_DECISION_REQUIRED` FD-02.

---

## Section 03 — NDXBOOK project context bar · `DW-CTX`

No route named creative context exists. `/projects/:projectSlug/creative-direction`
exists but is a different surface with a different name, and the sprint forbids
inferring a destination from styling.

| id | label | class | interactive | destination | reads | writes | impl | source |
|---|---|---|---|---|---|---|---|---|
| DW-CTX-001 | `NDXBOOK` chip | `STATUS` | NO | — | `currentProject.slug` | — | RENDER_ONLY | CURRENT_IMPL |
| DW-CTX-002 | `CULTURAL_INTELLIGENCE_EDITORIAL` | `STATUS` | NO | — | project creative stream | — | RENDER_ONLY | CURRENT_IMPL |
| DW-CTX-003 | `PROJECT CREATIVE CONTEXT` | `STATUS` | NO by default | — | `projectCreativeContextVersion` | — | RENDER_ONLY | PIPELINE |
| DW-CTX-004 | context dot | `STATUS` | NO | — | context freshness | — | RENDER_ONLY | PIPELINE |

**DW-CTX-003 has real backing but no destination.** `getProjectCreativeContextVersion(session)`
exists in the pipeline, and `DESIGN_AUTHORITY_CONTEXT_STALE` is a real readiness
gate error, so the dot is meaningfully a freshness indicator: green when the
locked context version matches the session, warning when stale. Whether the label
also opens the context is not established. → `FOUNDER_DECISION_REQUIRED` FD-03.

---

## Section 04 — View mode · `DW-VIEW`

Feature: none in the manifest. This control was added by
`P0.VR.DESIGNBENCH.OPUS-VIEWMODE1` and is fully specified by that sprint plus
`OPUS-VIEWMODE1R1`. It is the one part of the page that is already correct and
complete.

| id | label | class | interactive | reads | writes | persistent | impl | source |
|---|---|---|---|---|---|---|---|---|
| DW-VIEW-001 | `VIEW` | `LABEL` | NO | — | — | — | WIRED | CURRENT_IMPL |
| DW-VIEW-002 | `CANONICAL` | `WORKSPACE_MODE` | YES | `viewMode` | `viewMode` | sessionStorage | WIRED | CURRENT_IMPL |
| DW-VIEW-003 | `LIST` | `WORKSPACE_MODE` | YES | `viewMode` | `viewMode` | sessionStorage | WIRED | CURRENT_IMPL |
| DW-VIEW-004 | view row | `DECORATIVE` | NO | — | — | — | WIRED | CURRENT_IMPL |

**Contract.** `workspace.viewMode: 'canonical' | 'list'`, default `canonical`,
same route, same state, same actions, presentation only. Switching must never
reset candidate, authority, readiness, history tab, nav or dock state. CANONICAL
renders the Opus reconstruction; LIST renders the Spark digest refined by Opus.
Persistence is `sessionStorage` under `site00:twin-opus-direct:view-mode:v1` —
deliberately not `localStorage`, because it is a presentation preference and not
workspace data.

Accessibility: `radiogroup` labelled by DW-VIEW-001, two `radio` children with
`aria-checked`, roving `tabIndex`, arrow keys in both axes, visible focus ring.

---

## Section 05 — Target · `DW-TGT`

Feature: `active_design_target` — "Clear active artifact/page/stage context".

The description says *context*, not *navigation*. The three lines are a
descending identity for one artifact: entry, artifact type, page role. They
correspond to real record fields — `ARTIFACT TYPE: ENTRY COVER` appears verbatim
in DW-REC-013.

| id | label | class | interactive | reads | impl | source |
|---|---|---|---|---|---|---|
| DW-TGT-001 | `TARGET` | `LABEL` | NO | — | RENDER_ONLY | FEATURE_MANIFEST |
| DW-TGT-002 | `ENTRY 001` | `READONLY_DATA` | NO | `currentEntry.id` | RENDER_ONLY | FEATURE_MANIFEST |
| DW-TGT-003 | `ENTRY COVER` | `READONLY_DATA` | NO | `currentEntry.artifactType` | RENDER_ONLY | FEATURE_MANIFEST |
| DW-TGT-004 | `HOMEPAGE HERO` | `READONLY_DATA` | NO | `currentEntry.pageRole` | RENDER_ONLY | FEATURE_MANIFEST |

**Contract: readonly context, not a navigable hierarchy.** Making these links
would require entry and page-role routes that do not exist. If the founder later
wants target switching, that is a selector in this block, not links on the lines
— recorded as FD-04 so the decision is visible rather than silently closed.

---

## Section 06 — Viewport selector · `DW-VP`

Feature: `viewport_control` — "MOBILE TABLET DESKTOP workspace controls".

This is the element the sprint asks to define most explicitly, and the pipeline
answers it precisely. **The viewport selector chooses which authority slot the
workspace is operating on.** It is not a responsive preview toggle.

The evidence is that the pipeline is viewport-partitioned all the way down:
`viewportSelection: { mobile, desktop }`, `mobileMaster` / `desktopMaster`,
`candidateViewportStates[candidateId] = { mobile, desktop }`, and separate
`promote_mobile_viewport_master` / `promote_desktop_viewport_master` features.
Every selection and promotion takes a viewport argument. Something must supply
that argument, and this is the only viewport control on the page.

| id | label | class | interactive | reads | writes | impl | source |
|---|---|---|---|---|---|---|---|
| DW-VP-001 | `VIEWPORT` | `LABEL` | NO | — | — | RENDER_ONLY | FEATURE_MANIFEST |
| DW-VP-002 | `MOBILE` | `SELECTOR` | YES | `viewport` | `viewport` | WIRED | PIPELINE |
| DW-VP-003 | `TABLET` | `SELECTOR` | YES | `viewport` | `viewport` | WIRED | PIPELINE |
| DW-VP-004 | `DESKTOP` | `SELECTOR` | YES | `viewport` | `viewport` | WIRED | PIPELINE |
| DW-VP-005 | active underline | `DECORATIVE` | NO | `viewport` | — | WIRED | CURRENT_IMPL |

### Exact state transition

```
ACTION            selectViewport(v)
PRECONDITION      none — always available, including while PAIR_LOCKED
MUTATES           workspace.viewport = v
DOES NOT MUTATE   selectedCandidate, authorityPair, masters, readiness, record tab
RE-DERIVES        DW-AUTH-001/003 label and pressed state
                  DW-GAL candidate tick marks (per-viewport candidate state)
                  DW-AUTH-014/015 promote target
                  DW-PIPE-020 contextual next action
PERSISTS          NO (see below)
SERVER WRITE      none
AUDIT EVENT       none — selecting a viewport is not a workflow event
REVERSIBLE        yes, trivially
CANONICAL / LIST  identical
```

**What it does not do.** It does not change candidate selection, does not affect
which candidate is selected for the *other* viewport, does not alter promotion
destination beyond naming it, and does not re-render a live responsive preview of
the concept — the candidates are generated artifacts per viewport, not a
responsive page being resized.

**TABLET is a real problem.** The pipeline has exactly two viewport slots,
`MOBILE` and `DESKTOP`. `DesignWorkspaceViewport` is `'MOBILE' | 'DESKTOP'`. The
authority pair is a *pair*. But the feature manifest says "MOBILE TABLET DESKTOP
workspace controls" and the golden shows three. A third control with no slot
behind it cannot be implemented without a decision. →
`FOUNDER_DECISION_REQUIRED` FD-05.

**Persistence.** Not persisted. Viewport is an operating focus, and defaulting to
`MOBILE` on entry matches the pipeline's mobile-first ordering and the current
implementation. Recorded rather than assumed.

---

## Section 07 — Stage and authority status · `DW-STG`

| id | label | class | interactive | reads | impl | source |
|---|---|---|---|---|---|---|
| DW-STG-001 | `STAGE` | `LABEL` | NO | — | RENDER_ONLY | VISUAL_ONLY |
| DW-STG-002 | `REVIEW_ACTIVE_CONCEPT` | `STATUS` | NO | `currentStage` | RENDER_ONLY | CURRENT_IMPL |
| DW-STG-003 | `AUTHORITY` | `LABEL` | NO | — | RENDER_ONLY | FEATURE_MANIFEST |
| DW-STG-004 | `PAIR: UNLOCKED · V1.3` | `STATUS` | NO | `authorityPair.status`, `pairVersion` | RENDER_ONLY | PIPELINE |
| DW-STG-005 | lock glyph | `STATUS` | NO | `authorityPair.status` | RENDER_ONLY | PIPELINE |

**DW-STG-004 must render `pairStatusLabel(session)`,** which already exists in
the pipeline, over the real status union `DRAFT | MOBILE_ONLY | DESKTOP_ONLY |
PAIR_READY | PAIR_LOCKED | DERIVATION_READY | … | SUPERSEDED`. `UNLOCKED` is not
a member of that union; it is golden copy. The closest faithful rendering of the
depicted situation is `PAIR_READY`.

**DW-STG-005 is readonly, not a lock control.** Feature `lock_authority_pair`
specifies "LOCK MOBILE + DESKTOP — **no silent auto-lock**", and the explicit
lock control is DW-AUTH-018. A second, smaller, unlabelled lock affordance in the
status strip would be exactly the silent path the manifest forbids. The glyph
mirrors state and is not focusable.

---

## Section 08 — Active concept hero · `DW-HERO`

The hero renders the **currently selected candidate**, not a fixed artifact. It
is a preview surface, and the sprint is right to warn against treating the whole
of it as clickable: the manifest gives inspection its own feature
(`inspect_candidate`) with its own controls in DW-CAND, so the hero does not need
to duplicate them.

| id | label | class | interactive | reads | impl | source |
|---|---|---|---|---|---|---|
| DW-HERO-001 | `ENTRY 001` | `READONLY_DATA` | NO | `currentEntry.id` | RENDER_ONLY | CURRENT_IMPL |
| DW-HERO-002 | `CULTURAL RECEIPT` | `READONLY_DATA` | NO | artifact class | RENDER_ONLY | CURRENT_IMPL |
| DW-HERO-003 | `001` | `READONLY_DATA` | NO | artifact index | RENDER_ONLY | CURRENT_IMPL |
| DW-HERO-004 | `THE SIGNAL / IS THE INDEX` | `MEDIA` (rendered artifact text) | NO | `selectedCandidate` artifact | RENDER_ONLY | CURRENT_IMPL |
| DW-HERO-005 | standfirst | `MEDIA` (rendered artifact text) | NO | `selectedCandidate` artifact | RENDER_ONLY | CURRENT_IMPL |
| DW-HERO-006 | hero image | `MEDIA` | YES → fullscreen | `selectedCandidate.artifact` | RENDER_ONLY | FEATURE_MANIFEST |
| DW-HERO-007 | `INDEX SIGNAL:` | `LABEL` | NO | — | RENDER_ONLY | VISUAL_ONLY |
| DW-HERO-008 | `PAGE 001 INDEXED` | `STATUS` | NO | grounding manifest | RENDER_ONLY | PIPELINE |
| DW-HERO-009 | arrow indicator | `DECORATIVE` | NO | — | RENDER_ONLY | VISUAL_ONLY |
| DW-HERO-010 | `ARCHIVAL EVIDENCE` | `LABEL` | NO | — | RENDER_ONLY | VISUAL_ONLY |
| DW-HERO-011 | `ATTACHED` | `STATUS` | NO | evidence pack presence | RENDER_ONLY | PIPELINE |
| DW-HERO-012 | `EVIDENCE` chip | `DRAWER_TRIGGER` | YES | evidence pack | RENDER_ONLY | FEATURE_MANIFEST |
| DW-HERO-013 | `+12` | `DRAWER_TRIGGER` | YES | evidence pack count | RENDER_ONLY | FEATURE_MANIFEST |

**Only three things in the hero are interactive.** The artifact image
(DW-HERO-006) opens the same fullscreen inspection as DW-CAND-004 — one behaviour,
two entry points, never two different behaviours. The `EVIDENCE` chip and `+12`
overflow both open the asset drawer defined by feature `inspect_assets`
("Canonical asset manifest — not random gallery"), the same drawer DW-OUT-005
opens, scoped to the evidence pack. `+12` means twelve further items, consistent
with `EVIDENCE PACK / 12 ITEMS` in DW-OUT-005.

The headline and standfirst are **part of the generated artifact**, not workspace
copy. They must render from the candidate, and they must not become editable
text here; there is no editing feature in the manifest.

---

## Section 09 — Authority controls · `DW-AUTH`

The complete state machine is in
[`02-AUTHORITY-STATE-MACHINE.md`](./02-AUTHORITY-STATE-MACHINE.md). This table
identifies the elements; that document defines every transition.

| id | label | class | interactive | writes | permissions | impl | source |
|---|---|---|---|---|---|---|---|
| DW-AUTH-001 | `SELECT FOR MOBILE` | `STATE_ACTION` | YES | `viewportSelection.mobile` | FOUNDER | RENDER_ONLY | FEATURE_MANIFEST |
| DW-AUTH-002 | `SELECTED` confirm bar | `STATUS` | NO | — | — | RENDER_ONLY | PIPELINE |
| DW-AUTH-003 | `SELECT FOR DESKTOP` | `STATE_ACTION` | YES | `viewportSelection.desktop` | FOUNDER | RENDER_ONLY | FEATURE_MANIFEST |
| DW-AUTH-004 | `AUTHORITY PAIR` header | `LABEL` | NO | — | — | RENDER_ONLY | FEATURE_MANIFEST |
| DW-AUTH-005 | collapse caret | `ACCORDION` | YES | `authorityPairOpen` | ANY_VIEWER | WIRED | CURRENT_IMPL |
| DW-AUTH-006 | `MOBILE MASTER` | `LABEL` | NO | — | — | RENDER_ONLY | PIPELINE |
| DW-AUTH-007 | mobile `V1.3` | `STATUS` | NO | — | — | RENDER_ONLY | PIPELINE |
| DW-AUTH-008 | mobile thumbnail | `THUMBNAIL` | YES → fullscreen | — | ANY_VIEWER | RENDER_ONLY | FEATURE_MANIFEST |
| DW-AUTH-009 | mobile `SELECTED` | `STATUS` | NO | — | — | RENDER_ONLY | PIPELINE |
| DW-AUTH-010 | `DESKTOP MASTER` | `LABEL` | NO | — | — | RENDER_ONLY | PIPELINE |
| DW-AUTH-011 | desktop `V1.1` | `STATUS` | NO | — | — | RENDER_ONLY | PIPELINE |
| DW-AUTH-012 | desktop thumbnail | `THUMBNAIL` | YES → fullscreen | — | ANY_VIEWER | RENDER_ONLY | FEATURE_MANIFEST |
| DW-AUTH-013 | `REPLACE` | `DESTRUCTIVE_ACTION` | YES | `desktopMaster`, `supersededMasters` | FOUNDER | RENDER_ONLY | PIPELINE |
| DW-AUTH-014 | `PROMOTE MOBILE` | `APPROVAL_ACTION` | YES | `mobileMaster`, `authorityPair` | FOUNDER | RENDER_ONLY | PIPELINE |
| DW-AUTH-015 | `PROMOTE DESKTOP` | `APPROVAL_ACTION` | YES | `desktopMaster`, `authorityPair` | FOUNDER | RENDER_ONLY | PIPELINE |
| DW-AUTH-016 | `PAIR REVIEW` | `DISCLOSURE` | YES | `pairReviewOpen` | FOUNDER | RENDER_ONLY | FEATURE_MANIFEST |
| DW-AUTH-017 | `REVIEW AUTHORITY` | — | — | — | — | RENDER_ONLY | — |
| DW-AUTH-018 | `LOCK MOBILE + DESKTOP AUTHORITY PAIR` | `APPROVAL_ACTION` | YES | whole pipeline | FOUNDER | RENDER_ONLY | PIPELINE |
| DW-AUTH-019 | lock glyph on DW-AUTH-018 | `DECORATIVE` | NO | — | — | RENDER_ONLY | VISUAL_ONLY |

**Feature binding for this section.** DW-AUTH-001 → `select_mobile_master_candidate`,
DW-AUTH-003 → `select_desktop_master_candidate`, DW-AUTH-013 →
`replace_viewport_master`, DW-AUTH-014 → `promote_mobile_viewport_master`,
DW-AUTH-015 → `promote_desktop_viewport_master`, DW-AUTH-016 →
`review_authority_pair`, DW-AUTH-018 → `lock_authority_pair`, and the pair block
itself → `authority_pair_status`.

**DW-AUTH-001 / 003 are selection, not promotion.** The manifest is explicit:
"SELECT FOR MOBILE — **reversible, not promotion**". This is the single most
important distinction in the section and the one Composer is most likely to get
wrong.

**DW-AUTH-016 vs DW-AUTH-017 — flagged as redundant, as the sprint anticipated.**
`review_authority_pair` is one feature. `featurePromptMarkers.ts` maps *both*
strings — `['PAIR REVIEW', 'REVIEW AUTHORITY']` — to that one feature. The live
product implements one surface, the `site00-dw-v3-authority-pair-review` section
shown when both masters are promoted. There is no second workflow, no handler and
no route named REVIEW AUTHORITY anywhere in the repository. Two buttons for one
feature is a defect in the golden, not a contract. → `FOUNDER_DECISION_REQUIRED`
FD-06. DW-AUTH-017 is deliberately left unclassified until that decision.

---

## Section 10 — Concept candidate gallery · `DW-GAL`

Features: `concept_candidate_gallery` — "Browse generated candidates with
lineage"; `compare_concepts` — "Side-by-side swipe or switcher comparison".

| id | label | class | interactive | reads | writes | impl | source |
|---|---|---|---|---|---|---|---|
| DW-GAL-001 | `CONCEPT CANDIDATE GALLERY` | `LABEL` | NO | — | — | RENDER_ONLY | FEATURE_MANIFEST |
| DW-GAL-002 | `COMPARE CONCEPTS` | `MODAL_TRIGGER` | YES | `candidateCollection` | `compareSelection` | RENDER_ONLY | FEATURE_MANIFEST |
| DW-GAL-003 | compare icon | `DECORATIVE` | NO | — | — | RENDER_ONLY | VISUAL_ONLY |
| DW-GAL-004 | candidate card (×4) | `SELECTABLE_CARD` | YES | `candidateCollection` | `selectedCandidate` | WIRED | FEATURE_MANIFEST |
| DW-GAL-005 | version chip (selected) | `STATUS` | NO | candidate version | — | WIRED | CURRENT_IMPL |
| DW-GAL-006 | version label (plain) | `STATUS` | NO | candidate version | — | WIRED | CURRENT_IMPL |
| DW-GAL-007 | selected tick | `STATUS` | NO | `selectedCandidate` | — | WIRED | PIPELINE |
| DW-GAL-008 | next control | `BUTTON` | YES | — | rail scroll offset | WIRED | CURRENT_IMPL |
| DW-GAL-009 | candidate rail | `DECORATIVE` container | NO | — | — | WIRED | CURRENT_IMPL |

### Candidate card behaviour — exact

```
ACTION            activate card (tap / click / Enter / Space)
EFFECT            the WHOLE card selects the candidate. There is no separate
                  select control inside the card, and selection is the card's
                  only activation behaviour.
MUTATES           workspace.selectedCandidateId
RE-DERIVES        hero (DW-HERO), concept record (DW-REC), structured output
AUDIT EVENT       none at this level — see below
NO DOUBLE ACTION  double click / double tap does NOT open a preview
```

**Why no double action.** `inspect_candidate` is its own feature with its own
control (DW-CAND-003) and a second fullscreen entry point on the artifact image.
Hiding a third entry point behind a double tap would be undiscoverable on touch,
which is the primary device. One gesture, one meaning.

**Selection here is workspace focus, not authority selection.** Choosing a card
changes what the workspace is looking at. Committing that candidate to a viewport
slot is DW-AUTH-001 / 003, which is why those are separate controls and why
`VIEWPORT_SELECTED` is the event for *those*, not for this. The tick (DW-GAL-007)
therefore has two distinct renderings to keep: workspace focus, and per-viewport
authority state from `candidateViewportStates`.

**DW-GAL-002 resolves cleanly and does not need a founder decision.** The feature
description specifies the interaction: "Side-by-side swipe or switcher
comparison". Side-by-side plus swipe is a comparison overlay, not a mode and not
a page; `DesignVisualComparisonDrawer` already exists to model it. Contract:
opens a comparison overlay (modal on desktop, full-height sheet on mobile) seeded
with the selected candidate plus the next candidate, allowing the second slot to
be switched. It does not require pre-selecting two cards, because the manifest
says switcher, not multi-select.

---

## Section 11 — Candidate actions · `DW-CAND`

| id | label | class | interactive | permissions | cost | impl | source |
|---|---|---|---|---|---|---|---|
| DW-CAND-001 | `REFINE CONCEPT` | `SYSTEM_ACTION` | YES | FOUNDER | YES | RENDER_ONLY | FEATURE_MANIFEST |
| DW-CAND-002 | `REGENERATE CONCEPT` | `SYSTEM_ACTION` | YES | FOUNDER | YES | RENDER_ONLY | FEATURE_MANIFEST |
| DW-CAND-003 | `INSPECT CANDIDATE` | `DRAWER_TRIGGER` | YES | ANY_VIEWER | NO | RENDER_ONLY | FEATURE_MANIFEST |
| DW-CAND-004 | `VIEW FULLSCREEN` | `FULLSCREEN_TRIGGER` | YES | ANY_VIEWER | NO | RENDER_ONLY | FEATURE_MANIFEST |

### REFINE CONCEPT — DW-CAND-001

```
FEATURE           refine_concept — "Bounded refinement preserving lineage"
PRECONDITION      a candidate is selected; authority pair not PAIR_LOCKED
INPUT             opens a refinement drawer with a bounded instruction input.
                  "Bounded" is load-bearing: refinement is constrained to the
                  parent, it is not a free re-prompt.
PROVIDER          the existing generation path, action REFINE
                  (Twin V2 runVisualAction / V3 runDesignPageAuthorityGeneration)
COST GUARD        REQUIRED — server rejects without founderConfirmedSpend
                  (SPEND_GUARD). See deliverable 11.
CREATES           a new candidate version whose parent is the refined candidate
PRESERVES         the original candidate, unmodified, still in the gallery
ASYNC             IDLE → LOADING (gallery shows a pending card) → SUCCESS (new
                  card appears and becomes selected) | ERROR (toast, original
                  selection retained, no card created)
DISABLED WHEN     no candidate selected · pair PAIR_LOCKED · provider key absent
                  · a generation is already in flight
HISTORY           candidate_refined
REVERSIBLE        not undoable; the prior candidate remains, so recovery is
                  re-selecting it
```

### REGENERATE CONCEPT — DW-CAND-002

```
FEATURE           regenerate_concept — "Sibling generation without deleting prior"
DIFFERENCE        REFINE is bounded by, and descends from, the selected
                  candidate. REGENERATE produces a SIBLING from the same source
                  brief. Refine narrows; regenerate re-rolls.
CREATES           a sibling candidate at the same lineage level
DELETES           nothing, explicitly
Everything else   as REFINE, with action REGENERATE and history
                  candidate_regenerated
```

### INSPECT CANDIDATE — DW-CAND-003

```
FEATURE           inspect_candidate — "Fullscreen or scaled inspection"
TREATMENT         scaled inspection = drawer (the manifest's allowable modes are
                  INLINE, DOCK, SHEET, DRAWER). Fullscreen is the other half of
                  the same feature and is DW-CAND-004.
CONTENT           candidate metadata and provenance: id, version, lineage parent,
                  generation batch, source territory, per-viewport authority
                  state, grounding manifest id, image hash
CLOSE             X, Escape, scrim click, browser back
```

### VIEW FULLSCREEN — DW-CAND-004

```
FEATURE           inspect_candidate (fullscreen half)
TREATMENT         full-viewport artifact inspection. Site00ImageInspectLightbox
                  exists product-wide and is the natural basis.
ACTIONS INSIDE    inspection only. Authority actions are NOT available inside
                  fullscreen: promoting from a lightbox with no surrounding
                  workflow context is how the wrong master gets promoted.
CLOSE             X, Escape, browser back. On mobile, back must close the
                  overlay rather than leave the workspace.
FOCUS             trapped; focus returns to the trigger on close
```

---

## Section 12 — Structured output review · `DW-OUT`

Five modules, five features, one shared interaction grammar.

| id | module | feature | detail treatment |
|---|---|---|---|
| DW-OUT-002 | `GROUNDING / INDEX SIGNAL MANIFEST` | `inspect_project_grounding` | `DRAWER_DETAIL` |
| DW-OUT-003 | `BLUEPRINT / LAYOUT + TYPE SYSTEM` | `inspect_blueprint` | `DRAWER_DETAIL` |
| DW-OUT-004 | `OVERLAY / ANNOTATION LAYER ON` | `inspect_overlay` | `DRAWER_DETAIL` |
| DW-OUT-005 | `ASSETS / EVIDENCE PACK 12 ITEMS` | `inspect_assets` | `DRAWER_DETAIL` |
| DW-OUT-006 | `FUNCTION / MAPPING 6 FUNCTIONS` | `inspect_function_mapping` | `DRAWER_DETAIL`, recessed |

| id | element | class | interactive | impl | source |
|---|---|---|---|---|---|
| DW-OUT-001 | `STRUCTURED OUTPUT REVIEW` | `LABEL` | NO | RENDER_ONLY | VISUAL_ONLY |
| DW-OUT-002..006 | module container | `CARD` | NO | RENDER_ONLY | FEATURE_MANIFEST |
| DW-OUT-007 | module label | `LABEL` | NO | RENDER_ONLY | FEATURE_MANIFEST |
| DW-OUT-008 | module value lines | `STATUS` | NO | RENDER_ONLY | FEATURE_MANIFEST |
| DW-OUT-009 | module preview media | `MEDIA` | YES → fullscreen | RENDER_ONLY | FEATURE_MANIFEST |
| DW-OUT-010 | module source caption | `READONLY_DATA` | NO | RENDER_ONLY | FEATURE_MANIFEST |
| DW-OUT-011 | module document icon | `DRAWER_TRIGGER` | YES | RENDER_ONLY | FEATURE_MANIFEST |
| DW-OUT-012 | function list (`F01`…`F06`) | `READONLY_DATA` | NO | RENDER_ONLY | FEATURE_MANIFEST |

**The card is not clickable; the document icon is.** Five features named
`inspect_*` each need exactly one inspection affordance, and the document icon is
it. Making the whole card clickable as well would give the preview image, the
icon and the card three overlapping hit targets in a 130px-wide tile.

**The preview image opens fullscreen, the icon opens the detail drawer.** Image
means look closer at the render; icon means read the record. That split is the
same one used in DW-HERO and DW-CAND, so it is learned once.

**Module states must render honestly.** `inspect_blueprint` specifies "Blueprint
or **NOT YET GENERATED / AWAITING LOCK**". Modules therefore have an empty state
and a blocked state, and must not render a plausible placeholder image when the
artifact does not exist. `inspect_function_mapping` is specified as "recessed" —
lower visual weight than its peers, which the golden already reflects.

**None of these becomes a child page.** See
[`04-ROUTES-AND-PAGES.md`](./04-ROUTES-AND-PAGES.md) for `/grounding`,
`/blueprint`, `/overlay`, `/assets`, `/function-map` assessed individually.

---

## Section 13 — Pipeline and readiness · `DW-PIPE`

Feature: `compiler_readiness` — "READY MISSING BLOCKED UNKNOWN STALE — **no fake
metrics**". Feature: `contextual_next_action` — "**One primary CTA from state**".
Feature: `technical_details` — "**Recessed bottom sheet / drawer**".
Feature: `move_to_build` — "**Blocked until gates pass**".

| id | element | class | interactive | reads | impl | source |
|---|---|---|---|---|---|---|
| DW-PIPE-001 | `PIPELINE / READINESS` | `LABEL` | NO | — | RENDER_ONLY | FEATURE_MANIFEST |
| DW-PIPE-002 | `READINESS` | `LABEL` | NO | — | RENDER_ONLY | FEATURE_MANIFEST |
| DW-PIPE-003 | readiness ring | `PROGRESS` | NO | see below | RENDER_ONLY | VISUAL_ONLY |
| DW-PIPE-004 | `82%` | `PROGRESS` | NO | see below | RENDER_ONLY | VISUAL_ONLY |
| DW-PIPE-005 | `READY` | `STATUS` | NO | receipt `overall` | RENDER_ONLY | FEATURE_MANIFEST |
| DW-PIPE-006 | `COMPILER:` | `LABEL` | NO | — | RENDER_ONLY | FEATURE_MANIFEST |
| DW-PIPE-007 | compiler `READY` | `STATUS` | NO | receipt `overall` | RENDER_ONLY | FEATURE_MANIFEST |
| DW-PIPE-008 | compiler dot | `STATUS` | NO | receipt `overall` | RENDER_ONLY | FEATURE_MANIFEST |
| DW-PIPE-009 | `CHECKS` | `LABEL` | NO | — | RENDER_ONLY | FEATURE_MANIFEST |
| DW-PIPE-010 | check row (×5) | `STATUS` | NO | receipt `checks[]` | RENDER_ONLY | PIPELINE |
| DW-PIPE-011 | check pass indicator | `STATUS` | NO | check result | RENDER_ONLY | PIPELINE |
| DW-PIPE-012 | check warn indicator | `STATUS` | NO | check result | RENDER_ONLY | PIPELINE |
| DW-PIPE-013 | `VIEW DETAILS` | `DRAWER_TRIGGER` | YES | receipt | RENDER_ONLY | FEATURE_MANIFEST |
| DW-PIPE-014 | `STATUS` | `LABEL` | NO | — | RENDER_ONLY | VISUAL_ONLY |
| DW-PIPE-015 | `APPROVED ELEMENTS` | `STATUS` | NO | see below | RENDER_ONLY | VISUAL_ONLY |
| DW-PIPE-016 | `PENDING DECISIONS` | `STATUS` | NO | see below | RENDER_ONLY | VISUAL_ONLY |
| DW-PIPE-017 | `BLOCKERS` | `STATUS` | YES when > 0 | receipt `blockers[]` | RENDER_ONLY | PIPELINE |
| DW-PIPE-018 | `WARNINGS` | `STATUS` | YES when > 0 | receipt `checks[]` | RENDER_ONLY | PIPELINE |
| DW-PIPE-019 | `NEXT ACTION` | `LABEL` | NO | — | RENDER_ONLY | FEATURE_MANIFEST |
| DW-PIPE-020 | next action text | `STATUS` | NO | derived, see below | RENDER_ONLY | FEATURE_MANIFEST |
| DW-PIPE-021 | `PRIMARY ACTION` | varies, see below | YES | derived | RENDER_ONLY | FEATURE_MANIFEST |
| DW-PIPE-022 | `MOVE TO BUILD WHEN READY` | `APPROVAL_ACTION` | YES when unblocked | build gates | RENDER_ONLY | FEATURE_MANIFEST |
| DW-PIPE-023 | `VIEW TECHNICAL DETAILS` | `DRAWER_TRIGGER` | YES | receipt | RENDER_ONLY | FEATURE_MANIFEST |

### The readiness percentage — DW-PIPE-003 / 004

The feature that owns this block forbids fake metrics, and no computation exists
anywhere in the repository that produces `82%` or the five check labels shown.
The real models are PASS / FAIL / BLOCKED gate receipts. There is a genuine
weighted percentage in `buildWeightedAuthorityCoverageReceipt`
(`coveragePercent` / `weightedCoveragePercent`), but it measures authority visual
coverage, which is not what a block labelled PIPELINE / READINESS implies.

Composer must not invent a weighting. → `FOUNDER_DECISION_REQUIRED` FD-07.

The five check labels have the same problem in weaker form: the real gate names
are `AUTHORITY INTEGRITY`, `FEATURE MANIFEST`, `VISUAL COVERAGE`,
`FUNCTION BINDINGS`, `move_to_build`. `FUNCTION MAP` plausibly maps to
`FUNCTION BINDINGS`, but `TYPE SCALE` and `ACCESSIBILITY` have no gate. The check
list must render the receipt's actual checks rather than the golden's labels.

### Status counts — DW-PIPE-015 to 018

`BLOCKERS` and `WARNINGS` are real: both derive from the receipt, blockers from
`blockers[]` and warnings from non-PASS non-FAIL checks, and both open the
readiness drawer filtered to those entries when the count is above zero. A count
of zero is not interactive.

`APPROVED ELEMENTS` and `PENDING DECISIONS` have no computation anywhere. They
are folded into FD-07 rather than given an invented definition.

### Contextual next action — DW-PIPE-020 / 021

The manifest says "One primary CTA from state". The copy on the golden —
`PROMOTE MOBILE MASTER TO AUTHORITY PAIR` — is therefore **the value of a
derivation for one particular state, not the label of a button**. Composer must
implement the derivation.

```
DERIVATION (first match wins, evaluated against the authority pipeline)

no candidate selected for the active viewport
  → "SELECT A CONCEPT FOR <VIEWPORT>"      action: focus gallery       class STATE_ACTION
selection exists, no master for the active viewport
  → "PROMOTE <VIEWPORT> MASTER TO AUTHORITY PAIR"  action: DW-AUTH-014/015  class APPROVAL_ACTION
one master promoted, the other slot empty
  → "SELECT A CONCEPT FOR <OTHER VIEWPORT>"  action: switch viewport + focus gallery
both masters promoted, pair PAIR_READY
  → "REVIEW AND LOCK AUTHORITY PAIR"       action: DW-AUTH-016 then 018  class APPROVAL_ACTION
pair PAIR_LOCKED, derivation not started
  → "MOVE TO BUILD"                        action: DW-PIPE-022          class APPROVAL_ACTION
readiness gate failing
  → "RESOLVE <N> BLOCKERS"                 action: open readiness drawer class DRAWER_TRIGGER
feature manifest stale (MASTER_AMENDMENT_REQUIRED)
  → "MASTER UPDATE REQUIRED"               action: open amendment detail class DRAWER_TRIGGER
```

The depicted state — mobile selected, mobile master not yet promoted — produces
exactly the golden's copy, which is a good sign the derivation matches founder
intent.

`PRIMARY ACTION` has no fixed class because it inherits the class of whatever it
resolves to. It is never simultaneously available with a second primary; the
manifest says *one*.

### MOVE TO BUILD — DW-PIPE-022

The sprint is right that this is critical, and the architecture answers it.

```
MEANING           move_to_build is a real feature id, specified "Blocked until
                  gates pass", and BUILD is a real readiness SCOPE alongside
                  DERIVATION and REVIEW in scopedCompilerReadiness.ts.
                  BUILD is therefore a PHASE INSIDE SITE 00, gated by the
                  compiler readiness receipt at BUILD scope.
NOT               not Composer productionization. The benches explicitly do not
                  invoke Composer, founderApprovalTriggersComposerAutomatically()
                  returns false, and Composer draft routes are preview-only.
NOT               not the client-app "THE BUILD" progress screen.
PRECONDITION      authorityPair.status === 'PAIR_LOCKED'
                  AND BUILD-scope gates pass
CURRENT REALITY   scopedCompilerReadiness hardcodes buildPass = false and marks
                  BUILD ACTION STATUS as BLOCKED "until BUILD scope and founder
                  translation approval". So today this control is correctly
                  DISABLED in every reachable state.
LABEL             the golden's "WHEN READY" suffix is honest and should stay:
                  it reads as a disabled-state label.
DESTINATION       ImplementationPackageStatus advances toward APPROVED_FOR_BUILD.
                  Whether that also navigates anywhere is unresolved → FD-08.
```

### VIEW DETAILS and VIEW TECHNICAL DETAILS — DW-PIPE-013 / 023

Two controls, one feature (`technical_details`, "Recessed bottom sheet /
drawer"), and they are not the same content.

- **DW-PIPE-013 `VIEW DETAILS`** sits inside the CHECKS block and opens the
  readiness receipt: every gate, its result, and its detail string. Founder-level
  reading.
- **DW-PIPE-023 `VIEW TECHNICAL DETAILS`** sits under NEXT ACTION and opens the
  raw technical record: pair checksum, image hashes, manifest version, lineage
  ids, derivation status. Developer-level reading, and "recessed" in the manifest
  matches its recessed position in the golden.

Both are drawers. Neither is a page.

---

## Section 14 — Concept tabs and record · `DW-REC`

Features: `design_history` — "Concepts selections promotions locks lineage";
`feature_change_history` — "Immutable feature change lineage";
`master_amendment_status` — "MASTER UPDATE REQUIRED when manifest stale".

| id | element | class | interactive | writes | impl | source |
|---|---|---|---|---|---|---|
| DW-REC-001 | `CONCEPT DATA` | `TAB` | YES | `recordTabIndex` | WIRED | CURRENT_IMPL |
| DW-REC-002 | `VERSION HISTORY` | `TAB` | YES | `recordTabIndex` | WIRED | FEATURE_MANIFEST |
| DW-REC-003 | `CHANGE HISTORY` | `TAB` | YES | `recordTabIndex` | WIRED | FEATURE_MANIFEST |
| DW-REC-004 | `MASTER UPDATE` | `TAB` | YES | `recordTabIndex` | WIRED | FEATURE_MANIFEST |
| DW-REC-005 | `AMENDMENT` | `TAB` | YES | `recordTabIndex` | WIRED | FEATURE_MANIFEST |
| DW-REC-006 | active tab underline | `DECORATIVE` | NO | — | WIRED | CURRENT_IMPL |
| DW-REC-007 | record thumbnail | `THUMBNAIL` | YES → fullscreen | — | RENDER_ONLY | FEATURE_MANIFEST |
| DW-REC-008 | thumbnail version badge | `STATUS` | NO | — | RENDER_ONLY | CURRENT_IMPL |
| DW-REC-009 | `CONCEPT ID` | `READONLY_DATA` | NO | — | RENDER_ONLY | CURRENT_IMPL |
| DW-REC-010 | `CREATED` | `READONLY_DATA` | NO | — | RENDER_ONLY | CURRENT_IMPL |
| DW-REC-011 | `UPDATED` | `READONLY_DATA` | NO | — | RENDER_ONLY | CURRENT_IMPL |
| DW-REC-012 | `AUTHOR` | `READONLY_DATA` | NO | — | RENDER_ONLY | CURRENT_IMPL |
| DW-REC-013 | `ARTIFACT TYPE` | `READONLY_DATA` | NO | — | RENDER_ONLY | CURRENT_IMPL |
| DW-REC-014 | `SOURCE` | `LINK` | YES | — | RENDER_ONLY | VISUAL_ONLY |

**These are panel tabs, not routes.** They swap the content of the record strip
in place. `recordTabIndex` is page-local, shared between CANONICAL and LIST, and
not persisted. Content is lazy: history tabs should not fetch until first
activation.

**Tab semantics, each bound to a real concern.** `VERSION HISTORY` is the
candidate's own version lineage. `CHANGE HISTORY` is `feature_change_history`,
the immutable `WorkspaceFeatureChangeSet` lineage. `MASTER UPDATE` is
`master_amendment_status`, which renders `MASTER UPDATE REQUIRED` when the
manifest is stale — note this tab is a *status surface*, not an action.
`AMENDMENT` is the amendment record in DW-AMD.

**DW-REC-014 `SOURCE` is the only link in the record.** `ENTRY001-CAMPAIGN-ARCHIVE`
names an archive entity. Every other field is a value. Where it resolves to is
unresolved → FD-09.

---

## Section 15 — Amendment · `DW-AMD`

| id | element | class | interactive | impl | source |
|---|---|---|---|---|---|
| DW-AMD-001 | `MAA-RSF1-AUTHORITY-SELECTION-V1` | `READONLY_DATA` | NO | RENDER_ONLY | PIPELINE |
| DW-AMD-002 | `ACTIVE` chip | `STATUS` | NO | RENDER_ONLY | PIPELINE |
| DW-AMD-003 | `AMENDMENT TYPE` | `READONLY_DATA` | NO | RENDER_ONLY | PIPELINE |
| DW-AMD-004 | `EFFECTIVE` | `READONLY_DATA` | NO | RENDER_ONLY | PIPELINE |
| DW-AMD-005 | `SCOPE` | `READONLY_DATA` | NO | RENDER_ONLY | PIPELINE |
| DW-AMD-006 | `AUTHORITY WORKFLOW` | `READONLY_DATA` | NO | RENDER_ONLY | PIPELINE |
| DW-AMD-007 | `VIEW AMENDMENT` | `DRAWER_TRIGGER` | YES | RENDER_ONLY | FEATURE_MANIFEST |

**Three corrections against the real model.** The canonical record is
`maa-r5f1-authority-selection-v1` — the golden's `RSF1` is an OCR-style
corruption of `R5F1`. Its `amendmentType` is `FEATURE_ADDITION`, not
`AUTHORITY SELECTION` (that phrase is part of the id, not the type). Its status
is `APPROVED`; the enum is `DRAFT | APPROVED | APPLIED | SUPERSEDED` and contains
no `ACTIVE`. Composer renders the record, not the golden's strings.

**DW-AMD-007 opens a drawer, not a page.** It is audit detail for one record:
what changed, when it became effective, which features it added, which masters it
affects. It creates no history entry of its own — reading an audit record is not
an auditable act.

---

## Section 16 — Bottom dock · `DW-DOCK`

The dock is the page's second navigation system, and its semantics were the
vaguest thing on the golden. The feature manifest resolves four of five.

| id | label | class | interactive | feature | treatment | impl |
|---|---|---|---|---|---|---|
| DW-DOCK-001 | `WORKSPACE` | `NAVIGATION` | YES | — | returns to the workspace body | WIRED |
| DW-DOCK-002 | `DESIGN HISTORY` | `DRAWER_TRIGGER` | YES | `design_history` | drawer | WIRED (state only) |
| DW-DOCK-003 | `FEATURE CHANGE HISTORY` | `DRAWER_TRIGGER` | YES | `feature_change_history` | drawer | WIRED (state only) |
| DW-DOCK-004 | `MASTER AMENDMENT STATUS` | `DRAWER_TRIGGER` | YES | `master_amendment_status` | drawer | WIRED (state only) |
| DW-DOCK-005 | `CONTEXTUAL NEXT ACTION` | derived | YES | `contextual_next_action` | see below | WIRED (state only) |
| DW-DOCK-006 | active dock indicator | `DECORATIVE` | NO | — | — | WIRED |

**The dock opens drawers; it does not route.** No routes exist for any of these
destinations, and the manifest's allowable presentation modes are `INLINE`,
`DOCK`, `SHEET`, `DRAWER`. Treating them as routes would invent four pages that
the architecture has never had. `WORKSPACE` is the neutral position: it closes
any open dock drawer and shows the workspace body.

**DW-DOCK-002 and DW-REC-003 are different things** and must not be merged.
`design_history` is "concepts selections promotions locks lineage" — the
authority pipeline event log. `feature_change_history` is the manifest change
lineage. Two features, two drawers, two datasets.

**DW-DOCK-005 is the same derivation as DW-PIPE-021,** not a separate action.

```
INPUT STATE    the authority pipeline plus the readiness receipt
DERIVATION     identical to the DW-PIPE-020/021 table above — one shared
               resolver, so the dock and the pipeline panel can never
               disagree about what comes next
ACTION         invokes the resolved action
DESTINATION    whatever the resolved action targets: a control to focus, a
               drawer to open, or an approval to run
```

It is emphatically not a static page. If the dock item and the readiness panel
ever show different next actions, that is a bug in the resolver.

---

## Inventory totals

| Section | Elements | Interactive |
|---|---|---|
| `DW-HDR` host header | 8 | 3 |
| `DW-NAV` primary nav | 8 | 7 |
| `DW-CTX` context bar | 4 | 0 |
| `DW-VIEW` view mode | 4 | 2 |
| `DW-TGT` target | 4 | 0 |
| `DW-VP` viewport | 5 | 3 |
| `DW-STG` stage / authority status | 5 | 0 |
| `DW-HERO` hero | 13 | 3 |
| `DW-AUTH` authority controls | 19 | 10 |
| `DW-GAL` gallery | 9 | 3 |
| `DW-CAND` candidate actions | 4 | 4 |
| `DW-OUT` structured output | 12 | 2 |
| `DW-PIPE` pipeline / readiness | 23 | 6 |
| `DW-REC` tabs and record | 14 | 7 |
| `DW-AMD` amendment | 7 | 1 |
| `DW-DOCK` bottom dock | 6 | 5 |
| **Total** | **145** | **56** |

Interactive counts treat a repeated class (a candidate card, a check row, a
module document icon) as one entry, because one contract governs every instance.

| Action category | Count | Elements |
|---|---|---|
| Navigation | 12 | DW-HDR-001/003, DW-NAV-001..007, DW-DOCK-001, DW-REC-014, DW-HDR-008 |
| State actions | 16 | DW-VIEW-002/003, DW-VP-002/003/004, DW-AUTH-001/003/005, DW-GAL-004/008, DW-REC-001..005, DW-PIPE-021 (when resolved to a state action) |
| Approval / authority | 8 | DW-AUTH-013/014/015/016/017/018, DW-PIPE-022, DW-DOCK-005 (when resolved to an approval) |
| Generation (cost-bearing) | 2 | DW-CAND-001/002 |
| Inspection (overlay) | 18 | DW-HERO-006/012/013, DW-AUTH-008/012, DW-GAL-002, DW-CAND-003/004, DW-OUT-009/011, DW-PIPE-013/017/018/023, DW-AMD-007, DW-DOCK-002/003/004 |
