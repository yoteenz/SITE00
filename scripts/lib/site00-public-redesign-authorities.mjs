/**
 * Shared authority → route list for the public-redesign browser harnesses (proof + geometry).
 * Seeds put each IDNTY screen in the state its authority draws (answers selected, etc.).
 */
export const SIZES = { '941x1672': [390, 693], '1080x1920': [390, 693], '850x1850': [390, 849] };

/* ------------------------------------------------------------- IDNTY seeds */
export const KEY = 'site00_idnty_assessment_v1';
const seed = (slug, answers) => ({ identityState: slug, currentStep: null, completedSteps: [], answers: { [slug]: answers } });
const FOUNDATION = seed('starting-at-zero', {
  goal: 'launch-brand',
  audience: 'Early-stage founders, creative entrepreneurs, and small business owners (B2B) who are building intentional brands.',
  timeline: '3-4',
  budget: '5k-10k',
});
const REFINE = seed('some-pieces-exist', {
  assets: ['logo', 'color', 'typography'],
  'cohesion-diagnostic': 'mostly-cohesive',
  gaps: ['inconsistent-visual', 'unclear-messaging', 'no-guidelines'],
});
const EVOLUTION = seed('ready-for-evolution', {
  pathways: ['visual-identity'],
  goals: 'Preserve brand recognition while creating a more cohesive, current visual and messaging system.',
  timeline: '3-4',
});
const BUILD_READY = seed('build-ready', {
  'evidence-strategy': ['brand-strategy', 'positioning', 'market-insights'],
  'evidence-visual': ['logo-files', 'brand-guidelines', 'typography', 'palette'],
  'evidence-voice': ['messaging', 'tone-of-voice', 'example-content'],
  'evidence-values': ['core-values', 'beliefs', 'esg-purpose'],
  'evidence-experience': [],
  'review-flags': ['VOICE'],
});

const idnty = (id, route, size, s, extra = {}) => ({ id, route, size, seed: s, ...extra });
const clickExpand = (label) => async (page) => {
  await page.getByRole('button', { name: label }).click();
  await page.waitForTimeout(700);
};

export const AUTHORITIES = [
  { id: '01_ORIGIN_MAIN', route: '/', size: '941x1672', folder: '01_ORIGIN' },
  { id: '02_ORIGIN_IDNTY_EXPANDED', route: '/', size: '941x1672', folder: '01_ORIGIN', action: clickExpand('EXPAND IDNTY') },
  { id: '03_ORIGIN_BLDR_EXPANDED', route: '/', size: '941x1672', folder: '01_ORIGIN', action: clickExpand('EXPAND BLDR') },
  { id: '04_ORIGIN_EVOLVE_EXPANDED', route: '/', size: '941x1672', folder: '01_ORIGIN', action: clickExpand('EXPAND EVOLVE') },
  idnty('01_IDNTY_DIAGNOSTIC_OVERVIEW', '/idnty/state', '941x1672', null, { folder: '02_IDNTY/00_DIAGNOSTIC' }),
  idnty('02_IDNTY_STATE_00_FOUNDATION', '/idnty/starting-at-zero', '941x1672', FOUNDATION, { folder: '02_IDNTY/00_DIAGNOSTIC' }),
  idnty('03_IDNTY_STATE_01_REFINE', '/idnty/some-pieces-exist', '850x1850', REFINE, { folder: '02_IDNTY/00_DIAGNOSTIC' }),
  idnty('04_IDNTY_STATE_02_EVOLUTION', '/idnty/ready-for-evolution', '850x1850', EVOLUTION, { folder: '02_IDNTY/00_DIAGNOSTIC' }),
  idnty('05_IDNTY_STATE_03_BUILD_READY', '/idnty/build-ready', '850x1850', BUILD_READY, { folder: '02_IDNTY/00_DIAGNOSTIC' }),
  idnty('01_FOUNDATION_PRIMARY_GOAL', '/idnty/starting-at-zero/goal', '1080x1920', FOUNDATION, { folder: '02_IDNTY/01_FOUNDATION' }),
  idnty('02_FOUNDATION_AUDIENCE', '/idnty/starting-at-zero/audience', '1080x1920', FOUNDATION, { folder: '02_IDNTY/01_FOUNDATION' }),
  idnty('03_FOUNDATION_TIMELINE', '/idnty/starting-at-zero/timeline', '1080x1920', FOUNDATION, { folder: '02_IDNTY/01_FOUNDATION' }),
  idnty('04_FOUNDATION_BUDGET', '/idnty/starting-at-zero/budget', '1080x1920', FOUNDATION, { folder: '02_IDNTY/01_FOUNDATION' }),
  idnty('05_FOUNDATION_REVIEW', '/idnty/starting-at-zero/review', '1080x1920', FOUNDATION, { folder: '02_IDNTY/01_FOUNDATION' }),
  idnty('01_REFINE_EXISTING_ASSETS', '/idnty/some-pieces-exist/assets', '1080x1920', REFINE, { folder: '02_IDNTY/02_REFINE' }),
  idnty('02_REFINE_CONDITION', '/idnty/some-pieces-exist/cohesion-diagnostic', '1080x1920', REFINE, { folder: '02_IDNTY/02_REFINE' }),
  idnty('03_REFINE_GAPS', '/idnty/some-pieces-exist/gaps', '1080x1920', REFINE, { folder: '02_IDNTY/02_REFINE' }),
  idnty('04_REFINE_REVIEW', '/idnty/some-pieces-exist/review', '1080x1920', REFINE, { folder: '02_IDNTY/02_REFINE' }),
  idnty('01_EVOLUTION_AREAS', '/idnty/ready-for-evolution/pathways', '1080x1920', EVOLUTION, { folder: '02_IDNTY/03_READY_FOR_EVOLUTION' }),
  idnty('02_EVOLUTION_GOALS', '/idnty/ready-for-evolution/goals', '1080x1920', EVOLUTION, { folder: '02_IDNTY/03_READY_FOR_EVOLUTION' }),
  idnty('03_EVOLUTION_TIMELINE', '/idnty/ready-for-evolution/timeline', '1080x1920', EVOLUTION, { folder: '02_IDNTY/03_READY_FOR_EVOLUTION' }),
  idnty('04_EVOLUTION_REVIEW', '/idnty/ready-for-evolution/review', '1080x1920', EVOLUTION, { folder: '02_IDNTY/03_READY_FOR_EVOLUTION' }),
  idnty('01_BUILD_READY_VERIFICATION', '/idnty/build-ready/verification', '1080x1920', BUILD_READY, { folder: '02_IDNTY/04_BUILD_READY' }),
  idnty('02_BUILD_READY_EVIDENCE', '/idnty/build-ready/evidence', '1080x1920', BUILD_READY, { folder: '02_IDNTY/04_BUILD_READY' }),
  idnty('03_BUILD_READY_AUTHORITY_CHECK', '/idnty/build-ready/authority-check', '1080x1920', BUILD_READY, { folder: '02_IDNTY/04_BUILD_READY' }),
  idnty('04_BUILD_READY_REVIEW_VERIFICATION', '/idnty/build-ready/review', '1080x1920', BUILD_READY, { folder: '02_IDNTY/04_BUILD_READY' }),
  { id: '01_BLDR_COMMAND_CENTER', route: '/bldr/state', size: '941x1672', folder: '03_BLDR' },
  { id: '02_BLDR_OVERVIEW', route: '/bldr/state?path=overview', size: '941x1672', folder: '03_BLDR' },
  { id: '03_BLDR_SITE', route: '/bldr/state?path=site', size: '941x1672', folder: '03_BLDR' },
  { id: '04_BLDR_WORLD', route: '/bldr/state?path=world', size: '941x1672', folder: '03_BLDR' },
  { id: '05_BLDR_SYSTEMS', route: '/bldr/state?path=systems', size: '941x1672', folder: '03_BLDR' },
  { id: '06_BLDR_EXTENSIONS', route: '/bldr/state?path=extensions', size: '941x1672', folder: '03_BLDR' },
  { id: '01_EVOLVE_INTERVENTION_CENTER', route: '/evolve/state', size: '1080x1920', folder: '04_EVOLVE' },
  { id: '02_EVOLVE_REFINE', route: '/evolve/state?path=refine', size: '941x1672', folder: '04_EVOLVE' },
  { id: '03_EVOLVE_INSTALL', route: '/evolve/state?path=install', size: '941x1672', folder: '04_EVOLVE' },
  { id: '04_EVOLVE_TRANSFORM', route: '/evolve/state?path=transform', size: '941x1672', folder: '04_EVOLVE' },
  { id: '01_LOCATIONS_MAIN', route: '/origin/locations', size: '941x1672', folder: '05_LOCATIONS' },
];

