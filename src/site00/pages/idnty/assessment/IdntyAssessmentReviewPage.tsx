import { useNavigate } from 'react-router-dom';
import {
  getIdntyAssessmentState,
  idntyAssessmentCompletePath,
  idntyAssessmentPath,
  type IdntyAssessmentStateId,
} from '../../../config/idnty-assessment';
import { useIdntyAssessment } from '../../../hooks/useIdntyAssessment';
import {
  IdntyAssessmentShell,
  IdntyAssessmentActions,
} from '../../../components/idnty-assessment/IdntyAssessmentShell';
import { IdntyProcessStripPanel } from '../../../components/idnty-assessment/IdntyAssessmentPanels';
import { formatAnswerLabel } from '../../../components/idnty-assessment/IdntyStepForm';
import { useSite00DesktopArtboardPreview } from '../../../components/shell/Site00DesktopArtboardContext';
import { site00IdntyAssessmentDesktopPath } from '../../../config/routes';

type IdntyAssessmentReviewPageProps = {
  stateSlug: IdntyAssessmentStateId;
};

export default function IdntyAssessmentReviewPage({ stateSlug }: IdntyAssessmentReviewPageProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getIdntyAssessmentState(stateSlug)!;
  const { getAnswersForState, completeAssessment } = useIdntyAssessment();
  const answers = getAnswersForState(stateSlug);

  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00IdntyAssessmentDesktopPath(path) : path);
  };

  const handleSubmit = () => {
    completeAssessment(stateSlug);
    navigateTo(idntyAssessmentCompletePath(stateSlug));
  };

  const processVariant =
    state.processStrip.id === 'next' ? 'timeline' : state.processStrip.id === 'journey' ? 'journey' : 'default';

  const panel = (
    <div className="site00-idnty-assessment-card site00-idnty-assessment-card--review">
      <h2 className="site00-idnty-assessment-card__title">{state.completionTitle}</h2>
      <p className="site00-idnty-assessment-card__subtitle">REVIEW YOUR RESPONSES BEFORE SUBMITTING.</p>

      <dl className="site00-idnty-review-list">
        {state.steps.map((step) => (
          <div key={step.id} className="site00-idnty-review-list__row">
            <dt>{step.title}</dt>
            <dd>{formatAnswerLabel(step.options, answers[step.id] ?? '')}</dd>
            <button
              type="button"
              className="site00-idnty-review-list__edit"
              onClick={() => navigateTo(idntyAssessmentPath(stateSlug, step.id))}
            >
              EDIT
            </button>
          </div>
        ))}
      </dl>

      <IdntyAssessmentActions
        primaryLabel="SUBMIT ASSESSMENT →"
        onPrimary={handleSubmit}
        secondaryLabel="BACK"
        onSecondary={() => {
          const lastStep = state.steps[state.steps.length - 1];
          navigateTo(idntyAssessmentPath(stateSlug, lastStep?.id ?? ''));
        }}
      />
    </div>
  );

  return (
    <IdntyAssessmentShell
      state={state}
      panel={panel}
      processStrip={
        <IdntyProcessStripPanel strip={state.processStrip} variant={processVariant} />
      }
    />
  );
}
