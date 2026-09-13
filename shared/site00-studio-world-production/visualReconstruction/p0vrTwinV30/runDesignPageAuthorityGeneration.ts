import { resolveActiveProjectExpressionContract } from './activeProjectExpressionContract.js';
import {
  DESIGN_PAGE_V3_CANONICAL_PATH,
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  DESIGN_PAGE_V3_SKELETON_AREAS,
  P0_VR_TWIN_V30R3_LINEAGE,
  P0_VR_TWIN_V30_BUILD,
} from './constants.js';
import { classifyDesignPageAuthority } from './classifyDesignPageAuthority.js';
import { buildAllTerritoryPrompts } from './buildDesignPageAuthorityTerritoryPrompts.js';
import { runDesignPageAuthoritySelfCheck } from './designPageAuthoritySelfCheck.js';
import { runDesignPageAuthorityR3SelfCheck } from './designPageAuthorityR3SelfCheck.js';
import { dispatchDesignPageAuthorityTerritoryVisuals } from './dispatchDesignPageAuthorityTerritoryVisuals.js';
import { confirmDesignPageProductSkeleton } from './lockedExperienceSkeleton.js';
import type { DesignPageAuthorityGenerationResult, DesignPageAuthorityReviewSession, DesignPageV3SkeletonArea } from './types.js';

const ZONE_SUMMARIES: Record<DesignPageV3SkeletonArea, string> = {
  HOST_HEADER_PAGE_FRAME: 'SITE 00 host shell — breadcrumb, DESIGN identity, Martian Mono wayfinding, host red reserved',
  TARGET_CONTEXT_STRIP: 'Compact NDXBOOK route/viewport — host-owned strip; project context not app shell',
  PRIMARY_WORKSPACE_PANEL: 'Dominant NDXBOOK-atmosphere work surface — lime accents, editorial artifact stage',
  DECISION_BAR_ACTION_BAND: 'Operating-state decision layer — not generic CTA card',
  STRUCTURED_OUTPUT_REVIEW_SYSTEM: 'Artifacts as layers/stacks/filmstrips — not uniform card grid',
  PIPELINE_STATE_READINESS: 'SITE 00 system readiness semantics — quiet spine / edge marks',
  SECONDARY_DETAIL_EXPANDABLE: 'Compiler/debug recessed — bottom sheet / edge drawer',
};

function pickPreviewPair(
  territories: DesignPageAuthorityGenerationResult['territories'],
  selectedTerritoryId: DesignPageAuthorityReviewSession['founderReview']['selectedTerritoryId'],
) {
  const id = selectedTerritoryId ?? 'A';
  const bundle = territories.find((t) => t.territoryId === id) ?? territories[0];
  return { bundle, selectedTerritoryId: selectedTerritoryId ?? null };
}

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
  const allPrompts = buildAllTerritoryPrompts({
    clientProjectId: input.session.projectId,
    refineNotes: input.session.founderReview.refineNotes,
  });
  const combinedPromptText = Object.values(allPrompts)
    .flatMap((p) => [p.mobile, p.desktop])
    .join('\n');
  const r2SelfCheck = runDesignPageAuthoritySelfCheck({
    promptOrArtifactText: combinedPromptText,
    zoneCount: DESIGN_PAGE_V3_SKELETON_AREAS.length,
  });
  const r3SelfCheck = runDesignPageAuthorityR3SelfCheck({
    promptOrArtifactText: combinedPromptText,
    territoryPrompts: {
      A: allPrompts.A.mobile,
      B: allPrompts.B.mobile,
      C: allPrompts.C.mobile,
    },
  });
  const dispatch = await dispatchDesignPageAuthorityTerritoryVisuals({
    authoritySessionId: input.session.authoritySessionId,
    clientProjectId: input.session.projectId,
    refineNotes: input.session.founderReview.refineNotes,
  });
  const previewTerritory = input.session.founderReview.selectedTerritoryId;
  const { bundle, selectedTerritoryId } = pickPreviewPair(dispatch.territories, previewTerritory);
  const falKeyConfigured = Boolean(process.env.FAL_KEY?.trim()) && process.env.VITEST !== 'true';
  const classification = classifyDesignPageAuthority({
    mobileUrl: bundle.mobile.storageUrl,
    desktopUrl: bundle.desktop.storageUrl,
    falKeyConfigured,
  });
  const now = new Date().toISOString();
  const client = input.session.projectId.toUpperCase();
  const expressionContract = resolveActiveProjectExpressionContract(input.session.projectId);
  return {
    buildRef: P0_VR_TWIN_V30_BUILD,
    lineage: P0_VR_TWIN_V30R3_LINEAGE,
    authoritySessionId: input.session.authoritySessionId,
    projectId: input.session.projectId,
    pageLabel: input.session.pageLabel,
    hostProduct: DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
    clientProjectOpen: client,
    canonicalPath: DESIGN_PAGE_V3_CANONICAL_PATH,
    skeletonConfirmed: skeleton.areas,
    territories: dispatch.territories,
    mobile: bundle.mobile,
    desktop: bundle.desktop,
    selectedTerritoryId,
    expressionContract,
    zoneSummaries: { ...ZONE_SUMMARIES },
    mobileTechnicalDetailsPattern: 'BOTTOM_SHEET_COLLAPSED',
    desktopTechnicalDetailsPattern: 'RIGHT_DRAWER_COLLAPSED',
    hostShellPreserved: true,
    r2SelfCheck,
    r3SelfCheck,
    falProviderTrace: dispatch.providerTrace,
    classification,
    founderReview: {
      ...input.session.founderReview,
      lastAction: input.action ?? 'GENERATE',
      updatedAt: now,
    },
  };
}
