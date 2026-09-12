/**
 * P0.VR.UPGRADE.2 — Protected interactive twin preview route.
 */

import { Navigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { resolveTwinSessionForPreviewRoute } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/twinPreviewHandoff.js';
import { ReconstructionTwinProvider } from '../components/reconstruction/ReconstructionTwinContext';
import { ReconstructionTwinBanner } from '../components/reconstruction/ReconstructionTwinBanner';
import ProjectOperatingModulePage from './ProjectOperatingModulePage';
import { isSignedIn, canAccessAdminPages } from '../../utils/adminAuth';
import { SITE00_ROUTES } from '../config/routes';
import '../styles/site00-reconstruction-twin.css';

export default function ReconstructionTwinPreviewPage() {
  const { projectSlug = '', pageScope = '', sessionId = '' } = useParams<{
    projectSlug: string;
    pageScope: string;
    sessionId: string;
  }>();
  const [resolved, setResolved] = useState(false);
  const [session, setSession] = useState(() =>
    sessionId && pageScope
      ? resolveTwinSessionForPreviewRoute({ projectSlug, pageScope, sessionId })
      : null,
  );

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      setResolved(true);
      return;
    }
    setResolved(false);
    const found =
      pageScope && sessionId
        ? resolveTwinSessionForPreviewRoute({ projectSlug, pageScope, sessionId })
        : null;
    setSession(found);
    setResolved(true);
  }, [sessionId, pageScope, projectSlug]);

  const twinPage = useMemo(() => {
    if (!session) return null;
    const route = session.canonicalRoute.replace(/\/$/, '');
    if (route.endsWith('/overview')) {
      return <ProjectOperatingModulePage forcedModule="OVERVIEW" />;
    }
    return <ProjectOperatingModulePage forcedModule="OVERVIEW" />;
  }, [session]);

  if (!isSignedIn() || !canAccessAdminPages()) {
    const returnTo = encodeURIComponent(window.location.pathname);
    return <Navigate to={`${SITE00_ROUTES.signIn}?returnTo=${returnTo}`} replace />;
  }

  if (!resolved) {
    return (
      <div className="site00-page site00-reconstruction-twin-missing">
        <p>LOADING TWIN PREVIEW…</p>
      </div>
    );
  }

  if (!session || session.projectId !== projectSlug) {
    return (
      <div className="site00-page site00-reconstruction-twin-missing">
        <p>TWIN SESSION NOT FOUND OR EXPIRED.</p>
        <p className="site00-body">
          Twin data lives in this browser only (not on the server). Return to PAGE UPGRADE on{' '}
          <strong>this same host</strong>, tap PREVIEW TWIN or OPEN TWIN again, or rebuild if storage was cleared.
        </p>
      </div>
    );
  }

  if (session.status === 'PLANNED' || session.status === 'BUILDING') {
    return (
      <div className="site00-page site00-reconstruction-twin-missing">
        <p>BUILDING TWIN — RETURN TO PAGE UPGRADE AND WAIT FOR TWIN READY.</p>
      </div>
    );
  }

  return (
    <ReconstructionTwinProvider session={session}>
      <ReconstructionTwinBanner session={session} />
      {twinPage}
    </ReconstructionTwinProvider>
  );
}
