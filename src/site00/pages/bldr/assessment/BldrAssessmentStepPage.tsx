import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getBldrAssessmentState,
  bldrAssessmentNextStep,
  bldrAssessmentPath,
  bldrAssessmentReviewPath,
  bldrAssessmentRecommendationPath,
  bldrAssessmentAllSteps,
  type BldrAssessmentStateId,
} from '../../../config/bldr-assessment';
import { useBldrAssessment } from '../../../hooks/useBldrAssessment';
import { BldrAssessmentShell, BldrAssessmentActions } from '../../../components/bldr-assessment/BldrAssessmentShell';
import { IdntyProcessStripPanel } from '../../../components/idnty-assessment/IdntyAssessmentPanels';
import { IdntyStepForm, useStepForm } from '../../../components/idnty-assessment/IdntyStepForm';
import type { IdntyAssessmentStep } from '../../../config/idnty-assessment';
import { BldrDiscoveryProgress } from '../../../components/bldr-assessment/BldrScopeFields';
import { useSite00DesktopArtboardPreview } from '../../../components/shell/Site00DesktopArtboardContext';
import { site00BldrAssessmentDesktopPath } from '../../../config/routes';

type BldrAssessmentStepPageProps = {
  classSlug: BldrAssessmentStateId;
  stepId: string;
};

export default function BldrAssessmentStepPage({ classSlug, stepId }: BldrAssessmentStepPageProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getBldrAssessmentState(classSlug)!;
  const step = state.steps.find((s) => s.id === stepId);

  const { startClass, setStepAnswers, markStepComplete, getAnswersForClass } = useBldrAssessment();
  const existingAnswers = getAnswersForClass(classSlug);
  const existingValue = existingAnswers[stepId] ?? (step?.type === 'multi' ? [] : '');

  const form = useStepForm(existingValue);

  useEffect(() => {
    startClass(classSlug, stepId);
  }, [classSlug, stepId, startClass]);

  useEffect(() => {
    form.setValue(existingValue);
  }, [stepId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!step) {
    navigate(bldrAssessmentPath(classSlug));
    return null;
  }

  const allSteps = bldrAssessmentAllSteps(state);
  const stepIndex = allSteps.findIndex((s) => s.id === stepId);
  const stepProgress = `STEP ${stepIndex + 1} OF ${allSteps.length}`;

  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00BldrAssessmentDesktopPath(path) : path);
  };

  const handleNext = () => {
    if (!form.validate(step as IdntyAssessmentStep)) return;
    setStepAnswers(classSlug, stepId, { [stepId]: form.value });
    markStepComplete(classSlug, stepId);

    const next = bldrAssessmentNextStep(state, stepId);
    if (next) {
      navigateTo(bldrAssessmentPath(classSlug, next.id));
    } else if (classSlug === 'not-sure') {
      navigateTo(bldrAssessmentRecommendationPath());
    } else {
      navigateTo(bldrAssessmentReviewPath(classSlug));
    }
  };

  const handleBack = () => {
    if (stepIndex <= 0) {
      navigateTo(bldrAssessmentPath(classSlug));
      return;
    }
    const prev = allSteps[stepIndex - 1];
    if (prev.id === state.landingFields[0]?.id) {
      navigateTo(bldrAssessmentPath(classSlug));
      return;
    }
    navigateTo(bldrAssessmentPath(classSlug, prev.id));
  };

  const discoveryStep = classSlug === 'not-sure' ? stepIndex + 1 : null;

  const panel = (
    <div className="site00-idnty-assessment-card">
      <p className="site00-bldr-context-label">{state.contextLabel}</p>
      {discoveryStep ? <BldrDiscoveryProgress current={discoveryStep} /> : null}
      <p className="site00-idnty-assessment-card__progress">{stepProgress}</p>
      <IdntyStepForm
        step={step as IdntyAssessmentStep}
        value={form.value}
        onChange={form.setValue}
        error={form.error}
        gridColumns={step.gridColumns ?? 2}
      />
      <BldrAssessmentActions
        primaryLabel={classSlug === 'not-sure' ? 'NEXT QUESTION →' : 'NEXT STEP →'}
        onPrimary={handleNext}
        secondaryLabel="BACK"
        onSecondary={handleBack}
      />
    </div>
  );

  return (
    <BldrAssessmentShell
      state={state}
      panel={panel}
      processStrip={<IdntyProcessStripPanel strip={state.processStrip} />}
    />
  );
}
