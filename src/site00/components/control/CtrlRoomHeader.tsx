import { ctrlRoomNavLabel } from '../../config/ctrl-room-nav';
import { site00UserDisplayName, site00UserInitials, useSite00CurrentUser } from '../../hooks/useSite00CurrentUser';
import { useLocation } from 'react-router-dom';

export function CtrlRoomHeader() {
  const { pathname } = useLocation();
  const user = useSite00CurrentUser();
  const section = ctrlRoomNavLabel(pathname);
  const displayName = site00UserDisplayName(user);
  const initials = site00UserInitials(user);

  return (
    <header className="site00-ctrl-header">
      <div className="site00-ctrl-header__titles">
        <h1 className="site00-ctrl-header__room">
          <span className="site00-ctrl-header__bracket">[</span> CTRL ROOM <span className="site00-ctrl-header__bracket">]</span>
        </h1>
        <p className="site00-ctrl-header__section">{section}</p>
      </div>
      <div className="site00-ctrl-header__profile">
        {displayName ? <span className="site00-ctrl-header__name">{displayName}</span> : null}
        <span className="site00-ctrl-header__avatar" aria-hidden="true">
          {initials || '—'}
        </span>
        <span className="site00-ctrl-header__caret" aria-hidden="true">
          ▾
        </span>
      </div>
    </header>
  );
}
