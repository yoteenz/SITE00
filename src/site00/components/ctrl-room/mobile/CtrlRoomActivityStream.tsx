import { Link } from 'react-router-dom';
import { CTRL_ROOM_MOBILE_COPY } from '../../../config/ctrl-room-mobile';
import type { CtrlRoomActivityRow } from '../../../hooks/useCtrlRoomData';

type CtrlRoomActivityStreamProps = {
  rows: CtrlRoomActivityRow[];
  settingsHref: string;
};

export function CtrlRoomActivityStream({ rows, settingsHref }: CtrlRoomActivityStreamProps) {
  const copy = CTRL_ROOM_MOBILE_COPY.activityStream;

  return (
    <section className="site00-ctrl-room-activity" aria-labelledby="ctrl-room-activity-title">
      <header className="site00-ctrl-room-activity__header">
        <h2 id="ctrl-room-activity-title" className="site00-ctrl-room-activity__title">
          {copy.title}
        </h2>
        <p className="site00-ctrl-room-activity__micro">{copy.micro}</p>
      </header>

      {rows.length === 0 ? (
        <p className="site00-ctrl-room-activity__empty">{copy.empty}</p>
      ) : (
        <ol className="site00-ctrl-room-activity__timeline">
          {rows.map((row, index) => (
            <li key={row.id} className="site00-ctrl-room-activity__event">
              <span className="site00-ctrl-room-activity__node" aria-hidden="true" />
              {index < rows.length - 1 ? <span className="site00-ctrl-room-activity__line" aria-hidden="true" /> : null}
              <time className="site00-ctrl-room-activity__time" dateTime={row.createdAt}>
                {row.clockTime}
              </time>
              <p className="site00-ctrl-room-activity__system">{row.system}</p>
              <p className="site00-ctrl-room-activity__event-title">{row.event}</p>
              <p className="site00-ctrl-room-activity__detail">{row.detail}</p>
            </li>
          ))}
        </ol>
      )}

      <Link to={settingsHref} className="site00-ctrl-room-activity__view-all">
        {copy.viewAll}
      </Link>
    </section>
  );
}
