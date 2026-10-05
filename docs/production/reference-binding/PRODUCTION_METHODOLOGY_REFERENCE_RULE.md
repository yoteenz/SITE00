# SITE 00 production methodology — reference binding

## Rule

| Condition | Required action |
|-----------|-----------------|
| Visual reference exists for the job | **REFERENCE_GUIDED** generation with image attached |
| No reference exists and job is true net-new | **TEXT_TO_IMAGE_NET_NEW** allowed |
| Reference required but missing, broken, or not attachable | **BLOCK** before provider dispatch (`credits_spent = 0`) |

This is enforced in code via `shared/site00-production-guardrails/` — not prompt-only.

## Forbidden workflows

- **Prompt-from-memory:** describe an existing reference in text, omit the image, call text-to-image.
- **Silent fallback:** reference-guided job fails resolution → do not auto-switch to text-to-image.

## Project firewall

Reference resolution is project-scoped. Cross-project binding requires an explicit shared-global registry entry.

## One project per family

Each family has its own provider project and repo folder. A paid job must pass `providerProjectId` for that family. Dispatch into another family's project is blocked (`FAMILY_PROJECT_MISMATCH`). A new family with no registered project is blocked (`FAMILY_PROJECT_REQUIRED`) until the project is created and added to `FAMILY_OUTPUT_PROJECTS.json`.

## Authority priority

`CANONICAL` → `APPROVED` → `IN_REVIEW` → `PROVISIONAL_DERIVED` → `REFERENCE_ONLY`

Do not prefer superseded assets when a current authority exists.

## Sidekick derivations

Environment plates, botanicals, lockups, objects, materials, and other visually derived assets must use the **screen authority** as the reference input when the asset is derived from that screen.

## Pre-dispatch pipeline

**Runtime enforcement path (2026-10-05):** paid / generative provider calls MUST go through `runProductionProviderRequest()` (`shared/site00-production-guardrails/providerGateway/`). That gateway wraps the steps below and rejects client-only `founderConfirmedSpend` flags.

```
spend authorization (server) → classify → family output project → expression / occupancy gates → resolve reference → file health → validateGenerationReferenceBinding → authority-first plate (JURNL) → budget gate → dispatch → cost receipt
```

See `docs/production/provider-gateway/PROVIDER_GATEWAY_ARCHITECTURE.md`.

## Implementation entry points

- `validateGenerationReferenceBinding()`
- `precheckGenerationDispatch()`
- `runPrecheckedProviderDispatch()`

Policy JSON: `docs/production/reference-binding/REFERENCE_BINDING_POLICY.json`
