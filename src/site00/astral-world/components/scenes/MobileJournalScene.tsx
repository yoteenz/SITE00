import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralWorldScene } from '../immersive/AstralWorldScene';
import { AstralDrawer } from '../immersive/AstralDrawer';

type JournalTab = 'readings' | 'saved' | 'reflections';

/** Journal as physical world artifact — open book dominates viewport */
export function MobileJournalScene() {
  const { journey, demoSession, path } = useAstralWorld();
  const [tab, setTab] = useState<JournalTab>('readings');
  const [entryId, setEntryId] = useState<string | null>(null);

  const filtered = journey.filter((e) => {
    if (tab === 'readings') return e.kind === 'READING';
    if (tab === 'saved') return e.kind === 'SAVED';
    return e.kind === 'JOURNAL';
  });

  const activeEntry = entryId ? journey.find((e) => e.id === entryId) : null;

  return (
    <>
      <AstralWorldScene
        sceneId="JOURNAL_ARTIFACT"
        overlay={
          <div className="aw-journal-scene-overlay">
            <p className="aw-label">Your Artifact</p>
            <h1 className="aw-display aw-display--scene">Tarot Journal</h1>
            <div className="aw-journal-tabs" role="tablist">
              {(['readings', 'saved', 'reflections'] as JournalTab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  className={`aw-chip${tab === t ? ' aw-tab--active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <p className="aw-muted">{demoSession.journalEntryCount} entries · tap to open pages</p>
          </div>
        }
        interaction={
          <div className="aw-journal-page-strip">
            {filtered.slice(0, 4).map((entry, idx) => (
              <button
                key={entry.id}
                type="button"
                className="aw-journal-page-tab"
                style={{ left: `${12 + idx * 20}%`, top: `${48 + (idx % 2) * 8}%` }}
                onClick={() => setEntryId(entry.id)}
                aria-label={entry.title}
              >
                <span className="aw-label">{entry.kind}</span>
                <strong>{entry.title}</strong>
              </button>
            ))}
            <Link to={path('daily-card')} className="aw-journal-daily-card-object" aria-label="Daily Card">
              Daily Card
            </Link>
          </div>
        }
      />

      <AstralDrawer open={Boolean(activeEntry)} onClose={() => setEntryId(null)} title={activeEntry?.title ?? 'Entry'}>
        {activeEntry ? (
          <>
            <p className="aw-label">{activeEntry.kind}</p>
            <p className="aw-muted">{activeEntry.subtitle} · {activeEntry.date}</p>
            <button type="button" className="aw-btn-primary">
              {activeEntry.kind === 'JOURNAL' ? 'Open Page' : 'View Reading'}
            </button>
          </>
        ) : null}
      </AstralDrawer>
    </>
  );
}
