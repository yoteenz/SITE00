import { site00UserDisplayName, site00UserInitials, useSite00CurrentUser } from '../../hooks/useSite00CurrentUser';

type EcosystemPageHeaderProps = {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
};

export function EcosystemPageHeader({ title, subtitle, actions }: EcosystemPageHeaderProps) {
  const user = useSite00CurrentUser();
  const displayName = site00UserDisplayName(user);
  const initials = site00UserInitials(user);

  return (
    <header className="site00-ecosystem-header">
      <div className="site00-ecosystem-header__titles">
        <h1 className="site00-ecosystem-header__title">
          <span className="site00-ecosystem-header__bracket">[</span> {title}{' '}
          <span className="site00-ecosystem-header__bracket">]</span>
        </h1>
        <p className="site00-ecosystem-header__subtitle">{subtitle}</p>
      </div>
      <div className="site00-ecosystem-header__actions">
        {actions}
        <div className="site00-ecosystem-header__profile">
          {displayName ? <span className="site00-ecosystem-header__name">{displayName}</span> : null}
          <span className="site00-ecosystem-header__avatar" aria-hidden="true">
            {initials || '—'}
          </span>
        </div>
      </div>
    </header>
  );
}
