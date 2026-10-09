/**
 * P0.SITE00.BUILDER.TEMPLATE-AND-ESTIMATE-SELECTION-EXPERIENCE1 — export the Builder ↔ estimator mapping and the
 * pricing evidence (every figure computed by the canonical estimator, version-stamped).
 *
 *   npx tsx scripts/site00/builder-experience-export.ts
 *
 * Edit the TypeScript in src/site00/builder-experience, never the JSON. A test keeps the export in sync.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { DEFAULT_ASSUMPTIONS } from '../../src/studioos/estimation/assumptions';
import { toClientBlueprintEstimate } from '../../src/studioos/estimation/clientContract';
import { estimateProject } from '../../src/studioos/estimation/engine';
import { FIXTURES } from '../../src/studioos/estimation/fixtures';
import { ESTIMATOR_VERSION } from '../../src/studioos/estimation/version';
import {
  BUILDER_CONTRACT_VERSION,
  BUILDER_DOCTRINE,
  BUILDER_SAMPLES,
  BUILDER_SPRINT,
  CAPABILITIES,
  CONFIDENCE_LABELS,
  DOCUMENT_LABELS,
  EXPERIENCES,
  EXPERIENCE_DEPTHS,
  EXPRESSIONS,
  IMAGE_WORLDS,
  MOTION_CHARACTERS,
  PRIORITY_REQUIRES_FEASIBLE_COMPRESSION,
  STAGE_CONFIDENCE,
  STRUCTURES,
  VIEWPORT_MAP,
  WORLD_INPUT_MAP,
  builderEstimateView,
  builderScopeSignal,
  deriveBuildLevel,
  emptySelection,
  toEstimateConfig,
  type BuilderSelection,
} from '../../src/site00/builder-experience/index';

export const BUILDER_DOCS_DIR = 'docs/site00/builder-experience';
const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;

/** Reference configurations a client could realistically build. Used only as pricing evidence. */
export const REFERENCE_SELECTIONS: Record<string, { label: string; selection: BuilderSelection }> = {
  SITE_MINIMUM: {
    label: 'Smallest real site: front door (home, about, contact) and one offer page, essential edition',
    selection: { ...emptySelection(), build: 'SITE', structure: 'SERVICE', expression: { primary: 'ARCHITECTURAL_MINIMAL', secondary: null, likedParts: [], edition: 'ESSENTIAL' }, experiences: [{ id: 'HOME', depth: 'ESSENTIAL' }, { id: 'ABOUT', depth: 'ESSENTIAL' }, { id: 'CONTACT', depth: 'ESSENTIAL' }, { id: 'SERVICES', depth: 'ESSENTIAL' }], keepItSimple: true },
  },
  SITE_SIMPLE_TYPICAL: { label: 'Typical simple practice site (Service grammar, self-editable)', selection: BUILDER_SAMPLES.SIMPLE_SERVICE },
  SITE_SIMPLE_BOOKING: { label: 'Simple hospitality site with booking', selection: BUILDER_SAMPLES.SIMPLE_HOSPITALITY },
  SITE_ADVANCED: { label: 'Advanced editorial site with membership', selection: BUILDER_SAMPLES.ADVANCED_EDITORIAL },
  SITE_CUSTOM: { label: 'Custom-direction commerce site', selection: BUILDER_SAMPLES.CUSTOM_COMMERCE },
  WORLD_MINIMUM: {
    label: 'Smallest world: a few places, look-only, flat illustrated, guided path',
    selection: { ...emptySelection(), build: 'WORLD', world: { form: 'ESTATE', places: 'FEW', moments: 'FEW', thingsToDo: 'LOOK', inhabitants: 'NONE', change: 'STILL', depth: 'FLAT', wayfinding: 'GUIDED_PATH' }, expression: { primary: 'SOFT_ORGANIC', secondary: null, likedParts: [], edition: 'ESSENTIAL' } },
  },
  WORLD_SHOWROOM: { label: 'Dimensional showroom world', selection: BUILDER_SAMPLES.WORLD_SHOWROOM },
  SYSTEM_PORTAL: { label: 'Client portal system', selection: BUILDER_SAMPLES.SYSTEM_PORTAL },
  HYBRID_LARGE: { label: 'Practice site with a members platform (17 families)', selection: BUILDER_SAMPLES.LARGE_HYBRID },
};

function evidenceRow(selection: BuilderSelection) {
  const early = builderEstimateView(selection, 'SELF_SERVE');
  const reviewed = builderEstimateView(selection, 'FOUNDER_REVIEWED');
  return {
    build: selection.build,
    buildLevel: early.buildLevel,
    scopeSignal: builderScopeSignal(selection).signal,
    initialRange: { window: early.delivery.standard.window, investment: early.delivery.standard.investment },
    refinedRange: { window: reviewed.delivery.standard.window, investment: reviewed.delivery.standard.investment },
    priority: early.delivery.priority.available
      ? { available: true, window: early.delivery.priority.window, investment: early.delivery.priority.investment, sooner: early.delivery.priority.sooner }
      : { available: false },
  };
}

function fixtureRows() {
  return Object.entries(FIXTURES).map(([id, config]) => {
    const row = (delivery: 'STANDARD' | 'PRIORITY') => {
      const cfg = { ...config, deliveryMode: delivery };
      const outcome = estimateProject(cfg);
      if (!outcome.ok) return { error: outcome.errors };
      const client = toClientBlueprintEstimate(cfg, outcome.result);
      return { window: client.productionWindow, investment: client.investmentRange, complexity: client.complexity, priorityFeasible: outcome.result.priorityFeasible };
    };
    return { fixture: id, standard: row('STANDARD'), priority: row('PRIORITY') };
  });
}

export function buildBuilderExports(): Record<string, string> {
  return {
    'BUILDER_CLIENT_ESTIMATOR_MAPPING.json': json({
      id: 'BUILDER_CLIENT_ESTIMATOR_MAPPING',
      sprint: BUILDER_SPRINT,
      doctrine: BUILDER_DOCTRINE,
      builderContractVersion: BUILDER_CONTRACT_VERSION,
      estimatorVersion: ESTIMATOR_VERSION,
      generatedBy: 'scripts/site00/builder-experience-export.ts',
      source: 'src/site00/builder-experience',
      rule: 'The Builder maps client choices onto estimator enums. The estimator computes every window, range, level band and priority effect. No weights or rates live in the Builder.',
      fieldMap: {
        projectType: 'BUILD kind (SITE / WORLD / SYSTEM / HYBRID); a site that adds A WORLD INSIDE becomes HYBRID.',
        buildLevel: 'Derived: the lowest of SIMPLE / ADVANCED / CUSTOM that honours every choice (rules.deriveBuildLevel). Feature levels come from the estimator registry allowedBuildTypes.',
        structuralArchetype: 'STRUCTURE (PORTAL when a SYSTEM build has no structure yet; null for a world-only build).',
        visualSystemId: 'EXPRESSION primary (null for CUSTOM creative direction).',
        visualComplexity: 'Derived from edition, tuning, secondary influence, motion, image world and world depth (rules.visualComplexityFor). FULL edition uses the estimator registry complexity of the system.',
        families: 'FAMILIES (experiences). Front-door experiences share one family; each other experience is one family; depth sets descendants.',
        systems: 'Always [] — signed-in experiences are already families.',
        featureIds: 'FEATURES (capabilities and what they come with), plus motion / image-world / world-depth features.',
        responsiveMode: 'Viewports choice; any world part uses SPATIAL_RESPONSIVE.',
        worldScopes: 'WORLD choices through WORLD_INPUT_MAP.',
        identityScope: 'SEPARATE when the client needs a brand first (IDNTY), otherwise NONE.',
        deliveryMode: 'DELIVERY.',
        reviewRounds: `DEFAULT_ASSUMPTIONS.defaultReviewRounds (${DEFAULT_ASSUMPTIONS.defaultReviewRounds}).`,
        clientReviewSlaDays: `DEFAULT_ASSUMPTIONS.clientReviewSlaDays (${DEFAULT_ASSUMPTIONS.clientReviewSlaDays}).`,
        confidenceLevel: STAGE_CONFIDENCE,
        documentKind: 'Always ESTIMATE from the Builder. QUOTE and LOCKED_SCHEDULE are founder actions.',
        riskFlags: 'BRAND_NOT_FINAL when brand is not READY; CLIENT_CONTENT_PENDING when content is not READY. The estimator adds the rest.',
        manualModifiers: 'Always [] — overrides are founder actions in Studio OS.',
      },
      worldInputMap: WORLD_INPUT_MAP,
      viewportMap: VIEWPORT_MAP,
      experienceDepths: EXPERIENCE_DEPTHS,
      structures: STRUCTURES.map((s) => ({ id: s.id, label: s.label, scopeHint: s.scopeHint, starterExperiences: s.starterExperiences, optionalExperiences: s.optionalExperiences, compatibleExpressions: s.compatibleExpressions })),
      expressions: EXPRESSIONS.map((e) => ({ id: e.id, label: e.label, defaults: e.defaults })),
      capabilities: CAPABILITIES.map((c) => ({ id: c.id, verb: c.verb, features: c.features, comesWith: c.comesWith, addsExperiences: c.addsExperiences })),
      experiences: EXPERIENCES.map((e) => ({ id: e.id, label: e.label, group: e.group, familyClass: e.familyClass, needsCapability: e.needsCapability ?? null })),
      imageWorlds: IMAGE_WORLDS.map((i) => ({ id: i.id, scopeHint: i.scopeHint })),
      motion: MOTION_CHARACTERS.map((m) => ({ id: m.id, scopeHint: m.scopeHint })),
      confidenceLabels: CONFIDENCE_LABELS,
      documentLabels: DOCUMENT_LABELS,
      priorityRule: { PRIORITY_REQUIRES_FEASIBLE_COMPRESSION, note: 'Recommended; founder decision F4.' },
      sampleConfigs: Object.fromEntries(Object.entries(BUILDER_SAMPLES).map(([id, s]) => {
        const c = toEstimateConfig(s);
        return [id, { buildLevel: deriveBuildLevel(s).level, projectType: c.projectType, visualComplexity: c.visualComplexity, families: c.families.map((f) => `${f.label} · ${f.familyClass} · ${f.descendantCount}`), featureIds: c.featureIds, worldScopes: c.worldScopes, responsiveMode: c.responsiveMode }];
      })),
    }),
    'BUILDER_PRICING_EVIDENCE.json': json({
      id: 'BUILDER_PRICING_EVIDENCE',
      sprint: BUILDER_SPRINT,
      estimatorVersion: ESTIMATOR_VERSION,
      generatedBy: 'scripts/site00/builder-experience-export.ts',
      note: 'Client-facing windows and investments use presentation policy 1.0.0. Raw estimator math is unchanged. Nothing here is a published price or an agreed contract.',
      publicAnchorsToday: {
        source: 'src/site00/config/bldr-classification.ts · builder.ts · bldr-entry.ts',
        SITE: 'FROM $4K+',
        WORLD: 'FROM $10K+',
        ENTERPRISE: 'FROM $25K+',
        IDNTY: 'FROM $1,750 / $2,500 / $3,500 (separate offer)',
      },
      engineFloors: { ...DEFAULT_ASSUMPTIONS.buildFloors, includedFamilyUnitsInFloor: DEFAULT_ASSUMPTIONS.includedFamilyUnits, priorityPriceMultiplier: DEFAULT_ASSUMPTIONS.priorityPriceMultiplier },
      references: Object.fromEntries(Object.entries(REFERENCE_SELECTIONS).map(([id, r]) => [id, { label: r.label, ...evidenceRow(r.selection) }])),
      fixtures: fixtureRows(),
    }),
  };
}

if (process.argv[1] && /builder-experience-export\.ts$/.test(process.argv[1])) {
  mkdirSync(BUILDER_DOCS_DIR, { recursive: true });
  const files = buildBuilderExports();
  for (const [name, body] of Object.entries(files)) writeFileSync(`${BUILDER_DOCS_DIR}/${name}`, body);
  console.log(`exported ${Object.keys(files).length} files to ${BUILDER_DOCS_DIR}`);
}
