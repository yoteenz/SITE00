import type { CreativeIntakeStageField } from '../../../../../shared/site00-marketing/creativeIntake/types';
import { CAMPAIGN_OBJECTIVE_TERRITORIES, SUPPORTED_PLATFORMS } from '../../../../../shared/site00-marketing/creativeIntake/experienceRegistry';

type Props = {
  fields: CreativeIntakeStageField[];
  form: Record<string, string | string[]>;
  onChange: (id: string, value: string | string[]) => void;
};

export function CreativeIntakeFields({ fields, form, onChange }: Props) {
  return (
    <div className="site00-creative-intake__fields">
      {fields.map((field) => (
        <div key={field.id} className="site00-creative-intake__field">
          {field.type === 'platform-select' ? (
            <fieldset>
              <legend className="site00-creative-intake__a11y-label">{field.a11yLabel}</legend>
              <div className="site00-creative-intake__platform-grid" role="group" aria-label={field.a11yLabel}>
                {SUPPORTED_PLATFORMS.map((p) => {
                  const selected = Array.isArray(form.platforms) ? form.platforms.includes(p) : String(form.platforms ?? '').includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`site00-creative-intake__platform-chip${selected ? ' is-selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => {
                        const current = Array.isArray(form.platforms) ? [...form.platforms] : [];
                        const next = selected ? current.filter((x) => x !== p) : [...current, p];
                        onChange('platforms', next);
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <p className="site00-creative-intake__hint">Strategy selection — not provider authorization.</p>
            </fieldset>
          ) : field.type === 'objective-select' ? (
            <label>
              <span className="site00-creative-intake__a11y-label">{field.a11yLabel}</span>
              <select
                value={String(form.campaignObjective ?? '').split(' — ')[0] || ''}
                onChange={(e) => {
                  const territory = e.target.value;
                  const rest = String(form.campaignObjective ?? '').includes(' — ')
                    ? String(form.campaignObjective).split(' — ').slice(1).join(' — ')
                    : '';
                  onChange('campaignObjective', rest ? `${territory} — ${rest}` : territory);
                }}
              >
                <option value="">Select territory</option>
                {CAMPAIGN_OBJECTIVE_TERRITORIES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
          ) : field.type === 'textarea' ? (
            <label>
              <span className="site00-creative-intake__a11y-label">{field.a11yLabel}</span>
              <textarea
                value={String(form[field.id] ?? '')}
                onChange={(e) => onChange(field.id, e.target.value)}
                rows={4}
              />
            </label>
          ) : (
            <label>
              <span className="site00-creative-intake__a11y-label">{field.a11yLabel}</span>
              <input
                type="text"
                value={String(form[field.id] ?? '')}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
