/**
 * B5.3 — Production Intelligence expanded accordion (operational control panel).
 */

type Props = {
  activeGate: string;
  providerRouting: string;
  attempts: string;
  retryPolicy: string;
  dispatchMode: string;
  readiness: string;
  nextAction: string;
  onNextAction?: () => void;
  nextActionDisabled?: boolean;
  nextActionLabel?: string;
};

export function ReferenceExpandedProductionIntelligence({
  activeGate,
  providerRouting,
  attempts,
  retryPolicy,
  dispatchMode,
  readiness,
  nextAction,
  onNextAction,
  nextActionDisabled,
  nextActionLabel,
}: Props) {
  const modules = [
    { label: 'ACTIVE GATE', value: activeGate },
    { label: 'PROVIDER ROUTING', value: providerRouting },
    { label: 'ATTEMPTS', value: attempts },
    { label: 'RETRY POLICY', value: retryPolicy },
    { label: 'DISPATCH MODE', value: dispatchMode },
    { label: 'READINESS', value: readiness },
  ];

  const actionLabel = nextActionLabel ?? 'GENERATE NEXT';

  return (
    <section className="site00-ee-ref-prod-intel">
      <div className="site00-ee-ref-prod-intel__grid">
        {modules.map((m) => (
          <article key={m.label} className="site00-ee-ref-prod-intel__module">
            <span>{m.label}</span>
            <strong>{m.value}</strong>
          </article>
        ))}
      </div>
      <div className="site00-ee-ref-prod-intel__action">
        <p>{nextAction}</p>
        {onNextAction ? (
          <button type="button" disabled={nextActionDisabled} onClick={onNextAction}>
            {actionLabel}
            <span aria-hidden>→</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
