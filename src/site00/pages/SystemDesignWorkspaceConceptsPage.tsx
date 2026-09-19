/**
 * P0.VR.DESIGN-WORKSPACE-SELF-CONCEPT1 — isolated WORKSPACE_SELF review (no production mutation).
 */

import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { WORKSPACE_CONCEPT_SLOT_IDS } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/constants.js';
import { resolveWorkspaceSelfDesignRoute } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/sourceContext.js';
import { latestCaptureForViewport } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/workflow.js';
import { SITE00_ROUTES } from '../config/routes';
import { useWorkspaceSelfConcept } from '../hooks/useWorkspaceSelfConcept';
import { resolveCaptureArtifactDisplayUrl } from '../services/workspaceSelfArtifactStorage';
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

  const canPromoteMobile = Boolean(ws.state.preferredMobileConceptId);
  const canPromoteDesktop = Boolean(ws.state.preferredDesktopConceptId);
  const canPairReview = Boolean(ws.state.promotedMobileConceptId && ws.state.promotedDesktopConceptId);
  const canCompletePair = Boolean(ws.state.pairReviewOpenedAt && !ws.state.pairReviewCompletedAt);
  const canLock = Boolean(ws.state.pairReviewCompletedAt && !ws.state.authorityPair);
  const canOpusShell = Boolean(ws.state.authorityPair && !ws.state.opusShellPackage);
  const canMarkOpusCreated = ws.state.opusShellPackage?.status === 'REQUESTED';
  const canApproveOpus = ws.state.opusShellPackage?.status === 'STAGED';
  const canComposer = ws.state.opusShellPackage?.status === 'APPROVED' && !ws.state.composerHandoff;
  const nbpReady = ws.nbpReadiness === 'READY_FOR_NBP';

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
        </div>
        <p className="site00-wssc__muted">
          Historical capture sets preserved: {ws.state.captureSets.length} · Active set{' '}
          {ws.state.activeCaptureSetId ?? '—'}
        </p>
      </section>

      <section>
        <h2>Workspace concept candidates (3 slots)</h2>
        <div className="site00-wssc__grid site00-wssc__grid--3">
          {WORKSPACE_CONCEPT_SLOT_IDS.map((id) => {
            const concept = ws.state.concepts.find((c) => c.conceptId === id);
            const activeMobile = ws.state.preferredMobileConceptId === id;
            const activeDesktop = ws.state.preferredDesktopConceptId === id;
            return (
              <div
                key={id}
                className="site00-wssc__slot"
                data-active={activeMobile || activeDesktop ? 'true' : 'false'}
              >
                <strong>{id}</strong>
                <p className="site00-wssc__muted">Status: {concept?.status ?? 'EMPTY'}</p>
                <div className="site00-wssc__actions">
                  <button type="button" onClick={() => ws.stageConcept(id)}>
                    STAGE SLOT
                  </button>
                  <button type="button" onClick={() => ws.selectMobile(id)} disabled={concept?.status === 'EMPTY'}>
                    SELECT FOR MOBILE
                  </button>
                  <button type="button" onClick={() => ws.selectDesktop(id)} disabled={concept?.status === 'EMPTY'}>
                    SELECT FOR DESKTOP
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <p className="site00-wssc__muted">Selection = preference only — not approval.</p>
        <div className="site00-wssc__actions">
          <button type="button" onClick={() => ws.promoteMobile()} disabled={!canPromoteMobile}>
            PROMOTE MOBILE
          </button>
          <button type="button" onClick={() => ws.promoteDesktop()} disabled={!canPromoteDesktop}>
            PROMOTE DESKTOP
          </button>
        </div>
      </section>

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
