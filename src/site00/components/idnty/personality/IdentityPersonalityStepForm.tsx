import type { PersonalityQuestionStep } from '../../../../../shared/site00-brand-lore/idnty-personality-questions';
import type { StepFormValue } from '../../idnty-assessment/IdntyStepForm';
import {
  loreInteractionMode,
  normalizeSelectedOptionIds,
  resolveResponseMode,
  selectionGuidanceCopy,
} from '../../../../../shared/site00-brand-lore/loreAnswerTypes';
import { IdentityCalibrationOptionRows } from '../calibration/IdentityCalibrationOptionRows';
import { IdentityCalibrationTextField } from '../calibration/IdentityCalibrationTextField';

type IdentityPersonalityStepFormProps = {
  step: PersonalityQuestionStep;
  value: StepFormValue;
  onChange: (value: StepFormValue) => void;
  error?: string;
};

function normalizeMultiValue(step: PersonalityQuestionStep, value: StepFormValue): string[] {
  const raw = typeof value === 'string' || Array.isArray(value) ? value : '';
  return normalizeSelectedOptionIds(step, raw);
}

export function IdentityPersonalityStepForm({ step, value, onChange, error }: IdentityPersonalityStepFormProps) {
  const responseMode = resolveResponseMode(step);
  const guidance = selectionGuidanceCopy(step);

  if (responseMode === 'FREE_TEXT') {
    const textValue = typeof value === 'string' ? value : Array.isArray(value) ? value.join('\n') : '';
    return (
      <IdentityCalibrationTextField
        id={`idnty-personality-${step.id}`}
        label={step.title}
        subtitle={step.subtitle ?? step.helper}
        value={textValue}
        onChange={(v: string) => onChange(v)}
        maxLength={step.maxLength ?? 500}
        placeholder={step.placeholder}
        required={step.required}
        error={error}
      />
    );
  }

  const selected = normalizeMultiValue(step, value);
  const mode = loreInteractionMode(step);

  const toggle = (id: string) => {
    if (mode === 'single') {
      onChange(selected.includes(id) && selected.length === 1 ? '' : id);
      return;
    }
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    if (step.maxSelections && next.length > step.maxSelections) return;
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
