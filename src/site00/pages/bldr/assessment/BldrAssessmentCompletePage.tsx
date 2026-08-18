import { Link } from 'react-router-dom';
import {
  getBldrAssessmentState,
  bldrAssessmentAllSteps,
  type BldrAssessmentStateId,
} from '../../../config/bldr-assessment';
import { useBldrAssessment } from '../../../hooks/useBldrAssessment';
import { BldrAssessmentShell } from '../../../components/bldr-assessment/BldrAssessmentShell';
import { formatAnswerLabel } from '../../../components/idnty-assessment/IdntyStepForm';
import { SITE00_ROUTES } from '../../../config/routes';

type BldrAssessmentCompletePageProps = {
  classSlug: BldrAssessmentStateId;
};

export default function BldrAssessmentCompletePage({ classSlug }: BldrAssessmentCompletePageProps) {
  const state = getBldrAssessmentState(classSlug)!;
  const { getAnswersForClass } = useBldrAssessment();
  const answers = getAnswersForClass(classSlug);
  const allSteps = bldrAssessmentAllSteps(state);

  const panel = (
    <div className="site00-idnty-assessment-card site00-idnty-assessment-card--complete">
      <p className="site00-idnty-assessment__marker">ASSESSMENT COMPLETE</p>
      <h2 className="site00-idnty-assessment-card__title">{state.completionTitle}</h2>
      <p className="site00-idnty-assessment-card__subtitle">{state.completionSubtitle}</p>

      <div className="site00-idnty-complete-summary">
        <h3 className="site00-idnty-complete-summary__heading">YOUR SITE 00 BUILD PROFILE</h3>
        <dl className="site00-idnty-review-list">
          <div className="site00-idnty-review-list__row">
            <dt>BUILD CLASS</dt>
            <dd>{state.title}</dd>
          </div>
          {allSteps.slice(0, 5).map((step) => (
            <div key={step.id} className="site00-idnty-review-list__row">
              <dt>{step.title}</dt>
              <dd>{formatAnswerLabel(step.options, answers[step.id] ?? '')}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="site00-idnty-complete-actions">
        {state.recommendedActions.map((action) => (
          <Link key={action.id} to={action.href} className="site00-idnty-assessment__btn-primary site00-idnty-complete-actions__link">
            {action.label}
          </Link>
        ))}
        <Link to={SITE00_ROUTES.bldrState} className="site00-idnty-assessment__btn-secondary">
          RETURN TO BLDR
        </Link>
        <Link to={SITE00_ROUTES.signIn} className="site00-idnty-assessment__btn-secondary">
          SIGN IN TO SAVE
        </Link>
      </div>
    </div>
  );

  return <BldrAssessmentShell state={state} panel={panel} showProcessStrip={false} />;
}
