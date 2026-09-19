import {
  pipelineRowsForDisplay,
  type ExperienceActivityEvent,
  type ExperienceAsset,
  type ExperienceBuild,
  type ExperienceCharacter,
  type ExperienceMechanic,
  type ExperienceRecord,
  type ExperienceScene,
  type ExperienceWorkspaceBundle,
} from '../../../shared/site00-experience-workspace/index.js';

type OverviewProps = {
  experience: ExperienceRecord;
  bundle: ExperienceWorkspaceBundle;
  isDesktop: boolean;
  onQuickAction: (actionId: string) => void;
};

function BuildCompare({ assets }: { assets: readonly ExperienceAsset[] }) {
  const current = assets.find((a) => a.assetType === 'BUILD_CAPTURE');
  const target = assets.find((a) => a.assetType === 'REFERENCE');
  return (
    <section className="site00-expws__compare" data-testid="experience-build-compare">
      <h3>CURRENT BUILD VS TARGET</h3>
      <div className="site00-expws__compare-grid">
        <div className="site00-expws__compare-slot">
          <span className="site00-expws__compare-label">{current?.metadata.label ?? 'CURRENT BUILD'}</span>
          <div className="site00-expws__compare-frame">{current?.version ?? '—'}</div>
        </div>
        <div className="site00-expws__compare-slot">
          <span className="site00-expws__compare-label">{target?.metadata.label ?? 'TARGET'}</span>
          <div className="site00-expws__compare-frame">{target?.version ?? '—'}</div>
        </div>
      </div>
    </section>
  );
}

export function ExperienceOverviewPanel({ experience, bundle, isDesktop, onQuickAction }: OverviewProps) {
  const build = bundle.builds.find((b) => b.buildId === experience.currentBuildId) ?? bundle.builds[0];
  const pipeline = pipelineRowsForDisplay(bundle.pipeline, !isDesktop);

  return (
    <div className="site00-expws__overview">
      <section className="site00-expws__hero">
        <div className="site00-expws__hero-visual">
          <span className="site00-expws__type-pill">{experience.type}</span>
        </div>
        <div className="site00-expws__hero-meta">
          <h2>ACTIVE EXPERIENCE</h2>
          <p className="site00-expws__hero-name">{experience.name}</p>
          <dl className="site00-expws__meta-grid">
            <div>
              <dt>STATUS</dt>
              <dd>{experience.status.replace(/_/g, ' ')}</dd>
            </div>
            <div>
              <dt>TYPE</dt>
              <dd>{experience.type}</dd>
            </div>
            <div>
              <dt>ENGINE</dt>
              <dd>{experience.primaryRuntime}</dd>
            </div>
            <div>
              <dt>CURRENT BUILD</dt>
              <dd>{build?.version ?? '—'}</dd>
            </div>
            <div>
              <dt>UPDATED</dt>
              <dd>{experience.updatedAt.slice(0, 10)}</dd>
            </div>
            <div>
              <dt>MILESTONE</dt>
              <dd>{experience.currentMilestone}</dd>
            </div>
          </dl>
          <button type="button" className="site00-expws__primary-action" onClick={() => onQuickAction('open-runtime')}>
            OPEN RUNTIME
          </button>
        </div>
        {isDesktop ? (
          <div className="site00-expws__quick-actions site00-expws__quick-actions--vertical">
            {[
              ['capture-screen', 'CAPTURE SCREEN'],
              ['generate-asset', 'GENERATE ASSET'],
              ['test-mechanics', 'TEST MECHANICS'],
              ['open-scene', 'OPEN SCENE'],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => onQuickAction(id)}>
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="site00-expws__pipeline" data-testid="experience-pipeline">
        <h3>PIPELINE</h3>
        <ol className="site00-expws__pipeline-track">
          {pipeline.map((stage) => (
            <li
              key={stage.id}
              className={`site00-expws__pipeline-step site00-expws__pipeline-step--${stage.state.toLowerCase()}`}
              data-applicable={stage.applicable}
            >
              <span className="site00-expws__pipeline-order">{String(stage.order).padStart(2, '0')}</span>
              <span className="site00-expws__pipeline-label">{stage.shortLabel}</span>
            </li>
          ))}
        </ol>
      </section>

      <BuildCompare assets={bundle.assets} />

      {!isDesktop ? (
        <section className="site00-expws__quick-actions site00-expws__quick-actions--grid">
          {[
            ['capture-screen', 'CAPTURE SCREEN'],
            ['open-runtime', 'OPEN IN UNREAL'],
            ['generate-asset', 'GENERATE ASSET'],
            ['test-mechanics', 'TEST MECHANICS'],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => onQuickAction(id)}>
              {label}
            </button>
          ))}
        </section>
      ) : null}

      <section className="site00-expws__activity">
        <h3>RECENT ACTIVITY</h3>
        <ul>
          {bundle.activity.map((evt: ExperienceActivityEvent) => (
            <li key={evt.eventId}>
              <span>{evt.summary}</span>
              <time dateTime={evt.at}>{evt.at.slice(0, 10)}</time>
            </li>
          ))}
        </ul>
      </section>

      <section className="site00-expws__type-cards">
        <h3>EXPERIENCE MODULE TYPES</h3>
        <div className="site00-expws__type-grid">
          {(['CONFIGURATOR', 'SIMULATION', 'WORLD', 'APP', 'GAME'] as const).map((type) => (
            <div
              key={type}
              className={`site00-expws__type-card${experience.type === type ? ' is-active' : ''}`}
            >
              {type}
            </div>
          ))}
        </div>
      </section>

      {isDesktop ? (
        <section className="site00-expws__key-assets">
          <h3>KEY ASSETS</h3>
          <ul>
            {bundle.assets.slice(0, 4).map((a) => (
              <li key={a.assetId}>
                {a.name} · {a.assetType} · v{a.version}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function ExperienceScenesPanel({ scenes, onOpenScene }: { scenes: readonly ExperienceScene[]; onOpenScene: (id: string) => void }) {
  return (
    <section className="site00-expws__list-panel">
      <h2>SCENES</h2>
      <ul className="site00-expws__entity-list">
        {scenes.map((scene) => (
          <li key={scene.sceneId}>
            <div>
              <strong>{scene.name}</strong>
              <span>{scene.status.replace(/_/g, ' ')}</span>
              {scene.parentSceneId ? <span className="site00-expws__sub">CHILD SCENE</span> : null}
            </div>
            <button type="button" onClick={() => onOpenScene(scene.sceneId)}>
              OPEN SCENE
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ExperienceCharactersPanel({ characters }: { characters: readonly ExperienceCharacter[] }) {
  return (
    <section className="site00-expws__list-panel">
      <h2>CHARACTERS</h2>
      <ul className="site00-expws__entity-list">
        {characters.map((c) => (
          <li key={c.characterId}>
            <strong>{c.name}</strong>
            <span>{c.characterType}</span>
            <span>{c.primaryDccTool ?? '—'} → runtime</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ExperienceAssetsPanel({ assets }: { assets: readonly ExperienceAsset[] }) {
  return (
    <section className="site00-expws__list-panel">
      <h2>EXPERIENCE ASSETS</h2>
      <ul className="site00-expws__entity-list">
        {assets.map((a) => (
          <li key={a.assetId}>
            <strong>{a.name}</strong>
            <span>{a.assetType}</span>
            <span>v{a.version}</span>
            {a.parentVersionId ? <span>derived</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ExperienceMechanicsPanel({
  mechanics,
  onTest,
}: {
  mechanics: readonly ExperienceMechanic[];
  onTest: (id: string) => void;
}) {
  return (
    <section className="site00-expws__list-panel">
      <h2>MECHANICS</h2>
      <ul className="site00-expws__entity-list">
        {mechanics.map((m) => (
          <li key={m.mechanicId}>
            <div>
              <strong>{m.name}</strong>
              <span>{m.category}</span>
              <span>{m.testState}</span>
            </div>
            <button type="button" onClick={() => onTest(m.mechanicId)}>
              INSPECT / TEST
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ExperienceBuildsPanel({ builds }: { builds: readonly ExperienceBuild[] }) {
  return (
    <section className="site00-expws__list-panel">
      <h2>BUILDS</h2>
      <ul className="site00-expws__entity-list">
        {builds.map((b) => (
          <li key={b.buildId}>
            <strong>{b.version}</strong>
            <span>{b.status}</span>
            <span>{b.targetPlatform}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ExperienceHistoryPanel({ activity }: { activity: readonly ExperienceActivityEvent[] }) {
  return (
    <section className="site00-expws__list-panel">
      <h2>HISTORY</h2>
      <ul className="site00-expws__entity-list">
        {activity.map((evt) => (
          <li key={evt.eventId}>
            <strong>{evt.kind}</strong>
            <span>{evt.summary}</span>
            <time dateTime={evt.at}>{evt.at}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ExperienceMorePanel() {
  return (
    <section className="site00-expws__list-panel">
      <h2>MORE</h2>
      <p>Tool plans, tasks, and registry surfaces — wired for future Opus refinement.</p>
    </section>
  );
}

export function ExperienceEmptyState({ projectSlug }: { projectSlug: string }) {
  return (
    <div className="site00-expws__empty" data-testid="experience-empty">
      <h2>NO EXPERIENCES CONFIGURED</h2>
      <p>Project {projectSlug.toUpperCase()} has the Experience module enabled but no fixture records yet.</p>
    </div>
  );
}
