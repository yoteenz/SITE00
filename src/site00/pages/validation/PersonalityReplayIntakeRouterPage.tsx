import { useNavigate, useParams } from 'react-router-dom';
import { buildPersonalitySummaryFromAnswers } from '../../../../shared/site00-brand-lore/personalitySummary';
import { IDNTY_PERSONALITY_QUESTIONS } from '../../../../shared/site00-brand-lore/idnty-personality-questions';
import { PersonalityReplayIntakeStep } from '../../components/validation/PersonalityReplayIntakeStep';
import { usePersonalityReplayIntake } from '../../hooks/usePersonalityReplayIntake';
import { personalityReplayIntakePath } from '../../config/personalityReplayRoutes';
import { IdntyAssessmentShell } from '../../components/idnty-assessment/IdntyAssessmentShell';
import { getIdntyAssessmentState } from '../../config/idnty-assessment';
import { SITE00_ADMIN_ROUTES } from '../../admin/config/routes';

const REPLAY_SHELL_STATE = getIdntyAssessmentState('ready-for-evolution')!;

export default function PersonalityReplayIntakeRouterPage() {
  const { replayId, stepId } = useParams<{ replayId: string; stepId?: string }>();
  const navigate = useNavigate();
  const { answers, submitIntake, status } = usePersonalityReplayIntake(replayId ?? '');

  if (!replayId) return null;

  if (!stepId || stepId === 'review') {
    const sections = buildPersonalitySummaryFromAnswers(answers);
    return (
      <IdntyAssessmentShell state={REPLAY_SHELL_STATE} mobileLayout="calibration" showProcessStrip={false}>
        <div className="site00-idnty-calibration-flow">
          <h2 className="site00-idnty-calibration-rail__category">REVIEW</h2>
          {sections.map((s) => (
            <div key={s.key} className="site00-idnty-lore-review__section">
              <p className="site00-idnty-lore-review__label">{s.label}</p>
              <p className="site00-idnty-lore-review__value">{s.value}</p>
            </div>
          ))}
          <button
            type="button"
            className="site00-idnty-calibration-nav__continue"
            onClick={async () => {
              await submitIntake();
              navigate(SITE00_ADMIN_ROUTES.evolvePipelineReplayValidation('ndxbook', replayId));
            }}
          >
            SUBMIT PERSONALITY
          </button>
          <p className="site00-idnty-calibration-rail__category">STATUS: {status ?? 'IN PROGRESS'}</p>
        </div>
      </IdntyAssessmentShell>
    );
  }

  if (stepId === 'start') {
    navigate(personalityReplayIntakePath(replayId, IDNTY_PERSONALITY_QUESTIONS[0]!.id), { replace: true });
    return null;
  }

  return (
    <IdntyAssessmentShell state={REPLAY_SHELL_STATE} mobileLayout="calibration" showProcessStrip={false}>
      <PersonalityReplayIntakeStep replayId={replayId} stepId={stepId} />
    </IdntyAssessmentShell>
  );
}
