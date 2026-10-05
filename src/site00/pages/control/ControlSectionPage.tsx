import { Link, useLocation } from 'react-router-dom';
import { canAccessAdminPages } from '../../../utils/adminAuth';
import { SITE00_ADMIN_ROUTES } from '../../admin/config/routes';
import { ctrlRoomNavLabel } from '../../config/ctrl-room-nav';
import { SITE00_ROUTES } from '../../config/routes';
import { EcosystemShell } from '../../components/ecosystem/EcosystemShell';

export default function ControlSectionPage() {
  const { pathname } = useLocation();
  const section = ctrlRoomNavLabel(pathname);
  const isSettings = pathname === SITE00_ROUTES.controlSettings;
  const showOperatorTools = isSettings && canAccessAdminPages();

  return (
    <EcosystemShell title={section} subtitle="ACCOUNT SERVICES AND SETTINGS.">
      {showOperatorTools ? (
        <section className="site00-ctrl-section site00-ctrl-section--operator">
          <p className="site00-ctrl-section__kicker">00 / CONTROL · OPERATOR</p>
          <p className="site00-ctrl-section__lead">PRIVILEGED ADMIN TOOLS — NOT VISIBLE TO CLIENT ACCOUNTS.</p>
          <div className="site00-ctrl-section__actions">
            <Link className="site00-ctrl-section__cta" to={SITE00_ADMIN_ROUTES.emailPack}>
              EMAIL SYSTEM / DEBUG →
            </Link>
            <Link className="site00-ctrl-section__cta site00-ctrl-section__cta--secondary" to={SITE00_ADMIN_ROUTES.dashboard}>
              OPEN 00 / CONTROL →
            </Link>
            <Link className="site00-ctrl-section__cta site00-ctrl-section__cta--secondary" to={SITE00_ADMIN_ROUTES.settings}>
              OPERATOR SETTINGS →
            </Link>
          </div>
        </section>
      ) : null}

      <section className="site00-ctrl-section">
        <p className="site00-ctrl-section__lead">
          {section} MODULES WILL APPEAR HERE AS SITE 00 ACCOUNT SERVICES EXPAND.
        </p>
        <p className="site00-ctrl-section__hint">YOUR SESSION AND PROFILE REMAIN CONNECTED TO THE EXISTING ACCOUNT SYSTEM.</p>
      </section>
    </EcosystemShell>
  );
}
