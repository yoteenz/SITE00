/**
 * Founder workspace visual primitives — React port of the approved OPUS2 kit
 * (docs/site00/idnty/founder-workspace-responsive-authority-opus2/boards/src/ws-kit.js).
 * Markup and class names match the authority one-to-one so ifw-authority.css (ported ws.css) styles them unchanged.
 */
import type { ReactNode } from 'react';
import { DF_ICON_GLYPHS } from '../../../foundation-client/icons/glyphs';
import { DF_ICON_CATALOG, DF_ICON_LEGACY_EXTRAS } from '../../../foundation-client/icons/meta';

const ALIASES: Record<string, string> = {};
for (const item of [...DF_ICON_CATALOG, ...DF_ICON_LEGACY_EXTRAS]) {
  ALIASES[item.id] = item.id;
  for (const a of item.aliases ?? []) ALIASES[a] = item.id;
}

/** DF monoline icon (same glyph source as the client app and the authority boards). */
export function WsIcon({ name, className = '' }: { name: string; className?: string }) {
  const id = ALIASES[name] ?? name;
  const raw = DF_ICON_GLYPHS[id] ?? '';
  const markup = raw.split('{{step}}').join('').split('{{progress}}').join('8');
  return <svg className={`ws-ic ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: markup }} />;
}

export const WsArrow = () => (
  <svg className="ws-ic ws-arrow" viewBox="0 0 24 12" aria-hidden="true">
    <path d="M1 6h21m-5-5 5 5-5 5" />
  </svg>
);
export const WsChevron = () => (
  <svg className="ws-ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);
export const WsPlus = () => (
  <svg className="ws-ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/** Status kinds of the authority: founder (red, needs you) · client · work · blocked · done · idle · test. */
export type WsKind = 'founder' | 'client' | 'work' | 'blocked' | 'done' | 'idle' | 'test';

export const WsMark = ({ kind }: { kind: WsKind }) => <span className={`ws-mk ws-mk--${kind}`} aria-hidden="true" />;

export function WsStatus({ kind, children, oneLine = false }: { kind: WsKind; children: ReactNode; oneLine?: boolean }) {
  return (
    <span className={`ws-st ws-st--${kind} ${oneLine ? 'ws-st--1l' : ''}`.trim()}>
      <WsMark kind={kind} />
      <span>{children}</span>
    </span>
  );
}

export const WsCount = ({ n, tone = '' }: { n: number | string; tone?: '' | 'ink' }) => (
  <span className={`ws-count ${tone ? `ws-count--${tone}` : ''}`.trim()}>{n}</span>
);

/** Square initials plate; red edge when the founder must act. */
export function WsPlate({ name, attn = false, size = '' }: { name: string; attn?: boolean; size?: '' | 'xs' | 'sm' | 'lg' }) {
  const init =
    name
      .replace(/[^A-Za-z0-9 &]/g, '')
      .split(/\s+|&/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || '00';
  return (
    <span className={['ws-plate', attn && 'ws-plate--attn', size && `ws-plate--${size}`].filter(Boolean).join(' ')} aria-hidden="true">
      {init}
    </span>
  );
}

/** Eight-step lifecycle segments (INVITED → COMPLETE). */
export function WsSegments({ phase, kind, wide = false }: { phase: number; kind: WsKind; wide?: boolean }) {
  return (
    <span className={`ws-seg ${wide ? 'ws-seg--w' : ''}`.trim()} role="img" aria-label={`STEP ${phase + 1} OF 8`}>
      {Array.from({ length: 8 }, (_, i) => (
        <i key={i} className={i < phase ? 'd' : i === phase ? (kind === 'founder' ? 'c' : kind === 'blocked' ? 'b' : 'd') : ''} />
      ))}
    </span>
  );
}

type BtnProps = {
  children?: ReactNode;
  tone?: '' | 'red' | 'out' | 'ghost';
  size?: '' | 'sm' | 'xs';
  block?: boolean;
  icon?: string;
  arrow?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  type?: 'button' | 'submit';
};

export function WsButton({ children, tone = '', size = '', block = false, icon, arrow = false, onClick, ariaLabel, type = 'button' }: BtnProps) {
  const cls = ['ws-btn', tone && `ws-btn--${tone}`, size && `ws-btn--${size}`, block && 'ws-btn--block'].filter(Boolean).join(' ');
  return (
    <button type={type} className={cls} onClick={onClick} aria-label={ariaLabel}>
      {icon ? <WsIcon name={icon} /> : null}
      <span>{children}</span>
      {arrow ? <WsArrow /> : null}
    </button>
  );
}

export function WsIconButton({ icon, label, dot = false, onClick }: { icon: string; label: string; dot?: boolean; onClick?: () => void }) {
  return (
    <button type="button" className="ws-iconbtn" aria-label={label} onClick={onClick}>
      <WsIcon name={icon} />
      {dot ? <span className="ws-iconbtn__dot" /> : null}
    </button>
  );
}

export function WsPanel({ title, right, children, className = '', flush = false }: { title: string; right?: ReactNode; children: ReactNode; className?: string; flush?: boolean }) {
  return (
    <section className={`ws-panel ${className}`.trim()}>
      <div className="ws-panel__h">
        <h2 className="ws-h3">{title}</h2>
        {right}
      </div>
      <div className={`ws-panel__b ${flush ? 'ws-panel__b--flush' : ''}`.trim()}>{children}</div>
    </section>
  );
}

export function WsBanner({ children, tone = '', icon }: { children: ReactNode; tone?: '' | 'red' | 'policy'; icon?: string }) {
  return (
    <div className={`ws-banner ${tone ? `ws-banner--${tone}` : ''}`.trim()} role={tone === 'red' ? 'alert' : 'status'}>
      {icon ? <WsIcon name={icon} /> : null}
      <span>{children}</span>
    </div>
  );
}

/** Activity row: time · mark · verb + subject. */
export function WsActivity({ time, kind, title, sub }: { time: string; kind: WsKind; title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="ws-act">
      <time>{time}</time>
      <WsMark kind={kind} />
      <p>
        {title}
        {sub ? <span>{sub}</span> : null}
      </p>
    </div>
  );
}

export const WsBrand = ({ env }: { env: string }) => (
  <span className="ws-brand">
    <b>SITE 00</b>
    <span>
      FOUNDER <span className="ws-env">{env}</span>
    </span>
  </span>
);
