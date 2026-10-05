import { Outlet, useLocation, useParams } from 'react-router-dom';
import { PRODUCTION_TOP_LEVEL_WORKSPACES } from '../../../../shared/site00-production-workspace/registry.js';
import { PwFrame } from '../../components/production/PwFrame';
import { DesignChamber, DesignModeBar, useDesignMode } from '../../components/productionAuthority/DesignChamber';
import { ExperienceBody } from '../../components/productionAuthority/ExperienceBody';
import { ExpressionBody } from '../../components/productionAuthority/ExpressionBody';
import { expressionFrameScreen } from '../../components/productionAuthority/expression/expressionRoutes';
import { AUTHORITY_ASSETS } from '../../components/productionAuthority/authorityAssets';
import { ProductionAuthorityFrame } from '../../components/productionAuthority/ProductionAuthorityFrame';
import { ProductionAuthorityDataProvider } from '../../components/productionAuthority/ProductionAuthorityData';
import { ProductionChromeOverlay } from '../../components/productionHub/chrome';
import { ProductionWorkspaceProvider, useProductionWorkspaceContext } from '../../context/ProductionWorkspaceContext';
import { useSearchParams } from 'react-router-dom';
import '../../styles/site00-production-mobile.css';

function DesignRoot() {
  const mode = useDesignMode();
  return (
    <ProductionAuthorityFrame screen={`design-${mode}`} subBar={<DesignModeBar active={mode} />}>
      <DesignChamber mode={mode} />
    </ProductionAuthorityFrame>
  );
}

function ExpressionRoot({ slug }: { slug: string }) {
  const [params] = useSearchParams();
  const { context } = useProductionWorkspaceContext();
  const entry = params.get('entry') ?? context.entryId ?? '002';
  return (
    <ProductionAuthorityFrame screen="expression">
      <ExpressionBody entry={entry} key={slug} />
    </ProductionAuthorityFrame>
  );
}

function ProjectLayoutInner() {
  const { pathname } = useLocation();
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const slug = projectSlug.toLowerCase();
  const isDesign = /^\/production\/[^/]+\/design(\/|$)/.test(pathname);
  const isDesignRoot = /^\/production\/[^/]+\/design\/?$/.test(pathname);
  const isExperienceRoot = /^\/production\/[^/]+\/experience\/?$/.test(pathname);
  const isExpressionRoot = /^\/production\/[^/]+\/expression\/?$/.test(pathname);
  const isFabrication = /\/character-fabrication(\/|$)/.test(pathname);
  const expressionScreen = expressionFrameScreen(pathname);

  let body;
  if (isDesignRoot) body = <DesignRoot />;
  else if (isExperienceRoot)
    body = (
      <ProductionAuthorityFrame screen="experience">
        <ExperienceBody />
      </ProductionAuthorityFrame>
    );
  else if (isExpressionRoot) body = <ExpressionRoot slug={slug} />;
  else if (expressionScreen)
    // Expression families (40 routes) share the one authority frame: host header, bottom nav, no page scroll.
    body = (
      <ProductionAuthorityFrame screen={expressionScreen}>
        <Outlet />
      </ProductionAuthorityFrame>
    );
  else if (isDesign)
    body = (
      <>
        <ProductionChromeOverlay />
        <Outlet />
      </>
    );
  else if (isFabrication) body = <Outlet />;
  else
    body = (
      // Descendants keep their screens; the frame gives them the workspace's authority atmosphere.
      <PwFrame variant="production" heroImage={/\/experience\//.test(pathname) ? AUTHORITY_ASSETS.experienceWorld : /\/expression\//.test(pathname) ? AUTHORITY_ASSETS.expressionStage : undefined}>
        <Outlet />
      </PwFrame>
    );

  const content = (
    <div data-testid="production-workspace-shell" data-top-level-count={PRODUCTION_TOP_LEVEL_WORKSPACES.length}>
      {body}
    </div>
  );
  if (isFabrication) return content;
  return <ProductionAuthorityDataProvider projectId={slug}>{content}</ProductionAuthorityDataProvider>;
}

export function ProductionWorkspaceProjectLayout() {
  return (
    <ProductionWorkspaceProvider>
      <ProjectLayoutInner />
    </ProductionWorkspaceProvider>
  );
}
