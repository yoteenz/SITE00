import {
  FAMILY_PRODUCTION_CONTRACT_VERSION,
  type FamilyProductionContract,
} from '../../../../../shared/site00-product-families/familyProductionContract.js';
import { buildFamilyBudgetRecord } from '../../../../../shared/site00-product-families/productionBudget.js';
import { JURNL_BUDGET_BASELINE, JURNL_F01_BUDGET } from '../f01/contract';
import { JURNL_F02_BUDGET } from '../f02/contract';
import { JURNL_F03_BUDGET } from '../f03/contract';
import { F04_SCREENS } from './screens';

const AUTH = 'public/jurnl/f04-activity/authorities/F04.00_ACTIVITY_PARENT.jpg';

export const JURNL_F04_BUDGET = buildFamilyBudgetRecord(JURNL_BUDGET_BASELINE, [JURNL_F01_BUDGET, JURNL_F02_BUDGET, JURNL_F03_BUDGET], {
  familyId: 'F04',
  tracking: 'TRACKED',
  creditsBefore: 33782,
  creditsAfter: 32501,
  assetGenerations: 2,
  screenGenerations: 2,
  interactionGenerations: 0,
  recoveryGenerations: 1,
  notes: 'TEXT2IMAGE PARENT AND PLATE ARE SUPERSEDED. CANONICAL JOBS ARE IMAGE2IMAGE FROM THE SAME WELCOME REFERENCE. QUOTED 1266. ACCOUNT CLOSES AT 32501.',
});

export const JURNL_F04_CONTRACT: FamilyProductionContract = {
  contractVersion: FAMILY_PRODUCTION_CONTRACT_VERSION,
  familyId: 'F04',
  familyName: 'ACTIVITY',
  projectId: 'JURNL',
  purpose: 'THE MONEY-MOVEMENT RECORD. SEARCHABLE, FILTERABLE, QUIET.',
  parentScreen: 'F04.00',
  screens: F04_SCREENS.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    parentId: null,
    runtimeRoute: s.route,
    authorityFile: s.authorityFile,
    approvalStatus: 'IN_REVIEW' as const,
    implementationStatus: 'IMPLEMENTED' as const,
    stateIds: ['F04.00.LOADING', 'F04.00.EMPTY', 'F04.00.NO_RESULTS', 'F04.00.FILTERED', 'F04.00.ERROR'],
  })),
  states: [
    { id: 'F04.00.LOADING', label: 'LOADING', screenId: 'F04.00', authorityFile: null, implemented: true },
    { id: 'F04.00.EMPTY', label: 'EMPTY', screenId: 'F04.00', authorityFile: null, implemented: true },
    { id: 'F04.00.NO_RESULTS', label: 'NO RESULTS', screenId: 'F04.00', authorityFile: null, implemented: true },
    { id: 'F04.00.FILTERED', label: 'FILTERED', screenId: 'F04.00', authorityFile: null, implemented: true },
    { id: 'F04.00.ERROR', label: 'ERROR', screenId: 'F04.00', authorityFile: null, implemented: true },
  ],
  interactions: [
    { id: 'F04.IN.SEARCH', sourceScreen: 'F04.00', trigger: 'SEARCH', type: 'focus_input', componentRef: 'JURNL_INPUT', navigationResult: 'DEBOUNCED. DOES NOT LEAVE THE LEDGER.', authorityFile: AUTH, sharing: 'distinct' },
    { id: 'F04.IN.FILTER', sourceScreen: 'F04.00', trigger: 'FILTER', type: 'bottom_drawer', componentRef: 'JURNL_DRAWER_LONG', navigationResult: 'ACCOUNT, DIRECTION, STATUS, WHEN. CLEARABLE.', authorityFile: AUTH, sharing: 'distinct' },
    { id: 'F04.IN.DETAIL', sourceScreen: 'F04.00', trigger: 'ROW', type: 'bottom_drawer', componentRef: 'JURNL_DRAWER_LONG', navigationResult: 'DEPTH FOR ONE MOVEMENT. THE LEDGER STAYS.', authorityFile: AUTH, sharing: 'distinct' },
    { id: 'F04.NAV.BACK', sourceScreen: 'F04.00', trigger: 'BACK TO TODAY', type: 'route_transition', componentRef: 'JURNL_ICON_BUTTON', navigationResult: 'RETURNS TO F03.00.', authorityFile: AUTH, sharing: 'shared' },
    { id: 'F04.IN.QUICK_ADD', sourceScreen: 'F04.00', trigger: 'QUICK ADD', type: 'bottom_drawer', componentRef: 'JURNL_DRAWER_LONG', navigationResult: 'THE SAME SHARED ADD SHEET AS TODAY.', authorityFile: AUTH, sharing: 'shared' },
    { id: 'F04.IN.ASK', sourceScreen: 'F04.00', trigger: 'ASK JURNL', type: 'bottom_drawer', componentRef: 'JURNL_DRAWER_SHORT', navigationResult: 'THE SAME SHARED ASK SHEET AS TODAY.', authorityFile: AUTH, sharing: 'shared' },
  ],
  dataObjects: [
    { id: 'ACTIVITY_LEDGER', description: 'MONEY MOVEMENTS', fields: ['merchant', 'amount', 'direction', 'when', 'account', 'category', 'status', 'recurring', 'related'], persistence: 'SESSION', notes: 'A TRANSACTION IS A MOVEMENT. A BILL AND A SUBSCRIPTION STAY RELATED CONTEXT.' },
  ],
  globalComponents: [
    { id: 'JURNL_INPUT', scope: 'GLOBAL', primitive: 'INPUT', description: 'SEARCH' },
    { id: 'JURNL_DRAWER_LONG', scope: 'GLOBAL', primitive: 'DRAWER', description: 'FILTER AND DETAIL' },
    { id: 'JURNL_NAV', scope: 'GLOBAL', primitive: 'NAV', description: 'SHARED PRIMARY NAV' },
  ],
  familyComponents: [
    { id: 'JURNL_TRANSACTION_ROW', scope: 'FAMILY', primitive: 'ROW', description: 'CANONICAL MOVEMENT ROW' },
  ],
  globalAssets: [
    { id: 'JURNL.FONT.DISPLAY', assetClass: 'GLOBAL_INHERITED', scope: 'GLOBAL_INHERITED', status: 'CANONICAL', source: 'INSTRUMENT SERIF' },
    { id: 'JURNL.FONT.FUNCTIONAL', assetClass: 'GLOBAL_INHERITED', scope: 'GLOBAL_INHERITED', status: 'CANONICAL', source: 'BARLOW SEMI CONDENSED' },
  ],
  familyAssets: [
    { id: 'ACTIVITY.ENVIRONMENT.LEDGER.001', assetClass: 'FAMILY_BACKGROUND', scope: 'FAMILY', status: 'CANONICAL', source: 'CANONICAL MOUNT', filePath: 'src/projects/jurnl/families/F04_ACTIVITY/ENVIRONMENTS/F04_ENVIRONMENT_LEDGER.jpg', format: 'jpg', nativeWidth: 2016, nativeHeight: 3584, routes: ['activity'], runtimeStatus: 'PLATE' },
    { id: 'ACTIVITY.UI.SURFACES', assetClass: 'IMPLEMENTATION_COMPONENT', scope: 'FAMILY', status: 'CODE_CONSTRUCTED', source: 'LIVE TYPE ON THE PAPER FIELD. NO RASTER ROW OR BUTTON SKIN.' },
  ],
  iconRequirements: ['BACK', 'INFO', 'SEARCH', 'FILTER', 'CLOSE', 'PLUS', 'DOCUMENT', 'CLOCK', 'ACCOUNT', 'DOWNLOAD', 'MONEY', 'ALERT', 'CHECK'].map((label) => ({
    id: label,
    label,
    variants: ['LINEAR'] as ('LINEAR' | 'FILLED')[],
    authorityFile: 'src/projects/jurnl/runtime/components/icons.tsx',
    implementation: 'LIVE_CODE_SVG' as const,
  })),
  responsive: [
    { id: 'MOBILE', width: 393, height: 852, primary: true, rule: 'LEDGER USES THE STAGE, LEAVING A LIGHT EDGE. THE LIST SCROLLS INSIDE THE APP.' },
    { id: 'TABLET', width: 834, height: 1194, primary: false, rule: 'LEDGER CAPS AT 560PX, LEFT WEIGHTED.' },
    { id: 'DESKTOP', width: 1440, height: 900, primary: false, rule: 'LEDGER AT 72PX, MAX 640PX.' },
  ],
  brandExpressionLevel: 'FUNCTIONAL',
  generationSettings: { model: 'GPT IMAGE 2.5 SUNBURST', resolution: '4K', aspect: '9:16', autoEnhance: false, creditsPerGeneration: 316 },
  generationBudget: JURNL_F04_BUDGET,
  assetPolicy: {
    assetFirstRequired: true,
    resolution: 'RESOLVED',
    reason: null,
    excludedSources: ['FULL SCREEN AUTHORITY AS RUNTIME', 'SCREENSHOT CROP', 'F03 DAY PLATE'],
    evidence: ['1 QUIET MATERIAL PLATE', '0 RASTER PANELS', '0 RASTER BUTTONS', 'AUTHORITY IS REFERENCE ONLY'],
  },
  approvalStatus: 'IN_REVIEW',
  implementationStatus: 'LIVE_QA_PASSED',
  qaStatus: 'LIVE_PASS',
  founderApproval: { approved: false, approvedAt: null, note: 'VISUAL APPROVAL STAYS PENDING.' },
  lineage: {
    parentAuthority: AUTH,
    sourceSprints: ['P0.JURNL.F03-F04-GROK-DUAL-FAMILY-AUTHORITY-SIDEKICK-LIVE-IMPLEMENTATION1'],
    notes: 'GROK OWNS THE LIVE PASS. SONNET IS NOT USED. OPUS AUDITS AFTER.',
  },
  supersession: { supersedes: [], supersededBy: null },
  journeys: [{ id: 'ACTIVITY', label: 'ACTIVITY', path: ['F03.00', 'F04.00'] }],
  claims: { withheld: 0, flagged: 0, rule: 'NO DISPUTE FLOW. NO LIVE BANK. PREVIEW MOVEMENTS ONLY.' },
};
