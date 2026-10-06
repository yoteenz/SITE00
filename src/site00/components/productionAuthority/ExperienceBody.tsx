import { Link } from 'react-router-dom';
import { subWorkspacesFor } from '../../../../shared/site00-production-workspace/registry.js';
import { productionExperiencePath } from '../../../../shared/site00-production-workspace/routes.js';
import { useProductionAuthorityData } from './ProductionAuthorityData';
import { AUTHORITY_ASSETS } from './authorityAssets';
import { AuthorityHero } from './HubBody';
import { Dot } from './primitives';

/** Authority mode capsules → the existing EXPERIENCE sub-workspaces (routes are unchanged). */
export const EXPERIENCE_CAPSULES: { label: string; sub: string }[] = [
  { label: 'WORLD', sub: 'world' },
  { label: 'ZONES', sub: 'zones' },
  { label: 'PATHS', sub: 'environments' },
  { label: 'INTERACTIONS', sub: 'modules' },
  { label: 'INHABITANTS', sub: 'simulations' },
  { label: 'STATES', sub: 'assets' },
  { label: 'ACCESS', sub: 'review' },
];

export function ExperienceBody() {
  const data = useProductionAuthorityData();
  const slug = data?.project.projectId ?? '';
  const subs = subWorkspacesFor('EXPERIENCE');
  const blockers = data?.graph.blockers.length ?? 0;
  return (
    <div className="pxa-experience" data-testid="production-experience-shell">
      <AuthorityHero
        kicker="PROJECT"
        title={`${(data?.project.name ?? 'NDXBOOK').toUpperCase()} EXPERIENCE`}
        sub="A CLEAR ROUTE FOR EVERY PERSON."
        side={['IDEAS', 'PEOPLE', 'WORLDS', 'IN MOTION']}
        plate={AUTHORITY_ASSETS.experienceWorld}
        testId="experience-hero"
      />
      <div className="pxa-xpanel" data-testid="experience-panel">
        <nav className="pxa-capsules" aria-label="Experience sub-workspaces">
          {EXPERIENCE_CAPSULES.map((m) => (
            <Link key={m.label} to={productionExperiencePath(slug, m.sub)} data-testid={`experience-sub-${m.sub}`}>
              {m.label}
            </Link>
          ))}
        </nav>
        <ul className="pxa-xstatus">
          <li>
            <Dot tone="green" />
            <span>
              <b>ACTIVE ENVIRONMENT</b>
              <small>{subs.length} EXPERIENCE SUB-WORKSPACES REGISTERED FOR THIS PROJECT.</small>
            </span>
          </li>
          <li>
            <Dot tone="red" />
            <span>
              <b>UNRESOLVED SPATIAL ISSUES</b>
              <small>{blockers ? `${blockers} PRODUCTION BLOCKERS OPEN.` : 'NONE FLAGGED BY THE PRODUCTION GRAPH.'}</small>
            </span>
          </li>
        </ul>
        <div className="pxa-xactions">
          <Link to={productionExperiencePath(slug, 'world')} className="pxa-btn" data-testid="experience-enter">
            ENTER WORLD
          </Link>
          <Link to={productionExperiencePath(slug, 'review')} className="pxa-btn pxa-btn--outline-red" data-testid="experience-preview">
            PREVIEW
          </Link>
        </div>
      </div>
    </div>
  );
}
