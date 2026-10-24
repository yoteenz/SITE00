# 09 — Production provider adapters

**Code:** `shared/site00-fiction-production/providers.ts`. **Audit record:** `THE_EXCHANGE/SEASON_1/PROVIDER_CAPABILITY_AUDIT_V1.json` (checked 2026-10-24 UTC with read-only calls; no paid job was submitted).

Rule: an integration is reported only as far as it was verified. No adapter generates anything. Each one exports the rows a provider would need, keyed by line ID or shot ID, so that a later, founder-authorised job can be built without re-reading the screenplay. `verifiedGenerationProviders()` returns an empty list today, so the dispatch gate blocks every paid job with `PROVIDER_NOT_VERIFIED`.

## Capability audit

| Role | Provider | Route | Integration | Generation verified | Adapter mode |
| --- | --- | --- | --- | --- | --- |
| Screenwriting | Claude Opus (Cursor cloud agent) | Repository `.fountain` files | VERIFIED | Yes (in session) | IN_SESSION |
| Voice | ElevenLabs | No direct credential on this VM. Through fal: `fal-ai/elevenlabs/tts/eleven-v3` | NOT_VERIFIED | No | MANIFEST_EXPORT |
| Image (keyframes) | OpenArt | MCP: `gpt-image-2-5-sunburst`, `nano-banana-pro` image-to-image | READ_ONLY_VERIFIED | No | MANIFEST_EXPORT |
| Video | OpenArt (Kling) | MCP: `kling-3-omni`, `kling-v3` image-to-video. Kling 4 Omni has no OpenArt quote | READ_ONLY_VERIFIED | No | MANIFEST_EXPORT |
| Lip-sync | Kling lip-sync (OpenArt) or sync-lipsync (fal) | `kling-lipsync-v1` (unquoted); `fal-ai/sync-lipsync/v2`; `fal-ai/kling-video/lipsync/audio-to-video` | READ_ONLY_VERIFIED | No | MANIFEST_EXPORT |
| Editing | CapCut | Edit decision list in each production manifest; no CapCut API | MANIFEST_EXPORT_ONLY | No | MANIFEST_EXPORT |

## Evidence

- **Voice:** no `ELEVENLABS_*` variable in the environment. The fal pricing API (read-only, 2026-10-24 02:52 UTC) quotes ElevenLabs v3 at $0.10 per 1,000 characters. No approved character voice exists; both registries hold `voiceId: null`.
- **Image:** OpenArt cost quotes of 42 credits (`gpt-image-2-5-sunburst`, 2K, medium) and 40 credits (`nano-banana-pro`, 1K). Balance read: 10,154 credits.
- **Video:** OpenArt quote of 175 credits for `kling-3-omni`, standard, 5 s with sound. fal quotes `fal-ai/kling-video/v2.1/master/image-to-video` at $0.28 per second. The Kai's Note screen-test creations were read back from OpenArt project `JDK0WveKdptpT6L3pLzB` and stay `PRODUCTION_TEST_ONLY`.
- **Lip-sync:** the Kai's Note test contains lip-sync creations (read only). fal quotes sync-lipsync v2 at $3 per minute and Kling lip-sync at $0.014 per unit. Multi-speaker lip-sync is untested (stress test T28).
- **Editing:** no CapCut credential or API in the repository or environment.

## Adapters

| Adapter | Export | Keyed by | Consumed by |
| --- | --- | --- | --- |
| `voiceAdapter.exportRows(lines, voiceOf)` | line ID, cue, voice ID (null until approved), text, direction, character count | Line ID | Voice recording session |
| `imageAdapter.exportRows(shots)` | start frame, set, on-screen characters, wardrobe, props, framing, blocking | Shot ID | Keyframe generation |
| `videoAdapter.exportRows(shots)` | provider, duration (≤ 10 s), start and end frame, movement, constraints (face locks, chaining) | Shot ID | Shot animation |
| `lipSyncAdapter.exportRows(shots)` | line IDs and on-screen speakers for dialogue shots | Shot ID | Lip-sync pass on approved recordings only |
| `editingAdapter.exportEdl(shots, cues)` | `EXCHANGE_EDL_V1`: events with record in/out seconds, dialogue refs, music and effects cues | Shot order | Editor (hand import into CapCut) |

All five exports are written into `PRODUCTION_MANIFESTS/<release>.json` under `providerExports`.

## Rules enforced in code

- **No fabricated assets.** A missing face, voice, set reference, wardrobe design or prop design is a manifest blocker. Adapters never insert placeholder IDs or paths.
- **No substitute speech.** Lip-sync runs only on approved recordings. The dispatch gate blocks a job whose provider differs from the planned one (`SILENT_FALLBACK_ATTEMPT`).
- **No unverified connection is reported as working.** Integration status comes from the audit record, and only `VERIFIED` screenwriting is used in session.
- **No automatic spend.** Every paid stage needs an upstream approval, a verified provider and a founder spend authorization with a cap. Blocked decisions report `creditsSpent: 0`.

## What would verify each provider

| Role | Next step |
| --- | --- |
| Voice | Founder approves a voice per character (CHARACTER_VOICE), then a spend authorization for recordings. A direct ElevenLabs key, or a first paid fal call with a receipt, would move the integration to VERIFIED. |
| Image | Approved set, wardrobe and face references, then a keyframe spend authorization. A first receipt verifies generation. |
| Video | Approved keyframes and a per-release spend authorization. |
| Lip-sync | Approved recordings; a multi-speaker test before Arc 1 dialogue scenes. |
| Editing | An editor imports the EDL by hand; there is no API to verify. |
