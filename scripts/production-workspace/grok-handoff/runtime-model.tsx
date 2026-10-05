/**
 * P0.SITE00.PRODUCTION-WORKSPACE-GROK-HANDOFF-AUDIT-LITEPACK1 — runtime model extractor.
 *
 * Reads the live Production route tables, icon sets and asset registries straight from the source (no copies),
 * so the Grok handoff manifests describe what the runtime actually mounts.
 *
 * usage: node_modules/.bin/tsx scripts/production-workspace/grok-handoff/runtime-model.tsx <out.json>
 */
import { writeFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EXPERIENCE_FAMILIES, EXPERIENCE_ROUTES, LIBRARY_FAMILIES, LIBRARY_ROUTES } from '../../../src/site00/components/productionAuthority/realm/realmRoutes';
import { EXPRESSION_FAMILIES, EXPRESSION_ROUTES } from '../../../src/site00/components/productionAuthority/expression/expressionRoutes';
import { ACTIVITY_DOMAINS, ACTIVITY_RANGES, ACTIVITY_VERBS } from '../../../src/site00/components/productionAuthority/activityLog';
import { IA_ICON_NAMES, IaIcon } from '../../../src/site00/components/productionAuthority/iaKit';
import * as HostIcons from '../../../src/site00/components/productionHub/icons';
import { DESIGN_DEVICES, DESIGN_ICON_IDS, DESIGN_PLATES, DESIGN_STAGES, DESIGN_SWATCHES } from '../../../src/site00/components/productionAuthority/designPackAssets';
import { PRODUCTION_ASSETS } from '../../../src/site00/productionAssets/productionAssetRegistry';
import { PRODUCTION_ROUTE_ASSET_MANIFESTS } from '../../../src/site00/productionAssets/routeAssetManifests';
import { VIEWPORT_PRESET_ORDER, VIEWPORT_PRESET_SIZE, VIEWPORT_ZOOMS } from '../../../src/site00/components/productionAuthority/viewportTargets';
import { CHARACTER_ASSET_RECEIPTS, buildCharacterAssetSlots } from '../../../shared/site00-character-fabrication/assets';

const out = process.argv[2];
if (!out) throw new Error('usage: runtime-model.tsx <out.json>');

const svg = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

const hostIcons = Object.entries(HostIcons)
  .filter(([name, v]) => typeof v === 'function' && /^(Ic|Reticle)/.test(name))
  .map(([name, Comp]) => ({ name, svg: svg(createElement(Comp as never, { width: 48, height: 48 })) }));

const slots = buildCharacterAssetSlots();

const model = {
  extracted_from: {
    realm: 'src/site00/components/productionAuthority/realm/realmRoutes.ts',
    expression: 'src/site00/components/productionAuthority/expression/expressionRoutes.ts',
    activity: 'src/site00/components/productionAuthority/activityLog.ts',
    ia_icons: 'src/site00/components/productionAuthority/iaKit.tsx',
    host_icons: 'src/site00/components/productionHub/icons.tsx',
    design_pack: 'src/site00/components/productionAuthority/designPackAssets.ts',
    production_assets: 'src/site00/productionAssets/productionAssetRegistry.ts',
    route_asset_manifests: 'src/site00/productionAssets/routeAssetManifests.ts',
    viewport_presets: 'src/site00/components/productionAuthority/viewportTargets.ts',
    character_fabrication_assets: 'shared/site00-character-fabrication/assets.ts',
  },
  experience: { families: EXPERIENCE_FAMILIES, routes: EXPERIENCE_ROUTES },
  library: { families: LIBRARY_FAMILIES, routes: LIBRARY_ROUTES },
  expression: { families: EXPRESSION_FAMILIES, routes: EXPRESSION_ROUTES },
  activity: { verbs: ACTIVITY_VERBS, domains: ACTIVITY_DOMAINS, ranges: ACTIVITY_RANGES },
  ia_icons: IA_ICON_NAMES.map((name) => ({ name, svg: svg(createElement(IaIcon, { name })) })),
  host_icons: hostIcons,
  design_pack: { icons: DESIGN_ICON_IDS, stages: DESIGN_STAGES, devices: DESIGN_DEVICES, plates: DESIGN_PLATES, swatches: DESIGN_SWATCHES },
  production_assets: PRODUCTION_ASSETS,
  route_asset_manifests: PRODUCTION_ROUTE_ASSET_MANIFESTS,
  viewport: { presets: VIEWPORT_PRESET_ORDER.map((p) => ({ preset: p, ...VIEWPORT_PRESET_SIZE[p] })), zooms: VIEWPORT_ZOOMS },
  character_fabrication: {
    receipts: CHARACTER_ASSET_RECEIPTS.length,
    receipt_prefixes: [...new Set(CHARACTER_ASSET_RECEIPTS.map((r) => r.canonicalAssetId.split('.').slice(0, 3).join('.')))],
    slots: slots.length,
    slots_still_requiring_grok: slots.filter((s) => s.grokRequired && !CHARACTER_ASSET_RECEIPTS.some((r) => r.slotId === s.slotId)).map((s) => s.slotId),
    environment_receipts: CHARACTER_ASSET_RECEIPTS.filter((r) => /^fabrication\.(machine|environments)\./.test(r.slotId)),
  },
};

writeFileSync(out, JSON.stringify(model, null, 1));
console.log(
  `runtime model: experience ${EXPERIENCE_ROUTES.length} · library ${LIBRARY_ROUTES.length} · expression ${EXPRESSION_ROUTES.length} · ia icons ${IA_ICON_NAMES.length} · host icons ${hostIcons.length} · assets ${PRODUCTION_ASSETS.length} · cf receipts ${CHARACTER_ASSET_RECEIPTS.length}/${slots.length}`,
);
