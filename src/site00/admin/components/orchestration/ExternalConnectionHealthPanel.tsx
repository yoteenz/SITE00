import type { ConnectionHealthItem, DriftAlert } from '../../types/orchestration';

function stateClass(state: string): string {
  const s = state.toUpperCase();
  if (s === 'CONNECTED') return 'site00-control-priority__pill--ready';
  if (s === 'PARTIAL' || s === 'STALE') return 'site00-control-priority__pill--action';
  if (s === 'UNAVAILABLE' || s === 'ERROR') return 'site00-control-priority__pill--blocked';
  return 'site00-control-priority__pill--info';
}

export function ExternalConnectionHealthPanel({ connections }: { connections: ConnectionHealthItem[] }) {
  return (
    <section className="site00-control-panel" aria-labelledby="ext-conn-heading">
      <div className="site00-control-panel__head">
        <h2 id="ext-conn-heading" className="site00-control-panel__title">EXTERNAL SYSTEMS</h2>
      </div>
      <ul className="site00-orchestration-conn-list">
        {connections.map((c) => (
          <li key={c.id} className="site00-orchestration-conn-row">
            <div>
              <p className="site00-orchestration-conn-row__name">{c.logicalName}</p>
              <p className="site00-orchestration-meta">{c.organizationName}{c.externalIdentifier ? ` · ${c.externalIdentifier}` : ''}</p>
              {c.errorReason ? <p className="site00-orchestration-error-text">{c.errorReason}</p> : null}
            </div>
            <span className={`site00-control-priority__pill ${stateClass(c.state)}`}>{c.state}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DriftVisibilityPanel({ alerts }: { alerts: DriftAlert[] }) {
  if (alerts.length === 0) return null;
  return (
    <section className="site00-control-panel" aria-labelledby="drift-heading">
      <div className="site00-control-panel__head">
        <h2 id="drift-heading" className="site00-control-panel__title">DRIFT / STALE STATE</h2>
      </div>
      <ul className="site00-orchestration-drift-list">
        {alerts.map((a) => (
          <li key={a.id} className="site00-orchestration-drift-row">
            <span className="site00-control-priority__pill site00-control-priority__pill--action">{a.label}</span>
            <span>{a.organizationSlug.toUpperCase()} — {a.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
