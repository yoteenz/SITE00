import type {
  LearningSignalPresentation,
  PerformanceCreativePresentation,
} from '../../../../shared/site00-studio-world-production/founderWorkspace/types';
import { CreativeAssetCard } from './CreativeAssetCard';

type PerformanceLearningRoomProps = {
  summary: { reach: number | null; saves: number | null; profileVisits: number | null; followers: number | null };
  contentThatHit: PerformanceCreativePresentation[];
  audienceSignals: string[];
  learningSignals: LearningSignalPresentation[];
  learningActions?: React.ReactNode;
};

export function PerformanceLearningRoom({
  summary,
  contentThatHit,
  audienceSignals,
  learningSignals,
  learningActions,
}: PerformanceLearningRoomProps) {
  const metrics = [
    { label: 'REACH', value: summary.reach },
    { label: 'SAVES', value: summary.saves },
    { label: 'PROFILE VISITS', value: summary.profileVisits },
    { label: 'FOLLOWERS', value: summary.followers },
  ];

  return (
    <div className="site00-fws-performance">
      <section className="site00-fws-performance__summary">
        <h2 className="site00-fws-section-title">WHAT HAPPENED</h2>
        <div className="site00-fws-performance__metrics">
          {metrics.map((m) => (
            <div key={m.label} className="site00-fws-performance__metric">
              <span className="site00-fws-performance__metric-value">
                {m.value != null ? m.value.toLocaleString() : '—'}
              </span>
              <span className="site00-fws-performance__metric-label">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="site00-fws-performance__hit">
        <h2 className="site00-fws-section-title">CONTENT THAT HIT</h2>
        {contentThatHit.length === 0 ? (
          <p className="site00-fws-empty">No published content with performance yet.</p>
        ) : (
          <div className="site00-fws-production-grid">
            {contentThatHit.map((c) => (
              <CreativeAssetCard
                key={c.id}
                asset={{
                  id: c.id,
                  title: c.title,
                  previewUrl: c.previewUrl,
                  formatLabel: c.metricsSummary,
                  channelLabel: 'PERFORMANCE',
                  attention: c.attention,
                  statusLabel: c.metricsSummary,
                  internalStatus: c.id,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="site00-fws-performance__audience">
        <h2 className="site00-fws-section-title">AUDIENCE SIGNALS</h2>
        {audienceSignals.length === 0 ? (
          <p className="site00-fws-empty">No audience responses ingested yet.</p>
        ) : (
          <ul className="site00-fws-performance__signals-list">
            {audienceSignals.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="site00-fws-performance__learning">
        <h2 className="site00-fws-section-title">WHAT NDX SHOULD LEARN</h2>
        {learningSignals.length === 0 ? (
          <p className="site00-fws-empty">Not enough signal yet for canonical learning.</p>
        ) : (
          <ul className="site00-fws-performance__learning-list">
            {learningSignals.map((l) => (
              <li key={l.id} className={l.founderAccepted ? 'site00-fws-performance__learning--accepted' : ''}>
                <p>{l.observation}</p>
                <span className="site00-fws-performance__confidence">{l.confidence}</span>
              </li>
            ))}
          </ul>
        )}
        {learningActions}
      </section>
    </div>
  );
}
