import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LORE_SKIP_VALUE } from '../../../../shared/site00-brand-lore/adaptivity';
import { loreInteractionMode } from '../../../../shared/site00-brand-lore/loreAnswerTypes';
import type { AppetiteQuestionStep } from '../../../../shared/site00-brand-lore/founderCreativeAppetite/questions';
import type { StepFormValue } from '../idnty-assessment/IdntyStepForm';
import { useStepForm } from '../idnty-assessment/IdntyStepForm';
import { IdentityCalibrationConsole } from '../idnty/calibration/IdentityCalibrationConsole';
import { IdentityCalibrationCaptureStatus } from '../idnty/calibration/IdentityCalibrationCaptureStatus';
import { IdentityCalibrationNavigation } from '../idnty/calibration/IdentityCalibrationNavigation';
import { IdentityCreativeAppetiteStepForm } from './IdentityCreativeAppetiteStepForm';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { site00ProjectCreativeDirectionPath, site00ProjectPath } from '../../config/routes';
import {
  clearProjectCreativeAppetiteResume,
  resolveProjectCreativeAppetiteResume,
  writeProjectCreativeAppetiteResume,
} from './projectCreativeAppetiteResume';
import '../../styles/site00-idnty-calibration-mobile.css';

type ProjectCreativeAppetiteFlowProps = {
  projectSlug: string;
  projectTitle: string;
  steps: AppetiteQuestionStep[];
  initialAnswers?: Record<string, string | string[]>;
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

function defaultValueForStep(step: AppetiteQuestionStep): StepFormValue {
  return loreInteractionMode(step as never) === 'multi' ? [] : '';
}

export function ProjectCreativeAppetiteFlow({
  projectSlug,
  projectTitle,
  steps,
  initialAnswers = {},
  loading,
  loadError,
  onReload,
  onComplete,
}: ProjectCreativeAppetiteFlowProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(initialAnswers);
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resumeReady, setResumeReady] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (loading) return;
    const resumed = resolveProjectCreativeAppetiteResume(steps, initialAnswers, projectSlug);
    setAnswers(resumed.answers);
    setStepIndex(resumed.stepIndex);
    setResumeReady(true);
  }, [initialAnswers, steps, loading, projectSlug]);

  const step = steps[stepIndex] ?? null;
  const existingValue = step
    ? (answers[step.id] as StepFormValue) ?? defaultValueForStep(step)
    : '';
  const form = useStepForm(existingValue);

  useEffect(() => {
    if (!step || !resumeReady) return;
    form.setValue((answers[step.id] as StepFormValue) ?? defaultValueForStep(step));
  }, [step?.id, resumeReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!resumeReady || loading || !step) return;
    const draftValue = form.value as string | string[];
    writeProjectCreativeAppetiteResume(projectSlug, {
      stepIds: steps.map((s) => s.id),
      stepId: step.id,
      answers: { ...answers, [step.id]: draftValue },
    });
  }, [answers, form.value, loading, projectSlug, resumeReady, step?.id, steps]);

  const flushSave = useCallback(
    async (patch: Record<string, string | string[]>) => {
      if (Object.keys(patch).length === 0) return false;
      setSaving(true);
      setSaveError(null);
      try {
        await site00ProjectsApi.submitCreativeAppetite(projectSlug, patch);
        return true;
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : 'FAILED TO SAVE');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [projectSlug],
  );

  const finishFlow = useCallback(() => {
    clearProjectCreativeAppetiteResume(projectSlug);
    setCompleted(true);
    window.setTimeout(() => onComplete(), 1200);
  }, [onComplete, projectSlug]);

  const handleContinue = async () => {
    if (!step || saving || completed) return;
    const nextAnswers = { ...answers, [step.id]: form.value as string | string[] };
    setAnswers(nextAnswers);
    const ok = await flushSave({ [step.id]: form.value as string | string[] });
    if (!ok) return;
    if (stepIndex >= steps.length - 1) {
      finishFlow();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const handleSkip = async () => {
    if (!step?.skippable || saving || completed) return;
    const nextAnswers = { ...answers, [step.id]: LORE_SKIP_VALUE };
    setAnswers(nextAnswers);
    const ok = await flushSave({ [step.id]: LORE_SKIP_VALUE });
    if (!ok) return;
    if (stepIndex >= steps.length - 1) {
      finishFlow();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (stepIndex <= 0) return;
    setStepIndex((i) => i - 1);
  };

  const captured = step ? isCaptured(form.value, step.skippable) : false;
  const isLastStep = stepIndex >= steps.length - 1;
  const nextStep = steps[stepIndex + 1];
  const continueLabel = useMemo(() => {
    if (completed) return 'COMPLETE';
    if (saving) return 'SAVING…';
    if (isLastStep) return 'FINISH';
    return 'CONTINUE';
  }, [completed, isLastStep, saving]);
  const nextStepLabel = completed || saving || isLastStep ? undefined : (nextStep?.helper ?? nextStep?.subtitle ?? 'NEXT');

  if (loading || !resumeReady) {
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

  if (steps.length === 0) {
    return (
      <section className="site00-cd__readiness-banner" role="status">
        <p className="site00-cd__readiness-banner-title">NO QUESTIONS AVAILABLE.</p>
        <Link to={site00ProjectPath(projectSlug)}>← BACK TO PROJECT</Link>
      </section>
    );
  }

  if (!step) return null;

  return (
    <div className="site00-project-lore-calibration">
      <header className="site00-project-lore-calibration__hero">
        <p className="site00-project-lore-calibration__kicker">HOW FAR CAN WE TAKE IT?</p>
        <h1 className="site00-project-lore-calibration__project">{projectTitle}</h1>
        <p className="site00-project-lore-calibration__headline">
          YOUR COMFORT RANGE FOR CREATIVE EXPLORATION — NOT STYLE PRESCRIPTIONS.
        </p>
      </header>

      {saveError ? <p className="site00-cd__error" role="alert">{saveError}</p> : null}

      {completed ? (
        <section className="site00-cd__readiness-banner" role="status" aria-live="polite">
          <p className="site00-cd__readiness-banner-title">SAVED.</p>
          <p className="site00-cd__readiness-banner-body">RETURNING YOU TO CREATIVE DIRECTION…</p>
        </section>
      ) : null}

      <div className="site00-idnty-calibration-flow">
        <IdentityCalibrationConsole
          stepIndex={stepIndex}
          totalSteps={steps.length}
          progressRail={<p className="site00-idnty-calibration-rail__category">CREATIVE RANGE</p>}
          captureStatus={
            <IdentityCalibrationCaptureStatus
              primary={captured ? 'CAPTURED' : step.required ? 'REQUIRED' : 'OPTIONAL'}
              secondary={step.helper ?? step.subtitle ?? 'YOUR RANGE'}
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
              nextStepLabel={nextStepLabel}
              continueDisabled={(!captured && !!step.required) || saving || completed}
            />
          }
        >
          <IdentityCreativeAppetiteStepForm
            step={step}
            value={form.value}
            onChange={form.setValue}
            error={form.error}
          />
          {step.skippable ? (
            <button
              type="button"
              className="site00-idnty-calibration-nav__skip"
              onClick={() => void handleSkip()}
              disabled={saving || completed}
            >
              SKIP / NOT SURE YET
            </button>
          ) : null}
        </IdentityCalibrationConsole>
      </div>

      <p className="site00-idnty-calibration-footnote">
        <Link to={site00ProjectCreativeDirectionPath(projectSlug)}>Return to creative direction</Link>
      </p>
    </div>
  );
}
