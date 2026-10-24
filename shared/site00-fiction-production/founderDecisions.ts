import type { ApprovedAmendment } from './types.js';

export const FOUNDER_APPROVAL = {
  date: '2026-10-23',
  sprint: 'P0.THE-EXCHANGE.OPUS.FOUNDER-CANON-LOCK-AND-SCREENPLAY-ARCHITECTURE.V1',
  authority: 'FOUNDER AUTHORIZATION: GRANTED — OCTOBER 23, 2026',
  scope: ['S-1 Hybrid H', 'S-2 Option A (86)', 'S-3 N1 + N2', 'NR-1', 'NR-2', 'NR-3', 'NR-4', 'NR-5', 'NR-6', 'NR-7', 'NR-8', 'NR-9', 'NR-10', 'NR-11'],
} as const;

export const S1_DEPENDENT_RELEASES = ['S1-10', 'S1-74', 'S1-80'] as const;
export const APPROVED_NIGHTS = { 'S1-20': 'Nineteen Eighty-Six', 'S1-40': 'The Breakfast Dance' } as const;
export const APPROVED_MAX_NIGHT_GAP = 19;
export const APPROVED_RUNTIME = '127:40';
export const APPROVED_RELEASE_COUNT = 86;

/** Founder decision behind each Option A revision (reconciliation 10_FULL_RELEASE_CHANGELOG.md, table B). */
export const REVISION_DECISIONS: Record<string, string[]> = {
  'S1-10': ['S-1', 'NR-1'],
  'S1-12': ['S-3', 'NR-4'],
  'S1-20': ['S-3', 'NR-4', 'NR-3', 'NR-5'],
  'S1-37': ['S-3', 'NR-4'],
  'S1-40': ['S-3', 'NR-4', 'NR-3'],
  'S1-43': ['S-2', 'NR-2', 'NR-8'],
  'S1-45': ['NR-3'],
  'S1-51': ['NR-3'],
  'S1-62': ['NR-3'],
  'S1-64': ['NR-3'],
  'S1-72': ['NR-3'],
  'S1-74': ['S-1', 'NR-1'],
  'S1-80': ['S-1', 'NR-1'],
};

export const APPROVED_AMENDMENTS: Record<string, ApprovedAmendment[]> = {
  'S1-43': [
    {
      amendmentId: 'AM-S1-43-NR8',
      recommendationId: 'NR-8',
      text: 'Sloane dresses for the lunch as for a duel: the sharpest look she owns, worn as armour. The design itself waits on wardrobe approval (U-4).',
      classification: 'PROVISIONAL_IMPLEMENTATION',
      placementEvidence: 'Named by NR-8 (reconciliation 09, section 4). S1-43 is the Arc 4 midpoint duel with Royce; Arc 4 had the weakest fashion moment (stress test T17).',
      runtimeEffect: 'None intended: a costume choice inside the existing 2:00 release.',
    },
  ],
  'S1-81': [
    {
      amendmentId: 'AM-S1-81-NR8',
      recommendationId: 'NR-8',
      text: "On the Number 9, Tina rides to work in Ophelia's coat, unhemmed. Her own staff, boarding, don't recognize her.",
      classification: 'PROVISIONAL_IMPLEMENTATION',
      placementEvidence:
        "S1-81 is set in cafés, buses and stoops the morning after the Grand Exchange and ends on a bus; S1-82 follows the vision-holders and has no link to Tina's thread. The closet swap was agreed on the Number 9 in S1-34. S1-34 does not fix when the swap week happens, so this beat implies it overlaps GE+1 (flagged CQ-01).",
      runtimeEffect: 'None intended: a silent beat inside the existing 1:15 montage.',
    },
    {
      amendmentId: 'AM-S1-81-NR9',
      recommendationId: 'NR-9',
      text: 'In the same beat Tina types to Sloane: "Breakfast? I don\'t need anything." It is the first message all season that asks her for nothing.',
      classification: 'PROVISIONAL_IMPLEMENTATION',
      placementEvidence:
        'Tina and Sloane share screen only in work contexts (S1-15 request, S1-62 sponsorship, S1-72 the Grand Exchange). A request-free message on the morning after Sloane steps back shows friendship through behaviour, rhymes with Tina\'s first appearance by message (S1-06) and serves Hybrid H (needed is not loved) without new exposition.',
      runtimeEffect: 'None intended: one on-screen message inside the same beat.',
    },
  ],
};

export const CANONICAL_AGES: Record<string, { age: number; status: string; source: string }> = {
  Sloane: { age: 33, status: 'APPROVED_CANON', source: 'Founder sprint text 2026-10-23 §04' },
  Gideon: { age: 44, status: 'APPROVED_CANON', source: 'Founder sprint text 2026-10-23 §04; approval matrix range 42–45' },
  Nadine: { age: 40, status: 'APPROVED_CANON', source: 'Founder sprint text 2026-10-23 §04' },
  Richard: { age: 66, status: 'APPROVED_CANON', source: 'Founder sprint text 2026-10-23 §04' },
  Kai: { age: 34, status: 'APPROVED_CANON', source: 'Founder sprint text 2026-10-23 §04' },
};

export const VIVIENNE = { diedYearsAgo: 10, ageAtDeath: 55, status: 'APPROVED_CANON', source: 'Founder sprint text 2026-10-23 §04' };
export const SLOANE_RESUMED_LEADERSHIP_AT = 28;

export const PRINCIPALS = ['Sloane', 'Gideon', 'Nadine', 'Richard', 'Kai', 'Celestine', 'Vivienne'] as const;
export const RECURRING_PATRON_NAMES = ['Mavis', 'Tina', 'Ophelia', 'Delphine', 'Dee', 'Zuri', 'Tad', 'Yaz', 'Lorna', 'Royce'] as const;
export const INVENTION_NAMES = ['Halo', 'Hush', 'Relay', 'Echo Track', 'Interval silk'] as const;

export const OPEN_QUESTIONS: Array<{ id: string; question: string; status: string; appliesTo: string }> = [
  { id: 'U-1', question: "Vivienne's private truth: writers'-room truth, or kept unresolved?", status: 'OPEN_CREATIVE_QUESTION', appliesTo: 'S1-86 (Vivienne\'s line "I know I\'m deciding for you again")' },
  { id: 'U-2', question: 'Should one mid-season Night exist purely for joy, with no request attached?', status: 'OPEN_CREATIVE_QUESTION', appliesTo: 'Season structure; no release' },
  { id: 'U-3', question: "Emmett Hale's identity (FD-09 approved the function only).", status: 'OPEN_CREATIVE_QUESTION', appliesTo: 'Releases featuring Emmett' },
  { id: 'U-4', question: "Sloane's and the principals' wardrobes; the founder's reference accounts are not reviewed.", status: 'PRODUCTION_DEPENDENCY', appliesTo: 'Releases with a wardrobe or fashion beat' },
  { id: 'U-5', question: 'Invention dossiers (Bible 06) for the Halo, the Hush, Relay paper, the Echo Track and the Interval silk.', status: 'PRODUCTION_DEPENDENCY', appliesTo: 'Releases that show an invention' },
  { id: 'U-6', question: 'Face locks for the recurring patrons (FD-18 covers only the family and the flashback faces).', status: 'PRODUCTION_DEPENDENCY', appliesTo: 'Releases featuring a recurring patron' },
  { id: 'U-7', question: 'Name clearance for every name added since the hybrid (FD-19).', status: 'PRODUCTION_DEPENDENCY', appliesTo: 'Releases first added in BASELINE V1 (source NEW)' },
  { id: 'U-8', question: 'Is a 3:15 release acceptable on the target platforms?', status: 'DORMANT', appliesTo: "Only Option B's The Garage merge; no master release" },
  { id: 'U-9', question: 'The Breach access route is gestured at in S1-83 and held for Season 2.', status: 'OPEN_CREATIVE_QUESTION', appliesTo: 'S1-83' },
];
