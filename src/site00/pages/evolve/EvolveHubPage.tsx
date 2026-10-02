import { useNavigate } from 'react-router-dom';
import { HubCta, HubPanel, HubTile, HubTileGrid, PublicHubPage } from '../../components/public-redesign/PublicHubLayouts';
import { PublicLineIcon } from '../../components/public-redesign/PublicLineIcon';
import { EVOLVE_HOMEPAGE_EXPANDED, EVOLVE_PATHS } from '../../config/evolve';
import { SITE00_ROUTES } from '../../config/routes';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import { resolveStartEvolveRoute } from '../../../../shared/site00-evolve-service/startEvolveRouting.js';

const PATH_ICON = { refine: 'refresh', install: 'bolt', transform: 'layers' } as const;
const SEQUENCE = ['PRESERVE', 'INTERVENE', 'EVOLVE'] as const;

export default function EvolveHubPage() {
  const navigate = useNavigate();
  const [signedIn] = useSignedInFromStorage();

  const start = () => {
    const dest = resolveStartEvolveRoute({
      isSignedIn: signedIn,
      hasEvolveProject: false,
      evolveProjectSlug: null,
      serviceMode: 'DIGITAL_EVOLUTION',
      isDesktop: false,
    });
    navigate(dest.route);
  };

  return (
    <PublicHubPage
      section="evolve"
      page="evolve-hub"
      envSlotId="ENV.EVOLVE.INTERVENTION_CENTER"
      tone="daylight"
      crumb="LOCATION / EVOLVE / 00"
      title="EVOLVE"
      subtitle={EVOLVE_HOMEPAGE_EXPANDED.subtitle}
      body={EVOLVE_HOMEPAGE_EXPANDED.overview}
      width="wide"
    >
      <HubTileGrid columns={3}>
        {EVOLVE_PATHS.map((path) => (
          <HubTile
            key={path.id}
            code={path.code}
            title={path.title}
            description={`${path.subtitle} ${path.description}`}
            cta="ENTER PATH →"
            to={`${SITE00_ROUTES.evolveState}?path=${path.id}`}
            icon={<PublicLineIcon id={PATH_ICON[path.id]} size={26} />}
          />
        ))}
      </HubTileGrid>
      <HubPanel label="HOW IT WORKS" className="s00pr-hubpanel--sequence">
        <ol className="s00pr-hubseq" aria-label="EVOLVE SEQUENCE">
          {SEQUENCE.map((step, index) => (
            <li key={step}>
              <b>{String(index + 1).padStart(2, '0')}</b>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p>YOU DO NOT HAVE TO START FROM ZERO. BRING WHAT EXISTS. SITE 00 EVOLVES IT FORWARD.</p>
        <div className="s00pr-hubactions">
          <HubCta onClick={start} variant="solid">
            {EVOLVE_HOMEPAGE_EXPANDED.cta.replace(' →', '')}
          </HubCta>
          <HubCta to={SITE00_ROUTES.evolveState}>INTERVENTION CENTER</HubCta>
        </div>
      </HubPanel>
    </PublicHubPage>
  );
}
