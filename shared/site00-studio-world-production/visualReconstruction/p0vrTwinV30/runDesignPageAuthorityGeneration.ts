import {
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  P0_VR_TWIN_V30_BUILD,
} from './constants.js';
import { classifyDesignPageAuthority } from './classifyDesignPageAuthority.js';
import { confirmDesignPageProductSkeleton } from './lockedExperienceSkeleton.js';
import { dispatchDesignPageAuthorityVisuals } from './dispatchDesignPageAuthorityVisuals.js';
import type { DesignPageAuthorityGenerationResult, DesignPageAuthorityReviewSession } from './types.js';

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
    authoritySessionId: input.session.authoritySessionId,
    projectId: input.session.projectId,
    pageLabel: input.session.pageLabel,
    hostProduct: DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
    clientProjectOpen: client,
    skeletonConfirmed: skeleton.areas,
    mobile: dispatch.mobile,
    desktop: dispatch.desktop,
    site00PageFrameSummary: `${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} shell, breadcrumb, DESIGN page identity — host owns chrome`,
    primaryWorkAreaSummary: 'Dominant central design-upgrade surface (visual focal point, not text console)',
    clientTargetContextSummary: `Project ${client} open — route/page/platform/stage as secondary band inside host workspace`,
    decisionReviewSummary: 'Single primary approve/refine/regenerate/compare CTA; readiness visible at a glance',
    structuredArtifactGroupingSummary: 'Authority, blueprint, overlay, assets, function map grouped — not flat text dump',
    secondaryDetailZonesSummary: 'Provider trace / lineage / debug collapsed in bottom sheet (mobile) or right drawer (desktop)',
    mobileTechnicalDetailsPattern: 'BOTTOM_SHEET_COLLAPSED',
    desktopTechnicalDetailsPattern: 'RIGHT_DRAWER_COLLAPSED',
    hostShellPreserved: true,
    classification,
    founderReview: {
      ...input.session.founderReview,
      lastAction: input.action ?? 'GENERATE',
      updatedAt: now,
    },
  };
}
