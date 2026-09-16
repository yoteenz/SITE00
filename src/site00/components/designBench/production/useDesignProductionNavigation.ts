import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  DESIGN_PRODUCTION_PRIMARY_NAV_SECTIONS,
  type DesignProductionSection,
} from '../../../../../shared/site00-design-workspace-production/designIntegrationLineage.js';
import {
  site00ProjectDesignPath,
  site00ProjectDesignSectionPath,
  site00ProjectDesignTwinOpusDirectPath,
} from '../../../config/routes';

export function useDesignProductionNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const slug = projectSlug.toLowerCase();

  const workspacePath = site00ProjectDesignPath(slug);
  const isReferenceTwin = location.pathname.includes('/design/twin-opus-direct');
  const isProductionWorkspace =
    location.pathname === workspacePath || location.pathname.startsWith(`${workspacePath}/`);

  const activeSection = useMemo((): DesignProductionSection | null => {
    const prefix = `${workspacePath}/`;
    if (!location.pathname.startsWith(prefix)) return null;
    const rest = location.pathname.slice(prefix.length).split('/')[0];
    if (rest === 'more') return 'more';
    if ((DESIGN_PRODUCTION_PRIMARY_NAV_SECTIONS as readonly string[]).includes(rest)) {
      return rest as DesignProductionSection;
    }
    return null;
  }, [location.pathname, workspacePath]);

  const goWorkspace = useCallback(() => navigate(workspacePath), [navigate, workspacePath]);

  const goSection = useCallback(
    (section: DesignProductionSection) => navigate(site00ProjectDesignSectionPath(slug, section)),
    [navigate, slug],
  );

  const goPrimaryNavIndex = useCallback(
    (index: number) => {
      const section = DESIGN_PRODUCTION_PRIMARY_NAV_SECTIONS[index];
      if (section) goSection(section);
    },
    [goSection],
  );

  const goReferenceTwin = useCallback(
    () => navigate(site00ProjectDesignTwinOpusDirectPath(slug)),
    [navigate, slug],
  );

  return {
    projectSlug: slug,
    workspacePath,
    isReferenceTwin,
    isProductionWorkspace,
    activeSection,
    goWorkspace,
    goSection,
    goPrimaryNavIndex,
    goReferenceTwin,
  };
}
