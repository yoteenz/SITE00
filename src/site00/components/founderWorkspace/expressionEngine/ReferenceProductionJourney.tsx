/**
 * Reference-fidelity — horizontal production journey rail.
 */

import type { JourneyStage, JourneyStageStatus } from './productionJourney';

type Props = {
  stages: JourneyStage[];
  entryLabel?: string;
};

function nodeClass(status: JourneyStageStatus, isCurrent: boolean): string {
  const base = 'site00-ee-ref-journey__node';
  if (status === 'APPROVED') return `${base} ${base}--done`;
  if (status === 'ACTIVE' || isCurrent) return `${base} ${base}--active`;
  return `${base} ${base}--future`;
}

export function ReferenceProductionJourney({ stages, entryLabel = 'ENTRY 002' }: Props) {
  const activeIndex = stages.findIndex((s) => s.status === 'ACTIVE' || s.status === 'READY' || s.status === 'FAILED');

  return (
    <section className="site00-ee-ref-journey">
      <header className="site00-ee-ref-journey__head">
        <h3>PRODUCTION JOURNEY</h3>
        <span>{entryLabel}</span>
      </header>
      <div className="site00-ee-ref-journey__track-wrap">
        <div className="site00-ee-ref-journey__track" aria-hidden />
        <ol className="site00-ee-ref-journey__rail">
          {stages.map((stage, i) => {
            const isCurrent = i === activeIndex || stage.status === 'ACTIVE';
            return (
              <li key={stage.id} className="site00-ee-ref-journey__step">
                <div className={nodeClass(stage.status, isCurrent)}>
                  {stage.status === 'APPROVED' ? (
                    <svg viewBox="0 0 12 12" aria-hidden><path d="M2 6l3 3 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                  ) : isCurrent ? (
                    <span className="site00-ee-ref-journey__dot" />
                  ) : null}
                </div>
                <span className="site00-ee-ref-journey__label">{stage.shortLabel}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
