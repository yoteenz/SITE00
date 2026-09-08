/**
 * P0.VR.4 — Reference Asset Reconstruction constants.
 */

import { SITE00_FAL_REFERENCE_EDIT_MODEL } from '../../../site00-visual-generation/falImageModels.js';
import { P0_VR_4_LINEAGE } from './types.js';

export { P0_VR_4_LINEAGE };

export const REFERENCE_ASSET_RECONSTRUCTION_FEATURE_LABEL = 'REFERENCE ASSETS' as const;
export const REFERENCE_ASSET_RECONSTRUCTION_ALT_LABELS = [
  'ASSET RECONSTRUCTION',
  'RECONSTRUCT PAGE ASSETS',
] as const;

export const DEFAULT_RECONSTRUCTION_MODEL = SITE00_FAL_REFERENCE_EDIT_MODEL;
export const DEFAULT_RECONSTRUCTION_PROVIDER = 'fal' as const;

export const MAX_PRIMARY_GENERATION_DISPATCHES = 1;
export const MAX_TARGETED_REVISION_PASSES = 3;

export const DESIGN_ASSETS_STORAGE_ROOT = 'design-assets';

export const PROJECTS_GOLDEN_TEST = {
  projectId: 'site00',
  pageId: 'projects-index',
  route: '/projects',
  semanticName: 'PROJECTS HEADER PLANET',
  assetType: 'HERO_OBJECT' as const,
  liveUiRole: 'PAGE_HEADER_HERO' as const,
  componentPath: 'src/site00/pages/ProjectsPage.tsx',
  componentName: 'ProjectsPage',
  assetSlot: 'header-planet-icon',
  cropRegion: { x: 24, y: 48, width: 120, height: 120, padding: 8 },
} as const;

export const PROJECTS_BULK_QUEUE_SEEDS = [
  { semanticName: 'PROJECTS HEADER PLANET', assetType: 'HERO_OBJECT' as const },
  { semanticName: 'FRONTAL SLAYER PROJECT VISUAL', assetType: 'PROJECT_VISUAL' as const },
  { semanticName: 'STUDIO WORLD PROJECT VISUAL', assetType: 'PROJECT_VISUAL' as const },
  { semanticName: 'NDXBOOK PROJECT VISUAL', assetType: 'PROJECT_VISUAL' as const },
  { semanticName: 'AIO PROJECT VISUAL', assetType: 'PROJECT_VISUAL' as const },
  { semanticName: 'ASTRAL WORLD PROJECT VISUAL', assetType: 'PROJECT_VISUAL' as const },
  { semanticName: 'CAMPAIGNS ICON', assetType: 'NAV_ICON' as const },
  { semanticName: 'CONTENT OPS ICON', assetType: 'NAV_ICON' as const },
  { semanticName: 'LAB ICON', assetType: 'NAV_ICON' as const },
] as const;

export const LIVE_UI_EXCLUSION_CLASSIFICATIONS = ['DOM_UI', 'DOM_TEXT'] as const;

export const RECONSTRUCTABLE_CLASSIFICATIONS = [
  'ICON',
  'HERO_OBJECT',
  'DECORATIVE_OBJECT',
  'ILLUSTRATION',
  'PRODUCT_VISUAL',
  'PROJECT_VISUAL',
  'TEXTURE',
  'BACKGROUND_ELEMENT',
  'LOGO_MARK',
  'BADGE',
  '3D_OBJECT',
  'NAV_ICON',
] as const;
