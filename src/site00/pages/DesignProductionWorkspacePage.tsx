/**
 * P0.VR.DESIGN-INTEGRATION1 — Production DESIGN workspace (promoted twin-opus-direct).
 */

import { useEffect } from 'react';
import { Navigate, Outlet, useParams, useSearchParams } from 'react-router-dom';

import { DesignWorkspaceCore } from '../components/designBench/production/DesignWorkspaceCore';
import { resolveLegacyProjectDesignRedirect } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';
import '../styles/site00-twin-opus-direct.css';
import '../styles/site00-twin-opus-list.css';
import '../styles/site00-design-production-child.css';
import '../styles/site00-design-child-surface.css';
import '../styles/site00-design-agent.css';

function DesignProductionBodyEffects() {
  useEffect(() => {
    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousBackground = body.style.background;
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    body.style.background = '#050505';
    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
      body.style.background = previousBackground;
    };
  }, []);
  return null;
}

/** Gate: legacy redirect rules, then production layout. */
export function DesignProductionRouteGate() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const [searchParams] = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const resolution = resolveLegacyProjectDesignRedirect(projectSlug, search);
  if (resolution.redirect) {
    const target = `${resolution.target.pathname}${resolution.target.search}`;
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}

export function DesignProductionWorkspaceLayout() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const slug = (projectSlug ?? 'ndxbook').toLowerCase();

  return (
    <>
      <DesignProductionBodyEffects />
      <DesignWorkspaceCore projectSlug={slug} role="production-provisional" />
    </>
  );
}

export default DesignProductionRouteGate;
