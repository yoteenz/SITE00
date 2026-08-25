/**
 * SITE 00 project capability registry — runtime availability per project.
 * Project classification ≠ runtime capability (WORLD type does not imply WORLD_FORMATION).
 */

import type { Site00ProjectType } from './projectTypes.js';

export const PROJECT_CAPABILITIES = [
  'PROJECT_CORE',
  'ORIGIN_INGESTION',
  'CLIENT_TRUTH',
  'BRAND_INTELLIGENCE',
  'BRAND_LORE',
  'CREATIVE_APPETITE',
  'PERSONALITY_REPLAY',
  'CANONICAL_CREATIVE_RANGE',
  'CANONICAL_CAROUSEL_EXPANSION',
  'CREATIVE_CONCEPT_TERRITORIES',
  'BRAND_CHARACTER',
  'BRAND_MARKETING_EXPRESSION',
  'CONTENT_OPERATIONS',
  'CAMPAIGN_PRODUCTION',
  'FOUNDER_CREATIVE_INGESTION',
  'FILM_PRODUCTION',
  'CINEMATIC_REALISM_LAB',
  'DAILY_PUBLISHING',
  'CULTURAL_INTELLIGENCE',
  'MOTION_CHARACTER',
  'EMBODIED_CHARACTER_DISCOVERY',
  'FOUNDER_CHARACTER_DISCOVERY',
  'CHARACTER_CONTINUITY',
  'CHARACTER_VISUAL_CASTING',
  'EXPERIENCE_EXPRESSION',
  'CREATIVE_LINEAGE',
  'JUDGMENTS',
  'CANONICAL_SNAPSHOTS',
  'GENERATION',
  'PROJECT_INTELLIGENCE',
  'STUDIO_WORLD_EXECUTION',
  'PROJECT_WORKSPACE',
  'BLUEPRINT',
  'ASSET_VAULT',
  'WORLD_FORMATION',
  'PRODUCTION_HANDOFF',
] as const;

export type ProjectCapability = (typeof PROJECT_CAPABILITIES)[number];

/** Capabilities that must never be reported active — runtime not implemented. */
export const DEFERRED_RUNTIME_CAPABILITIES: readonly ProjectCapability[] = [
  'WORLD_FORMATION',
  'PRODUCTION_HANDOFF',
] as const;

const BASE_CAPABILITIES: readonly ProjectCapability[] = ['PROJECT_CORE'];

const ORIGIN_CAPABILITIES: readonly ProjectCapability[] = [
  'ORIGIN_INGESTION',
  'CLIENT_TRUTH',
];

const INTELLIGENCE_CAPABILITIES: readonly ProjectCapability[] = [
  'PROJECT_INTELLIGENCE',
  'BRAND_INTELLIGENCE',
];

/** NDXBOOK methodology — preserves all current founder production surfaces. */
export const NDXBOOK_METHODOLOGY_CAPABILITIES: readonly ProjectCapability[] = [
  ...BASE_CAPABILITIES,
  ...ORIGIN_CAPABILITIES,
  ...INTELLIGENCE_CAPABILITIES,
  'BRAND_LORE',
  'CREATIVE_APPETITE',
  'PERSONALITY_REPLAY',
  'CANONICAL_CREATIVE_RANGE',
  'CANONICAL_CAROUSEL_EXPANSION',
  'CREATIVE_CONCEPT_TERRITORIES',
  'BRAND_CHARACTER',
  'BRAND_MARKETING_EXPRESSION',
  'CONTENT_OPERATIONS',
  'CAMPAIGN_PRODUCTION',
  'FOUNDER_CREATIVE_INGESTION',
  'FILM_PRODUCTION',
  'CINEMATIC_REALISM_LAB',
  'DAILY_PUBLISHING',
  'CULTURAL_INTELLIGENCE',
  'MOTION_CHARACTER',
  'EMBODIED_CHARACTER_DISCOVERY',
  'FOUNDER_CHARACTER_DISCOVERY',
  'CHARACTER_CONTINUITY',
  'CHARACTER_VISUAL_CASTING',
  'EXPERIENCE_EXPRESSION',
  'CREATIVE_LINEAGE',
  'JUDGMENTS',
  'CANONICAL_SNAPSHOTS',
  'GENERATION',
  'STUDIO_WORLD_EXECUTION',
  'PROJECT_WORKSPACE',
  'BLUEPRINT',
];

/** Astral World — minimal pre-ingestion project; no methodology or formation. */
export const ASTRAL_WORLD_CAPABILITIES: readonly ProjectCapability[] = [
  ...BASE_CAPABILITIES,
  ...ORIGIN_CAPABILITIES,
  'PROJECT_INTELLIGENCE',
];

/** Other founder projects — project core + intelligence where applicable. */
export const DEFAULT_FOUNDER_CAPABILITIES: readonly ProjectCapability[] = [
  ...BASE_CAPABILITIES,
  'PROJECT_INTELLIGENCE',
  'BRAND_INTELLIGENCE',
];

const CAPABILITY_BY_SLUG: Record<string, readonly ProjectCapability[]> = {
  ndxbook: NDXBOOK_METHODOLOGY_CAPABILITIES,
  'astral-world': ASTRAL_WORLD_CAPABILITIES,
  'frontal-slayer': DEFAULT_FOUNDER_CAPABILITIES,
  'studio-world': [...DEFAULT_FOUNDER_CAPABILITIES, 'STUDIO_WORLD_EXECUTION'],
  'all-in-one-enterprises': DEFAULT_FOUNDER_CAPABILITIES,
};

export function getCapabilitiesForSlug(slug: string): ProjectCapability[] {
  const normalized = slug.trim().toLowerCase();
  const base = CAPABILITY_BY_SLUG[normalized] ?? [...BASE_CAPABILITIES];
  return base.filter((c) => !DEFERRED_RUNTIME_CAPABILITIES.includes(c));
}

export function hasProjectCapability(slug: string, capability: ProjectCapability): boolean {
  if (DEFERRED_RUNTIME_CAPABILITIES.includes(capability)) return false;
  return getCapabilitiesForSlug(slug).includes(capability);
}

export function getActiveAndUnavailableCapabilities(slug: string): {
  active: ProjectCapability[];
  unavailable: ProjectCapability[];
} {
  const active = getCapabilitiesForSlug(slug);
  const unavailable = PROJECT_CAPABILITIES.filter((c) => !active.includes(c));
  return { active, unavailable };
}

/** Map API action prefix to required capability. */
export function capabilityForAction(action: string): ProjectCapability | null {
  if (action.startsWith('personality_replay')) return 'PERSONALITY_REPLAY';
  if (action.startsWith('canonical_creative_range')) return 'CANONICAL_CREATIVE_RANGE';
  if (action.startsWith('canonical_carousel_expansion')) return 'CANONICAL_CAROUSEL_EXPANSION';
  if (action.startsWith('experiment_d')) return 'CREATIVE_CONCEPT_TERRITORIES';
  if (action.startsWith('experiment_f')) return 'CREATIVE_CONCEPT_TERRITORIES';
  if (action.startsWith('experiment_g')) return 'CREATIVE_CONCEPT_TERRITORIES';
  if (action.startsWith('experiment_h')) return 'BRAND_CHARACTER';
  if (action.startsWith('marketing_expression')) return 'BRAND_MARKETING_EXPRESSION';
  if (action.startsWith('content_operations')) return 'CONTENT_OPERATIONS';
  if (action.startsWith('campaign_production')) return 'CAMPAIGN_PRODUCTION';
  if (action.startsWith('founder_creative_ingestion')) return 'FOUNDER_CREATIVE_INGESTION';
  if (action.startsWith('film_production')) return 'FILM_PRODUCTION';
  if (action.startsWith('cinematic_realism_lab')) return 'CINEMATIC_REALISM_LAB';
  if (action.startsWith('daily_publishing')) return 'DAILY_PUBLISHING';
  if (action.startsWith('cultural_intelligence')) return 'CULTURAL_INTELLIGENCE';
  if (action.startsWith('motion_character')) return 'MOTION_CHARACTER';
  if (action.startsWith('embodied_character_discovery')) return 'EMBODIED_CHARACTER_DISCOVERY';
  if (action.startsWith('founder_character_discovery')) return 'FOUNDER_CHARACTER_DISCOVERY';
  if (action.startsWith('character_continuity')) return 'CHARACTER_CONTINUITY';
  if (action.startsWith('character_visual_casting')) return 'CHARACTER_VISUAL_CASTING';
  if (action.startsWith('creative_lineage')) return 'CREATIVE_LINEAGE';
  if (action.startsWith('founder_judgment')) return 'JUDGMENTS';
  if (action.startsWith('experience_expression')) return 'EXPERIENCE_EXPRESSION';
  if (action.startsWith('workspace_visual')) return 'PROJECT_WORKSPACE';
  if (action.startsWith('project_intelligence')) return 'PROJECT_INTELLIGENCE';
  if (action.startsWith('studio_world')) return 'STUDIO_WORLD_EXECUTION';
  if (action.startsWith('creative_direction') || action.startsWith('lore_calibration')) {
    return 'BRAND_LORE';
  }
  if (action.startsWith('creative_appetite')) return 'CREATIVE_APPETITE';
  if (action.startsWith('origin_')) return 'ORIGIN_INGESTION';
  if (action.startsWith('client_truth')) return 'CLIENT_TRUTH';
  return null;
}

export function defaultCapabilitiesForProjectType(
  projectType: Site00ProjectType | null,
): readonly ProjectCapability[] {
  switch (projectType) {
    case 'WORLD':
      return ASTRAL_WORLD_CAPABILITIES;
    case 'IDENTITY':
      return [...BASE_CAPABILITIES, ...ORIGIN_CAPABILITIES, ...INTELLIGENCE_CAPABILITIES, 'BRAND_LORE'];
    case 'PRODUCT':
      return [...BASE_CAPABILITIES, ...ORIGIN_CAPABILITIES, ...INTELLIGENCE_CAPABILITIES];
    case 'SITE':
    default:
      return [...BASE_CAPABILITIES, ...ORIGIN_CAPABILITIES, ...INTELLIGENCE_CAPABILITIES];
  }
}
