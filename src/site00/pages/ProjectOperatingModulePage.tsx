import { Navigate, useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { EmptyState } from '../components/pages/Site00PagePrimitives';
import { ProjectViewModeProvider } from '../context/ProjectViewModeContext';
import { useSite00ProjectDetail } from '../hooks/useSite00Projects';
import { useProjectOperatingSystem } from '../hooks/useProjectOperatingSystem';
import { ProjectOperatingShell } from '../components/projectOperatingSystem';
import { OverviewFounderWorkspaceBoard } from '../components/founderWorkspace/OverviewFounderWorkspaceBoard';
import { resolveModuleFromPath, type ProjectModuleId } from '../../../shared/site00-projects/projectModules.js';
import { projectModulePath } from '../../../shared/site00-projects/projectModules.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useProjectViewMode } from '../context/ProjectViewModeContext';
import { useClientAppManifest } from '../hooks/useClientAppManifest';
import '../styles/site00-project-operating-system.css';
import '../styles/site00-founder-workspace.css';

type ProjectOperatingModulePageProps = {
  forcedModule?: ProjectModuleId;
};

function ClientViewRedirect({ projectSlug }: { projectSlug: string }) {
  const navigate = useNavigate();
  const { data: manifest, state } = useClientAppManifest(projectSlug);

  useEffect(() => {
    if (state === 'ready' && manifest) {
      navigate(`/app/projects/${projectSlug}/home`, { replace: true });
    }
  }, [state, manifest, navigate, projectSlug]);

  if (state === 'loading' || state === 'idle') return <p className="site00-body">LOADING CLIENT VIEW…</p>;
  return <p className="site00-body">CLIENT PROJECT SURFACE NOT AVAILABLE.</p>;
}

function ProjectOperatingModuleInner({ forcedModule }: ProjectOperatingModulePageProps) {
  const { projectSlug = '' } = useParams();
  const location = useLocation();
  const { viewMode } = useProjectViewMode();
  const { project, state, error } = useSite00ProjectDetail(projectSlug);
  const { operatingState, visibleModules } = useProjectOperatingSystem(projectSlug, project);

  const currentModule =
    forcedModule ?? resolveModuleFromPath(location.pathname) ?? 'OVERVIEW';

  if (viewMode === 'CLIENT') {
    return <ClientViewRedirect projectSlug={projectSlug} />;
  }

  if (state === 'loading' && !operatingState) {
    return <p className="site00-body">LOADING PROJECT…</p>;
  }

  if (!operatingState) {
    return (
      <EmptyState title="PROJECT NOT FOUND" body={error ?? 'NO TRUTHFUL PROJECT RECORD FOR THIS SLUG.'} />
    );
  }

  if (!visibleModules.includes(currentModule)) {
    return <Navigate to={projectModulePath(projectSlug, 'OVERVIEW')} replace />;
  }

  const ndxOverview =
    projectSlug === 'ndxbook' && currentModule === 'OVERVIEW' ? (
      <OverviewFounderWorkspaceBoard projectSlug={projectSlug} />
    ) : undefined;

  return (
    <ProjectOperatingShell
      projectSlug={projectSlug}
      currentModule={currentModule}
      operatingState={operatingState}
      visibleModules={visibleModules as ProjectModuleId[]}
      ndxOverviewContent={ndxOverview}
    />
  );
}

export default function ProjectOperatingModulePage(props: ProjectOperatingModulePageProps) {
  return (
    <ProjectViewModeProvider role="FOUNDER">
      <EcosystemShell hidePageHeader>
        <div className="site00-page site00-page--project-operating">
          <ProjectOperatingModuleInner {...props} />
        </div>
      </EcosystemShell>
    </ProjectViewModeProvider>
  );
}

export function ProjectOverviewRedirectPage() {
  const { projectSlug = '' } = useParams();
  return <Navigate to={projectModulePath(projectSlug, 'OVERVIEW')} replace />;
}
