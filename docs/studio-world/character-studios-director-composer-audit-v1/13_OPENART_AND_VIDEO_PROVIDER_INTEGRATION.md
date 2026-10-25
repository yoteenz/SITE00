# 13 — OpenArt and video provider integration

**Rule for this deliverable.** A provider's published or listed capability does not prove that SITE 00 is connected to it. Each row says where its evidence comes from:

- **Repository**: code or a committed record.
- **Founder-run**: a provider record of something the founder did in the provider's own UI.
- **Connector-reported**: read-only model listings from the Artlist connector attached to this audit session, on 2026-10-25. No job was run and no cost was requested.
- **Vendor-documented**: the provider's own documentation, found by search, not tested.

## 1. How each provider is reached

| Provider | From the SITE 00 backend | From an agent session | From the founder's UI |
| --- | --- | --- | --- |
| OpenArt | No API in the repository; no environment variable | OpenArt MCP or `npx @openart/cli` (JURNL scripts; KAI'S NOTE retrieval). **Not attached to this audit session** | Yes (KAI'S NOTE) |
| fal | Yes, about 47 call sites; images and MiniMax TTS; no video generation (`FAL_KEY` not set in this session) | — | — |
| Artlist | No (PR #1683 adapter returns NOT_SUBMITTED) | **Connector attached to this session** (model listing only) | Not recorded |
| ElevenLabs | No | No | Founder workspace (deliverable 12) |
| Kling direct, Seedance | No (Seedance NOT_FOUND in the repository) | Through Artlist (connector-reported) | — |

## 2. Capability matrix

| Model / route | Media and reference inputs | Image-to-video, frames | Audio-to-video, lip-sync | Duration | Aspect, resolution | Cost visibility | Status tracking and retrieval | Storage and reuse | Failure, refund | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OpenArt nano-banana-pro (`OA-NBP-I2I-2K`) | image2image, up to 14 references | — | — | — | 9:16, 2K | 40 credits per image (dated quote) | Agent listing | cdn.openart.ai URL | Not recorded | Repository: `directorial/routing.ts`, `PROVIDER_PRICE_QUOTES_V2.json` |
| OpenArt kling-3-omni (`OA-K3O-I2V-PRO` / `-STD`) | Start frame required, end frame optional | Yes | Sound off by plan | Integer 3–15 s | pro or std | 35 or 25 credits per second (dated quote) | Agent listing | CDN URL | Not recorded | Repository: same |
| OpenArt kling-4-omni | Start frame; middle frames; end frame | Yes (4 completed runs, 8–10 s, 1080p) | — | 8 and 10 s observed | 1080p observed | Credits not in the record | Listing copied verbatim | CDN URL only | — | Founder-run: `KAIS_NOTE_SCREEN_TEST_OPENART_V1.json` |
| OpenArt kling-lipsync-v1 | Video plus uploaded audio (audio2video) | — | Yes: 1 completed, 2 failed (2026-10-24) | 8 s observed | — | Not recorded | Listing | CDN URL | Failure reasons not recorded | Founder-run: same record |
| Artlist: Kling 4.0 I2V (720p, 1080p) | Start image, middle frames, end frame; up to 10 image and 5 video references | Yes | Audio generation toggle | 3–30 s | auto, 16:9, 9:16, 1:1, 21:9; 720p or 1080p | Connector has a cost tool (not called) | Connector has status tools (not called) | Provider URL | Unknown | Connector-reported |
| Artlist: Seedance 2.5 I2V (480p, 720p, 1080p) | Start image, end frame, image, video and **audio** references | Yes | Audio references accepted; audio generation toggle | 4–30 s | auto, 16:9, 9:16, 1:1, 3:4, 4:3, 21:9; up to 1080p | as above | as above | Provider URL | Unknown | Connector-reported |
| Artlist: Lipsync v3 | **Audio required**, plus video or image | — | Yes | Follows audio | auto | as above | as above | Provider URL | Unknown | Connector-reported |
| Artlist: other listed video families | Kling v3 (Kling direct), Veo 3.1, Seedance 2.0 and 1.5, LTX, Wan, Hailuo, Luma Ray, OmniHuman and others | Yes | Varies | Varies | Varies | as above | as above | — | — | Connector-reported |
| fal (backend) | flux-pro 1.1, gpt-image-2 and `/edit` with `image_urls`; references uploaded with `fal.storage.upload`; MiniMax TTS | No video generation (background removal only) | — | — | 9:16, 16:9 passed through | No real cost; receipts reuse the estimate | Queue and poll (ASSTS), blocking subscribe elsewhere | Copied to `live-preview` for keyframes and ASSTS; voice keeps the fal URL | One model fallback for keyframes; ASSTS FAILED state; no refunds | Repository: pipeline audit §2 |
| ElevenLabs | — | — | Vendor-documented: forced alignment (word timing), Studio video projects | — | — | — | — | — | — | Deliverable 12 |
| Grok / xAI | Vision and text only (`grok-4.6`) | No | No | — | — | — | — | — | Fallback forbidden | Repository: `grokVisionProvider.ts:126,407` |

## 3. Findings

1. **SITE 00 cannot run video from its backend.** All video so far was made by the founder in OpenArt's UI. All OpenArt images were made by agents and registered by hand.
2. **Durations are route-specific.** The directorial engine clamps generation to 3–15 s from one OpenArt form (`motion.ts` GENERATION_LIMITS). Artlist reports 3–30 s for Kling 4.0 and 4–30 s for Seedance 2.5. Limits should come from the chosen route (G-GEN-04).
3. **Audio-to-video exists at providers.** Seedance 2.5 accepts audio references and Lipsync v3 requires audio (connector-reported); OpenArt lip-sync was founder-run. None is wired to an approved dialogue take (G-AUD-02).
4. **Refunds.** No refund reporting exists anywhere in the repository; `'REFUNDED'` is only a type value (`costReceipt.ts:20`). Provider refund behaviour is unknown.
5. **Do not duplicate adapters.** An Artlist Kling 4 adapter with a hashed reference manifest and a paid-generation gate already exists on PR #1683. The OpenArt CLI path already exists in JURNL scripts. A new runner should wrap these behind the provider gateway rather than add an eighth router (G-GEN-03).
6. **Connector access does not carry over.** The Artlist connector and any OpenArt MCP belong to an agent session; the founder's ElevenLabs connector belongs to ChatGPT. None is available to the SITE 00 backend.

## 4. Recommendation

D-02 is a founder decision. The options:

| Option | What it takes | Strength | Weakness |
| --- | --- | --- | --- |
| A. Agent-session runner (OpenArt MCP or CLI), writing repository records | A script that reads an authorized job, calls the provider, waits, copies the file, hashes it and writes the take | Fastest; matches how KAI'S NOTE and JURNL already work; no backend secret | Runs only in an agent session with the connector; not self-serve for the founder |
| B. Artlist through the connector, reusing PR #1683 | Finish the existing adapter's submit and poll | Kling 4.0 and Seedance 2.5 with frame and audio inputs, per the listing | Still agent-side; Artlist credits are a separate account |
| C. Backend adapter | A provider with a server API and a founder-placed key | Founder-triggered from the workspace | OpenArt has no API in the repository; largest build |

**Recommended:** A for the S1-01 pilot (the routes the plan already quotes). Keep the runner's provider step pluggable so B or C can replace it without changing take records.

| # | Recommendation | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- | --- |
| V-01 | One runner with pluggable provider steps | Director Composer | D-02, G-TAKE-01 | One SH01 job runs end to end and writes a take with provider ID, credits and hashed copy |
| V-02 | Route limits and access checked at run time | Director Composer | V-01 | Each route shows a dated check; Kling 4.0 limits come from the route, not a constant |
| V-03 | Record actual credits from the provider or balance change | Director Composer | V-01 | The take's actual credits match the provider history |
