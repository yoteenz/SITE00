import { useNavigate } from 'react-router-dom';
import {
  getBldrAssessmentState,
  bldrAssessmentCompletePath,
  bldrAssessmentPath,
  bldrAssessmentAllSteps,
  type BldrAssessmentStateId,
} from '../../../config/bldr-assessment';
import { useBldrAssessment } from '../../../hooks/useBldrAssessment';
import { BldrAssessmentShell, BldrAssessmentActions } from '../../../components/bldr-assessment/BldrAssessmentShell';
import { IdntyProcessStripPanel } from '../../../components/idnty-assessment/IdntyAssessmentPanels';
import { formatAnswerLabel } from '../../../components/idnty-assessment/IdntyStepForm';
import { useSite00DesktopArtboardPreview } from '../../../components/shell/Site00DesktopArtboardContext';
import { site00BldrAssessmentDesktopPath } from '../../../config/routes';

type BldrAssessmentReviewPageProps = {
  classSlug: BldrAssessmentStateId;
};

export default function BldrAssessmentReviewPage({ classSlug }: BldrAssessmentReviewPageProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getBldrAssessmentState(classSlug)!;
  const { getAnswersForClass, completeAssessment } = useBldrAssessment();
  const answers = getAnswersForClass(classSlug);
  const allSteps = bldrAssessmentAllSteps(state);

  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00BldrAssessmentDesktopPath(path) : path);
  };

  const handleSubmit = () => {
    completeAssessment(classSlug);
    navigateTo(bldrAssessmentCompletePath(classSlug));
  };

  const panel = (
    <div className="site00-idnty-assessment-card site00-idnty-assessment-card--review">
      <p className="site00-bldr-context-label">{state.contextLabel}</p>
      <h2 className="site00-idnty-assessment-card__title">YOUR BUILD BLUEPRINT</h2>
      <p className="site00-idnty-assessment-card__subtitle">REVIEW YOUR RESPONSES BEFORE SUBMITTING.</p>

      <dl className="site00-idnty-review-list">
        {allSteps.map((step) => (
          <div key={step.id} className="site00-idnty-review-list__row">
            <dt>{step.title}</dt>
            <dd>{formatAnswerLabel(step.options, answers[step.id] ?? '')}</dd>
            <button
              type="button"
              className="site00-idnty-review-list__edit"
              onClick={() => {
                const isLanding = state.landingFields.some((f) => f.id === step.id);
                navigateTo(isLanding ? bldrAssessmentPath(classSlug) : bldrAssessmentPath(classSlug, step.id));
              }}
            >
              EDIT
            </button>
          </div>
        ))}
      </dl>

      <BldrAssessmentActions
        primaryLabel="REVIEW BLUEPRINT →"
        onPrimary={handleSubmit}
        secondaryLabel="BACK"
        onSecondary={() => {
          const last = state.steps[state.steps.length - 1];
          navigateTo(last ? bldrAssessmentPath(classSlug, last.id) : bldrAssessmentPath(classSlug));
        }}
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
