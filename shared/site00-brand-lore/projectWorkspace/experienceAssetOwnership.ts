/**
 * Experience Asset Direction ownership update — workspace vs client expression.
 */

import type { ExperienceAssetDirection } from '../experienceExpression/assetDirection.js';
import { SITE00_LAYER } from './constants.js';

export type ExperienceAssetOwnershipModel = {
  workspaceCanonLayer: typeof SITE00_LAYER.PROJECT_WORKSPACE_CANON;
  clientExpressionLayer: typeof SITE00_LAYER.CLIENT_PROJECT_EXPRESSION;
  commissioningQuestion: string;
  prohibitedQuestion: string;
};

export const CORRECTED_ASSET_COMMISSIONING = {
  commissioningQuestion:
    'WHAT CLIENT-SPECIFIC VISUAL MATERIAL DOES THIS PROJECT NEED TO INHABIT THE SITE 00 WORKBENCH?',
  prohibitedQuestion: 'WHAT ASSETS ARE NEEDED TO INVENT A CLIENT-OWNED WORKBENCH?',
} as const;

export function applyCorrectedOwnershipToAssetDirection(
  direction: ExperienceAssetDirection,
): ExperienceAssetDirection & { ownershipModel: ExperienceAssetOwnershipModel } {
  return {
    ...direction,
    assetCommissioningPrinciple: CORRECTED_ASSET_COMMISSIONING.commissioningQuestion,
    ownershipModel: {
      workspaceCanonLayer: SITE00_LAYER.PROJECT_WORKSPACE_CANON,
      clientExpressionLayer: SITE00_LAYER.CLIENT_PROJECT_EXPRESSION,
      commissioningQuestion: CORRECTED_ASSET_COMMISSIONING.commissioningQuestion,
      prohibitedQuestion: CORRECTED_ASSET_COMMISSIONING.prohibitedQuestion,
    },
  };
}

export function assetDirectionOwnershipUpdated(model: ExperienceAssetOwnershipModel): boolean {
  return model.workspaceCanonLayer === SITE00_LAYER.PROJECT_WORKSPACE_CANON;
}
