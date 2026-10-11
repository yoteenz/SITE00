/**
 * ENTRY v2 live parts: type, buttons, underline fields, the agreement box and status notes, drawn in the authority's
 * frame (EntryV2Stage) at the boxes measured in layout/entryV2Layout.ts. Behaviour, triggers and state attributes are
 * the F01 runtime's own; only the drawing follows the approved authority.
 */

import { useId, useState, type ReactNode } from 'react';
import { F01_COPY } from '../../data/f01/copy';
import type { RefBox, RefType } from '../layout/referenceLayout';
import { JurnlIcon } from './icons';
import { RefText, at } from './ReferenceStage';

export { RefText as E2Text, at };

/** Shift a box or a line of type down (blocks that move when an inline state opens above them). */
export const down = (b: RefBox, dy: number): RefBox => [b[0], b[1] + dy, b[2], b[3] + dy];
export const downT = (t: RefType, dy: number): RefType => ({ ...t, top: t.top + dy });
/** A box scaled about its centre. */
export const grow = (b: RefBox, f: number): RefBox => {
  const cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, w = ((b[2] - b[0]) * f) / 2, h = ((b[3] - b[1]) * f) / 2;
  return [cx - w, cy - h, cx + w, cy + h];
};

export function E2Button({
  box,
  origin,
  t,
  tone,
  trigger,
  onClick,
  loading = false,
  loadingLabel,
  type = 'button',
  ariaLabel,
  icon,
  children,
}: {
  box: RefBox;
  origin?: RefBox;
  t: RefType;
  tone: 'olive' | 'cream' | 'outline' | 'social';
  trigger: string;
  onClick?: () => void;
  loading?: boolean;
  loadingLabel?: string;
  type?: 'button' | 'submit';
  ariaLabel?: string;
  icon?: { node: ReactNode; box: RefBox };
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      className={`jrn-e2__btn jrn-e2__btn--${tone}`}
      data-jrn-trigger={trigger}
      data-loading={loading ? 'true' : undefined}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      disabled={loading}
      onClick={onClick}
      style={at(box, origin)}
    >
      {icon ? (
        <span className="jrn-e2__btn-icon" aria-hidden style={at(icon.box, box)}>
          {icon.node}
        </span>
      ) : null}
      <RefText t={t} origin={box} as="span">
        {loading ? (loadingLabel ?? children) : children}
      </RefText>
    </button>
  );
}

/** A text action (FORGOT PASSWORD?, USE A DIFFERENT EMAIL): the fitted line is the button; the hit area is padded. */
export function E2Link({ t, origin, trigger, onClick, underline, ariaLabel, children }: { t: RefType; origin?: RefBox; trigger: string; onClick: () => void; underline?: RefBox; ariaLabel?: string; children: ReactNode }) {
  return (
    <>
      <RefText t={t} origin={origin} as="button" type="button" className="jrn-e2__link" data-jrn-trigger={trigger} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </RefText>
      {underline ? <span className="jrn-e2__rule" aria-hidden style={at(underline, origin)} /> : null}
    </>
  );
}

/**
 * Underline field printed on the sheet: the label is the authority's line of type, the input sits on the rule, the
 * rule takes the focus colour. Error text sits under the rule.
 */
export function E2Field({
  label,
  labelT,
  input,
  rule,
  origin,
  type = 'text',
  value,
  onValue,
  trigger,
  autoComplete,
  revealable = false,
  error,
  invalid = false,
  forceFocused = false,
  onFocusChange,
  inputSize,
}: {
  label: string;
  labelT: RefType;
  /** The input's box (from the label's foot to the rule). */
  input: RefBox;
  rule: RefBox;
  origin?: RefBox;
  type?: 'text' | 'email' | 'password';
  value: string;
  onValue: (v: string) => void;
  trigger: string;
  autoComplete?: string;
  revealable?: boolean;
  error?: string | null;
  invalid?: boolean;
  forceFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
  /** Typed text size (frame px; ≥ 16 so iOS does not zoom). */
  inputSize: number;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isFocused = focused || forceFocused;
  const bad = !!error || invalid;
  const reveal = type === 'password' && revealable;
  return (
    <div className="jrn-e2__field" data-focused={isFocused ? 'true' : 'false'} data-raised={isFocused || value.length > 0 ? 'true' : 'false'} data-invalid={bad ? 'true' : 'false'} data-revealed={type === 'password' ? (revealed ? 'true' : 'false') : undefined}>
      <RefText t={labelT} origin={origin} as="label" htmlFor={id} className="jrn-e2__label">
        {label}
      </RefText>
      <input
        id={id}
        className="jrn-e2__input"
        type={type === 'password' && revealed ? 'text' : type}
        value={value}
        data-jrn-trigger={trigger}
        aria-invalid={bad || undefined}
        aria-describedby={error ? errorId : undefined}
        autoComplete={autoComplete}
        spellCheck={false}
        onChange={(e) => onValue(e.target.value)}
        onFocus={() => {
          setFocused(true);
          onFocusChange?.(true);
        }}
        onBlur={() => {
          setFocused(false);
          onFocusChange?.(false);
        }}
        style={{ ...at(reveal ? [input[0], input[1], input[2] - 56, input[3]] : input, origin), fontSize: inputSize }}
      />
      {reveal ? (
        <button
          type="button"
          className="jrn-field__reveal"
          aria-label={revealed ? F01_COPY.signIn.hide : F01_COPY.signIn.show}
          aria-pressed={revealed}
          onClick={() => setRevealed((v) => !v)}
          data-jrn-trigger={`${trigger}-toggle`}
          style={at([input[2] - 52, input[3] - 46, input[2], input[3] - 2], origin)}
        >
          <JurnlIcon name={revealed ? 'eye-off' : 'eye'} size={26} />
        </button>
      ) : null}
      <span className="jrn-e2__rule" aria-hidden style={at(rule, origin)} />
      {error ? (
        <p className="jrn-e2__err" id={errorId} role="alert" style={at([rule[0], rule[3] + 6, rule[2], rule[3] + 30], origin)}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** The agreement / keep-signed-in box. With `square`, the button spans the whole row and the square sits in it. */
export function E2Check({
  box,
  square,
  origin,
  checked,
  onChange,
  trigger,
  ariaLabel,
  children,
}: {
  box: RefBox;
  square?: RefBox;
  origin?: RefBox;
  checked: boolean;
  onChange: (v: boolean) => void;
  trigger: string;
  ariaLabel: string;
  children?: ReactNode;
}) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} aria-label={ariaLabel} className="jrn-e2__check" data-jrn-trigger={trigger} onClick={() => onChange(!checked)} style={at(box, origin)}>
      <span className="jrn-e2__checkbox" aria-hidden style={at(square ?? box, box)}>
        {checked ? (
          <svg viewBox="0 0 20 20">
            <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      {children}
    </button>
  );
}

/**
 * A live value on a fitted line: the authority's size while it fits before `right`, smaller when it would not.
 * `refChars` is the length of the authority's own text on that line.
 */
export function fitLine(t: RefType, text: string, right: number, refChars: number): RefType {
  const perChar = (t.ink[2] - t.ink[0]) / refChars;
  const room = right - (t.left ?? t.ink[0]);
  const need = Math.max(1, text.length) * perChar;
  if (need <= room) return t;
  const size = Math.max(14, (t.size * room) / need);
  return { ...t, size, ls: (t.ls * size) / t.size, top: t.top + (t.size - size) * 0.7 };
}

/** A status note set in the page's own type (errors, success). Subordinate to the authority, never a card. */
export function E2Note({
  box,
  origin,
  tone = 'error',
  title,
  body,
  srItems,
  action,
  trigger,
}: {
  box: RefBox;
  origin?: RefBox;
  tone?: 'error' | 'success';
  title: string;
  body?: string;
  /** Read to assistive tech only (the fields carry the visible detail). */
  srItems?: string[];
  action?: { label: string; onClick: () => void; trigger: string };
  trigger: string;
}) {
  return (
    <div className={`jrn-e2__note jrn-e2__note--${tone}`} role={tone === 'error' ? 'alert' : 'status'} data-jrn-panel={tone === 'error' ? 'alert' : 'success'} data-jrn-trigger={trigger} style={at(box, origin)}>
      {/* One compact paragraph (title, body, action) so a note never spills onto the field below it. */}
      <p>
        <b>{body && !/[.!?]$/.test(title) ? `${title}.` : title}</b>
        {body ? ` ${body}` : null}
        {action ? (
          <>
            {' '}
            <button type="button" className="jrn-e2__note-action" data-jrn-trigger={action.trigger} onClick={action.onClick}>
              {action.label}
            </button>
          </>
        ) : null}
      </p>
      {srItems?.length ? (
        <ul className="jrn-e2__sr">
          {srItems.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** JURNL brand mark set as the authority sets it (live type, not the vertical logo lockup). */
export function E2Brand({ t, origin, className, label = 'JURNL', children }: { t: RefType; origin?: RefBox; className?: string; label?: string; children?: ReactNode }) {
  return (
    <div className={`jrn-e2__brand${className ? ` ${className}` : ''}`} role="img" aria-label={label} data-jrn-logo="entry-v2">
      <RefText t={t} origin={origin} as="span" aria-hidden>
        JURNL
      </RefText>
      {children}
    </div>
  );
}
