import type { CreativeIntakeStageField } from '../../../../../shared/site00-marketing/creativeIntake/types';
import {
  CAMPAIGN_OBJECTIVE_TERRITORIES,
  CONTENT_FORMAT_OPTIONS,
  LAUNCH_TYPE_OPTIONS,
  SUPPORTED_PLATFORMS,
  UGC_CAMERA_STYLES,
  UGC_TONE_OPTIONS,
} from '../../../../../shared/site00-marketing/creativeIntake/experienceRegistry';

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
              <p className="site00-creative-intake__field-note">STRATEGY SELECTION — NOT PROVIDER AUTHORIZATION.</p>
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
                <option value="">SELECT TERRITORY</option>
                {CAMPAIGN_OBJECTIVE_TERRITORIES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
          ) : field.type === 'tone-select' ? (
            <fieldset>
              <legend className="site00-creative-intake__a11y-label">{field.a11yLabel}</legend>
              <div className="site00-creative-intake__chip-grid" role="group" aria-label={field.a11yLabel}>
                {UGC_TONE_OPTIONS.map((t) => {
                  const selected = String(form.makingWhat ?? '') === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`site00-creative-intake__platform-chip${selected ? ' is-selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => onChange('makingWhat', t)}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : field.type === 'launch-type-select' ? (
            <fieldset>
              <legend className="site00-creative-intake__a11y-label">{field.a11yLabel}</legend>
              <div className="site00-creative-intake__launch-grid" role="group" aria-label={field.a11yLabel}>
                {LAUNCH_TYPE_OPTIONS.map((t) => {
                  const selected = String(form.campaignObjective ?? '').startsWith(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`site00-creative-intake__launch-card${selected ? ' is-selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => onChange('campaignObjective', t)}
                    >
                      <span className="site00-creative-intake__launch-icon" aria-hidden>◈</span>
                      <span>{t}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : field.type === 'format-select' ? (
            <fieldset>
              <legend className="site00-creative-intake__a11y-label">{field.a11yLabel}</legend>
              <div className="site00-creative-intake__chip-grid site00-creative-intake__chip-grid--formats" role="group" aria-label={field.a11yLabel}>
                {CONTENT_FORMAT_OPTIONS.map((f) => {
                  const current = String(form.deliverableTypes ?? '');
                  const selected = current.split(',').map((s) => s.trim()).includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      className={`site00-creative-intake__platform-chip${selected ? ' is-selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => {
                        const parts = current.split(',').map((s) => s.trim()).filter(Boolean);
                        const next = selected ? parts.filter((x) => x !== f) : [...parts, f];
                        onChange('deliverableTypes', next.join(', '));
                      }}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : field.type === 'textarea' ? (
            <label>
              <span className="site00-creative-intake__a11y-label">{field.a11yLabel}</span>
              <textarea
                value={String(form[field.id] ?? '')}
                onChange={(e) => onChange(field.id, e.target.value)}
                rows={4}
                maxLength={240}
              />
              <span className="site00-creative-intake__char-count">{String(form[field.id] ?? '').length} / 240</span>
            </label>
          ) : field.id === 'restrictions' && field.a11yLabel === 'ON-CAMERA STYLE' ? (
            <fieldset>
              <legend className="site00-creative-intake__a11y-label">{field.a11yLabel}</legend>
              <div className="site00-creative-intake__chip-grid" role="group" aria-label={field.a11yLabel}>
                {UGC_CAMERA_STYLES.map((s) => {
                  const selected = String(form.restrictions ?? '') === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      className={`site00-creative-intake__platform-chip${selected ? ' is-selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => onChange('restrictions', s)}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </fieldset>
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
