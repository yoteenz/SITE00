import type { LoreQuestionStep } from '../../../../../shared/site00-brand-lore/idnty-lore-questions';
import type { StepFormValue } from '../../idnty-assessment/IdntyStepForm';
import { IdentityCalibrationOptionRows } from '../calibration/IdentityCalibrationOptionRows';
import { IdentityCalibrationTextField } from '../calibration/IdentityCalibrationTextField';

type IdentityLoreStepFormProps = {
  step: LoreQuestionStep;
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

export function IdentityLoreStepForm({ step, value, onChange, error }: IdentityLoreStepFormProps) {
  if (step.type === 'textarea' || step.type === 'language-samples') {
    return (
      <IdentityCalibrationTextField
        id={`idnty-lore-${step.id}`}
        label={step.title}
        subtitle={step.subtitle ?? step.helper}
        value={normalizeText(value)}
        onChange={(v: string) => onChange(v)}
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
      {step.helper ? <p className="site00-idnty-calibration-question__helper">{step.helper}</p> : null}
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
