import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AssetSlot } from './AssetSlot';
import { PublicRedesignShell, type PublicRedesignSection } from './PublicRedesignShell';
import { SpatialEnvironmentFrame } from './SpatialEnvironmentFrame';

/**
 * PUBLIC HUB FAMILY — the page frame + primitives shared by every legacy hub that is now inside the public redesign
 * (IDNTY gateway, BLDR / EVOLVE hubs, ENTER, SITES / SERVICES / SYSTEM / ABOUT / JOURNAL / SUPPORT, auth, CTRL ROOM,
 * MY SITES, downstream assessment / intake). Structure only: plates are named slots (AssetSlot), never UI copy.
 * Family authority: Origin / IDNTY state hub / Builder Command Center / Evolve Intervention Center (hero rhythm,
 * glass panels, red rule, pill CTAs). Mobile is the primary composition; ≥ 900px reveals a second column.
 */

export function HubArrow({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 12" width={size} height={size * 0.6} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 6h17M13 1l5 5-5 5" />
    </svg>
  );
}

type PublicHubPageProps = {
  section: PublicRedesignSection;
  /** Page-type hook for QA / CSS (`data-hub-page`). */
  page: string;
  /** Environment plate slot (reuses the section's existing plate; never a new image). */
  envSlotId?: string;
  tone?: 'atrium' | 'daylight' | 'arch';
  crumb: string;
  title: ReactNode;
  /** Red declaration line under the rule. */
  subtitle?: ReactNode;
  body?: ReactNode;
  /** Right-hand hero aside on wide screens (e.g. a compact stat or machine). */
  heroAside?: ReactNode;
  children: ReactNode;
  className?: string;
  hideBottomNav?: boolean;
  headerVariant?: 'technical' | 'wordmark' | 'directory';
  /** Content width: `narrow` for forms, `wide` for index/grid pages. */
  width?: 'narrow' | 'default' | 'wide';
};

const DEFAULT_ENV: Record<PublicRedesignSection, string> = {
  origin: 'ENV.ORIGIN.COLLAPSED',
  idnty: 'ENV.IDNTY.ATRIUM',
  bldr: 'ENV.BLDR.COMMAND_CENTER',
  evolve: 'ENV.EVOLVE.INTERVENTION_CENTER',
  locations: 'ENV.LOCATIONS.ARCH',
};

export function PublicHubPage({
  section,
  page,
  envSlotId,
  tone = 'atrium',
  crumb,
  title,
  subtitle,
  body,
  heroAside,
  children,
  className = '',
  hideBottomNav,
  headerVariant,
  width = 'default',
}: PublicHubPageProps) {
  return (
    <PublicRedesignShell
      section={section}
      headerVariant={headerVariant}
      hideBottomNav={hideBottomNav}
      className={`s00pr-shell--hub ${className}`.trim()}
      environment={<SpatialEnvironmentFrame slotId={envSlotId ?? DEFAULT_ENV[section]} tone={tone} />}
    >
      <div className={`s00pr-hub s00pr-hub--${width}`} data-hub-page={page}>
        <header className={`s00pr-hubhero${heroAside ? ' s00pr-hubhero--aside' : ''}`}>
          <div className="s00pr-hubhero__copy">
            <p className="s00pr-idhero__crumb">{crumb}</p>
            <h1 className="s00pr-hubhero__title">{title}</h1>
            <span className="s00pr-idhero__rule" aria-hidden="true" />
            {subtitle ? <p className="s00pr-hubhero__sub">{subtitle}</p> : null}
            {body ? <p className="s00pr-hubhero__body">{body}</p> : null}
          </div>
          {heroAside ? <div className="s00pr-hubhero__aside">{heroAside}</div> : null}
        </header>
        <div className="s00pr-hub__body">{children}</div>
      </div>
    </PublicRedesignShell>
  );
}

/* ---------------------------------------------------------------- primitives */

/** Pill CTA used on every hub: label + red go-circle. Link when `to`, anchor when `href`, button otherwise. */
export function HubCta({
  to,
  href,
  onClick,
  children,
  variant = 'outline',
  disabled,
  type = 'button',
}: {
  to?: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: 'outline' | 'solid';
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const cls = `s00pr-hubcta s00pr-hubcta--${variant}`;
  const inner = (
    <>
      <span>{children}</span>
      <i className="s00pr-hubcta__go" aria-hidden="true">
        <HubArrow size={14} />
      </i>
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  );
}

type HubTileProps = {
  code?: string;
  title: string;
  description?: string;
  cta?: string;
  to?: string;
  href?: string;
  onClick?: () => void;
  /** Existing line-icon / glyph (live SVG) shown in the tile head. */
  icon?: ReactNode;
  /** Declared asset slot for future art (slot only — no image is generated here). */
  slotId?: string;
  muted?: boolean;
  badge?: ReactNode;
};

/** Glass tile: code, title, description, pill CTA. The whole tile is the link. */
export function HubTile({ code, title, description, cta, to, href, onClick, icon, slotId, muted, badge }: HubTileProps) {
  const content = (
    <>
      <span className="s00pr-hubtile__corner" aria-hidden="true" />
      <span className="s00pr-hubtile__head">
        {code ? <b className="s00pr-hubtile__code">{code}</b> : null}
        {icon ? <i className="s00pr-hubtile__icon">{icon}</i> : null}
        {badge ? <em className="s00pr-hubtile__badge">{badge}</em> : null}
      </span>
      {slotId ? <AssetSlot slotId={slotId} className="s00pr-hubtile__slot" /> : null}
      <strong className="s00pr-hubtile__title">{title}</strong>
      {description ? <span className="s00pr-hubtile__desc">{description}</span> : null}
      {cta ? (
        <span className="s00pr-hubtile__cta">
          <span>{cta.replace(/\s*[→›]\s*$/, '')}</span>
          <i className="s00pr-hubcta__go" aria-hidden="true">
            <HubArrow size={14} />
          </i>
        </span>
      ) : null}
    </>
  );
  const cls = `s00pr-hubtile${muted ? ' is-muted' : ''}`;
  if (to) {
    return (
      <Link to={to} className={cls}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls}>
        {content}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick}>
        {content}
      </button>
    );
  }
  return <div className={cls}>{content}</div>;
}

export function HubTileGrid({ children, columns = 2, id }: { children: ReactNode; columns?: 1 | 2 | 3; id?: string }) {
  return (
    <div className={`s00pr-hubgrid s00pr-hubgrid--${columns}`} id={id}>
      {children}
    </div>
  );
}

/** Glass panel with a small red technical label. */
export function HubPanel({ label, children, className = '', id }: { label?: string; children: ReactNode; className?: string; id?: string }) {
  return (
    <section className={`s00pr-hubpanel ${className}`.trim()} id={id}>
      {label ? <h2 className="s00pr-hubpanel__label">{label}</h2> : null}
      {children}
    </section>
  );
}

/** Numbered process / layer list (BLDR stages, SYSTEM layers). */
export function HubSteps({ items, label }: { items: readonly { num: string; title: string; body: string; micro?: string }[]; label: string }) {
  return (
    <ol className="s00pr-hubsteps" aria-label={label}>
      {items.map((item) => (
        <li key={item.num + item.title} className="s00pr-hubsteps__item">
          <span className="s00pr-hubsteps__num">{item.num}</span>
          <div>
            {item.micro ? <small className="s00pr-hubsteps__micro">{item.micro}</small> : null}
            <h3 className="s00pr-hubsteps__title">{item.title}</h3>
            <p className="s00pr-hubsteps__body">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function HubTabs({
  tabs,
  active,
  onChange,
  label,
}: {
  tabs: readonly { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div className="s00pr-hubtabs" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button key={tab.id} type="button" role="tab" aria-selected={active === tab.id} className={active === tab.id ? 'is-on' : ''} onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function HubSearch({ value, onChange, placeholder, id }: { value: string; onChange: (v: string) => void; placeholder: string; id: string }) {
  return (
    <div className="s00pr-hubsearch">
      <label htmlFor={id} className="s00pr-sr">
        {placeholder}
      </label>
      <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="5.5" />
        <path d="m13 13 4 4" />
      </svg>
      <input id={id} type="search" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} autoComplete="off" />
    </div>
  );
}

export function HubEmpty({ title, body }: { title: string; body: string }) {
  return (
    <div className="s00pr-hubempty" role="status">
      <span className="s00pr-hubempty__mark" aria-hidden="true" />
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

/**
 * Legacy-content skin: wraps functional components that are not rebuilt here (assessment forms, auth forms,
 * CTRL ROOM modules, project index) so their inner markup inherits the public-redesign material. Never changes data.
 */
export function HubLegacySkin({ children, kind, className = '' }: { children: ReactNode; kind: string; className?: string }) {
  return (
    <div className={`s00pr-legacy s00pr-legacy--${kind} ${className}`.trim()} data-legacy-skin={kind}>
      {children}
    </div>
  );
}
