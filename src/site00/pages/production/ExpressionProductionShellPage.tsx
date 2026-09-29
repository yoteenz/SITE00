import { Link, useParams, useSearchParams } from 'react-router-dom';
import { subWorkspacesFor } from '../../../../shared/site00-production-workspace/registry.js';
import { productionExpressionPath } from '../../../../shared/site00-production-workspace/routes.js';
import { useProductionWorkspaceContext } from '../../context/ProductionWorkspaceContext';

/** Production → EXPRESSION — campaign / entry context shared across sub-tabs. */
export function ExpressionProductionShellPage() {
  const { projectSlug = 'ndxbook', '*': rest } = useParams<{ projectSlug: string; '*': string }>();
  const [searchParams] = useSearchParams();
  const { context, setCampaignEntry } = useProductionWorkspaceContext();
  const slug = projectSlug.toLowerCase();
  const sub = rest?.split('/')[0] ?? 'narrative';
  const subs = subWorkspacesFor('EXPRESSION');
  const entry = searchParams.get('entry') ?? context.entryId ?? '002';

  return (
    <div className="site00-production-pillar" data-testid="production-expression-shell">
      <h2 className="site00-heading">EXPRESSION</h2>
      <div className="site00-production-expression-context" data-testid="expression-campaign-context">
        <p className="site00-label">PROJECT: {slug.toUpperCase()}</p>
        <p className="site00-label">
          CAMPAIGN / ENTRY: {context.entryLabel ?? `ENTRY ${entry}`}
        </p>
        <button
          type="button"
          className="site00-btn-ghost"
          onClick={() => setCampaignEntry('ndxbook-campaign', '002', 'ENTRY 002 — OH, NOW IT WAS FUN?')}
        >
          SELECT ENTRY 002
        </button>
      </div>
      <nav aria-label="Expression sub-workspaces">
        <ul>
          {subs.map((s) => (
            <li key={s.id}>
              <Link
                to={`${productionExpressionPath(slug, s.id)}?entry=${entry}`}
                aria-current={sub === s.id ? 'page' : undefined}
                data-testid={`expression-sub-${s.id}`}
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="site00-body">{subs.find((s) => s.id === sub)?.description ?? 'Expression production surface'}</p>
      {sub === 'casting' ? <p className="site00-body">Actor Catalogue opens contextually from Casting.</p> : null}
      {sub === 'wardrobe' ? <p className="site00-body">Wardrobe Catalogue opens contextually from Wardrobe.</p> : null}
      {sub === 'sets' ? <p className="site00-body">Set / Prop / Graphic libraries open from Sets.</p> : null}
    </div>
  );
}
