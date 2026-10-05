# STALE FALLBACK MAP

Locations where descendants can fall back to legacy or generic UI. **Do not fix in COMPOSER1.**

| # | Current route / state | Stale component / source | Correct parent authority | Severity | Reconstruction priority |
|---|------------------------|-------------------------|---------------------------|----------|-------------------------|
| 1 | `/production?view=machine` | `ProductionHub` 864-space | hub-root `.pxa` (or documented parallel legacy) | P0 | 1 (decision: keep legacy vs converge) |
| 2 | `/production/ndxbook/design/workspace` | Twin-opus `DesignProductionWorkspaceLayout` | design-root chamber + mode bar | P1 | 2 |
| 3 | Engine buttons → `/projects/ndxbook/content-operations/expression-engine` | Expression engine content-ops | expression-child-* floors | P1 | 3 |
| 4 | Mobile `ph-top` / `ph-nav` | Hub 864-space chrome strip | pxa authority chrome dimensions | P2 | 4 (shared with machine/CF/overlay) |
| 5 | `/production/ndxbook/experience/*` empty body | Generic empty block (risk if copy/plates removed) | experience-root world plate + capsules | P2 | 5 (after mount) |

## GENERICIZATION_RISK surfaces

| Surface | Risk |
|---------|------|
| design-child-workspace | Generic design-tool / admin bench |
| inbox-queue-list | Generic CRM request list |
| library-collections | Generic DAM card grid |
| expression-engine-legacy | Generic content-ops / AI workspace |

## Regression triggers (watch during Opus rebuild)

- Re-import `PW_IMG` production-mobile plates into authority roots
- MODULES deep link to `/projects/.../experience/...` (removed Opus2 — do not restore without mount)
- White-on-white twin-opus rails if production-provisional remap bypassed
- Lime NME literals outside `.pw--authority` scoping

Full manifest: [nodes.manifest.json](./nodes.manifest.json) → `staleFallbacks`, `genericizationRisks`.
