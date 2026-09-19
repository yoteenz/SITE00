/**
 * B5.0 — Entry command header (Level 01).
 */

import type { JourneyStage } from './productionJourney';
import { journeyProgressPercent } from './productionJourney';

type Props = {
  entryId: string;
  title: string;
  subject: string;
  chapter: string;
  chapterTitle: string;
  currentStageLabel: string;
  currentStageStatus: string;
  journey: JourneyStage[];
};

export function EntryCommandHeader({
  entryId,
  title,
  subject,
  chapter,
  chapterTitle,
  currentStageLabel,
  currentStageStatus,
  journey,
}: Props) {
  const progress = journeyProgressPercent(journey);

  return (
    <header className="site00-ee-header">
      <div className="site00-ee-header__identity">
        <span className="site00-ee-header__kicker">NDXBOOK</span>
        <h1 className="site00-ee-header__entry">{entryId}</h1>
        <p className="site00-ee-header__title">{title}</p>
        <p className="site00-ee-header__subject">{subject}</p>
        <p className="site00-ee-header__chapter">
          {chapter} · {chapterTitle}
        </p>
      </div>
      <div className="site00-ee-header__state">
        <div className="site00-ee-header__stage">
          <span className="site00-ee-header__stage-label">{currentStageLabel}</span>
          <span className={`site00-ee-header__stage-status site00-ee-header__stage-status--${currentStageStatus.toLowerCase().replace(/[^a-z]+/g, '-')}`}>
            {currentStageStatus}
          </span>
        </div>
        <div className="site00-ee-header__progress">
          <div className="site00-ee-header__progress-track">
            <div className="site00-ee-header__progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="site00-ee-header__progress-label">CAMPAIGN BOARD READY · {progress}%</span>
        </div>
      </div>
    </header>
  );
}
