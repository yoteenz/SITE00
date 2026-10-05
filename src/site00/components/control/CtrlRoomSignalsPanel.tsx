import { Link } from 'react-router-dom';
import { CTRL_ROOM_MOBILE_COPY } from '../../config/ctrl-room-mobile';
import type { CtrlRoomLoadState } from '../../hooks/useCtrlRoomData';
import type { CtrlRoomSignalPayload } from '../../services/clientProductionApi';

type CtrlRoomSignalsPanelProps = {
  signals: CtrlRoomSignalPayload[];
  apiState: CtrlRoomLoadState;
};

/** Desktop attention panel — data supplied by useCtrlRoomData (no duplicate fetch). */
export function CtrlRoomSignalsPanel({ signals, apiState }: CtrlRoomSignalsPanelProps) {
  const copy = CTRL_ROOM_MOBILE_COPY.actionQueue;

  if (apiState === 'loading') {
    return (
      <section className="site00-ctrl-panel">
        <h2 className="site00-ctrl-panel__title">ATTENTION</h2>
        <p className="site00-body">EVALUATING QUEUE…</p>
      </section>
    );
  }

  if (apiState === 'error') {
    return (
      <section className="site00-ctrl-panel">
        <h2 className="site00-ctrl-panel__title">ATTENTION</h2>
        <p className="site00-body">{copy.unavailable}</p>
      </section>
    );
  }

  if (signals.length === 0) {
    return (
      <section className="site00-ctrl-panel">
        <h2 className="site00-ctrl-panel__title">ATTENTION</h2>
        <p className="site00-body">{copy.emptyBody}</p>
      </section>
    );
  }

  return (
    <section className="site00-ctrl-panel">
      <h2 className="site00-ctrl-panel__title">
        ATTENTION · {String(signals.length).padStart(2, '0')}
      </h2>
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
