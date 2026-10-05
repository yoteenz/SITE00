/**
 * C1.3 — Chapter narrative continuity builder for Chapter 01.
 */

import { CHAPTER_01_ID } from '../chapter01Canon.js';
import type {
  ChapterNarrativeContinuity,
  ChapterRhythmPlan,
  ChapterStateSnapshot,
  Entry003NarrativeResponsibility,
} from '../../../../shared/site00-expression-engine/chapter-continuity/types.js';
import {
  buildNdxbookChapter01Escalation,
  buildNdxbookChapter01MotifSystem,
  buildNdxbookEntry001SequenceRole,
  buildNdxbookEntry002SequenceRole,
} from '../campaignNarrative/ndxbookCampaignNarrativeAdapter.js';
import { CHAPTER_CONTINUITY_VERSION } from '../../../../shared/site00-expression-engine/chapter-continuity/types.js';

export function buildChapterStateAfterEntry001(): ChapterStateSnapshot {
  return {
    afterEntryId: 'entry-001',
    provenClaims: [
      'Collective "we" language can blur accountability when power was never equally distributed',
      'Media spectatorship record exists — complicity is documentable',
    ],
    openQuestions: ['Who exactly is WE?', 'Can culture admit contradiction without rewriting the record?'],
    emotionalRegister: 'Confrontational broadcast unease',
    motifsActive: ['broadcast', 'screen', 'receipt', 'archive'],
    artifactsInPlay: ['vintage television'],
    escalationLevel: 1,
  };
}

export function buildChapterStateAfterEntry002(): ChapterStateSnapshot {
  return {
    afterEntryId: 'entry-002',
    provenClaims: [
      'Collective language blurs accountability (Entry 001)',
      'Cultural labels can flip without the visual object changing (Entry 002)',
      'Memory gets re-edited faster than objects get replaced',
    ],
    openQuestions: [
      'What labor hides behind performed simplicity?',
      'If culture can re-edit memory, what maintenance do we hide in ourselves?',
      'How long before embarrassment becomes nostalgia?',
    ],
    emotionalRegister: 'Investigative recognition → snap-back disorientation',
    motifsActive: ['phone', 'timeline', 'edit', 'glitch', 'receipt', 'screen'],
    artifactsInPlay: ['phone (exit device)', 'razor timeline'],
    escalationLevel: 2,
  };
}

export function buildEntry003NarrativeResponsibility(): Entry003NarrativeResponsibility {
  const chapterStateBefore = buildChapterStateAfterEntry002();
  return {
    entryId: 'entry-003',
    chapterStateBefore,
    whatEntryMustAdd:
      'Move stakes from cultural revision (Entry 002) to personal complicity: visible simplicity hides intensified labor — the viewer’s own maintenance rituals become implicated.',
    whatEntryMustAvoid: [
      'Another isolated contradiction example without chapter escalation',
      'Shelfie Museum product-count literalism',
      'Step-count supremacy without research verification',
      'Phone-as-primary-world (device may bridge only)',
      'Third consecutive glitch-as-primary-turn',
      'Receipt interjection syntax identical to Entry 002',
    ],
    whyNotAnotherExample:
      'Chapter already proved label revision and collective complicity — Entry 003 must make invisible labor unfashionable while labor intensifies.',
    escalationMove: 'THEY → CULTURE → YOU (maintenance complicity)',
  };
}

export function buildChapterRhythmPlan(): ChapterRhythmPlan {
  return {
    chapterId: CHAPTER_01_ID,
    tempoByUnit: {
      'entry-001': 'Confrontational / broadcast-fast',
      'entry-002': 'Investigative / cinematic-mid',
      'entry-003': 'Performative / absurd-satirical',
    },
    densityByUnit: {
      'entry-001': 'High argument density',
      'entry-002': 'Evidence-layered',
      'entry-003': 'Spatial reveal — breathe then punch',
    },
    humorByUnit: {
      'entry-001': 'Dark interjection',
      'entry-002': 'Dry rebrand wit',
      'entry-003': 'Physical visual irony',
    },
    darknessByUnit: {
      'entry-001': 'Systemic complicity',
      'entry-002': 'Cultural dishonesty',
      'entry-003': 'Personal vanity infrastructure',
    },
    visualScaleByUnit: {
      'entry-001': 'Broadcast scale',
      'entry-002': 'Edit-suite intimacy',
      'entry-003': 'Front-stage / back-of-house split',
    },
    intimacyByUnit: {
      'entry-001': 'Collective audience',
      'entry-002': 'Investigator POV',
      'entry-003': 'Viewer implicated in mirror',
    },
    protagonistVisibilityByUnit: {
      'entry-001': 'NDX high',
      'entry-002': 'NDX observational',
      'entry-003': 'NDX guide through door',
    },
    artifactScaleByUnit: {
      'entry-001': 'Object hero — TV',
      'entry-002': 'Tool hero — timeline/phone',
      'entry-003': 'Infrastructure hero — shift receipt',
    },
    endingTypeByUnit: {
      'entry-001': 'Unresolved broadcast shutoff',
      'entry-002': 'Glitch snap-back',
      'entry-003': 'Calendar block / next appointment tease',
    },
    rhythmDiagnosis: 'Chapter breathes — confrontational → investigative → performative/absurd. Entries must not share identical tonal register.',
    interjectionPatternHistory: [
      'Entry 001: accusatory question — WHO TF IS WE?',
      'Entry 002: deadpan rebrand — THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.',
    ],
    interjectionVarietyRequired: true,
  };
}

export function buildChapter01NarrativeContinuity(): ChapterNarrativeContinuity {
  const e1Role = buildNdxbookEntry001SequenceRole();
  const e2Role = buildNdxbookEntry002SequenceRole();
  const escalation = buildNdxbookChapter01Escalation();
  const motifs = buildNdxbookChapter01MotifSystem();

  return {
    chapterId: CHAPTER_01_ID,
    chapterTitle: 'CHAPTER 01 — CULTURAL CONTRADICTION GRAMMAR',
    chapterCoreQuestion: 'Why does culture perform one story while the receipts show another?',
    chapterArgumentGrammar: ['CLAIM', 'RECEIPT', 'CONTRADICTION', 'LENS', 'INTERJECTION', 'SYNTHESIS'],
    chapterEmotionalArc: 'Confrontation → recognition → complicity → uneasy laughter',
    chapterEscalationModel: escalation,
    chapterRecurringQuestions: [
      'Can culture admit contradiction?',
      'Who benefits when labor becomes invisible?',
      'What gets re-edited — object or memory?',
    ],
    chapterRecurringMotifs: motifs,
    chapterArtifactLineage: ['vintage television', 'phone (bridge)', 'razor timeline', 'shift schedule (candidate)'],
    chapterDeviceLineage: ['broadcast → phone → notification bridge'],
    chapterTransitionLineage: ['TV shutoff', 'phone glitch snap-back', 'notification → employee door'],
    chapterInterjectionPattern: ['question', 'deadpan rebrand'],
    chapterOpenThreads: [
      'Invisible labor behind effortless aesthetics',
      'Entry 004 contradiction seed — wellness language vs behavior',
    ],
    chapterResolvedThreads: ['Collective pronoun accountability', 'Label revision without object change'],
    entrySequence: [e1Role, e2Role],
    nextEntryTeasePolicy: 'Entry 003 ending must plant non-canon Entry 004 seed — object, question, or interruption',
    rhythmPlan: buildChapterRhythmPlan(),
    continuityStatus: 'ESCALATING',
    founderJudgment: null,
    version: CHAPTER_CONTINUITY_VERSION,
  };
}
