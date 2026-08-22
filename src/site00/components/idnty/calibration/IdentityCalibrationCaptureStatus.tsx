import { IdentityTargetControl } from './IdentityTargetControl';

type IdentityCalibrationCaptureStatusProps = {
  primary: string;
  secondary: string;
  captured: boolean;
};

export function IdentityCalibrationCaptureStatus({
  primary,
  secondary,
  captured,
}: IdentityCalibrationCaptureStatusProps) {
  return (
    <div
      className={`site00-idnty-calibration-capture ${captured ? 'site00-idnty-calibration-capture--resolved' : ''}`.trim()}
      aria-live="polite"
    >
      <IdentityTargetControl selected={captured} className="site00-idnty-calibration-capture__icon" />
      <div className="site00-idnty-calibration-capture__copy">
        <p className="site00-idnty-calibration-capture__primary">{primary}</p>
        <p className="site00-idnty-calibration-capture__secondary">{secondary}</p>
      </div>
    </div>
  );
}
