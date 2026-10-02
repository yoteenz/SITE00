import { HubPanel, HubTile, HubTileGrid, PublicHubPage } from '../components/public-redesign/PublicHubLayouts';
import { SITE00_ROUTES } from '../config/routes';

const PRINCIPLES = [
  { title: 'BUILT FOR BUILDERS', description: 'TOOLS AND INFRASTRUCTURE DESIGNED FOR CREATORS WHO SHIP.' },
  { title: 'PRIVACY FIRST', description: 'YOUR DATA AND PROJECTS REMAIN UNDER YOUR CONTROL.' },
  { title: 'DESIGNED TO SCALE', description: 'FROM FIRST LAUNCH TO ENTERPRISE-GRADE SYSTEMS.' },
];

export default function AboutPage() {
  return (
    <PublicHubPage
      section="idnty"
      page="about"
      crumb="LOCATION / ABOUT"
      title="ABOUT"
      subtitle="THE MISSION, TECHNOLOGY, AND PRINCIPLES BEHIND SITE 00."
      width="wide"
    >
      <HubPanel label="00 MISSION">
        <p>
          SITE 00 IS A SPATIAL OPERATING ENVIRONMENT FOR DESIGNING, BUILDING, AND LAUNCHING DIGITAL PLACES — IDENTITY, INFRASTRUCTURE, AND
          EXPERIENCE IN ONE CONNECTED SYSTEM.
        </p>
        <a href={SITE00_ROUTES.journal}>LEARN MORE →</a>
      </HubPanel>
      <div className="s00pr-hubspacer" />
      <HubTileGrid columns={3}>
        {PRINCIPLES.map((p, index) => (
          <HubTile key={p.title} code={String(index + 1).padStart(2, '0')} title={p.title} description={p.description} />
        ))}
      </HubTileGrid>
      <HubPanel label="SITE 00" className="s00pr-hubpanel--meta">
        <dl className="s00pr-hubfacts">
          <div>
            <dt>EST.</dt>
            <dd>2024</dd>
          </div>
          <div>
            <dt>HEADQUARTERS</dt>
            <dd>FORT WORTH</dd>
          </div>
          <div>
            <dt>CONTACT</dt>
            <dd>
              <a href="mailto:hello@site00.com" style={{ textTransform: 'none' }}>
                hello@site00.com
              </a>
            </dd>
          </div>
        </dl>
      </HubPanel>
    </PublicHubPage>
  );
}
