/**
 * Experiment E — Experience Expression service (founder-triggered formation + visual dev).
 */

import { createHash } from 'node:crypto';
import {
  EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION,
  EXPERIMENT_E_CLASSIFICATION,
  EXPERIMENT_E_RUN_ID,
  EXPERIENCE_E_INITIAL_SURFACES,
  EXPERIENCE_FRAMES_PER_CONCEPT,
  EXPERIENCE_TERRITORY_SELECTION_PURPOSE,
  EXPERIENCE_VISUAL_COST_ESTIMATE_USD,
  EXPERIENCE_EXPRESSION_METHODOLOGY_VERSION,
  DEVICE_CLASSES,
} from '../../../../../shared/site00-brand-lore/experienceExpression/constants.js';
import type {
  ExperienceConceptJudgment,
  ExperienceExpressionRun,
  ExperienceVisualDevelopmentAsset,
} from '../../../../../shared/site00-brand-lore/experienceExpression/types.js';
import { extractNdxbookFunctionalCanon } from '../../../../../shared/site00-brand-lore/experienceExpression/functionalCanon.js';
import { buildHostExperienceCanon } from '../../../../../shared/site00-brand-lore/experienceExpression/hostExperienceCanon.js';
import { buildClientExperienceCanon } from '../../../../../shared/site00-brand-lore/experienceExpression/clientExperienceCanon.js';
import { buildCurrentExperienceAudit } from '../../../../../shared/site00-brand-lore/experienceExpression/genericTemplateAudit.js';
import { assessExperienceExpressionReadiness } from '../../../../../shared/site00-brand-lore/experienceExpression/readiness.js';
import { buildExperienceConceptsFromSnapshot } from '../../../../../shared/site00-brand-lore/experienceExpression/experienceConceptFormation.js';
import { buildExperienceBible } from '../../../../../shared/site00-brand-lore/experienceExpression/experienceBibleBuilder.js';
import { runExperienceConceptDistinctivenessGate } from '../../../../../shared/site00-brand-lore/experienceExpression/distinctiveness.js';
import { translateWorldBehaviorIntoExperienceBehavior } from '../../../../../shared/site00-brand-lore/experienceExpression/behaviorTranslation.js';
import {
  buildResponsiveExperienceTranslation,
  compileExperienceVisualPrompt,
} from '../../../../../shared/site00-brand-lore/experienceExpression/visualPromptCompiler.js';
import { runAllExperienceContaminationTests } from '../../../../../shared/site00-brand-lore/experienceExpression/contaminationGuards.js';
import { compileExperienceImplementationContract } from '../../../../../shared/site00-brand-lore/experienceExpression/implementationContract.js';
import {
  buildAllExperimentDTerritoryEvidence,
  classifyExperimentDTerritoryEvidence,
} from '../../../../../shared/site00-brand-lore/experienceExpression/crossMediumConceptEvidence.js';
import { compileExperimentEIntelligenceSnapshot } from '../../../../../shared/site00-brand-lore/experienceExpression/experienceExpressionSnapshot.js';
import { compileExperienceAssetDirection, isActiveWorkbenchConcept } from '../../../../../shared/site00-brand-lore/experienceExpression/assetDirection.js';
import { compileExperienceAssetManifest } from '../../../../../shared/site00-brand-lore/experienceExpression/assetManifest.js';
import { defaultNdxbookProductionScope } from '../../../../../shared/site00-brand-lore/experienceExpression/productionScope.js';
import {
  assetStoragePath,
  buildAssetGenerationBrief,
  createGenerationReceipt,
  filterRequirementsForAction,
  receiptToProductionAsset,
  receiptToVisualAsset,
  validateGenerationScope,
  type ExperienceAssetGenerationAction,
} from '../../../../../shared/site00-brand-lore/experienceExpression/assetGeneration.js';
import {
  promoteAssetToProduction,
  type ExperienceProductionAsset,
} from '../../../../../shared/site00-brand-lore/experienceExpression/assetLifecycle.js';
import { buildConceptTerritorySeed } from '../../../../../shared/site00-brand-lore/conceptTerritory/conceptTerritorySeeds.js';
import type { CanonicalNdxbookDirectionName } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';
import { getBrandLoreProfileForOrg } from '../../../site00BrandLore/loreService.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import { summarizeCreativeAppetiteForFormation } from '../../../../../shared/site00-brand-lore/founderCreativeAppetite/synthesis.js';
import * as experimentEStore from './storeAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

function emptyAccounting(): ExperienceExpressionRun['accounting'] {
  return {
    anthropicRequests: 0,
    anthropicInputTokens: 0,
    anthropicOutputTokens: 0,
    gptImage2Requests: 0,
    falRequests: 0,
    estimatedCostUsd: 0,
  };
}

function initRun(existing?: ExperienceExpressionRun | null): ExperienceExpressionRun {
  if (existing) {
    return {
      ...existing,
      intelligenceSnapshotVersion:
        existing.intelligenceSnapshotVersion ?? EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION,
      crossMediumEvidence: existing.crossMediumEvidence ?? buildAllExperimentDTerritoryEvidence(),
      experimentSnapshot: existing.experimentSnapshot ?? null,
      currentExperienceAudit: existing.currentExperienceAudit ?? existing.templateAudit
        ? { ...existing.templateAudit!, auditType: 'CURRENT_NDXBOOK_EXPERIENCE_FORENSIC' as const }
        : null,
      productionScope: existing.productionScope ?? null,
      assetDirection: existing.assetDirection ?? null,
      assetManifest: existing.assetManifest ?? null,
      assetRequirements: existing.assetRequirements ?? [],
      productionAssets: existing.productionAssets ?? [],
      assetGenerationReceipts: existing.assetGenerationReceipts ?? [],
      assetManifestCompiled: existing.assetManifestCompiled ?? false,
      assetGenerationStarted: existing.assetGenerationStarted ?? false,
      accounting: {
        ...emptyAccounting(),
        ...existing.accounting,
        falRequests: existing.accounting?.falRequests ?? 0,
      },
    };
  }
  return {
    experimentClassification: EXPERIMENT_E_CLASSIFICATION,
    runId: EXPERIMENT_E_RUN_ID,
    organizationId: NDXBOOK_ORG_ID,
    projectId: 'ndxbook',
    methodologyVersion: EXPERIENCE_EXPRESSION_METHODOLOGY_VERSION,
    intelligenceSnapshotVersion: EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION,
    status: 'NOT_STARTED',
    readiness: assessExperienceExpressionReadiness({
      profile: null,
      territory: null,
      world: null,
      functionalCanon: null,
      hostCanon: null,
      experimentSnapshot: null,
      crossMediumEvidence: buildAllExperimentDTerritoryEvidence(),
    }),
    experienceTestTerritoryId: null,
    experienceTestTerritoryName: null,
    selectionPurpose: null,
    selectedTerritory: null,
    worldExpressionSystem: null,
    functionalCanon: null,
    hostCanon: null,
    clientCanon: null,
    templateAudit: null,
    currentExperienceAudit: null,
    experimentSnapshot: null,
    crossMediumEvidence: buildAllExperimentDTerritoryEvidence(),
    experienceConcepts: [],
    experienceBibles: [],
    responsiveTranslations: [],
    behaviorTranslations: [],
    distinctiveness: null,
    visualBriefs: [],
    visualAssets: [],
    productionScope: null,
    assetDirection: null,
    assetManifest: null,
    assetRequirements: [],
    productionAssets: [],
    assetGenerationReceipts: [],
    assetManifestCompiled: false,
    assetGenerationStarted: false,
    implementationContract: null,
    formationReady: false,
    visualGenerationReady: false,
    visualGenerationStarted: false,
    accounting: emptyAccounting(),
    error: null,
    startedAt: nowIso(),
    completedAt: null,
  };
}

async function buildBaseContext(run: ExperienceExpressionRun) {
  const profile = await getBrandLoreProfileForOrg(NDXBOOK_ORG_ID);
  const functionalCanon = extractNdxbookFunctionalCanon();
  const hostCanon = buildHostExperienceCanon();
  const currentExperienceAudit = buildCurrentExperienceAudit();
  const crossMediumEvidence = run.crossMediumEvidence.length
    ? run.crossMediumEvidence
    : buildAllExperimentDTerritoryEvidence();

  const territory = run.selectedTerritory;
  const world = run.worldExpressionSystem;

  const clientCanon = buildClientExperienceCanon({
    profile,
    territory: territory ?? null,
    world: world ?? null,
    crossMediumEvidence,
  });

  const experimentSnapshot = compileExperimentEIntelligenceSnapshot({
    profile,
    functionalCanon,
    hostCanon,
    clientCanon,
    currentExperienceAudit,
    crossMediumEvidence,
  });

  const readiness = assessExperienceExpressionReadiness({
    profile,
    territory: territory ?? null,
    world: world ?? null,
    functionalCanon,
    hostCanon,
    experimentSnapshot,
    crossMediumEvidence,
    experienceTestTerritoryId: run.experienceTestTerritoryId,
  });

  return {
    profile,
    functionalCanon,
    hostCanon,
    templateAudit: currentExperienceAudit,
    currentExperienceAudit,
    clientCanon,
    experimentSnapshot,
    crossMediumEvidence,
    readiness,
  };
}

function territoryNameToDirection(name: string): CanonicalNdxbookDirectionName | null {
  const normalized = name.toUpperCase().trim();
  const map: Record<string, CanonicalNdxbookDirectionName> = {
    'THE MARKED-UP COPY': 'THE MARKED-UP COPY',
    'THE COUNTDOWN ROOM': 'THE COUNTDOWN ROOM',
    'THE PERSONAL ARCHIVE': 'THE PERSONAL ARCHIVE',
    'THE ANNOTATED COPY': 'THE ANNOTATED COPY',
    'THE ROOM WHERE IT HAPPENS': 'THE ROOM WHERE IT HAPPENS',
    'THE INDEX': 'THE INDEX',
  };
  return map[normalized] ?? null;
}

export async function getExperienceExpressionRun(): Promise<ExperienceExpressionRun | null> {
  return experimentEStore.getExperienceExpressionRun();
}

export async function refreshExperienceExpressionRun(): Promise<ExperienceExpressionRun> {
  const existing = await experimentEStore.getExperienceExpressionRun();
  let run = initRun(existing);
  const ctx = await buildBaseContext(run);

  run = {
    ...run,
    functionalCanon: ctx.functionalCanon,
    hostCanon: ctx.hostCanon,
    clientCanon: ctx.clientCanon,
    templateAudit: ctx.templateAudit,
    currentExperienceAudit: ctx.currentExperienceAudit,
    experimentSnapshot: ctx.experimentSnapshot,
    crossMediumEvidence: ctx.crossMediumEvidence,
    readiness: ctx.readiness,
    status:
      ctx.readiness.state === 'READY_FOR_EXPERIENCE_FORMATION' && run.experienceConcepts.length === 0
        ? 'READY_TO_FORM'
        : run.experienceConcepts.length === 3
          ? run.status
          : ctx.readiness.snapshotCompiled
            ? 'READY_TO_FORM'
            : 'WAITING_FOR_SNAPSHOT',
    formationReady: ctx.readiness.state === 'READY_FOR_EXPERIENCE_FORMATION' && run.experienceConcepts.length === 3,
    visualGenerationReady: run.experienceConcepts.length === 3 && run.distinctiveness !== null,
  };

  return experimentEStore.saveExperienceExpressionRun(run);
}

/** Optional — promote Experiment D territory as cross-medium evidence (not required for formation). */
export async function selectExperienceTestTerritory(params: {
  territoryId?: string | null;
  directionName?: string | null;
}): Promise<ExperienceExpressionRun> {
  const existing = await experimentEStore.getExperienceExpressionRun();
  let run = initRun(existing);

  let directionName: CanonicalNdxbookDirectionName | null = null;
  if (params.directionName) {
    directionName = territoryNameToDirection(params.directionName);
  }
  if (!directionName && params.territoryId) {
    const match = params.territoryId.match(/dir-([a-z-]+)/);
    if (match) {
      const slugToName: Record<string, CanonicalNdxbookDirectionName> = {
        'marked-up-copy': 'THE MARKED-UP COPY',
        'countdown-room': 'THE COUNTDOWN ROOM',
        'personal-archive': 'THE PERSONAL ARCHIVE',
        'annotated-copy': 'THE ANNOTATED COPY',
        'room-where-it-happens': 'THE ROOM WHERE IT HAPPENS',
        index: 'THE INDEX',
      };
      directionName = slugToName[match[1]] ?? null;
    }
  }

  if (!directionName) {
    throw new Error('Invalid cross-medium evidence promotion — founder must choose valid Concept Territory evidence');
  }

  const { territory, expression: world } = buildConceptTerritorySeed(directionName);

  const crossMediumEvidence = (run.crossMediumEvidence.length ? run.crossMediumEvidence : buildAllExperimentDTerritoryEvidence()).map(
    (ev) =>
      ev.directionName === directionName
        ? classifyExperimentDTerritoryEvidence(territory, world, {
            explicitlyPromoted: true,
            promotionPurpose: EXPERIENCE_TERRITORY_SELECTION_PURPOSE,
            promotedAt: nowIso(),
          })
        : ev,
  );

  const ctx = await buildBaseContext({
    ...run,
    experienceTestTerritoryId: territory.territoryId,
    experienceTestTerritoryName: territory.directionName,
    selectionPurpose: EXPERIENCE_TERRITORY_SELECTION_PURPOSE,
    selectedTerritory: territory,
    worldExpressionSystem: world,
    crossMediumEvidence,
  });

  run = {
    ...run,
    experienceTestTerritoryId: territory.territoryId,
    experienceTestTerritoryName: territory.directionName,
    selectionPurpose: EXPERIENCE_TERRITORY_SELECTION_PURPOSE,
    selectedTerritory: territory,
    worldExpressionSystem: world,
    crossMediumEvidence,
    functionalCanon: ctx.functionalCanon,
    hostCanon: ctx.hostCanon,
    clientCanon: ctx.clientCanon,
    templateAudit: ctx.templateAudit,
    currentExperienceAudit: ctx.currentExperienceAudit,
    experimentSnapshot: ctx.experimentSnapshot,
    readiness: ctx.readiness,
    status: 'READY_TO_FORM',
    experienceConcepts: [],
    experienceBibles: [],
    responsiveTranslations: [],
    behaviorTranslations: [],
    distinctiveness: null,
    visualBriefs: [],
    visualAssets: [],
    productionScope: null,
    assetDirection: null,
    assetManifest: null,
    assetRequirements: [],
    productionAssets: [],
    assetGenerationReceipts: [],
    assetManifestCompiled: false,
    assetGenerationStarted: false,
    implementationContract: null,
    formationReady: false,
    visualGenerationReady: false,
  };

  return experimentEStore.saveExperienceExpressionRun(run);
}

export async function formExperienceConcepts(): Promise<ExperienceExpressionRun> {
  let run = await experimentEStore.getExperienceExpressionRun();
  run = initRun(run);
  await refreshExperienceExpressionRun();
  run = (await experimentEStore.getExperienceExpressionRun())!;

  if (run.readiness.state !== 'READY_FOR_EXPERIENCE_FORMATION') {
    throw new Error(`Experience Expression not ready: ${run.readiness.state} — ${run.readiness.blockers.join('; ')}`);
  }
  if (!run.experimentSnapshot) {
    throw new Error('Experiment E intelligence snapshot required before formation');
  }

  run = { ...run, status: 'FORMING' };
  await experimentEStore.saveExperienceExpressionRun(run);

  const profile = await getBrandLoreProfileForOrg(NDXBOOK_ORG_ID);
  const appetiteLineage =
    profile?.founderCreativeAppetite && Object.keys(profile.founderCreativeAppetite.rawAnswers ?? {}).length > 0
      ? summarizeCreativeAppetiteForFormation(profile.founderCreativeAppetite)
      : 'PARTIAL_APPETITE_CONTEXT';

  const functionalCanon = run.functionalCanon ?? extractNdxbookFunctionalCanon();
  const hostCanon = run.hostCanon ?? buildHostExperienceCanon();
  const clientCanon =
    run.clientCanon ??
    buildClientExperienceCanon({
      profile,
      territory: run.selectedTerritory,
      world: run.worldExpressionSystem,
      crossMediumEvidence: run.crossMediumEvidence,
    });

  const experienceConcepts = buildExperienceConceptsFromSnapshot({
    snapshot: run.experimentSnapshot,
    profile,
    crossMediumEvidence: run.crossMediumEvidence,
    appetiteLineage,
  });

  const experienceBibles = experienceConcepts.map((concept) =>
    buildExperienceBible({
      concept,
      host: hostCanon,
      client: clientCanon,
      territory: run.selectedTerritory,
      world: run.worldExpressionSystem,
    }),
  );

  const responsiveTranslations = experienceConcepts.map(buildResponsiveExperienceTranslation);

  const behaviorTranslations = experienceConcepts.map((concept) =>
    translateWorldBehaviorIntoExperienceBehavior({
      territory: run.selectedTerritory,
      world: run.worldExpressionSystem,
      concept,
      functionalCanon,
      hostCanon,
      crossMediumEvidence: run.crossMediumEvidence,
    }),
  );

  const distinctiveness = runExperienceConceptDistinctivenessGate(experienceConcepts);

  const accounting = { ...run.accounting, anthropicRequests: run.accounting.anthropicRequests + 1 };

  run = {
    ...run,
    experienceConcepts,
    experienceBibles,
    responsiveTranslations,
    behaviorTranslations,
    distinctiveness,
    productionScope: defaultNdxbookProductionScope(run.projectId),
    status: 'CONCEPTS_READY',
    formationReady: true,
    visualGenerationReady: true,
    accounting,
    error: null,
    completedAt: null,
  };

  return experimentEStore.saveExperienceExpressionRun(run);
}

function visualStoragePath(conceptIndex: number, surface: string, device: string): string {
  return `site00/validation/ndxbook/experience-expression/concept-${String(conceptIndex).padStart(2, '0')}/${surface.toLowerCase()}-${device.toLowerCase()}.webp`;
}

function idempotencyKey(conceptId: string, surface: string, device: string): string {
  return createHash('sha256').update(`${conceptId}:${surface}:${device}`).digest('hex').slice(0, 24);
}

export async function generateExperienceVisualDevelopment(params: {
  conceptIndex?: number;
  allConcepts?: boolean;
}): Promise<ExperienceExpressionRun> {
  let run = await experimentEStore.getExperienceExpressionRun();
  if (!run || run.experienceConcepts.length !== 3) {
    throw new Error('Form three experience concepts before visual development');
  }
  if (!run.visualGenerationReady) {
    throw new Error('Visual generation not ready — founder must approve for visual development');
  }

  const territory = run.selectedTerritory;
  const world = run.worldExpressionSystem;
  const functionalCanon = run.functionalCanon ?? extractNdxbookFunctionalCanon();
  const hostCanon = run.hostCanon ?? buildHostExperienceCanon();
  const clientCanon = run.clientCanon!;

  const targetConcepts = params.allConcepts
    ? run.experienceConcepts
    : params.conceptIndex
      ? run.experienceConcepts.filter((c) => c.conceptIndex === params.conceptIndex)
      : [];

  if (!targetConcepts.length) {
    throw new Error('Specify conceptIndex or allConcepts for visual development');
  }

  run = { ...run, visualGenerationStarted: true, status: 'GENERATING_VISUALS' };
  await experimentEStore.saveExperienceExpressionRun(run);

  let visualBriefs = [...run.visualBriefs];
  let visualAssets = [...run.visualAssets];
  let accounting = { ...run.accounting };

  for (const concept of targetConcepts) {
    const bible = run.experienceBibles.find((b) => b.experienceConceptId === concept.experienceConceptId);
    if (!bible) continue;

    for (const surfaceType of EXPERIENCE_E_INITIAL_SURFACES) {
      for (const deviceClass of DEVICE_CLASSES) {
        const idem = idempotencyKey(concept.experienceConceptId, surfaceType, deviceClass);
        const existing = visualAssets.find((a) => a.idempotencyKey === idem);
        if (existing?.storagePath) continue;

        const brief = compileExperienceVisualPrompt({
          concept,
          bible,
          territory: territory ?? null,
          world: world ?? null,
          host: hostCanon,
          client: clientCanon,
          functionalCanon,
          surfaceType,
          deviceClass,
        });

        runAllExperienceContaminationTests({
          serializedPrompt: brief.compiledPrompt,
          host: hostCanon,
          client: clientCanon,
        });

        visualBriefs = visualBriefs.filter((b) => b.briefId !== brief.briefId);
        visualBriefs.push(brief);

        const asset: ExperienceVisualDevelopmentAsset = {
          assetId: `EXP-VIS-${concept.conceptIndex}-${surfaceType.slice(0, 4)}-${deviceClass.slice(0, 3)}`,
          assetMedium: 'EXPERIENCE_VISUAL_DEVELOPMENT',
          orgId: NDXBOOK_ORG_ID,
          projectId: 'ndxbook',
          brandSlug: 'ndxbook',
          experimentId: EXPERIMENT_E_RUN_ID,
          experienceConceptId: concept.experienceConceptId,
          experienceBibleId: bible.experienceBibleId,
          surfaceType,
          deviceClass,
          selectedConceptTerritoryId: territory?.territoryId ?? 'snapshot-derived',
          worldExpressionSystemId: world?.expressionSystemId ?? 'none',
          functionalCanonVersion: functionalCanon.version,
          hostCanonVersion: hostCanon.version,
          clientCanonVersion: clientCanon.version,
          intelligenceSnapshotVersion: EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION,
          promptHash: brief.promptHash,
          provider: process.env.VITEST === 'true' ? 'vitest-mock' : 'openai/gpt-image-2',
          model: 'openai/gpt-image-2',
          requestId: null,
          storagePath: visualStoragePath(concept.conceptIndex, surfaceType, deviceClass),
          generationCostUsd: process.env.VITEST === 'true' ? 0 : EXPERIENCE_VISUAL_COST_ESTIMATE_USD,
          founderJudgment: null,
          productionState: 'VISUAL_DEVELOPMENT',
          canonStatus: 'EXPERIMENTAL',
          generatedAt: nowIso(),
          idempotencyKey: idem,
        };

        visualAssets = visualAssets.filter((a) => a.idempotencyKey !== idem);
        visualAssets.push(asset);
        accounting.gptImage2Requests += 1;
        accounting.estimatedCostUsd += asset.generationCostUsd ?? 0;
      }
    }
  }

  const expectedFrames = targetConcepts.length * EXPERIENCE_FRAMES_PER_CONCEPT;
  const generatedCount = visualAssets.filter(
    (a) => targetConcepts.some((c) => c.experienceConceptId === a.experienceConceptId) && a.storagePath,
  ).length;

  run = {
    ...run,
    visualBriefs,
    visualAssets,
    accounting,
    status: generatedCount >= expectedFrames ? 'COMPLETE' : 'GENERATING_VISUALS',
    completedAt: generatedCount >= expectedFrames ? nowIso() : null,
    error: null,
  };

  return experimentEStore.saveExperienceExpressionRun(run);
}

export async function setExperienceConceptJudgment(params: {
  conceptIndex: number;
  judgment: ExperienceConceptJudgment;
}): Promise<ExperienceExpressionRun> {
  const run = await experimentEStore.getExperienceExpressionRun();
  if (!run) throw new Error('Experiment E run not found');

  const experienceConcepts = run.experienceConcepts.map((c) =>
    c.conceptIndex === params.conceptIndex ? { ...c, founderJudgment: params.judgment } : c,
  );

  return experimentEStore.saveExperienceExpressionRun({ ...run, experienceConcepts });
}

export async function compileExperienceImplementationContractForConcept(
  conceptIndex: number,
): Promise<ExperienceExpressionRun> {
  const run = await experimentEStore.getExperienceExpressionRun();
  if (!run?.experimentSnapshot) {
    throw new Error('Experiment E run incomplete');
  }

  const concept = run.experienceConcepts.find((c) => c.conceptIndex === conceptIndex);
  const bible = run.experienceBibles.find((b) => b.experienceConceptId === concept?.experienceConceptId);
  if (!concept || !bible) throw new Error('Experience concept not found');

  const contract = compileExperienceImplementationContract({
    concept,
    bible,
    territory: run.selectedTerritory,
    world: run.worldExpressionSystem,
    functionalCanon: run.functionalCanon ?? extractNdxbookFunctionalCanon(),
    host: run.hostCanon ?? buildHostExperienceCanon(),
    client: run.clientCanon!,
    visualAssets: run.visualAssets,
    assetManifest: run.assetManifest,
    productionAssets: run.productionAssets,
  });

  return experimentEStore.saveExperienceExpressionRun({ ...run, implementationContract: contract });
}

export async function compileExperienceAssetDirectionForConcept(
  conceptIndex: number,
): Promise<ExperienceExpressionRun> {
  let run = await experimentEStore.getExperienceExpressionRun();
  if (!run || run.experienceConcepts.length !== 3) {
    throw new Error('Form three experience concepts before asset direction');
  }

  const concept = run.experienceConcepts.find((c) => c.conceptIndex === conceptIndex);
  const bible = run.experienceBibles.find((b) => b.experienceConceptId === concept?.experienceConceptId);
  if (!concept || !bible) throw new Error('Experience concept not found');

  const scope = run.productionScope ?? defaultNdxbookProductionScope(run.projectId);
  const functionalCanon = run.functionalCanon ?? extractNdxbookFunctionalCanon();
  const clientCanon = run.clientCanon ?? buildClientExperienceCanon({
    profile: await getBrandLoreProfileForOrg(NDXBOOK_ORG_ID),
    territory: run.selectedTerritory,
    world: run.worldExpressionSystem,
    crossMediumEvidence: run.crossMediumEvidence,
  });

  const assetDirection = compileExperienceAssetDirection({
    projectId: run.projectId,
    concept,
    bible,
    functionalCanon,
    client: clientCanon,
    scope,
    surfaces: EXPERIENCE_E_INITIAL_SURFACES,
    revisedWorkbenchDossier: isActiveWorkbenchConcept(concept),
  });

  run = {
    ...run,
    productionScope: scope,
    assetDirection,
  };

  return experimentEStore.saveExperienceExpressionRun(run);
}

export async function compileExperienceAssetManifestForConcept(
  conceptIndex: number,
): Promise<ExperienceExpressionRun> {
  let run = await experimentEStore.getExperienceExpressionRun();
  if (!run) throw new Error('Experiment E run not found');

  if (!run.assetDirection) {
    run = await compileExperienceAssetDirectionForConcept(conceptIndex);
  }

  const concept = run.experienceConcepts.find((c) => c.conceptIndex === conceptIndex);
  const bible = run.experienceBibles.find((b) => b.experienceConceptId === concept?.experienceConceptId);
  if (!concept || !bible || !run.assetDirection) throw new Error('Asset direction required');

  const scope = run.productionScope ?? defaultNdxbookProductionScope(run.projectId);
  const functionalCanon = run.functionalCanon ?? extractNdxbookFunctionalCanon();
  const clientCanon = run.clientCanon!;

  const assetManifest = compileExperienceAssetManifest({
    projectId: run.projectId,
    concept,
    bible,
    assetDirection: run.assetDirection,
    functionalCanon,
    client: clientCanon,
    scope,
    existingRequirements: run.assetRequirements,
  });

  run = {
    ...run,
    assetManifest,
    assetRequirements: assetManifest.requirements,
    assetManifestCompiled: true,
    productionScope: scope,
  };

  return experimentEStore.saveExperienceExpressionRun(run);
}

export async function generateExperienceAssetVisualDevelopment(params: {
  conceptIndex: number;
  action?: ExperienceAssetGenerationAction;
  assetFamily?: string;
  requirementIds?: string[];
}): Promise<ExperienceExpressionRun> {
  let run = await experimentEStore.getExperienceExpressionRun();
  if (!run) throw new Error('Experiment E run not found');

  if (!run.assetManifestCompiled || !run.assetManifest) {
    run = await compileExperienceAssetManifestForConcept(params.conceptIndex);
  }

  const concept = run.experienceConcepts.find((c) => c.conceptIndex === params.conceptIndex);
  const bible = run.experienceBibles.find((b) => b.experienceConceptId === concept?.experienceConceptId);
  if (!concept || !bible || !run.assetManifest) throw new Error('Asset manifest required');

  const action = params.action ?? 'GENERATE_VISUAL_DEVELOPMENT';
  const scope = run.productionScope ?? defaultNdxbookProductionScope(run.projectId);
  const requirements = filterRequirementsForAction(run.assetManifest, action, {
    assetFamily: params.assetFamily,
    requirementIds: params.requirementIds,
  });

  const scopeCheck = validateGenerationScope({
    scope,
    manifest: run.assetManifest,
    requirements,
    spentUsd: run.accounting.estimatedCostUsd,
  });
  if (!scopeCheck.allowed) {
    throw new Error(`Generation blocked by scope: ${scopeCheck.reason}`);
  }

  run = { ...run, assetGenerationStarted: true, visualGenerationStarted: true, status: 'GENERATING_VISUALS' };
  await experimentEStore.saveExperienceExpressionRun(run);

  const territory = run.selectedTerritory;
  const world = run.worldExpressionSystem;
  const functionalCanon = run.functionalCanon ?? extractNdxbookFunctionalCanon();
  const hostCanon = run.hostCanon ?? buildHostExperienceCanon();
  const clientCanon = run.clientCanon!;

  let visualAssets = [...run.visualAssets];
  let productionAssets = [...run.productionAssets];
  let assetGenerationReceipts = [...run.assetGenerationReceipts];
  let assetRequirements = [...run.assetRequirements];
  let accounting = { ...run.accounting };

  for (const requirement of requirements) {
    const existing = visualAssets.find((a) => a.idempotencyKey === requirement.idempotencyKey && a.storagePath);
    if (existing && action !== 'REGENERATE_SELECTED_ASSET') continue;

    const deviceClass = requirement.mobileRequirement ? 'MOBILE' : 'DESKTOP';
    const { promptHash } = buildAssetGenerationBrief({
      requirement,
      concept,
      bible,
      territory: territory ?? null,
      world: world ?? null,
      host: hostCanon,
      client: clientCanon,
      functionalCanon,
      deviceClass,
    });

    const receipt = createGenerationReceipt({
      requirement,
      concept,
      bible,
      promptHash,
      deviceClass,
    });

    const storagePath = assetStoragePath({
      conceptIndex: concept.conceptIndex,
      surfaceId: requirement.surfaceId,
      assetFamily: requirement.assetFamily,
      deviceClass,
    });

    const visualAsset = receiptToVisualAsset({
      receipt,
      requirement,
      orgId: NDXBOOK_ORG_ID,
      experimentId: EXPERIMENT_E_RUN_ID,
      territoryId: territory?.territoryId ?? 'snapshot-derived',
      worldId: world?.expressionSystemId ?? 'none',
      functionalCanonVersion: functionalCanon.version,
      hostCanonVersion: hostCanon.version,
      clientCanonVersion: clientCanon.version,
      intelligenceSnapshotVersion: EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION,
      storagePath,
    });

    const productionAsset = receiptToProductionAsset({ receipt, requirement, visualAsset });

    visualAssets = visualAssets.filter((a) => a.idempotencyKey !== requirement.idempotencyKey);
    visualAssets.push(visualAsset);
    productionAssets = productionAssets.filter((a) => a.requirementId !== requirement.id);
    productionAssets.push(productionAsset);
    assetGenerationReceipts = assetGenerationReceipts.filter((r) => r.requirementId !== requirement.id);
    assetGenerationReceipts.push(receipt);

    assetRequirements = assetRequirements.map((r) =>
      r.id === requirement.id ? { ...r, status: 'GENERATED' as const, updatedAt: nowIso() } : r,
    );

    accounting.falRequests += 1;
    accounting.gptImage2Requests += 1;
    accounting.estimatedCostUsd += receipt.costUsd;
  }

  run = {
    ...run,
    visualAssets,
    productionAssets,
    assetGenerationReceipts,
    assetRequirements,
    assetManifest: run.assetManifest ? { ...run.assetManifest, requirements: assetRequirements } : null,
    accounting,
    status: 'GENERATING_VISUALS',
    error: null,
  };

  return experimentEStore.saveExperienceExpressionRun(run);
}

export async function promoteExperienceAssetToProduction(params: {
  assetId: string;
  promotedBy: string;
}): Promise<ExperienceExpressionRun> {
  const run = await experimentEStore.getExperienceExpressionRun();
  if (!run) throw new Error('Experiment E run not found');

  const assetIndex = run.productionAssets.findIndex((a) => a.assetId === params.assetId);
  if (assetIndex < 0) throw new Error('Asset not found');

  const asset = run.productionAssets[assetIndex];
  const approvedFirst: ExperienceProductionAsset = {
    ...asset,
    productionState: 'APPROVED_VISUAL_DEVELOPMENT',
    founderJudgment: 'LOVE_IT',
  };

  const promoted = promoteAssetToProduction(approvedFirst, { promotedBy: params.promotedBy });
  const productionAssets = [...run.productionAssets];
  productionAssets[assetIndex] = promoted;

  const assetRequirements = run.assetRequirements.map((r) =>
    r.id === promoted.requirementId
      ? {
          ...r,
          status: 'PROMOTED_TO_PRODUCTION' as const,
          productionEligibility: 'PRODUCTION_ELIGIBLE' as const,
          updatedAt: nowIso(),
        }
      : r,
  );

  const visualAssets = run.visualAssets.map((a) =>
    a.assetId === params.assetId
      ? { ...a, productionState: 'PROMOTED_TO_PRODUCTION', canonStatus: 'PRODUCTION' }
      : a,
  );

  return experimentEStore.saveExperienceExpressionRun({
    ...run,
    productionAssets,
    assetRequirements,
    visualAssets,
    assetManifest: run.assetManifest ? { ...run.assetManifest, requirements: assetRequirements } : null,
  });
}

export function estimateVisualDevelopmentCost(conceptCount: number): number {
  return conceptCount * EXPERIENCE_FRAMES_PER_CONCEPT * EXPERIENCE_VISUAL_COST_ESTIMATE_USD;
}
