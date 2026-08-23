import type { AppetiteQuestionStep } from '../../../../shared/site00-brand-lore/founderCreativeAppetite/questions';
import type { StepFormValue } from '../idnty-assessment/IdntyStepForm';
import {
  loreInteractionMode,
  normalizeSelectedOptionIds,
  resolveResponseMode,
  selectionGuidanceCopy,
} from '../../../../shared/site00-brand-lore/loreAnswerTypes';
import { IdentityCalibrationOptionRows } from '../idnty/calibration/IdentityCalibrationOptionRows';
import { IdentityCalibrationTextField } from '../idnty/calibration/IdentityCalibrationTextField';

type IdentityCreativeAppetiteStepFormProps = {
  step: AppetiteQuestionStep;
  value: StepFormValue;
  onChange: (value: StepFormValue) => void;
  error?: string;
};

function normalizeMultiValue(step: AppetiteQuestionStep, value: StepFormValue): string[] {
  const raw = typeof value === 'string' || Array.isArray(value) ? value : '';
  return normalizeSelectedOptionIds(step as never, raw);
}

export function IdentityCreativeAppetiteStepForm({
  step,
  value,
  onChange,
  error,
}: IdentityCreativeAppetiteStepFormProps) {
  const responseMode = resolveResponseMode(step as never);
  const guidance = selectionGuidanceCopy(step as never);

  if (responseMode === 'FREE_TEXT' || step.type === 'textarea') {
    const textValue = typeof value === 'string' ? value : Array.isArray(value) ? value.join('\n') : '';
    return (
      <IdentityCalibrationTextField
        id={`creative-appetite-${step.id}`}
        label={step.title}
        subtitle={step.subtitle ?? step.helper}
        value={textValue}
        onChange={(v: string) => onChange(v)}
        maxLength={step.maxLength ?? 800}
        placeholder={step.placeholder}
        required={step.required}
        error={error}
      />
    );
  }

  const selected = normalizeMultiValue(step, value);
  const mode = loreInteractionMode(step as never);

  const toggle = (id: string) => {
    if (mode === 'single') {
      onChange(selected.includes(id) && selected.length === 1 ? '' : id);
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
      {guidance ? <p className="site00-idnty-calibration-question__guidance">{guidance}</p> : null}
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
