# Registry five-column defect (P1)

**Authority:** Opus2 D-03, C-05, FN-05 (five columns ≥920px container width; capped ≥1300px).

## Before

`FoundationsPage` used a two-column card list (`1fr auto`) without header row or intake/next/activity columns.

## After (slice 3)

- Component: `foundations/FoundationsRegistry.tsx`  
- Columns: Client · Lifecycle · Intake (G-01) · Next action · Last activity  
- Layout: CSS container queries on `.ifw-registry--responsive`  
- Intake: `intake_state` via `intakeColumn.ts` (no invented lifecycle)  
- Tests: `tests/idntyFounderWorkspaceAcceptance.test.ts`

## Verification state

| State | Result |
| --- | --- |
| IMPLEMENTED | Yes |
| UNIT TESTED | Yes |
| VISUALLY VERIFIED (auth React) | No |
