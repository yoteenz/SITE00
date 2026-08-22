type IdentityCalibrationTextFieldProps = {
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

export function IdentityCalibrationTextField({
  id,
  label,
  subtitle,
  value,
  onChange,
  maxLength = 500,
  placeholder,
  required,
  error,
}: IdentityCalibrationTextFieldProps) {
  return (
    <div className="site00-idnty-calibration-field">
      <label htmlFor={id} className="site00-idnty-calibration-field__label">
        {label}
        {required ? <span className="site00-idnty-calibration-field__required"> *</span> : null}
      </label>
      {subtitle ? <p className="site00-idnty-calibration-field__subtitle">{subtitle}</p> : null}
      <div className="site00-idnty-calibration-field__input-wrap">
        <textarea
          id={id}
          className={`site00-idnty-calibration-field__input ${error ? 'site00-idnty-calibration-field__input--error' : ''}`.trim()}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder ?? 'ENTER SIGNAL…'}
          rows={4}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span className="site00-idnty-calibration-field__counter" aria-live="polite">
          {value.length} / {maxLength}
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} className="site00-idnty-calibration-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
