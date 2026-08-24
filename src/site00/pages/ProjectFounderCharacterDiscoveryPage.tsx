import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi, Site00ProjectsApiError } from '../services/site00ProjectsApi';
import {
  site00ProjectEmbodiedCharacterDiscoveryPath,
  site00ProjectPath,
} from '../config/routes';
import {
  buildFounderCharacterDiscoveryProgress,
  type DiscoveryProgressNavigateTarget,
} from '../utils/founderCharacterDiscoveryProgress';
import { projectDisplayName } from '../utils/projectDisplayName';
import { VOICE_LAB_CHANNELS } from '../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/constants';
import { FOUNDER_RECOGNITION_RESPONSES } from '../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/constants';
import { VISUAL_HYPOTHESIS_JUDGMENTS } from '../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/constants';
import { speakWithProfile, preloadSpeechVoices } from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterVoice/voicePlaybackClient';
import type { NdxFounderCharacterDiscoveryRun } from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types';
import type { CharacterCalibrationInteraction } from '../../../shared/site00-studio-world-production/founderCharacterCalibration/types';
import { FOUNDER_CALIBRATION_REACTIONS } from '../../../shared/site00-studio-world-production/founderCharacterCalibration/constants';
import {
  castingStatusHeadline,
} from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxCastingReadinessBridge';
import {
  isVoiceApprovalJudgment,
  judgmentRequiresVoiceRevisionNote,
  revisionNotePlaceholder,
  VOICE_REVISION_JUDGMENTS,
} from '../../../shared/site00-studio-world-production/embodiedCharacterVoice/voiceFounderRevisionLabels.js';
import {
  founderTraitJudgmentLabel,
  groupFounderTraitsBySection,
} from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxFounderTraitPropositionsClient';
import {
  countCurrentVoiceLabItems,
  countPriorVoiceLabItems,
  filterVoiceLabRounds,
  listSupersededClipsFromLatestRound,
  resolveLatestNeuralRoundId,
  type VoiceLabTabId,
  canGenerateNextNeuralRound,
  nextNeuralRoundUnlockHint,
} from '../utils/voiceLabTabs';
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
  'LANGUAGE_LAB',
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
  const [scenarioNotes, setScenarioNotes] = useState('');
  const [recognitionNote, setRecognitionNote] = useState('');
  const [calibrationRevision, setCalibrationRevision] = useState('');
  const [compareIds, setCompareIds] = useState<[string, string] | null>(null);
  const [playingHypothesisId, setPlayingHypothesisId] = useState<string | null>(null);
  const [neuralEstimate, setNeuralEstimate] = useState<Record<string, unknown> | null>(null);
  const [neuralConfigured, setNeuralConfigured] = useState<boolean | null>(null);
  const [neuralStatusError, setNeuralStatusError] = useState<string | null>(null);
  const [voiceRevisionDraft, setVoiceRevisionDraft] = useState<{ hypothesisId: string; judgment: string } | null>(null);
  const [voiceRevisionNote, setVoiceRevisionNote] = useState('');
  const [voiceLabTab, setVoiceLabTab] = useState<VoiceLabTabId>('CURRENT');
  const [currentInteraction, setCurrentInteraction] = useState<CharacterCalibrationInteraction | null>(null);
  const [showWhyThisCameUp, setShowWhyThisCameUp] = useState(false);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.founderCharacterDiscoveryGet(projectSlug);
      const loaded = (result.run as NdxFounderCharacterDiscoveryRun | null) ?? null;
      setRun(loaded);
      if (typeof result.neuralProviderConfigured === 'boolean') {
        setNeuralConfigured(result.neuralProviderConfigured);
      } else if (typeof loaded?.voiceCalibrationState?.neuralProviderConfigured === 'boolean') {
        setNeuralConfigured(loaded.voiceCalibrationState.neuralProviderConfigured);
      }
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
    preloadSpeechVoices();
  }, []);

  useEffect(() => {
    if (section !== 'INSPECT' || inspectSection !== 'VOICE_LAB' || !projectSlug) return;
    void site00ProjectsApi
      .founderCharacterDiscoveryNeuralVoiceEstimate(projectSlug)
      .then((r) => {
        setNeuralEstimate(r.estimate);
        setNeuralConfigured(r.neuralProviderConfigured);
        setNeuralStatusError(null);
      })
      .catch((err) => {
        setNeuralStatusError(
          err instanceof Site00ProjectsApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Could not load neural voice estimate',
        );
      });
  }, [section, inspectSection, projectSlug, run?.voiceCalibrationState?.updatedAt]);

  const playHypothesisAudio = (hypo: {
    id: string;
    spokenCopy: string;
    audioUrl: string | null;
    playbackProfile: { pitch: number; rate: number; voiceIndex: number; providerVoiceId: string } | null;
    isDevPlaceholder?: boolean;
  }) => {
    setPlayingHypothesisId(hypo.id);
    if (hypo.audioUrl && !hypo.isDevPlaceholder) {
      const audio = new Audio(hypo.audioUrl);
      void audio.play();
      return;
    }
    if (hypo.isDevPlaceholder) {
      speakWithProfile(hypo.spokenCopy, hypo.playbackProfile);
    }
  };

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

  const cancelVoiceRevisionDraft = () => {
    setVoiceRevisionDraft(null);
    setVoiceRevisionNote('');
  };

  const onVoiceJudgmentTap = (hypothesisId: string, judgment: string) => {
    if (isVoiceApprovalJudgment(judgment)) {
      void act(
        () =>
          site00ProjectsApi.founderCharacterDiscoveryVoiceHypothesisJudgment(projectSlug, hypothesisId, judgment),
        { successMessage: `Voice judgment saved — ${judgment.replace(/_/g, ' ')}` },
      );
      return;
    }
    if (judgmentRequiresVoiceRevisionNote(judgment)) {
      setVoiceRevisionNote('');
      setVoiceRevisionDraft({ hypothesisId, judgment });
      return;
    }
    void act(
      () =>
        site00ProjectsApi.founderCharacterDiscoveryVoiceHypothesisJudgment(projectSlug, hypothesisId, judgment),
      { successMessage: `Voice judgment saved — ${judgment.replace(/_/g, ' ')}` },
    );
  };

  const submitVoiceFounderRevision = async () => {
    if (!voiceRevisionDraft) return;
    const note = voiceRevisionNote.trim();
    if (!note) {
      setActionError('Add a revision note describing what should change before confirming.');
      return;
    }
    setBusy(true);
    setActionError(null);
    setActionNotice(null);
    try {
      const result = await site00ProjectsApi.founderCharacterDiscoveryNeuralVoiceRevision(
        projectSlug,
        voiceRevisionDraft.hypothesisId,
        voiceRevisionDraft.judgment,
        note,
      );
      if (result.run) setRun(result.run as NdxFounderCharacterDiscoveryRun);
      cancelVoiceRevisionDraft();
      setActionNotice('Voice revision re-synthesized — listen and judge.');
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Voice revision failed');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!voiceRevisionDraft) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) cancelVoiceRevisionDraft();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [voiceRevisionDraft, busy]);

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Founder Character Discovery Room is NDXBOOK-only for this proof.</p>
      </EcosystemShell>
    );
  }

  const forensic = run?.forensicReport;
  const casting = run?.castingReadiness;
  const voiceRounds = run?.voiceCalibrationState?.rounds ?? [];
  const voiceHypotheses = run?.voiceCalibrationState?.hypotheses ?? [];
  const latestNeuralRoundId = resolveLatestNeuralRoundId(voiceRounds);
  const voiceLabRounds = filterVoiceLabRounds({
    rounds: voiceRounds,
    tab: voiceLabTab,
    latestNeuralRoundId,
  });
  const currentVoiceCount = countCurrentVoiceLabItems({
    rounds: voiceRounds,
    hypotheses: voiceHypotheses,
    latestNeuralRoundId,
  });
  const priorVoiceCount = countPriorVoiceLabItems({
    rounds: voiceRounds,
    hypotheses: voiceHypotheses,
    latestNeuralRoundId,
  });
  const supersededVoiceClips = listSupersededClipsFromLatestRound({
    hypotheses: voiceHypotheses,
    latestNeuralRoundId,
  });
  const nextRoundParams = {
    rounds: voiceRounds,
    neuralCandidates: run?.voiceCalibrationState?.neuralCandidates ?? [],
    latestNeuralRoundId,
  };
  const showGenerateNextNeuralRound =
    voiceLabTab === 'CURRENT' && neuralConfigured && canGenerateNextNeuralRound(nextRoundParams);
  const nextRoundUnlockHint =
    voiceLabTab === 'CURRENT' && neuralConfigured ? nextNeuralRoundUnlockHint(nextRoundParams) : null;
  const discoveryProgress = run ? buildFounderCharacterDiscoveryProgress(run) : null;

  const goToProgressStep = (target: DiscoveryProgressNavigateTarget) => {
    if (target.kind === 'section') {
      setSection(target.section);
      return;
    }
    setSection('INSPECT');
    setInspectSection(target.inspectSection as InspectionSection);
  };

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
            <p><strong>{run ? castingStatusHeadline(run) : 'CASTING: Enter discovery room to begin'}</strong> · <strong>FAL:</strong> {run?.voiceCalibrationState?.falRequests ?? 0}</p>
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

          {run && discoveryProgress && (
            <section
              className="site00-experiment-g__panel"
              style={{
                marginBottom: '12px',
                border: discoveryProgress.readyForCharacterSynthesis
                  ? '1px solid rgba(214, 255, 59, 0.55)'
                  : '1px solid rgba(245, 166, 35, 0.35)',
              }}
              aria-label="Calibration progress"
            >
              <h2 style={{ fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>
                YOUR PROGRESS — {discoveryProgress.completedCount}/{discoveryProgress.totalCount} complete (
                {discoveryProgress.percentComplete}%)
              </h2>
              <div
                role="progressbar"
                aria-valuenow={discoveryProgress.percentComplete}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{
                  height: '8px',
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: '4px',
                  marginBottom: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${discoveryProgress.percentComplete}%`,
                    height: '100%',
                    background: discoveryProgress.readyForCharacterSynthesis ? '#D6FF3B' : '#f5a623',
                  }}
                />
              </div>
              <p style={{ marginBottom: '12px' }}>
                <strong>{discoveryProgress.headline}</strong>
              </p>
              {discoveryProgress.nextStep && !discoveryProgress.readyForCharacterSynthesis && (
                <button
                  type="button"
                  className="site00-btn site00-btn--primary"
                  style={{ width: '100%', marginBottom: '12px' }}
                  onClick={() => goToProgressStep(discoveryProgress.nextStep!.navigate)}
                >
                  GO TO NEXT STEP — {discoveryProgress.nextStep.title.toUpperCase()}
                </button>
              )}
              {discoveryProgress.readyForCharacterSynthesis && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    className="site00-btn site00-btn--primary"
                    disabled={busy}
                    style={{ width: '100%' }}
                    onClick={() =>
                      void act(
                        () => site00ProjectsApi.founderCharacterDiscoveryCalibrationSynthesis(projectSlug),
                        { successMessage: 'Character read generated.', goToSection: 'SYNTHESIS' },
                      )
                    }
                  >
                    GENERATE CHARACTER READ
                  </button>
                  <Link
                    to={site00ProjectEmbodiedCharacterDiscoveryPath(projectSlug)}
                    className="site00-btn"
                    style={{ textAlign: 'center', textDecoration: 'none' }}
                  >
                    CONTINUE TO EMBODIED CHARACTER DISCOVERY →
                  </Link>
                </div>
              )}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                {discoveryProgress.steps.map((step) => (
                  <li
                    key={step.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <button
                      type="button"
                      className="site00-btn"
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        opacity: step.complete ? 0.75 : 1,
                        borderColor: step.complete ? 'rgba(214,255,59,0.35)' : undefined,
                      }}
                      onClick={() => goToProgressStep(step.navigate)}
                    >
                      {step.complete ? '✓ ' : '○ '}
                      {step.title}
                    </button>
                    <span style={{ fontSize: '0.75rem', opacity: 0.85, paddingLeft: '4px' }}>{step.detail}</span>
                  </li>
                ))}
              </ul>
              {discoveryProgress.unresolvedCalibrationCount > 0 && (
                <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>
                  {discoveryProgress.unresolvedCalibrationCount} calibration moment
                  {discoveryProgress.unresolvedCalibrationCount === 1 ? '' : 's'} still available on CALIBRATION tab.
                </p>
              )}
            </section>
          )}

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
                      Moments completed: {run.calibrationState?.totalMomentsCompleted ?? 0} · Direct YES confirmations:{' '}
                      {run.calibrationState?.directFounderTruths.length ?? 0} (need 3 YES THAT&apos;S HER for discovery
                      complete)
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
                    <h2>TRAIT CHECK-IN</h2>
                    <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                      Plain-language propositions about who she might be. React naturally — primary calibration lives on the CALIBRATION tab.
                    </p>
                    <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                      Confirmed: {forensic.founderConfirmedTraits} · Still open: {forensic.unresolvedTraits}
                    </p>
                    <label style={{ display: 'block', marginBottom: '12px' }}>
                      If ALMOST or SOMETHING ELSE — what&apos;s different?
                      <input value={traitRevision} onChange={(e) => setTraitRevision(e.target.value)} style={{ width: '100%' }} />
                    </label>
                    {groupFounderTraitsBySection(forensic.traits).map(({ section: traitSection, traits }) => (
                      <section key={traitSection} style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>{traitSection}</h3>
                        {traits.map((trait) => {
                          const prompt = trait.founderPrompt ?? trait.statement;
                          const savedLabel = founderTraitJudgmentLabel(trait.authority);
                          return (
                            <article key={trait.traitId} className="site00-experiment-g__panel" style={{ marginBottom: '12px' }}>
                              <p style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '8px' }}>{prompt}</p>
                              {trait.contextNote && (
                                <p style={{ fontSize: '0.8rem', opacity: 0.75, marginBottom: '8px' }}>{trait.contextNote}</p>
                              )}
                              {savedLabel && (
                                <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                                  <strong>{savedLabel}</strong>
                                  {trait.authority === 'FOUNDER_REVISED' || trait.authority === 'FOUNDER_ADDED'
                                    ? `: ${trait.statement}`
                                    : ''}
                                </p>
                              )}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                  { judgment: 'YES_EXACTLY', label: "YES — THAT'S HER" },
                                  { judgment: 'CLOSE_BUT', label: 'ALMOST — CLOSE BUT…' },
                                  { judgment: 'NO', label: 'NO — NOT HER' },
                                  { judgment: 'I_DONT_KNOW_YET', label: "NOT SURE YET" },
                                ].map(({ judgment, label }) => (
                                  <button
                                    key={judgment}
                                    type="button"
                                    className="site00-btn site00-btn--primary"
                                    disabled={busy}
                                    style={{ width: '100%', textAlign: 'left' }}
                                    onClick={() =>
                                      void act(
                                        () =>
                                          site00ProjectsApi.founderCharacterDiscoveryTraitJudgment(
                                            projectSlug,
                                            trait.traitId,
                                            judgment,
                                            judgment === 'CLOSE_BUT' || judgment === 'SOMETHING_ELSE'
                                              ? traitRevision || undefined
                                              : undefined,
                                            undefined,
                                          ),
                                        { successMessage: 'Saved.' },
                                      )
                                    }
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                              <details style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                                <summary>More reactions</summary>
                                <div className="site00-experiment-g__tabs" style={{ marginTop: '8px' }}>
                                  {['ABSOLUTELY_NOT', 'TOO_BRAND_LIKE', 'TOO_PERFECT', 'SOMETHING_ELSE', 'IT_DEPENDS'].map((j) => (
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
                                            j === 'SOMETHING_ELSE' || j === 'CLOSE_BUT' ? traitRevision || undefined : undefined,
                                            undefined,
                                          ),
                                        )
                                      }
                                    >
                                      {j.replace(/_/g, ' ')}
                                    </button>
                                  ))}
                                </div>
                              </details>
                            </article>
                          );
                        })}
                      </section>
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

                {section === 'INSPECT' && inspectSection === 'LANGUAGE_LAB' && (
                  <>
                    <h2>CHARACTER LANGUAGE LAB</h2>
                    <p>What words would she use? Same thought — different channels. Judge each register.</p>
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

                {section === 'INSPECT' && inspectSection === 'VOICE_LAB' && (
                  <>
                    <h2>CHARACTER VOICE LAB</h2>
                    <p><strong>NEURAL CASTING MODE</strong> — Let&apos;s find her actual voice. Same line. Different women.</p>
                    {neuralConfigured === false && (
                      <p style={{ color: '#f5a623', marginBottom: '12px' }}>
                        NEURAL VOICE PROVIDER NOT CONFIGURED — placeholder browser voices are disabled for casting.
                        Configure <strong>FAL_KEY</strong> on the Railway service that runs <strong>api.site00.com</strong>, then redeploy the API.
                      </p>
                    )}
                    {neuralStatusError && neuralConfigured !== false && (
                      <p style={{ color: '#f5a623', marginBottom: '12px' }}>
                        Could not refresh neural voice cost estimate ({neuralStatusError}). Provider status may still be OK — try START NEURAL VOICE AUDITION or reload.
                      </p>
                    )}
                    {run.voiceCalibrationState?.castingMode === 'DEV_PLACEHOLDER' && neuralConfigured && (
                      <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                        PLACEHOLDER VOICES DISABLED FOR CASTING. Prior browser-TTS auditions preserved as placeholder evidence only.
                      </p>
                    )}
                    {run.voiceCalibrationState?.sessionMessage && (
                      <p style={{ fontStyle: 'italic', marginBottom: '12px' }}>{run.voiceCalibrationState.sessionMessage}</p>
                    )}
                    {run.voiceCalibrationState?.rounds.some((r) => r.isNeuralRound && r.status === 'JUDGMENTS_COMPLETE') &&
                      !run.voiceCalibrationState?.neuralCandidates.some((c) => c.founderStatus === 'CLOSE' || c.founderStatus === 'YES') && (
                      <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                        If one voice felt closest, tap <strong>CLOSE</strong> on her before the next round — siblings refine that same woman, not a full recast.
                      </p>
                    )}
                    {neuralEstimate && neuralConfigured && (
                      <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                        Est. {String(neuralEstimate.candidateCount ?? 4)} clips · ~
                        ${String(neuralEstimate.estimatedCostUsd ?? '?')} · {String(neuralEstimate.endpoint ?? 'neural TTS')}
                      </p>
                    )}
                    {run.voiceCalibrationState?.progress && (
                      <ul style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                        {run.voiceCalibrationState.progress.map((p) => (
                          <li key={p.domain}>
                            {p.label}{' '}
                            <strong>{p.level}</strong>
                          </li>
                        ))}
                      </ul>
                    )}
                    <nav className="site00-experiment-g__tabs" aria-label="Voice lab auditions">
                      <button
                        type="button"
                        className={
                          voiceLabTab === 'CURRENT'
                            ? 'site00-experiment-g__tab site00-experiment-g__tab--active'
                            : 'site00-experiment-g__tab'
                        }
                        onClick={() => setVoiceLabTab('CURRENT')}
                      >
                        CURRENT ({currentVoiceCount})
                      </button>
                      <button
                        type="button"
                        className={
                          voiceLabTab === 'PRIOR'
                            ? 'site00-experiment-g__tab site00-experiment-g__tab--active'
                            : 'site00-experiment-g__tab'
                        }
                        onClick={() => setVoiceLabTab('PRIOR')}
                      >
                        PRIOR ({priorVoiceCount})
                      </button>
                    </nav>
                    <p style={{ fontSize: '0.8rem', margin: '8px 0 12px' }}>
                      {voiceLabTab === 'CURRENT'
                        ? 'Latest neural audition only — judge, revise, and regenerate here.'
                        : 'Earlier rounds, placeholder evidence, and superseded clips from revisions.'}
                    </p>
                    {showGenerateNextNeuralRound && (
                      <article
                        className="site00-experiment-g__panel"
                        style={{ marginBottom: '12px', border: '1px solid rgba(245, 166, 35, 0.45)' }}
                      >
                        <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                          Ready for a new set of voice packs — siblings refine whoever you marked{' '}
                          <strong>CLOSE</strong> or <strong>YES</strong>.
                        </p>
                        <button
                          type="button"
                          className="site00-btn site00-btn--primary"
                          disabled={busy}
                          style={{ width: '100%' }}
                          onClick={() =>
                            void act(
                              () => site00ProjectsApi.founderCharacterDiscoveryNeuralVoiceAudition(projectSlug),
                              { successMessage: 'Next neural voice round ready.' },
                            )
                          }
                        >
                          GENERATE NEXT NEURAL ROUND
                        </button>
                      </article>
                    )}
                    {nextRoundUnlockHint && (
                      <p style={{ fontSize: '0.85rem', marginBottom: '12px', color: '#f5a623' }}>
                        {nextRoundUnlockHint}
                      </p>
                    )}
                    {voiceLabTab === 'CURRENT' &&
                      neuralConfigured &&
                      !run.voiceCalibrationState?.rounds.some((r) => r.isNeuralRound) && (
                      <button
                        type="button"
                        className="site00-btn site00-btn--primary"
                        disabled={busy}
                        onClick={() =>
                          void act(
                            () => site00ProjectsApi.founderCharacterDiscoveryNeuralVoiceAudition(projectSlug),
                            { successMessage: 'Neural voice audition generated — listen and judge.' },
                          )
                        }
                      >
                        START NEURAL VOICE AUDITION
                      </button>
                    )}
                    {voiceLabTab === 'CURRENT' && latestNeuralRoundId && currentVoiceCount === 0 && (
                      <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                        No current neural auditions yet — use START NEURAL VOICE AUDITION or GENERATE NEXT NEURAL ROUND.
                      </p>
                    )}
                    {voiceLabTab === 'PRIOR' && voiceLabRounds.length === 0 && supersededVoiceClips.length === 0 && (
                      <p style={{ fontSize: '0.85rem' }}>No prior rounds or superseded clips yet.</p>
                    )}
                    {voiceLabTab === 'PRIOR' && supersededVoiceClips.length > 0 && (
                      <article className="site00-experiment-g__panel" style={{ marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>Superseded clips (revisions)</h3>
                        <p style={{ fontSize: '0.8rem', marginBottom: '8px' }}>
                          Prior audio from REGENERATE / founder revision — listen only, not for new judgments.
                        </p>
                        {supersededVoiceClips.map((clip) => (
                          <div key={clip.assetId} style={{ marginBottom: '10px' }}>
                            <p style={{ fontSize: '0.85rem', margin: '0 0 4px' }}>
                              <strong>{clip.hypothesisLabel}</strong> · prior clip
                            </p>
                            <button
                              type="button"
                              className="site00-btn"
                              style={{ width: '100%' }}
                              onClick={() => {
                                setPlayingHypothesisId(clip.hypothesisId);
                                void new Audio(clip.audioUrl).play();
                              }}
                            >
                              ▶ PLAY PRIOR CLIP
                            </button>
                          </div>
                        ))}
                      </article>
                    )}
                    {voiceLabRounds.map((round) => {
                      const roundHypos = voiceHypotheses.filter((h) => h.roundId === round.roundId);
                      const isPlaceholderRound = round.isNeuralRound === false || round.castingMode === 'DEV_PLACEHOLDER';
                      const isCurrentRound = voiceLabTab === 'CURRENT' && round.roundId === latestNeuralRoundId;
                      const showJudgmentControls = isCurrentRound && !isPlaceholderRound;
                      return (
                        <article key={round.roundId} className="site00-experiment-g__panel" style={{ marginTop: '12px' }}>
                          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            ROUND {round.roundNumber} · {round.roundType.replace(/_/g, ' ')}
                            {isPlaceholderRound ? ' · PLACEHOLDER EVIDENCE' : isCurrentRound ? ' · CURRENT NEURAL' : ' · PRIOR NEURAL'}
                          </p>
                          <p><strong>{round.question}</strong></p>
                          <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                            &ldquo;{round.spokenCopy}&rdquo;
                          </p>
                          {isPlaceholderRound && (
                            <p style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                              Placeholder calibration — not valid casting evidence.
                            </p>
                          )}
                          {roundHypos.map((hypo) => (
                            <div key={hypo.id} style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                              <p><strong>{hypo.hypothesisLabel}</strong></p>
                              {isCurrentRound && (hypo.revisionHistory?.length ?? 0) > 0 && (
                                <p style={{ fontSize: '0.75rem', color: '#f5a623' }}>
                                  REVISED · {(hypo.revisionHistory ?? []).length} founder note{(hypo.revisionHistory ?? []).length === 1 ? '' : 's'}
                                </p>
                              )}
                              {!round.blindAudition && !isPlaceholderRound && (
                                <p style={{ fontSize: '0.8rem' }}>{hypo.vocalCharacter}</p>
                              )}
                              <button
                                type="button"
                                className="site00-btn site00-btn--primary"
                                disabled={busy || (!hypo.audioUrl && !hypo.isDevPlaceholder) || hypo.generationStatus === 'GENERATING'}
                                style={{ width: '100%', marginTop: '8px', padding: '12px' }}
                                onClick={() => playHypothesisAudio(hypo)}
                              >
                                {playingHypothesisId === hypo.id ? '▶ PLAYING' : hypo.generationStatus === 'GENERATING' ? '▶ RE-SYNTHESIZING…' : '▶ PLAY'}
                              </button>
                              {!isPlaceholderRound && hypo.audioUrl && showJudgmentControls && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                                  <button
                                    type="button"
                                    className="site00-btn site00-btn--primary"
                                    disabled={busy || hypo.generationStatus === 'GENERATING'}
                                    style={{ width: '100%' }}
                                    onClick={() =>
                                      void act(
                                        () =>
                                          site00ProjectsApi.founderCharacterDiscoveryNeuralVoiceRegenerate(
                                            projectSlug,
                                            hypo.id,
                                            'REGENERATE_CURRENT',
                                          ),
                                        { successMessage: `${hypo.hypothesisLabel} regenerated from current contract.` },
                                      )
                                    }
                                  >
                                    REGENERATE CURRENT
                                  </button>
                                  <button
                                    type="button"
                                    className="site00-btn"
                                    disabled={busy || hypo.generationStatus === 'GENERATING' || !(hypo.promptSnapshots?.length ?? 0)}
                                    style={{ width: '100%' }}
                                    onClick={() =>
                                      void act(
                                        () =>
                                          site00ProjectsApi.founderCharacterDiscoveryNeuralVoiceRegenerate(
                                            projectSlug,
                                            hypo.id,
                                            'REPLAY_GENERATION',
                                          ),
                                        { successMessage: `${hypo.hypothesisLabel} replayed from historical prompt.` },
                                      )
                                    }
                                  >
                                    REPLAY HISTORICAL PROMPT
                                  </button>
                                </div>
                              )}
                              {!isPlaceholderRound && showJudgmentControls && (
                                <>
                                  <p style={{ fontSize: '0.75rem', marginTop: '12px', textTransform: 'uppercase' }}>
                                    Does this sound like an actual woman speaking?
                                  </p>
                                  {hypo.humanWomanTest && (
                                    <p style={{ fontSize: '0.85rem' }}>
                                      <strong>Saved:</strong> {hypo.humanWomanTest.replace(/_/g, ' ')}
                                    </p>
                                  )}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                                    {[
                                      { r: 'YES_SOUNDS_HUMAN', label: 'YES' },
                                      { r: 'MOSTLY_HUMAN', label: 'MOSTLY' },
                                      { r: 'NO_SOUNDS_SYNTHETIC', label: 'NO — SOUNDS SYNTHETIC' },
                                    ].map(({ r, label }) => (
                                      <button
                                        key={r}
                                        type="button"
                                        className="site00-btn"
                                        disabled={busy}
                                        style={{ width: '100%', textAlign: 'left' }}
                                        onClick={() =>
                                          void act(
                                            () =>
                                              site00ProjectsApi.founderCharacterDiscoveryHumanWomanTest(
                                                projectSlug,
                                                hypo.id,
                                                r,
                                              ),
                                            { successMessage: `Naturalness saved — ${label}` },
                                          )
                                        }
                                      >
                                        {label}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                              {showJudgmentControls && (
                                <>
                              <p style={{ fontSize: '0.75rem', marginTop: '12px', textTransform: 'uppercase' }}>
                                Is this her?
                              </p>
                              {hypo.founderJudgment && (
                                <p style={{ fontSize: '0.85rem' }}>
                                  <strong>Saved:</strong> {hypo.founderJudgment.replace(/_/g, ' ')}
                                </p>
                              )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                                  {[
                                    { j: 'YES_THATS_HER', label: "YES — THAT'S HER" },
                                    { j: 'CLOSE', label: 'CLOSE' },
                                    { j: 'NO_NOT_HER', label: 'NO — NOT HER' },
                                    { j: 'VOICE_RIGHT_PERFORMANCE_WRONG', label: 'VOICE RIGHT / PERFORMANCE WRONG' },
                                    { j: 'RIGHT_CHARACTER_TOO_SYNTHETIC', label: 'RIGHT CHARACTER / TOO SYNTHETIC' },
                                  ].map(({ j, label }) => (
                                    <button
                                      key={j}
                                      type="button"
                                      className="site00-btn site00-btn--primary"
                                      disabled={busy || hypo.generationStatus === 'GENERATING'}
                                      style={{ width: '100%', textAlign: 'left' }}
                                      onClick={() => onVoiceJudgmentTap(hypo.id, j)}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>
                                  <p style={{ fontSize: '0.75rem', marginTop: '12px', textTransform: 'uppercase' }}>
                                    Revision labels (note → re-synthesize)
                                  </p>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                    {VOICE_REVISION_JUDGMENTS.filter(
                                      (j) =>
                                        j !== 'VOICE_RIGHT_PERFORMANCE_WRONG' &&
                                        j !== 'RIGHT_CHARACTER_TOO_SYNTHETIC' &&
                                        j !== 'CUSTOM',
                                    ).map((j) => (
                                      <button
                                        key={j}
                                        type="button"
                                        className="site00-btn"
                                        disabled={busy || hypo.generationStatus === 'GENERATING'}
                                        style={{ fontSize: '0.75rem', margin: '2px' }}
                                        onClick={() => onVoiceJudgmentTap(hypo.id, j)}
                                      >
                                        {j.replace(/_/g, ' ')}
                                      </button>
                                    ))}
                                  </div>
                                  <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '6px' }}>
                                    Approval labels save immediately. Revision labels open a note — confirm to re-synthesize via neural TTS.
                                  </p>
                                </>
                              )}
                              {!showJudgmentControls && !isPlaceholderRound && hypo.founderJudgment && (
                                <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
                                  <strong>Saved judgment:</strong> {hypo.founderJudgment.replace(/_/g, ' ')}
                                </p>
                              )}
                              {showJudgmentControls && (hypo.revisionHistory?.length ?? 0) > 0 && (
                                <div style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                                  <strong>REVISIONS</strong>
                                  {(hypo.revisionHistory ?? []).map((rev) => (
                                    <div key={rev.revisionId} style={{ marginTop: '4px' }}>
                                      {rev.judgment.replace(/_/g, ' ')} — {rev.status}
                                      {rev.founderNote ? `: ${rev.founderNote}` : ''}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {showJudgmentControls && (
                                <button
                                  type="button"
                                  className="site00-btn"
                                  style={{ marginTop: '6px', fontSize: '0.8rem' }}
                                  onClick={() =>
                                    setCompareIds((prev) => {
                                      if (!prev) return [hypo.id, hypo.id];
                                      if (prev[0] === hypo.id) return null;
                                      return [prev[0], hypo.id];
                                    })
                                  }
                                >
                                  {compareIds?.includes(hypo.id) ? 'SELECTED FOR COMPARE' : 'COMPARE'}
                                </button>
                              )}
                            </div>
                          ))}
                        </article>
                      );
                    })}
                    {voiceLabTab === 'CURRENT' &&
                      compareIds &&
                      compareIds[0] !== compareIds[1] && (
                      <article className="site00-experiment-g__panel">
                        <h3>COMPARE A ↔ B</h3>
                        <p>Which feels more like her?</p>
                        {['PREFER_A', 'PREFER_B', 'SOMETHING_BETWEEN', 'EACH_HAS_SOMETHING'].map((pref) => (
                          <button
                            key={pref}
                            type="button"
                            className="site00-btn"
                            disabled={busy}
                            onClick={() =>
                              void act(
                                () =>
                                  site00ProjectsApi.founderCharacterDiscoveryVoicePairwise(
                                    projectSlug,
                                    compareIds[0]!,
                                    compareIds[1]!,
                                    pref,
                                  ),
                                { successMessage: 'Pairwise preference saved.' },
                              )
                            }
                          >
                            {pref.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </article>
                    )}
                    {run.voiceCalibrationState?.emergingIdentity && (
                      <article className="site00-experiment-g__panel" style={{ marginTop: '12px' }}>
                        <h3>I THINK I FOUND HER VOICE</h3>
                        <p>{run.voiceCalibrationState.emergingIdentity.voiceIdentityThesis}</p>
                        <button
                          type="button"
                          className="site00-btn site00-btn--primary"
                          disabled={busy}
                          onClick={() =>
                            void act(
                              () =>
                                site00ProjectsApi.founderCharacterDiscoveryVoiceRecognition(
                                  projectSlug,
                                  'YES_THATS_HER_VOICE',
                                ),
                              { successMessage: 'Voice recognition saved.' },
                            )
                          }
                        >
                          YES — THAT&apos;S HER VOICE
                        </button>
                        <button
                          type="button"
                          className="site00-btn"
                          disabled={busy}
                          onClick={() =>
                            void act(
                              () =>
                                site00ProjectsApi.founderCharacterDiscoveryVoiceRecognition(
                                  projectSlug,
                                  'ALMOST_KEEP_CALIBRATING',
                                ),
                              { successMessage: 'Keep calibrating.' },
                            )
                          }
                        >
                          ALMOST — KEEP CALIBRATING
                        </button>
                      </article>
                    )}
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

                {section === 'CASTING' && casting && discoveryProgress && (
                  <>
                    <h2>CASTING READINESS</h2>
                    <p>
                      <strong>
                        {casting.readyForCharacterSynthesis
                          ? 'All gates passed — ready for character synthesis'
                          : `${discoveryProgress.completedCount}/${discoveryProgress.totalCount} checklist items complete`}
                      </strong>
                    </p>
                    {!casting.readyForCharacterSynthesis && discoveryProgress.nextStep && (
                      <button
                        type="button"
                        className="site00-btn site00-btn--primary"
                        style={{ width: '100%', marginBottom: '12px' }}
                        onClick={() => goToProgressStep(discoveryProgress.nextStep!.navigate)}
                      >
                        GO TO NEXT STEP — {discoveryProgress.nextStep.title.toUpperCase()}
                      </button>
                    )}
                    {casting.readyForCharacterSynthesis && (
                      <button
                        type="button"
                        className="site00-btn site00-btn--primary"
                        disabled={busy}
                        style={{ width: '100%', marginBottom: '12px' }}
                        onClick={() =>
                          void act(
                            () => site00ProjectsApi.founderCharacterDiscoveryCalibrationSynthesis(projectSlug),
                            { successMessage: 'Character read generated.', goToSection: 'SYNTHESIS' },
                          )
                        }
                      >
                        GENERATE CHARACTER READ
                      </button>
                    )}
                    <ul style={{ fontSize: '0.85rem' }}>
                      {discoveryProgress.steps.map((step) => (
                        <li key={step.id} style={{ marginBottom: '6px' }}>
                          {step.complete ? '✓' : '○'} {step.title} — {step.detail}
                        </li>
                      ))}
                    </ul>
                    {casting.founderKnowsHer && !casting.readyForCharacterSynthesis && (
                      <p style={{ fontSize: '0.9rem', marginTop: '12px' }}>
                        YES I KNOW HER is saved. Finish the remaining checklist items above — the progress panel at the
                        top shows exactly what is left.
                      </p>
                    )}
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </div>
      {voiceRevisionDraft && (
        <div
          role="presentation"
          onClick={() => !busy && cancelVoiceRevisionDraft()}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            role="dialog"
            aria-labelledby="voice-revision-title"
            onClick={(e) => e.stopPropagation()}
            className="site00-experiment-g__panel"
            style={{ width: '100%', maxWidth: '520px', margin: 0 }}
          >
            <h2 id="voice-revision-title" style={{ marginTop: 0 }}>
              {voiceRevisionDraft.judgment.replace(/_/g, ' ')} — REVISION NOTE
            </h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Describe exactly what should change in voice or performance. On confirm, the contract updates and neural TTS re-synthesizes this clip.
            </p>
            <label style={{ display: 'block', marginTop: '12px' }}>
              Founder revision note
              <textarea
                value={voiceRevisionNote}
                onChange={(e) => setVoiceRevisionNote(e.target.value)}
                rows={4}
                placeholder={revisionNotePlaceholder(voiceRevisionDraft.judgment)}
                autoFocus
                style={{ width: '100%', marginTop: '6px', boxSizing: 'border-box' }}
              />
            </label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button type="button" className="site00-btn" onClick={cancelVoiceRevisionDraft} disabled={busy}>
                CANCEL
              </button>
              <button
                type="button"
                className="site00-btn site00-btn--primary"
                disabled={busy || !voiceRevisionNote.trim()}
                onClick={() => void submitVoiceFounderRevision()}
              >
                CONFIRM &amp; RE-SYNTHESIZE
              </button>
            </div>
          </div>
        </div>
      )}
    </EcosystemShell>
  );
}
