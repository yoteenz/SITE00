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
  site00ProjectDesignTwinSectionPath,
} from '../../../config/routes';

export function useDesignProductionNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const slug = projectSlug.toLowerCase();

  const productionPath = site00ProjectDesignPath(slug);
  const twinPath = site00ProjectDesignTwinOpusDirectPath(slug);
  const isTwinWorkspace =
    location.pathname === twinPath || location.pathname.startsWith(`${twinPath}/`);
  const isProductionWorkspace =
    location.pathname === productionPath || location.pathname.startsWith(`${productionPath}/`);
  const workspacePath = isTwinWorkspace ? twinPath : productionPath;
  /** @deprecated use isTwinWorkspace */
  const isReferenceTwin = isTwinWorkspace;

  const activeSection = useMemo((): DesignProductionSection | null => {
    const prefixes = [`${productionPath}/`, `${twinPath}/`];
    const prefix = prefixes.find((p) => location.pathname.startsWith(p));
    if (!prefix) return null;
    const rest = location.pathname.slice(prefix.length).split('/')[0];
    if (rest === 'more') return 'more';
    if ((DESIGN_PRODUCTION_PRIMARY_NAV_SECTIONS as readonly string[]).includes(rest)) {
      return rest as DesignProductionSection;
    }
    return null;
  }, [location.pathname, productionPath, twinPath]);

  const goWorkspace = useCallback(() => navigate(workspacePath), [navigate, workspacePath]);

  const goSection = useCallback(
    (section: DesignProductionSection) => {
      const onTwin =
        location.pathname === twinPath || location.pathname.startsWith(`${twinPath}/`);
      navigate(
        onTwin ?
          site00ProjectDesignTwinSectionPath(slug, section)
        : site00ProjectDesignSectionPath(slug, section),
      );
    },
    [location.pathname, navigate, slug, twinPath],
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
    productionPath,
    twinPath,
    isReferenceTwin,
    isTwinWorkspace,
    isProductionWorkspace,
    founderReviewMode: isTwinWorkspace,
    activeSection,
    goWorkspace,
    goSection,
    goPrimaryNavIndex,
    goReferenceTwin,
  };
}
