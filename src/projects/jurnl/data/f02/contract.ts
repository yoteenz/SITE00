/**
 * JURNL F02 SETUP — FamilyProductionContract.
 * Authorities are references. Plates, emblems, and lockups are the runtime images.
 */

import {
  FAMILY_PRODUCTION_CONTRACT_VERSION,
  type FamilyProductionContract,
} from '../../../../../shared/site00-product-families/familyProductionContract.js';
import { buildFamilyBudgetRecord } from '../../../../../shared/site00-product-families/productionBudget.js';
import { JURNL_BUDGET_BASELINE, JURNL_F01_BUDGET } from '../f01/contract';
import { F02_SCREENS, F02_STATE_SCREENS } from './screens';

const AUTH_DIR = 'public/jurnl/f02-setup/authorities';

export const JURNL_F02_BUDGET = buildFamilyBudgetRecord(JURNL_BUDGET_BASELINE, [JURNL_F01_BUDGET], {
  familyId: 'F02',
  tracking: 'TRACKED',
  creditsBefore: 44534,
  creditsAfter: 35063,
  assetGenerations: 19,
  screenGenerations: 14,
  interactionGenerations: 3,
  recoveryGenerations: 2,
  notes:
    'FAMILY PACKAGE 23 JOBS, 7446 CREDITS (44534→37088) PLUS BOTANICAL REPAIR 15 JOBS, 2025 CREDITS (37088→35063). THE LIVE IMPLEMENTATION PASS ADDED 0 GENERATIONS.',
});

const stateIdsFor = (screenId: string) =>
  [
    ['F02.00', 'F02.00.RESUME'],
    ['F02.02', 'F02.02.CONNECTED'],
    ['F02.02.1', 'F02.02.1.VALIDATION'],
    ['F02.03', 'F02.03.VALIDATION'],
    ['F02.04', 'F02.04.VALIDATION'],
    ['F02.05.1', 'F02.05.1.VALIDATION'],
    ['F02.06', 'F02.06.VALIDATION'],
  ]
    .filter(([screen]) => screen === screenId)
    .map(([, id]) => id!);

const parentOf = (id: string) => {
  if (id === 'F02.00') return null;
  if (id === 'F02.02.1') return 'F02.02';
  if (id === 'F02.05.1') return 'F02.05';
  return 'F02.00';
};

export const JURNL_F02_CONTRACT: FamilyProductionContract = {
  contractVersion: FAMILY_PRODUCTION_CONTRACT_VERSION,
  familyId: 'F02',
  familyName: 'SETUP',
  projectId: 'JURNL',
  purpose: 'TEACH JURNL THE SHAPE OF A LIFE: HOUSEHOLD, MONEY, WHAT MATTERS, AND THE BOUNDARIES IT MAY KEEP. THEN HAND OFF TO F03 TODAY.',
  parentScreen: 'F02.00',
  screens: F02_SCREENS.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    parentId: parentOf(s.id),
    runtimeRoute: s.route,
    authorityFile: s.authorityFile,
    approvalStatus: 'IN_REVIEW' as const,
    implementationStatus: 'IMPLEMENTED' as const,
    stateIds: stateIdsFor(s.id),
    ...(s.id === 'F02.08' ? { bridgeTo: 'F03' } : {}),
  })),
  states: [
    { id: 'F02.00.RESUME', label: 'RESUME', screenId: 'F02.00', authorityFile: F02_STATE_SCREENS['F02.ST.RESUME'].authorityFile, implemented: true },
    { id: 'F02.02.CONNECTED', label: 'CONNECTED', screenId: 'F02.02', authorityFile: F02_STATE_SCREENS['F02.ST.CONNECTED'].authorityFile, implemented: true },
    { id: 'F02.02.1.VALIDATION', label: 'VALIDATION', screenId: 'F02.02.1', authorityFile: F02_STATE_SCREENS['F02.ST.VALIDATION'].authorityFile, implemented: true },
    { id: 'F02.03.VALIDATION', label: 'VALIDATION', screenId: 'F02.03', authorityFile: F02_STATE_SCREENS['F02.ST.VALIDATION'].authorityFile, implemented: true },
    { id: 'F02.04.VALIDATION', label: 'VALIDATION', screenId: 'F02.04', authorityFile: F02_STATE_SCREENS['F02.ST.VALIDATION'].authorityFile, implemented: true },
    { id: 'F02.05.1.VALIDATION', label: 'VALIDATION', screenId: 'F02.05.1', authorityFile: F02_STATE_SCREENS['F02.ST.VALIDATION'].authorityFile, implemented: true },
    { id: 'F02.06.VALIDATION', label: 'VALIDATION', screenId: 'F02.06', authorityFile: F02_STATE_SCREENS['F02.ST.VALIDATION'].authorityFile, implemented: true },
  ],
  interactions: [
    {
      id: 'F02.IN.PERMISSION',
      sourceScreen: 'F02.02',
      trigger: 'CONNECT AN ACCOUNT',
      type: 'bottom_drawer',
      componentRef: 'JURNL_DRAWER_LONG',
      navigationResult: 'RETURNS TO F02.02. DOES NOT OPEN A PROVIDER UNTIL THE USER CONTINUES.',
      authorityFile: 'JURNL/F02_SETUP/INTERACTIONS/F02.IN.PERMISSION.jpg',
      sharing: 'distinct',
    },
    {
      id: 'F02.IN.ADD',
      sourceScreen: 'F02.04',
      trigger: 'ADD ANOTHER',
      type: 'bottom_drawer',
      componentRef: 'JURNL_DRAWER_LONG',
      navigationResult: 'SAVES ONE OBLIGATION AND RETURNS TO F02.04.',
      authorityFile: 'JURNL/F02_SETUP/INTERACTIONS/F02.IN.ADD.jpg',
      sharing: 'distinct',
    },
    {
      id: 'F02.IN.SKIP',
      sourceScreen: 'F02.02',
      trigger: 'SKIP FOR NOW',
      type: 'bottom_drawer',
      componentRef: 'JURNL_DRAWER_SHORT',
      navigationResult: 'CONTINUE ADVANCES THE STEP. GO BACK CLOSES THE SHEET.',
      authorityFile: 'JURNL/F02_SETUP/INTERACTIONS/F02.IN.SKIP.jpg',
      sharing: 'shared',
    },
    {
      id: 'F02.NAV.BACK',
      sourceScreen: 'F02.01',
      trigger: 'BACK',
      type: 'inline',
      componentRef: 'JURNL_ICON_BUTTON',
      navigationResult: 'PREVIOUS SETUP STEP. ANSWERS ALREADY GIVEN STAY SAVED.',
      authorityFile: `${AUTH_DIR}/F02.01_CONTEXT.jpg`,
      sharing: 'shared',
    },
    {
      id: 'F02.NAV.CONTINUE',
      sourceScreen: 'F02.00',
      trigger: 'CONTINUE',
      type: 'route_transition',
      componentRef: 'JURNL_BUTTON_PRIMARY',
      navigationResult: 'NEXT STEP IN THE SCREEN TREE. F02.08 OPENS F03 TODAY.',
      authorityFile: `${AUTH_DIR}/F02.00_SETUP_PARENT.jpg`,
      sharing: 'shared',
    },
  ],
  dataObjects: [
    {
      id: 'SETUP_DRAFT',
      description: 'THE SHAPE JURNL IS LEARNING',
      fields: ['household', 'accounts', 'income', 'obligations', 'priorities', 'goal', 'protected', 'consent', 'voice'],
      persistence: 'SESSION',
      notes: 'SESSION STORAGE KEY jurnl.runtime.v1.setup. DOES NOT MUTATE THE F01 DEVICE OR SESSION.',
    },
  ],
  globalComponents: [
    { id: 'JURNL_BUTTON_PRIMARY', scope: 'GLOBAL', primitive: 'BUTTON', description: 'DEEP EMERALD, SQUARE-ROUNDED, UPPERCASE' },
    { id: 'JURNL_BUTTON_SECONDARY', scope: 'GLOBAL', primitive: 'BUTTON', description: 'BONE SURFACE, SQUARE-ROUNDED' },
    { id: 'JURNL_INPUT', scope: 'GLOBAL', primitive: 'INPUT', description: 'IVORY FIELD, UPPERCASE LABEL' },
    { id: 'JURNL_TOGGLE', scope: 'GLOBAL', primitive: 'TOGGLE', description: 'SQUARE-ROUNDED TRACK' },
  ],
  familyComponents: [
    { id: 'JURNL_DRAWER_LONG', scope: 'FAMILY', primitive: 'DRAWER', description: 'PERMISSION AND ADD PAPER SHEETS' },
    { id: 'JURNL_DRAWER_SHORT', scope: 'FAMILY', primitive: 'DRAWER', description: 'SHARED SKIP SHEET' },
    { id: 'JURNL_ICON_BUTTON', scope: 'FAMILY', primitive: 'BUTTON', description: 'SQUARE BACK CONTROL' },
  ],
  globalAssets: [
    { id: 'JURNL.FONT.DISPLAY', assetClass: 'GLOBAL_INHERITED', scope: 'GLOBAL_INHERITED', status: 'CANONICAL', source: 'INSTRUMENT SERIF' },
    { id: 'JURNL.FONT.FUNCTIONAL', assetClass: 'GLOBAL_INHERITED', scope: 'GLOBAL_INHERITED', status: 'CANONICAL', source: 'BARLOW SEMI CONDENSED' },
  ],
  familyAssets: [
    { id: 'SETUP.ENVIRONMENT.ARRIVAL.001', assetClass: 'FAMILY_BACKGROUND', scope: 'FAMILY', status: 'CANONICAL', source: 'CANONICAL MOUNT', filePath: 'src/projects/jurnl/families/F02_SETUP/ENVIRONMENTS/F02_ENVIRONMENT_ARRIVAL.jpg', format: 'jpg', routes: ['setup', 'setup/household', 'setup/ready'] },
    { id: 'SETUP.ENVIRONMENT.DESK.001', assetClass: 'FAMILY_BACKGROUND', scope: 'FAMILY', status: 'CANONICAL', source: 'CANONICAL MOUNT', filePath: 'src/projects/jurnl/families/F02_SETUP/ENVIRONMENTS/F02_ENVIRONMENT_DESK.jpg', format: 'jpg', routes: ['setup/accounts', 'setup/accounts/name', 'setup/income', 'setup/commitments', 'setup/protected'] },
    { id: 'SETUP.ENVIRONMENT.EDIT.001', assetClass: 'FAMILY_BACKGROUND', scope: 'FAMILY', status: 'CANONICAL', source: 'CANONICAL MOUNT', filePath: 'src/projects/jurnl/families/F02_SETUP/ENVIRONMENTS/F02_ENVIRONMENT_EDIT.jpg', format: 'jpg', routes: ['setup/priorities', 'setup/priorities/goal'] },
    { id: 'SETUP.ENVIRONMENT.QUIET.001', assetClass: 'FAMILY_BACKGROUND', scope: 'FAMILY', status: 'CANONICAL', source: 'CANONICAL MOUNT', filePath: 'src/projects/jurnl/families/F02_SETUP/ENVIRONMENTS/F02_ENVIRONMENT_QUIET.jpg', format: 'jpg', routes: ['setup/boundaries'] },
    { id: 'F02.BRANDLOCKUP.JURNL.001', assetClass: 'BOTANICAL', scope: 'FAMILY', status: 'CANONICAL', source: 'CANONICAL MOUNT', filePath: 'src/projects/jurnl/families/F02_SETUP/BRAND_LOCKUPS/F02_BRANDLOCKUP_JURNL_001.png', format: 'png', transparency: true, routes: ['setup'] },
    { id: 'F02.BRANDLOCKUP.JURNL_SETUP.001', assetClass: 'BOTANICAL', scope: 'FAMILY', status: 'CANONICAL', source: 'CANONICAL MOUNT', filePath: 'src/projects/jurnl/families/F02_SETUP/BRAND_LOCKUPS/F02_BRANDLOCKUP_JURNL_SETUP_001.png', format: 'png', transparency: true, routes: ['setup/income'] },
    { id: 'SETUP.UI.CONTROLS', assetClass: 'IMPLEMENTATION_COMPONENT', scope: 'FAMILY', status: 'CODE_CONSTRUCTED', source: 'LIVE TYPE, BORDER, SURFACE, SHADOW. NO RASTER PANEL OR BUTTON SKIN.' },
  ],
  iconRequirements: ['BACK', 'CHECK', 'ALERT', 'CLOSE', 'PLUS', 'CHEVRON', 'LINK', 'ACCOUNT', 'SHIELD', 'PRIVACY', 'INFO', 'CLOCK'].map((label) => ({
    id: label,
    label,
    variants: ['LINEAR'] as ('LINEAR' | 'FILLED')[],
    authorityFile: 'src/projects/jurnl/families/F02_SETUP/ICONS/INHERITED_FROM.json',
    implementation: 'LIVE_CODE_SVG' as const,
  })),
  responsive: [
    { id: 'MOBILE', width: 393, height: 852, primary: true, rule: 'AUTHORITY COMPOSITION INSIDE THE APP CANVAS. NO PAGE SCROLL.' },
    { id: 'TABLET', width: 834, height: 1194, primary: false, rule: 'COLUMN CAPPED AND CENTERED. SAME PLATES. NO ENLARGED PHONE.' },
    { id: 'DESKTOP', width: 1440, height: 900, primary: false, rule: 'CONTAINED PRODUCT STAGE. COLUMN AT THE LEFT. JURNL DOES NOT FILL THE HOST WORKSPACE.' },
  ],
  brandExpressionLevel: 'EDITORIAL',
  generationSettings: { model: 'GPT IMAGE 2.5 SUNBURST', resolution: '4K', aspect: '9:16', autoEnhance: false, creditsPerGeneration: 317 },
  generationBudget: JURNL_F02_BUDGET,
  assetPolicy: {
    assetFirstRequired: true,
    resolution: 'RESOLVED',
    reason: null,
    excludedSources: [
      'SUPERSEDED F02.07 ATTEMPT 8QeXrJ1VUU3REvZqxff9',
      'SUPERSEDED F02.08 ATTEMPT PZC0QVXJzfqWSTXgSlEh',
    ],
    evidence: [
      '4 ENVIRONMENT PLATES',
      '13 BOTANICAL EMBLEMS',
      '2 BRAND LOCKUPS',
      '12 INHERITED ICONS',
      '0 RASTER PANELS',
      '0 RASTER BUTTONS',
      'AUTHORITIES ARE REFERENCE ONLY',
    ],
  },
  approvalStatus: 'IN_REVIEW',
  implementationStatus: 'LIVE_QA_PASSED',
  qaStatus: 'LIVE_PASS',
  founderApproval: { approved: false, approvedAt: null, note: 'VISUAL APPROVAL STAYS PENDING. OPUS FINAL AUDIT COMPLETE: READY FOR FOUNDER VISUAL REVIEW.' },
  lineage: {
    parentAuthority: `${AUTH_DIR}/F02.00_SETUP_PARENT.jpg`,
    sourceSprints: [
      'P0.JURNL.F02-SETUP-FULL-FAMILY-SCREEN-PLUS-LINKED-ASSET-SIDEKICK1',
      'P0.JURNL.F02-BOTANICAL-BRAND-ASSET-REPAIR1',
      'P0.JURNL.F02-GROK-CANONICAL-MOUNT-SONNET-HANDOFF1',
      'P0.JURNL.F02-GROK-CANONICAL-MOUNT-BOTANICAL-REPAIR-BINDING1',
      'P0.JURNL.F02-GROK-FULL-FAMILY-LIVE-IMPLEMENTATION1',
    ],
    notes: 'GROK OWNS THE LIVE PASS. SONNET IS SKIPPED FOR THIS FAMILY.',
  },
  supersession: { supersedes: [], supersededBy: null },
  journeys: [
    { id: 'SETUP', label: 'SETUP', path: ['F02.00', 'F02.01', 'F02.02', 'F02.03', 'F02.04', 'F02.05', 'F02.06', 'F02.07', 'F02.08'] },
    { id: 'GOAL', label: 'GOAL', path: ['F02.05', 'F02.05.1', 'F02.06'] },
    { id: 'NAME_ACCOUNT', label: 'NAME AN ACCOUNT', path: ['F02.02', 'F02.02.1', 'F02.02'] },
  ],
  claims: { withheld: 0, flagged: 0, rule: 'NO PAYWALL, UPGRADE, PLAN, OR PRICING UI IN SETUP.' },
};
