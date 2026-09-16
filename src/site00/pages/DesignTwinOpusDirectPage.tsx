/**
 * P0.VR.DESIGNBENCH.OPUS-DIRECT1 — `/projects/:projectSlug/design/twin-opus-direct`
 *
 * P0.VR.DESIGN-INTEGRATION1 — authority reference / QA route (production is
 * `/projects/:projectSlug/design`).
 */

import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { DesignAgentDock } from '../components/designBench/designAgent/DesignAgentDock';
import { DesignAgentDockProvider } from '../components/designBench/designAgent/DesignAgentDockContext';
import { TwinOpusDirectScreen } from '../components/designBench/opusDirect/TwinOpusDirectScreen';
import { DESIGN_INTEGRATION_LINEAGE } from '../../../shared/site00-design-workspace-production/designIntegrationLineage.js';
import { site00ProjectDesignPath } from '../config/routes';
import '../styles/site00-twin-opus-direct.css';
import '../styles/site00-twin-opus-list.css';
import '../styles/site00-design-production-child.css';

export function DesignTwinOpusDirectPage() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const slug = projectSlug.toLowerCase();

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

  return (
    <DesignAgentDockProvider>
      <div className="tod-ref-banner" role="status" data-testid="design-twin-reference-banner">
        <span>
          TWIN REFERENCE / QA · SOURCE {DESIGN_INTEGRATION_LINEAGE.sourceDesign} · promoted to{' '}
          {DESIGN_INTEGRATION_LINEAGE.promotedTo}
        </span>
        <Link to={site00ProjectDesignPath(slug)}>OPEN PRODUCTION DESIGN</Link>
      </div>
      <TwinOpusDirectScreen projectSlug={slug} surface="reference" />
      <DesignAgentDock />
    </DesignAgentDockProvider>
  );
}

export default DesignTwinOpusDirectPage;
