/**
 * Brand Character Readiness + Deepening service.
 */

import { randomUUID } from 'node:crypto';
import type { BrandLoreProfile } from '../../../../../shared/site00-brand-lore/types.js';
import {
  evaluateBrandCharacterReadiness,
  classifyRetrospectiveFormationInputReadiness,
  inventoryCharacterEvidence,
  compileBrandCharacterDeepeningModule,
  captureFounderLanguageEvidence,
  readinessFingerprintChanged,
} from '../../../../../shared/site00-brand-lore/brandCharacterReadiness/index.js';
import type {
  BrandCharacterReadinessRecord,
  BrandCharacterReadinessOverride,
  BrandCharacterDeepeningAnswer,
  BrandCharacterReadinessEvaluation,
} from '../../../../../shared/site00-brand-lore/brandCharacterReadiness/types.js';
import { BRAND_CHARACTER_READINESS_METHODOLOGY_V1 } from '../../../../../shared/site00-brand-lore/brandCharacterReadiness/constants.js';
import { compileReadinessFingerprint } from '../../../../../shared/site00-brand-lore/brandCharacterReadiness/fingerprint.js';
import { getQuestionById } from '../../../../../shared/site00-brand-lore/brandCharacterReadiness/questionLibrary.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import { getBrandLoreProfileForOrg } from '../../../site00BrandLore/loreService.js';
import * as readinessStore from './brandCharacterReadinessStoreAdapter.js';
import * as formationStore from './storeAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

async function loadProfile(): Promise<BrandLoreProfile | null> {
  return getBrandLoreProfileForOrg(NDXBOOK_ORG_ID);
}

function initRecord(projectId: string): BrandCharacterReadinessRecord {
  return {
    recordId: randomUUID(),
    projectId,
    organizationId: NDXBOOK_ORG_ID,
    latestEvaluation: null,
    deepeningModule: null,
    override: null,
    firstFormationInputReadiness: null,
    inputEvidenceLimited: false,
    updatedAt: nowIso(),
  };
}

export async function evaluateAndPersistBrandCharacterReadiness(params: {
  projectId: string;
  attachFirstFormationEvidence?: boolean;
}): Promise<BrandCharacterReadinessRecord> {
  const profile = await loadProfile();
  let record = (await readinessStore.getBrandCharacterReadinessRecord(params.projectId)) ?? initRecord(params.projectId);

  const deepeningAnswers = record.deepeningModule?.answers ?? [];
  const evaluation = evaluateBrandCharacterReadiness({
    profile,
    projectId: params.projectId,
    organizationId: NDXBOOK_ORG_ID,
    deepeningAnswerCount: deepeningAnswers.length,
  });

  const inventory = inventoryCharacterEvidence(profile);
  const deepeningModule = compileBrandCharacterDeepeningModule({
    evaluation,
    inventory,
    existingAnswers: deepeningAnswers,
  });

  if (params.attachFirstFormationEvidence && !record.firstFormationInputReadiness) {
    const retro = classifyRetrospectiveFormationInputReadiness({
      profile,
      formationOccurredWithoutReadinessGate: true,
    });
    record = {
      ...record,
      firstFormationInputReadiness: retro.formationInputReadiness,
      inputEvidenceLimited: retro.inputEvidenceLimited,
    };
  }

  const previousFingerprint = record.latestEvaluation?.fingerprint ?? null;
  if (readinessFingerprintChanged(previousFingerprint, evaluation.fingerprint) && record.override) {
    record = { ...record, override: null };
  }

  record = {
    ...record,
    latestEvaluation: evaluation,
    deepeningModule,
    updatedAt: nowIso(),
  };

  return readinessStore.saveBrandCharacterReadinessRecord(record);
}

export async function getBrandCharacterReadinessState(
  projectId: string,
): Promise<BrandCharacterReadinessRecord | null> {
  let record = await readinessStore.getBrandCharacterReadinessRecord(projectId);
  if (!record?.latestEvaluation) {
    record = await evaluateAndPersistBrandCharacterReadiness({
      projectId,
      attachFirstFormationEvidence: true,
    });
  }
  return record;
}

export async function submitBrandCharacterDeepeningAnswer(params: {
  projectId: string;
  questionId: string;
  rawAnswer: string;
}): Promise<BrandCharacterReadinessRecord> {
  const record = (await getBrandCharacterReadinessState(params.projectId))!;
  const question = getQuestionById(params.questionId);
  if (!question) throw new Error('Question not found');

  const founderEvidence = captureFounderLanguageEvidence({
    rawAnswer: params.rawAnswer,
    domain: question.domain,
    sourceQuestionId: params.questionId,
  });

  const answer: BrandCharacterDeepeningAnswer = {
    questionId: params.questionId,
    rawAnswer: params.rawAnswer.trim(),
    normalizedMeaning: founderEvidence.normalizedMeaning,
    domain: question.domain,
    answeredAt: nowIso(),
    founderLanguageEvidenceId: founderEvidence.id,
  };

  const module = record.deepeningModule ?? {
    moduleId: `bcdm-${params.projectId}`,
    projectId: params.projectId,
    readinessEvaluationId: record.latestEvaluation!.evaluationId,
    status: 'IN_PROGRESS' as const,
    questions: [],
    answers: [],
    founderLanguageEvidence: [],
    compiledAt: nowIso(),
    completedAt: null,
  };

  const answers = [...module.answers.filter((a) => a.questionId !== params.questionId), answer];
  const updatedModule = {
    ...module,
    status: 'IN_PROGRESS' as const,
    answers,
    founderLanguageEvidence: [...module.founderLanguageEvidence, founderEvidence],
  };

  await readinessStore.saveBrandCharacterReadinessRecord({
    ...record,
    deepeningModule: updatedModule,
    updatedAt: nowIso(),
  });

  return evaluateAndPersistBrandCharacterReadiness({ projectId: params.projectId });
}

export async function setBrandCharacterReadinessOverride(params: {
  projectId: string;
  overrideReason: string;
  missingDomains: BrandCharacterReadinessOverride['missingDomains'];
  founderId?: string | null;
}): Promise<BrandCharacterReadinessRecord> {
  const record = (await getBrandCharacterReadinessState(params.projectId))!;
  if (!record.latestEvaluation) throw new Error('Readiness not evaluated');

  const override: BrandCharacterReadinessOverride = {
    overrideType: 'FOUNDER_PROCEED_WITH_PARTIAL_CHARACTER_EVIDENCE',
    overrideReason: params.overrideReason,
    missingDomains: params.missingDomains,
    founderId: params.founderId ?? null,
    timestamp: nowIso(),
    readinessFingerprint: record.latestEvaluation.fingerprint.fingerprint,
  };

  return readinessStore.saveBrandCharacterReadinessRecord({
    ...record,
    override,
    updatedAt: nowIso(),
  });
}

export async function assertBrandCharacterFormationReadiness(params: {
  projectId: string;
}): Promise<{ allowed: boolean; reason: string | null; state: string }> {
  const record = await getBrandCharacterReadinessState(params.projectId);
  const evaluation = record?.latestEvaluation;
  if (!evaluation) {
    return { allowed: false, reason: 'Character readiness not evaluated', state: 'CHARACTER_NOT_EVALUATED' };
  }
  if (record?.override?.overrideType === 'FOUNDER_PROCEED_WITH_PARTIAL_CHARACTER_EVIDENCE') {
    return { allowed: true, reason: 'Founder override — partial evidence acknowledged', state: evaluation.overallState };
  }
  return {
    allowed: evaluation.formationGateAllowed,
    reason: evaluation.formationGateReason,
    state: evaluation.overallState,
  };
}

export async function attachFormationInputEvidenceToRun(params: {
  projectId: string;
}): Promise<void> {
  const formationRun = await formationStore.getBrandCharacterFormationRun();
  if (!formationRun || formationRun.projectId !== params.projectId) return;
  if (formationRun.characters.length === 0) return;

  const readiness = await getBrandCharacterReadinessState(params.projectId);
  if (!readiness) return;

  if (formationRun.formationInputReadiness) return;

  let formationInputReadiness = readiness.firstFormationInputReadiness;
  if (!formationInputReadiness) {
    const state = readiness.latestEvaluation?.overallState;
    formationInputReadiness =
      state === 'CHARACTER_READY'
        ? 'READY'
        : state === 'CHARACTER_PARTIAL'
          ? 'PARTIAL'
          : state === 'CHARACTER_INSUFFICIENT' || state === 'CHARACTER_BLOCKED'
            ? 'INSUFFICIENT'
            : 'NOT_EVALUATED';
  }

  await formationStore.saveBrandCharacterFormationRun({
    ...formationRun,
    formationInputReadiness,
    inputEvidenceLimited: readiness.inputEvidenceLimited,
    inputEvidencePartial: Boolean(readiness.override),
  });
}

/** Vitest-only — seed CHARACTER_READY gate when no evaluation exists yet. */
export async function seedVitestCharacterFormationReadiness(projectId = 'ndxbook'): Promise<void> {
  if (process.env.VITEST !== 'true') return;
  const existing = await readinessStore.getBrandCharacterReadinessRecord(projectId);
  if (existing?.latestEvaluation) return;
  const fingerprint = compileReadinessFingerprint({ profile: null, deepeningAnswerCount: 0 });
  const evaluation: BrandCharacterReadinessEvaluation = {
    evaluationId: 'vitest-character-ready',
    projectId,
    organizationId: NDXBOOK_ORG_ID,
    methodologyVersion: BRAND_CHARACTER_READINESS_METHODOLOGY_V1,
    overallState: 'CHARACTER_READY',
    domains: [],
    gaps: [],
    blockingGapCount: 0,
    recommendedQuestionCount: 0,
    fingerprint,
    forensicInventorySummary: { vitest: 'seeded' },
    evaluatedAt: nowIso(),
    formationGateAllowed: true,
    formationGateReason: null,
  };
  await readinessStore.saveBrandCharacterReadinessRecord({
    recordId: randomUUID(),
    projectId,
    organizationId: NDXBOOK_ORG_ID,
    latestEvaluation: evaluation,
    deepeningModule: null,
    override: null,
    firstFormationInputReadiness: null,
    inputEvidenceLimited: false,
    updatedAt: nowIso(),
  });
}

export async function evaluateNdxbookCharacterReadinessReport(): Promise<{
  record: BrandCharacterReadinessRecord;
  retrospective: ReturnType<typeof classifyRetrospectiveFormationInputReadiness>;
}> {
  const record = await evaluateAndPersistBrandCharacterReadiness({
    projectId: 'ndxbook',
    attachFirstFormationEvidence: true,
  });
  await attachFormationInputEvidenceToRun({ projectId: 'ndxbook' });
  const profile = await loadProfile();
  const retrospective = classifyRetrospectiveFormationInputReadiness({
    profile,
    formationOccurredWithoutReadinessGate: true,
  });
  return { record, retrospective };
}

export function characterInsufficientBlocksFormation(state: string): boolean {
  return state === 'CHARACTER_INSUFFICIENT' || state === 'CHARACTER_NOT_EVALUATED' || state === 'CHARACTER_BLOCKED';
}
