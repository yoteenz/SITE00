import { IDNTY_BRAND_STATES } from '../../../config/identity';
import { IdntyDiagnosticStateCard } from './IdntyDiagnosticStateCard';

type IdntyStateGridProps = {
  selectedStateId: string;
  onSelectState: (stateId: string) => void;
  onProceedState: (stateId: string) => void;
};

export function IdntyStateGrid({ selectedStateId, onSelectState, onProceedState }: IdntyStateGridProps) {
  return (
    <section className="site00-idnty-diagnostic-grid-wrap" aria-label="BRAND STATES">
      <div className="site00-idnty-diagnostic-grid__geometry" aria-hidden="true">
        <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="160" r="120" stroke="rgba(196, 30, 58, 0.06)" strokeWidth="0.75" />
          <circle cx="200" cy="160" r="80" stroke="rgba(196, 30, 58, 0.05)" strokeWidth="0.75" />
          <line x1="200" y1="40" x2="200" y2="280" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="0.75" />
          <line x1="40" y1="160" x2="360" y2="160" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="0.75" />
          <circle cx="200" cy="160" r="3" fill="rgba(196, 30, 58, 0.2)" />
        </svg>
      </div>
      <div className="site00-idnty-diagnostic-grid" role="list">
        {IDNTY_BRAND_STATES.map((state) => (
          <IdntyDiagnosticStateCard
            key={state.id}
            state={state}
            selected={selectedStateId === state.id}
            onSelect={onSelectState}
            onProceed={onProceedState}
          />
        ))}
      </div>
    </section>
  );
}
