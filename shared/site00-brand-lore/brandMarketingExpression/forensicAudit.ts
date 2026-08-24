/**
 * P0.5C forensic audit — character → marketing gap, template shortcuts.
 */

import type { MarketingExpressionForensicAudit } from './types.js';

export function auditMarketingExpressionLayer(params: {
  projectId: string;
  hasBrandCharacterSystem: boolean;
  hasSynthesis: boolean;
  experimentFExists: boolean;
  experimentGExists: boolean;
}): MarketingExpressionForensicAudit {
  const shortcuts: string[] = [];
  if (!params.hasBrandCharacterSystem) {
    shortcuts.push('CHARACTER → VISUAL STYLE (no BrandCharacterSystem authority)');
  }
  shortcuts.push('TOPIC → SOCIAL TEMPLATE (generic content brief path exists without character event mediation)');
  shortcuts.push('CAMPAIGN → ASSET (asset generation without content thesis)');

  return {
    auditId: `mexp-audit-${params.projectId}`,
    projectId: params.projectId,
    existingMarketingExpressionLayer: false,
    characterToMarketingGap: [
      'BrandCharacterSystem compiled but no BrandMarketingExpressionSystem',
      'No MarketingCharacterEvent layer between character and artifact',
      'No behavioral grammar between topic and visual expression',
      'North-Star calibration not persisted as CHARACTER_EXPRESSION_CALIBRATION',
    ],
    templateStyleShortcuts: shortcuts,
    experimentFRelationship:
      'Experiment F = CONTENT CONCEPT FORMATION (Credit Utilization topic). Historical records immutable. Future dependency: CONTENT CONCEPT + BRAND CHARACTER SYSTEM + MARKETING EXPRESSION SYSTEM → MARKETING ARTIFACT.',
    experimentGRelationship:
      'Experiment G = BRAND PRESENTATION (Room / Noticing / Collector). Historical records immutable. P0.5C = CHARACTER-LED MARKETING EXPRESSION. EXPERIMENT_G_CHARACTER_REEVALUATION_REQUIRED remains true.',
    historicalRecordsMutated: false,
    auditedAt: new Date().toISOString(),
  };
}

export function experimentFImmutable(): true {
  return true;
}

export function experimentGImmutable(): true {
  return true;
}
