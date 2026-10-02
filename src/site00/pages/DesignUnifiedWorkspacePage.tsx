import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DesignUnifiedWorkspace } from '../components/designUnified/DesignUnifiedWorkspace';

/**
 * `/production/:projectSlug/design-workspace` — the unified DESIGN workspace (BRAND · EXPERIENCE · SURFACES · COMPILER · ASSETS).
 * Additive route inside the existing internal-production guard; the legacy `/production/:slug/design/*` tooling is untouched.
 */
export default function DesignUnifiedWorkspacePage() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  useEffect(() => {
    const { body, documentElement } = document;
    const prev = [body.style.overflow, documentElement.style.overflow, body.style.background];
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    body.style.background = '#f4f4f3';
    return () => {
      body.style.overflow = prev[0]!;
      documentElement.style.overflow = prev[1]!;
      body.style.background = prev[2]!;
    };
  }, []);
  return <DesignUnifiedWorkspace key={projectSlug.toLowerCase()} projectSlug={projectSlug.toLowerCase()} />;
}
