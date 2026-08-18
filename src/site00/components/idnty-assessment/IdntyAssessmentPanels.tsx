import { Link } from 'react-router-dom';
import type { IdntyProcessStrip, IdntyAssessmentOption } from '../../config/idnty-assessment';
import { GeometricIcon } from '../icons/GeometricIcon';

const PROCESS_ICONS: Record<string, 'crosshair' | 'strategy' | 'visual' | 'experience' | 'discovery' | 'direction'> = {
  strategy: 'strategy',
  scale: 'direction',
  transparent: 'experience',
  impact: 'discovery',
  discover: 'discovery',
  strategize: 'strategy',
  design: 'visual',
  deliver: 'experience',
  discovery: 'discovery',
  launch: 'direction',
  build: 'direction',
};

type IdntyProcessStripPanelProps = {
  strip: IdntyProcessStrip;
  variant?: 'default' | 'timeline' | 'journey';
  activeStepId?: string;
};

export function IdntyProcessStripPanel({ strip, variant = 'default', activeStepId }: IdntyProcessStripPanelProps) {
  return (
    <section className={`site00-idnty-process-strip site00-idnty-process-strip--${variant}`} aria-label={strip.leadTitle ?? 'Process'}>
      {strip.leadTitle ? (
        <div className="site00-idnty-process-strip__lead">
          <GeometricIcon variant="crosshair" size="sm" />
          <div>
            <p className="site00-idnty-process-strip__lead-title">{strip.leadTitle}</p>
            {strip.leadBody ? <p className="site00-idnty-process-strip__lead-body">{strip.leadBody}</p> : null}
            {strip.leadHref && strip.leadLinkLabel ? (
              <Link to={strip.leadHref} className="site00-idnty-process-strip__lead-link">
                {strip.leadLinkLabel}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="site00-idnty-process-strip__steps" role="list">
        {strip.steps.map((step, index) => {
          const icon = PROCESS_ICONS[step.id] ?? 'crosshair';
          const isActive = activeStepId === step.id;
          return (
            <div
              key={step.id}
              className={`site00-idnty-process-strip__step ${isActive ? 'site00-idnty-process-strip__step--active' : ''}`.trim()}
              role="listitem"
            >
              {variant === 'timeline' || variant === 'journey' ? (
                <span className="site00-idnty-process-strip__step-num">{String(index + 1).padStart(2, '0')}</span>
              ) : (
                <GeometricIcon variant={icon} size="sm" />
              )}
              <div>
                <p className="site00-idnty-process-strip__step-label">{step.label}</p>
                <p className="site00-idnty-process-strip__step-desc">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type IdntyQuestionListProps = {
  options: IdntyAssessmentOption[];
  activeId?: string;
  completedIds?: string[];
  onSelect: (id: string) => void;
};

export function IdntyQuestionList({ options, activeId, completedIds = [], onSelect }: IdntyQuestionListProps) {
  return (
    <ul className="site00-idnty-question-list" role="list">
      {options.map((option, index) => {
        const num = String(index + 1).padStart(2, '0');
        const isActive = activeId === option.id;
        const isComplete = completedIds.includes(option.id);
        return (
          <li key={option.id}>
            <button
              type="button"
              className={`site00-idnty-question-list__item ${isActive ? 'site00-idnty-question-list__item--active' : ''} ${isComplete ? 'site00-idnty-question-list__item--complete' : ''}`.trim()}
              onClick={() => onSelect(option.id)}
            >
              <span className="site00-idnty-question-list__num">{num}</span>
              <span className="site00-idnty-question-list__content">
                <span className="site00-idnty-question-list__label">{option.label}</span>
                {option.description ? (
                  <span className="site00-idnty-question-list__desc">{option.description}</span>
                ) : null}
              </span>
              <span className="site00-idnty-question-list__arrow" aria-hidden="true">
                →
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type IdntyOptionGridProps = {
  options: IdntyAssessmentOption[];
  selected: string[];
  onToggle: (id: string) => void;
  mode: 'multi' | 'single';
  columns?: 2 | 3 | 4;
  showExplore?: boolean;
};

export function IdntyOptionGrid({
  options,
  selected,
  onToggle,
  mode,
  columns = 2,
  showExplore = false,
}: IdntyOptionGridProps) {
  const colClass =
    columns === 4 ? 'site00-idnty-option-grid--cols-4' : columns === 3 ? 'site00-idnty-option-grid--cols-3' : 'site00-idnty-option-grid--cols-2';
  return (
    <div className={`site00-idnty-option-grid ${colClass}`} role={mode === 'single' ? 'radiogroup' : 'group'}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            role={mode === 'single' ? 'radio' : 'checkbox'}
            aria-checked={isSelected}
            className={`site00-idnty-option-grid__card ${isSelected ? 'site00-idnty-option-grid__card--selected' : ''}`.trim()}
            onClick={() => onToggle(option.id)}
          >
            <GeometricIcon variant="crosshair" size="sm" />
            <span className="site00-idnty-option-grid__label">{option.label}</span>
            {option.description ? (
              <span className="site00-idnty-option-grid__desc">{option.description}</span>
            ) : null}
            {showExplore ? <span className="site00-idnty-option-grid__explore">EXPLORE →</span> : null}
          </button>
        );
      })}
    </div>
  );
}

type IdntyOptionRowsProps = {
  options: IdntyAssessmentOption[];
  selected: string[];
  onToggle: (id: string) => void;
};

export function IdntyOptionRows({ options, selected, onToggle }: IdntyOptionRowsProps) {
  return (
    <ul className="site00-idnty-option-rows" role="list">
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <li key={option.id}>
            <button
              type="button"
              className={`site00-idnty-option-rows__row ${isSelected ? 'site00-idnty-option-rows__row--selected' : ''}`.trim()}
              onClick={() => onToggle(option.id)}
              aria-pressed={isSelected}
            >
              <GeometricIcon variant="crosshair" size="sm" />
              <span className="site00-idnty-option-rows__label">{option.label}</span>
              <span className="site00-idnty-option-rows__check" aria-hidden="true">
                {isSelected ? '✓' : ''}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type IdntyTextareaFieldProps = {
  id: string;
  label: string;
  subtitle?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  required?: boolean;
  error?: string;
};

export function IdntyTextareaField({
  id,
  label,
  subtitle,
  value,
  onChange,
  maxLength = 500,
  placeholder,
  required,
  error,
}: IdntyTextareaFieldProps) {
  return (
    <div className="site00-idnty-field">
      <label htmlFor={id} className="site00-idnty-field__label">
        {label}
        {required ? <span className="site00-idnty-field__required"> *</span> : null}
      </label>
      {subtitle ? <p className="site00-idnty-field__subtitle">{subtitle}</p> : null}
      <div className="site00-idnty-field__textarea-wrap">
        <textarea
          id={id}
          className={`site00-idnty-field__textarea ${error ? 'site00-idnty-field__textarea--error' : ''}`.trim()}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          rows={5}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span className="site00-idnty-field__counter" aria-live="polite">
          {value.length} / {maxLength}
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} className="site00-idnty-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
