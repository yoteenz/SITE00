import { Link } from 'react-router-dom';
import type { CtrlRoomSiteRow } from '../../hooks/useCtrlRoomData';
import { SITE00_ROUTES } from '../../config/routes';

type CtrlRoomSitesPanelProps = {
  rows: CtrlRoomSiteRow[];
};

export function CtrlRoomSitesPanel({ rows }: CtrlRoomSitesPanelProps) {
  return (
    <section className="site00-ctrl-panel site00-ctrl-panel--sites" aria-labelledby="ctrl-room-sites-heading">
      <h2 id="ctrl-room-sites-heading" className="site00-ctrl-panel__title">
        YOUR SITES
      </h2>
      {rows.length === 0 ? (
        <p className="site00-ctrl-panel__empty">NO SITES YET. START A BUILD FROM BLDR.</p>
      ) : (
        <ul className="site00-ctrl-sites-list">
          {rows.map((row) => (
            <li key={row.id}>
              <Link to={SITE00_ROUTES.controlSites} className="site00-ctrl-sites-list__row">
                <span className="site00-ctrl-sites-list__name">{row.name}</span>
                <span
                  className={`site00-ctrl-sites-list__status site00-ctrl-sites-list__status--${row.status.toLowerCase()}`.trim()}
                >
                  {row.status}
                </span>
                <span className="site00-ctrl-sites-list__chev" aria-hidden="true">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link to={SITE00_ROUTES.controlSites} className="site00-ctrl-panel__link">
        MANAGE SITES →
      </Link>
    </section>
  );
}
