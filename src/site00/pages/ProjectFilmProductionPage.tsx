import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
/**
 * P0.FILM.1 — Film production room (founder-facing).
 */

import { Link, useLocation, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { NdxFounderWorkspacePage } from '../components/founderWorkspace/NdxFounderWorkspacePage';
import { QuietAction, InlineMeta, WorkspaceField } from '../components/founderWorkspace/WorkspaceCompositionPrimitives';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectContentOperationsCampaignBoardPath } from '../config/routes';
import type { FilmProductionRecord, FilmProductionState } from '../../../shared/site00-studio-world-production/filmProduction/client.js';
import '../styles/site00-film-production.css';
import '../styles/site00-founder-workspace.css';

type FilmTab = 'overview' | 'dailies' | 'scene-deck';

export default function ProjectFilmProductionPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const location = useLocation();
  const [state, setState] = useState<FilmProductionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [activeFilmId, setActiveFilmId] = useState<string | null>(null);

  const tab: FilmTab = useMemo(() => {
    if (location.pathname.includes('/dailies')) return 'dailies';
    if (location.pathname.includes('/scene-deck')) return 'scene-deck';
    return 'overview';
  }, [location.pathname]);

  const reload = useCallback(async () => {
    if (!hasProjectCapability(projectSlug, 'FILM_PRODUCTION')) return;
    try {
      const result = await site00ProjectsApi.filmProductionGet(projectSlug);
      setState(result.state as unknown as FilmProductionState);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const act = async (fn: () => Promise<Record<string, unknown>>) => {
    setBusy(true);
    try {
      const result = await fn();
      setState(result.state as unknown as FilmProductionState);
    } finally {
      setBusy(false);
    }
  };

  const activeFilm = useMemo(
    () => state?.films.find((f) => f.filmId === activeFilmId) ?? state?.films[0] ?? null,
    [state, activeFilmId],
  );

  useEffect(() => {
    if (state?.films.length && !activeFilmId) {
      setActiveFilmId(state.films[0].filmId);
    }
  }, [state, activeFilmId]);

  const sectionTitle = tab === 'dailies' ? 'FOUNDER DAILIES' : tab === 'scene-deck' ? 'SCENE DECK' : 'FILM PRODUCTION';

  return (
    <NdxFounderWorkspacePage
      projectSlug={projectSlug}
      title={sectionTitle}
      subtitle="Script → Plan → Dailies → Scene Deck → Rough Cut"
      attentionBadge={activeFilm?.productionState === 'DAILIES_READY' ? 'DAILIES READY' : activeFilm?.productionState ?? 'PLANNING'}
      loading={loading}
      loadingLabel="Loading film production…"
      operate={
        <div className="site00-film-production">
          <nav className="site00-film-production-tabs">
            <Link to={`/projects/${projectSlug}/content-operations/film-production`} className={tab === 'overview' ? 'active' : ''}>Overview</Link>
            <Link to={`/projects/${projectSlug}/content-operations/film-production/dailies`} className={tab === 'dailies' ? 'active' : ''}>Dailies</Link>
            <Link to={`/projects/${projectSlug}/content-operations/film-production/scene-deck`} className={tab === 'scene-deck' ? 'active' : ''}>Scene Deck</Link>
          </nav>

          <WorkspaceField>
            <p className="site00-fws-field-label">Pilot Reels</p>
            <div className="site00-film-reel-list">
              {(state?.films ?? []).map((film) => (
                <button
                  key={film.filmId}
                  type="button"
                  className={`site00-film-reel-card ${activeFilm?.filmId === film.filmId ? 'active' : ''}`}
                  onClick={() => setActiveFilmId(film.filmId)}
                >
                  <strong>{film.title}</strong>
                  <InlineMeta label="Template" value={film.template} />
                  <InlineMeta label="State" value={film.productionState} />
                </button>
              ))}
            </div>
          </WorkspaceField>

          {!state?.films.length && (
            <QuietAction
              disabled={busy}
              onClick={() => act(() => site00ProjectsApi.filmProductionInitializePilots(projectSlug))}
            >
              Initialize Reel Pilots
            </QuietAction>
          )}

          {activeFilm && tab === 'overview' && (
            <FilmOverviewPanel film={activeFilm} busy={busy} projectSlug={projectSlug} onAct={act} />
          )}

          {activeFilm && tab === 'dailies' && (
            <FilmDailiesPanel film={activeFilm} busy={busy} projectSlug={projectSlug} onAct={act} />
          )}

          {activeFilm && tab === 'scene-deck' && <FilmSceneDeckPanel film={activeFilm} />}

          <Link to={site00ProjectContentOperationsCampaignBoardPath(projectSlug)}>← Campaign Board</Link>
        </div>
      }
      inspect={
        activeFilm ? (
          <dl>
            <dt>FILM ID</dt>
            <dd>{activeFilm.filmId}</dd>
            <dt>SHOTS</dt>
            <dd>{activeFilm.plan?.shots.length ?? 0}</dd>
            <dt>EST. COST</dt>
            <dd>${activeFilm.plan?.estimatedCostUsd.toFixed(2) ?? '0.00'}</dd>
            <dt>PROVIDER REQUESTS</dt>
            <dd>{activeFilm.accounting.providerRequests}</dd>
          </dl>
        ) : null
      }
      nonNdxFallback={<p>Film production is NDXBOOK-only.</p>}
    />
  );
}

function FilmOverviewPanel({
  film,
  busy,
  projectSlug,
  onAct,
}: {
  film: FilmProductionRecord;
  busy: boolean;
  projectSlug: string;
  onAct: (fn: () => Promise<Record<string, unknown>>) => Promise<void>;
}) {
  return (
    <div className="site00-film-overview">
      <WorkspaceField>
        <InlineMeta label="Production State" value={film.productionState} />
      </WorkspaceField>

      {film.plan && (
        <>
          <WorkspaceField>
            <InlineMeta label="Scenes" value={film.plan.scenes.length} />
            <InlineMeta label="Shots" value={film.plan.shots.length} />
            <InlineMeta label="Est. Cost" value={`$${film.plan.estimatedCostUsd.toFixed(2)}`} />
            <InlineMeta label="Template" value={film.plan.template} />
          </WorkspaceField>

          <WorkspaceField>
            <p className="site00-fws-field-label">Shot Lineup</p>
            <ol className="site00-film-shot-list">
              {film.plan.shots.map((shot) => (
                <li key={shot.shotId}>
                  <strong>{shot.shotClass}</strong> — {shot.storyFunction}
                  <InlineMeta label="Duration" value={`${shot.durationTarget}s`} />
                  <InlineMeta label="Risk" value={shot.riskProfile} />
                </li>
              ))}
            </ol>
          </WorkspaceField>
        </>
      )}

      {film.readiness && (
        <WorkspaceField>
          <p className="site00-fws-field-label">Readiness</p>
          {Object.entries(film.readiness.checks).map(([check, val]) => (
            <InlineMeta key={check} label={check} value={val.ready ? '✓' : `✗ ${val.blocker}`} />
          ))}
        </WorkspaceField>
      )}

      <div className="site00-film-actions">
        {!film.generationPlan?.approved && (
          <QuietAction
            disabled={busy}
            onClick={() => onAct(() => site00ProjectsApi.filmProductionApprovePlan(projectSlug, film.filmId))}
          >
            Approve Production Plan
          </QuietAction>
        )}
        {film.generationPlan?.approved && film.productionState !== 'DAILIES_READY' && (
          <QuietAction
            disabled={busy}
            onClick={() => onAct(() => site00ProjectsApi.filmProductionTriggerGeneration(projectSlug, film.filmId))}
          >
            Trigger Generation
          </QuietAction>
        )}
        <QuietAction
          disabled={busy}
          onClick={() => onAct(() => site00ProjectsApi.filmProductionRegisterCampaign(projectSlug))}
        >
          Register on Campaign Board
        </QuietAction>
      </div>
    </div>
  );
}

function FilmDailiesPanel({
  film,
  busy,
  projectSlug,
  onAct,
}: {
  film: FilmProductionRecord;
  busy: boolean;
  projectSlug: string;
  onAct: (fn: () => Promise<Record<string, unknown>>) => Promise<void>;
}) {
  if (!film.dailies.length) {
    return <p>No dailies yet. Approve production plan and trigger generation.</p>;
  }

  return (
    <div className="site00-film-dailies">
      {film.dailies.map((entry) => (
        <div key={entry.entryId} className="site00-film-dailies-card">
          <strong>Shot {entry.shotId}</strong>
          <InlineMeta label="Scene" value={entry.sceneId} />
          {entry.dialogue && <p className="site00-film-dialogue">"{entry.dialogue}"</p>}
          <InlineMeta label="QA" value={entry.qaScore?.toFixed(2) ?? '—'} />
          {entry.founderAction ? (
            <InlineMeta label="Reviewed" value={entry.founderAction} />
          ) : (
            <div className="site00-film-dailies-actions">
              {(['APPROVE', 'ALT', 'REGENERATE', 'TOO_AI', 'WRONG_ENERGY'] as const).map((action) => (
                <QuietAction
                  key={action}
                  disabled={busy}
                  onClick={() =>
                    onAct(() =>
                      site00ProjectsApi.filmProductionDailiesJudgment(projectSlug, film.filmId, entry.entryId, action),
                    )
                  }
                >
                  {action.replace(/_/g, ' ')}
                </QuietAction>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FilmSceneDeckPanel({ film }: { film: FilmProductionRecord }) {
  if (!film.sceneDeck) return <p>Scene deck not built yet.</p>;

  return (
    <div className="site00-film-scene-deck">
      <div className="site00-film-deck-strip">
        {film.sceneDeck.slots.map((slot) => (
          <div key={slot.slotId} className={`site00-film-deck-slot site00-film-deck-${slot.state.toLowerCase()}`}>
            <span className="site00-film-deck-order">{slot.order}</span>
            <strong>{slot.shotId.replace(/.*-shot-/, 'Shot ')}</strong>
            <InlineMeta label="State" value={slot.state.replace(/SHOT_/g, '')} />
            {slot.dialogue && <p className="site00-film-deck-dialogue">"{slot.dialogue}"</p>}
            {slot.durationSec ? <InlineMeta label="Duration" value={`${slot.durationSec}s`} /> : null}
          </div>
        ))}
      </div>

      {film.roughCut && (
        <WorkspaceField>
          <InlineMeta label="Rough Cut Status" value={film.roughCut.renderStatus} />
          <InlineMeta label="Duration" value={`${film.roughCut.edl.totalDuration}s`} />
          <InlineMeta label="Clips" value={film.roughCut.edl.decisions.length} />
        </WorkspaceField>
      )}
    </div>
  );
}
