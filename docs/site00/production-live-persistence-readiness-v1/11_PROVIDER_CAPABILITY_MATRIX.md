# 11 — Provider capability matrix

Sprint §19. Each status names its evidence. **No model access is claimed that was not observed.**

- **Evidence files.** `PROVIDER_PRICE_QUOTES_V2.json` (Q2) and `KAIS_NOTE_SCREEN_TEST_OPENART_V1.json` (KN), both in `THE_EXCHANGE/SEASON_1/PRODUCTION_TEST_RECORDS/`. Both were read through the founder's connectors in agent sessions on 2026-10-24, read-only.
- **Runtime.** "Runtime" means the deployed SITE00 API.

Statuses:

| Status | Meaning |
| --- | --- |
| PROVEN | Observed working, with a record in the repository |
| IMPLEMENTED_UNVERIFIED | Code exists here, never run against the provider |
| AVAILABLE_THROUGH_FOUNDER_APP_ONLY | Works in the founder's own app or connector session; the backend cannot use it |
| PLANNED | Designed, not built |
| BLOCKED | Needs something this environment lacks |
| UNSUPPORTED | Observed not to exist |

## 1. OpenArt

| Route | I2V | Reference input | Audio input | Duration | Resolution | Aspect | Lip-sync | Status reporting | Output retrieval | Cost reporting | Permanent capture | Runtime readiness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| kling-3-omni image2video (spine route OA-K3O-I2V-PRO) | Form: startFrame required, endFrame optional (Q2 formFacts). PROVEN as a quote form | start/end frame: form facts | none in form | 3–15 s whole seconds (Q2) | std / pro / 4k (Q2) | 9:16 used; aspect not a form field in Q2 | no | creation records: completed / failed (KN, other models) | `cdn.openart.ai` URL (KN) | quote PROVEN (Q2: pro 5 s sound off = 175 cr); per-creation charge UNSUPPORTED in records | IMPLEMENTED (stub-tested, deliverable 10) | **BLOCKED**: no executor or credential in the deployed API; generation through the connector not yet observed for this model |
| kling-4-omni image2video | AVAILABLE_THROUGH_FOUNDER_APP_ONLY (KN: 4 completed creations, made in the OpenArt web app) | startFrame, middleFrames, endFrame (KN) | — | 8.04 s and 10.04 s observed | 1080p observed | 9:16 (prompts) | no | completed (KN) | `cdn.openart.ai` | not in records | — | Not on the OpenArt MCP model list at quote time (Q2 `unavailable`) |
| kling-lipsync-v1 lipSync (audio2video) | n/a | video + audio inputs (KN) | yes (KN) | 7.97 s observed | — | — | AVAILABLE_THROUGH_FOUNDER_APP_ONLY: 1 completed, 2 failed (KN) | completed / failed | `cdn.openart.ai` | not in records | — | Not routed in the spine |
| nano-banana-pro image2image (spine route OA-NBP-I2I-2K-REF) | n/a | reference field not observed (refused) | — | — | 2K (Q2) | 9:16 (Q2) | — | not observed for images | not observed for images | quote PROVEN (40 cr) | IMPLEMENTED (stub-tested) | **BLOCKED** (as above) |
| veo3-1 image2video / element2video | quote only (Q2 default config: 120 / 320 cr) | — | — | — | — | — | — | — | — | quote only | — | PLANNED at most: no route |
| kling-v3 image2video, kling-3-omni element2video / image2image, nano-banana-2, gpt-image-2-5-sunburst | quote only (Q2 default configs) | — | — | — | — | — | — | — | — | quote only | — | not routed |
| Audio models on OpenArt | — | — | — | — | — | — | — | — | — | — | — | UNSUPPORTED (Q2: none on the MCP) |

## 2. ElevenLabs

| Route | Capability | Status | Evidence |
| --- | --- | --- | --- |
| ElevenLabs direct API | TTS, voices, music, SFX | **BLOCKED** | Q2 `elevenlabs.directApi = BLOCKED_NO_CREDENTIALS`; no `ELEVENLABS_*` credential |
| Founder's ElevenLabs workspace (voices for Sloane, Gideon, Kai) | Voice IDs | AVAILABLE_THROUGH_FOUNDER_APP_ONLY | Verified through the founder's ChatGPT ElevenLabs connector (Q2 note); not verified by an agent |
| fal-hosted ElevenLabs: `fal-ai/elevenlabs/tts/eleven-v3`, `sound-effects(/v2)`, `music` | TTS, SFX, music | Price PROVEN (fal pricing API, read-only: $0.10 per 1,000 characters, $0.002/s, $0.60/min). Generation not run. | Q2 `fal.prices`. Whether fal can address the founder's own voices is not verified (Q2 `openQuestion`). Any code path is listed in deliverable 09. |

## 3. Other video models

| Route | Status | Evidence |
| --- | --- | --- |
| `fal-ai/kling-video/v2.1/master/image-to-video` | Price PROVEN ($0.28 per second, fal pricing API). Generation not run; not routed in the spine. | Q2 `fal.prices` |
| Seedance, Runway, Luma, Hedra and others | No evidence in this repository | — |

## 4. Internal media utilities

| Utility | Status | Evidence |
| --- | --- | --- |
| ffprobe media probe (runtime, resolution, fps, aspect, audio) | PROVEN locally | Spine tests; dry-run step 10 |
| ffmpeg frame extraction (deterministic PNG) | PROVEN locally | Spine tests (byte-identical twice) |
| SHA-256 hashing, store-and-reverify | PROVEN | Spine tests; dry-run step 9 |
| Local private media store (outside the repository, `0600`) | PROVEN | Spine tests; dry-run step 8 |
| Supabase private media store | IMPLEMENTED_UNVERIFIED (contract-tested against a stand-in client) | Live verification BLOCKED (deliverable 07) |
| Signed reads (API HMAC links) | PROVEN | Dry-run step 18 |
| Durable record store (Supabase Postgres) | PROVEN on PostgreSQL 16 locally; staging BLOCKED | Deliverables 03 and 04 |

## 5. What this means for SH01

The only route SH01 needs is **kling-3-omni image2video pro, 5 s, sound off**, plus a start-frame image, which may be a founder photograph.

- **Known for that route:** the price, the form limits and the response shape it shares with other OpenArt creations.
- **Not available:** a way for the deployed system to call it. That is founder decision D-B (deliverable 19).
