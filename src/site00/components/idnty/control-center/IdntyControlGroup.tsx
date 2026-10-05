import type { ReactNode } from 'react';
import type { IdntyControlGroupConfig, IdntyControlRowId } from '../../../config/idnty-control-center';
import type { IdntyControlRowStatus } from '../../../hooks/useIdntyControlCenterMeta';
import {
  Site00BellIcon,
  Site00KeyIcon,
  Site00LockIcon,
  Site00MonitorIcon,
  Site00ShieldIcon,
  Site00TokenIcon,
  Site00TrashIcon,
  Site00UserIcon,
} from '../../../icons/Site00HubIcons';
import { AccountControlRow } from './AccountControlRow';

const ROW_ICONS: Record<IdntyControlRowId, typeof Site00LockIcon> = {
  security: Site00LockIcon,
  sessions: Site00MonitorIcon,
  'api-keys': Site00KeyIcon,
  tokens: Site00TokenIcon,
  profile: Site00UserIcon,
  notifications: Site00BellIcon,
  privacy: Site00ShieldIcon,
  delete: Site00TrashIcon,
};

type IdntyControlGroupProps = {
  group: IdntyControlGroupConfig;
  rowStatus: Partial<Record<IdntyControlRowId, IdntyControlRowStatus>>;
  headerIcon?: ReactNode;
};

export function IdntyControlGroup({ group, rowStatus, headerIcon }: IdntyControlGroupProps) {
  const groupClass = [
    'site00-idnty-control-group',
    group.variant === 'destructive' ? 'site00-idnty-control-group--destructive' : '',
    group.id === 'identity-preferences' ? 'site00-idnty-control-group--quiet' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={groupClass} aria-labelledby={`idnty-control-${group.id}`}>
      <header className="site00-idnty-control-group__header">
        <div className="site00-idnty-control-group__header-copy">
          <h2 id={`idnty-control-${group.id}`} className="site00-idnty-control-group__title">
            {group.title}
          </h2>
          <p className="site00-idnty-control-group__micro">{group.microLabel}</p>
        </div>
        {headerIcon ? <div className="site00-idnty-control-group__header-icon">{headerIcon}</div> : null}
      </header>
      <div className="site00-idnty-control-group__module">
        {group.rows.map((row) => {
          const Icon = ROW_ICONS[row.iconKey] ?? Site00LockIcon;
          return (
            <AccountControlRow
              key={row.id}
              index={row.index}
              title={row.title}
              description={row.description}
              href={row.href}
              icon={<Icon size={18} />}
              status={rowStatus[row.id]}
              destructive={row.destructive}
            />
          );
        })}
      </div>
    </section>
  );
}
