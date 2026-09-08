/**
 * C1.2 — Entry 003 in-memory store.
 */

import type { Entry003AutonomousPackage } from '../../../../shared/site00-expression-engine/entry-003/types.js';
import type {
  CreativeDirectorFounderJudgment,
  FounderFeedbackType,
} from '../../../../shared/site00-expression-engine/creative-director/types.js';
import { recordNarrativeCreativeCorrection } from '../narrativeSynthesis/narrativeCreativeCorrectionStore.js';

let currentPackage: Entry003AutonomousPackage | null = null;

export function resetEntry003Store(): void {
  currentPackage = null;
}

export function saveEntry003Package(pkg: Entry003AutonomousPackage): void {
  currentPackage = pkg;
}

export function getEntry003Package(): Entry003AutonomousPackage | null {
  return currentPackage;
}

export function applyEntry003FounderJudgment(args: {
  founderJudgment: CreativeDirectorFounderJudgment;
  feedbackType?: FounderFeedbackType;
  learningNote?: string;
}): Entry003AutonomousPackage | null {
  if (!currentPackage) return null;
  currentPackage = {
    ...currentPackage,
    founderJudgment: args.founderJudgment,
    founderFeedbackType: args.feedbackType ?? null,
    status:
      args.founderJudgment === 'LOVE_IT'
        ? 'APPROVED'
        : args.founderJudgment === 'NOT_FOR_ME'
          ? 'ARCHIVED'
          : 'CREATIVE_DIRECTION_AWAITING_FOUNDER_REVIEW',
    updatedAt: new Date().toISOString(),
    creativeDirectorRun: {
      ...currentPackage.creativeDirectorRun,
      founderJudgment: args.founderJudgment,
      founderFeedbackType: args.feedbackType ?? null,
      narrativeAuthority: args.founderJudgment === 'LOVE_IT',
      status: args.founderJudgment === 'LOVE_IT' ? 'APPROVED' : 'AWAITING_FOUNDER_REVIEW',
    },
  };
  if (args.feedbackType === 'STRUCTURAL_REPAIR' && args.learningNote) {
    recordNarrativeCreativeCorrection({
      entryId: 'entry-003',
      synthesisVersion: '001',
      originalDecision: currentPackage.subjectSelection.workingTitle,
      founderCorrection: args.learningNote,
      failureClass: 'STRUCTURAL_REPAIR',
      whyCorrectionImprovedStory: 'Entry 003 founder structural repair — generalizable for future discovery.',
      generalizableRule: args.learningNote,
      scope: 'NDXBOOK',
    });
  }
  return currentPackage;
}
