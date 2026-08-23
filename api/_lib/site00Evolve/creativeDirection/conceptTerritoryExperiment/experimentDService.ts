/**
 * Experiment D — six-concept hero range (founder-triggered, max 6 heroes).
 */

import { createHash } from 'node:crypto';
import {
  CONCEPT_TERRITORY_METHODOLOGY_VERSION,
  EXPERIMENT_D_CLASSIFICATION,
  EXPERIMENT_D_HERO_COST_ESTIMATE_USD,
  EXPERIMENT_D_MAX_HEROES,
  EXPERIMENT_D_RUN_ID,
  EXPERIMENT_D_TOPIC_ID,
  EXPERIMENT_D_TOPIC_NAME,
} from '../../../../../shared/site00-brand-lore/conceptTerritory/conceptTerritoryConstants.js';
import type {
  ExperimentDHeroCandidate,
  ExperimentDHeroJudgment,
  SixConceptHeroRangeRun,
} from '../../../../../shared/site00-brand-lore/conceptTerritory/conceptTerritoryTypes.js';
import { buildAllConceptTerritorySeeds } from '../../../../../shared/site00-brand-lore/conceptTerritory/conceptTerritorySeeds.js';
import {
  runConceptOrthogonalityGate,
  runVisualOrthogonalityGate,
} from '../../../../../shared/site00-brand-lore/conceptTerritory/conceptOrthogonality.js';
import { runForensicVisualConvergenceAudit } from '../../../../../shared/site00-brand-lore/conceptTerritory/visualConvergenceAudit.js';
import { buildCrossWorldComparisonMatrix } from '../../../../../shared/site00-brand-lore/conceptTerritory/crossWorldComparisonMatrix.js';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';
import { generateIdentityNativeImageFromBrief } from '../creativeIntelligence/gptImage2VisualProviderAdapter.js';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import { getCanonicalCarouselExpansionRun } from '../canonicalCarouselExpansion/canonicalCarouselExpansionService.js';
import { getCanonicalCreativeRangeRun } from '../canonicalCreativeRange/canonicalCreativeRangeService.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import * as experimentDStore from './storeAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

function hashPrompt(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function emptyAccounting(): SixConceptHeroRangeRun['accounting'] {
  return { anthropicRequests: 0, gptImage2Requests: 0, falRequests: 0, estimatedCostUsd: 0 };
}

function heroStoragePath(comparisonIndex: number): string {
  return `site00/validation/ndxbook/concept-territory-heroes/${String(comparisonIndex).padStart(2, '0')}/hero.webp`;
}

function aspectRatioForFormat(format: string): string {
  if (format === 'STORY_FRAME' || format === 'REEL_HOOK' || format === 'TIKTOK_VERTICAL') return '9:16';
  return '1:1';
}

function initRun(existing?: SixConceptHeroRangeRun | null): SixConceptHeroRangeRun {
  if (existing) return existing;
  return {
    experimentClassification: EXPERIMENT_D_CLASSIFICATION,
    runId: EXPERIMENT_D_RUN_ID,
    organizationId: NDXBOOK_ORG_ID,
    projectId: 'ndxbook',
    methodologyVersion: CONCEPT_TERRITORY_METHODOLOGY_VERSION,
    topicId: EXPERIMENT_D_TOPIC_ID,
    topicName: EXPERIMENT_D_TOPIC_NAME,
    status: 'NOT_STARTED',
    generationReady: false,
    generationStarted: false,
    territories: [],
    expressionSystems: [],
    conceptOrthogonality: null,
    visualOrthogonality: null,
    forensicAudit: null,
    heroes: [],
    accounting: emptyAccounting(),
    error: null,
    startedAt: nowIso(),
    completedAt: null,
  };
}

function buildConceptFirstHeroBrief(candidate: ExperimentDHeroCandidate): Record<string, unknown> {
  const { territory, expressionSystem } = candidate;
  return {
    methodologyVersion: CONCEPT_TERRITORY_METHODOLOGY_VERSION,
    experimentClassification: EXPERIMENT_D_CLASSIFICATION,
    topic: EXPERIMENT_D_TOPIC_NAME,
    directionName: territory.directionName,
    conceptTerritory: {
      centralConcept: territory.centralConcept,
      worldPremise: territory.worldPremise,
      conceptualMetaphor: territory.conceptualMetaphor,
      viewerRole: territory.viewerRole,
      brandRole: territory.brandRole,
      primaryVisualMechanism: territory.primaryVisualMechanism,
    },
    worldExpression: {
      typographySystem: expressionSystem.typographySystem,
      paletteSystem: expressionSystem.paletteSystem,
      materialSystem: expressionSystem.materialSystem,
      imagerySystem: expressionSystem.imagerySystem,
      compositionSystem: expressionSystem.compositionSystem,
      graphicGrammar: expressionSystem.graphicGrammar,
      nativeProofFormat: expressionSystem.nativeProofFormat,
    },
    forbidden: [
      ...territory.forbiddenSignals,
      ...expressionSystem.forbiddenSiblingBehaviors,
      'Do not inherit sibling visual kit',
      'Do not use pre-territory paper/lime/condensed-type defaults unless concept-derived',
    ],
    role: 'CONCEPT_TERRITORY_HERO',
  };
}

function buildHeroCandidates(
  territories: SixConceptHeroRangeRun['territories'],
  expressionSystems: SixConceptHeroRangeRun['expressionSystems'],
  rangeHeroPaths: Map<number, string | null>,
): ExperimentDHeroCandidate[] {
  return CANONICAL_NDXBOOK_DIRECTION_NAMES.map((name, i) => {
    const comparisonIndex = i + 1;
    const territory = territories.find((t) => t.directionName === name)!;
    const expressionSystem = expressionSystems.find((e) => e.directionName === name)!;
    return {
      comparisonIndex,
      directionName: name,
      territory,
      expressionSystem,
      previousMethodologyHeroStoragePath: rangeHeroPaths.get(comparisonIndex) ?? null,
      heroAsset: null,
      generationReceipt: null,
      founderJudgment: null,
      tooCloseSibling: null,
    };
  });
}

export async function getSixConceptHeroRangeRun(): Promise<SixConceptHeroRangeRun | null> {
  return experimentDStore.getSixConceptHeroRangeRun();
}

export async function formExperimentDTerritories(): Promise<SixConceptHeroRangeRun> {
  const carouselRun = await getCanonicalCarouselExpansionRun();
  const rangeRun = await getCanonicalCreativeRangeRun();
  const { territories, expressionSystems } = buildAllConceptTerritorySeeds();
  const conceptOrthogonality = runConceptOrthogonalityGate(territories);
  const visualOrthogonality = runVisualOrthogonalityGate(expressionSystems);
  const forensicAudit = runForensicVisualConvergenceAudit(carouselRun);

  const rangeHeroPaths = new Map<number, string | null>();
  for (const dir of rangeRun?.directions ?? []) {
    rangeHeroPaths.set(dir.comparisonIndex, dir.heroAsset?.storagePath ?? null);
  }

  const heroes = buildHeroCandidates(territories, expressionSystems, rangeHeroPaths);
  const generationReady = conceptOrthogonality.passed && visualOrthogonality.passed && !visualOrthogonality.blocksGeneration;

  const run: SixConceptHeroRangeRun = {
    ...initRun(await experimentDStore.getSixConceptHeroRangeRun()),
    status: generationReady ? 'GENERATION_READY' : 'ORTHOGONALITY_READY',
    generationReady,
    generationStarted: false,
    territories,
    expressionSystems,
    conceptOrthogonality,
    visualOrthogonality,
    forensicAudit,
    heroes,
    error: generationReady
      ? null
      : visualOrthogonality.blocksGeneration
        ? 'Visual orthogonality CLONE_RISK — review required before hero generation'
        : null,
    startedAt: nowIso(),
  };

  buildCrossWorldComparisonMatrix(territories, expressionSystems);
  return experimentDStore.saveSixConceptHeroRangeRun(run);
}

export async function executeExperimentDHeroGeneration(): Promise<SixConceptHeroRangeRun> {
  let run = await experimentDStore.getSixConceptHeroRangeRun();
  if (!run || !run.generationReady) {
    throw new Error('Experiment D not generation-ready — form territories and pass orthogonality gates first');
  }
  if (run.visualOrthogonality?.blocksGeneration) {
    throw new Error('CLONE_RISK blocks generation — founder review required');
  }
  if (run.status === 'COMPLETE') return run;

  run = { ...run, generationStarted: true, status: 'GENERATING' };
  await experimentDStore.saveSixConceptHeroRangeRun(run);

  let accounting = { ...run.accounting };
  const heroes: ExperimentDHeroCandidate[] = [];

  try {
    for (const candidate of run.heroes) {
      if (candidate.heroAsset?.storagePath) {
        heroes.push(candidate);
        continue;
      }

      const brief = buildConceptFirstHeroBrief(candidate);
      const promptHash = hashPrompt(JSON.stringify(brief));
      const nativeFormat = candidate.expressionSystem.nativeProofFormat;

      if (process.env.VITEST === 'true' || !process.env.FAL_KEY?.trim()) {
        if (process.env.VITEST !== 'true') {
          throw new Error('FAL_KEY not configured — Experiment D hero generation blocked until founder trigger with provider');
        }
        heroes.push({
          ...candidate,
          heroAsset: {
            assetId: `NDX-CONCEPT-TERRITORY-${String(candidate.comparisonIndex).padStart(2, '0')}`,
            storagePath: heroStoragePath(candidate.comparisonIndex),
            generatedAt: nowIso(),
          },
          generationReceipt: {
            firstGenerationResult: 'SUCCESS',
            promptHash,
            model: 'openai/gpt-image-2',
            costUsd: 0,
            methodologyVersion: CONCEPT_TERRITORY_METHODOLOGY_VERSION,
          },
        });
        accounting.gptImage2Requests += 1;
        continue;
      }

      const generation = await generateIdentityNativeImageFromBrief({
        brief,
        aspectRatio: aspectRatioForFormat(nativeFormat),
      });
      accounting.falRequests += 1;
      accounting.gptImage2Requests += 1;
      accounting.estimatedCostUsd += generation.costEstimateUsd;

      const imageBuffer = await downloadUrlToBuffer(generation.url);
      const storagePath = heroStoragePath(candidate.comparisonIndex);
      await uploadSite00AssetBuffer(storagePath, imageBuffer, 'image/webp', { upsert: true });

      heroes.push({
        ...candidate,
        heroAsset: {
          assetId: `NDX-CONCEPT-TERRITORY-${String(candidate.comparisonIndex).padStart(2, '0')}`,
          storagePath,
          generatedAt: nowIso(),
        },
        generationReceipt: {
          firstGenerationResult: 'SUCCESS',
          promptHash,
          model: 'openai/gpt-image-2',
          costUsd: generation.costEstimateUsd,
          methodologyVersion: CONCEPT_TERRITORY_METHODOLOGY_VERSION,
        },
      });

      if (heroes.filter((h) => h.heroAsset).length >= EXPERIMENT_D_MAX_HEROES) break;
    }

    const complete = heroes.every((h) => h.heroAsset) || heroes.filter((h) => h.heroAsset).length >= EXPERIMENT_D_MAX_HEROES;
    run = {
      ...run,
      heroes,
      accounting,
      status: complete ? 'COMPLETE' : 'GENERATING',
      completedAt: complete ? nowIso() : null,
      error: null,
    };
    return experimentDStore.saveSixConceptHeroRangeRun(run);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    run = { ...run, status: 'FAILED', error: message, heroes, accounting };
    return experimentDStore.saveSixConceptHeroRangeRun(run);
  }
}

export async function setExperimentDHeroJudgment(params: {
  comparisonIndex: number;
  judgment: ExperimentDHeroJudgment;
  tooCloseSibling?: string | null;
}): Promise<SixConceptHeroRangeRun> {
  const run = await experimentDStore.getSixConceptHeroRangeRun();
  if (!run) throw new Error('Experiment D run not found');

  const heroes = run.heroes.map((h) =>
    h.comparisonIndex === params.comparisonIndex
      ? {
          ...h,
          founderJudgment: params.judgment,
          tooCloseSibling:
            params.judgment === 'TOO_CLOSE_TO_ANOTHER'
              ? ((params.tooCloseSibling as ExperimentDHeroCandidate['tooCloseSibling']) ?? null)
              : null,
        }
      : h,
  );

  return experimentDStore.saveSixConceptHeroRangeRun({ ...run, heroes });
}

export function estimateExperimentDHeroCost(pendingHeroCount: number): number {
  return pendingHeroCount * EXPERIMENT_D_HERO_COST_ESTIMATE_USD;
}

export { buildCrossWorldComparisonMatrix };
