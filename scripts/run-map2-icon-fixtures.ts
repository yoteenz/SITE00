/**
 * Emit MAP2 icon expression fixtures.
 *   npx tsx scripts/run-map2-icon-fixtures.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { runGreenfieldMap2Pipeline } from '../src/studioos/experience-compiler/map2/map2Orchestrator';
import { buildSite00IngestFixture } from '../src/studioos/experience-compiler/map2/site00Ingest';
import { runIconPipeline } from '../src/studioos/experience-compiler/icons/iconPipeline';

const OUT = path.join(path.resolve(import.meta.dirname ?? '.', '..'), 'docs/studioos/experience-compiler/MAP2');
fs.mkdirSync(OUT, { recursive: true });

const gf = runGreenfieldMap2Pipeline();
const icon = gf.icon_pipeline!;

const site00 = buildSite00IngestFixture();
const site00Icon = runIconPipeline({
  project_id: 'site00',
  graph: site00.graph,
  families: [],
  surface_expressions: [],
  auto_approve_family: false,
});

const write = (name: string, data: unknown) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2));

write('MAP2_ICON_REQUIREMENTS_EXAMPLE.json', icon.icon_requirements);
write('MAP2_ICON_EXPRESSION_EXAMPLE.json', icon.icon_expression);
write('MAP2_ICON_FAMILY_EXAMPLE.json', icon.icon_family);
write('MAP2_ICON_SURFACE_VARIANTS_EXAMPLE.json', { variants: icon.icon_surface_variants });
write('MAP2_ICON_AUTHORITY_PLAN_EXAMPLE.json', icon.icon_family_authority);
write('MAP2_ICON_MANIFEST_EXAMPLE.json', icon.icon_manifest);
write('MAP2_MICRO_ASSET_MANIFEST_EXAMPLE.json', icon.micro_asset_family ?? { note: 'none for minimal fixture' });
write('MAP2_GROK_ICON_HANDOFF_EXAMPLE.json', icon.grok_handoff);
write('MAP2_SITE00_ICON_INGEST_SUMMARY.json', {
  requirements_count: site00Icon.icon_requirements.requirements.length,
  coverage: site00Icon.icon_coverage,
  existing_brand_notes: 'Classify only — no public redesign',
});

console.log('Icon fixtures written to', OUT);
