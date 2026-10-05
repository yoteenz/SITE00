import type { ReactNode } from 'react';

type ControlPageHeaderProps = {
  kicker?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function ControlPageHeader({ kicker = '00 / CONTROL', title, subtitle, actions }: ControlPageHeaderProps) {
  return (
    <header className="site00-control-page-header">
      <div className="site00-control-page-header__copy">
        <p className="site00-control-page-header__kicker">{kicker}</p>
        <h1 className="site00-control-page-header__title">{title}</h1>
        {subtitle ? <p className="site00-control-page-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="site00-control-page-header__actions">{actions}</div> : null}
    </header>
  );
}
