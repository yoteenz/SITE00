/**
 * Founder Character Calibration — progress checklist with working navigation.
 */

import type {
  FounderDiscoveryProgressStep,
  FounderDiscoveryProgressSummary,
} from '../../utils/founderCharacterDiscoveryProgress';

const CALIBRATION_MOMENT_STEP_IDS = new Set([
  'moments',
  'truths',
  'contradictions',
  'flaws',
  'intelligence',
  'book',
  'humanity',
]);

export function stepNeedsCalibrationMoment(step: FounderDiscoveryProgressStep | null | undefined): boolean {
  return Boolean(step && CALIBRATION_MOMENT_STEP_IDS.has(step.id));
}

type Props = {
  discoveryProgress: FounderDiscoveryProgressSummary;
  busy?: boolean;
  actionError?: string | null;
  actionNotice?: string | null;
  onStepPress: (step: FounderDiscoveryProgressStep) => void;
  onContinueCalibration?: () => void;
  onGenerateSynthesis?: () => void;
  className?: string;
};

export function FounderCharacterCalibrationProgressPanel({
  discoveryProgress,
  busy = false,
  actionError,
  actionNotice,
  onStepPress,
  onContinueCalibration,
  onGenerateSynthesis,
  className,
}: Props) {
  const { nextStep, readyForCharacterSynthesis } = discoveryProgress;

  const handleNextStep = () => {
    if (!nextStep) return;
    if (stepNeedsCalibrationMoment(nextStep) && onContinueCalibration) {
      onContinueCalibration();
      return;
    }
    onStepPress(nextStep);
  };

  return (
    <section
      className={`site00-fws-calibration-progress${className ? ` ${className}` : ''}`}
      aria-label="Calibration progress"
    >
      <h2 className="site00-fws-calibration-progress__title">
        YOUR PROGRESS — {discoveryProgress.completedCount}/{discoveryProgress.totalCount} complete (
        {discoveryProgress.percentComplete}%)
      </h2>
      <div
        className={`site00-fws-calibration-progress__bar${readyForCharacterSynthesis ? ' site00-fws-calibration-progress__bar--ready' : ''}`}
        role="progressbar"
        aria-valuenow={discoveryProgress.percentComplete}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="site00-fws-calibration-progress__bar-fill" style={{ width: `${discoveryProgress.percentComplete}%` }} />
      </div>
      <p className="site00-fws-calibration-progress__headline">
        <strong>{discoveryProgress.headline}</strong>
      </p>
      {actionError ? (
        <p className="site00-fws-calibration-progress__error" role="alert">
          {actionError}
        </p>
      ) : null}
      {actionNotice ? (
        <p className="site00-fws-calibration-progress__notice" role="status">
          <strong>{actionNotice}</strong>
        </p>
      ) : null}
      {nextStep && !readyForCharacterSynthesis ? (
        <button
          type="button"
          className="site00-fws-calibration-progress__cta"
          disabled={busy}
          onClick={handleNextStep}
        >
          GO TO NEXT STEP — {nextStep.title.toUpperCase()}
        </button>
      ) : null}
      {readyForCharacterSynthesis ? (
        <div className="site00-fws-calibration-progress__ready">
          {onGenerateSynthesis ? (
            <button
              type="button"
              className="site00-fws-calibration-progress__cta"
              disabled={busy}
              onClick={onGenerateSynthesis}
            >
              GENERATE CHARACTER READ
            </button>
          ) : null}
        </div>
      ) : null}
      <ul className="site00-fws-calibration-progress__steps">
        {discoveryProgress.steps.map((step) => (
          <li key={step.id} className="site00-fws-calibration-progress__step">
            <button
              type="button"
              className={`site00-fws-calibration-progress__step-btn${step.complete ? ' site00-fws-calibration-progress__step-btn--complete' : ''}`}
              disabled={busy}
              onClick={() => {
                if (stepNeedsCalibrationMoment(step) && !step.complete && onContinueCalibration) {
                  onContinueCalibration();
                  return;
                }
                onStepPress(step);
              }}
            >
              {step.complete ? '✓ ' : '○ '}
              {step.title}
            </button>
            <span className="site00-fws-calibration-progress__step-detail">{step.detail}</span>
          </li>
        ))}
      </ul>
      {discoveryProgress.unresolvedCalibrationCount > 0 ? (
        <p className="site00-fws-calibration-progress__hint">
          {discoveryProgress.unresolvedCalibrationCount} calibration moment
          {discoveryProgress.unresolvedCalibrationCount === 1 ? '' : 's'} still available below.
        </p>
      ) : null}
    </section>
  );
}
