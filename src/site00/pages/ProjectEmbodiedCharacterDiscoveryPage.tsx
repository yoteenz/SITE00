import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi, Site00ProjectsApiError } from '../services/site00ProjectsApi';
import {
  site00ProjectMotionCharacterPath,
  site00ProjectFounderCharacterDiscoveryPath,
  site00ProjectPath,
} from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import {
  FOUNDER_CHARACTER_JUDGMENTS,
} from '../../../shared/site00-studio-world-production/embodiedCharacterDiscovery/constants';
import type { NdxEmbodiedCharacterDiscoveryRun } from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterDiscovery/types';
import '../styles/site00-replay-execution.css';

type DiscoverySection =
  | 'STATUS'
  | 'VISUAL_NORTH_STARS'
  | 'PSYCHOLOGY'
  | 'INTELLIGENCE'
  | 'CONTRADICTIONS'
  | 'HUMOR'
  | 'CULTURAL_LIFE'
  | 'VOICE'
  | 'PRIVATE_HUMANITY'
  | 'THE_BOOK'
  | 'PHYSICAL_BEHAVIOR'
  | 'CAMERA'
  | 'STYLE'
  | 'SCENARIO_TESTS'
  | 'INTERVIEW'
  | 'SYNTHESIS'
  | 'CASTING_READINESS';

const SECTIONS: { id: DiscoverySection; label: string }[] = [
  { id: 'STATUS', label: 'CHARACTER STATUS' },
  { id: 'VISUAL_NORTH_STARS', label: 'FOUNDER VISUAL NORTH STARS' },
  { id: 'PSYCHOLOGY', label: 'PSYCHOLOGY' },
  { id: 'INTELLIGENCE', label: 'INTELLIGENCE' },
  { id: 'CONTRADICTIONS', label: 'CONTRADICTIONS' },
  { id: 'HUMOR', label: 'HUMOR' },
  { id: 'CULTURAL_LIFE', label: 'CULTURAL LIFE' },
  { id: 'VOICE', label: 'VOICE' },
  { id: 'PRIVATE_HUMANITY', label: 'PRIVATE HUMANITY' },
  { id: 'THE_BOOK', label: 'THE BOOK' },
  { id: 'PHYSICAL_BEHAVIOR', label: 'PHYSICAL BEHAVIOR' },
  { id: 'CAMERA', label: 'CAMERA RELATIONSHIP' },
  { id: 'STYLE', label: 'STYLE HYPOTHESIS' },
  { id: 'SCENARIO_TESTS', label: 'SCENARIO TESTS' },
  { id: 'INTERVIEW', label: 'DISCOVERY INTERVIEW' },
  { id: 'SYNTHESIS', label: 'SYNTHESIS' },
  { id: 'CASTING_READINESS', label: 'CASTING READINESS' },
];

export default function ProjectEmbodiedCharacterDiscoveryPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<NdxEmbodiedCharacterDiscoveryRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [section, setSection] = useState<DiscoverySection>('STATUS');
  const [roundAnswer, setRoundAnswer] = useState('');
  const [selectedRound, setSelectedRound] = useState('WHO_IS_SHE');
  const [judgmentNote, setJudgmentNote] = useState('');

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.embodiedCharacterDiscoveryGet(projectSlug);
      setRun((result.run as NdxEmbodiedCharacterDiscoveryRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const act = async (fn: () => Promise<{ run?: Record<string, unknown> }>, opts?: { successMessage?: string; goToSection?: DiscoverySection }) => {
    setBusy(true);
    setActionError(null);
    setActionNotice(null);
    try {
      const result = await fn();
      if (result.run) setRun(result.run as NdxEmbodiedCharacterDiscoveryRun);
      else await reload();
      if (opts?.successMessage) setActionNotice(opts.successMessage);
      if (opts?.goToSection) setSection(opts.goToSection);
    } catch (err) {
      const message =
        err instanceof Site00ProjectsApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Character discovery action failed';
      setActionError(message);
    } finally {
      setBusy(false);
    }
  };

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Embodied Character Discovery is NDXBOOK-only for this proof.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">P0.5E.3 — EMBODIED CHARACTER DISCOVERY</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">WHO IS THE WOMAN WE WOULD ACTUALLY BE WATCHING?</p>
            <Link to={site00ProjectMotionCharacterPath(projectSlug)}>← MOTION + BOOK LANGUAGE</Link>
            <Link to={site00ProjectFounderCharacterDiscoveryPath(projectSlug)}>→ FOUNDER CHARACTER DISCOVERY ROOM</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          <section className="site00-experiment-g__panel">
            <h2>CHARACTER STATUS</h2>
            <p><strong>VISUAL DESIGN:</strong> NOT FINALIZED</p>
            <p><strong>FINAL FACE:</strong> NOT SELECTED</p>
            <p><strong>CHARACTER GENERATION:</strong> NOT PERFORMED</p>
            <p>Founder visual selections = discovery evidence, not canon.</p>
            {actionError && (
              <section className="site00-experiment-g__panel" role="alert">
                <h2>Action failed</h2>
                <p>{actionError}</p>
                {actionError.includes('not initialized') && (
                  <p>Tap INITIALIZE CHARACTER DISCOVERY first, or retry after the API redeploys.</p>
                )}
              </section>
            )}
            {actionNotice && (
              <p role="status"><strong>{actionNotice}</strong></p>
            )}
            {!run && (
              <button
                type="button"
                className="site00-btn site00-btn--primary"
                disabled={busy}
                onClick={() => void act(() => site00ProjectsApi.embodiedCharacterDiscoveryInitialize(projectSlug))}
              >
                INITIALIZE CHARACTER DISCOVERY
              </button>
            )}
            {run && (
              <button
                type="button"
                className="site00-btn"
                disabled={busy}
                onClick={() =>
                  void act(() => site00ProjectsApi.embodiedCharacterDiscoverySynthesize(projectSlug), {
                    successMessage: 'Character synthesis complete — review SYNTHESIS tab.',
                    goToSection: 'SYNTHESIS',
                  })
                }
              >
                SYNTHESIZE CHARACTER (FOUNDER-TRIGGERED)
              </button>
            )}
          </section>

          {loading && <p>Loading…</p>}

          {run && (
            <>
              <nav className="site00-experiment-g__tabs" aria-label="Discovery sections">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={section === s.id ? 'site00-experiment-g__tab site00-experiment-g__tab--active' : 'site00-experiment-g__tab'}
                    onClick={() => setSection(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>

              <section className="site00-experiment-g__panel">
                {section === 'STATUS' && (
                  <>
                    <p>Casting readiness: {run.castingReadiness.state}</p>
                    <p>Humanity evaluation: {run.humanityEvaluation.passes ? 'PASS' : run.humanityEvaluation.failureReason}</p>
                    <p>FAL requests: {run.falRequests} · Anthropic: {run.anthropicRequests}</p>
                    <p>Stories = Margins · TikTok = thought being worked out · Reels = Book in motion · Feed = Pages</p>
                  </>
                )}

                {section === 'VISUAL_NORTH_STARS' && (
                  <>
                    {run.visualEvidence.map((ev) => (
                      <div key={ev.evidenceId}>
                        <h3>{ev.referenceBoardId}</h3>
                        <p>Selections: {ev.founderRawSelection}</p>
                        <p>Identity authority: {ev.identityAuthority}</p>
                        <ul>
                          {ev.visualTendencyHypotheses.slice(0, 6).map((h) => (
                            <li key={h}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </>
                )}

                {section === 'PSYCHOLOGY' && (
                  <>
                    <p><strong>Notices:</strong> {run.psychology.whatSheNotices.join(' · ')}</p>
                    <p><strong>Curiosity triggers:</strong> {run.psychology.curiosityTriggers.join(' · ')}</p>
                    <p><strong>Self-correction:</strong> {run.psychology.selfCorrectionBehavior}</p>
                  </>
                )}

                {section === 'INTELLIGENCE' && (
                  <>
                    <p><strong>Strongest:</strong> {run.intelligence.strongestIntelligences.join(', ')}</p>
                    <p><strong>Blind spots:</strong> {run.intelligence.blindSpots.join(', ')}</p>
                    <p>{run.intelligence.behavioralExpression}</p>
                  </>
                )}

                {section === 'CONTRADICTIONS' && (
                  <>
                    <p><strong>Major:</strong></p>
                    <ul>{run.contradictions.majorContradictions.map((c) => <li key={c}>{c}</li>)}</ul>
                    <p><strong>Annoying trait:</strong> {run.contradictions.traitOthersFindAnnoying}</p>
                    <p><strong>Embarrassed likes:</strong> {run.contradictions.embarrassedLikes}</p>
                  </>
                )}

                {section === 'HUMOR' && (
                  <>
                    <p><strong>Laughs at:</strong> {run.humor.whatMakesHerLaugh.join(', ')}</p>
                    <p><strong>Nonverbal:</strong> {run.humor.nonverbalHumorBehaviors.slice(0, 5).join(', ')}…</p>
                  </>
                )}

                {section === 'CULTURAL_LIFE' && (
                  <>
                    <p>{run.culturalLife.generationalContext}</p>
                    <p><strong>Blind spots:</strong> {run.culturalLife.culturalBlindSpots.join(' · ')}</p>
                  </>
                )}

                {section === 'VOICE' && (
                  <>
                    <p><strong>Inner:</strong> {run.voice.innerVoice}</p>
                    <p><strong>Page:</strong> {run.voice.pageVoice}</p>
                    <p><strong>TikTok rhythm:</strong> {run.voice.sentenceRhythm}</p>
                  </>
                )}

                {section === 'PRIVATE_HUMANITY' && (
                  <>
                    <p><strong>Phone:</strong> {run.everydayLife.phoneBehavior}</p>
                    <p><strong>Guilty pleasures:</strong> {run.everydayLife.guiltyPleasures.join(', ')}</p>
                  </>
                )}

                {section === 'THE_BOOK' && (
                  <>
                    <p><strong>Why she keeps it:</strong></p>
                    <ul>{run.bookRelationship.whySheKeepsIt.map((w) => <li key={w}>{w}</li>)}</ul>
                    <dl>
                      {Object.entries(run.bookRelationship.termMeanings).map(([term, meaning]) => (
                        <div key={term}>
                          <dt>{term}</dt>
                          <dd>{meaning}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}

                {section === 'PHYSICAL_BEHAVIOR' && (
                  <p>{run.physicalBehavior.researchBehaviors.slice(0, 10).join(' · ')}…</p>
                )}

                {section === 'CAMERA' && (
                  <>
                    <p>Modes: {run.cameraRelationship.modes.join(', ')}</p>
                    <p>{run.cameraRelationship.whenSheForgetsCamera}</p>
                  </>
                )}

                {section === 'STYLE' && (
                  <>
                    <p><strong>Hypothetical only — not final design</strong></p>
                    <p>{run.styleHypothesis.limeAccentBehavior}</p>
                    <p>Confirmed: {run.styleHypothesis.confirmedVsHypothetical.confirmed.length} · Hypothetical: {run.styleHypothesis.confirmedVsHypothetical.hypothetical.length}</p>
                  </>
                )}

                {section === 'SCENARIO_TESTS' && (
                  <ul>
                    {run.scenarioTests.map((t) => (
                      <li key={t.testId}>
                        <strong>{t.scenario}</strong> — {t.thought}
                      </li>
                    ))}
                  </ul>
                )}

                {section === 'INTERVIEW' && (
                  <>
                    <label>
                      Round
                      <select value={selectedRound} onChange={(e) => setSelectedRound(e.target.value)}>
                        {run.interviewRounds.map((r) => (
                          <option key={r.round} value={r.round}>{r.title}</option>
                        ))}
                      </select>
                    </label>
                    <textarea
                      value={roundAnswer}
                      onChange={(e) => setRoundAnswer(e.target.value)}
                      rows={4}
                      placeholder="Founder answer — raw wording preserved"
                    />
                    <button
                      type="button"
                      className="site00-btn site00-btn--primary"
                      disabled={busy || !roundAnswer.trim()}
                      onClick={() =>
                        void act(async () => {
                          const result = await site00ProjectsApi.embodiedCharacterDiscoverySaveRound(
                            projectSlug,
                            selectedRound,
                            roundAnswer,
                            roundAnswer,
                          );
                          setRoundAnswer('');
                          return result;
                        })
                      }
                    >
                      SAVE ROUND ANSWER
                    </button>
                    <ul>
                      {run.interviewRounds.filter((r) => r.founderAnswer).map((r) => (
                        <li key={r.round}>{r.title}: {r.founderRawWording}</li>
                      ))}
                    </ul>
                  </>
                )}

                {section === 'SYNTHESIS' && (
                  run.synthesis ? (
                    <>
                      <p>{run.synthesis.characterEssence}</p>
                      <p>{run.synthesis.psychologicalLogic}</p>
                    </>
                  ) : (
                    <p>No synthesis yet — complete discovery rounds or trigger synthesize.</p>
                  )
                )}

                {section === 'CASTING_READINESS' && (
                  <>
                    <p>State: {run.castingReadiness.state}</p>
                    <p>Next casting round: {run.nextCastingRoundSpec.candidateCount} candidates — same written character</p>
                    <p>Generation: {run.nextCastingRoundSpec.generationPerformed ? 'YES' : 'NO (architecture only)'}</p>
                    <div>
                      {FOUNDER_CHARACTER_JUDGMENTS.slice(0, 8).map((j) => (
                        <button
                          key={j}
                          type="button"
                          className="site00-btn site00-btn--small"
                          disabled={busy}
                          onClick={() =>
                            void act(() =>
                              site00ProjectsApi.embodiedCharacterDiscoveryJudgment(projectSlug, j, section, judgmentNote || j),
                            )
                          }
                        >
                          {j}
                        </button>
                      ))}
                    </div>
                    <input
                      value={judgmentNote}
                      onChange={(e) => setJudgmentNote(e.target.value)}
                      placeholder="Optional judgment note"
                    />
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
