import { Link } from 'react-router-dom';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { SITE00_ROUTES } from '../../../config/routes';

/** Family F — founder communications command (routes into existing email pack + future journey builder). */
export default function CommunicationsCommandPage() {
  return (
    <div className="site00-admin-page">
      <header>
        <h1>Communications command</h1>
        <p>Transactional and marketing sends remain disabled until founder authorization. Preview and approve templates first.</p>
      </header>
      <ul>
        <li>
          <Link to={SITE00_ADMIN_ROUTES.emailPack}>Email template studio (existing debug gallery)</Link>
        </li>
        <li>
          <Link to={SITE00_ROUTES.digitalFoundationAdmin}>Digital Foundation admin</Link>
        </li>
      </ul>
      <p>
        Lifecycle event map: <code>shared/site00-digital-foundation/communications/eventMap.ts</code>. Send intents default to{' '}
        <strong>DRY_RUN</strong>.
      </p>
    </div>
  );
}
