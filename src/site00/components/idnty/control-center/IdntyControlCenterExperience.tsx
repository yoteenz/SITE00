import { IDNTY_CONTROL_CENTER_GROUPS } from '../../../config/idnty-control-center';
import { useIdntyControlCenterMeta } from '../../../hooks/useIdntyControlCenterMeta';
import { Site00LockIcon, Site00ShieldIcon, Site00UserIcon } from '../../../icons/Site00HubIcons';
import { IdntyControlCenterHero } from './IdntyControlCenterHero';
import { IdntyCredentialModule } from './IdntyCredentialModule';
import { IdntySystemStatusRail } from './IdntySystemStatusRail';
import { IdntyControlGroup } from './IdntyControlGroup';

const GROUP_HEADER_ICONS = {
  'access-control': <Site00LockIcon size={16} />,
  'identity-preferences': <Site00UserIcon size={16} />,
  'account-protocols': <Site00ShieldIcon size={16} />,
} as const;

export function IdntyControlCenterExperience() {
  const meta = useIdntyControlCenterMeta();

  return (
    <div className="site00-idnty-control-center">
      <IdntyControlCenterHero />
      <IdntyCredentialModule
        displayName={meta.displayName}
        initials={meta.initials}
        credentialStatuses={meta.credentialStatuses}
        accountReference={meta.accountReference}
        memberSince={meta.memberSince}
      />
      <IdntySystemStatusRail items={meta.systemStatus} />
      <div className="site00-idnty-control-center__groups">
        {IDNTY_CONTROL_CENTER_GROUPS.map((group) => (
          <IdntyControlGroup
            key={group.id}
            group={group}
            rowStatus={meta.rowStatus}
            headerIcon={GROUP_HEADER_ICONS[group.id]}
          />
        ))}
      </div>
    </div>
  );
}
