# Future generation sprint template (reference binding block)

Copy this block into every paid visual generation sprint.

```
VISUAL_ID:
PROJECT_ID:
FAMILY_ID:

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

Policy: `PRODUCTION_METHODOLOGY_REFERENCE_RULE.md`
