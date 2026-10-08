/**
 * The seven canonical parent families of JURNL EDITORIAL CORRESPONDENCE.
 * A family fixes the artifact grammar, mood, expressiveness, consent classes and component permissions.
 */

import type { ArtifactGrammar, ConsentClass, EmailFamilyId, PersonalizationLevel } from './types.js';

export type EmailFamilyContract = {
  readonly id: EmailFamilyId;
  readonly name: string;
  readonly purpose: string;
  readonly examples: readonly string[];
  readonly artifactGrammar: readonly ArtifactGrammar[];
  readonly mood: string;
  readonly visualLanguage: readonly string[];
  readonly forbidden: readonly string[];
  /** Consent classes a message in this family may carry. */
  readonly consentClasses: readonly ConsentClass[];
  /** 1 = plainest, 5 = most expressive. */
  readonly expressiveness: 1 | 2 | 3 | 4 | 5;
  /** Whether L1 environment art is allowed. */
  readonly environmentArt: 'NONE' | 'OPTIONAL' | 'EXPECTED';
  readonly maxPersonalization: PersonalizationLevel;
  /** Hard priorities that outrank expression. */
  readonly priorities: readonly string[];
  /** Lineage group(s) whose materials this family draws on. */
  readonly lineage: readonly string[];
};

export const EMAIL_FAMILIES: readonly EmailFamilyContract[] = [
  {
    id: 'E01',
    name: 'WELCOME / ARRIVAL',
    purpose: 'Entry, signup, account created, onboarding invitation and other major first-contact moments.',
    examples: ['welcome to JURNL', 'your Safe to Spend is ready', 'your account is open'],
    artifactGrammar: ['INVITATION', 'WELCOME_LETTER', 'ENTRY_CARD'],
    mood: 'ceremonial, optimistic, aspirational',
    visualLanguage: ['folded invitation', 'embossed stationery', 'olive seal', 'burgundy edge', 'Mediterranean still life', 'classical crop', 'substantial negative space'],
    forbidden: ['promotional offers', 'feature lists', 'app screenshots', 'more than one call to action'],
    consentClasses: ['LIFECYCLE_SERVICE'],
    expressiveness: 4,
    environmentArt: 'EXPECTED',
    maxPersonalization: 'P2',
    priorities: ['a single clear next step', 'warmth without hype'],
    lineage: ['ARRIVAL'],
  },
  {
    id: 'E02',
    name: 'GUIDANCE / EDUCATION',
    purpose: 'Teach JURNL concepts and guide behaviour.',
    examples: ['how Safe to Spend works', 'connect accounts', 'build a first plan', 'understand credit', 'organize upcoming obligations'],
    artifactGrammar: ['FIELD_GUIDE', 'ANNOTATED_NOTE', 'EDITORIAL_EXPLAINER'],
    mood: 'clear, intelligent, human',
    visualLanguage: ['numbered printed steps', 'clipped notes', 'architectural or botanical reference', 'annotated margin', 'paper layering'],
    forbidden: ['jargon without explanation', 'more than five steps', 'stock-photo people'],
    consentClasses: ['LIFECYCLE_SERVICE', 'MARKETING'],
    expressiveness: 3,
    environmentArt: 'OPTIONAL',
    maxPersonalization: 'P2',
    priorities: ['one concept per email', 'steps that match the app exactly'],
    lineage: ['FIELD_GUIDE', 'ARRIVAL'],
  },
  {
    id: 'E03',
    name: 'FINANCIAL BRIEF / DIGEST',
    purpose: 'Recurring financial correspondence.',
    examples: ['weekly brief', 'monthly brief', "what's coming", 'what moved', 'plan status', 'financial snapshot'],
    artifactGrammar: ['BRIEFING_SHEET', 'LEDGER_INSERT', 'CLIPBOARD_BRIEF', 'PRINTED_REVIEW'],
    mood: 'informative, calm, useful',
    visualLanguage: ['data columns', 'clipped paper', 'ledger rules', 'editorial figures', 'restrained object photography'],
    forbidden: ['charts rendered as images', 'figures in images', 'judgement words about spending', 'invented observations'],
    consentClasses: ['LIFECYCLE_SERVICE'],
    expressiveness: 2,
    environmentArt: 'OPTIONAL',
    maxPersonalization: 'P3',
    priorities: ['accurate live figures', 'honest empty / incomplete states', 'scannable in ten seconds'],
    lineage: ['BRIEFING'],
  },
  {
    id: 'E04',
    name: 'MILESTONE / CELEBRATION',
    purpose: 'Acknowledge real progress.',
    examples: ['goal funded', 'buffer established', 'debt milestone', 'plan completion', 'meaningful financial achievement'],
    artifactGrammar: ['CEREMONIAL_NOTE', 'MILESTONE_CARD', 'EMBOSSED_LETTER'],
    mood: 'warm, elegant, rewarding',
    visualLanguage: ['richer burgundy', 'embossing', 'seal', 'brass', 'special paper', 'stronger still life'],
    forbidden: ['confetti', 'gamification clichés', 'trophy graphics', 'badges', 'streaks', 'leaderboards'],
    consentClasses: ['LIFECYCLE_SERVICE'],
    expressiveness: 4,
    environmentArt: 'OPTIONAL',
    maxPersonalization: 'P2',
    priorities: ['only real, verified milestones', 'the achievement in the person’s own terms (goal name, amount)'],
    lineage: ['CEREMONIAL'],
  },
  {
    id: 'E05',
    name: 'REMINDER / NUDGE',
    purpose: 'Timely short-form action.',
    examples: ['unfinished setup', 'bill approaching', 'unusual purchase', 'plan needs attention', 'credit utilization change', 'account connection issue'],
    artifactGrammar: ['PINNED_NOTE', 'SMALL_MEMO', 'DESK_SLIP'],
    mood: 'concise, supportive, not alarmist',
    visualLanguage: ['a single note or slip', 'pin or brass clip', 'short hand-set line', 'quiet desk surface crop'],
    forbidden: ['more than one message', 'more than one primary action', 'fear or shame language', 'countdowns', 'red alert styling'],
    consentClasses: ['LIFECYCLE_SERVICE'],
    expressiveness: 2,
    environmentArt: 'NONE',
    maxPersonalization: 'P2',
    priorities: ['one message', 'one primary action', 'NUDGE_COPY_CONSTRAINT'],
    lineage: ['DESK_NOTE'],
  },
  {
    id: 'E06',
    name: 'SECURITY / ACCOUNT / TRANSACTIONAL',
    purpose: 'Critical account, security and system communication.',
    examples: ['verify email', 'reset password', 'new login', 'changed email', 'changed security setting', 'consent update', 'account alert'],
    artifactGrammar: ['ACCESS_CREDENTIAL', 'FORMAL_NOTICE', 'PRIVATE_CORRESPONDENCE'],
    mood: 'clear, restrained, trustworthy',
    visualLanguage: ['plain correspondence card', 'single emboss or seal', 'quiet paper texture'],
    forbidden: ['marketing content', 'promotions', 'editorial storytelling', 'environment art', 'social links', 'cross-sell', 'tracking-wrapped security links', 'anything that could imitate phishing (urgent red, threats)'],
    consentClasses: ['TRANSACTIONAL'],
    expressiveness: 1,
    environmentArt: 'NONE',
    maxPersonalization: 'P1',
    priorities: ['clarity', 'trust', 'legibility', 'security', 'what to do if this was not you'],
    lineage: ['SECURE_CORRESPONDENCE'],
  },
  {
    id: 'E07',
    name: 'MARKETING / EDITORIAL CAMPAIGN',
    purpose: 'Product storytelling, launches, editorial campaigns, seasonal financial narratives.',
    examples: ['feature launch', 'seasonal planning story', 'JURNL editorial', 'campaign content', 'lifestyle / financial storytelling'],
    artifactGrammar: ['MAGAZINE_SPREAD', 'BROADSIDE', 'CAMPAIGN_LETTER', 'CULTURAL_EDITORIAL'],
    mood: 'the most expressive family',
    visualLanguage: ['richer collage', 'art-history references', 'more dramatic photography', 'oversized editorial typography', 'unexpected cropping', 'cultural storytelling'],
    forbidden: ['personal financial figures', 'account or security content', 'sending without marketing consent', 'scrapbook collage'],
    consentClasses: ['MARKETING'],
    expressiveness: 5,
    environmentArt: 'EXPECTED',
    maxPersonalization: 'P1',
    priorities: ['explicit marketing consent', 'one-click unsubscribe'],
    lineage: ['EDITORIAL'],
  },
];

export const familyById = (id: EmailFamilyId): EmailFamilyContract => {
  const f = EMAIL_FAMILIES.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown email family ${id}`);
  return f;
};

/** Inheritance chain every email belongs to. */
export const FAMILY_INHERITANCE = [
  'EMAIL FAMILY',
  'MESSAGE TYPE',
  'TRIGGER / CAMPAIGN',
  'STATE / VARIANT',
  'RESPONSIVE AUTHORITY',
  'ASSET PACKAGE',
  'IMPLEMENTED TEMPLATE',
] as const;
export const INHERITANCE_RULE = 'States are variants of one template (same artifact, same assets, different live content and status line). Never force every state into a separate unrelated template.';
