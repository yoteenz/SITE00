import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProjectModuleId } from '../../../../shared/site00-projects/projectModules.js';
import { PROJECT_MODULE_CONFIGS, projectModulePath } from '../../../../shared/site00-projects/projectModules.js';
import type { GeneralizedProjectOperatingState } from '../../../../shared/site00-projects/generalizedProjectOperatingState.js';
import { ProjectOperatingHeader } from './ProjectOperatingHeader.js';
import { ProjectModuleDesktopNav } from './ProjectModuleDesktopNav.js';
import { ProjectModuleSwitcher } from './ProjectModuleSwitcher.js';
import { ProjectModuleMobileSubnav } from './ProjectModuleMobileSubnav.js';
import { ViewAsClientBanner, ViewAsClientToggle } from './ViewAsClientControls.js';
import {
  ProjectOverviewModule,
  ProjectIdentityModule,
  ProjectBuilderModule,
  ProjectEvolveModule,
  ProjectProductionModule,
  ProjectReviewsModule,
  ProjectLibraryModule,
  ProjectMoreModule,
} from './ProjectModulePanels.js';
import { useProjectViewMode } from '../../context/ProjectViewModeContext.js';
import { useSite00OriginWideViewport } from '../shell/useSite00OriginWideViewport.js';

type ProjectOperatingShellProps = {
  projectSlug: string;
  currentModule: ProjectModuleId;
  operatingState: GeneralizedProjectOperatingState;
  visibleModules: ProjectModuleId[];
  ndxEvolveContent?: ReactNode;
  ndxOverviewContent?: ReactNode;
};

function defaultSubnav(moduleId: ProjectModuleId): string {
  return PROJECT_MODULE_CONFIGS[moduleId].mobileSubnav[0]?.id ?? 'SNAPSHOT';
}

export function ProjectOperatingShell({
  projectSlug,
  currentModule,
  operatingState,
  visibleModules,
  ndxEvolveContent,
  ndxOverviewContent,
}: ProjectOperatingShellProps) {
  const navigate = useNavigate();
  const isWide = useSite00OriginWideViewport();
  const { viewMode } = useProjectViewMode();
  const [activeSubnav, setActiveSubnav] = useState(() => defaultSubnav(currentModule));

  const handleModuleSelect = useCallback(
    (moduleId: ProjectModuleId) => {
      setActiveSubnav(defaultSubnav(moduleId));
      navigate(projectModulePath(projectSlug, moduleId));
    },
    [navigate, projectSlug],
  );

  const moduleContent = useMemo(() => {
    if (projectSlug === 'ndxbook' && currentModule === 'OVERVIEW' && ndxOverviewContent && viewMode === 'FOUNDER') {
      return ndxOverviewContent;
    }
    if (projectSlug === 'ndxbook' && currentModule === 'EVOLVE' && ndxEvolveContent && viewMode === 'FOUNDER') {
      return ndxEvolveContent;
    }

    const props = { operatingState, activeSubnav };
    switch (currentModule) {
      case 'OVERVIEW':
        return <ProjectOverviewModule {...props} />;
      case 'IDENTITY':
        return <ProjectIdentityModule {...props} />;
      case 'BUILDER':
        return <ProjectBuilderModule {...props} />;
      case 'EVOLVE':
        return <ProjectEvolveModule {...props} />;
      case 'PRODUCTION':
        return <ProjectProductionModule {...props} />;
      case 'REVIEWS':
        return <ProjectReviewsModule {...props} />;
      case 'LIBRARY':
        return <ProjectLibraryModule {...props} />;
      case 'MORE':
        return <ProjectMoreModule {...props} />;
      default:
        return <ProjectOverviewModule {...props} />;
    }
  }, [
    activeSubnav,
    currentModule,
    ndxEvolveContent,
    ndxOverviewContent,
    operatingState,
    projectSlug,
    viewMode,
  ]);

  const modulesForNav = visibleModules as ProjectModuleId[];
  const currentLabel = PROJECT_MODULE_CONFIGS[currentModule].label;

  return (
    <div className="site00-pos" data-view-mode={viewMode} data-module={currentModule}>
      <ViewAsClientBanner />

      <div className="site00-pos__inner">
        <ProjectOperatingHeader
          operatingState={operatingState}
          projectSlug={projectSlug}
          currentModuleLabel={currentLabel}
        />

        <div className="site00-pos__controls">
          {!isWide ? (
            <ProjectModuleSwitcher
              projectSlug={projectSlug}
              currentModule={currentModule}
              enabledModules={modulesForNav}
              onSelect={handleModuleSelect}
            />
          ) : null}
          <ViewAsClientToggle />
        </div>

        {isWide ? (
          <ProjectModuleDesktopNav
            projectSlug={projectSlug}
            currentModule={currentModule}
            enabledModules={modulesForNav}
          />
        ) : null}

        <main className="site00-pos__main">{moduleContent}</main>

        {!isWide ? (
          <ProjectModuleMobileSubnav
            moduleId={currentModule}
            activeSubnav={activeSubnav}
            onSubnavChange={setActiveSubnav}
          />
        ) : null}
      </div>
    </div>
  );
}
