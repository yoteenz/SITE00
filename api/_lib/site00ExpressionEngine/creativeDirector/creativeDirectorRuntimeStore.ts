/**
 * C1.1 — In-memory creative director run persistence.
 */

import type {
  CreativeDirectorFounderJudgment,
  CreativeDirectorRun,
  FounderFeedbackType,
} from '../../../../shared/site00-expression-engine/creative-director/types.js';
import { recordNarrativeCreativeCorrection } from '../narrativeSynthesis/narrativeCreativeCorrectionStore.js';

const runs = new Map<string, CreativeDirectorRun>();
const history = new Map<string, CreativeDirectorRun[]>();

export function resetCreativeDirectorRuntimeStore(): void {
  runs.clear();
  history.clear();
}

export function saveCreativeDirectorRun(run: CreativeDirectorRun): void {
  runs.set(run.entryId, run);
  const list = history.get(run.entryId) ?? [];
  list.push({ ...run });
  history.set(run.entryId, list);
}

export function getCreativeDirectorRun(entryId: string): CreativeDirectorRun | null {
  return runs.get(entryId) ?? null;
}

export function listCreativeDirectorHistory(entryId: string): CreativeDirectorRun[] {
  return history.get(entryId) ?? [];
}

export function applyCreativeDirectorFounderJudgment(args: {
  entryId: string;
  founderJudgment: CreativeDirectorFounderJudgment;
  feedbackType?: FounderFeedbackType;
  learningNote?: string;
}): CreativeDirectorRun | null {
  const run = runs.get(args.entryId);
  if (!run) return null;
  const updated: CreativeDirectorRun = {
    ...run,
    founderJudgment: args.founderJudgment,
    founderFeedbackType: args.feedbackType ?? null,
    narrativeAuthority: args.founderJudgment === 'LOVE_IT',
    status: args.founderJudgment === 'LOVE_IT' ? 'APPROVED' : 'AWAITING_FOUNDER_REVIEW',
    updatedAt: new Date().toISOString(),
  };
  if (updated.narrativeSynthesis && args.founderJudgment === 'LOVE_IT') {
    updated.narrativeSynthesis = {
      ...updated.narrativeSynthesis,
      founderJudgment: 'LOVE_IT',
      narrativeAuthority: true,
      status: 'APPROVED',
    };
  }
  if (args.feedbackType === 'STRUCTURAL_REPAIR' && args.learningNote) {
    recordNarrativeCreativeCorrection({
      entryId: args.entryId,
      synthesisVersion: run.version,
      originalDecision: run.winningDirection.territoryName,
      founderCorrection: args.learningNote,
      failureClass: 'STRUCTURAL_REPAIR',
      whyCorrectionImprovedStory: 'Founder identified missing connective tissue — generalizable for future runs.',
      generalizableRule: args.learningNote,
      scope: 'NDXBOOK',
    });
  }
  runs.set(args.entryId, updated);
  return updated;
}
