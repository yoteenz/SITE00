import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getBldrAssessmentState,
  bldrAssessmentPath,
  bldrAssessmentAllSteps,
  bldrDiscoveryResultPath,
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

/** Public Builder discovery — scope diagnosis only; deep Experience intelligence is post-purchase. */
export default function BldrAssessmentReviewPage({ classSlug }: BldrAssessmentReviewPageProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getBldrAssessmentState(classSlug)!;
  const { getAnswersForClass, completeAssessment, setCurrentStep } = useBldrAssessment();
  const answers = getAnswersForClass(classSlug);
  const allSteps = bldrAssessmentAllSteps(state);

  useEffect(() => {
    setCurrentStep(classSlug, 'review');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classSlug]);

  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00BldrAssessmentDesktopPath(path) : path);
  };

  const handlePrimary = () => {
    completeAssessment(classSlug);
    navigateTo(bldrDiscoveryResultPath(classSlug));
  };

  const panel = (
    <div className="site00-idnty-assessment-card site00-idnty-assessment-card--review">
      <p className="site00-bldr-context-label">{state.contextLabel}</p>
      <h2 className="site00-idnty-assessment-card__title">YOUR BUILD BLUEPRINT</h2>
      <p className="site00-idnty-assessment-card__subtitle">
        REVIEW YOUR RESPONSES — WE&apos;LL RECOMMEND A SITE 00 PATH BASED ON SCOPE.
      </p>

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
        primaryLabel="VIEW RECOMMENDATION →"
        onPrimary={handlePrimary}
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
