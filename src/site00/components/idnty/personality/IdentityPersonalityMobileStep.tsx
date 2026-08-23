import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPersonalityQuestion,
  idntyPersonalityPath,
  idntyPersonalityReviewPath,
  IDNTY_PERSONALITY_QUESTIONS,
} from '../../../../../shared/site00-brand-lore/idnty-personality-questions';
import { resolveResponseMode } from '../../../../../shared/site00-brand-lore/loreAnswerTypes';
import { LORE_SKIP_VALUE } from '../../../../../shared/site00-brand-lore/adaptivity';
import type { IdntyAssessmentStateId } from '../../../config/idnty-assessment';
import { useIdntyAssessment } from '../../../hooks/useIdntyAssessment';
import { useStepForm } from '../../idnty-assessment/IdntyStepForm';
import { IdentityStateHero, IdentityStateProgress } from '../state-v2/IdentityStateProgress';
import { getIdntyAssessmentState } from '../../../config/idnty-assessment';
import { IdentityCalibrationConsole } from '../calibration/IdentityCalibrationConsole';
import { IdentityCalibrationCaptureStatus } from '../calibration/IdentityCalibrationCaptureStatus';
import { IdentityCalibrationNavigation } from '../calibration/IdentityCalibrationNavigation';
import { IdentityPersonalityStepForm } from './IdentityPersonalityStepForm';
import { useSite00DesktopArtboardPreview } from '../../shell/Site00DesktopArtboardContext';
import { site00IdntyAssessmentDesktopPath } from '../../../config/routes';
import { IntakeSaveStatus } from '../../intake/IntakeSaveStatus';

type IdentityPersonalityMobileStepProps = {
  stateSlug: IdntyAssessmentStateId;
  stepId: string;
  calibrationMode?: boolean;
};

function isCaptured(value: unknown, skippable?: boolean): boolean {
  if (value === LORE_SKIP_VALUE || value === 'not-sure') return skippable ?? true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return skippable ?? false;
}

export function IdentityPersonalityMobileStep({ stateSlug, stepId, calibrationMode }: IdentityPersonalityMobileStepProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getIdntyAssessmentState(stateSlug)!;
  const step = getPersonalityQuestion(stepId);

  const {
    setPersonalityAnswers,
    markPersonalityStepComplete,
    record,
    serverSaveState,
    serverLastSavedAt,
    serverSaveError,
  } = useIdntyAssessment();

  const activeSteps = useMemo(
    () => (calibrationMode ? IDNTY_PERSONALITY_QUESTIONS.filter((q) => q.id === stepId) : IDNTY_PERSONALITY_QUESTIONS),
    [calibrationMode, stepId],
  );

  const existingValue =
    record.personalityAnswers[stepId] ??
    (step && resolveResponseMode(step) !== 'FREE_TEXT' && resolveResponseMode(step) !== 'SINGLE_SELECT' ? [] : '');
  const form = useStepForm(existingValue);

  useEffect(() => {
    form.setValue(existingValue);
  }, [stepId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!step) {
    navigate(idntyPersonalityPath(stateSlug, IDNTY_PERSONALITY_QUESTIONS[0]!.id));
    return null;
  }

  const stepIndex = activeSteps.findIndex((s) => s.id === stepId);
  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00IdntyAssessmentDesktopPath(path) : path);
  };

  const handleNext = () => {
    setPersonalityAnswers(stepId, form.value as string | string[]);
    markPersonalityStepComplete(stepId);

    if (calibrationMode) {
      navigateTo(idntyPersonalityReviewPath(stateSlug));
      return;
    }

    const nextIdx = IDNTY_PERSONALITY_QUESTIONS.findIndex((q) => q.id === stepId) + 1;
    if (nextIdx < IDNTY_PERSONALITY_QUESTIONS.length) {
      navigateTo(idntyPersonalityPath(stateSlug, IDNTY_PERSONALITY_QUESTIONS[nextIdx]!.id));
    } else {
      navigateTo(idntyPersonalityReviewPath(stateSlug));
    }
  };

  const handleSkip = () => {
    setPersonalityAnswers(stepId, LORE_SKIP_VALUE);
    markPersonalityStepComplete(stepId);
    handleNext();
  };

  const handleBack = () => {
    if (stepIndex <= 0) {
      navigateTo(`/idnty/${stateSlug}/world-review`);
      return;
    }
    const prev = activeSteps[stepIndex - 1];
    if (prev) navigateTo(idntyPersonalityPath(stateSlug, prev.id));
  };

  const captured = isCaptured(form.value, step.skippable);
  const nextIdx = IDNTY_PERSONALITY_QUESTIONS.findIndex((q) => q.id === stepId) + 1;
  const nextLabel = nextIdx < IDNTY_PERSONALITY_QUESTIONS.length ? 'NEXT' : 'REVIEW';

  return (
    <div className="site00-idnty-calibration-flow">
      <IdentityStateProgress stateId={stateSlug} />
      <IdentityStateHero state={state} />
      <IntakeSaveStatus state={serverSaveState} lastSavedAt={serverLastSavedAt} errorMessage={serverSaveError} />
      <IdentityCalibrationConsole
        stepIndex={Math.max(stepIndex, 0)}
        totalSteps={activeSteps.length}
        progressRail={
          calibrationMode ? (
            <p className="site00-idnty-calibration-rail__category">PERSONALITY CALIBRATION</p>
          ) : (
            <p className="site00-idnty-calibration-rail__category">HOW YOU SHOW UP</p>
          )
        }
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
