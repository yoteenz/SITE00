import type { CulturalSignalPresentation } from '../../../../shared/site00-studio-world-production/founderWorkspace/types';

type CulturalRadarRoomProps = {
  signals: CulturalSignalPresentation[];
  view: 'LIVE' | 'FORECAST' | 'ARCHIVE';
  onViewChange: (view: 'LIVE' | 'FORECAST' | 'ARCHIVE') => void;
  forecastContent?: React.ReactNode;
  archiveContent?: React.ReactNode;
  emptyMessage?: string;
};

export function CulturalRadarRoom({
  signals,
  view,
  onViewChange,
  forecastContent,
  archiveContent,
  emptyMessage = 'NOT ENOUGH SIGNAL YET — NDX is watching.',
}: CulturalRadarRoomProps) {
  return (
    <section className="site00-fws-radar" aria-label="Cultural intelligence">
      <div className="site00-fws-radar__tabs">
        {(['LIVE', 'FORECAST', 'ARCHIVE'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={view === tab ? 'site00-fws-btn site00-fws-btn--primary' : 'site00-fws-btn'}
            onClick={() => onViewChange(tab)}
          >
            {tab === 'LIVE' ? 'LIVE SIGNALS' : tab === 'FORECAST' ? 'WEEKLY FORECAST' : 'ARCHIVE'}
          </button>
        ))}
      </div>

      {view === 'LIVE' && (
        <div className="site00-fws-radar__signals">
          {signals.length === 0 ? (
            <p className="site00-fws-empty">{emptyMessage}</p>
          ) : (
            signals.map((s) => (
              <article key={s.id} className="site00-fws-signal">
                <p className="site00-fws-signal__category">{s.category}</p>
                <h3 className="site00-fws-signal__headline">{s.headline}</h3>
                <p className="site00-fws-signal__lead">{s.leadLine}</p>
                {s.strengthHint ? <span className="site00-fws-signal__strength">{s.strengthHint}</span> : null}
              </article>
            ))
          )}
        </div>
      )}

      {view === 'FORECAST' && (forecastContent ?? <p className="site00-fws-empty">Weekly forecast not ready yet.</p>)}
      {view === 'ARCHIVE' && (archiveContent ?? <p className="site00-fws-empty">No archived signals yet.</p>)}
    </section>
  );
}
