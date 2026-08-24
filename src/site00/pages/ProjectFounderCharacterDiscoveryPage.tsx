import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi, Site00ProjectsApiError } from '../services/site00ProjectsApi';
import {
  site00ProjectEmbodiedCharacterDiscoveryPath,
  site00ProjectPath,
} from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import { FOUNDER_DISCOVERY_JUDGMENTS } from '../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/constants';
import { VOICE_LAB_CHANNELS } from '../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/constants';
import { FOUNDER_RECOGNITION_RESPONSES } from '../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/constants';
import { VISUAL_HYPOTHESIS_JUDGMENTS } from '../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/constants';
import type { NdxFounderCharacterDiscoveryRun } from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types';
import '../styles/site00-replay-execution.css';

type RoomSection =
  | 'FORENSIC'
  | 'SCENARIOS'
  | 'TRAITS'
  | 'CONTRADICTIONS'
  | 'FLAWS'
  | 'INTELLIGENCE'
  | 'VOICE_LAB'
  | 'BOOK'
  | 'VISUAL'
  | 'SYNTHESIS'
  | 'RECOGNITION'
  | 'CASTING';

const SECTIONS: { id: RoomSection; label: string }[] = [
  { id: 'FORENSIC', label: 'FORENSIC AUDIT' },
  { id: 'SCENARIOS', label: 'SCENARIO DISCOVERY' },
  { id: 'TRAITS', label: 'PROPOSED TRAITS' },
  { id: 'CONTRADICTIONS', label: 'CONTRADICTIONS' },
  { id: 'FLAWS', label: 'FLAWS' },
  { id: 'INTELLIGENCE', label: 'INTELLIGENCE MAP' },
  { id: 'VOICE_LAB', label: 'VOICE LAB' },
  { id: 'BOOK', label: 'BOOK RELATIONSHIP' },
  { id: 'VISUAL', label: 'VISUAL HYPOTHESES' },
  { id: 'SYNTHESIS', label: 'SYNTHESIS PREVIEW' },
  { id: 'RECOGNITION', label: 'I KNOW HER' },
  { id: 'CASTING', label: 'CASTING READINESS' },
];

const SCENARIO_ESCAPE = ['NONE_OF_THESE', 'SOMETHING_ELSE', 'IT_DEPENDS', 'I_DONT_KNOW_YET'];

export default function ProjectFounderCharacterDiscoveryPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<NdxFounderCharacterDiscoveryRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [section, setSection] = useState<RoomSection>('FORENSIC');
  const [traitRevision, setTraitRevision] = useState('');
  const [traitNote, setTraitNote] = useState('');
  const [scenarioNotes, setScenarioNotes] = useState('');
  const [recognitionNote, setRecognitionNote] = useState('');

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.founderCharacterDiscoveryGet(projectSlug);
      setRun((result.run as NdxFounderCharacterDiscoveryRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const act = async (
    fn: () => Promise<{ run?: Record<string, unknown> }>,
    opts?: { successMessage?: string; goToSection?: RoomSection },
  ) => {
    setBusy(true);
    setActionError(null);
    setActionNotice(null);
    try {
      const result = await fn();
      if (result.run) setRun(result.run as NdxFounderCharacterDiscoveryRun);
      else await reload();
      if (opts?.successMessage) setActionNotice(opts.successMessage);
      if (opts?.goToSection) setSection(opts.goToSection);
    } catch (err) {
      const message =
        err instanceof Site00ProjectsApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Discovery room action failed';
      setActionError(message);
    } finally {
      setBusy(false);
    }
  };

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Founder Character Discovery Room is NDXBOOK-only for this proof.</p>
      </EcosystemShell>
    );
  }

  const forensic = run?.forensicReport;
  const casting = run?.castingReadiness;

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">P0.5E.4 — FOUNDER CHARACTER DISCOVERY ROOM</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">
              MEET HER BEFORE YOU CAST HER — CHARACTER TRUTH BEFORE VISUAL IDENTITY
            </p>
            <Link to={site00ProjectEmbodiedCharacterDiscoveryPath(projectSlug)}>← EMBODIED CHARACTER DISCOVERY</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          <section className="site00-experiment-g__panel">
            <h2>PRIVATE CHARACTER DEVELOPMENT ROOM</h2>
            <p>Seeded proposals remain discovery material until you confirm them. Uncertainty is valid data.</p>
            <p><strong>CASTING:</strong> BLOCKED until YES_I_KNOW_HER</p>
            <p><strong>FAL REQUESTS:</strong> 0 · <strong>FACE SELECTION:</strong> NOT PERFORMED</p>
            {actionError && (
              <section className="site00-experiment-g__panel" role="alert">
                <h3>Action failed</h3>
                <p>{actionError}</p>
              </section>
            )}
            {actionNotice && <p role="status"><strong>{actionNotice}</strong></p>}
            {!run && (
              <button
                type="button"
                className="site00-btn site00-btn--primary"
                disabled={busy}
                onClick={() => void act(() => site00ProjectsApi.founderCharacterDiscoveryInitialize(projectSlug))}
              >
                ENTER DISCOVERY ROOM
              </button>
            )}
          </section>

          {loading && <p>Loading…</p>}

          {run && (
            <>
              <nav className="site00-experiment-g__tabs" aria-label="Discovery room sections">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={
                      section === s.id
                        ? 'site00-experiment-g__tab site00-experiment-g__tab--active'
                        : 'site00-experiment-g__tab'
                    }
                    onClick={() => setSection(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>

              <section className="site00-experiment-g__panel">
                {section === 'FORENSIC' && forensic && (
                  <>
                    <h2>FORENSIC AUDIT</h2>
                    <p>Seeded traits: {forensic.totalSeededTraits}</p>
                    <p>Founder confirmed: {forensic.founderConfirmedTraits}</p>
                    <p>Unresolved: {forensic.unresolvedTraits}</p>
                    <p>Visual hypotheses awaiting confirmation: {forensic.visualHypothesesAwaitingConfirmation}</p>
                    <p>Starting casting readiness: {forensic.startingCastingReadiness}</p>
                    <p>Domains available: {run.domains.length}</p>
                  </>
                )}

                {section === 'SCENARIOS' && (
                  <>
                    <h2>SCENARIO DISCOVERY</h2>
                    <p>Situations reveal behavior — not adjectives.</p>
                    {run.scenarios.map((scenario) => (
                      <article key={scenario.scenarioId} className="site00-experiment-g__panel">
                        <h3>{scenario.situation}</h3>
                        <p><em>{scenario.behavioralImplication}</em></p>
                        <ul>
                          {scenario.possibleResponses.map((r) => (
                            <li key={r}>
                              <button
                                type="button"
                                className="site00-btn"
                                disabled={busy}
                                onClick={() =>
                                  void act(() =>
                                    site00ProjectsApi.founderCharacterDiscoveryScenarioResponse(
                                      projectSlug,
                                      scenario.scenarioId,
                                      r,
                                      'YES_EXACTLY',
                                      scenarioNotes || undefined,
                                    ),
                                  )
                                }
                              >
                                {r}
                              </button>
                            </li>
                          ))}
                          {SCENARIO_ESCAPE.map((escape) => (
                            <li key={escape}>
                              <button
                                type="button"
                                className="site00-btn"
                                disabled={busy}
                                onClick={() =>
                                  void act(() =>
                                    site00ProjectsApi.founderCharacterDiscoveryScenarioResponse(
                                      projectSlug,
                                      scenario.scenarioId,
                                      escape,
                                      escape === 'I_DONT_KNOW_YET' ? 'I_DONT_KNOW_YET' : 'NONE_OF_THESE',
                                      scenarioNotes || undefined,
                                    ),
                                  )
                                }
                              >
                                {escape.replace(/_/g, ' ')}
                              </button>
                            </li>
                          ))}
                        </ul>
                        {scenario.founderResponse && (
                          <p><strong>Your response:</strong> {scenario.founderResponse} ({scenario.confidence})</p>
                        )}
                      </article>
                    ))}
                    <label>
                      Notes
                      <textarea value={scenarioNotes} onChange={(e) => setScenarioNotes(e.target.value)} rows={2} />
                    </label>
                  </>
                )}

                {section === 'TRAITS' && forensic && (
                  <>
                    <h2>PROPOSED TRAITS — DISCOVER · REACT · REVISE · REJECT</h2>
                    <label>
                      Revision text (for CLOSE_BUT / SOMETHING_ELSE)
                      <input value={traitRevision} onChange={(e) => setTraitRevision(e.target.value)} />
                    </label>
                    <label>
                      Note
                      <input value={traitNote} onChange={(e) => setTraitNote(e.target.value)} />
                    </label>
                    {forensic.traits.slice(0, 40).map((trait) => (
                      <article key={trait.traitId} className="site00-experiment-g__panel">
                        <p><strong>{trait.category}</strong> · {trait.authority} · {trait.confidence}</p>
                        <p>{trait.statement}</p>
                        <div className="site00-experiment-g__tabs">
                          {FOUNDER_DISCOVERY_JUDGMENTS.filter((j) =>
                            ['YES_EXACTLY', 'CLOSE_BUT', 'NO', 'ABSOLUTELY_NOT', 'IT_DEPENDS', 'I_DONT_KNOW_YET', 'SOMETHING_ELSE', 'TOO_PERFECT', 'TOO_BRAND_LIKE'].includes(j),
                          ).map((j) => (
                            <button
                              key={j}
                              type="button"
                              className="site00-experiment-g__tab"
                              disabled={busy}
                              onClick={() =>
                                void act(() =>
                                  site00ProjectsApi.founderCharacterDiscoveryTraitJudgment(
                                    projectSlug,
                                    trait.traitId,
                                    j,
                                    traitRevision || undefined,
                                    traitNote || undefined,
                                  ),
                                )
                              }
                            >
                              {j.replace(/_/g, ' ')}
                            </button>
                          ))}
                        </div>
                      </article>
                    ))}
                  </>
                )}

                {section === 'CONTRADICTIONS' && (
                  <>
                    <h2>CONTRADICTIONS</h2>
                    {run.contradictions.map((c) => (
                      <article key={c.contradictionId} className="site00-experiment-g__panel">
                        <p><strong>{c.traitA}</strong> ↔ <strong>{c.traitB}</strong></p>
                        <p>{c.whyBothAreTrue}</p>
                        <p>When A: {c.whenAAppears} · When B: {c.whenBAppears}</p>
                        <p>Authority: {c.founderAuthority} · Confidence: {c.confidence}</p>
                      </article>
                    ))}
                  </>
                )}

                {section === 'FLAWS' && (
                  <>
                    <h2>FLAWS + ANNOYING TRAITS</h2>
                    {run.flawProfile.flaws.map((f) => (
                      <p key={f.flawId}><strong>{f.category}:</strong> {f.description}</p>
                    ))}
                    <p><strong>Best friend would roast her for:</strong> {run.flawProfile.bestFriendWouldRoastHerFor.join('; ')}</p>
                    <p><strong>Procrastinates:</strong> {run.flawProfile.procrastinates.join('; ')}</p>
                  </>
                )}

                {section === 'INTELLIGENCE' && (
                  <>
                    <h2>UNEVEN INTELLIGENCE</h2>
                    <p><strong>Embarrassingly bad at:</strong> {run.intelligenceMap.embarrassinglyBadAt.join('; ')}</p>
                    <p><strong>False confidence:</strong> {run.intelligenceMap.falseConfidenceAreas.join('; ')}</p>
                    <p><strong>Researches instead of pretending:</strong> {run.intelligenceMap.researchesInsteadOfPretending.join('; ')}</p>
                    <ul>
                      {Object.entries(run.intelligenceMap.dimensions)
                        .filter(([, v]) => v !== 'UNSET')
                        .map(([dim, level]) => (
                          <li key={dim}>{dim}: {level}</li>
                        ))}
                    </ul>
                  </>
                )}

                {section === 'VOICE_LAB' && (
                  <>
                    <h2>CHARACTER VOICE LAB</h2>
                    <p>Same thought — different channels. Judge each register.</p>
                    {run.voiceLabSamples.map((sample) => (
                      <article key={sample.sampleId} className="site00-experiment-g__panel">
                        <p><strong>Underlying thought:</strong> {sample.underlyingThought}</p>
                        {VOICE_LAB_CHANNELS.map((channel) => (
                          <div key={channel}>
                            <p><strong>{channel.replace(/_/g, ' ')}:</strong> {sample.expressions[channel]}</p>
                            <button
                              type="button"
                              className="site00-btn"
                              disabled={busy}
                              onClick={() =>
                                void act(() =>
                                  site00ProjectsApi.founderCharacterDiscoveryVoiceJudgment(
                                    projectSlug,
                                    sample.sampleId,
                                    channel,
                                    'YES_EXACTLY',
                                  ),
                                )
                              }
                            >
                              THAT&apos;S HER
                            </button>
                            <button
                              type="button"
                              className="site00-btn"
                              disabled={busy}
                              onClick={() =>
                                void act(() =>
                                  site00ProjectsApi.founderCharacterDiscoveryVoiceJudgment(
                                    projectSlug,
                                    sample.sampleId,
                                    channel,
                                    'TOO_BRAND_LIKE',
                                  ),
                                )
                              }
                            >
                              TOO BRAND-LIKE
                            </button>
                          </div>
                        ))}
                      </article>
                    ))}
                  </>
                )}

                {section === 'BOOK' && (
                  <>
                    <h2>BOOK RELATIONSHIP</h2>
                    <p><strong>Why she writes things down:</strong> {run.bookDiscovery.whySheWritesThingsDown}</p>
                    <p><strong>Why not trust memory:</strong> {run.bookDiscovery.whyNotTrustMemory}</p>
                    <p><strong>Bookmarks instead of committing:</strong> {run.bookDiscovery.bookmarksInsteadOfCommitting.join('; ')}</p>
                    <p><strong>Earns Dog-Ear:</strong> {run.bookDiscovery.earnsDogEar.join('; ')}</p>
                    <p><strong>Flip Back:</strong> {run.bookDiscovery.makesHerFlipBack.join('; ')}</p>
                    <p><strong>Hates Errata:</strong> {run.bookDiscovery.hatesErrata.join('; ')}</p>
                  </>
                )}

                {section === 'VISUAL' && (
                  <>
                    <h2>VISUAL HYPOTHESIS REVIEW</h2>
                    <p>North-star references remain evidence — not casting canon.</p>
                    {run.visualHypothesisReviews.map((v) => (
                      <article key={v.hypothesisId} className="site00-experiment-g__panel">
                        <p>{v.hypothesis}</p>
                        <p>Identity authority: {v.identityAuthority} · Casting canon: {String(v.isCastingCanon)}</p>
                        <div className="site00-experiment-g__tabs">
                          {VISUAL_HYPOTHESIS_JUDGMENTS.map((j) => (
                            <button
                              key={j}
                              type="button"
                              className="site00-experiment-g__tab"
                              disabled={busy}
                              onClick={() =>
                                void act(() =>
                                  site00ProjectsApi.founderCharacterDiscoveryVisualJudgment(
                                    projectSlug,
                                    v.hypothesisId,
                                    j,
                                  ),
                                )
                              }
                            >
                              {j.replace(/_/g, ' ')}
                            </button>
                          ))}
                        </div>
                        {v.judgment && <p>Your judgment: {v.judgment}</p>}
                      </article>
                    ))}
                  </>
                )}

                {section === 'SYNTHESIS' && (
                  <>
                    <h2>CHARACTER SYNTHESIS PREVIEW</h2>
                    <p>Not the final Character Bible — a readable founder-facing preview.</p>
                    <button
                      type="button"
                      className="site00-btn site00-btn--primary"
                      disabled={busy}
                      onClick={() =>
                        void act(() => site00ProjectsApi.founderCharacterDiscoverySynthesisPreview(projectSlug), {
                          successMessage: 'Synthesis preview generated.',
                        })
                      }
                    >
                      PREVIEW CHARACTER SYNTHESIS
                    </button>
                    {run.synthesisPreview && (
                      <article className="site00-experiment-g__panel">
                        <p><strong>Who she is:</strong> {run.synthesisPreview.whoSheIs}</p>
                        <p><strong>What she wants:</strong> {run.synthesisPreview.whatSheWants}</p>
                        <p><strong>What she fears:</strong> {run.synthesisPreview.whatSheFears}</p>
                        <p><strong>What makes her funny:</strong> {run.synthesisPreview.whatMakesHerFunny}</p>
                        <p><strong>What makes her annoying:</strong> {run.synthesisPreview.whatMakesHerAnnoying}</p>
                        <p><strong>Book meaning:</strong> {run.synthesisPreview.bookMeaning}</p>
                        <p><strong>Still don&apos;t know:</strong> {run.synthesisPreview.stillDontKnow.join('; ')}</p>
                        <p>Reads like brand deck: {run.synthesisPreview.readsLikeBrandDeck ? 'YES (FAIL)' : 'NO'}</p>
                      </article>
                    )}
                  </>
                )}

                {section === 'RECOGNITION' && (
                  <>
                    <h2>DO YOU FEEL LIKE YOU KNOW HER?</h2>
                    <p>This gate cannot be inferred — you must explicitly select YES_I_KNOW_HER to unlock synthesis readiness.</p>
                    <label>
                      Note
                      <input value={recognitionNote} onChange={(e) => setRecognitionNote(e.target.value)} />
                    </label>
                    <div className="site00-experiment-g__tabs">
                      {FOUNDER_RECOGNITION_RESPONSES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          className="site00-experiment-g__tab"
                          disabled={busy}
                          onClick={() =>
                            void act(() =>
                              site00ProjectsApi.founderCharacterDiscoveryRecognition(
                                projectSlug,
                                r,
                                recognitionNote || undefined,
                              ),
                              { goToSection: 'CASTING' },
                            )
                          }
                        >
                          {r.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                    {run.founderRecognition.response && (
                      <p>Current: {run.founderRecognition.response} (inferred: {String(run.founderRecognition.inferred)})</p>
                    )}
                  </>
                )}

                {section === 'CASTING' && casting && (
                  <>
                    <h2>CASTING READINESS</h2>
                    <p>State: {casting.state}</p>
                    <p>Ready for character synthesis: {String(casting.readyForCharacterSynthesis)}</p>
                    <p>Ready for casting exploration: {String(casting.readyForCastingExploration)}</p>
                    <p>Founder knows her: {String(casting.founderKnowsHer)}</p>
                    <p>Humanity evaluation pass: {String(casting.humanityEvaluationPass)}</p>
                    {casting.blockingGates.length > 0 && (
                      <>
                        <p><strong>Blocking gates:</strong></p>
                        <ul>
                          {casting.blockingGates.map((g) => (
                            <li key={g}>{g}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    <p>Humanity: {run.humanityEvaluation.passes ? 'PASS' : run.humanityEvaluation.failures.join(', ')}</p>
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
