/**
 * P0.VR.DESIGN.OPUS-WORKSPACE-SYSTEM1 — the overlay content grammar.
 *
 * `DesignChildSurfaceFrame` already gave every overlay the same chrome. What
 * it could not give them was the same *body*: each panel wrote its own
 * definition list, and a definition list is what a debug console looks like.
 * These primitives are the vocabulary a panel body is built from, so the
 * design decision lives here once instead of being re-made, differently, in
 * twenty-six places.
 *
 * Rules encoded here rather than documented:
 * - metadata is paired on one line, never stacked label-over-value;
 * - an artifact is shown, not named;
 * - absence is an explicit empty state, never invented content;
 * - raw identifiers live under ADVANCED, never in the founder's first screen.
 */

import type { ReactNode } from 'react';

export type OverlayStatusTone = 'ok' | 'active' | 'blocked' | 'warn' | 'idle' | 'na';

/**
 * Maps the production vocabularies onto the handful of states a founder can
 * see. Matching is on whole words: an unanchored search reads BLOCKED as
 * LOCKED and paints a hard stop green, which is the one mistake a status chip
 * must never make. Negative states are tested first for the same reason —
 * NOT PROMOTED is not a promotion.
 */
export function overlayTone(value: string | null | undefined): OverlayStatusTone {
  const token = (value ?? '').toUpperCase().replace(/[_·]+/g, ' ').trim();
  if (!token) return 'idle';
  const has = (...phrases: readonly string[]) =>
    phrases.some((phrase) => new RegExp(`(^|[^A-Z/])${phrase}([^A-Z/]|$)`).test(token));
  if (has('N/A', 'NONE', 'NOT APPLICABLE', 'NOT REQUIRED', 'NOT STARTED', 'NOT SELECTED', 'UNSET')) {
    return 'na';
  }
  if (has('BLOCKED', 'BLOCKING', 'FAIL', 'FAILED', 'REJECTED', 'MISSING', 'ERROR', 'NOT')) {
    return 'blocked';
  }
  if (has('WARN', 'WARNING', 'PENDING', 'WAITING', 'UNDER REVIEW', 'AMENDMENT', 'OPTIONAL')) {
    return 'warn';
  }
  if (has('PASS', 'PASSED', 'COMPLETE', 'COMPLETED', 'APPROVED', 'PROMOTED', 'LOCKED', 'READY', 'OK', 'IMPLEMENTED')) {
    return 'ok';
  }
  if (has('ACTIVE', 'CURRENT', 'SELECTED', 'IN PROGRESS', 'STAGED')) return 'active';
  return 'idle';
}

export function OverlayBody({ children }: { children: ReactNode }) {
  return <div className="tod-ok">{children}</div>;
}

export function OverlaySection({
  title,
  meta,
  flat = false,
  children,
}: {
  title: string;
  meta?: ReactNode;
  flat?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`tod-ok-section${flat ? ' tod-ok-section--flat' : ''}`}>
      <header className="tod-ok-section__head">
        <h3 className="tod-ok-section__title">{title}</h3>
        {meta ? <span className="tod-ok-section__meta">{meta}</span> : null}
      </header>
      <div className="tod-ok-section__body">{children}</div>
    </section>
  );
}

export function OverlayNote({ children }: { children: ReactNode }) {
  return <p className="tod-ok-note">{children}</p>;
}

export function OverlayStatus({
  label,
  tone,
}: {
  label: string;
  tone?: OverlayStatusTone;
}) {
  const resolved = tone ?? overlayTone(label);
  return (
    <span className={`tod-ok-status tod-ok-status--${resolved}`} data-tone={resolved}>
      {label.replace(/_/g, ' ')}
    </span>
  );
}

export function OverlayTabs({
  tabs,
  active,
  onSelect,
  label,
}: {
  tabs: Array<{ id: string; label: string }>;
  active: string;
  onSelect: (id: string) => void;
  label: string;
}) {
  return (
    <div className="tod-ok-tabs" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === active}
          className={`tod-ok-tabs__tab${tab.id === active ? ' is-on' : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function OverlayChips({
  chips,
  active,
  onSelect,
}: {
  chips: Array<{ id: string; label: string }>;
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="tod-ok-chips">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          aria-pressed={chip.id === active}
          className={`tod-ok-chipBtn${chip.id === active ? ' is-on' : ''}`}
          onClick={() => onSelect(chip.id)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

export type OverlayMetaEntry = { k: string; v: ReactNode };

export function OverlayMeta({ entries }: { entries: OverlayMetaEntry[] }) {
  return (
    <dl className="tod-ok-meta">
      {entries.map((entry) => (
        <div key={entry.k} style={{ display: 'contents' }}>
          <dt className="tod-ok-meta__k">{entry.k}</dt>
          <dd className="tod-ok-meta__v">{entry.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function OverlayPreview({
  src,
  caption,
  side,
  onOpen,
  emptyLabel = 'NO ARTIFACT YET',
  emptyHint,
}: {
  src?: string | null;
  caption: string;
  side?: ReactNode;
  onOpen?: () => void;
  emptyLabel?: string;
  emptyHint?: string;
}) {
  if (!src) {
    return <OverlayEmpty label={emptyLabel} hint={emptyHint} />;
  }
  return (
    <figure className="tod-ok-preview">
      {onOpen ?
        <button type="button" className="tod-ok-preview__frame" onClick={onOpen} aria-label={`Open ${caption} fullscreen`}>
          <img src={src} alt="" className="tod-ok-preview__img" />
          <span className="tod-ok-preview__zoom">FULLSCREEN</span>
        </button>
      : <span className="tod-ok-preview__frame tod-ok-preview__frame--static">
          <img src={src} alt="" className="tod-ok-preview__img" />
        </span>
      }
      <figcaption className="tod-ok-preview__cap">
        <span>{caption}</span>
        {side}
      </figcaption>
    </figure>
  );
}

export type OverlayThumbItem = {
  id: string;
  src?: string | null;
  label: string;
  sub?: string;
  selected?: boolean;
  mark?: string;
};

export function OverlayThumbs({
  items,
  onPick,
  wide = false,
  emptyLabel = 'NOTHING HERE YET',
  emptyHint,
}: {
  items: OverlayThumbItem[];
  onPick?: (id: string) => void;
  wide?: boolean;
  emptyLabel?: string;
  emptyHint?: string;
}) {
  if (items.length === 0) return <OverlayEmpty label={emptyLabel} hint={emptyHint} />;
  return (
    <div className={`tod-ok-thumbs${wide ? ' tod-ok-thumbs--wide' : ''}`}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`tod-ok-thumb${item.selected ? ' is-on' : ''}`}
          onClick={onPick ? () => onPick(item.id) : undefined}
          aria-pressed={onPick ? Boolean(item.selected) : undefined}
        >
          {item.src ?
            <img src={item.src} alt="" className="tod-ok-thumb__img" />
          : <span className="tod-ok-thumb__empty">NO PREVIEW</span>}
          {item.selected || item.mark ? <span className="tod-ok-thumb__mark">{item.mark ?? '✓'}</span> : null}
          <span className="tod-ok-thumb__cap">
            <span>{item.label}</span>
            {item.sub ? <span className="tod-ok-thumb__sub">{item.sub}</span> : null}
          </span>
        </button>
      ))}
    </div>
  );
}

export function OverlayCompare({ stack = false, children }: { stack?: boolean; children: ReactNode }) {
  return <div className={`tod-ok-compare${stack ? ' tod-ok-compare--stack' : ''}`}>{children}</div>;
}

export type OverlayStageState = 'COMPLETE' | 'ACTIVE' | 'BLOCKED' | 'PENDING' | 'NOT_REQUIRED';

export function OverlayStages({
  stages,
}: {
  stages: Array<{
    id: string;
    order: number;
    name: string;
    state: OverlayStageState;
    statusLabel: string;
    purpose?: string;
    missing?: string[];
    action?: { label: string; onClick: () => void };
  }>;
}) {
  return (
    <ol className="tod-ok-stages">
      {stages.map((stage) => (
        <li
          key={stage.id}
          className={`tod-ok-stage${stage.state === 'ACTIVE' ? ' is-active' : ''}${
            stage.state === 'BLOCKED' ? ' is-blocked' : ''
          }${stage.state === 'COMPLETE' ? ' is-complete' : ''}`}
          data-state={stage.state}
        >
          <span className="tod-ok-stage__num">{stage.order.toString().padStart(2, '0')}</span>
          <div className="tod-ok-stage__main">
            <div className="tod-ok-stage__top">
              <span className="tod-ok-stage__name">{stage.name}</span>
              <OverlayStatus label={stage.statusLabel} />
            </div>
            {stage.purpose ? <p className="tod-ok-stage__purpose">{stage.purpose}</p> : null}
            {stage.missing && stage.missing.length ?
              <p className="tod-ok-stage__missing">NEEDS · {stage.missing.join(' · ')}</p>
            : null}
            {stage.action ?
              <button type="button" className="tod-ok-stage__cta" onClick={stage.action.onClick}>
                {stage.action.label}
              </button>
            : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function OverlayDial({
  percent,
  facts,
}: {
  percent: number;
  facts: Array<{ label: string; value: ReactNode }>;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="tod-ok-dial">
      <div
        className="tod-ok-dial__ring"
        style={{ ['--tod-ok-pct' as string]: clamped }}
        data-pct={`${clamped}%`}
        role="img"
        aria-label={`${clamped} percent ready`}
      />
      <div className="tod-ok-dial__facts">
        {facts.map((fact) => (
          <span key={fact.label}>
            {fact.label} · {fact.value}
          </span>
        ))}
      </div>
    </div>
  );
}

export function OverlayCallout({
  title,
  tone = 'neutral',
  children,
}: {
  title: string;
  tone?: 'neutral' | 'blocked' | 'next';
  children: ReactNode;
}) {
  return (
    <div className={`tod-ok-callout${tone === 'neutral' ? '' : ` tod-ok-callout--${tone}`}`}>
      <p className="tod-ok-callout__title">{title}</p>
      <div className="tod-ok-callout__body">{children}</div>
    </div>
  );
}

export function OverlayThread({
  messages,
}: {
  messages: Array<{ id: string; who: string; agent?: boolean; text: string; media?: string[] }>;
}) {
  if (messages.length === 0) {
    return <OverlayEmpty label="NO COLLABORATION YET" hint="Messages you exchange about this authority appear here." />;
  }
  return (
    <div className="tod-ok-thread">
      {messages.map((message) => (
        <article key={message.id} className={`tod-ok-msg${message.agent ? ' tod-ok-msg--agent' : ''}`}>
          <span className="tod-ok-msg__mark" aria-hidden="true">
            {message.agent ? '◆' : '●'}
          </span>
          <div className="tod-ok-msg__body">
            <span className="tod-ok-msg__who">{message.who}</span>
            <span>{message.text}</span>
            {message.media && message.media.length ?
              <div className="tod-ok-files">
                {message.media.map((src) => (
                  <img key={src} src={src} alt="" className="tod-ok-file__thumb" />
                ))}
              </div>
            : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function OverlayComposer({
  value,
  onChange,
  onSend,
  placeholder,
  sendLabel = 'SEND',
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  sendLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="tod-ok-composer">
      <textarea
        className="tod-ok-composer__field"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="tod-ok-composer__send"
        onClick={onSend}
        disabled={disabled || value.trim().length === 0}
      >
        {sendLabel}
      </button>
    </div>
  );
}

export function OverlayDropzone({
  label = 'DROP FILES OR TAP TO UPLOAD',
  hint,
  accept,
  onFiles,
}: {
  label?: string;
  hint?: string;
  accept?: string;
  onFiles?: (files: FileList) => void;
}) {
  return (
    <label className="tod-ok-drop">
      {label}
      {hint ? <span className="tod-ok-thumb__sub"> · {hint}</span> : null}
      <input
        type="file"
        accept={accept}
        hidden
        multiple
        onChange={(event) => {
          if (event.target.files && onFiles) onFiles(event.target.files);
        }}
      />
    </label>
  );
}

export function OverlayFiles({ files }: { files: Array<{ id: string; name: string; src?: string | null }> }) {
  if (files.length === 0) return null;
  return (
    <div className="tod-ok-files">
      {files.map((file) => (
        <span key={file.id} className="tod-ok-file">
          {file.src ? <img src={file.src} alt="" className="tod-ok-file__thumb" /> : null}
          {file.name}
        </span>
      ))}
    </div>
  );
}

export function OverlayTimeline({
  entries,
}: {
  entries: Array<{ id: string; when: string; what: string; who?: string; current?: boolean }>;
}) {
  if (entries.length === 0) return <OverlayEmpty label="NO HISTORY YET" />;
  return (
    <ol className="tod-ok-time">
      {entries.map((entry) => (
        <li key={entry.id} className={`tod-ok-time__row${entry.current ? ' is-current' : ''}`}>
          <span className="tod-ok-time__when">{entry.when}</span>
          <span className="tod-ok-time__what">{entry.what}</span>
          {entry.who ? <span className="tod-ok-time__who">{entry.who}</span> : null}
        </li>
      ))}
    </ol>
  );
}

export function OverlayRows({
  rows,
  emptyLabel = 'NOTHING TO SHOW',
  emptyHint,
}: {
  rows: Array<{ id: string; name: string; sub?: ReactNode; side?: ReactNode }>;
  emptyLabel?: string;
  emptyHint?: string;
}) {
  if (rows.length === 0) return <OverlayEmpty label={emptyLabel} hint={emptyHint} />;
  return (
    <ul className="tod-ok-rows">
      {rows.map((row) => (
        <li key={row.id} className="tod-ok-row">
          <div className="tod-ok-row__main">
            <span className="tod-ok-row__name">{row.name}</span>
            {row.sub ? <span className="tod-ok-row__sub">{row.sub}</span> : null}
          </div>
          {row.side ? <div className="tod-ok-row__side">{row.side}</div> : null}
        </li>
      ))}
    </ul>
  );
}

export function OverlayEmpty({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="tod-ok-empty">
      <span className="tod-ok-empty__label">{label}</span>
      {hint ? <p className="tod-ok-empty__hint">{hint}</p> : null}
    </div>
  );
}

export function OverlayAdvanced({
  title = 'TECHNICAL DETAILS',
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <details className="tod-ok-adv">
      <summary className="tod-ok-adv__summary">{title}</summary>
      <div className="tod-ok-adv__body">{children}</div>
    </details>
  );
}

export function OverlayActions({
  primary,
  secondary = [],
}: {
  primary?: { label: string; onClick: () => void; disabled?: boolean; tone?: 'primary' | 'dark' };
  secondary?: Array<{ label: string; onClick: () => void; disabled?: boolean; tone?: 'danger' | 'dark' }>;
}) {
  if (!primary && secondary.length === 0) return null;
  return (
    <div className="tod-ok-actions">
      {primary ?
        <div className="tod-ok-actions__row">
          <button
            type="button"
            className={`tod-ok-btn tod-ok-btn--${primary.tone ?? 'primary'}`}
            onClick={primary.onClick}
            disabled={primary.disabled}
          >
            {primary.label}
          </button>
        </div>
      : null}
      {secondary.length ?
        <div className="tod-ok-actions__row">
          {secondary.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`tod-ok-btn${action.tone ? ` tod-ok-btn--${action.tone}` : ''}`}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </button>
          ))}
        </div>
      : null}
    </div>
  );
}
