import type { ReactNode } from 'react';
import { HubLegacySkin, PublicHubPage } from '../../public-redesign/PublicHubLayouts';

type BldrIntakeShellProps = {
  breadcrumb: string;
  children: ReactNode;
};

/** BLDR intake frame — public-redesign shell; intake panels/forms inside are unchanged. */
export function BldrIntakeShell({ breadcrumb, children }: BldrIntakeShellProps) {
  const parts = breadcrumb.split(' / ');
  const named = parts.filter((part) => !/^\d+$/.test(part));
  const title = named[named.length - 1] ?? parts[0]!;
  return (
    <PublicHubPage
      section="bldr"
      page="bldr-intake"
      envSlotId="ENV.BLDR.COMMAND_CENTER"
      crumb={breadcrumb}
      title={title}
      width="default"
    >
      <HubLegacySkin kind="intake">{children}</HubLegacySkin>
    </PublicHubPage>
  );
}
