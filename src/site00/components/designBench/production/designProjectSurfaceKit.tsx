/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — grammar for the project-level tab surfaces.
 *
 * The overlay kit (`tod-ok-*`) is built for a drawer: one column, a few
 * sections, a couple of actions. The top tabs are libraries and workbenches —
 * they need contact sheets, collection rails, an inspector, a persistent
 * action bar, and on a wide shell a real multi-pane layout. Rather than let
 * each tab invent that, it lives here once.
 *
 * Layout does not switch on viewport width. The artboard is always 768 logical
 * pixels wide; the shell publishes `data-shell-format` on `.tod-screen` and
 * these components resolve `wide` versus `tall` from that. See `shellFormat`
 * in TwinOpusDirectScreen.
 */

import type { CSSProperties, ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { overlayTone } from './designOverlayKit';

/* ------------------------------------------------------------ shell format */

const ShellFormatContext = createContext<'wide' | 'tall' | null>(null);

/**
 * Reads the format the shell published. Falls back to measuring the artboard
 * aspect directly so a surface rendered outside the shell (tests, the
 * standalone child route) still picks a sane layout.
 */
export function useShellFormat(): 'wide' | 'tall' {
  const provided = useContext(ShellFormatContext);
  const [measured, setMeasured] = useState<'wide' | 'tall'>('tall');

  useEffect(() => {
    if (provided) return;
    const measure = () => {
      if (typeof window === 'undefined') return;
      setMeasured(window.innerWidth >= 1024 ? 'wide' : 'tall');
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [provided]);

  return provided ?? measured;
}

export function ShellFormatProvider({
  format,
  children,
}: {
  format: 'wide' | 'tall';
  children: ReactNode;
}) {
  return <ShellFormatContext.Provider value={format}>{children}</ShellFormatContext.Provider>;
}

/* -------------------------------------------------------------- foundation */

export function ProjectSurface({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const format = useShellFormat();
  return (
    <div className="tod-ps" data-surface={id} data-format={format}>
      {children}
    </div>
  );
}

/**
 * The project's identity line. Every tab opens with it, because the one
 * question a project-level surface must answer immediately is "whose project
 * am I looking at" — the page-level chrome above answers a different one.
 */
export function ProjectIdentity({
  name,
  subtitle,
  stream,
  stats,
  authority,
}: {
  name: string;
  subtitle: string;
  stream?: string[];
  stats: Array<{ label: string; value: ReactNode }>;
  authority?: { label: string; state: string; locked: boolean };
}) {
  return (
    <header className="tod-ps-identity">
      <div className="tod-ps-identity__name">
        <strong>{name}</strong>
        <span>{subtitle}</span>
      </div>
      {stream && stream.length > 0 ? (
        <ul className="tod-ps-identity__stream">
          {stream.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      <dl className="tod-ps-identity__stats">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
      {authority ? (
        <div className="tod-ps-identity__auth">
          <span className="tod-ps-identity__authLabel">{authority.label}</span>
          <span className="tod-ps-identity__authState">
            {authority.state}
            <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
              {authority.locked ? (
                <>
                  <rect x="2" y="5.5" width="8" height="5.5" fill="none" stroke="currentColor" />
                  <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" fill="none" stroke="currentColor" />
                </>
              ) : (
                <>
                  <rect x="2" y="5.5" width="8" height="5.5" fill="none" stroke="currentColor" />
                  <path d="M4 5.5V4a2 2 0 0 1 3.8-.9" fill="none" stroke="currentColor" />
                </>
              )}
            </svg>
          </span>
        </div>
      ) : null}
    </header>
  );
}

export function ProjectSearch({
  placeholder,
  value,
  onChange,
  trailing,
}: {
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
  trailing?: ReactNode;
}) {
  return (
    <div className="tod-ps-search">
      <label className="tod-ps-search__field">
        <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
          <circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" />
          <path d="M9.2 9.2 12.5 12.5" stroke="currentColor" fill="none" />
        </svg>
        <input
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      {trailing}
    </div>
  );
}

export type ProjectFilterChip = {
  id: string;
  label: string;
  count?: number;
};

export function ProjectFilters({
  chips,
  activeId,
  onPick,
}: {
  chips: ProjectFilterChip[];
  activeId: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="tod-ps-filters" role="tablist" aria-label="Filters">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          role="tab"
          aria-selected={chip.id === activeId}
          className="tod-ps-chip"
          data-active={chip.id === activeId ? 'true' : 'false'}
          onClick={() => onPick(chip.id)}
        >
          {chip.label}
          {typeof chip.count === 'number' ? <em>{chip.count}</em> : null}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- feature */

export function ProjectFeature({
  eyebrow,
  src,
  title,
  source,
  body,
  tags,
  status,
  footer,
  onOpen,
}: {
  eyebrow: string;
  src: string | null;
  title: string;
  source?: string;
  body?: string;
  tags?: string[];
  status?: string;
  footer?: ReactNode;
  onOpen?: () => void;
}) {
  return (
    <section className="tod-ps-feature">
      <span className="tod-ps-feature__eyebrow">{eyebrow}</span>
      <div className="tod-ps-feature__body">
        <div className="tod-ps-feature__shot">
          {src ? <img src={src} alt={title} loading="lazy" /> : <span>NO PREVIEW</span>}
        </div>
        <div className="tod-ps-feature__meta">
          {status ? (
            <span className={`tod-ok-status tod-ok-status--${overlayTone(status)}`}>{status}</span>
          ) : null}
          <h3>{title}</h3>
          {source ? <p className="tod-ps-feature__source">{source}</p> : null}
          {body ? <p className="tod-ps-feature__text">{body}</p> : null}
          {tags && tags.length > 0 ? (
            <div className="tod-ps-tags">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}
          {footer}
          {onOpen ? (
            <button type="button" className="tod-ps-feature__open" onClick={onOpen}>
              INSPECT →
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ groups */

export function ProjectGroup({
  title,
  meta,
  action,
  children,
  collapsible = false,
  defaultOpen = true,
  tight = false,
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  tight?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = collapsible ? open : true;

  return (
    <section className="tod-ps-group" data-open={isOpen ? 'true' : 'false'} data-tight={tight ? 'true' : 'false'}>
      <header className="tod-ps-group__head">
        {collapsible ? (
          <button type="button" className="tod-ps-group__toggle" onClick={() => setOpen((prev) => !prev)}>
            <span className="tod-ps-group__title">{title}</span>
            {meta ? <span className="tod-ps-group__meta">{meta}</span> : null}
            <span className="tod-ps-group__caret" aria-hidden="true">
              {isOpen ? '⌄' : '›'}
            </span>
          </button>
        ) : (
          <>
            <span className="tod-ps-group__title">{title}</span>
            {meta ? <span className="tod-ps-group__meta">{meta}</span> : null}
            {action ? <span className="tod-ps-group__action">{action}</span> : null}
          </>
        )}
      </header>
      {isOpen ? <div className="tod-ps-group__body">{children}</div> : null}
    </section>
  );
}

export function ProjectViewAll({ label = 'VIEW ALL', onClick }: { label?: string; onClick?: () => void }) {
  return (
    <button type="button" className="tod-ps-viewall" onClick={onClick}>
      {label} →
    </button>
  );
}

/* ------------------------------------------------------------------- cards */

export type ProjectCardModel = {
  id: string;
  src: string | null;
  title: string;
  sub?: string;
  badge?: string;
  tags?: string[];
  footer?: string;
  /** Rendered as a flat block of colour when there is no image. */
  swatch?: string;
};

export function ProjectCards({
  items,
  activeId,
  onPick,
  columns = 4,
  emptyLabel = 'NOTHING HERE YET',
  emptyHint,
}: {
  items: ProjectCardModel[];
  activeId?: string | null;
  onPick?: (id: string) => void;
  columns?: 2 | 3 | 4 | 6;
  emptyLabel?: string;
  emptyHint?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="tod-ok-empty">
        <span className="tod-ok-empty__label">{emptyLabel}</span>
        {emptyHint ? <p className="tod-ok-empty__hint">{emptyHint}</p> : null}
      </div>
    );
  }

  return (
    <div className="tod-ps-cards" style={{ ['--tod-ps-cols' as keyof CSSProperties]: columns } as CSSProperties}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="tod-ps-card"
          data-active={activeId === item.id ? 'true' : 'false'}
          onClick={() => onPick?.(item.id)}
        >
          <span className="tod-ps-card__shot">
            {item.src ? (
              <img src={item.src} alt="" loading="lazy" />
            ) : item.swatch ? (
              <span className="tod-ps-card__swatch" style={{ background: item.swatch }} />
            ) : (
              <span className="tod-ps-card__none">NO PREVIEW</span>
            )}
            {item.badge ? (
              <span className={`tod-ps-card__badge tod-ok-status--${overlayTone(item.badge)}`}>
                {item.badge}
              </span>
            ) : null}
          </span>
          <span className="tod-ps-card__title">{item.title}</span>
          {item.sub ? <span className="tod-ps-card__sub">{item.sub}</span> : null}
          {item.tags && item.tags.length > 0 ? (
            <span className="tod-ps-tags">
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </span>
          ) : null}
          {item.footer ? <span className="tod-ps-card__footer">{item.footer}</span> : null}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------- rows */

export type ProjectRowModel = {
  id: string;
  src?: string | null;
  name: string;
  sub?: string;
  /** Compact labelled columns; hidden on a tall shell past the first two. */
  cells?: Array<{ label: string; value: ReactNode }>;
  status?: string;
  readiness?: number;
  trailing?: ReactNode;
};

export function ProjectRows({
  rows,
  activeId,
  onPick,
  emptyLabel = 'NOTHING HERE YET',
}: {
  rows: ProjectRowModel[];
  activeId?: string | null;
  onPick?: (id: string) => void;
  emptyLabel?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="tod-ok-empty">
        <span className="tod-ok-empty__label">{emptyLabel}</span>
      </div>
    );
  }

  return (
    <ul className="tod-ps-rows">
      {rows.map((row) => (
        <li key={row.id}>
          <button
            type="button"
            className="tod-ps-row"
            data-active={activeId === row.id ? 'true' : 'false'}
            onClick={() => onPick?.(row.id)}
          >
            {row.src !== undefined ? (
              <span className="tod-ps-row__shot">
                {row.src ? <img src={row.src} alt="" loading="lazy" /> : null}
              </span>
            ) : null}
            <span className="tod-ps-row__id">
              <strong>{row.name}</strong>
              {row.sub ? <em>{row.sub}</em> : null}
            </span>
            {typeof row.readiness === 'number' ? (
              <ProjectDial percent={row.readiness} label="READY" />
            ) : null}
            {row.cells && row.cells.length > 0 ? (
              <span className="tod-ps-row__cells">
                {row.cells.map((cell) => (
                  <span key={cell.label} className="tod-ps-row__cell">
                    <em>{cell.label}</em>
                    <b>{cell.value}</b>
                  </span>
                ))}
              </span>
            ) : null}
            {row.status ? (
              <span className={`tod-ok-status tod-ok-status--${overlayTone(row.status)}`}>
                {row.status.replace(/_/g, ' ')}
              </span>
            ) : null}
            {row.trailing}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------- dial */

export function ProjectDial({ percent, label }: { percent: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const tone = clamped >= 90 ? 'ok' : clamped >= 50 ? 'warn' : 'blocked';
  return (
    <span className="tod-ps-dial" data-tone={tone}>
      <span
        className="tod-ps-dial__ring"
        style={{ ['--tod-ps-pct' as keyof CSSProperties]: clamped } as CSSProperties}
        role="img"
        aria-label={`${clamped}% ${label ?? 'complete'}`}
      >
        <b>{clamped}%</b>
      </span>
      {label ? <em>{label}</em> : null}
    </span>
  );
}

/* ------------------------------------------------------------------- panes */

/**
 * Wide-shell workbench: an optional left rail, a main column, an optional
 * inspector. On a tall shell the rail and inspector fall back into the flow
 * above and below the main column rather than disappearing, because their
 * content is the surface's navigation and detail, not decoration.
 */
export function ProjectPanes({
  rail,
  inspector,
  children,
}: {
  rail?: ReactNode;
  inspector?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="tod-ps-panes"
      data-rail={rail ? 'true' : 'false'}
      data-inspector={inspector ? 'true' : 'false'}
    >
      {rail ? <aside className="tod-ps-panes__rail">{rail}</aside> : null}
      <div className="tod-ps-panes__main">{children}</div>
      {inspector ? <aside className="tod-ps-panes__inspector">{inspector}</aside> : null}
    </div>
  );
}

export function ProjectRail({
  title,
  items,
  activeId,
  onPick,
  footer,
}: {
  title: string;
  items: Array<{ id: string; label: string; count?: number; src?: string | null }>;
  activeId?: string | null;
  onPick?: (id: string) => void;
  footer?: ReactNode;
}) {
  return (
    <nav className="tod-ps-rail" aria-label={title}>
      <span className="tod-ps-rail__title">{title}</span>
      <ul className="tod-ps-rail__list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="tod-ps-rail__item"
              data-active={activeId === item.id ? 'true' : 'false'}
              onClick={() => onPick?.(item.id)}
            >
              {item.src !== undefined ? (
                <span className="tod-ps-rail__shot">
                  {item.src ? <img src={item.src} alt="" loading="lazy" /> : null}
                </span>
              ) : null}
              <span className="tod-ps-rail__label">{item.label}</span>
              {typeof item.count === 'number' ? <em>{item.count}</em> : null}
            </button>
          </li>
        ))}
      </ul>
      {footer ? <div className="tod-ps-rail__footer">{footer}</div> : null}
    </nav>
  );
}

export function ProjectInspector({
  title,
  counter,
  onClose,
  children,
}: {
  title: string;
  counter?: string;
  onClose?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="tod-ps-inspector" aria-label={title}>
      <header className="tod-ps-inspector__head">
        <span>{title}</span>
        {counter ? <em>{counter}</em> : null}
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Close inspector">
            ✕
          </button>
        ) : null}
      </header>
      <div className="tod-ps-inspector__body">{children}</div>
    </section>
  );
}

/**
 * A preview slot that admits when it is empty. A bare black box reads as a
 * broken image; "NO CAPTURE" reads as work still to do, which is the truth
 * for most pages in a project that has not been through design yet.
 */
export function ProjectShot({
  src,
  alt,
  ratio = '16 / 10',
  empty = 'NO CAPTURE',
}: {
  src?: string | null;
  alt: string;
  ratio?: string;
  empty?: string;
}) {
  return (
    <span className="tod-ps-card__shot" style={{ aspectRatio: ratio }}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <span className="tod-ps-card__none">{empty}</span>
      )}
    </span>
  );
}

export function ProjectFacts({ entries }: { entries: Array<{ k: string; v: ReactNode }> }) {
  return (
    <dl className="tod-ps-facts">
      {entries.map((entry) => (
        <div key={entry.k}>
          <dt>{entry.k}</dt>
          <dd>{entry.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------------------------------------------------------------- modules */

export function ProjectBanner({
  eyebrow,
  title,
  lede,
  columns,
  mark,
  src,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  columns?: Array<{ label: string; lines: string[] }>;
  mark?: string;
  src?: string | null;
}) {
  return (
    <section className="tod-ps-banner">
      {src ? <img className="tod-ps-banner__bg" src={src} alt="" loading="lazy" /> : null}
      <div className="tod-ps-banner__lead">
        <span>{eyebrow}</span>
        <h3>{title}</h3>
        {lede ? <p>{lede}</p> : null}
      </div>
      {columns && columns.length > 0 ? (
        <div className="tod-ps-banner__cols">
          {columns.map((column) => (
            <div key={column.label}>
              <span>{column.label}</span>
              {column.lines.map((line) => (
                <em key={line}>{line}</em>
              ))}
            </div>
          ))}
        </div>
      ) : null}
      {mark ? <span className="tod-ps-banner__mark">{mark}</span> : null}
    </section>
  );
}

export function ProjectModules({ children }: { children: ReactNode }) {
  return <div className="tod-ps-modules">{children}</div>;
}

export function ProjectModule({
  icon,
  title,
  lede,
  onOpen,
  children,
  actions,
  span = 1,
}: {
  icon?: ReactNode;
  title: string;
  lede?: string;
  onOpen?: () => void;
  children?: ReactNode;
  actions?: ReactNode;
  span?: 1 | 2 | 3;
}) {
  return (
    <section className="tod-ps-module" data-span={span}>
      <header className="tod-ps-module__head">
        {icon ? <span className="tod-ps-module__icon">{icon}</span> : null}
        <span className="tod-ps-module__title">
          <strong>{title}</strong>
          {lede ? <em>{lede}</em> : null}
        </span>
        {onOpen ? (
          <button type="button" className="tod-ps-module__open" onClick={onOpen} aria-label={`Open ${title}`}>
            →
          </button>
        ) : null}
      </header>
      {children ? <div className="tod-ps-module__body">{children}</div> : null}
      {actions ? <div className="tod-ps-module__actions">{actions}</div> : null}
    </section>
  );
}

export function ProjectStats({
  entries,
  columns = 4,
}: {
  entries: Array<{ label: string; value: ReactNode; tone?: 'ok' | 'warn' | 'blocked' }>;
  columns?: 2 | 3 | 4 | 6;
}) {
  return (
    <div className="tod-ps-stats" style={{ ['--tod-ps-cols' as keyof CSSProperties]: columns } as CSSProperties}>
      {entries.map((entry) => (
        <div key={entry.label} className="tod-ps-stat" data-tone={entry.tone ?? 'plain'}>
          <strong>{entry.value}</strong>
          <span>{entry.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- action bar */

export function ProjectActionBar({
  actions,
}: {
  actions: Array<{ id: string; label: string; icon?: ReactNode; onClick?: () => void; disabled?: boolean }>;
}) {
  return (
    <footer className="tod-ps-actionbar">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className="tod-ps-actionbar__btn"
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.icon ? <span className="tod-ps-actionbar__icon">{action.icon}</span> : null}
          {action.label}
        </button>
      ))}
    </footer>
  );
}

/* --------------------------------------------------------------- timeline */

export type ProjectTimelineEntry = {
  id: string;
  when: string;
  time?: string;
  kind: string;
  title: string;
  detail?: string;
  actor?: string;
  tags?: string[];
  before?: string | null;
  after?: string | null;
  onOpen?: () => void;
};

export function ProjectTimeline({
  groups,
  emptyLabel = 'NO PROJECT HISTORY YET',
  emptyHint,
}: {
  groups: Array<{ id: string; label: string; count: number; entries: ProjectTimelineEntry[] }>;
  emptyLabel?: string;
  emptyHint?: string;
}) {
  if (groups.length === 0) {
    return (
      <div className="tod-ok-empty">
        <span className="tod-ok-empty__label">{emptyLabel}</span>
        {emptyHint ? <p className="tod-ok-empty__hint">{emptyHint}</p> : null}
      </div>
    );
  }

  return (
    <div className="tod-ps-timeline">
      {groups.map((group) => (
        <section key={group.id} className="tod-ps-timeline__group">
          <header className="tod-ps-timeline__day">
            <span>{group.label}</span>
            <em>{group.count}</em>
          </header>
          <ol className="tod-ps-timeline__list">
            {group.entries.map((entry) => (
              <li key={entry.id} className="tod-ps-event">
                <span className="tod-ps-event__when">
                  {entry.time ?? entry.when}
                  <i aria-hidden="true" />
                </span>
                <span className="tod-ps-event__kind" data-kind={entry.kind.toLowerCase()}>
                  {entry.kind}
                </span>
                <span className="tod-ps-event__body">
                  <strong>{entry.title}</strong>
                  {entry.detail ? <em>{entry.detail}</em> : null}
                  {entry.actor ? <b>By {entry.actor}</b> : null}
                  {entry.tags && entry.tags.length > 0 ? (
                    <span className="tod-ps-tags">
                      {entry.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </span>
                  ) : null}
                </span>
                {entry.before || entry.after ? (
                  <span className="tod-ps-event__shots">
                    {entry.before ? (
                      <span>
                        <img src={entry.before} alt="" loading="lazy" />
                        <em>BEFORE</em>
                      </span>
                    ) : null}
                    {entry.after ? (
                      <span>
                        <img src={entry.after} alt="" loading="lazy" />
                        <em>AFTER</em>
                      </span>
                    ) : null}
                  </span>
                ) : null}
                {entry.onOpen ? (
                  <button type="button" className="tod-ps-event__open" onClick={entry.onOpen}>
                    VIEW →
                  </button>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- activity */

/** 30-day contribution strip. Empty days are drawn, so gaps read as gaps. */
export function ProjectActivity({
  days,
  legend,
}: {
  days: Array<{ id: string; level: 0 | 1 | 2 | 3 }>;
  legend: Array<{ label: string; count: number; tone: string }>;
}) {
  return (
    <div className="tod-ps-activity">
      <div className="tod-ps-activity__grid" role="img" aria-label="Project activity, last 30 days">
        {days.map((day) => (
          <span key={day.id} data-level={day.level} />
        ))}
      </div>
      <ul className="tod-ps-activity__legend">
        {legend.map((item) => (
          <li key={item.label}>
            <i data-tone={item.tone} aria-hidden="true" />
            {item.label}
            <em>{item.count}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
