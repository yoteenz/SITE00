import { useLocation } from 'react-router-dom';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { EcosystemShell } from '../../components/ecosystem/EcosystemShell';
import { BracketHeading, HubActionCard, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { SITE00_IDNTY_HUB_MODULES } from '../../config/seed/site00-page-seed';
import { SITE00_ROUTES } from '../../config/routes';
import { site00SignInHrefWithReturnTo } from '../../config/mobile-directory-nav';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import {
  Site00BellIcon,
  Site00KeyIcon,
  Site00LockIcon,
  Site00MonitorIcon,
  Site00ShieldIcon,
  Site00TokenIcon,
  Site00TrashIcon,
  Site00UserIcon,
} from '../../icons/Site00HubIcons';

const ICONS: Record<string, typeof Site00LockIcon> = {
  security: Site00LockIcon,
  profile: Site00UserIcon,
  'api-keys': Site00KeyIcon,
  sessions: Site00MonitorIcon,
  notifications: Site00BellIcon,
  privacy: Site00ShieldIcon,
  tokens: Site00TokenIcon,
  delete: Site00TrashIcon,
};

function IdntySignedOutGateway() {
  const location = useLocation();
  const signInHref = site00SignInHrefWithReturnTo(location);
  const createHref = `/sign-in?returnTo=${encodeURIComponent(SITE00_ROUTES.control)}`;

  return (
    <Site00PublicShell mobileActiveNav="origin">
      <div className="site00-page site00-page--idnty-gateway">
        <div className="site00-idnty-gateway__hero">
          <PageIntro
            title={<BracketHeading>IDNTY</BracketHeading>}
            subtitle="ACCESS THE SYSTEM. YOUR WORK STARTS HERE."
          />
          <div className="site00-idnty-gateway__crosshair" aria-hidden="true" />
        </div>

        <div className="site00-idnty-gateway__actions">
          <HubActionCard
            title="SIGN IN"
            description="ACCESS YOUR ACCOUNT."
            cta="SIGN IN →"
            href={signInHref}
            icon={<Site00UserIcon size={24} />}
          />
          <HubActionCard
            title="CREATE IDNTY"
            description="CREATE YOUR IDNTY. JOIN SITE 00."
            cta="GET STARTED →"
            href={createHref}
            icon={<Site00KeyIcon size={24} />}
          />
        </div>
      </div>
    </Site00PublicShell>
  );
}

function IdntySignedInProfile() {
  return (
    <EcosystemShell title="IDNTY" subtitle="CONTROL YOUR ACCESS. PROTECT WHAT MATTERS.">
      <div className="site00-page site00-page--idnty-hub">
        <div className="site00-idnty-hub__rows">
          {SITE00_IDNTY_HUB_MODULES.map((mod) => {
            const Icon = ICONS[mod.id] ?? Site00LockIcon;
            return (
              <HubActionCard
                key={mod.id}
                title={mod.title}
                href={mod.href}
                cta="MANAGE →"
                icon={<Icon size={22} />}
                destructive={'destructive' in mod && mod.destructive}
              />
            );
          })}
        </div>
      </div>
    </EcosystemShell>
  );
}

export default function IdntyHubPage() {
  const [isSignedIn] = useSignedInFromStorage();
  if (isSignedIn) return <IdntySignedInProfile />;
  return <IdntySignedOutGateway />;
}
