import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { IdentityLoreStepForm } from '../components/idnty/lore/IdentityLoreStepForm';
import type { StepFormValue } from '../components/idnty-assessment/IdntyStepForm';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectPath, site00ProjectCreativeDirectionPath } from '../config/routes';
import { missingDomainsToLoreSteps } from '../../../shared/site00-brand-lore/readiness';
import type { ReadinessDomain } from '../../../shared/site00-brand-lore/types';
import { getLoreQuestion } from '../../../shared/site00-brand-lore/idnty-lore-questions';
import '../styles/site00-creative-direction.css';

/**
 * NDX BOOK targeted calibration (XXIX/XXX) — a client-facing surface that asks ONLY for the Brand
 * Lore domains missing from Creative Direction readiness, derived live from the server engagement.
 * Reuses the canonical Identity lore question registry + form renderer (no second question set).
 */
export default function ProjectLoreCalibrationPage() {
  const { projectSlug = '' } = useParams();
  const navigate = useNavigate();
  const [missingDomains, setMissingDomains] = useState<ReadinessDomain[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readyNow, setReadyNow] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await site00ProjectsApi.creativeDirection(projectSlug);
      const readiness = payload.engagement.brandLoreReadiness;
      setMissingDomains((readiness?.missingDomains as ReadinessDomain[] | undefined) ?? []);
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

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = await site00ProjectsApi.submitLoreCalibration(projectSlug, answers);
      const readiness = payload.engagement.brandLoreReadiness;
      if (!readiness?.blocked) {
        navigate(site00ProjectCreativeDirectionPath(projectSlug));
        return;
      }
      setAnswers({});
      setMissingDomains((readiness.missingDomains as ReadinessDomain[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'CALIBRATION FAILED TO SAVE');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd">
        <nav className="site00-cd__back">
          <Link to={site00ProjectPath(projectSlug)}>← BACK TO PROJECT</Link>
        </nav>
        <header className="site00-cd__hero">
          <p className="site00-cd__kicker">CONTEXT CALIBRATION</p>
          <h1 className="site00-cd__title">{projectSlug.toUpperCase()}</h1>
          <p className="site00-cd__headline">
            ONE MORE THING BEFORE WE DECIDE WHAT THIS LOOKS LIKE.
          </p>
        </header>

        {error ? <p className="site00-cd__error" role="alert">{error}</p> : null}
        {loading ? <p className="site00-cd__loading" aria-busy="true">LOADING…</p> : null}

        {!loading && readyNow ? (
          <section className="site00-cd__readiness-banner" role="status">
            <p className="site00-cd__readiness-banner-title">CONTEXT IS ALREADY COMPLETE.</p>
            <p className="site00-cd__readiness-banner-body">
              There is nothing left to calibrate right now.
            </p>
            <Link to={site00ProjectCreativeDirectionPath(projectSlug)}>
              REVIEW CREATIVE DIRECTION →
            </Link>
          </section>
        ) : null}

        {!loading && !readyNow && steps.length > 0 ? (
          <>
            {steps.map((step) => (
              <section key={step.id} className="site00-cd__brief" aria-label={step.title}>
                <IdentityLoreStepForm
                  step={step}
                  value={(answers[step.id] as StepFormValue) ?? (step.type === 'multi' ? [] : '')}
                  onChange={(value) => setAnswers((prev) => ({ ...prev, [step.id]: value }))}
                />
              </section>
            ))}
            <div className="site00-cd__decision-actions">
              <button type="button" disabled={submitting} onClick={() => void handleSubmit()}>
                {submitting ? 'SAVING…' : 'SAVE CALIBRATION →'}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </EcosystemShell>
  );
}
