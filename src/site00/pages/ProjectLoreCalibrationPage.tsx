import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectLoreCalibrationFlow } from '../components/projects/ProjectLoreCalibrationFlow';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectCreativeDirectionPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import { getLoreQuestion } from '../../../shared/site00-brand-lore/idnty-lore-questions';
import type { ReadinessDomain } from '../../../shared/site00-brand-lore/types';
import {
  bootstrapCalibrationSession,
  clearProjectLoreCalibrationResume,
  resolveCalibrationSessionStepIds,
} from '../components/projects/projectLoreCalibrationResume';
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
      const answers = payload.brandLoreCalibrationAnswers ?? {};
      const blocked = readiness?.blocked ?? false;
      setMissingDomains((readiness?.missingDomains as ReadinessDomain[] | undefined) ?? []);
      setSavedAnswers(answers);
      setReadyNow(!blocked);
      if (!blocked) {
        clearProjectLoreCalibrationResume(projectSlug);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'UNABLE TO LOAD CALIBRATION CONTEXT');
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const sessionStepIds = useMemo(
    () => resolveCalibrationSessionStepIds(projectSlug, missingDomains),
    [projectSlug, missingDomains],
  );

  useEffect(() => {
    if (loading || readyNow || sessionStepIds.length === 0) return;
    bootstrapCalibrationSession(projectSlug, sessionStepIds, savedAnswers);
  }, [loading, readyNow, projectSlug, savedAnswers, sessionStepIds]);

  const steps = useMemo(
    () =>
      sessionStepIds
        .map((id) => getLoreQuestion(id))
        .filter((step): step is NonNullable<typeof step> => Boolean(step)),
    [sessionStepIds],
  );

  const initialAnswers = useMemo(() => {
    const out: Record<string, string | string[]> = {};
    for (const id of sessionStepIds) {
      if (savedAnswers[id] !== undefined) {
        out[id] = savedAnswers[id];
      }
    }
    return out;
  }, [savedAnswers, sessionStepIds]);

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
