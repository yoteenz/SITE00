/**
 * Visual Reconstruction Engine — default tolerances and configuration.
 */

import type { ReconstructionLoopConfig } from './types.js';

export const DEFAULT_RECONSTRUCTION_LOOP_CONFIG: ReconstructionLoopConfig = {
  maxIterations: 12,
  passes: ['GEOMETRY', 'TYPOGRAPHY', 'SURFACE', 'ASSET', 'MICRO_ALIGNMENT'],
  geometryTolerancePx: 2,
  alignmentTolerancePx: 2,
  regionPassThreshold: 0.94,
  overallPassThreshold: 0.92,
  copyMatchMode: 'CANONICAL_REPOSITORY_COPY',
};

/** iOS status bar + Safari chrome heuristic heights (portrait mobile). */
export const MOBILE_IOS_CHROME = {
  statusBarHeight: 54,
  urlBarHeight: 46,
  bottomBarHeight: 82,
} as const;

export const HIGH_AUTHORITY_REGION_ROLES = new Set([
  'GLOBAL_SHELL',
  'HEADER',
  'HERO',
  'METHOD_STAGE',
  'BOTTOM_NAV',
  'EXPERIMENT_GROUP',
]);

export const SITE00_CANONICAL_COMPONENTS = [
  'EcosystemShell',
  'MobileSiteNavigation',
  'ProjectOwnerControlStrip',
  'ProjectExperimentsHubNav',
  'FounderWorkspaceShell',
  'WorkspaceNavigation',
] as const;
