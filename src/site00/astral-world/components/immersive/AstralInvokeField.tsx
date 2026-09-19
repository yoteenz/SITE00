import type { InputHTMLAttributes } from 'react';

type AstralInvokeFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label?: string;
  className?: string;
};

/** World-native search / invocation lens — not a browser-default text field */
export function AstralInvokeField({ label = 'Ask who you need', className = '', ...props }: AstralInvokeFieldProps) {
  return (
    <label className={`aw-invoke-field ${className}`.trim()}>
      <span className="aw-invoke-field__label aw-label">{label}</span>
      <span className="aw-invoke-field__frame">
        <span className="aw-invoke-field__glow" aria-hidden />
        <input type="search" className="aw-invoke-field__input" {...props} />
      </span>
    </label>
  );
}
