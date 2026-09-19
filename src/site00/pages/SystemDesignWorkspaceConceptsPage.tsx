/**
 * P0.VR.DESIGN-WORKSPACE-SELF-CONCEPT1 — isolated WORKSPACE_SELF review (no production mutation).
 */

import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { WORKSPACE_CONCEPT_SLOT_IDS } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/constants.js';
import { latestCaptureForViewport } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/workflow.js';
import { SITE00_ROUTES } from '../config/routes';
import { useWorkspaceSelfConcept } from '../hooks/useWorkspaceSelfConcept';
import '../styles/site00-workspace-self-concept.css';

export function SystemDesignWorkspaceConceptsPage() {
  const ws = useWorkspaceSelfConcept();

  const { open, isFounder } = ws;
  useEffect(() => {
    if (isFounder) open();
  }, [isFounder, open]);

  if (!isFounder) {
    return <Navigate to={SITE00_ROUTES.control} replace />;
  }

  const mobileCapture = latestCaptureForViewport(ws.state, 'MOBILE');
  const desktopCapture = latestCaptureForViewport(ws.state, 'DESKTOP');
  const buildLabel = import.meta.env.VITE_SITE00_BUILD ?? 'dev';

  const canPromoteMobile = Boolean(ws.state.preferredMobileConceptId);
  const canPromoteDesktop = Boolean(ws.state.preferredDesktopConceptId);
  const canPairReview = Boolean(ws.state.promotedMobileConceptId && ws.state.promotedDesktopConceptId);
  const canCompletePair = Boolean(ws.state.pairReviewOpenedAt && !ws.state.pairReviewCompletedAt);
  const canLock = Boolean(ws.state.pairReviewCompletedAt && !ws.state.authorityPair);
  const canOpusShell = Boolean(ws.state.authorityPair && !ws.state.opusShellPackage);
  const canMarkOpusCreated = ws.state.opusShellPackage?.status === 'REQUESTED';
  const canApproveOpus = ws.state.opusShellPackage?.status === 'STAGED';
  const canComposer = ws.state.opusShellPackage?.status === 'APPROVED' && !ws.state.composerHandoff;

  return (
    <div className="site00-wssc" data-testid="workspace-self-concept-page">
      <div className="site00-wssc__banner">
        <strong>WORKSPACE_SELF — {ws.target.displayName}</strong>
        <span className="site00-wssc__muted">
          Staged self-design review. Live{' '}
          <Link to="/projects/design/ndxbook">DESIGN workspace</Link> is not modified by this flow.
        </span>
      </div>

      <section>
        <h2>Current workspace</h2>
        <div className="site00-wssc__grid site00-wssc__grid--2">
          <div className="site00-wssc__slot">
            <strong>MOBILE CURRENT</strong>
            <p className="site00-wssc__muted">{mobileCapture?.captureId ?? 'No capture yet'}</p>
            <p>{mobileCapture?.route ?? '/projects/design/ndxbook'}</p>
          </div>
          <div className="site00-wssc__slot">
            <strong>DESKTOP CURRENT</strong>
            <p className="site00-wssc__muted">{desktopCapture?.captureId ?? 'No capture yet'}</p>
            <p>{desktopCapture?.route ?? '/projects/design/ndxbook'}</p>
          </div>
        </div>
        <div className="site00-wssc__actions">
          <button type="button" onClick={() => ws.recordCurrentCaptures(buildLabel)}>
            CAPTURE CURRENT MOBILE + DESKTOP
          </button>
          <button type="button" onClick={() => ws.compileContract()}>
            COMPILE FUNCTION CONTRACT
          </button>
          <button type="button" onClick={() => ws.createNbpPackage()} disabled={!ws.state.functionContract}>
            CREATE NBP HANDOFF PACKAGE
          </button>
        </div>
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
        {ws.state.authorityPair ? (
          <p className="site00-wssc__muted">Locked pair {ws.state.authorityPair.authorityPairId}</p>
        ) : null}
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
