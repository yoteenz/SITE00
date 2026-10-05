import { useState, type ReactNode } from 'react';
import { DwsIcon } from './DwsIcons';

/** Shared overlay primitives. Overlay kinds: drawer (left), inspector (right), modal (center). */
export function Overlay({
  kind,
  id,
  code,
  title,
  sub,
  onClose,
  children,
  footer,
  testId,
}: {
  kind: 'drawer' | 'inspector' | 'modal';
  id: string;
  code?: string;
  title: string;
  sub?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  testId?: string;
}) {
  return (
    <aside className={`dws-ov dws-ov--${kind}`} data-overlay={id} data-testid={testId ?? `dws-${id}`} role={kind === 'modal' ? 'dialog' : 'complementary'} aria-label={title}>
      <header className="dws-ov__head">
        {code ? <b className="dws-ov__code">{code}</b> : <i className="dws-ov__bar" aria-hidden="true" />}
        <span className="dws-ov__titles">
          <strong>{title}</strong>
          {sub ? <small>{sub}</small> : null}
        </span>
        <button type="button" className="dws-iconbtn" onClick={onClose} aria-label="CLOSE">
          <DwsIcon name="close" size={14} />
        </button>
      </header>
      <div className="dws-ov__body">{children}</div>
      {footer ? <footer className="dws-ov__foot">{footer}</footer> : null}
    </aside>
  );
}

export function Tabs({ tabs, value, onChange, label }: { tabs: readonly string[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="dws-tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button key={t} type="button" role="tab" aria-selected={t === value} className={t === value ? 'is-on' : ''} onClick={() => onChange(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}

export function SearchField({ value, onChange, placeholder, id }: { value: string; onChange: (v: string) => void; placeholder: string; id: string }) {
  return (
    <label className="dws-search" htmlFor={id}>
      <DwsIcon name="search" size={14} />
      <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} autoComplete="off" />
      <span className="dws-search__filter" aria-hidden="true">
        <DwsIcon name="filter" size={14} />
      </span>
    </label>
  );
}

export function KV({ rows }: { rows: readonly (readonly [string, ReactNode])[] }) {
  return (
    <dl className="dws-kv">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Chips({ items }: { items: readonly string[] }) {
  return (
    <ul className="dws-chips">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone = status === 'APPROVED' ? 'ok' : status === 'CHANGES REQUESTED' || status === 'REJECTED' ? 'bad' : 'wait';
  return (
    <em className={`dws-pill dws-pill--${tone}`}>
      <i aria-hidden="true" />
      {status}
    </em>
  );
}

export function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="dws-toggle">
      <span>{label}</span>
      <button type="button" role="switch" aria-checked={on} className={on ? 'is-on' : ''} onClick={() => onChange(!on)}>
        <i />
      </button>
    </label>
  );
}

export function Btn({
  children,
  onClick,
  kind = 'ghost',
  icon,
  disabled,
  testId,
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: 'ghost' | 'primary' | 'danger' | 'dark';
  icon?: string;
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <button type="button" className={`dws-btn dws-btn--${kind}`} onClick={onClick} disabled={disabled} data-testid={testId}>
      {icon ? <DwsIcon name={icon} size={14} /> : null}
      <span>{children}</span>
    </button>
  );
}

export function CommentBox({ onSubmit, placeholder }: { onSubmit: (text: string) => void; placeholder: string }) {
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText('');
  };
  return (
    <div className="dws-comment">
      <span className="dws-comment__avatar" aria-hidden="true">
        <DwsIcon name="user" size={14} />
      </span>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') send();
        }}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <button type="button" className="dws-iconbtn" onClick={send} aria-label="ADD COMMENT">
        <DwsIcon name="comment" size={14} />
      </button>
    </div>
  );
}
