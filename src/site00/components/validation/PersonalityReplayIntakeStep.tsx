import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPersonalityQuestion,
  IDNTY_PERSONALITY_QUESTIONS,
} from '../../../../shared/site00-brand-lore/idnty-personality-questions';
import { resolveResponseMode } from '../../../../shared/site00-brand-lore/loreAnswerTypes';
import { LORE_SKIP_VALUE } from '../../../../shared/site00-brand-lore/adaptivity';
import { useStepForm } from '../idnty-assessment/IdntyStepForm';
import { IdentityCalibrationConsole } from '../idnty/calibration/IdentityCalibrationConsole';
import { IdentityCalibrationCaptureStatus } from '../idnty/calibration/IdentityCalibrationCaptureStatus';
import { IdentityCalibrationNavigation } from '../idnty/calibration/IdentityCalibrationNavigation';
import { IdentityPersonalityStepForm } from '../idnty/personality/IdentityPersonalityStepForm';
import { useSite00DesktopArtboardPreview } from '../shell/Site00DesktopArtboardContext';
import { site00IdntyAssessmentDesktopPath } from '../../config/routes';
import { IntakeSaveStatus } from '../intake/IntakeSaveStatus';
import { usePersonalityReplayIntake } from '../../hooks/usePersonalityReplayIntake';
import { personalityReplayIntakePath, personalityReplayReviewPath } from '../../config/personalityReplayRoutes';

type PersonalityReplayIntakeStepProps = {
  replayId: string;
  stepId: string;
};

function isCaptured(value: unknown, skippable?: boolean): boolean {
  if (value === LORE_SKIP_VALUE || value === 'not-sure') return skippable ?? true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return skippable ?? false;
}

/** Blind replay intake — canonical personality UI, no benchmark exposure. */
export function PersonalityReplayIntakeStep({ replayId, stepId }: PersonalityReplayIntakeStepProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const step = getPersonalityQuestion(stepId);
  const { answers, setAnswer, markStepComplete, saveState, saveError, lastSavedAt } =
    usePersonalityReplayIntake(replayId);

  const activeSteps = useMemo(() => IDNTY_PERSONALITY_QUESTIONS, []);
  const existingValue =
    answers[stepId] ??
    (step && resolveResponseMode(step) !== 'FREE_TEXT' && resolveResponseMode(step) !== 'SINGLE_SELECT' ? [] : '');
  const form = useStepForm(existingValue);

  useEffect(() => {
    form.setValue(existingValue);
  }, [stepId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!step) {
    navigate(personalityReplayIntakePath(replayId, IDNTY_PERSONALITY_QUESTIONS[0]!.id));
    return null;
  }

  const stepIndex = activeSteps.findIndex((s) => s.id === stepId);
  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00IdntyAssessmentDesktopPath(path) : path);
  };

  const handleNext = () => {
    setAnswer(stepId, form.value as string | string[]);
    markStepComplete(stepId);

    const nextIdx = IDNTY_PERSONALITY_QUESTIONS.findIndex((q) => q.id === stepId) + 1;
    if (nextIdx < IDNTY_PERSONALITY_QUESTIONS.length) {
      navigateTo(personalityReplayIntakePath(replayId, IDNTY_PERSONALITY_QUESTIONS[nextIdx]!.id));
    } else {
      navigateTo(personalityReplayReviewPath(replayId));
    }
  };

  const handleSkip = () => {
    setAnswer(stepId, LORE_SKIP_VALUE);
    markStepComplete(stepId);
    handleNext();
  };

  const handleBack = () => {
    if (stepIndex <= 0) return;
    const prev = activeSteps[stepIndex - 1];
    if (prev) navigateTo(personalityReplayIntakePath(replayId, prev.id));
  };

  const captured = isCaptured(form.value, step.skippable);
  const nextIdx = IDNTY_PERSONALITY_QUESTIONS.findIndex((q) => q.id === stepId) + 1;
  const nextLabel = nextIdx < IDNTY_PERSONALITY_QUESTIONS.length ? 'NEXT' : 'REVIEW';

  return (
    <div className="site00-idnty-calibration-flow">
      <IntakeSaveStatus
        state={saveState === 'saving' ? 'saving' : saveState === 'saved' ? 'saved' : saveState === 'error' ? 'error' : 'idle'}
        lastSavedAt={lastSavedAt}
        errorMessage={saveError}
      />
      <IdentityCalibrationConsole
        stepIndex={Math.max(stepIndex, 0)}
        totalSteps={activeSteps.length}
        progressRail={<p className="site00-idnty-calibration-rail__category">HOW YOU SHOW UP</p>}
        captureStatus={
          <IdentityCalibrationCaptureStatus
            primary={captured ? 'CAPTURED' : 'OPTIONAL'}
            secondary={step.helper ?? step.subtitle ?? 'YOUR PERSONALITY'}
            captured={captured}
          />
        }
        navigation={
          <IdentityCalibrationNavigation
            stepIndex={Math.max(stepIndex, 0)}
            totalSteps={activeSteps.length}
            onPrevious={handleBack}
            onContinue={handleNext}
            continueLabel={nextLabel}
            nextStepLabel={nextLabel}
            continueDisabled={!captured && !!step.required}
          />
        }
      >
        <IdentityPersonalityStepForm step={step} value={form.value} onChange={form.setValue} error={form.error} />
        {step.skippable ? (
          <button type="button" className="site00-idnty-calibration-nav__skip" onClick={handleSkip}>
            SKIP / NOT SURE YET
          </button>
        ) : null}
      </IdentityCalibrationConsole>
    </div>
  );
}
