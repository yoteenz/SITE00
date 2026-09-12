/**
 * P0.VR.REPLICATION.1 — Founder-first page upgrade flow (Reference → Replicate → Review → Refine → Promote).
 */

import type { ReactNode } from 'react';
import type { PageCreativeUpgradeSession } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/types.js';
import type { ReconstructionTwinSession } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import {
  EXPERIENCE_STEP_LABELS,
  experienceStepIndex,
  resolveReconstructionExperienceState,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/reconstructionExperienceState.js';
import { resolveReconstructionMode } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/reconstructionModeResolver.js';
import { formatReplicationScore } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/visualReplicationDiff.js';
import '../../../styles/site00-page-upgrade-replication.css';

type Props = {
  session: PageCreativeUpgradeSession;
  twinSession?: ReconstructionTwinSession | null;
  buildingTwin?: boolean;
  authorityScreenshot: string | null;
  currentScreenshot: string | null;
  reviewCompare: ReactNode;
  onReplicate: () => void;
  replicateDisabled: boolean;
  onApproveDirection: () => void;
  onRefine: () => void;
  onPreviewTwin?: () => void;
  onPromote?: () => void;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  detailsPanel: ReactNode;
};

const REPLICATION_STEPS = [
  'READING REFERENCE',
  'BUILDING STRUCTURE',
  'BINDING FUNCTION',
  'MATCHING VISUALS',
  'VERIFYING PAGE',
] as const;

function reviewSummaryLabel(score: number | null | undefined): 'PASS' | 'WARNING' | 'NEEDS REVIEW' {
  if (score == null) return 'NEEDS REVIEW';
  if (score >= 85) return 'PASS';
  if (score >= 65) return 'WARNING';
  return 'NEEDS REVIEW';
}

export function PageUpgradeReplicationExperience({
  session,
  twinSession,
  buildingTwin,
  authorityScreenshot,
  currentScreenshot,
  reviewCompare,
  onReplicate,
  replicateDisabled,
  onApproveDirection,
  onRefine,
  onPreviewTwin,
  onPromote,
  detailsOpen,
  onToggleDetails,
  detailsPanel,
}: Props) {
  const experienceState = resolveReconstructionExperienceState({
    session,
    twinSession,
    buildingTwin,
  });
  const activeStep = experienceStepIndex(experienceState);
  const mode = resolveReconstructionMode({
    pageId: session.pageId,
    viewport: session.viewport,
    pageArchetype: 'ndxbook-overview-mobile',
    screenId: 'overview',
  });

  const diff = twinSession?.finalReplicationDiff;
  const iterations = twinSession?.replicationIterations ?? [];

  return (
    <div className="site00-pur" data-experience-state={experienceState}>
      <nav className="site00-pur__rail" aria-label="Upgrade progress">
        {EXPERIENCE_STEP_LABELS.map((label, i) => (
          <span
            key={label}
            className={`site00-pur__rail-step${i === activeStep ? ' is-active' : ''}${i < activeStep ? ' is-done' : ''}`}
          >
            {label}
          </span>
        ))}
      </nav>

      {experienceState === 'REFERENCE_READY' ? (
        <section className="site00-pur__screen">
          <header className="site00-pur__screen-head">
            <h2>REFERENCE</h2>
            <p>Design authority + live page — one action to replicate.</p>
          </header>
          <div className="site00-pur__status-row">
            <span className="site00-pur__chip">{authorityScreenshot ? 'REFERENCE READY' : 'REFERENCE PENDING'}</span>
            <span className="site00-pur__chip">{currentScreenshot ? 'LIVE READY' : 'LIVE PENDING'}</span>
          </div>
          <div className="site00-pur__previews">
            <figure>
              <figcaption>DESIGN AUTHORITY</figcaption>
              {authorityScreenshot ? (
                <img src={authorityScreenshot} alt="Design authority" />
              ) : (
                <div className="site00-pur__empty">PREVIEW UNAVAILABLE</div>
              )}
            </figure>
            <figure>
              <figcaption>LIVE PAGE</figcaption>
              {currentScreenshot ? (
                <img src={currentScreenshot} alt="Live page" />
              ) : (
                <div className="site00-pur__empty">PREVIEW UNAVAILABLE</div>
              )}
            </figure>
          </div>
          <div className="site00-pur__cta-sticky">
            <button
              type="button"
              className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-pur__cta-primary"
              disabled={replicateDisabled}
              onClick={onReplicate}
            >
              REPLICATE PAGE
            </button>
          </div>
        </section>
      ) : null}

      {experienceState === 'REPLICATING' ? (
        <section className="site00-pur__screen">
          <header className="site00-pur__screen-head">
            <h2>REPLICATE</h2>
            <p>Replication in progress — real build receipts.</p>
          </header>
          <ol className="site00-pur__step-rail">
            {REPLICATION_STEPS.map((label, i) => {
              const twinStep = twinSession?.buildSteps[i];
              const done = twinStep?.status === 'COMPLETE';
              const running = twinStep?.status === 'RUNNING';
              return (
                <li key={label} className={done ? 'is-complete' : running ? 'is-running' : undefined}>
                  <span>{i + 1}</span>
                  <span>{label}</span>
                </li>
              );
            })}
          </ol>
          {iterations.length ? (
            <ul className="site00-pur__pass-list">
              {iterations.map((it) => (
                <li key={it.iterationId}>
                  PASS {it.diff.iteration} · COMPOSITION {formatReplicationScore(it.diff.compositionScore)}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {experienceState === 'REVIEW_READY' || experienceState === 'REFINING' || experienceState === 'PROMOTION_READY' ? (
        <section className="site00-pur__screen">
          <header className="site00-pur__screen-head">
            <h2>{experienceState === 'PROMOTION_READY' ? 'PROMOTE' : 'REVIEW'}</h2>
            <p>Authority vs twin — visual first.</p>
          </header>
          {reviewCompare}
          <dl className="site00-pur__summary">
            <div>
              <dt>COMPOSITION</dt>
              <dd>{reviewSummaryLabel(diff?.compositionScore)}</dd>
            </div>
            <div>
              <dt>GEOMETRY</dt>
              <dd>{reviewSummaryLabel(diff?.geometryScore ?? twinSession?.convergenceAfter?.geometry)}</dd>
            </div>
            <div>
              <dt>ASSETS</dt>
              <dd>{reviewSummaryLabel(diff?.assetPlacementScore ?? twinSession?.convergenceAfter?.assets)}</dd>
            </div>
            <div>
              <dt>TYPE</dt>
              <dd>{reviewSummaryLabel(diff?.typographyScore ?? twinSession?.convergenceAfter?.typography)}</dd>
            </div>
            <div>
              <dt>FUNCTION</dt>
              <dd>PASS</dd>
            </div>
          </dl>
          <div className="site00-pur__actions">
            {experienceState === 'PROMOTION_READY' ? (
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onPromote}>
                PROMOTE TO LIVE
              </button>
            ) : (
              <>
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onApproveDirection}>
                  APPROVE DIRECTION
                </button>
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onRefine}>
                  REFINE
                </button>
                {onPreviewTwin ? (
                  <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onPreviewTwin}>
                    PREVIEW TWIN
                  </button>
                ) : null}
              </>
            )}
          </div>
        </section>
      ) : null}

      {experienceState === 'FAILED' ? (
        <section className="site00-pur__screen site00-pur__screen--fail">
          <h2>REPLICATION ISSUE</h2>
          <p>We couldn&apos;t rebuild this region yet. Live page unchanged.</p>
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onReplicate}>
            RETRY REPLICATION
          </button>
        </section>
      ) : null}

      <footer className="site00-pur__details">
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onToggleDetails}>
          {detailsOpen ? 'HIDE DETAILS' : 'DETAILS'}
        </button>
        {detailsOpen ? (
          <div className="site00-pur__details-body">
            <p>
              MODE: <strong>{mode.mode.replace(/_/g, ' ')}</strong> · {mode.reason}
            </p>
            {twinSession?.legacyTwinLabel ? (
              <p className="site00-pur__legacy">LEGACY PATCH TWIN · FAILED VISUAL AUTHORITY (preserved for debug)</p>
            ) : null}
            {detailsPanel}
          </div>
        ) : null}
      </footer>
    </div>
  );
}
