# Validation source binding (RECOVERY1)

OpenArt validation **must not** read `artifacts/STUDIO_WORLD_RESIDENT_FABRICATION/openart_identity_references.json` (geometry batch — **black-tee / mounted portrait** paths).

## Authoritative chain

1. `shared/.../validationSourceBinding.ts` → `resolveValidationSourceBinding()` from `fabricationSourceAuthority` + `casting-thumbnails-v1`
2. `source-binding-registry.json` — sha256-verified OpenArt upload IDs only
3. `studio-world-validation-openart-run-one.mjs` — builds MCP payload; throws on SHA mismatch or missing registry

## Proof before generation

```bash
node scripts/studio-world-resident-fabrication-source-binding-proof.mjs
```

Produces `SW-00X_SOURCE_BINDING_PROOF.jpg` and per-resident `SOURCE_BINDING_PROOF.json`.

## Re-upload (invalidate stale OpenArt IDs)

```bash
node scripts/studio-world-resident-fabrication-source-binding-upload.mjs upload-plan SW-001
# MCP sign + PUT, then write-registry
```

Prior validation batch outputs: `SUPERSEDED_OUTPUT_WRONG_REFERENCE_BINDING`.
