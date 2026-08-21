import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getExperienceQuestion,
  bldrExperienceNextStep,
  bldrExperiencePath,
  contextualizeExperienceTitle,
} from '../../../../../shared/site00-brand-lore/bldr-experience-questions';
import { LORE_SKIP_VALUE } from '../../../../../shared/site00-brand-lore/adaptivity';
import type { BldrAssessmentStateId } from '../../../config/bldr-assessment';
import { getBldrAssessmentState, bldrAssessmentReviewPath } from '../../../config/bldr-assessment';
import { useBldrAssessment } from '../../../hooks/useBldrAssessment';
import { useStepForm } from '../../idnty-assessment/IdntyStepForm';
import { IdentityLoreStepForm } from '../../idnty/lore/IdentityLoreStepForm';
import { IdentityCalibrationConsole } from '../../idnty/calibration/IdentityCalibrationConsole';
import { IdentityCalibrationCaptureStatus } from '../../idnty/calibration/IdentityCalibrationCaptureStatus';
import { IdentityCalibrationNavigation } from '../../idnty/calibration/IdentityCalibrationNavigation';
import { IntakeSaveStatus } from '../../intake/IntakeSaveStatus';
import type { LoreQuestionStep } from '../../../../../shared/site00-brand-lore/idnty-lore-questions';

type BldrExperienceMobileStepProps = {
  classSlug: BldrAssessmentStateId;
  stepId: string;
};

function toLoreStep(step: NonNullable<ReturnType<typeof getExperienceQuestion>>, title: string): LoreQuestionStep {
  const responseMode =
    step.type === 'textarea' ? 'FREE_TEXT' : step.type === 'multi' ? 'MULTI_SELECT' : 'SINGLE_SELECT';
  return {
    id: step.id,
    title,
    subtitle: step.subtitle,
    responseMode,
    type: step.type === 'textarea' ? 'textarea' : step.type,
    options: step.options,
    maxLength: step.maxLength,
    required: step.required,
    skippable: step.skippable,
    domain: step.domain,
  };
}

export function BldrExperienceMobileStep({ classSlug, stepId }: BldrExperienceMobileStepProps) {
  const navigate = useNavigate();
  const state = getBldrAssessmentState(classSlug)!;
  const step = getExperienceQuestion(stepId);
  const {
    setExperienceAnswers,
    markExperienceStepComplete,
    record,
    inheritedLoreSnapshot,
    serverSaveState,
    serverLastSavedAt,
    serverSaveError,
  } = useBldrAssessment();

  const existingValue = record.experienceAnswers[stepId] ?? (step?.type === 'multi' ? [] : '');
  const form = useStepForm(existingValue);

  const inheritedLore = useMemo(() => {
    const snap = inheritedLoreSnapshot as { worldMetaphor?: string; audienceRelationship?: string } | null;
    if (!snap) return null;
    return {
      worldMetaphor: typeof snap.worldMetaphor === 'string' ? snap.worldMetaphor : null,
      audienceRelationship: typeof snap.audienceRelationship === 'string' ? snap.audienceRelationship : null,
    };
  }, [inheritedLoreSnapshot]);

  useEffect(() => {
    form.setValue(existingValue);
  }, [stepId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!step) {
    navigate(bldrExperiencePath(classSlug, 'arrival'));
    return null;
  }

  const title = contextualizeExperienceTitle(stepId, inheritedLore);
  const loreStep = toLoreStep(step, title);

  const handleNext = () => {
    setExperienceAnswers(stepId, form.value as string | string[]);
    markExperienceStepComplete(stepId);
    const next = bldrExperienceNextStep(stepId);
    if (next) {
      navigate(bldrExperiencePath(classSlug, next));
    } else {
      navigate(bldrAssessmentReviewPath(classSlug));
    }
  };

  const handleSkip = () => {
    setExperienceAnswers(stepId, LORE_SKIP_VALUE);
    markExperienceStepComplete(stepId);
    handleNext();
  };

  const captured =
    form.value === LORE_SKIP_VALUE ||
    (Array.isArray(form.value) ? form.value.length > 0 : Boolean(form.value && String(form.value).trim()));

  return (
    <div className="site00-idnty-calibration-flow">
      <IntakeSaveStatus state={serverSaveState} lastSavedAt={serverLastSavedAt} errorMessage={serverSaveError} />
      {inheritedLore?.worldMetaphor ? (
        <p className="site00-idnty-calibration-rail__category">
          WORLD: {String(inheritedLore.worldMetaphor).slice(0, 80)}
        </p>
      ) : null}
      <IdentityCalibrationConsole
        stepIndex={0}
        totalSteps={1}
        progressRail={<p className="site00-idnty-calibration-rail__category">DIGITAL EXPERIENCE · {state.title}</p>}
        captureStatus={
          <IdentityCalibrationCaptureStatus
            primary={captured ? 'CAPTURED' : 'OPTIONAL'}
            secondary="HOW THIS WORLD BEHAVES DIGITALLY"
            captured={captured}
          />
        }
        navigation={
          <IdentityCalibrationNavigation
            stepIndex={0}
            totalSteps={1}
            onPrevious={() => navigate(bldrAssessmentReviewPath(classSlug))}
            onContinue={handleNext}
            continueLabel={bldrExperienceNextStep(stepId) ? 'NEXT' : 'REVIEW'}
            nextStepLabel="EXPERIENCE"
          />
        }
      >
        <IdentityLoreStepForm step={loreStep} value={form.value} onChange={form.setValue} error={form.error} />
        {step.skippable ? (
          <button type="button" className="site00-idnty-calibration-nav__skip" onClick={handleSkip}>
            SKIP / NOT SURE YET
          </button>
        ) : null}
      </IdentityCalibrationConsole>
    </div>
  );
}
