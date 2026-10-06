import { Link, useParams } from 'react-router-dom';
import { subWorkspacesFor } from '../../../../shared/site00-production-workspace/registry.js';
import { productionExperiencePath } from '../../../../shared/site00-production-workspace/routes.js';
import { PW_IMG } from '../../components/production/productionImagery';
import { HubReturnBar } from '../../components/production/HubReturnBar';
import { IconGlyph, PwRow, PwScreenHead } from '../../components/production/PwPrimitives';
import { AUTHORITY_ASSETS } from '../../components/productionAuthority/authorityAssets';
import { EXPERIENCE_CAPSULES } from '../../components/productionAuthority/ExperienceBody';

const COPY: Record<string, { title: string; sub: string; glyph: string }> = {
  world: { title: 'World Architecture', sub: 'Structure / Systems', glyph: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 3v18M4 7.5l8 4.5 8-4.5' },
  environments: { title: 'Environments', sub: 'Destinations / Sets', glyph: 'M4 20V9l8-5 8 5v11zM9 20v-6h6v6' },
  modules: { title: 'Modules', sub: 'Interactive Systems', glyph: 'M12 4a8 8 0 100 16 8 8 0 000-16zM12 9a3 3 0 100 6 3 3 0 000-6z' },
  simulations: { title: 'Simulations', sub: 'Configurators', glyph: 'M12 4c4 0 7 3 7 6s-3 4-5 4-2 3-2 6M12 4c-4 0-7 3-7 6s3 4 5 4' },
  zones: { title: 'Zones & Navigation', sub: 'Spatial Flow', glyph: 'M12 3l7 9-7 9-7-9zM12 8v8M8 12h8' },
  assets: { title: 'World Assets', sub: 'Library', glyph: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8' },
  review: { title: 'Review', sub: 'Approval / Handoff', glyph: 'M5 4h14v16H5zM8 9h8M8 13h8M8 17h5' },
};

/** Authority capsules: the same list (labels, order, targets) the EXPERIENCE root renders. */
const CAPSULES = EXPERIENCE_CAPSULES;

/** Art direction: each sub-workspace frames a different part of the one Experience world. */
const WORLD_CROP: Record<string, string> = {
  world: '50% 40%',
  zones: '18% 70%',
  environments: '82% 60%',
  modules: '50% 80%',
  simulations: '30% 50%',
  assets: '70% 30%',
  review: '50% 15%',
};

/** Production → EXPERIENCE — world-production sub-workspaces (reuses existing project experience routes). */
export function ExperienceProductionShellPage() {
  return (
    <>
      <HubReturnBar />
      <ExperienceRoutes />
    </>
  );
}

function ExperienceRoutes() {
  const { projectSlug = '', '*': rest } = useParams<{ projectSlug: string; '*': string }>();
  const slug = projectSlug.toLowerCase();
  const sub = rest?.split('/')[0] ?? '';
  const subs = subWorkspacesFor('EXPERIENCE');
  const active = subs.find((s) => s.id === sub);

  if (active) {
    const c = COPY[active.id]!;
    const capsule = CAPSULES.find((x) => x.sub === active.id);
    return (
      <div className="pwa-xchild" data-testid="production-experience-shell" data-sub={active.id}>
        <PwScreenHead backTo={productionExperiencePath(slug)} backLabel="Experience" title={c.title} sub={c.sub} />
        <nav className="pwa-capsules" aria-label="Experience sub-workspaces" data-testid="experience-child-capsules">
          {CAPSULES.map((m) => (
            <Link key={m.label} to={productionExperiencePath(slug, m.sub)} className={m.sub === active.id ? 'is-active' : undefined} aria-current={m.sub === active.id ? 'page' : undefined}>
              {m.label}
            </Link>
          ))}
        </nav>
        <div className="pw-stack">
          {/* world authority plate, art-directed per sub-workspace (crop of the Experience world asset) */}
          <div
            className="pw-plate pw-plate--set pwa-xchild__world"
            data-media-slot="CARD_MEDIA"
            data-media-role="DECORATIVE_ART"
            data-media-scale="PLATE"
            data-media-crop="EXPERIENCE_WORLD_CROP"
            data-media-fit="WIDE_SCENE_COVER"
            // focal metadata: each sub-workspace frames its own part of the one Experience world
            style={{ backgroundImage: `url(${AUTHORITY_ASSETS.experienceWorld})`, ['--pw-focal' as string]: WORLD_CROP[active.id] ?? '50% 50%' }}
            data-testid="experience-child-world"
          >
            <span className="pwa-xchild__tag">
              <b>{capsule?.label ?? active.label}</b>
              <small>{active.description.toUpperCase()}</small>
            </span>
          </div>
          <p className="pw-note">{active.description}</p>
          <div className="pw-empty" data-testid="experience-child-empty">
            <strong>NO WORKSPACE SURFACE MOUNTED</strong>
            THIS EXPERIENCE SUB-WORKSPACE IS NOT MOUNTED IN PRODUCTION YET.
          </div>
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
