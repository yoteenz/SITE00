# P0.VR.DESIGN-RELEASE429-EXACT-RESTORE1 — restoration manifest

**SOURCE RELEASE:** GitHub production release #429 — *GROK: staged visual support pack for the seven project-level tabs* (PR #1010)  
**SOURCE COMMIT:** `441ae433`

## Release #429 DESIGN inventory (441ae433)

| Area | Primary paths |
|------|----------------|
| Route / layout | `src/site00/pages/DesignTwinOpusDirectPage.tsx`, `Site00Routes.tsx` → `DesignTwinOpusDirectRouteGate`, `DesignTwinWorkspaceLayout` |
| DESIGN shell | `TwinOpusDirectScreen.tsx`, `TwinOpusDirectOverlays.tsx`, `twinOpusDirectWorkspace.ts` |
| Overview workspace | Canonical/List bodies, hero, authority rail, candidate gallery (opusDirect + production sections) |
| Project-level tabs | `production/projectTabs/*` (References, Assets, Pages, Skins, History, More) |
| Tab grammar | `designProjectSurfaceKit.tsx`, `site00-design-project-surface.css` |
| In-shell child frame | `DesignProductionSectionInShell.tsx`, `site00-design-child-surface.css` |
| Page System Review / Pipeline | overlays + production section wiring (unchanged post-429) |
| Mobile / desktop | `data-shell-format` on `.tod-screen`; tab surfaces use `ProjectSurface` + `data-format` |
| Hamburger / drawers | `TwinOpusDirectOverlays.tsx`, overlay kit CSS |
| View mode control | `TwinOpusDirectViewModeControl.tsx` at 429 (text labels; icons re-applied post-restore) |

**File count:** 69 files under `src/site00/components/designBench/` at `441ae433`.  
**Post-429 diff (current):** exactly **7 paths** — see table below. All other DESIGN bench files are **byte-identical** to release #429.

## DESIGN files changed after 441ae433 (inventory)

| Path | Action |
|------|--------|
| `src/site00/components/designBench/production/designProjectSurfaceKit.tsx` | RESTORE 441ae433 → REAPPLY dock/scroll split |
| `src/site00/styles/site00-design-project-surface.css` | RESTORE 441ae433 → REAPPLY dock/scroll CSS |
| `src/site00/styles/site00-design-child-surface.css` | RESTORE 441ae433 → REAPPLY inline flex (dock) |
| `src/site00/components/designBench/opusDirect/TwinOpusDirectViewModeControl.tsx` | RESTORE 441ae433 → REAPPLY Grok icons |
| `src/site00/components/designBench/opusDirect/designViewModeGrokIcons.tsx` | PRESERVE (post-429 intentional) |
| `src/site00/styles/site00-twin-opus-direct.css` | RESTORE 441ae433 → REAPPLY viewmode icon CSS if needed |
| `src/routes/Site00Routes.tsx` | PRESERVE (EXPERIENCE Site00Layout) |

## Unchanged since 441ae433 (no restore needed)

All other `designBench/**`, project tab surfaces, TwinOpusDirectScreen, overlays, routes to DESIGN production.

## Post-429 test files (preserve)

`p0vrDesignInShellDockPositioningFix1.test.ts`, `p0vrDesignViewmodeIconReapply1.test.ts`, `p0vrDesignRegressionRecovery1.test.ts`, `p0vrDesignMorningGoodStateRecovery1.test.ts`, `p0vrDesignBenchOpusDirect.test.ts` (partial updates)
