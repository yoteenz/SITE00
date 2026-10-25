# 10 — Provider runner readiness (OpenArt)

Sprint §18. The real transport stayed disabled throughout. No OpenArt call was made.

## 1. Evidence base

Only what the repository has observed counts as verified:

- **Creation records:** `THE_EXCHANGE/SEASON_1/PRODUCTION_TEST_RECORDS/KAIS_NOTE_SCREEN_TEST_OPENART_V1.json`.
  - Seven records copied verbatim from `openart_creation_list` (read-only) on 2026-10-24.
  - Five `completed` (kling-4-omni image2video, kling-lipsync-v1) and two `failed` (lip-sync).
- **Quotes and form facts:** `…/PROVIDER_PRICE_QUOTES_V2.json`, from `openart_model_cost` and `openart_account_get` (read-only), 2026-10-24 14:47Z.

Both were read through the founder's OpenArt connector in an agent session. **The connector is not authentication for the deployed SITE00 backend**, and no founder session credential is, or may be, a server secret.

## 2. Readiness by item

| Item (§18) | State | Detail |
| --- | --- | --- |
| Request schema | IMPLEMENTED, checked against the recorded form | `openArtPayload`: model, mode, config, prompt, inputs by field. `openArtContractProblems` for kling-3-omni image2video: duration a whole 3–15 s; resolution std/pro/4k; `generateSound` sent explicitly false (the form defaults it to true and the provider would add sound); exactly one start frame; prompt ≤ 2,500 characters. |
| Provider adapter compatibility | IMPLEMENTED_UNVERIFIED | `AgentSessionOpenArtExecutor`: `submit`, `creation`, `download`, optional `lookup`. Nothing implements it: the submission tool's request and response shapes were never observed. |
| Supported model parameters | VERIFIED for the quoted configurations | `matchingQuote` matches a request to an exact recorded quote: SH01 video = kling-3-omni image2video pro 5 s sound off, 175 cr; references = nano-banana-pro image2image 2K 9:16, 40 cr. Any other configuration has no known price. |
| Required media references | PARTLY VERIFIED | `startFrame`, `middleFrames` and `endFrame` were observed. A reference-image field for image2image was never observed, so a REFERENCE input is refused rather than guessed. |
| Authentication placement | VERIFIED BY CONSTRUCTION | The server holds no OpenArt credential. Any `OPENART_*` session, cookie, token, auth, key or secret variable disables the route. The executor would be injected by an agent session, never configured in the deployed app. |
| Operation creation | IMPLEMENTED (stub-tested) | One ticket → one `submit` → creation id as the operation id. Errors classed NOT_SENT / REJECTED / UNCERTAIN. |
| Status tracking | VERIFIED against records | `parseOpenArtCreation`: `completed` → SUCCEEDED, `failed` → FAILED. **Any other status is refused** (`PROVIDER_STATUS_UNRECOGNIZED`); in-progress names were never observed. |
| Error parsing | VERIFIED against records | A failed creation becomes a FAILED attempt with charge UNKNOWN; malformed records → `PROVIDER_RESPONSE_INVALID` |
| Output retrieval | VERIFIED against records | Output only from `https://cdn.openart.ai/…`. Another host → `PROVIDER_OUTPUT_HOST_UNEXPECTED`; a completed creation without output → `PROVIDER_OUTPUT_MISSING`. |
| Cost reconciliation | QUOTE ONLY | Creation records carry no charge, so the actual charge is UNKNOWN and the gate counts the quote. A balance-delta reconciliation (`openart_account_get` before and after) is PLANNED; it is reliable only when nothing else spends on the account. |
| Asset handoff | VERIFIED with a stub executor replaying recorded creations | Bytes are copied once from the output URL into private storage, re-hashed and probed. The asset records the creation id and the host `cdn.openart.ai`; no URL is stored. |

## 3. Tests

`tests/productionSpine.test.ts → "OpenArt runner readiness against the observed contract"` (5 tests):

- parses all seven recorded creations;
- refuses unobserved statuses, hosts and empty outputs;
- prices only exact quoted configurations;
- checks the recorded form;
- refuses session credentials;
- runs dispatch → status → output → asset through the real `OpenArtAgentSessionTransport`. Here the executor is a stub that replays a recorded creation. No provider is reachable.

## 4. What is still needed before live

1. **An executor.** Either an agent-session executor the founder runs, or a server credential the founder chooses to provision. That is a founder decision, not assumed.
2. **The submission shapes.** Observe the submission tool's request and response, and an in-progress status, on one founder-authorized generation. Then add them to the contract.
3. **Enable for one job only, on the founder's explicit instruction.** `SITE00_PROVIDER_EXECUTION=ENABLED` is set only in the session that runs the authorized job.
