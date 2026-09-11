/**
 * P0.VR.UPGRADE.2 — Protected interactive twin preview route.
 */

import { Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { getTwinSession } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/reconstructionTwinSession.js';
import { ReconstructionTwinProvider } from '../components/reconstruction/ReconstructionTwinContext';
import { ReconstructionTwinBanner } from '../components/reconstruction/ReconstructionTwinBanner';
import ProjectOperatingModulePage from './ProjectOperatingModulePage';
import { isSignedIn, canAccessAdminPages } from '../../utils/adminAuth';
import { SITE00_ROUTES } from '../config/routes';
import '../styles/site00-reconstruction-twin.css';

export default function ReconstructionTwinPreviewPage() {
  const { projectSlug = '', sessionId = '' } = useParams<{ projectSlug: string; sessionId: string }>();
  const session = getTwinSession(sessionId);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  if (!isSignedIn() || !canAccessAdminPages()) {
    const returnTo = encodeURIComponent(window.location.pathname);
    return <Navigate to={`${SITE00_ROUTES.signIn}?returnTo=${returnTo}`} replace />;
  }

  if (!session || session.projectId !== projectSlug) {
    return (
      <div className="site00-page site00-reconstruction-twin-missing">
        <p>TWIN SESSION NOT FOUND OR EXPIRED.</p>
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
      <ProjectOperatingModulePage forcedModule="OVERVIEW" />
    </ReconstructionTwinProvider>
  );
}
