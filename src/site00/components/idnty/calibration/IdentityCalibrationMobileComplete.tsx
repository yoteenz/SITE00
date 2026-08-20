import { Link } from 'react-router-dom';
import {
  getIdntyAssessmentState,
  type IdntyAssessmentStateId,
} from '../../../config/idnty-assessment';
import { useIdntyAssessment } from '../../../hooks/useIdntyAssessment';
import { formatAnswerLabel } from '../../idnty-assessment/IdntyStepForm';
import { IdentityStateProgress } from '../state-v2/IdentityStateProgress';
import { IdentityCalibrationConsole } from './IdentityCalibrationConsole';
import { IdentityTargetControl } from './IdentityTargetControl';
import { IdntyBrandStateIcon } from '../IdntyBrandStateIcon';
import type { IdntyBrandStateIconId } from '../../../config/idnty-brand-state-icons';
import { SITE00_ROUTES } from '../../../config/routes';

type IdentityCalibrationMobileCompleteProps = {
  stateSlug: IdntyAssessmentStateId;
};

export function IdentityCalibrationMobileComplete({ stateSlug }: IdentityCalibrationMobileCompleteProps) {
  const state = getIdntyAssessmentState(stateSlug)!;
  const { getAnswersForState, record } = useIdntyAssessment();
  const answers = getAnswersForState(stateSlug);
  const iconId = (state.iconId ?? state.id) as IdntyBrandStateIconId;

  return (
    <div className="site00-idnty-calibration-flow site00-idnty-calibration-flow--complete">
      <IdentityStateProgress stateId={stateSlug} />
      <IdentityCalibrationConsole
        stepIndex={state.steps.length - 1}
        totalSteps={state.steps.length}
        progressRail={
          <p className="site00-idnty-calibration-rail__category site00-idnty-calibration-rail__category--resolved">
            IDENTITY CALIBRATION COMPLETE
          </p>
        }
        captureStatus={
          <div className="site00-idnty-calibration-complete__status">
            <IdentityTargetControl selected className="site00-idnty-calibration-complete__target" />
            <div>
              <p className="site00-idnty-calibration-complete__status-primary">IDENTITY INPUT COMPLETE</p>
              <p className="site00-idnty-calibration-complete__status-secondary">YOUR FOUNDATION HAS A SIGNAL.</p>
            </div>
          </div>
        }
        navigation={
          <div className="site00-idnty-calibration-complete__actions">
            {state.recommendedActions.map((action) => (
              <Link
                key={action.id}
                to={action.href}
                className="site00-idnty-calibration-nav__continue site00-idnty-calibration-complete__cta"
              >
                <span className="site00-idnty-calibration-nav__continue-label">{action.label}</span>
              </Link>
            ))}
            <Link to={SITE00_ROUTES.idnty} className="site00-idnty-calibration-complete__secondary">
              RETURN TO IDNTY
            </Link>
            {!record.identityState ? null : (
              <Link to={SITE00_ROUTES.signIn} className="site00-idnty-calibration-complete__secondary">
                SIGN IN TO SAVE
              </Link>
            )}
          </div>
        }
      >
        <div className="site00-idnty-calibration-complete">
          <div className="site00-idnty-calibration-complete__hero-art" aria-hidden="true">
            <IdntyBrandStateIcon id={iconId} title={state.title} />
          </div>
          <h2 className="site00-idnty-calibration-complete__title">{state.completionTitle}</h2>
          <p className="site00-idnty-calibration-complete__subtitle">{state.completionSubtitle}</p>
          <div className="site00-idnty-calibration-complete__summary">
            <h3 className="site00-idnty-calibration-complete__summary-heading">YOUR SITE 00 STARTING POINT</h3>
            <dl className="site00-idnty-calibration-review__list">
              <div className="site00-idnty-calibration-review__row">
                <dt>IDENTITY STATE</dt>
                <dd>{state.title}</dd>
              </div>
              {state.steps.slice(0, 4).map((step, index) => (
                <div key={step.id} className="site00-idnty-calibration-review__row">
                  <dt>
                    <span className="site00-idnty-calibration-review__index">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {step.title}
                  </dt>
                  <dd>{formatAnswerLabel(step.options, answers[step.id] ?? '')}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </IdentityCalibrationConsole>
    </div>
  );
}
