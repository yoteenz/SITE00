# 11 — Founder review and approval workflow

**Code:** `shared/site00-fiction-production/approvals.ts`. **State:** `THE_EXCHANGE/SEASON_1/APPROVAL_STATE_V1.json`.

## Nine separate approvals

| Domain | Subject | Must be approved first |
| --- | --- | --- |
| STORY STRUCTURE | each release | — |
| SCREENPLAY | each release | STORY STRUCTURE |
| CHARACTER VISUAL IDENTITY | each character | — |
| CHARACTER VOICE | each character | — |
| SET | each set | — |
| WARDROBE | each look | — |
| SHOT PLAN | each release | SCREENPLAY |
| GENERATED VIDEO | each release | SHOT PLAN, CHARACTER VISUAL IDENTITY, CHARACTER VOICE, SET, WARDROBE |
| FINAL EDIT | each release | GENERATED VIDEO |

Approving one domain never approves another. A screenplay approval does not approve its shot plan, and a shot plan approval does not start generation: each paid stage still needs a founder spend authorization (see `08_SCREENPLAY_TO_SCREEN_PIPELINE.md`).

## States and transitions

```
NOT_SUBMITTED → DRAFT → IN_REVIEW → APPROVED → SUPERSEDED
                          │
                          ├→ CHANGES_REQUESTED → DRAFT
                          └→ REJECTED → DRAFT
DRAFT, CHANGES_REQUESTED, REJECTED → SUPERSEDED
```

- Only the founder (`actor: "founder"`) can move a record to APPROVED, CHANGES_REQUESTED or REJECTED. Any other actor raises `ApprovalError`.
- APPROVED is refused while a prerequisite domain has no record or any non-approved record.
- Any other transition (for example DRAFT straight to APPROVED) is refused.
- `revise()` supersedes the current version and opens version n + 1 at DRAFT. It is refused from IN_REVIEW, NOT_SUBMITTED and SUPERSEDED.
- Every transition is appended to the record's history with actor, time and note.
- Mapping to the existing fiction-canon status (`FictionApprovalStatus`): APPROVED → `FOUNDER_APPROVED`, REJECTED → `FOUNDER_REJECTED`, DRAFT / IN_REVIEW / CHANGES_REQUESTED → `PENDING_REVIEW`, others → `DEFERRED`.

## Current approval state

| Domain | State | Count | Basis |
| --- | --- | --- | --- |
| STORY STRUCTURE | APPROVED (founder, 2026-10-23) | 86 | S-2 Option A |
| SCREENPLAY | DRAFT | 5 | S1-01 to S1-05, `DRAFT — FOUNDER REVIEW REQUIRED` |
| SCREENPLAY | NOT_SUBMITTED | 81 | Gated on the first batch |
| SHOT PLAN | DRAFT / NOT_SUBMITTED | 5 / 81 | Draft shot lists for S1-01 to S1-05 only |
| CHARACTER VISUAL IDENTITY | APPROVED | 2 | Sloane and Gideon: `FACIAL_IDENTITY_LOCKED` in the visual registry (no approval timestamp recorded there) |
| CHARACTER VISUAL IDENTITY | IN_REVIEW | 3 | Nadine, Richard, Vivienne: founder refinement, provisional |
| CHARACTER VISUAL IDENTITY | NOT_SUBMITTED | 2 | Kai, Royce: no face asset |
| CHARACTER VOICE | NOT_SUBMITTED | 8 | No verified voice for any character |
| SET | NOT_SUBMITTED | 14 | No approved reference images |
| WARDROBE | NOT_SUBMITTED | 6 | Design required (U-4, U-6) |
| GENERATED VIDEO / FINAL EDIT | NOT_SUBMITTED | 86 / 86 | Nothing generated or assembled |

The build script keeps any record the founder has moved past DRAFT, so regenerating data never erases a decision.

## How a founder decision is recorded

1. The founder states the decision (for example: "S1-03 screenplay approved", or "S1-04 changes requested: …").
2. An agent applies it with `transition()` using `actor: "founder"` and the founder's note, then reruns `npx tsx scripts/the-exchange/build-season1-production.ts`.
3. The pipeline state updates from the new record. Downstream domains stay where they were.

No agent records a founder decision the founder has not made.

## What the founder reviews now

| Item | Where | Decision requested |
| --- | --- | --- |
| Screenplays S1-01 to S1-05 | `12_SCREENPLAY_BATCH_S1-01_TO_S1-05.md` | Approve, request changes or reject each. Acceptance of the batch also accepts the format and conventions (`05`) and opens S1-06 onward. |
| Shot plans S1-01 to S1-05 | `13_SCREENPLAY_BATCH_SHOT_LISTS.md` | Only after the matching screenplay is approved |
| FC-01 | Ember backstory (FD-05) | Confirm or keep open |
| FC-02 | NR-8 and NR-9 placements in S1-43 and S1-81 | Confirm placements |
| FC-03 | FD-07, FD-12 (led at 23), FD-15 (joined at 27) | Rule or keep open |
| S1-04 Gideon lines | Continuity warning: Gideon is named in the master's S1-04 ending but not in its featured list | Accept the lines or cut them |
| Minor voices | PRODUCER and PIANIST in S1-04 have no registry entry | Accept as one-scene voices or register them |

## Reused infrastructure

- `FictionApprovalStatus` from `shared/site00-fiction-canon/types.ts` (status mapping).
- `BlockedReason` values `UNAUTHORIZED_SPEND` and `SILENT_FALLBACK_ATTEMPT` from `shared/site00-production-guardrails/types.ts` (dispatch decisions).
- Facial identity from `THE_EXCHANGE/MANIFEST/CHARACTER_VISUAL_REGISTRY_V1.json`, read only.
- Topics added to `THE_EXCHANGE/MANIFEST/CANON_APPROVAL_MATRIX_V1.json` without removing or changing existing ones.
