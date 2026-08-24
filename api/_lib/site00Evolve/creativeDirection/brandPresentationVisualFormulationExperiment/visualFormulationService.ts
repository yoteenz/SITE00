/**
 * Brand Presentation Visual Formulation service — 2 finalists × 3 expressions × 6 visuals.
 */

import { createHash, randomUUID } from 'node:crypto';
import {
  BRAND_PRESENTATION_VISUAL_FORMULATION_CLASSIFICATION,
  BRAND_PRESENTATION_VISUAL_FORMULATION_RUN_ID,
  BRAND_PRESENTATION_VISUAL_FORMULATION_V1,
  FAL_COST_ESTIMATE_USD,
  NDXBOOK_VISUAL_EXPLORATION_POLICY,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/constants.js';
import type {
  BrandPresentationVisualExpressionCandidate,
  BrandPresentationVisualFinalistSelection,
  BrandPresentationVisualFormulationRun,
  BrandPresentationVisualReferencePackage,
  BrandPresentationWinnerSelection,
  VisualExpressionRevisionDelta,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/types.js';
import {
  evaluateCrossFinalistCollapse,
  evaluateExpressionDirectionDrift,
  evaluateReferenceExclusions,
  evaluateWithinFinalistDistinctiveness,
  visionQaUnavailable,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/evaluators.js';
import {
  canBeginVisualGeneration,
  evaluateFinalistGate,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/finalistGate.js';
import {
  compileBrandPresentationVisualPrompt,
  compileRevisionPrompt,
  VISUAL_FORMULATION_PROMPT_VERSION,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/promptCompiler.js';
import {
  buildExpressionFormationPayload,
  EXPRESSION_FORMATION_SYSTEM_PROMPT,
  type RawExpressionPayload,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/formationPrompt.js';
import type { BrandPresentationDirectionCandidate } from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/types.js';
import { BRAND_PRESENTATION_DIRECTION_RUN_ID } from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/constants.js';
import { getBrandPresentationDirectionFormationRun } from '../brandPresentationDirectionExperiment/directionService.js';
import { parseStructuredJson } from '../creativeIntelligence/structuredJson.js';
import { callAnthropicForCompletion } from '../creativeIntelligence/anthropicCompletion.js';
import { ANTHROPIC_CREATIVE_MODEL } from '../creativeIntelligence/config.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import {
  EXPERIENCE_FAL_MODEL,
  EXPERIENCE_FAL_PROVIDER,
} from '../../../../../shared/site00-brand-lore/experienceExpression/experienceAssetFalProvider.js';
import {
  buildFalImageInput,
} from '../../../../../shared/site00-visual-generation/falImageModels.js';
import {
  assertReferenceConditioningSupported,
  getCurrentExperienceProviderCapability,
} from '../../../../../shared/site00-visual-reference/providerCapabilityRegistry.js';
import {
  downloadUrlToBuffer,
  getSite00AssetPublicUrl,
  site00StorageObjectExists,
  uploadSite00AssetBuffer,
} from '../../../site00Assts/storage.js';
import * as store from './storeAdapter.js';

const EXPRESSION_LABELS: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];

function nowIso(): string {
  return new Date().toISOString();
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function shouldRunSynchronously(): boolean {
  return process.env.VITEST === 'true';
}

function emptyAccounting(): BrandPresentationVisualFormulationRun['accounting'] {
  return {
    anthropicRequests: 0,
    anthropicInputTokens: 0,
    anthropicOutputTokens: 0,
    anthropicEstimatedCostUsd: 0,
    falRequests: 0,
    falRequestsExpected: NDXBOOK_VISUAL_EXPLORATION_POLICY.totalInitialVisuals,
    visualGenerationCostUsd: 0,
    hiddenVariantRequests: 0,
  };
}

function initRun(existing?: BrandPresentationVisualFormulationRun | null): BrandPresentationVisualFormulationRun {
  if (existing) return existing;
  return {
    experimentClassification: BRAND_PRESENTATION_VISUAL_FORMULATION_CLASSIFICATION,
    runId: BRAND_PRESENTATION_VISUAL_FORMULATION_RUN_ID,
    organizationId: NDXBOOK_ORG_ID,
    projectId: 'ndxbook',
    projectSlug: 'ndxbook',
    methodologyVersion: BRAND_PRESENTATION_VISUAL_FORMULATION_V1,
    parentExperiment: 'EXPERIMENT_G',
    parentDirectionRunId: BRAND_PRESENTATION_DIRECTION_RUN_ID,
    explorationPolicy: { ...NDXBOOK_VISUAL_EXPLORATION_POLICY },
    finalists: [],
    expressions: [],
    referencePackages: [],
    revisions: [],
    winner: null,
    crossFinalistCollapseEval: null,
    status: 'NOT_STARTED',
    formationVersion: 1,
    formationPromptVersion: VISUAL_FORMULATION_PROMPT_VERSION,
    visualFormulationAllowed: true,
    visualGenerationAllowed: false,
    falGenerationAllowed: false,
    brandCanonMutationAllowed: false,
    expressionSystemDevelopmentAllowed: false,
    accounting: emptyAccounting(),
    error: null,
    formationStartedAt: null,
    generationStartedAt: null,
    startedAt: nowIso(),
    completedAt: null,
  };
}

export function resetBrandPresentationVisualFormulationMemory(): void {
  store.resetBrandPresentationVisualFormulationMemory();
}

export function resetBrandPresentationVisualFormulationStoreModeCache(): void {
  store.resetBrandPresentationVisualFormulationStoreModeCache();
}

export async function getBrandPresentationVisualFormulationRun(): Promise<BrandPresentationVisualFormulationRun | null> {
  return store.getBrandPresentationVisualFormulationRun();
}

async function ensureRun(): Promise<BrandPresentationVisualFormulationRun> {
  const existing = await store.getBrandPresentationVisualFormulationRun();
  const run = initRun(existing);
  if (!existing) {
    return store.saveBrandPresentationVisualFormulationRun(run);
  }
  return run;
}

function getDirectionRunOrThrow(
  directionRun: Awaited<ReturnType<typeof getBrandPresentationDirectionFormationRun>>,
) {
  if (!directionRun || directionRun.directions.length === 0) {
    throw new Error('Direction formation required before visual finalist selection');
  }
  return directionRun;
}

function findDirection(
  directionRun: NonNullable<Awaited<ReturnType<typeof getBrandPresentationDirectionFormationRun>>>,
  directionId: string,
): BrandPresentationDirectionCandidate {
  const d = directionRun.directions.find((x) => x.directionId === directionId);
  if (!d) throw new Error('Direction not found');
  return d;
}

function findParentSnapshot(
  directionRun: NonNullable<Awaited<ReturnType<typeof getBrandPresentationDirectionFormationRun>>>,
  parentConceptId: string,
) {
  const p = directionRun.parentConceptSnapshots.find((x) => x.id === parentConceptId);
  if (!p) throw new Error('Parent concept snapshot missing');
  return p;
}

export async function setVisualFinalistSelection(params: {
  directionId: string;
  selected: boolean;
  selectedBy: string;
}): Promise<BrandPresentationVisualFormulationRun> {
  const directionRun = getDirectionRunOrThrow(await getBrandPresentationDirectionFormationRun());
  const direction = findDirection(directionRun, params.directionId);
  let run = await ensureRun();

  let finalists = [...run.finalists];

  if (!params.selected) {
    finalists = finalists.map((f) =>
      f.directionId === params.directionId && f.status === 'SELECTED'
        ? { ...f, status: 'WITHDRAWN' as const, version: f.version + 1 }
        : f,
    );
  } else {
    const active = finalists.filter((f) => f.status === 'SELECTED');
    const already = active.find((f) => f.directionId === params.directionId);
    if (!already && active.length >= run.explorationPolicy.finalistCount) {
      throw new Error(
        `FINALIST_GATE_BLOCKED — ${active.length} active finalists. Withdraw one before selecting another.`,
      );
    }

    if (!already) {
      const order = (active.length + 1) as 1 | 2;
      finalists.push({
        selectionId: randomUUID(),
        projectId: run.projectId,
        projectSlug: run.projectSlug,
        experimentId: run.runId,
        directionId: direction.directionId,
        parentConceptId: direction.parentConceptId,
        parentConceptName: direction.parentConceptName,
        directionName: direction.directionName,
        directionFormationFingerprint: direction.formationFingerprint,
        founderJudgmentId: direction.founderJudgment,
        selectedBy: params.selectedBy,
        selectedAt: nowIso(),
        selectionOrder: order,
        status: 'SELECTED',
        version: 1,
      });
    }
  }

  const gate = evaluateFinalistGate({ finalists, policy: run.explorationPolicy });
  const status = gate.ok ? 'FINALISTS_READY' : activeFinalistCount(finalists) > 0 ? 'FINALISTS_INCOMPLETE' : 'NOT_STARTED';

  run = {
    ...run,
    finalists,
    status,
    visualGenerationAllowed: false,
    falGenerationAllowed: false,
    error: gate.ok ? null : run.error,
  };
  return store.saveBrandPresentationVisualFormulationRun(run);
}

function activeFinalistCount(finalists: BrandPresentationVisualFinalistSelection[]): number {
  return finalists.filter((f) => f.status === 'SELECTED').length;
}

export function buildVitestExpressionPayload(
  direction: BrandPresentationDirectionCandidate,
  label: 'A' | 'B' | 'C',
): RawExpressionPayload {
  const idx = label === 'A' ? 1 : label === 'B' ? 2 : 3;
  return {
    expressionLabel: label,
    expressionName: `${direction.directionName} Expression ${label}`,
    expressionThesis: `Visual system ${label} for ${direction.directionName} — ${idx === 1 ? 'layered editorial rhythm' : idx === 2 ? 'dense information choreography' : 'sparse recurrence-forward surface'}`,
    directionInterpretation: direction.directionInterpretation,
    visualBehavior: direction.brandBehavior,
    compositionBehavior:
      idx === 1
        ? 'Asymmetric focal column with staggered evidence bands'
        : idx === 2
          ? 'Grid-adjacent modules with interrupting judgment inserts'
          : 'Single dominant artifact with peripheral recurrence markers',
    typographyBehavior:
      idx === 1
        ? 'Display headline anchors with supporting micro-label system'
        : idx === 2
          ? 'Typographic density as primary hierarchy engine'
          : 'Minimal type participation — image-led recognition',
    imageryBehavior:
      idx === 1
        ? 'Documentary fragments integrated into editorial flow'
        : idx === 2
          ? 'Composite evidence collage with consistent crop grammar'
          : 'Isolated hero material with recurring motif echo',
    graphicLanguage:
      idx === 1 ? 'Rule-based dividers and index marks' : idx === 2 ? 'Systematic annotation layer' : 'Single signature mark repeated',
    artifactLanguage:
      idx === 1 ? 'Behavioral artifacts emerge from layout rules' : idx === 2 ? 'Stacked proof objects' : 'One persistent artifact shape',
    informationBehavior:
      idx === 1 ? 'Progressive disclosure down-scroll' : idx === 2 ? 'Parallel scan lanes' : 'Single focal revelation',
    densityBehavior: idx === 1 ? 'Medium density' : idx === 2 ? 'High density' : 'Low density',
    rhythmBehavior: idx === 1 ? 'Alternating tension/release' : idx === 2 ? 'Staccato punctuated beats' : 'Slow sustained pulse',
    recurrenceBehavior: direction.recurrenceBehavior,
    socialSurfaceBehavior: 'Recognizable without platform chrome — feed-native composition logic',
    motionPotential: 'Subtle layer transitions implied in static frame',
    materialPotential: 'Paper-like depth without literal notebook',
    recognitionMechanism: direction.recognitionMechanism,
    variationLogic: 'Same behavioral rules, different visual density postures',
    brandFidelity: 'NDXBOOK peer intimacy with institutional clarity',
    directionFidelity: 'Locked to parent direction behavior',
    visualDistinctiveness: `Expression ${label} explores distinct composition/typography axis`,
    antiCollapseRules: direction.antiCollapseRules,
    notThis: [...direction.notThis, 'generic moodboard', 'SITE 00 Projects UX'],
  };
}

function normalizeExpression(
  raw: RawExpressionPayload,
  params: {
    run: BrandPresentationVisualFormulationRun;
    direction: BrandPresentationDirectionCandidate;
    expressionIndex: 1 | 2 | 3;
    parentExpressionId?: string | null;
    revisionNumber?: number;
  },
): BrandPresentationVisualExpressionCandidate {
  const expr: BrandPresentationVisualExpressionCandidate = {
    expressionId: randomUUID(),
    projectId: params.run.projectId,
    projectSlug: params.run.projectSlug,
    parentConceptId: params.direction.parentConceptId,
    parentConceptName: params.direction.parentConceptName,
    parentDirectionId: params.direction.directionId,
    parentDirectionName: params.direction.directionName,
    expressionIndex: params.expressionIndex,
    expressionLabel: raw.expressionLabel,
    expressionName: raw.expressionName,
    expressionThesis: raw.expressionThesis,
    directionInterpretation: raw.directionInterpretation,
    visualBehavior: raw.visualBehavior,
    compositionBehavior: raw.compositionBehavior,
    typographyBehavior: raw.typographyBehavior,
    imageryBehavior: raw.imageryBehavior,
    graphicLanguage: raw.graphicLanguage,
    artifactLanguage: raw.artifactLanguage,
    informationBehavior: raw.informationBehavior,
    densityBehavior: raw.densityBehavior,
    rhythmBehavior: raw.rhythmBehavior,
    recurrenceBehavior: raw.recurrenceBehavior,
    socialSurfaceBehavior: raw.socialSurfaceBehavior,
    motionPotential: raw.motionPotential,
    materialPotential: raw.materialPotential,
    recognitionMechanism: raw.recognitionMechanism,
    variationLogic: raw.variationLogic,
    brandFidelity: raw.brandFidelity,
    directionFidelity: raw.directionFidelity,
    visualDistinctiveness: raw.visualDistinctiveness,
    antiCollapseRules: raw.antiCollapseRules,
    notThis: raw.notThis,
    referencePackageId: null,
    promptFingerprint: null,
    generationReceipt: null,
    assetId: null,
    assetStoragePath: null,
    assetPublicUrl: null,
    assetFingerprint: null,
    founderJudgment: null,
    judgmentNote: null,
    directionDriftEval: null,
    siblingDistinctivenessEval: null,
    visionEval: visionQaUnavailable(),
    parentExpressionId: params.parentExpressionId ?? null,
    revisionNumber: params.revisionNumber ?? 0,
    status: 'FORMULATED',
    formationVersion: params.run.formationVersion,
    createdAt: nowIso(),
  };
  const driftEval = evaluateExpressionDirectionDrift({ direction: params.direction, expression: expr });
  expr.directionDriftEval = driftEval;
  if (driftEval.result === 'DIRECTION_DRIFT') {
    expr.status = 'REVISION_REQUIRED';
  }
  return expr;
}

function compileReferencePackage(params: {
  directionId: string;
  expressionId: string;
}): BrandPresentationVisualReferencePackage {
  const excluded = [
    'SITE00_HOST_VISUAL_MEMORY',
    'PROJECTS_UX',
    'EXPERIMENT_F_VISUAL',
    'BURN_BOOK_LITERAL',
  ];
  return {
    packageId: randomUUID(),
    directionId: params.directionId,
    expressionId: params.expressionId,
    references: [],
    excludedSources: excluded,
    referenceConditioned: false,
    strictConditioningRequired: false,
    compiledAt: nowIso(),
    fingerprint: hash(`${params.directionId}:${params.expressionId}:empty`),
  };
}

async function formulateExpressionsForFinalist(params: {
  run: BrandPresentationVisualFormulationRun;
  directionRun: NonNullable<Awaited<ReturnType<typeof getBrandPresentationDirectionFormationRun>>>;
  finalist: BrandPresentationVisualFinalistSelection;
}): Promise<{
  expressions: BrandPresentationVisualExpressionCandidate[];
  referencePackages: BrandPresentationVisualReferencePackage[];
  accountingDelta: Partial<BrandPresentationVisualFormulationRun['accounting']>;
}> {
  const direction = findDirection(params.directionRun, params.finalist.directionId);
  const parent = findParentSnapshot(params.directionRun, direction.parentConceptId);
  const expressions: BrandPresentationVisualExpressionCandidate[] = [];
  const referencePackages: BrandPresentationVisualReferencePackage[] = [];
  let accountingDelta: Partial<BrandPresentationVisualFormulationRun['accounting']> = {};

  if (process.env.VITEST === 'true') {
    for (let i = 0; i < 3; i++) {
      const label = EXPRESSION_LABELS[i]!;
      const raw = buildVitestExpressionPayload(direction, label);
      const expr = normalizeExpression(raw, {
        run: params.run,
        direction,
        expressionIndex: (i + 1) as 1 | 2 | 3,
      });
      const refPkg = compileReferencePackage({ directionId: direction.directionId, expressionId: expr.expressionId });
      expr.referencePackageId = refPkg.packageId;
      referencePackages.push(refPkg);
      expressions.push(expr);
    }
  } else {
    const payload = buildExpressionFormationPayload({ parentConcept: parent, direction });
    const result = await callAnthropicForCompletion({
      system: EXPRESSION_FORMATION_SYSTEM_PROMPT,
      user: payload,
      model: ANTHROPIC_CREATIVE_MODEL,
      maxTokens: 8192,
    });
    accountingDelta = {
      anthropicRequests: 1,
      anthropicInputTokens: result.inputTokens ?? 0,
      anthropicOutputTokens: result.outputTokens ?? 0,
      anthropicEstimatedCostUsd: result.estimatedCostUsd ?? 0.05,
    };
    const parsed = parseStructuredJson<{ expressions: RawExpressionPayload[] }>(result.text);
    if (!parsed.expressions || parsed.expressions.length !== 3) {
      throw new Error('Expression formulation must return exactly 3 expressions');
    }
    for (let i = 0; i < 3; i++) {
      const raw = parsed.expressions[i]!;
      const expr = normalizeExpression(raw, {
        run: params.run,
        direction,
        expressionIndex: (i + 1) as 1 | 2 | 3,
      });
      const refPkg = compileReferencePackage({ directionId: direction.directionId, expressionId: expr.expressionId });
      expr.referencePackageId = refPkg.packageId;
      referencePackages.push(refPkg);
      expressions.push(expr);
    }
  }

  const distinctiveness = evaluateWithinFinalistDistinctiveness(expressions);
  for (const expr of expressions) {
    expr.siblingDistinctivenessEval = distinctiveness;
  }

  return { expressions, referencePackages, accountingDelta };
}

export async function formulateVisualExpressions(): Promise<BrandPresentationVisualFormulationRun> {
  let run = await ensureRun();
  const directionRun = getDirectionRunOrThrow(await getBrandPresentationDirectionFormationRun());
  const gate = evaluateFinalistGate({ finalists: run.finalists, policy: run.explorationPolicy });
  if (!gate.ok) {
    throw new Error(gate.reason);
  }

  run = {
    ...run,
    status: 'FORMULATING_EXPRESSIONS',
    formationStartedAt: nowIso(),
    expressions: run.expressions.filter(
      (e) => !gate.activeFinalists.some((f) => f.directionId === e.parentDirectionId),
    ),
    referencePackages: run.referencePackages.filter(
      (p) => !gate.activeFinalists.some((f) => f.directionId === p.directionId),
    ),
  };

  let allExpressions = [...run.expressions];
  let allRefPackages = [...run.referencePackages];
  let accounting = { ...run.accounting };

  for (const finalist of gate.activeFinalists) {
    const { expressions, referencePackages, accountingDelta } = await formulateExpressionsForFinalist({
      run,
      directionRun,
      finalist,
    });
    allExpressions = [...allExpressions, ...expressions];
    allRefPackages = [...allRefPackages, ...referencePackages];
    accounting = {
      ...accounting,
      anthropicRequests: accounting.anthropicRequests + (accountingDelta.anthropicRequests ?? 0),
      anthropicInputTokens: accounting.anthropicInputTokens + (accountingDelta.anthropicInputTokens ?? 0),
      anthropicOutputTokens: accounting.anthropicOutputTokens + (accountingDelta.anthropicOutputTokens ?? 0),
      anthropicEstimatedCostUsd:
        accounting.anthropicEstimatedCostUsd + (accountingDelta.anthropicEstimatedCostUsd ?? 0),
    };
  }

  const f1 = gate.activeFinalists[0]!;
  const f2 = gate.activeFinalists[1]!;
  const crossEval = evaluateCrossFinalistCollapse({
    finalist1Expressions: allExpressions.filter((e) => e.parentDirectionId === f1.directionId),
    finalist2Expressions: allExpressions.filter((e) => e.parentDirectionId === f2.directionId),
  });

  run = {
    ...run,
    expressions: allExpressions,
    referencePackages: allRefPackages,
    crossFinalistCollapseEval: crossEval,
    status: 'EXPRESSIONS_READY',
    visualGenerationAllowed: true,
    falGenerationAllowed: false,
    accounting,
    formationStartedAt: null,
    error: null,
  };
  return store.saveBrandPresentationVisualFormulationRun(run);
}

async function runFalForExpression(params: {
  prompt: string;
  negativePrompt: string;
  promptFingerprint: string;
  storagePath: string;
  expressionId: string;
  referenceConditioned: boolean;
  referenceUrls?: string[];
}): Promise<{
  ok: true;
  storagePath: string;
  publicUrl: string;
  requestId: string | null;
  costUsd: number;
  provider: string;
  model: string;
} | { ok: false; error: string }> {
  if (process.env.VITEST === 'true') {
    return {
      ok: true,
      storagePath: params.storagePath,
      publicUrl: `https://vitest.local/${params.storagePath}`,
      requestId: `vitest-${params.expressionId}`,
      costUsd: 0,
      provider: 'vitest-mock',
      model: 'vitest-mock',
    };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    return { ok: false, error: 'FAL_KEY not configured on server' };
  }

  if (params.referenceConditioned) {
    const profile = getCurrentExperienceProviderCapability();
    const support = assertReferenceConditioningSupported({
      providerId: profile.providerId,
      modelId: profile.modelId,
      referenceCount: params.referenceUrls?.length ?? 0,
      strictHostRequired: false,
    });
    if (!support.ok) {
      return { ok: false, error: support.error };
    }
    if ((params.referenceUrls?.length ?? 0) === 0) {
      return { ok: false, error: 'REFERENCE_CONDITIONED generation required but no references available — BLOCKED' };
    }
  }

  if (await site00StorageObjectExists(params.storagePath)) {
    return {
      ok: true,
      storagePath: params.storagePath,
      publicUrl: getSite00AssetPublicUrl(params.storagePath),
      requestId: null,
      costUsd: 0,
      provider: 'storage-reuse',
      model: 'existing-object',
    };
  }

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });
    const fullPrompt = `${params.prompt}\n\nAvoid: ${params.negativePrompt}`;
    const { model, input } = buildFalImageInput({
      prompt: fullPrompt,
      aspectRatio: '16:9',
      outputFormat: 'webp',
      referenceImageUrls: params.referenceUrls?.filter(Boolean),
    });
    const result = (await fal.subscribe(model, { input: input as never, logs: false })) as {
      request_id?: string;
      data?: { images?: Array<{ url?: string }> };
    };
    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) return { ok: false, error: 'FAL returned no image URL' };
    const buffer = await downloadUrlToBuffer(imageUrl);
    const upload = await uploadSite00AssetBuffer(params.storagePath, buffer, 'image/webp', { upsert: true });
    return {
      ok: true,
      storagePath: upload.storagePath,
      publicUrl: upload.publicUrl,
      requestId: result.request_id ?? null,
      costUsd: FAL_COST_ESTIMATE_USD,
      provider: EXPERIENCE_FAL_PROVIDER,
      model,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'FAL generation failed' };
  }
}

export function estimateVisualGenerationCost(run: BrandPresentationVisualFormulationRun): {
  finalists: number;
  expressionsPerFinalist: number;
  totalVisuals: number;
  falRequestsExpected: number;
  estimatedCostUsd: number;
  referenceConditionedPerExpression: boolean[];
} {
  const gate = evaluateFinalistGate({ finalists: run.finalists, policy: run.explorationPolicy });
  const totalVisuals = gate.ok
    ? gate.activeFinalists.length * run.explorationPolicy.expressionsPerFinalist
    : run.explorationPolicy.totalInitialVisuals;
  const expressions = run.expressions.filter((e) => e.status !== 'SUPERSEDED');
  const referenceConditionedPerExpression = expressions.map((e) => {
    const pkg = run.referencePackages.find((p) => p.packageId === e.referencePackageId);
    return Boolean(pkg?.referenceConditioned);
  });
  return {
    finalists: gate.ok ? gate.activeFinalists.length : run.explorationPolicy.finalistCount,
    expressionsPerFinalist: run.explorationPolicy.expressionsPerFinalist,
    totalVisuals,
    falRequestsExpected: totalVisuals,
    estimatedCostUsd: totalVisuals * FAL_COST_ESTIMATE_USD,
    referenceConditionedPerExpression,
  };
}

export async function generateFinalistVisuals(): Promise<BrandPresentationVisualFormulationRun> {
  let run = await ensureRun();
  const directionRun = getDirectionRunOrThrow(await getBrandPresentationDirectionFormationRun());
  const gate = evaluateFinalistGate({ finalists: run.finalists, policy: run.explorationPolicy });
  const genGate = canBeginVisualGeneration({ gate, expressions: run.expressions, policy: run.explorationPolicy });
  if (!genGate.ok) {
    throw new Error(genGate.reason);
  }

  run = {
    ...run,
    status: 'GENERATING_VISUALS',
    generationStartedAt: nowIso(),
    falGenerationAllowed: true,
  };
  await store.saveBrandPresentationVisualFormulationRun(run);

  const expressionsToGenerate = run.expressions.filter(
    (e) =>
      e.status === 'FORMULATED' &&
      gate.activeFinalists.some((f) => f.directionId === e.parentDirectionId) &&
      !e.assetStoragePath,
  );

  if (expressionsToGenerate.length !== run.explorationPolicy.totalInitialVisuals) {
    throw new Error(
      `Expected ${run.explorationPolicy.totalInitialVisuals} sibling expressions before generation, got ${expressionsToGenerate.length}`,
    );
  }

  let accounting = { ...run.accounting };
  const updatedExpressions = [...run.expressions];

  const generationTasks = expressionsToGenerate.map(async (expr) => {
    const direction = findDirection(directionRun, expr.parentDirectionId);
    const parent = findParentSnapshot(directionRun, direction.parentConceptId);
    const refPkg = run.referencePackages.find((p) => p.packageId === expr.referencePackageId) ?? null;

    for (const ref of refPkg?.references ?? []) {
      const exclusion = evaluateReferenceExclusions(ref.sourceLabel);
      if (!exclusion.allowed) {
        throw new Error(exclusion.reason ?? 'Reference excluded');
      }
    }

    const compiled = compileBrandPresentationVisualPrompt({
      parentConcept: parent,
      direction,
      expression: expr,
      referencePackage: refPkg,
      antiDirectionEvidence: direction.notThis,
      socialPresentationRequirements: [
        'Show recognizable NDXBOOK presentation behavior on a social-native surface',
        'Demonstrate hierarchy, recurrence, and information behavior in action',
      ],
    });

    const storagePath = `site00/brand-presentation-visual/${run.runId}/${expr.parentDirectionId}-expr-${expr.expressionLabel}.webp`;
    const falResult = await runFalForExpression({
      prompt: compiled.prompt,
      negativePrompt: compiled.negativePrompt,
      promptFingerprint: compiled.promptFingerprint,
      storagePath,
      expressionId: expr.expressionId,
      referenceConditioned: Boolean(refPkg?.referenceConditioned),
      referenceUrls: refPkg?.references.map((r) => r.publicUrl).filter((u): u is string => Boolean(u)),
    });

    if (!falResult.ok) {
      throw new Error(falResult.error);
    }

    return {
      expressionId: expr.expressionId,
      promptFingerprint: compiled.promptFingerprint,
      assetId: randomUUID(),
      assetStoragePath: falResult.storagePath,
      assetPublicUrl: falResult.publicUrl,
      assetFingerprint: hash(compiled.promptFingerprint + falResult.storagePath),
      generationReceipt: {
        provider: falResult.provider,
        model: falResult.model,
        requestId: falResult.requestId,
        costUsd: falResult.costUsd,
        promptFingerprint: compiled.promptFingerprint,
        createdAt: nowIso(),
      },
      costUsd: falResult.costUsd,
    };
  });

  const results = await Promise.all(generationTasks);

  for (const result of results) {
    const idx = updatedExpressions.findIndex((e) => e.expressionId === result.expressionId);
    if (idx >= 0) {
      updatedExpressions[idx] = {
        ...updatedExpressions[idx]!,
        promptFingerprint: result.promptFingerprint,
        assetId: result.assetId,
        assetStoragePath: result.assetStoragePath,
        assetPublicUrl: result.assetPublicUrl,
        assetFingerprint: result.assetFingerprint,
        generationReceipt: result.generationReceipt,
        status: 'GENERATED',
      };
      accounting = {
        ...accounting,
        falRequests: accounting.falRequests + 1,
        visualGenerationCostUsd: accounting.visualGenerationCostUsd + result.costUsd,
        hiddenVariantRequests: 0,
      };
    }
  }

  run = {
    ...run,
    expressions: updatedExpressions,
    status: 'VISUALS_READY',
    visualGenerationAllowed: true,
    falGenerationAllowed: true,
    accounting,
    generationStartedAt: null,
    completedAt: nowIso(),
    error: null,
  };
  return store.saveBrandPresentationVisualFormulationRun(run);
}

export async function setVisualExpressionJudgment(params: {
  expressionId: string;
  judgment: BrandPresentationVisualExpressionCandidate['founderJudgment'];
  note?: string | null;
}): Promise<BrandPresentationVisualFormulationRun> {
  const run = await ensureRun();
  const expressions = run.expressions.map((e) =>
    e.expressionId === params.expressionId
      ? { ...e, founderJudgment: params.judgment, judgmentNote: params.note ?? null }
      : e,
  );
  const updated: BrandPresentationVisualFormulationRun = {
    ...run,
    expressions,
    status: run.status === 'VISUALS_READY' || run.status === 'FOUNDER_REVIEW' ? 'FOUNDER_REVIEW' : run.status,
  };
  return store.saveBrandPresentationVisualFormulationRun(updated);
}

export async function reviseVisualExpression(params: {
  expressionId: string;
  preserve: string[];
  change: string[];
  doNotBecome: string[];
}): Promise<BrandPresentationVisualFormulationRun> {
  const run = await ensureRun();
  const directionRun = getDirectionRunOrThrow(await getBrandPresentationDirectionFormationRun());
  const parentExpr = run.expressions.find((e) => e.expressionId === params.expressionId);
  if (!parentExpr) throw new Error('Expression not found');
  if (parentExpr.founderJudgment !== 'PROMISING_REVISE') {
    throw new Error('Revision requires PROMISING — REVISE judgment');
  }

  const direction = findDirection(directionRun, parentExpr.parentDirectionId);
  const parentSnapshot = findParentSnapshot(directionRun, direction.parentConceptId);
  const refPkg = run.referencePackages.find((p) => p.packageId === parentExpr.referencePackageId) ?? null;

  const basePrompt = compileBrandPresentationVisualPrompt({
    parentConcept: parentSnapshot,
    direction,
    expression: parentExpr,
    referencePackage: refPkg,
    antiDirectionEvidence: direction.notThis,
    socialPresentationRequirements: ['Revision — surgical change only'],
  });

  const revisionPrompt = compileRevisionPrompt({
    base: basePrompt,
    delta: { preserve: params.preserve, change: params.change, doNotBecome: params.doNotBecome },
  });

  const raw = buildVitestExpressionPayload(direction, parentExpr.expressionLabel);
  raw.expressionThesis = `${raw.expressionThesis} (revision ${parentExpr.revisionNumber + 1})`;
  for (const c of params.change) {
    raw.compositionBehavior += ` — ${c}`;
  }

  const childExpr = normalizeExpression(raw, {
    run,
    direction,
    expressionIndex: parentExpr.expressionIndex,
    parentExpressionId: parentExpr.expressionId,
    revisionNumber: parentExpr.revisionNumber + 1,
  });
  childExpr.referencePackageId = parentExpr.referencePackageId;

  const storagePath = `site00/brand-presentation-visual/${run.runId}/${parentExpr.parentDirectionId}-expr-${parentExpr.expressionLabel}-rev-${childExpr.revisionNumber}.webp`;
  const falResult = await runFalForExpression({
    prompt: revisionPrompt.prompt,
    negativePrompt: revisionPrompt.negativePrompt,
    promptFingerprint: revisionPrompt.promptFingerprint,
    storagePath,
    expressionId: childExpr.expressionId,
    referenceConditioned: Boolean(refPkg?.referenceConditioned),
  });

  if (!falResult.ok) throw new Error(falResult.error);

  childExpr.promptFingerprint = revisionPrompt.promptFingerprint;
  childExpr.assetId = randomUUID();
  childExpr.assetStoragePath = falResult.storagePath;
  childExpr.assetPublicUrl = falResult.publicUrl;
  childExpr.assetFingerprint = hash(revisionPrompt.promptFingerprint);
  childExpr.generationReceipt = {
    provider: falResult.provider,
    model: falResult.model,
    requestId: falResult.requestId,
    costUsd: falResult.costUsd,
    revision: true,
    parentExpressionId: parentExpr.expressionId,
    parentAssetId: parentExpr.assetId,
  };
  childExpr.status = 'GENERATED';

  const revisionDelta: VisualExpressionRevisionDelta = {
    revisionId: randomUUID(),
    parentExpressionId: parentExpr.expressionId,
    parentAssetId: parentExpr.assetId,
    childExpressionId: childExpr.expressionId,
    revisionNumber: childExpr.revisionNumber,
    preserve: params.preserve,
    change: params.change,
    doNotBecome: params.doNotBecome,
    revisionPromptFingerprint: revisionPrompt.promptFingerprint,
    createdAt: nowIso(),
  };

  const updated: BrandPresentationVisualFormulationRun = {
    ...run,
    expressions: [...run.expressions, childExpr],
    revisions: [...run.revisions, revisionDelta],
    accounting: {
      ...run.accounting,
      falRequests: run.accounting.falRequests + 1,
      visualGenerationCostUsd: run.accounting.visualGenerationCostUsd + falResult.costUsd,
    },
  };
  return store.saveBrandPresentationVisualFormulationRun(updated);
}

export async function selectBrandPresentationWinner(params: {
  expressionId: string;
  selectedBy: string;
}): Promise<BrandPresentationVisualFormulationRun> {
  const run = await ensureRun();
  if (run.status !== 'VISUALS_READY' && run.status !== 'FOUNDER_REVIEW') {
    throw new Error('Winner selection requires completed visual review (6 assets generated)');
  }

  const expression = run.expressions.find((e) => e.expressionId === params.expressionId && e.status === 'GENERATED');
  if (!expression || !expression.assetStoragePath) {
    throw new Error('Winning expression must have a generated visual asset');
  }

  const winner: BrandPresentationWinnerSelection = {
    winnerId: randomUUID(),
    projectId: run.projectId,
    projectSlug: run.projectSlug,
    parentConceptId: expression.parentConceptId,
    parentConceptName: expression.parentConceptName,
    directionId: expression.parentDirectionId,
    directionName: expression.parentDirectionName,
    expressionId: expression.expressionId,
    expressionLabel: expression.expressionLabel,
    assetId: expression.assetId,
    assetStoragePath: expression.assetStoragePath,
    founderJudgment: 'FOUNDER_SELECTED_BRAND_PRESENTATION_DIRECTION',
    selectionTimestamp: nowIso(),
    methodologyVersion: run.methodologyVersion,
    directionFormationFingerprint: null,
    expressionFormationFingerprint: expression.promptFingerprint,
    referenceFingerprint: expression.referencePackageId,
    generationReceiptLineage: expression.generationReceipt,
    brandCanonMutated: false,
    implementationStarted: false,
    eligibleForExpressionSystemDevelopment: true,
  };

  const updated: BrandPresentationVisualFormulationRun = {
    ...run,
    winner,
    status: 'WINNER_SELECTED',
    expressionSystemDevelopmentAllowed: false,
    brandCanonMutationAllowed: false,
  };
  return store.saveBrandPresentationVisualFormulationRun(updated);
}

export async function prepareVisualFormulationRun(): Promise<BrandPresentationVisualFormulationRun> {
  return ensureRun();
}

export const BRAND_PRESENTATION_VISUAL_FAL_MODEL = EXPERIENCE_FAL_MODEL;
