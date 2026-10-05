/**
 * Emit MAP2 visual asset surgery fixtures.
 *   npx tsx scripts/run-map2-visual-surgery-fixtures.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildSite00VisualSurgeryFixture } from '../src/studioos/experience-compiler/visual-surgery/site00VisualSurgery';
import { renderSceneDecompositionSheet } from '../src/studioos/experience-compiler/visual-surgery/sceneDecompositionSheet';
import { grokStartHereMarkdown, imageRulesMarkdown } from '../src/studioos/experience-compiler/visual-surgery/grokAssetPackCompiler';

const OUT = path.join(path.resolve(import.meta.dirname ?? '.', '..'), 'docs/studioos/experience-compiler/MAP2');
fs.mkdirSync(OUT, { recursive: true });

const site00 = buildSite00VisualSurgeryFixture();
const p = site00.pipeline;

const write = (name: string, data: unknown) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2));

write('MAP2_SCENE_DECOMPOSITION_EXAMPLE.json', { decompositions: p.scene_decompositions.slice(0, 3) });
write('MAP2_LAYER_OWNERSHIP_EXAMPLE.json', p.layer_ownership);
write('MAP2_IMAGE_REQUIREMENTS_EXAMPLE.json', p.image_requirements);
write('MAP2_IMAGE_FAMILY_EXAMPLE.json', { families: p.image_families.slice(0, 5) });
write('MAP2_CONTINUITY_GROUPS_EXAMPLE.json', { groups: p.continuity_groups });
write('MAP2_SURFACE_VARIANTS_EXAMPLE.json', { variants: p.surface_variants.slice(0, 12) });
write('MAP2_SAFE_ZONES_EXAMPLE.json', { maps: p.safe_zone_maps.slice(0, 5) });
write('MAP2_ASSET_DEPENDENCIES_EXAMPLE.json', { dependencies: p.asset_dependencies });
write('MAP2_ASSET_FABRICATION_SPEC_EXAMPLE.json', p.fabrication_specs.find((s) => s.asset_id === 'ENV.BLDR.COMMAND_CENTER') ?? p.fabrication_specs[0]);
write('MAP2_GROK_ASSET_PACK_EXAMPLE.json', p.grok_asset_pack);
write('MAP2_VISUAL_FAMILY_PACK_EXAMPLE.json', { packs: p.visual_family_packs });

const bldrSheet = p.scene_decompositions.find((d) => d.authority_id === '01_BLDR_COMMAND_CENTER');
if (bldrSheet) {
  fs.writeFileSync(path.join(OUT, 'MAP2_SCENE_DECOMPOSITION_SHEET_BLDR_EXAMPLE.md'), renderSceneDecompositionSheet(bldrSheet));
}

fs.writeFileSync(path.join(OUT, 'MAP2_GROK_ASSET_PACK_00_START_HERE_EXAMPLE.md'), grokStartHereMarkdown());
fs.writeFileSync(path.join(OUT, 'MAP2_IMAGE_RULES_EXAMPLE.md'), imageRulesMarkdown());

write('MAP2_SITE00_VISUAL_SURGERY_VALIDATION.json', {
  ...site00.validation,
  authority_count: site00.authority_count,
  grok_required_slots: site00.grok_required_slots,
  image_requirements: p.image_requirements.requirements.length,
  fabrication_specs: p.fabrication_specs.length,
  qa_pass_rate: p.asset_qa_preview.filter((q) => q.passed).length / p.asset_qa_preview.length,
});

console.log('Visual surgery fixtures written to', OUT);
