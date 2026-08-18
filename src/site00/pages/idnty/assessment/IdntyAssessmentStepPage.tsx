import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getIdntyAssessmentState,
  idntyAssessmentNextStep,
  idntyAssessmentPath,
  idntyAssessmentReviewPath,
  type IdntyAssessmentStateId,
} from '../../../config/idnty-assessment';
import { useIdntyAssessment } from '../../../hooks/useIdntyAssessment';
import {
  IdntyAssessmentShell,
  IdntyAssessmentActions,
} from '../../../components/idnty-assessment/IdntyAssessmentShell';
import { IdntyProcessStripPanel } from '../../../components/idnty-assessment/IdntyAssessmentPanels';
import { IdntyStepForm, useStepForm } from '../../../components/idnty-assessment/IdntyStepForm';
import { useSite00DesktopArtboardPreview } from '../../../components/shell/Site00DesktopArtboardContext';
import { site00IdntyAssessmentDesktopPath } from '../../../config/routes';

type IdntyAssessmentStepPageProps = {
  stateSlug: IdntyAssessmentStateId;
  stepId: string;
};

export default function IdntyAssessmentStepPage({ stateSlug, stepId }: IdntyAssessmentStepPageProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getIdntyAssessmentState(stateSlug)!;
  const step = state.steps.find((s) => s.id === stepId);

  const { startState, setStepAnswers, markStepComplete, getAnswersForState } = useIdntyAssessment();
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
  const stepProgress = `STEP ${stepIndex + 1} OF ${state.steps.length}`;

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

  const processVariant =
    state.processStrip.id === 'next' ? 'timeline' : state.processStrip.id === 'journey' ? 'journey' : 'default';

  const showExplore = state.landingType === 'pathway-grid' || state.landingType === 'service-grid';

  const panel = (
    <div className="site00-idnty-assessment-card">
      <p className="site00-idnty-assessment-card__progress">{stepProgress}</p>
      <IdntyStepForm
        step={step}
        value={form.value}
        onChange={form.setValue}
        error={form.error}
        showExplore={showExplore}
        gridColumns={step.options && step.options.length > 6 ? 3 : 2}
      />
      <IdntyAssessmentActions
        primaryLabel={state.primaryCta.includes('→') ? state.primaryCta : 'NEXT STEP →'}
        onPrimary={handleNext}
        secondaryLabel="BACK"
        onSecondary={handleBack}
      />
    </div>
  );

  return (
    <IdntyAssessmentShell
      state={state}
      panel={panel}
      processStrip={
        <IdntyProcessStripPanel
          strip={state.processStrip}
          variant={processVariant}
          activeStepId={state.processStrip.id === 'journey' ? 'build' : undefined}
        />
      }
    />
  );
}
