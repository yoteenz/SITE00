/**
 * P0.VR.7R1 — Guided reconstruction sequence chrome (step header, progress strip, transition).
 */

import type { GuidedReconstructionSequence } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr7r1/types.js';
import type { NextBestWorkflowAction } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr7r1/types.js';

type Props = {
  guided: GuidedReconstructionSequence;
  nextAction: NextBestWorkflowAction;
  showIntent?: boolean;
};

function statusGlyph(status: string): string {
  if (status === 'COMPLETE') return '✓';
  if (status === 'CURRENT') return '●';
  if (status === 'NEEDS_ATTENTION') return '!';
  if (status === 'SKIPPED') return '–';
  return '○';
}

export function DesignGuidedSequenceChrome({ guided, nextAction, showIntent = true }: Props) {
  const current = guided.items[guided.currentIndex];
  const total = guided.items.length;
  const stepNum = guided.currentIndex + 1;

  return (
    <div className="site00-dw-guided-seq" data-stage={guided.founderStage}>
      {showIntent ? (
        <section className="site00-dw-guided-seq__intent" aria-label="Workflow intent">
          <h3>WHAT I THINK YOU&apos;RE DOING</h3>
          <ul>
            {guided.intelligence.intentSummary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {guided.lastTransition ? (
        <div className="site00-dw-guided-seq__transition" role="status">
          <strong>{guided.lastTransition.completedAssetName}</strong>
          <span>{guided.lastTransition.completedLabel}</span>
          {guided.lastTransition.nextAssetName ? (
            <span>
              NEXT: <strong>{guided.lastTransition.nextAssetName}</strong>
            </span>
          ) : guided.lastTransition.nextStage ? (
            <span>NEXT: {guided.lastTransition.nextStage}</span>
          ) : null}
        </div>
      ) : null}

      <header className="site00-dw-guided-seq__step">
        <p className="site00-dw-guided-seq__step-label">
          STEP {stepNum} OF {total} · {guided.founderStage} ASSET
        </p>
        <h2>
          {String(stepNum).padStart(2, '0')} OF {String(total).padStart(2, '0')} — {current?.displayName ?? 'ASSET'}
        </h2>
        <p className="site00-dw-guided-seq__why">
          {guided.founderStage === 'FRAME'
            ? 'MOVE AND RESIZE THE RED BOX UNTIL THE PREVIEW SHOWS ONLY THE VISUAL YOU WANT REBUILT.'
            : nextAction.reason}
        </p>
        {guided.items[guided.currentIndex + 1] ? (
          <p className="site00-dw-guided-seq__next-hint">
            NEXT: {guided.items[guided.currentIndex + 1]!.displayName}
          </p>
        ) : null}
      </header>

      <nav className="site00-dw-guided-seq__strip" aria-label="Sequence progress">
        {guided.items.map((item) => (
          <div
            key={item.assetId}
            className={`site00-dw-guided-seq__strip-item is-${item.status.toLowerCase().replace(/_/g, '-')}`}
          >
            <img src={item.thumbnailUrl} alt="" />
            <span className="site00-dw-guided-seq__strip-glyph" aria-hidden>
              {statusGlyph(item.status)}
            </span>
            <span className="site00-dw-guided-seq__strip-name">{item.displayName}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}

export function DesignCropCheckSummary({ guided, assetId }: { guided: GuidedReconstructionSequence; assetId: string }) {
  const check = guided.cropChecksByAssetId[assetId];
  if (!check) return null;
  return (
    <section className="site00-dw-guided-seq__crop-check" aria-label="Crop check">
      <header>
        <span>CROP CHECK</span>
        <strong className={`is-${check.status.toLowerCase().replace(/_/g, '-')}`}>{check.status.replace(/_/g, ' ')}</strong>
      </header>
      {check.items.length > 0 ? (
        <ul>
          {check.items.map((item) => (
            <li key={item.code}>{item.label}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function DesignApprovalOutcomeHint({ guided }: { guided: GuidedReconstructionSequence }) {
  const next = guided.items[guided.currentIndex + 1];
  return (
    <p className="site00-dw-guided-seq__outcome">
      APPROVE CROP — SAVES THIS FRAME ONLY. NO GENERATION STARTS.
      {next ? ` NEXT WE'LL REVIEW ${next.displayName}.` : guided.generationPlanReady ? ' NEXT: REVIEW GENERATION PLAN.' : ''}
    </p>
  );
}
