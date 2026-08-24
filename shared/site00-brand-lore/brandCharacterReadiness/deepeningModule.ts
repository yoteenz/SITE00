/**
 * Compile Brand Character Deepening module — dynamic, gap-targeted questions only.
 */

import { randomUUID } from 'node:crypto';
import type { CharacterEvidenceInventory } from './evidenceInventory.js';
import { findExistingEvidenceForCharacterQuestion } from './duplicatePrevention.js';
import { getQuestionsForDomain } from './questionLibrary.js';
import type {
  BrandCharacterDeepeningModule,
  BrandCharacterDeepeningQuestion,
  BrandCharacterReadinessEvaluation,
  BrandCharacterDeepeningAnswer,
} from './types.js';

export function compileBrandCharacterDeepeningModule(params: {
  evaluation: BrandCharacterReadinessEvaluation;
  inventory: CharacterEvidenceInventory;
  existingAnswers?: BrandCharacterDeepeningAnswer[];
}): BrandCharacterDeepeningModule {
  if (params.evaluation.overallState === 'CHARACTER_READY') {
    return {
      moduleId: `bcdm-${params.evaluation.projectId}`,
      projectId: params.evaluation.projectId,
      readinessEvaluationId: params.evaluation.evaluationId,
      status: 'NOT_REQUIRED',
      questions: [],
      answers: params.existingAnswers ?? [],
      founderLanguageEvidence: [],
      compiledAt: new Date().toISOString(),
      completedAt: null,
    };
  }

  const gapDomains = params.evaluation.gaps.filter((g) => g.shouldAskFounder).map((g) => g.domain);
  const questions: BrandCharacterDeepeningQuestion[] = [];

  for (const domain of gapDomains) {
    const libraryQuestions = getQuestionsForDomain(domain);
    const gap = params.evaluation.gaps.find((g) => g.domain === domain);
    let added = 0;
    for (const entry of libraryQuestions) {
      if (added >= (gap?.recommendedQuestionCount ?? 1)) break;
      const search = findExistingEvidenceForCharacterQuestion({
        questionId: entry.questionId,
        inventory: params.inventory,
        deepeningAnswers: params.existingAnswers,
      });
      if (search.result === 'ANSWER_ALREADY_EXISTS') continue;
      questions.push({
        ...entry,
        evidenceGapId: gap?.gapId ?? `gap-${domain}`,
        whyAsked: gap?.whyItMatters ?? entry.purpose,
        customGenerated: false,
        questionType: search.result === 'PARTIAL_ANSWER_EXISTS' ? 'CLARIFICATION' : entry.questionType,
      });
      added++;
    }
  }

  return {
    moduleId: `bcdm-${params.evaluation.projectId}-${randomUUID().slice(0, 8)}`,
    projectId: params.evaluation.projectId,
    readinessEvaluationId: params.evaluation.evaluationId,
    status: questions.length === 0 ? 'NOT_REQUIRED' : 'COMPILED',
    questions,
    answers: params.existingAnswers ?? [],
    founderLanguageEvidence: [],
    compiledAt: new Date().toISOString(),
    completedAt: null,
  };
}

export function deepeningModulePostPurchaseOnly(): true {
  return true;
}

export function discoveryCarryForwardNotCharacterCanon(): true {
  return true;
}
