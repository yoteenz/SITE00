import {
  DESIGN_PAGE_V3_SKELETON_AREAS,
  DESIGN_PAGE_V3_WORKFLOW_PHASES,
} from './constants.js';
import type { DesignPageV3SkeletonArea, DesignPageV3WorkflowPhase } from './types.js';

export type DesignPageProductSkeletonConfirmation = {
  buildRef: string;
  projectId: string;
  areas: DesignPageV3SkeletonArea[];
  workflowPhases: DesignPageV3WorkflowPhase[];
  productRules: {
    oneTaskOneDecisionOnePrimaryAction: true;
    creativeInsideLockedSkeleton: true;
    technicalDetailsSecondary: true;
    hostShellPreserved: true;
  };
  confirmedAt: string;
};

/** Product skeleton — creative layer may recompose visuals, not remove function. */
export function confirmDesignPageProductSkeleton(input: {
  projectId: string;
  buildRef: string;
}): DesignPageProductSkeletonConfirmation {
  return {
    buildRef: input.buildRef,
    projectId: input.projectId,
    areas: [...DESIGN_PAGE_V3_SKELETON_AREAS],
    workflowPhases: [...DESIGN_PAGE_V3_WORKFLOW_PHASES],
    productRules: {
      oneTaskOneDecisionOnePrimaryAction: true,
      creativeInsideLockedSkeleton: true,
      technicalDetailsSecondary: true,
      hostShellPreserved: true,
    },
    confirmedAt: new Date().toISOString(),
  };
}

export function skeletonPromptBlock(): string {
  return DESIGN_PAGE_V3_SKELETON_AREAS.map((a) => `- ${a.replace(/_/g, ' ')}`).join('\n');
}
