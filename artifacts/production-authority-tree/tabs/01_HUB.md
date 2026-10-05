# HUB — Production Authority Tree

## 1. ROOT AUTHORITY

- **Route:** `/production`
- **Component:** `ProductionWorkspaceHubPage` → `ProductionAuthorityFrame screen="hub"` → `HubBody`
- **Role:** Whole-project view (not Entry 002 disguised as hub)

## 2. CHILD ROUTES

| Child | Trigger | Notes |
|-------|---------|-------|
| Hub machine | `?view=machine` (also `panel`, `node`, `scene`) | Swaps to `ProductionHub` — **LEGACY_LOCKED** |

## 3. GRANDCHILD ROUTES

None under authority hub body. Machine view has internal chamber/inspector (legacy graph — not expanded in this sprint).

## 4. NON-ROUTE INTERACTIONS

- Status bar links: VIEW NOW → queue, VIEW → activity
- Entry / component links → Expression sub-routes (`NODE_SUB` map)
- Operations rows → queue
- **hub-open-machine** → machine query surface

## 5. TEMPORARY SURFACES

- Full-screen **ProductionHub** while machine query active (replaces authority frame body)

## 6. STATES

- Operations empty: `hub-operations-empty`
- Activity preview empty: `hub-activity-empty`
- Active vs new entry cards on Expression links

## 7. RESPONSIVE VARIANTS

| Breakpoint | Behavior |
|------------|----------|
| MOBILE | `.pxa` frame; ph-scaled top strip (residual geometry) |
| MOBILE XL | Same as mobile |
| TABLET | pxh header + host nav |
| DESKTOP | pxh header + host nav; wider body gutter |

## 8. PARENT INHERITANCE REQUIREMENTS

Must inherit Production shell: bottom nav, project context header, Saira hierarchy, crystal/glass material, red pipe accents, spacing rhythm from `.pxa-hub`.

## 9. KNOWN STALE / LEGACY SURFACES

- **Hub machine** (`ProductionHub`) — intentional legacy lock; separate 864-space spec

## 10. MISSING / UNMOUNTED SURFACES

None on authority hub root. Machine internals not audited as Production descendants.

## 11. AUTHORITY SOURCE

- Founder reference plates (hub / IMG_* registry)
- Grok1 `AUTHORITY_ASSETS.hubCrystal` integration
- Live `HubBody` implementation

## 12. CURRENT IMPLEMENTATION STATUS

| Node | Status |
|------|--------|
| hub-root + sections | REFERENCE_LOCKED |
| hub-open-machine link | REFERENCE_LOCKED |
| hub-machine | LEGACY_LOCKED |

**Tree complete:** yes (reachable hub states mapped).
