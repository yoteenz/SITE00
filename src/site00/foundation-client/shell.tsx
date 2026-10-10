/** Digital Foundation client shell (DF-C01..C09, C26, C45..C48). Presentation only. */
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { DfIcon, type DfIconName } from './icons';
import { DfCornerFragment, DfCrownObject, DfThresholdHero } from './objects';
import { DF_VIEW_META, DF_VIEW_ORDER, type DfView } from './model';

export type DfObjectKind = 'hero' | 'crown' | 'corner' | 'none';

export function DfHeader({ onMenu, menuOpen }: { onMenu?: () => void; menuOpen?: boolean }) {
  return (
    <header className="df-header">
      <div className="df-header__brand">
        <span className="df-header__mark">SITE 00</span>
        <span className="df-header__product">DIGITAL FOUNDATION</span>
      </div>
      {onMenu && (
        <button
          type="button"
          className="df-header__menu"
          aria-label={menuOpen ? 'CLOSE MENU' : 'OPEN MENU'}
          aria-expanded={menuOpen}
          aria-controls="df-menu"
          onClick={onMenu}
        >
          <svg className="df-header__menu-icon" viewBox="0 0 48 28" width="18" height="11" aria-hidden="true" focusable="false">
            <rect x="0" y="0" width="48" height="5" rx="2.5" />
            <rect x="22" y="11.5" width="26" height="5" rx="2.5" />
            <rect x="0" y="23" width="48" height="5" rx="2.5" />
          </svg>
        </button>
      )}
    </header>
  );
}

export function DfRail({ index, label }: { index: string; label: string }) {
  return (
    <p className="df-rail">
      <span className="df-rail__index">{index}</span>
      <span className="df-rail__rule" aria-hidden="true" />
      <span className="df-rail__label">{label}</span>
    </p>
  );
}

/** Condensed uppercase headline; the red terminal period is part of the system, not punctuation. */
export function DfHeadline({ lines, id }: { lines: string[]; id?: string }) {
  return (
    <h1 className="df-headline" id={id}>
      {lines.map((line, i) => (
        <span key={i} className="df-headline__line">
          {line}
          {i === lines.length - 1 && <span className="df-headline__period">.</span>}
        </span>
      ))}
    </h1>
  );
}

export function DfLede({ children }: { children: ReactNode }) {
  return <p className="df-lede">{children}</p>;
}

export function DfCta({
  label,
  onClick,
  disabled,
  busy,
  busyLabel,
  type = 'button',
  tone = 'red',
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  busyLabel?: string;
  type?: 'button' | 'submit';
  tone?: 'red' | 'outline';
}) {
  return (
    <button
      type={type}
      className={`df-cta df-cta--${tone}`}
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      data-busy={busy ? '1' : undefined}
    >
      <span>{busy ? busyLabel ?? label : label}</span>
      {!busy && <DfIcon name="arrow" className="df-cta__arrow" />}
    </button>
  );
}

export function DfTrust({ text, aside }: { text: string; aside?: ReactNode }) {
  return (
    <div className="df-trust">
      <DfIcon name="lock" className="df-trust__lock" />
      <span className="df-trust__text">{text}</span>
      {aside && <span className="df-trust__aside">{aside}</span>}
    </div>
  );
}

export function DfFooter({ code }: { code: string }) {
  return (
    <footer className="df-footer">
      <span className="df-footer__mark">SITE 00</span>
      <span className="df-footer__rule" aria-hidden="true" />
      <span className="df-footer__code">
        IDNTY <span className="df-footer__num">/ {code}</span>
      </span>
    </footer>
  );
}

export function DfAlert({
  children,
  tone = 'red',
  icon = 'alert',
  role,
}: {
  children: ReactNode;
  tone?: 'red' | 'ink' | 'muted';
  icon?: DfIconName;
  role?: 'alert' | 'status';
}) {
  return (
    <div className={`df-alert df-alert--${tone}`} role={role}>
      <DfIcon name={icon} className="df-alert__icon" />
      <div className="df-alert__body">{children}</div>
    </div>
  );
}

/** Bottom sheet for children that are not full screens (DF-C45). */
export function DfSheet({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('df-sheet-open');
    return () => document.body.classList.remove('df-sheet-open');
  }, [open]);

  if (!open) return null;

  const sheet = (
    <div className="df-sheet" role="presentation" onClick={onClose}>
      <div
        ref={ref}
        className="df-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="df-sheet__head">
          <h2 id={titleId} className="df-sheet__title">
            {title}
          </h2>
          <button type="button" className="df-sheet__close" aria-label="CLOSE" onClick={onClose}>
            <DfIcon name="close" />
          </button>
        </div>
        <div className="df-sheet__body">{children}</div>
        {footer && <div className="df-sheet__foot">{footer}</div>}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(sheet, document.body) : sheet;
}

export function DfMenu({
  open,
  onClose,
  views,
  current,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  views: DfView[];
  current: DfView | null;
  onNavigate: (v: DfView) => void;
}) {
  return (
    <DfSheet open={open} title="YOUR FOUNDATION" onClose={onClose}>
      <nav id="df-menu" aria-label="DIGITAL FOUNDATION">
        <ol className="df-menu">
          {DF_VIEW_ORDER.filter((v) => v !== 'OVERVIEW' || views.includes('OVERVIEW')).map((v) => {
            const meta = DF_VIEW_META[v];
            const enabled = views.includes(v);
            return (
              <li key={v}>
                <button
                  type="button"
                  className="df-menu__item"
                  disabled={!enabled}
                  aria-current={current === v ? 'step' : undefined}
                  onClick={() => {
                    onNavigate(v);
                    onClose();
                  }}
                >
                  <span className="df-menu__index">{meta.index}</span>
                  <span className="df-menu__label">{meta.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <p className="df-menu__note">THIS LINK IS PERSONAL TO YOUR BUSINESS. PLEASE DON&apos;T SHARE IT.</p>
    </DfSheet>
  );
}

function ObjectSlot({ kind, variant }: { kind: DfObjectKind; variant: DfView | null }) {
  if (kind === 'none') return null;
  if (kind === 'hero') return null;
  if (kind === 'crown') {
    return (
      <>
        <div className="df-object df-object--crown" aria-hidden="true">
          <DfCrownObject variant={variant === 'P05' || variant === 'P06' || variant === 'OVERVIEW' ? variant : 'P04'} />
        </div>
        <div className="df-object df-object--corner" aria-hidden="true">
          <DfCornerFragment />
        </div>
      </>
    );
  }
  return (
    <div className="df-object df-object--corner" aria-hidden="true">
      <DfCornerFragment />
    </div>
  );
}

export function DfHeroObject() {
  return (
    <div className="df-object df-object--hero" aria-hidden="true">
      <DfThresholdHero />
    </div>
  );
}

/** One parent screen: header, rail, content column, footer, threshold object. */
export function DfFrame({
  view,
  object,
  onMenu,
  menuOpen,
  children,
  state,
}: {
  view: DfView | null;
  object: DfObjectKind;
  onMenu?: () => void;
  menuOpen?: boolean;
  children: ReactNode;
  /** Exposed for QA and assistive tech; never drives logic. */
  state?: string;
}) {
  const meta = view ? DF_VIEW_META[view] : null;
  return (
    <div className={`df-screen df-screen--${object}`} data-view={view ?? 'SYSTEM'} data-state={state}>
      <ObjectSlot kind={object} variant={view} />
      <DfHeader onMenu={onMenu} menuOpen={menuOpen} />
      <div className="df-screen__grid">
        <main className="df-screen__main">{children}</main>
      </div>
      <DfFooter code={meta ? meta.footer : '000'} />
    </div>
  );
}

export function DfSystemPanel({
  index,
  label,
  lines,
  body,
  action,
}: {
  index: string;
  label: string;
  lines: string[];
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="df-root">
      <DfFrame view={null} object="corner" state="SYSTEM">
        <DfRail index={index} label={label} />
        <DfHeadline lines={lines} />
        <DfLede>{body}</DfLede>
        {action && <div className="df-actions">{action}</div>}
      </DfFrame>
    </div>
  );
}

export function DfLoading() {
  return (
    <div className="df-root">
    <DfFrame view={null} object="none" state="LOADING">
      <div className="df-skeleton" role="status" aria-live="polite">
        <span className="df-skeleton__rail" />
        <span className="df-skeleton__line df-skeleton__line--xl" />
        <span className="df-skeleton__line df-skeleton__line--xl" />
        <span className="df-skeleton__line df-skeleton__line--lg" />
        <span className="df-skeleton__line" />
        <span className="df-skeleton__line" />
        <span className="df-visually-hidden">LOADING YOUR DIGITAL FOUNDATION</span>
      </div>
    </DfFrame>
    </div>
  );
}
