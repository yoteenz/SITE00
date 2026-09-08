import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProjectModuleId } from '../../../../shared/site00-projects/projectModules.js';
import { PROJECT_MODULE_CONFIGS, projectModulePath } from '../../../../shared/site00-projects/projectModules.js';
import type { GeneralizedProjectOperatingState } from '../../../../shared/site00-projects/generalizedProjectOperatingState.js';
import type { ProjectCodebaseIntelligence } from '../../../../shared/site00-projects/technical/types.js';
import type { ProjectTechnicalTabId } from '../../../../shared/site00-projects/technical/types.js';
import { projectHasTechnicalIntelligenceCapability } from '../../../../shared/site00-projects/technical/projectRepositoryRegistry.js';
import { getProjectEvolveAdapter } from '../../../../shared/site00-projects/evolve/projectEvolveAdapterRegistry.js';
import { ProjectOperatingHeader } from './ProjectOperatingHeader.js';
import { ProjectModuleDesktopNav } from './ProjectModuleDesktopNav.js';
import { ProjectModuleSwitcher } from './ProjectModuleSwitcher.js';
import { ProjectModuleMobileSubnav } from './ProjectModuleMobileSubnav.js';
import { ViewAsClientBanner, ViewAsClientToggle } from './ViewAsClientControls.js';
import {
  ProjectOverviewModule,
  ProjectIdentityModule,
  ProjectBuilderModule,
  ProjectProductionModule,
  ProjectReviewsModule,
  ProjectLibraryModule,
  ProjectMoreModule,
} from './ProjectModulePanels.js';
import { ProjectEvolveModuleSurface } from './ProjectEvolveModuleSurface.js';
import {
  PROJECT_TECHNICAL_SUBNAV,
  ProjectTechnicalPanelRouter,
} from '../projectTechnical/ProjectTechnicalPanels.js';
import { useProjectViewMode } from '../../context/ProjectViewModeContext.js';
import { useSite00OriginWideViewport } from '../shell/useSite00OriginWideViewport.js';

type ProjectOperatingShellProps = {
  projectSlug: string;
  currentModule: ProjectModuleId;
  operatingState: GeneralizedProjectOperatingState;
  visibleModules: ProjectModuleId[];
  ndxOverviewContent?: ReactNode;
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
  ndxOverviewContent,
  technicalIntelligence,
  technicalState = 'idle',
  onTechnicalSync,
}: ProjectOperatingShellProps) {
  const navigate = useNavigate();
  const isWide = useSite00OriginWideViewport();
  const { viewMode } = useProjectViewMode();
  const technicalEnabled = projectHasTechnicalIntelligenceCapability(
    operatingState.capabilityManifest.enabledCapabilities,
  );
  const [activeTechnicalTab, setActiveTechnicalTab] = useState<ProjectTechnicalTabId>('OVERVIEW');
  const evolveAdapter = useMemo(() => getProjectEvolveAdapter(projectSlug), [projectSlug]);
  const evolveSubnav = useMemo(
    () => (currentModule === 'EVOLVE' ? evolveAdapter.getSubnav(projectSlug) : undefined),
    [currentModule, evolveAdapter, projectSlug],
  );
  const evolveSubnavOverflow = useMemo(
    () => (currentModule === 'EVOLVE' ? evolveAdapter.getSubnavOverflow?.(projectSlug) : undefined),
    [currentModule, evolveAdapter, projectSlug],
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
    if (
      currentModule === 'OVERVIEW' &&
      technicalEnabled &&
      technicalIntelligence &&
      !(projectSlug === 'ndxbook' && ndxOverviewContent && viewMode === 'FOUNDER')
    ) {
      return (
        <>
          <div className="site00-ptech-subnav" role="tablist">
            {PROJECT_TECHNICAL_SUBNAV.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`site00-ptech-subnav__tab${activeTechnicalTab === tab.id ? ' is-active' : ''}`}
                onClick={() => setActiveTechnicalTab(tab.id)}
                aria-selected={activeTechnicalTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {isWide && activeTechnicalTab === 'OVERVIEW' ? (
            <div className="site00-ptech-desktop-grid">
              {[
                { title: 'REPOSITORY', status: technicalIntelligence.repositoryConnection.connected ? 'CONNECTED' : 'NOT CONNECTED', meta: technicalIntelligence.repositoryConnection.repositoryUrl ?? '—' },
                { title: 'CI / BUILD', status: technicalIntelligence.buildState.status, meta: technicalIntelligence.buildState.lastRun ?? '—' },
                { title: 'DEPENDENCIES', status: String(technicalIntelligence.dependencyState.totalDependencies), meta: `${technicalIntelligence.dependencyState.outdated.length} OUTDATED` },
                { title: 'DEPLOYMENTS', status: technicalIntelligence.deploymentState.find((d) => d.environment === 'PRODUCTION')?.status ?? 'UNKNOWN', meta: 'VIEW ENVIRONMENTS' },
                { title: 'READINESS', status: technicalIntelligence.readinessAssessment.overall.replace(/_/g, ' '), meta: technicalIntelligence.readinessAssessment.percentDerivation ?? '—' },
              ].map((card) => (
                <div key={card.title} className="site00-ptech-desktop-card">
                  <p className="site00-ptech-desktop-card__title">{card.title}</p>
                  <p className="site00-ptech-desktop-card__status">{card.status}</p>
                  <p className="site00-ptech-desktop-card__meta">{card.meta}</p>
                </div>
              ))}
            </div>
          ) : null}
          <ProjectTechnicalPanelRouter
            tab={activeTechnicalTab}
            intelligence={technicalIntelligence}
            onSync={onTechnicalSync}
            syncing={technicalState === 'loading'}
          />
        </>
      );
    }

    if (projectSlug === 'ndxbook' && currentModule === 'OVERVIEW' && ndxOverviewContent && viewMode === 'FOUNDER') {
      return ndxOverviewContent;
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
        return <ProjectOverviewModule {...props} />;
    }
  }, [
    activeSubnav,
    activeTechnicalTab,
    currentModule,
    isWide,
    ndxOverviewContent,
    evolveAdapter,
    onTechnicalSync,
    operatingState,
    projectSlug,
    technicalEnabled,
    technicalIntelligence,
    technicalState,
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

        {!isWide && currentModule === 'OVERVIEW' && technicalEnabled && technicalIntelligence ? null : !isWide ? (
          <ProjectModuleMobileSubnav
            moduleId={currentModule}
            activeSubnav={activeSubnav}
            onSubnavChange={setActiveSubnav}
            subnavOverride={evolveSubnav}
            subnavOverflowOverride={evolveSubnavOverflow}
          />
        ) : null}
      </div>
    </div>
  );
}
