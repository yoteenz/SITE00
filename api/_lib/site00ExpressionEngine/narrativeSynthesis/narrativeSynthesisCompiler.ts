/**
 * C1.0 — Compile narrative spine beats from structured input.
 */

import type {
  EmotionalArcState,
  NarrativeBeat,
  NarrativeQuestion,
  NarrativeSpine,
  NarrativeSpineBeatType,
  NarrativeSynthesisInput,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';
import { flagNonCausalBeats } from './narrativeCausalityGraph.js';

type BeatSeed = {
  beatId: string;
  beatType: NarrativeSpineBeatType;
  storyFunction: string;
  whatHappens: string;
  whyItHappensNow: string;
  causedBy: string[];
  reveals: string[];
  emotionalBefore: EmotionalArcState;
  emotionalAfter: EmotionalArcState;
  visualMechanism?: string;
  artifact?: string;
  world?: string;
  ndx?: string;
  subject?: string;
  transitionOut: string;
  payoffLink?: string;
  causal: { causes: boolean; reveals: boolean; earns: boolean };
};

function beatFromSeed(order: number, seed: BeatSeed): NarrativeBeat {
  return {
    beatId: seed.beatId,
    sequenceOrder: order,
    beatType: seed.beatType,
    storyFunction: seed.storyFunction,
    whatHappens: seed.whatHappens,
    whyItHappensNow: seed.whyItHappensNow,
    causedBy: seed.causedBy,
    reveals: seed.reveals,
    audienceKnowsBefore: order === 1 ? [] : [`Prior beat ${order - 1} context`],
    audienceKnowsAfter: seed.reveals,
    emotionalStateBefore: seed.emotionalBefore,
    emotionalStateAfter: seed.emotionalAfter,
    visualMechanism: seed.visualMechanism ?? null,
    artifactInvolvement: seed.artifact ?? null,
    worldInvolvement: seed.world ?? null,
    ndxInvolvement: seed.ndx ?? null,
    subjectInvolvement: seed.subject ?? null,
    transitionOut: seed.transitionOut,
    requiredPayoffLink: seed.payoffLink ?? null,
    removableWithoutDamage: false,
    causalFlags: {
      causesNextBeat: seed.causal.causes,
      revealsForNextBeat: seed.causal.reveals,
      emotionallyEarnsNextBeat: seed.causal.earns,
    },
    qaNotes: [],
  };
}

export function compileEntry002NarrativeBeatSeeds(input: NarrativeSynthesisInput): BeatSeed[] {
  const interjection =
    input.interjectionCandidates[0] ?? 'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.';
  const world = input.worldCandidates[0]?.label ?? 'THE NOSTALGIA EDIT SUITE';
  const phone = input.interjectionCandidates.includes('PHONE') ? 'PHONE' : 'DEVICE';

  return [
    {
      beatId: 'ns-setup',
      beatType: 'SETUP',
      storyFunction: 'Present-day discovery',
      whatHappens: 'NDX encounters a 2026 post praising 2016 IG baddie fashion as iconic.',
      whyItHappensNow: 'The praise feels culturally wrong given recent memory — triggers investigation instinct.',
      causedBy: ['NDX browsing present-day feed', 'Subject post gaining nostalgic praise'],
      reveals: ['2016 is being celebrated in 2026'],
      emotionalBefore: 'CURIOSITY',
      emotionalAfter: 'RECOGNITION',
      visualMechanism: 'Over-shoulder phone discovery',
      artifact: phone,
      ndx: 'Observer notices off feeling',
      subject: 'Subject woman in praised post',
      transitionOut: 'Profile tap',
      causal: { causes: true, reveals: true, earns: true },
    },
    {
      beatId: 'ns-question',
      beatType: 'QUESTION',
      storyFunction: 'Live question introduced',
      whatHappens: 'Central question forms: how did the same style go from cringe to iconic without changing?',
      whyItHappensNow: 'Praise contradicts lived cultural memory of the era.',
      causedBy: ['ns-setup'],
      reveals: ['Something feels off about the nostalgia'],
      emotionalBefore: 'RECOGNITION',
      emotionalAfter: 'UNEASE',
      ndx: 'HOLD ON — investigator mode',
      transitionOut: 'Scroll begins',
      causal: { causes: true, reveals: false, earns: true },
    },
    {
      beatId: 'ns-discovery',
      beatType: 'DISCOVERY',
      storyFunction: 'Archival investigation',
      whatHappens: 'NDX scrolls profile backward through years to 2016.',
      whyItHappensNow: 'Only archival evidence can test whether praise matches contemporaneous reaction.',
      causedBy: ['ns-question'],
      reveals: ['Profile archive accessible', 'Years compress in scroll'],
      emotionalBefore: 'UNEASE',
      emotionalAfter: 'ANTICIPATION',
      visualMechanism: 'Cultural glitch scroll / timeline',
      artifact: phone,
      world,
      ndx: 'Investigator scrubs time',
      transitionOut: '2016 post opens',
      causal: { causes: true, reveals: true, earns: true },
    },
    {
      beatId: 'ns-escalation',
      beatType: 'ESCALATION',
      storyFunction: 'Evidence intensifies',
      whatHappens: '2016-era post surfaces with same woman, same fashion codes, negative comments.',
      whyItHappensNow: 'Discovery beat must escalate from suspicion to proof-grade evidence.',
      causedBy: ['ns-discovery'],
      reveals: ['Same visual codes existed in 2016', 'Real-time labels were negative'],
      emotionalBefore: 'ANTICIPATION',
      emotionalAfter: 'SURPRISE',
      subject: 'Same woman — stable fashion identity',
      transitionOut: 'Memory lifts off phone',
      causal: { causes: true, reveals: true, earns: true },
    },
    {
      beatId: 'ns-turn',
      beatType: 'TURN',
      storyFunction: 'Principal turning point',
      whatHappens: 'Same woman in 2016 receives opposite reaction to present-day praise.',
      whyItHappensNow: 'Archival receipt proves the outfit did not change — only the cultural label did.',
      causedBy: ['ns-escalation'],
      reveals: ['Visual codes unchanged', 'Cultural label inverted'],
      emotionalBefore: 'SURPRISE',
      emotionalAfter: 'DISBELIEF',
      visualMechanism: 'Then/now alignment or receipt pull',
      world,
      subject: 'Proof subject — not protagonist',
      transitionOut: 'Contradiction surfaces',
      payoffLink: 'ns-interjection',
      causal: { causes: true, reveals: true, earns: true },
    },
    {
      beatId: 'ns-contradiction',
      beatType: 'CONTRADICTION',
      storyFunction: 'Contradiction undeniable',
      whatHappens: input.lockedPremise ?? 'The visual codes did not change. The cultural label did.',
      whyItHappensNow: 'Turn materializes the thesis as visible proof.',
      causedBy: ['ns-turn'],
      reveals: [input.thesis],
      emotionalBefore: 'DISBELIEF',
      emotionalAfter: 'REALIZATION',
      transitionOut: 'NDX stitches truth',
      causal: { causes: true, reveals: true, earns: true },
    },
    {
      beatId: 'ns-interjection',
      beatType: 'INTERJECTION',
      storyFunction: 'Earned interjection',
      whatHappens: interjection,
      whyItHappensNow: 'Contradiction is now proven — interjection compresses the argument into quotable truth.',
      causedBy: ['ns-contradiction', 'ns-turn'],
      reveals: ['Culture rebranded memory, not object'],
      emotionalBefore: 'REALIZATION',
      emotionalAfter: 'SATISFACTION',
      ndx: 'Interjector names truth',
      artifact: phone,
      transitionOut: 'Snap-back',
      causal: { causes: true, reveals: false, earns: true },
    },
    {
      beatId: 'ns-payoff',
      beatType: 'PAYOFF',
      storyFunction: 'Payoff lands',
      whatHappens: 'Audience understands cringe-to-nostalgia as memory edit, not object change.',
      whyItHappensNow: 'Setup question from opening is answered with archival proof + interjection.',
      causedBy: ['ns-setup', 'ns-interjection'],
      reveals: ['Thesis validated'],
      emotionalBefore: 'SATISFACTION',
      emotionalAfter: 'SATISFACTION',
      transitionOut: 'Glitch / snap-back',
      causal: { causes: true, reveals: false, earns: false },
    },
    {
      beatId: 'ns-aftershock',
      beatType: 'AFTERSHOCK',
      storyFunction: 'Continuation tension',
      whatHappens: 'Phone cracks / glitches — reality snaps back; culture revised the memory, not the object.',
      whyItHappensNow: 'NDXBOOK endings reopen larger chapter question rather than fully resolving.',
      causedBy: ['ns-payoff'],
      reveals: ['Continuation toward next Entry implied'],
      emotionalBefore: 'SATISFACTION',
      emotionalAfter: 'AFTERSHOCK',
      visualMechanism: 'Phone glitch snap-back',
      artifact: phone,
      transitionOut: 'Handoff hook',
      causal: { causes: false, reveals: true, earns: false },
    },
  ];
}

export function compileNarrativeSpineFromInput(input: NarrativeSynthesisInput): NarrativeSpine {
  const seeds =
    input.entryId === 'entry-002'
      ? compileEntry002NarrativeBeatSeeds(input)
      : compileGenericNarrativeBeatSeeds(input);

  const beats = flagNonCausalBeats(seeds.map((s, i) => beatFromSeed(i + 1, s)));

  return {
    beatTypes: beats.map((b) => b.beatType),
    beats,
    compressionNotes:
      input.entryId === 'entry-002'
        ? ['Entry 002 uses full 9-beat spine — no compression required.']
        : ['Generic spine compiled from input thesis and territories.'],
  };
}

function compileGenericNarrativeBeatSeeds(input: NarrativeSynthesisInput): BeatSeed[] {
  return [
    {
      beatId: 'ns-setup',
      beatType: 'SETUP',
      storyFunction: 'Opening claim',
      whatHappens: input.thesis,
      whyItHappensNow: 'Entry thesis requires an opening claim that creates curiosity.',
      causedBy: ['Chapter grammar', 'Brand truth'],
      reveals: [input.thesis],
      emotionalBefore: 'CURIOSITY',
      emotionalAfter: 'RECOGNITION',
      transitionOut: 'Question forms',
      causal: { causes: true, reveals: true, earns: true },
    },
  ];
}

export function buildLiveQuestions(beats: NarrativeBeat[], centralQuestion: string): NarrativeQuestion[] {
  const introBeat = beats.find((b) => b.beatType === 'QUESTION')?.beatId ?? beats[0]?.beatId ?? 'ns-question';
  const answerBeat = beats.find((b) => b.beatType === 'TURN')?.beatId ?? null;

  return [
    {
      questionId: 'nq-central',
      introducedAtBeat: introBeat,
      question: centralQuestion,
      audienceExpectation: 'Nostalgia may be innocent',
      answeredAtBeat: answerBeat,
      answer: answerBeat ? 'Same object, opposite cultural label' : null,
      answerType: answerBeat ? 'CONTRADICTION' : null,
      resolved: Boolean(answerBeat),
      transformedIntoNewQuestion: 'How long before embarrassment becomes nostalgia?',
    },
  ];
}

export function buildHumanStorytellingAnswers(
  input: NarrativeSynthesisInput,
  beats: NarrativeBeat[],
  roles: { ndxRole: string; worldFunction: string },
): Record<string, string> {
  const turn = beats.find((b) => b.beatType === 'TURN');
  const interjection = beats.find((b) => b.beatType === 'INTERJECTION');
  return {
    '1_why_begin_here': 'Present-day praise creates immediate curiosity because it conflicts with cultural memory.',
    '2_audience_lean_in': 'Something feels off about celebrating 2016 as iconic now.',
    '3_initially_missing': 'Proof that the same style was once mocked.',
    '4_trigger_investigation': 'NDX instinct + profile scroll access.',
    '5_after_first_reveal': 'Audience knows archival evidence exists in the profile.',
    '6_why_next_beat': beats[1]?.whyItHappensNow ?? 'Causal chain enforced per beat.',
    '7_tension_escalation': 'Escalation beat surfaces 2016 negative labels.',
    '8_withheld': 'Same-woman opposite-reaction proof withheld until turn.',
    '9_turning_point': turn?.whatHappens ?? 'Turn not identified.',
    '10_contradiction': input.lockedPremise ?? input.thesis,
    '11_emotional_response': 'Disbelief → realization that memory was edited.',
    '12_truth_line': interjection?.whatHappens ?? 'Interjection pending.',
    '13_climax_payoff_setup': 'Setup question answered by archival proof.',
    '14_ending_leaves': 'Aftershock reopens chapter-scale question.',
    '15_shuffle_survival': 'Beats fail shuffle test if turn/interjection reordered.',
    '16_visual_narrative_work': 'Phone scroll, receipt pull, and edit-suite metaphor all perform argument work.',
    '17_world_reinforces': `${roles.worldFunction} — world edits cultural memory.`,
    '18_artifact_reinforces': 'Phone as archive portal — not decorative prop.',
    '19_mechanism_necessary': 'Archival scroll is necessary to prove relabeling.',
    '20_ending_sharpens': 'Snap-back implies culture keeps re-editing memory.',
  };
}
