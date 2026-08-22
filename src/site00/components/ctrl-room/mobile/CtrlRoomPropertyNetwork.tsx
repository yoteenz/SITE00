import { Link } from 'react-router-dom';
import { CTRL_ROOM_MOBILE_COPY } from '../../../config/ctrl-room-mobile';
import type { CtrlRoomLoadState } from '../../../hooks/useCtrlRoomData';
import type { CtrlRoomSiteRow } from '../../../hooks/useCtrlRoomData';
import { SITE00_ROUTES } from '../../../config/routes';

type CtrlRoomPropertyNetworkProps = {
  sites: CtrlRoomSiteRow[];
  apiState: CtrlRoomLoadState;
  buildHref: string;
};

export function CtrlRoomPropertyNetwork({ sites, apiState, buildHref }: CtrlRoomPropertyNetworkProps) {
  const copy = CTRL_ROOM_MOBILE_COPY.propertyNetwork;
  const loading = apiState === 'loading';
  const empty = apiState === 'ready' && sites.length === 0;

  return (
    <section className="site00-ctrl-room-network" aria-labelledby="ctrl-room-network-title">
      <h2 id="ctrl-room-network-title" className="site00-ctrl-room-network__title">
        {copy.title}
      </h2>

      {loading ? (
        <div className="site00-ctrl-room-network__skeleton" aria-busy="true" aria-label="Loading property network">
          <span />
          <span />
        </div>
      ) : null}

      {!loading && empty ? (
        <div className="site00-ctrl-room-network__empty">
          <svg viewBox="0 0 200 120" fill="none" aria-hidden="true" className="site00-ctrl-room-network__schematic">
            <circle cx="100" cy="60" r="48" stroke="rgba(196,30,58,0.12)" strokeWidth="0.75" />
            <circle cx="100" cy="60" r="32" stroke="rgba(196,30,58,0.16)" strokeWidth="0.75" />
            <circle cx="100" cy="60" r="4" fill="rgba(196,30,58,0.35)" />
            <line x1="100" y1="12" x2="100" y2="108" stroke="rgba(196,30,58,0.1)" strokeWidth="0.75" />
            <line x1="52" y1="60" x2="148" y2="60" stroke="rgba(196,30,58,0.1)" strokeWidth="0.75" />
          </svg>
          <p className="site00-ctrl-room-network__empty-title">{copy.emptyTitle}</p>
          <p className="site00-ctrl-room-network__empty-body">{copy.emptyBody}</p>
          <Link to={buildHref} className="site00-ctrl-room-network__cta">
            {copy.emptyCta}
          </Link>
        </div>
      ) : null}

      {!loading && sites.length > 0 ? (
        <div className="site00-ctrl-room-network__list-wrap">
          <ul className="site00-ctrl-room-network__list">
            {sites.slice(0, 4).map((site) => (
              <li key={site.id}>
                <Link to={SITE00_ROUTES.controlSites} className="site00-ctrl-room-network__row">
                  <span className="site00-ctrl-room-network__row-name">{site.name}</span>
                  <span className="site00-ctrl-room-network__row-domain">{site.domain}</span>
                  <span className="site00-ctrl-room-network__row-status">{site.status}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to={SITE00_ROUTES.controlSites} className="site00-ctrl-room-network__view-all">
            {copy.viewAll}
          </Link>
        </div>
      ) : null}

      {apiState === 'error' ? (
        <p className="site00-ctrl-room-network__unavailable">STATUS TEMPORARILY UNAVAILABLE</p>
      ) : null}
    </section>
  );
}
