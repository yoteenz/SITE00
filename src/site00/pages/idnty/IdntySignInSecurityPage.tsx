import { Link } from 'react-router-dom';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { EmptyState, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { Site00LockIcon } from '../../icons/Site00HubIcons';
import { useSite00CurrentUser } from '../../hooks/useSite00CurrentUser';
import { SITE00_ROUTES } from '../../config/routes';

export default function IdntySignInSecurityPage() {
  const user = useSite00CurrentUser();

  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--idnty-detail">
        <Link to={SITE00_ROUTES.idnty} className="site00-back-link">
          ← BACK
        </Link>
        <header className="site00-detail-hero">
          <Site00LockIcon size={32} />
          <PageIntro
            title={<h1 className="site00-detail-title">SIGN IN &amp; SECURITY</h1>}
            subtitle="MANAGE YOUR PASSWORD, 2FA, AND SIGN IN PREFERENCES."
          />
        </header>

        <section className="site00-detail-section">
          <h2 className="site00-label-red">ACCOUNT SECURITY</h2>
          <dl className="site00-detail-list">
            <div>
              <dt>PASSWORD</dt>
              <dd>••••••••</dd>
            </div>
            <div>
              <dt>TWO-FACTOR AUTHENTICATION</dt>
              <dd>NOT AVAILABLE</dd>
            </div>
            <div>
              <dt>SIGN IN SESSIONS</dt>
              <dd id="sessions">CURRENT SESSION ONLY</dd>
            </div>
            <div>
              <dt>TRUSTED DEVICES</dt>
              <dd>NOT AVAILABLE</dd>
            </div>
          </dl>
        </section>

        <section className="site00-detail-section">
          <h2 className="site00-label-red">SIGN IN PREFERENCES</h2>
          <dl className="site00-detail-list">
            <div>
              <dt>SIGN IN EMAIL</dt>
              <dd>{user?.email ?? '—'}</dd>
            </div>
            <div>
              <dt>MAGIC LINK</dt>
              <dd>AVAILABLE AT SIGN-IN</dd>
            </div>
            <div>
              <dt>SESSION TIMEOUT</dt>
              <dd>MANAGED BY SUPABASE SESSION</dd>
            </div>
          </dl>
        </section>

        <section className="site00-detail-section">
          <h2 className="site00-label-red">RECENT ACTIVITY</h2>
          <EmptyState title="NO ACTIVITY LOG" body="DETAILED SIGN-IN ACTIVITY IS NOT YET EXPOSED IN SITE 00." />
        </section>

        <p className="site00-detail-help">
          NEED HELP?{' '}
          <Link to={SITE00_ROUTES.support} className="site00-link-red">
            VISIT SUPPORT →
          </Link>
        </p>
      </div>
    </Site00PublicShell>
  );
}
