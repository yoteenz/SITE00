import type { ReactNode } from 'react';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';

type IdentityCalibrationConsoleProps = {
  stepIndex: number;
  totalSteps: number;
  progressRail: ReactNode;
  children: ReactNode;
  captureStatus: ReactNode;
  navigation: ReactNode;
};

export function IdentityCalibrationConsole({
  stepIndex,
  totalSteps,
  progressRail,
  children,
  captureStatus,
  navigation,
}: IdentityCalibrationConsoleProps) {
  const headerPosition = `${String(stepIndex + 1).padStart(2, '0')} / ${String(totalSteps).padStart(2, '0')}`;

  return (
    <section className="site00-idnty-calibration-console" aria-label="Identity calibration">
      <header className="site00-idnty-calibration-console__header">
        <p className="site00-idnty-calibration-console__kicker">IDENTITY CALIBRATION</p>
        <span className="site00-idnty-calibration-console__state">{headerPosition}</span>
        <Site00ThreeCornerMark className="site00-idnty-calibration-console__mark" />
      </header>
      {progressRail}
      <div className="site00-idnty-calibration-console__body">{children}</div>
      {captureStatus}
      {navigation}
    </section>
  );
}
