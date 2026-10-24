# 27 — Completion report

**Implemented** means code, committed data and tests. **Not verified** means no provider job was run. Nothing here is an end-to-end production pass: no image, video, voice, music, lip-sync or assembly workflow was run, by authorization ("no credit-consuming generation without approved job costs").

| Field | Value |
| --- | --- |
| SPRINT ID | `P0.THE-EXCHANGE.COMPOSER.CAST-VOICE-SYNC-AND-DIRECTORIAL-PRODUCTION-ENGINE.V2` |
| STATUS | COMPLETE FOR THE PLANNING SCOPE. Engine implemented and tested; S1-01 fully directed and in founder review; no generation run. |
| REPOSITORY | `yoteenz/SITE00` |
| BRANCH | `cursor/the-exchange-directorial-production-engine-8aec`, stacked on `cursor/the-exchange-canon-lock-screenplay-8aec` (PR #1690 at `3466534f0`) |
| COMMIT SHA | The head of PR #1692. A report cannot name the commit that contains it; the session close records the final SHA. |
| PR NUMBER | [#1692](https://github.com/yoteenz/SITE00/pull/1692), based on PR #1690's branch. Neither is merged by this sprint. |
| BUILD STATUS | PASS: `npm run build` (`verify-production-dist: OK`). Season, directorial and docs builds pass and are idempotent. |
| TEST STATUS | Exchange: 82 of 82 tests in 12 files pass. Full suite: 11,310 pass, 74 fail, 2 skipped; the 74 failures predate this sprint and none touches Exchange code (deliverable 26). |
| SEASON MASTER STATUS | PRESERVED. 86 releases, 127:40, story structure approved, file unchanged. |
| SCREENPLAY DEVELOPMENT STATUS | PLANNED. 5 screenplays drafted (all DRAFT; S1-01 is now v2, with v1 kept). 81 releases have writing briefs from the master, in 18 batches. No new screenplay was written beyond S1-01 v2. |
| SEASON SCENE INDEX STATUS | IMPLEMENTED. 86 releases, 110 scenes, dependency graph. Continuity: 0 hard conflicts, 1 warning, 7 open questions. |
| DIRECTORIAL BIBLE STATUS | WRITTEN, PROVISIONAL — FOUNDER REVIEW REQUIRED. 14 sections; every item labelled and cited; 8 decisions for the founder. |
| CAST REGISTRY STATUS | IMPLEMENTED. 9 characters as a view over the owner registries, with an append-only edit log. 12 blocker findings, all founder-held files not yet imported: Kai's ten close-up angles and full-body identity, and Sloane's wardrobe references. |
| ELEVENLABS VOICE VERIFICATION STATUS | CONNECTOR_VERIFIED, not independently verified. Sloane, Gideon and Kai's voice ids come from the founder's ChatGPT ElevenLabs connector check on 2026-10-24. There is no ElevenLabs credential here. The voices were not recreated, no take is approved, and registry edits do not change ElevenLabs. |
| ASSET REGISTRY STATUS | RECONCILED. 4 approved asset ids can be reused. Founder-held files are listed as UNIMPORTED. No URL, hash or generation id was invented, and tests reject fabricated ones. |
| DIRECTORIAL ENGINE STATUS | IMPLEMENTED AND TESTED. It validates and derives everything from a directed plan. It does not write directed scenes by itself: S1-01's plan was written by hand and checked by the engine. |
| SHOT PLANNER STATUS | IMPLEMENTED. Motion-weighted, one primary action per risky shot, advisories carry reasons. The auto-planner stays for the S1-02 to S1-05 drafts. |
| TIMELINE ENGINE STATUS | IMPLEMENTED. 24 fps, frames authoritative, eight tracks, gap, overlap and drift detection. |
| CAMERA SYSTEM STATUS | IMPLEMENTED as schema and per-shot fields (38 fields and 6 "why" answers per shot). Not verified against generated footage. |
| KEYFRAME SYSTEM STATUS | IMPLEMENTED. Provenance and inherited blockers. 0 keyframes generated. |
| MUSIC SYSTEM STATUS | IMPLEMENTED. Every cue has rights and route; all S1-01 cues are NOT_CLEARED and the route is undecided (FD-S101-02). No music composed. |
| SOUND DESIGN STATUS | IMPLEMENTED. Ambience, foley and effects with sync points; accessibility subtitles. No audio produced. |
| EDITORIAL SYSTEM STATUS | IMPLEMENTED FOR PLANNING. Head-of-shot transitions, J and L cut detection, continuous dialogue, cue sheet. No edit assembled; assembly (B-09) is unpriced. |
| PROVIDER ROUTING STATUS | IMPLEMENTED. OpenArt and fal quotes recorded read-only; ElevenLabs BLOCKED_NO_CREDENTIALS here; `kling-4-omni` not offered through the OpenArt connection. No job dispatched. |
| COST SYSTEM STATUS | IMPLEMENTED. Quotes only; unquoted lines are UNKNOWN; retake risk; pre-spend gate. Spent: 0. |
| S1-01 STATUS | DIRECTED, IN FOUNDER REVIEW. The one active unit; 85 releases queued. |
| SCREENPLAY REVIEW STATUS | v2, DRAFT — FOUNDER REVIEW REQUIRED (FD-S101-01). |
| DIRECTORIAL PACKET STATUS | COMPLETE, all ten sections. 0 errors, 0 warnings, 3 advisories. 65 review elements, all PENDING. |
| SHOT COUNT | 19: 18 generated shots and 1 editorial black tail. |
| TIMELINE VALIDATION | PASS. 1,080 frames (45.000 s) tiled with no gap, overlap or drift. |
| MUSIC CUE COUNT | 3 music cues and 1 declared silence. |
| SOUND CUE COUNT | 13: 3 ambience, 8 foley, 2 effects. Plus 4 accessibility subtitles. |
| KEYFRAME REQUIREMENTS | 22: 17 start frames, 3 environment, 1 wardrobe and 1 prop reference. 20 to generate and 2 to extract, 29 images in all. All 22 are blocked by founder decisions. |
| ESTIMATED PRODUCTION COST | Base 3,400 OpenArt credits and $1.48 fal. Expected with retakes 4,578 credits; ceiling 5,715. Assembly and any commissioned score are UNKNOWN. Balance at quote 10,031 credits. Recommended first stage: references and keyframes, 1,160 credits. |
| FOUNDER APPROVAL REQUIREMENTS | 11 S1-01 decisions (FD-S101-01 to FD-S101-11) and 8 bible decisions. Season story approval does not approve any script, performance, shot or cue. |
| SMALL REVIEW PACKAGE | Recorded in the session close (download link and SHA-256). |
| FULL IMPLEMENTATION PACKAGE | Recorded in the session close (download link and SHA-256). |
| NEXT RECOMMENDED PRODUCTION ACTION | The founder reads `00_FOUNDER_REVIEW_S1-01_DUSK.md`, answers FD-S101-01 (screenplay v2), then FD-S101-03, -04, -05 and -08, and authorizes stage 1 (1,160 credits) for references and keyframes. No video until those frames are approved. |

## Section 35 success criteria

| # | Criterion | Status |
| --- | --- | --- |
| 1 | Existing architecture preserved and expanded | Met (deliverable 01) |
| 2 | All 86 releases represented | Met |
| 3 | Whole-season writing and continuity plan | Met as a plan (deliverable 07); 81 screenplays not yet written |
| 4 | Season development without reviewing every scene now | Met: one active unit, the rest tracked silently |
| 5 | Director-level treatment of the active scene | Met for S1-01, pending founder review |
| 6 | Second-by-second timeline | Met (deliverables 10, 20) |
| 7 | Video, dialogue, sound and music timecoded and synced | Met in planning; S1-01 has no dialogue, so dialogue sync is tested on a synthetic line |
| 8 | Every shot has purpose, camera, duration and continuity | Met (deliverables 19, 21) |
| 9 | Necessary keyframes without redundant images | Met: 22 identified, reuse and extraction preferred, none generated |
| 10 | Performances directed | Met (deliverable 13 and the packet) |
| 11 | Music supervised creatively | Met in planning (deliverable 14) |
| 12 | Sound design for space, movement and silence | Met in planning (deliverable 15) |
| 13 | Motion-weighted editing, cutaways, continuous dialogue, selective lip-sync | Met in the planner and tests |
| 14 | Approved character voices linked | Met as connector-derived evidence; not independently verified |
| 15 | Only current-scene assets in active preparation | Met (just-in-time cast; inhabitants scene-scoped) |
| 16 | One manageable package at a time | Met (`00_FOUNDER_REVIEW_S1-01_DUSK.md`) |

## Conceptual, not yet implemented

- Dispatching paid jobs after approval. The gate exists, but no adapter submits jobs from this engine.
- Recording voices in the founder's ElevenLabs workspace and importing takes with hashes.
- Composing or licensing music, and assembling the edit (CapCut or otherwise).
- Writing directed plans for S1-02 onwards. The engine checks a plan; it does not write one.
