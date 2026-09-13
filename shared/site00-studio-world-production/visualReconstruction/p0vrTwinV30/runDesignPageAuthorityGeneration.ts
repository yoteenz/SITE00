import {
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
    projectLabel: input.session.pageLabel,
    refineNotes: input.session.founderReview.refineNotes,
  });
  const falKeyConfigured = Boolean(process.env.FAL_KEY?.trim()) && process.env.VITEST !== 'true';
  const classification = classifyDesignPageAuthority({
    mobileUrl: dispatch.mobile.storageUrl,
    desktopUrl: dispatch.desktop.storageUrl,
    falKeyConfigured,
  });
  const now = new Date().toISOString();
  return {
    buildRef: P0_VR_TWIN_V30_BUILD,
    authoritySessionId: input.session.authoritySessionId,
    projectId: input.session.projectId,
    pageLabel: input.session.pageLabel,
    skeletonConfirmed: skeleton.areas,
    mobile: dispatch.mobile,
    desktop: dispatch.desktop,
    masterWorkspaceSummary: 'Dominant master concept canvas with approve / refine / regenerate hierarchy',
    workflowRailSummary: 'Compact TARGET→FIDELITY phase rail with IDLE/READY/ACTIVE/BLOCKED/PASS/FAIL chips',
    currentActionSummary: 'Single primary CTA dominates (e.g. APPROVE MASTER); secondary actions subordinate',
    derivativeBundleUxSummary: 'Master + blueprint twin + overlay + object data + assets + functions + lineage as one family',
    assetWorkspaceSummary: 'Thumbnail-first asset inventory with object binding and regen contract chips',
    functionOwnershipUxSummary: 'Host vs client ownership map with exclusions — high signal, no JSON wall',
    compilerReadinessUxSummary: 'Pre-flight checklist (master locked, blueprint, assets, functions, host boundary, checksum)',
    fidelityReviewUxSummary: 'Post-build master vs coded compare with machine/founder pass and drift highlights',
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
