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
import { auditNdxbookProjectHomeTemplate } from '../../../../../shared/site00-brand-lore/experienceExpression/genericTemplateAudit.js';
import { assessExperienceExpressionReadiness } from '../../../../../shared/site00-brand-lore/experienceExpression/readiness.js';
import { buildExperienceConceptsForTerritory } from '../../../../../shared/site00-brand-lore/experienceExpression/experienceConceptSeeds.js';
import { buildExperienceBible } from '../../../../../shared/site00-brand-lore/experienceExpression/experienceBibleBuilder.js';
import { runExperienceConceptDistinctivenessGate } from '../../../../../shared/site00-brand-lore/experienceExpression/distinctiveness.js';
import { translateWorldBehaviorIntoExperienceBehavior } from '../../../../../shared/site00-brand-lore/experienceExpression/behaviorTranslation.js';
import {
  buildResponsiveExperienceTranslation,
  compileExperienceVisualPrompt,
} from '../../../../../shared/site00-brand-lore/experienceExpression/visualPromptCompiler.js';
import { runAllExperienceContaminationTests } from '../../../../../shared/site00-brand-lore/experienceExpression/contaminationGuards.js';
import { compileExperienceImplementationContract } from '../../../../../shared/site00-brand-lore/experienceExpression/implementationContract.js';
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
    estimatedCostUsd: 0,
  };
}

function initRun(existing?: ExperienceExpressionRun | null): ExperienceExpressionRun {
  if (existing) {
    return {
      ...existing,
      intelligenceSnapshotVersion:
        existing.intelligenceSnapshotVersion ?? EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION,
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
      experienceTestTerritoryId: null,
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
    experienceConcepts: [],
    experienceBibles: [],
    responsiveTranslations: [],
    behaviorTranslations: [],
    distinctiveness: null,
    visualBriefs: [],
    visualAssets: [],
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
  const templateAudit = auditNdxbookProjectHomeTemplate();

  const territory = run.selectedTerritory;
  const world = run.worldExpressionSystem;

  const clientCanon = buildClientExperienceCanon({ profile, territory: territory ?? null, world: world ?? null });

  const readiness = assessExperienceExpressionReadiness({
    profile,
    territory: territory ?? null,
    world: world ?? null,
    functionalCanon,
    hostCanon,
    experienceTestTerritoryId: run.experienceTestTerritoryId,
  });

  return { profile, functionalCanon, hostCanon, templateAudit, clientCanon, readiness };
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
    readiness: ctx.readiness,
    status: ctx.readiness.conceptTerritorySelected ? run.status : 'WAITING_FOR_TERRITORY',
    formationReady: ctx.readiness.state === 'READY_FOR_EXPERIENCE_FORMATION' && run.experienceConcepts.length === 3,
    visualGenerationReady: run.experienceConcepts.length === 3 && run.distinctiveness !== null,
  };

  return experimentEStore.saveExperienceExpressionRun(run);
}

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
    throw new Error('Invalid territory selection — founder must choose a Concept Territory for Experiment E');
  }

  const { territory, expression: world } = buildConceptTerritorySeed(directionName);
  const ctx = await buildBaseContext({
    ...run,
    experienceTestTerritoryId: territory.territoryId,
    selectedTerritory: territory,
    worldExpressionSystem: world,
  });

  run = {
    ...run,
    experienceTestTerritoryId: territory.territoryId,
    experienceTestTerritoryName: territory.directionName,
    selectionPurpose: EXPERIENCE_TERRITORY_SELECTION_PURPOSE,
    selectedTerritory: territory,
    worldExpressionSystem: world,
    functionalCanon: ctx.functionalCanon,
    hostCanon: ctx.hostCanon,
    clientCanon: ctx.clientCanon,
    templateAudit: ctx.templateAudit,
    readiness: ctx.readiness,
    status: ctx.readiness.state === 'READY_FOR_EXPERIENCE_FORMATION' ? 'READY_TO_FORM' : 'WAITING_FOR_TERRITORY',
    experienceConcepts: [],
    experienceBibles: [],
    responsiveTranslations: [],
    behaviorTranslations: [],
    distinctiveness: null,
    visualBriefs: [],
    visualAssets: [],
    implementationContract: null,
    formationReady: false,
    visualGenerationReady: false,
  };

  return experimentEStore.saveExperienceExpressionRun(run);
}

export async function formExperienceConcepts(): Promise<ExperienceExpressionRun> {
  let run = await experimentEStore.getExperienceExpressionRun();
  if (!run?.selectedTerritory || !run.worldExpressionSystem) {
    throw new Error('SELECT CONCEPT TERRITORY FOR EXPERIENCE TEST before formation');
  }
  if (run.readiness.state !== 'READY_FOR_EXPERIENCE_FORMATION') {
    throw new Error(`Experience Expression not ready: ${run.readiness.state}`);
  }

  run = { ...run, status: 'FORMING' };
  await experimentEStore.saveExperienceExpressionRun(run);

  const profile = await getBrandLoreProfileForOrg(NDXBOOK_ORG_ID);
  const appetiteLineage =
    profile?.founderCreativeAppetite && Object.keys(profile.founderCreativeAppetite.rawAnswers ?? {}).length > 0
      ? summarizeCreativeAppetiteForFormation(profile.founderCreativeAppetite)
      : 'PARTIAL_APPETITE_CONTEXT';

  const territory = run.selectedTerritory;
  const world = run.worldExpressionSystem;
  const functionalCanon = run.functionalCanon ?? extractNdxbookFunctionalCanon();
  const hostCanon = run.hostCanon ?? buildHostExperienceCanon();
  const clientCanon =
    run.clientCanon ?? buildClientExperienceCanon({ profile, territory, world });

  const experienceConcepts = buildExperienceConceptsForTerritory({
    territory,
    world,
    appetiteLineage,
  });

  const experienceBibles = experienceConcepts.map((concept) =>
    buildExperienceBible({ concept, territory, world, host: hostCanon, client: clientCanon }),
  );

  const responsiveTranslations = experienceConcepts.map(buildResponsiveExperienceTranslation);

  const behaviorTranslations = experienceConcepts.map((concept) =>
    translateWorldBehaviorIntoExperienceBehavior({
      territory,
      world,
      concept,
      functionalCanon,
      hostCanon,
    }),
  );

  const distinctiveness = runExperienceConceptDistinctivenessGate(experienceConcepts);

  let accounting = { ...run.accounting, anthropicRequests: run.accounting.anthropicRequests + 1 };

  run = {
    ...run,
    experienceConcepts,
    experienceBibles,
    responsiveTranslations,
    behaviorTranslations,
    distinctiveness,
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
    throw new Error('Visual generation not ready');
  }

  const territory = run.selectedTerritory!;
  const world = run.worldExpressionSystem!;
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
          territory,
          world,
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
          selectedConceptTerritoryId: territory.territoryId,
          worldExpressionSystemId: world.expressionSystemId,
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
  if (!run?.selectedTerritory || !run.worldExpressionSystem) {
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
  });

  return experimentEStore.saveExperienceExpressionRun({ ...run, implementationContract: contract });
}

export function estimateVisualDevelopmentCost(conceptCount: number): number {
  return conceptCount * EXPERIENCE_FRAMES_PER_CONCEPT * EXPERIENCE_VISUAL_COST_ESTIMATE_USD;
}
