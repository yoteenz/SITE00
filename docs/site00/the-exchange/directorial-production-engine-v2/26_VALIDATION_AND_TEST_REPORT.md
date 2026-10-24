# 26 — Validation and test report

**Run:** Saturday 24 October 2026, about 11:10–11:30 a.m. CDT, on branch `cursor/the-exchange-directorial-production-engine-8aec`.

**Result:** every Exchange suite passes (82 tests in 12 files). The full repository suite shows the same 74 failures it had before this sprint; none is in an Exchange file and none imports Exchange code. The production build passes. No generation workflow was run, so nothing here is an end-to-end production pass.

## Commands and results

| Check | Command | Result |
| --- | --- | --- |
| Exchange suites | `npx vitest run $(ls tests \| grep -i exchange \| sed 's#^#tests/#')` | 12 files, 82 tests, all pass |
| Full suite | `npx vitest run --reporter=json` | 11,386 tests: 11,310 pass, 74 fail, 2 skipped, in 56 failing files. Same 74 failures as the PR #1690 baseline. The failing files are visual reconstruction, NDX UI, JURNL, live capture and loader suites; `grep` finds no Exchange import in any of them. |
| Scoped typecheck | `npx tsc -p <config over the fiction modules and scripts/the-exchange> --noEmit` | One error, pre-existing and outside this sprint: `api/_lib/site00FictionCanon/founderPackage/ingestFounderPackage.ts(113,11) TS6133` |
| Production build | `npm run build` | Pass; `verify-production-dist: OK (470 JS assets checked)` |
| Season build | `npx tsx scripts/the-exchange/build-season1-production.ts` | Pass. Continuity: 0 hard conflicts, 1 warning, 7 open questions, 15 checks |
| Directorial build | `npx tsx scripts/the-exchange/build-directorial-production.ts` | Pass. `S1-01: 19 shots, 0 errors, 0 warnings, 3 advisories, 3400 credits estimated` |
| Docs render | `npx tsx scripts/the-exchange/render-directorial-docs.ts` | Pass; 24 generated deliverables |
| Idempotency | All three scripts run again on a clean tree | `git status` stays clean |

The full suite writes three unrelated tracked files as a side effect (two JURNL ledgers and one NDX storyboard image). They were restored with `git checkout --` and are not part of this branch.

## S1-01 packet validation

0 errors, 0 warnings, 3 advisories. Each advisory has its reason on record:

| Advisory | Reason |
| --- | --- |
| SH14 motion band | 1.75 s is under the low-motion guide (2 s or more): "long enough to read the copper bloom, short enough that the silence continues on his reaction." |
| SH19 motion band | 1.5 s is under the same guide: the black tail is editorial only, with no generation, so the band does not apply. |
| `SET-CITY-DUSK` spatial | The spatial authority is provisional until the founder approves the environment reference (see FD-S101-08). |

## Section 30 coverage

| Requirement | Suite › test |
| --- | --- |
| Complete season indexing; 86-release preservation | SeasonSceneIndex › preserves all 86 releases, canonical order and the 127:40 runtime; Season1Master › 86-release master integrity, adds no releases against BASELINE V1 |
| Scene indexing | SeasonSceneIndex › answers every writing-brief question for every release without inventing canon |
| Scene dependency tracking | SeasonSceneIndex › builds a temporally valid graph; tracks future needs silently |
| Dialogue-to-scene linkage | SeasonSceneIndex › links every dialogue line to exactly one scene |
| Second-by-second timeline; no unintended gaps | DirectorialTimeline › tiles the release frame by frame with no gap; flags gaps, runtime drift, overlaps and misplaced overlays |
| Audio/video sync; overlapping tracks | DirectorialTimeline › keeps picture, music and sound in sync at the planned frames; flags overlaps |
| Shot duration reconciliation | DirectorialTimeline › reconciles shot durations with the screenplay, scene by scene |
| Motion-weighted classification | DirectorialTimeline › classifies motion and keeps exceptions on record |
| Dialogue coverage; visible-speaker lip-sync; cutaway audio | DirectorialTimeline › puts lip-sync only on a visible speaking mouth and keeps a line whole across cutaways (a synthetic line in a copy of the plan, because S1-01 is wordless) |
| Character asset lookup | CastRegistry › reads owner fields through from their registries; reconciles visual references without inventing assets |
| Keyframe provenance | DirectorialTimeline › traces keyframe provenance and inherited blockers |
| Spatial consistency; prop state transitions | DirectorialTimeline › holds geography, characters and props across cuts |
| Music cue timing; licensing; sound-effect timing | DirectorialTimeline › treats silence as a decision and tracks music rights and sound restraint |
| Cost estimation | ScenePacketProduction › estimates cost from recorded quotes and marks anything unquoted UNKNOWN |
| Generation authorization | ScenePacketProduction › gates every paid job behind founder steps, an approved target, a known price within budget and an executable route |
| Founder partial approvals | ScenePacketProduction › keeps partial approvals when a change request touches one element |
| Reuse of approved assets | ScenePacketProduction › reuses approved assets only and keeps the saved review state across rebuilds |
| No unnecessary future-cast generation | SeasonSceneIndex › develops only the cast the active scene needs; ScenePacketProduction › surfaces creative choices (scene-scoped inhabitants get no permanent package) |
| Scene progression | ScenePacketProduction › keeps exactly one unit in founder review and advances only on founder action; SeasonSceneIndex › refuses to show unreviewed material as approved |
| Final export manifests | ScenePacketProduction › commits scene outputs that match the plan; exports every sprint field; DirectorialDocs › all three tests |

Additional guards added this sprint: the voice evidence rules (CastRegistry › links the three founder voices as connector-derived evidence; rejects fabricated hashes, phantom files and invented approvals) and the label rule (ScenePacketProduction › does not label draft-screenplay sound and music as source-established).

## Machine validation is not creative approval

Section 30 asks that a technically valid timeline must not hide weak direction. The engine cannot judge taste, so it does two things instead:

- Every significant creative choice carries a label and a source. A test fails if a founder-approval item has no matching founder decision, or if a draft-screenplay cue is labelled source-established.
- The founder review (`00_FOUNDER_REVIEW_S1-01_DUSK.md`) puts the treatment, timeline, music and 11 open decisions in front of the founder. All 65 review elements are `PENDING`, and nothing advances without a founder action.

## What was not verified

- No image, video, voice, music, lip-sync or assembly job was run. Credits spent: 0.
- The ElevenLabs voices were not verified by this environment; there is no ElevenLabs credential here.
- `kling-4-omni` is not available through the OpenArt connection used here, so it was not priced or tested.
- Assembly (budget line B-09) and a commissioned score have no recorded price and stay UNKNOWN.
