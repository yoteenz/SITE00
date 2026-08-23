import { useNavigate } from 'react-router-dom';
import {
  getIdntyAssessmentState,
  idntyAssessmentPath,
  idntyDiscoveryResultPath,
  type IdntyAssessmentStateId,
} from '../../../config/idnty-assessment';
import { useIdntyAssessment } from '../../../hooks/useIdntyAssessment';
import { formatAnswerLabel } from '../../idnty-assessment/IdntyStepForm';
import { IdentityStateHero } from '../state-v2/IdentityStateProgress';
import { IdentityStateProgress } from '../state-v2/IdentityStateProgress';
import { IdentityCalibrationConsole } from './IdentityCalibrationConsole';
import { IdentityCalibrationCaptureStatus } from './IdentityCalibrationCaptureStatus';
import { IdentityCalibrationNavigation } from './IdentityCalibrationNavigation';
import { useSite00DesktopArtboardPreview } from '../../shell/Site00DesktopArtboardContext';
import { site00IdntyAssessmentDesktopPath } from '../../../config/routes';

type IdentityCalibrationMobileReviewProps = {
  stateSlug: IdntyAssessmentStateId;
};

export function IdentityCalibrationMobileReview({ stateSlug }: IdentityCalibrationMobileReviewProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getIdntyAssessmentState(stateSlug)!;
  const { getAnswersForState } = useIdntyAssessment();
  const answers = getAnswersForState(stateSlug);

  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00IdntyAssessmentDesktopPath(path) : path);
  };

  const handleSubmit = () => {
    navigateTo(idntyDiscoveryResultPath(stateSlug));
  };

  const lastStep = state.steps[state.steps.length - 1];

  return (
    <div className="site00-idnty-calibration-flow">
      <IdentityStateProgress stateId={stateSlug} />
      <IdentityStateHero state={state} />
      <IdentityCalibrationConsole
        stepIndex={state.steps.length - 1}
        totalSteps={state.steps.length}
        progressRail={
          <p className="site00-idnty-calibration-rail__category site00-idnty-calibration-rail__category--review">
            REVIEW
          </p>
        }
        captureStatus={
          <IdentityCalibrationCaptureStatus
            primary="ALL INPUTS CAPTURED"
            secondary="READY FOR SUBMISSION"
            captured
          />
        }
        navigation={
          <IdentityCalibrationNavigation
            stepIndex={state.steps.length - 1}
            totalSteps={state.steps.length}
            onPrevious={() => {
              if (lastStep) navigateTo(idntyAssessmentPath(stateSlug, lastStep.id));
            }}
            onContinue={handleSubmit}
            continueLabel="CONTINUE TO BRAND WORLD"
            nextStepLabel="WORLD"
          />
        }
      >
        <div className="site00-idnty-calibration-review">
          <h2 className="site00-idnty-calibration-review__title">{state.completionTitle}</h2>
          <p className="site00-idnty-calibration-review__subtitle">REVIEW YOUR RESPONSES BEFORE SUBMITTING.</p>
          <dl className="site00-idnty-calibration-review__list">
            {state.steps.map((step, index) => (
              <div key={step.id} className="site00-idnty-calibration-review__row">
                <dt>
                  <span className="site00-idnty-calibration-review__index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {step.title}
                </dt>
                <dd>{formatAnswerLabel(step.options, answers[step.id] ?? '')}</dd>
                <button
                  type="button"
                  className="site00-idnty-calibration-review__edit"
                  onClick={() => navigateTo(idntyAssessmentPath(stateSlug, step.id))}
                >
                  EDIT →
                </button>
              </div>
            ))}
          </dl>
        </div>
      </IdentityCalibrationConsole>
    </div>
  );
}
