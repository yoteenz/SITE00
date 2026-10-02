import { HubPanel, HubTile, HubTileGrid, PublicHubPage } from '../components/public-redesign/PublicHubLayouts';
import { SITE00_SERVICES_SEED } from '../config/seed/site00-page-seed';
import { SITE00_ROUTES } from '../config/routes';

export default function ServicesPage() {
  return (
    <PublicHubPage section="idnty" page="services" crumb="LOCATION / SERVICES" title="SERVICES" subtitle="WHAT WE BUILD." width="wide">
      <HubTileGrid columns={3}>
        {SITE00_SERVICES_SEED.map((service, index) => (
          <div key={service.id} id={service.id} className="s00pr-hubanchor">
            <HubTile code={String(index + 1).padStart(2, '0')} title={service.title} description={service.description} cta={service.cta} to={service.href} />
          </div>
        ))}
      </HubTileGrid>
      <HubPanel label="NEED SOMETHING ELSE?">
        <p>TALK TO THE SITE 00 TEAM.</p>
        <a href={SITE00_ROUTES.support}>CONTACT SUPPORT →</a>
      </HubPanel>
    </PublicHubPage>
  );
}
