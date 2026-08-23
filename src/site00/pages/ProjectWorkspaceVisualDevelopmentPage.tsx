import { Link, useParams } from 'react-router-dom';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectWorkspaceVisualDevelopmentReview } from '../components/projectWorkspace/ProjectWorkspaceVisualDevelopmentReview';
import { site00ProjectExperimentEPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';

export default function ProjectWorkspaceVisualDevelopmentPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Visual development is NDXBOOK-only for Experiment E.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-page site00-page--visual-development">
        <p className="site00-vd__back">
          <Link to={site00ProjectExperimentEPath(projectSlug)}>← EXPERIENCE EXPRESSION</Link>
        </p>
        <p className="site00-vd__project">{projectDisplayName(projectSlug)}</p>
        <ProjectExperimentsHubNav projectSlug={projectSlug} />
        <ProjectWorkspaceVisualDevelopmentReview projectSlug={projectSlug} />
      </div>
    </EcosystemShell>
  );
}
