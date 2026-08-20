import { EVOLVE_DIAGNOSTIC_STAGES } from '../../../config/evolve-hub-mobile';

function StageIcon({ stageId }: { stageId: string }) {
  if (stageId === 'existing') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="6" y="8" width="12" height="10" stroke="currentColor" strokeWidth="1.25" />
        <path d="M12 8V5M8 5h8" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    );
  }
  if (stageId === 'assessment') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.25" />
        <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 5v2M12 17v2M5 12h2M17 12h2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function EvolveDiagnosticStrip() {
  return (
    <section className="site00-evolve-diagnostic" aria-label="Property evolution diagnostic">
      <ol className="site00-evolve-diagnostic__track">
        {EVOLVE_DIAGNOSTIC_STAGES.map((stage, index) => (
          <li key={stage.id} className="site00-evolve-diagnostic__stage">
            <span className="site00-evolve-diagnostic__icon">
              <StageIcon stageId={stage.id} />
            </span>
            <p className="site00-evolve-diagnostic__title">{stage.title}</p>
            <p className="site00-evolve-diagnostic__body">{stage.body}</p>
            {index < EVOLVE_DIAGNOSTIC_STAGES.length - 1 ? (
              <span className="site00-evolve-diagnostic__connector" aria-hidden="true">
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
