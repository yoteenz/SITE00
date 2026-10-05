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

## Authority priority

`CANONICAL` → `APPROVED` → `IN_REVIEW` → `PROVISIONAL_DERIVED` → `REFERENCE_ONLY`

Do not prefer superseded assets when a current authority exists.

## Sidekick derivations

Environment plates, botanicals, lockups, objects, materials, and other visually derived assets must use the **screen authority** as the reference input when the asset is derived from that screen.

## Pre-dispatch pipeline

```
classify → resolve reference → file health → validateGenerationReferenceBinding → budget gate → dispatch
```

## Implementation entry points

- `validateGenerationReferenceBinding()`
- `precheckGenerationDispatch()`
- `runPrecheckedProviderDispatch()`

Policy JSON: `docs/production/reference-binding/REFERENCE_BINDING_POLICY.json`
