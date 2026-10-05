# Reference binding failure runbook

## Identify

Symptoms:

- Parent or sidekick asset visually drifts from F01/F02 world
- OpenArt job used **text2image** while an approved reference exists
- Ledger shows `mode: text2image` with `reference_required: true` (postmortem class `REFERENCE_BINDING_FAILURE`)

Failure class: **REFERENCE_BINDING_FAILURE**

## Stop dispatch

1. Do not submit another paid job until precheck passes.
2. Run `precheckGenerationDispatch()` (or agent equivalent) — expect `BLOCKED` if reference is missing or not attached.

## Find the correct reference

1. Check family contract / screen tree for `authorityFile` or registered `reference_authority_id`.
2. Resolve via project registry (`resolveGenerationReference`) — order: manifest → authority registry → family assets → repo paths → same-session outputs.
3. Prefer **CANONICAL** / **APPROVED** over superseded entries.

## Rebind

1. Set `generation_mode = REFERENCE_GUIDED`.
2. Attach reference image to provider request (image2image / edit), not text-only.
3. Set `reference_input_attached = true` in job context.

## Reclassify

- If truly net-new with no existing authority: `generation_intent = NEW_AUTHORITY_REQUIRED`, `reference_required = false`, `generation_mode = TEXT_TO_IMAGE_NET_NEW`.

## Record invalid spend

- Do not delete historical outputs.
- Add ledger entry with `dispatch_status = INVALID_GENERATION_POSTMORTEM`, `failure_class = REFERENCE_BINDING_FAILURE`, actual `credits_spent`, `corrective_action = REFERENCE_BINDING_REQUIRED`.

## Prevent duplicate retry

- Mark superseded attempts `qa_status = SUPERSEDED`; do not re-run identical text-only jobs when canonical reference-guided output exists.

## Resume safely

1. Confirm canonical reference file health (exists, non-zero, supported format).
2. Precheck **PASS** → single reference-guided attempt.
3. Update manifest / ledger with reference lineage fields.
