# Intake persistence regression

**Backend:** no changes.

**Automated:** `tests/idntySelectPhase2.test.ts` — `updateIntake` with `industry: 'OTHER'` → `payload.artifact.intake.industry` and `draftFromPayload` parity.

**Live Supabase reload after refresh:** **NOT RUN** (requires founder staging credentials / manual).

Autosave timing unchanged — selector only calls parent `onChange`.
