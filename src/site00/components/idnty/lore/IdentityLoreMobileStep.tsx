import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getLoreQuestion,
  idntyLorePath,
  idntyLoreReviewPath,
} from '../../../../../shared/site00-brand-lore/idnty-lore-questions';
import { resolveResponseMode } from '../../../../../shared/site00-brand-lore/loreAnswerTypes';
import { resolveActiveLoreSteps, LORE_SKIP_VALUE } from '../../../../../shared/site00-brand-lore/adaptivity';
import type { IdntyAssessmentStateId } from '../../../config/idnty-assessment';
import { useIdntyAssessment } from '../../../hooks/useIdntyAssessment';
import { useStepForm } from '../../idnty-assessment/IdntyStepForm';
import { IdentityStateHero, IdentityStateProgress } from '../state-v2/IdentityStateProgress';
import { getIdntyAssessmentState } from '../../../config/idnty-assessment';
import { IdentityCalibrationConsole } from '../calibration/IdentityCalibrationConsole';
import { IdentityCalibrationCaptureStatus } from '../calibration/IdentityCalibrationCaptureStatus';
import { IdentityCalibrationNavigation } from '../calibration/IdentityCalibrationNavigation';
import { IdentityLoreStepForm } from './IdentityLoreStepForm';
import { useSite00DesktopArtboardPreview } from '../../shell/Site00DesktopArtboardContext';
import { site00IdntyAssessmentDesktopPath } from '../../../config/routes';
import { IntakeSaveStatus } from '../../intake/IntakeSaveStatus';

type IdentityLoreMobileStepProps = {
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

export function IdentityLoreMobileStep({ stateSlug, stepId, calibrationMode }: IdentityLoreMobileStepProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getIdntyAssessmentState(stateSlug)!;
  const step = getLoreQuestion(stepId);

  const {
    setLoreAnswers,
    markLoreStepComplete,
    record,
    serverSaveState,
    serverLastSavedAt,
    serverSaveError,
  } = useIdntyAssessment();

  const activeSteps = useMemo(
    () =>
      resolveActiveLoreSteps({
        loreAnswers: record.loreAnswers,
        calibrationStepIds: calibrationMode ? [stepId] : null,
      }),
    [record.loreAnswers, calibrationMode, stepId],
  );

  const existingValue =
    record.loreAnswers[stepId] ??
    (step && resolveResponseMode(step) !== 'FREE_TEXT' && resolveResponseMode(step) !== 'SINGLE_SELECT' ? [] : '');
  const form = useStepForm(existingValue);

  useEffect(() => {
    form.setValue(existingValue);
  }, [stepId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!step) {
    navigate(idntyLorePath(stateSlug, activeSteps[0]?.id ?? 'feeling'));
    return null;
  }

  const stepIndex = activeSteps.findIndex((s) => s.id === stepId);
  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00IdntyAssessmentDesktopPath(path) : path);
  };

  const handleNext = () => {
    const nextAnswers = { ...record.loreAnswers, [stepId]: form.value as string | string[] };
    setLoreAnswers(stepId, form.value as string | string[]);
    markLoreStepComplete(stepId);

    if (calibrationMode) {
      navigateTo(idntyLoreReviewPath(stateSlug));
      return;
    }

    const remaining = resolveActiveLoreSteps({ loreAnswers: nextAnswers }).filter((s) => s.id !== stepId);
    if (remaining.length > 0) {
      navigateTo(idntyLorePath(stateSlug, remaining[0]!.id));
    } else {
      navigateTo(idntyLoreReviewPath(stateSlug));
    }
  };

  const handleSkip = () => {
    setLoreAnswers(stepId, LORE_SKIP_VALUE);
    markLoreStepComplete(stepId);
    handleNext();
  };

  const handleBack = () => {
    if (stepIndex <= 0) {
      navigateTo(`/idnty/${stateSlug}/review`);
      return;
    }
    const prev = activeSteps[stepIndex - 1];
    if (prev) navigateTo(idntyLorePath(stateSlug, prev.id));
  };

  const captured = isCaptured(form.value, step.skippable);
  const nextRemaining = resolveActiveLoreSteps({ loreAnswers: record.loreAnswers }).filter((s) => s.id !== stepId);
  const nextLabel = nextRemaining.length > 0 ? 'NEXT' : 'REVIEW WORLD';

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
            <p className="site00-idnty-calibration-rail__category">CALIBRATION</p>
          ) : (
            <p className="site00-idnty-calibration-rail__category">BRAND WORLD</p>
          )
        }
        captureStatus={
          <IdentityCalibrationCaptureStatus
            primary={captured ? 'CAPTURED' : 'OPTIONAL'}
            secondary={step.helper ?? step.subtitle ?? 'YOUR WORLD'}
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
        <IdentityLoreStepForm step={step} value={form.value} onChange={form.setValue} error={form.error} />
        {step.skippable ? (
          <button type="button" className="site00-idnty-calibration-nav__skip" onClick={handleSkip}>
            SKIP / NOT SURE YET
          </button>
        ) : null}
      </IdentityCalibrationConsole>
    </div>
  );
}
