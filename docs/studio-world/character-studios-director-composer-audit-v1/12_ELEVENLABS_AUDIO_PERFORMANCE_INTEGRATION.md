# 12 — ElevenLabs, audio and character performance

## 1. Voice references

| Character | Voice ID | Status in the repository |
| --- | --- | --- |
| Sloane Lockwood | `sLyuEdbnawgNCsS8wQQK` | CONNECTOR_VERIFIED |
| Gideon Shaw | `41wdZQ488o8wXI20MrNC` | CONNECTOR_VERIFIED |
| Kai Fontaine | `U22Zv2xBsGGfhZWk4aSy` | CONNECTOR_VERIFIED |

- The IDs were read through the founder's ChatGPT ElevenLabs connector on 2026-10-24 (`CAST_REGISTRY_V1.json` voice evidence).
- The record states `composerIndependentVerification: NOT_PERFORMED: no ElevenLabs credential in this environment` and `externalSync: NOT_SUPPORTED`.
- **The repository has not verified provider access.** This audit did not either: no ElevenLabs credential or connector is attached to this session.
- The IDs are stored on the character, so the voice stays with the character. Vivienne has no voice recorded.

## 2. Current supported path, item by item

| Item | Path today | Status |
| --- | --- | --- |
| Voice selection | Stored per character in THE EXCHANGE registry | SCHEMA_OR_INTERFACE_ONLY |
| Approved dialogue takes | None. `DialogueEvent.takeRef` has nothing to point to | NOT_FOUND (G-AUD-02) |
| Performance direction | Per-shot performance text and dialogue style registry (`CHARACTER_DIALOGUE_STYLE_REGISTRY_V1.json`) | IMPLEMENTED_NOT_RUNTIME_VERIFIED (plan only) |
| Audio generation (TTS) | Founder's ElevenLabs workspace by hand. Route `EL-DIRECT` is BLOCKED_NO_CREDENTIALS. A fal path to an ElevenLabs TTS endpoint exists in code but sends a MiniMax-shaped body (`neuralVoiceGenerationService.ts:73`) | Manual only |
| Transcription | No client in the repository | NOT_FOUND |
| Word-level timing | No client. ElevenLabs documents a forced-alignment endpoint returning word and character timestamps (vendor documentation, not tested) | Vendor-documented, not integrated |
| Audio-driven video, lip-sync | The founder ran `kling-lipsync-v1` in OpenArt with uploaded audio: 1 of 3 completed. The Artlist connector lists lip-sync models (connector-reported, unused) | Manual in OpenArt (G-LIP-01) |
| Sound effects | Route `FAL-EL-SFX` (fal ElevenLabs sound effects). `FAL_KEY` is not set in this session | AVAILABLE_BUT_UNVERIFIED |
| Music | Route `FAL-EL-MUSIC`, or `HUMAN-COMPOSER` (manual) | AVAILABLE_BUT_UNVERIFIED / manual |
| Composition | ElevenLabs documents Studio video projects with video, captions, narration, music and effects tracks, plus export (vendor documentation, not tested). No integration | Vendor-documented, manual (deliverable 16) |

Evidence:
- `shared/site00-fiction-production/directorial/routing.ts`
- `api/_lib/site00ExpressionEngine/productionRouting.ts:33-38` (labels only)
- `shared/site00-studio-world-production/embodiedCharacterVoice/voiceGenerationCapability.ts`
- `KAIS_NOTE_SCREEN_TEST_OPENART_V1.json`
- no `api.elevenlabs.io` call in `api/`, `server/` or `shared/`

## 3. Rules the integration must keep

1. **The voice belongs to the Character.** Dialogue lines resolve their voice from the character record, never from free text (G-VOICE-01).
2. **No unnecessary regeneration.** An approved dialogue take is reused for every shot it plays under. Coverage classes already let one line run across several shots.
3. **A provider file is not an approval.** A generated or exported line enters as a take in review. Only the founder's decision makes it approved.
4. **Clean masters.** The approved line is stored as exported (lossless where available) with hash, voice ID, model and settings. Lip-sync and the mix use copies.
5. **Other voice catalogues are not substitutes.** The Artlist connector offers its own voices. Using one would change the character's voice, so they are out of scope unless the founder decides otherwise.

## 4. Recommended path

**Phase 4 in deliverable 20, two steps:**

1. **Manual import with records (no credential needed).**
   - The founder exports a line from the ElevenLabs workspace.
   - SITE 00 records it as a dialogue take: line ID, voice ID, source "ElevenLabs export", hash, master stored.
   - The founder approves it, and the take is linked to `DialogueEvent.takeRef`.
   - This closes G-AUD-02 and is enough for the first dialogue shots.
2. **Backend access (D-09).**
   - With a founder-placed credential, the backend verifies the three voice IDs read-only and dates the check.
   - Generation and forced alignment run only through the gate (G-COST-02).
   - Alignment output feeds subtitles (G-EDIT-02) and lip-sync timing.

| # | Recommendation | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- | --- |
| A-01 | Dialogue take import with stored master | Director Composer, Production Asset Registry | G-TAKE-01, G-ASSET-01 | A lip-sync job can reference only an approved dialogue take with a stored master |
| A-02 | Voice resolved from the character | Character Studios | G-VOICE-01 | Every line of a test scene resolves its voice without typing |
| A-03 | Backend credential and read-only verification | Director Composer | D-09 | Three voice IDs verified and dated; no generation without authorization |
| A-04 | Lip-sync route for VISIBLE_SPEAKER shots only | Director Composer | A-01, D-02 | `validateCoverage` passes and the plan quotes one lip-sync job per visible speaking shot |
