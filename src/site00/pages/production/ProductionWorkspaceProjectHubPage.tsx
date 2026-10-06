import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { PRODUCTION_TOP_LEVEL_WORKSPACES } from '../../../../shared/site00-production-workspace/registry.js';
import { scopedTabHref } from '../../../../shared/site00-production-graph/projectScope.js';
import { PwFrame } from '../../components/production/PwFrame';
import { DesignChamber, DesignModeBar, designModesFor, useDesignSurface } from '../../components/productionAuthority/DesignChamber';
import { ExpressionBody } from '../../components/productionAuthority/ExpressionBody';
import { expressionFrameScreen } from '../../components/productionAuthority/expression/expressionRoutes';
import { ProductionAuthorityFrame } from '../../components/productionAuthority/ProductionAuthorityFrame';
import { ProductionAuthorityDataProvider } from '../../components/productionAuthority/ProductionAuthorityData';
import { ExpressionDomainGate, ProjectDesignSurface, ProjectExperienceSurface } from '../../components/productionAuthority/projectGraph/ProjectDomainSurfaces';
import { ProductionChromeOverlay } from '../../components/productionHub/chrome';
import { ProductionWorkspaceProvider, useProductionWorkspaceContext } from '../../context/ProductionWorkspaceContext';
import { useSearchParams } from 'react-router-dom';
import '../../styles/site00-production-mobile.css';

/**
 * DESIGN root: the project's DESIGN overview (graph) by default; `?mode=` opens a chamber mode only when the
 * project has that mode (designModesFor) — a project without it renders its overview, never another project's chamber.
 */
function DesignRoot({ slug }: { slug: string }) {
  const mode = useDesignSurface(slug);
  return (
    <ProductionAuthorityFrame screen={`design-${mode}`} subBar={<DesignModeBar active={mode} />}>
      {mode === 'overview' ? <ProjectDesignSurface modes={designModesFor(slug)} /> : <DesignChamber mode={mode} />}
    </ProductionAuthorityFrame>
  );
}

function ExpressionRoot({ slug }: { slug: string }) {
  const [params] = useSearchParams();
  const { context } = useProductionWorkspaceContext();
  // The stored entry belongs to the project it was chosen in; another project's entry never carries over.
  const entry = params.get('entry') ?? (context.projectSlug === slug ? context.entryId : null) ?? '002';
  return (
    <ProductionAuthorityFrame screen="expression">
      <ExpressionDomainGate>
        <ExpressionBody entry={entry} key={slug} />
      </ExpressionDomainGate>
    </ProductionAuthorityFrame>
  );
}

function ProjectLayoutInner() {
  const { pathname, search } = useLocation();
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const slug = (projectSlug ?? '').toLowerCase();
  const isProjectRoot = /^\/production\/[^/]+\/?$/.test(pathname);
  const isDesign = /^\/production\/[^/]+\/design(\/|$)/.test(pathname);
  const isDesignRoot = /^\/production\/[^/]+\/design\/?$/.test(pathname);
  const isExperience = /^\/production\/[^/]+\/experience(\/|$)/.test(pathname);
  const isExpressionRoot = /^\/production\/[^/]+\/expression\/?$/.test(pathname);
  const isFabrication = /\/character-fabrication(\/|$)/.test(pathname);
  const expressionScreen = expressionFrameScreen(pathname);

  // /production/<p> is the project's HUB: the HUB route carries the project in `?project=`.
  if (isProjectRoot) return <Navigate to={`${scopedTabHref('HUB', slug)}${search ? `&${search.slice(1)}` : ''}`} replace />;
  // /design/<sub> is NDXBOOK's golden-reference reconstruction workspace; under any other project it would show
  // NDXBOOK's work, so the address resolves to that project's own DESIGN overview.
  if (isDesign && !isDesignRoot && slug !== 'ndxbook') return <Navigate to={scopedTabHref('DESIGN', slug)} replace />;

  let body;
  if (isDesignRoot) body = <DesignRoot slug={slug} />;
  else if (isExperience)
    // EXPERIENCE root and every former child (world / zones / environments …) project the project's world graph.
    body = (
      <ProductionAuthorityFrame screen="experience">
        <ProjectExperienceSurface />
      </ProductionAuthorityFrame>
    );
  else if (isExpressionRoot) body = <ExpressionRoot slug={slug} />;
  else if (expressionScreen)
    // Expression families (40 routes) share the one authority frame: host header, bottom nav, no page scroll.
    body = (
      <ExpressionDomainGate frame={expressionScreen}>
        <ProductionAuthorityFrame screen={expressionScreen}>
          <Outlet />
        </ProductionAuthorityFrame>
      </ExpressionDomainGate>
    );
  else if (isDesign)
    body = (
      <>
        <ProductionChromeOverlay />
        <Outlet />
      </>
    );
  else if (isFabrication)
    body = (
      <ExpressionDomainGate frame="expression">
        <Outlet />
      </ExpressionDomainGate>
    );
  else
    body = (
      // Unknown descendants keep their screens inside the workspace frame.
      <PwFrame variant="production">
        <Outlet />
      </PwFrame>
    );

  return (
    <ProductionAuthorityDataProvider projectId={slug}>
      <div data-testid="production-workspace-shell" data-top-level-count={PRODUCTION_TOP_LEVEL_WORKSPACES.length} data-project={slug}>
        {body}
      </div>
    </ProductionAuthorityDataProvider>
  );
}

export function ProductionWorkspaceProjectLayout() {
  return (
    <ProductionWorkspaceProvider>
      <ProjectLayoutInner />
    </ProductionWorkspaceProvider>
  );
}
