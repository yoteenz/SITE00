import type { ReactNode } from 'react';
import { EcosystemShell } from '../ecosystem/EcosystemShell';

type StudioShellProps = {
  children: ReactNode;
};

export function StudioShell({ children }: StudioShellProps) {
  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-studio-shell">
        <div className="site00-studio-shell__mobile">{children}</div>
        <div className="site00-studio-shell__desktop">{children}</div>
      </div>
    </EcosystemShell>
  );
}
