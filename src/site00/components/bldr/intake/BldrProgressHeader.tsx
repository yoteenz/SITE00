import type { BldrAssessmentStateConfig } from '../../../config/bldr-assessment';
import { bldrClassificationPosition } from '../../../config/bldr-classification';
import { BLDR_CLASS_RECEIVED_COPY } from '../../../config/bldr-intake-phases';
import { BldrBuildClassIcon } from '../BldrBuildClassIcon';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';
import type { BldrIntakePhase } from '../../../config/bldr-intake-phases';

type BldrProgressHeaderProps = {
  state?: BldrAssessmentStateConfig;
  phase?: BldrIntakePhase;
  mode?: 'classification' | 'discovery' | 'result';
  resultTitle?: string;
};

export function BldrProgressHeader({ state, phase, mode = 'classification', resultTitle }: BldrProgressHeaderProps) {
  if (mode === 'result') {
    return (
      <header className="site00-bldr-intake-header">
        <div className="site00-bldr-intake-header__mark-wrap">
          <Site00ThreeCornerMark className="site00-bldr-intake-header__mark" />
          <p className="site00-bldr-intake-header__location">BLDR / CLASSIFICATION RESULT</p>
        </div>
        <p className="site00-bldr-intake-header__result-kicker">RECOMMENDED BUILD</p>
        <h1 className="site00-bldr-intake-header__title">{resultTitle}</h1>
      </header>
    );
  }

  if (!state) return null;

  const position = bldrClassificationPosition(state.iconId);
  const received = BLDR_CLASS_RECEIVED_COPY[state.id];
  const isDiscovery = state.id === 'not-sure';

  return (
    <header className="site00-bldr-intake-header">
      <div className="site00-bldr-intake-header__mark-wrap">
        <Site00ThreeCornerMark className="site00-bldr-intake-header__mark" />
        <p className="site00-bldr-intake-header__location">
          {mode === 'discovery' ? 'BLDR / DISCOVERY' : `BLDR / ${state.title}`}
        </p>
      </div>

      {!isDiscovery ? (
        <p className="site00-bldr-intake-header__fraction">[ {position} ]</p>
      ) : null}
      {!isDiscovery ? (
        <p className="site00-bldr-intake-header__received">CLASSIFICATION RECEIVED.</p>
      ) : null}

      <div className="site00-bldr-intake-header__grid">
        <div className="site00-bldr-intake-header__copy">
          {phase ? (
            <p className="site00-bldr-intake-header__phase">
              {isDiscovery ? `DISCOVERY / ${phase.num}` : `${phase.num} / ${phase.label}`}
            </p>
          ) : null}
          <h1 className="site00-bldr-intake-header__title">{state.title}</h1>
          <p className="site00-bldr-intake-header__descriptor">{received.descriptor}</p>
          <p className="site00-bldr-intake-header__next">{received.next}</p>
        </div>
        <div className="site00-bldr-intake-header__art" aria-hidden="true">
          <BldrBuildClassIcon id={state.iconId} title={state.title} className="site00-bldr-intake-header__icon" />
        </div>
      </div>
    </header>
  );
}
