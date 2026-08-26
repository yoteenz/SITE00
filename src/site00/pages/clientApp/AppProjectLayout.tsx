import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { clientAppPath } from '../../../../shared/site00-client-app/client.js';
import { useClientAppManifest } from '../../hooks/useClientAppManifest';
import { AppEmptyState, AppLoadingState, Site00ClientAppShell } from '../../components/clientApp/Site00ClientAppShell';

function resolveActiveSection(pathname: string): string {
  if (pathname.includes('/reviews')) return 'reviews';
  if (pathname.includes('/inbox')) return 'inbox';
  if (pathname.includes('/library')) return 'library';
  if (pathname.includes('/project')) return 'project';
  return 'home';
}

export function AppProjectLayout() {
  const { projectSlug = '' } = useParams();
  const location = useLocation();
  const activeSection = resolveActiveSection(location.pathname);
  const { data, state, error, reload } = useClientAppManifest(projectSlug);

  if (!projectSlug) return <Navigate to={clientAppPath(undefined)} replace />;

  if (state === 'loading' || state === 'idle') {
    return (
      <div className="site00-app">
        <AppLoadingState />
      </div>
    );
  }

  if (state === 'error' || !data) {
    return (
      <div className="site00-app">
        <AppEmptyState title="COULD NOT LOAD PROJECT" body={error ?? undefined} />
        <button type="button" className="site00-app-btn site00-app-btn--secondary" onClick={() => void reload()}>
          TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <Site00ClientAppShell manifest={data} activeSection={activeSection}>
      <Outlet context={{ manifest: data, reload }} />
    </Site00ClientAppShell>
  );
}

export type AppOutletContext = {
  manifest: NonNullable<ReturnType<typeof useClientAppManifest>['data']>;
  reload: () => Promise<void>;
};
