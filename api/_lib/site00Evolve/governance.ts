/** Studio World production governance — do not bypass restricted capabilities */

import type { ProductionGovernanceState, ProductionType } from './types.js';
import {
  STUDIO_WORLD_GOVERNANCE_BLOCKED_CAPABILITIES,
  STUDIO_WORLD_GOVERNED_BLOCKED,
} from './types.js';

export function resolveProductionGovernance(
  productionType: ProductionType,
  orgClassification: string,
): ProductionGovernanceState {
  if (orgClassification === 'PRODUCTION_INFRASTRUCTURE') {
    return 'NOT_CONFIGURED';
  }

  const blocked = STUDIO_WORLD_GOVERNED_BLOCKED.includes(productionType);
  if (blocked) return 'BLOCKED_BY_GOVERNANCE';

  return 'AVAILABLE';
}

export function governanceBlockReason(productionType: ProductionType): string {
  if (STUDIO_WORLD_GOVERNED_BLOCKED.includes(productionType)) {
    return `PRODUCTION CAPABILITY BLOCKED_BY_GOVERNANCE — ${productionType} requires Studio World governance approval`;
  }
  return '';
}

export function listBlockedCapabilities(): readonly string[] {
  return STUDIO_WORLD_GOVERNANCE_BLOCKED_CAPABILITIES;
}

export function listAvailableCapabilities(orgClassification: string): ProductionType[] {
  if (orgClassification === 'PRODUCTION_INFRASTRUCTURE') return [];
  const all: ProductionType[] = [
    'CAMPAIGN_KEY_VISUALS',
    'SOCIAL_GRAPHICS',
    'SHORT_FORM_VIDEO',
    'VIDEO_PRODUCTION',
    'MOTION',
    'EMAIL_IMAGERY',
    'WEBSITE_IMAGERY',
    'EDITORIAL',
    'BRAND_ASSETS',
    'OTHER',
  ];
  return all.filter((t) => resolveProductionGovernance(t, orgClassification) === 'AVAILABLE');
}
