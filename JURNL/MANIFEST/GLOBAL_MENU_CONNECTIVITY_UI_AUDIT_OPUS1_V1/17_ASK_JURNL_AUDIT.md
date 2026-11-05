# 17 · Ask JURNL audit

**ASK_JURNL_STATUS: PRESENT_BUT_PLACEHOLDER (explanation-only), with a consent defect.** This status is intentional for the current build. No AI provider
is called from the client. There is no conversation, and nothing is persisted beyond the consent flag.

## History (VERIFIED_HISTORICAL_CODE)

| SHA | Date | Finding |
|---|---|---|
| `4c1d19378` | 2026-10-05 (Wave 1) | Ask JURNL first added (GS sheet + context toggle) |
| `435abbeb8` | 2026-10-07 | rebuilt as a reference replica; the "EXPLANATION ONLY" text has been unchanged since |

Nothing in history shows a working conversational Ask JURNL, so **no regression of capability is claimed**. Only the **entry point**
changed: the V3 menu (`3fac5e546`) has no ASK JURNL row (see 05).

## Current (VERIFIED_CURRENT_CODE @ `4ddbac6ce`)

| Item | Evidence |
|---|---|
| Sheet | `runtime/global/GlobalSheets.tsx:40` lead "EXPLANATION ONLY. NO LIVE AI PROVIDER IN THIS BUILD." Body from `data/foundation/askJurnl.ts:46-50` "THIS IS EXPLANATION ONLY — NOT A PLAN AND NOT LIVE BANK DATA." No input, no history. |
| Settings link | `ask-open-settings` → `go('account')` (`GlobalSheets.tsx:45`) |
| Context toggle | ACCOUNT page `settings-ask-context` (`AccountScreens.tsx:215-222`), drawer `drawer-ask-context` (`:371-380`) → `patchConsent('ASK_JURNL_CONTEXT', …, 'GS.SETTINGS')` |
| Toggle-off defect | `syncDeviceAiToRepository` re-derives `ASK_JURNL_CONTEXT = naturalLanguage \|\| personalizedInsights` (`consentSync.ts:21-22`); the gate `explainFromContext` also accepts `AI_NATURAL_LANGUAGE` (`askJurnl.ts:39`) |
| Server | `api/jurnl/ask-context.ts` returns `liveGeneration: false`, `provider: 'CONFIGURED'` only if `ANTHROPIC_API_KEY` / `JURNL_ASK_PROVIDER_URL` exist; route `server/routes.ts:114`; **no client caller** |
| Monetization | `data/monetization/capabilities.ts:77-82` AI_EXPLAIN_BASIC … AI_BUSINESS_ANALYSIS (capability ids only) |
| Ask entry today | the Ask sheet is opened from Safe to Spend / F03 surfaces (not from the V3 menu) |

## Future connected-intelligence coverage (PROPOSED_FUTURE_FEATURE, bounded by FI audit 20)

| Capability | Data needed | May mutate? | Surface |
|---|---|---|---|
| Explain a transaction | event + classification history | no | transaction detail "WHY?" |
| Explain a category / a trend | permitted ledger aggregates | no | Ask conversation |
| Identify uncertain activity | review queue | no | Ask → opens INTEL-B |
| Explain a Safe-to-Spend figure | F09 breakdown (incl. buffer) | no | Ask; F09 |
| Describe upcoming obligations | F07 / F08 | no | Ask |
| Clarify imported account activity | provider facts | no | Ask |
| Suggest a classification correction | event | **only through an explicit confirm action** | Ask card → INTEL-C |
| Propose a learned rule | evidence | **only through the rule approval flow** | Ask card → INTEL-D |
| Answer questions about permitted data | consented scopes only | no | Ask conversation |

Hard rule: an AI explanation never silently mutates financial records. Any edit goes through the same explicit, authorized action as a manual
correction (sprint §17, FI audit 20).

## Required surfaces

* An ASK JURNL conversation folio with a contained scroll region (the sprint allows contained scrolling for conversations). Batch B08.
* AI consent explained inside PRIVACY & CONSENTS (16).
* Until a provider is approved (FD-10), the menu row opens the existing explanation sheet, labelled honestly.
