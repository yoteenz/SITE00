# ACTIVITY — Production Authority Tree

## 1. ROOT AUTHORITY

- **Route:** `/production/activity`
- **Component:** `ActivityBody` — living project memory / event stream

## 2. CHILD ROUTES

None.

## 3. GRANDCHILD ROUTES

None.

## 4. NON-ROUTE INTERACTIONS

- Workspace filter chips (`pxa-log__filters`)
- Row expand / detail (title + detail + actor)

## 5. TEMPORARY SURFACES

None.

## 6. STATES

- Filtered empty log
- Mixed event categories (approvals, assets, graph updates — from `buildActivityRows`)

## 7. RESPONSIVE VARIANTS

Hero uses hub crystal atmosphere slot; log list scrolls within authority frame.

## 8. PARENT INHERITANCE REQUIREMENTS

Match activity reference log density, monospace timestamps, workspace chips — not generic analytics dashboard.

## 9. KNOWN STALE / LEGACY SURFACES

Pre-Opus2 generic cylinder hero — replaced with hub crystal (Opus2)

## 10. MISSING / UNMOUNTED SURFACES

No detail route for single event — inline row only.

## 11. AUTHORITY SOURCE

- Activity reference plate
- `AUTHORITY_ASSETS.hubCrystal` for hero atmosphere
- Production authority data activity feed

## 12. CURRENT IMPLEMENTATION STATUS

| Node | Status |
|------|--------|
| activity-root + filters + rows | REFERENCE_LOCKED |

**Tree complete:** yes.
