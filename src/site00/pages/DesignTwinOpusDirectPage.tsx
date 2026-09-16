/**
 * P0.VR.DESIGN-TWIN-FUNCTIONALITY1 — twin founder review route (full functional parity).
 */

import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { DesignTwinReviewBanner } from '../components/designBench/production/DesignTwinReviewBanner';
import { DesignWorkspaceCore } from '../components/designBench/production/DesignWorkspaceCore';
import '../styles/site00-twin-opus-direct.css';
import '../styles/site00-twin-opus-list.css';
import '../styles/site00-design-production-child.css';
import '../styles/site00-design-child-surface.css';

function DesignTwinBodyEffects() {
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

export function DesignTwinWorkspaceLayout() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const slug = projectSlug.toLowerCase();

  return (
    <>
      <DesignTwinBodyEffects />
      <DesignWorkspaceCore
        projectSlug={slug}
        role="twin-founder-review"
        banner={<DesignTwinReviewBanner projectSlug={slug} />}
      />
    </>
  );
}

/** Route gate — nested `DesignTwinWorkspaceLayout` owns the workspace shell. */
export function DesignTwinOpusDirectRouteGate() {
  return <Outlet />;
}

export default DesignTwinOpusDirectRouteGate;
