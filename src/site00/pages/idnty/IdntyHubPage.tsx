import { useLocation } from 'react-router-dom';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { EcosystemShell } from '../../components/ecosystem/EcosystemShell';
import { IdntyGatewayHubIcon } from '../../components/idnty/IdntyGatewayHubIcon';
import { IdntyControlCenterExperience } from '../../components/idnty/control-center/IdntyControlCenterExperience';
import { BracketHeading, EcosystemHubHero, HubActionCard } from '../../components/pages/Site00PagePrimitives';
import { SITE00_ROUTES } from '../../config/routes';
import { site00SignInHrefWithReturnTo } from '../../config/mobile-directory-nav';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';

function IdntySignedOutGateway() {
  const location = useLocation();
  const signInHref = site00SignInHrefWithReturnTo(location);
  const createHref = `/sign-in?returnTo=${encodeURIComponent(SITE00_ROUTES.control)}`;

  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--idnty-gateway">
        <EcosystemHubHero
          panel="idnty"
          title={<BracketHeading>IDNTY</BracketHeading>}
          subtitle="ACCESS THE SYSTEM. YOUR WORK STARTS HERE."
        />

        <div className="site00-idnty-gateway__actions">
          <HubActionCard
            title="SIGN IN"
            description="ACCESS YOUR ACCOUNT."
            cta="SIGN IN →"
            href={signInHref}
            icon={<IdntyGatewayHubIcon variant="sign-in" />}
          />
          <HubActionCard
            title="CREATE IDNTY"
            description="CREATE YOUR IDNTY. JOIN SITE 00."
            cta="GET STARTED →"
            href={createHref}
            icon={<IdntyGatewayHubIcon variant="create-idnty" />}
          />
        </div>
      </div>
    </Site00PublicShell>
  );
}

function IdntySignedInProfile() {
  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-page site00-page--idnty-control-center">
        <IdntyControlCenterExperience />
      </div>
    </EcosystemShell>
  );
}

export default function IdntyHubPage() {
  const [isSignedIn] = useSignedInFromStorage();
  if (isSignedIn) return <IdntySignedInProfile />;
  return <IdntySignedOutGateway />;
}
