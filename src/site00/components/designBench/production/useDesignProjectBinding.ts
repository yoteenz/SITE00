import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import {
  buildDesignModuleHierarchy,
  buildDesignProjectIntelligence,
  buildProjectDesignPageRegistry,
  compileDesignPageContext,
  designHeaderCrumbLabels,
  formatDesignModuleBreadcrumb,
} from '../../../../../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { listDesignEnabledManagedProjects } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import {
  site00ProjectsDesignActiveProjectPath,
  site00ProjectsDesignModulePath,
} from '../../../config/routes';
import { readDesignPageTarget } from './designProductionPageTarget';
import { readDesignWorkspaceSurface } from './designProductionWorkspaceMode';
import { useDesignProductionNavigation } from './useDesignProductionNavigation';

export function useDesignProjectBinding() {
  const nav = useDesignProductionNavigation();
  const location = useLocation();
  const projectSlug = nav.projectSlug;

  const intelligence = useMemo(
    () => buildDesignProjectIntelligence(projectSlug),
    [projectSlug],
  );

  const pageRegistry = useMemo(
    () => buildProjectDesignPageRegistry(projectSlug),
    [projectSlug],
  );

  const realPages = useMemo(
    () => pageRegistry.filter((p) => !p.isConceptOrphan),
    [pageRegistry],
  );

  const [targetTick, setTargetTick] = useState(0);
  useEffect(() => {
    const onTarget = (event: Event) => {
      const detail = (event as CustomEvent<{ projectSlug?: string }>).detail;
      if (detail?.projectSlug?.toLowerCase() === projectSlug.toLowerCase()) setTargetTick((n) => n + 1);
    };
    window.addEventListener('site00:design-page-target', onTarget);
    window.addEventListener('site00:design-workspace-surface', onTarget);
    return () => {
      window.removeEventListener('site00:design-page-target', onTarget);
      window.removeEventListener('site00:design-workspace-surface', onTarget);
    };
  }, [projectSlug]);

  const pageTarget = useMemo(
    () => readDesignPageTarget(projectSlug),
    [projectSlug, location.key, targetTick],
  );

  const workspaceSurface = useMemo(
    () => readDesignWorkspaceSurface(projectSlug),
    [projectSlug, location.key, targetTick],
  );

  const activePage = useMemo(() => {
    if (!pageTarget?.pageId) return null;
    return pageRegistry.find((p) => p.pageId === pageTarget.pageId) ?? null;
  }, [pageRegistry, pageTarget]);

  const hierarchy = useMemo(
    () =>
      buildDesignModuleHierarchy({
        projectsHref: '/projects',
        designHref: site00ProjectsDesignModulePath(),
        activeProjectId: projectSlug,
        activeProjectLabel: intelligence?.displayName ?? projectSlug,
        activePageName: activePage?.pageName ?? null,
        pagesSection: nav.activeSection === 'pages',
      }),
    [activePage?.pageName, intelligence?.displayName, nav.activeSection, projectSlug],
  );

  const headerCrumbLabels = useMemo(() => designHeaderCrumbLabels(hierarchy), [hierarchy]);
  const breadcrumbLabel = useMemo(() => formatDesignModuleBreadcrumb(hierarchy), [hierarchy]);

  const pageContext = useMemo(() => {
    if (!pageTarget?.pageId) return null;
    return compileDesignPageContext(projectSlug, pageTarget.pageId);
  }, [pageTarget?.pageId, projectSlug]);

  const designEnabledProjects = useMemo(() => listDesignEnabledManagedProjects(), []);

  return {
    projectSlug,
    intelligence,
    pageRegistry,
    realPages,
    pageTarget,
    activePage,
    workspaceSurface,
    hierarchy,
    headerCrumbLabels,
    breadcrumbLabel,
    pageContext,
    designEnabledProjects,
    activeProjectDesignPath: site00ProjectsDesignActiveProjectPath(projectSlug),
    designModulePath: site00ProjectsDesignModulePath(),
    nav,
  };
}
