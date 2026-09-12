/**
 * P0.PCI.3 — Page Family Workspace (primary PAGES tab experience).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PageVisualIndexRow } from '../DesignPagesVisualIndex';
import { DesignDetailsDrawer } from '../wizard/DesignDetailsDrawer';
import { ProjectProgressBar } from './ProjectProgressBar';
import { PageFamilyMap } from './PageFamilyMap';
import { DerivativeReviewCarousel } from './DerivativeReviewCarousel';
import { PageFamilySelector } from './PageFamilySelector';
import { ReconstructionWorkflowRail } from './ReconstructionWorkflowRail';
import {
  applyApprovalToFamily,
  approveFamily,
  approveNodeDesign,
  confirmFamilyStructure,
  getSavedSelectedNode,
  getWorkflowStep,
  saveSelectedNode,
  setWorkflowStep,
} from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyStore.js';
import {
  buildPageFamilyFromRows,
  listSiblingNodes,
} from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyBuilder.js';
import {
  buildPageFamilyRootTarget,
  buildPageId,
  defaultSelectedNodeId,
  resolveReviewStepLabel,
  resolveRootScreenId,
} from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyRootTarget.js';
import {
  authorityStatusLabel,
  resolveDesignAuthorityPreview,
  resolvePageViewportAuthority,
} from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageViewportAuthority.js';
import {
  buildProjectProgressSummary,
  derivePageFamilyReadiness,
} from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyReadiness.js';
import { summarizeNavigationDetection } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/parentNavigationIntentResolver.js';
import { resolveWorkflowAction } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyWorkflow.js';
import type { CaptureServiceInput } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyDependencyPolicy.js';
import type { PageFamilyRowInput } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/types.js';
import type { DesignViewportClass } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import {
  openPageCreativeUpgradeSession,
  approvePageCreativeDirection,
  attachAfterCaptureToSession,
  resolveCurrentPageViewportCapture,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/index.js';
import type { PageCreativeUpgradeSession } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/types.js';
import { CANONICAL_VIEWPORT_DIMENSIONS } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/constants.js';
import { resolveMobileVisualShellSpec } from '../../../config/ndxMobileVisualShellSpecs.js';
import { collectCssSnapshotFromMobileShell, collectDomRegionMeasurements } from '../../../utils/collectDomRegionMeasurements.js';
import { usePageViewportCapture } from '../usePageViewportCapture';
import { bootstrapFounderDesignWorkspace } from '../../../services/founderDesignWorkspaceCloudSync';
import { CaptureServiceStatusChip } from './CaptureServiceStatusChip';
import { FamilyReadinessDimensions } from './FamilyReadinessDimensions';
import { PageCaptureNowPanel } from './PageCaptureNowPanel';
import { PageCreativeUpgradePanel } from './PageCreativeUpgradePanel';
import { ReplaceDesignAuthorityDialog } from './ReplaceDesignAuthorityDialog';
import { DesignAuthorityHistoryDialog } from './DesignAuthorityHistoryDialog';
import {
  listPageDesignAuthorityHistory,
  resolveCurrentDesignAuthority,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/index.js';
import {
  getActiveTwinSessionForPage,
  getTwinSession,
  addTwinRevision,
  applyTwinRevision,
  approveTwinForPromotion,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/reconstructionTwinSession.js';
import { startTwinBuild } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrConverge1/twinBuildJob.js';
import { stashTwinSessionForPreview } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/twinPreviewHandoff.js';
import { promoteTwinToLivePage } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/pagePromotion.js';
import type { ReconstructionTwinSession } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import {
  getPageCreativeUpgradeSession,
  markPageCreativeUpgradeStatus,
  analyzeMissingPageCreativeUpgradeEvidence,
  analyzeSingleRegionStructureForUpgrade,
  recalculatePageCreativeUpgradeForensics,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageCreativeUpgradeSession.js';

export type PageFamilyWorkspaceProps = {
  projectId: string;
  projectName?: string;
  rows: PageVisualIndexRow[];
  viewport?: DesignViewportClass;
  onOpenPage?: (screenId: string) => void;
  onSelectScreen: (screenId: string) => void;
  onOpenLibrary?: () => void;
  onOpenCaptureService?: () => void;
  onCaptureNow?: (screenId: string, viewport: DesignViewportClass) => void;
  capturingPageId?: string | null;
  captureNowProgress?: string | null;
  captureNowError?: string | null;
  captureService?: CaptureServiceInput;
  onRetryTransport?: () => void;
  captureServiceChecking?: boolean;
  pageCompletionPct?: number | null;
  pageCompletionAttention?: number;
};

function toRowInput(row: PageVisualIndexRow): PageFamilyRowInput {
  return {
    screenId: row.screenId,
    displayName: row.displayName,
    route: row.route,
    normalizedRoute: row.normalizedRoute,
    mobile: row.mobile,
    referenceUrl: row.referenceUrl,
    neverCaptured: row.neverCaptured,
    resolvedCaptureState: row.resolvedCaptureState,
    pageCaptureStatus: row.pageCaptureStatus,
    isStale: row.isStale,
    missingImplementation: row.missingImplementation,
  };
}

export function PageFamilyWorkspace({
  projectId,
  projectName: _projectName = 'PROJECT',
  rows,
  onOpenPage,
  onSelectScreen,
  onOpenLibrary,
  onOpenCaptureService,
  onCaptureNow,
  viewport = 'mobile',
  capturingPageId,
  captureNowProgress,
  captureNowError,
  captureService,
  onRetryTransport,
  captureServiceChecking,
  pageCompletionPct,
  pageCompletionAttention,
}: PageFamilyWorkspaceProps) {
  const [activeParentRoute, setActiveParentRoute] = useState<string | undefined>(undefined);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [mapExpanded, setMapExpanded] = useState(false);
  const [jumpValue, setJumpValue] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detecting, setDetecting] = useState(true);
  const [viewMode, setViewMode] = useState<'family' | 'library'>('family');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeSession, setUpgradeSession] = useState<PageCreativeUpgradeSession | null>(null);
  const [forensicsRecomputing, setForensicsRecomputing] = useState(false);
  const [forensicsRecomputeError, setForensicsRecomputeError] = useState<string | null>(null);
  const [evidenceRecoveryRunning, setEvidenceRecoveryRunning] = useState(false);
  const [evidenceRecoveryError, setEvidenceRecoveryError] = useState<string | null>(null);
  const [twinSession, setTwinSession] = useState<ReconstructionTwinSession | null>(null);
  const [buildingTwin, setBuildingTwin] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [replaceAuthorityOpen, setReplaceAuthorityOpen] = useState(false);
  const [authorityHistoryOpen, setAuthorityHistoryOpen] = useState(false);
  const [authorityRefreshNonce, setAuthorityRefreshNonce] = useState(0);
  const [authorityNotice, setAuthorityNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    void bootstrapFounderDesignWorkspace(projectId);
  }, [projectId]);

  const rowInputs = useMemo(() => rows.map(toRowInput), [rows]);
  const progress = useMemo(() => buildProjectProgressSummary(rowInputs, projectId), [rowInputs, projectId]);

  const family = useMemo(() => {
    const built = buildPageFamilyFromRows({
      projectId,
      rows: rowInputs,
      activeParentRoute,
    });
    return applyApprovalToFamily(built);
  }, [projectId, rowInputs, activeParentRoute]);

  const readiness = useMemo(
    () => derivePageFamilyReadiness(family, captureService),
    [family, captureService],
  );
  const detection = useMemo(() => summarizeNavigationDetection(family.promises), [family.promises]);
  const workflowStep = getWorkflowStep(family.familyId);
  const workflowAction = resolveWorkflowAction(family);

  const rootNode = useMemo(() => family.nodes.find((n) => n.level === 0) ?? null, [family.nodes]);
  const rootTarget = useMemo(
    () => (rootNode ? buildPageFamilyRootTarget({ family, rows: rowInputs, rootNode }) : null),
    [family, rowInputs, rootNode],
  );
  const activeNode = family.nodes.find((n) => n.nodeId === selectedNodeId) ?? rootNode ?? family.nodes[0];
  const siblings = activeNode ? listSiblingNodes(family, activeNode.nodeId) : [];
  const siblingIndex = activeNode ? siblings.findIndex((s) => s.nodeId === activeNode.nodeId) : 0;
  const prevSibling = siblingIndex > 0 ? siblings[siblingIndex - 1] : null;
  const nextSibling = siblingIndex >= 0 && siblingIndex < siblings.length - 1 ? siblings[siblingIndex + 1] : null;
  const parentNode = rootNode;
  const isActiveRoot = Boolean(activeNode && activeNode.level === 0);
  const activeScreenId =
    activeNode?.screenId ??
    (isActiveRoot
      ? resolveRootScreenId(
          projectId,
          rootTarget?.screenId
            ? rows.find((r) => r.screenId === rootTarget.screenId)
            : undefined,
        )
      : null);
  const activeRoute = isActiveRoot && rootTarget ? rootTarget.canonicalRoute : activeNode?.route ?? '';
  const activePageId = activeRoute ? buildPageId(projectId, activeRoute) : '';
  const activeDisplayName = isActiveRoot && rootTarget ? rootTarget.canonicalName : activeNode?.label ?? 'PAGE';
  const viewportAuthority = activeScreenId
    ? resolvePageViewportAuthority({
        projectId,
        pageId: activePageId,
        screenId: activeScreenId,
        viewport,
        routeMapped: activeNode?.existing,
        isRoot: isActiveRoot,
      })
    : null;
  const viewportCapture = usePageViewportCapture(projectId, activePageId, viewport);
  const isCapturingActive = Boolean(activePageId && capturingPageId === activePageId);

  const closeUpgrade = useCallback(() => {
    setUpgradeOpen(false);
    setUpgradeSession(null);
    setTwinSession(null);
    setBuildingTwin(false);
    setUpgradeError(null);
  }, []);

  const refreshTwinSession = useCallback(
    (projectIdArg: string, pageIdArg: string) => {
      const active = getActiveTwinSessionForPage(projectIdArg, pageIdArg);
      setTwinSession(active);
      return active;
    },
    [],
  );

  useEffect(() => {
    if (!upgradeOpen || !activePageId) return;
    refreshTwinSession(projectId, activePageId);
  }, [upgradeOpen, activePageId, projectId, refreshTwinSession]);

  useEffect(() => {
    const saved = getSavedSelectedNode(family.familyId);
    const nextId = defaultSelectedNodeId(family, saved);
    setSelectedNodeId(nextId);
    setJumpValue(nextId);
  }, [family.familyId, family.nodes]);

  useEffect(() => {
    setDetecting(true);
    const t = window.setTimeout(() => setDetecting(false), 650);
    return () => window.clearTimeout(t);
  }, [activeParentRoute, projectId]);

  useEffect(() => {
    if (selectedNodeId) saveSelectedNode(family.familyId, selectedNodeId);
  }, [selectedNodeId, family.familyId]);

  const selectNode = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      setJumpValue(nodeId);
      const node = family.nodes.find((n) => n.nodeId === nodeId);
      const screenId =
        node?.screenId ?? (node?.level === 0 ? resolveRootScreenId(projectId, undefined) : null);
      if (screenId) onSelectScreen(screenId);
    },
    [family.nodes, onSelectScreen, projectId],
  );

  const handleJump = (nodeId: string) => {
    setJumpValue(nodeId);
    if (nodeId) selectNode(nodeId);
  };

  const advanceSibling = (dir: -1 | 1) => {
    if (!activeNode) return;
    const idx = siblings.findIndex((s) => s.nodeId === activeNode.nodeId);
    const next = siblings[idx + dir];
    if (next) selectNode(next.nodeId);
  };

  const handlePrimary = () => {
    if (workflowAction.primaryLabel === 'CONFIRM FAMILY') {
      confirmFamilyStructure(family.familyId);
      setWorkflowStep(family.familyId, 'REVIEW_CHILD');
      return;
    }
    if (workflowAction.primaryLabel === 'APPROVE FAMILY') {
      approveFamily(family.familyId);
      setWorkflowStep(family.familyId, 'REVIEW_CHILD');
      return;
    }
    if (workflowAction.primaryLabel === 'APPROVE DESIGN' && activeNode) {
      approveNodeDesign({ familyId: family.familyId, nodeId: activeNode.nodeId, route: activeRoute || activeNode.route });
      if (activeNode.level > 0 && nextSibling) selectNode(nextSibling.nodeId);
      else setWorkflowStep(family.familyId, 'VERIFY_WIRING');
      return;
    }
    if (workflowAction.primaryLabel === 'VERIFY WIRING') {
      setWorkflowStep(family.familyId, 'VERIFY_WIRING');
      setDetailsOpen(true);
    }
  };

  const authorityHistory =
    activePageId && activeScreenId
      ? listPageDesignAuthorityHistory(projectId, activePageId, viewport)
      : [];
  const currentAuthority =
    activePageId && activeScreenId
      ? resolveCurrentDesignAuthority({ projectId, pageId: activePageId, screenId: activeScreenId, viewport })
      : null;

  const detailsContent = activeNode ? (
    <>
      <dl className="site00-pfw-details">
        <div><dt>ROUTE</dt><dd>{activeNode.route}</dd></div>
        <div><dt>SURFACE ID</dt><dd>{activeNode.surfaceId}</dd></div>
        <div><dt>ARCHETYPE</dt><dd>{activeNode.archetype}</dd></div>
        <div><dt>INHERITANCE</dt><dd>{activeNode.inheritanceMode ?? '—'}</dd></div>
        <div><dt>DESIGN</dt><dd>{activeNode.designStatus}</dd></div>
        <div><dt>LINKAGE</dt><dd>{activeNode.linkageStatus}</dd></div>
        <div><dt>CAPTURE</dt><dd>{activeNode.captureStatus}</dd></div>
      </dl>
      {viewportCapture?.artifactProof ? (
        <section className="site00-pfw-details__capture-proof">
          <h4>CAPTURE ARTIFACT PROOF</h4>
          <dl>
            <div><dt>REQUESTED ROUTE</dt><dd>{viewportCapture.artifactProof.route}</dd></div>
            <div><dt>FINAL URL</dt><dd>{viewportCapture.artifactProof.navigation?.finalUrl ?? '—'}</dd></div>
            <div><dt>VIEWPORT</dt><dd>{viewportCapture.artifactProof.viewport.toUpperCase()}</dd></div>
            <div><dt>BYTE SIZE</dt><dd>{viewportCapture.artifactProof.byteSize ?? '—'}</dd></div>
            <div><dt>STORAGE REF</dt><dd>{viewportCapture.artifactProof.storageRef ?? '—'}</dd></div>
            <div><dt>STATUS</dt><dd>{viewportCapture.artifactProof.status}</dd></div>
          </dl>
        </section>
      ) : null}
      {currentAuthority?.authorityVersion ? (
        <section className="site00-pfw-details__authority">
          <h4>DESIGN AUTHORITY</h4>
          <dl>
            <div><dt>VERSION</dt><dd>{currentAuthority.authorityVersion.authorityVersionId}</dd></div>
            <div><dt>SOURCE</dt><dd>{currentAuthority.authorityVersion.source}</dd></div>
            <div><dt>ASSET REF</dt><dd>{currentAuthority.previewAssetRef ?? '—'}</dd></div>
          </dl>
        </section>
      ) : null}
      {authorityHistory.length > 0 ? (
        <section className="site00-pfw-details__authority-history">
          <h4>AUTHORITY HISTORY</h4>
          <ul>
            {authorityHistory.map((v) => (
              <li key={v.authorityVersionId}>
                {v.status} · {v.source} · {v.approvedAt ?? v.createdAt}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  ) : null;

  const projectClass = projectId.toLowerCase() === 'ndxbook' ? 'is-ndxbook' : '';

  return (
    <section
      className={`site00-pfw site00-dw-wizard-host ${projectClass}`}
      data-design-tab="pages"
      data-pfw-mode={viewMode}
    >
      <header className="site00-pfw__mode-toggle">
        <button type="button" className={viewMode === 'family' ? 'is-active' : ''} onClick={() => setViewMode('family')}>
          FAMILY
        </button>
        <button
          type="button"
          className={viewMode === 'library' ? 'is-active' : ''}
          onClick={() => {
            setViewMode('library');
            onOpenLibrary?.();
          }}
        >
          ALL PAGES
        </button>
        <button type="button" className="site00-pfw__details-link" onClick={() => setDetailsOpen(true)}>
          DETAILS
        </button>
      </header>

      <ProjectProgressBar summary={progress} />

      {captureService ? (
        <CaptureServiceStatusChip captureService={captureService} onFix={onOpenCaptureService} />
      ) : null}

      <FamilyReadinessDimensions readiness={readiness} />

      {pageCompletionPct != null ? (
        <p className="site00-pfw__completion">
          PAGE COMPLETION · {pageCompletionPct}%
          {pageCompletionAttention ? ` · ${pageCompletionAttention} ITEM${pageCompletionAttention === 1 ? '' : 'S'} NEED ATTENTION` : ''}
        </p>
      ) : null}

      <section className="site00-pfw-workspace">
        <header className="site00-pfw-workspace__head">
          <h2>PAGE FAMILY WORKSPACE</h2>
          <PageFamilySelector
            family={family}
            selectedNodeId={selectedNodeId}
            onSelect={selectNode}
            jumpValue={jumpValue}
            onJumpChange={handleJump}
          />
        </header>

        {detecting ? (
          <p className="site00-pfw-workspace__detecting">DETECTING PAGE CONNECTIONS…</p>
        ) : (
          <p className="site00-pfw-workspace__detected">
            {detection.headline} · {detection.existing} EXISTING · {detection.proposed} PROPOSED
            {detection.broken ? ` · ${detection.broken} NEED REVIEW` : ''}
          </p>
        )}

        <div className="site00-pfw-workspace__parent">
          <div className="site00-pfw-workspace__preview">
            {(() => {
              const authPreview = resolveDesignAuthorityPreview({
                referencePath: viewportAuthority?.previewUrl ?? null,
                authorityStatus: viewportAuthority?.authorityStatus ?? 'MISSING',
              });
              if (authPreview.previewUrl) {
                return <img src={authPreview.previewUrl} alt="Design authority" />;
              }
              return (
                <div className="site00-pfw-workspace__preview-empty">
                  <span aria-hidden>▢</span>
                  <small>{authPreview.label}</small>
                </div>
              );
            })()}
          </div>
          <div className="site00-pfw-workspace__parent-meta">
            <strong>{(rootTarget?.canonicalName ?? family.familyName).toUpperCase()}</strong>
            <span className="site00-pfw-workspace__route">{rootTarget?.canonicalRoute ?? parentNode?.route}</span>
            <span className="site00-pfw-workspace__badge">{isActiveRoot ? 'ROOT PAGE' : 'FAMILY ROOT'}</span>
            <span className={`site00-pfw-workspace__status is-${parentNode?.statusVisual ?? 'neutral'}`}>
              {viewportAuthority ? authorityStatusLabel(viewportAuthority.authorityStatus) : parentNode?.statusLabel ?? 'MAPPED'}
            </span>
            <label>
              PAGE FAMILY
              <select
                value={family.familyName}
                onChange={() => undefined}
                aria-label="Page family"
              >
                <option>{family.familyName}</option>
              </select>
            </label>
            <p className="site00-pfw-workspace__family-summary">
              FAMILY · {family.nodeCount} PAGES · {readiness.approvedCount != null ? `${readiness.approvedCount} APPROVED` : '— APPROVED'} · {readiness.summaryLabel}
            </p>
          </div>
        </div>
      </section>

      {activeNode && activePageId && activeScreenId ? (
        <PageCaptureNowPanel
          key={activePageId}
          projectId={projectId}
          pageId={activePageId}
          screenId={activeScreenId}
          route={activeRoute}
          displayName={activeDisplayName}
          viewport={viewport}
          isRoot={isActiveRoot}
          routeMapped={activeNode.existing}
          captureService={captureService}
          capturing={isCapturingActive}
          captureProgress={captureNowProgress}
          screenshotUrl={viewportCapture?.imageRef ?? null}
          captureError={captureNowError ?? null}
          onCaptureNow={() => onCaptureNow?.(activeScreenId, viewport)}
          onUpgradePage={() => {
            setUpgradeError(null);
            const boundCapture =
              resolveCurrentPageViewportCapture(projectId, activePageId, viewport) ?? viewportCapture;
            const captureId = boundCapture?.captureId;
            if (!captureId) {
              setUpgradeError('CAPTURE ID MISSING — TAP RECAPTURE, THEN TRY UPGRADE AGAIN.');
              return;
            }
            const auth = resolveCurrentDesignAuthority({
              projectId,
              pageId: activePageId,
              screenId: activeScreenId,
              viewport,
            });
            const dims = CANONICAL_VIEWPORT_DIMENSIONS[viewport];
            const shellSpec = resolveMobileVisualShellSpec(activeScreenId);
            const domMeasurements = collectDomRegionMeasurements();
            const cssSnapshot = collectCssSnapshotFromMobileShell();
            const session = openPageCreativeUpgradeSession({
              projectId,
              pageId: activePageId,
              viewport,
              captureId,
              parentAuthorityId: isActiveRoot ? null : parentNode?.nodeId ?? null,
              childArchetype: activeNode.archetype,
              pagePurpose: activeDisplayName,
              parentAuthorityLabel: parentNode?.route ?? 'Parent landing',
              route: activeRoute,
              isChildPage: !isActiveRoot && activeNode.level > 0,
              isRoot: isActiveRoot,
              designAuthorityVersionId: auth.authorityVersion?.authorityVersionId ?? null,
              designAuthorityAssetRef: auth.previewAssetRef,
              captureAssetRef: boundCapture?.imageRef ?? null,
              captureWidth: boundCapture?.width ?? dims.width,
              captureHeight: boundCapture?.height ?? dims.height,
              authorityWidth: dims.width,
              authorityHeight: dims.height,
              domMeasurements,
              cssSnapshot,
              screenId: activeScreenId,
              visualShellSpec: shellSpec
                ? {
                    headerHeightPx: shellSpec.headerBounds.heightPx,
                    headerPaddingX: shellSpec.headerPaddingX,
                    contentPaddingX: shellSpec.contentPaddingX,
                    sectionGap: shellSpec.sectionGap,
                    bottomNavHeightPx: shellSpec.bottomNavBounds.heightPx,
                    viewportWidth: shellSpec.viewport.width,
                    viewportHeight: shellSpec.viewport.height,
                  }
                : null,
            });
            setUpgradeSession(session);
            setUpgradeOpen(true);
          }}
          upgradeError={upgradeError}
          onViewDetails={() => setDetailsOpen(true)}
          onReplaceAuthority={() => setReplaceAuthorityOpen(true)}
          onViewAuthorityHistory={() => setAuthorityHistoryOpen(true)}
          onRetryTransport={onRetryTransport}
          captureServiceChecking={captureServiceChecking}
          authorityRefreshNonce={authorityRefreshNonce}
          authorityNotice={authorityNotice}
        />
      ) : null}

      <PageFamilyMap
        family={family}
        selectedNodeId={selectedNodeId}
        onSelectNode={selectNode}
        expanded={mapExpanded}
        onToggleExpand={() => setMapExpanded((v) => !v)}
      />

      {activeNode && activeNode.level > 0 ? (
        <DerivativeReviewCarousel
          active={activeNode}
          prev={prevSibling}
          next={nextSibling}
          index={Math.max(0, siblingIndex)}
          total={Math.max(1, siblings.length)}
          liveCaptureUnavailable={readiness.captureStatus === 'UNAVAILABLE'}
          onPrev={() => advanceSibling(-1)}
          onNext={() => advanceSibling(1)}
          onEnterSubfamily={
            activeNode.childCount > 0
              ? () => {
                  setActiveParentRoute(activeNode.route);
                  selectNode(activeNode.nodeId);
                }
              : undefined
          }
        />
      ) : null}

      <ReconstructionWorkflowRail
        currentStep={workflowStep}
        action={workflowAction}
        onPrimary={handlePrimary}
        onSecondary={() => {
          if (workflowAction.secondaryLabel === 'NEXT CHILD') advanceSibling(1);
          else if (workflowAction.secondaryLabel === 'EDIT STRUCTURE') setDetailsOpen(true);
        }}
        reviewLabel={
          activeNode
            ? activeNode.level > 0
              ? `${resolveReviewStepLabel(activeNode)} · ${Math.max(1, siblingIndex + 1)} OF ${Math.max(1, siblings.length)}`
              : resolveReviewStepLabel(activeNode)
            : undefined
        }
      />

      <div className="site00-pfw__secondary-actions">
        {onOpenCaptureService ? (
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onOpenCaptureService}>
            ADVANCED CAPTURE
          </button>
        ) : null}
        {activeScreenId && onOpenPage ? (
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
            onClick={() => onOpenPage(activeScreenId)}
          >
            OPEN SELECTED PAGE
          </button>
        ) : null}
        {activeParentRoute ? (
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={() => setActiveParentRoute(undefined)}>
            BACK TO ROOT FAMILY
          </button>
        ) : null}
      </div>

      {upgradeOpen && upgradeSession ? (
        <PageCreativeUpgradePanel
          open={upgradeOpen}
          session={upgradeSession}
          pageLabel={activeDisplayName}
          route={activeRoute}
          currentScreenshot={upgradeSession.captureAssetRef ?? viewportCapture?.imageRef ?? null}
          authorityScreenshot={upgradeSession.designAuthorityAssetRef ?? null}
          visualDiagnosis={upgradeSession.visualDiagnosis}
          reconstructionPlan={upgradeSession.reconstructionPlan}
          twinSession={twinSession}
          buildingTwin={buildingTwin}
          upgradeError={upgradeError}
          onApprove={() => {
            approvePageCreativeDirection(projectId, activePageId, viewport);
            const updated = getPageCreativeUpgradeSession(projectId, activePageId, viewport);
            if (updated) setUpgradeSession(updated);
            refreshTwinSession(projectId, activePageId);
          }}
          onReplicatePage={async () => {
            if (upgradeSession?.status === 'DIRECTION_READY') {
              approvePageCreativeDirection(projectId, activePageId, viewport);
              const updated = getPageCreativeUpgradeSession(projectId, activePageId, viewport);
              if (updated) setUpgradeSession(updated);
            }
            const active = refreshTwinSession(projectId, activePageId);
            if (!active) {
              setUpgradeError('TWIN SESSION NOT READY — CLOSE AND REOPEN UPGRADE, THEN RETRY.');
              return;
            }
            setTwinSession(active);
            setBuildingTwin(true);
            setUpgradeError(null);
            const result = await startTwinBuild(active.sessionId, {
              authorityVersionId: upgradeSession?.designAuthorityVersionId ?? null,
              captureId: upgradeSession?.captureId ?? null,
              reconstructionPlanId: upgradeSession?.reconstructionPlan?.planId ?? null,
            });
            setBuildingTwin(false);
            if (result.error) setUpgradeError(result.error.message);
            if (result.session) setTwinSession(result.session);
          }}
          onBuildTwin={async () => {
            const active = refreshTwinSession(projectId, activePageId) ?? twinSession;
            if (!active || !upgradeSession) return;
            setBuildingTwin(true);
            setUpgradeError(null);
            const result = await startTwinBuild(active.sessionId, {
              authorityVersionId: upgradeSession.designAuthorityVersionId ?? null,
              captureId: upgradeSession.captureId ?? null,
              reconstructionPlanId: upgradeSession.reconstructionPlan?.planId ?? null,
            });
            setBuildingTwin(false);
            if (result.error) setUpgradeError(result.error.message);
            if (result.session) setTwinSession(result.session);
          }}
          onPreviewTwin={() => {
            const active = twinSession ?? refreshTwinSession(projectId, activePageId);
            if (!active?.twinRoute) return;
            stashTwinSessionForPreview(active);
            const mobile =
              typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
            if (mobile) {
              window.location.assign(active.twinRoute);
              return;
            }
            const opened = window.open(active.twinRoute, '_blank', 'noopener,noreferrer');
            if (!opened) window.location.assign(active.twinRoute);
          }}
          onRefineTwin={async (instruction) => {
            const active = twinSession ?? refreshTwinSession(projectId, activePageId);
            if (!active) return;
            const rev = addTwinRevision(active.sessionId, instruction);
            if (rev) {
              const revised = await applyTwinRevision(active.sessionId, rev.revisionId);
              if (revised) setTwinSession(revised);
            }
          }}
          onApprovePromotion={() => {
            const active = twinSession ?? refreshTwinSession(projectId, activePageId);
            if (!active) return;
            const approved = approveTwinForPromotion(active.sessionId);
            if (approved) setTwinSession(approved);
          }}
          onPromote={() => {
            const active = twinSession ?? refreshTwinSession(projectId, activePageId);
            if (!active) return;
            const receipt = promoteTwinToLivePage(active.sessionId);
            if (receipt?.status === 'COMPLETE') {
              markPageCreativeUpgradeStatus(projectId, activePageId, viewport, 'COMPLETE');
              const updated = getTwinSession(active.sessionId);
              if (updated) setTwinSession(updated);
              const sess = getPageCreativeUpgradeSession(projectId, activePageId, viewport);
              if (sess) setUpgradeSession(sess);
            }
          }}
          onRevise={closeUpgrade}
          onBack={closeUpgrade}
          onVerify={() => {
            onCaptureNow?.(activeNode!.screenId!, viewport);
            const boundCapture =
              resolveCurrentPageViewportCapture(projectId, activePageId, viewport) ?? viewportCapture;
            if (boundCapture?.captureId) {
              const updated = attachAfterCaptureToSession(
                projectId,
                activePageId,
                viewport,
                boundCapture.captureId,
              );
              if (updated) setUpgradeSession(updated);
            }
          }}
          afterScreenshot={upgradeSession.afterCaptureId ? viewportCapture?.imageRef ?? null : null}
          forensicsRecomputing={forensicsRecomputing}
          forensicsRecomputeError={forensicsRecomputeError}
          onRecomputeForensics={() => {
            if (!activeScreenId || forensicsRecomputing) return;
            setForensicsRecomputeError(null);
            setForensicsRecomputing(true);
            window.setTimeout(() => {
              try {
                const boundCapture =
                  resolveCurrentPageViewportCapture(projectId, activePageId, viewport) ?? viewportCapture;
                const captureId = boundCapture?.captureId ?? upgradeSession.captureId;
                const auth = resolveCurrentDesignAuthority({
                  projectId,
                  pageId: activePageId,
                  screenId: activeScreenId,
                  viewport,
                });
                const dims = CANONICAL_VIEWPORT_DIMENSIONS[viewport];
                const shellSpec = resolveMobileVisualShellSpec(activeScreenId);
                const updated = recalculatePageCreativeUpgradeForensics(projectId, activePageId, viewport, {
                  pageId: activePageId,
                  viewport,
                  pageArchetype: isActiveRoot
                    ? 'ndxbook-overview-mobile'
                    : (activeNode?.archetype ?? 'generic-mobile-page'),
                  screenId: activeScreenId,
                  route: activeRoute,
                  pagePurpose: activeDisplayName,
                  isRootPage: isActiveRoot,
                  currentCapture: {
                    captureId,
                    width: boundCapture?.width ?? dims.width,
                    height: boundCapture?.height ?? dims.height,
                    imageRef: boundCapture?.imageRef ?? upgradeSession.captureAssetRef,
                    domMeasurements: collectDomRegionMeasurements(),
                    cssSnapshot: collectCssSnapshotFromMobileShell(),
                  },
                  designAuthority: {
                    authorityVersionId:
                      auth.authorityVersion?.authorityVersionId ?? upgradeSession.designAuthorityVersionId ?? null,
                    width: dims.width,
                    height: dims.height,
                    assetRef: auth.previewAssetRef ?? upgradeSession.designAuthorityAssetRef ?? null,
                    referenceType: 'VIEWPORT_SCREENSHOT',
                    visualShellSpec: shellSpec
                      ? {
                          headerHeightPx: shellSpec.headerBounds.heightPx,
                          headerPaddingX: shellSpec.headerPaddingX,
                          contentPaddingX: shellSpec.contentPaddingX,
                          sectionGap: shellSpec.sectionGap,
                          bottomNavHeightPx: shellSpec.bottomNavBounds.heightPx,
                          viewportWidth: shellSpec.viewport.width,
                          viewportHeight: shellSpec.viewport.height,
                        }
                      : null,
                  },
                });
                if (updated) {
                  setUpgradeSession({ ...updated });
                } else {
                  setForensicsRecomputeError('FORENSICS RECALCULATION FAILED — reopen PAGE UPGRADE.');
                }
              } catch {
                setForensicsRecomputeError('FORENSICS RECALCULATION FAILED — try again.');
              } finally {
                setForensicsRecomputing(false);
              }
            }, 0);
          }}
          evidenceRecoveryRunning={evidenceRecoveryRunning}
          evidenceRecoveryError={evidenceRecoveryError}
          onAnalyzeMissingEvidence={() => {
            if (!activeScreenId || evidenceRecoveryRunning) return;
            setEvidenceRecoveryError(null);
            setEvidenceRecoveryRunning(true);
            window.setTimeout(() => {
              try {
                const boundCapture =
                  resolveCurrentPageViewportCapture(projectId, activePageId, viewport) ?? viewportCapture;
                const captureId = boundCapture?.captureId ?? upgradeSession.captureId;
                const auth = resolveCurrentDesignAuthority({
                  projectId,
                  pageId: activePageId,
                  screenId: activeScreenId,
                  viewport,
                });
                const dims = CANONICAL_VIEWPORT_DIMENSIONS[viewport];
                const shellSpec = resolveMobileVisualShellSpec(activeScreenId);
                const updated = analyzeMissingPageCreativeUpgradeEvidence(projectId, activePageId, viewport, {
                  pageId: activePageId,
                  viewport,
                  pageArchetype: isActiveRoot
                    ? 'ndxbook-overview-mobile'
                    : (activeNode?.archetype ?? 'generic-mobile-page'),
                  screenId: activeScreenId,
                  route: activeRoute,
                  pagePurpose: activeDisplayName,
                  isRootPage: isActiveRoot,
                  currentCapture: {
                    captureId,
                    width: boundCapture?.width ?? dims.width,
                    height: boundCapture?.height ?? dims.height,
                    imageRef: boundCapture?.imageRef ?? upgradeSession.captureAssetRef,
                    domMeasurements: collectDomRegionMeasurements(),
                    cssSnapshot: collectCssSnapshotFromMobileShell(),
                  },
                  designAuthority: {
                    authorityVersionId:
                      auth.authorityVersion?.authorityVersionId ?? upgradeSession.designAuthorityVersionId ?? null,
                    width: dims.width,
                    height: dims.height,
                    assetRef: auth.previewAssetRef ?? upgradeSession.designAuthorityAssetRef ?? null,
                    referenceType: 'VIEWPORT_SCREENSHOT',
                    visualShellSpec: shellSpec
                      ? {
                          headerHeightPx: shellSpec.headerBounds.heightPx,
                          headerPaddingX: shellSpec.headerPaddingX,
                          contentPaddingX: shellSpec.contentPaddingX,
                          sectionGap: shellSpec.sectionGap,
                          bottomNavHeightPx: shellSpec.bottomNavBounds.heightPx,
                          viewportWidth: shellSpec.viewport.width,
                          viewportHeight: shellSpec.viewport.height,
                        }
                      : null,
                  },
                });
                if (updated) setUpgradeSession({ ...updated });
                else setEvidenceRecoveryError('EVIDENCE RECOVERY FAILED — reopen PAGE UPGRADE.');
              } catch {
                setEvidenceRecoveryError('EVIDENCE RECOVERY FAILED — try again.');
              } finally {
                setEvidenceRecoveryRunning(false);
              }
            }, 0);
          }}
          onAnalyzeRegionStructure={(regionId) => {
            if (!activeScreenId || evidenceRecoveryRunning) return;
            setEvidenceRecoveryError(null);
            setEvidenceRecoveryRunning(true);
            window.setTimeout(() => {
              try {
                const boundCapture =
                  resolveCurrentPageViewportCapture(projectId, activePageId, viewport) ?? viewportCapture;
                const captureId = boundCapture?.captureId ?? upgradeSession.captureId;
                const auth = resolveCurrentDesignAuthority({
                  projectId,
                  pageId: activePageId,
                  screenId: activeScreenId,
                  viewport,
                });
                const dims = CANONICAL_VIEWPORT_DIMENSIONS[viewport];
                const shellSpec = resolveMobileVisualShellSpec(activeScreenId);
                const updated = analyzeSingleRegionStructureForUpgrade(projectId, activePageId, viewport, regionId, {
                  pageId: activePageId,
                  viewport,
                  pageArchetype: isActiveRoot
                    ? 'ndxbook-overview-mobile'
                    : (activeNode?.archetype ?? 'generic-mobile-page'),
                  screenId: activeScreenId,
                  route: activeRoute,
                  pagePurpose: activeDisplayName,
                  isRootPage: isActiveRoot,
                  currentCapture: {
                    captureId,
                    width: boundCapture?.width ?? dims.width,
                    height: boundCapture?.height ?? dims.height,
                    imageRef: boundCapture?.imageRef ?? upgradeSession.captureAssetRef,
                    domMeasurements: collectDomRegionMeasurements(),
                    cssSnapshot: collectCssSnapshotFromMobileShell(),
                  },
                  designAuthority: {
                    authorityVersionId:
                      auth.authorityVersion?.authorityVersionId ?? upgradeSession.designAuthorityVersionId ?? null,
                    width: dims.width,
                    height: dims.height,
                    assetRef: auth.previewAssetRef ?? upgradeSession.designAuthorityAssetRef ?? null,
                    referenceType: 'VIEWPORT_SCREENSHOT',
                    visualShellSpec: shellSpec
                      ? {
                          headerHeightPx: shellSpec.headerBounds.heightPx,
                          headerPaddingX: shellSpec.headerPaddingX,
                          contentPaddingX: shellSpec.contentPaddingX,
                          sectionGap: shellSpec.sectionGap,
                          bottomNavHeightPx: shellSpec.bottomNavBounds.heightPx,
                          viewportWidth: shellSpec.viewport.width,
                          viewportHeight: shellSpec.viewport.height,
                        }
                      : null,
                  },
                });
                if (updated) setUpgradeSession({ ...updated });
                else setEvidenceRecoveryError('STRUCTURE ANALYSIS FAILED — reopen PAGE UPGRADE.');
              } catch {
                setEvidenceRecoveryError('STRUCTURE ANALYSIS FAILED — try again.');
              } finally {
                setEvidenceRecoveryRunning(false);
              }
            }, 0);
          }}
        />
      ) : null}

      {activePageId && activeScreenId ? (
        <>
          <ReplaceDesignAuthorityDialog
            open={replaceAuthorityOpen}
            projectId={projectId}
            pageId={activePageId}
            screenId={activeScreenId}
            route={activeRoute}
            displayName={activeDisplayName}
            viewport={viewport}
            currentAssetRef={viewportAuthority?.previewAssetRef ?? null}
            onClose={() => setReplaceAuthorityOpen(false)}
            onReplaced={(notice) => {
              setAuthorityRefreshNonce((n) => n + 1);
              setAuthorityNotice(notice ?? null);
            }}
          />
          <DesignAuthorityHistoryDialog
            open={authorityHistoryOpen}
            projectId={projectId}
            pageId={activePageId}
            viewport={viewport}
            onClose={() => setAuthorityHistoryOpen(false)}
          />
        </>
      ) : null}

      <DesignDetailsDrawer open={detailsOpen} title="PAGE FAMILY DETAILS" onClose={() => setDetailsOpen(false)}>
        {detailsContent}
        <section className="site00-pfw-details__promises">
          <p className="site00-pfw-details__source">STRUCTURE SOURCE · REGISTRY</p>
          <h4>NAVIGATION PROMISES</h4>
          <ul>
            {family.promises.map((p) => (
              <li key={p.promiseId}>
                {p.sourceLabel} → {p.expectedChildLabel} · {p.status}
              </li>
            ))}
          </ul>
        </section>
      </DesignDetailsDrawer>
    </section>
  );
}
