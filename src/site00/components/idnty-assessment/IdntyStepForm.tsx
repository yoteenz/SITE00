import { useCallback, useMemo, useState } from 'react';
import type { IdntyAssessmentStep, IdntyAssessmentOption } from '../../config/idnty-assessment';
import {
  IdntyOptionGrid,
  IdntyOptionRows,
  IdntyTextareaField,
} from './IdntyAssessmentPanels';
import { useSite00DesktopArtboardPreview } from '../shell/Site00DesktopArtboardContext';

export type StepFormValue = string | string[];

function normalizeMulti(value: StepFormValue): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
}

function normalizeText(value: StepFormValue): string {
  return typeof value === 'string' ? value : '';
}

export function validateStep(step: IdntyAssessmentStep, value: StepFormValue): string | null {
  if (!step.required) return null;
  if (step.type === 'textarea') {
    if (!normalizeText(value).trim()) return 'THIS FIELD IS REQUIRED.';
    return null;
  }
  if (step.type === 'single' || step.type === 'multi') {
    if (normalizeMulti(value).length === 0) return 'SELECT AT LEAST ONE OPTION.';
    return null;
  }
  return null;
}

export function formatAnswerLabel(options: IdntyAssessmentOption[] | undefined, value: StepFormValue): string {
  if (!options) return normalizeText(value) || '—';
  const ids = normalizeMulti(value);
  if (ids.length === 0) return '—';
  return ids
    .map((id) => options.find((o) => o.id === id)?.label ?? id)
    .join(', ');
}

type IdntyStepFormProps = {
  step: IdntyAssessmentStep;
  value: StepFormValue;
  onChange: (value: StepFormValue) => void;
  error?: string;
  gridColumns?: 2 | 3 | 4;
  showExplore?: boolean;
};

export function IdntyStepForm({ step, value, onChange, error, gridColumns, showExplore }: IdntyStepFormProps) {
  const isDesktop = useSite00DesktopArtboardPreview();

  if (step.type === 'textarea') {
    return (
      <IdntyTextareaField
        id={`idnty-step-${step.id}`}
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
    <div className="site00-idnty-step-form">
      <h2 className="site00-idnty-step-form__title">{step.title}</h2>
      {step.subtitle ? <p className="site00-idnty-step-form__subtitle">{step.subtitle}</p> : null}
      {error ? (
        <p className="site00-idnty-field__error" role="alert">
          {error}
        </p>
      ) : null}
      {isDesktop ? (
        <IdntyOptionGrid
          options={step.options ?? []}
          selected={selected}
          onToggle={toggle}
          mode={mode}
          columns={gridColumns ?? (step.options && step.options.length > 6 ? 3 : 2)}
          showExplore={showExplore}
        />
      ) : (
        <IdntyOptionRows options={step.options ?? []} selected={selected} onToggle={toggle} />
      )}
    </div>
  );
}

export function useStepForm(initial: StepFormValue = '') {
  const [value, setValue] = useState<StepFormValue>(initial);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    (step: IdntyAssessmentStep) => {
      const err = validateStep(step, value);
      setError(err);
      return !err;
    },
    [value],
  );

  return useMemo(
    () => ({
      value,
      setValue,
      error: error ?? undefined,
      validate,
      clearError: () => setError(null),
    }),
    [value, error, validate],
  );
}
