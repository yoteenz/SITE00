# Studio World Signal Ingestion

Studio World is registered as **PRODUCTION_INFRASTRUCTURE**, logically separate from Frontal Slayer despite sharing `yoteenz/fsbw`.

## Architecture

SITE 00 ↔ Studio World contract exists from prior sprints:

- `docs/STUDIO_WORLD_EXTERNAL_INTEGRATION_CONTRACT.md`
- `POST /api/site00/studio-world-webhook` — HMAC-verified webhook handler
- `api/_lib/studioWorld/liveAdapter.ts` — live HTTP adapter

Orchestration stores normalized signals in `site00_project_signals` and references Studio World via `site00_external_connections`.

## Supported Signal Types (contract)

When emitted by Studio World, SITE 00 can represent:

- Campaign created / status changed
- Reference required
- Production started
- Generation completed
- QC failed / repair required
- Assembly ready
- Approval required
- Deliverable ready
- Campaign completed

## Campaign Progress Model

SITE 00 can display production progress without owning execution:

```
CONCEPT → STORYBOARD → REFERENCE_PACK → GENERATION → QC → REPAIR → ASSEMBLY → APPROVAL → DELIVERY
```

Values must come from real signals/evidence. **Do not fabricate progress.**

## Sprint 02 Status

| Item | State |
|------|-------|
| Studio World org registered | ✓ |
| PRODUCTION_ENGINE relationship to Frontal Slayer | ✓ |
| External connection record | CONFIGURED / PARTIAL |
| Webhook endpoint | ✓ (existing) |
| Live signal → orchestration normalization | PARTIAL |
| Full campaign progress from live signals | NOT YET |

## Gaps

If Studio World does not yet emit a needed signal type, document it here and create a workstream recommendation — do not modify the fsbw repository from SITE 00 sprints unless explicitly authorized.

## Connection States

Use truthful states: CONNECTED, CONFIGURED, AUTH_REQUIRED, UNVERIFIED, UNAVAILABLE. Never fake CONNECTED.
