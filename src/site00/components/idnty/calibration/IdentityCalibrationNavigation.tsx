type IdentityCalibrationNavigationProps = {
  stepIndex: number;
  totalSteps: number;
  onPrevious: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  nextStepLabel?: string;
  continueLabel?: string;
  showPrevious?: boolean;
};

export function IdentityCalibrationNavigation({
  stepIndex,
  totalSteps,
  onPrevious,
  onContinue,
  continueDisabled = false,
  nextStepLabel,
  continueLabel = 'CONTINUE',
  showPrevious = true,
}: IdentityCalibrationNavigationProps) {
  const position = `${String(stepIndex + 1).padStart(2, '0')} / ${String(totalSteps).padStart(2, '0')}`;

  return (
    <footer className="site00-idnty-calibration-nav">
      <div className="site00-idnty-calibration-nav__prev-row">
        {showPrevious && stepIndex > 0 ? (
          <button type="button" className="site00-idnty-calibration-nav__prev" onClick={onPrevious}>
            ← PREVIOUS
          </button>
        ) : showPrevious ? (
          <button type="button" className="site00-idnty-calibration-nav__prev" onClick={onPrevious}>
            ← BACK
          </button>
        ) : (
          <span />
        )}
        <span className="site00-idnty-calibration-nav__position">{position}</span>
      </div>
      <div className="site00-idnty-calibration-nav__continue-row">
        <button
          type="button"
          className="site00-idnty-calibration-nav__continue"
          onClick={onContinue}
          disabled={continueDisabled}
        >
          <span className="site00-idnty-calibration-nav__continue-label">{continueLabel} →</span>
          {nextStepLabel ? (
            <span className="site00-idnty-calibration-nav__continue-next">{nextStepLabel}</span>
          ) : null}
        </button>
      </div>
    </footer>
  );
}
