import { SCORE_DIMENSIONS, type Priority, type ScoreDimension } from './types.js';

type Rating = 'HIGH' | 'MEDIUM' | 'LOW';
const R: Record<string, Rating> = { H: 'HIGH', M: 'MEDIUM', L: 'LOW' };

/** Ten letters (H, M, L) in SCORE_DIMENSIONS order. */
const scores = (letters: string): Record<ScoreDimension, string> =>
  Object.fromEntries(SCORE_DIMENSIONS.map((d, i) => [d, R[letters[i]]])) as Record<ScoreDimension, string>;

/** Section 22 and 23: the main brief. Never more than twelve. */
export const PRIORITIES: Priority[] = [
  {
    id: 'P-01',
    title: 'Copper wax: every seal holds until Celestine breaks one',
    proposals: ['V-07'],
    why: 'One prop rule the master already states (S1-17) ties three refusals and one acceptance together and makes the finale\'s first beat an event. No runtime, no new asset beyond a sound.',
    scores: scores('HHMHHHHHHH'),
  },
  {
    id: 'P-02',
    title: 'The Ember stops capture, not memory',
    proposals: ['T-10'],
    why: 'Answers the breach storyline\'s obvious question before anyone asks it. The leak is human by design, and S1-75 can show it in the applause.',
    scores: scores('HHMMMMHMHH'),
  },
  {
    id: 'P-03',
    title: 'A ladder for gold: hand, room, city',
    proposals: ['T-11'],
    why: 'Reconciles the truth document ("Gold is new in Season 1") with S1-30\'s gold ward lights without changing either, and makes S1-77 a step up instead of a contradiction.',
    scores: scores('HHMMMHHHHH'),
  },
  {
    id: 'P-04',
    title: 'The S1-59 lantern flickers again before the failure',
    proposals: ['T-12'],
    why: 'Turns an atmospheric beat into a planted clue that pays off in S1-76 with no dialogue and no new asset.',
    scores: scores('HMMMMHHHHH'),
  },
  {
    id: 'P-05',
    title: 'Two witnesses, two flashbacks: the garage from the doorway, the dance from inside',
    proposals: ['F-06', 'F-07'],
    why: 'The season has only two visual flashbacks. This gives them one honest grammar: whose memory, where they stood, and objects in place of events nobody saw. F-07 reuses S1-58\'s assets.',
    scores: scores('HMHHHHHHHH'),
  },
  {
    id: 'P-06',
    title: 'Dee hears 1985; the Echo Track stays silent',
    proposals: ['F-04'],
    why: 'Tells the audience what Dee wants in her own register, and lets the real bleachers replace the remembered crowd in S1-40.',
    scores: scores('MMHHHMHMHM'),
  },
  {
    id: 'P-07',
    title: 'The fruit truck, heard and not seen',
    proposals: ['F-01'],
    why: 'One song joins the Recall to the Night it pays. Vivienne is never heard.',
    scores: scores('MHMHHHHLHM'),
  },
  {
    id: 'P-08',
    title: 'Plant the sounds the season later recognises',
    proposals: ['F-05', 'F-19'],
    why: 'Yaz\'s real laugh and Clarence\'s two bars are recognised later by characters. Planting them lets the audience recognise them at the same moment.',
    scores: scores('MHMHMHHLHH'),
  },
  {
    id: 'P-09',
    title: 'The far bank is the city\'s own party, and the dress finally goes out',
    proposals: ['W-01', 'R-02', 'R-03'],
    why: 'The climax gets a public to go public to. Two S1-01 inhabitants return without a word, a name or a connection. Waits on FD-S101-05, 06 and 07.',
    scores: scores('HHHMHHMHMM'),
  },
  {
    id: 'P-10',
    title: 'Who is on the promenade',
    proposals: ['R-01', 'R-05'],
    why: 'The S1-01 grandmother speaks the line the master already gives a grandmother; the girl with Kai\'s pliers asks what the lanterns are for.',
    scores: scores('MHMLMHMMMH'),
  },
  {
    id: 'P-11',
    title: 'The teenager\'s step, fixed and returned',
    proposals: ['S-02', 'R-04'],
    why: 'A choreography note in S1-01 (no shot change) gives Ferry Street a dancer who got good at it.',
    scores: scores('LHMLMHHMHH'),
  },
  {
    id: 'P-12',
    title: 'Four Relay rules, and the last Relay blanking',
    proposals: ['T-02', 'T-01'],
    why: 'Resolves Bible 06\'s naming collision and protects S1-15\'s "you don\'t follow one home". The season ends on the paper it taught.',
    scores: scores('HMMMMMHMHH'),
  },
];

/** Recommended, but outside the main brief. */
export const SECOND_TIER = ['R-06', 'V-01', 'F-03', 'T-03', 'T-13', 'T-09', 'F-08', 'R-08', 'R-09', 'R-10', 'V-02', 'V-03', 'T-05', 'T-06', 'T-07', 'R-18', 'W-03', 'W-08', 'F-02', 'R-07'];
