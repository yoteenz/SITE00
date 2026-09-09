/**
 * Master Skin System constants.
 */

import { MASTER_SKIN_LINEAGE } from './types.js';

export { MASTER_SKIN_LINEAGE };

export const MASTER_SKIN_CATALOG_IDS = {
  CULTURAL_EDITORIAL: 'cultural-editorial',
  CLINICAL_EDITORIAL: 'clinical-editorial',
  TECHNICAL_OPERATIONS: 'technical-operations',
  LUXURY_CLINICAL: 'luxury-clinical',
  MINIMAL_INSTITUTIONAL: 'minimal-institutional',
  HOSPITALITY_EDITORIAL: 'hospitality-editorial',
  LUXURY_RETAIL: 'luxury-retail',
  ARCHIVAL_CREATIVE: 'archival-creative',
  SOFT_LUXURY: 'soft-luxury',
  PLAYFUL_RETAIL: 'playful-retail',
} as const;

export const PROOF_SKIN_IDS = [
  MASTER_SKIN_CATALOG_IDS.CULTURAL_EDITORIAL,
  MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL,
  MASTER_SKIN_CATALOG_IDS.TECHNICAL_OPERATIONS,
] as const;

export const PROOF_PROJECT_SKIN_MAP: Record<string, string> = {
  ndxbook: MASTER_SKIN_CATALOG_IDS.CULTURAL_EDITORIAL,
  'demo-doctor-health': MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL,
  'all-in-one-enterprises': MASTER_SKIN_CATALOG_IDS.TECHNICAL_OPERATIONS,
};

export const MODULE_IDS = [
  'IDENTITY',
  'BUILDER',
  'EVOLVE',
  'PRODUCTION',
  'REVIEWS',
  'LIBRARY',
  'CONTROL_ROOM',
  'OVERVIEW',
  'MORE',
] as const;

export const HOST_EXPRESSION_BOUNDARY = {
  hostControls: [
    'GLOBAL_SITE00_NAV',
    'PROJECT_SHELL',
    'MODULE_SWITCHER',
    'AUTH',
    'VIEW_MODE',
    'SYSTEM_CONTROLS',
    'PERMISSION_SAFE_STRUCTURE',
  ],
  skinControls: ['MODULE_INTERNAL_EXPRESSION'],
} as const;
