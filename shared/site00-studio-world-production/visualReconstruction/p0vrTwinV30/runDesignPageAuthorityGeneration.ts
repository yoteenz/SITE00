import {
  DESIGN_PAGE_V3_CANONICAL_PATH,
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  DESIGN_PAGE_V3_SKELETON_AREAS,
  P0_VR_TWIN_V30R2_LINEAGE,
  P0_VR_TWIN_V30_BUILD,
} from './constants.js';
import { classifyDesignPageAuthority } from './classifyDesignPageAuthority.js';
import {
  buildDesktopDesignPageAuthorityPrompt,
  buildMobileDesignPageAuthorityPrompt,
} from './buildDesignPageAuthorityPrompts.js';
import { runDesignPageAuthoritySelfCheck } from './designPageAuthoritySelfCheck.js';
import { confirmDesignPageProductSkeleton } from './lockedExperienceSkeleton.js';
import { dispatchDesignPageAuthorityVisuals } from './dispatchDesignPageAuthorityVisuals.js';
import type { DesignPageAuthorityGenerationResult, DesignPageAuthorityReviewSession, DesignPageV3SkeletonArea } from './types.js';

const ZONE_SUMMARIES: Record<DesignPageV3SkeletonArea, string> = {
  HOST_HEADER_PAGE_FRAME: 'SITE 00 host header, breadcrumb, DESIGN page identity, top operating controls',
  TARGET_CONTEXT_STRIP: 'Compact NDXBOOK · route · viewport · stage · authority/version context',
  PRIMARY_WORKSPACE_PANEL: 'Dominant main table — active authority/concept preview and comparison affordance',
  DECISION_BAR_ACTION_BAND: 'Workflow-aware approve · refine · regenerate · compare · inspect band',
  STRUCTURED_OUTPUT_REVIEW_SYSTEM: 'Grouped pipeline artifacts: visual, blueprint, overlay, assets, functions',
  PIPELINE_STATE_READINESS: 'Ready / missing / approved / blocked / next valid action at a glance',
  SECONDARY_DETAIL_EXPANDABLE: 'Technical detail collapsed — never dominates primary workspace',
};

export async function runDesignPageAuthorityGeneration(input: {
  session: DesignPageAuthorityReviewSession;
  action?: 'GENERATE' | 'REFINE' | 'REGENERATE';
}): Promise<DesignPageAuthorityGenerationResult> {
  if (input.session.projectId !== DESIGN_PAGE_V3_PILOT_PROJECT_ID) {
    throw new Error('DESIGN_PAGE_V3_PILOT: ndxbook only');
  }
  const skeleton = confirmDesignPageProductSkeleton({
    projectId: input.session.projectId,
    buildRef: P0_VR_TWIN_V30_BUILD,
  });
  const mobilePrompt = buildMobileDesignPageAuthorityPrompt({
    clientProjectId: input.session.projectId,
    refineNotes: input.session.founderReview.refineNotes,
  });
  const desktopPrompt = buildDesktopDesignPageAuthorityPrompt({
    clientProjectId: input.session.projectId,
    refineNotes: input.session.founderReview.refineNotes,
  });
  const r2SelfCheck = runDesignPageAuthoritySelfCheck({
    promptOrArtifactText: `${mobilePrompt}\n${desktopPrompt}`,
    zoneCount: DESIGN_PAGE_V3_SKELETON_AREAS.length,
  });
  const dispatch = await dispatchDesignPageAuthorityVisuals({
    authoritySessionId: input.session.authoritySessionId,
    clientProjectId: input.session.projectId,
    refineNotes: input.session.founderReview.refineNotes,
  });
  const falKeyConfigured = Boolean(process.env.FAL_KEY?.trim()) && process.env.VITEST !== 'true';
  const classification = classifyDesignPageAuthority({
    mobileUrl: dispatch.mobile.storageUrl,
    desktopUrl: dispatch.desktop.storageUrl,
    falKeyConfigured,
  });
  const now = new Date().toISOString();
  const client = input.session.projectId.toUpperCase();
  return {
    buildRef: P0_VR_TWIN_V30_BUILD,
    lineage: P0_VR_TWIN_V30R2_LINEAGE,
    authoritySessionId: input.session.authoritySessionId,
    projectId: input.session.projectId,
    pageLabel: input.session.pageLabel,
    hostProduct: DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
    clientProjectOpen: client,
    canonicalPath: DESIGN_PAGE_V3_CANONICAL_PATH,
    skeletonConfirmed: skeleton.areas,
    mobile: dispatch.mobile,
    desktop: dispatch.desktop,
    zoneSummaries: { ...ZONE_SUMMARIES },
    mobileTechnicalDetailsPattern: 'BOTTOM_SHEET_COLLAPSED',
    desktopTechnicalDetailsPattern: 'RIGHT_DRAWER_COLLAPSED',
    hostShellPreserved: true,
    r2SelfCheck,
    classification,
    founderReview: {
      ...input.session.founderReview,
      lastAction: input.action ?? 'GENERATE',
      updatedAt: now,
    },
  };
}
