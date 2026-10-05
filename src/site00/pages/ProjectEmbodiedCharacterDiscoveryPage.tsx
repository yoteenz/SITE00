import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import {
  FounderWorkspaceShell,
  CharacterLabRoom,
  InspectorKeyValue,
} from '../components/founderWorkspace';
import { site00ProjectsApi, Site00ProjectsApiError } from '../services/site00ProjectsApi';
import {
  site00ProjectMotionCharacterPath,
  site00ProjectFounderCharacterDiscoveryPath,
} from '../config/routes';
import {
  FOUNDER_CHARACTER_JUDGMENTS,
} from '../../../shared/site00-studio-world-production/embodiedCharacterDiscovery/constants';
import type { NdxEmbodiedCharacterDiscoveryRun } from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterDiscovery/types';
import {
  buildCharacterSynthesisPresentation,
  characterLabInspectPayload,
} from '../../../shared/site00-brand-lore/founderWorkspace/characterLabAdapter';
import '../styles/site00-founder-workspace.css';
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

const LAB_MODES = [
  { id: 'CALIBRATION', label: 'CALIBRATION' },
  { id: 'LANGUAGE', label: 'LANGUAGE' },
  { id: 'VOICE', label: 'VOICE' },
  { id: 'BIBLE', label: 'BIBLE' },
  { id: 'CASTING', label: 'CASTING' },
] as const;

type LabMode = (typeof LAB_MODES)[number]['id'];

const MODE_SECTIONS: Record<LabMode, DiscoverySection[]> = {
  CALIBRATION: ['STATUS', 'VISUAL_NORTH_STARS', 'SYNTHESIS'],
  LANGUAGE: ['PSYCHOLOGY', 'INTELLIGENCE', 'CONTRADICTIONS', 'THE_BOOK'],
  VOICE: ['VOICE', 'HUMOR'],
  BIBLE: ['CULTURAL_LIFE', 'PRIVATE_HUMANITY', 'PHYSICAL_BEHAVIOR', 'CAMERA', 'STYLE', 'SCENARIO_TESTS'],
  CASTING: ['INTERVIEW', 'CASTING_READINESS'],
};

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
  const [labMode, setLabMode] = useState<LabMode>('CALIBRATION');
  const [roundAnswer, setRoundAnswer] = useState('');
  const [selectedRound, setSelectedRound] = useState('WHO_IS_SHE');
  const [judgmentNote, setJudgmentNote] = useState('');

  const reload = useCallback(async () => {
    if (!hasProjectCapability(projectSlug, 'EMBODIED_CHARACTER_DISCOVERY')) return;
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

  const synthesis = useMemo(() => buildCharacterSynthesisPresentation(run), [run]);

  const selectLabMode = (mode: LabMode) => {
    setLabMode(mode);
    const first = MODE_SECTIONS[mode][0];
    if (first) setSection(first);
  };

  if (!hasProjectCapability(projectSlug, 'EMBODIED_CHARACTER_DISCOVERY')) {
    return <p>Embodied Character Discovery is NDXBOOK-only for this proof.</p>;
  }

  const modeSections = MODE_SECTIONS[labMode];
  const inspectContent = (
    <>
      <p><strong>VISUAL DESIGN:</strong> NOT FINALIZED</p>
      <p><strong>FINAL FACE:</strong> NOT SELECTED</p>
      <p><strong>CHARACTER GENERATION:</strong> NOT PERFORMED</p>
      <InspectorKeyValue data={characterLabInspectPayload(run)} />
      <details className="site00-fws-review__inspect">
        <summary>ALL DISCOVERY SECTIONS</summary>
        <nav className="site00-fws-character__modes">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={section === s.id ? 'site00-fws-btn site00-fws-btn--primary' : 'site00-fws-btn'}
              onClick={() => setSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </details>
    </>
  );

  const labActions = (
    <>
      {actionError && (
        <p className="site00-cd__error" role="alert">{actionError}</p>
      )}
      {actionNotice && <p role="status"><strong>{actionNotice}</strong></p>}
      {!run && (
        <button
          type="button"
          className="site00-fws-btn site00-fws-btn--primary"
          disabled={busy}
          onClick={() => void act(() => site00ProjectsApi.embodiedCharacterDiscoveryInitialize(projectSlug))}
        >
          INITIALIZE CHARACTER DISCOVERY
        </button>
      )}
      {run && (
        <button
          type="button"
          className="site00-fws-btn"
          disabled={busy}
          onClick={() =>
            void act(() => site00ProjectsApi.embodiedCharacterDiscoverySynthesize(projectSlug), {
              successMessage: 'Character synthesis complete — review synthesis.',
              goToSection: 'SYNTHESIS',
            })
          }
        >
          SYNTHESIZE CHARACTER
        </button>
      )}
      <Link to={site00ProjectMotionCharacterPath(projectSlug)} className="site00-fws-journey__all">
        ← MOTION + BOOK LANGUAGE
      </Link>
      <Link to={site00ProjectFounderCharacterDiscoveryPath(projectSlug)} className="site00-fws-journey__all">
        → FOUNDER CHARACTER DISCOVERY ROOM
      </Link>
    </>
  );

  const operateContent = (
    <div className="site00-fws-desk">
      {loading && <p className="site00-fws-empty">Loading character discovery…</p>}

      {run && (
        <CharacterLabRoom
          synthesis={synthesis}
          modes={LAB_MODES}
          activeMode={labMode}
          onModeChange={(id) => selectLabMode(id as LabMode)}
          actions={labActions}
          modeContent={
              <>
                <nav className="site00-fws-character__modes" aria-label="Section within mode">
                  {modeSections.map((id) => {
                    const meta = SECTIONS.find((s) => s.id === id);
                    return meta ? (
                      <button
                        key={id}
                        type="button"
                        className={section === id ? 'site00-fws-btn site00-fws-btn--primary' : 'site00-fws-btn'}
                        onClick={() => setSection(id)}
                      >
                        {meta.label}
                      </button>
                    ) : null;
                  })}
                </nav>
                <div className="site00-experiment-g__panel">
                {section === 'STATUS' && (
                  <>
                    <p>Casting readiness: {run.castingReadiness.state}</p>
                    <p>Humanity evaluation: {run.humanityEvaluation.passes ? 'PASS' : run.humanityEvaluation.failureReason}</p>
                    <details className="site00-fws-review__inspect">
                      <summary>Technical status</summary>
                      <p>FAL requests: {run.falRequests} · Anthropic: {run.anthropicRequests}</p>
                      <p>Visual design: NOT FINALIZED · Final face: NOT SELECTED</p>
                    </details>
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
                </div>
              </>
            }
          />
        )}

      {!run && !loading && labActions}
    </div>
  );

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="CHARACTER LAB"
        subtitle="P0.5E.3 — EMBODIED CHARACTER DISCOVERY"
        operate={operateContent}
        inspect={inspectContent}
      />
    </EcosystemShell>
  );
}
