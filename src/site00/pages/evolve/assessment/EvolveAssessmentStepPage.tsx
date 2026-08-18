import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EVOLVE_ONBOARDING_STEPS,
  evolveAssessmentPath,
  evolveAssessmentNextStep,
  getEvolvePathConfig,
} from '../../../config/evolve-assessment';
import { useEvolveAssessment } from '../../../hooks/useEvolveAssessment';
import {
  EvolveAssessmentActions,
  EvolveAssessmentShell,
} from '../../../components/evolve-assessment/EvolveAssessmentShell';
import { EvolveStepFields } from '../../../components/evolve-assessment/EvolveStepFields';
import { useSite00DesktopArtboardPreview } from '../../../components/shell/Site00DesktopArtboardContext';
import { site00EvolveAssessmentDesktopPath, SITE00_ROUTES } from '../../../config/routes';
import type { EvolvePathId } from '../../../config/evolve';

type EvolveAssessmentStepPageProps = {
  pathSlug: EvolvePathId;
  stepId: string;
};

export default function EvolveAssessmentStepPage({ pathSlug, stepId }: EvolveAssessmentStepPageProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const pathConfig = getEvolvePathConfig(pathSlug);
  const step = EVOLVE_ONBOARDING_STEPS.find((s) => s.id === stepId);
  const { startPath, setStepAnswers, markStepComplete, getStepAnswers, generateScope, record } = useEvolveAssessment();

  const existing = getStepAnswers(stepId);
  const [values, setValues] = useState<Record<string, string | string[]>>(() => ({ ...existing }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const scope = useMemo(() => record.scopeAssessment, [record.scopeAssessment]);

  useEffect(() => {
    if (stepId === 'scope' && !record.scopeAssessment) {
      generateScope(pathSlug);
    }
  }, [stepId, pathSlug, record.scopeAssessment, generateScope]);

  useEffect(() => {
    startPath(pathSlug, stepId);
  }, [pathSlug, stepId, startPath]);

  if (!step) {
    navigate(evolveAssessmentPath(pathSlug, 'property'));
    return null;
  }

  const stepIndex = EVOLVE_ONBOARDING_STEPS.findIndex((s) => s.id === stepId);
  const progress = `STEP ${stepIndex + 1} OF ${EVOLVE_ONBOARDING_STEPS.length}`;

  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00EvolveAssessmentDesktopPath(path) : path);
  };

  const handleFieldChange = (fieldId: string, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const validate = (): boolean => {
    if (stepId === 'diagnose') {
      const goals = values.goals;
      if (!goals || (Array.isArray(goals) && goals.length === 0)) {
        setErrors({ goals: 'SELECT AT LEAST ONE GOAL.' });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;
    setStepAnswers(pathSlug, stepId, values);
    markStepComplete(pathSlug, stepId);

    if (stepId === 'scope') {
      generateScope(pathSlug);
    }

    const next = evolveAssessmentNextStep(stepId);
    if (next) {
      navigateTo(evolveAssessmentPath(pathSlug, next));
    } else {
      navigateTo(evolveAssessmentPath(pathSlug, 'complete'));
    }
  };

  const handleSaveExit = () => {
    setStepAnswers(pathSlug, stepId, values);
    navigate(SITE00_ROUTES.evolveState);
  };

  const panel = (
    <div className="site00-idnty-assessment__form-panel">
      <p className="site00-label-red">{progress}</p>
      <h2 className="site00-heading">{step.title}</h2>
      {step.subtitle ? <p className="site00-label">{step.subtitle}</p> : null}
      <EvolveStepFields step={step} values={values} onChange={handleFieldChange} errors={errors} scope={scope} />
      <EvolveAssessmentActions
        primaryLabel={pathConfig.primaryCta}
        onPrimary={handleNext}
        secondaryLabel="SAVE & EXIT"
        onSecondary={handleSaveExit}
      />
    </div>
  );

  return <EvolveAssessmentShell state={pathConfig} pathId={pathSlug} panel={panel} />;
}
