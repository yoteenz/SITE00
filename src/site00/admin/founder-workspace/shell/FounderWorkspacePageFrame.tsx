import type { ReactNode } from 'react';
import { FOUNDER_WORKSPACE_SIDEBAR_NAV } from '../config/navigation';
import { FounderWorkspaceShell } from './FounderWorkspaceShell';

const SUBTITLES: Record<string, string> = {
  overview: 'COMMAND CENTER · REAL FOUNDATION METRICS',
  foundations: 'CLIENT REGISTRY · INTAKE · QUOTES',
  reviews: 'APPROVAL QUEUE · QUOTE DECISIONS',
  operations: 'RUNBOOK · TASKS · VERIFICATION',
  correspondence: 'MESSAGES · SEND POLICY · STUDIO LINK',
  referrals: 'PARTNERS · ATTRIBUTION · COMMISSIONS · PAYOUTS',
  system: 'DIAGNOSTICS · TEST LAB · READINESS',
};

type Destination = keyof typeof SUBTITLES;

type Props = {
  destination: Destination;
  children: ReactNode;
  /** Display headline; defaults to the destination name (authority: index rail + headline + red period). */
  title?: string;
  subtitle?: ReactNode;
  /** Header actions (hidden on phones when `hideActionsOnPhone`). */
  actions?: ReactNode;
  hideActionsOnPhone?: boolean;
  /** Decorative architecture object in the header (absolute, aria-hidden). */
  arch?: ReactNode;
  /** Extra breadcrumb parts after the destination (record name, section). */
  crumb?: string[];
  density?: 'relaxed' | 'standard' | 'compact';
};

/** Page header (ws-phead) + page body (ws-page) inside the shared shell. */
export function FounderWorkspacePageFrame({ destination, children, title, subtitle, actions, hideActionsOnPhone = false, arch, crumb = [], density = 'standard' }: Props) {
  const nav = FOUNDER_WORKSPACE_SIDEBAR_NAV.find((n) => n.id === destination) ?? FOUNDER_WORKSPACE_SIDEBAR_NAV[0];
  const name = nav.label.toUpperCase();
  return (
    <FounderWorkspaceShell crumb={[name, ...crumb]} density={density}>
      <div className="ws-page">
        <header className={`ws-phead ${hideActionsOnPhone ? 'ws-phead--m-hide-acts' : ''}`.trim()}>
          {arch ? (
            <span className="ws-arch" aria-hidden="true" style={{ right: 0, top: 6, width: 60, height: 104, opacity: 0.9 }}>
              {arch}
            </span>
          ) : null}
          <div>
            <div className="ws-phead__rail">
              <b>{nav.ordinal}</b>
              <span />
            </div>
            <h1 className="ws-title">
              {(title ?? name).toUpperCase()}
              <i aria-hidden="true" />
            </h1>
            <div className="ws-meta ws-phead__sub">{subtitle ?? SUBTITLES[destination]}</div>
          </div>
          {actions ? <div className="ws-phead__acts">{actions}</div> : null}
        </header>
        {children}
      </div>
    </FounderWorkspaceShell>
  );
}
