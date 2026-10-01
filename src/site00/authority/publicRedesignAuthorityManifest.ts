/**
 * Public redesign — code-side authority manifest (SONNET-STRUCTURE1).
 *
 * Implementation METADATA, not customer UI. Maps every ACTIVE authority screen from the
 * SITE 00 Public Redesign Authority Pack to its live route, component, state and asset slots.
 * Authority images themselves are never shipped — only their canonical ids/paths (pack-relative).
 *
 * Sequence = folder path + numeric filename prefix. Upload chronology is not authoritative.
 * Superseded images (99_SUPERSEDED_DO_NOT_USE/*) are listed in `SUPERSEDED_AUTHORITY_IDS` only so
 * tests can prove they are excluded; they have no records and must never be implemented.
 */

export type AuthorityFamily = 'ORIGIN' | 'IDNTY' | 'BLDR' | 'EVOLVE' | 'LOCATIONS';

export type AuthorityImplementationStatus =
  /** Live structure built from authority; awaiting Opus pixel convergence + Grok assets. */
  | 'STRUCTURE_IMPLEMENTED'
  /** Live structure built, with an honesty/product deviation from the image (see notes). */
  | 'STRUCTURE_IMPLEMENTED_WITH_DEVIATION';

export type AuthorityRecord = {
  /** Stable id: the pack filename stem. */
  id: string;
  /** Pack-relative path (not a runtime path). */
  packPath: string;
  sequence: number;
  family: AuthorityFamily;
  pageFamily: string;
  /** IDNTY state slug or other state discriminator. */
  state: string | null;
  /** Canonical (mobile) route this authority renders on. */
  route: string;
  /** Viewport the authority image was composed at (px). */
  viewport: { w: number; h: number };
  component: string;
  status: AuthorityImplementationStatus;
  assetSlots: string[];
  notes?: string;
};

type Seed = Omit<AuthorityRecord, 'packPath' | 'sequence' | 'viewport' | 'status'> & {
  folder: string;
  size: '941x1672' | '1080x1920' | '850x1850';
  status?: AuthorityImplementationStatus;
};

const IDNTY_PLATE = ['ENV.IDNTY.ATRIUM'];

const SEEDS: Seed[] = [
  /* 01 ORIGIN */
  { id: '01_ORIGIN_MAIN', folder: '01_ORIGIN', size: '941x1672', family: 'ORIGIN', pageFamily: 'ORIGIN', state: 'collapsed', route: '/', component: 'PublicOriginMobile', assetSlots: ['ENV.ORIGIN.COLLAPSED', 'CARD.ORIGIN.IDNTY', 'CARD.ORIGIN.BLDR', 'CARD.ORIGIN.EVOLVE'], notes: 'Also served at /origin. Nav links CHARACTERS / WORLDS / LIBRARY omitted: no such routes (canonical Origin = IDNTY / BLDR / EVOLVE).' },
  { id: '02_ORIGIN_IDNTY_EXPANDED', folder: '01_ORIGIN', size: '941x1672', family: 'ORIGIN', pageFamily: 'ORIGIN', state: 'idnty-expanded', route: '/', component: 'PublicOriginExpandedPanel', assetSlots: ['ENV.ORIGIN.EXPANDED', 'ILLUSTRATION.ORIGIN.IDENTITY'], notes: 'Driven by Site00Context.homeMode = idnty-expanded.' },
  { id: '03_ORIGIN_BLDR_EXPANDED', folder: '01_ORIGIN', size: '941x1672', family: 'ORIGIN', pageFamily: 'ORIGIN', state: 'bldr-expanded', route: '/', component: 'PublicOriginExpandedPanel', assetSlots: ['ENV.ORIGIN.EXPANDED', 'ILLUSTRATION.ORIGIN.BLDR'], notes: 'Panel title reads BUILDER per authority; routes to /bldr/state.' },
  { id: '04_ORIGIN_EVOLVE_EXPANDED', folder: '01_ORIGIN', size: '941x1672', family: 'ORIGIN', pageFamily: 'ORIGIN', state: 'evolve-expanded', route: '/', component: 'PublicOriginExpandedPanel', assetSlots: ['ENV.ORIGIN.EXPANDED', 'ILLUSTRATION.ORIGIN.EVOLVE', 'ILLUSTRATION.ORIGIN.EVOLVE_PATH.REFINE', 'ILLUSTRATION.ORIGIN.EVOLVE_PATH.INSTALL', 'ILLUSTRATION.ORIGIN.EVOLVE_PATH.TRANSFORM'], notes: 'Exactly three paths: REFINE / INSTALL / TRANSFORM.' },

  /* 02 IDNTY / DIAGNOSTIC */
  { id: '01_IDNTY_DIAGNOSTIC_OVERVIEW', folder: '02_IDNTY/00_DIAGNOSTIC', size: '941x1672', family: 'IDNTY', pageFamily: 'IDNTY_DIAGNOSTIC', state: 'overview', route: '/idnty/state', component: 'IdentityDiagnosticOverview', assetSlots: IDNTY_PLATE },
  { id: '02_IDNTY_STATE_00_FOUNDATION', folder: '02_IDNTY/00_DIAGNOSTIC', size: '941x1672', family: 'IDNTY', pageFamily: 'IDNTY_DIAGNOSTIC', state: 'starting-at-zero', route: '/idnty/starting-at-zero', component: 'IdentityDiagnosticFlow(mode=detail)', assetSlots: [...IDNTY_PLATE, 'MACHINE.IDNTY.FOUNDATION.ORB'] },
  { id: '03_IDNTY_STATE_01_REFINE', folder: '02_IDNTY/00_DIAGNOSTIC', size: '850x1850', family: 'IDNTY', pageFamily: 'IDNTY_DIAGNOSTIC', state: 'some-pieces-exist', route: '/idnty/some-pieces-exist', component: 'IdentityDiagnosticFlow(mode=detail)', assetSlots: [...IDNTY_PLATE, 'MACHINE.IDNTY.PARTIAL.LATTICE'] },
  { id: '04_IDNTY_STATE_02_EVOLUTION', folder: '02_IDNTY/00_DIAGNOSTIC', size: '850x1850', family: 'IDNTY', pageFamily: 'IDNTY_DIAGNOSTIC', state: 'ready-for-evolution', route: '/idnty/ready-for-evolution', component: 'IdentityDiagnosticFlow(mode=detail)', assetSlots: [...IDNTY_PLATE, 'MACHINE.IDNTY.EVOLUTION.WAVES'] },
  { id: '05_IDNTY_STATE_03_BUILD_READY', folder: '02_IDNTY/00_DIAGNOSTIC', size: '850x1850', family: 'IDNTY', pageFamily: 'IDNTY_DIAGNOSTIC', state: 'build-ready', route: '/idnty/build-ready', component: 'IdentityDiagnosticFlow(mode=detail)', assetSlots: [...IDNTY_PLATE, 'MACHINE.IDNTY.AUTHORITY.STAR'], status: 'STRUCTURE_IMPLEMENTED_WITH_DEVIATION', notes: 'DEVIATION: image says "locked and verified" / ENTER BLDR. No verification backend exists, so copy is honest (verification required) and CTA is BEGIN VERIFICATION.' },

  /* 02 IDNTY / FOUNDATION */
  { id: '01_FOUNDATION_PRIMARY_GOAL', folder: '02_IDNTY/01_FOUNDATION', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_FOUNDATION', state: 'starting-at-zero', route: '/idnty/starting-at-zero/goal', component: 'IdentityDiagnosticFlow(mode=question)', assetSlots: [...IDNTY_PLATE, 'MACHINE.IDNTY.FOUNDATION.ORB'] },
  { id: '02_FOUNDATION_AUDIENCE', folder: '02_IDNTY/01_FOUNDATION', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_FOUNDATION', state: 'starting-at-zero', route: '/idnty/starting-at-zero/audience', component: 'IdentityDiagnosticFlow(mode=question)', assetSlots: IDNTY_PLATE },
  { id: '03_FOUNDATION_TIMELINE', folder: '02_IDNTY/01_FOUNDATION', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_FOUNDATION', state: 'starting-at-zero', route: '/idnty/starting-at-zero/timeline', component: 'IdentityDiagnosticFlow(mode=question)', assetSlots: IDNTY_PLATE },
  { id: '04_FOUNDATION_BUDGET', folder: '02_IDNTY/01_FOUNDATION', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_FOUNDATION', state: 'starting-at-zero', route: '/idnty/starting-at-zero/budget', component: 'IdentityDiagnosticFlow(mode=question)', assetSlots: IDNTY_PLATE },
  { id: '05_FOUNDATION_REVIEW', folder: '02_IDNTY/01_FOUNDATION', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_FOUNDATION', state: 'starting-at-zero', route: '/idnty/starting-at-zero/review', component: 'IdentityDiagnosticFlow(mode=review)', assetSlots: IDNTY_PLATE },

  /* 02 IDNTY / REFINE */
  { id: '01_REFINE_EXISTING_ASSETS', folder: '02_IDNTY/02_REFINE', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_REFINE', state: 'some-pieces-exist', route: '/idnty/some-pieces-exist/assets', component: 'IdentityDiagnosticFlow(mode=question)', assetSlots: [...IDNTY_PLATE, 'MACHINE.IDNTY.PARTIAL.LATTICE'], notes: 'OTHER is a conditional field inside the panel (no standalone screen).' },
  { id: '02_REFINE_CONDITION', folder: '02_IDNTY/02_REFINE', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_REFINE', state: 'some-pieces-exist', route: '/idnty/some-pieces-exist/cohesion-diagnostic', component: 'IdentityDiagnosticFlow(mode=question)', assetSlots: IDNTY_PLATE },
  { id: '03_REFINE_GAPS', folder: '02_IDNTY/02_REFINE', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_REFINE', state: 'some-pieces-exist', route: '/idnty/some-pieces-exist/gaps', component: 'IdentityDiagnosticFlow(mode=question)', assetSlots: IDNTY_PLATE, notes: 'Machine callout annotations for selected gaps deferred to Opus.' },
  { id: '04_REFINE_REVIEW', folder: '02_IDNTY/02_REFINE', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_REFINE', state: 'some-pieces-exist', route: '/idnty/some-pieces-exist/review', component: 'IdentityDiagnosticFlow(mode=review)', assetSlots: IDNTY_PLATE },

  /* 02 IDNTY / READY FOR EVOLUTION */
  { id: '01_EVOLUTION_AREAS', folder: '02_IDNTY/03_READY_FOR_EVOLUTION', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_EVOLUTION', state: 'ready-for-evolution', route: '/idnty/ready-for-evolution/pathways', component: 'IdentityDiagnosticFlow(mode=question)', assetSlots: [...IDNTY_PLATE, 'MACHINE.IDNTY.EVOLUTION.WAVES'], notes: 'IDNTY-owned identity domains only (strategy / visual / messaging).' },
  { id: '02_EVOLUTION_GOALS', folder: '02_IDNTY/03_READY_FOR_EVOLUTION', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_EVOLUTION', state: 'ready-for-evolution', route: '/idnty/ready-for-evolution/goals', component: 'IdentityDiagnosticFlow(mode=question)', assetSlots: IDNTY_PLATE },
  { id: '03_EVOLUTION_TIMELINE', folder: '02_IDNTY/03_READY_FOR_EVOLUTION', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_EVOLUTION', state: 'ready-for-evolution', route: '/idnty/ready-for-evolution/timeline', component: 'IdentityDiagnosticFlow(mode=question)', assetSlots: IDNTY_PLATE },
  { id: '04_EVOLUTION_REVIEW', folder: '02_IDNTY/03_READY_FOR_EVOLUTION', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_EVOLUTION', state: 'ready-for-evolution', route: '/idnty/ready-for-evolution/review', component: 'IdentityDiagnosticFlow(mode=review)', assetSlots: IDNTY_PLATE },

  /* 02 IDNTY / BUILD READY */
  { id: '01_BUILD_READY_VERIFICATION', folder: '02_IDNTY/04_BUILD_READY', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_BUILD_READY', state: 'build-ready', route: '/idnty/build-ready/verification', component: 'IdentityDiagnosticFlow(mode=question) + BuildReadyVerificationList', assetSlots: [...IDNTY_PLATE, 'MACHINE.IDNTY.AUTHORITY.STAR'], status: 'STRUCTURE_IMPLEMENTED_WITH_DEVIATION', notes: 'Statuses are provisional client descriptions of user-supplied evidence. No verification backend.' },
  { id: '02_BUILD_READY_EVIDENCE', folder: '02_IDNTY/04_BUILD_READY', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_BUILD_READY', state: 'build-ready', route: '/idnty/build-ready/evidence', component: 'IdentityDiagnosticFlow(mode=question) + BuildReadyEvidenceList', assetSlots: IDNTY_PLATE, status: 'STRUCTURE_IMPLEMENTED_WITH_DEVIATION', notes: 'Evidence = source-material types the user confirms. File upload/storage has no backend.' },
  { id: '03_BUILD_READY_AUTHORITY_CHECK', folder: '02_IDNTY/04_BUILD_READY', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_BUILD_READY', state: 'build-ready', route: '/idnty/build-ready/authority-check', component: 'IdentityDiagnosticFlow(mode=question) + BuildReadyAuthorityCheckList', assetSlots: IDNTY_PLATE, status: 'STRUCTURE_IMPLEMENTED_WITH_DEVIATION', notes: 'DEVIATION: image shows AUTHORITY ESTABLISHED and "SITE 00 HAS REVIEWED". Nothing has been reviewed; shows PENDING REVIEW / GAP IDENTIFIED / REVIEW REQUIRED only.' },
  { id: '04_BUILD_READY_REVIEW_VERIFICATION', folder: '02_IDNTY/04_BUILD_READY', size: '1080x1920', family: 'IDNTY', pageFamily: 'IDNTY_BUILD_READY', state: 'build-ready', route: '/idnty/build-ready/review', component: 'IdentityDiagnosticFlow(mode=review) + BuildReadyReview', assetSlots: IDNTY_PLATE, status: 'STRUCTURE_IMPLEMENTED_WITH_DEVIATION', notes: 'SUBMIT FOR VERIFICATION reports the capability as unavailable; it never fakes a submission.' },

  /* 03 BLDR */
  { id: '01_BLDR_COMMAND_CENTER', folder: '03_BLDR', size: '941x1672', family: 'BLDR', pageFamily: 'BLDR_COMMAND_CENTER', state: 'command-center', route: '/bldr/state', component: 'BuilderCommandCenter', assetSlots: ['ENV.BLDR.COMMAND_CENTER', 'MACHINE.BLDR.TOWER', 'CARD.BLDR.PATH.SITE', 'CARD.BLDR.PATH.WORLD', 'CARD.BLDR.PATH.SYSTEMS', 'CARD.BLDR.PATH.EXTENSIONS'], notes: 'STRUCTURAL MISMATCH: current product classes are SITE / WORLD / ENTERPRISE / NOT SURE. SYSTEMS → enterprise; EXTENSIONS has no class yet (routes to discovery).' },
  { id: '02_BLDR_OVERVIEW', folder: '03_BLDR', size: '941x1672', family: 'BLDR', pageFamily: 'BLDR_PATH_PANEL', state: 'overview', route: '/bldr/state?path=overview', component: 'BuilderPathPanel', assetSlots: ['ENV.BLDR.PATH.OVERVIEW', 'ILLUSTRATION.BLDR.PATH.PANEL.OVERVIEW', 'ILLUSTRATION.BLDR.FRAMEWORK.STEP'] },
  { id: '03_BLDR_SITE', folder: '03_BLDR', size: '941x1672', family: 'BLDR', pageFamily: 'BLDR_PATH_PANEL', state: 'site', route: '/bldr/state?path=site', component: 'BuilderPathPanel', assetSlots: ['ENV.BLDR.PATH.SITE', 'ILLUSTRATION.BLDR.PATH.PANEL.SITE', 'ILLUSTRATION.BLDR.FRAMEWORK.STEP'] },
  { id: '04_BLDR_WORLD', folder: '03_BLDR', size: '941x1672', family: 'BLDR', pageFamily: 'BLDR_PATH_PANEL', state: 'world', route: '/bldr/state?path=world', component: 'BuilderPathPanel', assetSlots: ['ENV.BLDR.PATH.WORLD', 'ILLUSTRATION.BLDR.PATH.PANEL.WORLD', 'ILLUSTRATION.BLDR.FRAMEWORK.STEP'] },
  { id: '05_BLDR_SYSTEMS', folder: '03_BLDR', size: '941x1672', family: 'BLDR', pageFamily: 'BLDR_PATH_PANEL', state: 'systems', route: '/bldr/state?path=systems', component: 'BuilderPathPanel', assetSlots: ['ENV.BLDR.PATH.SYSTEMS', 'ILLUSTRATION.BLDR.PATH.PANEL.SYSTEMS', 'ILLUSTRATION.BLDR.FRAMEWORK.STEP'], notes: 'BEGIN SYSTEMS → existing /bldr/enterprise assessment (nearest current function).' },
  { id: '06_BLDR_EXTENSIONS', folder: '03_BLDR', size: '941x1672', family: 'BLDR', pageFamily: 'BLDR_PATH_PANEL', state: 'extensions', route: '/bldr/state?path=extensions', component: 'BuilderPathPanel', assetSlots: ['ENV.BLDR.PATH.EXTENSIONS', 'ILLUSTRATION.BLDR.PATH.PANEL.EXTENSIONS', 'ILLUSTRATION.BLDR.FRAMEWORK.STEP'], notes: 'No EXTENSIONS build class exists; BEGIN EXTENSIONS → /bldr/not-sure discovery. WAITING_FOR_ROUTE.' },

  /* 04 EVOLVE */
  { id: '01_EVOLVE_INTERVENTION_CENTER', folder: '04_EVOLVE', size: '1080x1920', family: 'EVOLVE', pageFamily: 'EVOLVE_INTERVENTION_CENTER', state: 'intervention-center', route: '/evolve/state', component: 'EvolveInterventionCenter', assetSlots: ['ENV.EVOLVE.INTERVENTION_CENTER', 'MACHINE.EVOLVE.PROPERTY_TOWER', 'CARD.EVOLVE.PATH.REFINE', 'CARD.EVOLVE.PATH.INSTALL', 'CARD.EVOLVE.PATH.TRANSFORM'], notes: 'Image highlights the IDNTY nav bay on an EVOLVE page; implementation highlights the contextual EVOLVE bay.' },
  { id: '02_EVOLVE_REFINE', folder: '04_EVOLVE', size: '941x1672', family: 'EVOLVE', pageFamily: 'EVOLVE_PATH_PANEL', state: 'refine', route: '/evolve/state?path=refine', component: 'EvolvePathPanel', assetSlots: ['ENV.EVOLVE.PATH.REFINE', 'ILLUSTRATION.EVOLVE.PATH.PANEL.REFINE'] },
  { id: '03_EVOLVE_INSTALL', folder: '04_EVOLVE', size: '941x1672', family: 'EVOLVE', pageFamily: 'EVOLVE_PATH_PANEL', state: 'install', route: '/evolve/state?path=install', component: 'EvolvePathPanel', assetSlots: ['ENV.EVOLVE.PATH.INSTALL', 'ILLUSTRATION.EVOLVE.PATH.PANEL.INSTALL'] },
  { id: '04_EVOLVE_TRANSFORM', folder: '04_EVOLVE', size: '941x1672', family: 'EVOLVE', pageFamily: 'EVOLVE_PATH_PANEL', state: 'transform', route: '/evolve/state?path=transform', component: 'EvolvePathPanel', assetSlots: ['ENV.EVOLVE.PATH.TRANSFORM', 'ILLUSTRATION.EVOLVE.PATH.PANEL.TRANSFORM'] },

  /* 05 LOCATIONS */
  { id: '01_LOCATIONS_MAIN', folder: '05_LOCATIONS', size: '941x1672', family: 'LOCATIONS', pageFamily: 'LOCATIONS', state: null, route: '/origin/locations', component: 'PublicLocationsDirectory', assetSlots: ['ENV.LOCATIONS.ARCH', 'CARD.LOCATIONS.BLDR', 'CARD.LOCATIONS.EVOLVE', 'CARD.LOCATIONS.SITES', 'CARD.LOCATIONS.SERVICES', 'CARD.LOCATIONS.SYSTEM', 'CARD.LOCATIONS.ABOUT', 'CARD.LOCATIONS.JOURNAL'], notes: 'Image numbers SYSTEM and ABOUT both "05"; implementation uses config order 05 / 06 / 07. YOUR SPACE section (existing function) retained below the supplied seven.' },
];

export const PUBLIC_REDESIGN_AUTHORITY_RECORDS: AuthorityRecord[] = SEEDS.map((seed, index) => {
  const [w, h] = seed.size.split('x').map(Number);
  const { folder, size: _size, status, ...rest } = seed;
  return {
    ...rest,
    sequence: index + 1,
    packPath: `${folder}/${seed.id}.jpg`,
    viewport: { w, h },
    status: status ?? 'STRUCTURE_IMPLEMENTED',
  };
});

/** Rejected early IDNTY intake layouts — never implement, never reference as authority. */
export const SUPERSEDED_AUTHORITY_IDS = [
  '01_OLD_REFINE_INTAKE_LAYOUT',
  '02_OLD_REFINE_CONDITION_LAYOUT',
  '03_OLD_REFINE_GAPS_LAYOUT',
] as const;

export function getAuthorityRecord(id: string): AuthorityRecord | undefined {
  return PUBLIC_REDESIGN_AUTHORITY_RECORDS.find((r) => r.id === id);
}

/**
 * Routes in the public product that have NO approved visual authority yet.
 * Function is preserved as-is; visual rewrite is blocked until authority arrives.
 */
export const WAITING_FOR_AUTHORITY_ROUTES: { route: string; reason: string }[] = [
  { route: '/bldr', reason: 'BLDR hub / build-process page — not in this pack.' },
  { route: '/bldr/start', reason: 'BLDR direction entry — not in this pack.' },
  { route: '/bldr/:classSlug/*', reason: 'BLDR assessment / intake steps — additional Builder pages pending.' },
  { route: '/evolve', reason: 'EVOLVE hub (long marketing page) — not in this pack.' },
  { route: '/evolve/:pathSlug/*', reason: 'EVOLVE assessment steps — additional Evolve pages pending.' },
  { route: '/evolve/marketing/*', reason: 'EVOLVE marketing services — not in this pack.' },
  { route: '/idnty/:state/complete', reason: 'IDNTY completion — no authority supplied.' },
  { route: '/idnty/:state/discovery-result', reason: 'IDNTY discovery result — no authority supplied.' },
  { route: '/origin/sign-in', reason: 'Auth — no authority supplied.' },
  { route: '/origin/create-account', reason: 'Auth — no authority supplied.' },
  { route: '/sites', reason: 'Locations child page — no authority supplied.' },
  { route: '/services', reason: 'Locations child page — no authority supplied.' },
  { route: '/system', reason: 'Locations child page — no authority supplied.' },
  { route: '/about', reason: 'Locations child page — no authority supplied.' },
  { route: '/journal', reason: 'Locations child page — no authority supplied.' },
  { route: '/checkout/*', reason: 'Checkout pages — authority arrives in a later pack; do not invent.' },
];
