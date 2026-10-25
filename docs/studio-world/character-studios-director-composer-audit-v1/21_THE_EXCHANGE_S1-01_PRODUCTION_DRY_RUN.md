# 21 — THE EXCHANGE S1-01 production dry run

A traceable walk of one S1-01 shot through the ten stages a Director Composer would run. **Nothing was generated, uploaded, downloaded or spent.** Every value is read from committed records on `claude/the-exchange-living-world-promotion` (THE EXCHANGE stack: PR #1690 → #1692 → #1693 → the promotion PR, none merged to `main`). Where a stage has no implementation, the walk stops and says so.

**Shot chosen:** `S1-01-SH07`, the teenager landing his step. It exercises motion-weighted generation, keyframe reuse, a music hit point, and the recurring-background identity the founder approved on 2026-10-25. It has no dialogue, so stage 4's audio branch is shown with KAI'S NOTE evidence instead.

**S1-01 status:** in founder review. Screenplay v2 is DRAFT (FD-S101-01 open). No generation is authorized (FD-S101-11 open). This walk is a dry run, not an authorization.

**Pending patch.** The living-world promotion (PR #1694) proposes an S1-01 patch plan that the founder has not yet accepted. Three of its patches touch this shot:
- PATCH-S101-01 (the recurring-background tier);
- PATCH-S101-02 (KF-SF-SH05 becomes reusable in S1-51);
- PATCH-S101-05 (a four-count step across SH05 to SH07, "still to be choreographed").

SH07 should not be generated before that patch is accepted. The walk below uses the packet as committed.

## Stage 1 — Scene selection

| Item | Value | Source |
| --- | --- | --- |
| Project | THE EXCHANGE, Season 1 | `THE_EXCHANGE/SEASON_1/SEASON1_86_RELEASE_MASTER_V1.json` |
| Release | S1-01 Dusk, 0:45, 1 of 86, 127:40 season | master |
| Active unit | S1-01 is the one unit in founder review | `ACTIVE_PRODUCTION_V1.json` |
| Scene | `S1-01-SC03` (the bus stop), beat `S1-01-SC03-B3` | `shared/site00-fiction-production/scenes/s1-01/shotsA.ts` |
| Brief | `developmentRequirements`: S-02 four-count step; FD-S101-06 recurring identities | `SEASON1_SCENE_INDEX_V1.json` |

**Works today:** yes, as committed data read by code. **UI:** none. No route lists scenes or opens a shot; the founder reads the packet JSON or the rendered docs.

## Stage 2 — Asset resolution

| Need | Resolved to | State |
| --- | --- | --- |
| Character | `scene:S1-01:teenager`, RECURRING_BACKGROUND, FOUR_COUNT_DANCE | `RECURRING_BACKGROUND_REGISTRY_V1.json` (promotion PR) |
| Face | `KF-SF-SH05` start frame (identity reference once generated) | Not generated |
| Wardrobe | "Teenager: hoodie open over a pressed shirt, clean sneakers" | PROVISIONAL (directorial interpretation) |
| Environment | `SET-CITY-DUSK` → `KF-ENV-CITY-DUSK-B` | Set PROVISIONAL; keyframe not generated; `KF-ENV-CITY-DUSK-A` blocked by FD-S101-08 |
| Lighting state | `LS-GOLDEN` (low sun from the west, copper on glass) | Packet spatial authority |
| Props | None | — |
| Continuity | "Must match SH05 framing", "Landing must sit on frame 324" | Shot record |

**Works today:** the plan names every dependency and the validator rejects a shot whose references do not resolve (`directorial/keyframes.ts` `validateKeyframes`, `effectiveBlockers`). **Gap:** none of the referenced assets exists, and the Studio World acting catalogue is not consulted: THE EXCHANGE has its own cast registry (deliverable 04, gap G-ID-01).

## Stage 3 — Reference selection

`KF-SF-SH07` is `EXTRACT_FROM_APPROVED_FOOTAGE`: the last frame of SH05. No new image is generated for SH07. SH05's start frame (`KF-SF-SH05`) is `GENERATE` from `KF-ENV-CITY-DUSK-B` with 2 candidates. The extract is only valid once SH05's footage is approved.

**Works today:** reuse is planned and counted (`keyframeCounts`: 22 requirements, 20 generate, 2 extract). **Gap:** no code performs the extraction, and there is no Take record to extract from (G-TAKE-01).

## Stage 4 — Provider preparation

| Job | Route | Model and settings | Access |
| --- | --- | --- | --- |
| SH05 start frame | `OA-NBP-I2I-2K` | OpenArt nano-banana-pro, image2image, 2K, 9:16, up to 14 references | Recorded as EXECUTABLE_AFTER_AUTHORIZATION via the **OpenArt MCP in an agent session**, not a SITE 00 backend adapter. The OpenArt MCP is not attached to this audit session, so the claim is unchecked here (G-GEN-04) |
| SH07 video | `OA-K3O-I2V-PRO` | OpenArt kling-3-omni, image2video, pro, sound off, integer 3–15 s | Same: agent MCP |
| Dialogue (not in SH07) | `EL-DIRECT` | Founder's ElevenLabs workspace voices | BLOCKED_NO_CREDENTIALS in this environment |
| Lip-sync (not in SH07) | none routed | — | The S1-01 budget line B-04 is 0 jobs |

Generation length: 69 frames = 2.875 s on screen; requested 4 s (`generationSeconds`: screen time plus a 0.5 s handle, rounded up, clamped to 3–15 s). Motion class HIGH (band 1–3 s), one primary action ("He lands the step and grins").

**Audio branch, from KAI'S NOTE (production test only):** OpenArt's own UI ran `kling-lipsync-v1` on an uploaded audio file and a Kling video (one completed, two failed, 2026-10-24). The audio's origin is not recorded. This proves the provider path exists in OpenArt; it does not prove a SITE 00 handoff (`PRODUCTION_TEST_RECORDS/KAIS_NOTE_SCREEN_TEST_OPENART_V1.json`).

## Stage 5 — Cost authorization

| Item | Value |
| --- | --- |
| SH07 | 2.875 s screen, 4 s generated, **140 credits**, high risk |
| S1-01 base | 3,400 credits + $1.48 (fal) |
| Expected with retakes | 4,578 credits |
| Ceiling | 5,715 credits |
| Balance at quote | 10,031 credits (2026-10-24 14:47 UTC) |
| Authorized / spent | 0 / 0 |
| Unknown line | B-09 assembly (manual) |

Gate: `review.ts` `AUTHORIZATION_STEPS` = SCREENPLAY → DIRECTION → KEYFRAMES → GENERATION_BUDGET → PRODUCTION. All five are PENDING.

**Works today** as a data model and validator. `authorizeGenerationJob` (`review.ts:160`) refuses a job whose step is not authorized, whose target is not approved, whose price is unknown or over budget, or whose route cannot run here.

**Gap:** no UI to authorize, and no runner calls that check before a provider call (G-COST-02).

## Stage 6 — Generation

**Stops here.** There is no SITE 00 job runner for OpenArt. A generation today means an agent calls the OpenArt MCP (or the founder uses OpenArt's web UI), then a person copies the result back into a record by hand, as KAI'S NOTE was. Nothing writes a generation's ID, cost or output back to the shot automatically (G-GEN-01).

## Stage 7 — Take review

**Stops here.** The review state has element decisions (`PENDING`, `APPROVED`, `CHANGES_REQUESTED`, `REJECTED`, `INVALIDATED`) per shot and per keyframe, with history and invalidation on change requests. There is no **Take** entity: a shot has one decision, not a list of candidate generations with their own provenance. No dailies UI exists for THE EXCHANGE (G-TAKE-01, G-TAKE-02).

## Stage 8 — Continuity validation

Planned and checked before generation: framing match to SH05, the frame-324 landing (MX-02 enters at 324 with hit points 324, 384, 528, 636, 684), lighting state, wardrobe string, screen direction and eyeline. **Gap:** no check runs against generated pixels (face, wardrobe or architecture drift); approval is the only post-generation check (G-CONT-01).

## Stage 9 — Approved footage storage

**Stops here.** `PRODUCTION_ASSET_REGISTRY_V1.json` holds sets, wardrobe and props with `DESIGN_REQUIRED` status and no generated footage. Its rule forbids recording an asset that does not exist with a matching hash or provider ID. There is no permanent copy step for provider URLs (G-ASSET-01).

## Stage 10 — Scene assembly

The multitrack (`MULTITRACK_V1.json`) places SH07 on VIDEO_A at its frame, with MX-02 on MUSIC, and the timeline validator checks gaps, overlaps and drift at 24 fps. Assembly route `MANUAL-EDIT` (CapCut, Descript or Adobe) imports the exported multitrack and EDL by hand. **Gap:** no export to an editor format exists, and no edit version is stored (G-EDIT-01).

## Summary

| Stage | Today |
| --- | --- |
| 1 Scene selection | Data and code; no UI |
| 2 Asset resolution | Planned and validated; assets do not exist; project-local cast |
| 3 Reference selection | Reuse planned; extraction not implemented |
| 4 Provider preparation | Routes defined; execution only through an agent's MCP or the founder's OpenArt |
| 5 Cost authorization | Model and numbers; no UI, no enforcement at execution |
| 6 Generation | Manual outside SITE 00 |
| 7 Take review | Per-shot decision only; no Take list, no dailies |
| 8 Continuity validation | Pre-generation only |
| 9 Approved footage storage | Not implemented |
| 10 Scene assembly | Multitrack plan; manual edit |

Phase 1 of the roadmap (deliverable 20) closes stages 6, 7 and 9 with three pieces: a job record that writes back to the shot, a Take list with approve, revise and reject, and a permanent copy of the approved file.

**First take.** The smallest first take is SH01, the establishing shot. It is untouched by the patch plan, its start frame is the city reference itself, and it costs about 255 credits.

**This shot.** SH07 follows once SH05 is approved and the patch plan is accepted. It adds only frame extraction (G-KF-01) and 140 credits.
