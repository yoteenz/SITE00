import { HubCta, HubPanel, HubSteps, PublicHubPage } from '../../components/public-redesign/PublicHubLayouts';
import { BLDR_HUB_STAGES } from '../../config/bldr-hub-stages';
import { SITE00_ROUTES } from '../../config/routes';

export default function BldrHubPage() {
  return (
    <PublicHubPage
      section="bldr"
      page="bldr-hub"
      envSlotId="ENV.BLDR.COMMAND_CENTER"
      crumb="LOCATION / BLDR / 00"
      title="BLDR"
      subtitle="START YOUR BUILD. WE'LL GUIDE YOU FROM IDEA TO LAUNCH."
      width="wide"
    >
      <div className="s00pr-hubsplit">
        <HubSteps
          label="BUILD PROCESS"
          items={BLDR_HUB_STAGES.map((stage) => ({ num: stage.num, micro: stage.microLabel, title: stage.title, body: stage.body }))}
        />
        <HubPanel label="READY TO BEGIN?" className="s00pr-hubsplit__cta">
          <p>START YOUR BUILD INTAKE AND ENTER THE SITE 00 BUILD FLOW.</p>
          <div className="s00pr-hubactions">
            <HubCta to={SITE00_ROUTES.bldrStart} variant="solid">
              START BUILDING
            </HubCta>
            <HubCta to={SITE00_ROUTES.bldrState}>BUILDER COMMAND CENTER</HubCta>
          </div>
        </HubPanel>
      </div>
    </PublicHubPage>
  );
}
