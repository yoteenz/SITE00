import {
  getIdntyAssessmentState,
  type IdntyAssessmentStateId,
} from '../../../config/idnty-assessment';
import { useIdntyAssessment } from '../../../hooks/useIdntyAssessment';
import { IdntyAssessmentShell } from '../../../components/idnty-assessment/IdntyAssessmentShell';
import { IdntyProcessStripPanel } from '../../../components/idnty-assessment/IdntyAssessmentPanels';
import { formatAnswerLabel } from '../../../components/idnty-assessment/IdntyStepForm';
import { IdentityCalibrationMobileComplete } from '../../../components/idnty/calibration';
import { useSite00DesktopArtboardPreview } from '../../../components/shell/Site00DesktopArtboardContext';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { isSignedIn } from '../../../../utils/adminAuth';
import { IntakeSaveStatus } from '../../../components/intake/IntakeSaveStatus';
import { IntakeGuestAccessCapture } from '../../../components/intake/IntakeGuestAccessCapture';

type IdntyAssessmentCompletePageProps = {
  stateSlug: IdntyAssessmentStateId;
};

export default function IdntyAssessmentCompletePage({ stateSlug }: IdntyAssessmentCompletePageProps) {
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getIdntyAssessmentState(stateSlug)!;
  const {
    getAnswersForState,
    record,
    serverSaveState,
    serverLastSavedAt,
    serverSaveError,
    serverIntake,
    requestGuestAccess,
  } = useIdntyAssessment();
  const answers = getAnswersForState(stateSlug);
  const signedIn = isSignedIn();

  if (!isDesktop) {
    return (
      <IdntyAssessmentShell state={state} mobileLayout="calibration" showProcessStrip={false}>
        <IdentityCalibrationMobileComplete stateSlug={stateSlug} />
      </IdntyAssessmentShell>
    );
  }

  const processVariant =
    state.processStrip.id === 'next' ? 'timeline' : state.processStrip.id === 'journey' ? 'journey' : 'default';

  const panel = (
    <div className="site00-idnty-assessment-card site00-idnty-assessment-card--complete">
      <p className="site00-idnty-assessment__marker">ASSESSMENT COMPLETE</p>
      <h2 className="site00-idnty-assessment-card__title">{state.completionTitle}</h2>
      <p className="site00-idnty-assessment-card__subtitle">{state.completionSubtitle}</p>

      <div className="site00-idnty-complete-summary">
        <h3 className="site00-idnty-complete-summary__heading">YOUR SITE 00 STARTING POINT</h3>
        <dl className="site00-idnty-review-list">
          <div className="site00-idnty-review-list__row">
            <dt>IDENTITY STATE</dt>
            <dd>{state.title}</dd>
          </div>
          {state.steps.slice(0, 4).map((step) => (
            <div key={step.id} className="site00-idnty-review-list__row">
              <dt>{step.title}</dt>
              <dd>{formatAnswerLabel(step.options, answers[step.id] ?? '')}</dd>
            </div>
          ))}
        </dl>
      </div>

      <IntakeSaveStatus state={serverSaveState} lastSavedAt={serverLastSavedAt} errorMessage={serverSaveError} />

      {!signedIn && (
        <IntakeGuestAccessCapture
          intakeType="IDENTITY"
          onRequestAccess={requestGuestAccess}
          alreadyIssued={Boolean(serverIntake?.verifiedEmailAt) || Boolean(serverIntake?.email)}
        />
      )}

      <div className="site00-idnty-complete-actions">
        {state.recommendedActions.map((action) => (
          <Link key={action.id} to={action.href} className="site00-idnty-assessment__btn-primary site00-idnty-complete-actions__link">
            {action.label}
          </Link>
        ))}
        <div className="site00-idnty-complete-actions__secondary-row">
          <Link to={SITE00_ROUTES.idnty} className="site00-idnty-assessment__btn-secondary">
            RETURN TO IDNTY
          </Link>
          {!record.identityState ? null : (
            <Link to={SITE00_ROUTES.signIn} className="site00-idnty-assessment__btn-secondary">
              SIGN IN TO SAVE
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <IdntyAssessmentShell
      state={state}
      panel={panel}
      showProcessStrip={false}
      processStrip={
        <IdntyProcessStripPanel strip={state.processStrip} variant={processVariant} />
      }
    />
  );
}
