import type { IdntyAssessmentStep } from '../../../config/idnty-assessment';
import type { StepFormValue } from '../../idnty-assessment/IdntyStepForm';
import { IdentityCalibrationOptionRows } from './IdentityCalibrationOptionRows';
import { IdentityCalibrationTextField } from './IdentityCalibrationTextField';

type IdentityCalibrationStepFormProps = {
  step: IdntyAssessmentStep;
  value: StepFormValue;
  onChange: (value: StepFormValue) => void;
  error?: string;
};

function normalizeMulti(value: StepFormValue): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
}

function normalizeText(value: StepFormValue): string {
  return typeof value === 'string' ? value : '';
}

export function IdentityCalibrationStepForm({
  step,
  value,
  onChange,
  error,
}: IdentityCalibrationStepFormProps) {
  if (step.type === 'textarea') {
    return (
      <IdentityCalibrationTextField
        id={`idnty-calibration-${step.id}`}
        label={step.title}
        subtitle={step.subtitle}
        value={normalizeText(value)}
        onChange={(v) => onChange(v)}
        maxLength={step.maxLength ?? 500}
        placeholder={step.placeholder}
        required={step.required}
        error={error}
      />
    );
  }

  const selected = normalizeMulti(value);
  const mode = step.type === 'single' ? 'single' : 'multi';

  const toggle = (id: string) => {
    if (mode === 'single') {
      onChange(id);
      return;
    }
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    onChange(next);
  };

  return (
    <div className="site00-idnty-calibration-question">
      <h2 className="site00-idnty-calibration-question__title">{step.title}</h2>
      {step.subtitle ? <p className="site00-idnty-calibration-question__subtitle">{step.subtitle}</p> : null}
      {error ? (
        <p className="site00-idnty-calibration-question__error" role="alert">
          {error}
        </p>
      ) : null}
      <IdentityCalibrationOptionRows
        options={step.options ?? []}
        selected={selected}
        onToggle={toggle}
        mode={mode}
      />
    </div>
  );
}
