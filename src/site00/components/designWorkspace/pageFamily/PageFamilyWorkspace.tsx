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
  buildProjectProgressSummary,
  derivePageFamilyReadiness,
} from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyReadiness.js';
import { summarizeNavigationDetection } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/parentNavigationIntentResolver.js';
import { resolveWorkflowAction } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyWorkflow.js';
import type { PageFamilyRowInput } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/types.js';

export type PageFamilyWorkspaceProps = {
  projectId: string;
  projectName?: string;
  rows: PageVisualIndexRow[];
  onOpenPage?: (screenId: string) => void;
  onSelectScreen: (screenId: string) => void;
  onOpenLibrary?: () => void;
  onStartCapture?: () => void;
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
  projectName = 'PROJECT',
  rows,
  onOpenPage,
  onSelectScreen,
  onOpenLibrary,
  onStartCapture,
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

  const rowInputs = useMemo(() => rows.map(toRowInput), [rows]);
  const progress = useMemo(() => buildProjectProgressSummary(rowInputs), [rowInputs]);

  const family = useMemo(() => {
    const built = buildPageFamilyFromRows({
      projectId,
      rows: rowInputs,
      activeParentRoute,
    });
    return applyApprovalToFamily(built);
  }, [projectId, rowInputs, activeParentRoute]);

  const readiness = useMemo(() => derivePageFamilyReadiness(family), [family]);
  const detection = useMemo(() => summarizeNavigationDetection(family.promises), [family.promises]);
  const workflowStep = getWorkflowStep(family.familyId);
  const workflowAction = resolveWorkflowAction(family);

  const derivatives = useMemo(() => family.nodes.filter((n) => n.level > 0), [family.nodes]);
  const activeNode = family.nodes.find((n) => n.nodeId === selectedNodeId) ?? derivatives[0] ?? family.nodes[0];
  const siblings = activeNode ? listSiblingNodes(family, activeNode.nodeId) : [];
  const siblingIndex = activeNode ? siblings.findIndex((s) => s.nodeId === activeNode.nodeId) : 0;
  const prevSibling = siblingIndex > 0 ? siblings[siblingIndex - 1] : null;
  const nextSibling = siblingIndex >= 0 && siblingIndex < siblings.length - 1 ? siblings[siblingIndex + 1] : null;
  const parentNode = family.nodes.find((n) => n.level === 0);

  useEffect(() => {
    const saved = getSavedSelectedNode(family.familyId);
    if (saved && family.nodes.some((n) => n.nodeId === saved)) {
      setSelectedNodeId(saved);
    } else if (derivatives[0]) {
      setSelectedNodeId(derivatives[0].nodeId);
    }
  }, [family.familyId, derivatives]);

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
      const node = family.nodes.find((n) => n.nodeId === nodeId);
      if (node?.screenId) onSelectScreen(node.screenId);
    },
    [family.nodes, onSelectScreen],
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
    if (workflowAction.primaryLabel === 'APPROVE DESIGN' && activeNode && activeNode.level > 0) {
      approveNodeDesign({ familyId: family.familyId, nodeId: activeNode.nodeId, route: activeNode.route });
      if (nextSibling) selectNode(nextSibling.nodeId);
      else setWorkflowStep(family.familyId, 'VERIFY_WIRING');
      return;
    }
    if (workflowAction.primaryLabel === 'VERIFY WIRING') {
      setWorkflowStep(family.familyId, 'VERIFY_WIRING');
      setDetailsOpen(true);
    }
  };

  const detailsContent = activeNode ? (
    <dl className="site00-pfw-details">
      <div><dt>ROUTE</dt><dd>{activeNode.route}</dd></div>
      <div><dt>SURFACE ID</dt><dd>{activeNode.surfaceId}</dd></div>
      <div><dt>ARCHETYPE</dt><dd>{activeNode.archetype}</dd></div>
      <div><dt>INHERITANCE</dt><dd>{activeNode.inheritanceMode ?? '—'}</dd></div>
      <div><dt>DESIGN</dt><dd>{activeNode.designStatus}</dd></div>
      <div><dt>LINKAGE</dt><dd>{activeNode.linkageStatus}</dd></div>
      <div><dt>CAPTURE</dt><dd>{activeNode.captureStatus}</dd></div>
    </dl>
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
            {parentNode?.previewUrl ? (
              <img src={parentNode.previewUrl} alt="" />
            ) : parentNode?.referenceUrl ? (
              <img src={parentNode.referenceUrl} alt="" />
            ) : (
              <div className="site00-pfw-workspace__preview-empty">
                <span aria-hidden>▢</span>
                <small>NO PREVIEW YET</small>
              </div>
            )}
          </div>
          <div className="site00-pfw-workspace__parent-meta">
            <strong>{parentNode?.route.toUpperCase() ?? `/PROJECTS/${projectName.toUpperCase()}`}</strong>
            <span className="site00-pfw-workspace__badge">PARENT AUTHORITY</span>
            <span className={`site00-pfw-workspace__status is-${parentNode?.statusVisual ?? 'neutral'}`}>
              {parentNode?.statusLabel ?? 'MAPPED'}
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
              FAMILY · {family.nodeCount} PAGES · {readiness.approvedCount} APPROVED · {readiness.summaryLabel}
            </p>
          </div>
        </div>
      </section>

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
          activeNode && activeNode.level > 0
            ? `REVIEW CHILD · ${Math.max(1, siblingIndex + 1)} OF ${Math.max(1, siblings.length)}`
            : undefined
        }
      />

      <div className="site00-pfw__secondary-actions">
        {onStartCapture ? (
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onStartCapture}>
            REFRESH CAPTURES
          </button>
        ) : null}
        {activeNode?.screenId && onOpenPage ? (
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
            onClick={() => onOpenPage(activeNode.screenId!)}
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

      <DesignDetailsDrawer open={detailsOpen} title="PAGE FAMILY DETAILS" onClose={() => setDetailsOpen(false)}>
        {detailsContent}
        <section className="site00-pfw-details__promises">
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
