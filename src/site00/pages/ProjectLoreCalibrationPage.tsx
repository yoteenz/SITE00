import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectLoreCalibrationFlow } from '../components/projects/ProjectLoreCalibrationFlow';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectCreativeDirectionPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import { missingDomainsToLoreSteps } from '../../../shared/site00-brand-lore/readiness';
import type { ReadinessDomain } from '../../../shared/site00-brand-lore/types';
import { getLoreQuestion } from '../../../shared/site00-brand-lore/idnty-lore-questions';
import '../styles/site00-creative-direction.css';
import '../styles/site00-project-lore-calibration.css';

/**
 * NDX BOOK targeted calibration (XXIX/XXX) — client-facing Brand Lore gaps only.
 * Uses canonical question registry + step-by-step calibration flow (mobile + desktop).
 */
export default function ProjectLoreCalibrationPage() {
  const { projectSlug = '' } = useParams();
  const navigate = useNavigate();
  const [missingDomains, setMissingDomains] = useState<ReadinessDomain[]>([]);
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string | string[]>>({});
  const [projectTitle, setProjectTitle] = useState(() => projectDisplayName(projectSlug));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readyNow, setReadyNow] = useState(false);

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
      const readiness = payload.engagement.brandLoreReadiness;
      setMissingDomains((readiness?.missingDomains as ReadinessDomain[] | undefined) ?? []);
      setSavedAnswers(payload.brandLoreCalibrationAnswers ?? {});
      setReadyNow(!readiness?.blocked);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'UNABLE TO LOAD CALIBRATION CONTEXT');
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const stepIds = useMemo(() => missingDomainsToLoreSteps(missingDomains), [missingDomains]);
  const steps = useMemo(
    () => stepIds.map((id) => getLoreQuestion(id)).filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [stepIds],
  );

  const initialAnswers = useMemo(() => {
    const out: Record<string, string | string[]> = {};
    for (const step of steps) {
      if (savedAnswers[step.id] !== undefined) {
        out[step.id] = savedAnswers[step.id];
      }
    }
    return out;
  }, [savedAnswers, steps]);

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <ProjectLoreCalibrationFlow
          projectSlug={projectSlug}
          projectTitle={projectTitle}
          steps={steps}
          initialAnswers={initialAnswers}
          readyNow={readyNow}
          loading={loading}
          loadError={error}
          onReload={() => void load()}
          onComplete={() => navigate(site00ProjectCreativeDirectionPath(projectSlug))}
        />
      </div>
    </EcosystemShell>
  );
}
