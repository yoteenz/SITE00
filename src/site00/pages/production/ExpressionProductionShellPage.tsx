import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { subWorkspacesFor } from '../../../../shared/site00-production-workspace/registry.js';
import { productionExpressionPath } from '../../../../shared/site00-production-workspace/routes.js';
import { PW_IMG } from '../../components/production/productionImagery';
import { CharacterFabrication } from '../../components/characterFabrication/CharacterFabrication';
import { HubReturnBar } from '../../components/production/HubReturnBar';
import { PwChip, PwRow, PwScreenHead } from '../../components/production/PwPrimitives';
import { ExpressionFamilyScreen } from '../../components/production/ExpressionSubScreens';
import { resolveExpressionRoute } from '../../components/productionAuthority/expression/expressionRoutes';
import { isEntry002Project, useEntry002Production } from '../../components/production/useEntry002Production';
import { useProductionWorkspaceContext } from '../../context/ProductionWorkspaceContext';

const ROW_COPY: Record<string, { title: string; sub: string }> = {
  narrative: { title: 'Narrative', sub: 'Story / Structure' },
  casting: { title: 'Casting', sub: 'Characters / Talent' },
  'character-fabrication': { title: 'Character Fabrication', sub: 'Actor → Character → Simulation' },
  wardrobe: { title: 'Wardrobe', sub: 'Looks / Hair / Makeup' },
  performance: { title: 'Performance', sub: 'Behavior / Movement' },
  sets: { title: 'Sets / Scene', sub: 'Environments / Props' },
  storyboard: { title: 'Storyboard', sub: 'Keyframes / Scenes' },
  review: { title: 'Review', sub: 'Handoff / Delivery' },
};

function Landing({ slug, entry }: { slug: string; entry: string }) {
  const { context, setCampaignEntry } = useProductionWorkspaceContext();
  const subs = subWorkspacesFor('EXPRESSION');
  const ok = isEntry002Project(slug);
  useEffect(() => {
    if (ok && !context.entryId) setCampaignEntry('ndxbook-campaign', '002', 'ENTRY 002 — OH, NOW IT WAS FUN?');
  }, [ok, context.entryId, setCampaignEntry]);
  const { items, ready, total } = useEntry002Production();
  const entryLabel = context.entryLabel ?? (entry === '002' ? 'ENTRY 002 — OH, NOW IT WAS FUN?' : `ENTRY ${entry}`);

  return (
    <div data-testid="production-expression-shell">
      <PwScreenHead backTo="/production" backLabel="Production" numeral="03" title="Expression" sub="Campaigns · Narrative · Content" />
      <div className="pw-entry" data-testid="expression-campaign-context">
        <span className="pw-entry__text">
          <span className="pw-label">
            {slug.toUpperCase()} · CAMPAIGN / ENTRY
          </span>
          <span className="pw-entry__title">{ok ? entryLabel : 'No entry in production'}</span>
          {ok ?
            <span className="pw-progress" aria-label={`Production package ${ready} of ${total} ready`}>
              <i style={{ width: `${(ready / total) * 100}%` }} />
            </span>
          : null}
        </span>
        {ok ? <PwChip tone={ready === total ? 'green' : 'orange'}>{ready} of {total} ready</PwChip> : null}
      </div>
      <div className="pw-list" role="navigation" aria-label="Expression sub-workspaces">
        {subs.map((s) => {
          const item = items.find((i) => i.id === (s.id === 'casting' ? 'cast' : s.id));
          return (
            <PwRow
              key={s.id}
              to={`${productionExpressionPath(slug, s.id)}?entry=${entry}`}
              thumb={PW_IMG.expressionRows[s.id]}
              title={ROW_COPY[s.id]?.title ?? s.label}
              sub={ROW_COPY[s.id]?.sub ?? s.description}
              testId={`expression-sub-${s.id}`}
              chip={
                ok && item ?
                  <PwChip tone={item.status === 'APPROVED' || item.status === 'LOCKED' ? 'green' : item.status === 'BLOCKED' ? 'red' : 'gray'}>
                    {item.status === 'APPROVED' || item.status === 'LOCKED' ? 'READY' : item.status === 'BLOCKED' ? 'BLOCKED' : 'PENDING'}
                  </PwChip>
                : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}

/** Production → EXPRESSION — campaign / entry context shared across sub-workspaces. */
export function ExpressionProductionShellPage() {
  const { '*': rest } = useParams<{ '*': string }>();
  // Family routes carry their own breadcrumb inside the authority frame; the Hub return bar stays on the others.
  return (
    <>
      {resolveExpressionRoute(rest) ? null : <HubReturnBar />}
      <ExpressionRoutes />
    </>
  );
}

function ExpressionRoutes() {
  const { projectSlug = 'ndxbook', '*': rest } = useParams<{ projectSlug: string; '*': string }>();
  const [searchParams] = useSearchParams();
  const { context } = useProductionWorkspaceContext();
  const slug = projectSlug.toLowerCase();
  const sub = rest?.split('/')[0] ?? '';
  const entry = searchParams.get('entry') ?? context.entryId ?? '002';

  // The 10 Expression families / 40 routes (narrative, casting, wardrobe, performance, sets, storyboard, review,
  // format-studio, content-package, campaign-board + their children and details) resolve through one route model.
  const resolved = resolveExpressionRoute(rest);
  switch (sub) {
    case 'character-fabrication':
      return <CharacterFabrication projectSlug={slug} entryId={entry} />;
    case 'narrative':
    case 'casting':
    case 'wardrobe':
    case 'performance':
    case 'sets':
    case 'storyboard':
    case 'review':
    case 'format-studio':
    case 'content-package':
    case 'campaign-board':
      if (resolved) return <ExpressionFamilyScreen slug={slug} entry={entry} resolved={resolved} />;
      return <Landing slug={slug} entry={entry} />;
    default:
      return <Landing slug={slug} entry={entry} />;
  }
}
