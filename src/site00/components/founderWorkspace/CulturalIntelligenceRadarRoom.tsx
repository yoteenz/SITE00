/**
 * Cultural Intelligence — radar room operate layer.
 */

import { Link } from 'react-router-dom';
import type { LiveCulturalIntelligenceRun } from '../../../../shared/site00-studio-world-production/liveCulturalIntelligence/types';
import {
  site00ProjectCulturalIntelligenceSourcesPath,
  site00ProjectCulturalIntelligenceWeeklyForecastPath,
} from '../../config/routes';
import { FounderEmptyState, FounderWorkspacePanel } from './FounderWorkspaceShell';

type Props = {
  projectSlug: string;
  run: LiveCulturalIntelligenceRun | null;
  loading: boolean;
  busy: boolean;
  onConfigure: () => void;
  onRefresh: () => void;
  onPromoteOpportunities: () => void;
  onPromoteItem: (id: string) => void;
};

function signalLead(signal: LiveCulturalIntelligenceRun['signals'][number]): string {
  if (signal.velocity >= 0.6 && signal.saturation < 0.7) return 'Pattern forming →';
  if (signal.lifecycleState === 'EMERGING') return 'Emerging →';
  return signal.lifecycleState.replace(/_/g, ' ');
}

export function CulturalIntelligenceRadarRoom({
  projectSlug,
  run,
  loading,
  busy,
  onConfigure,
  onRefresh,
  onPromoteOpportunities,
  onPromoteItem,
}: Props) {
  if (loading) {
    return <p className="site00-fws-empty">Loading live signals…</p>;
  }

  if (!run?.sourceAdapters.length) {
    return (
      <>
        <FounderEmptyState
          title="NOT ENOUGH SIGNAL YET"
          body="NDX is watching. Configure the intelligence layer to begin acquiring live cultural signals."
        />
        <button type="button" className="site00-fws-pulse__cta" disabled={busy} onClick={onConfigure} style={{ marginTop: 12 }}>
          CONFIGURE INTELLIGENCE LAYER →
        </button>
      </>
    );
  }

  const topSignals = [...(run.signals ?? [])]
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 8);
  const opportunities =
    run.brandInterpretations?.filter(
      (i) => i.decision === 'STRONG_OPPORTUNITY' || i.decision === 'CALLBACK_OPPORTUNITY',
    ) ?? [];
  const keywords = [...new Set(run.signals.flatMap((s) => s.keywords ?? []).slice(0, 12))] as string[];

  return (
    <>
      <div className="site00-fws-pulse" style={{ marginBottom: 16 }}>
        <div className="site00-fws-pulse__metrics">
          <div className="site00-fws-pulse__metric">
            <span className="site00-fws-pulse__value">{run.signals.length}</span>
            <span className="site00-fws-pulse__label">LIVE SIGNALS</span>
          </div>
          <div className="site00-fws-pulse__metric">
            <span className="site00-fws-pulse__value">{opportunities.length}</span>
            <span className="site00-fws-pulse__label">NDX OPPORTUNITIES</span>
          </div>
          <div className="site00-fws-pulse__metric">
            <span className="site00-fws-pulse__value">{run.upcomingMoments?.length ?? 0}</span>
            <span className="site00-fws-pulse__label">COMING</span>
          </div>
        </div>
        <button type="button" className="site00-fws-pulse__cta" disabled={busy} onClick={onRefresh}>
          REFRESH LIVE →
        </button>
      </div>

      <FounderWorkspacePanel title="LIVE SIGNALS">
        {topSignals.length === 0 ? (
          <FounderEmptyState title="NO SIGNALS LOADED" body="Run refresh or check source health." />
        ) : (
          <ul className="site00-fws-signal-list">
            {topSignals.map((s) => (
              <li key={s.id} className="site00-fws-signal-list__item">
                <strong>{s.title}</strong>
                <span>{signalLead(s)}</span>
                <span className="site00-fws-signal-list__meta">{s.sourceType.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        )}
      </FounderWorkspacePanel>

      {keywords.length > 0 ? (
        <FounderWorkspacePanel title="TRENDING KEYWORDS">
          <div className="site00-fws-keyword-field">
            {keywords.map((k) => (
              <span key={k} className="site00-fws-keyword">
                {k}
              </span>
            ))}
          </div>
        </FounderWorkspacePanel>
      ) : null}

      <FounderWorkspacePanel title="ON NDX'S RADAR">
        {opportunities.length === 0 ? (
          <FounderEmptyState
            title="NOT ENOUGH SIGNAL YET"
            body="Nothing deserves promotion to a content opportunity yet."
          />
        ) : (
          <ul className="site00-fws-signal-list">
            {opportunities.slice(0, 6).map((i) => (
              <li key={i.id} className="site00-fws-signal-list__item">
                <strong>{i.reasoning.slice(0, 80)}</strong>
                <span>{i.decision.replace(/_/g, ' ')}</span>
                <button type="button" className="site00-fws-asset__review" disabled={busy} onClick={() => onPromoteItem(i.id)}>
                  PROMOTE →
                </button>
              </li>
            ))}
          </ul>
        )}
        {opportunities.length > 0 ? (
          <button type="button" className="site00-fws-inspect-trigger" disabled={busy} onClick={onPromoteOpportunities} style={{ marginTop: 12 }}>
            PROMOTE ALL OPPORTUNITIES → CONTENT OPS
          </button>
        ) : null}
      </FounderWorkspacePanel>

      <FounderWorkspacePanel title="WEEKLY FORECAST">
        <Link to={site00ProjectCulturalIntelligenceWeeklyForecastPath(projectSlug)} className="site00-fws-pulse__cta">
          OPEN WEEKLY FORECAST →
        </Link>
        <Link to={site00ProjectCulturalIntelligenceSourcesPath(projectSlug)} className="site00-fws-inspect-trigger" style={{ display: 'block', marginTop: 8 }}>
          SOURCE HEALTH →
        </Link>
      </FounderWorkspacePanel>
    </>
  );
}

export function CulturalIntelligenceInspectContent({
  run,
  busy,
  onConfigure,
  onRefresh,
  onProvingRun,
  onPromoteOpportunities,
  view,
  accelerating,
  opportunities,
  skip,
}: {
  run: LiveCulturalIntelligenceRun | null;
  busy: boolean;
  onConfigure: () => void;
  onRefresh: () => void;
  onProvingRun: () => void;
  onPromoteOpportunities: () => void;
  view: string;
  accelerating: LiveCulturalIntelligenceRun['signals'];
  opportunities: LiveCulturalIntelligenceRun['brandInterpretations'];
  skip: LiveCulturalIntelligenceRun['brandInterpretations'];
}) {
  return (
    <>
      <section className="site00-experiment-g__panel">
        <h2>INTELLIGENCE PIPELINE</h2>
        <p>Status: {run?.status ?? 'NOT_STARTED'} · FAL: 0</p>
        {!run?.sourceAdapters.length ? (
          <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={onConfigure}>
            CONFIGURE INTELLIGENCE LAYER
          </button>
        ) : (
          <>
            <button type="button" className="site00-btn" disabled={busy} onClick={onRefresh}>
              REFRESH LIVE INTELLIGENCE
            </button>
            <button type="button" className="site00-btn" disabled={busy} onClick={onProvingRun}>
              RUN LIVE PROVING RUN 01
            </button>
            <button type="button" className="site00-btn" disabled={busy} onClick={onPromoteOpportunities}>
              PROMOTE NDX OPPORTUNITIES → CONTENT OPS
            </button>
          </>
        )}
      </section>
      <section className="site00-experiment-g__panel">
        <h2>RAW VIEW — {view}</h2>
        {view === 'ACCELERATING' &&
          accelerating.map((s) => (
            <p key={s.id}>
              {s.title} — velocity {s.velocity.toFixed(2)} · saturation {s.saturation.toFixed(2)}
            </p>
          ))}
        {view === 'OPPORTUNITIES' &&
          opportunities.map((i) => (
            <p key={i.id}>
              {i.reasoning} — {i.decision} · score evidence in inspect
            </p>
          ))}
        {view === 'SKIP' && skip.map((i) => <p key={i.id}>{i.rejectionReason ?? i.reasoning}</p>)}
        {view === 'SOURCES' &&
          run?.sourceAdapters.map((a) => (
            <p key={a.adapterId}>
              {a.provider} — {a.status} ({a.sourceFamily})
            </p>
          ))}
      </section>
    </>
  );
}
