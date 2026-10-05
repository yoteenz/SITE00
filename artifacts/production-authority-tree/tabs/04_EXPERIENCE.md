# EXPERIENCE — Production Authority Tree

## 1. ROOT AUTHORITY

- **Route:** `/production/:projectSlug/experience`
- **Component:** `ExperienceBody` inside `ProductionAuthorityFrame`
- **Capsules (canon labels):** WORLD · ZONES · PATHS · INTERACTIONS · INHABITANTS · STATES · ACCESS

## 2. CHILD ROUTES

| Route segment | Registry id | Canon capsule |
|---------------|-------------|---------------|
| `world` | world | WORLD |
| `zones` | zones | ZONES |
| `environments` | environments | PATHS |
| `modules` | modules | INTERACTIONS |
| `simulations` | simulations | INHABITANTS |
| `assets` | assets | STATES |
| `review` | review | ACCESS |

## 3. GRANDCHILD ROUTES

None mounted. Prior MODULES → build-a-wig link **removed** (Opus2).

## 4. NON-ROUTE INTERACTIONS

- Root: ENTER WORLD · PREVIEW buttons
- Child: horizontal **capsule nav** (`experience-child-capsules`)
- HubReturnBar on shell pages

## 5. TEMPORARY SURFACES

None.

## 6. STATES

- **UNMOUNTED empty:** `NO WORKSPACE SURFACE MOUNTED` on every child
- Root status: blockers count from production graph

## 7. RESPONSIVE VARIANTS

- Root: full authority hero + panel all breakpoints
- Children: `PwFrame` + `pwa-xchild`; desktop width band 1180–1320 (Opus2 descendant layer)
- Same empty body all breakpoints — shell is mounted, **content is not**

## 8. PARENT INHERITANCE REQUIREMENTS

Child must keep world plate crop art direction, glass head, Saira type, capsule grammar from Experience root — not generic empty SaaS.

## 9. KNOWN STALE / LEGACY SURFACES

- Shell list view (`PwScreenHead` + `pw-list`) only when routing lands without authority root body (deep link pattern); primary path uses authority root then PwFrame children

## 10. MISSING / UNMOUNTED SURFACES

**All seven sub-workspaces:** honest UNMOUNTED placeholder — do not invent sample worlds.

## 11. AUTHORITY SOURCE

- Experience world plate (`AUTHORITY_ASSETS.experienceWorld`)
- Registry `PRODUCTION_SUB_WORKSPACE_REGISTRY.EXPERIENCE`
- `EXPERIENCE_CAPSULES` label mapping

## 12. CURRENT IMPLEMENTATION STATUS

| Node | Status |
|------|--------|
| experience-root | REFERENCE_LOCKED |
| experience-child-* shell | PARTIAL (shell aligned, content UNMOUNTED) |
| experience-empty-* | UNMOUNTED |

**Tree complete:** yes (including honest unmounted labels).
