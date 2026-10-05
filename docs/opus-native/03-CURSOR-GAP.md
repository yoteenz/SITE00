# NativeOpusVsCursorGap

Phase 24 of `P0.VR.OPUS-NATIVE1`. Live data: `GET /api/site00/opus-native?action=gap`.
Source of truth: `api/_lib/site00OpusNative/cursorGap.ts`.

**Summary: 8 BETTER_NATIVE · 4 PARITY · 4 MISSING_NATIVE · CURSOR_EXIT_READY: PARTIAL**

Three capabilities block Cursor exit: **editing**, **git**, **session continuity**.

## The table

| Capability | Status | Blocks exit |
|---|---|:--:|
| context | BETTER_NATIVE | |
| prompt caching | BETTER_NATIVE | |
| repo inspection | PARITY | |
| editing | MISSING_NATIVE | ● |
| browser render | PARITY | |
| screenshots | PARITY | |
| visual comparison | BETTER_NATIVE | |
| golden reference | BETTER_NATIVE | |
| testing | PARITY | |
| iteration | BETTER_NATIVE | |
| cost accounting | BETTER_NATIVE | |
| git | MISSING_NATIVE | ● |
| revert | BETTER_NATIVE | |
| founder review | BETTER_NATIVE | |
| multi-file reasoning | MISSING_NATIVE | |
| session continuity | MISSING_NATIVE | ● |

## Where native already wins

**Context.** Cursor rediscovers which component, stylesheet, state hook and
golden belong to a route by searching the repository on every run. SITE 00
already knows, so it is declared in the surface registry and compiled directly.
This is the structural advantage the whole runtime is built on.

**Golden reference.** Registered per surface with an id, version, content hash,
measured dimensions and approval state. This removes the failure mode where a
run works from a stale or wrong reference — which is not hypothetical; the
first Opus sprint began by hunting for the golden because it was not attached.

**Cost.** Cursor gives no per-run cost at all; it is a subscription line. Every
native run produces a receipt with tokens, the cache split, USD, and roll-ups
for cost per page, per refinement and per project. This is the reason the
sprint exists.

**Iteration and revert.** Ceilings are checked before every dispatch rather
than noticed on a bill. Revert restores exact pre-run bytes, which is stronger
than `git checkout` because it does not require the work to have been committed
or stashed first.

**Founder review.** Cursor produces a prose summary and the founder reads a
diff elsewhere. Native produces a structured package — patch, before and after
renders, typecheck, tests, cost — behind a gate the agent structurally cannot
open itself.

## What still requires Cursor

**Editing (blocker).** Native does surgical find/replace against a per-surface
write allowlist. It cannot create files, delete them, or scaffold a new
component. That is sufficient for refinement, which is the target workflow, but
a reconstruction sprint that adds components still needs Cursor.

**Git (blocker, and deliberate).** The runtime issues no git command. Approval
leaves the patch in the working tree for a human to commit. This is currently
the last structural guarantee that an approved-looking run cannot reach `main`
on its own, so closing it means replacing that guarantee with something else —
most likely a branch-scoped commit path that still cannot touch `main`.

**Session continuity (blocker).** A run is single-shot. `request_changes`
records the founder's note and ends the run; a follow-up starts fresh with
newly compiled context. Threading a review note into a continuation run — so
the founder can say "closer, but the divider is now too dark" and have the
agent resume with its own prior work in context — is the next piece of work,
and the cheapest of the three to build.

**Multi-file reasoning (not a blocker).** Large cross-cutting refactors are out
of scope for design refinement.

## What has to be true before Cursor leaves routine Opus design work

1. `ANTHROPIC_API_KEY` configured, and a live Opus 5 run completed end to end.
2. Session continuity, so a review note can drive a second pass.
3. File creation within the write boundary, so component-level work is possible.
4. A commit path that can reach a branch but never `main`.
5. A real design task completed natively and approved — not a proof task.

Items 2 and 4 are self-contained. Item 3 needs the write allowlist to gain a
directory-scoped form. Item 5 is the actual bar, and nothing before it counts.
