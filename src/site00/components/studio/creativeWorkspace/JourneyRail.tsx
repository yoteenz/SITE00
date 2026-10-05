import type { CreativeDirectorTaskMode } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import type { CreativeThread } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import { JOURNEY_STAGES, journeyStageStatus, type JourneyStageStatus } from './creativeWorkspaceUtils';

const STATUS_LABEL: Record<JourneyStageStatus, string> = {
  NOT_STARTED: 'Not started',
  ACTIVE: 'Active',
  AWAITING_FOUNDER: 'Awaiting founder',
  APPROVED: 'Approved',
  BLOCKED: 'Blocked',
  SUPERSEDED: 'Superseded',
  DOWNSTREAM_UNLOCKED: 'Unlocked',
};

type Props = {
  thread: CreativeThread | null;
  taskMode: CreativeDirectorTaskMode;
};

export function JourneyRail({ thread, taskMode }: Props) {
  return (
    <nav className="ec-cw-journey" aria-label="Creative journey">
      {JOURNEY_STAGES.map((stage) => {
        const status = journeyStageStatus(stage, thread, taskMode);
        return (
          <div key={stage} className={`ec-cw-journey__stage ec-cw-journey__stage--${status.toLowerCase().replace(/_/g, '-')}`}>
            <span className="ec-cw-journey__label">{stage}</span>
            <span className="ec-cw-journey__status">{STATUS_LABEL[status]}</span>
          </div>
        );
      })}
    </nav>
  );
}
