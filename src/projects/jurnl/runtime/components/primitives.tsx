/**
 * JURNL F01 interaction primitives — the runtime side of MANIFEST/F01_COMPONENT_MANIFEST.json interactionPrimitives.
 * One structural grammar, JURNL expression only (no SITE 00 styling reaches these). Square-rounded geometry only.
 */

import { createContext, useContext, useEffect, useId, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { F01_COPY } from '../../data/f01/copy';
import { JurnlIcon, type JurnlIconName } from './icons';

const C = F01_COPY.common;

/**
 * Overlay layer pinned to the runtime viewport (the `.jrn` root). Drawers, sheets, modals and handoffs portal here so
 * they always sit on the visible screen and size to it — never to a screen's scrolled content (landscape, long forms,
 * shorter desktop windows). Server rendering keeps them inline.
 */
export const JurnlOverlayHostContext = createContext<HTMLElement | null>(null);
function OverlayLayer({ children }: { children: ReactNode }) {
  const host = useContext(JurnlOverlayHostContext);
  if (typeof document === 'undefined') return <>{children}</>;
  return host ? createPortal(children, host) : null;
}

/* ── JURNL_BUTTON_PRIMARY / SECONDARY / LOADING_BUTTON ── */
export function JurnlButton({
  variant = 'primary',
  loading = false,
  loadingLabel,
  icon,
  trigger,
  children,
  ...rest
}: {
  variant?: 'primary' | 'secondary' | 'destructive' | 'quiet' | 'social';
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
  trigger?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`jrn-btn jrn-btn--${variant}`}
      data-jrn-trigger={trigger}
      data-loading={loading ? 'true' : undefined}
      aria-busy={loading || undefined}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ?
        <>
          <span className="jrn-btn__pulse" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span>{loadingLabel ?? children}</span>
        </>
      : <>
          {icon ?
            <>
              {icon}
              {variant === 'social' ? <i className="jrn-btn__divider" aria-hidden /> : null}
            </>
          : null}
          <span>{children}</span>
        </>
      }
    </button>
  );
}

export function JurnlTextLink({ trigger, children, strong, underline, onClick, inline }: { trigger?: string; children: ReactNode; strong?: boolean; underline?: boolean; inline?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      className={`jrn-link${strong ? ' jrn-link--strong' : ''}${underline ? ' jrn-link--underline' : ''}${inline ? ' jrn-link--inline' : ''}`}
      data-jrn-trigger={trigger}
      onClick={onClick}
    >
      <span>{children}</span>
    </button>
  );
}

export function JurnlIconButton({ icon, label, onClick, trigger }: { icon: JurnlIconName; label: string; onClick: () => void; trigger?: string }) {
  return (
    <button type="button" className="jrn-iconbtn" aria-label={label} onClick={onClick} data-jrn-trigger={trigger}>
      <JurnlIcon name={icon} size={18} />
    </button>
  );
}

/* ── JURNL_INPUT / JURNL_INPUT_FOCUSED (+ SHOW / HIDE PASSWORD) ── */
export function JurnlInput({
  label,
  value,
  onValue,
  icon,
  type = 'text',
  revealable = false,
  error,
  invalid = false,
  trigger,
  forceFocused = false,
  onFocusChange,
  autoFocus,
  prefix,
  ...rest
}: {
  invalid?: boolean;
  label: string;
  value: string;
  onValue: (v: string) => void;
  icon?: JurnlIconName;
  type?: 'text' | 'email' | 'password';
  revealable?: boolean;
  error?: string | null;
  trigger?: string;
  forceFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
  /** Display-only mark. The stored value stays numeric when this is a currency symbol. */
  prefix?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>) {
  const id = useId();
  const errorId = `${id}-error`;
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isFocused = focused || forceFocused;
  const raised = isFocused || value.length > 0;
  const inputType = type === 'password' && revealed ? 'text' : type;
  return (
    <div
      className={`jrn-field${icon ? '' : ' jrn-field--plain'}${prefix ? ' jrn-field--prefix' : ''}`}
      data-focused={isFocused ? 'true' : 'false'}
      data-raised={raised ? 'true' : 'false'}
      data-invalid={error || invalid ? 'true' : 'false'}
      data-revealed={type === 'password' ? (revealed ? 'true' : 'false') : undefined}
    >
      <div className="jrn-field__box">
        {icon ?
          <span className="jrn-field__icon" aria-hidden>
            <JurnlIcon name={icon} size={19} />
          </span>
        : null}
        <span className="jrn-field__inner">
          <label className="jrn-field__label" htmlFor={id}>
            {label}
          </label>
          {prefix ? (
            <span className="jrn-field__prefix" aria-hidden>
              {prefix}
            </span>
          ) : null}
          <input
            id={id}
            className="jrn-field__input"
            type={inputType}
            value={value}
            data-jrn-trigger={trigger}
            aria-invalid={error || invalid ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => onValue(e.target.value)}
            onFocus={() => {
              setFocused(true);
              onFocusChange?.(true);
            }}
            onBlur={() => {
              setFocused(false);
              onFocusChange?.(false);
            }}
            autoFocus={autoFocus}
            {...rest}
          />
        </span>
        {type === 'password' && revealable ?
          <button
            type="button"
            className="jrn-field__reveal"
            aria-label={revealed ? F01_COPY.signIn.hide : F01_COPY.signIn.show}
            aria-pressed={revealed}
            onClick={() => setRevealed((v) => !v)}
            data-jrn-trigger={trigger ? `${trigger}-toggle` : undefined}
          >
            <JurnlIcon name={revealed ? 'eye-off' : 'eye'} size={20} />
          </button>
        : null}
      </div>
      {error ?
        <p className="jrn-field__error" id={errorId} role="alert">
          {error}
        </p>
      : null}
    </div>
  );
}

/* ── JURNL_CHECKBOX (square-rounded) ── */
export function JurnlCheckbox({ checked, onChange, children, trigger, ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; children?: ReactNode; trigger?: string; ariaLabel?: string }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} aria-label={ariaLabel} className="jrn-check" onClick={() => onChange(!checked)} data-jrn-trigger={trigger}>
      <span className="jrn-check__box" aria-hidden>
        {checked ? <JurnlIcon name="check" size={15} filled /> : null}
      </span>
      {children ? <span>{children}</span> : null}
    </button>
  );
}

/* ── JURNL_TOGGLE (square-rounded track + knob) ── */
export function JurnlToggle({ checked, onChange, label, trigger }: { checked: boolean; onChange: (v: boolean) => void; label: string; trigger?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="jrn-toggle" onClick={() => onChange(!checked)} data-jrn-trigger={trigger}>
      <i aria-hidden />
    </button>
  );
}

/* `icon` puts the glyph in its own leading column: [ ICON ] [ LABEL ] [ MARK ]. A wrapped label never starts under it.
   `multi` is for pick-several groups (checkbox semantics); the default is one-of-many (radio). */
export function JurnlChoice({ selected, onSelect, children, trigger, icon, multi }: { selected: boolean; onSelect: () => void; children: ReactNode; trigger?: string; icon?: JurnlIconName; multi?: boolean }) {
  return (
    <button type="button" role={multi ? 'checkbox' : 'radio'} aria-checked={selected} className={`jrn-row jrn-choice${icon ? ' jrn-choice--icon' : ''}`} onClick={onSelect} data-jrn-trigger={trigger}>
      {icon ?
        <span className="jrn-choice__icon" aria-hidden>
          <JurnlIcon name={icon} size={15} />
        </span>
      : null}
      <span className="jrn-row__copy">{children}</span>
      <span className="jrn-choice__mark" aria-hidden />
    </button>
  );
}

export function JurnlTile({ icon, tone, size = 18, large }: { icon: JurnlIconName; tone?: 'emerald' | 'wine' | 'sage'; size?: number; large?: boolean }) {
  return (
    <span className={`jrn-tile${tone ? ` jrn-tile--${tone}` : ''}${large ? ' jrn-tile--lg' : ''}`} aria-hidden>
      <JurnlIcon name={icon} size={size} filled={!!tone} />
    </span>
  );
}

export function JurnlRow({ icon, leading, title, sub, onClick, trigger, end }: { icon?: JurnlIconName; leading?: ReactNode; title: string; sub?: string; onClick?: () => void; trigger?: string; end?: ReactNode }) {
  const body = (
    <>
      {leading ?? (icon ? <JurnlTile icon={icon} /> : null)}
      <span className="jrn-row__copy">
        <span>{title}</span>
        {sub ? <small>{sub}</small> : null}
      </span>
      <span className="jrn-row__end">{end ?? (onClick ? <JurnlIcon name="chevron" size={16} /> : null)}</span>
    </>
  );
  return onClick ?
      <button type="button" className="jrn-row" onClick={onClick} data-jrn-trigger={trigger}>
        {body}
      </button>
    : <div className="jrn-row" data-jrn-trigger={trigger}>
        {body}
      </div>;
}

/* ── JURNL_INLINE_EXPANSION ── */
export function JurnlInlineExpansion({ open, children, testId }: { open: boolean; children: ReactNode; testId?: string }) {
  return (
    <div className="jrn-expand" data-open={open ? 'true' : 'false'} data-jrn-trigger={testId} aria-hidden={!open}>
      <div>{children}</div>
    </div>
  );
}

export function JurnlPasswordRequirements({ rules, flagUnmet = false, testId }: { rules: { id: string; label: string; met: boolean }[]; flagUnmet?: boolean; testId?: string }) {
  return (
    <ul className="jrn-reqs" data-jrn-trigger={testId} aria-label="PASSWORD REQUIREMENTS">
      {rules.map((r) => (
        <li key={r.id} className="jrn-req" data-met={r.met ? 'true' : 'false'} data-flagged={flagUnmet ? 'true' : 'false'}>
          <span className="jrn-req__mark" aria-hidden>
            {r.met ? <JurnlIcon name="check" size={12} filled /> : flagUnmet ? <JurnlIcon name="close" size={10} filled /> : null}
          </span>
          <span>{r.label}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── JURNL_ERROR_PANEL ── */
export function JurnlErrorPanel({
  title,
  body,
  items,
  action,
  testId,
  block = false,
}: {
  title: string;
  body?: string;
  items?: string[];
  action?: { label: string; onClick: () => void; trigger?: string; variant?: 'primary' | 'secondary' | 'destructive' };
  testId?: string;
  block?: boolean;
}) {
  return (
    <div className={`jrn-error${block ? ' jrn-error--block' : ''}`} role="alert" data-jrn-trigger={testId}>
      <JurnlTile icon="alert" tone="wine" size={block ? 22 : 14} />
      <div className="jrn-error__copy">
        {block ? <h3 className="jrn-h3">{title}</h3> : <b>{title}</b>}
        {body ? <span>{body}</span> : null}
        {items?.length ?
          <ul>
            {items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        : null}
        {action ?
          <JurnlButton variant={action.variant ?? 'secondary'} onClick={action.onClick} trigger={action.trigger}>
            {action.label}
          </JurnlButton>
        : null}
      </div>
    </div>
  );
}

export function JurnlSuccessPanel({ title, body, children, testId }: { title: string; body?: string; children?: ReactNode; testId?: string }) {
  return (
    <div className="jrn-success" data-jrn-trigger={testId}>
      <JurnlTile icon="check" tone="emerald" large size={26} />
      <h3 className="jrn-h3">{title}</h3>
      {body ? <p className="jrn-body">{body}</p> : null}
      {children}
    </div>
  );
}

/* ── JURNL_SUCCESS_BANNER (toast) ── */
export function JurnlSuccessBanner({ tone, title, body, onClose, testId }: { tone: 'success' | 'error'; title: string; body?: string; onClose: () => void; testId?: string }) {
  return (
    <div className={`jrn-toast${tone === 'error' ? ' jrn-toast--error' : ''}`} role="status" aria-live="polite" data-jrn-trigger={testId ?? 'toast'}>
      <JurnlTile icon={tone === 'error' ? 'alert' : 'check'} size={16} />
      <div className="jrn-toast__copy">
        <b>{title}</b>
        {body ? <span>{body}</span> : null}
      </div>
      <button type="button" className="jrn-iconbtn" aria-label={C.close} onClick={onClose}>
        <JurnlIcon name="close" size={16} />
      </button>
    </div>
  );
}

/* focus containment for every overlay surface. A callback ref: the surface can mount a render after the hook (the
   overlay host arrives after the first paint, e.g. an overlay opened from a deep link), and focus, Tab containment and
   Escape must attach whenever it does. */
function useOverlayFocus(onClose: () => void) {
  const [el, ref] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!el) return;
    const prev = document.activeElement as HTMLElement | null;
    const focusables = () => [...el.querySelectorAll<HTMLElement>('button:not([disabled]),input,[tabindex]:not([tabindex="-1"])')];
    focusables()[0]?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0]!;
      const last = f[f.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    el.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('keydown', onKey);
      prev?.focus?.({ preventScroll: true });
    };
  }, [el, onClose]);
  return { ref, el };
}

/* ── JURNL_DRAWER_SHORT / JURNL_DRAWER_LONG ── */
export function JurnlDrawer({
  size,
  title,
  eyebrow,
  lead,
  onClose,
  children,
  footer,
  tone,
  testId,
  keyboard = false,
}: {
  size: 'short' | 'long';
  title: string;
  eyebrow?: string;
  lead?: string;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  tone?: 'wine';
  testId: string;
  /** Raises the sheet while a field is focused so the keyboard does not cover save. */
  keyboard?: boolean;
}) {
  const { ref, el: sheet } = useOverlayFocus(onClose);
  const titleId = useId();
  useEffect(() => {
    const root = sheet?.closest('.jrn');
    if (!(root instanceof HTMLElement)) return;
    if (!keyboard) {
      root.style.removeProperty('--jrn-vvh');
      root.style.removeProperty('--jrn-vv-offset');
      return;
    }
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => {
      root.style.setProperty('--jrn-vvh', `${Math.round(vv.height)}px`);
      root.style.setProperty('--jrn-vv-offset', `${Math.round(vv.offsetTop)}px`);
    };
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
      root.style.removeProperty('--jrn-vvh');
      root.style.removeProperty('--jrn-vv-offset');
    };
  }, [keyboard, sheet]);
  return (
    <OverlayLayer>
      <div className="jrn-overlay" data-jrn-overlay={testId} data-jrn-drawer={size}>
        <div className="jrn-overlay__scrim" onClick={onClose} aria-hidden />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`jrn-drawer jrn-drawer--${size}${tone ? ` jrn-drawer--${tone}` : ''}`}
          data-keyboard={keyboard ? 'open' : 'closed'}
        >
          <span className="jrn-drawer__grab" aria-hidden />
          <div className="jrn-drawer__head">
            <div>
              {eyebrow ? <span className="jrn-eyebrow">{eyebrow}</span> : null}
              <h2 className="jrn-h2" id={titleId}>
                {title}
              </h2>
              {lead ? <p className="jrn-body">{lead}</p> : null}
            </div>
            <JurnlIconButton icon="close" label={C.close} onClick={onClose} trigger={`${testId}-close`} />
          </div>
          {children ? <div className="jrn-drawer__body">{children}</div> : null}
          {footer ? <div className="jrn-drawer__foot">{footer}</div> : null}
        </div>
      </div>
    </OverlayLayer>
  );
}

/* ── JURNL_FULL_SCREEN_SHEET ── */
export function JurnlSheet({ title, onClose, children, footer, testId }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; testId: string }) {
  const { ref } = useOverlayFocus(onClose);
  return (
    <OverlayLayer>
      <div className="jrn-overlay" data-jrn-overlay={testId} data-jrn-sheet="full">
        <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="jrn-sheet">
          <div className="jrn-sheet__bar">
            <JurnlIconButton icon="back" label={C.back} onClick={onClose} trigger={`${testId}-close`} />
            <b>{title}</b>
          </div>
          <div className="jrn-sheet__body">{children}</div>
          {footer ? <div className="jrn-sheet__foot">{footer}</div> : null}
        </div>
      </div>
    </OverlayLayer>
  );
}

/* ── JURNL_CONFIRMATION_MODAL ── */
export function JurnlModal({
  title,
  body,
  icon,
  tone,
  confirm,
  onCancel,
  cancelLabel = C.cancel,
  testId,
  children,
}: {
  title: string;
  body?: string;
  icon?: JurnlIconName;
  tone?: 'emerald' | 'wine';
  confirm?: { label: string; onClick: () => void; variant?: 'primary' | 'destructive'; loading?: boolean; trigger?: string };
  onCancel: () => void;
  cancelLabel?: string;
  testId: string;
  children?: ReactNode;
}) {
  const { ref } = useOverlayFocus(onCancel);
  const titleId = useId();
  return (
    <OverlayLayer>
      <div className="jrn-overlay jrn-overlay--center" data-jrn-overlay={testId} data-jrn-modal="confirm">
        <div className="jrn-overlay__scrim" onClick={onCancel} aria-hidden />
        <div ref={ref} role="alertdialog" aria-modal="true" aria-labelledby={titleId} className="jrn-modal">
          {icon ? <JurnlTile icon={icon} tone={tone} large size={26} /> : null}
          <h2 className="jrn-h2" id={titleId}>
            {title}
          </h2>
          {body ? <p className="jrn-body">{body}</p> : null}
          {children}
          {confirm ?
            <JurnlButton variant={confirm.variant ?? 'primary'} onClick={confirm.onClick} loading={confirm.loading} trigger={confirm.trigger ?? `${testId}-confirm`}>
              {confirm.label}
            </JurnlButton>
          : null}
          <JurnlButton variant="quiet" onClick={onCancel} trigger={`${testId}-cancel`}>
            {cancelLabel}
          </JurnlButton>
        </div>
      </div>
    </OverlayLayer>
  );
}

/* ── JURNL_EXTERNAL_HANDOFF — the JURNL card shown before leaving for another app ── */
export function JurnlExternalHandoff({ title, body, continueLabel, onContinue, onCancel, testId, icon = 'external' }: { title: string; body: string; continueLabel: string; onContinue: () => void; onCancel: () => void; testId: string; icon?: JurnlIconName }) {
  return (
    <JurnlModal title={title} body={body} icon={icon} onCancel={onCancel} cancelLabel={C.notNow} testId={testId} confirm={{ label: continueLabel, onClick: onContinue, trigger: `${testId}-continue` }} />
  );
}

/* ── JURNL_NATIVE_HANDOFF_BOUNDARY — JURNL-branded hold; never a fake OS sheet ── */
export function JurnlNativeHandoff({
  title,
  body,
  waiting,
  waitingLabel,
  icon = 'face-id',
  onContinue,
  continueLabel,
  onCancel,
  testId,
}: {
  title: string;
  body: string;
  waiting: boolean;
  waitingLabel: string;
  icon?: JurnlIconName;
  onContinue?: () => void;
  continueLabel?: string;
  onCancel: () => void;
  testId: string;
}) {
  const { ref } = useOverlayFocus(onCancel);
  return (
    <OverlayLayer>
      <div className="jrn-overlay jrn-overlay--center" data-jrn-overlay={testId} data-jrn-handoff="native">
        <div className="jrn-overlay__scrim" onClick={waiting ? undefined : onCancel} aria-hidden />
        <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="jrn-modal" data-waiting={waiting ? 'true' : 'false'}>
          <span className="jrn-handoff__glyph" data-waiting={waiting ? 'true' : 'false'} aria-hidden>
            <JurnlIcon name={icon} size={56} />
          </span>
          <h2 className="jrn-h2">{title}</h2>
          <p className="jrn-body">{body}</p>
          {waiting ?
            <p className="jrn-handoff__waiting" role="status">
              <span className="jrn-btn__pulse" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              {waitingLabel}
            </p>
          : onContinue ?
            <JurnlButton onClick={onContinue} trigger={`${testId}-continue`}>
              {continueLabel ?? C.continue}
            </JurnlButton>
          : null}
          <JurnlButton variant="quiet" onClick={onCancel} trigger={`${testId}-cancel`}>
            {C.cancel}
          </JurnlButton>
        </div>
      </div>
    </OverlayLayer>
  );
}

/* ── JURNL_ROUTE_TRANSITION ── */
export function JurnlScreenTransition({ routeKey, family = false, children, testId }: { routeKey: string; family?: boolean; children: ReactNode; testId: string }) {
  return (
    <section key={routeKey} className="jrn-screen" data-transition={family ? 'family' : 'push'} data-jrn-screen={testId}>
      {children}
    </section>
  );
}

export function JurnlHeadline({ lines, lg, xl, id }: { lines: readonly string[]; lg?: boolean; xl?: boolean; id?: string }) {
  return (
    <h1 className={`jrn-h1${xl ? ' jrn-h1--xl' : lg ? ' jrn-h1--lg' : ''}`} id={id}>
      {lines.map((l, i) => (
        <span key={`${l}-${i}`} style={{ display: 'block' }}>
          {l}
        </span>
      ))}
    </h1>
  );
}

export function JurnlLines({ lines, className = 'jrn-kicker' }: { lines: readonly string[]; className?: string }) {
  return (
    <p className={className}>
      {lines.map((l, i) => (
        <span key={`${l}-${i}`} style={{ display: 'block' }}>
          {l}
        </span>
      ))}
    </p>
  );
}

export function JurnlLogo({ small, label = 'JURNL' }: { small?: boolean; label?: string }) {
  return <img className={`jrn-logo${small ? ' jrn-logo--sm' : ''}`} src="/site00/projects/jurnl/brand/jurnl-logo-official.png" alt={label} draggable={false} data-jrn-logo="official" />;
}
