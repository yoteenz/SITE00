import { useCallback, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { site00StudioPath } from '../../config/routes';
import { StudioShell } from '../../components/studio';
import {
  addCustomExperienceFromWorkspace,
  approveAuthorityCandidate,
  approveGraph,
  bootstrapGreenfieldWorkspace,
  computeWorkspaceMetrics,
  compileMasterPackFiles,
  compileSonnetLitePackFiles,
  emitOpenArtManifest,
  emitSonnetBatch,
  evaluateSonnetBatchReadiness,
  hybridizeConcept,
  ingestOpenArtManifest,
  loadOrBootstrapWorkspace,
  nextFounderAction,
  pipelineStageLabel,
  pushConcept,
  refineAuthority,
  selectConcept,
  sumPackBytes,
  switchToHybridMode,
  validatePackSize,
  type ExperienceCompilerWorkspaceState,
  type WorkspaceSection,
} from '../../../studioos/experience-compiler/workspace';
import { persistWorkspace } from '../../../studioos/experience-compiler/workspace/persistence';
import '../../../site00/styles/site00-experience-compiler-workspace.css';

const SECTIONS: { id: WorkspaceSection; label: string }[] = [
  { id: 'project', label: 'PROJECT' },
  { id: 'concept', label: 'CONCEPT' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'families', label: 'FAMILIES' },
  { id: 'authority', label: 'AUTHORITY' },
  { id: 'capabilities', label: 'CAPABILITIES' },
  { id: 'production', label: 'PRODUCTION' },
  { id: 'history', label: 'HISTORY' },
];

export default function ExperienceCompilerWorkspacePage() {
  const { projectSlug = 'site00' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as WorkspaceSection) || 'project';
  const [state, setState] = useState<ExperienceCompilerWorkspaceState>(() => loadOrBootstrapWorkspace(projectSlug));
  const [pushFeedback, setPushFeedback] = useState('');
  const [ingestJson, setIngestJson] = useState('');

  const setTab = (id: WorkspaceSection) => {
    setSearchParams({ tab: id });
  };

  const metrics = useMemo(() => computeWorkspaceMetrics(state), [state]);
  const nextAction = useMemo(() => nextFounderAction(state), [state]);
  const stage = useMemo(() => pipelineStageLabel(state.pipeline), [state.pipeline]);

  const openArt = useMemo(() => {
    if (!state.pipeline.authority_plan.length) return null;
    return emitOpenArtManifest(state.project_id, state.pipeline.authority_plan);
  }, [state.project_id, state.pipeline.authority_plan]);

  const packPreview = useMemo(() => {
    if (!state.pipeline.graph) return null;
    const master = compileMasterPackFiles({
      project_id: state.project_id,
      graph: state.pipeline.graph,
      families: state.pipeline.families,
      surfaces: state.pipeline.surface_expressions,
      plan: state.pipeline.authority_plan,
      assets: state.ingested_assets,
      lineage: { reviews: state.authority_reviews },
    });
    const lite = compileSonnetLitePackFiles(master);
    const size = validatePackSize(sumPackBytes(lite));
    return { master, lite, size };
  }, [state]);

  const sonnetEmit = useMemo(() => {
    if (!state.pipeline.graph || !state.pipeline.authority_plan.length) return null;
    const batchId = `sonnet_${state.project_id}_1`;
    const readiness = evaluateSonnetBatchReadiness(batchId, state.pipeline, state.ingested_assets, packPreview?.size.level !== 'block');
    return emitSonnetBatch({
      batch_id: batchId,
      project_id: state.project_id,
      mode: state.mode,
      graph: state.pipeline.graph,
      families: state.pipeline.families,
      plan: state.pipeline.authority_plan,
      pack_filename: 'SONNET_LITE_PACK.json',
      status: readiness.status,
    });
  }, [state, packPreview?.size.level]);

  const concepts = state.pipeline.concept_set?.concepts ?? [];
  const conceptIdx = state.concept_index;
  const activeConcept = concepts[conceptIdx];

  const authorityPlan = state.pipeline.authority_plan;
  const authIdx = state.authority_review_index;
  const activeAuthority = authorityPlan[authIdx];

  const touchStartX = useCallback((start: number, end: number, onPrev: () => void, onNext: () => void) => {
    const delta = end - start;
    if (delta > 60) onPrev();
    if (delta < -60) onNext();
  }, []);

  const runIngest = () => {
    try {
      const manifest = JSON.parse(ingestJson);
      const result = ingestOpenArtManifest(manifest, state.pipeline.authority_plan, state.ingested_assets);
      if (!result.ok) {
        alert(result.errors.join('\n'));
        return;
      }
      const next = {
        ...state,
        ingested_assets: [...state.ingested_assets, ...result.assets],
        history: [
          ...state.history,
          { id: String(Date.now()), at: new Date().toISOString(), kind: 'INGEST', detail: `Ingested ${result.assets.length} assets` },
        ],
      };
      setState(next);
      persistWorkspace(next);
    } catch (e) {
      alert(String(e));
    }
  };

  const simulateGreenfieldIngest = () => {
    if (!openArt) return;
    const entries = openArt.records.map((r) => ({
      authority_id: r.authority_id,
      candidate_id: `${r.authority_id}_cand_v1`,
      generation_id: `gen_${r.authority_id}`,
      family_id: r.family_id,
      surface: r.surface,
      version: 1,
      expected_filename: r.expected_filename,
      byte_length: 400_000,
    }));
    const manifest = { batch_id: openArt.batches[0]?.batch_id ?? 'sim', project_id: state.project_id, entries };
    const result = ingestOpenArtManifest(manifest, state.pipeline.authority_plan, state.ingested_assets);
    if (result.ok) {
      const next = { ...state, ingested_assets: [...state.ingested_assets, ...result.assets] };
      setState(next);
      persistWorkspace(next);
    }
  };

  const copySonnet = () => {
    if (!sonnetEmit) return;
    void navigator.clipboard.writeText(sonnetEmit.sprint_prompt);
  };

  const downloadPackJson = () => {
    if (!packPreview) return;
    const blob = new Blob([JSON.stringify({ files: packPreview.lite.map((f) => ({ path: f.path, bytes: f.byte_length })) }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.project_id}-authority-lite-manifest.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StudioShell>
      <div className="ec-workspace">
        <header className="ec-workspace__header">
          <div>
            <p className="ec-workspace__kicker">EXPERIENCE COMPILER</p>
            <h1 className="ec-workspace__title">{state.project_name}</h1>
            <p className="ec-workspace__meta">
              MODE {state.mode} · STAGE {stage} · NEXT: {nextAction}
            </p>
          </div>
          <Link className="ec-workspace__back" to={site00StudioPath(projectSlug)}>
            ← STUDIO
          </Link>
        </header>

        <nav className="ec-workspace__nav" aria-label="Workspace sections">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={tab === s.id ? 'ec-workspace__nav-btn is-active' : 'ec-workspace__nav-btn'}
              onClick={() => setTab(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {tab === 'project' && (
          <section className="ec-panel">
            <h2>Decision dashboard</h2>
            <div className="ec-metrics">
              <div><span>Routes</span><strong>{metrics.routes}</strong></div>
              <div><span>Families</span><strong>{metrics.families}</strong></div>
              <div><span>Authorities req.</span><strong>{metrics.authorities_required}</strong></div>
              <div><span>Approved</span><strong>{metrics.authorities_approved}</strong></div>
              <div><span>Screens unlocked</span><strong>{metrics.screens_unlocked}</strong></div>
              <div><span>Sonnet-ready</span><strong>{metrics.sonnet_ready_batches}</strong></div>
            </div>
            {state.site00_authority_count != null && (
              <p className="ec-note">SITE 00 active redesign authorities: {state.site00_authority_count}. Gaps: {state.site00_authority_gaps.length}</p>
            )}
            {state.mode === 'INGEST' && (
              <button type="button" className="ec-btn" onClick={() => setState((s) => switchToHybridMode(s))}>
                RECONCEPT → HYBRID
              </button>
            )}
            {projectSlug !== 'lumina-atelier' && (
              <button type="button" className="ec-btn ec-btn--ghost" onClick={() => setState(bootstrapGreenfieldWorkspace('lumina-atelier'))}>
                Load greenfield demo (LUMINA)
              </button>
            )}
          </section>
        )}

        {tab === 'concept' && state.mode === 'INGEST' && (
          <section className="ec-panel">
            <h2>Current experience truth</h2>
            <p>Ingest mode — no forced three concepts. Review gaps and extensions.</p>
            <ul className="ec-list">
              {state.site00_authority_gaps.slice(0, 12).map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </section>
        )}

        {tab === 'concept' && (state.mode === 'GREENFIELD' || state.mode === 'HYBRID') && activeConcept && (
          <section
            className="ec-panel ec-concept-review"
            onTouchStart={(e) => ((e.currentTarget as HTMLElement & { _x?: number })._x = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              const start = (e.currentTarget as HTMLElement & { _x?: number })._x ?? 0;
              touchStartX(
                start,
                e.changedTouches[0].clientX,
                () => setState((s) => ({ ...s, concept_index: Math.max(0, s.concept_index - 1) })),
                () => setState((s) => ({ ...s, concept_index: Math.min(concepts.length - 1, s.concept_index + 1) })),
              );
            }}
          >
            <div className="ec-concept-nav">
              <button type="button" disabled={conceptIdx <= 0} onClick={() => setState((s) => ({ ...s, concept_index: s.concept_index - 1 }))}>
                ← Prev
              </button>
              <span>
                Concept {conceptIdx + 1} / {concepts.length}
              </span>
              <button
                type="button"
                disabled={conceptIdx >= concepts.length - 1}
                onClick={() => setState((s) => ({ ...s, concept_index: s.concept_index + 1 }))}
              >
                Next →
              </button>
            </div>
            <h2>{activeConcept.name}</h2>
            <p className="ec-premise">{activeConcept.one_line_premise}</p>
            <dl className="ec-dl">
              <dt>Thesis</dt>
              <dd>{activeConcept.experience_thesis}</dd>
              <dt>Mobile</dt>
              <dd>{activeConcept.mobile_premise}</dd>
              <dt>Custom</dt>
              <dd>{activeConcept.custom_experiences.join(', ')}</dd>
            </dl>
            <div className="ec-actions">
              <button type="button" className="ec-btn" onClick={() => setState((s) => selectConcept(s, activeConcept.concept_id))}>
                LOVE IT / SELECT
              </button>
              <button
                type="button"
                className="ec-btn ec-btn--ghost"
                onClick={() => {
                  const other = concepts.find((c) => c.concept_id !== activeConcept.concept_id);
                  if (other) setState((s) => hybridizeConcept(s, activeConcept.concept_id, other.concept_id, ['CONCIERGE'], 'Workspace hybrid'));
                }}
              >
                HYBRIDIZE
              </button>
            </div>
            <label className="ec-field">
              Push conceptually (feedback)
              <input value={pushFeedback} onChange={(e) => setPushFeedback(e.target.value)} placeholder="Make this more immersive…" />
            </label>
            <button
              type="button"
              className="ec-btn"
              disabled={!pushFeedback.trim()}
              onClick={() => {
                setState((s) => pushConcept(s, activeConcept.concept_id, pushFeedback));
                setPushFeedback('');
              }}
            >
              PUSH CONCEPTUALLY
            </button>
          </section>
        )}

        {tab === 'experience' && state.pipeline.graph && (
          <section className="ec-panel">
            <h2>Experience graph</h2>
            <p>{state.pipeline.graph.nodes.length} routes · {state.pipeline.graph.custom_experiences.length} custom</p>
            <div className="ec-view-toggle">
              <span>LIST</span>
            </div>
            <ul className="ec-list ec-list--scroll">
              {state.pipeline.graph.nodes.slice(0, 40).map((n) => (
                <li key={n.route_id}>
                  <code>{n.route}</code> · {n.experience_unit} · {n.family}
                </li>
              ))}
            </ul>
            <button type="button" className="ec-btn" onClick={() => setState((s) => approveGraph(s))}>
              APPROVE GRAPH (Gate A + compile families)
            </button>
            <button
              type="button"
              className="ec-btn ec-btn--ghost"
              onClick={() =>
                setState((s) =>
                  addCustomExperienceFromWorkspace(s, {
                    name: 'Workspace Custom Lab',
                    purpose: 'Founder-defined custom experience',
                    inherits_from: ['MULTI_STEP_CONFIGURATION'],
                  }),
                )
              }
            >
              ADD CUSTOM EXPERIENCE
            </button>
          </section>
        )}

        {tab === 'families' && (
          <section className="ec-panel">
            <h2>Families & surfaces</h2>
            {state.pipeline.families.map((f) => (
              <article key={f.family_id} className="ec-family-card">
                <h3>{f.name}</h3>
                <p>{f.grammar_description}</p>
                <p>Routes: {f.route_ids.length}</p>
                <ul className="ec-list">
                  {state.pipeline.surface_expressions
                    .filter((sx) => sx.family_id === f.family_id)
                    .map((sx) => (
                      <li key={`${f.family_id}-${sx.surface}`}>
                        {sx.surface}: {sx.responsive_relationship}
                        {sx.mobile_authority_required ? ' · mobile authority' : ''}
                        {sx.desktop_authority_required ? ' · desktop authority' : ''}
                      </li>
                    ))}
                </ul>
              </article>
            ))}
          </section>
        )}

        {tab === 'authority' && activeAuthority && (
          <section
            className="ec-panel ec-authority-review"
            onTouchStart={(e) => ((e.currentTarget as HTMLElement & { _x?: number })._x = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              const start = (e.currentTarget as HTMLElement & { _x?: number })._x ?? 0;
              touchStartX(
                start,
                e.changedTouches[0].clientX,
                () => setState((s) => ({ ...s, authority_review_index: Math.max(0, s.authority_review_index - 1) })),
                () =>
                  setState((s) => ({
                    ...s,
                    authority_review_index: Math.min(authorityPlan.length - 1, s.authority_review_index + 1),
                  })),
              );
            }}
          >
            <div className="ec-concept-nav">
              <button type="button" disabled={authIdx <= 0} onClick={() => setState((s) => ({ ...s, authority_review_index: s.authority_review_index - 1 }))}>
                ← Prev
              </button>
              <span>
                {authIdx + 1} / {authorityPlan.length}
              </span>
              <button
                type="button"
                disabled={authIdx >= authorityPlan.length - 1}
                onClick={() => setState((s) => ({ ...s, authority_review_index: s.authority_review_index + 1 }))}
              >
                Next →
              </button>
            </div>
            <h2>{activeAuthority.authority_id}</h2>
            <p>
              {activeAuthority.family_id} · {activeAuthority.surface}
            </p>
            <p className="ec-leverage">Unlocks ~{activeAuthority.routes_unlocked} routes · {activeAuthority.states_unlocked} states</p>
            <div className="ec-candidate-placeholder">Candidate preview (ingest or generate externally)</div>
            <div className="ec-actions">
              <button type="button" className="ec-btn" onClick={() => setState((s) => approveAuthorityCandidate(s, activeAuthority.authority_id))}>
                LOVE IT
              </button>
              <button type="button" className="ec-btn ec-btn--ghost" onClick={() => setState((s) => refineAuthority(s, activeAuthority.authority_id, 'Refine composition'))}>
                REFINE
              </button>
            </div>
          </section>
        )}

        {tab === 'capabilities' && (
          <section className="ec-panel">
            <h2>Capabilities</h2>
            <p className="ec-note">Functional reuse only — client visual grammar stays project-scoped.</p>
            <ul className="ec-list">
              {state.pipeline.capabilities.map((c) => (
                <li key={c.capability_id}>
                  {c.name} · {c.maturity} · {c.reusability}
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === 'production' && (
          <section className="ec-panel">
            <h2>Production pipeline</h2>
            {openArt && (
              <div className="ec-subpanel">
                <h3>OpenArt manifest preview</h3>
                <p>{openArt.preview.generation_count} generations · surfaces: {openArt.preview.surfaces.join(', ')}</p>
                <button type="button" className="ec-btn ec-btn--ghost" onClick={() => navigator.clipboard.writeText(JSON.stringify(openArt.records, null, 2))}>
                  COPY MANIFEST JSON
                </button>
              </div>
            )}
            <div className="ec-subpanel">
              <h3>Ingest</h3>
              <textarea className="ec-textarea" value={ingestJson} onChange={(e) => setIngestJson(e.target.value)} placeholder="Paste OpenArt ingest manifest JSON" rows={4} />
              <button type="button" className="ec-btn" onClick={runIngest}>
                INGEST MANIFEST
              </button>
              {state.mode === 'GREENFIELD' && (
                <button type="button" className="ec-btn ec-btn--ghost" onClick={simulateGreenfieldIngest}>
                  Simulate ingest (demo)
                </button>
              )}
            </div>
            {packPreview && (
              <div className="ec-subpanel">
                <h3>Pack preview</h3>
                <p>{packPreview.size.message}</p>
                <button type="button" className="ec-btn" onClick={downloadPackJson} disabled={packPreview.size.level === 'block'}>
                  DOWNLOAD LITE MANIFEST
                </button>
              </div>
            )}
            {sonnetEmit && (
              <div className="ec-subpanel">
                <h3>Sonnet batch · {sonnetEmit.status}</h3>
                <button type="button" className="ec-btn" onClick={copySonnet} disabled={sonnetEmit.status !== 'SONNET_READY'}>
                  COPY SONNET SPRINT
                </button>
              </div>
            )}
          </section>
        )}

        {tab === 'history' && (
          <section className="ec-panel">
            <h2>History</h2>
            <ul className="ec-list ec-list--scroll">
              {[...state.history].reverse().map((h) => (
                <li key={h.id}>
                  <time>{h.at}</time> · {h.kind}: {h.detail}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </StudioShell>
  );
}
