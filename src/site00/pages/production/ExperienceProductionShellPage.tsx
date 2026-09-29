import { useParams } from 'react-router-dom';
import { subWorkspacesFor } from '../../../../shared/site00-production-workspace/registry.js';
import { productionExperiencePath } from '../../../../shared/site00-production-workspace/routes.js';
import { site00ProjectExperienceWorkspacePath } from '../../config/routes';
import { PW_IMG } from '../../components/production/productionImagery';
import { IconArrow, IconGlyph, PwButton, PwRow, PwScreenHead } from '../../components/production/PwPrimitives';

const COPY: Record<string, { title: string; sub: string; glyph: string }> = {
  world: { title: 'World Architecture', sub: 'Structure / Systems', glyph: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 3v18M4 7.5l8 4.5 8-4.5' },
  environments: { title: 'Environments', sub: 'Destinations / Sets', glyph: 'M4 20V9l8-5 8 5v11zM9 20v-6h6v6' },
  modules: { title: 'Modules', sub: 'Interactive Systems', glyph: 'M12 4a8 8 0 100 16 8 8 0 000-16zM12 9a3 3 0 100 6 3 3 0 000-6z' },
  simulations: { title: 'Simulations', sub: 'Configurators', glyph: 'M12 4c4 0 7 3 7 6s-3 4-5 4-2 3-2 6M12 4c-4 0-7 3-7 6s3 4 5 4' },
  zones: { title: 'Zones & Navigation', sub: 'Spatial Flow', glyph: 'M12 3l7 9-7 9-7-9zM12 8v8M8 12h8' },
  assets: { title: 'World Assets', sub: 'Library', glyph: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8' },
  review: { title: 'Review', sub: 'Approval / Handoff', glyph: 'M5 4h14v16H5zM8 9h8M8 13h8M8 17h5' },
};

/** Production → EXPERIENCE — world-production sub-workspaces (reuses existing project experience routes). */
export function ExperienceProductionShellPage() {
  const { projectSlug = 'ndxbook', '*': rest } = useParams<{ projectSlug: string; '*': string }>();
  const slug = projectSlug.toLowerCase();
  const sub = rest?.split('/')[0] ?? '';
  const subs = subWorkspacesFor('EXPERIENCE');
  const active = subs.find((s) => s.id === sub);

  if (active) {
    const c = COPY[active.id]!;
    return (
      <div data-testid="production-experience-shell">
        <PwScreenHead backTo={productionExperiencePath(slug)} backLabel="Experience" title={c.title} sub={c.sub} />
        <div className="pw-stack">
          <div className="pw-plate pw-plate--set" style={{ backgroundImage: `url(${PW_IMG.experienceRows[active.id]})` }} />
          <p className="pw-note" style={{ borderColor: 'var(--pw-red)', background: 'rgba(240,38,44,.07)', color: '#f0c8c9' }}>
            {active.description}
          </p>
          {active.id === 'modules' ?
            <PwButton variant="red" to={site00ProjectExperienceWorkspacePath(slug, 'build-a-wig', 'overview')}>
              Open existing experience workspace <IconArrow />
            </PwButton>
          : (
            <div className="pw-empty">
              <strong>NO WORKSPACE SURFACE MOUNTED</strong>
              THIS EXPERIENCE SUB-WORKSPACE IS NOT MOUNTED IN PRODUCTION YET.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="production-experience-shell">
      <PwScreenHead backTo="/production" backLabel="Production" numeral="02" title="Experience" sub="Worlds · Environments · Modules" />
      <div className="pw-list" role="navigation" aria-label="Experience sub-workspaces">
        {subs.map((s) => (
          <PwRow
            key={s.id}
            to={productionExperiencePath(slug, s.id)}
            icon={<IconGlyph d={COPY[s.id]!.glyph} />}
            title={COPY[s.id]!.title}
            sub={COPY[s.id]!.sub}
            thumb={PW_IMG.experienceRows[s.id]}
            thumbSide="right"
            testId={`experience-sub-${s.id}`}
          />
        ))}
      </div>
    </div>
  );
}
