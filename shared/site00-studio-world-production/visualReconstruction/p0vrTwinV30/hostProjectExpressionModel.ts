/**
 * P0.VR.TWINV3.0R3 — formal host / project / system layer model (authority text).
 */

export const HOST_PROJECT_EXPRESSION_CORE_RULE =
  'SITE 00 provides the architecture. The active project provides the atmosphere.' as const;

export const HOST_CONTROLS_STABLE_RULE =
  'Host controls are visually stable. Workspace surfaces are project-reactive.' as const;

export const DESIGN_PAGE_V3_LAYER_MODEL = {
  hostShell: {
    owner: 'SITE 00',
    owns: [
      'global shell',
      'global navigation',
      'breadcrumbs / wayfinding',
      'notifications / account',
      'global page frame',
      'host typography (Martian Mono)',
      'workspace chrome',
      'host safe area',
      'host errors / alerts',
      'host approval / system status',
    ],
    visual: 'Bright white/off-white, black, SITE 00 red (reserved), Martian Mono, clean geometry',
  },
  activeProjectWorkspace: {
    owner: 'ACTIVE PROJECT (pilot: NDXBOOK)',
    owns: [
      'primary workspace accents',
      'artifact framing',
      'project-specific type',
      'project palette (lime for NDXBOOK)',
      'project imagery',
      'project material / visual language',
    ],
  },
  systemCompilerMeta: {
    owner: 'SITE 00',
    owns: [
      'compiler readiness',
      'build readiness',
      'lineage',
      'failure states',
      'package checksum',
      'provider / debug',
      'host boundary',
    ],
  },
} as const;

export const DESIGN_PAGE_V3_TERRITORY_DEFINITIONS = {
  A: {
    id: 'A' as const,
    name: 'CENTRAL STAGE',
    spatialIdea:
      'Primary artifact large and central; workflow and support orbit the stage; SITE 00 shell quiet; NDXBOOK atmosphere dominant in center.',
  },
  B: {
    id: 'B' as const,
    name: 'EDITORIAL WORKBENCH',
    spatialIdea:
      'Asymmetric working surface; artifact + decision layer form primary composition; technical tools as secondary edge elements; editorial NDXBOOK rhythm.',
  },
  C: {
    id: 'C' as const,
    name: 'SPATIAL WORKFLOW',
    spatialIdea:
      'Pipeline as one continuous environment; workflow states, artifacts, and readiness connected through space — not a stack of cards.',
  },
} as const;

export type DesignPageV3TerritoryId = keyof typeof DESIGN_PAGE_V3_TERRITORY_DEFINITIONS;

export const DESIGN_PAGE_V3_FOUNDER_TERRITORY_VERDICTS = [
  'LOVE_IT',
  'PROMISING',
  'TOO_GENERIC',
  'WRONG_PROJECT_EXPRESSION',
  'NOT_SITE_00',
] as const;

export type DesignPageV3FounderTerritoryVerdict = (typeof DESIGN_PAGE_V3_FOUNDER_TERRITORY_VERDICTS)[number];
