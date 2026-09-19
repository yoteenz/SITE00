/**
 * B5.0 — Visual production journey (Level 02).
 */

import type { JourneyStage, JourneyStageStatus } from './productionJourney';

type Props = {
  stages: JourneyStage[];
  activeStageId: string;
  onStageSelect?: (stageId: string) => void;
};

function statusSymbol(status: JourneyStageStatus): string {
  switch (status) {
    case 'APPROVED':
      return '✓';
    case 'ACTIVE':
      return '●';
    case 'READY':
      return '◐';
    case 'FAILED':
      return '✕';
    case 'SUPERSEDED':
      return '↺';
    default:
      return '';
  }
}

export function ProductionJourney({ stages, activeStageId, onStageSelect }: Props) {
  return (
    <nav className="site00-ee-journey" aria-label="Production journey">
      <ol className="site00-ee-journey__rail">
        {stages.map((stage, i) => {
          const isActive = stage.id === activeStageId || stage.status === 'ACTIVE';
          const clickable = onStageSelect && (stage.status === 'APPROVED' || stage.status === 'ACTIVE' || stage.status === 'READY' || stage.status === 'FAILED');
          return (
            <li
              key={stage.id}
              className={[
                'site00-ee-journey__step',
                `site00-ee-journey__step--${stage.status.toLowerCase()}`,
                isActive ? 'site00-ee-journey__step--current' : '',
              ].join(' ')}
            >
              {clickable ? (
                <button type="button" className="site00-ee-journey__btn" onClick={() => onStageSelect(stage.id)}>
                  <span className="site00-ee-journey__symbol">{statusSymbol(stage.status)}</span>
                  <span className="site00-ee-journey__label">{stage.shortLabel}</span>
                </button>
              ) : (
                <span className="site00-ee-journey__btn site00-ee-journey__btn--static">
                  <span className="site00-ee-journey__symbol">{statusSymbol(stage.status) || '·'}</span>
                  <span className="site00-ee-journey__label">{stage.shortLabel}</span>
                </span>
              )}
              {i < stages.length - 1 ? <span className="site00-ee-journey__connector" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
