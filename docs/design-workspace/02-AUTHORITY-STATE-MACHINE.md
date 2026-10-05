# Section 09 — Authority State Machine

The authority workflow is the only part of this page that already exists as
working product code. This document does not design it; it records it, so
Composer wires the reconstruction to the real pipeline instead of building a
second one.

**Implementation:** `shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceAuthorityPipeline.ts`
**Types:** `designWorkspaceAuthorityTypes.ts`
**Persistence:** browser `localStorage`, key `site00:design-page-v3-authority:v1`.
There is no Supabase table and no API endpoint for the authority pair. Every
"SERVER WRITE" below is therefore `none — local session write` today, and that is
a real constraint, not an omission in this contract.

## The states that exist

Only these. Composer must not introduce others.

**Pair** — `DesignWorkspaceAuthorityPairStatus`

```
DRAFT · MOBILE_ONLY · DESKTOP_ONLY · PAIR_READY · PAIR_LOCKED
DERIVATION_READY · … · SUPERSEDED
```

**Master** — `ViewportMasterAuthorityStatus`

```
PROMOTED · PAIR_LOCKED · SUPERSEDED
```

**Candidate, per viewport** — `ConceptCandidateAuthorityState`

```
GENERATED · NOT_SELECTED · SELECTED · PROMOTED · SUPERSEDED · REJECTED
```

The sprint's speculative list included `UNSELECTED`, `UNDER_REVIEW`, `APPROVED`
and `REPLACE_PENDING`. **None of these exist** and none are adopted:

- `UNSELECTED` → the real name is `NOT_SELECTED`.
- `UNDER_REVIEW` → pair review is a UI disclosure, not a stored state. The pair
  stays `PAIR_READY` throughout review.
- `APPROVED` → approval is expressed by `PAIR_LOCKED` plus the `founderReview`
  flags the lock sets. There is no separate approved state.
- `REPLACE_PENDING` → replacement is immediate, not staged. See REPLACE below.

## Happy path

```
candidate GENERATED
      │  DW-AUTH-001 / 003   selectViewportCandidate
      ▼
candidate SELECTED (for that viewport)        pair DRAFT
      │  DW-AUTH-014 / 015   promoteViewportMaster
      ▼
master PROMOTED v1                            pair MOBILE_ONLY or DESKTOP_ONLY
      │  repeat for the other viewport
      ▼
both masters PROMOTED                         pair PAIR_READY   ← the golden's state
      │  DW-AUTH-016   pair review (disclosure, no state change)
      │  DW-AUTH-018   lockDesignWorkspaceAuthorityPair
      ▼
masters PAIR_LOCKED, immutableAfterPairLock   pair PAIR_LOCKED
executionIntent TRANSLATION, inventionBudget NONE, derivationStatus READY
      │  DW-PIPE-022   move to build (BUILD-scope gates — currently always blocked)
      ▼
derivation / build
```

---

## SELECT FOR MOBILE — `DW-AUTH-001`

```
FEATURE          select_mobile_master_candidate
                 "SELECT FOR MOBILE — reversible, not promotion"
FUNCTION         selectViewportCandidate(session, 'MOBILE', ref)

PRECONDITION     a candidate is selected in the gallery (supplies ref)
                 candidate exists in the gallery      else CANDIDATE_NOT_FOUND
                 pair is not PAIR_LOCKED              else DESIGN_AUTHORITY_PAIR_LOCKED

WHAT BECOMES SELECTED
                 the gallery candidate currently in focus, bound to the MOBILE
                 slot only. The same candidate can independently hold the
                 DESKTOP slot; the two slots are tracked separately in
                 candidateViewportStates[candidateId] = { mobile, desktop }.

STATE MUTATION   viewportSelection.mobile = ref
                 any other candidate holding mobile: SELECTED → NOT_SELECTED
                 this candidate mobile: SELECTED (or stays PROMOTED)
                 pair status re-synced by syncPairStatus

REPLACES         a previous mobile SELECTION, silently and reversibly.
                 It does NOT replace a promoted mobile MASTER — promotion is a
                 separate step and an existing master is untouched until
                 DW-AUTH-014 runs.
CONFIRMATION     none. The manifest calls it reversible; a confirm dialog on a
                 reversible act trains the founder to dismiss dialogs.
PERSISTED        yes — localStorage session
SERVER WRITE     none
SUCCESS          DW-AUTH-002 renders SELECTED; the gallery tick moves
ERROR            CANDIDATE_NOT_FOUND → "Candidate no longer in this gallery"
                 DESIGN_AUTHORITY_PAIR_LOCKED → control is disabled before this
                 can be reached; if it is reached, surface "Authority pair is
                 locked"
UNDO             unselectViewportCandidate, same guards
AUDIT EVENT      VIEWPORT_SELECTED
DOWNSTREAM       enables PROMOTE MOBILE. Does not change readiness, does not
                 change the pair status beyond DRAFT/*_ONLY bookkeeping.
NEXT ACTIONS     promote mobile · select a different candidate · unselect
```

## SELECT FOR DESKTOP — `DW-AUTH-003`

Identical in every respect with `viewport = 'DESKTOP'`, feature
`select_desktop_master_candidate`, slot `viewportSelection.desktop`, and
`DESIGN_AUTHORITY_DESKTOP_MISSING` as the corresponding promote-time error.

---

## PROMOTE MOBILE / DESKTOP — `DW-AUTH-014` / `DW-AUTH-015`

```
FEATURE          promote_mobile_viewport_master / promote_desktop_viewport_master
FUNCTION         promoteViewportMaster(session, viewport, promotedBy = 'founder')

MEANING          candidate → viewport MASTER.
                 This is the answer to the sprint's question. Promotion takes a
                 SELECTED CANDIDATE and makes it the master for one viewport. It
                 does not move a master into the pair — the pair is formed
                 automatically once both masters exist. Two promotions build the
                 pair; there is no third "promote to pair" step, which is why
                 the golden's next-action copy "PROMOTE MOBILE MASTER TO
                 AUTHORITY PAIR" describes the consequence, not a distinct verb.

PRECONDITION     viewportSelection[viewport] exists
                                        else DESIGN_AUTHORITY_MOBILE_MISSING /
                                             DESIGN_AUTHORITY_DESKTOP_MISSING
                 candidate still in gallery          else CANDIDATE_NOT_FOUND
                 artifact viewport matches slot      else VIEWPORT_SLOT_MISMATCH
                 feature coverage receipt passes     assertFeatureCoverageForPromotion
                 existing master not feature-stale   assertMasterNotFeatureStale

STATE MUTATION   creates ViewportMasterAuthority:
                   id vma-<viewport>-v<n>-<ts>, status PROMOTED,
                   version = previous + 1 (or 1),
                   authorityImageHash = computeAuthorityImageHash(artifact),
                   projectCreativeContextVersion, featureManifestVersion,
                   groundingManifestId, supersedesAuthorityId,
                   immutableAfterPairLock = false
                 any previous master → supersededMasters with status SUPERSEDED
                 if a derivation was IN_PROGRESS or COMPLETE → derivationStatus
                   becomes STALE
                 when both masters exist → draft pair at PAIR_READY

CONFIRMATION     YES. This is an approval action with a supersede side effect.
                 The live product already shows a confirm modal
                 ("PROMOTE MOBILE MASTER").
PERSISTED        yes          SERVER WRITE  none
SUCCESS          master slot fills; pair status advances; next action re-derives
ERROR            each precondition above maps to its named error, surfaced
                 verbatim as a code plus a plain sentence
UNDO             none. Promotion is forward-only; recovery is REPLACE, which
                 supersedes rather than reverses.
AUDIT EVENTS     VIEWPORT_MASTER_PROMOTED
                 VIEWPORT_MASTER_SUPERSEDED (when replacing)
                 DERIVATION_MARKED_STALE (when a derivation existed)
NEXT ACTIONS     promote the other viewport · replace this master · pair review
                 and lock once both are promoted
```

---

## REPLACE — `DW-AUTH-013`

```
FEATURE          replace_viewport_master
                 "Replace selection/master with lineage preserved"
FUNCTION         beginViewportMasterReplacement(session, viewport)

WHAT IS REPLACED the promoted MASTER for one viewport — the row the button sits
                 on. In the golden that is the DESKTOP master, because mobile is
                 the one already carrying SELECTED.

IMMEDIATE OR STAGED
                 IMMEDIATE. The function clears the master slot at once, moves
                 the prior master into supersededMasters, and nulls the
                 authorityPair. There is no REPLACE_PENDING state, so Composer
                 must not build a staged one.

RETURNS TO GALLERY
                 NO navigation. Replacement empties the slot and the workspace
                 stays where it is; the founder then selects and promotes again
                 through the normal controls. A forced jump to the gallery would
                 be a navigation the pipeline does not perform.

PRECONDITION     pair is not PAIR_LOCKED   else DESIGN_AUTHORITY_PAIR_LOCKED
STATE MUTATION   master slot → null
                 prior master → supersededMasters, status SUPERSEDED
                 authorityPair → null (the pair cannot survive losing a half)
CONFIRMATION     YES — destructive. The live product confirms with
                 "CLEAR & REPLACE".
HISTORY RETAINED YES, and this is the point of the feature description. The
                 superseded master keeps its id, version, hash and
                 supersedesAuthorityId chain, so lineage is queryable after
                 replacement.
PERSISTED        yes          SERVER WRITE  none
SUCCESS          slot renders empty; pair returns to *_ONLY or DRAFT
ERROR            DESIGN_AUTHORITY_PAIR_LOCKED
UNDO             none directly; the superseded master can be re-promoted from
                 its source candidate, which creates a new version rather than
                 restoring the old one
AUDIT EVENT      VIEWPORT_MASTER_SUPERSEDED
NEXT ACTIONS     select a candidate for that viewport, then promote
```

---

## PAIR REVIEW — `DW-AUTH-016`

```
FEATURE          review_authority_pair
                 "Visual pair review when both promoted"

TREATMENT        INLINE DISCLOSURE inside the workspace. Not a modal, not a
                 drawer, not a route.
                 Evidence: the live product renders a section with testid
                 site00-dw-v3-authority-pair-review in place when both masters
                 are promoted, showing the two masters side by side with REPLACE
                 (while unlocked) and the LOCK call to action. No route exists.

PRECONDITION     both masters PROMOTED. Before that the control is disabled —
                 the feature description says "when both promoted".
STATE MUTATION   UI only: pairReviewOpen. No pipeline mutation, no pair status
                 change. Reviewing is looking, not deciding.
PERSISTED        no           SERVER WRITE  none
AUDIT EVENT      none. There is no AUTHORITY_REVIEW_STARTED event type in
                 AuthorityPipelineEventType, and this contract does not invent
                 one.
NEXT ACTIONS     lock the pair · replace either master
```

## REVIEW AUTHORITY — `DW-AUTH-017`

**Flagged as semantically redundant, exactly as the sprint asked.**

One feature (`review_authority_pair`) claims both strings in
`featurePromptMarkers.ts`: `['PAIR REVIEW', 'REVIEW AUTHORITY']`. The repository
contains no handler, route, panel or state named REVIEW AUTHORITY. The live
product ships one review surface.

Composer must not implement this button on a guess. → FD-06.

---

## LOCK MOBILE + DESKTOP AUTHORITY PAIR — `DW-AUTH-018`

```
FEATURE          lock_authority_pair
                 "LOCK MOBILE + DESKTOP — no silent auto-lock"
FUNCTION         lockDesignWorkspaceAuthorityPair(session, lockedBy = 'founder')

PRECONDITION     runDesignAuthorityPairReadinessGate(session, { requireLocked:
                 false }).pass must be true. Its failures are:
                   DESIGN_AUTHORITY_MOBILE_MISSING
                   DESIGN_AUTHORITY_DESKTOP_MISSING
                   DESIGN_AUTHORITY_HASH_MISMATCH
                   DESIGN_AUTHORITY_CONTEXT_STALE
                   DESIGN_AUTHORITY_FEATURE_STALE
                   DESIGN_AUTHORITY_ASSET_RECORD_MISSING
                   DESIGN_AUTHORITY_DERIVATION_STALE
                   DESIGN_AUTHORITY_PAIR_NOT_READY
                 The control is disabled while any of these hold, and the
                 blocking reason is shown rather than a generic disabled state.

NO SILENT AUTO-LOCK
                 The manifest forbids the system locking on the founder's
                 behalf. Locking is only ever this explicit control.
CONFIRMATION     YES, and this is the strongest confirmation on the page. It
                 must state what becomes immutable, because there is no undo.

STATE MUTATION   pair → PAIR_LOCKED, lockedAt, lockedBy,
                        pairChecksum = computePairChecksum(mobile, desktop,
                        pairVersion), derivationStatus READY
                 both masters → PAIR_LOCKED, immutableAfterPairLock = true
                 pipeline executionIntent → TRANSLATION
                 pipeline inventionBudget → NONE
                 founderReview → mobileApproved + desktopApproved true,
                        mobile/desktop lock ids set, lastAction APPROVE

WHAT BECOMES IMMUTABLE
                 both master authorities. Downstream work switches from
                 interpretation to translation: inventionBudget NONE means no
                 further creative latitude is permitted against this pair.

ACTIONS DISABLED BY THE LOCK
                 selectViewportCandidate · unselectViewportCandidate ·
                 beginViewportMasterReplacement · promoteViewportMaster —
                 all throw DESIGN_AUTHORITY_PAIR_LOCKED.
                 Also disabled by consequence: DW-AUTH-001, 003, 013, 014, 015,
                 and the generation actions DW-CAND-001 / 002 against this pair.
                 Still available: every inspection surface, the view mode
                 control, viewport selection, gallery browsing, history.

UNLOCKING        DOES NOT EXIST. There is no unlockDesignWorkspaceAuthorityPair,
                 no PAIR_UNLOCKED status, and PAIR_SUPERSEDED is declared but
                 never emitted. The only forward path from a locked pair is
                 superseding it with a new pair version.
                 This makes the golden's "PAIR: UNLOCKED" label a state
                 description, never a control, and it makes the lock
                 confirmation genuinely final.
                 Whether an unlock path should exist is FD-06's neighbour and is
                 recorded as part of the permissions decision.

PERSISTED        yes          SERVER WRITE  none
SUCCESS          pair renders PAIR_LOCKED; masters show immutable; next action
                 advances to move-to-build (which remains gate-blocked)
ERROR            gate.errors[0] surfaced with its plain-language reason
AUDIT EVENT      PAIR_LOCKED
HISTORY          the lock is the auditable moment of the whole workflow
NEXT ACTIONS     move to build (when BUILD gates pass) · derivation
```

---

## Guard summary

Every authority mutation shares one guard. Composer should implement it once.

| Action | Blocked while `PAIR_LOCKED` | Confirmation | Audit event |
|---|---|---|---|
| Select for viewport | yes | no | `VIEWPORT_SELECTED` |
| Unselect viewport | yes | no | `VIEWPORT_UNSELECTED` |
| Promote master | yes | yes | `VIEWPORT_MASTER_PROMOTED` (+ `VIEWPORT_MASTER_SUPERSEDED`, `DERIVATION_MARKED_STALE`) |
| Replace master | yes | yes | `VIEWPORT_MASTER_SUPERSEDED` |
| Pair review | no (read-only) | no | none |
| Lock pair | n/a (already locked) | yes | `PAIR_LOCKED` |

The complete event union is `VIEWPORT_SELECTED`, `VIEWPORT_UNSELECTED`,
`VIEWPORT_MASTER_PROMOTED`, `VIEWPORT_MASTER_SUPERSEDED`, `PAIR_LOCKED`,
`PAIR_SUPERSEDED`, `DERIVATION_MARKED_STALE`, `FOUNDER_AUTHORITY_INJECTION`.
Composer must use these names and add none.
