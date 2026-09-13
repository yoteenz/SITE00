import {
  DESIGN_PAGE_V3_CANONICAL_PATH,
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_SKELETON_AREAS,
  DESIGN_PAGE_V3_WORKFLOW_PHASES,
  P0_VR_TWIN_V30R2_LINEAGE,
} from './constants.js';
import type { DesignPageV3SkeletonArea, DesignPageV3WorkflowPhase } from './types.js';

const ZONE_LABELS: Record<DesignPageV3SkeletonArea, string> = {
  HOST_HEADER_PAGE_FRAME: 'A. HOST HEADER / PAGE FRAME — SITE 00 host, breadcrumb, NDXBOOK open, DESIGN identity',
  TARGET_CONTEXT_STRIP: 'B. TARGET CONTEXT STRIP — project, route, viewport, stage, authority/version (compact)',
  PRIMARY_WORKSPACE_PANEL: 'C. PRIMARY WORKSPACE PANEL — dominant “main table”; active concept/authority preview',
  DECISION_BAR_ACTION_BAND: 'D. DECISION BAR — approve, refine, regenerate, compare, inspect (workflow-aware)',
  STRUCTURED_OUTPUT_REVIEW_SYSTEM: 'E. STRUCTURED OUTPUT REVIEW — concept, blueprint, overlay, assets, functions (one pipeline)',
  PIPELINE_STATE_READINESS: 'F. PIPELINE / READINESS — ready, missing, approved, blocked, next valid action',
  SECONDARY_DETAIL_EXPANDABLE: 'G. SECONDARY DETAIL — technical data collapsed (sheet/drawer), not dominant',
};

export type DesignPageProductSkeletonConfirmation = {
  buildRef: string;
  lineage: typeof P0_VR_TWIN_V30R2_LINEAGE;
  projectId: string;
  hostProduct: typeof DESIGN_PAGE_V3_HOST_PRODUCT_NAME;
  clientProjectOpen: string;
  canonicalPath: typeof DESIGN_PAGE_V3_CANONICAL_PATH;
  areas: DesignPageV3SkeletonArea[];
  workflowPhases: DesignPageV3WorkflowPhase[];
  productRules: {
    oneTaskOneDecisionOnePrimaryAction: true;
    hostShellOwnsFrame: true;
    clientProjectNeverOwnsShell: true;
    visualHierarchyHostThenClientThenWorkflow: true;
    technicalDetailsSecondary: true;
    workspaceOrganizesVisuallyNotNarrates: true;
  };
  confirmedAt: string;
};

export function confirmDesignPageProductSkeleton(input: {
  projectId: string;
  buildRef: string;
}): DesignPageProductSkeletonConfirmation {
  return {
    buildRef: input.buildRef,
    lineage: P0_VR_TWIN_V30R2_LINEAGE,
    projectId: input.projectId,
    hostProduct: DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
    clientProjectOpen: input.projectId.toUpperCase(),
    canonicalPath: DESIGN_PAGE_V3_CANONICAL_PATH,
    areas: [...DESIGN_PAGE_V3_SKELETON_AREAS],
    workflowPhases: [...DESIGN_PAGE_V3_WORKFLOW_PHASES],
    productRules: {
      oneTaskOneDecisionOnePrimaryAction: true,
      hostShellOwnsFrame: true,
      clientProjectNeverOwnsShell: true,
      visualHierarchyHostThenClientThenWorkflow: true,
      technicalDetailsSecondary: true,
      workspaceOrganizesVisuallyNotNarrates: true,
    },
    confirmedAt: new Date().toISOString(),
  };
}

export function skeletonPromptBlock(): string {
  return DESIGN_PAGE_V3_SKELETON_AREAS.map((a) => `- ${ZONE_LABELS[a]}`).join('\n');
}

export function skeletonZoneLabelsForPrompt(): string {
  return skeletonPromptBlock();
}
