# DESIGN — Production Authority Tree

## 1. ROOT AUTHORITY

- **Route:** `/production/:projectSlug/design?mode={brand|experience|surfaces|compiler|assets|viewport}`
- **Component:** `DesignRoot` → `DesignChamber` + `DesignModeBar`
- **Modes (canon):** BRAND · EXPERIENCE · SURFACES · COMPILER · ASSETS · VIEWPORT

## 2. CHILD ROUTES

| Path | Surface |
|------|---------|
| `/design/workspace` | Twin-opus bench overlay |
| `/design/references` | DesignProductionSectionReferences |
| `/design/assets` | DesignProductionSectionAssets |
| `/design/pages` | DesignProductionSectionPages |
| `/design/skins` | DesignProductionSectionSkins |
| `/design/history` | DesignProductionSectionHistory |
| `/design/more` | DesignProductionSectionMore |

## 3. GRANDCHILD ROUTES

In-shell sections inside twin-opus (panels, overlays) — tied to `DesignProductionSections` / overlay-kit; no additional Production URL segments.

## 4. NON-ROUTE INTERACTIONS

- Mode bar links (`design-mode-*`)
- Viewport: target `<select>`, zoom FIT/50/75/100, safe-area toggle
- Validation sheet link → workspace
- ON YOUR TABLE card links (per mode)
- Pipeline actions (mode-specific)

## 5. TEMPORARY SURFACES

- `ProductionChromeOverlay` while on `/design/*` child paths (not on mode root)

## 6. STATES

- Viewport: loading iframe, safe overlay on/off
- Empty board lists (mode-dependent)
- Chamber environment toggle (atrium vs corridor) on viewport

## 7. RESPONSIVE VARIANTS

| Breakpoint | Notes |
|------------|-------|
| MOBILE / MOBILE XL | Mode root: authority chamber. **Workspace child: 768 canvas scaled — RESPONSIVE_AUTHORITY_FAILURE** |
| TABLET | pxh chrome; viewport device frame |
| DESKTOP | Full viewport targets; landscape-locked desktop frame (Opus2 fix) |

## 8. PARENT INHERITANCE REQUIREMENTS

Must inherit design mode plates (Grok1 atrium/core/corridor), floating panel geometry, red pipe section heads, ON YOUR TABLE card language.

## 9. KNOWN STALE / LEGACY SURFACES

- **design/workspace** — twin-opus provisional palette remap (`role=production-provisional`)
- Overlay-kit tokens on references/assets/pages/skins/history/more

## 10. MISSING / UNMOUNTED SURFACES

Registry lists DESIGN sub-workspaces (work, authorities, family, …) — production mount uses **six mode bar** + twin-opus children instead; not all registry IDs have distinct routes.

## 11. AUTHORITY SOURCE

- `production-authority-registry.ts` design-* screens
- `AUTHORITY_ASSETS` chamber plates
- Legacy twin-opus for workspace child

## 12. CURRENT IMPLEMENTATION STATUS

| Node | Status |
|------|--------|
| design-root + 6 modes | REFERENCE_LOCKED |
| design-child workspace | STRUCTURALLY_CORRECT_VISUALLY_WRONG (mobile) |
| design-child sections | REFERENCE_LOCKED (in-shell remap) |
| design-overlay-chrome | LEGACY_LOCKED |

**Tree complete:** yes.
