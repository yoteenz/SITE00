import type { ReactNode } from 'react';
import { ControlPageHeader } from '../control/ControlPageHeader';
import { Site00AdminShell } from '../shell/Site00AdminShell';
import { ProjectSwitcher } from '../orchestration/ProjectSwitcher';
import { EvolveOrgBreadcrumb, EvolveOrgNav } from './EvolveOrgNav';

type EvolveOrgShellProps = {
  orgSlug: string;
  orgName: string;
  activeNav: Parameters<typeof EvolveOrgNav>[0]['active'];
  title?: string;
  subtitle?: string;
  organizations: Array<{ slug: string; name: string }>;
  actions?: ReactNode;
  children: ReactNode;
};

export function EvolveOrgShell({
  orgSlug,
  orgName,
  activeNav,
  title,
  subtitle = 'Marketing operations workspace',
  organizations,
  actions,
  children,
}: EvolveOrgShellProps) {
  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="00 / EVOLVE"
        title={title ?? orgName}
        subtitle={subtitle}
        actions={
          actions ?? <ProjectSwitcher organizations={organizations} selected={orgSlug} subRoute="evolve" />
        }
      />
      <EvolveOrgBreadcrumb />
      <EvolveOrgNav active={activeNav} />
      {children}
    </Site00AdminShell>
  );
}
