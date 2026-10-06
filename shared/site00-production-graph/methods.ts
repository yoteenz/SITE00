/**
 * Work-domain method projections.
 *
 * DESIGN follows the eight-step page-family method (01 LOAD BRAND DNA … 08 IMPLEMENT). A node sits at exactly one
 * step, derived from its pipeline step and authority status — the strip's counts are list lengths of real nodes.
 * Step 03 (IGNORE LEGACY VISUALS) is a rule, not a stage: no node ever "sits" there, so it carries no count.
 *
 * EXPERIENCE groups a world's nodes by spatial kind (WORLD → SCENE → ZONE / PORTAL / INTERACTION / INHABITANT …).
 */
import type { ExperienceNodeType, PipelineStep, ProductionNode } from './types.js';

export type DesignMethodId = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08';

export const DESIGN_METHOD: readonly { id: DesignMethodId; label: string; rule?: true }[] = [
  { id: '01', label: 'LOAD BRAND DNA' },
  { id: '02', label: 'LOAD EXPERIENCE CONTRACT' },
  { id: '03', label: 'IGNORE LEGACY VISUALS', rule: true },
  { id: '04', label: 'CREATE 3 DISTINCT COMPOSITION TERRITORIES' },
  { id: '05', label: 'GENERATE / ASSEMBLE REFERENCE AUTHORITIES' },
  { id: '06', label: 'FOUNDER CHOOSES / REVISES' },
  { id: '07', label: 'LOCK FINAL PAGE-FAMILY AUTHORITY' },
  { id: '08', label: 'IMPLEMENT' },
];

const STEP_METHOD: Partial<Record<PipelineStep, DesignMethodId>> = {
  INTAKE: '01',
  STRUCTURE: '01',
  TREE: '02',
  EXPERIENCE_CONTRACT: '02',
  FAMILY_LOCK: '02',
  FOUNDER_VERDICT: '06',
  AUTHORITY_PACKAGE: '07',
  ACTOR_MODE_DERIVATION: '07',
  RESPONSIVE_DERIVATION: '07',
  PAGE_CONTRACT: '07',
  ASSET_SHEET: '07',
  IMPLEMENTATION: '08',
  QA: '08',
  REFINEMENT: '08',
  FOUNDER_APPROVAL: '08',
  LIVE: '08',
  LIVE_AUTHORITY_PROMOTION: '08',
};

/** The DESIGN method step a node sits at (null for nodes outside the DESIGN method, e.g. expression steps). */
export function designMethodOf(n: ProductionNode): DesignMethodId | null {
  if (n.pipeline_step === 'VISUAL_AUTHORITY_DEVELOPMENT') return n.authority_status === 'REQUIRED' ? '04' : '05';
  return STEP_METHOD[n.pipeline_step] ?? null;
}

export function isDesignMethodId(v: string | null | undefined): v is DesignMethodId {
  return !!v && DESIGN_METHOD.some((m) => m.id === v && !m.rule);
}

/** Experience node kinds in spatial order (only kinds a project actually has are shown). */
export const EXPERIENCE_KIND_ORDER: readonly ExperienceNodeType[] = [
  'WORLD',
  'ZONE',
  'ENVIRONMENT',
  'ROOM',
  'SCENE',
  'PATH',
  'PORTAL',
  'INTERACTION',
  'INHABITANT',
  'WORLD_STATE',
  'ACCESS_STATE',
  'ENVIRONMENT_ASSET',
  'SPATIAL_AUTHORITY',
  'SCENE_AUTHORITY',
  'NAVIGATION_MODEL',
  'PRESENCE_MODEL',
  'INTERACTION_CONTRACT',
];

export function experienceKinds(nodes: readonly ProductionNode[]): { kind: ExperienceNodeType; count: number }[] {
  return EXPERIENCE_KIND_ORDER.map((kind) => ({ kind, count: nodes.filter((n) => n.domain === 'EXPERIENCE' && n.node_type === kind).length })).filter((k) => k.count > 0);
}
