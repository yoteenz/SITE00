import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { CLIENT_APP_FIXTURES } from '../../../../shared/site00-client-app/fixtures.js';
import { clientAppPath } from '../../../../shared/site00-client-app/routes.js';
import { Site00ClientAppShell } from '../../components/clientApp/Site00ClientAppShell';
import type { ClientAppManifest } from '../../../../shared/site00-client-app/types.js';
import { isSite00ClientAppPreviewFeatureActive } from '../../auth/clientAppPreviewState';

function resolveActiveSection(pathname: string): string {
  if (pathname.includes('/reviews')) return 'reviews';
  if (pathname.includes('/inbox')) return 'inbox';
  if (pathname.includes('/library')) return 'library';
  if (pathname.includes('/project')) return 'project';
  return 'home';
}

export function AppPreviewLayout() {
  const { projectSlug = '' } = useParams();
  const location = useLocation();
  const manifest: ClientAppManifest | undefined = CLIENT_APP_FIXTURES[projectSlug];

  if (!isSite00ClientAppPreviewFeatureActive()) {
    return <Navigate to={clientAppPath()} replace />;
  }

  if (!manifest) {
    return <Navigate to={clientAppPath()} replace />;
  }

  return (
    <Site00ClientAppShell manifest={manifest} activeSection={resolveActiveSection(location.pathname)}>
      <Outlet context={{ manifest, reload: async () => {} }} />
    </Site00ClientAppShell>
  );
}

export type AppOutletContext = {
  manifest: ClientAppManifest;
  reload: () => Promise<void>;
};
