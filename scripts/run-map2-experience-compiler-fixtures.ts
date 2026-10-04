/**
 * MAP2 — emit machine-readable fixtures under docs/studioos/experience-compiler/MAP2/
 *   npx tsx scripts/run-map2-experience-compiler-fixtures.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { runGreenfieldMap2Pipeline } from '../src/studioos/experience-compiler/map2/map2Orchestrator';
import { buildSite00IngestFixture } from '../src/studioos/experience-compiler/map2/site00Ingest';
import { buildGreenfieldConceptSet } from '../src/studioos/experience-compiler/map2/creativeConcepts';
import { buildGreenfieldProjectIntelligence } from '../src/studioos/experience-compiler/map2/projectIntelligence';
import { applyGate0Action, createGate0 } from '../src/studioos/experience-compiler/map2/conceptDirectionGate';
import { expandConceptToGraph } from '../src/studioos/experience-compiler/map2/creativeExperienceGraph';

const ROOT = path.resolve(import.meta.dirname ?? '.', '..');
const OUT = path.join(ROOT, 'docs/studioos/experience-compiler/MAP2');
fs.mkdirSync(OUT, { recursive: true });

const intelligence = buildGreenfieldProjectIntelligence();
const conceptSet = buildGreenfieldConceptSet(intelligence);
const gate0 = applyGate0Action(createGate0(), 'SELECT', { concept_id: 'DIR_B_PRODUCT_LAB' });
const selected = conceptSet.concepts.find((c) => c.concept_id === 'DIR_B_PRODUCT_LAB')!;
const graphPreview = expandConceptToGraph(intelligence.project_id, selected, gate0);

const greenfield = runGreenfieldMap2Pipeline();
const site00 = buildSite00IngestFixture();

const write = (name: string, data: unknown) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2));

write('MAP2_GREENFIELD_PROJECT_INTELLIGENCE.json', intelligence);
write('MAP2_GREENFIELD_CONCEPT_DIRECTIONS.json', conceptSet);
write('MAP2_GREENFIELD_SELECTED_CONCEPT.json', selected);
write('MAP2_GREENFIELD_EXPERIENCE_GRAPH.json', greenfield.graph);
write('MAP2_GREENFIELD_FAMILIES.json', { families: greenfield.families });
write('MAP2_GREENFIELD_SURFACE_EXPRESSIONS.json', { expressions: greenfield.surface_expressions });
write('MAP2_AUTHORITY_PLAN_EXAMPLE.json', { plan: greenfield.authority_plan });
write('MAP2_OPENART_BATCH_EXAMPLE.json', { batches: greenfield.openart_batches });
write('MAP2_AUTHORITY_PACK_EXAMPLE.json', greenfield.authority_pack);
write('MAP2_SITE00_INGEST_FIXTURE.json', {
  mode: site00.mode,
  map1_node_count: site00.map1_node_count,
  graph: site00.graph,
});

console.log('MAP2 fixtures written to', OUT);
