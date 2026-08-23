import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { buildPersonalitySummaryFromAnswers } from '../../../shared/site00-brand-lore/personalitySummary';
import { PersonalityReplayIntakeStep } from '../components/validation/PersonalityReplayIntakeStep';
import { PersonalityReplayExecutionProgress } from '../components/validation/PersonalityReplayExecutionProgress';
import { usePersonalityReplayIntake, PersonalityReplayIntakeProvider } from '../hooks/usePersonalityReplayIntake';
import {
  projectPersonalityReplayStepPath,
  projectPersonalityReplayReviewPath,
  projectPersonalityReplayConsistencyPath,
} from '../config/personalityReplayRoutes';
import { site00ProjectPath, site00ProjectCreativeDirectionPath } from '../config/routes';
import { IdntyAssessmentShell } from '../components/idnty-assessment/IdntyAssessmentShell';
import { getIdntyAssessmentState } from '../config/idnty-assessment';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { projectDisplayName } from '../utils/projectDisplayName';
import {
  canSubmitPersonalityReplayIntake,
  isPersonalityReplayIntakeSubmitted,
} from '../utils/personalityReplaySubmit';
import '../styles/site00-project-lore-calibration.css';
import '../styles/site00-creative-direction.css';
import '../styles/site00-replay-execution.css';

const REPLAY_SHELL_STATE = getIdntyAssessmentState('ready-for-evolution')!;

/**
 * NDX BOOK shadow personality replay intake — project tunnel entry (like /calibrate).
 * Blind intake: no benchmark, direction names, or hero exposure during answering.
 */
export default function ProjectPersonalityReplayPage() {
  const { projectSlug = '', stepId } = useParams<{ projectSlug: string; stepId?: string }>();

  return (
    <PersonalityReplayIntakeProvider projectSlug={projectSlug}>
      <ProjectPersonalityReplayPageInner projectSlug={projectSlug} stepId={stepId} />
    </PersonalityReplayIntakeProvider>
  );
}

function ProjectPersonalityReplayPageInner({
  projectSlug,
  stepId,
}: {
  projectSlug: string;
  stepId?: string;
}) {
  const navigate = useNavigate();
  const {
    answers,
    submitIntake,
    status,
    bootstrapping,
    bootstrapError,
    replayId,
    resumeStepId,
    retryBootstrap,
    saveError,
    submitState,
    submitError,
    executionPhase,
    executionError,
    executionJobId,
    nativeProofFormat,
    heroAsset,
    comparisonReport,
    reload,
  } = usePersonalityReplayIntake(projectSlug);

  useEffect(() => {
    if (projectSlug !== 'ndxbook' || !replayId || !resumeStepId || stepId) return;
    if (resumeStepId === 'review') {
      navigate(projectPersonalityReplayReviewPath(projectSlug), { replace: true });
      return;
    }
    navigate(projectPersonalityReplayStepPath(projectSlug, resumeStepId), { replace: true });
  }, [navigate, projectSlug, replayId, resumeStepId, stepId]);

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p className="site00-body">PERSONALITY REPLAY IS AVAILABLE FOR NDX BOOK ONLY.</p>
        <Link to={site00ProjectPath(projectSlug)}>← BACK TO PROJECT</Link>
      </EcosystemShell>
    );
  }

  if (bootstrapping || (!replayId && !bootstrapError)) {
    return (
      <EcosystemShell hidePageHeader>
        <p className="site00-body">PREPARING PERSONALITY INTAKE…</p>
      </EcosystemShell>
    );
  }

  if (bootstrapError) {
    return (
      <EcosystemShell hidePageHeader>
        <p className="site00-body">{bootstrapError}</p>
        <button type="button" className="site00-btn site00-btn--primary" onClick={retryBootstrap}>
          TRY AGAIN
        </button>
        <Link to={site00ProjectPath(projectSlug)}>← BACK TO PROJECT</Link>
      </EcosystemShell>
    );
  }

  const projectTitle = projectDisplayName(projectSlug);

  if (!stepId || stepId === 'review') {
    const sections = buildPersonalitySummaryFromAnswers(answers);
    const intakeSubmitted = isPersonalityReplayIntakeSubmitted(status);
    const canSubmit = canSubmitPersonalityReplayIntake({
      status,
      hasAnswers: sections.length > 0,
      submitting: submitState === 'submitting',
    });
    return (
      <EcosystemShell hidePageHeader>
        <div className="site00-cd site00-cd--project-calibration">
          <div className="site00-project-lore-calibration">
            <header className="site00-project-lore-calibration__hero">
              <p className="site00-project-lore-calibration__kicker">HOW YOU SHOW UP</p>
              <h1 className="site00-project-lore-calibration__project">{projectTitle}</h1>
              <p className="site00-project-lore-calibration__headline">
                YOUR PERSONALITY — ANSWER FROM SCRATCH. NOTHING IS PRE-FILLED.
              </p>
              <Link to={site00ProjectPath(projectSlug)}>← BACK TO PROJECT</Link>
            </header>
            <IdntyAssessmentShell state={REPLAY_SHELL_STATE} mobileLayout="calibration" showProcessStrip={false}>
              <div className="site00-idnty-calibration-flow">
                <h2 className="site00-idnty-calibration-rail__category">REVIEW</h2>
                {sections.length ? (
                  sections.map((s) => (
                    <div key={s.key} className="site00-idnty-lore-review__section">
                      <p className="site00-idnty-lore-review__label">{s.label}</p>
                      <p className="site00-idnty-lore-review__value">{s.value}</p>
                    </div>
                  ))
                ) : (
                  <p className="site00-idnty-calibration-review__empty">NO ANSWERS YET.</p>
                )}
                {saveError ? (
                  <p className="site00-idnty-calibration-review__empty">SAVE ERROR: {saveError}</p>
                ) : null}
                {submitError ? (
                  <p className="site00-idnty-calibration-review__empty" role="alert">
                    SUBMIT ERROR: {submitError}
                    {submitError.toLowerCase().includes('replay not found') ? (
                      <>
                        {' '}
                        <button type="button" className="site00-idnty-calibration-nav__skip" onClick={retryBootstrap}>
                          START FRESH INTAKE
                        </button>
                      </>
                    ) : null}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="site00-idnty-calibration-nav__continue"
                  disabled={!canSubmit}
                  onClick={async () => {
                    const ok = await submitIntake();
                    if (ok) await reload();
                  }}
                >
                  {submitState === 'submitting'
                    ? 'SUBMITTING…'
                    : intakeSubmitted
                      ? 'PERSONALITY SUBMITTED'
                      : 'SUBMIT PERSONALITY'}
                </button>
                <PersonalityReplayExecutionProgress
                  projectSlug={projectSlug}
                  replayId={replayId}
                  replay={{
                    status: status ?? undefined,
                    executionPhase: executionPhase as import('../../../shared/site00-brand-lore/replayExecutionPhases').ReplayExecutionPhase | null,
                    executionError,
                    executionJobId,
                    nativeProofFormat,
                    heroAsset,
                    comparisonReport,
                  }}
                  onReplayUpdate={() => {
                    void reload();
                  }}
                />
                {intakeSubmitted && (status === 'COMPARISON_READY' || comparisonReport) ? (
                  <p className="site00-idnty-calibration-rail__category">
                    <Link to={projectPersonalityReplayConsistencyPath(projectSlug)}>
                      SIX-DIRECTION CONSISTENCY REVIEW →
                    </Link>
                  </p>
                ) : null}
                <p className="site00-idnty-calibration-rail__category">STATUS: {status ?? 'IN PROGRESS'}</p>
                {intakeSubmitted ? (
                  <p className="site00-idnty-calibration-rail__category">
                    PERSONALITY ON FILE. EXECUTION PROGRESS SHOWN ABOVE — REFRESH SAFE.
                  </p>
                ) : null}
              </div>
            </IdntyAssessmentShell>
          </div>
        </div>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <p className="site00-project-lore-calibration__kicker">HOW YOU SHOW UP</p>
            <h1 className="site00-project-lore-calibration__project">{projectTitle}</h1>
            <p className="site00-project-lore-calibration__headline">
              WHAT DOES THIS BRAND DO WHEN IT SPEAKS?
            </p>
            <Link to={site00ProjectPath(projectSlug)}>← BACK TO PROJECT</Link>
            {' · '}
            <Link to={site00ProjectCreativeDirectionPath(projectSlug)}>CREATIVE DIRECTION →</Link>
          </header>
          <IdntyAssessmentShell state={REPLAY_SHELL_STATE} mobileLayout="calibration" showProcessStrip={false}>
            <PersonalityReplayIntakeStep projectSlug={projectSlug} stepId={stepId} />
          </IdntyAssessmentShell>
        </div>
      </div>
    </EcosystemShell>
  );
}
