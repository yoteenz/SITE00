/**
 * P0.SITE00.PRODUCTION-METHODOLOGY.VISUAL-AUTHORITY-DEVELOPMENT-GATE1 — export the Visual Authority Development Gate
 * (single source: shared/studioos-visual-authority) to docs/studioos/visual-authority-development/.
 *
 *   npx tsx scripts/studioos/visual-authority-export.ts
 *
 * Every JSON there is GENERATED — edit the TypeScript, never the JSON. VISUAL_AUTHORITY_DEVELOPMENT_GATE.md is
 * hand-written. tests/studioosVisualAuthorityGate1.test.ts keeps the exports in sync.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { aio as brain, type ExperienceActor } from '../../shared/studioos-experience-brain/index.js';
import {
  AUTHORITY_FIDELITY_MODEL,
  AUTHORITY_IMPLEMENTATION_CONTRACT,
  AUTHORITY_PAGE_GENERATION_GUARD,
  AUTHORITY_REVIEW_CONTRACT,
  COMPOSITION_TERRITORY_SCHEMA,
  DEFAULT_TERRITORY_COUNT,
  LEGACY_VISUAL_AUTHORITY_POLICY,
  PORTABLE_PROJECTS,
  VISUAL_AUTHORITY_DEVELOPMENT_SCHEMA,
  VISUAL_AUTHORITY_DOCTRINE,
  VISUAL_AUTHORITY_SCHEMA_VERSION,
  VISUAL_AUTHORITY_SPRINT,
  VISUAL_AUTHORITY_STATE_MODEL,
  aio,
  samples,
  visualAuthorityRow,
} from '../../shared/studioos-visual-authority/index.js';

export const VISUAL_AUTHORITY_DOCS_DIR = 'docs/studioos/visual-authority-development';
const AT = '2026-10-06';
const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
const head = (id: string) => ({ id, schema_version: VISUAL_AUTHORITY_SCHEMA_VERSION, sprint: VISUAL_AUTHORITY_SPRINT, doctrine: VISUAL_AUTHORITY_DOCTRINE, generated_by: 'scripts/studioos/visual-authority-export.ts' });

export function buildVisualAuthorityExports(): Record<string, string> {
  const actors: ('PUBLIC' | 'CLIENT' | 'FOUNDER_STAFF')[] = ['PUBLIC', 'CLIENT', 'FOUNDER_STAFF'];
  const c = brain.AIO_IFTA_CONTRACT;
  const aioRows = actors.map((actor) =>
    visualAuthorityRow({ project_id: 'AIO', family_id: c.family_id, feature_id: c.feature_id, actor: actor as ExperienceActor, material: true, family_locked: true, experience_contract: c, brand_context: aio.AIO_BRAND_CONTEXT, legacy_surfaces: aio.AIO_IFTA_LEGACY_SURFACES, territories: [] }, AT),
  );
  const portability = samples.portabilitySamples();

  return {
    'VISUAL_AUTHORITY_DEVELOPMENT_SCHEMA.json': json(VISUAL_AUTHORITY_DEVELOPMENT_SCHEMA),
    'VISUAL_AUTHORITY_STATE_MODEL.json': json(VISUAL_AUTHORITY_STATE_MODEL),
    'COMPOSITION_TERRITORY_SCHEMA.json': json(COMPOSITION_TERRITORY_SCHEMA),
    'COMPOSITION_TERRITORY_REGISTRY.json': json({
      ...head('COMPOSITION_TERRITORY_REGISTRY'),
      note: 'No territories are authored yet. AIO IFTA territories are authored by the founder + ChatGPT test-run from the actor input packages; rows are added here when they exist.',
      territories: [],
      open_slots: actors.map((actor) => ({ project_id: 'AIO', family_id: c.family_id, feature_id: c.feature_id, actor, required: DEFAULT_TERRITORY_COUNT, authored: 0, status: 'AUTHORITY_TERRITORIES_REQUIRED', input_package: `AIO_IFTA_${actor === 'FOUNDER_STAFF' ? 'FOUNDER' : actor}_AUTHORITY_INPUT.json` })),
      row_fields: ['territory_id', 'project_id', 'family_id', 'feature_id', 'actor', 'name', 'concept', 'metaphor', 'primary_object', 'composition_logic', 'mobile_logic', 'desktop_logic', 'brand_fit', 'experience_fit', 'status', 'founder_decision'],
    }),
    'VISUAL_AUTHORITY_REGISTRY.json': json({
      ...head('VISUAL_AUTHORITY_REGISTRY'),
      row_fields: ['project_id', 'family_id', 'feature_id', 'actor', 'authority_id', 'authority_level', 'status', 'guard', 'reference_paths', 'brand_context_id', 'experience_contract_id', 'territory_id', 'core_logic_locks', 'flexible_areas', 'founder_decision', 'created_at', 'updated_at', 'supersedes'],
      rows: aioRows,
      portability: { projects: PORTABLE_PROJECTS, rows: portability.map((s) => ({ project_id: s.project_id, family_id: s.family_id, feature_id: s.feature_id, status: s.result.state, guard: s.result.guard, durable_rule: s.result.durable_rule, note: s.note })) },
      existing_authority_systems: {
        'docs/studioos/experience-compiler/SITE00_AUTHORITY_REGISTRY.json': 'SITE 00 route / screen authorities (Experience Compiler). Not replaced; SITE 00 page families enter this registry when they pass through the gate.',
        'docs/studioos/experience-compiler/SITE00_FOUNDER_CREATIVE_GATES.md': 'Compiler-level creative gates (which archetypes need new authority). This gate defines HOW that authority is developed and locked.',
      },
    }),
    'LEGACY_VISUAL_AUTHORITY_POLICY.json': json(LEGACY_VISUAL_AUTHORITY_POLICY),
    'AUTHORITY_IMPLEMENTATION_CONTRACT.json': json(AUTHORITY_IMPLEMENTATION_CONTRACT),
    'AUTHORITY_FIDELITY_MODEL.json': json(AUTHORITY_FIDELITY_MODEL),
    'AUTHORITY_REVIEW_CONTRACT.json': json(AUTHORITY_REVIEW_CONTRACT),
    'AUTHORITY_PAGE_GENERATION_GUARD.json': json(AUTHORITY_PAGE_GENERATION_GUARD),
    'AIO_IFTA_AUTHORITY_DEVELOPMENT_INPUT.json': json({ ...head('AIO_IFTA_AUTHORITY_DEVELOPMENT_INPUT'), ...aio.buildAioIftaAuthorityDevelopmentInput() }),
    'AIO_IFTA_PUBLIC_AUTHORITY_INPUT.json': json({ ...head('AIO_IFTA_PUBLIC_AUTHORITY_INPUT'), ...aio.buildAioIftaActorAuthorityInput('PUBLIC') }),
    'AIO_IFTA_CLIENT_AUTHORITY_INPUT.json': json({ ...head('AIO_IFTA_CLIENT_AUTHORITY_INPUT'), ...aio.buildAioIftaActorAuthorityInput('CLIENT') }),
    'AIO_IFTA_FOUNDER_AUTHORITY_INPUT.json': json({ ...head('AIO_IFTA_FOUNDER_AUTHORITY_INPUT'), ...aio.buildAioIftaActorAuthorityInput('FOUNDER_STAFF') }),
  };
}

if (process.argv[1] && /visual-authority-export\.ts$/.test(process.argv[1])) {
  mkdirSync(VISUAL_AUTHORITY_DOCS_DIR, { recursive: true });
  const files = buildVisualAuthorityExports();
  for (const [name, body] of Object.entries(files)) writeFileSync(`${VISUAL_AUTHORITY_DOCS_DIR}/${name}`, body);
  console.log(`exported ${Object.keys(files).length} files to ${VISUAL_AUTHORITY_DOCS_DIR}`);
}
