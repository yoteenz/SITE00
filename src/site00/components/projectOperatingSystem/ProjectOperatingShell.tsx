import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProjectModuleId } from '../../../../shared/site00-projects/projectModules.js';
import { PROJECT_MODULE_CONFIGS, projectModulePath } from '../../../../shared/site00-projects/projectModules.js';
import type { GeneralizedProjectOperatingState } from '../../../../shared/site00-projects/generalizedProjectOperatingState.js';
import type { ProjectCodebaseIntelligence } from '../../../../shared/site00-projects/technical/types.js';
import { getProjectEvolveAdapter } from '../../../../shared/site00-projects/evolve/projectEvolveAdapterRegistry.js';
import { getProjectOverviewAdapter } from '../../../../shared/site00-projects/overview/projectOverviewAdapterRegistry.js';
import { ProjectOperatingHeader } from './ProjectOperatingHeader.js';
import { ProjectModuleDesktopNav } from './ProjectModuleDesktopNav.js';
import { ProjectModuleSwitcher } from './ProjectModuleSwitcher.js';
import { ProjectModuleMobileSubnav } from './ProjectModuleMobileSubnav.js';
import { ViewAsClientBanner, ViewAsClientToggle } from './ViewAsClientControls.js';
import {
  ProjectIdentityModule,
  ProjectBuilderModule,
  ProjectProductionModule,
  ProjectReviewsModule,
  ProjectLibraryModule,
  ProjectMoreModule,
} from './ProjectModulePanels.js';
import { ProjectEvolveModuleSurface } from './ProjectEvolveModuleSurface.js';
import {
  buildProjectOverviewViewModel,
  ProjectOverviewModuleSurface,
} from './ProjectOverviewModuleSurface.js';
import { useProjectOperatingState } from '../../hooks/useProjectOperatingState.js';
import { useProjectViewMode } from '../../context/ProjectViewModeContext.js';
import { useSite00OriginWideViewport } from '../shell/useSite00OriginWideViewport.js';
import { resolveModuleSkin } from '../../../../shared/site00-brand-lore/projectSkin/resolver.js';
import '../../styles/site00-master-skin.css';

type ProjectOperatingShellProps = {
  projectSlug: string;
  currentModule: ProjectModuleId;
  operatingState: GeneralizedProjectOperatingState;
  visibleModules: ProjectModuleId[];
  technicalIntelligence?: ProjectCodebaseIntelligence | null;
  technicalState?: 'idle' | 'loading' | 'ready' | 'error';
  onTechnicalSync?: () => void;
};

function defaultSubnav(projectSlug: string, moduleId: ProjectModuleId): string {
  if (moduleId === 'EVOLVE') {
    return getProjectEvolveAdapter(projectSlug).getDefaultSubnavId();
  }
  return PROJECT_MODULE_CONFIGS[moduleId].mobileSubnav[0]?.id ?? 'SNAPSHOT';
}

export function ProjectOperatingShell({
  projectSlug,
  currentModule,
  operatingState,
  visibleModules,
  technicalIntelligence,
}: ProjectOperatingShellProps) {
  const navigate = useNavigate();
  const isWide = useSite00OriginWideViewport();
  const { viewMode } = useProjectViewMode();
  const overviewAdapter = useMemo(() => getProjectOverviewAdapter(projectSlug), [projectSlug]);
  const { state: ndxState } = useProjectOperatingState(
    overviewAdapter.stateSource === 'PROJECT_OPERATING_STATE' ? projectSlug : '',
  );
  const evolveAdapter = useMemo(() => getProjectEvolveAdapter(projectSlug), [projectSlug]);
  const evolveSubnav = useMemo(
    () => (currentModule === 'EVOLVE' ? evolveAdapter.getSubnav(projectSlug) : undefined),
    [currentModule, evolveAdapter, projectSlug],
  );
  const evolveOwnsSubshell = currentModule === 'EVOLVE' && evolveAdapter.ownsEvolveSubshell === true;
  const overviewOwnsSurface = currentModule === 'OVERVIEW';

  const overviewModel = useMemo(
    () =>
      buildProjectOverviewViewModel({
        projectSlug,
        operatingState,
        ndxOperatingState: ndxState,
        technicalIntelligence,
        viewMode,
      }),
    [projectSlug, operatingState, ndxState, technicalIntelligence, viewMode],
  );

  const [activeSubnav, setActiveSubnav] = useState(() => defaultSubnav(projectSlug, currentModule));

  useEffect(() => {
    setActiveSubnav(defaultSubnav(projectSlug, currentModule));
  }, [projectSlug, currentModule]);

  const handleModuleSelect = useCallback(
    (moduleId: ProjectModuleId) => {
      setActiveSubnav(defaultSubnav(projectSlug, moduleId));
      navigate(projectModulePath(projectSlug, moduleId));
    },
    [navigate, projectSlug],
  );

  const moduleContent = useMemo(() => {
    const props = { operatingState, activeSubnav };
    switch (currentModule) {
      case 'OVERVIEW':
        return (
          <ProjectOverviewModuleSurface
            projectSlug={projectSlug}
            operatingState={operatingState}
            technicalIntelligence={technicalIntelligence}
          />
        );
      case 'IDENTITY':
        return <ProjectIdentityModule {...props} />;
      case 'BUILDER':
        return <ProjectBuilderModule {...props} />;
      case 'EVOLVE':
        return (
          <ProjectEvolveModuleSurface
            projectSlug={projectSlug}
            operatingState={operatingState}
            activeSubnav={activeSubnav}
          />
        );
      case 'PRODUCTION':
        return <ProjectProductionModule {...props} />;
      case 'REVIEWS':
        return <ProjectReviewsModule {...props} />;
      case 'LIBRARY':
        return <ProjectLibraryModule {...props} />;
      case 'MORE':
        return <ProjectMoreModule {...props} />;
      default:
        return (
          <ProjectOverviewModuleSurface
            projectSlug={projectSlug}
            operatingState={operatingState}
            technicalIntelligence={technicalIntelligence}
          />
        );
    }
  }, [activeSubnav, currentModule, operatingState, projectSlug, technicalIntelligence]);

  const modulesForNav = visibleModules as ProjectModuleId[];
  const currentLabel = PROJECT_MODULE_CONFIGS[currentModule].label;
  const resolvedSkin = useMemo(
    () => resolveModuleSkin(projectSlug, currentModule),
    [projectSlug, currentModule],
  );

  return (
    <div className="site00-pos" data-view-mode={viewMode} data-module={currentModule}>
      <ViewAsClientBanner />

      <div className="site00-pos__inner">
        <ProjectOperatingHeader
          operatingState={operatingState}
          projectSlug={projectSlug}
          currentModuleLabel={currentLabel}
          overviewModel={overviewModel}
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

        <main
          className={`site00-pos__main${resolvedSkin ? ` ${resolvedSkin.cssClass}` : ''}`}
          data-master-skin={resolvedSkin?.masterSkinId}
          data-skin-module={currentModule}
          style={resolvedSkin?.cssVars as CSSProperties | undefined}
        >
          {moduleContent}
        </main>

        {!isWide && !evolveOwnsSubshell && !overviewOwnsSurface ? (
          <ProjectModuleMobileSubnav
            moduleId={currentModule}
            activeSubnav={activeSubnav}
            onSubnavChange={setActiveSubnav}
            subnavOverride={evolveSubnav}
          />
        ) : null}
      </div>
    </div>
  );
}
