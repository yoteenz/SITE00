# Gate A — Safe intake — evidence

**Environment:** Vite dev `http://127.0.0.1:5174` (cloud mobile preview), memory-backed Digital Foundation store.

## Personalized link

- Artifact minted via `POST /api/dev/site00-digital-foundation-preview-bootstrap` (authorized dev-only; not Anthony’s production token).
- Client route: `/foundation/<token>` — **PASS** (browser).

## Intake persistence

| Step | Result |
| --- | --- |
| Open link | PASS — P02 with business/contact fields |
| Save / continue | PASS — progressed P02 → P03 → P04 |
| Hard refresh | PASS — fields unchanged (`gate-a-intake-after-refresh.png`) |
| API reload `?action=payload` | PASS — business name + phone match after PATCH |

Artifacts (screenshots):

- `/opt/cursor/artifacts/gate-a-intake-initial.png`
- `/opt/cursor/artifacts/gate-a-intake-after-refresh.png`
- `/opt/cursor/artifacts/gate-a-intake-submitted.png`
- `/opt/cursor/artifacts/gate-a-intake-recommendation.png`

## Founder visibility

- `GET /api/admin/site00-foundation?action=detail&id=<artifact_id>` (cloud preview founder stub):
  - `business_name`: Launch Gate QA LLC
  - `phone`: 555-0199
  - `current_email`: df-e2e-qa@site00.test
  - `intake_state`: COMPLETE  
- **PASS** — matches client-side intake (same process memory).

## Launch gate (intake-only mode)

- Code: `shared/site00-digital-foundation/launchGate.ts`, `surface.ts` → `INTAKE_SUBMITTED`.
- Checkout blocked with `LAUNCH_GATE_INTAKE_ONLY` when env set.
- Tests: `tests/digitalFoundationLaunchGate.test.ts` — **PASS** after fix (single `updateIntake(..., true)`).

**Not executed on running Vite:** env `SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY=1` was not applied to the live dev server during browser pass (requires API process restart). Founder must set on **Railway** before intake-only production.

## Production gaps (Gate A NO-GO until closed)

1. `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1` + migrations on target Supabase — **BLOCKED** on VM.
2. Intake survives **API restart** — **not proven**.
3. Deployed production SHA — **UNVERIFIED** (see deployment report).
