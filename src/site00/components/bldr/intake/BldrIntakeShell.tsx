import type { ReactNode } from 'react';
import { Site00MobileShell } from '../../mobile/Site00MobileShell';
import { Site00PageFooter } from '../../shell/Site00PageFooter';

type BldrIntakeShellProps = {
  breadcrumb: string;
  children: ReactNode;
};

export function BldrIntakeShell({ breadcrumb, children }: BldrIntakeShellProps) {
  return (
    <div className="site00-bldr-intake site00-bldr-intake--mobile">
      <Site00MobileShell showEnvironmentBackground={false} shellClassName="site00-bldr-intake-shell">
        <div className="site00-bldr-intake__content">
          <nav className="site00-bldr-intake__breadcrumb" aria-label="BREADCRUMB">
            {breadcrumb}
          </nav>
          {children}
          <Site00PageFooter />
        </div>
      </Site00MobileShell>
    </div>
  );
}
