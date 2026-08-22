import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LoreQuestionStep } from '../../../../shared/site00-brand-lore/idnty-lore-questions';
import { LORE_SKIP_VALUE } from '../../../../shared/site00-brand-lore/adaptivity';
import { loreInteractionMode } from '../../../../shared/site00-brand-lore/loreAnswerTypes';
import type { StepFormValue } from '../idnty-assessment/IdntyStepForm';
import { useStepForm } from '../idnty-assessment/IdntyStepForm';
import { IdentityCalibrationConsole } from '../idnty/calibration/IdentityCalibrationConsole';
import { IdentityCalibrationCaptureStatus } from '../idnty/calibration/IdentityCalibrationCaptureStatus';
import { IdentityCalibrationNavigation } from '../idnty/calibration/IdentityCalibrationNavigation';
import { IdentityLoreStepForm } from '../idnty/lore/IdentityLoreStepForm';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { site00ProjectCreativeDirectionPath, site00ProjectPath } from '../../config/routes';
import '../../styles/site00-idnty-calibration-mobile.css';

type ProjectLoreCalibrationFlowProps = {
  projectSlug: string;
  projectTitle: string;
  steps: LoreQuestionStep[];
  initialAnswers?: Record<string, string | string[]>;
  readyNow: boolean;
  loading: boolean;
  loadError: string | null;
  onReload: () => void;
  onComplete: () => void;
};

function isCaptured(value: StepFormValue, skippable?: boolean): boolean {
  if (value === LORE_SKIP_VALUE || value === 'not-sure') return skippable ?? true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return skippable ?? false;
}

export function ProjectLoreCalibrationFlow({
  projectSlug,
  projectTitle,
  steps,
  initialAnswers = {},
  readyNow,
  loading,
  loadError,
  onReload,
  onComplete,
}: ProjectLoreCalibrationFlowProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(initialAnswers);
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setAnswers(initialAnswers);
    setStepIndex(0);
  }, [initialAnswers, steps]);

  const step = steps[stepIndex] ?? null;
  const defaultValueForStep = (s: LoreQuestionStep): StepFormValue =>
    loreInteractionMode(s) === 'multi' ? [] : '';

  const existingValue = step
    ? (answers[step.id] as StepFormValue) ?? defaultValueForStep(step)
    : '';
  const form = useStepForm(existingValue);

  useEffect(() => {
    if (!step) return;
    form.setValue((answers[step.id] as StepFormValue) ?? defaultValueForStep(step));
  }, [step?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const flushSave = useCallback(
    async (nextAnswers: Record<string, string | string[]>) => {
      if (Object.keys(nextAnswers).length === 0) return null;
      setSaving(true);
      setSaveError(null);
      try {
        return await site00ProjectsApi.submitLoreCalibration(projectSlug, nextAnswers);
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : 'CALIBRATION FAILED TO SAVE');
        return null;
      } finally {
        setSaving(false);
      }
    },
    [projectSlug],
  );

  const handleContinue = async () => {
    if (!step) return;
    const nextAnswers = { ...answers, [step.id]: form.value as string | string[] };
    setAnswers(nextAnswers);

    const payload = await flushSave(nextAnswers);
    if (payload === null) return;

    const readiness = payload?.engagement.brandLoreReadiness;
    if (payload && !readiness?.blocked) {
      onComplete();
      return;
    }

    if (stepIndex >= steps.length - 1) {
      if (payload && !readiness?.blocked) {
        onComplete();
      }
      return;
    }

    setStepIndex((i) => i + 1);
  };

  const handleSkip = async () => {
    if (!step?.skippable) return;
    const nextAnswers = { ...answers, [step.id]: LORE_SKIP_VALUE };
    setAnswers(nextAnswers);
    const payload = await flushSave(nextAnswers);
    if (payload === null) return;
    if (payload && !payload.engagement.brandLoreReadiness?.blocked) {
      onComplete();
      return;
    }
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex <= 0) return;
    setStepIndex((i) => i - 1);
  };

  const captured = step ? isCaptured(form.value, step.skippable) : false;
  const isLastStep = stepIndex >= steps.length - 1;
  const continueLabel = useMemo(() => {
    if (saving) return 'SAVING…';
    if (isLastStep) return 'COMPLETE CALIBRATION';
    return 'CONTINUE';
  }, [isLastStep, saving]);

  if (loading) {
    return <p className="site00-cd__loading" aria-busy="true">LOADING…</p>;
  }

  if (loadError) {
    return (
      <div className="site00-cd__error-panel" role="alert">
        <p>{loadError}</p>
        <button type="button" onClick={onReload}>TRY AGAIN</button>
      </div>
    );
  }

  if (readyNow) {
    return (
      <section className="site00-cd__readiness-banner" role="status">
        <p className="site00-cd__readiness-banner-title">CONTEXT IS ALREADY COMPLETE.</p>
        <p className="site00-cd__readiness-banner-body">There is nothing left to calibrate right now.</p>
        <Link to={site00ProjectCreativeDirectionPath(projectSlug)}>REVIEW CREATIVE DIRECTION →</Link>
      </section>
    );
  }

  if (steps.length === 0) {
    return (
      <section className="site00-cd__readiness-banner" role="status">
        <p className="site00-cd__readiness-banner-title">NO CALIBRATION STEPS AVAILABLE.</p>
        <Link to={site00ProjectPath(projectSlug)}>← BACK TO PROJECT</Link>
      </section>
    );
  }

  if (!step) return null;

  return (
    <div className="site00-project-lore-calibration">
      <header className="site00-project-lore-calibration__hero">
        <p className="site00-project-lore-calibration__kicker">CONTEXT CALIBRATION</p>
        <h1 className="site00-project-lore-calibration__project">{projectTitle}</h1>
        <p className="site00-project-lore-calibration__headline">
          ONE MORE THING BEFORE WE DECIDE WHAT THIS LOOKS LIKE.
        </p>
      </header>

      {saveError ? (
        <p className="site00-cd__error" role="alert">{saveError}</p>
      ) : null}

      <div className="site00-idnty-calibration-flow">
        <IdentityCalibrationConsole
          stepIndex={stepIndex}
          totalSteps={steps.length}
          progressRail={<p className="site00-idnty-calibration-rail__category">BRAND LORE</p>}
          captureStatus={
            <IdentityCalibrationCaptureStatus
              primary={captured ? 'CAPTURED' : step.required ? 'REQUIRED' : 'OPTIONAL'}
              secondary={step.helper ?? step.subtitle ?? 'YOUR WORLD'}
              captured={captured}
            />
          }
          navigation={
            <IdentityCalibrationNavigation
              stepIndex={stepIndex}
              totalSteps={steps.length}
              onPrevious={handleBack}
              onContinue={() => void handleContinue()}
              continueLabel={continueLabel}
              nextStepLabel={continueLabel}
              continueDisabled={(!captured && !!step.required) || saving}
            />
          }
        >
          <IdentityLoreStepForm step={step} value={form.value} onChange={form.setValue} error={form.error} />
          {step.skippable ? (
            <button
              type="button"
              className="site00-idnty-calibration-nav__skip"
              onClick={() => void handleSkip()}
              disabled={saving}
            >
              SKIP / NOT SURE YET
            </button>
          ) : null}
        </IdentityCalibrationConsole>
      </div>
    </div>
  );
}
