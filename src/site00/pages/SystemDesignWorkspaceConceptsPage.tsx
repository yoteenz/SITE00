/**
 * P0.VR.DESIGN-WORKSPACE-SELF-CONCEPT1 — isolated WORKSPACE_SELF review (no production mutation).
 */

import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { resolveWorkspaceSelfDesignRoute } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/sourceContext.js';
import { latestCaptureForViewport } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/workflow.js';
import { SITE00_ROUTES } from '../config/routes';
import { useWorkspaceSelfConcept } from '../hooks/useWorkspaceSelfConcept';
import { resolveCaptureArtifactDisplayUrl } from '../services/workspaceSelfArtifactStorage';
import { WorkspaceSelfAuthorityPairPanel } from '../components/workspaceSelf/WorkspaceSelfAuthorityPairPanel';
import { WorkspaceSelfCompareConcepts } from '../components/workspaceSelf/WorkspaceSelfCompareConcepts';
import { WorkspaceSelfConceptGallery } from '../components/workspaceSelf/WorkspaceSelfConceptGallery';
import { WorkspaceSelfFullscreenReview } from '../components/workspaceSelf/WorkspaceSelfFullscreenReview';
import { WorkspaceSelfInspectPanel } from '../components/workspaceSelf/WorkspaceSelfInspectPanel';
import { WorkspaceSelfPairReviewPanel } from '../components/workspaceSelf/WorkspaceSelfPairReviewPanel';
import '../styles/site00-workspace-self-concept.css';

function CapturePreview({ capture }: { capture: ReturnType<typeof latestCaptureForViewport> }) {
  const [fullscreen, setFullscreen] = useState(false);
  const src = resolveCaptureArtifactDisplayUrl(capture?.artifactPath ?? null);
  if (!capture) {
    return <p className="site00-wssc__muted">No capture yet — run RECAPTURE CURRENT WORKSPACE.</p>;
  }
  return (
    <>
      <p className="site00-wssc__muted">
        {capture.captureId} · {capture.timestamp} · build {capture.build}
      </p>
      <p>{capture.route}</p>
      {src ?
        <>
          <img className="site00-wssc__capture" src={src} alt={`${capture.viewport} workspace capture`} />
          <div className="site00-wssc__actions">
            <button type="button" onClick={() => setFullscreen(true)}>
              FULLSCREEN
            </button>
          </div>
        </>
      : <p className="site00-wssc__muted">Artifact missing locally — recapture.</p>}
      {fullscreen && src ?
        <div className="site00-wssc__fullscreen" role="dialog">
          <button type="button" className="site00-wssc__fullscreenClose" onClick={() => setFullscreen(false)}>
            CLOSE
          </button>
          <img src={src} alt="" />
        </div>
      : null}
    </>
  );
}

export function SystemDesignWorkspaceConceptsPage() {
  const ws = useWorkspaceSelfConcept();
  const [captureError, setCaptureError] = useState<string | null>(null);

  const { open, isFounder, recaptureCurrentWorkspace, capturing } = ws;
  useEffect(() => {
    if (isFounder) open();
  }, [isFounder, open]);

  if (!isFounder) {
    return <Navigate to={SITE00_ROUTES.control} replace />;
  }

  const mobileCapture = latestCaptureForViewport(ws.state, 'MOBILE');
  const desktopCapture = latestCaptureForViewport(ws.state, 'DESKTOP');
  const sourceRoute = resolveWorkspaceSelfDesignRoute(ws.state.sourceContext);

  const review = ws.review;
  const activeConceptId = review.activeConceptId;
  const activeViewport = review.activeViewport;
  const inspectedId = review.inspectedConceptId;
  const canPromoteMobile = Boolean(ws.state.preferredMobileConceptId);
  const canPromoteDesktop = Boolean(ws.state.preferredDesktopConceptId);
  const canPromoteActiveViewport =
    activeViewport === 'MOBILE' ?
      canPromoteMobile && ws.state.preferredMobileConceptId === activeConceptId
    : canPromoteDesktop && ws.state.preferredDesktopConceptId === activeConceptId;
  const canPairReview = Boolean(ws.state.promotedMobileConceptId && ws.state.promotedDesktopConceptId);
  const canCompletePair = Boolean(ws.state.pairReviewOpenedAt && !ws.state.pairReviewCompletedAt);
  const canLock = Boolean(ws.state.pairReviewCompletedAt && !ws.state.authorityPair);
  const canOpusShell = Boolean(ws.state.authorityPair && !ws.state.opusShellPackage);
  const canMarkOpusCreated = ws.state.opusShellPackage?.status === 'REQUESTED';
  const canApproveOpus = ws.state.opusShellPackage?.status === 'STAGED';
  const canComposer = ws.state.opusShellPackage?.status === 'APPROVED' && !ws.state.composerHandoff;
  const nbpReady = ws.nbpReadiness === 'READY_FOR_NBP';
  const canGenerateConcepts = nbpReady && !ws.generating;

  return (
    <div className="site00-wssc" data-testid="workspace-self-concept-page">
      <div className="site00-wssc__banner">
        <strong>WORKSPACE_SELF — {ws.target.displayName}</strong>
        <span className="site00-wssc__muted">
          Staged self-design review. Live{' '}
          <Link to={sourceRoute}>DESIGN workspace</Link> is not modified by this flow.
        </span>
      </div>

      <section>
        <h2>Current workspace</h2>
        <p className="site00-wssc__muted">
          NBP readiness: <strong>{ws.nbpReadiness}</strong>
          {ws.state.nbpPackage?.status ? ` · package ${ws.state.nbpPackage.status}` : ''}
        </p>
        {ws.state.lastCaptureFailure ?
          <p className="site00-wssc__error">Last capture failed: {ws.state.lastCaptureFailure.message}</p>
        : null}
        {captureError ? <p className="site00-wssc__error">{captureError}</p> : null}
        <div className="site00-wssc__grid site00-wssc__grid--2">
          <div className="site00-wssc__slot">
            <strong>MOBILE CURRENT</strong>
            <CapturePreview capture={mobileCapture} />
          </div>
          <div className="site00-wssc__slot">
            <strong>DESKTOP CURRENT</strong>
            <CapturePreview capture={desktopCapture} />
          </div>
        </div>
        <div className="site00-wssc__actions">
          <button
            type="button"
            data-primary="true"
            disabled={capturing}
            onClick={async () => {
              setCaptureError(null);
              try {
                await recaptureCurrentWorkspace();
              } catch (err) {
                setCaptureError(err instanceof Error ? err.message : 'Capture failed');
              }
            }}
          >
            {capturing ? 'CAPTURING…' : 'RECAPTURE CURRENT WORKSPACE'}
          </button>
          <button type="button" onClick={() => ws.compileContract()}>
            COMPILE FUNCTION CONTRACT
          </button>
          <button
            type="button"
            onClick={() => ws.createNbpPackage()}
            disabled={!nbpReady}
            title={ws.nbpReadiness}
          >
            SYNC NBP HANDOFF PACKAGE
          </button>
          <button
            type="button"
            data-primary="true"
            disabled={!canGenerateConcepts}
            onClick={() => {
              void ws.prepareGenerationPlan().catch((err) =>
                setCaptureError(err instanceof Error ? err.message : 'Plan failed'),
              );
            }}
          >
            GENERATE 3 WORKSPACE CONCEPTS
          </button>
        </div>
        {ws.generationError ? <p className="site00-wssc__error">{ws.generationError}</p> : null}
        {ws.state.generationStatus !== 'IDLE' ?
          <p className="site00-wssc__muted">
            Generation status: <strong>{ws.state.generationStatus}</strong>
            {ws.state.generationJobs.length ? ` · ${ws.state.generationJobs.filter((j) => j.status === 'READY').length}/6 artifacts` : ''}
          </p>
        : null}
        {ws.pendingPlan ?
          <div className="site00-wssc__confirm" data-testid="workspace-self-generation-confirm">
            <p>
              <strong>TARGET:</strong> {ws.pendingPlan.targetLabel}
            </p>
            <p>
              <strong>CREATIVE CONTEXT CALLS:</strong> {ws.pendingPlan.cgptCalls} CGPT ·{' '}
              <strong>CONCEPT AUTHORING:</strong> {ws.pendingPlan.gpt2Calls} GPT2 ·{' '}
              <strong>NBP IMAGE JOBS:</strong> {ws.pendingPlan.nbpJobs}
            </p>
            <p>
              <strong>CONCEPTS:</strong> {ws.pendingPlan.conceptCount} · <strong>ARTIFACTS:</strong>{' '}
              {ws.pendingPlan.outputCount} (Mobile + Desktop per concept)
            </p>
            <p>
              <strong>CREATIVE LAYER:</strong> {ws.pendingPlan.creativeLayer} · <strong>RENDERER:</strong>{' '}
              {ws.pendingPlan.renderer}
            </p>
            <p className="site00-wssc__muted">{ws.pendingPlan.estimatedCostNote}</p>
            <div className="site00-wssc__actions">
              <button type="button" onClick={() => ws.cancelGenerationPlan()}>
                CANCEL
              </button>
              <button
                type="button"
                data-primary="true"
                disabled={ws.generating}
                onClick={() => {
                  void ws.confirmWorkspaceConceptGeneration().catch((err) =>
                    setCaptureError(err instanceof Error ? err.message : 'Generation failed'),
                  );
                }}
              >
                {ws.generating ? 'GENERATING…' : 'GENERATE'}
              </button>
            </div>
          </div>
        : null}
        {ws.state.generationJobs.length ?
          <ul className="site00-wssc__jobList">
            {ws.state.generationJobs.map((job) => (
              <li key={job.artifactId}>
                {job.conceptId} {job.viewport}: {job.status}
                {job.failureReason ? ` — ${job.failureReason}` : ''}
              </li>
            ))}
          </ul>
        : null}
        {ws.state.generationStatus === 'PARTIAL_GENERATION' ?
          <button type="button" onClick={() => void ws.retryFailedGenerationJobs()}>
            RETRY FAILED ONLY
          </button>
        : null}
        <p className="site00-wssc__muted">
          Historical capture sets preserved: {ws.state.captureSets.length} · Active set{' '}
          {ws.state.activeCaptureSetId ?? '—'}
        </p>
      </section>

      <div className="site00-wssc__mainWithRail">
        <section className="site00-wssc__mainCol">
          <div className="site00-wssc__reviewToolbar">
            <h2>Workspace concept candidates</h2>
            <div className="site00-wssc__viewportToggle">
              <button
                type="button"
                aria-pressed={activeViewport === 'MOBILE'}
                onClick={() => ws.setReviewViewport('MOBILE')}
              >
                MOBILE
              </button>
              <button
                type="button"
                aria-pressed={activeViewport === 'DESKTOP'}
                onClick={() => ws.setReviewViewport('DESKTOP')}
              >
                DESKTOP
              </button>
            </div>
          </div>
          <WorkspaceSelfConceptGallery
            state={ws.state}
            activeConceptId={activeConceptId}
            onActivate={(id) => ws.activateConcept(id)}
            onInspect={(id) => ws.inspectConcept(id)}
            onFullscreen={(id) => {
              ws.activateConcept(id);
              ws.openFullscreen();
            }}
            onSelectMobile={(id) => ws.selectMobile(id)}
            onSelectDesktop={(id) => ws.selectDesktop(id)}
          />
          <p className="site00-wssc__muted">Active = reviewing · Selected = viewport preference · Promoted = authority.</p>
          <div className="site00-wssc__actions site00-wssc__actions--sticky">
            <button type="button" onClick={() => ws.openCompare(activeViewport)}>
              COMPARE CONCEPTS
            </button>
            <button type="button" onClick={() => ws.promoteMobile()} disabled={!canPromoteMobile}>
              PROMOTE MOBILE
            </button>
            <button type="button" onClick={() => ws.promoteDesktop()} disabled={!canPromoteDesktop}>
              PROMOTE DESKTOP
            </button>
          </div>
        </section>

        <WorkspaceSelfAuthorityPairPanel
          state={ws.state}
          canPromoteMobile={canPromoteMobile}
          canPromoteDesktop={canPromoteDesktop}
          onPromoteMobile={() => ws.promoteMobile()}
          onPromoteDesktop={() => ws.promoteDesktop()}
          onViewportClick={(vp) => {
            ws.setReviewViewport(vp);
            const promoted = vp === 'MOBILE' ? ws.state.promotedMobileConceptId : ws.state.promotedDesktopConceptId;
            const selected = vp === 'MOBILE' ? ws.state.preferredMobileConceptId : ws.state.preferredDesktopConceptId;
            const target = promoted ?? selected ?? activeConceptId ?? 'CONCEPT_A';
            ws.inspectConcept(target);
          }}
        />
      </div>

      {review.compareOpen ?
        <WorkspaceSelfCompareConcepts
          state={ws.state}
          viewport={review.compareViewport}
          onClose={() => ws.closeCompare()}
          onSelectViewport={(vp) => ws.openCompare(vp)}
          onSelectForViewport={(id) => {
            if (review.compareViewport === 'MOBILE') ws.selectMobile(id);
            else ws.selectDesktop(id);
          }}
          onInspect={(id) => ws.inspectConcept(id)}
          onFullscreen={(id) => {
            ws.activateConcept(id);
            ws.openFullscreen();
          }}
        />
      : null}

      {inspectedId && !review.fullscreenOpen ?
        <WorkspaceSelfInspectPanel
          state={ws.state}
          conceptId={inspectedId}
          viewport={activeViewport}
          onClose={() => ws.closeInspect()}
          onSelectMobile={() => ws.selectMobile(inspectedId)}
          onSelectDesktop={() => ws.selectDesktop(inspectedId)}
          onPromote={() => (activeViewport === 'MOBILE' ? ws.promoteMobile() : ws.promoteDesktop())}
          canPromote={canPromoteActiveViewport}
          onFullscreen={() => ws.openFullscreen()}
        />
      : null}

      {review.fullscreenOpen && activeConceptId ?
        <WorkspaceSelfFullscreenReview
          state={ws.state}
          conceptId={activeConceptId}
          viewport={activeViewport}
          onClose={() => ws.closeFullscreen()}
          onSelectForViewport={() =>
            activeViewport === 'MOBILE' ? ws.selectMobile(activeConceptId) : ws.selectDesktop(activeConceptId)
          }
          onPromote={() => (activeViewport === 'MOBILE' ? ws.promoteMobile() : ws.promoteDesktop())}
          canPromote={canPromoteActiveViewport}
        />
      : null}

      <WorkspaceSelfPairReviewPanel state={ws.state} />

      <section>
        <h2>Pair review &amp; authority</h2>
        <div className="site00-wssc__actions">
          <button type="button" onClick={() => ws.openPairReview()} disabled={!canPairReview}>
            OPEN PAIR REVIEW
          </button>
          <button type="button" onClick={() => ws.completePairReview()} disabled={!canCompletePair}>
            COMPLETE PAIR REVIEW
          </button>
          <button type="button" data-primary="true" onClick={() => ws.lockAuthority()} disabled={!canLock}>
            LOCK DESIGN WORKSPACE AUTHORITY
          </button>
        </div>
        {ws.state.authorityPair ?
          <p className="site00-wssc__muted">Locked pair {ws.state.authorityPair.authorityPairId}</p>
        : null}
      </section>

      <section>
        <h2>Opus → Composer handoff (firewall)</h2>
        <p className="site00-wssc__muted">
          Opus: visual shell only. Composer: sole production implementation agent. No provider spend in this sprint.
        </p>
        <div className="site00-wssc__actions">
          <button type="button" onClick={() => ws.requestOpusShell()} disabled={!canOpusShell}>
            CREATE DESIGN SHELL WITH OPUS
          </button>
          <button type="button" onClick={() => ws.markOpusShellCreated()} disabled={!canMarkOpusCreated}>
            MARK OPUS SHELL STAGED
          </button>
          <button type="button" onClick={() => ws.approveOpusShell()} disabled={!canApproveOpus}>
            APPROVE OPUS SHELL
          </button>
          <button type="button" data-primary="true" onClick={() => ws.sendToComposer()} disabled={!canComposer}>
            SEND TO COMPOSER
          </button>
        </div>
      </section>

      <section>
        <h2>Event history</h2>
        <ol className="site00-wssc__history">
          {ws.state.history.map((row) => (
            <li key={`${row.type}-${row.at}`}>
              {row.type} — {row.summary}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default SystemDesignWorkspaceConceptsPage;
