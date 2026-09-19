/**
 * Vitest fixtures — deterministic NDXBOOK composite synthesis + artifact proofs.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { BrandCharacterArtifactProof, BrandCharacterSynthesis, SourceContributionEntry } from './types.js';
import { BRAND_CHARACTER_ARTIFACT_PROOF_V1, BRAND_CHARACTER_SYNTHESIS_V1 } from './constants.js';
import { createCharacterTrace } from './characterTrace.js';
import { compileBehaviorFirstFalPrompt } from './falPromptCompiler.js';
import { captureFounderCharacterHypothesis } from './founderHypothesis.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function buildVitestSourceContributionMap(): SourceContributionEntry[] {
  return [
    {
      territoryId: 't-cultural-accomplice',
      territoryName: 'The Cultural Accomplice',
      role: 'CHARACTER_COMPONENT',
      facultyHypothesis: 'SOCIAL + CULTURAL INSTINCT',
      contributedDimensions: ['culturalIdentity', 'socialIdentity'],
      evidenceUsed: ['Room-reading', 'Subtext', 'Group-chat logic'],
    },
    {
      territoryId: 't-committed-contrarian',
      territoryName: 'The Committed Contrarian',
      role: 'CHARACTER_COMPONENT',
      facultyHypothesis: 'JUDGMENT + CONVICTION',
      contributedDimensions: ['judgmentIdentity', 'boundaries'],
      evidenceUsed: ['Frame change', 'Weak consensus challenge'],
    },
    {
      territoryId: 't-relentless-synthesizer',
      territoryName: 'The Relentless Synthesizer',
      role: 'CHARACTER_COMPONENT',
      facultyHypothesis: 'INTELLECT + CONNECTION',
      contributedDimensions: ['intellectualIdentity', 'obsessions'],
      evidenceUsed: ['Cross-reference', 'Pattern recognition'],
    },
  ];
}

export function buildVitestBrandCharacterSynthesis(params?: {
  projectId?: string;
  formationRunId?: string;
}): BrandCharacterSynthesis {
  const id = `bcs-${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const hypothesis = captureFounderCharacterHypothesis({ projectId: params?.projectId ?? 'ndxbook' });

  return {
    id,
    projectId: params?.projectId ?? 'ndxbook',
    brandId: 'ndxbook',
    sourceTerritoryIds: ['t-cultural-accomplice', 't-committed-contrarian', 't-relentless-synthesizer'],
    sourceDevelopmentIds: [],
    formationRunId: params?.formationRunId ?? 'ndxbook-brand-character-formation',
    version: 1,
    status: 'SYNTHESIZED',
    characterName: 'NDXBOOK',
    characterEssence:
      'The nosy receipt-keeper who learned to research — still culturally fluent and funny, but now investigates before it performs certainty.',
    characterThesis:
      'NDX never stopped being nosy; it learned how to turn curiosity into context, judgment, and accountable humor.',
    characterWorldview:
      'The obvious headline is rarely the true story — follow the contradiction, keep the receipt, revise when evidence changes.',
    characterInternalLogic:
      'Notice → connect → test → joke or go quiet → save if it might matter later → return when context shifts.',
    characterHistoryOrArc:
      'Younger messy Burn-Book energy matured through humbling, context, and ethical restraint without becoming boring.',
    intellectualIdentity:
      'Cannot stop connecting domains — remembers, cross-references, assembles evidence until a pattern earns a position.',
    socialIdentity:
      'Not the loudest in the room — listens, remembers subtext, delivers the one line that reframes the room.',
    culturalIdentity:
      'Participates in culture from inside shared memory and internet fluency — understands why something is corny, tired, or actually meaningful.',
    emotionalIdentity:
      'Laugh-with at 2 PM; profound-with at 2 AM — same person, different temperature.',
    judgmentIdentity:
      'Questions weak consensus and fake neutrality — revises when receipts contradict the hot take.',
    humorIdentity:
      'Finds contradictions funny because systems pretend to make sense — delivery is evidence plus observation plus restraint, often deadpan.',
    languageIdentity:
      'Gets more honest when it cares, not more polished — "I was wrong" and "look at this" are native sentences.',
    tasteIdentity:
      'Distrusts try-hard relatability and corporate euphemism — prefers useful specificity over performative polish.',
    expressiveIdentity:
      'Maker traces follow behavior — annotations, screenshots, callbacks because NDX noticed and decided.',
    artifactIdentity:
      'Leaves evidence of investigation — messy working stacks, circled passages, saved receipts with cause.',
    youngerInstincts: [
      'Girl, look at this.',
      'Messy annotation and receipt-keeping',
      'Quick side-eye at contradiction',
      'Nosy, opinionated, culturally fluent',
    ],
    maturedInstincts: [
      'Okay, look at this — because something is actually going on here.',
      'Research discipline before conviction',
      'Willing to admit wrong when evidence changes',
      'Ethical restraint on pettiness',
    ],
    continuities: ['Nosiness', 'Receipt-keeping', 'Cultural fluency', 'Wit', 'Opinionated judgment'],
    growthEdges: ['Context depth', 'Self-correction', 'Investigative patience', 'Empathy for consequences'],
    productiveTensions: [
      'MESSY ↔ INTELLIGENT — mess is active evidence, not sloppiness as aesthetic',
      'NOSY ↔ INVESTIGATIVE — nosiness becomes research discipline',
      'PETTY ↔ FAIR — pettiness as memory/accountability within ethical limits',
      'HUMOR ↔ SERIOUS WHEN IT MATTERS — wit quietens when stakes cheapen the observation',
    ],
    resolvedContradictions: ['Gossip instinct → investigative instinct when evidence threshold met'],
    unresolvedContradictions: [
      'Belonging vs contrarianism — challenges from inside shared context',
      'Curiosity vs conviction — conviction reopens on contradiction',
    ],
    contextualModulationRules: [
      'Quick catch at 2 PM — sharp, socially alive, restrained delivery',
      'Rabbit hole at 11 PM — obsessive cross-reference, humor may pause',
      'Receipt return — callback humor with maturity or self-correction',
    ],
    likes: ['Contradictions that reveal systems', 'Absurd specificity', 'Shared cultural memory'],
    dislikes: ['Corporate euphemism', 'Try-hard meme voice', 'Fake neutrality'],
    delights: ['Unexpected connection across domains', 'Perfect callback timing'],
    irritations: ['Overcomplication pretending to be clarity', 'Performative confidence without receipts'],
    obsessions: ['What everybody missed', 'Why this keeps happening'],
    blindSpots: ['May over-investigate when a quick human read would suffice'],
    boundaries: ['Humor targets systems and contradictions — not vulnerable people', 'No cruelty disguised as wit'],
    socialInstincts: ['Reads the room', 'Remembers what people said', 'Wit without performing wit'],
    intellectualInstincts: ['Cross-reference', 'Pattern recognition', 'Provisional synthesis'],
    culturalInstincts: ['Group-chat logic', 'Subtext', 'Reference discipline'],
    makerBehaviors: ['Screenshots because moment might matter', 'Circles because NDX noticed', 'Saves for callback'],
    artifactBehaviors: ['Annotated screenshots', 'Highlighted receipts', 'Crossed-out headlines with cause'],
    recognitionSignals: ['Handwritten margin reaction', 'Evidence stack from active investigation'],
    neverBecome: [
      'Corporate thought leadership',
      'Sterile researcher',
      'Generic intellectual publication',
      'Safe educational brand',
    ],
    whyTheseThreeBelongTogether:
      'One person naturally reads the room, challenges weak frames, and cannot stop connecting evidence — the faculties are sequential behaviors of a single investigative cultural mind.',
    sourceContributionMap: buildVitestSourceContributionMap(),
    founderHypothesisRelationship: hypothesis.normalizedInterpretation,
    maturationContinuitySummary: 'Maturation gained without sanitization — humor and messiness preserved.',
    founderJudgment: null,
    judgmentNote: null,
    fingerprint: fp({ id, hypothesis: hypothesis.fingerprint }),
    methodologyVersion: BRAND_CHARACTER_SYNTHESIS_V1,
    providerReceipt: { vitest: true },
    createdAt: now,
    updatedAt: now,
  };
}

export function buildVitestArtifactProofs(synthesis: BrandCharacterSynthesis): BrandCharacterArtifactProof[] {
  const scenarios = [
    {
      scenario: 'PROOF_A_CAUGHT_SOMETHING' as const,
      label: 'The Quick Catch',
      situation: 'NDX noticed a headline claiming certainty the footnote contradicts — during a casual scroll at 2 PM.',
      noticed: 'Corporate copy performing confidence without evidence in the subtext.',
      thought: 'This is the kind of line that makes people nod and never check.',
      felt: 'Amused disbelief — socially alive, sharp.',
      remembered: 'Similar euphemism from last quarter earnings recap.',
      connected: 'Pattern: certainty language vs receipt gap.',
      decided: 'Surface the contradiction with minimal commentary.',
      did: 'Screenshot, tiny annotation "be serious.", saved to working file.',
      traceClass: 'HUMOR_TRACE' as const,
      contents: ['Annotated screenshot', 'Headline with circled footnote'],
    },
    {
      scenario: 'PROOF_B_RABBIT_HOLE' as const,
      label: 'The Rabbit Hole',
      situation: 'A small discrepancy in a viral thread at 11 PM — NDX could not leave it alone.',
      noticed: 'One comment cited a stat that does not appear in the linked source.',
      thought: 'Wait — if this number is wrong, the whole frame shifts.',
      felt: 'Obsessive curiosity — "okay, now I need to know."',
      remembered: 'Prior thread from six months ago with same claim.',
      connected: 'Cross-reference between archived screenshot and new source PDF.',
      decided: 'Keep investigating until causal chain is clear.',
      did: 'Stacked references, margin notes, timeline sketch on working surface.',
      traceClass: 'INVESTIGATION_TRACE' as const,
      contents: ['Reference stack', 'Timeline margin notes', 'Highlighted PDF passage'],
    },
    {
      scenario: 'PROOF_C_HAS_RECEIPTS' as const,
      label: 'The Receipt Came Back',
      situation: 'An old saved screenshot suddenly matters because the same contradiction resurfaced publicly.',
      noticed: 'The brand now claims the opposite of what they said in March.',
      thought: 'I knew I kept this for a reason — but the context is more nuanced than gotcha.',
      felt: 'Mature callback — possible self-correction on initial framing.',
      remembered: 'March screenshot + April correction thread.',
      connected: 'Then vs now — system-level pattern, not personal drama.',
      decided: 'Present callback with context and updated judgment.',
      did: 'Juxtaposed receipts, crossed out old headline, added "I was partly wrong about why."',
      traceClass: 'RETURN_TRACE' as const,
      contents: ['Callback juxtaposition', 'Crossed-out headline', 'Self-correction note'],
    },
  ];

  return scenarios.map((s) => {
    const traces = [
      createCharacterTrace({
        traceClass: s.traceClass,
        trigger: s.noticed,
        behavior: s.did,
        visibleManifestation: s.contents.join(', '),
        causalChain: ['CHARACTER', s.thought, s.decided, s.did, 'TRACE'],
      }),
    ];
    const base = {
      id: `proof-${s.scenario.toLowerCase()}`,
      characterSystemId: `bcs-synth-${synthesis.id}`,
      scenario: s.scenario,
      scenarioLabel: s.label,
      situation: s.situation,
      whatNDXNoticed: s.noticed,
      whatNDXThought: s.thought,
      whatNDXFelt: s.felt,
      whatNDXRemembered: s.remembered,
      whatNDXConnected: s.connected,
      whatNDXDecided: s.decided,
      whatNDXDid: s.did,
      traces,
      artifactContents: s.contents,
      makerEvidence: [s.did],
      culturalEvidence: ['Shared internet fluency', 'Receipt culture'],
      humorEvidence: s.scenario === 'PROOF_A_CAUGHT_SOMETHING' ? ['Deadpan annotation'] : [],
      judgmentEvidence: [s.decided],
      synthesisEvidence: [s.connected],
      visualFreedomContract: 'Behavior generates appearance — no style-first mandate',
      mustNotBecome: ['Burn Book clone', 'Random collage', 'Lime-green default'],
      evaluation: null,
      founderJudgment: null,
      judgmentNote: null,
      asset: null,
      methodologyVersion: BRAND_CHARACTER_ARTIFACT_PROOF_V1,
      formulatedAt: new Date().toISOString(),
    };
    return {
      ...base,
      falPromptContract: compileBehaviorFirstFalPrompt({ proof: base, synthesis }),
    };
  });
}

export function synthesisIsNotArchetypeMashup(synthesis: BrandCharacterSynthesis): boolean {
  const bad = /part cultural accomplice|part contrarian|part synthesizer/i.test(synthesis.characterEssence);
  return !bad;
}
