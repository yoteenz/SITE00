import { Link, useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { CreativeDirectionExperience } from '../components/evolve/creative-direction/CreativeDirectionExperience';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectPath, site00ProjectCreativeDirectionPath, site00ProjectLoreCalibrationPath } from '../config/routes';
import '../styles/site00-creative-direction.css';

const clientCreativeDirectionApi = {
  load: (slug: string) => site00ProjectsApi.creativeDirection(slug),
  submitDecision: (slug: string, input: Parameters<typeof site00ProjectsApi.creativeDirectionDecision>[1]) =>
    site00ProjectsApi.creativeDirectionDecision(slug, input).then(() => undefined),
};

export default function ProjectCreativeDirectionPage() {
  const { projectSlug = '' } = useParams();

  return (
    <EcosystemShell hidePageHeader>
      <CreativeDirectionExperience
        orgSlug={projectSlug}
        api={clientCreativeDirectionApi}
        backLink={
          <Link to={site00ProjectPath(projectSlug)}>← BACK TO PROJECT</Link>
        }
        calibrationLink={
          <Link
            className="site00-cd__readiness-banner-cta"
            to={site00ProjectLoreCalibrationPath(projectSlug)}
            state={{ returnTo: site00ProjectCreativeDirectionPath(projectSlug) }}
          >
            COMPLETE CALIBRATION →
          </Link>
        }
      />
    </EcosystemShell>
  );
}
