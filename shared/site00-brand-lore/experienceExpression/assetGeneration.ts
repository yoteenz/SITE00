/**
 * FAL Experience Asset generation bridge — reuses existing provider patterns.
 */

import { createHash } from 'node:crypto';
import type { ExperienceAssetManifest, ExperienceAssetRequirement } from './assetManifest.js';
import type { ExperienceProductionAsset } from './assetLifecycle.js';
import type { ProjectProductionScope } from './productionScope.js';
import { scopeAllowsAssetFamily, scopeAllowsGeneration } from './productionScope.js';
import type {
  ExperienceBible,
  ExperienceConcept,
  ExperienceVisualDevelopmentAsset,
} from './types.js';
import { compileExperienceVisualPrompt } from './visualPromptCompiler.js';
import type { ClientExperienceCanon, ExperienceFunctionalCanon, HostExperienceCanon } from './types.js';
import type { CreativeConceptTerritory, WorldExpressionSystem } from '../conceptTerritory/conceptTerritoryTypes.js';
import type { ExperienceSurfaceType } from './constants.js';
import type { DeviceClass } from './constants.js';
import { EXPERIENCE_VISUAL_COST_ESTIMATE_USD } from './constants.js';
import { literalWorkshopImageryBlocked } from './assetDirection.js';
import { SITE00_FAL_TEXT_TO_IMAGE_MODEL } from '../../site00-visual-generation/falImageModels.js';

export type ExperienceAssetGenerationReceipt = {
  receiptId: string;
  requirementId: string;
  projectId: string;
  experienceConceptId: string;
  experienceBibleId: string;
  surfaceId: string;
  assetFamily: string;
  provider: string;
  model: string;
  requestId: string | null;
  promptHash: string;
  costUsd: number;
  deviceClass: DeviceClass;
  productionStatus: 'VISUAL_DEVELOPMENT' | 'PRODUCTION';
  parentLineageKey: string | null;
  status: 'QUEUED' | 'GENERATED' | 'FAILED';
  generatedAt: string;
};

export function buildAssetGenerationBrief(params: {
  requirement: ExperienceAssetRequirement;
  concept: ExperienceConcept;
  bible: ExperienceBible;
  territory?: CreativeConceptTerritory | null;
  world?: WorldExpressionSystem | null;
  host: HostExperienceCanon;
  client: ClientExperienceCanon;
  functionalCanon: ExperienceFunctionalCanon;
  deviceClass: DeviceClass;
}): { compiledPrompt: string; promptHash: string } {
  const surfaceType = params.requirement.surfaceId as ExperienceSurfaceType;
  const brief = compileExperienceVisualPrompt({
    concept: params.concept,
    bible: params.bible,
    territory: params.territory ?? null,
    world: params.world ?? null,
    host: params.host,
    client: params.client,
    functionalCanon: params.functionalCanon,
    surfaceType,
    deviceClass: params.deviceClass,
  });

  const assetContext = [
    `Asset family: ${params.requirement.assetFamily}`,
    `Asset role: ${params.requirement.assetRole}`,
    `Purpose: ${params.requirement.purpose}`,
    `Creative function: ${params.requirement.creativeFunction}`,
    'Client-native visual material — not generic UI decoration',
    'No stock imagery, no literal workshop carpentry scene',
  ].join('. ');

  const compiledPrompt = `${brief.compiledPrompt}\n\nASSET COMMISSION: ${assetContext}`;
  const promptHash = createHash('sha256').update(compiledPrompt).digest('hex').slice(0, 16);

  if (literalWorkshopImageryBlocked(compiledPrompt)) {
    throw new Error('LITERAL_WORKSHOP_IMAGERY_BLOCKED');
  }

  return { compiledPrompt, promptHash };
}

export function validateGenerationScope(params: {
  scope: ProjectProductionScope;
  manifest: ExperienceAssetManifest;
  requirements: ExperienceAssetRequirement[];
  spentUsd: number;
}): { allowed: boolean; reason: string | null } {
  const families = new Set(params.requirements.map((r) => r.assetFamily));
  for (const family of families) {
    const check = scopeAllowsAssetFamily(params.scope, {
      assetFamily: family,
      currentFamilyCount: families.size,
      currentAssetCount: params.requirements.length,
    });
    if (!check.allowed) return check;
  }

  const estimated = params.requirements.length * EXPERIENCE_VISUAL_COST_ESTIMATE_USD;
  return scopeAllowsGeneration(params.scope, {
    estimatedCostUsd: estimated,
    spentUsd: params.spentUsd,
    frameCount: params.requirements.length,
  });
}

export function createGenerationReceipt(params: {
  requirement: ExperienceAssetRequirement;
  concept: ExperienceConcept;
  bible: ExperienceBible;
  promptHash: string;
  deviceClass: DeviceClass;
  parentLineageKey?: string | null;
}): ExperienceAssetGenerationReceipt {
  const isVitest = process.env.VITEST === 'true';
  return {
    receiptId: `rcpt-${params.requirement.idempotencyKey}`,
    requirementId: params.requirement.id,
    projectId: params.requirement.projectId,
    experienceConceptId: params.concept.experienceConceptId,
    experienceBibleId: params.bible.experienceBibleId,
    surfaceId: params.requirement.surfaceId,
    assetFamily: params.requirement.assetFamily,
    provider: isVitest ? 'vitest-mock' : 'fal',
    model: isVitest ? 'vitest-mock' : SITE00_FAL_TEXT_TO_IMAGE_MODEL,
    requestId: null,
    promptHash: params.promptHash,
    costUsd: isVitest ? 0 : EXPERIENCE_VISUAL_COST_ESTIMATE_USD,
    deviceClass: params.deviceClass,
    productionStatus: params.requirement.generationBudgetClass === 'PRODUCTION' ? 'PRODUCTION' : 'VISUAL_DEVELOPMENT',
    parentLineageKey: params.parentLineageKey ?? null,
    status: 'GENERATED',
    generatedAt: new Date().toISOString(),
  };
}

export function receiptToVisualAsset(params: {
  receipt: ExperienceAssetGenerationReceipt;
  requirement: ExperienceAssetRequirement;
  orgId: string;
  experimentId: string;
  territoryId: string;
  worldId: string;
  functionalCanonVersion: number;
  hostCanonVersion: number;
  clientCanonVersion: number;
  intelligenceSnapshotVersion: number;
  storagePath: string;
}): ExperienceVisualDevelopmentAsset {
  return {
    assetId: `EXP-ASST-${params.receipt.receiptId.slice(-12)}`,
    assetMedium: 'EXPERIENCE_VISUAL_DEVELOPMENT',
    orgId: params.orgId,
    projectId: params.requirement.projectId,
    brandSlug: params.requirement.projectId,
    experimentId: params.experimentId,
    experienceConceptId: params.receipt.experienceConceptId,
    experienceBibleId: params.receipt.experienceBibleId,
    surfaceType: params.requirement.surfaceId as ExperienceSurfaceType,
    deviceClass: params.receipt.deviceClass,
    selectedConceptTerritoryId: params.territoryId,
    worldExpressionSystemId: params.worldId,
    functionalCanonVersion: params.functionalCanonVersion,
    hostCanonVersion: params.hostCanonVersion,
    clientCanonVersion: params.clientCanonVersion,
    intelligenceSnapshotVersion: params.intelligenceSnapshotVersion,
    promptHash: params.receipt.promptHash,
    provider: params.receipt.provider,
    model: params.receipt.model,
    requestId: params.receipt.requestId,
    storagePath: params.storagePath,
    generationCostUsd: params.receipt.costUsd,
    founderJudgment: null,
    productionState: params.receipt.productionStatus === 'PRODUCTION' ? 'PROMOTED_TO_PRODUCTION' : 'VISUAL_DEVELOPMENT',
    canonStatus: 'EXPERIMENTAL',
    generatedAt: params.receipt.generatedAt,
    idempotencyKey: params.requirement.idempotencyKey,
  };
}

export function receiptToProductionAsset(params: {
  receipt: ExperienceAssetGenerationReceipt;
  requirement: ExperienceAssetRequirement;
  visualAsset: ExperienceVisualDevelopmentAsset;
}): ExperienceProductionAsset {
  return {
    assetId: params.visualAsset.assetId,
    requirementId: params.requirement.id,
    assetMedium: 'EXPERIENCE_VISUAL_DEVELOPMENT',
    provenanceClass: 'VISUAL_DEVELOPMENT',
    canonStatus: 'EXPERIMENTAL',
    productionState: 'VISUAL_DEVELOPMENT',
    storagePath: params.visualAsset.storagePath,
    vaultAssetId: null,
    parentAssetId: params.receipt.parentLineageKey,
    lineageKey: params.requirement.idempotencyKey,
    founderJudgment: null,
    promotedAt: null,
    promotedBy: null,
    generationReceipt: {
      provider: params.receipt.provider,
      model: params.receipt.model,
      requestId: params.receipt.requestId,
      costUsd: params.receipt.costUsd,
      promptHash: params.receipt.promptHash,
    },
    createdAt: params.receipt.generatedAt,
    updatedAt: params.receipt.generatedAt,
  };
}

export function assetStoragePath(params: {
  conceptIndex: number;
  surfaceId: string;
  assetFamily: string;
  deviceClass: string;
}): string {
  return `site00/validation/${params.conceptIndex}/experience-assets/${params.surfaceId.toLowerCase()}/${params.assetFamily.toLowerCase()}-${params.deviceClass.toLowerCase()}.webp`;
}

export type ExperienceAssetGenerationAction =
  | 'GENERATE_VISUAL_DEVELOPMENT'
  | 'GENERATE_SELECTED_ASSET_FAMILY'
  | 'GENERATE_REQUIRED_PRODUCTION_ASSETS'
  | 'REGENERATE_SELECTED_ASSET';

export function filterRequirementsForAction(
  manifest: ExperienceAssetManifest,
  action: ExperienceAssetGenerationAction,
  filters?: { assetFamily?: string; requirementIds?: string[] },
): ExperienceAssetRequirement[] {
  let reqs = manifest.requirements.filter((r) => r.generationAllowed);

  if (action === 'GENERATE_REQUIRED_PRODUCTION_ASSETS') {
    reqs = reqs.filter((r) => r.required && r.productionEligibility === 'PRODUCTION_ELIGIBLE');
  } else if (action === 'GENERATE_SELECTED_ASSET_FAMILY' && filters?.assetFamily) {
    reqs = reqs.filter((r) => r.assetFamily === filters.assetFamily);
  } else if (action === 'REGENERATE_SELECTED_ASSET' && filters?.requirementIds?.length) {
    reqs = reqs.filter((r) => filters.requirementIds!.includes(r.id));
  }

  return reqs.filter((r) => r.status !== 'GENERATED' && r.status !== 'PROMOTED_TO_PRODUCTION' || action === 'REGENERATE_SELECTED_ASSET');
}
