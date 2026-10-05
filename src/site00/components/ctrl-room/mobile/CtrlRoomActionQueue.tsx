import { Link } from 'react-router-dom';
import { CTRL_ROOM_MOBILE_COPY } from '../../../config/ctrl-room-mobile';
import type { CtrlRoomLoadState } from '../../../hooks/useCtrlRoomData';
import type { CtrlRoomSignalPayload } from '../../../services/clientProductionApi';

type CtrlRoomActionQueueProps = {
  signals: CtrlRoomSignalPayload[];
  apiState: CtrlRoomLoadState;
};

export function CtrlRoomActionQueue({ signals, apiState }: CtrlRoomActionQueueProps) {
  const copy = CTRL_ROOM_MOBILE_COPY.actionQueue;
  const count = signals.length;
  const padded = String(count).padStart(2, '0');

  return (
    <section className="site00-ctrl-room-queue" aria-labelledby="ctrl-room-queue-title">
      <h2 id="ctrl-room-queue-title" className="site00-ctrl-room-queue__title">
        {copy.title}
      </h2>

      {apiState === 'loading' ? (
        <div className="site00-ctrl-room-queue__body site00-ctrl-room-queue__body--loading" aria-busy="true">
          <span className="site00-ctrl-room-queue__node" aria-hidden="true" />
          <p>EVALUATING QUEUE…</p>
        </div>
      ) : null}

      {apiState === 'error' ? (
        <div className="site00-ctrl-room-queue__body">
          <span className="site00-ctrl-room-queue__node site00-ctrl-room-queue__node--neutral" aria-hidden="true" />
          <p>{copy.unavailable}</p>
        </div>
      ) : null}

      {apiState === 'ready' && count === 0 ? (
        <div className="site00-ctrl-room-queue__body">
          <div className="site00-ctrl-room-queue__index-wrap">
            <span className="site00-ctrl-room-queue__index">{copy.emptyIndex}</span>
            <span className="site00-ctrl-room-queue__node site00-ctrl-room-queue__node--neutral" aria-hidden="true" />
          </div>
          <div className="site00-ctrl-room-queue__copy">
            <p className="site00-ctrl-room-queue__label">{copy.emptyLabel}</p>
            <p className="site00-ctrl-room-queue__empty-body">{copy.emptyBody}</p>
          </div>
        </div>
      ) : null}

      {apiState === 'ready' && count > 0 ? (
        <div className="site00-ctrl-room-queue__signals">
          <p className="site00-ctrl-room-queue__count">
            {padded} {copy.emptyLabel}
          </p>
          <ul className="site00-ctrl-room-queue__list">
            {signals.map((signal) => (
              <li key={signal.id}>
                <article className="site00-ctrl-room-queue__signal">
                  <p className="site00-ctrl-room-queue__signal-title">
                    {signal.project_name} · {signal.title}
                  </p>
                  <p className="site00-ctrl-room-queue__signal-reason">{signal.reason}</p>
                  <Link to={signal.action_route} className="site00-ctrl-room-queue__signal-action">
                    {signal.action_label} →
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
