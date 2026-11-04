/**
 * JURNL interactive surfaces — V3 (the founder-selected calibration, 2026-11-04). One shared foundation, distinct
 * physical families; every surface is real DOM over the founder's own paper and field art.
 *
 *  A  V3Drawer (material 'olive')     EDITORIAL NAVIGATION DRAWER — deep-olive folio, gold sections, cream rows
 *  B  V3Drawer (material 'ledger')    LEDGER / DISCOVERY DRAWER — parchment ledger (search, filters, results)
 *  C  .jv3-fragment on JurnlPopover   ANCHORED PARCHMENT FRAGMENT — small context menus (MANAGE POCKET)
 *  D  V3Folio material 'parchment'    LAYERED TASK SHEET — fields, selectors, CANCEL / SAVE
 *  E  V3Folio material 'parchment'    DECISION / CONFIRMATION FOLIO
 *  F  V3Caution                       TERRACOTTA / OXBLOOD CAUTION SURFACE — blocked and destructive states
 *  G  V3Folio material 'membership'   MEMBERSHIP AND ACCESS FOLIO — oxblood textile behind parchment
 *  H  V3Card                          EDITORIAL ADD-ON COLLECTION
 *  I  V3Folio material 'unlock'       FEATURE UNLOCK SURFACE — wine textile behind parchment
 *  J  V3Field / V3Well                FORM AND SELECTOR SYSTEM
 *  K  (DOT 01 receipt overlays keep their V9 authority frames; V3 pills / fields / notices are used inside)
 *  L  V3Notice                        COMPACT NOTIFICATION AND STATUS
 *
 * Hosting: every surface renders through the runtime's single overlay host (OverlayLayer) with one scrim; focus is
 * trapped, Escape and the scrim close, focus returns to the opener (useOverlayFocus). Nothing here reads money or
 * entitlements: callers pass live content.
 */
import { useCallback, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { OverlayLayer, useOverlayFocus } from '../../components/primitives';
import { Icon as LineIcon } from '../../screens/f05/dot01/icons';
import './jurnl-v3.css';

/* ── icons: the DOT 01 line set plus the few V3 needs (same 24 px grid, same stroke) ── */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const EXTRA: Record<string, ReactNode> = {
  person: (
    <>
      <circle {...P} cx="12" cy="8" r="4" />
      <path {...P} d="M4.5 20.5c1.2-4 4-6 7.5-6s6.3 2 7.5 6" />
    </>
  ),
  gear: (
    <>
      <circle {...P} cx="12" cy="12" r="3.2" />
      <path {...P} d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5" />
    </>
  ),
  shield: <path {...P} d="M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6zM9 12l2 2 4-4" />,
  crown: <path {...P} d="M3.5 17.5h17M4.5 17.5 3.5 7l5 4 3.5-6 3.5 6 5-4-1 10.5" />,
  grid: (
    <>
      <rect {...P} x="4" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect {...P} x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect {...P} x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
      <rect {...P} x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
    </>
  ),
  help: (
    <>
      <circle {...P} cx="12" cy="12" r="8.5" />
      <circle {...P} cx="12" cy="12" r="3.5" />
      <path {...P} d="m6 6 3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5" />
    </>
  ),
  signout: <path {...P} d="M10 4.5H5.5v15H10M14.5 8l4 4-4 4M18.5 12H9" />,
  close: <path {...P} d="M6 6l12 12M18 6 6 18" strokeWidth={2} />,
  clock: (
    <>
      <circle {...P} cx="12" cy="12" r="8.5" />
      <path {...P} d="M12 7.5V12l3 2" />
    </>
  ),
};
export function V3Icon({ name, className }: { name: string; className?: string }) {
  if (EXTRA[name]) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={className}>
        {EXTRA[name]}
      </svg>
    );
  }
  return <LineIcon name={name} className={className} />;
}
export function V3Chevron() {
  return (
    <svg className="jv3-chev" viewBox="0 0 10 16" aria-hidden>
      <path d="M2 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * A torn-paper silhouette as a clip-path: a deterministic jagged edge (same seed → same tear), so a folio keeps the
 * same torn edge every time it opens. `sides` lists the edges that tear.
 */
export function tornClip(seed: number, sides: ('top' | 'right' | 'bottom' | 'left')[], depth = 1.6, steps = 28): string {
  let s = seed >>> 0 || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const pts: string[] = [];
  const edge = (from: [number, number], to: [number, number], inward: [number, number], torn: boolean) => {
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const d = torn ? (rnd() * depth).toFixed(2) : '0';
      const x = from[0] + (to[0] - from[0]) * t + inward[0] * Number(d);
      const y = from[1] + (to[1] - from[1]) * t + inward[1] * Number(d);
      pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }
  };
  edge([0, 0], [100, 0], [0, 1], sides.includes('top'));
  edge([100, 0], [100, 100], [-1, 0], sides.includes('right'));
  edge([100, 100], [0, 100], [0, -1], sides.includes('bottom'));
  edge([0, 100], [0, 0], [1, 0], sides.includes('left'));
  return `polygon(${pts.join(', ')})`;
}

/** useOverlayFocus with a stable close: a caller's inline handler never re-runs the trap (which would refocus). */
function useStableFocus(onClose: () => void) {
  const latest = useRef(onClose);
  latest.current = onClose;
  const close = useCallback(() => latest.current(), []);
  return useOverlayFocus(close);
}

/* ── A / B · drawer ── */
export function V3Drawer({ label, material = 'olive', onClose, testId, children }: { label: string; material?: 'olive' | 'ledger'; onClose: () => void; testId: string; children: ReactNode }) {
  const { ref } = useStableFocus(onClose);
  const torn = useMemo(() => tornClip(7, ['left'], 3.4, 60), []);
  return (
    <OverlayLayer>
      <div className="jv3-host" data-place="right" data-jrn-overlay={testId} data-jv3-family={material === 'olive' ? 'A_NAVIGATION_DRAWER' : 'B_LEDGER_DRAWER'}>
        <div className="jv3-scrim" onClick={onClose} aria-hidden />
        <div className="jv3-drawer-shadow">
          <div ref={ref} role="dialog" aria-modal="true" aria-label={label} className="jv3-drawer" data-material={material} style={{ '--jv3-torn': torn } as CSSProperties}>
            <div className="jv3-drawer__head">
              <button type="button" className="jv3-close" aria-label={`CLOSE ${label}`} data-jrn-trigger={`${testId}-close`} onClick={onClose}>
                <V3Icon name="close" />
              </button>
            </div>
            <div className="jv3-drawer__body">{children}</div>
          </div>
        </div>
      </div>
    </OverlayLayer>
  );
}

export function V3NavSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="jv3-nav-section" aria-label={title}>
      <h2 className="jv3-t-section">{title}</h2>
      {children}
    </section>
  );
}

export function V3NavItem({ icon, label, onClick, trigger, aside, variant }: { icon: string; label: string; onClick: () => void; trigger: string; aside?: ReactNode; variant?: 'quiet' }) {
  return (
    <button type="button" className="jv3-nav-item jv3-t-action" data-jrn-trigger={trigger} data-variant={variant} onClick={onClick}>
      <V3Icon name={icon} />
      <span>{label}</span>
      <span>{aside}</span>
      <V3Chevron />
    </button>
  );
}

/* ── D / E / G / I · folio ── */
export type V3FolioMaterial = 'parchment' | 'membership' | 'unlock';
export function V3Folio({
  label,
  material = 'parchment',
  seal,
  title,
  script,
  onClose,
  testId,
  children,
  footer,
  stackFooter = false,
}: {
  label: string;
  material?: V3FolioMaterial;
  seal?: ReactNode;
  title: string;
  /** one sparse lowercase cursive line (never a figure or an action) */
  script?: string;
  onClose: () => void;
  testId: string;
  children: ReactNode;
  footer?: ReactNode;
  stackFooter?: boolean;
}) {
  const { ref } = useStableFocus(onClose);
  const family = material === 'membership' ? 'G_MEMBERSHIP_FOLIO' : material === 'unlock' ? 'I_FEATURE_UNLOCK' : 'D_TASK_SHEET';
  return (
    <OverlayLayer>
      <div className="jv3-host" data-place="center" data-jrn-overlay={testId} data-jv3-family={family}>
        <div className="jv3-scrim" onClick={onClose} aria-hidden />
        <div className="jv3-folio-wrap" data-material={material}>
          <div ref={ref} role="dialog" aria-modal="true" aria-label={label} className="jv3-folio">
            <header className="jv3-folio__head">
              {seal ?? <span />}
              <div className="jv3-folio__titles">
                <h2 className="jv3-t-folio">{title}</h2>
                {script ? <p className="jv3-t-script">{script.toLowerCase()}</p> : null}
              </div>
              <button type="button" className="jv3-close" aria-label={`CLOSE ${label}`} data-jrn-trigger={`${testId}-close`} onClick={onClose}>
                <V3Icon name="close" />
              </button>
            </header>
            <div className="jv3-folio__body">{children}</div>
            {footer ? (
              <footer className="jv3-folio__foot" data-stack={stackFooter ? 'true' : undefined}>
                {footer}
              </footer>
            ) : null}
          </div>
        </div>
      </div>
    </OverlayLayer>
  );
}

/* ── F · caution surface (a panel inside a folio or an overlay's content) ── */
export function V3Caution({ seal, title, body, children, testId, role = 'alert' }: { seal?: ReactNode; title: string; body?: string; children?: ReactNode; testId?: string; role?: 'alert' | 'status' }) {
  const torn = useMemo(() => tornClip(19, ['top', 'right', 'bottom', 'left'], 1.1, 34), []);
  return (
    <section className="jv3-caution" data-testid={testId} data-jv3-family="F_CAUTION" role={role} style={{ '--jv3-torn': torn } as CSSProperties}>
      <div className="jv3-caution__head">
        {seal ?? <V3Seal icon="warn" />}
        <div style={{ display: 'grid', gap: 6 }}>
          <h3 className="jv3-t-folio">{title}</h3>
          {body ? <p className="jv3-t-meta">{body}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function V3RuleLabel({ children }: { children: string }) {
  return <p className="jv3-rule-label jv3-t-section">{children}</p>;
}

/* ── bronze medallion: a CSS bronze ring around a founder icon, or the founder's laurel wax seal ── */
export function V3Seal({ icon, wax, label }: { icon?: string; wax?: string; label?: string }) {
  if (wax) {
    return (
      <span className="jv3-seal jv3-seal--wax" aria-hidden={label ? undefined : true} aria-label={label}>
        <img src={wax} alt="" draggable={false} />
      </span>
    );
  }
  return (
    <span className="jv3-seal" aria-hidden>
      <V3Icon name={icon ?? 'warn'} />
    </span>
  );
}

/* ── pills, rows, status ── */
export function V3Pill({ tone = 'cream', trigger, onClick, children, icon, disabled, type = 'button', ariaLabel }: { tone?: 'olive' | 'cream' | 'terracotta'; trigger: string; onClick?: () => void; children: ReactNode; icon?: string; disabled?: boolean; type?: 'button' | 'submit'; ariaLabel?: string }) {
  return (
    <button type={type} className={`jv3-pill jv3-pill--${tone}`} data-jrn-trigger={trigger} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {icon ? <V3Icon name={icon} /> : null}
      <span>{children}</span>
    </button>
  );
}

export function V3Row({ icon, label, sub, aside, onClick, trigger, tone, testId }: { icon: string; label: string; sub?: string; aside?: ReactNode; onClick?: () => void; trigger?: string; tone?: 'terracotta'; testId?: string }) {
  const inner = (
    <>
      <V3Icon name={icon} />
      <span className="jv3-row__text">
        <span>{label}</span>
        {sub ? <small>{sub}</small> : null}
      </span>
      <span>{aside}</span>
      {onClick ? <V3Chevron /> : <span />}
    </>
  );
  return onClick ? (
    <button type="button" className="jv3-row" data-tone={tone} data-jrn-trigger={trigger} data-testid={testId} onClick={onClick}>
      {inner}
    </button>
  ) : (
    <div className="jv3-row" data-tone={tone} data-static="true" data-testid={testId}>
      {inner}
    </div>
  );
}

export type V3AccessState = 'INCLUDED' | 'ACTIVE' | 'AVAILABLE' | 'LOCKED' | 'COMING_SOON' | 'UNAVAILABLE' | 'FOUNDER';
const STATE_LABEL: Record<V3AccessState, string> = { INCLUDED: 'INCLUDED', ACTIVE: 'ACTIVE', AVAILABLE: 'AVAILABLE', LOCKED: 'LOCKED', COMING_SOON: 'COMING SOON', UNAVAILABLE: 'UNAVAILABLE', FOUNDER: 'FOUNDER ACCESS' };
export function V3Status({ state }: { state: V3AccessState }) {
  return (
    <span className="jv3-status" data-state={state}>
      {STATE_LABEL[state]}
    </span>
  );
}

/* ── H · collection card ── */
export function V3Card({ art, title, body, state, onClick, trigger }: { art: string; title: string; body: string; state: V3AccessState; onClick: () => void; trigger: string }) {
  return (
    <button type="button" className="jv3-card" data-jrn-trigger={trigger} data-state={state} onClick={onClick}>
      <img className="jv3-card__art" src={art} alt="" draggable={false} />
      <span className="jv3-card__text">
        <b>{title}</b>
        <span>{body}</span>
      </span>
      <V3Status state={state} />
    </button>
  );
}

/* ── J · fields ── */
export function V3Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string | null; children: ReactNode }) {
  return (
    <div className="jv3-field">
      <label className="jv3-t-field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="jv3-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ── L · compact notice ── */
export function V3Notice({ tone = 'info', icon = 'info', children, testId }: { tone?: 'info' | 'attention'; icon?: string; children: ReactNode; testId?: string }) {
  return (
    <div className="jv3-notice" data-tone={tone} role="status" data-testid={testId}>
      <V3Icon name={icon} />
      <span>{children}</span>
    </div>
  );
}
