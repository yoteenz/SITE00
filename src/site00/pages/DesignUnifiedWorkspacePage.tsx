import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DesignUnifiedWorkspace } from '../components/designUnified/DesignUnifiedWorkspace';

/**
 * Canonical `/production/:projectSlug/design` — unified DESIGN workspace (BRAND · EXPERIENCE · SURFACES · COMPILER · ASSETS).
 * Renders inside the Production chrome shell when `productionShell` is set. Legacy twin-opus UI lives at `/design-legacy/*` only.
 */
type Props = { productionShell?: boolean };

export default function DesignUnifiedWorkspacePage({ productionShell = false }: Props) {
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
  return (
    <DesignUnifiedWorkspace
      key={projectSlug.toLowerCase()}
      projectSlug={projectSlug.toLowerCase()}
      productionShell={productionShell}
    />
  );
}
