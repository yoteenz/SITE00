# Section 08 — Founder decision resolutions (R1)

Sprint: `P0.VR.DESIGNBENCH.OPUS-INTERACTION-CONTRACT1R1`
Resolves: FD-01 … FD-09 from `07-INHERITANCE-AND-FOUNDER-DECISIONS.md`
Status: `FOUNDER_APPROVAL_PENDING`

Semantics only. No visual mutation, no Composer invocation, no backend built.

Every decision below is argued from code that exists. Where a sprint-supplied
option was rejected, the rejection says which file makes it expensive or
impossible, not merely that it felt wrong.

---

## FD-05 — TABLET authority slot

Resolved first because it is the only decision that could change the shape of
the authority model, and the other eight inherit from that shape.

```
FD-05_DECISION      OPTION A — MOBILE and DESKTOP are the only approved
                    authorities. TABLET is a DERIVED PREVIEW viewport: it
                    changes what is displayed, never what is approved.
```

**Rationale.** `DesignWorkspaceViewport = 'MOBILE' | 'DESKTOP'` is load-bearing
far past the type alias. Two-ness is baked into `computePairChecksum`, the
`founderReview` flags (`mobileApproved` / `desktopApproved`), the eight failure
codes of `runDesignAuthorityPairReadinessGate`, `ViewportMasterAuthority.version`
chains, the `supersedesAuthorityId` lineage, and the word PAIR in every label
and status value from `PAIR_READY` to `PAIR_LOCKED` to `PAIR_SUPERSEDED`.

Option B does not add a slot; it converts a pair into a triple and invalidates
every checksum already written. It also multiplies founder approval work by 1.5
per page at exactly the point SITE 00 wants to scale to many pages — approval
cost is the scarce resource here, not viewport coverage.

The architecture already states that intermediate widths are derived rather than
approved. `scopedCompilerReadiness.ts` carries a `RESPONSIVE CONTRACT` gate whose
detail is "object correspondence": correspondence is asserted *between two
authorities*, which is only coherent if everything between them is interpolated.

Sprint Option C — an exception override for TABLET when interpolation fails — is
rejected for a specific reason: it makes authority arity conditional, so the pair
is sometimes a pair and sometimes a triple, and no checksum, gate or status union
can express that. There is also no interpolation-failure detector anywhere in the
codebase that could trigger the exception, so the branch would be unreachable
code guarding an unrepresentable state.

Option "remove TABLET" is out of scope: it is a visual change.

```
STATE_MODEL_CHANGE  none to DesignWorkspaceViewport — it stays two-valued.
                    UI viewport state keeps its three values (MOBILE, TABLET,
                    DESKTOP) because it is presentation, not authority.
                    TABLET gains no slot, no selection, no master, no version.
                    Derived fidelity is reported, never approved.

UI_CONTRACT_CHANGE  while viewport = TABLET, the authority controls
                    (DW-AUTH-001/003/013/014/015) are disabled and render the
                    named reason AUTHORITY_NOT_APPLICABLE_FOR_DERIVED_VIEWPORT
                    rather than a generic disabled state. Inspection, gallery,
                    readiness and record surfaces stay fully live.
                    No pixels change in this sprint; this is the contract
                    Composer implements.

COMPOSER_IMPACT     do not add a third slot. Do not emit
                    VIEWPORT_MASTER_PROMOTED with viewport 'TABLET'. Do not
                    include TABLET in authorityPair, pairChecksum or
                    founderReview. Implement the derived-viewport empty state
                    once, in the shared hook.
```

---

## FD-07 — Readiness system

```
FD-07_DECISION      OPTION B — readiness is passed gates over applicable gates,
                    computed from the CompilerReadinessReceipt that already
                    exists. The 82% is not preserved: no computation produces
                    it, and compiler_readiness forbids fake metrics.
```

The gate set is not invented. It is the 23 checks built by
`buildScopedCompilerReadinessReceipt` — 8 DERIVATION, 14 REVIEW, 1 BUILD.

```
READINESS_FORMULA

  applicableGates = checks where result !== 'NOT_APPLICABLE'
  passedGates     = applicableGates where result === 'PASS'
  readinessPercent = round(100 * passedGates / applicableGates)

  The percentage is a progress indicator. It is never a gate, and no
  action may be predicated on it crossing a number.
```

With today's receipt: 23 checks, `move_to_build` is `NOT_APPLICABLE`, so 22 are
applicable. `BUILD ACTION STATUS` is hardcoded `BLOCKED`. So an otherwise clean
page computes **95%** with translation approved and **91%** without. Neither is
82%, and that is the point — the ring shows the real number or it shows nothing.

```
BLOCKING_CHECKS     result === 'FAIL' in any scope,
                    or result === 'BLOCKED' in BUILD scope.
                    This is exactly the existing `blockers` computation in
                    scopedCompilerReadiness.ts — it is adopted, not redefined.

WARNING_ONLY_CHECKS staleness markers that do not fail a gate:
                    derivationStatus === 'STALE',
                    projectCreativeContextVersion mismatch,
                    featureManifestVersion mismatch.

READINESS_THRESHOLD there is none on the percentage. The READY label is
                    boolean: blockers.length === 0 AND every DERIVATION and
                    REVIEW gate is PASS.

BUILD_ELIGIBILITY_RULE
                    pair.status === 'PAIR_LOCKED'
                    AND translationApproved === true
                    AND implementationPackage.status === 'BUILD_REVIEW_READY'
                    AND blockers contains nothing except the BUILD ACTION
                        STATUS gate itself
                    → buildPass becomes this expression instead of the
                      hardcoded false in scopedCompilerReadiness.ts:83
```

```
COUNT_DEFINITIONS

APPROVED ELEMENTS   count of applicable gates with result === 'PASS'.
                    "Elements" is the golden's word; the quantity is gates.

PENDING DECISIONS   gates with result === 'BLOCKED' outside BUILD scope
                    (today: FOUNDER REVIEW STATUS awaiting APPROVE TRANSLATION)
                    plus unresolved founder decisions still open against this
                    page. Deterministic, and it goes to zero on approval.

BLOCKERS            receipt.blockers.length. Already real; unchanged.

WARNINGS            count of WARNING_ONLY_CHECKS currently true.
```

```
COMPOSER_IMPACT     bind the ring, the four counts and the five check rows to
                    the receipt. Render the computed number even when it is not
                    82. If a receipt is absent, render UNKNOWN — never a
                    placeholder percentage.
```

---

## FD-08 — MOVE TO BUILD

```
FD-08_DECISION      OPTION A — state only, plus a typed event. The founder
                    stays on the route. This is not a Composer handoff.
```

`founderApprovalTriggersComposerAutomatically()` returns false. Option C would
invert that policy, which is a founder decision about autonomy, not a wiring
detail, and this sprint will not smuggle it in. Option B needs a build surface
that does not exist; inventing a route family for a button is the same mistake
FD-09 rejects.

```
BUILD_DEFINITION    BUILD is two things that already exist, and not a third:
                      • a workflow stage — 'BUILD' in
                        DESIGN_PAGE_V3_WORKFLOW_PHASES
                      • a package status — 'APPROVED_FOR_BUILD' in
                        ImplementationPackageStatus
                    It is NOT a route in this contract.

PRECONDITIONS       actor is FOUNDER
                    pair.status === 'PAIR_LOCKED'
                    translationApproved === true
                    implementationPackage.status === 'BUILD_REVIEW_READY'
                    BUILD_ELIGIBILITY_RULE (FD-07) holds

EVENT_TYPE          MOVED_TO_BUILD
                    Past-tense SCREAMING_SNAKE to match the existing union.
                    The feature id stays move_to_build; the event records that
                    it happened.
                    payload: { packageId, packageChecksum, pairId, pairChecksum,
                               readinessReceiptId, movedBy, movedAt }

STATE_TRANSITION    implementationPackage.status → 'APPROVED_FOR_BUILD'
                    readiness build stage BUILD_REVIEW_READY → BUILD_READY
                    buildPass stops being hardcoded false and becomes the
                    eligibility expression

DESTINATION         none. No navigation. CONTEXTUAL NEXT ACTION re-derives.

FROZEN_ARTIFACTS    implementation package (packageChecksum), pair checksum,
                    featureManifestVersion, projectCreativeContextVersion,
                    canonical asset manifest id, compiler readiness receipt id.
                    The masters were already immutable at PAIR_LOCKED.

ROLLBACK            none. Forward-only, consistent with the lock having no
                    unlock. Recovery is superseding the package with a new
                    version — priorImplementationPackageId already exists for
                    exactly this chain.

HISTORY ENTRY       one MOVED_TO_BUILD event; it is the second auditable
                    commitment on the page after PAIR_LOCKED.

COMPOSER_IMPACT     add the three event members, compute buildPass, advance the
                    package status, and do not navigate.
```

---

## FD-06 — REVIEW AUTHORITY and permissions

```
FD-06_DECISION      OPTION B — the three controls are distinct, and REVIEW
                    AUTHORITY is the missing surface rather than a duplicate.
```

The lock gate checks eight conditions before an action that has no undo, and the
founder currently has no surface that shows those eight conditions beforehand.
That is a real gap, so a control that fills it is not duplication.

```
PAIR_REVIEW         DW-AUTH-016. Inline disclosure. Compares the two masters
                    visually. No state change, no event, no route.
                    Precondition: both masters PROMOTED.

REVIEW_AUTHORITY    DW-AUTH-017. Provenance audit, read-only, rendered as a
                    drawer reusing OV-TECHNICAL's content at approval time.
                    Shows what the lock will check: authorityImageHash per
                    master, projectCreativeContextVersion, featureManifestVersion,
                    groundingManifestId, coverage receipt, and the live
                    pass/fail of each readiness gate.
                    No state change, no event. Looking is not deciding.

LOCK_AUTHORITY      DW-AUTH-018. The only committing action of the three.
                    Emits PAIR_LOCKED. Confirmation states what becomes
                    immutable, because there is no undo.
                    Unlocking still does not exist and no role may unlock;
                    superseding is the only forward path.
```

```
ROLE_MODEL          use the roles SITE 00 already has. Do not add EDITOR or
                    VIEWER — they appear in no code.
                      FOUNDER        isFounderPrivilegedAccount(email)
                      ADMIN          resolvePlatformRole(email) === 'ADMIN'
                      PROJECT_OWNER  canAccessProjectAsOwner(...)
                      CLIENT         client room membership
                      COLLABORATOR   project membership
                      REVIEWER       project membership, read-only

                    Authorization is server-authoritative.
                    isExperienceContextAuthoritative() returns false by design:
                    the active UX context must never grant a permission.
```

```
ACTION_PERMISSIONS  FOUNDER only, enforced server-side:
                      select candidate · unselect · promote mobile ·
                      promote desktop · replace master · lock authority pair ·
                      refine concept · regenerate concept · move to build ·
                      create amendment
                    Any member with project access:
                      read, focus, view mode, viewport, gallery browsing,
                      pair review, review authority, all inspection drawers,
                      history
                    Non-founders see mutating controls DISABLED WITH REASON,
                    not hidden — a workflow the viewer cannot see is a workflow
                    they cannot learn.

COMPOSER_IMPACT     one permission predicate in the shared hook, one
                    server-side assertion per mutating endpoint. Never gate on
                    client-held role claims.
```

---

## FD-01 — Header overflow menu

```
FD-01_DECISION      two page-scoped diagnostic items, both backed by data that
                    exists today and neither reachable from any other control.
```

The audit is the decision here. The primary nav covers REFERENCES, ASSETS,
PAGES, SKINS, HISTORY. The dock covers WORKSPACE, DESIGN HISTORY, FEATURE CHANGE
HISTORY, MASTER AMENDMENT STATUS and CONTEXTUAL NEXT ACTION. The rail covers
promotion, review and lock. Almost everything a DESIGN overflow might hold is
already somewhere, and duplicating it would be worse than leaving it thin.

```
MENU_ITEMS
  READINESS RECEIPT    opens the CompilerReadinessReceipt: every gate, its
                       scope, its result, the blockers array and generatedAt.
                       The data exists (crr-scoped-*) and has no control today.
  CONTRACT VERSIONS    featureManifestVersion, projectCreativeContextVersion,
                       pairChecksum, buildRef. This is the surface behind the
                       DESIGN_AUTHORITY_CONTEXT_STALE and _FEATURE_STALE
                       errors, and it has no control today.

EXCLUDED, WITH REASON
  export / share / print   no export capability exists; the menu item would be
                           the only evidence of a feature that is not built
  keyboard help            no shortcut layer exists on this page
  project switching        host-header scope, and FD-02 gives it a home
  view technical details   already a secondary action in the pipeline panel
  review authority         already a rail control (FD-06)

DUPLICATION_CHECK    neither item appears in the primary nav, the dock, the
                     rail or the pipeline panel.

COMPOSER_IMPACT      one menu component, two read-only drawers, no new routes,
                     no new data.
```

---

## FD-02 — Hamburger versus the visible nav

```
FD-02_DECISION      OPTION A — the hamburger opens SITE 00 workspace-level
                    navigation: the project's other modules. It is host scope,
                    not page scope.
```

The visible strip is DESIGN-scoped — REFERENCES, ASSETS, PAGES, SKINS and
HISTORY are sections *of* DESIGN. The hamburger sits left of the SITE 00 brand
in the host header, which is a different scope, so the two are not competing for
the same job. Option B makes it a duplicate by design and is redundant on this
layout because the strip already scrolls. Option C is a visual change.

```
HAMBURGER_ROLE          host-level drawer listing the project's modules
VISIBLE_NAV_RELATIONSHIP
                        disjoint. The drawer never lists a DESIGN section and
                        the strip never lists a module.
MOBILE_BEHAVIOR         identical at every width. One semantic role across
                        viewports, the same principle the view-mode row settled
                        in OPUS-VIEWMODE1R1.
CONTENTS                only modules that already have routes. The drawer
                        enumerates existing routes; it does not imply new ones.
COMPOSER_IMPACT         one drawer fed by the project registry. No new routes.
```

---

## FD-03 — PROJECT CREATIVE CONTEXT

```
FD-03_DECISION      OPTION B — a read-only drawer showing the pinned context
                    version and, when stale, what changed.
```

`DESIGN_AUTHORITY_CONTEXT_STALE` can block the lock. A founder blocked by
staleness with no way to see the staleness is stuck holding a disabled button.
Option A leaves them there. Option C points at
`/projects/:projectSlug/creative-direction`, a different surface with a
different meaning; conflating project creative *context* with creative
*direction* would make the stale gate unexplainable.

```
INTERACTIVE         YES
DESTINATION_TYPE    DRAWER (OV-CREATIVE-CONTEXT). No route.
DESTINATION         pinned projectCreativeContextVersion, the loaded context
                    package summary from loadProjectCreativeContextPackage,
                    and the version delta when the pinned version differs from
                    current
COMPOSER_IMPACT     one drawer over data the pipeline already loads. The
                    freshness dot keeps its current meaning.
```

---

## FD-04 — TARGET

```
FD-04_DECISION      OPTION A — readonly current-context display.
```

`active_design_target` says "clear active artifact/page/stage context" —
context, not navigation. Option B adds a picker for a job the PAGES nav section
already owns. Option C invents entry and page-role route families for three
lines of metadata. Turning contextual metadata into navigation is the specific
thing this sprint warned against.

```
TARGET_ROLE         READONLY_DATA — the workspace's statement of what it is
                    currently pointed at
INTERACTIVE         NO
DESTINATION         none. Target switching happens in the PAGES nav section,
                    which exists.
COMPOSER_IMPACT     DW-TGT-002/003/004 are not focusable, carry no role, and
                    appear nowhere in the route map.
```

---

## FD-09 — SOURCE

```
FD-09_DECISION      OPTION B — a provenance drawer, shared with the REVIEW
                    AUTHORITY panel from FD-06.
```

```
SOURCE_SEMANTICS    the originating campaign/archive record from which this
                    entry's grounding manifest was derived. It is entry lineage
                    — not an asset collection, not an external import.
                    ENTRY001-CAMPAIGN-ARCHIVE names the record that
                    groundingManifestId was built from.

INTERACTIVE         YES
DESTINATION         DRAWER (OV-PROVENANCE) — the source archive record and the
                    grounding manifest derived from it. The same drawer FD-06
                    opens, entered from the record instead of the rail.
COMPOSER_IMPACT     no new route. One drawer, two entry points. Option C's
                    campaign-archive route family is not created for one link.
```

---

## A — Authority persistence contract

Today: browser `localStorage`, key `site00:design-page-v3-authority:v1`. No
Supabase table, no endpoint. Defined here, not implemented here.

```
CANONICAL STORE     server. Project-scoped row keyed by (projectId, pageId),
                    holding the DesignWorkspaceAuthoritySession.
IDENTITY            authority ids stay as they are — vma-<viewport>-v<n>-<ts>
                    is already globally unique and carries its lineage.
VERSIONING          monotonic session version column for optimistic
                    concurrency; a write carrying a stale version is rejected
                    rather than merged. Authority versioning itself is
                    unchanged: masters already version and supersede.
HISTORY             append-only event log, one row per emitted event, using
                    the eleven-member union below. The log is the audit record;
                    the session row is a projection of it.
LOCAL CACHE         localStorage becomes an optimistic cache only. It is
                    invalidated when the server version differs, and when
                    buildRef differs — the rule recoverDesignPageAuthorityGallery
                    already applies. A cache may never be the authority for a
                    locked pair.
MIGRATION           first server read adopts the local session if the server
                    has none, then the server wins permanently.
```

---

## B — Spend guard contract

The defect is precise. The server guard is real: `twin-v3-design-page-authority`
and `twin-v3-mobile-twin-pipeline` both reject a request without
`founderConfirmedSpend`. But ten client call sites pass `founderConfirmedSpend:
true` unconditionally, so the flag asserts a confirmation that never happened.
The guard is satisfied, and it protects nothing.

The shape to reuse already exists in the native Opus runtime shipped in
`P0.VR.OPUS-NATIVE1`: estimate, explicit confirmation, ceiling, receipt.

```
ESTIMATE            before dispatch, the server returns an estimate with an id.
                    REFINE and REGENERATE both show cost before the founder
                    commits.
CONFIRMATION        founderConfirmedSpend must travel with spendConfirmationId,
                    which must match an estimate the founder was actually
                    shown. The server rejects a confirmation with no matching
                    estimate. Composer must never hardcode true.
REFINE              confirms inside OV-REFINE, beside the bounded input.
REGENERATE          confirms in a modal; it has no input surface of its own.
PER-RUN LIMIT       maxRunCostUsd, rejected before dispatch, not after.
PROJECT BUDGET      optional projectMonthlyBudgetUsd: warn at 80%, block at
                    100%. Absent today; defined so a cap has a name.
CANCEL              in-flight runs are cancellable; a cancelled run records
                    what was actually spent.
PROVIDER FAILURE    no cost recorded, run marked FAILED, the founder is not
                    charged for a provider 5xx.
RECEIPT             every run produces a cost receipt: runId, action, tokens or
                    provider units, estimatedUsd, actualUsd, projectId, pageId.
```

---

## C — Event taxonomy

The existing union has eight members and no way to record generation or the
build transition. Three members are added; the names are typed, not generic.

```
EXISTING            VIEWPORT_SELECTED · VIEWPORT_UNSELECTED ·
                    VIEWPORT_MASTER_PROMOTED · VIEWPORT_MASTER_SUPERSEDED ·
                    PAIR_LOCKED · PAIR_SUPERSEDED · DERIVATION_MARKED_STALE ·
                    FOUNDER_AUTHORITY_INJECTION

ADDED
  MOVED_TO_BUILD        { packageId, packageChecksum, pairId, pairChecksum,
                          readinessReceiptId, movedBy, movedAt }
  CANDIDATE_REFINED     { candidateId, parentCandidateId, viewport, notes,
                          runId, spendConfirmationId, costUsd, refinedBy,
                          refinedAt }
  CANDIDATE_REGENERATED { candidateId, siblingOfCandidateId, viewport, runId,
                          spendConfirmationId, costUsd, regeneratedBy,
                          regeneratedAt }
```

Refine descends from a parent; regenerate produces a sibling. The payloads
carry that distinction so lineage is queryable without re-deriving it.

---

## What remains a founder decision

Nothing on the FD-01…FD-09 list. Three items are now *policy* choices that the
founder may set when reviewing this document, none of which block Composer:

| open policy | default written into the contract |
|---|---|
| should founder approval ever auto-trigger Composer | NO — unchanged |
| project monthly budget cap | none set; mechanism defined |
| may non-founders see mutating controls | yes, disabled with reason |
