import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { CTRL_ROOM_MOBILE_COPY } from '../../../config/ctrl-room-mobile';

export function CtrlRoomAdminAccess() {
  const copy = CTRL_ROOM_MOBILE_COPY.adminAccess;

  return (
    <section className="site00-ctrl-room-admin-access" aria-labelledby="ctrl-room-admin-access-title">
      <div className="site00-ctrl-room-admin-access__copy">
        <p className="site00-ctrl-room-admin-access__kicker">{copy.kicker}</p>
        <h2 id="ctrl-room-admin-access-title" className="site00-ctrl-room-admin-access__title">
          {copy.title}
        </h2>
        <p className="site00-ctrl-room-admin-access__body">{copy.body}</p>
      </div>
      <Link to={SITE00_ROUTES.adminDashboard} className="site00-ctrl-room-admin-access__cta">
        {copy.cta}
      </Link>
    </section>
  );
}
