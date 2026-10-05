/**
 * Reference-fidelity — current stage workspace card with storyboard grid + CTA.
 */

import type { B49R4PipelineResponse } from './types';

type Props = {
  stageTitle: string;
  stageDescription: string;
  statusLabel: string;
  primaryActionLabel: string;
  data: B49R4PipelineResponse | null;
  onPrimaryAction?: () => void;
  onJudgment?: (j: 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME') => Promise<void>;
  judging?: boolean;
};

export function ReferenceCurrentStageCard({
  stageTitle,
  stageDescription,
  statusLabel,
  primaryActionLabel,
  data,
  onPrimaryAction,
  onJudgment,
  judging,
}: Props) {
  const sb = data?.finalCinematicStoryboard;
  const momentCount = sb?.panelCount ?? data?.reelVisualConception?.selectedMomentCount ?? 10;
  const stripUrl = sb?.storyboardStripUrl ?? null;
  const reviewActive = data?.finalStoryboardReviewGate.active ?? false;
  const gridCount = Math.min(Math.max(momentCount, 1), 10);

  return (
    <section className="site00-ee-ref-stage">
      <header className="site00-ee-ref-stage__head">
        <div>
          <span className="site00-ee-ref-stage__kicker">CURRENT STAGE</span>
          <h3 className="site00-ee-ref-stage__title">{stageTitle}</h3>
        </div>
        <span className="site00-ee-ref-stage__status">
          <span className="site00-ee-ref-stage__status-dot" aria-hidden />
          {statusLabel}
        </span>
      </header>
      <p className="site00-ee-ref-stage__desc">{stageDescription}</p>

      <div className="site00-ee-ref-stage__grid" aria-label="Storyboard frames">
        {stripUrl
          ? Array.from({ length: gridCount }, (_, i) => (
              <figure key={i} className="site00-ee-ref-stage__cell">
                <div
                  className="site00-ee-ref-stage__cell-img"
                  style={{
                    backgroundImage: `url(${stripUrl})`,
                    backgroundSize: `${gridCount * 100}% 100%`,
                    backgroundPosition: `${gridCount <= 1 ? 0 : (i / (gridCount - 1)) * 100}% 0`,
                  }}
                />
                <figcaption>{String(i + 1).padStart(2, '0')}</figcaption>
              </figure>
            ))
          : Array.from({ length: gridCount }, (_, i) => (
              <figure key={i} className="site00-ee-ref-stage__cell site00-ee-ref-stage__cell--empty">
                <figcaption>{String(i + 1).padStart(2, '0')}</figcaption>
              </figure>
            ))}
      </div>

      {reviewActive && onJudgment ? (
        <div className="site00-ee-ref-stage__review">
          <button type="button" className="site00-ee-ref-stage__cta" disabled={judging} onClick={() => void onJudgment('LOVE_IT')}>
            LOVE IT
          </button>
          <button type="button" className="site00-ee-ref-stage__cta site00-ee-ref-stage__cta--secondary" disabled={judging} onClick={() => void onJudgment('PROMISING_REFINE')}>
            REVISE
          </button>
        </div>
      ) : (
        <button type="button" className="site00-ee-ref-stage__cta" onClick={onPrimaryAction}>
          {primaryActionLabel}
          <span aria-hidden>→</span>
        </button>
      )}
    </section>
  );
}
