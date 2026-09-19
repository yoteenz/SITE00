/**
 * P0.CR.1 — Realism Lab founder UI (visual-first comparison studio).
 */

import { Link, useLocation } from 'react-router-dom';
import type { RealismLabState, RealismExperiment, RealismLaneRun } from '../../../../shared/site00-studio-world-production/cinematicRealismLab/types.js';
import {
  FOUNDER_JUDGMENT_LABELS,
  REALISM_LANE_DEFINITIONS,
  getProviderRegistry,
  CINEMATIC_REALISM_CANON,
  listShotBibleEntries,
} from '../../../../shared/site00-studio-world-production/cinematicRealismLab/client.js';
import {
  site00ProjectRealismLabBriefPath,
  site00ProjectRealismLabContinuityPath,
  site00ProjectRealismLabDecisionPath,
  site00ProjectRealismLabPath,
  site00ProjectRealismLabProvidersPath,
  site00ProjectRealismLabReviewPath,
  site00ProjectRealismLabRunsPath,
} from '../../config/routes';

type Props = {
  projectSlug: string;
  state: RealismLabState | null;
  busy: boolean;
  onQueueLanes: (experimentId: string) => void;
  onSimulateOutputs: (experimentId: string) => void;
  onJudgment: (experimentId: string, runId: string, assetId: string, judgment: string) => void;
  onFinalize: (experimentId: string) => void;
};

const NAV = [
  { label: 'OVERVIEW', path: (s: string) => site00ProjectRealismLabPath(s) },
  { label: 'BRIEF', path: (s: string) => site00ProjectRealismLabBriefPath(s) },
  { label: 'PROVIDERS', path: (s: string) => site00ProjectRealismLabProvidersPath(s) },
  { label: 'RUNS', path: (s: string) => site00ProjectRealismLabRunsPath(s) },
  { label: 'REVIEW', path: (s: string) => site00ProjectRealismLabReviewPath(s) },
  { label: 'CONTINUITY', path: (s: string) => site00ProjectRealismLabContinuityPath(s) },
  { label: 'DECISION', path: (s: string) => site00ProjectRealismLabDecisionPath(s) },
];

function activeExperiment(state: RealismLabState | null): RealismExperiment | null {
  return state?.experiments[0] ?? null;
}

function LaneCard({
  run,
  experimentId,
  busy,
  onJudgment,
}: {
  run: RealismLaneRun;
  experimentId: string;
  busy: boolean;
  onJudgment: Props['onJudgment'];
}) {
  const lane = REALISM_LANE_DEFINITIONS.find((l) => l.laneId === run.laneId);
  const asset = run.assets[0];
  return (
    <article className="site00-crl-lane-card" data-lane={run.laneId}>
      <header className="site00-crl-lane-card__head">
        <h3>{lane?.label ?? run.laneId}</h3>
        <span className={`site00-crl-readiness site00-crl-readiness--${run.readiness.toLowerCase()}`}>
          {run.readiness}
        </span>
      </header>
      <div className="site00-crl-lane-card__preview" aria-label="Output preview">
        {asset?.placeholder ? (
          <div className="site00-crl-ghost-frame">
            <span>{asset.kind}</span>
            <p>Placeholder — wire provider to replace</p>
          </div>
        ) : asset?.url ? (
          asset.kind === 'VIDEO' ? (
            <video src={asset.url} controls className="site00-crl-media" />
          ) : (
            <img src={asset.url} alt="" className="site00-crl-media" />
          )
        ) : (
          <div className="site00-crl-ghost-frame site00-crl-ghost-frame--empty">
            <p>Awaiting founder-triggered run</p>
          </div>
        )}
      </div>
      <dl className="site00-crl-lane-card__meta">
        <div>
          <dt>Status</dt>
          <dd>{run.status}</dd>
        </div>
        <div>
          <dt>Workflow</dt>
          <dd>{run.workflowKind.replace(/_/g, ' ')}</dd>
        </div>
        <div>
          <dt>Est. cost</dt>
          <dd>{run.costEstimateUsd != null ? `$${run.costEstimateUsd.toFixed(2)}` : '—'}</dd>
        </div>
      </dl>
      {run.error ? <p className="site00-crl-lane-card__note">{run.error}</p> : null}
      {asset ? (
        <div className="site00-crl-judgment-row">
          {(['THIS_FEELS_REAL', 'CLOSE_BUT_OFF', 'TOO_AI', 'BEST_MOTION', 'BEST_FACE', 'KEEP_AS_BENCHMARK'] as const).map(
            (j) => (
              <button
                key={j}
                type="button"
                className="site00-crl-judgment-btn"
                disabled={busy}
                onClick={() => onJudgment(experimentId, run.runId, asset.assetId, j)}
              >
                {FOUNDER_JUDGMENT_LABELS[j]}
              </button>
            ),
          )}
        </div>
      ) : null}
    </article>
  );
}

export function RealismLabOperateLayer({
  projectSlug,
  state,
  busy,
  onQueueLanes,
  onSimulateOutputs,
  onJudgment,
  onFinalize,
}: Props) {
  const location = useLocation();
  const experiment = activeExperiment(state);
  const providers = getProviderRegistry();

  const isOverview = location.pathname.replace(/\/+$/, '') === site00ProjectRealismLabPath(projectSlug).replace(/\/+$/, '');

  return (
    <div className="site00-crl" data-visual-reconstruction="realism-lab">
      <nav className="site00-crl-subnav" aria-label="Realism Lab sections">
        {NAV.map((item) => {
          const href = item.path(projectSlug);
          const active = location.pathname.replace(/\/+$/, '') === href.replace(/\/+$/, '');
          return (
            <Link key={item.label} to={href} className={active ? 'site00-crl-subnav__link site00-crl-subnav__link--active' : 'site00-crl-subnav__link'}>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {(isOverview || location.pathname.includes('/realism-lab/runs')) && (
        <section className="site00-crl-panel">
          <header className="site00-crl-panel__head">
            <div>
              <p className="site00-crl-kicker">REALISM LAB</p>
              <h2>{experiment?.name ?? 'No active experiment'}</h2>
              <p className="site00-crl-subtitle">{experiment?.status ?? '—'} · Est. ${state?.accounting.totalEstimatedUsd.toFixed(2) ?? '0.00'}</p>
            </div>
            {experiment ? (
              <div className="site00-crl-actions">
                <button type="button" className="site00-crl-action" disabled={busy} onClick={() => onQueueLanes(experiment.experimentId)}>
                  QUEUE LANES →
                </button>
                <button type="button" className="site00-crl-action site00-crl-action--secondary" disabled={busy} onClick={() => onSimulateOutputs(experiment.experimentId)}>
                  SIMULATE OUTPUTS (DEV)
                </button>
              </div>
            ) : null}
          </header>
          <div className="site00-crl-lane-grid">
            {(experiment?.laneRuns ?? []).map((run) => (
              <LaneCard
                key={run.runId}
                run={run}
                experimentId={experiment!.experimentId}
                busy={busy}
                onJudgment={onJudgment}
              />
            ))}
          </div>
        </section>
      )}

      {location.pathname.includes('/brief') && experiment ? (
        <section className="site00-crl-panel">
          <h2>Experiment Brief</h2>
          <p className="site00-crl-brief">{experiment.shotBrief.sceneDescription}</p>
          <dl className="site00-crl-detail-grid">
            <div><dt>Shot type</dt><dd>{experiment.shotBrief.shotType.replace(/_/g, ' ')}</dd></div>
            <div><dt>Environment</dt><dd>{experiment.shotBrief.environment}</dd></div>
            <div><dt>Wardrobe</dt><dd>{experiment.shotBrief.wardrobe}</dd></div>
            <div><dt>Camera</dt><dd>{experiment.shotBrief.cameraBehavior}</dd></div>
            <div><dt>Voice</dt><dd>{experiment.shotBrief.voiceMode.replace(/_/g, ' ')}</dd></div>
            <div><dt>Test type</dt><dd>{experiment.testType.replace(/_/g, ' ')}</dd></div>
          </dl>
          <h3>Realism Canon</h3>
          <p>{CINEMATIC_REALISM_CANON.northStar}</p>
        </section>
      ) : null}

      {location.pathname.includes('/providers') && (
        <section className="site00-crl-panel">
          <h2>Provider Matrix</h2>
          <div className="site00-crl-provider-grid">
            {providers.map((p) => (
              <article key={p.providerId} className="site00-crl-provider-card">
                <h3>{p.label}</h3>
                <span className={`site00-crl-readiness site00-crl-readiness--${p.readiness.toLowerCase()}`}>{p.readiness}</span>
                <p><strong>Strengths:</strong> {p.strengthDomains.join(', ')}</p>
                <p><strong>Weaknesses:</strong> {p.weaknessDomains.join(', ')}</p>
                <p><strong>Est.</strong> {p.costEstimateUsdPerClip != null ? `$${p.costEstimateUsdPerClip}/clip` : '—'}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {location.pathname.includes('/review') && experiment ? (
        <section className="site00-crl-panel">
          <h2>Run Review — Side by Side</h2>
          <div className="site00-crl-lane-grid site00-crl-lane-grid--review">
            {experiment.laneRuns.map((run) => (
              <LaneCard key={run.runId} run={run} experimentId={experiment.experimentId} busy={busy} onJudgment={onJudgment} />
            ))}
          </div>
        </section>
      ) : null}

      {location.pathname.includes('/continuity') && experiment?.referencePack ? (
        <section className="site00-crl-panel">
          <h2>Reference Pack — {experiment.referencePack.label}</h2>
          <ul className="site00-crl-ref-list">
            {experiment.referencePack.items.map((item) => (
              <li key={item.referenceId}>
                <strong>{item.label}</strong>
                <span>{item.type} · {item.role}</span>
                <span>{item.continuityCritical ? 'CONTINUITY CRITICAL' : item.approvalState}</span>
              </li>
            ))}
          </ul>
          <h3>Shot Bible Categories</h3>
          <ul className="site00-crl-shot-list">
            {listShotBibleEntries().slice(0, 5).map((s) => (
              <li key={s.shotType}>{s.label}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {location.pathname.includes('/decision') && experiment ? (
        <section className="site00-crl-panel">
          <h2>Final Recommendation</h2>
          {experiment.decisionSummary ? (
            <dl className="site00-crl-detail-grid">
              <div><dt>Top realism</dt><dd>{experiment.decisionSummary.topProviderByRealism ?? '—'}</dd></div>
              <div><dt>Top motion</dt><dd>{experiment.decisionSummary.topProviderByMotion ?? '—'}</dd></div>
              <div><dt>Top identity</dt><dd>{experiment.decisionSummary.topProviderByIdentity ?? '—'}</dd></div>
              <div><dt>Best hybrid</dt><dd>{experiment.decisionSummary.bestHybridStack ?? '—'}</dd></div>
            </dl>
          ) : (
            <p>No decision recorded yet.</p>
          )}
          <button type="button" className="site00-crl-action" disabled={busy} onClick={() => onFinalize(experiment.experimentId)}>
            FINALIZE DECISION →
          </button>
          {experiment.decisionSummary ? (
            <p className="site00-crl-brief">{experiment.decisionSummary.productionReadyRecommendation}</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
