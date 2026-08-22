import type { BldrAssessmentStep } from '../../../config/bldr-assessment';
import { IdntyTextareaField } from '../../idnty-assessment/IdntyAssessmentPanels';

export type BldrFieldValues = Record<string, string | string[]>;

function normalizeMulti(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeText(value: string | string[] | undefined): string {
  if (!value) return '';
  return typeof value === 'string' ? value : value.join(', ');
}

export function validateBldrFields(fields: BldrAssessmentStep[], values: BldrFieldValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (!field.required) continue;
    const val = values[field.id];
    if (field.type === 'textarea') {
      if (!normalizeText(val).trim()) errors[field.id] = 'THIS FIELD IS REQUIRED.';
    } else if (field.type === 'single' || field.type === 'audience-row' || field.type === 'multi') {
      if (normalizeMulti(val).length === 0) errors[field.id] = 'SELECT AT LEAST ONE OPTION.';
    }
  }
  return errors;
}

type BldrSelectionRowProps = {
  label: string;
  description?: string;
  selected: boolean;
  onToggle: () => void;
  mode: 'single' | 'multi';
};

function BldrSelectionRow({ label, description, selected, onToggle, mode }: BldrSelectionRowProps) {
  return (
    <li>
      <button
        type="button"
        className={`site00-bldr-intake-row ${selected ? 'site00-bldr-intake-row--selected' : ''}`.trim()}
        onClick={onToggle}
        aria-pressed={selected}
        role={mode === 'single' ? 'radio' : 'checkbox'}
        aria-checked={selected}
      >
        <span className="site00-bldr-intake-row__label">{label}</span>
        {description ? <span className="site00-bldr-intake-row__desc">{description}</span> : null}
        <span className={`site00-bldr-intake-row__check ${selected ? 'site00-bldr-intake-row__check--on' : ''}`.trim()} aria-hidden="true">
          {selected ? '✓' : ''}
        </span>
      </button>
    </li>
  );
}

type BldrIntakeFieldsProps = {
  fields: BldrAssessmentStep[];
  values: BldrFieldValues;
  onChange: (fieldId: string, value: string | string[]) => void;
  errors?: Record<string, string>;
  sectionPrefix?: string;
};

export function BldrIntakeFields({ fields, values, onChange, errors = {}, sectionPrefix }: BldrIntakeFieldsProps) {
  return (
    <div className="site00-bldr-intake-fields">
      {fields.map((field) => {
        if (field.type === 'textarea') {
          return (
            <section key={field.id} className="site00-bldr-intake-fields__section">
              {sectionPrefix ? <p className="site00-bldr-intake-fields__kicker">{sectionPrefix}</p> : null}
              <IdntyTextareaField
                id={`bldr-field-${field.id}`}
                label={field.title}
                subtitle={field.subtitle}
                value={normalizeText(values[field.id])}
                onChange={(v) => onChange(field.id, v)}
                maxLength={field.maxLength ?? 500}
                placeholder={field.placeholder}
                required={field.required}
                error={errors[field.id]}
              />
            </section>
          );
        }

        const selected = normalizeMulti(values[field.id]);
        const mode = field.type === 'multi' ? 'multi' : 'single';

        const toggle = (id: string) => {
          if (mode === 'single') {
            onChange(field.id, id);
            return;
          }
          const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
          onChange(field.id, next);
        };

        return (
          <section key={field.id} className="site00-bldr-intake-fields__section">
            {sectionPrefix ? <p className="site00-bldr-intake-fields__kicker">{sectionPrefix}</p> : null}
            <h3 className="site00-bldr-intake-fields__title">{field.title}</h3>
            {field.subtitle ? <p className="site00-bldr-intake-fields__subtitle">{field.subtitle}</p> : null}
            {errors[field.id] ? (
              <p className="site00-idnty-field__error" role="alert">
                {errors[field.id]}
              </p>
            ) : null}
            <ul className="site00-bldr-intake-fields__list" role={mode === 'single' ? 'radiogroup' : 'group'}>
              {(field.options ?? []).map((option) => (
                <BldrSelectionRow
                  key={option.id}
                  label={option.label}
                  description={option.description}
                  selected={selected.includes(option.id)}
                  onToggle={() => toggle(option.id)}
                  mode={mode}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

type BldrDiscoveryProgressRailProps = {
  current: number;
  total?: number;
};

export function BldrDiscoveryProgressRail({ current, total = 5 }: BldrDiscoveryProgressRailProps) {
  const labels = ['IDEA', 'EXPERIENCE', 'SYSTEMS', 'SCALE', 'RESULT'];
  return (
    <nav className="site00-bldr-discovery-rail" aria-label={`Discovery step ${current} of ${total}`}>
      <ol className="site00-bldr-discovery-rail__track">
        {Array.from({ length: total }, (_, i) => {
          const num = i + 1;
          const active = num === current;
          const done = num < current;
          return (
            <li
              key={num}
              className={`site00-bldr-discovery-rail__step ${active ? 'site00-bldr-discovery-rail__step--active' : ''} ${done ? 'site00-bldr-discovery-rail__step--done' : ''}`.trim()}
            >
              <span className="site00-bldr-discovery-rail__num">{String(num).padStart(2, '0')}</span>
              <span className="site00-bldr-discovery-rail__label">{labels[i] ?? ''}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
