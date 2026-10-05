# Future generation sprint template (reference binding block)

Copy this block into every paid visual generation sprint.

```
VISUAL_ID:
PROJECT_ID:
FAMILY_ID:
PROVIDER_PROJECT_ID:
PROVIDER_PROJECT_NAME:
REPO_FOLDER:

REFERENCE_REQUIRED: [true | false]
REFERENCE_FOUND: [true | false]
REFERENCE_PATH:
REFERENCE_AUTHORITY_ID:
REFERENCE_STATUS:

GENERATION_MODE: [REFERENCE_GUIDED | TEXT_TO_IMAGE_NET_NEW]
GENERATION_INTENT: [DERIVED | NEW_AUTHORITY_REQUIRED | NEW_ASSET_REQUIRED | ...]
REFERENCE_INPUT_ATTACHED: [true | false]

PRECHECK_STATUS: [PASS | BLOCKED]
DISPATCH_ALLOWED: [true | false]
BLOCKED_REASON:

PROVIDER:
MODEL:
ESTIMATED_COST:

# Gates (must pass before dispatch)
- validateGenerationReferenceBinding() → PASS
- Family outputs go to that family's own provider project (FAMILY_OUTPUT_PROJECTS.json)
- No silent fallback to text-to-image
- Project firewall respected
- Sidekick derivations use screen authority reference
```

## Sprint checklist

- [ ] Classify every paid job before dispatch
- [ ] Reference-required jobs blocked without attachable reference
- [ ] Ledger records reference lineage (`GENERATION_LEDGER_SCHEMA.json`)
- [ ] Cost metrics updated (avoided / invalid / guided / net-new)
- [ ] Zero prompt-from-memory workflows
- [ ] Provider project is this family only — create and register it before the first paid job

Policy: `PRODUCTION_METHODOLOGY_REFERENCE_RULE.md`
