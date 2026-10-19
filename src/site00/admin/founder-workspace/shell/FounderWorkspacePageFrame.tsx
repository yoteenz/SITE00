import type { ReactNode } from 'react';
import { FounderWorkspaceShell } from './FounderWorkspaceShell';

const TITLES: Record<string, { title: string; subtitle?: string }> = {
  overview: { title: 'Overview', subtitle: 'Command center · real foundation metrics' },
  foundations: { title: 'Foundations', subtitle: 'Client registry · intake · quotes' },
  reviews: { title: 'Reviews', subtitle: 'Approval queue · quote decisions' },
  operations: { title: 'Operations', subtitle: 'Runbook · tasks · verification' },
  correspondence: { title: 'Correspondence', subtitle: 'Messages · send policy · studio link' },
  referrals: { title: 'Referrals', subtitle: 'Partners · attribution · card studio' },
  system: { title: 'System', subtitle: 'Diagnostics · test lab · readiness' },
};

type Props = {
  destination: keyof typeof TITLES;
  children: ReactNode;
};

export function FounderWorkspacePageFrame({ destination, children }: Props) {
  const meta = TITLES[destination] ?? TITLES.overview;
  return (
    <FounderWorkspaceShell pageTitle={meta.title} pageSubtitle={meta.subtitle}>
      {children}
    </FounderWorkspaceShell>
  );
}
