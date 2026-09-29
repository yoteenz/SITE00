import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDesignEnabledManagedProjects } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import {
  productionDesignPath,
  productionExperiencePath,
  productionExpressionPath,
} from '../../../../shared/site00-production-workspace/routes.js';
import {
  PRODUCTION_TOP_LEVEL_WORKSPACES,
  productionTopLevelWorkspaceCount,
} from '../../../../shared/site00-production-workspace/registry.js';
import { readProductionWorkspaceContext } from '../../../../shared/site00-production-workspace/productionContextStorage.js';
import type { ProductionWorkspaceType } from '../../../../shared/site00-production-workspace/types.js';
import { PW_IMG } from '../../components/production/productionImagery';
import { PwFrame } from '../../components/production/PwFrame';
import { IconArrow, IconGlyph, PwRow, PwScreenHead } from '../../components/production/PwPrimitives';
import { useProductionRequests } from '../../state/productionRequestStore';

const PILLARS: Record<ProductionWorkspaceType, { no: string; keywords: string; href: (slug: string) => string }> = {
  DESIGN: { no: '01', keywords: 'Websites · Pages · Interfaces', href: (s) => productionDesignPath(s) },
  EXPERIENCE: { no: '02', keywords: 'Worlds · Environments · Modules', href: (s) => productionExperiencePath(s, 'world') },
  EXPRESSION: { no: '03', keywords: 'Campaigns · Narrative · Content', href: (s) => productionExpressionPath(s, 'narrative') },
};

export function ProductionWorkspaceHubPage() {
  const projects = listDesignEnabledManagedProjects();
  const stored = readProductionWorkspaceContext()?.projectSlug;
  const initial =
    projects.find((p) => p.projectId.toLowerCase() === stored?.toLowerCase())?.projectId ??
    projects.find((p) => p.projectId === 'ndxbook')?.projectId ??
    projects[0]?.projectId ??
    'ndxbook';
  const [slug, setSlug] = useState(initial.toLowerCase());
  const queued = useProductionRequests().length;
  const switcher = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = switcher.current?.querySelector<HTMLElement>('.is-active');
    if (el && switcher.current) switcher.current.scrollLeft = Math.max(0, el.offsetLeft - 16);
  }, []);

  return (
    <PwFrame variant="production">
      <main data-testid="production-workspace-hub">
        <PwScreenHead title="Production Workspace" sub="Build worlds. Create experiences. Produce stories." />

        <div ref={switcher} className="pw-context" role="group" aria-label="Active project" data-testid="production-project-switcher">
          {projects.map((p) => (
            <button
              key={p.projectId}
              type="button"
              className={`pw-context__chip${p.projectId.toLowerCase() === slug ? ' is-active' : ''}`}
              onClick={() => setSlug(p.projectId.toLowerCase())}
            >
              {p.displayName}
            </button>
          ))}
        </div>

        <div className="pw-hub__pillars" data-testid="production-pillars">
          {PRODUCTION_TOP_LEVEL_WORKSPACES.map((w) => (
            <Link
              key={w}
              to={PILLARS[w].href(slug)}
              className="pw-pillar"
              style={{ backgroundImage: `url(${PW_IMG.pillar[w]})` }}
              data-testid={`production-pillar-${w.toLowerCase()}`}
            >
              <span className="pw-pillar__go" aria-hidden>
                <IconArrow />
              </span>
              <span className="pw-pillar__no">{PILLARS[w].no}</span>
              <span className="pw-pillar__title">{w}</span>
              <span className="pw-pillar__kw">{PILLARS[w].keywords}</span>
            </Link>
          ))}
        </div>

        <div className="pw-list pw-hub__utility">
          <PwRow
            to="/production/queue"
            icon={<IconGlyph d="M4 6h16M4 12h16M4 18h10" />}
            title="Production queue"
            sub={queued ? `${queued} request${queued === 1 ? '' : 's'} from projects` : 'Requests from projects and services'}
            testId="production-open-queue"
          />
          <PwRow
            to="/production/libraries"
            icon={<IconGlyph d="M7 20c0-8 3-13 11-16-1 6-3 10-9 12M7 20c-1-3-1-5 0-8" />}
            title="Libraries"
            sub="Shared production assets"
            testId="production-open-libraries"
          />
        </div>

        <p className="pw-label" style={{ marginTop: 18 }} data-testid="production-top-level-count">
          {productionTopLevelWorkspaceCount()} primary workspaces
        </p>
      </main>
    </PwFrame>
  );
}
