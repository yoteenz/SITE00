import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectCreativeAppetiteFlow } from '../components/projects/ProjectCreativeAppetiteFlow';
import { CREATIVE_APPETITE_STEPS } from '../components/projects/projectCreativeAppetiteResume';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectCreativeDirectionPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import '../styles/site00-creative-direction.css';
import '../styles/site00-project-lore-calibration.css';

export default function ProjectCreativeAppetitePage() {
  const { projectSlug = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo =
    (location.state as { returnTo?: string } | null)?.returnTo ??
    site00ProjectCreativeDirectionPath(projectSlug);
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string | string[]>>({});
  const [projectTitle, setProjectTitle] = useState(() => projectDisplayName(projectSlug));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [detail, payload] = await Promise.all([
        site00ProjectsApi.detail(projectSlug).catch(() => null),
        site00ProjectsApi.creativeDirection(projectSlug),
      ]);
      if (detail?.project?.displayName) {
        setProjectTitle(projectDisplayName(projectSlug, detail.project.displayName));
      }
      const answers =
        (payload as { creativeAppetiteAnswers?: Record<string, string | string[]> }).creativeAppetiteAnswers ??
        {};
      setSavedAnswers(answers);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'UNABLE TO LOAD');
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const steps = useMemo(() => CREATIVE_APPETITE_STEPS, []);

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        {projectSlug === 'ndxbook' ? <ProjectExperimentsHubNav projectSlug={projectSlug} /> : null}
        <ProjectCreativeAppetiteFlow
          projectSlug={projectSlug}
          projectTitle={projectTitle}
          steps={steps}
          initialAnswers={savedAnswers}
          loading={loading}
          loadError={error}
          onReload={() => void load()}
          onComplete={() => navigate(returnTo)}
        />
      </div>
    </EcosystemShell>
  );
}
