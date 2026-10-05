import type { IdntyBrandStateIconId } from '../../../config/idnty-brand-state-icons';
import { IDNTY_HANDOFF_COPY } from '../../../config/idnty-diagnostic';
import { IdntyBrandStateIcon } from '../IdntyBrandStateIcon';

type IdntyHandoffProps = {
  activeStateId: IdntyBrandStateIconId;
  onProceed: (stateId: IdntyBrandStateIconId) => void;
};

function IdntyHandoffConnector() {
  return (
    <div className="site00-idnty-diagnostic-handoff__connector" aria-hidden="true">
      <svg viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="4" y1="12" x2="36" y2="12" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M36 12L30 8V16L36 12Z" fill="currentColor" />
        <circle cx="4" cy="12" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}

function IdntyHandoffSystemArt() {
  return (
    <svg
      className="site00-idnty-diagnostic-handoff__system-art"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M16 44L32 28L48 44" stroke="rgba(196, 30, 58, 0.35)" strokeWidth="0.85" vectorEffect="non-scaling-stroke" />
      <path d="M24 44H40V52H24V44Z" stroke="rgba(196, 30, 58, 0.35)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="32" y1="28" x2="32" y2="16" stroke="rgba(196, 30, 58, 0.35)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="32" cy="14" r="3" fill="rgba(196, 30, 58, 0.45)" />
      <line x1="20" y1="36" x2="12" y2="32" stroke="rgba(0, 0, 0, 0.12)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="44" y1="36" x2="52" y2="32" stroke="rgba(0, 0, 0, 0.12)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function IdntyHandoff({ activeStateId, onProceed }: IdntyHandoffProps) {
  const copy = IDNTY_HANDOFF_COPY[activeStateId];

  return (
    <section className="site00-idnty-diagnostic-handoff" aria-label="IDENTITY STATE HANDOFF">
      <div className="site00-idnty-diagnostic-handoff__panel site00-idnty-diagnostic-handoff__panel--source">
        <p className="site00-idnty-diagnostic-handoff__label">IDENTITY STATE</p>
        <div className="site00-idnty-diagnostic-handoff__source-row">
          <IdntyBrandStateIcon id={activeStateId} title={copy.stateSummary} className="site00-idnty-diagnostic-handoff__icon" />
          <div>
            <p className="site00-idnty-diagnostic-handoff__state">{copy.stateSummary}</p>
            <p className="site00-idnty-diagnostic-handoff__requirement">{copy.requirement}</p>
          </div>
        </div>
        <p className="site00-idnty-diagnostic-handoff__recommended">{copy.recommendedLabel}</p>
        <button
          type="button"
          className="site00-idnty-diagnostic-handoff__cta"
          onClick={() => onProceed(activeStateId)}
        >
          {copy.cta}
        </button>
      </div>

      <IdntyHandoffConnector />

      <div className="site00-idnty-diagnostic-handoff__panel site00-idnty-diagnostic-handoff__panel--target">
        <IdntyHandoffSystemArt />
        <p className="site00-idnty-diagnostic-handoff__label">{copy.nextSystemLabel}</p>
        <p className="site00-idnty-diagnostic-handoff__system-title">{copy.nextSystemTitle}</p>
        <p className="site00-idnty-diagnostic-handoff__system-body">{copy.nextSystemBody}</p>
      </div>
    </section>
  );
}
