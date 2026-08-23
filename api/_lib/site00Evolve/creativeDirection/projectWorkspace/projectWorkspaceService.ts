/**
 * NDXBOOK Project Workspace hero proof service — founder-triggered generation only.
 */

import { buildProjectWorkspaceCanon } from '../../../../../shared/site00-brand-lore/projectWorkspace/projectWorkspaceCanon.js';
import {
  compileNdxbookClientExpressionProfile,
} from '../../../../../shared/site00-brand-lore/projectWorkspace/clientProjectExpressionProfile.js';
import { compileHeroFrameAssetSubset } from '../../../../../shared/site00-brand-lore/projectWorkspace/heroFrameAssetSubset.js';
import { buildNdxbookWorkspaceEnvironment } from '../../../../../shared/site00-brand-lore/projectWorkspace/projectWorkspaceEnvironment.js';
import type {
  NdxbookHeroFrameComposition,
  ProjectWorkspaceHeroRun,
} from '../../../../../shared/site00-brand-lore/projectWorkspace/types.js';
import type { HeroFrameJudgment } from '../../../../../shared/site00-brand-lore/projectWorkspace/constants.js';
import { defaultNdxbookProductionScope } from '../../../../../shared/site00-brand-lore/experienceExpression/productionScope.js';
import { compileExperienceAssetManifestForConcept } from '../experienceExpressionExperiment/experimentEService.js';
import { getExperienceExpressionRun } from '../experienceExpressionExperiment/experimentEService.js';
import {
  buildAssetGenerationBrief,
  createGenerationReceipt,
  receiptToProductionAsset,
  validateGenerationScope,
} from '../../../../../shared/site00-brand-lore/experienceExpression/assetGeneration.js';
import {
  composeNdxbookHeroFrameViaFal,
  generateExperienceHeroAssetViaFal,
} from '../../../../../shared/site00-brand-lore/experienceExpression/experienceAssetFalProvider.js';
import { publicUrlForStoragePath } from '../../../site00Assts/service.js';
import { buildHostExperienceCanon } from '../../../../../shared/site00-brand-lore/experienceExpression/hostExperienceCanon.js';
import { buildClientExperienceCanon } from '../../../../../shared/site00-brand-lore/experienceExpression/clientExperienceCanon.js';
import { extractNdxbookFunctionalCanon } from '../../../../../shared/site00-brand-lore/experienceExpression/functionalCanon.js';
import { getBrandLoreProfileForOrg } from '../../../site00BrandLore/loreService.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import * as store from './memoryStore.js';

function nowIso(): string {
  return new Date().toISOString();
}

export function enrichProjectWorkspaceHeroRun(run: ProjectWorkspaceHeroRun): ProjectWorkspaceHeroRun {
  if (!run.heroComposition) return run;
  return {
    ...run,
    heroComposition: {
      ...run.heroComposition,
      publicUrl: run.heroComposition.publicUrl ?? publicUrlForStoragePath(run.heroComposition.storagePath),
    },
  };
}

function initRun(projectId: string): ProjectWorkspaceHeroRun {
  return {
    projectId,
    workspaceCanon: buildProjectWorkspaceCanon(),
    clientExpression: compileNdxbookClientExpressionProfile(null),
    heroSubset: null,
    environment: null,
    generatedAssets: [],
    generationReceipts: [],
    heroComposition: null,
    heroJudgment: null,
    heroGenerated: false,
    generationStarted: false,
    accounting: { falRequests: 0, estimatedCostUsd: 0 },
    compiledAt: nowIso(),
  };
}

export async function getProjectWorkspaceHeroRun(projectId: string = 'ndxbook'): Promise<ProjectWorkspaceHeroRun | null> {
  const run = store.getProjectWorkspaceHeroRun(projectId);
  return run ? enrichProjectWorkspaceHeroRun(run) : null;
}

export async function refreshProjectWorkspaceHeroRun(projectId: string = 'ndxbook'): Promise<ProjectWorkspaceHeroRun> {
  const existing = store.getProjectWorkspaceHeroRun(projectId);
  const profile = await getBrandLoreProfileForOrg(NDXBOOK_ORG_ID);
  const run: ProjectWorkspaceHeroRun = existing ?? initRun(projectId);
  run.workspaceCanon = buildProjectWorkspaceCanon();
  run.clientExpression = compileNdxbookClientExpressionProfile(profile);
  run.compiledAt = nowIso();
  return store.saveProjectWorkspaceHeroRun(run);
}

export async function compileNdxbookHeroFrameSubset(): Promise<ProjectWorkspaceHeroRun> {
  let run = await refreshProjectWorkspaceHeroRun('ndxbook');

  const expRun = await getExperienceExpressionRun();
  if (!expRun?.assetManifest && expRun?.experienceConcepts.length === 3) {
    await compileExperienceAssetManifestForConcept(3);
  }
  const refreshedExp = await getExperienceExpressionRun();
  const scope = refreshedExp?.productionScope ?? defaultNdxbookProductionScope('ndxbook');

  const existingPaths =
    refreshedExp?.visualAssets.map((a) => ({
      assetId: a.assetId,
      storagePath: a.storagePath,
      assetFamily: refreshedExp.assetRequirements.find((r) => r.idempotencyKey === a.idempotencyKey)?.assetFamily ?? 'UNKNOWN',
      surfaceId: a.surfaceType,
    })) ?? [];

  run.heroSubset = compileHeroFrameAssetSubset({
    projectId: 'ndxbook',
    bible: run.workspaceCanon.bible,
    clientExpression: run.clientExpression,
    fullManifest: refreshedExp?.assetManifest ?? null,
    scope,
    existingAssetPaths: existingPaths,
    spentUsd: run.accounting.estimatedCostUsd,
  });

  return store.saveProjectWorkspaceHeroRun(run);
}

export async function generateNdxbookHeroAssets(): Promise<ProjectWorkspaceHeroRun> {
  let run = await compileNdxbookHeroFrameSubset();
  if (!run.heroSubset?.scopeValid) {
    throw new Error(`Hero generation blocked: ${run.heroSubset?.scopeBlockReason ?? 'SCOPE_INVALID'}`);
  }

  const expRun = await getExperienceExpressionRun();
  if (!expRun) throw new Error('Experiment E run required for hero asset lineage');

  const concept = expRun.experienceConcepts.find((c) => c.conceptIndex === 3) ?? expRun.experienceConcepts[2];
  const bible = expRun.experienceBibles.find((b) => b.experienceConceptId === concept?.experienceConceptId);
  if (!concept || !bible || !run.heroSubset) throw new Error('Hero subset prerequisites missing');

  const scope = expRun.productionScope ?? defaultNdxbookProductionScope('ndxbook');
  const missingRoles = run.heroSubset.roles.filter((r) => r.missing && r.generationAllowed);
  const requirements =
    expRun.assetRequirements.filter(
      (req) =>
        req.surfaceId === 'PROJECT_HOME' &&
        req.desktopRequirement &&
        missingRoles.some((r) => r.assetFamily === req.assetFamily),
    ) ?? [];

  const scopeCheck = validateGenerationScope({
    scope,
    manifest: expRun.assetManifest!,
    requirements,
    spentUsd: run.accounting.estimatedCostUsd,
  });
  if (!scopeCheck.allowed) {
    throw new Error(`Scope blocked: ${scopeCheck.reason}`);
  }

  run.generationStarted = true;
  store.saveProjectWorkspaceHeroRun(run);

  const host = expRun.hostCanon ?? buildHostExperienceCanon();
  const client = expRun.clientCanon ?? buildClientExperienceCanon({ profile: null, territory: null, world: null });
  const functionalCanon = expRun.functionalCanon ?? extractNdxbookFunctionalCanon();

  let generatedAssets = [...run.generatedAssets];
  let generationReceipts = [...run.generationReceipts];
  let accounting = { ...run.accounting };

  for (const req of requirements) {
    const { compiledPrompt, promptHash } = buildAssetGenerationBrief({
      requirement: req,
      concept,
      bible,
      territory: expRun.selectedTerritory ?? null,
      world: expRun.worldExpressionSystem ?? null,
      host,
      client,
      functionalCanon,
      deviceClass: 'DESKTOP',
    });

    const storagePath = `site00/project-workspace/ndxbook/hero/${req.assetFamily.toLowerCase()}-desktop.webp`;

    const falResult = await generateExperienceHeroAssetViaFal({
      compiledPrompt,
      promptHash,
      storagePath,
      requirementId: req.id,
    });
    if (!falResult.ok) {
      throw new Error(`Hero asset generation failed (${req.assetFamily}): ${falResult.error}`);
    }

    const receipt = createGenerationReceipt({
      requirement: req,
      concept,
      bible,
      promptHash,
      deviceClass: 'DESKTOP',
    });
    receipt.requestId = falResult.requestId;
    receipt.provider = falResult.provider;
    receipt.model = falResult.model;
    receipt.costUsd = falResult.costUsd;

    const visualAsset = {
      assetId: `HERO-${req.id.slice(-8)}`,
      assetMedium: 'EXPERIENCE_VISUAL_DEVELOPMENT' as const,
      orgId: NDXBOOK_ORG_ID,
      projectId: 'ndxbook',
      brandSlug: 'ndxbook',
      experimentId: 'ndxbook-project-workspace-hero',
      experienceConceptId: concept.experienceConceptId,
      experienceBibleId: bible.experienceBibleId,
      surfaceType: 'PROJECT_HOME' as const,
      deviceClass: 'DESKTOP' as const,
      selectedConceptTerritoryId: expRun.selectedTerritory?.territoryId ?? 'snapshot-derived',
      worldExpressionSystemId: expRun.worldExpressionSystem?.expressionSystemId ?? 'none',
      functionalCanonVersion: functionalCanon.version,
      hostCanonVersion: host.version,
      clientCanonVersion: client.version,
      intelligenceSnapshotVersion: expRun.intelligenceSnapshotVersion,
      promptHash,
      provider: receipt.provider,
      model: receipt.model,
      requestId: receipt.requestId,
      storagePath,
      generationCostUsd: receipt.costUsd,
      founderJudgment: null,
      productionState: 'VISUAL_DEVELOPMENT',
      canonStatus: 'EXPERIMENTAL',
      generatedAt: nowIso(),
      idempotencyKey: req.idempotencyKey,
    };

    const productionAsset = receiptToProductionAsset({ receipt, requirement: req, visualAsset });
    generatedAssets = generatedAssets.filter((a) => a.requirementId !== req.id);
    generatedAssets.push(productionAsset);
    generationReceipts = generationReceipts.filter((r) => r.requirementId !== req.id);
    generationReceipts.push(receipt);
    accounting.falRequests += 1;
    accounting.estimatedCostUsd += receipt.costUsd;
  }

  const bgAsset = generatedAssets.find((a) =>
    requirements.some((r) => r.id === a.requirementId && r.assetFamily === 'ENVIRONMENT_PLATE'),
  );

  run.environment = buildNdxbookWorkspaceEnvironment({
    generatedBackgroundPath: bgAsset?.storagePath ?? null,
  });

  run.generatedAssets = generatedAssets;
  run.generationReceipts = generationReceipts;
  run.accounting = accounting;

  return enrichProjectWorkspaceHeroRun(store.saveProjectWorkspaceHeroRun(run));
}

export async function composeNdxbookHeroFrame(): Promise<ProjectWorkspaceHeroRun> {
  let run = store.getProjectWorkspaceHeroRun('ndxbook');
  if (!run?.generatedAssets.length && !run?.heroSubset?.reusableAssetCount) {
    throw new Error('Generate hero assets before composition');
  }

  const activeSpecimen = run.generatedAssets.some((a) =>
    run.heroSubset?.roles.some(
      (r) => r.assetFamily === 'ACTIVE_VISUAL_SPECIMEN' && (r.reusableAssetId || !r.missing),
    ),
  );

  const storagePath = `site00/project-workspace/ndxbook/hero/ndxbook-project-home-hero-desktop.webp`;
  const composeResult = await composeNdxbookHeroFrameViaFal({
    storagePath,
    workspaceConceptLabel: run.workspaceCanon.conceptLabel,
    clientExpressionSummary: run.clientExpression.expressiveTypographyBehavior,
    componentAssetDescriptions: run.generatedAssets.map(
      (a) => `${a.assetId}${a.storagePath ? `: ${a.storagePath}` : ''}`,
    ),
  });

  if (!composeResult.ok) {
    throw new Error(`Hero composition failed: ${composeResult.error}`);
  }

  const composition: NdxbookHeroFrameComposition = {
    compositionId: `hero-comp-ndxbook-${Date.now()}`,
    projectId: 'ndxbook',
    surface: 'PROJECT_HOME',
    deviceClass: 'DESKTOP',
    storagePath: composeResult.storagePath,
    publicUrl: composeResult.publicUrl,
    workspaceRecognizable: true,
    clientRecognizable: true,
    artworkParticipates: true,
    activeSpecimenPresent: activeSpecimen,
    literalWorkshopBlocked: true,
    dossierLiteralizationBlocked: true,
    genericDashboardBlocked: true,
    composedAt: nowIso(),
  };

  run.heroComposition = composition;
  run.heroGenerated = true;
  run.accounting.falRequests += 1;
  run.accounting.estimatedCostUsd += composeResult.costUsd;

  return enrichProjectWorkspaceHeroRun(store.saveProjectWorkspaceHeroRun(run));
}

export async function setNdxbookHeroJudgment(judgment: HeroFrameJudgment): Promise<ProjectWorkspaceHeroRun> {
  const run = store.getProjectWorkspaceHeroRun('ndxbook');
  if (!run) throw new Error('Hero run not found');
  return enrichProjectWorkspaceHeroRun(store.saveProjectWorkspaceHeroRun({ ...run, heroJudgment: judgment }));
}

export { resetProjectWorkspaceHeroMemory } from './memoryStore.js';
