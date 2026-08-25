import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { NdxFounderWorkspacePage, FounderWorkspacePanel } from '../components/founderWorkspace';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import type { NdxMotionCharacterBookLanguageRun } from '../../../shared/site00-brand-lore/ndxBookCulturalLanguage/types';
import '../styles/site00-replay-execution.css';

type ReviewSection =
  | 'BOOK_LANGUAGE'
  | 'CONTENT_ONTOLOGY'
  | 'MOTION_THESIS'
  | 'MOTION_BEHAVIORS'
  | 'PLATFORM_BEHAVIOR'
  | 'PHYSICAL_BOOK'
  | 'AUDIENCE_LANGUAGE'
  | 'EMBODIED_CHARACTER'
  | 'CHARACTER_DISCOVERY';

const SECTIONS: { id: ReviewSection; label: string }[] = [
  { id: 'BOOK_LANGUAGE', label: 'BOOK LANGUAGE' },
  { id: 'CONTENT_ONTOLOGY', label: 'CONTENT ONTOLOGY' },
  { id: 'MOTION_THESIS', label: 'MOTION THESIS' },
  { id: 'MOTION_BEHAVIORS', label: 'MOTION BEHAVIORS' },
  { id: 'PLATFORM_BEHAVIOR', label: 'PLATFORM BEHAVIOR' },
  { id: 'PHYSICAL_BOOK', label: 'PHYSICAL BOOK' },
  { id: 'AUDIENCE_LANGUAGE', label: 'AUDIENCE LANGUAGE' },
  { id: 'EMBODIED_CHARACTER', label: 'EMBODIED CHARACTER' },
  { id: 'CHARACTER_DISCOVERY', label: 'CHARACTER DISCOVERY READINESS' },
];

export default function ProjectMotionCharacterPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<NdxMotionCharacterBookLanguageRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [section, setSection] = useState<ReviewSection>('BOOK_LANGUAGE');

  const reload = useCallback(async () => {
    if (!hasProjectCapability(projectSlug, 'MOTION_CHARACTER')) return;
    try {
      const result = await site00ProjectsApi.motionCharacterBookLanguageGet(projectSlug);
      setRun((result.run as NdxMotionCharacterBookLanguageRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const act = async (fn: () => Promise<{ run?: Record<string, unknown> }>) => {
    setBusy(true);
    try {
      const result = await fn();
      if (result.run) setRun(result.run as NdxMotionCharacterBookLanguageRun);
      else await reload();
    } finally {
      setBusy(false);
    }
  };

  if (!hasProjectCapability(projectSlug, 'MOTION_CHARACTER')) {
    return (
      <NdxFounderWorkspacePage
        projectSlug={projectSlug}
        title="MOTION CHARACTER"
        nonNdxFallback={<p>Motion / Book Language review is NDXBOOK-only for this proof.</p>}
        operate={null}
      />
    );
  }

  const foundation = run?.embodiedCharacterFoundation as Record<string, unknown> | undefined;
  const discovery = run?.embodiedCharacterDiscoveryReadiness as Record<string, unknown> | undefined;

  return (
    <NdxFounderWorkspacePage
      projectSlug={projectSlug}
      title="BOOK LANGUAGE + MOTION CHARACTER"
      subtitle="THE VIDEO SHOWS THE BOOK BEING MADE"
      loading={loading}
      loadingLabel="LOADING MOTION / BOOK LANGUAGE…"
      operate={
        !run && !loading ? (
          <>
            <FounderWorkspacePanel title="NOT INITIALIZED">
              <p>Not initialized — configure to review book language, ontology, and motion character foundation.</p>
            </FounderWorkspacePanel>
            <FounderWorkspacePanel title="DISTINCTIONS">
              <p>BRAND CHARACTER ≠ EMBODIED CHARACTER</p>
              <p>VISUAL EXPRESSION ≠ MOTION BEHAVIOR</p>
              <p>THE CAROUSEL IS THE PAGE · THE VIDEO SHOWS WHY THE PAGE EXISTS</p>
              <button
                type="button"
                className="site00-btn site00-btn--primary"
                disabled={busy}
                onClick={() => void act(() => site00ProjectsApi.motionCharacterBookLanguageInitialize(projectSlug))}
              >
                INITIALIZE BOOK LANGUAGE + MOTION SYSTEM
              </button>
            </FounderWorkspacePanel>
          </>
        ) : (
          <>
          <FounderWorkspacePanel title="DISTINCTIONS">
            <p>BRAND CHARACTER ≠ EMBODIED CHARACTER</p>
            <p>VISUAL EXPRESSION ≠ MOTION BEHAVIOR</p>
            <p>THE CAROUSEL IS THE PAGE · THE VIDEO SHOWS WHY THE PAGE EXISTS</p>
            {!run && (
              <button
                type="button"
                className="site00-btn site00-btn--primary"
                disabled={busy}
                onClick={() => void act(() => site00ProjectsApi.motionCharacterBookLanguageInitialize(projectSlug))}
              >
                INITIALIZE BOOK LANGUAGE + MOTION SYSTEM
              </button>
            )}
            {run && (
              <button
                type="button"
                className="site00-btn"
                disabled={busy}
                onClick={() => void act(() => site00ProjectsApi.motionCharacterBookLanguageRefresh(projectSlug))}
              >
                REFRESH SYSTEM
              </button>
            )}
          </FounderWorkspacePanel>

          <FounderWorkspacePanel title="REVIEW">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={section === s.id ? 'site00-btn site00-btn--primary' : 'site00-btn'}
                onClick={() => setSection(s.id)}
              >
                {s.label}
              </button>
            ))}
          </FounderWorkspacePanel>

          {run ? (
            <>
              {section === 'BOOK_LANGUAGE' && (
                <section className="site00-experiment-g__panel">
                  <h2>BOOK LANGUAGE</h2>
                  <p>Core principle: {run.culturalLanguage.corePrinciple.replace(/_/g, ' ')}</p>
                  <ul>
                    {run.culturalLanguage.canonicalTerms.map((term) => (
                      <li key={term}>{term.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                  <h3>Terminology forensic (sample)</h3>
                  <ul>
                    {run.terminologyForensic.slice(0, 8).map((e) => (
                      <li key={e.term}>
                        {e.term} → {e.classification}
                        {e.publicAlias ? ` (public: ${e.publicAlias})` : ''}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {section === 'CONTENT_ONTOLOGY' && (
                <section className="site00-experiment-g__panel">
                  <h2>CONTENT ONTOLOGY</h2>
                  <p>Feed: {run.contentOntology.surfaces.FEED}</p>
                  <p>Stories: {run.contentOntology.surfaces.STORIES}</p>
                  <p>Reels: {run.contentOntology.surfaces.REELS}</p>
                  <p>TikTok: {run.contentOntology.surfaces.TIKTOK}</p>
                  <p>Index: {run.contentOntology.surfaces.INDEX}</p>
                  <p>Lineage: {run.contentOntology.lineage.join(' → ')}</p>
                  <p>Cross-surface: {run.crossSurfaceProgression.stages.join(' → ')} (flexible · reuse thinking not posts)</p>
                </section>
              )}

              {section === 'MOTION_THESIS' && (
                <section className="site00-experiment-g__panel">
                  <h2>MOTION THESIS</h2>
                  <p>Full: {run.motionThesis.full.join(' → ')}</p>
                  <p>Compressed: {run.motionThesis.compressed.join(' → ')}</p>
                  <p>Motion is NOT: animated carousel, motion poster, slideshow, AI presenter, stock broll explainer.</p>
                </section>
              )}

              {section === 'MOTION_BEHAVIORS' && (
                <section className="site00-experiment-g__panel">
                  <h2>MOTION BEHAVIORS ({run.motionBehaviors.length} modes)</h2>
                  <ul>
                    {run.motionBehaviors.map((b) => (
                      <li key={b.mode}>
                        <strong>{b.mode.replace(/_/g, ' ')}</strong> — {b.trigger} · {b.emotionalTemperature}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {section === 'PLATFORM_BEHAVIOR' && (
                <section className="site00-experiment-g__panel">
                  <h2>PLATFORM BEHAVIOR</h2>
                  <p>Instagram Reels: {run.platformBehaviors.INSTAGRAM_REEL?.replace(/_/g, ' ')}</p>
                  <p>TikTok: {run.platformBehaviors.TIKTOK?.replace(/_/g, ' ')}</p>
                  <p>Stories: {run.platformBehaviors.STORY?.replace(/_/g, ' ')}</p>
                  <p>Feed: {run.platformBehaviors.FEED?.replace(/_/g, ' ')}</p>
                </section>
              )}

              {section === 'PHYSICAL_BOOK' && (
                <section className="site00-experiment-g__panel">
                  <h2>PHYSICAL BOOK</h2>
                  <p>Modeled as optional narrative prop — NOT mandatory in every Reel.</p>
                  <p>
                    Sample presence decision:{' '}
                    {String((foundation?.physicalBookPresenceSample as { decision?: string })?.decision ?? 'NOT_NEEDED')}
                  </p>
                </section>
              )}

              {section === 'AUDIENCE_LANGUAGE' && (
                <section className="site00-experiment-g__panel">
                  <h2>AUDIENCE LANGUAGE</h2>
                  <ul>
                    {run.audienceBehaviors.map((b) => (
                      <li key={b.behavior}>
                        {b.publicLabel}
                        {b.supportsCommunitySubmission ? ' · community submission' : ''}
                      </li>
                    ))}
                  </ul>
                  <p>Organic target: @ndxbook ADD THIS TO THE BOOK.</p>
                </section>
              )}

              {section === 'EMBODIED_CHARACTER' && (
                <section className="site00-experiment-g__panel">
                  <h2>EMBODIED CHARACTER FOUNDATION</h2>
                  <p>Distinct from founder: {foundation?.distinctFromFounder ? 'YES' : 'NO'}</p>
                  <p>Distinct from Brand Character: {foundation?.distinctFromBrandCharacter ? 'YES' : 'NO'}</p>
                  <p>Visual design finalized: NO</p>
                  <p>Character generation performed: NO</p>
                  {foundation?.relationships ? (
                    <ul>
                      {Object.entries(foundation.relationships as Record<string, string>).map(([k, v]) => (
                        <li key={k}>
                          {k}: {v}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              )}

              {section === 'CHARACTER_DISCOVERY' && (
                <section className="site00-experiment-g__panel">
                  <h2>CHARACTER DISCOVERY READINESS</h2>
                  <p>Ready for discovery sprint: {discovery?.readyForDiscoverySprint ? 'YES' : 'NO'}</p>
                  <p>Not finalized this sprint: {(discovery?.notFinalizedThisSprint as string[] | undefined)?.length ?? 0} items</p>
                  <h3>Next discovery</h3>
                  <ul>
                    {(discovery?.nextDiscoveryItems as string[] | undefined)?.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : null}
          </>
        )
      }
    />
  );
}
