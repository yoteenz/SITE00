import { Navigate, useParams } from 'react-router-dom';
import { site00ProductionDesignPath } from '../../config/routes';
import DesignUnifiedWorkspacePage from '../DesignUnifiedWorkspacePage';

const LEGACY_DESIGN_SECTIONS = new Set(['references', 'assets', 'pages', 'skins', 'history', 'more']);

/** Canonical `/production/:projectSlug/design` — unified workspace; legacy section paths redirect here. */
export default function ProductionCanonicalDesignRoute() {
  const { projectSlug = 'ndxbook', '*': splat } = useParams<{ projectSlug: string; '*': string }>();
  const slug = projectSlug.toLowerCase();
  const section = (splat ?? '').replace(/\/$/, '').split('/')[0] ?? '';
  if (section && LEGACY_DESIGN_SECTIONS.has(section)) {
    return <Navigate to={site00ProductionDesignPath(slug)} replace />;
  }
  return <DesignUnifiedWorkspacePage productionShell />;
}
