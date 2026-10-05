import type { IdentityBrandState } from '../../../config/identity';
import { IDNTY_STATE_CLASSIFICATIONS } from '../../../config/idnty-diagnostic';
import { IdntyBrandStateIcon } from '../IdntyBrandStateIcon';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';
import { ArrowIconSmall } from '../../icons/ArrowAction';

type IdntyDiagnosticStateCardProps = {
  state: IdentityBrandState;
  selected: boolean;
  onSelect: (stateId: string) => void;
  onProceed: (stateId: string) => void;
};

export function IdntyDiagnosticStateCard({
  state,
  selected,
  onSelect,
  onProceed,
}: IdntyDiagnosticStateCardProps) {
  const classification = IDNTY_STATE_CLASSIFICATIONS[state.id];

  return (
    <article
      className={`site00-idnty-diagnostic-card ${selected ? 'site00-idnty-diagnostic-card--selected' : ''}`.trim()}
    >
      <button
        type="button"
        className="site00-idnty-diagnostic-card__hit"
        onClick={() => onSelect(state.id)}
        aria-pressed={selected}
        aria-label={`${state.code} ${state.title}. ${classification}. ${state.description.replace(/\n/g, ' ')}`}
      >
        <span className="site00-idnty-diagnostic-card__ghost" aria-hidden="true">
          {state.code}
        </span>
        <Site00ThreeCornerMark className="site00-idnty-diagnostic-card__mark" />
        <div className="site00-idnty-diagnostic-card__icon">
          <IdntyBrandStateIcon id={state.id} title={state.title} />
        </div>
        <h2 className="site00-idnty-diagnostic-card__title">{state.title}</h2>
        <p className="site00-idnty-diagnostic-card__classification">{classification}</p>
        <p className="site00-idnty-diagnostic-card__desc">{state.description}</p>
      </button>
      <button
        type="button"
        className="site00-idnty-diagnostic-card__cta"
        onClick={() => onProceed(state.id)}
      >
        SELECT STATE
        <ArrowIconSmall />
      </button>
    </article>
  );
}
