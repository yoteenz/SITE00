/**
 * P0.VR.DESIGN-PIPELINE-READINESS2 — page-scoped workflow controller model.
 */

import { computeGrokAssetEligibility } from './designGrokAssetEligibility.js';
import {
  loadPageAuthorityWorkflow,
  resolveActiveAuthorityImage,
} from './designPageAuthorityWorkflow.js';
import { listPageConceptCandidates } from './designProjectBinding/designPageConceptModel.js';
import { compileDesignPageContext } from './designProjectBinding/pageContext.js';
import type { DesignProductionState } from './types.js';
import type { ReadinessGateCheck, ReadinessGateResult } from './types.js';
import { listApprovedGrokAssets } from './designGrokAssetModel.js';
import { isOpusFrameworkHandoffPackage } from './designOpusFrameworkHandoff.js';

export type PagePipelineStageId =
  | 'authority_direction'
  | 'page_concepts'
  | 'viewport_selection'
  | 'final_design_approval'
  | 'pair_review'
  | 'implementation_handoff'
  | 'twin_build'
  | 'twin_review'
  | 'asset_production'
  | 'asset_implementation'
  | 'page_ready';

export type PagePipelineStageStatus =
  | 'COMPLETE'
  | 'ACTIVE'
  | 'BLOCKED'
  | 'OPTIONAL'
  | 'NOT_REQUIRED'
  | 'PENDING';

export type PipelineResolutionHandler =
  | 'openReadinessReceipt'
  | 'openViewReadiness'
  | 'openViewPipeline'
  | 'openTechnicalDetails'
  | 'openPipelineStage'
  | 'runPairReview'
  | 'runLockAuthorityPair'
  | 'openReviewTwin'
  | 'openComposerHandoff'
  | 'selectForMobile'
  | 'selectForDesktop'
  | 'promoteMobile'
  | 'promoteDesktop'
  | 'openViewportAuthorityEditorMobile'
  | 'openViewportAuthorityEditorDesktop'
  | 'captureScreen'
  | 'openCreateFramework'
  | 'openGenerateAssets'
  | 'openGrokDock'
  | 'scrollGallery';

export type PageWorkflowBlocker = {
  blockerId: string;
  stageId: PagePipelineStageId;
  type: string;
  message: string;
  resolutionHandler: PipelineResolutionHandler;
  resolutionSurface: string;
  severity: 'blocking' | 'warning';
  isBlocking: boolean;
};

export type PagePipelineStageRow = {
  id: PagePipelineStageId;
  order: number;
  shortLabel: string;
  label: string;
  status: PagePipelineStageStatus;
  purpose: string;
  requirements: readonly string[];
  completedItems: readonly string[];
  missingItems: readonly string[];
  actionLabel: string | null;
  actionHandler: PipelineResolutionHandler | null;
};

export type PagePipelineControllerModel = {
  currentStageId: PagePipelineStageId;
  currentStageLabel: string;
  readinessPercent: number;
  readyLabel: 'READY' | 'BLOCKED' | 'IN PROGRESS';
  applicableGateCount: number;
  passedGateCount: number;
  blockerCount: number;
  optionalCount: number;
  warningCount: number;
  stages: readonly PagePipelineStageRow[];
  primaryBlocker: PageWorkflowBlocker | null;
  blockers: readonly PageWorkflowBlocker[];
  nextAction: {
    label: string;
    lines: readonly string[];
    handler: PipelineResolutionHandler;
    buttonLabel: string;
    disabledReason: string | null;
  };
  receiptGates: readonly ReadinessGateCheck[];
};

function gate(
  id: string,
  label: string,
  scope: ReadinessGateCheck['scope'],
  result: ReadinessGateResult,
  reason: string,
  blocking: boolean,
): ReadinessGateCheck {
  return { id, label, scope, result, reason, blocking };
}

export type PagePipelineInput = {
  projectId: string;
  pageId: string;
  production: DesignProductionState;
  twinRouteReachable: boolean | null;
};

export function buildPagePipelineControllerModel(input: PagePipelineInput): PagePipelineControllerModel {
  const wf = loadPageAuthorityWorkflow(input.projectId, input.pageId);
  const concepts = listPageConceptCandidates(input.projectId, input.pageId);
  const mobileRef = resolveActiveAuthorityImage(wf.mobileAuthority);
  const desktopRef = resolveActiveAuthorityImage(wf.desktopAuthority);
  const prefM = input.production.preferredMobileConceptId ?? wf.preferred.mobileConceptId;
  const prefD = input.production.preferredDesktopConceptId ?? wf.preferred.desktopConceptId;
  const promM = input.production.promotedMobileConceptId ?? wf.promoted.mobileConceptId;
  const promD = input.production.promotedDesktopConceptId ?? wf.promoted.desktopConceptId;
  const pairReview = Boolean(input.production.pairReviewOpenedAt ?? wf.pairReviewOpenedAt);
  const pairLocked = Boolean(input.production.pairLockedAt ?? wf.pairLockedAt);
  const handoff = Boolean(wf.composerHandoffPackage);
  const frameworkHandoff = isOpusFrameworkHandoffPackage(wf.composerHandoffPackage) ?
    wf.composerHandoffPackage
  : null;
  const twinStatus = input.production.twinImplementationStatus ?? wf.twinImplementationStatus;
  const twinBuilt =
    twinStatus !== 'NONE' &&
    (input.twinRouteReachable === true || Boolean(wf.twinRouteVerifiedAt));
  const twinReviewed =
    Boolean(input.production.twinPageReviewedAt) || Boolean(wf.twinReviewedAt);

  const grokEligibility = computeGrokAssetEligibility({
    projectId: input.projectId,
    pageId: input.pageId,
    viewport: 'MOBILE',
    production: input.production,
    pageWorkflow: wf,
    twinRouteReachable: input.twinRouteReachable ?? (wf.twinRouteVerifiedAt ? true : null),
    twinRoute: compileDesignPageContext(input.projectId, input.pageId)?.route ?? null,
    hasPageConceptCandidates: concepts.length > 0,
  });
  const grokAssets = listApprovedGrokAssets(input.projectId, input.pageId);
  const grokNotRequired = wf.grokOptOut || grokEligibility.eligibility === 'BLOCKED_GROK_NOT_NEEDED';

  const s01Complete = Boolean(mobileRef && desktopRef);
  const s02Complete = concepts.length > 0;
  const s03Complete = Boolean(prefM && prefD);
  const s04Complete = Boolean(promM && promD);
  const s05Complete = pairReview;
  const s06Complete = handoff;
  const s07Complete = twinBuilt;
  const s08Complete = twinReviewed;
  const s09Complete =
    grokNotRequired ? true
    : grokEligibility.canGenerateProductionAssets && grokAssets.length > 0;
  const s09NotRequired = grokNotRequired;
  const s10Complete = grokNotRequired || grokAssets.length === 0 ? true : false;
  const s10NotRequired = grokNotRequired || grokAssets.length === 0;

  const stages: PagePipelineStageRow[] = [
    {
      id: 'authority_direction',
      order: 1,
      shortLabel: 'AUTHORITY',
      label: 'AUTHORITY DIRECTION',
      status: s01Complete ? 'COMPLETE' : 'ACTIVE',
      purpose: 'CGPT mobile/desktop authority references for creative layer',
      requirements: ['Mobile authority reference', 'Desktop authority reference'],
      completedItems: [
        ...(mobileRef ? ['Mobile authority reference'] : []),
        ...(desktopRef ? ['Desktop authority reference'] : []),
      ],
      missingItems: [
        ...(!mobileRef ? ['Mobile authority reference'] : []),
        ...(!desktopRef ? ['Desktop authority reference'] : []),
      ],
      actionLabel: !mobileRef ? 'DEFINE MOBILE AUTHORITY' : !desktopRef ? 'DEFINE DESKTOP AUTHORITY' : null,
      actionHandler:
        !mobileRef ? 'openViewportAuthorityEditorMobile'
        : !desktopRef ? 'openViewportAuthorityEditorDesktop'
        : null,
    },
    {
      id: 'page_concepts',
      order: 2,
      shortLabel: 'CONCEPTS',
      label: 'PAGE CONCEPTS',
      status: !s01Complete ? 'PENDING' : s02Complete ? 'COMPLETE' : 'ACTIVE',
      purpose: 'GPT2 page concept set for this page',
      requirements: ['Page concept candidates generated'],
      completedItems: s02Complete ? ['Concept set present'] : [],
      missingItems: s02Complete ? [] : ['Generate page concepts'],
      actionLabel: s02Complete ? null : 'GENERATE PAGE CONCEPTS',
      actionHandler: s02Complete ? null : 'scrollGallery',
    },
    {
      id: 'viewport_selection',
      order: 3,
      shortLabel: 'SELECTION',
      label: 'VIEWPORT SELECTION',
      status: !s02Complete ? 'PENDING' : s03Complete ? 'COMPLETE' : 'ACTIVE',
      purpose: 'Preferred mobile and desktop concepts selected independently',
      requirements: ['Preferred mobile concept', 'Preferred desktop concept'],
      completedItems: [
        ...(prefM ? ['Preferred mobile'] : []),
        ...(prefD ? ['Preferred desktop'] : []),
      ],
      missingItems: [
        ...(!prefM ? ['Preferred mobile concept'] : []),
        ...(!prefD ? ['Preferred desktop concept'] : []),
      ],
      actionLabel: !prefM ? 'SELECT MOBILE CONCEPT' : !prefD ? 'SELECT DESKTOP CONCEPT' : null,
      actionHandler: !prefM ? 'selectForMobile' : !prefD ? 'selectForDesktop' : null,
    },
    {
      id: 'final_design_approval',
      order: 4,
      shortLabel: 'APPROVAL',
      label: 'FINAL DESIGN APPROVAL',
      status: !s03Complete ? 'PENDING' : s04Complete ? 'COMPLETE' : 'ACTIVE',
      purpose: 'Promote mobile and desktop designs (final viewport approval)',
      requirements: ['Mobile promoted', 'Desktop promoted'],
      completedItems: [
        ...(promM ? ['Mobile promoted'] : []),
        ...(promD ? ['Desktop promoted'] : []),
      ],
      missingItems: [
        ...(!promM ? ['Mobile not promoted'] : []),
        ...(!promD ? ['Desktop not promoted'] : []),
      ],
      actionLabel: !promM ? 'PROMOTE MOBILE' : !promD ? 'PROMOTE DESKTOP' : 'CREATE FRAMEWORK',
      actionHandler: !promM ? 'promoteMobile' : !promD ? 'promoteDesktop' : 'openCreateFramework',
    },
    {
      id: 'pair_review',
      order: 5,
      shortLabel: 'PAIR REVIEW',
      label: 'PAIR REVIEW',
      status: !s04Complete ? 'PENDING' : s05Complete ? 'COMPLETE' : 'ACTIVE',
      purpose: 'Review promoted mobile + desktop together',
      requirements: ['Pair review opened'],
      completedItems: s05Complete ? ['Pair review recorded'] : [],
      missingItems: s05Complete ? [] : ['Open pair review'],
      actionLabel: s05Complete ? null : 'OPEN PAIR REVIEW',
      actionHandler: s05Complete ? null : 'runPairReview',
    },
    {
      id: 'implementation_handoff',
      order: 6,
      shortLabel: 'HANDOFF',
      label: 'IMPLEMENTATION HANDOFF',
      status: !s05Complete ? 'PENDING' : s06Complete ? 'COMPLETE' : 'ACTIVE',
      purpose: 'Lock authority pair and Composer package',
      requirements: ['Pair locked', 'Composer handoff package'],
      completedItems: [
        ...(pairLocked ? ['Pair locked'] : []),
        ...(handoff ? ['Composer handoff'] : []),
      ],
      missingItems: [
        ...(!pairLocked ? ['Lock authority pair'] : []),
        ...(!handoff ? ['Composer handoff package'] : []),
      ],
      actionLabel: !handoff ? 'CREATE FRAMEWORK' : pairLocked ? null : 'LOCK AUTHORITY PAIR',
      actionHandler: !handoff ? 'openCreateFramework' : !pairLocked ? 'runLockAuthorityPair' : null,
    },
    {
      id: 'twin_build',
      order: 7,
      shortLabel: 'TWIN BUILD',
      label: 'TWIN BUILD',
      status: !handoff ? 'PENDING' : s07Complete ? 'COMPLETE' : 'ACTIVE',
      purpose: 'Opus page framework / twin assembly',
      requirements: ['Framework handoff dispatched', 'Twin route reachable'],
      completedItems: s07Complete ? ['Twin route reachable'] : frameworkHandoff ? ['Framework handoff queued'] : [],
      missingItems: s07Complete ? [] : handoff ? ['Await Opus framework build'] : ['Create page framework'],
      actionLabel: s07Complete ? null : handoff ? 'REVIEW FRAMEWORK STATUS' : 'CREATE FRAMEWORK',
      actionHandler: s07Complete ? null : 'openCreateFramework',
    },
    {
      id: 'twin_review',
      order: 8,
      shortLabel: 'TWIN REVIEW',
      label: 'TWIN REVIEW',
      status: !s07Complete ? 'PENDING' : s08Complete ? 'COMPLETE' : 'ACTIVE',
      purpose: 'Founder reviews working twin',
      requirements: ['Twin review recorded'],
      completedItems: s08Complete ? ['Twin reviewed'] : [],
      missingItems: s08Complete ? [] : ['Review twin page'],
      actionLabel: s08Complete ? null : 'REVIEW TWIN PAGE',
      actionHandler: s08Complete ? null : 'openReviewTwin',
    },
    {
      id: 'asset_production',
      order: 9,
      shortLabel: 'ASSETS',
      label: 'ASSET PRODUCTION',
      status:
        s09NotRequired ? 'NOT_REQUIRED'
        : !s08Complete ? 'PENDING'
        : s09Complete ? 'COMPLETE'
        : grokEligibility.canGenerateProductionAssets ? 'ACTIVE'
        : 'BLOCKED',
      purpose: 'Optional Grok asset production after twin review',
      requirements: grokNotRequired ? ['Not required for this page'] : ['Capture + Grok eligibility'],
      completedItems: s09Complete ? ['Grok assets approved'] : s09NotRequired ? ['Not required'] : [],
      missingItems:
        s09NotRequired ? []
        : !grokEligibility.canGenerateProductionAssets ? [grokEligibility.shortReason]
        : grokAssets.length === 0 ? ['Generate/approve Grok assets'] : [],
      actionLabel:
        s09NotRequired ? null
        : grokEligibility.canGenerateProductionAssets ? 'GENERATE ASSETS'
        : grokEligibility.nextAction === 'CAPTURE SCREEN' ? 'CAPTURE SCREEN'
        : !handoff ? 'CREATE FRAMEWORK'
        : 'GENERATE ASSETS',
      actionHandler:
        s09NotRequired ? null
        : grokEligibility.canGenerateProductionAssets ? 'openGenerateAssets'
        : grokEligibility.nextAction === 'CAPTURE SCREEN' ? 'captureScreen'
        : !handoff ? 'openCreateFramework'
        : 'openGenerateAssets',
    },
    {
      id: 'asset_implementation',
      order: 10,
      shortLabel: 'ASSET IMPL',
      label: 'ASSET IMPLEMENTATION',
      status: s10NotRequired ? 'NOT_REQUIRED' : s10Complete ? 'COMPLETE' : 'PENDING',
      purpose: 'Composer installs approved Grok assets',
      requirements: ['Composer asset install'],
      completedItems: s10NotRequired ? ['Not required'] : [],
      missingItems: s10NotRequired ? [] : ['Composer implementation when assets exist'],
      actionLabel: null,
      actionHandler: null,
    },
    {
      id: 'page_ready',
      order: 11,
      shortLabel: 'PAGE READY',
      label: 'PAGE READY',
      status: 'PENDING',
      purpose: 'All applicable upstream gates complete (not production promotion)',
      requirements: ['All applicable stages complete'],
      completedItems: [],
      missingItems: [],
      actionLabel: null,
      actionHandler: null,
    },
  ];

  let markedActive = false;
  for (const row of stages) {
    if (row.id === 'page_ready' || row.status === 'NOT_REQUIRED') continue;
    if (row.status === 'COMPLETE') continue;
    if (!markedActive) {
      row.status = row.status === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE';
      markedActive = true;
    } else {
      row.status = 'PENDING';
    }
  }

  const applicable = stages.filter((s) => s.status !== 'NOT_REQUIRED' && s.id !== 'page_ready');
  const passed = applicable.filter((s) => s.status === 'COMPLETE');
  const optionalCount = stages.filter((s) => s.status === 'NOT_REQUIRED').length;

  const allCoreComplete =
    s01Complete && s02Complete && s03Complete && s04Complete && s05Complete && s06Complete && s07Complete && s08Complete &&
    (s09NotRequired || s09Complete) &&
    (s10NotRequired || s10Complete);
  stages.find((s) => s.id === 'page_ready')!.status = allCoreComplete ? 'COMPLETE' : 'PENDING';
  if (allCoreComplete) passed.push(stages.find((s) => s.id === 'page_ready')!);

  const readinessPercent =
    applicable.length === 0 ? 0 : Math.round((100 * passed.filter((p) => p.id !== 'page_ready').length) / applicable.length);

  let currentStageId: PagePipelineStageId = 'page_ready';
  for (const row of stages) {
    if (row.status === 'NOT_REQUIRED') continue;
    if (row.status !== 'COMPLETE') {
      currentStageId = row.id;
      break;
    }
  }
  if (allCoreComplete) currentStageId = 'page_ready';

  const blockers: PageWorkflowBlocker[] = [];
  for (const row of stages) {
    if (row.status !== 'ACTIVE' && row.status !== 'BLOCKED') continue;
    if (!row.missingItems.length) continue;
    blockers.push({
      blockerId: `block-${row.id}`,
      stageId: row.id,
      type: row.label,
      message: row.missingItems[0] ?? row.label,
      resolutionHandler: row.actionHandler ?? 'openPipelineStage',
      resolutionSurface: row.actionLabel ?? row.label,
      severity: 'blocking',
      isBlocking: true,
    });
  }

  const primaryBlocker = blockers[0] ?? null;
  const blockerCount = blockers.length;

  const nextAction = ((): PagePipelineControllerModel['nextAction'] => {
    const active = stages.find((s) => s.id === currentStageId);
    if (allCoreComplete) {
      return {
        label: 'NEXT ACTION',
        lines: ['PAGE READY', 'Review pipeline or move to build when applicable'],
        handler: 'openViewPipeline',
        buttonLabel: 'VIEW PIPELINE',
        disabledReason: null,
      };
    }
    const handler = active?.actionHandler ?? primaryBlocker?.resolutionHandler ?? 'openViewPipeline';
    return {
      label: 'NEXT ACTION',
      lines: [active?.actionLabel ?? primaryBlocker?.message ?? 'Continue workflow', active?.purpose ?? ''],
      handler,
      buttonLabel: active?.actionLabel ?? 'CONTINUE',
      disabledReason: null,
    };
  })();

  const readyLabel: PagePipelineControllerModel['readyLabel'] =
    allCoreComplete ? 'READY'
    : blockerCount > 0 ? 'BLOCKED'
    : 'IN PROGRESS';

  const receiptGates: ReadinessGateCheck[] = [
    gate('mobile_authority_ref', 'Mobile authority reference', 'DESIGN_AUTHORITY', mobileRef ? 'PASS' : 'BLOCKED', mobileRef ? 'active' : 'missing', true),
    gate('desktop_authority_ref', 'Desktop authority reference', 'DESIGN_AUTHORITY', desktopRef ? 'PASS' : 'BLOCKED', desktopRef ? 'active' : 'missing', true),
    gate('page_concepts', 'GPT2 page concepts', 'DESIGN_AUTHORITY', s02Complete ? 'PASS' : 'BLOCKED', `${concepts.length} candidates`, true),
    gate('mobile_concept_selected', 'Mobile concept selected', 'DESIGN_AUTHORITY', prefM ? 'PASS' : 'BLOCKED', prefM ?? 'none', true),
    gate('desktop_concept_selected', 'Desktop concept selected', 'DESIGN_AUTHORITY', prefD ? 'PASS' : 'BLOCKED', prefD ?? 'none', true),
    gate('mobile_design_promoted', 'Mobile design promoted', 'DESIGN_AUTHORITY', promM ? 'PASS' : 'BLOCKED', promM ?? 'none', true),
    gate('desktop_design_promoted', 'Desktop design promoted', 'DESIGN_AUTHORITY', promD ? 'PASS' : 'BLOCKED', promD ?? 'none', true),
    gate('pair_review_complete', 'Pair review complete', 'DESIGN_AUTHORITY', s05Complete ? 'PASS' : 'BLOCKED', pairReview ? 'opened' : 'pending', true),
    gate('implementation_handoff', 'Implementation handoff', 'DESIGN_AUTHORITY', s06Complete ? 'PASS' : 'BLOCKED', handoff ? 'package' : 'pending', true),
    gate('twin_ready_for_review', 'Twin ready for review', 'BUILD', s07Complete ? 'PASS' : 'BLOCKED', twinStatus, true),
    gate('twin_review_complete', 'Twin review complete', 'BUILD', s08Complete ? 'PASS' : 'BLOCKED', twinReviewed ? 'reviewed' : 'pending', true),
    gate(
      'grok_asset_production',
      'Grok asset production',
      'ASSETS',
      s09NotRequired ? 'NOT_APPLICABLE' : s09Complete ? 'PASS' : 'BLOCKED',
      s09NotRequired ? 'not required' : grokEligibility.shortReason,
      !s09NotRequired,
    ),
  ];

  return {
    currentStageId,
    currentStageLabel: stages.find((s) => s.id === currentStageId)?.label ?? 'PAGE READY',
    readinessPercent,
    readyLabel,
    applicableGateCount: applicable.length,
    passedGateCount: passed.filter((p) => p.id !== 'page_ready' || allCoreComplete).length,
    blockerCount,
    optionalCount,
    warningCount: 0,
    stages,
    primaryBlocker,
    blockers,
    nextAction,
    receiptGates,
  };
}
