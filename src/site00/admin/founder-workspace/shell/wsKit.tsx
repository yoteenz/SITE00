/**
 * Founder workspace visual primitives — React port of the approved OPUS2 kit
 * (docs/site00/idnty/founder-workspace-responsive-authority-opus2/boards/src/ws-kit.js).
 * Markup and class names match the authority one-to-one so ifw-authority.css (ported ws.css) styles them unchanged.
 */
import { useId, type ReactNode, type Ref } from 'react';
import { Link } from 'react-router-dom';
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
  tone?: '' | 'red' | 'out' | 'ghost' | 'danger';
  size?: '' | 'sm' | 'xs';
  block?: boolean;
  icon?: string;
  arrow?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  type?: 'button' | 'submit';
  /** Disabled controls render the authority `ws-btn--off` treatment (never a greyed default button). */
  disabled?: boolean;
  /** In-flight server request: `ws-btn--busy`, aria-busy, not clickable. */
  busy?: boolean;
  /** Square icon-only button (`ws-btn--icon`); `ariaLabel` is required. */
  iconOnly?: boolean;
  title?: string;
  className?: string;
};

export function WsButton({ children, tone = '', size = '', block = false, icon, arrow = false, onClick, ariaLabel, type = 'button', disabled = false, busy = false, iconOnly = false, title, className = '' }: BtnProps) {
  const off = disabled && !busy;
  const cls = ['ws-btn', !off && !busy && tone && `ws-btn--${tone}`, off && 'ws-btn--off', busy && 'ws-btn--busy', size && `ws-btn--${size}`, block && 'ws-btn--block', iconOnly && 'ws-btn--icon', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={cls} onClick={onClick} aria-label={ariaLabel ?? (iconOnly && typeof children === 'string' ? children : undefined)} disabled={disabled || busy} aria-busy={busy || undefined} title={title}>
      {off && !icon ? <WsIcon name="lock" /> : icon ? <WsIcon name={icon} /> : null}
      {iconOnly ? null : <span>{children}</span>}
      {arrow && !off && !busy && !iconOnly ? <WsArrow /> : null}
    </button>
  );
}

/** Router link dressed as an authority button (navigation, never a mutation). */
export function WsLinkButton({ to, children, tone = '', size = '', block = false, icon, arrow = false, external = false }: { to: string; children: ReactNode; tone?: '' | 'red' | 'out' | 'ghost'; size?: '' | 'sm' | 'xs'; block?: boolean; icon?: string; arrow?: boolean; external?: boolean }) {
  const cls = ['ws-btn', tone && `ws-btn--${tone}`, size && `ws-btn--${size}`, block && 'ws-btn--block'].filter(Boolean).join(' ');
  const inner = (
    <>
      {icon ? <WsIcon name={icon} /> : null}
      <span>{children}</span>
      {arrow ? <WsArrow /> : null}
    </>
  );
  return external ? (
    <a className={cls} href={to} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    <Link className={cls} to={to}>
      {inner}
    </Link>
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

/** Status chip — ok · req (needs founder) · policy (disabled by policy) · unver · fail · test · warn · muted · gap. */
export type WsChipKind = 'ok' | 'req' | 'policy' | 'unver' | 'fail' | 'test' | 'warn' | 'muted' | 'gap';
export const WsChip = ({ kind, children, icon }: { kind: WsChipKind; children: ReactNode; icon?: string }) => (
  <span className={`ws-chip ws-chip--${kind}`}>
    {icon ? <WsIcon name={icon} /> : null}
    {children}
  </span>
);

/** Backend dependency marker (gap id from the authority registers). */
export const WsGap = ({ id }: { id: string }) => (
  <span className="ws-gapmark" title={`Backend dependency ${id}`}>
    {id}
  </span>
);

export const WsKbd = ({ children }: { children: ReactNode }) => <span className="ws-kbd">{children}</span>;

/** Execution mode tag (OPS): AUTOMATED · ASSISTED · CLIENT ACTION · EXTERNAL MANUAL · VERIFICATION. */
export function WsMode({ mode }: { mode: string }) {
  const m = mode.replace(/_/g, ' ').toUpperCase();
  const k = m === 'CLIENT ACTION' ? 'client' : m === 'VERIFICATION' ? 'verify' : '';
  return <span className={`ws-mode ${k ? `ws-mode--${k}` : ''}`.trim()}>{m}</span>;
}

export function WsIdent({ name, sub, attn = false, size = 'sm' }: { name: string; sub?: ReactNode; attn?: boolean; size?: '' | 'xs' | 'sm' | 'lg' }) {
  return (
    <span className="ws-ident">
      <WsPlate name={name} attn={attn} size={size} />
      <span className="ws-who">
        <b title={name}>{name}</b>
        {sub ? <span>{sub}</span> : null}
      </span>
    </span>
  );
}

export type WsTabItem<T extends string> = { id: T; label: string; count?: number | string };

/** Underlined tab strip (`ws-tabs`) — real buttons with tab semantics; counts use the authority pill. */
export function WsTabs<T extends string>({ items, value, onChange, label, fit = false }: { items: WsTabItem<T>[]; value: T; onChange: (id: T) => void; label: string; fit?: boolean }) {
  return (
    <div className={`ws-tabs ${fit ? 'ws-tabs--fit' : ''}`.trim()} role="tablist" aria-label={label}>
      {items.map((t) => {
        const on = t.id === value;
        return (
          <button key={t.id} type="button" role="tab" aria-selected={on} className={`ws-tab ${on ? 'ws-tab--on' : ''}`.trim()} onClick={() => onChange(t.id)}>
            {t.label}
            {t.count !== undefined && t.count !== '' ? <WsCount n={t.count} tone={on ? '' : 'ink'} /> : null}
          </button>
        );
      })}
    </div>
  );
}

/** Segmented control (`ws-segctl`). */
export function WsSegCtl<T extends string>({ items, value, onChange, label, block = false }: { items: { id: T; label: string }[]; value: T; onChange: (id: T) => void; label: string; block?: boolean }) {
  return (
    <div className={`ws-segctl ${block ? 'ws-segctl--block' : ''}`.trim()} role="radiogroup" aria-label={label}>
      {items.map((t) => (
        <button key={t.id} type="button" role="radio" aria-checked={t.id === value} className={t.id === value ? 'on' : ''} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Key/value list (`ws-kv`). The third tuple member marks user data (`ws-data`, original case). */
export function WsKv({ rows }: { rows: Array<[ReactNode, ReactNode, boolean?]> }) {
  return (
    <dl style={{ margin: 0 }}>
      {rows.map(([k, v, data], i) => (
        <div key={i} className="ws-kv">
          <dt>{k}</dt>
          <dd className={data ? 'ws-data' : undefined}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const PHASES = ['INVITED', 'INTAKE', 'RECOMMEND', 'QUOTE', 'PAYMENT', 'SETUP', 'VERIFY', 'COMPLETE'];
const SHORT = ['INV', 'INT', 'REC', 'QTE', 'PAY', 'SET', 'VER', 'DONE'];
const CHECK = (
  <svg className="ws-ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const WsCheckGlyph = () => CHECK;

/** Eight-step client journey (`ws-journey`): done ✓ · current (red, or ink when the client holds the move) · future. */
export function WsJourney({ phase, kind = 'cur', dates = [], abbr = false }: { phase: number; kind?: 'cur' | 'client' | 'blocked'; dates?: string[]; abbr?: boolean }) {
  return (
    <ol className={`ws-journey ${abbr ? 'ws-journey--abbr' : ''}`.trim()} aria-label={`CLIENT JOURNEY · STEP ${phase + 1} OF 8`}>
      {PHASES.map((l, i) => {
        const s = i < phase ? 'done' : i === phase ? kind : 'fut';
        return (
          <li key={l} className={`ws-jn ws-jn--${s}`} aria-current={i === phase ? 'step' : undefined}>
            <span className="ws-jn__n">{s === 'done' ? CHECK : s === 'blocked' ? '!' : String(i + 1).padStart(2, '0')}</span>
            <span className="ws-jn__l">
              <span className="f">{l}</span>
              <span className="s" aria-hidden="true">
                {SHORT[i]}
              </span>
            </span>
            {dates.length ? <span className="ws-jn__d">{dates[i] || '—'}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

/** Field frame (`ws-field`): label with required/optional marks, control, error and hint lines. */
export function WsField({ label, children, req = false, opt = false, err, hint, htmlFor }: { label: ReactNode; children: ReactNode; req?: boolean; opt?: boolean; err?: string | null; hint?: ReactNode; htmlFor?: string }) {
  return (
    <div className="ws-field">
      <label className="ws-field__l" htmlFor={htmlFor}>
        {err ? <WsMark kind="founder" /> : null}
        {label}
        {req ? (
          <span className="req" aria-hidden="true">
            *
          </span>
        ) : null}
        {opt ? <span className="opt">OPTIONAL</span> : null}
      </label>
      {children}
      {err ? (
        <span className="ws-err" role="alert">
          <WsMark kind="founder" />
          {err}
        </span>
      ) : null}
      {hint ? <span className="ws-hint">{hint}</span> : null}
    </div>
  );
}

type InputProps = { value: string; onChange: (v: string) => void; placeholder?: string; data?: boolean; err?: boolean; readOnly?: boolean; type?: string; id?: string; autoFocus?: boolean; inputMode?: 'text' | 'email' | 'numeric' | 'decimal' | 'tel' | 'search'; ariaLabel?: string; maxLength?: number };

/** Text input in the authority grammar (`ws-input`); user values render in the data face. */
export function WsInput({ value, onChange, placeholder, data = true, err = false, readOnly = false, type = 'text', id, autoFocus, inputMode, ariaLabel, maxLength }: InputProps) {
  return (
    <input
      id={id}
      className={['ws-input', data && 'ws-data', err && 'ws-input--err', readOnly && 'ws-input--ro'].filter(Boolean).join(' ')}
      value={value}
      type={type}
      placeholder={placeholder}
      readOnly={readOnly}
      aria-invalid={err || undefined}
      aria-label={ariaLabel}
      autoFocus={autoFocus}
      inputMode={inputMode}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function WsTextarea({ value, onChange, placeholder, rows = 4, id, err = false, ariaLabel }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; id?: string; err?: boolean; ariaLabel?: string }) {
  return (
    <textarea
      id={id}
      className={['ws-input', 'ws-input--area', 'ws-data', err && 'ws-input--err'].filter(Boolean).join(' ')}
      value={value}
      rows={rows}
      placeholder={placeholder}
      aria-invalid={err || undefined}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Radio card (`ws-choice`) — replaces native radios/selects where the authority uses choices. */
export function WsChoice({ on, title, desc, onSelect, disabled = false, tag }: { on: boolean; title: ReactNode; desc?: ReactNode; onSelect: () => void; disabled?: boolean; tag?: ReactNode }) {
  return (
    <button type="button" role="radio" aria-checked={on} disabled={disabled} className={`ws-choice ${on ? 'ws-choice--on' : ''}`.trim()} onClick={onSelect}>
      <span className="ws-choice__dot" />
      <span>
        <b>
          {title}
          {tag}
        </b>
        {desc ? <span className="d">{desc}</span> : null}
      </span>
    </button>
  );
}

export function WsChoiceGroup({ label, children, cols = 1 }: { label: string; children: ReactNode; cols?: 1 | 2 | 3 }) {
  return (
    <div role="radiogroup" aria-label={label} className={`ifw-choices ifw-choices--${cols}`}>
      {children}
    </div>
  );
}

/** Checkbox (`ws-check`) — a real checkbox role with the authority box. */
export function WsCheck({ on, onToggle, children, hint, disabled = false }: { on: boolean; onToggle: (next: boolean) => void; children: ReactNode; hint?: ReactNode; disabled?: boolean }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} disabled={disabled} className="ws-check" onClick={() => onToggle(!on)}>
      <span className={`ws-check__b ${on ? 'ws-check__b--on' : ''}`.trim()} aria-hidden="true" />
      <span>
        <span className="ws-body">{children}</span>
        {hint ? (
          <span className="ws-hint" style={{ display: 'block', marginTop: 4 }}>
            {hint}
          </span>
        ) : null}
      </span>
    </button>
  );
}

/** Search field in the toolbar grammar (`ws-search`) with a real input. */
export function WsSearch({ value, onChange, placeholder, kbd = '/', ariaLabel, inputRef }: { value: string; onChange: (v: string) => void; placeholder: string; kbd?: string; ariaLabel?: string; inputRef?: Ref<HTMLInputElement> }) {
  const id = useId();
  return (
    <label className={`ws-search ${value ? 'ws-search--focus' : ''}`.trim()} role="search" htmlFor={id}>
      <WsIcon name="search" />
      <input ref={inputRef} id={id} className="ifw-search__input ws-data" value={value} placeholder={placeholder} aria-label={ariaLabel ?? placeholder} onChange={(e) => onChange(e.target.value)} />
      {value ? (
        <button type="button" className="ws-iconbtn ifw-search__clear" aria-label="CLEAR SEARCH" onClick={() => onChange('')}>
          <WsIcon name="close" />
        </button>
      ) : kbd ? (
        <WsKbd>{kbd}</WsKbd>
      ) : null}
    </label>
  );
}

/** Link field (`ws-link`): code + copy. */
export function WsCopyLink({ value, onCopy, label = 'COPY' }: { value: string; onCopy?: () => void; label?: string }) {
  return (
    <div className="ws-link">
      <code className="ws-data" title={value}>
        {value}
      </code>
      {onCopy ? (
        <WsButton tone="ghost" size="xs" icon="link" onClick={onCopy}>
          {label}
        </WsButton>
      ) : null}
    </div>
  );
}

export function WsEmpty({ label, title, children, action }: { label: string; title: ReactNode; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="ws-empty">
      <span className="ws-label">{label}</span>
      <h2 className="ws-h2">
        {title}
        <i className="ws-period" />
      </h2>
      {children ? (
        <p className="ws-meta" style={{ margin: 0, maxWidth: '60ch', lineHeight: 1.6 }}>
          {children}
        </p>
      ) : null}
      {action}
    </div>
  );
}

export const WsSkel = ({ w = '60%' }: { w?: string }) => <span className="ws-skel" style={{ width: w }} />;

/** Inspector head (`ws-insp__head`): kicker bar with open-in-full and close, then identity. */
export function WsInspHead({ kicker, children, onClose, onExpand }: { kicker: ReactNode; children: ReactNode; onClose?: () => void; onExpand?: () => void }) {
  return (
    <div className="ws-insp__head">
      <div className="ws-insp__bar">
        <span className="ws-label">{kicker}</span>
        <span style={{ display: 'flex' }}>
          {onExpand ? <WsIconButton icon="external" label="OPEN IN FULL" onClick={onExpand} /> : null}
          {onClose ? <WsIconButton icon="close" label="CLOSE INSPECTOR" onClick={onClose} /> : null}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Technical detail disclosure used by every error surface (no secrets, ever). */
export function WsTechDetail({ action, message, open = false, onOpen }: { action: string; message: string; open?: boolean; onOpen?: () => void }) {
  return (
    <details className="ws-panel" style={{ marginTop: 14, maxWidth: 760 }} open={open}>
      <summary className="ws-panel__h ws-label" style={{ cursor: 'pointer', listStyle: 'none' }}>
        TECHNICAL DETAIL
      </summary>
      <div className="ws-panel__b">
        <WsKv
          rows={[
            ['ACTION', action, true],
            ['MESSAGE', message, true],
          ]}
        />
        <p className="ws-meta" style={{ margin: '10px 0 0' }}>
          NO SECRET VALUES OR TOKENS ARE EVER SHOWN.
        </p>
        {onOpen ? (
          <div style={{ marginTop: 10 }}>
            <WsButton tone="ghost" size="xs" icon="external" onClick={onOpen}>
              OPEN TECHNICAL DETAIL
            </WsButton>
          </div>
        ) : null}
      </div>
    </details>
  );
}
