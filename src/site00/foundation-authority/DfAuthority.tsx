/**
 * Digital Foundation visual-authority shell (C–J run: DF-C01…DF-G01).
 * Decorative plates are lettering-free crops of the hash-verified originals; every word, row and
 * control on top of them is live UI.
 */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { DfIcon, type DfIconName } from '../foundation-client/icons';
import './dfAuthority.css';

const ASSET_ROOT = '/site00/idnty/digital-foundation/authority';

export type DfaPlate = 'd01' | 'd02' | 'd03' | 'g01' | 'c01' | 'c02' | 'f01' | 'f02';
export type DfaShard = 'd03' | 'g01' | 'c01' | 'c02' | 'f01';

type ExtraGlyph = 'user' | 'ticket' | 'sliders' | 'checkCircle' | 'alertCircle' | 'shieldCheck';
export type DfaGlyph = DfIconName | ExtraGlyph;

const EXTRA: Record<ExtraGlyph, JSX.Element> = {
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4.4 3.9-7 8-7s7.2 2.6 8 7" />
    </>
  ),
  ticket: (
    <>
      <path d="M2.5 6.5h19v3.2a2.3 2.3 0 0 0 0 4.6v3.2h-19v-3.2a2.3 2.3 0 0 0 0-4.6V6.5Z" />
      <path d="M8 10.5h8M8 13.5h8" />
    </>
  ),
  sliders: (
    <>
      <path d="M3 6h18M3 12h18M3 18h18" />
      <circle cx="15" cy="6" r="2" fill="#fff" />
      <circle cx="8" cy="12" r="2" fill="#fff" />
      <circle cx="14" cy="18" r="2" fill="#fff" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m7.8 12.3 2.9 2.9 5.5-5.6" />
    </>
  ),
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6.5M12 16.4v.4" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />
      <path d="m8.8 12.2 2.3 2.3 4.2-4.3" />
    </>
  ),
};

export function DfaIcon({ name, className }: { name: DfaGlyph; className?: string }) {
  if (name in EXTRA) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"
        strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
        {EXTRA[name as ExtraGlyph]}
      </svg>
    );
  }
  return <DfIcon name={name as DfIconName} className={className} />;
}

export type DfaMenuItem = { label: string; to?: string; onSelect?: () => void; current?: boolean; disabled?: boolean };

function DfaMenu({ items }: { items: DfaMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  return (
    <div className="dfa__menu" ref={ref}>
      <button type="button" className="dfa__burger" aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)}>
        <span /><span />
      </button>
      {open && (
        <nav className="dfa__menu-panel" id={panelId} aria-label="Digital Foundation">
          {items.map((item) => {
            const body = <><span>{item.label}</span>{item.current && <em>CURRENT</em>}</>;
            if (item.to && !item.disabled) {
              return <Link key={item.label} to={item.to} aria-current={item.current ? 'page' : undefined} onClick={() => setOpen(false)}>{body}</Link>;
            }
            return (
              <button key={item.label} type="button" disabled={item.disabled} aria-current={item.current ? 'page' : undefined}
                onClick={() => { item.onSelect?.(); setOpen(false); }}>{body}</button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export function DfaShell({
  code, kicker, title, lede, plate, shard, footCode, authority, menu, children, labelledBy = 'dfa-title',
}: {
  code: string;
  kicker: string;
  /** One entry per intentional line break (the authority breaks headlines by hand). */
  title: string[];
  lede?: ReactNode;
  plate: DfaPlate;
  shard?: DfaShard;
  footCode: string;
  /** `desktop` = DF-D/G desk grammar, `mobile` = DF-C/F handset grammar. */
  authority: 'desktop' | 'mobile';
  menu: DfaMenuItem[];
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <main className={`dfa dfa--${authority} dfa--plate-${plate}`} aria-labelledby={labelledBy}>
      <img className="dfa__plate" src={`${ASSET_ROOT}/plate-${plate}.webp`} alt="" aria-hidden="true" decoding="async" />
      {shard && <img className="dfa__shard" src={`${ASSET_ROOT}/shard-${shard}.webp`} alt="" aria-hidden="true" decoding="async" />}
      <header className="dfa__top">
        <div className="dfa__brand"><strong>SITE 00</strong><span>DIGITAL FOUNDATION</span></div>
        <DfaMenu items={menu} />
      </header>
      <div className="dfa__body">
        <div className="dfa__code"><b>{code}</b><i aria-hidden="true" /><span>{kicker}</span></div>
        <h1 className="dfa__title" id={labelledBy}>
          {title.map((line, i) => (
            <span key={line} className="dfa__title-line">
              {line}{i === title.length - 1 && <span className="dfa__dot" aria-hidden="true" />}
            </span>
          ))}
        </h1>
        {lede && <p className="dfa__lede">{lede}</p>}
        {children}
      </div>
      <footer className="dfa__foot">
        <strong>SITE 00</strong><i aria-hidden="true" /><span>IDNTY <em>/</em> <b>{footCode}</b></span>
      </footer>
    </main>
  );
}

export type DfaTone = 'ok' | 'alert' | 'neutral';

export function DfaPill({ tone, children }: { tone: DfaTone; children: ReactNode }) {
  return <span className={`dfa-pill dfa-pill--${tone}`}>{children}</span>;
}

export function DfaCta({ children, to, onClick, disabled, variant = 'primary', type = 'button' }: {
  children: ReactNode; to?: string; onClick?: () => void; disabled?: boolean; variant?: 'primary' | 'secondary'; type?: 'button' | 'submit';
}) {
  const cls = `dfa-cta dfa-cta--${variant}`;
  const body = <><span>{children}</span>{variant === 'primary' && <DfIcon name="arrow" className="dfa-cta__arrow" />}</>;
  if (to && !disabled) return <Link className={cls} to={to}>{body}</Link>;
  return <button type={type} className={cls} onClick={onClick} disabled={disabled}>{body}</button>;
}

export function DfaNote({ children, icon = 'lock' }: { children: ReactNode; icon?: DfaGlyph }) {
  return <p className="dfa-note"><DfaIcon name={icon} /><span>{children}</span></p>;
}

export function DfaStatus({ kind, children }: { kind: 'loading' | 'error' | 'empty'; children: ReactNode }) {
  return (
    <p className={`dfa-status dfa-status--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {kind === 'loading' && <span className="dfa-status__pulse" aria-hidden="true" />}
      {children}
    </p>
  );
}
