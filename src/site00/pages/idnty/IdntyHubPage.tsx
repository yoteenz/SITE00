import { useLocation } from 'react-router-dom';
import { EcosystemShell } from '../../components/ecosystem/EcosystemShell';
import { HubTile, HubTileGrid, PublicHubPage } from '../../components/public-redesign/PublicHubLayouts';
import { PublicLineIcon } from '../../components/public-redesign/PublicLineIcon';
import { IdntyControlCenterExperience } from '../../components/idnty/control-center/IdntyControlCenterExperience';
import { SITE00_ROUTES } from '../../config/routes';
import { appendIdentityCommercialQuery } from '../../lib/identityCommercialContext';
import { site00SignInHrefWithReturnTo } from '../../config/mobile-directory-nav';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';

function IdntySignedOutGateway() {
  const location = useLocation();
  const signInHref = site00SignInHrefWithReturnTo(location);
  const createHref = appendIdentityCommercialQuery(SITE00_ROUTES.idntyState, {
    serviceId: 'services-hub-branding',
    packageId: 'services-hub-branding',
    commercialMode: 'CUSTOM_QUOTE',
  });

  return (
    <PublicHubPage
      section="idnty"
      page="idnty-gateway"
      envSlotId="ENV.IDNTY.ATRIUM"
      crumb="LOCATION / IDNTY / 00"
      title="IDNTY"
      subtitle="ACCESS THE SYSTEM. YOUR WORK STARTS HERE."
      body="SIGN IN TO CONTINUE, OR CREATE YOUR IDNTY AND JOIN SITE 00."
      width="narrow"
    >
      <HubTileGrid columns={2}>
        <HubTile
          code="01"
          title="SIGN IN"
          description="ACCESS YOUR ACCOUNT."
          cta="SIGN IN →"
          to={signInHref}
          icon={<PublicLineIcon id="people" size={26} />}
        />
        <HubTile
          code="02"
          title="CREATE IDNTY"
          description="CREATE YOUR IDNTY. JOIN SITE 00."
          cta="GET STARTED →"
          to={createHref}
          icon={<PublicLineIcon id="diamond" size={26} />}
        />
      </HubTileGrid>
    </PublicHubPage>
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
