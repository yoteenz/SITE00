# 16 — Composition and editing capability audit

## 1. Capability by tool

**Status values:**
- PROVEN: done and recorded.
- AVAILABLE_BUT_UNVERIFIED: the tool offers it by its documentation or as a standard editor function, but it has not been tried with these records.
- REQUIRES_IMPLEMENTATION: needs SITE 00 work.
- NOT_SUPPORTED: no path exists.

| Capability | SITE 00 internal | ElevenLabs Studio (video project) | Descript / Adobe / CapCut (manual) |
| --- | --- | --- | --- |
| Place clips on a timeline | Plan only: `timeline.ts` placeShots, `MULTITRACK_V1.json`. REQUIRES_IMPLEMENTATION to export | AVAILABLE_BUT_UNVERIFIED (vendor docs: drag video and speech clips to the timeline) | AVAILABLE_BUT_UNVERIFIED |
| Trim source footage | Plan carries screen time against generation length. Trim points: REQUIRES_IMPLEMENTATION in the export | AVAILABLE_BUT_UNVERIFIED | AVAILABLE_BUT_UNVERIFIED |
| Preserve continuous audio | Plan: DIALOGUE, AMBIENCE and MUSIC tracks are independent of picture cuts | AVAILABLE_BUT_UNVERIFIED (separate narration and music tracks) | AVAILABLE_BUT_UNVERIFIED |
| Insert cutaways | Plan: coverage classes and edit joins | AVAILABLE_BUT_UNVERIFIED | AVAILABLE_BUT_UNVERIFIED |
| Apply approved dialogue | REQUIRES_IMPLEMENTATION (no dialogue take, G-AUD-02) | AVAILABLE_BUT_UNVERIFIED (would regenerate unless audio is imported) | AVAILABLE_BUT_UNVERIFIED |
| Synchronize sound effects | Plan: sync points validated (`validateTimeline` SYNC_POINT) | AVAILABLE_BUT_UNVERIFIED | AVAILABLE_BUT_UNVERIFIED |
| Place music cues | Plan: cues and hit points validated (HIT_POINT) | AVAILABLE_BUT_UNVERIFIED | AVAILABLE_BUT_UNVERIFIED |
| Audio transitions | Partly in plan: picture `editTransition` per shot and music cue type TRANSITION (`directorial/types.ts:93,112`); no audio fade or crossfade fields. REQUIRES_IMPLEMENTATION | AVAILABLE_BUT_UNVERIFIED | AVAILABLE_BUT_UNVERIFIED |
| Generate captions | Plan: SUBTITLES track (4 items in S1-01). SRT/VTT: REQUIRES_IMPLEMENTATION | AVAILABLE_BUT_UNVERIFIED (captions track) | AVAILABLE_BUT_UNVERIFIED |
| Export 9:16 footage | NOT_SUPPORTED (no renderer; EDL `ROUGH_CUT_RENDERING_BLOCKED`) | AVAILABLE_BUT_UNVERIFIED (export) | AVAILABLE_BUT_UNVERIFIED |
| Preserve scene edit decisions | Plan is versioned in git; edit versions: REQUIRES_IMPLEMENTATION | NOT_SUPPORTED (no API integration) | NOT_SUPPORTED (no integration) |
| Track output versions | REQUIRES_IMPLEMENTATION | NOT_SUPPORTED (no integration) | NOT_SUPPORTED (no integration) |

Nothing in this table is PROVEN: no clip has ever been assembled from SITE 00 records.

Evidence:
- `shared/site00-fiction-production/directorial/timeline.ts`, `routing.ts` (MANUAL-EDIT)
- `shared/site00-studio-world-production/filmProduction/edit/editTemplateEngine.ts:16-60`
- ffmpeg use limited to `api/_lib/site00Assts/postProcess/pipeline.ts` and `scripts/stripLoaderAnimationAudio.ts`
- ElevenLabs Studio product guide (vendor-published, searched 2026-10-25; not tested)

Descript, Adobe and CapCut rows are standard editor functions, not verified against these tools in this audit.

## 2. Recommended paths

**Primary: manual conform in the founder's chosen editor, from an exported timeline.**
1. SITE 00 exports the scene's multitrack. FCPXML or OTIO is preferred; a CMX 3600 EDL is the minimum. The export carries each selected take's stored master and trim points from the plan (G-EDIT-01).
2. The editor imports it, mixes and grades.
3. The edited master is stored back with a hash as an edit version.

Why primary: the plan is already frame-exact, and an import keeps it exact. It needs no editor API.

**Fallback: ElevenLabs Studio video project.**
- The founder uploads selected takes and approved dialogue audio, then places clips, captions, music and effects, and exports.
- It is vendor-documented, not tested here.
- It is manual both ways, and there is a risk of regenerating narration instead of using the approved take.

**Not recommended now:** an internal renderer (G-EDIT-03, P3).

| # | Recommendation | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- | --- |
| E-01 | Timeline export (FCPXML or OTIO; EDL minimum) | Director Composer | G-TAKE-01, G-ASSET-01, D-10 | S1-01 opens in the chosen editor with every clip at its planned frame |
| E-02 | Edit versions stored with hash and source takes | Production Asset Registry | E-01 | Two exports and one edited master are listed with lineage |
| E-03 | Captions from approved dialogue (SRT/VTT) | Director Composer | G-AUD-02 | Caption timing matches dialogue placement within one frame |
| E-04 | One-time test of the fallback path | Founder | D-10 | Written procedure, tested once |
