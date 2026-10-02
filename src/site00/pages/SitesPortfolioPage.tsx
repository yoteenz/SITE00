import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { HubCta, HubEmpty, HubPanel, HubTabs, HubTile, HubTileGrid, PublicHubPage } from '../components/public-redesign/PublicHubLayouts';
import { SITE00_PORTFOLIO_SEED } from '../config/seed/site00-page-seed';
import { SITE00_ROUTES } from '../config/routes';
import { useSignedInFromStorage } from '../../hooks/useSignedInFromStorage';

const FILTERS = [
  { id: 'all', label: 'ALL PROJECTS' },
  { id: 'completed', label: 'COMPLETED' },
  { id: 'in-progress', label: 'IN PROGRESS' },
];

export default function SitesPortfolioPage() {
  const [isSignedIn] = useSignedInFromStorage();
  const [filter, setFilter] = useState('all');
  const projects = useMemo(() => {
    if (filter === 'all') return SITE00_PORTFOLIO_SEED;
    return SITE00_PORTFOLIO_SEED.filter((p) => p.status === filter);
  }, [filter]);

  if (isSignedIn) {
    return <Navigate to={SITE00_ROUTES.controlSites} replace />;
  }

  return (
    <PublicHubPage
      section="idnty"
      page="sites"
      crumb="LOCATION / SITES"
      title="SITES"
      subtitle="WE DESIGN. WE BUILD. WE LAUNCH."
      body="A CURATED VIEW OF SITE 00 WORK — PUBLISHED PROJECTS AND IN-PROGRESS BUILDS AVAILABLE FOR PUBLIC SHOWCASE."
      width="wide"
    >
      <div className="s00pr-hubtoolbar">
        <HubTabs tabs={FILTERS} active={filter} onChange={setFilter} label="FILTER PROJECTS" />
      </div>
      {projects.length === 0 ? (
        <HubEmpty title="NO PUBLISHED PROJECTS YET" body="WHEN PROJECTS ARE APPROVED FOR PUBLIC SHOWCASE, THEY WILL APPEAR HERE." />
      ) : (
        <HubTileGrid columns={3}>
          {projects.map((project) => (
            <HubTile
              key={project.id}
              title={project.name}
              description={project.description}
              badge={project.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
              cta="VIEW PROJECT →"
              to={`${SITE00_ROUTES.sites}/${project.id}`}
            />
          ))}
        </HubTileGrid>
      )}
      <HubPanel label="HAVE A PROJECT IN MIND?">
        <p>LET&apos;S BUILD SOMETHING EXCEPTIONAL.</p>
        <div className="s00pr-hubactions">
          <HubCta to={SITE00_ROUTES.bldr} variant="solid">
            START A PROJECT
          </HubCta>
        </div>
      </HubPanel>
    </PublicHubPage>
  );
}
