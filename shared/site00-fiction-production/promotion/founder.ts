/** The founder's decisions for the living-world promotion, recorded exactly as given. Nothing here is inferred from audit recommendations. */

export const PROMOTION_SPRINT = 'P0.THE-EXCHANGE.OPUS.LIVING-WORLD-FOUNDER-APPROVAL-AND-CANON-PROMOTION.V1';
export const PROMOTION_DATE = '2026-10-25';
export const PROMOTION_APPROVAL = `${PROMOTION_DATE} ${PROMOTION_SPRINT}`;
/** The verified head of PR #1693 that the promotion branch is stacked on. */
export const AUDIT_COMMIT = 'f43aa1f07d275fe8dd4abf0abf1afd94b1b61905';

export const DECISION_STATES = ['FOUNDER_APPROVED', 'FOUNDER_HELD', 'FOUNDER_REJECTED', 'PENDING_FOUNDER'] as const;
export type DecisionState = (typeof DECISION_STATES)[number];
/** Layer B: whether an approved direction can go to production once its release is active. */
export const PRODUCTION_STATES = ['NO_PRODUCTION_ASSET', 'PENDING_PRODUCTION', 'CONDITIONAL_PRODUCTION_HOLD'] as const;
export type ProductionState = (typeof PRODUCTION_STATES)[number];

/** The twelve priority groups the founder approved, in the founder's words, and the proposal IDs each one carries. */
export const APPROVED_GROUPS: Array<{ priority: string; founderLabel: string; proposals: string[] }> = [
  { priority: 'P-01', founderLabel: 'Copper wax continuity', proposals: ['V-07'] },
  { priority: 'P-02', founderLabel: 'Ember privacy limit', proposals: ['T-10'] },
  { priority: 'P-03', founderLabel: 'Gold: hand → room → city', proposals: ['T-11'] },
  { priority: 'P-04', founderLabel: 'Recurring lantern flicker', proposals: ['T-12'] },
  { priority: 'P-05', founderLabel: 'Two viewpoints of the dance', proposals: ['F-06', 'F-07'] },
  { priority: 'P-06', founderLabel: "Dee's auditory memory", proposals: ['F-04'] },
  { priority: 'P-07', founderLabel: "Mavis's fruit truck", proposals: ['F-01'] },
  { priority: 'P-08', founderLabel: 'Recognizable musical sounds', proposals: ['F-05', 'F-19'] },
  { priority: 'P-09', founderLabel: 'Public riverbank celebration', proposals: ['W-01', 'R-02', 'R-03'] },
  { priority: 'P-10', founderLabel: 'Promenade recurring faces', proposals: ['R-01', 'R-05'] },
  { priority: 'P-11', founderLabel: "Teenager's dance callback", proposals: ['S-02', 'R-04'] },
  { priority: 'P-12', founderLabel: 'Relay rules and final delivery', proposals: ['T-02', 'T-01'] },
];

/** The founder's list, in the order given. */
export const FOUNDER_APPROVED_IDS = ['V-07', 'T-10', 'T-11', 'T-12', 'F-06', 'F-07', 'F-04', 'F-01', 'F-05', 'F-19', 'W-01', 'R-02', 'R-03', 'R-01', 'R-05', 'S-02', 'R-04', 'T-02', 'T-01'];
export const EXPECTED_APPROVED = 19;
export const EXPECTED_REMAINING = 53;

/** Promotion order: phase A (technology and physical rules), B (sensory memory), C (living world), every dependency first. */
export const PROMOTION_ORDER = ['V-07', 'T-02', 'T-10', 'T-11', 'T-12', 'T-01', 'F-01', 'F-04', 'F-05', 'F-06', 'F-07', 'F-19', 'W-01', 'R-01', 'R-02', 'R-03', 'S-02', 'R-04', 'R-05'];
export const PHASE: Record<string, 'A' | 'B' | 'C'> = Object.fromEntries(PROMOTION_ORDER.map((id, i) => [id, i < 6 ? 'A' : i < 12 ? 'B' : 'C']));

export type FounderAnswer = {
  decisionId: string;
  answer: string;
  meaning: string;
  notAuthorized: string[];
  resolves: string[];
  stillOpen: string | null;
};

/** The four follow-up decisions. FD-S101-05 settles the story continuity only; the garment stays undecided. */
export const FOUNDER_ANSWERS: FounderAnswer[] = [
  {
    decisionId: 'FD-S101-06',
    answer: 'RECURRING',
    meaning: 'The S1-01 tailor, grandmother and teenager keep reusable recurring-background identities, and their approved returns are recognized.',
    notAuthorized: ['principal or speaking characters (the grandmother\'s one existing line comes from R-01, not from this decision)', 'names', 'any implication that they know each other', 'recurring identities for the woman on the balcony or the neighbour'],
    resolves: ['R-01', 'R-02', 'R-03', 'R-04', 'S-02'],
    stillOpen: null,
  },
  {
    decisionId: 'FD-S101-07',
    answer: 'ANONYMOUS',
    meaning: 'The S1-01 tailor stays anonymous. His appearance at the later public celebration is an ambient return.',
    notAuthorized: ['identifying him as Wendell Ames', 'a biography or secret relationship', 'merging him into an existing named character record'],
    resolves: ['R-03'],
    stillOpen: null,
  },
  {
    decisionId: 'R-01',
    answer: 'SPEAKING',
    meaning: 'The S1-01 grandmother is the grandmother who speaks the existing S1-59 line. One identity, one line, facial and performance continuity across both appearances.',
    notAuthorized: ['R-01-ALT (a second grandmother keeping the line)', 'replacement or additional dialogue', 'voice production'],
    resolves: ['R-01'],
    stillOpen: null,
  },
  {
    decisionId: 'FD-S101-05',
    answer: 'DRESS_DESIGN_LATER',
    meaning: "The story continuity of the grandmother's jewel-green dress is approved. The silhouette is chosen during S1-01 visual development, and the chosen garment is the one the S1-77 callback uses.",
    notAuthorized: ['choosing between the 1960s satin cocktail dress and the bias-cut evening dress', 'a second or contradictory dress design', 'marking the wardrobe asset production-ready before founder visual approval'],
    resolves: ['R-02 (story continuity)'],
    stillOpen: 'the garment design, chosen at S1-01 visual development with founder visual approval.',
  },
];

/** Alternatives the founder named and declined. They stay in the audit exactly as they were. */
export const NOT_APPROVED: Array<{ id: string; founderNote: string }> = [
  { id: 'R-12', founderNote: 'NOT APPROVED. The audit identifies a conflict between R-03 and R-12. Preserve R-12 in its original unapproved/held state. Do not promote R-12. Do not substitute R-12 for the approved R-03 treatment.' },
  { id: 'R-01-ALT', founderNote: 'Do not apply R-01-ALT. Do not duplicate the speaking role.' },
  { id: 'C-01', founderNote: 'NOT APPROVED. Do not identify the tailor as Wendell Ames. Preserve C-01 as an unapproved historical proposal.' },
  { id: 'R-14', founderNote: "NOT APPROVED. The teenager's S1-51 drumline return is approved. A separate proposed S1-69 return is not. Do not combine these appearances." },
];

/** The S1-01 inhabitants and their tiers (founder §10). */
export const S101_TIERS: Record<string, string[]> = {
  'scene:S1-01:tailor': ['RECURRING_BACKGROUND', 'ANONYMOUS'],
  'scene:S1-01:grandmother': ['RECURRING_BACKGROUND', 'SPEAKING_IN_S1-59', 'DRESS_DESIGN_PENDING'],
  'scene:S1-01:teenager': ['RECURRING_BACKGROUND', 'FOUR_COUNT_DANCE'],
  'scene:S1-01:woman on the balcony': ['SCENE_SCOPED'],
  'scene:S1-01:neighbour': ['SCENE_SCOPED'],
};
