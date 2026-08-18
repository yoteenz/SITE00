import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type BracketHeadingProps = {
  children: ReactNode;
  as?: 'h1' | 'h2';
  className?: string;
};

export function BracketHeading({ children, as: Tag = 'h1', className = '' }: BracketHeadingProps) {
  return (
    <Tag className={`site00-bracket-heading ${className}`.trim()}>
      <span className="site00-bracket-heading__bracket" aria-hidden="true">
        [
      </span>{' '}
      {children}{' '}
      <span className="site00-bracket-heading__bracket" aria-hidden="true">
        ]
      </span>
    </Tag>
  );
}

type PageIntroProps = {
  title: ReactNode;
  subtitle?: string;
  body?: string;
};

export function PageIntro({ title, subtitle, body }: PageIntroProps) {
  return (
    <header className="site00-page-intro">
      {title}
      {subtitle ? <p className="site00-page-intro__subtitle">{subtitle}</p> : null}
      {body ? <p className="site00-page-intro__body">{body}</p> : null}
    </header>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: ReactNode;
};

export function MetricCard({ label, value, hint, actionLabel, actionHref, icon }: MetricCardProps) {
  return (
    <article className="site00-metric-card">
      <div className="site00-metric-card__head">
        <p className="site00-metric-card__label">{label}</p>
        {icon ? <div className="site00-metric-card__icon">{icon}</div> : null}
      </div>
      <p className="site00-metric-card__value">{value}</p>
      {hint ? <p className="site00-metric-card__hint">{hint}</p> : null}
      {actionLabel && actionHref ? (
        <Link to={actionHref} className="site00-metric-card__action">
          {actionLabel}
        </Link>
      ) : null}
    </article>
  );
}

type HubActionCardProps = {
  title: string;
  description?: string;
  cta?: string;
  href: string;
  icon?: ReactNode;
  destructive?: boolean;
  onClick?: () => void;
};

export function HubActionCard({ title, description, cta, href, icon, destructive, onClick }: HubActionCardProps) {
  const className = `site00-hub-card ${destructive ? 'site00-hub-card--destructive' : ''}`.trim();
  const content = (
    <>
      {icon ? <div className="site00-hub-card__icon">{icon}</div> : null}
      <div className="site00-hub-card__copy">
        <h3 className="site00-hub-card__title">{title}</h3>
        {description ? <p className="site00-hub-card__desc">{description}</p> : null}
        {cta ? <span className="site00-hub-card__cta">{cta}</span> : null}
      </div>
      <span className="site00-hub-card__chev" aria-hidden="true">
        ›
      </span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <Link to={href} className={className}>
      {content}
    </Link>
  );
}

type StatusBadgeProps = {
  status: string;
  tone?: 'published' | 'draft' | 'progress' | 'archived' | 'open' | 'operational';
};

export function StatusBadge({ status, tone = 'draft' }: StatusBadgeProps) {
  return <span className={`site00-status-badge site00-status-badge--${tone}`.trim()}>{status}</span>;
}

type FilterTabsProps = {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
};

export function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div className="site00-filter-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`site00-filter-tabs__tab ${active === tab.id ? 'site00-filter-tabs__tab--active' : ''}`.trim()}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="site00-empty-state">
      <p className="site00-empty-state__title">{title}</p>
      {body ? <p className="site00-empty-state__body">{body}</p> : null}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  id = 'site00-search',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  id?: string;
}) {
  return (
    <label className="site00-search-field" htmlFor={id}>
      <span className="site00-search-field__icon" aria-hidden="true">
        ⌕
      </span>
      <input
        id={id}
        type="search"
        className="site00-search-field__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
