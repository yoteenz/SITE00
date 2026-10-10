/** Digital Foundation client shell (DF-C01..C09, C26, C45..C48). Presentation only. */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { DfButton, DfLoadingState } from './components';
import { DfIcon, type DfIconName } from './icons';
import { DfCornerFragment, DfCrownObject, DfThresholdHero } from './objects';
import {
  buildDfMenu,
  DF_VIEW_META,
  type DfMenuDestinationId,
  type DfMenuStepState,
  type DfView,
} from './model';

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
          <img
            className="df-header__menu-icon"
            src="/site00/idnty/digital-foundation/menu-icon.png"
            alt=""
            width={28}
            height={13}
            decoding="async"
          />
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

/** Primary/secondary/text action (DF-C06). Thin alias over the shared `DfButton`. */
export function DfCta({
  label,
  onClick,
  disabled,
  busy,
  busyLabel,
  type = 'button',
  tone = 'red',
  action,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  busyLabel?: string;
  type?: 'button' | 'submit';
  tone?: 'red' | 'outline' | 'text';
  action?: string;
}) {
  return (
    <DfButton
      label={label}
      onClick={onClick}
      disabled={disabled}
      busy={busy}
      busyLabel={busyLabel}
      type={type}
      tone={tone === 'red' ? 'primary' : tone === 'outline' ? 'secondary' : 'text'}
      action={action}
    />
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

const DRAWER_EXIT_MS = 220;
const DRAWER_FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
const DRAWER_ART_SRC = '/site00/idnty/digital-foundation/architecture/df-g03-corner-fragment.jpg';

const STEP_STATUS: Record<DfMenuStepState, string | null> = {
  current: 'CURRENT STEP',
  open: null,
  done: 'COMPLETE',
  locked: 'LOCKED',
};

const DESTINATION_ICON: Record<DfMenuDestinationId, DfIconName> = {
  overview: 'overview',
  roadmap: 'roadmap',
  needs_you: 'needsYou',
  records: 'folder',
  comm_prefs: 'message',
  location: 'pin',
};

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/** Right-side navigation drawer (DF-C48). Portaled to `body`, so it carries its own `df-drawer` scope. */
function DfDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  const hostRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) {
      setMounted(true);
      return undefined;
    }
    if (prefersReducedMotion()) {
      setMounted(false);
      return undefined;
    }
    const t = window.setTimeout(() => setMounted(false), DRAWER_EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  const active = open && mounted;

  useEffect(() => {
    if (!active) return undefined;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    document.body.classList.add('df-drawer-open');
    const inerted: Element[] = [];
    for (const el of Array.from(document.body.children)) {
      if (el === hostRef.current || el.hasAttribute('inert')) continue;
      el.setAttribute('inert', '');
      inerted.push(el);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(DRAWER_FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      for (const el of inerted) el.removeAttribute('inert');
      document.body.classList.remove('df-drawer-open');
      prev?.focus?.({ preventScroll: true });
    };
  }, [active]);

  if (!mounted) return null;

  const drawer = (
    <div ref={hostRef} className="df-drawer" data-state={open ? 'open' : 'closed'}>
      <div className="df-drawer__backdrop" aria-hidden="true" onClick={onClose} />
      <div ref={panelRef} className="df-drawer__panel" role="dialog" aria-modal="true" aria-label="DIGITAL FOUNDATION MENU">
        <div className="df-drawer__art" aria-hidden="true">
          <img src={DRAWER_ART_SRC} alt="" decoding="async" />
        </div>
        <div className="df-drawer__head">
          <div className="df-drawer__brand">
            <span className="df-drawer__mark">SITE 00</span>
            <span className="df-drawer__product">DIGITAL FOUNDATION</span>
          </div>
          <button ref={closeRef} type="button" className="df-drawer__close" aria-label="CLOSE MENU" onClick={onClose}>
            <DfIcon name="close" />
          </button>
        </div>
        <div className="df-drawer__scroll">{children}</div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawer, document.body) : drawer;
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
  onNavigate: (v: DfView, anchor?: string) => void;
}) {
  const { steps, destinations } = buildDfMenu(views, current);
  return (
    <DfDrawer open={open} onClose={onClose}>
      <nav id="df-menu" className="df-drawer__nav" aria-label="DIGITAL FOUNDATION">
        <ol className="df-drawer__steps">
          {steps.map((s) => {
            const enabled = s.state === 'current' || s.state === 'open';
            const status = STEP_STATUS[s.state];
            return (
              <li key={s.view}>
                <button
                  type="button"
                  className={`df-drawer__step df-drawer__step--${s.state}`}
                  aria-disabled={enabled ? undefined : true}
                  aria-current={s.state === 'current' ? 'step' : undefined}
                  onClick={() => {
                    if (!enabled) return;
                    onNavigate(s.view);
                    onClose();
                  }}
                >
                  <span className="df-drawer__index">{s.index}</span>
                  <span className="df-drawer__connector" aria-hidden="true" />
                  <span className="df-drawer__label">
                    {s.label}
                    {status && <span className="df-visually-hidden">, {status}</span>}
                  </span>
                  <DfIcon
                    name={s.state === 'locked' ? 'lock' : s.state === 'done' ? 'check' : 'arrow'}
                    className="df-drawer__glyph"
                  />
                </button>
              </li>
            );
          })}
        </ol>
        <ul className="df-drawer__places">
          {destinations.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                className={`df-drawer__place${d.available ? '' : ' df-drawer__place--locked'}`}
                aria-disabled={d.available ? undefined : true}
                aria-current={d.current ? 'page' : undefined}
                onClick={() => {
                  if (!d.available || !d.view) return;
                  onNavigate(d.view, d.anchor);
                  onClose();
                }}
              >
                <DfIcon name={DESTINATION_ICON[d.id]} className="df-drawer__place-icon" />
                <span className="df-drawer__label">
                  {d.label}
                  {d.status && <span className="df-drawer__status">{d.status}</span>}
                </span>
                <DfIcon name={d.available ? 'arrow' : 'lock'} className="df-drawer__glyph" />
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="df-drawer__foot">
        <span className="df-drawer__foot-rule" aria-hidden="true" />
        <p className="df-drawer__foot-text">
          SECURE.
          <br />
          GUIDED.
          <br />
          DONE FOR YOU.
        </p>
      </div>
    </DfDrawer>
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
        <DfLoadingState label="LOADING YOUR DIGITAL FOUNDATION…" block />
      </DfFrame>
    </div>
  );
}
