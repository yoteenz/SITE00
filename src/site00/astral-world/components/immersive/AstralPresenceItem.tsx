import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AstralPortrait } from './AstralPortrait';
import { AstralStatusChip } from './AstralStatusChip';

type StatusKind = 'joinable' | 'reading' | 'available' | 'live';

function statusKind(label: string): StatusKind {
  const lower = label.toLowerCase();
  if (lower.includes('join')) return 'joinable';
  if (lower.includes('read') || lower.includes('busy')) return 'reading';
  if (lower.includes('live') || lower.includes('online')) return 'live';
  return 'available';
}

type AstralPresenceItemProps = {
  personId: string;
  name: string;
  initials?: string;
  subtitle?: string;
  status?: string;
  action?: ReactNode;
  actionTo?: string;
  actionLabel?: string;
  showPresence?: boolean;
};

export function AstralPresenceItem({
  personId,
  name,
  initials,
  subtitle,
  status,
  action,
  actionTo,
  actionLabel,
  showPresence = true,
}: AstralPresenceItemProps) {
  return (
    <div className="aw-presence-item aw-presence-item--immersive">
      <AstralPortrait personId={personId} name={name} initials={initials} size={44} showPresence={showPresence} />
      <div className="aw-presence-item__body">
        <strong>{name}</strong>
        {subtitle ? <div className="aw-muted">{subtitle}</div> : null}
      </div>
      {status ? <AstralStatusChip label={status} kind={statusKind(status)} /> : null}
      {action}
      {actionTo && actionLabel ? (
        <Link to={actionTo} className="aw-btn-primary aw-presence-item__cta">{actionLabel}</Link>
      ) : null}
    </div>
  );
}
