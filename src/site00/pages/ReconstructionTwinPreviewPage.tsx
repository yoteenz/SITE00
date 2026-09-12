/**
 * P0.VR.UPGRADE.2 — Protected interactive twin preview route.
 */

import { Navigate, useParams } from 'react-router-dom';
import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react';
import { resolveTwinSessionForPreviewRoute } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/twinPreviewHandoff.js';
import { ReconstructionTwinProvider } from '../components/reconstruction/ReconstructionTwinContext';
import { ReconstructionTwinBanner } from '../components/reconstruction/ReconstructionTwinBanner';
import { ReconstructionTwinOverviewSurface } from '../components/reconstruction/ReconstructionTwinOverviewSurface';
import { isSignedIn, canAccessAdminPages } from '../../utils/adminAuth';
import { SITE00_ROUTES } from '../config/routes';
import '../styles/site00-reconstruction-twin.css';

class TwinPreviewErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[twin-preview]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="site00-page site00-reconstruction-twin-missing">
          <p>TWIN PREVIEW CRASHED</p>
          <p className="site00-body">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function useRobotsNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      if (meta.parentNode) meta.parentNode.removeChild(meta);
    };
  }, []);
}

export default function ReconstructionTwinPreviewPage() {
  const { projectSlug = '', pageScope = '', sessionId = '' } = useParams<{
    projectSlug: string;
    pageScope: string;
    sessionId: string;
  }>();

  const [session, setSession] = useState(() =>
    sessionId && pageScope
      ? resolveTwinSessionForPreviewRoute({ projectSlug, pageScope, sessionId })
      : null,
  );

  useRobotsNoIndex();

  useEffect(() => {
    if (!sessionId || !pageScope) {
      setSession(null);
      return;
    }
    setSession(resolveTwinSessionForPreviewRoute({ projectSlug, pageScope, sessionId }));
  }, [sessionId, pageScope, projectSlug]);

  if (!isSignedIn() || !canAccessAdminPages()) {
    const returnTo = encodeURIComponent(window.location.pathname);
    return <Navigate to={`${SITE00_ROUTES.signIn}?returnTo=${returnTo}`} replace />;
  }

  if (!session || session.projectId !== projectSlug) {
    return (
      <div className="site00-page site00-reconstruction-twin-missing">
        <p>TWIN SESSION NOT FOUND OR EXPIRED.</p>
        <p className="site00-body">
          Twin data lives in this browser only (not on the server). Return to PAGE UPGRADE on{' '}
          <strong>this same host</strong>, tap OPEN TWIN again, or rebuild if storage was cleared.
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
    <TwinPreviewErrorBoundary>
      <ReconstructionTwinProvider session={session}>
        <ReconstructionTwinBanner session={session} />
        <ReconstructionTwinOverviewSurface projectSlug={projectSlug} />
      </ReconstructionTwinProvider>
    </TwinPreviewErrorBoundary>
  );
}
