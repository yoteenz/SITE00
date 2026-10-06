/**
 * P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1 — export the shared contracts
 * (single source: src/site00/config/production-workspace-density.ts) to the sprint artifact folder.
 *   npx tsx scripts/production-workspace/density-contracts-export.ts
 */
import { writeFileSync } from 'node:fs';
import {
  WORKSPACE_AUTHORITY_ARTBOARD,
  WORKSPACE_MAX_SCALE_WIDTH,
  WORKSPACE_MEDIA_FRAME_OWNERSHIP,
  WORKSPACE_MEDIA_FIT_MODES,
  WORKSPACE_MEDIA_SLOTS,
  WORKSPACE_PANEL_DENSITY,
  WORKSPACE_TYPE_DEVIATION_LIMIT,
  WORKSPACE_TYPE_SCALE,
  WORKSPACE_TYPE_TIERS,
  workspaceTypePx,
} from '../../src/site00/config/production-workspace-density';
import { WORKSPACE_PANEL_DEFAULT_SLOT } from '../../src/site00/components/productionAuthority/WorkspacePanel';

const DIR = 'docs/site00/production-workspace/refinements/responsive-density-media1';
const SPRINT = 'P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1';
const write = (name: string, data: unknown) => writeFileSync(`${DIR}/${name}`, `${JSON.stringify(data, null, 2)}\n`);
const r2 = (n: number) => Math.round(n * 100) / 100;
const families = ['mobile', 'tablet', 'desktop'] as const;
const widths = { mobile: [360, 393, 430], tablet: [834, 1024], desktop: [1440, 1920] } as const;

write('SITE00_WORKSPACE_TYPE_SCALE_CONTRACT.json', {
  sprint: SPRINT,
  name: 'WorkspaceTypeScale',
  authority: 'HUB (site00-production-hub-reconstruction.css) — one authority px = container width / artboard',
  source: { ts: 'src/site00/config/production-workspace-density.ts', css: 'src/site00/styles/site00-production-workspace-density.css' },
  formula: 'size = max(floorPx, authorityUnits × min(width, maxScaleWidth) / artboard)',
  artboard: WORKSPACE_AUTHORITY_ARTBOARD,
  maxScaleWidth: WORKSPACE_MAX_SCALE_WIDTH,
  deviationLimit: WORKSPACE_TYPE_DEVIATION_LIMIT,
  rules: [
    'T6 (display) is rare: at most one hero title per ROOT tab, never above HUB’s own display size.',
    'Root tabs and child pages otherwise top out at T5 (workspace page title).',
    'Child pages may change composition / content / hierarchy but never reset the scale.',
    'No zoom, no transform: scale, no root font-size shrink — every internal layer is mapped to a tier.',
  ],
  tiers: WORKSPACE_TYPE_TIERS.map((t) => ({
    ...t,
    perFamily: Object.fromEntries(
      families.map((f) => [f, { authorityUnits: WORKSPACE_TYPE_SCALE[f][t.tier].au, floorPx: WORKSPACE_TYPE_SCALE[f][t.tier].floorPx, px: Object.fromEntries(widths[f].map((w) => [w, r2(workspaceTypePx(f, t.tier, w))])) }]),
    ),
  })),
});

write('SITE00_WORKSPACE_PANEL_DENSITY_CONTRACT.json', {
  sprint: SPRINT,
  name: 'WorkspacePanel',
  authority: 'HUB --pad / --row-gap / --card-pad / thumb tokens',
  tokens: {
    '--pw-gutter': 'page gutter (HUB --pad)',
    '--pw-gap': 'inter-panel gap (HUB --row-gap)',
    '--pw-pad': 'panel inner padding',
    '--pw-target': 'minimum control / row touch target',
    '--pw-thumb-row': 'row thumbnail (HUB --op-thumb)',
    '--pw-thumb-strip': 'strip / entry thumbnail (HUB --entry-img)',
    '--pw-media-card': 'card media cap (HUB --feature-h)',
    '--pw-media-feature': 'feature media cap',
    '--pw-media-portrait': 'portrait / document cap',
    '--pw-media-capture': 'UI capture cap',
    '--pw-hero-h': 'hero plate band (HUB --hero-h)',
  },
  perFamily: WORKSPACE_PANEL_DENSITY,
  layoutModes: Object.entries(WORKSPACE_PANEL_DEFAULT_SLOT).map(([layout, slot]) => ({ layout, defaultSlot: slot })),
  zones: ['MEDIA SLOT', 'TEXT SLOT (title T3, clamp 2)', 'METADATA SLOT (T0, clamp 3)', 'ACTION SLOT', 'PADDING --pw-pad', 'GAP --pw-pad / --pw-gap'],
  mobileStack: 'MEDIA_LEFT_TEXT_RIGHT stacks when the PANEL is narrower than 300px (container query) — never squeezed text, never a cropped-to-nothing thumbnail.',
});

write('SITE00_WORKSPACE_MEDIA_SLOT_CONTRACT.json', {
  sprint: SPRINT,
  name: 'WorkspaceMediaSlot',
  centralRule: 'Panel geometry defines the media slot; the source never sizes the panel. Media adapts to the panel.',
  declaration: 'data-media-slot (box) + data-media-fit (cover / contain + default focal) + --pw-focal (explicit focal metadata)',
  scope: {
    geometryDefaults: 'mobile (≤699px), shared primitive (.pw-media) — tablet / desktop compositions keep their approved media boxes',
    caps: 'a max size is enforced through the inline size: min(100%, maxBlock × aspect) — the aspect always holds, a cap never crushes a frame into an undeclared strip',
    containFits: 'all widths, strong (a declared no-crop beats an inherited cover)',
    coverAndDefaultFocal: 'zero-specificity defaults (art-directed crops keep zoom + position)',
    explicitFocal: 'all widths, strong',
  },
  frameOwnership: WORKSPACE_MEDIA_FRAME_OWNERSHIP,
  missingAsset: 'slot keeps its geometry and renders the named empty state (data-asset-state="missing"); no broken-image icon; row-scale slots (ROW_THUMB / LOGO_MARK) keep the hatched state and move the name to the tooltip',
  slots: WORKSPACE_MEDIA_SLOTS,
});

write('SITE00_WORKSPACE_MEDIA_FIT_MODES.json', { sprint: SPRINT, fitModes: WORKSPACE_MEDIA_FIT_MODES });
console.log('exported 4 contracts');
