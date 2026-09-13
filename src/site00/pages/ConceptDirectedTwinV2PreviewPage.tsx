/**
 * P0.VR.TWINV2.1 — Experimental concept-directed twin preview (not live).
 */

import { Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { decodeTwinV2PreviewSessionId } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/buildTwinV2Route.js';
import { resolveConceptDirectedTwinSessionForPreview } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/twinV2PreviewHandoff.js';
import { ConceptDirectedNdxOverviewTwinV2 } from '../components/reconstruction/ConceptDirectedNdxOverviewTwinV2.js';
import { isSignedIn } from '../../utils/adminAuth';
import { SITE00_ROUTES } from '../config/routes';
import '../styles/site00-twin-v2-concept.css';

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

export default function ConceptDirectedTwinV2PreviewPage() {
  const { projectSlug = '', sessionId: sessionIdParam = '' } = useParams<{ projectSlug: string; sessionId: string }>();
  const sessionId = sessionIdParam ? decodeTwinV2PreviewSessionId(sessionIdParam) : '';
  const [session, setSession] = useState(() =>
    sessionId ? resolveConceptDirectedTwinSessionForPreview({ projectSlug, sessionId }) : null,
  );

  useRobotsNoIndex();

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      return;
    }
    setSession(resolveConceptDirectedTwinSessionForPreview({ projectSlug, sessionId }));
  }, [sessionId, projectSlug]);

  if (!isSignedIn()) {
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    return <Navigate to={`${SITE00_ROUTES.signIn}?returnTo=${returnTo}`} replace />;
  }

  if (!session || session.projectId !== projectSlug) {
    return (
      <div className="site00-page site00-twin-v2-missing">
        <p>TWIN V2 SESSION NOT FOUND</p>
        <p className="site00-body">Open from PAGE UPGRADE → CREATE TWIN V2.</p>
      </div>
    );
  }

  if (!session.renderedTwin?.builtAt) {
    return (
      <div className="site00-page site00-twin-v2-missing">
        <p>TWIN V2 NOT BUILT YET</p>
        <p className="site00-body">Approve visual concept, then BUILD TWIN V2.</p>
      </div>
    );
  }

  return (
    <div className="site00-twin-v2-preview-page">
      <div className="site00-twin-v2-preview-banner" role="status">
        TWIN V2 · CONCEPT-DIRECTED · NOT LIVE
      </div>
      <ConceptDirectedNdxOverviewTwinV2 projectSlug={projectSlug} session={session} />
    </div>
  );
}
