import { Link } from 'react-router-dom';
import { clientAppPath } from '../../../../shared/site00-client-app/routes.js';
import { CLIENT_APP_FIXTURE_SLUGS, getMultiProjectFixtureSummaries } from '../../../../shared/site00-client-app/fixtures.js';
import { AppStatusDot } from '../../components/clientApp/Site00ClientAppShell';

/** Dev-only project select preview (screen 02) — no auth. */
export default function AppPreviewSelectPage() {
  if (!import.meta.env.DEV) {
    return null;
  }

  const projects = getMultiProjectFixtureSummaries();

  return (
    <div className="site00-app" style={{ ['--site00-app-accent' as string]: '#e8192c' }}>
      <div className="site00-app-shell">
        <header className="site00-app-header">
          <div className="site00-app-header__project">
            <span className="site00-app-header__name">YOUR PROJECTS</span>
          </div>
        </header>
        <main className="site00-app-main site00-app-main--no-nav">
          {projects.map((p) => (
            <Link
              key={p.slug}
              to={`/app/preview/${p.slug}`}
              className="site00-app-project-select__card"
            >
              <div className="site00-app-project-select__preview" />
              <div className="site00-app-project-select__body">
                <div className="site00-app-project-select__name">{p.displayName}</div>
                <div className="site00-app-home__status-row">
                  <AppStatusDot />
                  <span className="site00-app-home__status-label">{p.statusLabel}</span>
                </div>
                <div className="site00-app-home__moment">{p.projectNumber}</div>
                <span className="site00-app-link-cta">OPEN PROJECT →</span>
              </div>
            </Link>
          ))}
          <Link to={clientAppPath(CLIENT_APP_FIXTURE_SLUGS.C_NDXBOOK)} className="site00-app-link-cta">
            OPEN AUTHENTICATED APP →
          </Link>
        </main>
      </div>
    </div>
  );
}
