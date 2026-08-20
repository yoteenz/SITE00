import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getIdntyAssessmentState,
  idntyAssessmentNextStep,
  idntyAssessmentPath,
  idntyAssessmentReviewPath,
  type IdntyAssessmentStateId,
} from '../../../config/idnty-assessment';
import {
  getCalibrationCaptureStatus,
  getCalibrationStepLabel,
  isCalibrationInputCaptured,
} from '../../../config/idnty-calibration';
import { useIdntyAssessment } from '../../../hooks/useIdntyAssessment';
import { useStepForm } from '../../idnty-assessment/IdntyStepForm';
import { IdentityStateHero } from '../state-v2/IdentityStateProgress';
import { IdentityStateProgress } from '../state-v2/IdentityStateProgress';
import { IdentityCalibrationConsole } from './IdentityCalibrationConsole';
import { IdentityCalibrationProgressRail } from './IdentityCalibrationProgressRail';
import { IdentityCalibrationCaptureStatus } from './IdentityCalibrationCaptureStatus';
import { IdentityCalibrationNavigation } from './IdentityCalibrationNavigation';
import { IdentityCalibrationStepForm } from './IdentityCalibrationStepForm';
import { useSite00DesktopArtboardPreview } from '../../shell/Site00DesktopArtboardContext';
import { site00IdntyAssessmentDesktopPath } from '../../../config/routes';

type IdentityCalibrationMobileStepProps = {
  stateSlug: IdntyAssessmentStateId;
  stepId: string;
};

export function IdentityCalibrationMobileStep({ stateSlug, stepId }: IdentityCalibrationMobileStepProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getIdntyAssessmentState(stateSlug)!;
  const step = state.steps.find((s) => s.id === stepId);

  const { startState, setStepAnswers, markStepComplete, getAnswersForState, record } = useIdntyAssessment();
  const existingAnswers = getAnswersForState(stateSlug);
  const existingValue = existingAnswers[stepId] ?? (step?.type === 'multi' ? [] : '');

  const form = useStepForm(existingValue);

  useEffect(() => {
    startState(stateSlug, stepId);
  }, [stateSlug, stepId, startState]);

  useEffect(() => {
    form.setValue(existingValue);
  }, [stepId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!step) {
    navigate(idntyAssessmentPath(stateSlug));
    return null;
  }

  const stepIndex = state.steps.findIndex((s) => s.id === stepId);
  const completedStepIds = record.completedSteps
    .filter((key) => key.startsWith(`${stateSlug}:`))
    .map((key) => key.split(':')[1] ?? '');

  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00IdntyAssessmentDesktopPath(path) : path);
  };

  const handleNext = () => {
    if (!form.validate(step)) return;
    setStepAnswers(stateSlug, stepId, { [stepId]: form.value });
    markStepComplete(stateSlug, stepId);

    const next = idntyAssessmentNextStep(state, stepId);
    if (next) {
      navigateTo(idntyAssessmentPath(stateSlug, next.id));
    } else {
      navigateTo(idntyAssessmentReviewPath(stateSlug));
    }
  };

  const handleBack = () => {
    if (stepIndex <= 0) {
      navigateTo(idntyAssessmentPath(stateSlug));
      return;
    }
    const prev = state.steps[stepIndex - 1];
    navigateTo(idntyAssessmentPath(stateSlug, prev.id));
  };

  const nextStep = idntyAssessmentNextStep(state, stepId);
  const nextStepLabel = nextStep
    ? `${String(stepIndex + 2).padStart(2, '0')} / ${getCalibrationStepLabel(nextStep.id)}`
    : `${String(state.steps.length).padStart(2, '0')} / REVIEW`;

  const capture = getCalibrationCaptureStatus(stepIndex, step, form.value);
  const canContinue = isCalibrationInputCaptured(step, form.value) || !step.required;

  return (
    <div className="site00-idnty-calibration-flow">
      <IdentityStateProgress stateId={stateSlug} />
      <IdentityStateHero state={state} />
      <IdentityCalibrationConsole
        stepIndex={stepIndex}
        totalSteps={state.steps.length}
        progressRail={
          <IdentityCalibrationProgressRail
            steps={state.steps}
            currentStepIndex={stepIndex}
            completedStepIds={completedStepIds}
          />
        }
        captureStatus={
          <IdentityCalibrationCaptureStatus
            primary={capture.primary}
            secondary={capture.secondary}
            captured={capture.captured}
          />
        }
        navigation={
          <IdentityCalibrationNavigation
            stepIndex={stepIndex}
            totalSteps={state.steps.length}
            onPrevious={handleBack}
            onContinue={handleNext}
            continueDisabled={!canContinue}
            nextStepLabel={nextStepLabel}
          />
        }
      >
        <IdentityCalibrationStepForm
          step={step}
          value={form.value}
          onChange={form.setValue}
          error={form.error}
        />
      </IdentityCalibrationConsole>
    </div>
  );
}
