/**
 * SITE 00 Project Workspace — methodology constants.
 */

export const PROJECT_WORKSPACE_METHODOLOGY_VERSION = 'PROJECT_WORKSPACE_V1' as const;

export const PROJECT_WORKSPACE_OWNERSHIP = 'SITE_00_PROJECT_WORKSPACE_CANON' as const;

export const PROJECT_WORKSPACE_CONCEPT_LABEL =
  'ACTIVE WORKBENCH + DOSSIER STRUCTURAL SOPHISTICATION' as const;

/** Three-layer architecture classification. */
export const SITE00_LAYER = {
  GLOBAL_HOST_CANON: 'SITE_00_GLOBAL_HOST_CANON',
  PROJECT_WORKSPACE_CANON: 'SITE_00_PROJECT_WORKSPACE_CANON',
  CLIENT_PROJECT_EXPRESSION: 'CLIENT_PROJECT_EXPRESSION',
} as const;

export const PROJECT_WORKSPACE_ZONES = [
  'ON_THE_BENCH',
  'ACTIVE_PIECE',
  'REVIEW_TRAY',
  'WORK_HISTORY',
  'DOSSIER',
  'ASSET_VAULT',
  'PRODUCTION',
] as const;

export type ProjectWorkspaceZone = (typeof PROJECT_WORKSPACE_ZONES)[number];

export const WORKSPACE_INTERACTION_VERBS = [
  'OPEN',
  'PICK UP',
  'REVIEW',
  'COMPARE',
  'REVISE',
  'APPROVE',
  'RETURN TO BENCH',
  'VIEW HISTORY',
  'OPEN DOSSIER',
  'MOVE TO PRODUCTION',
] as const;

export const HERO_FRAME_JUDGMENTS = [
  'LOVE_THE_DIRECTION',
  'PROMISING_REVISE',
  'NOT_THE_DIRECTION',
] as const;

export type HeroFrameJudgment = (typeof HERO_FRAME_JUDGMENTS)[number] | null;

export const NDXBOOK_DISPLAY_NAME = 'NDXBOOK' as const;

export const NDXBOOK_PROHIBITED_NAME_VARIANTS = ['NDX BOOK', 'Ndxbook', 'NDX-BOOK', 'NDX_BOOK'] as const;

export const NDXBOOK_PROHIBITED_AUTO_TRAITS = [
  'historical lime as universal accent',
  'cream paper as default substrate',
  'correction marks as default chrome',
  'condensed typography as client canon',
  'Martian Mono as client typography',
] as const;

export const DOSSIER_LITERALIZATION_BLOCKED = [
  'investigative case file',
  'detective',
  'crime scene',
  'evidence board with red string',
] as const;

export const WORKBENCH_LITERALIZATION_BLOCKED = [
  'wooden desk',
  'carpentry',
  'workshop lamp',
  'physical hammer',
  'maker-space photography',
] as const;

export const EXPERIMENT_E_DISCOVERY_RECORD = {
  discoveryId: 'experiment-e-workspace-abstraction-discovery',
  sourceExperiment: 'EXPERIENCE_EXPRESSION_EXPERIMENT',
  priorClassification: 'NDXBOOK_EXPERIENCE_CONCEPT',
  currentClassification: 'SITE_00_PROJECT_WORKSPACE_CANON',
  conceptLabel: PROJECT_WORKSPACE_CONCEPT_LABEL,
  historicalRecordsImmutable: true,
  summary:
    'Experiment E revealed Active Workbench + Dossier structural sophistication generalizes to SITE 00 Project Workspace Canon — not NDXBOOK-owned Experience Concept.',
  recordedAt: '2026-08-23T00:00:00.000Z',
} as const;
