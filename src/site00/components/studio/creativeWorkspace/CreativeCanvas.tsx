import type { CreativeArtifact, CreativeDirectorTaskMode } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import type { ConceptTerritoryArtifact } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import type { FounderJudgmentAction } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import { TerritoryBoard } from './TerritoryBoard';

type Props = {
  taskMode: CreativeDirectorTaskMode;
  territories: ConceptTerritoryArtifact[];
  activeArtifact: CreativeArtifact | null;
  runtimeBlocked: boolean;
  runError: string | null;
  territoryIndex: number;
  onTerritoryIndexChange: (idx: number) => void;
  comparePair: [string, string] | null;
  onCompare: (pair: [string, string] | null) => void;
  onJudgment: (action: FounderJudgmentAction, territoryId: string) => void;
  busy: boolean;
  onRun: () => void;
};

export function CreativeCanvas({
  taskMode,
  territories,
  activeArtifact,
  runtimeBlocked,
  runError,
  territoryIndex,
  onTerritoryIndexChange,
  comparePair,
  onCompare,
  onJudgment,
  busy,
  onRun,
}: Props) {
  if (taskMode === 'CONCEPT_TERRITORIES' || taskMode === 'HYBRIDIZE_TERRITORIES') {
    if (territories.length === 0) {
      return (
        <div className="ec-cw-canvas ec-cw-canvas--empty" data-testid="ec-cw-empty-territories">
          <h2>No territories generated yet</h2>
          <p>
            {runtimeBlocked
              ? 'Model runtime unavailable — configure OPENAI_API_KEY on the API host, then run founder-initiated CONCEPT_TERRITORIES.'
              : 'Awaiting founder run — no fabricated territories.'}
          </p>
          {!runtimeBlocked ? (
            <button type="button" className="ec-cw-btn" disabled={busy} onClick={onRun}>
              Run concept territories
            </button>
          ) : null}
          {runError ? <p className="ec-cw-canvas__error">{runError}</p> : null}
        </div>
      );
    }

    const compareTerritories = comparePair
      ? territories.filter((t) => comparePair.includes(t.territory_id))
      : [];

    return (
      <div className="ec-cw-canvas" data-testid="ec-cw-concept-canvas">
        <div className="ec-cw-canvas__toolbar">
          <span className="ec-cw-canvas__mode">CONCEPT TERRITORIES · {territories.length} boards</span>
          <div className="ec-cw-canvas__compare">
            {territories.length >= 2 ? (
              <button type="button" className="ec-cw-btn ec-cw-btn--ghost" onClick={() => onCompare([territories[0].territory_id, territories[1].territory_id])}>
                Compare {territories[0].territory_id} vs {territories[1].territory_id}
              </button>
            ) : null}
            {territories.length >= 3 ? (
              <>
                <button type="button" className="ec-cw-btn ec-cw-btn--ghost" onClick={() => onCompare([territories[0].territory_id, territories[2].territory_id])}>
                  {territories[0].territory_id} vs {territories[2].territory_id}
                </button>
                <button type="button" className="ec-cw-btn ec-cw-btn--ghost" onClick={() => onCompare([territories[1].territory_id, territories[2].territory_id])}>
                  {territories[1].territory_id} vs {territories[2].territory_id}
                </button>
              </>
            ) : null}
            {comparePair ? (
              <button type="button" className="ec-cw-btn ec-cw-btn--ghost" onClick={() => onCompare(null)}>
                Exit compare
              </button>
            ) : null}
          </div>
        </div>

        {comparePair && compareTerritories.length >= 2 ? (
          <div className="ec-cw-canvas__compare-grid">
            {compareTerritories.map((t) => (
              <TerritoryBoard key={t.territory_id} territory={t} onJudgment={onJudgment} disabled={busy} />
            ))}
          </div>
        ) : (
          <>
            <div className="ec-cw-canvas__desktop-grid ec-cw-canvas__desktop-only">
              {territories.map((t) => (
                <TerritoryBoard key={t.territory_id} territory={t} onJudgment={onJudgment} disabled={busy} />
              ))}
            </div>
            <div className="ec-cw-canvas__mobile-swipe ec-cw-canvas__mobile-only">
              {territories[territoryIndex] ? (
                <TerritoryBoard
                  territory={territories[territoryIndex]}
                  compact
                  onJudgment={onJudgment}
                  disabled={busy}
                />
              ) : null}
              <div className="ec-cw-canvas__swipe-nav">
                <button type="button" className="ec-cw-btn ec-cw-btn--ghost" disabled={territoryIndex <= 0} onClick={() => onTerritoryIndexChange(territoryIndex - 1)}>
                  ← Prev
                </button>
                <span>
                  {territoryIndex + 1} / {territories.length}
                </span>
                <button
                  type="button"
                  className="ec-cw-btn ec-cw-btn--ghost"
                  disabled={territoryIndex >= territories.length - 1}
                  onClick={() => onTerritoryIndexChange(territoryIndex + 1)}
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
        {activeArtifact ? (
          <p className="ec-cw-artifact-card">
            <span>{activeArtifact.task_mode}</span> · v{activeArtifact.artifact_id.slice(-6)} · {activeArtifact.approval_state}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="ec-cw-canvas ec-cw-canvas--mode" data-testid={`ec-cw-canvas-${taskMode}`}>
      <h2>{taskMode.replace(/_/g, ' ')}</h2>
      <p className="ec-cw-canvas__empty-copy">
        {activeArtifact
          ? 'Artifact loaded — switch task mode via run or thread settings to render this mode’s visual board.'
          : 'No artifact for this mode yet. Run the creative director when runtime is available.'}
      </p>
      <ModePlaceholder taskMode={taskMode} payload={activeArtifact?.payload} />
    </div>
  );
}

function ModePlaceholder({ taskMode, payload }: { taskMode: CreativeDirectorTaskMode; payload?: Record<string, unknown> }) {
  if (taskMode === 'EXPERIENCE_GRAPH' && payload?.routes && Array.isArray(payload.routes)) {
    const routes = payload.routes as Array<Record<string, unknown>>;
    return (
      <div className="ec-cw-graph" data-testid="ec-cw-experience-graph">
        {routes.slice(0, 12).map((r, i) => (
          <button key={String(r.id ?? i)} type="button" className="ec-cw-graph__node">
            <strong>{String(r.state ?? r.name ?? `NODE ${i + 1}`)}</strong>
            <span>{String(r.purpose ?? r.experience_name ?? 'Experience node')}</span>
          </button>
        ))}
      </div>
    );
  }
  if (taskMode === 'FAMILY_ARCHITECTURE' && payload?.families && Array.isArray(payload.families)) {
    const families = payload.families as Array<Record<string, unknown>>;
    return (
      <div className="ec-cw-families">
        {families.map((f, i) => (
          <article key={String(f.family_id ?? i)} className="ec-cw-family-board" data-testid="ec-cw-family-board">
            <h3>{String(f.name ?? f.family_id ?? 'Family')}</h3>
            <p>{String(f.purpose ?? '')}</p>
            <p className="ec-cw-leverage">
              UNLOCKS {String(f.unlock_count ?? f.screens_unlocked ?? '—')} SCREENS
            </p>
          </article>
        ))}
      </div>
    );
  }
  if (taskMode === 'SURFACE_EXPRESSION') {
    return (
      <div className="ec-cw-surfaces" data-testid="ec-cw-surface-expressions">
        {(['MOBILE WEB', 'TABLET WEB', 'DESKTOP WEB', 'CLIENT APP'] as const).map((label) => (
          <div key={label} className="ec-cw-surface-frame">
            <span>{label}</span>
            <div className="ec-cw-surface-frame__zones">
              <div className="ec-cw-surface-frame__nav">Nav</div>
              <div className="ec-cw-surface-frame__hero">Hero / hierarchy</div>
              <div className="ec-cw-surface-frame__cta">CTA</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (taskMode === 'AUTHORITY_BRIEF') {
    return (
      <div className="ec-cw-authority-board" data-testid="ec-cw-authority-board">
        <p>Authority board — visual approval frames appear when VISUAL_AUTHORITY_MODEL artifacts exist.</p>
        <div className="ec-cw-authority-placeholder">NO APPROVED AUTHORITY IMAGE · PREVIEW ONLY</div>
      </div>
    );
  }
  return null;
}
