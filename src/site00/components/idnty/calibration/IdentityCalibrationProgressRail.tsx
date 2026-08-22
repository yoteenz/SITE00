import { getCalibrationStepLabel } from '../../../config/idnty-calibration';

type IdentityCalibrationProgressRailProps = {
  steps: { id: string }[];
  currentStepIndex: number;
  completedStepIds: string[];
};

export function IdentityCalibrationProgressRail({
  steps,
  currentStepIndex,
  completedStepIds,
}: IdentityCalibrationProgressRailProps) {
  const currentStep = steps[currentStepIndex];
  const categoryLabel = currentStep ? getCalibrationStepLabel(currentStep.id) : '';

  return (
    <div className="site00-idnty-calibration-rail">
      <ol className="site00-idnty-calibration-rail__track" aria-label="Calibration progress">
        {steps.map((step, index) => {
          const num = String(index + 1).padStart(2, '0');
          const isCurrent = index === currentStepIndex;
          const isComplete = completedStepIds.includes(step.id) || index < currentStepIndex;
          const stateClass = isCurrent
            ? 'site00-idnty-calibration-rail__node--current'
            : isComplete
              ? 'site00-idnty-calibration-rail__node--complete'
              : 'site00-idnty-calibration-rail__node--future';

          return (
            <li
              key={step.id}
              className={`site00-idnty-calibration-rail__step ${stateClass}`.trim()}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className={`site00-idnty-calibration-rail__node ${stateClass}`.trim()}>{num}</span>
              {index < steps.length - 1 ? (
                <span
                  className={`site00-idnty-calibration-rail__connector ${isComplete ? 'site00-idnty-calibration-rail__connector--resolved' : ''}`.trim()}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      {categoryLabel ? (
        <p className="site00-idnty-calibration-rail__category">{categoryLabel}</p>
      ) : null}
    </div>
  );
}
