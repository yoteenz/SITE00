import type { BldrAssessmentStep } from '../../config/bldr-assessment';
import { IdntyOptionGrid, IdntyOptionRows, IdntyTextareaField } from '../idnty-assessment/IdntyAssessmentPanels';
import { useSite00DesktopArtboardPreview } from '../shell/Site00DesktopArtboardContext';
import {
  BLDR_SITE_TYPE_OTHER_SPECIFY_KEY,
  normalizeSiteTypes,
} from '../../../../shared/site00-bldr-classification/siteTypeModel';
import { validateBldrLandingFields, type BldrFieldValues } from '../../../../shared/site00-bldr-classification/bldrFieldValidation';

export type { BldrFieldValues };

function normalizeMulti(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeText(value: string | string[] | undefined): string {
  if (!value) return '';
  return typeof value === 'string' ? value : value.join(', ');
}

export function validateBldrFields(fields: BldrAssessmentStep[], values: BldrFieldValues): Record<string, string> {
  return validateBldrLandingFields(fields, values);
}

type BldrScopeFieldsProps = {
  fields: BldrAssessmentStep[];
  values: BldrFieldValues;
  onChange: (fieldId: string, value: string | string[]) => void;
  errors?: Record<string, string>;
};

export function BldrScopeFields({ fields, values, onChange, errors = {} }: BldrScopeFieldsProps) {
  const isDesktop = useSite00DesktopArtboardPreview();
  const siteTypesSelected = normalizeSiteTypes(values.type);

  return (
    <div className="site00-bldr-scope-fields">
      {fields.map((field) => {
        if (field.type === 'textarea') {
          return (
            <IdntyTextareaField
              key={field.id}
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
          <div key={field.id} className="site00-bldr-scope-fields__block">
            <h3 className="site00-idnty-step-form__title">{field.title}</h3>
            {field.subtitle ? <p className="site00-idnty-step-form__subtitle">{field.subtitle}</p> : null}
            {errors[field.id] ? (
              <p className="site00-idnty-field__error" role="alert">
                {errors[field.id]}
              </p>
            ) : null}
            {isDesktop ? (
              <IdntyOptionGrid
                options={field.options ?? []}
                selected={selected}
                onToggle={toggle}
                mode={mode}
                columns={field.gridColumns ?? (field.type === 'audience-row' ? 4 : 3)}
              />
            ) : (
              <IdntyOptionRows options={field.options ?? []} selected={selected} onToggle={toggle} mode={mode} />
            )}
            {field.id === 'type' && siteTypesSelected.includes('other') ? (
              <IdntyTextareaField
                id={`bldr-field-${BLDR_SITE_TYPE_OTHER_SPECIFY_KEY}`}
                label="OTHER (PLEASE SPECIFY)"
                value={normalizeText(values[BLDR_SITE_TYPE_OTHER_SPECIFY_KEY])}
                onChange={(v) => onChange(BLDR_SITE_TYPE_OTHER_SPECIFY_KEY, v)}
                maxLength={300}
                placeholder="DESCRIBE YOUR SITE TYPE…"
                required
                error={errors[BLDR_SITE_TYPE_OTHER_SPECIFY_KEY]}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

type BldrDiscoveryProgressProps = {
  current: number;
  total?: number;
};

export function BldrDiscoveryProgress({ current, total = 5 }: BldrDiscoveryProgressProps) {
  return (
    <div className="site00-bldr-discovery-progress" aria-label={`Question ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const num = i + 1;
        const active = num === current;
        const done = num < current;
        return (
          <div
            key={num}
            className={`site00-bldr-discovery-progress__dot ${active ? 'site00-bldr-discovery-progress__dot--active' : ''} ${done ? 'site00-bldr-discovery-progress__dot--done' : ''}`.trim()}
          >
            <span>{String(num).padStart(2, '0')}</span>
          </div>
        );
      })}
    </div>
  );
}
