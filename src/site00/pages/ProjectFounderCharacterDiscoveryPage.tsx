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
import type { CharacterCalibrationInteraction } from '../../../shared/site00-studio-world-production/founderCharacterCalibration/types';
import { FOUNDER_CALIBRATION_REACTIONS } from '../../../shared/site00-studio-world-production/founderCharacterCalibration/constants';
import {
  castingStatusHeadline,
  formatCastingBlockingGate,
} from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxCastingReadinessBridge';
import '../styles/site00-replay-execution.css';

type RoomSection =
  | 'CALIBRATION'
  | 'INSPECT'
  | 'SYNTHESIS'
  | 'RECOGNITION'
  | 'CASTING';

const INSPECTION_SECTIONS = [
  'FORENSIC',
  'SCENARIOS',
  'TRAITS',
  'CONTRADICTIONS',
  'FLAWS',
  'INTELLIGENCE',
  'VOICE_LAB',
  'BOOK',
  'VISUAL',
] as const;

type InspectionSection = (typeof INSPECTION_SECTIONS)[number];

const SECTIONS: { id: RoomSection; label: string }[] = [
  { id: 'CALIBRATION', label: 'CALIBRATION' },
  { id: 'INSPECT', label: 'INSPECT' },
  { id: 'SYNTHESIS', label: 'SYNTHESIS' },
  { id: 'RECOGNITION', label: 'I KNOW HER' },
  { id: 'CASTING', label: 'CASTING' },
];

const REACTION_LABELS: Record<(typeof FOUNDER_CALIBRATION_REACTIONS)[number], string> = {
  YES_THATS_HER: "YES — THAT'S HER",
  ALMOST: 'ALMOST',
  NO_NOT_HER: 'NO — NOT HER',
  IT_DEPENDS: 'IT DEPENDS',
  I_DONT_KNOW_YET: "I'M NOT SURE YET",
};

const SCENARIO_ESCAPE = ['NONE_OF_THESE', 'SOMETHING_ELSE', 'IT_DEPENDS', 'I_DONT_KNOW_YET'];

export default function ProjectFounderCharacterDiscoveryPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<NdxFounderCharacterDiscoveryRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [section, setSection] = useState<RoomSection>('CALIBRATION');
  const [inspectSection, setInspectSection] = useState<InspectionSection>('FORENSIC');
  const [traitRevision, setTraitRevision] = useState('');
  const [traitNote, setTraitNote] = useState('');
  const [scenarioNotes, setScenarioNotes] = useState('');
  const [recognitionNote, setRecognitionNote] = useState('');
  const [calibrationRevision, setCalibrationRevision] = useState('');
  const [currentInteraction, setCurrentInteraction] = useState<CharacterCalibrationInteraction | null>(null);
  const [showWhyThisCameUp, setShowWhyThisCameUp] = useState(false);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.founderCharacterDiscoveryGet(projectSlug);
      const loaded = (result.run as NdxFounderCharacterDiscoveryRun | null) ?? null;
      setRun(loaded);
      if (loaded?.calibrationState?.currentInteractionId) {
        const interaction =
          loaded.calibrationState.interactions.find(
            (i) => i.interactionId === loaded.calibrationState?.currentInteractionId,
          ) ?? null;
        setCurrentInteraction(interaction);
      }
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
            <p className="site00-project-lore-calibration__kicker">P0.5E.4A — ADAPTIVE FOUNDER CHARACTER CALIBRATION</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">
              I THINK I KNOW WHO SHE IS — TELL ME WHERE I&apos;M RIGHT. TELL ME WHERE I&apos;M WRONG.
            </p>
            <Link to={site00ProjectEmbodiedCharacterDiscoveryPath(projectSlug)}>← EMBODIED CHARACTER DISCOVERY</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          <section className="site00-experiment-g__panel">
            <h2>CHARACTER CALIBRATION</h2>
            <p>The system proposes. You calibrate. Recognition — not invention.</p>
            <p><strong>{run ? castingStatusHeadline(run) : 'CASTING: Enter discovery room to begin'}</strong> · <strong>FAL:</strong> 0</p>
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
                {section === 'CALIBRATION' && (
                  <>
                    <h2>I&apos;M GETTING HER.</h2>
                    {run.calibrationState?.progress && (
                      <ul style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                        {run.calibrationState.progress.map((p) => (
                          <li key={p.domain}>
                            {p.label}{' '}
                            <strong>{p.level}</strong>
                          </li>
                        ))}
                      </ul>
                    )}
                    {run.calibrationState?.stillUnsureAbout?.length ? (
                      <p style={{ fontSize: '0.85rem' }}>
                        <strong>WHAT I&apos;M STILL UNSURE ABOUT:</strong>{' '}
                        {run.calibrationState.stillUnsureAbout.join(' · ')}
                      </p>
                    ) : null}
                    {!currentInteraction && (
                      <button
                        type="button"
                        className="site00-btn site00-btn--primary"
                        disabled={busy}
                        onClick={() =>
                          void act(async () => {
                            const result = await site00ProjectsApi.founderCharacterDiscoveryCalibrationContinue(projectSlug);
                            if (result.run) setRun(result.run as NdxFounderCharacterDiscoveryRun);
                            setCurrentInteraction((result.interaction as CharacterCalibrationInteraction | null) ?? null);
                            return { run: result.run };
                          }, { successMessage: 'Next calibration moment ready.' })
                        }
                      >
                        CONTINUE CALIBRATION
                      </button>
                    )}
                    {currentInteraction && (
                      <article className="site00-experiment-g__panel" style={{ marginTop: '12px' }}>
                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          I THINK I KNOW THIS ABOUT HER…
                        </p>
                        {currentInteraction.proposition && currentInteraction.proposition !== currentInteraction.systemRead && (
                          <p style={{ whiteSpace: 'pre-wrap', marginBottom: '8px' }}>{currentInteraction.proposition}</p>
                        )}
                        <p style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', lineHeight: 1.5, marginBottom: '16px' }}>
                          {currentInteraction.systemRead}
                        </p>
                        <p style={{ fontWeight: 600, marginBottom: '12px' }}>{currentInteraction.promptQuestion}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {FOUNDER_CALIBRATION_REACTIONS.map((reaction) => (
                            <button
                              key={reaction}
                              type="button"
                              className="site00-btn site00-btn--primary"
                              disabled={busy}
                              style={{ width: '100%', textAlign: 'left' }}
                              onClick={() =>
                                void act(async () => {
                                  const needsRevision = reaction === 'ALMOST' || reaction === 'IT_DEPENDS';
                                  const result = await site00ProjectsApi.founderCharacterDiscoveryCalibrationReaction(
                                    projectSlug,
                                    currentInteraction.interactionId,
                                    reaction,
                                    needsRevision ? calibrationRevision || undefined : undefined,
                                  );
                                  if (result.run) setRun(result.run as NdxFounderCharacterDiscoveryRun);
                                  setCurrentInteraction((result.nextInteraction as CharacterCalibrationInteraction | null) ?? null);
                                  setCalibrationRevision('');
                                  return { run: result.run };
                                })
                              }
                            >
                              {REACTION_LABELS[reaction]}
                            </button>
                          ))}
                        </div>
                        <label style={{ display: 'block', marginTop: '12px', fontSize: '0.85rem' }}>
                          What&apos;s different? (for ALMOST / IT DEPENDS)
                          <textarea
                            value={calibrationRevision}
                            onChange={(e) => setCalibrationRevision(e.target.value)}
                            rows={2}
                            style={{ width: '100%', marginTop: '4px' }}
                          />
                        </label>
                        <button
                          type="button"
                          className="site00-btn"
                          style={{ marginTop: '8px' }}
                          onClick={() => setShowWhyThisCameUp((v) => !v)}
                        >
                          {showWhyThisCameUp ? 'HIDE' : 'WHY AM I SEEING THIS?'}
                        </button>
                        {showWhyThisCameUp && (
                          <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                            {currentInteraction.whyThisCameUp}
                            {' · '}
                            {currentInteraction.momentType.replace(/_/g, ' ')}
                            {' · '}
                            {currentInteraction.domain.replace(/_/g, ' ')}
                          </p>
                        )}
                      </article>
                    )}
                    {run.calibrationState?.sessions?.at(-1)?.sessionCompleteMessage && (
                      <p style={{ marginTop: '12px', fontStyle: 'italic' }}>
                        {run.calibrationState.sessions.at(-1)?.sessionCompleteMessage}
                      </p>
                    )}
                    <p style={{ fontSize: '0.8rem', marginTop: '12px' }}>
                      Moments completed: {run.calibrationState?.totalMomentsCompleted ?? 0}
                    </p>
                  </>
                )}

                {section === 'INSPECT' && (
                  <>
                    <nav className="site00-experiment-g__tabs" aria-label="Inspection sections">
                      {INSPECTION_SECTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={
                            inspectSection === s
                              ? 'site00-experiment-g__tab site00-experiment-g__tab--active'
                              : 'site00-experiment-g__tab'
                          }
                          onClick={() => setInspectSection(s)}
                        >
                          {s.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </nav>
                    <p style={{ fontSize: '0.8rem', margin: '8px 0' }}>
                      Optional inspection — methodology metadata lives here, not in primary calibration.
                    </p>
                  </>
                )}

                {section === 'INSPECT' && inspectSection === 'FORENSIC' && forensic && (
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

                {section === 'INSPECT' && inspectSection === 'SCENARIOS' && (
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

                {section === 'INSPECT' && inspectSection === 'TRAITS' && forensic && (
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

                {section === 'INSPECT' && inspectSection === 'CONTRADICTIONS' && (
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

                {section === 'INSPECT' && inspectSection === 'FLAWS' && (
                  <>
                    <h2>FLAWS + ANNOYING TRAITS</h2>
                    {run.flawProfile.flaws.map((f) => (
                      <p key={f.flawId}><strong>{f.category}:</strong> {f.description}</p>
                    ))}
                    <p><strong>Best friend would roast her for:</strong> {run.flawProfile.bestFriendWouldRoastHerFor.join('; ')}</p>
                    <p><strong>Procrastinates:</strong> {run.flawProfile.procrastinates.join('; ')}</p>
                  </>
                )}

                {section === 'INSPECT' && inspectSection === 'INTELLIGENCE' && (
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

                {section === 'INSPECT' && inspectSection === 'VOICE_LAB' && (
                  <>
                    <h2>CHARACTER VOICE LAB</h2>
                    <p>Same thought — different channels. Judge each register.</p>
                    {run.voiceLabSamples.map((sample) => (
                      <article key={sample.sampleId} className="site00-experiment-g__panel">
                        <p><strong>Underlying thought:</strong> {sample.underlyingThought}</p>
                        {VOICE_LAB_CHANNELS.map((channel) => (
                          <div key={channel}>
                            <p><strong>{channel.replace(/_/g, ' ')}:</strong> {sample.expressions[channel]}</p>
                            {sample.judgments[channel] && (
                              <p style={{ fontSize: '0.85rem' }}>
                                <strong>Saved:</strong> {sample.judgments[channel]!.replace(/_/g, ' ')}
                              </p>
                            )}
                            <button
                              type="button"
                              className="site00-btn"
                              disabled={busy}
                              onClick={() =>
                                void act(
                                  () =>
                                    site00ProjectsApi.founderCharacterDiscoveryVoiceJudgment(
                                      projectSlug,
                                      sample.sampleId,
                                      channel,
                                      'YES_EXACTLY',
                                    ),
                                  { successMessage: `${channel.replace(/_/g, ' ')} saved — THAT'S HER` },
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
                                void act(
                                  () =>
                                    site00ProjectsApi.founderCharacterDiscoveryVoiceJudgment(
                                      projectSlug,
                                      sample.sampleId,
                                      channel,
                                      'TOO_BRAND_LIKE',
                                    ),
                                  { successMessage: `${channel.replace(/_/g, ' ')} saved — TOO BRAND-LIKE` },
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

                {section === 'INSPECT' && inspectSection === 'BOOK' && (
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

                {section === 'INSPECT' && inspectSection === 'VISUAL' && (
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
                    <h2>CHARACTER READ — WHO I THINK SHE IS</h2>
                    <p>Human-readable synthesis from calibration — not the final Character Bible.</p>
                    <button
                      type="button"
                      className="site00-btn site00-btn--primary"
                      disabled={busy}
                      onClick={() =>
                        void act(() => site00ProjectsApi.founderCharacterDiscoveryCalibrationSynthesis(projectSlug), {
                          successMessage: 'Character read updated.',
                        })
                      }
                    >
                      REFRESH CHARACTER READ
                    </button>
                    {run.humanReadableSynthesis && (
                      <article className="site00-experiment-g__panel">
                        <p><strong>Who I think she is:</strong> {run.humanReadableSynthesis.whoIThinkSheIs}</p>
                        <p><strong>How she thinks:</strong> {run.humanReadableSynthesis.howSheThinks}</p>
                        <p><strong>What annoys her:</strong> {run.humanReadableSynthesis.whatAnnoysHer}</p>
                        <p><strong>What she gets wrong:</strong> {run.humanReadableSynthesis.whatSheGetsWrong}</p>
                        <p><strong>When she&apos;s wrong:</strong> {run.humanReadableSynthesis.howSheActsWhenWrong}</p>
                        <p><strong>How she talks:</strong> {run.humanReadableSynthesis.howSheTalks}</p>
                        <p><strong>Book:</strong> {run.humanReadableSynthesis.whySheKeepsTheBook} · {run.humanReadableSynthesis.howSheUsesTheBook}</p>
                        <p><strong>Looks like so far:</strong> {run.humanReadableSynthesis.whatSheLooksLikeSoFar}</p>
                        <p><strong>Still don&apos;t know:</strong> {run.humanReadableSynthesis.whatIStillDontKnow.join('; ')}</p>
                      </article>
                    )}
                    {!run.humanReadableSynthesis && run.synthesisPreview && (
                      <article className="site00-experiment-g__panel">
                        <p><strong>Who she is:</strong> {run.synthesisPreview.whoSheIs}</p>
                        <p><strong>What she wants:</strong> {run.synthesisPreview.whatSheWants}</p>
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
                        <p><strong>What&apos;s still blocking:</strong></p>
                        <ul>
                          {casting.blockingGates.map((g) => (
                            <li key={g}>{formatCastingBlockingGate(g)}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {casting.founderKnowsHer && !casting.readyForCharacterSynthesis && (
                      <p style={{ fontSize: '0.9rem' }}>
                        YES I KNOW HER is saved. Complete the remaining gates above — usually via CALIBRATION moments or INSPECT tabs.
                      </p>
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
