import { Link, useSearchParams } from 'react-router-dom';
import { clientAppPath } from '../../../../shared/site00-client-app/client.js';
import { CLIENT_APP_FIXTURE_SLUGS } from '../../../../shared/site00-client-app/fixtures.js';
import { useClientAppProjects } from '../../hooks/useClientAppProjects';
import { AppEmptyState, AppLoadingState, AppStatusDot } from '../../components/clientApp/Site00ClientAppShell';

export default function AppProjectSelectPage() {
  const [params] = useSearchParams();
  const fixtureMode = params.get('fixture') === 'multi' ? 'multi' : undefined;
  const { data, state, error } = useClientAppProjects(fixtureMode);

  if (state === 'loading') return <AppLoadingState />;
  if (state === 'error' || !data) {
    return <AppEmptyState title="COULD NOT LOAD PROJECTS" body={error ?? undefined} />;
  }

  const projects =
    data.projects.length > 0
      ? data.projects
      : [
          {
            id: 'preview',
            slug: CLIENT_APP_FIXTURE_SLUGS.C_NDXBOOK,
            displayName: 'NDXBOOK',
            projectNumber: 'PROJECT 001',
            statusLabel: 'IN PRODUCTION',
            statusKey: 'IN_PRODUCTION' as const,
            accentColor: '#e8192c',
            previewImageUrl: null,
            deepLink: clientAppPath(CLIENT_APP_FIXTURE_SLUGS.C_NDXBOOK),
          },
        ];

  return (
    <div className="site00-app" style={{ ['--site00-app-accent' as string]: '#e8192c' }}>
      <div className="site00-app-shell">
        <header className="site00-app-header">
          <div className="site00-app-header__project">
            <span className="site00-app-header__name">YOUR PROJECTS</span>
          </div>
        </header>
        <main className="site00-app-main">
          {projects.map((p) => (
            <Link key={p.slug} to={clientAppPath(p.slug)} className="site00-app-project-select__card">
              <div className="site00-app-project-select__preview" />
              <div className="site00-app-project-select__body">
                <div className="site00-app-project-select__name">{p.displayName}</div>
                <div className="site00-app-home__status-row">
                  <AppStatusDot />
                  <span className="site00-app-home__status-label">{p.statusLabel}</span>
                </div>
                <div className="site00-app-home__moment">{p.projectNumber}</div>
              </div>
            </Link>
          ))}
          <Link to={`${clientAppPath(undefined)}?fixture=multi`} className="site00-app-link-cta">
            VIEW ALL PROJECTS →
          </Link>
        </main>
      </div>
    </div>
  );
}
