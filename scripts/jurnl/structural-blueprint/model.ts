/**
 * JURNL STRUCTURAL BLUEPRINT — forensic model (P0.JURNL.COMPLETE-PRODUCT-BLUEPRINT-STRUCTURAL-COMPLETION-FORENSIC1).
 *
 * F01–F04 nodes are NOT authored here: build.ts reads them from the live family contracts
 * (src/projects/jurnl/data/f0x/contract.ts) and the F01/F02 screen data. This file holds what the repo
 * does not encode yet: the canonical F05–F16 trees, global systems, data domains, primitives, icons,
 * blockers, waves and founder flags. Every authored node carries the evidence it was derived from.
 *
 * Criteria string: 12 tokens, in order, R U D I S V E M L P A N =
 *   R route/invocation · U UI shell · D data contract · I core interaction · S state transitions · V validation ·
 *   E error · M empty · L loading · P responsive · A accessibility semantics · N navigation return path.
 * Values: 1 met · h half (partial) · 0 missing · - not applicable.
 */

export type NodeType =
  | 'FAMILY_PARENT'
  | 'CHILD_PAGE'
  | 'GRANDCHILD_PAGE'
  | 'DRAWER'
  | 'SHEET'
  | 'MODAL'
  | 'OVERLAY'
  | 'STATE'
  | 'INTERACTION'
  | 'GLOBAL_NAV'
  | 'GLOBAL_SYSTEM'
  | 'SHARED_COMPONENT'
  | 'DATA_DOMAIN'
  | 'BACKGROUND_PROCESS'
  | 'AI_SURFACE';

export type StructuralForm = 'ROUTE' | 'DRAWER' | 'SHEET' | 'MODAL' | 'INLINE_STATE' | 'EXPANDED_STATE' | 'OVERLAY' | 'BACKGROUND_FLOW';
export type IxStatus = 'WORKING' | 'PARTIAL' | 'NO_OP' | 'VISUAL_ONLY' | 'MISSING' | 'BROKEN' | 'LEGACY';
export type GapClass =
  | 'COMPLETE_FUNCTIONAL'
  | 'PARTIAL_FUNCTIONAL'
  | 'STRUCTURE_ONLY'
  | 'VISUAL_ONLY'
  | 'PLACEHOLDER'
  | 'MISSING'
  | 'DUPLICATED'
  | 'LEGACY'
  | 'ORPHANED';
export type Wave = 0 | 1 | 2 | 3 | 4 | 5;

export const FAMILY_CANON = [
  ['F01', 'ENTRY'],
  ['F02', 'SETUP'],
  ['F03', 'TODAY'],
  ['F04', 'ACTIVITY'],
  ['F05', 'MONEY'],
  ['F06', 'INCOME'],
  ['F07', 'UPCOMING'],
  ['F08', 'PLAN'],
  ['F09', 'SAFE TO SPEND'],
  ['F10', 'PURCHASES'],
  ['F11', 'TRIPS'],
  ['F12', 'CREDIT'],
  ['F13', 'PAYDOWN'],
  ['F14', 'GOALS'],
  ['F15', 'AHEAD'],
  ['F16', 'RECORDS'],
] as const;

/* ───────────────────────── authored family trees (F05–F16) ───────────────────────── */

export type AuthoredChild = {
  id: string;
  form: StructuralForm;
  route?: string;
  parentId?: string;
  purpose: string;
  reachedFrom: string[];
  wave: Wave;
};
export type AuthoredSurface = { id: string; type: 'SHEET' | 'DRAWER' | 'MODAL'; name: string; purpose: string; openedBy: string; writes?: string[]; wave: Wave };
export type AuthoredState = { id: string; name: string; purpose: string; wave: Wave };
export type AuthoredIx = { id: string; name: string; purpose: string; status: IxStatus; opens?: string; wave: Wave; evidence?: string };

export type AuthoredFamily = {
  id: string;
  productJob: string;
  owns: string[];
  reads: string[];
  writes: string[];
  globalSystems: string[];
  wave: Wave;
  children: AuthoredChild[];
  surfaces: AuthoredSurface[];
  states: AuthoredState[];
  interactions: AuthoredIx[];
  parentContract: { primaryAction: string; secondaryAction: string; links: string[] };
  boundaries: string[];
  extension: string | null;
  founderFlags: string[];
};

const commonIx = (f: string): AuthoredIx[] => [
  { id: `${f}.IN.QUICK_ADD`, name: 'QUICK ADD', purpose: 'SHARED ADD SHEET FROM THE CENTER NAV ITEM.', status: 'WORKING', opens: 'GLOBAL.SH.QUICK_ADD', wave: 0, evidence: 'ParentScreens.tsx mounts quick-add overlay from JurnlProductNav.' },
  { id: `${f}.IN.ASK`, name: 'ASK JURNL', purpose: 'SHARED EXPLANATION SHEET WITH THIS FAMILY AS CONTEXT.', status: 'MISSING', opens: 'GLOBAL.SH.ASK', wave: 1, evidence: 'ParentAuthorityScreen has no ask overlay.' },
  { id: `${f}.NAV.TODAY`, name: 'TODAY', purpose: 'RETURN TO THE DAILY HOME.', status: 'WORKING', wave: 0, evidence: 'ParentScreens.tsx chrome utility button TODAY → go(F03).' },
  { id: `${f}.REVIEW.BOARD`, name: 'BOARD', purpose: 'DESIGN-REVIEW CHROME. NOT PRODUCT NAVIGATION. REMOVE FROM THE PRODUCT BUILD.', status: 'LEGACY', wave: 5, evidence: 'ParentScreens.tsx chrome utility button BOARD → parents review board.' },
];
const commonStates = (f: string, empty: [string, string, string], wave: Wave): AuthoredState[] => [
  { id: `${f}.ST.LOADING`, name: 'LOADING', purpose: 'THE FAMILY IS BEING READ FROM THE REPOSITORY.', wave },
  { id: `${f}.ST.${empty[0]}`, name: empty[1], purpose: empty[2], wave },
  { id: `${f}.ST.ERROR`, name: 'ERROR', purpose: 'THE FAMILY COULD NOT BE READ. RETRY, NEVER A DEAD END.', wave },
];

export const AUTHORED_FAMILIES: AuthoredFamily[] = [
  {
    id: 'F05',
    productJob: 'SHOW THE FINANCIAL LANDSCAPE: WHAT IS HELD, WHERE IT SITS, AND HOW IT IS ORGANIZED.',
    owns: ['DD.ACCOUNTS'],
    reads: ['DD.TRANSACTIONS', 'DD.CREDIT_ATTRIBUTES', 'DD.CURRENCY'],
    writes: ['DD.TRANSACTIONS'],
    globalSystems: ['GS.BOTTOM_NAV', 'GS.TOP_CHROME', 'GS.QUICK_ADD', 'GS.ASK_JURNL', 'GS.MONEY_FORMAT', 'GS.FORM_SYSTEM', 'GS.ACCOUNT_REGISTRY', 'GS.STATE_PATTERNS'],
    wave: 2,
    children: [
      { id: 'F05.ACCOUNTS', form: 'ROUTE', route: 'money/places', purpose: 'EVERY PLACE MONEY SITS, GROUPED BY KIND (CASH, SAVINGS, CARD, LOAN, HELD).', reachedFrom: ['F05.00'], wave: 2 },
      { id: 'F05.ACCOUNT', form: 'ROUTE', route: 'money/places/:placeId', purpose: 'ONE PLACE: BALANCE AS OF A DATE, KIND, RECENT MOVEMENTS (READ FROM F04), EDIT.', reachedFrom: ['F05.ACCOUNTS', 'F05.00'], wave: 2 },
    ],
    surfaces: [
      { id: 'F05.SH.ADD_PLACE', type: 'SHEET', name: 'ADD A PLACE', purpose: 'NAME, KIND, BALANCE, AS-OF DATE. MANUAL-FIRST.', openedBy: 'F05.IN.ADD', writes: ['DD.ACCOUNTS'], wave: 2 },
      { id: 'F05.SH.EDIT_PLACE', type: 'SHEET', name: 'EDIT A PLACE', purpose: 'RENAME, UPDATE BALANCE, ARCHIVE.', openedBy: 'F05.IN.EDIT', writes: ['DD.ACCOUNTS'], wave: 2 },
      { id: 'F05.MD.REMOVE_PLACE', type: 'MODAL', name: 'REMOVE A PLACE', purpose: 'DESTRUCTIVE CONFIRM. MOVEMENTS STAY IN THE LEDGER, UNLINKED.', openedBy: 'F05.IN.REMOVE', writes: ['DD.ACCOUNTS'], wave: 2 },
      { id: 'F05.SH.MOVE', type: 'SHEET', name: 'MOVE BETWEEN PLACES', purpose: 'RECORD A TRANSFER. WRITES ONE TRANSFER MOVEMENT TO THE LEDGER.', openedBy: 'F05.IX.MOVE', writes: ['DD.TRANSACTIONS'], wave: 2 },
    ],
    states: [...commonStates('F05', ['EMPTY', 'EMPTY', 'NOTHING IS PLACED YET.'], 2), { id: 'F05.ST.STALE', name: 'STALE', purpose: 'A BALANCE IS OLDER THAN ITS AS-OF WINDOW.', wave: 2 }],
    interactions: [
      { id: 'F05.IN.PRIMARY', name: 'OPEN A PLACE', purpose: 'OPENS F05.ACCOUNTS.', status: 'WORKING', opens: 'F05.ACCOUNTS', wave: 2, evidence: 'MoneyScreens money/places route.' },
      { id: 'F05.IN.OPEN_PLACE', name: 'OPEN ONE PLACE', purpose: 'OPENS F05.ACCOUNT FROM THE LIST OR LANDSCAPE.', status: 'WORKING', opens: 'F05.ACCOUNT', wave: 2, evidence: 'money/places/:placeId detail.' },
      { id: 'F05.IN.ADD', name: 'ADD A PLACE', purpose: 'OPENS F05.SH.ADD_PLACE.', status: 'WORKING', opens: 'F05.SH.ADD_PLACE', wave: 2, evidence: 'AddPlaceSheet + createManualAccount.' },
      { id: 'F05.IN.EDIT', name: 'EDIT A PLACE', purpose: 'OPENS F05.SH.EDIT_PLACE.', status: 'WORKING', opens: 'F05.SH.EDIT_PLACE', wave: 2, evidence: 'EditPlaceSheet upsertAccount.' },
      { id: 'F05.IN.REMOVE', name: 'REMOVE A PLACE', purpose: 'OPENS F05.MD.REMOVE_PLACE.', status: 'WORKING', opens: 'F05.MD.REMOVE_PLACE', wave: 2, evidence: 'archiveAccount confirmation.' },
      { id: 'F05.IX.MOVE', name: 'MOVE', purpose: 'EXPRESSION-TREE INTERACTION. OPENS F05.SH.MOVE.', status: 'MISSING', opens: 'F05.SH.MOVE', wave: 2, evidence: 'F05_EXPRESSION_TREE F05.IX.MOVE "Closed in this sprint."' },
      { id: 'F05.IN.OPEN_INCOME', name: 'INCOME', purpose: 'DISCOVERY LINK TO F06 FROM THE MONEY HUB.', status: 'MISSING', opens: 'F06.00', wave: 1 },
      { id: 'F05.IN.OPEN_RECORDS', name: 'RECORDS', purpose: 'DISCOVERY LINK TO F16 FROM THE MONEY HUB.', status: 'MISSING', opens: 'F16.00', wave: 1 },
      ...commonIx('F05'),
    ],
    parentContract: { primaryAction: 'OPEN A PLACE', secondaryAction: 'ADD A PLACE', links: ['F05.ACCOUNTS', 'F06.00', 'F16.00', 'F12.00 (CARD/LOAN PLACES)'] },
    boundaries: [
      'F05 OWNS THE ACCOUNT REGISTRY (EVERY PLACE, INCLUDING CARDS AND LOANS AS LIABILITY PLACES).',
      'F12 OWNS CREDIT-SPECIFIC ATTRIBUTES (LIMIT, UTILIZATION, APR, STATEMENT/DUE DAY) ON CARD/LOAN PLACES; IT DOES NOT KEEP A SECOND ACCOUNT LIST.',
      'F13 OWNS THE PAYOFF PLAN; IT READS LIABILITY BALANCES FROM F05 AND TERMS FROM F12.',
      'F16 OWNS DOCUMENTS (STATEMENTS); F05 LINKS TO THEM, NEVER STORES FILES.',
      'F04 OWNS MOVEMENTS. F05.SH.MOVE WRITES A TRANSFER MOVEMENT THROUGH THE LEDGER CONTRACT.',
    ],
    extension: 'BUSINESS_CASH_FLOW / BUSINESS_PNL READ F05 (JURNL BUSINESS EXTENSION, SERVER-ENFORCED).',
    founderFlags: ['FF.BANK_AGGREGATION'],
  },
  {
    id: 'F06',
    productJob: 'SHOW WHAT IS COMING IN, AND FROM WHERE.',
    owns: ['DD.INCOME_SOURCES'],
    reads: ['DD.TRANSACTIONS', 'DD.ACCOUNTS', 'DD.SETUP_PROFILE'],
    writes: [],
    globalSystems: ['GS.BOTTOM_NAV', 'GS.TOP_CHROME', 'GS.QUICK_ADD', 'GS.ASK_JURNL', 'GS.MONEY_FORMAT', 'GS.DATE_MODEL', 'GS.FORM_SYSTEM', 'GS.STATE_PATTERNS', 'GS.FAMILY_DISCOVERY'],
    wave: 2,
    children: [
      { id: 'F06.SOURCES', form: 'EXPANDED_STATE', purpose: 'THE FULL LIST OF SOURCES ON THE PARENT (THE PARENT SIGNAL ALREADY COUNTS THEM).', reachedFrom: ['F06.00'], wave: 2 },
      { id: 'F06.SOURCE', form: 'ROUTE', route: 'income/:sourceId', purpose: 'ONE SOURCE: CADENCE, EXPECTED AMOUNT, ACCOUNT, ARRIVALS MATCHED FROM THE LEDGER.', reachedFrom: ['F06.00'], wave: 2 },
    ],
    surfaces: [
      { id: 'F06.SH.ADD_SOURCE', type: 'SHEET', name: 'ADD A SOURCE', purpose: 'NAME, CADENCE, EXPECTED AMOUNT, NEXT DATE, ACCOUNT.', openedBy: 'F06.IN.ADD', writes: ['DD.INCOME_SOURCES'], wave: 2 },
      { id: 'F06.SH.EDIT_SOURCE', type: 'SHEET', name: 'EDIT A SOURCE', purpose: 'CHANGE CADENCE, AMOUNT, ACCOUNT. MARK VARIABLE.', openedBy: 'F06.IN.EDIT', writes: ['DD.INCOME_SOURCES'], wave: 2 },
      { id: 'F06.MD.REMOVE_SOURCE', type: 'MODAL', name: 'REMOVE A SOURCE', purpose: 'DESTRUCTIVE CONFIRM. PAST ARRIVALS STAY IN THE LEDGER.', openedBy: 'F06.IN.REMOVE', writes: ['DD.INCOME_SOURCES'], wave: 2 },
      { id: 'F06.SH.PATTERN', type: 'SHEET', name: 'PATTERN', purpose: 'HOW A SOURCE HAS ARRIVED: STEADY OR VARIED. READ-ONLY.', openedBy: 'F06.IX.PATTERN', wave: 2 },
    ],
    states: [...commonStates('F06', ['EMPTY', 'EMPTY', 'NO SOURCE IS NAMED.'], 2)],
    interactions: [
      { id: 'F06.IN.PRIMARY', name: 'READ A SOURCE', purpose: 'OPENS F06.SOURCE.', status: 'WORKING', opens: 'F06.SOURCE', wave: 2, evidence: 'IncomeScreens income/:sourceId.' },
      { id: 'F06.IN.ADD', name: 'ADD A SOURCE', purpose: 'OPENS F06.SH.ADD_SOURCE.', status: 'WORKING', opens: 'F06.SH.ADD_SOURCE', wave: 2, evidence: 'AddIncomeSheet + repository incomeSources.' },
      { id: 'F06.IN.EDIT', name: 'EDIT A SOURCE', purpose: 'OPENS F06.SH.EDIT_SOURCE.', status: 'WORKING', opens: 'F06.SH.EDIT_SOURCE', wave: 2, evidence: 'EditIncomeSheet.' },
      { id: 'F06.IN.REMOVE', name: 'REMOVE A SOURCE', purpose: 'OPENS F06.MD.REMOVE_SOURCE.', status: 'WORKING', opens: 'F06.MD.REMOVE_SOURCE', wave: 2, evidence: 'deleteIncomeSource archive.' },
      { id: 'F06.IX.PATTERN', name: 'PATTERN', purpose: 'EXPRESSION-TREE INTERACTION. OPENS F06.SH.PATTERN.', status: 'MISSING', opens: 'F06.SH.PATTERN', wave: 2 },
      ...commonIx('F06'),
    ],
    parentContract: { primaryAction: 'READ A SOURCE', secondaryAction: 'ADD A SOURCE', links: ['F06.SOURCE', 'F04.00 (ARRIVALS)', 'F15.00 (WHAT IT MEANS AHEAD)'] },
    boundaries: [
      'F06 OWNS EXPECTED INCOME (SOURCES, CADENCE, EXPECTED AMOUNT). ACTUAL ARRIVALS ARE F04 MOVEMENTS.',
      'F07 OWNS WHAT LEAVES ON A SCHEDULE; F06 NEVER LISTS OBLIGATIONS.',
      'F08 READS EXPECTED INCOME TO ARRANGE IT; F06 DOES NOT ALLOCATE.',
      'F15 PROJECTS INCOME FORWARD; F06 SHOWS THE NEAR PATTERN ONLY.',
      'F02.03 SEEDS ONE CADENCE + AMOUNT; F06 BECOMES ITS OWNER AFTER SETUP.',
    ],
    extension: null,
    founderFlags: [],
  },
  {
    id: 'F07',
    productJob: 'SHOW WHAT IS APPROACHING, AND WHEN.',
    owns: ['DD.OBLIGATIONS'],
    reads: ['DD.ACCOUNTS', 'DD.TRANSACTIONS', 'DD.SETUP_PROFILE'],
    writes: ['DD.TRANSACTIONS'],
    globalSystems: ['GS.BOTTOM_NAV', 'GS.TOP_CHROME', 'GS.QUICK_ADD', 'GS.ASK_JURNL', 'GS.MONEY_FORMAT', 'GS.DATE_MODEL', 'GS.FORM_SYSTEM', 'GS.STATE_PATTERNS', 'GS.FAMILY_DISCOVERY'],
    wave: 2,
    children: [
      { id: 'F07.SEQUENCE', form: 'EXPANDED_STATE', purpose: 'THE LONGER SEQUENCE: NEXT, THEN, LATER. A SEQUENCE, NOT A GENERIC CALENDAR.', reachedFrom: ['F07.00'], wave: 2 },
      { id: 'F07.ITEM', form: 'ROUTE', route: 'upcoming/:itemId', purpose: 'ONE OBLIGATION: AMOUNT, DUE DATE, CADENCE, ACCOUNT, BILL OR SUBSCRIPTION, MARK PAID / SKIP ONCE.', reachedFrom: ['F07.00', 'F03.00'], wave: 2 },
    ],
    surfaces: [
      { id: 'F07.SH.ADD_ITEM', type: 'SHEET', name: 'ADD WHAT REPEATS', purpose: 'NAME, AMOUNT, CADENCE, NEXT DUE DATE, ACCOUNT, KIND.', openedBy: 'F07.IN.ADD', writes: ['DD.OBLIGATIONS'], wave: 2 },
      { id: 'F07.SH.EDIT_ITEM', type: 'SHEET', name: 'EDIT AN OBLIGATION', purpose: 'CHANGE AMOUNT, CADENCE, DATE, ACCOUNT.', openedBy: 'F07.IN.EDIT', writes: ['DD.OBLIGATIONS'], wave: 2 },
      { id: 'F07.MD.REMOVE_ITEM', type: 'MODAL', name: 'END AN OBLIGATION', purpose: 'DESTRUCTIVE CONFIRM. PAST PAYMENTS STAY IN THE LEDGER.', openedBy: 'F07.IN.REMOVE', writes: ['DD.OBLIGATIONS'], wave: 2 },
      { id: 'F07.SH.WHEN', type: 'SHEET', name: 'WHEN', purpose: 'TIMING: SHIFT A DUE DATE OR SKIP ONE OCCURRENCE.', openedBy: 'F07.IX.WHEN', writes: ['DD.OBLIGATIONS'], wave: 2 },
    ],
    states: [...commonStates('F07', ['CLEAR', 'CLEAR', 'NOTHING IS APPROACHING.'], 2), { id: 'F07.ST.OVERDUE', name: 'OVERDUE', purpose: 'A DUE DATE PASSED WITHOUT A MATCHING PAYMENT. NAMED, NOT ALARMED.', wave: 2 }],
    interactions: [
      { id: 'F07.IN.PRIMARY', name: 'OPEN THE NEXT', purpose: 'OPENS F07.ITEM FOR THE NEXT OBLIGATION.', status: 'WORKING', opens: 'F07.ITEM', wave: 2, evidence: 'UpcomingScreens upcoming/:itemId.' },
      { id: 'F07.IN.ADD', name: 'ADD WHAT REPEATS', purpose: 'OPENS F07.SH.ADD_ITEM.', status: 'WORKING', opens: 'F07.SH.ADD_ITEM', wave: 2, evidence: 'AddObligationSheet.' },
      { id: 'F07.IN.EDIT', name: 'EDIT', purpose: 'OPENS F07.SH.EDIT_ITEM.', status: 'WORKING', opens: 'F07.SH.EDIT_ITEM', wave: 2, evidence: 'EditObligationSheet.' },
      { id: 'F07.IN.REMOVE', name: 'END IT', purpose: 'OPENS F07.MD.REMOVE_ITEM.', status: 'WORKING', opens: 'F07.MD.REMOVE_ITEM', wave: 2, evidence: 'deleteObligation.' },
      { id: 'F07.IN.MARK_PAID', name: 'MARK PAID', purpose: 'WRITES A PAYMENT MOVEMENT AND ADVANCES THE NEXT DUE DATE.', status: 'MISSING', wave: 2 },
      { id: 'F07.IX.WHEN', name: 'WHEN', purpose: 'EXPRESSION-TREE INTERACTION. OPENS F07.SH.WHEN.', status: 'MISSING', opens: 'F07.SH.WHEN', wave: 2 },
      ...commonIx('F07'),
    ],
    parentContract: { primaryAction: 'OPEN THE NEXT', secondaryAction: 'ADD WHAT REPEATS', links: ['F07.ITEM', 'F04.00 (PAID MOVEMENTS)', 'F09.00 (WHAT IS SET ASIDE)'] },
    boundaries: [
      'F07 IS NEAR-TERM AND ITEM-LEVEL (WHAT IS DUE, WHEN). IT IS NOT A GENERIC CALENDAR AND NOT A FORECAST.',
      'F15 OWNS THE LONG PROJECTION; IT READS F07 OBLIGATIONS AS INPUTS.',
      'F03 SHOWS THE NEXT TWO ITEMS (COMING); DEPTH LIVES IN F07.',
      'F04 HOLDS THE PAYMENT MOVEMENT; A BILL OR SUBSCRIPTION STAYS RELATED CONTEXT ON THE MOVEMENT (F04_SCREEN_TREE).',
      'F02.04 SEEDS NAME + CADENCE ONLY. F07 MUST CAPTURE THE AMOUNT AND DUE DATE (FIXES THE $0 OBLIGATION DEFECT).',
    ],
    extension: null,
    founderFlags: ['FF.NOTIFICATIONS'],
  },
  {
    id: 'F08',
    productJob: 'HELP THE USER ARRANGE MONEY BEFORE IT MOVES.',
    owns: ['DD.PLAN_ALLOCATIONS'],
    reads: ['DD.INCOME_SOURCES', 'DD.OBLIGATIONS', 'DD.GOALS', 'DD.PROTECTED_HOLD', 'DD.SETUP_PROFILE'],
    writes: [],
    globalSystems: ['GS.BOTTOM_NAV', 'GS.TOP_CHROME', 'GS.QUICK_ADD', 'GS.ASK_JURNL', 'GS.MONEY_FORMAT', 'GS.FORM_SYSTEM', 'GS.STATE_PATTERNS', 'GS.FAMILY_DISCOVERY', 'GS.ENTITLEMENTS'],
    wave: 3,
    children: [
      { id: 'F08.ARRANGE', form: 'EXPANDED_STATE', purpose: 'THE FULLER ARRANGEMENT: ORDER AND AMOUNT PER INTENTION, ON THE PARENT.', reachedFrom: ['F08.00'], wave: 3 },
      { id: 'F08.ITEM', form: 'ROUTE', route: 'plan/:intentionId', purpose: 'ONE INTENTION: AMOUNT ASSIGNED, WHAT IT SERVES (OBLIGATION, GOAL, BUFFER), HISTORY.', reachedFrom: ['F08.00'], wave: 3 },
    ],
    surfaces: [
      { id: 'F08.SH.ASSIGN', type: 'SHEET', name: 'ASSIGN', purpose: 'ASSIGN AN AMOUNT TO AN INTENTION. CANNOT EXCEED WHAT ARRIVES.', openedBy: 'F08.IX.ASSIGN', writes: ['DD.PLAN_ALLOCATIONS'], wave: 3 },
      { id: 'F08.SH.ADD_INTENTION', type: 'SHEET', name: 'ADD AN INTENTION', purpose: 'NAME AN INTENTION OR PICK FROM THE SETUP PRIORITIES.', openedBy: 'F08.IN.ADD', writes: ['DD.PLAN_ALLOCATIONS'], wave: 3 },
      { id: 'F08.MD.REMOVE_INTENTION', type: 'MODAL', name: 'REMOVE AN INTENTION', purpose: 'DESTRUCTIVE CONFIRM. FREES ITS AMOUNT.', openedBy: 'F08.IN.REMOVE', writes: ['DD.PLAN_ALLOCATIONS'], wave: 3 },
    ],
    states: [...commonStates('F08', ['EMPTY', 'EMPTY', 'NOTHING IS ARRANGED.'], 3), { id: 'F08.ST.OVER_ASSIGNED', name: 'OVER ASSIGNED', purpose: 'MORE IS ASSIGNED THAN ARRIVES. A VALIDATION STATE, NOT A SCOLD.', wave: 3 }],
    interactions: [
      { id: 'F08.IN.PRIMARY', name: 'MOVE A PIECE', purpose: 'OPENS F08.ITEM.', status: 'WORKING', opens: 'F08.ITEM', wave: 3, evidence: 'PlanScreens row → plan/:intentionId.' },
      { id: 'F08.IN.ADD', name: 'ADD AN INTENTION', purpose: 'OPENS F08.SH.ADD_INTENTION.', status: 'WORKING', opens: 'F08.SH.ADD_INTENTION', wave: 3 },
      { id: 'F08.IN.REMOVE', name: 'REMOVE', purpose: 'OPENS F08.MD.REMOVE_INTENTION.', status: 'WORKING', opens: 'F08.MD.REMOVE_INTENTION', wave: 3 },
      { id: 'F08.IN.REORDER', name: 'REORDER', purpose: 'CHANGE WHICH INTENTION IS SERVED FIRST.', status: 'MISSING', wave: 3 },
      { id: 'F08.IX.ASSIGN', name: 'ASSIGN', purpose: 'EXPRESSION-TREE INTERACTION. OPENS F08.SH.ASSIGN.', status: 'WORKING', opens: 'F08.SH.ASSIGN', wave: 3 },
      { id: 'F08.IN.OPEN_SAFE', name: 'SAFE TO SPEND', purpose: 'DISCOVERY LINK TO F09 FROM THE PLAN HUB.', status: 'WORKING', opens: 'F09.00', wave: 1 },
      { id: 'F08.IN.OPEN_PURCHASES', name: 'PURCHASES', purpose: 'DISCOVERY LINK TO F10.', status: 'MISSING', opens: 'F10.00', wave: 1 },
      { id: 'F08.IN.OPEN_TRIPS', name: 'TRIPS', purpose: 'DISCOVERY LINK TO F11.', status: 'MISSING', opens: 'F11.00', wave: 1 },
      { id: 'F08.IN.OPEN_GOALS', name: 'GOALS', purpose: 'DISCOVERY LINK TO F14.', status: 'WORKING', opens: 'F14.00', wave: 1 },
      { id: 'F08.IN.OPEN_AHEAD', name: 'AHEAD', purpose: 'DISCOVERY LINK TO F15.', status: 'MISSING', opens: 'F15.00', wave: 1 },
      ...commonIx('F08'),
    ],
    parentContract: { primaryAction: 'MOVE A PIECE', secondaryAction: 'ADD AN INTENTION', links: ['F08.ITEM', 'F09.00', 'F10.00', 'F11.00', 'F14.00', 'F15.00'] },
    boundaries: [
      'F08 OWNS INTENTIONS AND ASSIGNED AMOUNTS (BASIC BUDGETING). IT DOES NOT COMPUTE SAFE TO SPEND.',
      'F09 DERIVES THE SPENDABLE SIGNAL FROM F08 ASSIGNMENTS + F07 + F09 HOLD.',
      'F14 OWNS GOALS; AN INTENTION MAY SERVE A GOAL BY REFERENCE.',
      'F15 OWNS SCENARIOS ACROSS TIME; F08 IS THE CURRENT ARRANGEMENT (ADVANCED_SCENARIOS IS A SERVER-ENFORCED CAPABILITY).',
      'F02.05 SEEDS UP TO THREE PRIORITIES; F08 BECOMES THEIR OWNER.',
    ],
    extension: null,
    founderFlags: ['FF.DISCOVERY_HUBS'],
  },
  {
    id: 'F09',
    productJob: 'GIVE A CLEAR SIGNAL AFTER OBLIGATIONS AND INTENTIONS.',
    owns: ['DD.PROTECTED_HOLD', 'DD.SAFE_TO_SPEND'],
    reads: ['DD.ACCOUNTS', 'DD.TRANSACTIONS', 'DD.OBLIGATIONS', 'DD.PLAN_ALLOCATIONS', 'DD.INCOME_SOURCES'],
    writes: [],
    globalSystems: ['GS.BOTTOM_NAV', 'GS.TOP_CHROME', 'GS.QUICK_ADD', 'GS.ASK_JURNL', 'GS.MONEY_FORMAT', 'GS.DATE_MODEL', 'GS.FORM_SYSTEM', 'GS.STATE_PATTERNS', 'GS.FAMILY_DISCOVERY'],
    wave: 3,
    children: [
      { id: 'F09.WHY', form: 'ROUTE', route: 'safe/why', purpose: 'THE FULL FACTOR READING: CASH, WHAT IS DUE BEFORE NEXT INCOME, ASSIGNED, HELD, EACH WITH ITS SOURCE.', reachedFrom: ['F09.00', 'F03.SEE_WHY'], wave: 3 },
      { id: 'F09.HOLD', form: 'SHEET', purpose: 'WHAT IS HELD BACK: SET OR CHANGE THE PROTECTED AMOUNT.', reachedFrom: ['F09.00'], wave: 3 },
    ],
    surfaces: [{ id: 'F09.MD.HOLD_CONFIRM', type: 'MODAL', name: 'CONFIRM THE HOLD', purpose: 'EXPRESSION-TREE CONFIRMATION FOR A CHANGED HOLD.', openedBy: 'F09.IX.HOLD', writes: ['DD.PROTECTED_HOLD'], wave: 3 }],
    states: [
      ...commonStates('F09', ['UNSTATED', 'UNSTATED', 'THE SIGNAL CANNOT BE SAID YET (NO CASH PLACE OR NO OBLIGATIONS KNOWN).'], 3),
      { id: 'F09.ST.BELOW_ZERO', name: 'BELOW ZERO', purpose: 'OBLIGATIONS EXCEED CASH. SAID PLAINLY, NOT SHAMED.', wave: 3 },
    ],
    interactions: [
      { id: 'F09.IN.PRIMARY', name: 'SEE THE HOLD', purpose: 'OPENS F09.WHY.', status: 'WORKING', opens: 'F09.WHY', wave: 3, evidence: 'SafeToSpendScreens safe/why route.' },
      { id: 'F09.IN.OPEN_HOLD', name: 'CHANGE THE HOLD', purpose: 'OPENS F09.HOLD.', status: 'WORKING', opens: 'F09.HOLD', wave: 3 },
      { id: 'F09.IX.HOLD', name: 'HOLD', purpose: 'EXPRESSION-TREE INTERACTION. CONFIRMS A CHANGED HOLD.', status: 'WORKING', opens: 'F09.MD.HOLD_CONFIRM', wave: 3 },
      ...commonIx('F09'),
    ],
    parentContract: { primaryAction: 'SEE THE HOLD', secondaryAction: 'CHANGE THE HOLD', links: ['F09.WHY', 'F07.00', 'F08.00', 'F03.00'] },
    boundaries: [
      'F09 IS A DERIVED DECISION SYSTEM. IT OWNS THE COMPUTATION AND THE PROTECTED HOLD, NOT THE INPUTS.',
      'F03 SHOWS THE SAME NUMBER (READ-ONLY) AND A SHORT SEE WHY SHEET; F09.WHY IS THE FULL READING. ONE FORMULA, ONE OWNER.',
      'INPUTS: CASH (F05 PLACES / F04 MOVEMENTS), DUE BEFORE NEXT INCOME (F07 + F06), ASSIGNED (F08), HELD (F09).',
      'F10 AND F11 ASK F09 "WHAT CHANGES" — THEY NEVER RECOMPUTE IT.',
      'F02.06 SEEDS THE PROTECTED AMOUNT; F09 BECOMES ITS OWNER.',
    ],
    extension: null,
    founderFlags: ['FF.SEE_WHY_VS_F09'],
  },
  {
    id: 'F10',
    productJob: 'HELP THE USER THINK ABOUT A SPECIFIC THING THEY WANT TO BUY.',
    owns: ['DD.PURCHASE_CONSIDERATIONS'],
    reads: ['DD.SAFE_TO_SPEND', 'DD.PLAN_ALLOCATIONS', 'DD.GOALS', 'DD.OBLIGATIONS'],
    writes: [],
    globalSystems: ['GS.BOTTOM_NAV', 'GS.TOP_CHROME', 'GS.QUICK_ADD', 'GS.ASK_JURNL', 'GS.MONEY_FORMAT', 'GS.DATE_MODEL', 'GS.FORM_SYSTEM', 'GS.STATE_PATTERNS', 'GS.FAMILY_DISCOVERY', 'GS.ENTITLEMENTS'],
    wave: 4,
    children: [
      { id: 'F10.OBJECT', form: 'ROUTE', route: 'purchases/:purchaseId', purpose: 'THE OBJECT STORY: WHAT IT IS, WHAT IT COSTS, WHEN IT IS WANTED, WHY.', reachedFrom: ['F10.00'], wave: 4 },
      { id: 'F10.DECISION', form: 'SHEET', purpose: 'WHAT THE PURCHASE CHANGES: SAFE TO SPEND AFTER, PLAN AND GOAL IMPACT, A VERDICT (NOW / WAIT / NOT YET). FINANCIALLY INDEPENDENT.', reachedFrom: ['F10.OBJECT', 'F10.00'], wave: 4 },
    ],
    surfaces: [
      { id: 'F10.SH.CONSIDER', type: 'SHEET', name: 'CONSIDER SOMETHING', purpose: 'NAME, PRICE, WHEN. NO LINKS, NO MERCHANTS (COMMERCE STAYS DISABLED).', openedBy: 'F10.IX.CONSIDER', writes: ['DD.PURCHASE_CONSIDERATIONS'], wave: 4 },
      { id: 'F10.MD.REMOVE_OBJECT', type: 'MODAL', name: 'LET IT GO', purpose: 'REMOVE A CONSIDERATION.', openedBy: 'F10.IN.REMOVE', writes: ['DD.PURCHASE_CONSIDERATIONS'], wave: 4 },
    ],
    states: [...commonStates('F10', ['NONE', 'NONE', 'NOTHING IS UNDER CONSIDERATION.'], 4)],
    interactions: [
      { id: 'F10.IN.PRIMARY', name: 'DECIDE', purpose: 'OPENS F10.DECISION.', status: 'WORKING', opens: 'F10.DECISION', wave: 4, evidence: 'PurchasesScreens decide drawer reads F09.' },
      { id: 'F10.IN.OPEN_OBJECT', name: 'OPEN THE OBJECT', purpose: 'OPENS F10.OBJECT.', status: 'WORKING', opens: 'F10.OBJECT', wave: 4, evidence: 'purchases/:purchaseId route.' },
      { id: 'F10.IX.CONSIDER', name: 'CONSIDER', purpose: 'EXPRESSION-TREE INTERACTION. OPENS F10.SH.CONSIDER.', status: 'WORKING', opens: 'F10.SH.CONSIDER', wave: 4, evidence: 'ConsiderSheet + createPurchase.' },
      { id: 'F10.IN.REMOVE', name: 'LET IT GO', purpose: 'OPENS F10.MD.REMOVE_OBJECT.', status: 'WORKING', opens: 'F10.MD.REMOVE_OBJECT', wave: 4, evidence: 'archivePurchase confirmation.' },
      { id: 'F10.IN.BOUGHT', name: 'I BOUGHT IT', purpose: 'CLOSES THE CONSIDERATION AND OPENS QUICK ADD PREFILLED.', status: 'WORKING', opens: 'GLOBAL.SH.QUICK_ADD', wave: 4, evidence: 'markPurchaseBought → addLedgerEntry + linked_transaction_id.' },
      ...commonIx('F10'),
    ],
    parentContract: { primaryAction: 'DECIDE', secondaryAction: 'CONSIDER SOMETHING', links: ['F10.OBJECT', 'F09.00', 'F14.00'] },
    boundaries: [
      'F10 IS NOT ECOMMERCE: NO CART, NO MERCHANT, NO PRICE COMPARISON (COMMERCE_* CAPABILITIES ARE DISABLED).',
      'THE VERDICT READS F09 (WHAT CHANGES) AND F14 (WHAT IT DELAYS); IT NEVER RECOMPUTES SAFE TO SPEND.',
      'A LARGE PURCHASE SAVED TOWARD OVER TIME IS AN F14 GOAL BY REFERENCE, NOT A SECOND SAVINGS SYSTEM.',
      'F11 OWNS TRIPS; A TRIP IS NEVER A PURCHASE.',
    ],
    extension: 'MAJOR PURCHASE PREP ADD-ON (ADVANCED_PURCHASE_ANALYSIS, SERVER-ENFORCED).',
    founderFlags: [],
  },
  {
    id: 'F11',
    productJob: 'MODEL A LIFE EVENT WITH MONEY ATTACHED.',
    owns: ['DD.TRIPS'],
    reads: ['DD.SAFE_TO_SPEND', 'DD.PLAN_ALLOCATIONS', 'DD.GOALS', 'DD.CURRENCY'],
    writes: [],
    globalSystems: ['GS.BOTTOM_NAV', 'GS.TOP_CHROME', 'GS.QUICK_ADD', 'GS.ASK_JURNL', 'GS.MONEY_FORMAT', 'GS.DATE_MODEL', 'GS.FORM_SYSTEM', 'GS.STATE_PATTERNS', 'GS.FAMILY_DISCOVERY', 'GS.ENTITLEMENTS'],
    wave: 4,
    children: [
      { id: 'F11.TRIP', form: 'ROUTE', route: 'trips/:tripId', purpose: 'THE TRIP STORY: DESTINATION, DATES, COST LINES, WHAT IS FUNDED.', reachedFrom: ['F11.00'], wave: 4 },
      { id: 'F11.FUNDING', form: 'SHEET', purpose: 'HOW IT IS FUNDED: AMOUNT PER PERIOD, FROM WHERE, BY WHEN. ALSO THE IX.ALLOCATE SHEET.', reachedFrom: ['F11.TRIP', 'F11.00'], wave: 4 },
    ],
    surfaces: [
      { id: 'F11.SH.TRIP_EDIT', type: 'SHEET', name: 'NAME A TRIP', purpose: 'CREATE OR EDIT: DESTINATION, DATES, COST LINES.', openedBy: 'F11.IN.ADD', writes: ['DD.TRIPS'], wave: 4 },
      { id: 'F11.MD.REMOVE_TRIP', type: 'MODAL', name: 'CANCEL THE TRIP', purpose: 'REMOVE A TRIP AND RELEASE ITS FUNDING.', openedBy: 'F11.IN.REMOVE', writes: ['DD.TRIPS'], wave: 4 },
    ],
    states: [...commonStates('F11', ['NONE', 'NONE', 'NO TRIP IS NAMED.'], 4)],
    interactions: [
      { id: 'F11.IN.PRIMARY', name: 'FUND THE TRIP', purpose: 'OPENS F11.FUNDING.', status: 'WORKING', opens: 'F11.FUNDING', wave: 4, evidence: 'FundingSheet reserved_amount → F09 tripReserved.' },
      { id: 'F11.IN.OPEN_TRIP', name: 'OPEN THE TRIP', purpose: 'OPENS F11.TRIP.', status: 'WORKING', opens: 'F11.TRIP', wave: 4, evidence: 'trips/:tripId route.' },
      { id: 'F11.IN.ADD', name: 'NAME A TRIP', purpose: 'OPENS F11.SH.TRIP_EDIT.', status: 'WORKING', opens: 'F11.SH.TRIP_EDIT', wave: 4, evidence: 'TripEditSheet + createTrip.' },
      { id: 'F11.IN.REMOVE', name: 'CANCEL', purpose: 'OPENS F11.MD.REMOVE_TRIP.', status: 'WORKING', opens: 'F11.MD.REMOVE_TRIP', wave: 4, evidence: 'archiveTrip confirmation.' },
      { id: 'F11.IX.ALLOCATE', name: 'ALLOCATE', purpose: 'EXPRESSION-TREE INTERACTION. OPENS F11.FUNDING.', status: 'WORKING', opens: 'F11.FUNDING', wave: 4, evidence: 'trip-fund trigger opens FundingSheet.' },
      ...commonIx('F11'),
    ],
    parentContract: { primaryAction: 'FUND THE TRIP', secondaryAction: 'NAME A TRIP', links: ['F11.TRIP', 'F09.00', 'F14.00'] },
    boundaries: [
      'F11 IS NOT A BOOKING APP: NO FARES, NO HOTELS, NO REFERRALS (TRAVEL_BOOKING_REFERRALS IS DISABLED).',
      'TRIP AFFORDABILITY READS F09; TRIP FUNDING IS AN F08-STYLE ASSIGNMENT SCOPED TO THE TRIP.',
      'A TRIP WITH A SAVING TARGET MAY REFERENCE AN F14 GOAL; F11 DOES NOT DUPLICATE GOAL PROGRESS.',
      'TRIP COSTS IN ANOTHER CURRENCY USE THE GLOBAL CURRENCY CONTRACT (BASE USD, NO CHAIN CONVERSION).',
    ],
    extension: 'TRAVEL ADD-ON (ADVANCED_TRIP_PLANNING, SERVER-ENFORCED).',
    founderFlags: [],
  },
  {
    id: 'F12',
    productJob: 'HELP THE USER UNDERSTAND CREDIT HEALTH, ACCOUNTS, UTILIZATION, AND ACTIONS.',
    owns: ['DD.CREDIT_ATTRIBUTES'],
    reads: ['DD.ACCOUNTS', 'DD.TRANSACTIONS', 'DD.OBLIGATIONS'],
    writes: [],
    globalSystems: ['GS.BOTTOM_NAV', 'GS.TOP_CHROME', 'GS.QUICK_ADD', 'GS.ASK_JURNL', 'GS.MONEY_FORMAT', 'GS.DATE_MODEL', 'GS.FORM_SYSTEM', 'GS.STATE_PATTERNS', 'GS.ACCOUNT_REGISTRY'],
    wave: 3,
    children: [
      { id: 'F12.ACCOUNTS', form: 'EXPANDED_STATE', purpose: 'THE CREDIT ACCOUNTS (CARD / LOAN PLACES FROM F05) WITH CREDIT ATTRIBUTES, ON THE PARENT.', reachedFrom: ['F12.00'], wave: 3 },
      { id: 'F12.ACCOUNT', form: 'ROUTE', route: 'credit/:accountId', purpose: 'ONE CREDIT ACCOUNT: LIMIT, USED, UTILIZATION, STATEMENT AND DUE DAY, APR.', reachedFrom: ['F12.00'], wave: 3 },
    ],
    surfaces: [
      { id: 'F12.SH.UTILIZATION', type: 'SHEET', name: 'UTILIZATION', purpose: 'A READING: USED OVER LIMIT, PER ACCOUNT AND OVERALL. NOT A SCORE DIAL.', openedBy: 'F12.IX.UTILIZATION', wave: 3 },
      { id: 'F12.SH.EDIT_TERMS', type: 'SHEET', name: 'CREDIT TERMS', purpose: 'LIMIT, APR, STATEMENT DAY, DUE DAY, MINIMUM PAYMENT.', openedBy: 'F12.IN.EDIT', writes: ['DD.CREDIT_ATTRIBUTES'], wave: 3 },
    ],
    states: [...commonStates('F12', ['QUIET', 'QUIET', 'NOTHING NEEDS ATTENTION.'], 3), { id: 'F12.ST.ATTENTION', name: 'ATTENTION', purpose: 'HIGH UTILIZATION OR A DUE DATE CLOSE. ONE QUIET LINE.', wave: 3 }],
    interactions: [
      { id: 'F12.IN.PRIMARY', name: 'OPEN AN ACCOUNT', purpose: 'OPENS F12.ACCOUNT.', status: 'WORKING', opens: 'F12.ACCOUNT', wave: 3, evidence: 'CreditScreens row → credit/:accountId.' },
      { id: 'F12.IN.EDIT', name: 'CREDIT TERMS', purpose: 'OPENS F12.SH.EDIT_TERMS.', status: 'WORKING', opens: 'F12.SH.EDIT_TERMS', wave: 3 },
      { id: 'F12.IN.ADD_ACCOUNT', name: 'ADD A CARD OR LOAN', purpose: 'OPENS F05.SH.ADD_PLACE PREFILLED WITH A CREDIT KIND. NO SECOND REGISTRY.', status: 'WORKING', opens: 'F05.SH.ADD_PLACE', wave: 3, evidence: 'createManualAccount CREDIT_CARD from F12 hub.' },
      { id: 'F12.IX.UTILIZATION', name: 'UTILIZATION', purpose: 'EXPRESSION-TREE INTERACTION. OPENS F12.SH.UTILIZATION.', status: 'WORKING', opens: 'F12.SH.UTILIZATION', wave: 3 },
      { id: 'F12.IN.OPEN_PAYDOWN', name: 'PAYDOWN', purpose: 'DISCOVERY LINK TO F13 FROM THE CREDIT HUB.', status: 'WORKING', opens: 'F13.00', wave: 1 },
      ...commonIx('F12'),
    ],
    parentContract: { primaryAction: 'OPEN AN ACCOUNT', secondaryAction: 'ADD A CARD OR LOAN', links: ['F12.ACCOUNT', 'F13.00', 'F05.ACCOUNTS'] },
    boundaries: [
      'F12 OWNS CREDIT ATTRIBUTES; F05 OWNS THE PLACE. ONE ACCOUNT RECORD, TWO VIEWS.',
      'NO CREDIT SCORE FEATURE IS DEFINED ("A QUIET WORD, NOT A GIANT SCORE"). A BUREAU SCORE NEEDS A FOUNDER DECISION AND A PROVIDER.',
      'F13 OWNS THE PATH DOWN; F12 SHOWS STATE, NOT STRATEGY (ADVANCED_CREDIT_PLANNING IS SERVER-ENFORCED).',
      'FINANCIAL_SERVICE_REFERRALS STAY DISABLED.',
    ],
    extension: 'PREMIUM CREDIT ADD-ON.',
    founderFlags: ['FF.CREDIT_SCORE_SOURCE'],
  },
  {
    id: 'F13',
    productJob: 'TURN DEBT REDUCTION INTO A VISIBLE, CONTROLLED PATH.',
    owns: ['DD.PAYOFF_PLANS'],
    reads: ['DD.ACCOUNTS', 'DD.CREDIT_ATTRIBUTES', 'DD.PLAN_ALLOCATIONS', 'DD.DATE_DERIVED'],
    writes: [],
    globalSystems: ['GS.BOTTOM_NAV', 'GS.TOP_CHROME', 'GS.QUICK_ADD', 'GS.ASK_JURNL', 'GS.MONEY_FORMAT', 'GS.DATE_MODEL', 'GS.FORM_SYSTEM', 'GS.STATE_PATTERNS', 'GS.FAMILY_DISCOVERY', 'GS.ENTITLEMENTS'],
    wave: 4,
    children: [
      { id: 'F13.PATH', form: 'EXPANDED_STATE', purpose: 'THE LONGER PATH: EACH DEBT, ITS BALANCE, ITS EXPECTED CLEAR DATE, ON THE PARENT.', reachedFrom: ['F13.00'], wave: 4 },
      { id: 'F13.WHAT_IF', form: 'ROUTE', route: 'paydown/what-if', purpose: 'A CHANGED PLAN: AN EXTRA AMOUNT OR A DIFFERENT ORDER, SIDE BY SIDE WITH THE CURRENT PATH.', reachedFrom: ['F13.00'], wave: 4 },
    ],
    surfaces: [
      { id: 'F13.SH.CHANGE', type: 'SHEET', name: 'CHANGE THE PATH', purpose: 'EXTRA AMOUNT PER PERIOD AND ORDER. SAVING IT REPLACES THE CURRENT PATH.', openedBy: 'F13.IX.CHANGE', writes: ['DD.PAYOFF_PLANS'], wave: 4 },
    ],
    states: [
      ...commonStates('F13', ['NONE', 'NONE', 'NO PATH IS SET.'], 4),
      { id: 'F13.ST.NO_DEBT', name: 'NOTHING OWED', purpose: 'NO LIABILITY PLACES. A QUIET POSITIVE STATE.', wave: 4 },
    ],
    interactions: [
      { id: 'F13.IN.PRIMARY', name: 'CHANGE THE PATH', purpose: 'OPENS F13.WHAT_IF.', status: 'WORKING', opens: 'F13.WHAT_IF', wave: 4, evidence: 'paydown/what-if route + simulation.' },
      { id: 'F13.IX.CHANGE', name: 'CHANGE', purpose: 'EXPRESSION-TREE INTERACTION. OPENS F13.SH.CHANGE.', status: 'WORKING', opens: 'F13.SH.CHANGE', wave: 4, evidence: 'ChangePathSheet upsertPaydownPlan.' },
      { id: 'F13.IN.KEEP', name: 'KEEP THIS PATH', purpose: 'ADOPTS THE WHAT-IF AS THE CURRENT PATH.', status: 'WORKING', wave: 4, evidence: 'PaydownWhatIfScreen keep → upsertPaydownPlan.' },
      ...commonIx('F13'),
    ],
    parentContract: { primaryAction: 'CHANGE THE PATH', secondaryAction: 'KEEP THIS PATH', links: ['F13.WHAT_IF', 'F12.00', 'F08.00'] },
    boundaries: [
      'F13 OWNS THE PAYOFF PLAN. BALANCES COME FROM F05 PLACES, TERMS FROM F12.',
      'NON-SHAMING: NO RED TOTALS, NO "BEHIND" LANGUAGE. A PATH, NOT A VERDICT.',
      'NO NAMED STRATEGY (AVALANCHE / SNOWBALL) IS DEFINED ANYWHERE; ADVANCED_DEBT_STRATEGY IS SERVER-ENFORCED.',
      'F15 MAY READ THE PATH AS A PROJECTION INPUT; F13 DOES NOT FORECAST BEYOND THE DEBTS.',
    ],
    extension: 'PREMIUM CREDIT ADD-ON (ADVANCED_DEBT_STRATEGY).',
    founderFlags: [],
  },
  {
    id: 'F14',
    productJob: 'CONNECT MONEY TO SOMETHING THE USER WANTS TO BECOME, DO, OR HAVE.',
    owns: ['DD.GOALS'],
    reads: ['DD.PLAN_ALLOCATIONS', 'DD.ACCOUNTS', 'DD.SETUP_PROFILE'],
    writes: [],
    globalSystems: ['GS.BOTTOM_NAV', 'GS.TOP_CHROME', 'GS.QUICK_ADD', 'GS.ASK_JURNL', 'GS.MONEY_FORMAT', 'GS.DATE_MODEL', 'GS.FORM_SYSTEM', 'GS.STATE_PATTERNS', 'GS.FAMILY_DISCOVERY'],
    wave: 3,
    children: [
      { id: 'F14.GOAL', form: 'ROUTE', route: 'goals/:goalId', purpose: 'ONE GOAL: TARGET, HORIZON, SET ASIDE SO FAR, WHAT FEEDS IT.', reachedFrom: ['F14.00'], wave: 3 },
      { id: 'F14.MEANING', form: 'EXPANDED_STATE', parentId: 'F14.GOAL', purpose: 'WHY IT MATTERS, IN THE PERSON’S WORDS, ON THE GOAL PAGE.', reachedFrom: ['F14.GOAL'], wave: 3 },
    ],
    surfaces: [
      { id: 'F14.SH.NAME_GOAL', type: 'SHEET', name: 'NAME ONE', purpose: 'NAME, TARGET, HORIZON. ALSO THE IX.ADD SHEET.', openedBy: 'F14.IX.ADD', writes: ['DD.GOALS'], wave: 3 },
      { id: 'F14.SH.EDIT_GOAL', type: 'SHEET', name: 'EDIT A GOAL', purpose: 'CHANGE TARGET, HORIZON, MEANING.', openedBy: 'F14.IN.EDIT', writes: ['DD.GOALS'], wave: 3 },
      { id: 'F14.SH.SET_ASIDE', type: 'SHEET', name: 'SET ASIDE', purpose: 'RECORD AN AMOUNT SET ASIDE TOWARD THE GOAL.', openedBy: 'F14.IN.SET_ASIDE', writes: ['DD.GOALS'], wave: 3 },
      { id: 'F14.MD.REMOVE_GOAL', type: 'MODAL', name: 'LET IT GO', purpose: 'REMOVE A GOAL. ITS SET-ASIDE RETURNS TO THE PLAN.', openedBy: 'F14.IN.REMOVE', writes: ['DD.GOALS'], wave: 3 },
    ],
    states: [
      ...commonStates('F14', ['NONE', 'NONE', 'NOTHING IS NAMED.'], 3),
      { id: 'F14.ST.REACHED', name: 'REACHED', purpose: 'THE TARGET IS MET. QUIET, NO CONFETTI.', wave: 3 },
    ],
    interactions: [
      { id: 'F14.IN.PRIMARY', name: 'NAME ONE', purpose: 'OPENS F14.GOAL (OR THE NAMING SHEET WHEN NONE EXIST).', status: 'WORKING', opens: 'F14.GOAL', wave: 3, evidence: 'GoalsScreens row → goals/:goalId.' },
      { id: 'F14.IX.ADD', name: 'ADD', purpose: 'EXPRESSION-TREE INTERACTION. OPENS F14.SH.NAME_GOAL.', status: 'WORKING', opens: 'F14.SH.NAME_GOAL', wave: 3 },
      { id: 'F14.IN.EDIT', name: 'EDIT', purpose: 'OPENS F14.SH.EDIT_GOAL.', status: 'WORKING', opens: 'F14.SH.EDIT_GOAL', wave: 3 },
      { id: 'F14.IN.SET_ASIDE', name: 'SET ASIDE', purpose: 'OPENS F14.SH.SET_ASIDE.', status: 'WORKING', opens: 'F14.SH.SET_ASIDE', wave: 3 },
      { id: 'F14.IN.REMOVE', name: 'LET IT GO', purpose: 'OPENS F14.MD.REMOVE_GOAL.', status: 'WORKING', opens: 'F14.MD.REMOVE_GOAL', wave: 3 },
      ...commonIx('F14'),
    ],
    parentContract: { primaryAction: 'NAME ONE', secondaryAction: 'SET ASIDE', links: ['F14.GOAL', 'F08.00', 'F10.00', 'F11.00'] },
    boundaries: [
      'F14 OWNS GOALS AND THEIR SET-ASIDE PROGRESS. NOT GAMIFIED.',
      'F10 PURCHASES AND F11 TRIPS MAY REFERENCE A GOAL; THEY DO NOT OWN SAVING PROGRESS.',
      'F13 DEBT CLEARANCE IS NOT A GOAL RECORD (IT IS A PATH); A PERSON MAY ALSO NAME IT AS A GOAL BY REFERENCE.',
      'F08 MAY ASSIGN AN AMOUNT TO A GOAL; F14 READS IT, NEVER RE-ASSIGNS.',
      'F02.05.1 SEEDS ONE GOAL NAME + HORIZON; F14 BECOMES ITS OWNER.',
    ],
    extension: null,
    founderFlags: [],
  },
  {
    id: 'F15',
    productJob: 'SHOW THE LIKELY FUTURE.',
    owns: ['DD.FORECAST_SCENARIOS'],
    reads: ['DD.INCOME_SOURCES', 'DD.OBLIGATIONS', 'DD.PLAN_ALLOCATIONS', 'DD.GOALS', 'DD.PAYOFF_PLANS', 'DD.ACCOUNTS', 'DD.TRANSACTIONS'],
    writes: [],
    globalSystems: ['GS.BOTTOM_NAV', 'GS.TOP_CHROME', 'GS.QUICK_ADD', 'GS.ASK_JURNL', 'GS.MONEY_FORMAT', 'GS.DATE_MODEL', 'GS.FORM_SYSTEM', 'GS.STATE_PATTERNS', 'GS.FAMILY_DISCOVERY', 'GS.ENTITLEMENTS'],
    wave: 4,
    children: [
      { id: 'F15.SCENARIO', form: 'EXPANDED_STATE', purpose: 'ANOTHER CONTINUATION ON THE PARENT: THE BASE PATH WITH ONE ASSUMPTION CHANGED.', reachedFrom: ['F15.00'], wave: 4 },
      { id: 'F15.BRANCH', form: 'ROUTE', route: 'ahead/:branchId', purpose: 'ONE BRANCH: BASE VS BRANCH, SIDE BY SIDE, WITH EACH ASSUMPTION NAMED. A FORECAST PAIR, NOT A GLOWING CHART.', reachedFrom: ['F15.00'], wave: 4 },
    ],
    surfaces: [
      { id: 'F15.SH.ASSUMPTION', type: 'SHEET', name: 'ASSUMPTION', purpose: 'CHANGE ONE ASSUMPTION (INCOME, A RECURRING COST, AN EXTRA PAYMENT, A DATE).', openedBy: 'F15.IX.ASSUMPTION', writes: ['DD.FORECAST_SCENARIOS'], wave: 4 },
    ],
    states: [...commonStates('F15', ['THIN', 'THIN', 'TOO LITTLE IS KNOWN TO PROJECT HONESTLY.'], 4)],
    interactions: [
      { id: 'F15.IN.PRIMARY', name: 'TRY ANOTHER PATH', purpose: 'OPENS F15.BRANCH.', status: 'WORKING', opens: 'F15.BRANCH', wave: 4, evidence: 'ahead/:branchId derived comparison route.' },
      { id: 'F15.IX.ASSUMPTION', name: 'ASSUMPTION', purpose: 'EXPRESSION-TREE INTERACTION. OPENS F15.SH.ASSUMPTION.', status: 'PARTIAL', opens: 'F15.SH.ASSUMPTION', wave: 4, evidence: 'Branch view is derived-only; no persisted scenario store in W4.' },
      { id: 'F15.IN.DISCARD', name: 'LET THIS BRANCH GO', purpose: 'DISCARD A BRANCH.', status: 'WORKING', wave: 4, evidence: 'AheadBranchScreen discard → ahead hub.' },
      ...commonIx('F15'),
    ],
    parentContract: { primaryAction: 'TRY ANOTHER PATH', secondaryAction: 'CHANGE AN ASSUMPTION', links: ['F15.BRANCH', 'F06.00', 'F07.00', 'F13.00', 'F14.00'] },
    boundaries: [
      'F15 IS PROJECTION ACROSS MONTHS. F07 IS THE NEAR-TERM LIST OF WHAT IS DUE. F15 READS F07; IT NEVER EDITS OBLIGATIONS.',
      'BASIC FORECAST IS CORE; SCENARIO COMPARISON AND ADVANCED FORECASTING ARE SERVER-ENFORCED CAPABILITIES.',
      'THIN DATA SAYS SO (ST.THIN) RATHER THAN INVENTING A LINE.',
      'BUSINESS_FORECASTING / BUSINESS_CASH_FLOW READ F15 (JURNL BUSINESS EXTENSION).',
    ],
    extension: 'BUSINESS FORECASTING (JURNL BUSINESS EXTENSION).',
    founderFlags: [],
  },
  {
    id: 'F16',
    productJob: 'ORGANIZE THE FINANCIAL PAPER TRAIL.',
    owns: ['DD.DOCUMENTS'],
    reads: ['DD.TRANSACTIONS', 'DD.ACCOUNTS'],
    writes: [],
    globalSystems: ['GS.BOTTOM_NAV', 'GS.TOP_CHROME', 'GS.QUICK_ADD', 'GS.ASK_JURNL', 'GS.FORM_SYSTEM', 'GS.STATE_PATTERNS', 'GS.FAMILY_DISCOVERY', 'GS.FILE_STORAGE', 'GS.ENTITLEMENTS', 'GS.SETTINGS'],
    wave: 4,
    children: [
      { id: 'F16.INDEX', form: 'EXPANDED_STATE', purpose: 'THE INDEX ON THE PARENT: DOCUMENTS BY KIND AND DATE, WITH FIND.', reachedFrom: ['F16.00'], wave: 4 },
      { id: 'F16.DOCUMENT', form: 'ROUTE', route: 'records/:documentId', purpose: 'ONE DOCUMENT: VIEWER, KIND, DATE, LINKED MOVEMENT OR PLACE.', reachedFrom: ['F16.00'], wave: 4 },
    ],
    surfaces: [
      { id: 'F16.SH.ADD_DOCUMENT', type: 'SHEET', name: 'FILE A DOCUMENT', purpose: 'ATTACH A FILE, KIND, DATE, OPTIONAL LINK TO A MOVEMENT OR PLACE.', openedBy: 'F16.IN.ADD', writes: ['DD.DOCUMENTS'], wave: 4 },
      { id: 'F16.MD.DELETE_DOCUMENT', type: 'MODAL', name: 'REMOVE A DOCUMENT', purpose: 'DESTRUCTIVE CONFIRM. THE FILE IS DELETED FROM STORAGE.', openedBy: 'F16.IN.REMOVE', writes: ['DD.DOCUMENTS'], wave: 4 },
      { id: 'F16.SH.EXPORT', type: 'SHEET', name: 'EXPORT MY RECORDS', purpose: 'EXPORT DOCUMENTS + LEDGER. A USER RIGHT (CORE_PERSONAL_DATA_CONTROL), NEVER PAYWALLED.', openedBy: 'F16.IN.EXPORT', wave: 4 },
    ],
    states: [
      ...commonStates('F16', ['EMPTY', 'EMPTY', 'NOTHING IS FILED.'], 4),
      { id: 'F16.ST.NO_RESULTS', name: 'NO RESULTS', purpose: 'FIND MATCHED NOTHING.', wave: 4 },
    ],
    interactions: [
      { id: 'F16.IN.PRIMARY', name: 'OPEN A DOCUMENT', purpose: 'OPENS F16.DOCUMENT.', status: 'WORKING', opens: 'F16.DOCUMENT', wave: 4, evidence: 'records/:documentId route.' },
      { id: 'F16.IX.FIND', name: 'FIND', purpose: 'EXPRESSION-TREE INTERACTION. SEARCH THE INDEX.', status: 'WORKING', wave: 4, evidence: 'RecordsHubScreen listRecords filter.' },
      { id: 'F16.IN.ADD', name: 'FILE A DOCUMENT', purpose: 'OPENS F16.SH.ADD_DOCUMENT.', status: 'WORKING', opens: 'F16.SH.ADD_DOCUMENT', wave: 4, evidence: 'AddRecordSheet metadata-only createRecord.' },
      { id: 'F16.IN.REMOVE', name: 'REMOVE', purpose: 'OPENS F16.MD.DELETE_DOCUMENT.', status: 'WORKING', opens: 'F16.MD.DELETE_DOCUMENT', wave: 4, evidence: 'archiveRecord confirmation.' },
      { id: 'F16.IN.EXPORT', name: 'EXPORT', purpose: 'OPENS F16.SH.EXPORT.', status: 'MISSING', opens: 'F16.SH.EXPORT', wave: 4, evidence: 'Deferred — export bundle not in W4 scope.' },
      ...commonIx('F16'),
    ],
    parentContract: { primaryAction: 'OPEN A DOCUMENT', secondaryAction: 'FILE A DOCUMENT', links: ['F16.DOCUMENT', 'F04.00', 'F05.00'] },
    boundaries: [
      '"ACTIVITY IS MOVEMENT HISTORY. RECORDS ARE DOCUMENTS." (F16_FAMILY_EXPRESSION_BRIEF). F16 NEVER LISTS MOVEMENTS AS RECORDS.',
      'F16 IS THE ARCHIVE / EVIDENCE LAYER; F04 IS THE LEDGER. A DOCUMENT MAY LINK TO A MOVEMENT.',
      'BUSINESS / TAX (RECEIPTS, MILEAGE, P&L, TAX PREP, ACCOUNTANT EXPORT) IS THE JURNL BUSINESS EXTENSION ANCHORED HERE, SERVER-ENFORCED, NOT CORE FUNCTIONAL SCOPE.',
      'BANK_STATEMENT_PDF IS NOT INVENTED (F04 LIST); A STATEMENT IS A DOCUMENT THE PERSON FILES.',
      'PERSONAL DATA EXPORT IS A SAFETY FLOOR (F01 + F16).',
    ],
    extension: 'JURNL BUSINESS EXTENSION (BUSINESS_RECEIPTS, BUSINESS_MILEAGE, BUSINESS_PNL, BUSINESS_TAX_PREP, BUSINESS_TAX_ADVANCED, BUSINESS_ACCOUNTANT_EXPORT).',
    founderFlags: ['FF.BUSINESS_EXTENSION_TIMING'],
  },
];

/* ───────────── F01–F04 completion work the contracts do not list (authored, evidence-backed) ───────────── */

export const F01_F04_ADDITIONS: {
  family: string;
  nodes: { id: string; type: NodeType; form: StructuralForm; name: string; purpose: string; status?: IxStatus; opens?: string; wave: Wave; evidence: string; current: 'IMPLEMENTED' | 'MISSING'; criteria?: string }[];
}[] = [
  {
    family: 'F01',
    nodes: [
      { id: 'F01.11.MD.DELETE_ACCOUNT', type: 'MODAL', form: 'MODAL', name: 'DELETE ACCOUNT', purpose: 'DESTRUCTIVE CONFIRM → auth.deleteAccount → signOut.', wave: 5, evidence: "SecurityScreens.tsx openOverlay('delete-account'); preview adapter only.", current: 'IMPLEMENTED', criteria: 'R1 U1 Dh Ih S1 V- E1 M- L1 P1 A1 N1' },
      { id: 'F01.12.MD.REVOKE_SESSION', type: 'MODAL', form: 'MODAL', name: 'REVOKE SESSION', purpose: 'CONFIRM → auth.revokeSession.', wave: 5, evidence: "SecurityScreens.tsx RevokeSessionModal; preview session list.", current: 'IMPLEMENTED', criteria: 'R1 U1 Dh Ih S1 V- E1 M- L1 P1 A1 N1' },
      { id: 'F01.OV.MAIL_HANDOFF', type: 'OVERLAY', form: 'OVERLAY', name: 'OPEN EMAIL APP', purpose: 'EXTERNAL MAIL HANDOFF FROM F01.02 / F01.06 / F01.10.', wave: 5, evidence: 'EntryScreens.tsx MailHandoff; no email is sent in preview.', current: 'IMPLEMENTED', criteria: 'R1 U1 D- Ih S1 V- E1 M- L- P1 A1 N1' },
      { id: 'F01.03.OV.SUPPORT_HANDOFF', type: 'OVERLAY', form: 'OVERLAY', name: 'CONTACT SUPPORT', purpose: 'MAIL HANDOFF WITH TARGET SUPPORT FROM THE LOCKED PANEL.', wave: 5, evidence: "EntryScreens.tsx openOverlay('support').", current: 'IMPLEMENTED', criteria: 'R1 U1 D- Ih S1 V- E1 M- L- P1 A1 N1' },
      { id: 'F01.OV.SOCIAL_APPLE', type: 'OVERLAY', form: 'OVERLAY', name: 'APPLE PROVIDER BOUNDARY', purpose: 'NATIVE PROVIDER HANDOFF. RETURNS PROVIDER_NOT_CONFIGURED.', wave: 5, evidence: 'EntryScreens.tsx SocialAuthBoundary; adapters.ts PROVIDER_NOT_CONFIGURED.', current: 'IMPLEMENTED', criteria: 'R1 U1 D0 I0 S1 V- E1 M- L1 P1 A1 N1' },
      { id: 'F01.OV.SOCIAL_GOOGLE', type: 'OVERLAY', form: 'OVERLAY', name: 'GOOGLE PROVIDER BOUNDARY', purpose: 'NATIVE PROVIDER HANDOFF. RETURNS PROVIDER_NOT_CONFIGURED.', wave: 5, evidence: 'EntryScreens.tsx SocialAuthBoundary; adapters.ts PROVIDER_NOT_CONFIGURED.', current: 'IMPLEMENTED', criteria: 'R1 U1 D0 I0 S1 V- E1 M- L1 P1 A1 N1' },
      { id: 'F01.04.OV.FACEID_UNLOCK', type: 'OVERLAY', form: 'OVERLAY', name: 'FACE ID UNLOCK', purpose: 'NATIVE BIOMETRIC BOUNDARY (SIMULATED BRIDGE).', wave: 5, evidence: "EntryScreens.tsx openOverlay('faceid-unlock'); createDesignPreviewNativeBridge.", current: 'IMPLEMENTED', criteria: 'R1 U1 D1 Ih S1 V- E1 M- L1 P1 A1 N1' },
      { id: 'F01.09.OV.FACEID_ENABLE', type: 'OVERLAY', form: 'OVERLAY', name: 'FACE ID ENABLE', purpose: 'NATIVE BIOMETRIC PERMISSION BOUNDARY (SIMULATED BRIDGE).', wave: 5, evidence: "SecurityScreens.tsx openOverlay('faceid-enable').", current: 'IMPLEMENTED', criteria: 'R1 U1 D1 Ih S1 V- E1 M- L1 P1 A1 N1' },
    ],
  },
  {
    family: 'F03',
    nodes: [
      { id: 'F03.IN.OPEN_UPCOMING', type: 'INTERACTION', form: 'ROUTE', name: 'COMING → UPCOMING', purpose: 'PANEL HEADER ACTION ON COMING OPENS F07 (DISCOVERY).', status: 'MISSING', opens: 'F07.00', wave: 1, evidence: 'HomeScreens.tsx COMING has MORE/LESS only.', current: 'MISSING' },
      { id: 'F03.IN.OPEN_SAFE', type: 'INTERACTION', form: 'ROUTE', name: 'SEE WHY → SAFE TO SPEND', purpose: 'SEE WHY SHEET FOOTER OPENS F09 (THE FULL READING).', status: 'MISSING', opens: 'F09.00', wave: 1, evidence: 'F03 contract: SEE WHY "DOES NOT OPEN F09" — relationship needs a founder decision.', current: 'MISSING' },
      { id: 'F03.IN.ACCOUNT', type: 'INTERACTION', form: 'ROUTE', name: 'ACCOUNT', purpose: 'TOP-CHROME ENTRY TO THE ACCOUNT / SETTINGS SURFACE.', status: 'WORKING', opens: 'GS.SETTINGS', wave: 1, evidence: 'HomeScreens gear → go(account); SettingsScreens.tsx route account.', current: 'IMPLEMENTED' },
    ],
  },
  {
    family: 'F04',
    nodes: [
      { id: 'F04.SH.EDIT_MOVEMENT', type: 'SHEET', form: 'SHEET', name: 'EDIT A MOVEMENT', purpose: 'EDIT NAME, AMOUNT, DATE, CATEGORY, ACCOUNT, MEMO ON A HAND-ADDED MOVEMENT.', wave: 1, evidence: 'DetailSheet edit mode + repository updateTransaction (ADDED only).', current: 'IMPLEMENTED' },
      { id: 'F04.MD.DELETE_MOVEMENT', type: 'MODAL', form: 'MODAL', name: 'DELETE A MOVEMENT', purpose: 'DESTRUCTIVE CONFIRM ON A HAND-ADDED MOVEMENT.', wave: 1, evidence: 'DetailSheet delete confirmation + repository deleteTransaction.', current: 'IMPLEMENTED' },
      { id: 'F04.IN.EDIT', type: 'INTERACTION', form: 'SHEET', name: 'EDIT', purpose: 'FROM DETAIL, OPENS F04.SH.EDIT_MOVEMENT.', status: 'WORKING', opens: 'F04.SH.EDIT_MOVEMENT', wave: 1, evidence: 'activity-edit trigger on ADDED entries.', current: 'IMPLEMENTED' },
      { id: 'F04.IN.DELETE', type: 'INTERACTION', form: 'MODAL', name: 'DELETE', purpose: 'FROM DETAIL, OPENS F04.MD.DELETE_MOVEMENT.', status: 'WORKING', opens: 'F04.MD.DELETE_MOVEMENT', wave: 1, evidence: 'activity-delete trigger on ADDED entries.', current: 'IMPLEMENTED' },
      { id: 'F04.IN.RELATED', type: 'INTERACTION', form: 'ROUTE', name: 'RELATED', purpose: 'A MOVEMENT RELATED TO A BILL OR SUBSCRIPTION OPENS F07.ITEM.', status: 'MISSING', opens: 'F07.ITEM', wave: 2, evidence: 'DetailSheet RELATED row is text only.', current: 'MISSING' },
    ],
  },
];

/* ───────────────────────── global systems ───────────────────────── */

export type GlobalSystem = {
  id: string;
  type: NodeType;
  name: string;
  scope: 'GLOBAL' | 'FAMILY_OWNED' | 'DUPLICATED';
  ownerFamily: string | null;
  current: 'IMPLEMENTED' | 'PARTIAL' | 'MISSING';
  criteria: string;
  gapOverride?: GapClass;
  route?: string;
  evidence: string;
  required: string;
  wave: Wave;
  consumers: string[];
  surfaces?: { id: string; type: 'SHEET' | 'DRAWER' | 'MODAL'; name: string; current: 'IMPLEMENTED' | 'MISSING'; criteria: string; wave: Wave; evidence: string }[];
  interactions?: { id: string; name: string; status: IxStatus; wave: Wave; evidence: string; opens?: string }[];
};

const ALL = ['F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16'];

export const GLOBAL_SYSTEMS: GlobalSystem[] = [
  {
    id: 'GS.BOTTOM_NAV', type: 'GLOBAL_NAV', name: 'BOTTOM NAV (HOME / MONEY / + / PLAN / CREDIT)', scope: 'GLOBAL', ownerFamily: null, current: 'IMPLEMENTED',
    criteria: 'R1 U1 D- I1 S1 V- E- M- L- P1 A1 N1', evidence: 'ProductNav.tsx ITEMS → F03 / F05 / quick add / F08 / F12; <nav aria-label="PRIMARY">; centered dock.', required: 'HOLD. NO SIXTH ITEM.', wave: 0, consumers: ALL,
    interactions: [
      { id: 'GS.NAV.HOME', name: 'HOME', status: 'WORKING', wave: 0, evidence: 'ProductNav.tsx → F03.', opens: 'F03.00' },
      { id: 'GS.NAV.MONEY', name: 'MONEY', status: 'WORKING', wave: 0, evidence: 'ProductNav.tsx → F05.', opens: 'F05.00' },
      { id: 'GS.NAV.ADD', name: '+ (QUICK ADD)', status: 'WORKING', wave: 0, evidence: 'ProductNav.tsx ADD → quick-add overlay.', opens: 'GLOBAL.SH.QUICK_ADD' },
      { id: 'GS.NAV.PLAN', name: 'PLAN', status: 'WORKING', wave: 0, evidence: 'ProductNav.tsx → F08.', opens: 'F08.00' },
      { id: 'GS.NAV.CREDIT', name: 'CREDIT', status: 'WORKING', wave: 0, evidence: 'ProductNav.tsx → F12.', opens: 'F12.00' },
    ],
  },
  {
    id: 'GS.TOP_CHROME', type: 'GLOBAL_SYSTEM', name: 'TOP CHROME (BACK / INFO / UTILITY)', scope: 'DUPLICATED', ownerFamily: null, current: 'PARTIAL', gapOverride: 'DUPLICATED',
    criteria: 'R1 U1 D- I1 S- V- E- M- L- P1 A1 Nh', evidence: 'Composed per screen (HomeScreens back+ASK, ParentScreens BOARD/TODAY, SetupScreens back). No shared component; three variants.', required: 'ONE SHARED TOP-CHROME PRIMITIVE: BACK (RETURN PATH), TITLE SLOT, ASK, ACCOUNT ENTRY.', wave: 0, consumers: ALL,
  },
  {
    id: 'GS.QUICK_ADD', type: 'GLOBAL_SYSTEM', name: 'QUICK ADD', scope: 'GLOBAL', ownerFamily: 'F04', current: 'PARTIAL',
    criteria: 'R1 U1 Dh Ih S1 V1 E1 M- L- P1 A1 N1', evidence: 'GlobalSheets QuickAddV2Sheet + quickAddRegistry.ts; appendTransaction via repository v2; accountDisplayOptions().', required: 'PERSIST THROUGH THE LEDGER REPOSITORY; DATE (DEFAULT TODAY); CATEGORY; ACCOUNT FROM THE REGISTRY; EDIT/DELETE VIA F04 DETAIL. NO RECURRENCE (RECURRENCE IS AN F07 OBLIGATION).', wave: 1, consumers: ALL,
    surfaces: [{ id: 'GLOBAL.SH.QUICK_ADD', type: 'SHEET', name: 'QUICK ADD SHEET', current: 'IMPLEMENTED', criteria: 'R1 U1 Dh Ih S1 V1 E1 M- L- P1 A1 N1', wave: 1, evidence: 'QuickAddV2Sheet on F03/F04/F05–F16.' }],
    interactions: [
      { id: 'GS.QA.VALIDATE', name: 'VALIDATE', status: 'WORKING', wave: 0, evidence: 'SAVE disabled until name + amount regex + type + account.' },
      { id: 'GS.QA.CURRENCY_ENTRY', name: 'ENTER IN DISPLAY CURRENCY', status: 'WORKING', wave: 0, evidence: 'quoteQuickAdd stores entered + canonical USD + rate + timestamp.' },
      { id: 'GS.QA.SAVE', name: 'SAVE', status: 'WORKING', wave: 1, evidence: 'addLedgerEntry → repository appendTransaction (user-scoped device adapter).' },
    ],
  },
  {
    id: 'GS.ASK_JURNL', type: 'AI_SURFACE', name: 'ASK JURNL', scope: 'GLOBAL', ownerFamily: null, current: 'PARTIAL',
    criteria: 'R1 U1 Dh Ih S1 V- E- M- L- P1 A1 N1', evidence: 'GlobalSheets AskJurnlSheet + askJurnl.ts context boundary; mounted F03/F04 + ParentScreens F05–F16; no LLM.', required: 'EXPLANATION-ONLY SURFACE ON EVERY FAMILY, CONTEXT = CURRENT FAMILY + ITS DERIVED VALUES, READ-ONLY. NO WRITES, NO ACTIONS. LLM PROVIDER IS A FOUNDER DECISION (AI_EXPLAIN_BASIC IS A SAFETY FLOOR). CURRENCY SELECTOR MOVES TO SETTINGS.', wave: 1, consumers: ALL,
    surfaces: [{ id: 'GLOBAL.SH.ASK', type: 'SHEET', name: 'ASK SHEET', current: 'IMPLEMENTED', criteria: 'R1 U1 Dh Ih S1 V- E- M- L- P1 A1 N1', wave: 1, evidence: 'AskJurnlSheet global.' }],
    interactions: [
      { id: 'GS.ASK.EXPLAIN', name: 'EXPLAIN', status: 'WORKING', wave: 1, evidence: 'explainFromContext uses family id + safe-to-spend; consent-gated.' },
      { id: 'GS.ASK.CURRENCY_SELECT', name: 'DISPLAY CURRENCY', status: 'MISSING', wave: 1, evidence: 'Moved to GS.SETTINGS account route (Wave 1).' },
    ],
  },
  {
    id: 'GS.CURRENCY', type: 'GLOBAL_SYSTEM', name: 'CURRENCY (BASE USD ≠ DISPLAY)', scope: 'GLOBAL', ownerFamily: null, current: 'IMPLEMENTED',
    criteria: 'R1 U1 D1 I1 S1 V1 E1 M- L1 P1 A1 N1', evidence: 'currency.ts + JURNL_CURRENCY_CONTRACT / EXCHANGE_RATE_CONTRACT: 20 codes, base USD, conversion only from canonical USD (no chain), no symbol swap, 3 visible rows, 24h fresh / 7d stale, never invents a rate.', required: 'CLASSIFY ONLY (NO CHANGE THIS SPRINT). MOVE THE SELECTOR TO SETTINGS. RECONCILE DOC DRIFT (GLOBAL_COMPOSITION_RULES + CORE.md:297 STILL SAY NO FX).', wave: 1, consumers: ALL,
  },
  {
    id: 'GS.MONEY_FORMAT', type: 'GLOBAL_SYSTEM', name: 'MONEY FORMATTER', scope: 'GLOBAL', ownerFamily: null, current: 'IMPLEMENTED',
    criteria: 'R- U- D1 I1 S- V1 E1 M- L- P- A- N-', evidence: 'formatMoney falls back to USD, never swaps a symbol.', required: 'HOLD. F05–F16 PREVIEW ROWS ARE NOT FORMATTED TODAY BECAUSE THEY ARE LABELS; REAL VALUES MUST USE formatMoney.', wave: 0, consumers: ALL,
  },
  {
    id: 'GS.DATE_MODEL', type: 'GLOBAL_SYSTEM', name: 'DATE MODEL + DATE FORMATTER', scope: 'GLOBAL', ownerFamily: null, current: 'MISSING',
    criteria: 'R- U- D0 I0 S- V0 E0 M- L- P- A- N-', evidence: "money.ts LedgerEntry.when is a string ('YESTERDAY', 'FRIDAY'); FilterSheet WHEN options are hard-coded weekday names; quick add writes 'TODAY'.", required: 'ISO DATE STORAGE, RELATIVE DISPLAY (TODAY / YESTERDAY / WEEKDAY / DATE), CADENCE MATH (WEEKLY, EVERY TWO WEEKS, MONTHLY, IRREGULAR — F02_CADENCES), NEXT-OCCURRENCE.', wave: 0, consumers: ['F03', 'F04', 'F06', 'F07', 'F09', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16'],
  },
  {
    id: 'GS.CATEGORIES', type: 'GLOBAL_SYSTEM', name: 'CATEGORY TAXONOMY', scope: 'GLOBAL', ownerFamily: null, current: 'MISSING',
    criteria: 'R- U- D0 I0 S- V0 E- M- L- P- A- N-', evidence: 'category is a free string; mock uses CLOTHING / FOOD / INCOME / HOUSING / MEMBERSHIP; quick add writes INCOME | OTHER; TransactionRow.markFor maps three categories to placeholder glyphs.', required: 'ONE CLOSED CATEGORY LIST WITH ICON BINDINGS; CATEGORY PICKER PRIMITIVE. BUSINESS_CATEGORIZATION IS A SERVER-ENFORCED EXTENSION ON TOP.', wave: 0, consumers: ['F03', 'F04', 'F08', 'F16'],
  },
  {
    id: 'GS.ACCOUNT_REGISTRY', type: 'GLOBAL_SYSTEM', name: 'ACCOUNT PICKER (REGISTRY-BACKED)', scope: 'DUPLICATED', ownerFamily: 'F05', current: 'MISSING', gapOverride: 'DUPLICATED',
    criteria: 'R- U1 D0 I0 S- V0 E- M- L- P1 A1 N-', evidence: 'QuickAddSheet ACCOUNT and FilterSheet ACCOUNT each hard-code CHECKING / CARD; F02 keeps one accountName/accountKind; MOCK_ENTRIES use CHECKING / CARD.', required: 'ONE PICKER READING DD.ACCOUNTS (OWNED BY F05). REMOVE BOTH HARD-CODED LISTS.', wave: 0, consumers: ['F04', 'F05', 'F07', 'F12', 'F13', 'GS.QUICK_ADD'],
  },
  {
    id: 'GS.TRANSACTION_DETAIL', type: 'GLOBAL_SYSTEM', name: 'TRANSACTION DETAIL', scope: 'FAMILY_OWNED', ownerFamily: 'F04', current: 'PARTIAL',
    criteria: 'R1 U1 Dh Ih S1 V- E- M- L- P1 A1 N1', evidence: 'F04 DetailSheet: 11 read-only fields. No edit, no delete, RELATED is text.', required: 'EDIT / DELETE FOR HAND-ADDED MOVEMENTS; RELATED OPENS F07.ITEM; REUSED BY F05.ACCOUNT AND F06.SOURCE ARRIVALS.', wave: 1, consumers: ['F04', 'F05', 'F06', 'F03'],
  },
  {
    id: 'GS.SEARCH', type: 'GLOBAL_SYSTEM', name: 'SEARCH', scope: 'FAMILY_OWNED', ownerFamily: 'F04', current: 'IMPLEMENTED',
    criteria: 'R1 U1 D1 I1 S1 V- E- M1 L- P1 A1 N1', evidence: 'F04 search, 160ms debounce, query summary + CLEAR, NO_RESULTS. F16 IX.FIND is the only other search in the tree.', required: 'NO GLOBAL SEARCH (NO EVIDENCE). F16 REUSES THE F04 SEARCH PRIMITIVE.', wave: 0, consumers: ['F04', 'F16'],
  },
  {
    id: 'GS.FILTERING', type: 'GLOBAL_SYSTEM', name: 'FILTERING', scope: 'FAMILY_OWNED', ownerFamily: 'F04', current: 'PARTIAL',
    criteria: 'R1 U1 Dh I1 S1 V- E- M- L- P1 A1 N1', evidence: 'F04 FilterSheet: ACCOUNT / DIRECTION / STATUS / WHEN, CLEAR. Options hard-coded, not data-driven.', required: 'OPTIONS FROM THE ACCOUNT REGISTRY AND THE DATE MODEL. F16 INDEX REUSES THE PATTERN.', wave: 1, consumers: ['F04', 'F16'],
  },
  {
    id: 'GS.FORM_SYSTEM', type: 'GLOBAL_SYSTEM', name: 'FORM SYSTEM', scope: 'GLOBAL', ownerFamily: null, current: 'IMPLEMENTED',
    criteria: 'R- U1 D- I1 S1 V1 E1 M- L1 P1 A1 N-', evidence: 'primitives.tsx JurnlInput (role=alert errors), JurnlChoice (aria-pressed), JurnlCheckbox (role=checkbox), JurnlToggle (role=switch), JurnlPasswordRequirements; useCompactFit containment.', required: 'ADD AMOUNT, DATE, CADENCE, ACCOUNT AND CATEGORY FIELDS AS SHARED PRIMITIVES (SEE SHARED PRIMITIVES).', wave: 0, consumers: ALL,
  },
  {
    id: 'GS.STATE_PATTERNS', type: 'GLOBAL_SYSTEM', name: 'GLOBAL ERROR / EMPTY / LOADING / OFFLINE', scope: 'GLOBAL', ownerFamily: null, current: 'PARTIAL',
    criteria: 'R- U1 D0 Ih Sh V- E1 M1 L1 P1 A1 N-', evidence: 'JurnlErrorPanel / JurnlSuccessPanel / toasts exist. F03/F04 LOADING, EMPTY, ERROR, STALE are reachable only through ?state= (design-preview switch). Offline exists only on F01.03.', required: 'STATES DRIVEN BY REPOSITORY STATUS (pending / error / empty / stale), GLOBAL OFFLINE BANNER, RETRY. KEEP ?state= AS A PREVIEW SWITCH ONLY.', wave: 0, consumers: ALL,
  },
  {
    id: 'GS.PERSISTENCE', type: 'BACKGROUND_PROCESS', name: 'USER-SCOPED DATA PERSISTENCE', scope: 'GLOBAL', ownerFamily: null, current: 'MISSING',
    criteria: 'R- U- D0 I0 S0 V- E0 M- L- P- A- N-', evidence: 'No JURNL tables (57 migrations, none JURNL). DRAFT_SCHEMA.sql NOT APPLIED. Setup = sessionStorage; quick add = memory; ledger/cash/upcoming = MOCK constants.', required: 'A REPOSITORY CONTRACT PER DATA DOMAIN WITH A DEVICE ADAPTER NOW (FUNCTIONAL) AND A SERVER ADAPTER LATER (LAUNCH). ONE INTERFACE, SWAPPABLE.', wave: 0, consumers: ALL,
  },
  {
    id: 'GS.AUTH', type: 'GLOBAL_SYSTEM', name: 'AUTH', scope: 'FAMILY_OWNED', ownerFamily: 'F01', current: 'PARTIAL',
    criteria: 'R1 U1 Dh Ih S1 V1 E1 M- L1 P1 A1 N1', evidence: 'adapters.ts DESIGN_PREVIEW (localStorage accounts, plaintext passwords) / UNCONFIGURED. jurnlProject.ts authNote: provider unresolved; SITE 00 Supabase is not reused. D-17 / D-18.', required: 'PRODUCTION ADAPTER BEHIND THE EXISTING JurnlAuthAdapter INTERFACE (EMAIL VERIFY, RESET, SESSIONS, DELETE, SOCIAL). PROVIDER = FOUNDER DECISION.', wave: 5, consumers: ['F01', 'GS.SETTINGS'],
  },
  {
    id: 'GS.SETTINGS', type: 'GLOBAL_SYSTEM', name: 'ACCOUNT / PROFILE / SETTINGS', scope: 'GLOBAL', ownerFamily: null, current: 'PARTIAL', route: 'account',
    criteria: 'R0 U0 D0 I0 S0 V0 E0 M- L0 P0 A0 N0', evidence: 'F01.11 / F01.12 hold privacy, AI access, export, delete, sessions — reachable only during entry. Sign out exists only on F01.04 switch sheet. Currency lives inside ASK.', required: 'ONE POST-ENTRY SURFACE: PROFILE, DISPLAY CURRENCY, AI ACCESS, CONSENTS, DATA EXPORT, DELETE ACCOUNT, SESSIONS, SIGN OUT. REUSES F01.11 / F01.12 DRAWER CONTENT. ENTRY FROM TOP CHROME ON HOME (NO SIXTH NAV ITEM) — FOUNDER DECISION.', wave: 1, consumers: ALL,
    surfaces: [
      { id: 'GS.SETTINGS.DR.CURRENCY', type: 'DRAWER', name: 'DISPLAY CURRENCY', current: 'IMPLEMENTED', criteria: 'R0 U0 D1 I1 S1 V- E1 M- L1 P0 A0 N0', wave: 1, evidence: 'SettingsScreens currency drawer + repository displayCurrency.' },
      { id: 'GS.SETTINGS.DR.PRIVACY', type: 'DRAWER', name: 'PRIVACY + AI ACCESS', current: 'MISSING', criteria: 'R0 U0 D1 I0 S0 V- E0 M- L- P0 A0 N0', wave: 1, evidence: 'F01.11 drawers reusable.' },
      { id: 'GS.SETTINGS.DR.SECURITY', type: 'DRAWER', name: 'SECURITY + SESSIONS', current: 'MISSING', criteria: 'R0 U0 Dh I0 S0 V- E0 M- L- P0 A0 N0', wave: 1, evidence: 'F01.12 drawers reusable.' },
      { id: 'GS.SETTINGS.SH.EXPORT', type: 'SHEET', name: 'EXPORT MY DATA', current: 'MISSING', criteria: 'R0 U0 D0 I0 S0 V- E0 M- L0 P0 A0 N0', wave: 1, evidence: 'F01.11 records exportRequested only.' },
      { id: 'GS.SETTINGS.MD.SIGN_OUT', type: 'MODAL', name: 'SIGN OUT', current: 'MISSING', criteria: 'R0 U0 D1 I0 S0 V- E- M- L- P0 A0 N0', wave: 1, evidence: 'sign-out modal exists on F01.04 only.' },
      { id: 'GS.SETTINGS.MD.DELETE_ACCOUNT', type: 'MODAL', name: 'DELETE ACCOUNT', current: 'MISSING', criteria: 'R0 U0 Dh I0 S0 V- E0 M- L0 P0 A0 N0', wave: 1, evidence: 'delete-account modal exists on F01.11 only.' },
    ],
    interactions: [
      { id: 'GS.SETTINGS.OPEN', name: 'OPEN ACCOUNT', status: 'WORKING', wave: 1, evidence: 'Route account + top chrome gear on F03/F04/parents.' },
      { id: 'GS.SETTINGS.SIGN_OUT', name: 'SIGN OUT', status: 'WORKING', wave: 1, evidence: 'SettingsScreens signOut().' },
      { id: 'GS.SETTINGS.EXPORT', name: 'EXPORT MY DATA', status: 'MISSING', wave: 1, evidence: 'Safety floor CORE_PERSONAL_DATA_CONTROL.' },
      { id: 'GS.SETTINGS.DELETE', name: 'DELETE ACCOUNT', status: 'MISSING', wave: 1, evidence: 'Only reachable during entry.' },
    ],
  },
  {
    id: 'GS.FAMILY_DISCOVERY', type: 'GLOBAL_SYSTEM', name: 'FAMILY DISCOVERY (NON-NAV FAMILIES)', scope: 'GLOBAL', ownerFamily: null, current: 'PARTIAL',
    criteria: 'R1 U1 D- I1 S- V- E- M- L- P1 A1 N1', evidence: 'FamilyDiscoveryLinks on F03 / F05 / F08 / F12 hubs; JURNL_FAMILY_DISCOVERY + JURNL_PRODUCT_DISCOVERY_EDGES in familyRegistry.ts.', required: 'HUB LINKS: HOME→F07 F09 · MONEY→F06 F16 · PLAN→F09 F10 F11 F14 F15 · CREDIT→F13. REVIEW BOARD IS NOT PRODUCT NAV.', wave: 0, consumers: ['F03', 'F05', 'F08', 'F12'],
  },
  {
    id: 'GS.ENTITLEMENTS', type: 'GLOBAL_SYSTEM', name: 'ENTITLEMENTS / CAPABILITY GATES', scope: 'GLOBAL', ownerFamily: null, current: 'PARTIAL',
    criteria: 'R- U1 Dh I1 S1 V- E1 M- L- P1 A1 N-', evidence: 'JurnlEntitlementsProvider + capabilities.ts (CLIENT_PRESENTATION vs SERVER_ENFORCED). No server to enforce. DRAFT_16_FAMILY_ENTITLEMENT_MAP founderApproved:false.', required: 'GATE STATE PATTERN (FEATURE_GATE_SEEN) ON ADVANCED NODES; SAFETY FLOORS NEVER GATED. SERVER ENFORCEMENT AT LAUNCH.', wave: 1, consumers: ['F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F15', 'F16'],
  },
  {
    id: 'GS.EXCHANGE_RATES', type: 'BACKGROUND_PROCESS', name: 'EXCHANGE RATE REFRESH', scope: 'GLOBAL', ownerFamily: null, current: 'IMPLEMENTED',
    criteria: 'R- U- D1 I1 S1 V1 E1 M- L1 P- A- N-', evidence: 'Client fetch open.er-api.com, memory + localStorage cache, stale fallback, never invents a rate.', required: 'HOLD. A SERVER PROXY IS A LAUNCH CONCERN (RATE LIMITS, PRIVACY).', wave: 0, consumers: ['GS.CURRENCY'],
  },
  {
    id: 'GS.DATA_REFRESH', type: 'BACKGROUND_PROCESS', name: 'DATA REFRESH / STALENESS', scope: 'GLOBAL', ownerFamily: null, current: 'MISSING',
    criteria: 'R- U- D0 I0 S0 V- E0 M- L0 P- A- N-', evidence: "Today REFRESH calls go('F03') (re-render, clears the forced state). Nothing is fetched.", required: 'REPOSITORY RE-READ + AS-OF TIMESTAMPS PER DOMAIN; STALE = AS-OF OLDER THAN THE DOMAIN WINDOW. BANK SYNC ONLY IF FOUNDER APPROVES AGGREGATION.', wave: 0, consumers: ['F03', 'F04', 'F05'],
  },
  {
    id: 'GS.BANK_CONNECTION', type: 'BACKGROUND_PROCESS', name: 'BANK CONNECTION (AGGREGATION)', scope: 'GLOBAL', ownerFamily: 'F02', current: 'MISSING', gapOverride: 'VISUAL_ONLY',
    criteria: 'R1 U1 D0 I0 S- V- E0 M- L0 P1 A1 N1', evidence: 'No Plaid / MX / Teller / Finicity / Yodlee. F02.02 connect patches the draft to CONNECTED. F03_SCREEN_TREE: "No live bank connection exists."', required: 'FOUNDER DECISION: MANUAL-FIRST AT LAUNCH (RELABEL F02.02 CONNECT AS NAMING A PLACE, NO PRETEND CONNECTION) OR A PROVIDER. NOT REQUIRED FOR 100% FUNCTIONAL IF MANUAL-FIRST.', wave: 1, consumers: ['F02', 'F05', 'F04'],
  },
  {
    id: 'GS.FILE_STORAGE', type: 'BACKGROUND_PROCESS', name: 'DOCUMENT FILE STORAGE', scope: 'FAMILY_OWNED', ownerFamily: 'F16', current: 'MISSING',
    criteria: 'R- U- D0 I0 S0 V0 E0 M- L0 P- A- N-', evidence: 'No storage path for JURNL documents.', required: 'DEVICE ADAPTER (IndexedDB BLOBS) FOR FUNCTIONAL; PRIVATE BUCKET + RLS AT LAUNCH.', wave: 4, consumers: ['F16'],
  },
  {
    id: 'GS.NOTIFICATIONS', type: 'GLOBAL_SYSTEM', name: 'NOTIFICATIONS', scope: 'GLOBAL', ownerFamily: null, current: 'MISSING', gapOverride: 'MISSING',
    criteria: 'R- U- D- I0 S- V- E- M- L- P- A- N-', evidence: 'No notification system or preference. No family names one as required.', required: 'OUT OF FUNCTIONAL SCOPE UNTIL THE FOUNDER SCOPES IT (DUE-SOON FOR F07 IS THE ONLY EVIDENCED CANDIDATE).', wave: 5, consumers: ['F07'],
  },
  {
    id: 'GS.ANALYTICS', type: 'GLOBAL_SYSTEM', name: 'ANALYTICS', scope: 'GLOBAL', ownerFamily: null, current: 'MISSING',
    criteria: 'R- U- D0 I0 S- V- E- M- L- P- A- N-', evidence: "trackActivity → /api/activity → user_activity (no migration). buildMonetizationEvent allow-list is never sent. postToHost('route') feeds DesignChamber only. No GA / PostHog.", required: 'REUSE trackActivity WITH A JURNL PREFIX FOR SCREEN + INTERACTION EVENTS (NO FINANCIAL PAYLOADS); SEND MONETIZATION EVENTS THROUGH buildMonetizationEvent. NO NEW EVENT SYSTEM.', wave: 5, consumers: ALL,
  },
  {
    id: 'GS.SEO_NOINDEX', type: 'GLOBAL_SYSTEM', name: 'SEO / NOINDEX', scope: 'GLOBAL', ownerFamily: null, current: 'MISSING',
    criteria: 'R- U- D- I0 S- V- E- M- L- P- A- N-', evidence: 'No noindex, robots.txt or X-Robots-Tag. Site00InternalProductionGuard is skipped on localhost and fsbw-dev hosts.', required: 'EVERY JURNL ROUTE IS AUTHENTICATED → NOINDEX. NO PUBLIC OR SHAREABLE ROUTE IS EVIDENCED.', wave: 5, consumers: ALL,
  },
  {
    id: 'GS.NATIVE_BRIDGE', type: 'BACKGROUND_PROCESS', name: 'NATIVE BRIDGE (BIOMETRIC / DEVICE)', scope: 'FAMILY_OWNED', ownerFamily: 'F01', current: 'PARTIAL',
    criteria: 'R- U- Dh Ih S1 V- E1 M- L- P- A- N-', evidence: 'createDesignPreviewNativeBridge simulates biometric outcomes and external targets.', required: 'REAL BRIDGE IN THE NATIVE SHELL. LAUNCH CONCERN.', wave: 5, consumers: ['F01'],
  },
  {
    id: 'GS.CONSENT', type: 'GLOBAL_SYSTEM', name: 'CONSENT + AI ACCESS', scope: 'GLOBAL', ownerFamily: null, current: 'PARTIAL',
    criteria: 'R1 U1 Dh I1 S1 V- E- M- L- P1 A1 N1', evidence: 'repository consent[] + consentSync.ts (F01.11 AI + F02.07 setup consents); SettingsScreens reads/writes.', required: 'ONE CONSENT RECORD; F01.11 AND F02.07 BOTH WRITE IT; SETTINGS READS IT.', wave: 1, consumers: ['F01', 'F02', 'GS.SETTINGS', 'GS.ASK_JURNL'],
  },
];

/* ───────────────────────── data domains ───────────────────────── */

export type DataDomain = {
  id: string;
  name: string;
  owner: string;
  readers: string[];
  writers: string[];
  derived: boolean;
  derivedFrom?: string[];
  currentSource: string;
  currentPersistence: 'NONE' | 'MOCK' | 'MEMORY' | 'SESSION' | 'DEVICE' | 'DEVICE_PREVIEW';
  targetPersistence: string;
  criteria: string;
  conflicts: string[];
  wave: Wave;
};

export const DATA_DOMAINS: DataDomain[] = [
  { id: 'DD.IDENTITY', name: 'ACCOUNT IDENTITY', owner: 'F01', readers: ['F01', 'GS.SETTINGS'], writers: ['F01', 'GS.SETTINGS'], derived: false, currentSource: 'adapters.ts preview accounts', currentPersistence: 'DEVICE_PREVIEW', targetPersistence: 'AUTH PROVIDER (LAUNCH)', criteria: 'R- U- Dh I1 S1 V1 E1 M- L- P- A- N-', conflicts: ['PREVIEW ACCOUNTS ARE STORED WITH PLAINTEXT PASSWORDS IN localStorage (jurnl.runtime.v1.preview-accounts) — PREVIEW ONLY, NEVER SHIPPABLE.'], wave: 5 },
  { id: 'DD.SESSION_DEVICE', name: 'SESSION + DEVICE TRUST + BIOMETRIC PREFERENCE', owner: 'F01', readers: ['F01', 'GS.SETTINGS'], writers: ['F01'], derived: false, currentSource: 'store.tsx', currentPersistence: 'DEVICE', targetPersistence: 'DEVICE + AUTH PROVIDER SESSIONS', criteria: 'R- U- D1 I1 S1 V- E1 M- L- P- A- N-', conflicts: [], wave: 0 },
  { id: 'DD.CONSENT', name: 'CONSENT + AI ACCESS + PRIVACY PREFERENCES', owner: 'GS.CONSENT', readers: ['F01', 'F02', 'GS.SETTINGS', 'GS.ASK_JURNL'], writers: ['F01', 'F02', 'GS.SETTINGS'], derived: false, currentSource: 'repository snapshot consent[] (synced from device AI + setup draft)', currentPersistence: 'DEVICE', targetPersistence: 'REPOSITORY (USER-SCOPED)', criteria: 'R- U- Dh Ih S1 V- E- M- L- P- A- N-', conflicts: ['DEVICE AI STILL MIRRORS UI STATE; REPOSITORY IS CANONICAL FOR ASK + SETTINGS.', 'DATA EXPORT IS RECORDED AS A FLAG ONLY.'], wave: 1 },
  { id: 'DD.SETUP_PROFILE', name: 'SETUP PROFILE (HOUSEHOLD, PRIORITIES, VOICE, RESUME)', owner: 'F02', readers: ['F02', 'F03', 'F06', 'F07', 'F08', 'F09', 'F14'], writers: ['F02'], derived: false, currentSource: 'setupDraft.ts', currentPersistence: 'SESSION', targetPersistence: 'REPOSITORY; SEEDED DOMAINS MOVE TO THEIR OWNERS ON COMPLETE', criteria: 'R- U- Dh I1 S1 V1 E- M- L- P- A- N-', conflicts: ['SETUP DRAFT IS READ AS THE LIVE SOURCE FOR F03 (OBLIGATIONS, PROTECTED) INSTEAD OF HANDING OFF TO F07 / F09.'], wave: 0 },
  { id: 'DD.ACCOUNTS', name: 'ACCOUNTS (PLACES)', owner: 'F05', readers: ['F03', 'F04', 'F05', 'F06', 'F07', 'F09', 'F12', 'F13', 'F14', 'F15', 'F16', 'GS.QUICK_ADD'], writers: ['F05', 'F02'], derived: false, currentSource: 'F02 draft (one name + kind) + hard-coded CHECKING / CARD', currentPersistence: 'SESSION', targetPersistence: 'REPOSITORY', criteria: 'R- U- Dh I0 S0 Vh E0 M- L- P- A- N-', conflicts: ['THREE SOURCES: F02 draft accountName, QuickAdd/Filter hard-coded lists, MOCK entries.', 'F05.ACCOUNTS VS F12.ACCOUNTS: RESOLVED HERE AS ONE REGISTRY (F05) + CREDIT ATTRIBUTES (F12).'], wave: 0 },
  { id: 'DD.TRANSACTIONS', name: 'MOVEMENTS (LEDGER)', owner: 'F04', readers: ['F03', 'F04', 'F05', 'F06', 'F07', 'F09', 'F12', 'F15', 'F16'], writers: ['GS.QUICK_ADD', 'F04', 'F05', 'F07', 'F10'], derived: false, currentSource: 'repository transactions (MOCK seed + ADDED mutations)', currentPersistence: 'DEVICE', targetPersistence: 'REPOSITORY', criteria: 'R- U- Dh Ih S1 V1 E1 M- L- P- A- N-', conflicts: ['MOCK ENTRIES READ-ONLY; DATE STILL RELATIVE STRINGS FOR FILTER.', 'NO TRANSFER DIRECTION.'], wave: 0 },
  { id: 'DD.INCOME_SOURCES', name: 'INCOME SOURCES', owner: 'F06', readers: ['F03', 'F06', 'F08', 'F09', 'F15', 'F07'], writers: ['F06', 'GS.QUICK_ADD'], derived: false, currentSource: 'repository incomeSources[] (seeded from setup once)', currentPersistence: 'DEVICE', targetPersistence: 'REPOSITORY', criteria: 'R- U- Dh Ih S1 V1 E1 M- L- P- A- N-', conflicts: ['SETUP DRAFT STILL HOLDS LEGACY CADENCE/AMOUNT UNTIL FULL MIGRATION.'], wave: 2 },
  { id: 'DD.OBLIGATIONS', name: 'OBLIGATIONS (BILLS + SUBSCRIPTIONS)', owner: 'F07', readers: ['F03', 'F04', 'F07', 'F08', 'F09', 'F10', 'F12', 'F15'], writers: ['F07', 'F02'], derived: false, currentSource: 'repository obligations[] + wave2Seed from setup/MOCK', currentPersistence: 'DEVICE', targetPersistence: 'REPOSITORY', criteria: 'R- U- Dh Ih S1 V1 E1 M- L- P- A- N-', conflicts: ['F07 UPCOMING IS DERIVED — NOT A SECOND OWNER.'], wave: 2 },
  { id: 'DD.PLAN_ALLOCATIONS', name: 'PLAN INTENTIONS + ASSIGNMENTS', owner: 'F08', readers: ['F08', 'F09', 'F10', 'F11', 'F13', 'F14', 'F15'], writers: ['F08', 'F02', 'F11'], derived: false, currentSource: 'F02 draft priorities[] (names only)', currentPersistence: 'SESSION', targetPersistence: 'REPOSITORY', criteria: 'R- U- Dh I0 S0 V0 E0 M- L- P- A- N-', conflicts: ['PRIORITIES ARE NAMES WITHOUT AMOUNTS; F03 READS priorities[0] AS "FIRST".'], wave: 3 },
  { id: 'DD.PROTECTED_HOLD', name: 'PROTECTED HOLD (RESERVE)', owner: 'F09', readers: ['F03', 'F08', 'F09'], writers: ['F09', 'F02'], derived: false, currentSource: 'F02 draft protectedAmount', currentPersistence: 'SESSION', targetPersistence: 'REPOSITORY', criteria: 'R- U- Dh I1 S1 V1 E- M- L- P- A- N-', conflicts: ['OWNED BY THE SETUP DRAFT TODAY; F08 VS F09 OWNERSHIP RESOLVED HERE AS F09.'], wave: 3 },
  { id: 'DD.SAFE_TO_SPEND', name: 'SAFE TO SPEND (DERIVED)', owner: 'F09', readers: ['F03', 'F09', 'F10', 'F11'], writers: [], derived: true, derivedFrom: ['DD.ACCOUNTS', 'DD.TRANSACTIONS', 'DD.OBLIGATIONS', 'DD.INCOME_SOURCES', 'DD.PLAN_ALLOCATIONS', 'DD.PROTECTED_HOLD'], currentSource: 'money.ts safeToSpend()', currentPersistence: 'NONE', targetPersistence: 'DERIVED (NOT STORED)', criteria: 'R- U- Dh Ih S1 V- E0 M- L- P- A- N-', conflicts: ['COMPUTED IN money.ts (F03 DATA) WHILE F09 IS THE CANONICAL OWNER.', 'MOCK_CASH 8420 IS THE CASH INPUT.', 'SETUP OBLIGATIONS CONTRIBUTE $0.'], wave: 3 },
  { id: 'DD.PURCHASE_CONSIDERATIONS', name: 'PURCHASE CONSIDERATIONS', owner: 'F10', readers: ['F10'], writers: ['F10'], derived: false, currentSource: 'NONE', currentPersistence: 'NONE', targetPersistence: 'REPOSITORY', criteria: 'R- U- D0 I0 S0 V0 E0 M- L- P- A- N-', conflicts: [], wave: 4 },
  { id: 'DD.TRIPS', name: 'TRIPS + COST LINES + FUNDING', owner: 'F11', readers: ['F11', 'F08'], writers: ['F11'], derived: false, currentSource: 'NONE', currentPersistence: 'NONE', targetPersistence: 'REPOSITORY', criteria: 'R- U- D0 I0 S0 V0 E0 M- L- P- A- N-', conflicts: [], wave: 4 },
  { id: 'DD.CREDIT_ATTRIBUTES', name: 'CREDIT ATTRIBUTES (LIMIT, APR, STATEMENT, DUE)', owner: 'F12', readers: ['F05', 'F12', 'F13'], writers: ['F12'], derived: false, currentSource: 'NONE', currentPersistence: 'NONE', targetPersistence: 'REPOSITORY', criteria: 'R- U- D0 I0 S0 V0 E0 M- L- P- A- N-', conflicts: [], wave: 3 },
  { id: 'DD.PAYOFF_PLANS', name: 'PAYOFF PLAN', owner: 'F13', readers: ['F13', 'F15'], writers: ['F13'], derived: false, currentSource: 'NONE', currentPersistence: 'NONE', targetPersistence: 'REPOSITORY', criteria: 'R- U- D0 I0 S0 V0 E0 M- L- P- A- N-', conflicts: [], wave: 4 },
  { id: 'DD.GOALS', name: 'GOALS + SET-ASIDE PROGRESS', owner: 'F14', readers: ['F08', 'F10', 'F11', 'F14', 'F15'], writers: ['F14', 'F02'], derived: false, currentSource: 'F02 draft goalName + goalHorizon', currentPersistence: 'SESSION', targetPersistence: 'REPOSITORY', criteria: 'R- U- Dh I0 S0 Vh E0 M- L- P- A- N-', conflicts: ['ONE GOAL NAME IN THE SETUP DRAFT; NO TARGET OR PROGRESS.'], wave: 3 },
  { id: 'DD.FORECAST_SCENARIOS', name: 'FORECAST BRANCHES + ASSUMPTIONS', owner: 'F15', readers: ['F15'], writers: ['F15'], derived: true, derivedFrom: ['DD.INCOME_SOURCES', 'DD.OBLIGATIONS', 'DD.PLAN_ALLOCATIONS', 'DD.GOALS', 'DD.PAYOFF_PLANS', 'DD.ACCOUNTS'], currentSource: 'NONE', currentPersistence: 'NONE', targetPersistence: 'BASE PATH DERIVED; SAVED BRANCH ASSUMPTIONS IN REPOSITORY', criteria: 'R- U- D0 I0 S0 V0 E0 M- L- P- A- N-', conflicts: [], wave: 4 },
  { id: 'DD.DOCUMENTS', name: 'DOCUMENTS (RECORDS)', owner: 'F16', readers: ['F16', 'F04', 'F05'], writers: ['F16'], derived: false, currentSource: 'NONE', currentPersistence: 'NONE', targetPersistence: 'REPOSITORY METADATA + FILE STORAGE', criteria: 'R- U- D0 I0 S0 V0 E0 M- L- P- A- N-', conflicts: [], wave: 4 },
  { id: 'DD.CURRENCY', name: 'DISPLAY CURRENCY + RATES', owner: 'GS.CURRENCY', readers: ALL, writers: ['GS.SETTINGS', 'GS.ASK_JURNL'], derived: false, currentSource: 'currency.ts', currentPersistence: 'DEVICE', targetPersistence: 'DEVICE (PREFERENCE) — MAY SYNC TO PROFILE', criteria: 'R- U- D1 I1 S1 V1 E1 M- L- P- A- N-', conflicts: ['WRITER IS ASK TODAY; SHOULD BE SETTINGS.'], wave: 1 },
  { id: 'DD.CATEGORIES', name: 'CATEGORY TAXONOMY', owner: 'GS.CATEGORIES', readers: ['F03', 'F04', 'F08', 'F16'], writers: [], derived: false, currentSource: 'FREE STRINGS', currentPersistence: 'NONE', targetPersistence: 'STATIC CATALOG (CODE / MANIFEST)', criteria: 'R- U- D0 I- S- V0 E- M- L- P- A- N-', conflicts: ['MOCK, QUICK ADD AND ICON MAP EACH USE A DIFFERENT SET.'], wave: 0 },
  { id: 'DD.ENTITLEMENTS', name: 'PLAN + ENTITLEMENTS', owner: 'GS.ENTITLEMENTS', readers: ALL, writers: [], derived: false, currentSource: 'JurnlEntitlementsProvider (preview)', currentPersistence: 'NONE', targetPersistence: 'SERVER (DRAFT_SCHEMA.sql, NOT APPLIED)', criteria: 'R- U- Dh I1 S1 V- E- M- L- P- A- N-', conflicts: ['D-14: NO site00_organizations ROW FOR JURNL.'], wave: 5 },
];

/* ───────────────────────── shared primitives ───────────────────────── */

export type Primitive = { id: string; status: 'EXISTING' | 'EXTRACT' | 'PROPOSED'; file: string | null; role: string; consumers: string[]; wave: Wave; notes?: string };

export const SHARED_PRIMITIVES: Primitive[] = [
  { id: 'JurnlButton', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'BUTTON: PRIMARY / SECONDARY / QUIET / DESTRUCTIVE / SOCIAL', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlIconButton', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'BUTTON: UTILITY (ICON + aria-label)', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlInlineAction', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'BUTTON: PANEL_HEADER_ACTION (EDITORIAL UTILITY, TEXT + CHEVRON)', consumers: ['F03', 'F04', 'F05–F16'], wave: 0, notes: 'F03 LEARNING: SECONDARY PANEL-HEADER ACTIONS MAY NEED THIS EDITORIAL UTILITY TREATMENT INSTEAD OF A BOXED CTA. APPLY PER PANEL, NOT BLINDLY.' },
  { id: 'JurnlTextLink', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'BUTTON: INLINE', consumers: ['F01', 'F02'], wave: 0 },
  { id: 'JurnlInput', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'FORM FIELD', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlCheckbox', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'FORM CONTROL', consumers: ['F01', 'F02'], wave: 0 },
  { id: 'JurnlToggle', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'FORM CONTROL', consumers: ['F01', 'GS.SETTINGS'], wave: 0 },
  { id: 'JurnlChoice', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'SELECTION', consumers: ['F02', 'GS.QUICK_ADD', 'F04'], wave: 0 },
  { id: 'JurnlTile', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'ICON TILE', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlRow', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'LIST ROW (SELECTION / DETAIL)', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlPanel', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'PANEL: SIGNAL / EDITORIAL / SELECTION / DETAIL (catalog.ts panelRole)', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlInlineExpansion', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'EXPANDED_STATE CONTAINER', consumers: ['F01', 'F03', 'F06', 'F07', 'F08', 'F12', 'F13', 'F14', 'F15', 'F16'], wave: 0 },
  { id: 'JurnlErrorPanel', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'ERROR STATE (role=alert)', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlSuccessPanel', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'SUCCESS STATE', consumers: ['F01', 'F02'], wave: 0 },
  { id: 'JurnlSuccessBanner', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'TOAST (role=status, aria-live)', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlDrawer', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'DRAWER (SHORT / LONG, dialog, focus trap, Escape)', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlSheet', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'FULL SHEET (dialog, aria-modal)', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlModal', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'MODAL / DESTRUCTIVE CONFIRM (alertdialog)', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlExternalHandoff', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'EXTERNAL APP BOUNDARY', consumers: ['F01'], wave: 0 },
  { id: 'JurnlNativeHandoff', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'NATIVE OS BOUNDARY', consumers: ['F01'], wave: 0 },
  { id: 'JurnlScreen', status: 'EXISTING', file: 'src/projects/jurnl/runtime/screens/JurnlScreen.tsx', role: 'SCREEN SHELL (PLATE / FAMILY PLATE / BONE FIELD)', consumers: ['ALL'], wave: 0, notes: "field='bone' IS THE ZERO-GENERATION FALLBACK FOR NO_PLATE NODES." },
  { id: 'JurnlHeadline', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'TITLE (h1, compact fit)', consumers: ['ALL'], wave: 0 },
  { id: 'useCompactFit', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/primitives.tsx', role: 'TYPOGRAPHIC CONTAINMENT (GLOBAL RULE)', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlProductNav', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/ProductNav.tsx', role: 'GLOBAL NAV DOCK', consumers: ['F03–F16'], wave: 0 },
  { id: 'JurnlTransactionRow', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/TransactionRow.tsx', role: 'LEDGER ROW', consumers: ['F03', 'F04', 'F05', 'F06'], wave: 0, notes: 'markFor() category glyphs are placeholders until the category catalog exists.' },
  { id: 'JurnlIcon', status: 'EXISTING', file: 'src/projects/jurnl/runtime/components/icons.tsx', role: 'ICON (35 code-drawn names)', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlTopChrome', status: 'PROPOSED', file: null, role: 'TOP CHROME: BACK / TITLE / ASK / ACCOUNT', consumers: ['F03–F16'], wave: 0, notes: 'Replaces three per-screen compositions.' },
  { id: 'JurnlAmountField', status: 'EXTRACT', file: 'src/projects/jurnl/runtime/screens/HomeScreens.tsx (QuickAddSheet)', role: 'FORM FIELD: AMOUNT WITH CURRENCY AFFIX, KEYBOARD RAISE', consumers: ['GS.QUICK_ADD', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15'], wave: 0 },
  { id: 'JurnlDateField', status: 'PROPOSED', file: null, role: 'FORM FIELD: DATE (ISO STORAGE, RELATIVE DISPLAY)', consumers: ['GS.QUICK_ADD', 'F05', 'F06', 'F07', 'F11', 'F14', 'F16'], wave: 0 },
  { id: 'JurnlCadencePicker', status: 'EXTRACT', file: 'src/projects/jurnl/runtime/screens/SetupScreens.tsx (F02_CADENCES)', role: 'SELECTION: CADENCE', consumers: ['F02', 'F06', 'F07', 'F08', 'F14'], wave: 0 },
  { id: 'JurnlAccountPicker', status: 'PROPOSED', file: null, role: 'SELECTION: PLACE (REGISTRY-BACKED)', consumers: ['GS.QUICK_ADD', 'F04', 'F05', 'F06', 'F07', 'F12'], wave: 0 },
  { id: 'JurnlCategoryPicker', status: 'PROPOSED', file: null, role: 'SELECTION: CATEGORY (CLOSED CATALOG)', consumers: ['GS.QUICK_ADD', 'F04', 'F16'], wave: 0 },
  { id: 'JurnlSignal', status: 'EXTRACT', file: 'src/projects/jurnl/runtime/screens/HomeScreens.tsx (Today signal) + ParentScreens.tsx', role: 'PANEL: SIGNAL (ONE FIGURE + LABEL + SOURCE)', consumers: ['F03', 'F05–F16'], wave: 0 },
  { id: 'JurnlRecordList', status: 'PROPOSED', file: null, role: 'PANEL: LEDGER / SELECTION LIST WITH EMPTY / LOADING / ERROR SLOTS', consumers: ['F05', 'F06', 'F07', 'F08', 'F10', 'F11', 'F12', 'F14', 'F16'], wave: 0 },
  { id: 'JurnlFieldRows', status: 'EXTRACT', file: 'src/projects/jurnl/runtime/screens/HomeScreens.tsx (DetailSheet / SeeWhySheet rows)', role: 'PANEL: DETAIL (LABEL / VALUE / SOURCE ROWS)', consumers: ['F03', 'F04', 'F05', 'F06', 'F07', 'F09', 'F12', 'F16'], wave: 0 },
  { id: 'JurnlStateBlock', status: 'PROPOSED', file: null, role: 'PANEL: EMPTY / LOADING / STALE / OFFLINE / GATED, REPOSITORY-DRIVEN', consumers: ['ALL'], wave: 0 },
  { id: 'JurnlProgress', status: 'PROPOSED', file: null, role: 'PANEL: ANALYSIS — QUIET PROPORTION (GOAL, UTILIZATION, PATH). NOT GAMIFIED, NOT A DIAL.', consumers: ['F12', 'F13', 'F14'], wave: 0 },
  { id: 'JurnlComparePair', status: 'PROPOSED', file: null, role: 'PANEL: ANALYSIS — BEFORE / AFTER PAIR (WHAT CHANGES)', consumers: ['F10', 'F13', 'F15'], wave: 0 },
  { id: 'JurnlSequence', status: 'PROPOSED', file: null, role: 'PANEL: LEDGER — NEXT / THEN / LATER SEQUENCE', consumers: ['F03', 'F07'], wave: 0 },
  { id: 'JurnlFileField', status: 'PROPOSED', file: null, role: 'FORM FIELD: FILE ATTACH + PREVIEW', consumers: ['F16'], wave: 4 },
  { id: 'JurnlDocumentViewer', status: 'PROPOSED', file: null, role: 'PANEL: DETAIL — DOCUMENT VIEW', consumers: ['F16'], wave: 4 },
  { id: 'JurnlRepository', status: 'PROPOSED', file: null, role: 'DATA: DOMAIN REPOSITORY INTERFACE + DEVICE ADAPTER (+ SERVER ADAPTER AT LAUNCH)', consumers: ['ALL'], wave: 0 },
];

export const ROLE_MAP = {
  panels: {
    SIGNAL: { primitive: 'JurnlSignal + JurnlPanel(panelRole=signal)', examples: ['F03 SAFE TO SPEND', 'F09 SIGNAL', 'F05 FOUR PLACES'] },
    LEDGER: { primitive: 'JurnlRecordList + JurnlTransactionRow / JurnlSequence', examples: ['F04 LEDGER', 'F03 COMING / MOVED', 'F07 SEQUENCE'] },
    EDITORIAL: { primitive: 'JurnlPanel(panelRole=editorial)', examples: ['F05 HOW IT SITS', 'F14 MEANING'] },
    SELECTION: { primitive: 'JurnlRecordList + JurnlRow / JurnlChoice', examples: ['F05.ACCOUNTS', 'F06.SOURCES', 'F12.ACCOUNTS'] },
    DETAIL: { primitive: 'JurnlFieldRows + JurnlPanel(panelRole=detail)', examples: ['F04 DETAIL', 'F07.ITEM', 'F12.ACCOUNT', 'F16.DOCUMENT'] },
    FORM: { primitive: 'JurnlSheet + JurnlInput / JurnlAmountField / JurnlDateField / pickers', examples: ['QUICK ADD', 'F05.SH.ADD_PLACE', 'F14.SH.NAME_GOAL'] },
    EMPTY: { primitive: 'JurnlStateBlock', examples: ['F07.ST.CLEAR', 'F10.ST.NONE', 'F15.ST.THIN'] },
    ANALYSIS: { primitive: 'JurnlComparePair / JurnlProgress', examples: ['F10.DECISION', 'F13.WHAT_IF', 'F15.BRANCH', 'F12 UTILIZATION'] },
  },
  buttons: {
    PRIMARY: 'JurnlButton variant=primary — ONE PER SCREEN (THE PARENT CONTRACT PRIMARY ACTION).',
    SECONDARY: 'JurnlButton variant=secondary.',
    UTILITY: 'JurnlIconButton — TOP CHROME, CLOSE, FILTER.',
    APPROVAL: 'JurnlButton variant=primary INSIDE A CONFIRM (SAVE, KEEP THIS PATH).',
    DESTRUCTIVE: 'JurnlButton variant=destructive INSIDE JurnlModal (REMOVE / DELETE / SIGN OUT).',
    INLINE: 'JurnlTextLink.',
    PANEL_HEADER_ACTION: 'JurnlInlineAction — EDITORIAL UTILITY (F03 MORE / ACTIVITY). F03 LEARNING: SECONDARY PANEL-HEADER ACTIONS MAY NEED THIS INSTEAD OF A BOXED CTA; DECIDE PER PANEL.',
  },
};

/* ───────────────────────── icons ───────────────────────── */

export type IconReq = {
  id: string;
  class: 'GLOBAL_NAV' | 'GLOBAL_UTILITY' | 'FINANCIAL_CATEGORY' | 'FAMILY_SPECIFIC' | 'DATA_STATUS' | 'ACTION' | 'OTHER';
  meaning: string;
  families: string[];
  status: 'EXISTING_CANONICAL' | 'REUSABLE' | 'MISSING' | 'DUPLICATED' | 'PLACEHOLDER';
  current: string | null;
  notes?: string;
};

const sheet = (ids: string[], cls: IconReq['class'], families: string[]): IconReq[] =>
  ids.map((id) => ({ id: `ICON.${id.toUpperCase().replace(/-/g, '_')}`, class: cls, meaning: id.toUpperCase().replace(/-/g, ' '), families, status: 'EXISTING_CANONICAL', current: id }));

export const ICON_REQUIREMENTS: IconReq[] = [
  // GLOBAL_NAV
  { id: 'ICON.NAV_HOME', class: 'GLOBAL_NAV', meaning: 'HOME (F03)', families: ['GLOBAL'], status: 'PLACEHOLDER', current: 'account', notes: 'F03_PARENT_REFINEMENT_QA: ICON_AUTHORITY_MISSING. Uses the account glyph.' },
  { id: 'ICON.NAV_MONEY', class: 'GLOBAL_NAV', meaning: 'MONEY (F05)', families: ['GLOBAL'], status: 'PLACEHOLDER', current: 'money', notes: 'Code-drawn; not on the F01 sheet (ICON_AUTHORITY_MISSING).' },
  { id: 'ICON.NAV_ADD', class: 'GLOBAL_NAV', meaning: 'QUICK ADD', families: ['GLOBAL'], status: 'EXISTING_CANONICAL', current: 'plus', notes: 'Double plus fixed in F03 refinement.' },
  { id: 'ICON.NAV_PLAN', class: 'GLOBAL_NAV', meaning: 'PLAN (F08)', families: ['GLOBAL'], status: 'DUPLICATED', current: 'clock', notes: 'Same glyph as RECURRING. ICON_AUTHORITY_MISSING.' },
  { id: 'ICON.NAV_CREDIT', class: 'GLOBAL_NAV', meaning: 'CREDIT (F12)', families: ['GLOBAL'], status: 'DUPLICATED', current: 'document', notes: 'Same glyph as DOCUMENT and the default category. ICON_AUTHORITY_MISSING.' },
  // GLOBAL_UTILITY from the F01 sheet
  ...sheet(['back', 'close', 'info', 'chevron', 'search', 'filter', 'external', 'link', 'check', 'alert', 'offline', 'resend', 'lock', 'eye', 'eye-off', 'email'], 'GLOBAL_UTILITY', ['GLOBAL']),
  { id: 'ICON.SETTINGS', class: 'GLOBAL_UTILITY', meaning: 'ACCOUNT / SETTINGS ENTRY', families: ['GLOBAL'], status: 'REUSABLE', current: 'gear', notes: 'gear exists (F01.12 sessions row).' },
  // F01 trust family (existing)
  ...sheet(['apple', 'google'], 'OTHER', ['F01']),
  ...sheet(['face-id', 'fingerprint', 'device', 'laptop', 'shield', 'privacy', 'account', 'switch-account', 'chip', 'database'], 'FAMILY_SPECIFIC', ['F01']),
  // FINANCIAL_CATEGORY (proposed closed catalog; existing mock categories first)
  { id: 'ICON.CAT_HOUSING', class: 'FINANCIAL_CATEGORY', meaning: 'HOUSING / RENT', families: ['F03', 'F04', 'F07', 'F08'], status: 'PLACEHOLDER', current: 'account', notes: 'markFor HOUSING → account. F03 QA rent_row ICON_AUTHORITY_MISSING.' },
  { id: 'ICON.CAT_FOOD', class: 'FINANCIAL_CATEGORY', meaning: 'FOOD / GROCERIES', families: ['F03', 'F04', 'F08'], status: 'PLACEHOLDER', current: 'money', notes: 'markFor FOOD → money. groceries_row / market_row missing.' },
  { id: 'ICON.CAT_CLOTHING', class: 'FINANCIAL_CATEGORY', meaning: 'CLOTHING', families: ['F03', 'F04'], status: 'PLACEHOLDER', current: 'document', notes: 'atelier_row missing; falls to default.' },
  { id: 'ICON.CAT_MEMBERSHIP', class: 'FINANCIAL_CATEGORY', meaning: 'MEMBERSHIP / SUBSCRIPTION', families: ['F04', 'F07'], status: 'PLACEHOLDER', current: 'clock', notes: 'recurring → clock.' },
  { id: 'ICON.CAT_INCOME', class: 'FINANCIAL_CATEGORY', meaning: 'INCOME / PAY', families: ['F03', 'F04', 'F06'], status: 'PLACEHOLDER', current: 'download', notes: 'income → download.' },
  { id: 'ICON.CAT_OTHER', class: 'FINANCIAL_CATEGORY', meaning: 'OTHER', families: ['F04'], status: 'PLACEHOLDER', current: 'document' },
  { id: 'ICON.CAT_TRANSPORT', class: 'FINANCIAL_CATEGORY', meaning: 'TRANSPORT', families: ['F04', 'F08'], status: 'MISSING', current: null, notes: 'PROPOSED; pending the category catalog decision.' },
  { id: 'ICON.CAT_UTILITIES', class: 'FINANCIAL_CATEGORY', meaning: 'UTILITIES', families: ['F04', 'F07'], status: 'MISSING', current: null, notes: 'PROPOSED.' },
  { id: 'ICON.CAT_HEALTH', class: 'FINANCIAL_CATEGORY', meaning: 'HEALTH', families: ['F04', 'F08'], status: 'MISSING', current: null, notes: 'PROPOSED.' },
  { id: 'ICON.CAT_TRAVEL', class: 'FINANCIAL_CATEGORY', meaning: 'TRAVEL', families: ['F04', 'F08', 'F11'], status: 'MISSING', current: null, notes: 'F02 priority TRAVEL.' },
  { id: 'ICON.CAT_DEBT', class: 'FINANCIAL_CATEGORY', meaning: 'DEBT PAYMENT', families: ['F04', 'F08', 'F13'], status: 'MISSING', current: null, notes: 'F02 priority DEBT.' },
  { id: 'ICON.CAT_TRANSFER', class: 'FINANCIAL_CATEGORY', meaning: 'TRANSFER BETWEEN PLACES', families: ['F04', 'F05'], status: 'MISSING', current: null },
  { id: 'ICON.KIND_CASH', class: 'FINANCIAL_CATEGORY', meaning: 'PLACE KIND: CASH / CHECKING', families: ['F05', 'GS.QUICK_ADD'], status: 'MISSING', current: null },
  { id: 'ICON.KIND_SAVINGS', class: 'FINANCIAL_CATEGORY', meaning: 'PLACE KIND: SAVINGS', families: ['F05'], status: 'MISSING', current: null },
  { id: 'ICON.KIND_CARD', class: 'FINANCIAL_CATEGORY', meaning: 'PLACE KIND: CARD', families: ['F05', 'F12'], status: 'REUSABLE', current: 'chip', notes: 'chip exists (F01 sheet); reuse needs founder sign-off.' },
  { id: 'ICON.KIND_LOAN', class: 'FINANCIAL_CATEGORY', meaning: 'PLACE KIND: LOAN', families: ['F05', 'F12', 'F13'], status: 'MISSING', current: null },
  // DATA_STATUS
  { id: 'ICON.STATUS_PENDING', class: 'DATA_STATUS', meaning: 'PENDING / STILL MOVING', families: ['F04'], status: 'MISSING', current: null, notes: 'Text-only today.' },
  { id: 'ICON.STATUS_RECURRING', class: 'DATA_STATUS', meaning: 'RECURRING', families: ['F04', 'F07'], status: 'DUPLICATED', current: 'clock', notes: 'Shares the PLAN nav glyph.' },
  { id: 'ICON.STATUS_STALE', class: 'DATA_STATUS', meaning: 'STALE / AS OF', families: ['F03', 'F05'], status: 'REUSABLE', current: 'resend' },
  { id: 'ICON.STATUS_OFFLINE', class: 'DATA_STATUS', meaning: 'OFFLINE', families: ['GLOBAL'], status: 'REUSABLE', current: 'offline' },
  { id: 'ICON.STATUS_ADDED', class: 'DATA_STATUS', meaning: 'ADDED BY HAND', families: ['F04'], status: 'MISSING', current: null },
  // ACTION
  { id: 'ICON.ACTION_ADD', class: 'ACTION', meaning: 'ADD', families: ['F05–F16'], status: 'REUSABLE', current: 'plus' },
  { id: 'ICON.ACTION_EDIT', class: 'ACTION', meaning: 'EDIT', families: ['F04–F16'], status: 'MISSING', current: null },
  { id: 'ICON.ACTION_DELETE', class: 'ACTION', meaning: 'DELETE / REMOVE', families: ['F04–F16', 'GS.SETTINGS'], status: 'REUSABLE', current: 'trash' },
  { id: 'ICON.ACTION_EXPORT', class: 'ACTION', meaning: 'EXPORT', families: ['F16', 'GS.SETTINGS'], status: 'REUSABLE', current: 'download', notes: 'download also marks INCOME rows; resolve when the category catalog lands.' },
  { id: 'ICON.ACTION_UPLOAD', class: 'ACTION', meaning: 'FILE / ATTACH', families: ['F16'], status: 'MISSING', current: null },
  { id: 'ICON.ACTION_MOVE', class: 'ACTION', meaning: 'MOVE BETWEEN PLACES', families: ['F05'], status: 'MISSING', current: null },
  { id: 'ICON.ACTION_MARK_PAID', class: 'ACTION', meaning: 'MARK PAID', families: ['F07'], status: 'REUSABLE', current: 'check' },
  { id: 'ICON.ACTION_REORDER', class: 'ACTION', meaning: 'REORDER', families: ['F08'], status: 'MISSING', current: null },
  // FAMILY_SPECIFIC (one per family job where a row needs a mark)
  { id: 'ICON.F06_SOURCE', class: 'FAMILY_SPECIFIC', meaning: 'INCOME SOURCE', families: ['F06'], status: 'MISSING', current: null },
  { id: 'ICON.F07_DUE', class: 'FAMILY_SPECIFIC', meaning: 'DUE DATE', families: ['F07'], status: 'MISSING', current: null },
  { id: 'ICON.F09_HOLD', class: 'FAMILY_SPECIFIC', meaning: 'PROTECTED HOLD', families: ['F09'], status: 'REUSABLE', current: 'shield' },
  { id: 'ICON.F10_OBJECT', class: 'FAMILY_SPECIFIC', meaning: 'OBJECT UNDER CONSIDERATION', families: ['F10'], status: 'MISSING', current: null },
  { id: 'ICON.F11_TRIP', class: 'FAMILY_SPECIFIC', meaning: 'TRIP / DESTINATION', families: ['F11'], status: 'MISSING', current: null },
  { id: 'ICON.F12_UTILIZATION', class: 'FAMILY_SPECIFIC', meaning: 'UTILIZATION', families: ['F12'], status: 'MISSING', current: null },
  { id: 'ICON.F13_PATH', class: 'FAMILY_SPECIFIC', meaning: 'PAYDOWN PATH', families: ['F13'], status: 'MISSING', current: null },
  { id: 'ICON.F14_GOAL', class: 'FAMILY_SPECIFIC', meaning: 'GOAL', families: ['F14'], status: 'MISSING', current: null },
  { id: 'ICON.F15_BRANCH', class: 'FAMILY_SPECIFIC', meaning: 'FORECAST BRANCH', families: ['F15'], status: 'MISSING', current: null },
  { id: 'ICON.F16_DOCUMENT', class: 'FAMILY_SPECIFIC', meaning: 'DOCUMENT', families: ['F16'], status: 'DUPLICATED', current: 'document', notes: 'Shares the CREDIT nav glyph and the default category.' },
];

/* ───────────────────────── blockers ───────────────────────── */

export type Blocker = {
  id: string;
  severity: 'CRITICAL_PATH' | 'HIGH' | 'MEDIUM' | 'LOW';
  blocks: 'FUNCTIONAL' | 'LAUNCH' | 'VISUAL';
  title: string;
  evidence: string;
  affects: string[];
  resolution: string;
  wave: Wave;
  founderDecision?: string;
};

export const BLOCKERS: Blocker[] = [
  { id: 'B01', severity: 'CRITICAL_PATH', blocks: 'FUNCTIONAL', title: 'NO USER-SCOPED PERSISTENCE', evidence: 'money.ts added[] in memory; setupDraft sessionStorage; MOCK_CASH / MOCK_ENTRIES / MOCK_UPCOMING; no JURNL tables.', affects: ['GS.PERSISTENCE', 'DD.*', 'F02–F16'], resolution: 'W0.3 REPOSITORY CONTRACT + DEVICE ADAPTER; RETIRE MOCK AS A DATA SOURCE (KEEP AS A PREVIEW SCENARIO).', wave: 0 },
  { id: 'B02', severity: 'CRITICAL_PATH', blocks: 'FUNCTIONAL', title: 'NO DATE MODEL', evidence: "LedgerEntry.when is a string; FilterSheet WHEN hard-codes weekdays; quick add writes 'TODAY'.", affects: ['GS.DATE_MODEL', 'F03', 'F04', 'F06', 'F07', 'F09', 'F11', 'F13', 'F14', 'F15'], resolution: 'W0.1 ISO DATES + CADENCE MATH + RELATIVE FORMATTER.', wave: 0 },
  { id: 'B03', severity: 'CRITICAL_PATH', blocks: 'FUNCTIONAL', title: 'NO ACCOUNT REGISTRY', evidence: 'QuickAddSheet / FilterSheet hard-code CHECKING / CARD; F02 keeps one name.', affects: ['DD.ACCOUNTS', 'GS.ACCOUNT_REGISTRY', 'F04', 'F05', 'F12', 'F13', 'GS.QUICK_ADD'], resolution: 'W0.4 ACCOUNTS DOMAIN + JurnlAccountPicker; F05 UI IN W2.', wave: 0 },
  { id: 'B04', severity: 'CRITICAL_PATH', blocks: 'FUNCTIONAL', title: 'SAFE TO SPEND IGNORES SETUP OBLIGATIONS', evidence: 'safeToSpend(): upcomingItems = draft.obligations.length ? [] : MOCK_UPCOMING; upcomingFor() maps setup obligations with amount 0. The core signal under-counts what is due.', affects: ['DD.SAFE_TO_SPEND', 'F03.00', 'F03.SEE_WHY', 'F09'], resolution: 'W0.6 MOVE THE FORMULA TO AN F09-OWNED MODULE; OBLIGATIONS WITHOUT AN AMOUNT MARK THE SIGNAL PARTIAL (NEVER $0); F07 CAPTURES AMOUNTS IN W2.', wave: 0 },
  { id: 'B05', severity: 'CRITICAL_PATH', blocks: 'FUNCTIONAL', title: 'F05–F16 CHILDREN DO NOT EXIST', evidence: 'ParentAuthorityScreen renders a static spec with a disabled NOT OPEN YET CTA for all 12 families; expression trees mark children "Not built".', affects: ['F05–F16'], resolution: 'W2–W4 FAMILY STRUCTURAL COMPLETION ON NEUTRAL PRESENTATION.', wave: 2 },
  { id: 'B06', severity: 'CRITICAL_PATH', blocks: 'FUNCTIONAL', title: 'NINE FAMILIES ARE UNREACHABLE FROM THE PRODUCT', evidence: 'Only F03→F04 and nav → F05 / F08 / F12 exist. F06, F07, F09, F10, F11, F13, F14, F15, F16 are reachable through the review board or a typed URL.', affects: ['GS.FAMILY_DISCOVERY', 'F06', 'F07', 'F09', 'F10', 'F11', 'F13', 'F14', 'F15', 'F16'], resolution: 'W0.7 FAMILY REGISTRY + GS.FAMILY_DISCOVERY HUB LINKS (FF.DISCOVERY_HUBS MAPPING).', wave: 0, founderDecision: 'FF.DISCOVERY_HUBS' },
  { id: 'B07', severity: 'HIGH', blocks: 'FUNCTIONAL', title: 'NO POST-ENTRY ACCOUNT / SETTINGS SURFACE', evidence: 'Export, delete, sessions, AI access live only in F01.11 / F01.12 during entry; sign out only on F01.04.', affects: ['GS.SETTINGS', 'GS.CONSENT', 'GS.CURRENCY'], resolution: 'W1.1 SETTINGS SURFACE REUSING F01.11 / F01.12 DRAWERS.', wave: 1, founderDecision: 'FF.SETTINGS_PLACEMENT' },
  { id: 'B08', severity: 'HIGH', blocks: 'FUNCTIONAL', title: 'NO CATEGORY TAXONOMY', evidence: 'Free-string categories in three different sets; markFor placeholders.', affects: ['GS.CATEGORIES', 'F04', 'F03', 'F08', 'F16'], resolution: 'W0.2 CLOSED CATEGORY CATALOG + PICKER.', wave: 0, founderDecision: 'FF.CATEGORY_SET' },
  { id: 'B09', severity: 'HIGH', blocks: 'FUNCTIONAL', title: 'MOVEMENTS CANNOT BE EDITED OR DELETED', evidence: 'DetailSheet is read-only.', affects: ['F04', 'GS.TRANSACTION_DETAIL', 'GS.QUICK_ADD'], resolution: 'W1.4 EDIT / DELETE ON HAND-ADDED MOVEMENTS.', wave: 1 },
  { id: 'B10', severity: 'HIGH', blocks: 'FUNCTIONAL', title: 'LOADING / EMPTY / ERROR / STALE ARE PREVIEW-FORCED ONLY', evidence: 'todayModeFromQuery: only PARTIAL / CONNECTED derive without ?state; ActivityScreen loading / error / empty forced.', affects: ['GS.STATE_PATTERNS', 'F03', 'F04'], resolution: 'W0.5 REPOSITORY STATUS → STATE; ?state STAYS A PREVIEW SWITCH.', wave: 0 },
  { id: 'B11', severity: 'HIGH', blocks: 'FUNCTIONAL', title: 'F05–F16 HAVE NO FAMILY PRODUCTION CONTRACTS; REGISTRY LISTS F01–F04', evidence: 'jurnlProject.ts families = F01–F04; productTree.ts lists F02–F16 NOT_STARTED.', affects: ['F05–F16'], resolution: 'W0.7 REGISTER F05–F16 WITH CONTRACTS GENERATED FROM THIS BLUEPRINT (STATUS STRUCTURE_ONLY / PLACEHOLDER, NO APPROVAL CLAIMS).', wave: 0 },
  { id: 'B12', severity: 'HIGH', blocks: 'FUNCTIONAL', title: 'BANK CONNECTION IS SIMULATED BUT SHOWN AS CONNECTED', evidence: 'F02.02 permission → draft accounts = CONNECTED; no aggregator anywhere.', affects: ['F02.02', 'F02.DR.PERMISSION', 'GS.BANK_CONNECTION'], resolution: 'W1.5 MANUAL-FIRST RELABEL (NO PRETEND CONNECTION) UNLESS THE FOUNDER CHOOSES A PROVIDER.', wave: 1, founderDecision: 'FF.BANK_AGGREGATION' },
  { id: 'B13', severity: 'HIGH', blocks: 'FUNCTIONAL', title: 'F16 HAS NO FILE STORAGE', evidence: 'No storage path for JURNL documents.', affects: ['F16', 'GS.FILE_STORAGE'], resolution: 'W4 DEVICE BLOB ADAPTER BEHIND THE REPOSITORY.', wave: 4 },
  { id: 'B14', severity: 'MEDIUM', blocks: 'FUNCTIONAL', title: 'ASK JURNL IS STATIC AND ONLY ON F03 / F04; CURRENCY SELECTOR LIVES INSIDE IT', evidence: 'AskSheet static sentence; ParentAuthorityScreen has no ask.', affects: ['GS.ASK_JURNL', 'F05–F16'], resolution: 'W1.2 FAMILY-AWARE EXPLANATION FROM DERIVED VALUES; SELECTOR TO SETTINGS. NO LLM WITHOUT A FOUNDER DECISION.', wave: 1, founderDecision: 'FF.ASK_SCOPE' },
  { id: 'B15', severity: 'MEDIUM', blocks: 'FUNCTIONAL', title: 'CONSENT IS STORED TWICE', evidence: 'F01.11 AI ACCESS (device) vs F02.07 consents (session draft).', affects: ['GS.CONSENT', 'DD.CONSENT'], resolution: 'W1.6 ONE CONSENT RECORD.', wave: 1 },
  { id: 'B16', severity: 'MEDIUM', blocks: 'FUNCTIONAL', title: 'TOP CHROME IS COMPOSED PER SCREEN', evidence: 'Three variants; no shared component.', affects: ['GS.TOP_CHROME', 'F03–F16'], resolution: 'W0.8 JurnlTopChrome.', wave: 0 },
  { id: 'B17', severity: 'LOW', blocks: 'FUNCTIONAL', title: 'TODAY BACK RETURNS TO SETUP', evidence: 'HomeScreens.tsx back → F02.08 "BACK TO SETUP" on the daily home.', affects: ['F03.NAV.BACK'], resolution: 'W1 TOP CHROME: AFTER SETUP COMPLETE, HOME HAS NO BACK (ACCOUNT ENTRY INSTEAD).', wave: 1 },
  { id: 'B18', severity: 'CRITICAL_PATH', blocks: 'FUNCTIONAL', title: 'NO PRODUCTION AUTH PROVIDER (PREVIEW STORES PLAINTEXT PASSWORDS) — GATES F01 FUNCTIONAL AND LAUNCH', evidence: 'adapters.ts DESIGN_PREVIEW / UNCONFIGURED; jurnlProject.ts authNote; D-17 / D-18.', affects: ['GS.AUTH', 'F01', 'DD.IDENTITY'], resolution: 'W5.1 PRODUCTION ADAPTER BEHIND JurnlAuthAdapter.', wave: 5, founderDecision: 'FF.AUTH_PROVIDER' },
  { id: 'B19', severity: 'CRITICAL_PATH', blocks: 'LAUNCH', title: 'NO SERVER PERSISTENCE, SCHEMA OR RLS', evidence: 'DRAFT_SCHEMA.sql NOT APPLIED; D-14 no site00_organizations row.', affects: ['GS.PERSISTENCE', 'DD.*', 'GS.ENTITLEMENTS'], resolution: 'W5.2 SERVER ADAPTER + MIGRATIONS + RLS + SECURITY TESTS.', wave: 5 },
  { id: 'B20', severity: 'HIGH', blocks: 'FUNCTIONAL', title: 'EMAIL, SOCIAL AND NATIVE BIOMETRIC PROVIDERS ARE SIMULATED', evidence: 'No email is sent; social returns PROVIDER_NOT_CONFIGURED; biometric bridge simulated.', affects: ['F01.02', 'F01.04', 'F01.05', 'F01.06', 'F01.07', 'F01.09', 'GS.NATIVE_BRIDGE'], resolution: 'W5.1 WITH THE AUTH PROVIDER; W5.5 NATIVE SHELL.', wave: 5 },
  { id: 'B21', severity: 'MEDIUM', blocks: 'LAUNCH', title: 'NO NOINDEX FOR AN AUTHENTICATED PRODUCT', evidence: 'No noindex / robots / X-Robots-Tag; guard skipped on localhost + fsbw-dev.', affects: ['GS.SEO_NOINDEX'], resolution: 'W5.3.', wave: 5 },
  { id: 'B22', severity: 'MEDIUM', blocks: 'LAUNCH', title: 'ANALYTICS NOT WIRED', evidence: 'user_activity has no migration; monetization events never sent.', affects: ['GS.ANALYTICS'], resolution: 'W5.4 REUSE trackActivity + buildMonetizationEvent.', wave: 5 },
  { id: 'B23', severity: 'MEDIUM', blocks: 'LAUNCH', title: 'NO AUTOMATED ACCESSIBILITY AUDIT', evidence: 'Semantics exist (dialog, alert, switch, nav landmark, reduced motion); no axe / screen-reader pass for JURNL.', affects: ['ALL'], resolution: 'W5.6.', wave: 5 },
  { id: 'B24', severity: 'MEDIUM', blocks: 'LAUNCH', title: 'REVIEW CHROME SHIPS IN THE PRODUCT RUNTIME', evidence: 'BOARD utility button on every F05–F16 parent; /parents review board route.', affects: ['F05–F16'], resolution: 'W5.7 HIDE REVIEW CHROME OUTSIDE design-preview.', wave: 5 },
  { id: 'B25', severity: 'MEDIUM', blocks: 'LAUNCH', title: 'PRE-EXISTING RED TEST ON MAIN', evidence: 'tests/jurnlMonetizationFoundation "no price strings" fails on currency.ts (d2915e32).', affects: ['GS.CURRENCY'], resolution: 'W0.9 RECONCILE THE TEST WITH THE CURRENCY CONTRACT.', wave: 0 },
  { id: 'B26', severity: 'LOW', blocks: 'LAUNCH', title: 'EXCHANGE RATES FETCHED CLIENT-SIDE WITHOUT A PROXY', evidence: 'open.er-api.com called from the browser.', affects: ['GS.EXCHANGE_RATES'], resolution: 'W5.2 SERVER PROXY.', wave: 5 },
  { id: 'B27', severity: 'MEDIUM', blocks: 'VISUAL', title: 'EIGHT PARENT AUTHORITIES FAIL PLATE INTERFERENCE', evidence: 'catalog.ts interference FAIL: F08, F09, F10, F11, F13, F14, F15, F16; reuse matrix should_replace true.', affects: ['F08.00', 'F09.00', 'F10.00', 'F11.00', 'F13.00', 'F14.00', 'F15.00', 'F16.00'], resolution: 'VISUAL TRACK (FAMILY BY FAMILY, AFTER FUNCTIONAL).', wave: 5 },
  { id: 'B28', severity: 'LOW', blocks: 'VISUAL', title: 'NAV AND CATEGORY ICON AUTHORITY MISSING', evidence: 'F03_PARENT_REFINEMENT_QA: home, money, plan, credit, rent, groceries, atelier, market missing from the sheet.', affects: ['GS.BOTTOM_NAV', 'GS.CATEGORIES'], resolution: 'JURNL GLOBAL ICON SYSTEM (VISUAL TRACK).', wave: 5 },
  { id: 'B29', severity: 'LOW', blocks: 'VISUAL', title: 'DOC DRIFT ON CURRENCY AND THE F03 PLATE', evidence: 'GLOBAL_COMPOSITION_RULES + CORE.md:297 say no FX; CORE.md:295 says F03 plate SHOULD_REPLACE while matrices say PASS.', affects: ['GS.CURRENCY', 'F03.00'], resolution: 'DOC RECONCILIATION (NO CODE).', wave: 0 },
];

/* ───────────────────────── founder flags (real product judgment only) ───────────────────────── */

export const FOUNDER_FLAGS: { id: string; question: string; default: string; blocks: string[] }[] = [
  { id: 'FF.DISCOVERY_HUBS', question: 'Confirm how non-nav families are reached: HOME→F04/F07/F09 · MONEY→F06/F16 · PLAN→F09/F10/F11/F14/F15 · CREDIT→F13.', default: 'PROPOSED MAPPING ABOVE.', blocks: ['B06'] },
  { id: 'FF.SETTINGS_PLACEMENT', question: 'Where does the account / settings surface live after entry?', default: 'TOP-CHROME ACCOUNT ENTRY ON HOME; NO SIXTH NAV ITEM.', blocks: ['B07'] },
  { id: 'FF.BANK_AGGREGATION', question: 'Launch manual-first, or with a bank aggregation provider?', default: 'MANUAL-FIRST; RELABEL F02.02 CONNECT.', blocks: ['B12'] },
  { id: 'FF.AUTH_PROVIDER', question: 'Which end-user auth provider does JURNL use? (SITE 00 Supabase is not reused per jurnlProject.ts.)', default: 'UNRESOLVED. REQUIRED FOR F01 TO REACH 100% FUNCTIONAL (IDENTITY CANNOT BE DEVICE-ONLY) AND FOR LAUNCH. NOT A GENERATION DEPENDENCY.', blocks: ['B18'] },
  { id: 'FF.CREDIT_SCORE_SOURCE', question: 'Does F12 ever show a bureau score, or utilization + accounts only?', default: 'UTILIZATION + ACCOUNTS ONLY (MATCHES "NOT A SCORE DIAL").', blocks: [] },
  { id: 'FF.ASK_SCOPE', question: 'Ask JURNL: explanation-only from derived values, or an LLM provider?', default: 'EXPLANATION-ONLY, READ-ONLY, NO WRITES.', blocks: ['B14'] },
  { id: 'FF.NOTIFICATIONS', question: 'Are notifications in launch scope (only F07 due-soon is evidenced)?', default: 'OUT OF SCOPE.', blocks: [] },
  { id: 'FF.BUSINESS_EXTENSION_TIMING', question: 'When does the JURNL BUSINESS EXTENSION (anchored in F16) ship?', default: 'AFTER CORE 100% FUNCTIONAL.', blocks: [] },
  { id: 'FF.SEE_WHY_VS_F09', question: 'F03 SEE WHY "does not open F09" — keep it closed, or add a footer link to the full F09 reading?', default: 'ADD THE FOOTER LINK (ONE FORMULA, TWO DEPTHS).', blocks: [] },
  { id: 'FF.CATEGORY_SET', question: 'Confirm the closed category catalog (proposed: HOUSING, FOOD, CLOTHING, MEMBERSHIP, INCOME, TRANSPORT, UTILITIES, HEALTH, TRAVEL, DEBT PAYMENT, TRANSFER, OTHER).', default: 'PROPOSED SET.', blocks: ['B08'] },
];

/* ───────────────────────── implementation waves ───────────────────────── */

export type WaveTask = {
  id: string;
  wave: Wave;
  title: string;
  scope: string;
  dependsOn: string[];
  files: string[];
  pass: string[];
  complexity: 'S' | 'M' | 'L';
  collisionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  parallelGroup: string;
};

export const WAVE_TITLES: Record<Wave, string> = {
  0: 'FOUNDATIONS — DATA CONTRACTS, REPOSITORY, DATE / CATEGORY / ACCOUNT MODELS, SHARED PRIMITIVES',
  1: 'GLOBAL SYSTEMS — SETTINGS, DISCOVERY, QUICK ADD V2, ASK EVERYWHERE, LEDGER EDIT, HONEST CONNECT',
  2: 'SOURCE FAMILIES — F05 MONEY, F06 INCOME, F07 UPCOMING',
  3: 'DERIVED + PLANNING FAMILIES — F08 PLAN, F09 SAFE TO SPEND, F12 CREDIT, F14 GOALS; F03 RE-POINTED',
  4: 'DECISION + PROJECTION FAMILIES — F10 PURCHASES, F11 TRIPS, F13 PAYDOWN, F15 AHEAD, F16 RECORDS',
  5: 'PRODUCTION ADAPTERS + LAUNCH GATES — AUTH, SERVER PERSISTENCE, PROVIDERS, SEO, ANALYTICS, A11Y AUDIT',
};

const RT = 'src/projects/jurnl/runtime';
const DATA = 'src/projects/jurnl/data';

export const WAVE_TASKS: WaveTask[] = [
  { id: 'W0.1', wave: 0, title: 'DATE MODEL', scope: 'ISO date type, cadence math (F02_CADENCES), next occurrence, relative formatter (TODAY / YESTERDAY / WEEKDAY / DATE).', dependsOn: [], files: [`${DATA}/home/dates.ts (new)`, `${DATA}/home/money.ts`], pass: ['Unit tests for cadence + relative display across month ends and DST.', 'LedgerEntry.when becomes an ISO date; display unchanged for existing mock scenario.'], complexity: 'M', collisionRisk: 'MEDIUM', parallelGroup: 'W0-A' },
  { id: 'W0.2', wave: 0, title: 'CATEGORY CATALOG', scope: 'Closed category list + icon binding table (placeholder glyphs allowed, flagged) + JurnlCategoryPicker.', dependsOn: [], files: [`${DATA}/home/categories.ts (new)`, `${RT}/components/TransactionRow.tsx`, 'JURNL/MANIFEST/JURNL_CATEGORY_CATALOG.json (new)'], pass: ['Every mock and quick-add category maps to the catalog.', 'markFor() reads the catalog.'], complexity: 'S', collisionRisk: 'LOW', parallelGroup: 'W0-A' },
  { id: 'W0.3', wave: 0, title: 'REPOSITORY CONTRACT + DEVICE ADAPTER', scope: 'Typed repository per data domain (list/get/create/update/remove/subscribe, status, asOf) with a localStorage/IndexedDB device adapter; MOCK becomes a seed scenario, not a source.', dependsOn: [], files: [`${DATA}/repository/ (new)`, `${DATA}/home/money.ts`, `${DATA}/f02/setupDraft.ts`], pass: ['Data survives reload.', 'Design-preview ?scenario still seeds mock data.', 'No financial data leaves the device.'], complexity: 'L', collisionRisk: 'HIGH', parallelGroup: 'W0-B' },
  { id: 'W0.4', wave: 0, title: 'ACCOUNTS DOMAIN + ACCOUNT PICKER', scope: 'DD.ACCOUNTS record (name, kind CASH/CHECKING/SAVINGS/CARD/LOAN/HELD, balance, asOf), F02.02 / F02.02.1 write into it, JurnlAccountPicker replaces both hard-coded lists.', dependsOn: ['W0.3'], files: [`${DATA}/repository/accounts.ts (new)`, `${RT}/screens/HomeScreens.tsx`, `${RT}/screens/SetupScreens.tsx`], pass: ['Quick add and filter list the registry.', 'F02 setup writes a place.'], complexity: 'M', collisionRisk: 'MEDIUM', parallelGroup: 'W0-C' },
  { id: 'W0.5', wave: 0, title: 'REPOSITORY-DRIVEN STATES', scope: 'JurnlStateBlock; LOADING / EMPTY / ERROR / STALE / OFFLINE from repository status; ?state remains a preview override.', dependsOn: ['W0.3'], files: [`${RT}/components/primitives.tsx`, `${RT}/screens/HomeScreens.tsx`], pass: ['F03 / F04 reach every state without ?state in tests.'], complexity: 'M', collisionRisk: 'MEDIUM', parallelGroup: 'W0-C' },
  { id: 'W0.6', wave: 0, title: 'SAFE-TO-SPEND FORMULA OWNED BY F09', scope: 'Move safeToSpend() into an F09 module; obligations without an amount mark the signal PARTIAL instead of contributing $0; F03 + SEE WHY read it.', dependsOn: ['W0.1'], files: [`${DATA}/f09/safeToSpend.ts (new)`, `${DATA}/home/money.ts`], pass: ['Regression test: setup obligations never silently contribute 0.', 'SEE WHY rows unchanged in the mock scenario.'], complexity: 'S', collisionRisk: 'MEDIUM', parallelGroup: 'W0-A' },
  { id: 'W0.7', wave: 0, title: 'REGISTER F05–F16', scope: 'Add F05–F16 to jurnlProject.ts families and generate production contracts from JURNL_FAMILY_TREE_F01_F16.json (implementation STRUCTURE_ONLY, approval UNREVIEWED). No approval claims.', dependsOn: [], files: [`${DATA}/jurnlProject.ts`, `${DATA}/f05…f16/contract.ts (new)`], pass: ['familyGate / registry tests pass for 16 families.'], complexity: 'M', collisionRisk: 'LOW', parallelGroup: 'W0-A' },
  { id: 'W0.8', wave: 0, title: 'SHARED PRIMITIVES', scope: 'JurnlTopChrome, JurnlAmountField (extract), JurnlDateField, JurnlCadencePicker (extract), JurnlSignal (extract), JurnlRecordList, JurnlFieldRows (extract), JurnlProgress, JurnlComparePair, JurnlSequence. Global composition + containment rules apply.', dependsOn: ['W0.1'], files: [`${RT}/components/primitives.tsx`, `${RT}/components/ (new files)`], pass: ['interactive-text-qa.mjs stays at 0 drift at 393 / 834 / 1440.', 'Each primitive has a role + a11y test.'], complexity: 'L', collisionRisk: 'HIGH', parallelGroup: 'W0-B' },
  { id: 'W0.9', wave: 0, title: 'MAIN-RED + DOC DRIFT', scope: 'Reconcile jurnlMonetizationFoundation "no price strings" with the currency contract; fix the FX wording in GLOBAL_COMPOSITION_RULES and the F03 plate status in CORE.md.', dependsOn: [], files: ['tests/jurnlMonetizationFoundation.test.tsx', 'JURNL/MANIFEST/JURNL_GLOBAL_COMPOSITION_RULES.json', 'motherboard/CORE.md'], pass: ['Test green on main.'], complexity: 'S', collisionRisk: 'LOW', parallelGroup: 'W0-A' },
  { id: 'W1.1', wave: 1, title: 'ACCOUNT / SETTINGS SURFACE', scope: 'Route `account` with profile, display currency, privacy + AI access, consents, security + sessions, export, delete, sign out. Reuses F01.11 / F01.12 drawers.', dependsOn: ['W0.3', 'W0.8'], files: [`${RT}/screens/SettingsScreens.tsx (new)`, `${RT}/JurnlRuntimeRoot.tsx`, `${RT}/screens/SecurityScreens.tsx`], pass: ['Sign out, export, delete reachable after entry.', 'Currency selector moved (ASK keeps a link).'], complexity: 'M', collisionRisk: 'MEDIUM', parallelGroup: 'W1-A' },
  { id: 'W1.2', wave: 1, title: 'ASK JURNL ON EVERY FAMILY', scope: 'Family-aware explanation built from derived values; read-only; no LLM; AI access OFF respected.', dependsOn: ['W0.8'], files: [`${RT}/screens/HomeScreens.tsx (AskSheet → shared)`, `${RT}/screens/ParentScreens.tsx`], pass: ['ASK opens on F03–F16 with family context; no writes.'], complexity: 'S', collisionRisk: 'LOW', parallelGroup: 'W1-B' },
  { id: 'W1.3', wave: 1, title: 'FAMILY DISCOVERY HUB LINKS', scope: 'Panel-header actions on hubs (FF.DISCOVERY_HUBS mapping).', dependsOn: ['W0.8'], files: [`${RT}/screens/HomeScreens.tsx`, `${RT}/screens/ParentScreens.tsx`], pass: ['Graph validation: every family reachable from F03 without the review board.'], complexity: 'S', collisionRisk: 'MEDIUM', parallelGroup: 'W1-B' },
  { id: 'W1.4', wave: 1, title: 'QUICK ADD V2 + LEDGER EDIT / DELETE', scope: 'Persisted save, date, category, registry account; F04 detail edit / delete for hand-added movements; RELATED link.', dependsOn: ['W0.1', 'W0.2', 'W0.3', 'W0.4'], files: [`${RT}/screens/HomeScreens.tsx`, `${DATA}/home/money.ts`], pass: ['Add → reload → still there; edit; delete with confirm.', 'JURNL_QUICK_ADD_CONTRACT updated (no recurrence).'], complexity: 'M', collisionRisk: 'HIGH', parallelGroup: 'W1-A' },
  { id: 'W1.5', wave: 1, title: 'HONEST CONNECT (MANUAL-FIRST)', scope: 'F02.02 connect relabelled to naming a place unless FF.BANK_AGGREGATION chooses a provider.', dependsOn: ['W0.4'], files: [`${RT}/screens/SetupScreens.tsx`, `${DATA}/f02/setupDraft.ts`], pass: ['No UI claims a live connection.'], complexity: 'S', collisionRisk: 'MEDIUM', parallelGroup: 'W1-B' },
  { id: 'W1.6', wave: 1, title: 'ONE CONSENT RECORD', scope: 'DD.CONSENT written by F01.11 and F02.07, read by settings and ASK.', dependsOn: ['W0.3'], files: [`${DATA}/repository/consent.ts (new)`, `${RT}/screens/SecurityScreens.tsx`, `${RT}/screens/SetupScreens.tsx`], pass: ['Toggling in either place reflects in the other.'], complexity: 'S', collisionRisk: 'MEDIUM', parallelGroup: 'W1-A' },
  { id: 'W2.F05', wave: 2, title: 'F05 MONEY STRUCTURAL COMPLETION', scope: 'Parent live from DD.ACCOUNTS; F05.ACCOUNTS, F05.ACCOUNT; add / edit / remove / move; states.', dependsOn: ['W0.4', 'W0.8', 'W1.4'], files: [`${RT}/screens/families/F05MoneyScreens.tsx (new)`, `${DATA}/f05/ (new)`], pass: ['Functional contract 12/12 for every F05 node.', 'Responsive 393 / 834 / 1440; containment 0 drift.'], complexity: 'M', collisionRisk: 'LOW', parallelGroup: 'W2-F05' },
  { id: 'W2.F06', wave: 2, title: 'F06 INCOME STRUCTURAL COMPLETION', scope: 'Sources CRUD, F06.SOURCE with matched arrivals, pattern sheet; setup seed handoff.', dependsOn: ['W0.1', 'W0.3', 'W0.8'], files: [`${RT}/screens/families/F06IncomeScreens.tsx (new)`, `${DATA}/f06/ (new)`], pass: ['Functional contract 12/12 for every F06 node.'], complexity: 'M', collisionRisk: 'LOW', parallelGroup: 'W2-F06' },
  { id: 'W2.F07', wave: 2, title: 'F07 UPCOMING STRUCTURAL COMPLETION', scope: 'Obligations with amount + due date, sequence, item, mark paid (writes a movement), when sheet, overdue; setup seed handoff; F03 COMING reads F07.', dependsOn: ['W0.1', 'W0.3', 'W0.8', 'W1.4'], files: [`${RT}/screens/families/F07UpcomingScreens.tsx (new)`, `${DATA}/f07/ (new)`, `${DATA}/home/money.ts`], pass: ['Functional contract 12/12.', 'Safe-to-spend includes F07 amounts.'], complexity: 'M', collisionRisk: 'MEDIUM', parallelGroup: 'W2-F07' },
  { id: 'W3.F09', wave: 3, title: 'F09 SAFE TO SPEND + F03 RE-POINT', scope: 'F09 parent, WHY, HOLD; F03 signal + SEE WHY read F09; below-zero and unstated states.', dependsOn: ['W0.6', 'W2.F05', 'W2.F06', 'W2.F07'], files: [`${RT}/screens/families/F09SafeScreens.tsx (new)`, `${RT}/screens/HomeScreens.tsx`], pass: ['One formula; F03 and F09 show the same figure.', 'F03 nodes reach 12/12.'], complexity: 'M', collisionRisk: 'HIGH', parallelGroup: 'W3-F09' },
  { id: 'W3.F08', wave: 3, title: 'F08 PLAN STRUCTURAL COMPLETION', scope: 'Intentions, assign, reorder, over-assigned validation; setup priorities handoff.', dependsOn: ['W2.F06', 'W2.F07'], files: [`${RT}/screens/families/F08PlanScreens.tsx (new)`, `${DATA}/f08/ (new)`], pass: ['Functional contract 12/12.'], complexity: 'M', collisionRisk: 'LOW', parallelGroup: 'W3-F08' },
  { id: 'W3.F12', wave: 3, title: 'F12 CREDIT STRUCTURAL COMPLETION', scope: 'Credit attributes on card / loan places, utilization reading, attention state; add card routes to F05 add sheet.', dependsOn: ['W2.F05'], files: [`${RT}/screens/families/F12CreditScreens.tsx (new)`, `${DATA}/f12/ (new)`], pass: ['Functional contract 12/12.', 'No second account list.'], complexity: 'M', collisionRisk: 'LOW', parallelGroup: 'W3-F12' },
  { id: 'W3.F14', wave: 3, title: 'F14 GOALS STRUCTURAL COMPLETION', scope: 'Goals CRUD, set aside, meaning, reached state; setup goal handoff.', dependsOn: ['W0.1', 'W0.3', 'W0.8'], files: [`${RT}/screens/families/F14GoalsScreens.tsx (new)`, `${DATA}/f14/ (new)`], pass: ['Functional contract 12/12.'], complexity: 'M', collisionRisk: 'LOW', parallelGroup: 'W3-F14' },
  { id: 'W4.F10', wave: 4, title: 'F10 PURCHASES STRUCTURAL COMPLETION', scope: 'Considerations, object page, decision sheet reading F09 / F14; bought → quick add.', dependsOn: ['W3.F09', 'W3.F14'], files: [`${RT}/screens/families/F10PurchasesScreens.tsx (new)`, `${DATA}/f10/ (new)`], pass: ['Functional contract 12/12.', 'No commerce surface.'], complexity: 'M', collisionRisk: 'LOW', parallelGroup: 'W4-F10' },
  { id: 'W4.F11', wave: 4, title: 'F11 TRIPS STRUCTURAL COMPLETION', scope: 'Trips CRUD, cost lines (currency contract), funding sheet.', dependsOn: ['W3.F09', 'W3.F08'], files: [`${RT}/screens/families/F11TripsScreens.tsx (new)`, `${DATA}/f11/ (new)`], pass: ['Functional contract 12/12.', 'No booking surface.'], complexity: 'M', collisionRisk: 'LOW', parallelGroup: 'W4-F11' },
  { id: 'W4.F13', wave: 4, title: 'F13 PAYDOWN STRUCTURAL COMPLETION', scope: 'Path from F05 liabilities + F12 terms; what-if; keep path; no-debt state.', dependsOn: ['W3.F12'], files: [`${RT}/screens/families/F13PaydownScreens.tsx (new)`, `${DATA}/f13/ (new)`], pass: ['Functional contract 12/12.', 'Non-shaming copy check.'], complexity: 'M', collisionRisk: 'LOW', parallelGroup: 'W4-F13' },
  { id: 'W4.F15', wave: 4, title: 'F15 AHEAD STRUCTURAL COMPLETION', scope: 'Base projection, assumption sheet, branch compare, thin state.', dependsOn: ['W2.F06', 'W2.F07', 'W3.F08', 'W3.F14'], files: [`${RT}/screens/families/F15AheadScreens.tsx (new)`, `${DATA}/f15/ (new)`], pass: ['Functional contract 12/12.'], complexity: 'L', collisionRisk: 'LOW', parallelGroup: 'W4-F15' },
  { id: 'W4.F16', wave: 4, title: 'F16 RECORDS STRUCTURAL COMPLETION', scope: 'Device blob storage, index + find, document page, file / remove / export.', dependsOn: ['W0.3', 'W0.8'], files: [`${RT}/screens/families/F16RecordsScreens.tsx (new)`, `${DATA}/f16/ (new)`], pass: ['Functional contract 12/12.', 'Export works with no plan (safety floor).'], complexity: 'L', collisionRisk: 'LOW', parallelGroup: 'W4-F16' },
  { id: 'W5.1', wave: 5, title: 'PRODUCTION AUTH + EMAIL + SOCIAL', scope: 'Production JurnlAuthAdapter (FF.AUTH_PROVIDER).', dependsOn: [], files: [`${RT}/state/adapters.ts`, 'server/ (new routes)'], pass: ['F01 flows pass against the provider; preview accounts never in a production build.'], complexity: 'L', collisionRisk: 'MEDIUM', parallelGroup: 'W5-A' },
  { id: 'W5.2', wave: 5, title: 'SERVER PERSISTENCE + RLS + RATE PROXY', scope: 'Server adapter for every repository; migrations; RLS; security tests; FX proxy; entitlement enforcement.', dependsOn: ['W0.3'], files: ['supabase/migrations/ (new)', 'server/routes.ts', `${DATA}/repository/`], pass: ['RLS tests prove user isolation.'], complexity: 'L', collisionRisk: 'MEDIUM', parallelGroup: 'W5-B' },
  { id: 'W5.3', wave: 5, title: 'NOINDEX', scope: 'noindex on every JURNL route + host header.', dependsOn: [], files: ['public/', 'src/site00/projectRuntime/'], pass: ['Rendered head carries noindex.'], complexity: 'S', collisionRisk: 'LOW', parallelGroup: 'W5-C' },
  { id: 'W5.4', wave: 5, title: 'ANALYTICS ON EXISTING INFRA', scope: 'trackActivity jurnl_* events (no financial payloads) + buildMonetizationEvent; user_activity migration.', dependsOn: ['W5.2'], files: ['src/utils/activity.ts', `${RT}/state/store.tsx`], pass: ['Allow-list test rejects financial props.'], complexity: 'S', collisionRisk: 'LOW', parallelGroup: 'W5-C' },
  { id: 'W5.5', wave: 5, title: 'NATIVE BRIDGE', scope: 'Real biometric + device trust in the native shell.', dependsOn: ['W5.1'], files: [`${RT}/state/adapters.ts`], pass: ['F01.04 / F01.09 on device.'], complexity: 'M', collisionRisk: 'LOW', parallelGroup: 'W5-A' },
  { id: 'W5.6', wave: 5, title: 'ACCESSIBILITY + RESPONSIVE AUDIT', scope: 'axe pass on every route + overlay; screen-reader spot checks; 393 / 834 / 1440 captures for every node.', dependsOn: ['W4.F16'], files: ['scripts/jurnl/ (new qa script)'], pass: ['0 serious axe violations.'], complexity: 'M', collisionRisk: 'LOW', parallelGroup: 'W5-C' },
  { id: 'W5.7', wave: 5, title: 'REVIEW CHROME OUT OF PRODUCT', scope: 'BOARD button + /parents only in design-preview.', dependsOn: [], files: [`${RT}/screens/ParentScreens.tsx`, `${RT}/JurnlRuntimeRoot.tsx`], pass: ['Production mode shows no review chrome.'], complexity: 'S', collisionRisk: 'LOW', parallelGroup: 'W5-C' },
];

/* ───────────────────────── reusability (identify only — do not extract) ───────────────────────── */

export const REUSABLE_CANDIDATES: { id: string; kind: 'BLUEPRINT' | 'SYSTEM' | 'EXTENSION' | 'PRIMITIVE'; name: string; source: string[]; evidence: string; maturity: 'PROVEN' | 'PARTIAL' | 'PROPOSED' }[] = [
  { id: 'RC.BP.PERSONAL_FINANCE_16', kind: 'BLUEPRINT', name: 'PERSONAL FINANCE PRODUCT TREE (16 FAMILIES)', source: ['docs/jurnl/structural-completion/'], evidence: 'This blueprint: families, ownership map, waves, functional contract.', maturity: 'PARTIAL' },
  { id: 'RC.BP.ENTRY_TRUST', kind: 'BLUEPRINT', name: 'ENTRY + TRUST FAMILY (ACCOUNT, VERIFY, RESET, BIOMETRIC, DEVICE, PRIVACY, SECURITY)', source: ['src/projects/jurnl/data/f01/', 'JURNL/F01_ENTRY/'], evidence: '14 routes, 27 states, 74 interactions, LIVE_QA_PASSED.', maturity: 'PROVEN' },
  { id: 'RC.BP.GUIDED_SETUP', kind: 'BLUEPRINT', name: 'GUIDED SETUP THAT SEEDS OWNER FAMILIES', source: ['src/projects/jurnl/data/f02/'], evidence: '11 routes, resume, validation; seeds F05 / F06 / F07 / F08 / F09 / F14.', maturity: 'PROVEN' },
  { id: 'RC.BP.DAILY_SIGNAL_HOME', kind: 'BLUEPRINT', name: 'DAILY SIGNAL HOME (ONE NUMBER, COMING, MOVED)', source: ['src/projects/jurnl/runtime/screens/HomeScreens.tsx'], evidence: 'F03 with 8 states.', maturity: 'PARTIAL' },
  { id: 'RC.BP.LEDGER', kind: 'BLUEPRINT', name: 'SEARCHABLE LEDGER WITH DETAIL', source: ['src/projects/jurnl/runtime/screens/HomeScreens.tsx'], evidence: 'F04 search / filter / detail.', maturity: 'PARTIAL' },
  { id: 'RC.SYS.CURRENCY', kind: 'SYSTEM', name: 'BASE ≠ DISPLAY CURRENCY SYSTEM', source: ['src/projects/jurnl/data/home/currency.ts', 'JURNL/MANIFEST/JURNL_CURRENCY_CONTRACT.json'], evidence: 'Canonical USD storage, no chain conversion, 3-row selector, stale policy.', maturity: 'PROVEN' },
  { id: 'RC.SYS.QUICK_ADD', kind: 'SYSTEM', name: 'GLOBAL QUICK ADD', source: ['JURNL/MANIFEST/JURNL_QUICK_ADD_CONTRACT.json'], evidence: 'Shared sheet with provenance quote.', maturity: 'PARTIAL' },
  { id: 'RC.SYS.AUTH_ADAPTER', kind: 'SYSTEM', name: 'AUTH ADAPTER WITH DESIGN-PREVIEW IMPLEMENTATION', source: ['src/projects/jurnl/runtime/state/adapters.ts'], evidence: 'One interface, preview + unconfigured kinds, typed error codes.', maturity: 'PARTIAL' },
  { id: 'RC.SYS.ENTITLEMENTS', kind: 'SYSTEM', name: 'CAPABILITY-BASED ENTITLEMENTS', source: ['shared/site00-monetization/', 'src/projects/jurnl/data/monetization/'], evidence: 'Already shared; safety floors.', maturity: 'PROVEN' },
  { id: 'RC.SYS.CONTAINMENT', kind: 'SYSTEM', name: 'INTERACTIVE TEXT CONTAINMENT (useCompactFit + QA SCRIPT)', source: ['src/projects/jurnl/runtime/components/primitives.tsx', 'scripts/jurnl/interactive-text-qa.mjs'], evidence: 'Global rule, 0 drift.', maturity: 'PROVEN' },
  { id: 'RC.SYS.PREVIEW_SWITCHES', kind: 'SYSTEM', name: 'DESIGN-PREVIEW INSPECTION SWITCHES (?state / ?overlay / ?scenario / ?os / ?reset)', source: ['src/projects/jurnl/runtime/state/store.tsx'], evidence: 'Every state and overlay addressable by URL.', maturity: 'PROVEN' },
  { id: 'RC.SYS.FAMILY_CONTRACT', kind: 'SYSTEM', name: 'FAMILY PRODUCTION CONTRACT + GATE', source: ['shared/site00-product-families/'], evidence: 'Already shared across projects.', maturity: 'PROVEN' },
  { id: 'RC.SYS.STRUCTURAL_BLUEPRINT', kind: 'SYSTEM', name: 'STRUCTURAL BLUEPRINT GENERATOR + PROGRESS METRICS', source: ['scripts/jurnl/structural-blueprint/'], evidence: 'This sprint: graph, criteria scoring, waves, validation.', maturity: 'PARTIAL' },
  { id: 'RC.SYS.REPOSITORY', kind: 'SYSTEM', name: 'DOMAIN REPOSITORY WITH DEVICE → SERVER ADAPTERS', source: [], evidence: 'Proposed W0.3.', maturity: 'PROPOSED' },
  { id: 'RC.EXT.BUSINESS', kind: 'EXTENSION', name: 'JURNL BUSINESS EXTENSION (RECEIPTS, MILEAGE, P&L, TAX, ACCOUNTANT EXPORT)', source: ['src/projects/jurnl/data/monetization/capabilities.ts'], evidence: 'BUSINESS_* capabilities anchored in F16, reading F05 / F15 / F04.', maturity: 'PROPOSED' },
  { id: 'RC.EXT.TRAVEL', kind: 'EXTENSION', name: 'TRAVEL ADD-ON', source: ['src/projects/jurnl/data/monetization/addOns.ts'], evidence: 'F11 advanced trip planning.', maturity: 'PROPOSED' },
  { id: 'RC.EXT.MAJOR_PURCHASE', kind: 'EXTENSION', name: 'MAJOR PURCHASE PREP ADD-ON', source: ['src/projects/jurnl/data/monetization/addOns.ts'], evidence: 'F10 purchase analysis.', maturity: 'PROPOSED' },
  { id: 'RC.EXT.PREMIUM_CREDIT', kind: 'EXTENSION', name: 'PREMIUM CREDIT ADD-ON', source: ['src/projects/jurnl/data/monetization/addOns.ts'], evidence: 'F12 / F13 strategy.', maturity: 'PROPOSED' },
  { id: 'RC.PR.OVERLAYS', kind: 'PRIMITIVE', name: 'DRAWER / SHEET / MODAL WITH FOCUS TRAP + ESCAPE', source: ['src/projects/jurnl/runtime/components/primitives.tsx'], evidence: 'dialog / alertdialog, aria-modal, focus loop.', maturity: 'PROVEN' },
  { id: 'RC.PR.HANDOFFS', kind: 'PRIMITIVE', name: 'EXTERNAL + NATIVE HANDOFF BOUNDARIES', source: ['src/projects/jurnl/runtime/components/primitives.tsx'], evidence: 'Mail, provider and biometric boundaries.', maturity: 'PROVEN' },
  { id: 'RC.PR.TRANSACTION_ROW', kind: 'PRIMITIVE', name: 'LEDGER ROW', source: ['src/projects/jurnl/runtime/components/TransactionRow.tsx'], evidence: 'F03 + F04.', maturity: 'PROVEN' },
  { id: 'RC.PR.AMOUNT_FIELD', kind: 'PRIMITIVE', name: 'AMOUNT FIELD WITH CURRENCY AFFIX', source: ['src/projects/jurnl/runtime/screens/HomeScreens.tsx'], evidence: 'Inside QuickAddSheet; extract in W0.8.', maturity: 'PARTIAL' },
  { id: 'RC.PR.NAV_DOCK', kind: 'PRIMITIVE', name: 'CENTERED NAV DOCK WITH CENTER ACTION', source: ['src/projects/jurnl/runtime/components/ProductNav.tsx'], evidence: 'HOME / MONEY / + / PLAN / CREDIT.', maturity: 'PROVEN' },
  { id: 'RC.PR.PASSWORD_REQS', kind: 'PRIMITIVE', name: 'PASSWORD REQUIREMENTS', source: ['src/projects/jurnl/runtime/components/primitives.tsx'], evidence: 'F01.01 / F01.07.', maturity: 'PROVEN' },
  { id: 'RC.PR.INLINE_ACTION', kind: 'PRIMITIVE', name: 'PANEL-HEADER EDITORIAL ACTION', source: ['src/projects/jurnl/runtime/components/primitives.tsx'], evidence: 'F03 learning.', maturity: 'PROVEN' },
];
