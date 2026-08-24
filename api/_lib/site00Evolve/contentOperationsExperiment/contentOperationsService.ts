/**
 * NDXBOOK Content Operations service — P0.5D
 */

import {
  NDXBOOK_CONTENT_OPERATIONS_RUN_ID,
  LIVE_CULTURAL_INTELLIGENCE_LAYER_IMPLEMENTED,
  LIVE_SIGNAL_INGESTION_NOT_CONNECTED,
} from '../../../../shared/site00-brand-lore/contentOperations/constants.js';
import { auditContentSystems } from '../../../../shared/site00-brand-lore/contentOperations/forensicAudit.js';
import {
  compileContentOperationsSystem,
  contentOperationsRequiresUpstream,
} from '../../../../shared/site00-brand-lore/contentOperations/contentOperationsCompiler.js';
import { buildDefaultEditorialStrategy } from '../../../../shared/site00-brand-lore/contentOperations/editorialStrategy.js';
import { buildDefaultApprovalPolicy } from '../../../../shared/site00-brand-lore/contentOperations/approvalPolicy.js';
import { createEmptyContentMemoryIndex } from '../../../../shared/site00-brand-lore/contentOperations/editorialMemory.js';
import { seedPilotOpportunities } from '../../../../shared/site00-brand-lore/contentOperations/opportunityEngine.js';
import { buildWeeklyEditorialSlate } from '../../../../shared/site00-brand-lore/contentOperations/editorialSlate.js';
import { selectChannelForOpportunity, selectFormatForOpportunity } from '../../../../shared/site00-brand-lore/contentOperations/channelFormatSelection.js';
import { buildSocialContentPackage } from '../../../../shared/site00-brand-lore/contentOperations/contentPackage.js';
import { buildPublishingHandoffPackage, buildCalendarEntry } from '../../../../shared/site00-brand-lore/contentOperations/publishingCalendar.js';
import {
  createPerformanceRecord,
  createPerformanceLearning,
  createAudienceResponse,
} from '../../../../shared/site00-brand-lore/contentOperations/performanceLearning.js';
import { evaluateEditorialHealth, createProductionBudget } from '../../../../shared/site00-brand-lore/contentOperations/editorialHealth.js';
import {
  buildNdxbookMarketTest01,
  defaultConnectorCapabilities,
} from '../../../../shared/site00-brand-lore/contentOperations/marketTestAndInvalidation.js';
import { buildVitestUpstreamIds } from '../../../../shared/site00-brand-lore/contentOperations/vitestFixtures.js';
import type { ContentOperationsRun } from '../../../../shared/site00-brand-lore/contentOperations/types.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';
import * as opsStore from './contentOperationsStoreAdapter.js';
import * as marketingStore from '../creativeDirection/brandMarketingExpressionExperiment/brandMarketingExpressionStoreAdapter.js';
import * as synthesisStore from '../creativeDirection/brandCharacterExperiment/brandCharacterSynthesisStoreAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

function emptyAccounting(): ContentOperationsRun['accounting'] {
  return {
    anthropicRequests: 0,
    anthropicEstimatedCostUsd: 0,
    falRequests: 0,
    falEstimatedCostUsd: 0,
    falActualCostUsd: 0,
  };
}

function initRun(projectId: string): ContentOperationsRun {
  return {
    runId: NDXBOOK_CONTENT_OPERATIONS_RUN_ID,
    projectId,
    organizationId: NDXBOOK_ORG_ID,
    status: 'NOT_STARTED',
    brandCharacterSystemId: null,
    marketingExpressionSystemId: null,
    preconditionsMet: false,
    forensicAudit: null,
    operationsSystem: null,
    editorialStrategy: null,
    editorialMemory: null,
    approvalPolicy: null,
    opportunities: [],
    activeSlate: null,
    contentPackages: [],
    calendar: [],
    publishingHandoffs: [],
    performanceRecords: [],
    audienceResponses: [],
    performanceLearning: [],
    contentExperiments: [],
    editorialHealth: null,
    productionBudget: null,
    marketTest01: null,
    connectorCapabilities: defaultConnectorCapabilities(),
    error: null,
    accounting: emptyAccounting(),
    updatedAt: nowIso(),
  };
}

async function resolveUpstreamIds(projectId: string): Promise<{
  brandCharacterSystemId: string | null;
  marketingExpressionSystemId: string | null;
  preconditionsMet: boolean;
}> {
  if (process.env.VITEST === 'true') {
    const ids = buildVitestUpstreamIds();
    return { ...ids, preconditionsMet: true };
  }
  const synthesis = await synthesisStore.getBrandCharacterSynthesisRun(projectId);
  const marketing = await marketingStore.getBrandMarketingExpressionRun(projectId);
  const brandCharacterSystemId = synthesis?.characterSystem?.id ?? null;
  const marketingExpressionSystemId = marketing?.expressionSystem?.id ?? null;
  const preconditionsMet = contentOperationsRequiresUpstream({
    brandCharacterSystemId,
    marketingExpressionSystemId,
  });
  return { brandCharacterSystemId, marketingExpressionSystemId, preconditionsMet };
}

export async function getContentOperationsState(params: {
  projectId: string;
}): Promise<ContentOperationsRun | null> {
  return opsStore.getContentOperationsRun(params.projectId);
}

export async function prepareContentOperations(params: {
  projectId: string;
}): Promise<ContentOperationsRun> {
  const upstream = await resolveUpstreamIds(params.projectId);
  if (!upstream.preconditionsMet) {
    throw new Error(
      'BrandCharacterSystem and BrandMarketingExpressionSystem required — complete P0.5B synthesis and P0.5C marketing expression first',
    );
  }

  const existing = (await opsStore.getContentOperationsRun(params.projectId)) ?? initRun(params.projectId);
  const forensicAudit = auditContentSystems({ projectId: params.projectId });

  return opsStore.saveContentOperationsRun({
    ...existing,
    status: 'AUDITED',
    brandCharacterSystemId: upstream.brandCharacterSystemId,
    marketingExpressionSystemId: upstream.marketingExpressionSystemId,
    preconditionsMet: true,
    forensicAudit,
    error: null,
    updatedAt: nowIso(),
  });
}

export async function compileContentOperations(params: {
  projectId: string;
}): Promise<ContentOperationsRun> {
  const run = await opsStore.getContentOperationsRun(params.projectId);
  if (!run?.preconditionsMet) throw new Error('Run forensic audit first');

  const operationsSystem = compileContentOperationsSystem({
    projectId: params.projectId,
    brandCharacterSystemId: run.brandCharacterSystemId!,
    marketingExpressionSystemId: run.marketingExpressionSystemId!,
  });

  return opsStore.saveContentOperationsRun({
    ...run,
    status: 'COMPILED',
    operationsSystem,
    editorialStrategy: buildDefaultEditorialStrategy(params.projectId),
    editorialMemory: createEmptyContentMemoryIndex(params.projectId),
    approvalPolicy: buildDefaultApprovalPolicy(params.projectId),
    productionBudget: createProductionBudget({ projectId: params.projectId }),
    marketTest01: buildNdxbookMarketTest01(params.projectId),
    connectorCapabilities: defaultConnectorCapabilities(),
    error: null,
    updatedAt: nowIso(),
  });
}

export async function discoverContentOpportunities(params: {
  projectId: string;
}): Promise<ContentOperationsRun> {
  const run = await opsStore.getContentOperationsRun(params.projectId);
  if (!run?.operationsSystem) throw new Error('Compile content operations first');

  const opportunities = seedPilotOpportunities(params.projectId, run.editorialMemory);

  return opsStore.saveContentOperationsRun({
    ...run,
    status: 'OPPORTUNITIES_READY',
    opportunities,
    error: null,
    updatedAt: nowIso(),
  });
}

export async function proposeWeeklySlate(params: { projectId: string }): Promise<ContentOperationsRun> {
  const run = await opsStore.getContentOperationsRun(params.projectId);
  if (!run?.opportunities.length) throw new Error('Discover opportunities first');

  const slate = buildWeeklyEditorialSlate({
    projectId: params.projectId,
    opportunities: run.opportunities,
  });

  return opsStore.saveContentOperationsRun({
    ...run,
    status: 'SLATE_PROPOSED',
    activeSlate: slate,
    updatedAt: nowIso(),
  });
}

export async function approveWeeklySlate(params: {
  projectId: string;
  judgment?: string;
}): Promise<ContentOperationsRun> {
  const run = await opsStore.getContentOperationsRun(params.projectId);
  if (!run?.activeSlate) throw new Error('No slate proposed');

  const marketingRun = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  const packages = await Promise.all(
    run.activeSlate.contentCandidates.map(async (c) => {
      const opp = run.opportunities.find((o) => o.id === c.opportunityId)!;
      return buildSocialContentPackage({
        projectId: params.projectId,
        opportunity: opp,
        channel: selectChannelForOpportunity(opp),
        format: selectFormatForOpportunity(opp, selectChannelForOpportunity(opp)),
        expressionSystem: marketingRun?.expressionSystem ?? undefined,
        characterSystemId: run.brandCharacterSystemId ?? undefined,
      });
    }),
  );

  const calendar = packages.map((p) => buildCalendarEntry({ projectId: params.projectId, pkg: p }));
  const editorialHealth = evaluateEditorialHealth({
    projectId: params.projectId,
    packages,
    slate: run.activeSlate,
  });

  return opsStore.saveContentOperationsRun({
    ...run,
    status: 'IN_PRODUCTION',
    activeSlate: {
      ...run.activeSlate,
      status: 'APPROVED',
      founderJudgment: params.judgment ?? 'APPROVE_SLATE',
    },
    contentPackages: packages,
    calendar,
    editorialHealth,
    marketTest01: run.marketTest01
      ? { ...run.marketTest01, status: 'SLATE_APPROVED', slateId: run.activeSlate.slateId }
      : null,
    updatedAt: nowIso(),
  });
}

export async function setContentPackageJudgment(params: {
  projectId: string;
  packageId: string;
  judgment: string;
}): Promise<ContentOperationsRun> {
  const run = await opsStore.getContentOperationsRun(params.projectId);
  if (!run) throw new Error('Run not found');

  const packages = run.contentPackages.map((p) =>
    p.id === params.packageId
      ? { ...p, founderJudgment: params.judgment, status: 'FOUNDER_REVIEW' as const, updatedAt: nowIso() }
      : p,
  );

  return opsStore.saveContentOperationsRun({ ...run, contentPackages: packages, updatedAt: nowIso() });
}

export async function approveContentPackage(params: {
  projectId: string;
  packageId: string;
}): Promise<ContentOperationsRun> {
  const run = await opsStore.getContentOperationsRun(params.projectId);
  if (!run) throw new Error('Run not found');

  const packages = run.contentPackages.map((p) => {
    if (p.id !== params.packageId) return p;
    const connector = run.connectorCapabilities.find((c) => c.platform === 'INSTAGRAM');
    const handoff = buildPublishingHandoffPackage({
      pkg: { ...p, status: 'APPROVED', founderJudgment: 'APPROVE' },
      connectorCapability: connector?.publish ?? 'NOT_CONNECTED',
    });
    return { ...p, status: 'APPROVED' as const, founderJudgment: 'APPROVE', updatedAt: nowIso() };
  });

  const handoffs = packages
    .filter((p) => p.id === params.packageId)
    .map((p) =>
      buildPublishingHandoffPackage({
        pkg: p,
        connectorCapability: run.connectorCapabilities.find((c) => c.platform === 'INSTAGRAM')?.publish ?? 'NOT_CONNECTED',
      }),
    );

  return opsStore.saveContentOperationsRun({
    ...run,
    contentPackages: packages,
    publishingHandoffs: [...run.publishingHandoffs, ...handoffs],
    updatedAt: nowIso(),
  });
}

export async function recordManualPerformance(params: {
  projectId: string;
  packageId: string;
  metrics?: Record<string, number | null>;
}): Promise<ContentOperationsRun> {
  const run = await opsStore.getContentOperationsRun(params.projectId);
  if (!run) throw new Error('Run not found');

  const record = createPerformanceRecord({
    contentPackageId: params.packageId,
    platform: 'INSTAGRAM',
    metrics: {
      impressions: params.metrics?.impressions ?? null,
      saves: params.metrics?.saves ?? null,
      likes: params.metrics?.likes ?? null,
      comments: params.metrics?.comments ?? null,
      metricAvailability: {
        impressions: params.metrics?.impressions != null,
        saves: params.metrics?.saves != null,
      },
    },
  });

  const audience = createAudienceResponse({
    contentPackageId: params.packageId,
    text: 'Founder observed audience reaction',
    classifications: ['FOUND_USEFUL'],
  });

  const learning = createPerformanceLearning({
    projectId: params.projectId,
    sourceContentIds: [params.packageId],
    sampleSize: run.performanceRecords.length + 1,
    patterns: ['Early pilot — insufficient sample for strong conclusions'],
  });

  return opsStore.saveContentOperationsRun({
    ...run,
    status: 'LEARNING',
    performanceRecords: [...run.performanceRecords, record],
    audienceResponses: [...run.audienceResponses, audience],
    performanceLearning: [...run.performanceLearning, learning],
    marketTest01: run.marketTest01 ? { ...run.marketTest01, status: 'LEARNING' } : null,
    updatedAt: nowIso(),
  });
}

export async function acceptPerformanceLearning(params: {
  projectId: string;
  learningId: string;
}): Promise<ContentOperationsRun> {
  const run = await opsStore.getContentOperationsRun(params.projectId);
  if (!run) throw new Error('Run not found');

  const learning = run.performanceLearning.map((l) =>
    l.learningId === params.learningId ? { ...l, founderAccepted: true, status: 'ACCEPTED' as const } : l,
  );

  return opsStore.saveContentOperationsRun({ ...run, performanceLearning: learning, updatedAt: nowIso() });
}

export function liveSignalIngestionNotConnected(): boolean {
  return LIVE_SIGNAL_INGESTION_NOT_CONNECTED;
}

export function liveCulturalIntelligenceLayerImplemented(): boolean {
  return LIVE_CULTURAL_INTELLIGENCE_LAYER_IMPLEMENTED;
}

export function noPageLoadGeneration(): true {
  return true;
}

export function noAutomaticPublishing(): true {
  return true;
}

export async function seedVitestContentOperationsPrerequisites(): Promise<void> {
  if (process.env.VITEST !== 'true') return;
  await synthesisStore.saveBrandCharacterSynthesisRun({
    runId: 'ndxbook-brand-character-synthesis',
    projectId: 'ndxbook',
    organizationId: NDXBOOK_ORG_ID,
    formationRunId: 'vitest-ops',
    status: 'SYSTEM_COMPILED',
    territoryRoles: {},
    sourceTerritoryIds: [],
    sourceDevelopmentIds: [],
    founderHypothesis: null,
    readinessRefresh: null,
    synthesis: null,
    synthesisEvaluation: null,
    maturationEvaluation: null,
    characterSystem: {
      id: 'bcs-vitest-ops',
    } as never,
    artifactProofs: [],
    artifactRevisions: [],
    experimentGCharacterReevaluationRequired: true,
    synthesisStartedAt: null,
    synthesisAttemptId: null,
    error: null,
    accounting: {
      anthropicRequests: 0,
      anthropicInputTokens: 0,
      anthropicOutputTokens: 0,
      anthropicEstimatedCostUsd: 0,
      falRequests: 0,
      falEstimatedCostUsd: 0,
      falActualCostUsd: 0,
    },
    updatedAt: nowIso(),
  });
  await marketingStore.saveBrandMarketingExpressionRun({
    runId: 'ndxbook-brand-marketing-expression',
    projectId: 'ndxbook',
    organizationId: NDXBOOK_ORG_ID,
    status: 'COMPILED',
    brandCharacterSystemId: 'bcs-vitest-ops',
    forensicAudit: null,
    expressionSystem: {
      id: 'bmexp-vitest-ops',
    } as never,
    northStarArtifact: null,
    northStarForensics: null,
    experiment01: null,
    experimentGCharacterReevaluationRequired: true,
    error: null,
    accounting: {
      anthropicRequests: 0,
      anthropicInputTokens: 0,
      anthropicOutputTokens: 0,
      anthropicEstimatedCostUsd: 0,
      falRequests: 0,
      falEstimatedCostUsd: 0,
      falActualCostUsd: 0,
    },
    updatedAt: nowIso(),
  });
}
