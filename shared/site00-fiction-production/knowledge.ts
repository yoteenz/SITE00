import type { CanonClassification } from './types.js';

/**
 * Who knows what, and from which release. `audienceFrom` is the first release in which the audience is told;
 * `guardKeywords` must not appear in audience-facing text (master narrative or screenplay) before it.
 */
export type KnowledgeFact = {
  factId: string;
  statement: string;
  classification: CanonClassification;
  writersRoom: 'KNOWN' | 'OPEN';
  audienceFrom: string | null;
  knownBy: Array<{ character: string; from: string; how: string }>;
  guardKeywords: string[];
  source: string;
};

export const KNOWLEDGE_FACTS: KnowledgeFact[] = [
  {
    factId: 'KF-01',
    statement: "Sloane has spent a year designing a new tradition, the Living Legacy.",
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
    writersRoom: 'KNOWN',
    audienceFrom: 'S1-08',
    knownBy: [{ character: 'Sloane', from: 'S1-01', how: 'Her own plan; S1-05 alludes to it without naming it.' }],
    guardKeywords: ['Living Legacy'],
    source: 'Master S1-05 continuity ("revealed in S1-08"); S1-08 narrative.',
  },
  {
    factId: 'KF-02',
    statement: "Vivienne's final ledger entry is a sponsored commission, sealed and then withdrawn by her, nineteen days before she died.",
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
    writersRoom: 'KNOWN',
    audienceFrom: 'S1-08',
    knownBy: [{ character: 'Sloane', from: 'S1-08', how: 'A page she knows by heart.' }],
    guardKeywords: ['SEALED BY FACILITATOR', 'WITHDRAWN BY FACILITATOR'],
    source: 'Master S1-08.',
  },
  {
    factId: 'KF-03',
    statement: 'Sloane decides this Grand Exchange is her last as the one who decides. She keeps hosting and taking impossible requests (Hybrid H).',
    classification: 'APPROVED_CANON',
    writersRoom: 'KNOWN',
    audienceFrom: 'S1-10',
    knownBy: [
      { character: 'Gideon', from: 'S1-10', how: 'Told first, asked to keep it.' },
      { character: 'Richard', from: 'S1-14', how: 'Told at Sunday breakfast, asked to keep it.' },
      { character: 'Bunny', from: 'S1-20', how: "Richard's happy whisper at Nineteen Eighty-Six." },
      { character: 'Royce', from: 'S1-43', how: 'Inference plus an unnamed source.' },
      { character: 'Nadine', from: 'S1-31', how: 'From a surgeon, last.' },
    ],
    guardKeywords: ['is my last', 'my baby\'s coming home'],
    source: 'Founder approval S-1 Hybrid H (2026-10-23); master S1-10, S1-14, S1-31.',
  },
  {
    factId: 'KF-04',
    statement: "The leak chain: Royce's inference rests on Marcus, who overheard Bunny, who heard it from Richard.",
    classification: 'APPROVED_CANON',
    writersRoom: 'KNOWN',
    audienceFrom: 'S1-54',
    knownBy: [
      { character: 'Bunny', from: 'S1-54', how: "Marcus's confession the night before." },
      { character: 'Richard', from: 'S1-54', how: "Bunny's visit." },
      { character: 'Sloane', from: 'S1-55', how: "Richard's confession." },
    ],
    guardKeywords: ['Rich told me', 'repeated it to his boss'],
    source: 'Founder approval NR-5 (chain unchanged; disclosure at a Night Sloane hosted, S1-20); master S1-54, S1-55.',
  },
  {
    factId: 'KF-05',
    statement: "Kai's anonymous commission ten years ago, at 24, was written by Vivienne for Celestine, then withdrawn.",
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
    writersRoom: 'KNOWN',
    audienceFrom: 'S1-56',
    knownBy: [
      { character: 'Kai', from: 'S1-56', how: 'Recognizes the phrasing once he meets Sloane; tells her here.' },
      { character: 'Sloane', from: 'S1-56', how: 'Reads her mother\'s phrasing on the framed page.' },
    ],
    guardKeywords: ['anonymous commission'],
    source: 'Master S1-13 (framed page, unexplained) and S1-56.',
  },
  {
    factId: 'KF-06',
    statement: 'Vivienne and Celestine designed the Ember together (copper no, gold yes); Vivienne gave it away and only the no was adopted.',
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
    writersRoom: 'KNOWN',
    audienceFrom: 'S1-58',
    knownBy: [{ character: 'Richard', from: 'S1-01', how: 'Witnessed it; tells it in S1-58.' }],
    guardKeywords: ['designed the Ember', 'gold yes', 'gold *yes*'],
    source: 'Master S1-01 payoff and S1-58. Founder confirmation FC-01 requested for FD-05.',
  },
  {
    factId: 'KF-07',
    statement: "Sloane personally excluded Kai.",
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
    writersRoom: 'KNOWN',
    audienceFrom: 'S1-13',
    knownBy: [{ character: 'Sloane', from: 'S1-01', how: 'Her decision.' }],
    guardKeywords: ['I threw him out'],
    source: 'Master S1-13 freeze-frame.',
  },
  {
    factId: 'KF-08',
    statement: 'Celestine has a vision she never built, and will never ask for it.',
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
    writersRoom: 'KNOWN',
    audienceFrom: 'S1-05',
    knownBy: [
      { character: 'Kai', from: 'S1-03', how: 'Writes the note.' },
      { character: 'Sloane', from: 'S1-05', how: 'Reads the note.' },
    ],
    guardKeywords: ['vision she never built'],
    source: 'Master S1-05.',
  },
  {
    factId: 'KF-09',
    statement: "Vivienne's private truth behind the sealed envelope (U-1).",
    classification: 'OPEN_CREATIVE_QUESTION',
    writersRoom: 'OPEN',
    audienceFrom: null,
    knownBy: [],
    guardKeywords: [],
    source: 'Open question U-1. Season 1 shows only the two envelope lines in S1-86.',
  },
  {
    factId: 'KF-10',
    statement: "Emmett Hale's identity (U-3). FD-09 approved his function only.",
    classification: 'OPEN_CREATIVE_QUESTION',
    writersRoom: 'OPEN',
    audienceFrom: null,
    knownBy: [],
    guardKeywords: [],
    source: 'Open question U-3.',
  },
];
