import type { ReactNode } from 'react';
import type { IdntyAssessmentOption } from '../../config/idnty-assessment';
import type { IdentityOptionIconId } from '../../config/idnty-public-redesign';
import { PublicLineIcon } from './PublicLineIcon';

/**
 * Technical selectors shared by every IDNTY working surface.
 * One interaction grammar: a red 1px outline + check on the selected option; role/aria-checked
 * semantics so single vs multi is announced correctly.
 */

type SelectionMode = 'single' | 'multi';

type SelectorBaseProps = {
  options: IdntyAssessmentOption[];
  selected: string[];
  mode: SelectionMode;
  onToggle: (id: string) => void;
  icons?: Record<string, IdentityOptionIconId>;
  groupLabel: string;
  /** Marks the group invalid (validation error shown by the parent). */
  invalid?: boolean;
};

function Check() {
  return (
    <span className="s00pr-check" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3.500 8.500 3 3 6-7" />
      </svg>
    </span>
  );
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <span className={`s00pr-radio ${checked ? 's00pr-radio--checked' : ''}`.trim()} aria-hidden="true">
      {checked ? <span className="s00pr-radio__dot" /> : null}
    </span>
  );
}

const roleFor = (mode: SelectionMode) => (mode === 'single' ? 'radio' : 'checkbox');

/** Icon tiles: GOAL, BUDGET, ASSETS, GAPS. */
export function TechnicalOptionTiles({
  options,
  selected,
  mode,
  onToggle,
  icons,
  groupLabel,
  invalid,
  columns = 3,
}: SelectorBaseProps & { columns?: 2 | 3 | 5 }) {
  return (
    <div
      className={`s00pr-tiles s00pr-tiles--${columns}`}
      role={mode === 'single' ? 'radiogroup' : 'group'}
      aria-label={groupLabel}
      aria-invalid={invalid || undefined}
    >
      {options.map((option) => {
        const checked = selected.includes(option.id);
        const icon = icons?.[option.id];
        return (
          <button
            key={option.id}
            type="button"
            role={roleFor(mode)}
            aria-checked={checked}
            className={`s00pr-tile ${checked ? 's00pr-tile--selected' : ''}`.trim()}
            onClick={() => onToggle(option.id)}
            data-option-id={option.id}
          >
            {checked ? <Check /> : null}
            {icon ? <PublicLineIcon id={icon} size={30} className="s00pr-tile__icon" /> : null}
            <span className="s00pr-tile__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Large descriptive cards: CONDITION, EVOLUTION AREAS. */
export function TechnicalOptionCards({
  options,
  selected,
  mode,
  onToggle,
  icons,
  groupLabel,
  invalid,
}: SelectorBaseProps) {
  return (
    <div
      className="s00pr-cards"
      role={mode === 'single' ? 'radiogroup' : 'group'}
      aria-label={groupLabel}
      aria-invalid={invalid || undefined}
    >
      {options.map((option) => {
        const checked = selected.includes(option.id);
        const icon = icons?.[option.id];
        return (
          <button
            key={option.id}
            type="button"
            role={roleFor(mode)}
            aria-checked={checked}
            className={`s00pr-card ${checked ? 's00pr-card--selected' : ''}`.trim()}
            onClick={() => onToggle(option.id)}
            data-option-id={option.id}
          >
            <span className="s00pr-card__mark">{checked ? <Check /> : <Radio checked={false} />}</span>
            {icon ? <PublicLineIcon id={icon} size={40} className="s00pr-card__icon" /> : null}
            <span className="s00pr-card__label">{option.label}</span>
            {option.description ? <span className="s00pr-card__desc">{option.description}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

/** Radio rows: TIMELINE (1 column, or 2 columns with icons on EVOLUTION). */
export function TechnicalRadioRows({
  options,
  selected,
  onToggle,
  icons,
  groupLabel,
  invalid,
  columns = 1,
}: Omit<SelectorBaseProps, 'mode'> & { columns?: 1 | 2 }) {
  return (
    <div
      className={`s00pr-rows s00pr-rows--${columns}`}
      role="radiogroup"
      aria-label={groupLabel}
      aria-invalid={invalid || undefined}
    >
      {options.map((option) => {
        const checked = selected.includes(option.id);
        const icon = icons?.[option.id];
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={checked}
            className={`s00pr-row ${checked ? 's00pr-row--selected' : ''}`.trim()}
            onClick={() => onToggle(option.id)}
            data-option-id={option.id}
          >
            {columns === 1 ? <Radio checked={checked} /> : null}
            {icon && columns === 2 ? <PublicLineIcon id={icon} size={22} className="s00pr-row__icon" /> : null}
            <span className="s00pr-row__label">{option.label}</span>
            {columns === 2 ? checked ? <Check /> : <Radio checked={false} /> : null}
          </button>
        );
      })}
    </div>
  );
}

type TechnicalTextareaProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  /** Small label inside the field (authority: YOUR RESPONSE). */
  fieldLabel?: string;
  invalid?: boolean;
  ariaLabel: string;
  rows?: number;
};

/** Counter reads `234 / 500`. Typed content keeps the user's own casing; chrome stays uppercase. */
export function TechnicalTextarea({
  id,
  value,
  onChange,
  maxLength,
  placeholder,
  fieldLabel,
  invalid,
  ariaLabel,
  rows = 5,
}: TechnicalTextareaProps) {
  return (
    <div className={`s00pr-field ${invalid ? 's00pr-field--invalid' : ''}`.trim()}>
      {fieldLabel ? (
        <label className="s00pr-field__label" htmlFor={id}>
          {fieldLabel}
        </label>
      ) : null}
      <textarea
        id={id}
        className="s00pr-field__input"
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-label={fieldLabel ? undefined : ariaLabel}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="s00pr-field__count" aria-live="off">
        {value.length} / {maxLength}
      </span>
    </div>
  );
}

/** Conditional OTHER field — appears inside the active panel; never its own screen. */
export function ConditionalOtherField({
  id,
  value,
  onChange,
  label,
  placeholder,
  maxLength = 300,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <div className="s00pr-other" data-conditional-other="true">
      <TechnicalTextarea
        id={id}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        fieldLabel={label}
        ariaLabel={label}
        rows={2}
      />
    </div>
  );
}

export function PanelQuestion({
  eyebrow,
  counter,
  title,
  subtitle,
  segments,
  activeSegment,
}: {
  eyebrow?: string | null;
  counter: string | null;
  title: string;
  subtitle?: string;
  /** Compact secondary progress segments (never a rail). */
  segments: number;
  activeSegment: number;
}) {
  return (
    <div className="s00pr-question">
      <div className="s00pr-question__meta">
        {eyebrow ? <span className="s00pr-question__eyebrow">{eyebrow}</span> : <span />}
        {counter ? (
          <span className="s00pr-question__counter" aria-label={counter}>
            <span>{counter}</span>
            <span className="s00pr-question__segments" aria-hidden="true">
              {Array.from({ length: segments }, (_, i) => (
                <span key={i} className={`s00pr-question__segment ${i <= activeSegment ? 's00pr-question__segment--on' : ''}`.trim()} />
              ))}
            </span>
          </span>
        ) : null}
      </div>
      <h3 className="s00pr-question__title">{title}</h3>
      {subtitle ? <p className="s00pr-question__subtitle">{subtitle}</p> : null}
    </div>
  );
}

export function PanelError({ children }: { children: ReactNode }) {
  return (
    <p className="s00pr-error" role="alert">
      {children}
    </p>
  );
}
