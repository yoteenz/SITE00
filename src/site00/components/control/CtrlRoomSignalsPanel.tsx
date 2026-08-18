import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { site00ClientProductionApi } from '../../services/clientProductionApi';

export type CtrlRoomSignal = {
  id: string;
  project_name: string;
  signal_type: string;
  title: string;
  reason: string;
  owner: string;
  age_days: number;
  action_route: string;
  action_label: string;
};

export function CtrlRoomSignalsPanel() {
  const [signals, setSignals] = useState<CtrlRoomSignal[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    site00ClientProductionApi
      .ctrlRoom()
      .then((data) => setSignals((data as { signals?: CtrlRoomSignal[] }).signals ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD SIGNALS'));
  }, []);

  if (error) {
    return (
      <section className="site00-ctrl-panel">
        <h2 className="site00-ctrl-panel__title">ATTENTION</h2>
        <p className="site00-body">{error.toUpperCase()}</p>
      </section>
    );
  }

  if (signals.length === 0) {
    return (
      <section className="site00-ctrl-panel">
        <h2 className="site00-ctrl-panel__title">ATTENTION</h2>
        <p className="site00-body">NO ACCESS REQUIRED — ALL INFRASTRUCTURE FOR YOUR CURRENT PHASE IS READY.</p>
      </section>
    );
  }

  return (
    <section className="site00-ctrl-panel">
      <h2 className="site00-ctrl-panel__title">ATTENTION · {signals.length}</h2>
      <div className="site00-ctrl-signals">
        {signals.map((signal) => (
          <article key={signal.id} className="site00-ctrl-signal">
            <p className="site00-ctrl-signal__type">
              {signal.project_name} · {signal.title}
            </p>
            <p className="site00-body">{signal.reason}</p>
            <p className="site00-body">
              OWNER: {signal.owner.toUpperCase()} · AGE: {signal.age_days} DAYS
            </p>
            <Link className="site00-btn-ghost-sm" to={signal.action_route}>
              {signal.action_label} →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
