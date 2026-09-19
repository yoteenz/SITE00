/**
 * P0.VR.DESIGN-HERO-ASSEMBLY-ACTIONS1 — hero toolbar CREATE FRAMEWORK + GENERATE ASSETS gates.
 */

import { loadPageCaptureHistory } from './designPageCapture.js';
import { computeGrokAssetEligibility } from './designGrokAssetEligibility.js';
import { listApprovedGrokAssets } from './designGrokAssetModel.js';
import type { PageAuthorityWorkflowState } from './designPageAuthorityWorkflow.js';
import { isOpusFrameworkHandoffPackage } from './designOpusFrameworkHandoff.js';
import type { DesignProductionState } from './types.js';
import type { PageViewportId } from './designProjectBinding/pageViewportAuthority.js';

export type HeroActionVisualState = 'AVAILABLE' | 'LOCKED' | 'READY' | 'BUSY' | 'COMPLETE' | 'NOT_REQUIRED';

export type CreateFrameworkHeroAction = {
  id: 'create_framework';
  label: 'CREATE FRAMEWORK';
  state: HeroActionVisualState;
  disabled: boolean;
  statusLine: string | null;
  disabledReason: string | null;
};

export type GenerateAssetsHeroAction = {
  id: 'generate_assets';
  label: 'GENERATE ASSETS';
  state: HeroActionVisualState;
  disabled: boolean;
  statusLine: string | null;
  disabledReason: string | null;
};

export type HeroAssemblyActionsModel = {
  capture: { label: 'CAPTURE SCREEN'; busy: boolean };
  createFramework: CreateFrameworkHeroAction;
  generateAssets: GenerateAssetsHeroAction;
};

export type HeroAssemblyActionsInput = {
  projectId: string;
  pageId: string;
  viewport: PageViewportId;
  production: DesignProductionState;
  pageWorkflow: PageAuthorityWorkflowState;
  twinRouteReachable: boolean | null;
  twinRoute: string | null;
  hasPageConceptCandidates: boolean;
  grokGenerationInProgress: boolean;
};

function promotedIds(input: HeroAssemblyActionsInput): { mobile: string | null; desktop: string | null } {
  return {
    mobile: input.production.promotedMobileConceptId ?? input.pageWorkflow.promoted.mobileConceptId,
    desktop: input.production.promotedDesktopConceptId ?? input.pageWorkflow.promoted.desktopConceptId,
  };
}

function createFrameworkDisabledReason(mobile: string | null, desktop: string | null): string {
  if (!mobile && !desktop) return 'PROMOTE MOBILE + DESKTOP CONCEPTS FIRST';
  if (!mobile) return 'PROMOTE MOBILE CONCEPT FIRST';
  if (!desktop) return 'PROMOTE DESKTOP CONCEPT FIRST';
  return 'CREATE FRAMEWORK UNAVAILABLE';
}

export function computeHeroAssemblyActions(input: HeroAssemblyActionsInput): HeroAssemblyActionsModel {
  const { mobile, desktop } = promotedIds(input);
  const bothPromoted = Boolean(mobile && desktop);
  const pkg = input.pageWorkflow.composerHandoffPackage;
  const frameworkPkg = isOpusFrameworkHandoffPackage(pkg) ? pkg : null;
  const twinStatus = input.production.twinImplementationStatus ?? input.pageWorkflow.twinImplementationStatus;
  const building =
    Boolean(frameworkPkg) &&
    twinStatus === 'IMPLEMENTING' &&
    frameworkPkg?.workflowStage === 'FRAMEWORK_BUILDING';
  const frameworkReady =
    twinStatus === 'READY_FOR_REVIEW' ||
    frameworkPkg?.workflowStage === 'FRAMEWORK_READY' ||
    input.twinRouteReachable === true;

  let createFramework: CreateFrameworkHeroAction = {
    id: 'create_framework',
    label: 'CREATE FRAMEWORK',
    state: 'LOCKED',
    disabled: true,
    statusLine: null,
    disabledReason: createFrameworkDisabledReason(mobile, desktop),
  };

  if (building) {
    createFramework = {
      ...createFramework,
      state: 'BUSY',
      disabled: true,
      disabledReason: 'FRAMEWORK BUILD IN PROGRESS',
      statusLine: 'FRAMEWORK: BUILDING',
    };
  } else if (frameworkReady && frameworkPkg) {
    createFramework = {
      ...createFramework,
      state: 'COMPLETE',
      disabled: true,
      disabledReason: null,
      statusLine: 'FRAMEWORK: READY FOR REVIEW',
    };
  } else if (bothPromoted && !frameworkPkg) {
    createFramework = {
      ...createFramework,
      state: 'READY',
      disabled: false,
      disabledReason: null,
      statusLine: 'CREATE FRAMEWORK: READY',
    };
  } else if (bothPromoted && frameworkPkg && !building && !frameworkReady) {
    createFramework = {
      ...createFramework,
      state: 'BUSY',
      disabled: true,
      disabledReason: 'FRAMEWORK BUILD IN PROGRESS',
      statusLine: 'FRAMEWORK: BUILDING',
    };
  }

  const grok = computeGrokAssetEligibility({
    projectId: input.projectId,
    pageId: input.pageId,
    viewport: input.viewport,
    production: input.production,
    pageWorkflow: input.pageWorkflow,
    twinRouteReachable: input.twinRouteReachable,
    twinRoute: input.twinRoute,
    hasPageConceptCandidates: input.hasPageConceptCandidates,
  });

  const capture = loadPageCaptureHistory(input.projectId, input.pageId, input.viewport);
  const hasCapture = Boolean(capture.latest?.artifactPath);
  const twinCreated =
    grok.gates.find((g) => g.id === 'twin_created')?.status === 'PASS';
  const twinReviewable =
    grok.gates.find((g) => g.id === 'twin_review')?.status === 'PASS';

  let generateDisabledReason: string | null = grok.shortReason;
  if (!frameworkPkg && bothPromoted) generateDisabledReason = 'CREATE FRAMEWORK FIRST';
  else if (frameworkPkg && !twinCreated) generateDisabledReason = 'TWIN NOT READY';
  else if (twinCreated && !twinReviewable) generateDisabledReason = 'TWIN REVIEW REQUIRED';
  else if (twinReviewable && !hasCapture) generateDisabledReason = 'CAPTURE CURRENT PAGE FIRST';
  else if (grok.eligibility === 'BLOCKED_GROK_NOT_NEEDED') generateDisabledReason = null;

  const approvedAssets = listApprovedGrokAssets(input.projectId, input.pageId);

  let generateAssets: GenerateAssetsHeroAction = {
    id: 'generate_assets',
    label: 'GENERATE ASSETS',
    state: 'LOCKED',
    disabled: true,
    statusLine: null,
    disabledReason: generateDisabledReason,
  };

  if (input.pageWorkflow.grokOptOut || grok.assetProductionStatus === 'NOT_REQUIRED') {
    generateAssets = {
      ...generateAssets,
      state: 'NOT_REQUIRED',
      disabled: true,
      disabledReason: null,
      statusLine: 'GENERATE ASSETS: NOT REQUIRED',
    };
  } else if (input.grokGenerationInProgress) {
    generateAssets = {
      ...generateAssets,
      state: 'BUSY',
      disabled: true,
      disabledReason: 'GROK GENERATION IN PROGRESS',
      statusLine: 'GENERATE ASSETS: IN PROGRESS',
    };
  } else if (approvedAssets.length > 0 && grok.canGenerateProductionAssets) {
    generateAssets = {
      ...generateAssets,
      state: 'COMPLETE',
      disabled: true,
      disabledReason: null,
      statusLine: 'GENERATE ASSETS: COMPLETE',
    };
  } else if (grok.canGenerateProductionAssets) {
    generateAssets = {
      ...generateAssets,
      state: 'READY',
      disabled: false,
      disabledReason: null,
      statusLine: 'GENERATE ASSETS: READY',
    };
  }

  return {
    capture: { label: 'CAPTURE SCREEN', busy: false },
    createFramework,
    generateAssets,
  };
}
