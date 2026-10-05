import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';
import { SITE00_CTRL_ROOM_PATH } from '../../config/mobile-directory-nav';

/** Desktop-only system strip — physical detection + origin motif + subtle nav. */
export function AccessSystemFooter({ showDetection = true }: { showDetection?: boolean }) {
  return (
    <footer className="site00-access-footer" aria-label="SITE 00 ACCESS SYSTEM">
      <div className="site00-access-footer__left">
        {showDetection ? (
          <>
            <span>PHYSICAL CREDENTIAL DETECTED.</span>
            <span>WELCOME TO SITE 00.</span>
          </>
        ) : null}
      </div>

      <div className="site00-access-footer__center" aria-hidden="true">
        <span className="site00-access-footer__motif">
          <span className="site00-access-footer__motif-line" />
          <span className="site00-access-footer__motif-node" />
          <span className="site00-access-footer__motif-line" />
        </span>
        <span className="site00-access-footer__origin">ORIGIN AWAITS</span>
      </div>

      <nav className="site00-access-footer__nav" aria-label="SITE 00 DESTINATIONS">
        <div className="site00-access-footer__nav-row">
          <Link to={SITE00_ROUTES.idntyState}>IDENTITY</Link>
          <span aria-hidden="true"> • </span>
          <Link to={SITE00_ROUTES.locations}>LOCATIONS</Link>
          <span aria-hidden="true"> • </span>
          <Link to={SITE00_ROUTES.projects}>PROJECTS</Link>
        </div>
        <Link to={SITE00_CTRL_ROOM_PATH} className="site00-access-footer__ctrl">
          CTRL ROOM
        </Link>
      </nav>
    </footer>
  );
}
