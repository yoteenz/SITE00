import {
  FAMILY_PRODUCTION_CONTRACT_VERSION,
  type FamilyProductionContract,
} from '../../../../../shared/site00-product-families/familyProductionContract.js';
import { buildFamilyBudgetRecord } from '../../../../../shared/site00-product-families/productionBudget.js';
import { JURNL_BUDGET_BASELINE, JURNL_F01_BUDGET } from '../f01/contract';
import { JURNL_F02_BUDGET } from '../f02/contract';
import { F03_SCREENS } from './screens';

const AUTH = 'public/jurnl/f03-today/authorities/F03.00_TODAY_PARENT.jpg';

export const JURNL_F03_BUDGET = buildFamilyBudgetRecord(JURNL_BUDGET_BASELINE, [JURNL_F01_BUDGET, JURNL_F02_BUDGET], {
  familyId: 'F03',
  tracking: 'TRACKED',
  creditsBefore: 35063,
  creditsAfter: 33782,
  assetGenerations: 2,
  screenGenerations: 2,
  interactionGenerations: 0,
  recoveryGenerations: 1,
  notes: 'TEXT2IMAGE PARENT AND PLATE ARE SUPERSEDED. CANONICAL JOBS ARE IMAGE2IMAGE FROM REFERENCE_F01.00_WELCOME_APPROVED, SAME METHOD AS F02. QUOTED 1266. ACCOUNT SHARE INCLUDING HALF THE UNALLOCATED VARIANCE IS 1281.',
});

const STATE_IDS = ['F03.00.LOADING', 'F03.00.EMPTY', 'F03.00.PARTIAL', 'F03.00.CONNECTED', 'F03.00.ERROR', 'F03.00.CAUGHT_UP', 'F03.00.ATTENTION', 'F03.00.STALE'];

export const JURNL_F03_CONTRACT: FamilyProductionContract = {
  contractVersion: FAMILY_PRODUCTION_CONTRACT_VERSION,
  familyId: 'F03',
  familyName: 'TODAY',
  projectId: 'JURNL',
  purpose: 'THE DAILY HOME. ONE COMPUTED SIGNAL, THEN WHAT IS COMING AND WHAT JUST MOVED.',
  parentScreen: 'F03.00',
  screens: F03_SCREENS.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    parentId: null,
    runtimeRoute: s.route,
    authorityFile: s.authorityFile,
    approvalStatus: 'IN_REVIEW' as const,
    implementationStatus: 'IMPLEMENTED' as const,
    stateIds: STATE_IDS,
    bridgeTo: 'F04',
  })),
  states: [
    { id: 'F03.00.LOADING', label: 'LOADING', screenId: 'F03.00', authorityFile: null, implemented: true },
    { id: 'F03.00.EMPTY', label: 'EMPTY', screenId: 'F03.00', authorityFile: null, implemented: true },
    { id: 'F03.00.PARTIAL', label: 'PARTIAL', screenId: 'F03.00', authorityFile: null, implemented: true },
    { id: 'F03.00.CONNECTED', label: 'CONNECTED', screenId: 'F03.00', authorityFile: null, implemented: true },
    { id: 'F03.00.ERROR', label: 'ERROR', screenId: 'F03.00', authorityFile: null, implemented: true },
    { id: 'F03.00.CAUGHT_UP', label: 'CAUGHT UP', screenId: 'F03.00', authorityFile: null, implemented: true },
    { id: 'F03.00.ATTENTION', label: 'ATTENTION', screenId: 'F03.00', authorityFile: null, implemented: true },
    { id: 'F03.00.STALE', label: 'STALE', screenId: 'F03.00', authorityFile: null, implemented: true },
  ],
  interactions: [
    { id: 'F03.IN.SEE_WHY', sourceScreen: 'F03.00', trigger: 'SEE WHY', type: 'bottom_drawer', componentRef: 'JURNL_DRAWER_LONG', navigationResult: 'EXPLAINS THE COMPUTED SIGNAL. DOES NOT OPEN F09.', authorityFile: AUTH, sharing: 'distinct' },
    { id: 'F03.IN.QUICK_ADD', sourceScreen: 'F03.00', trigger: 'QUICK ADD', type: 'bottom_drawer', componentRef: 'JURNL_DRAWER_LONG', navigationResult: 'SHARED ADD SHEET. WRITES A PREVIEW MOVEMENT.', authorityFile: AUTH, sharing: 'shared' },
    { id: 'F03.IN.ASK', sourceScreen: 'F03.00', trigger: 'ASK JURNL', type: 'bottom_drawer', componentRef: 'JURNL_DRAWER_SHORT', navigationResult: 'SHARED EXPLANATION. NO UPGRADE PANEL.', authorityFile: AUTH, sharing: 'shared' },
    { id: 'F03.IN.UPCOMING', sourceScreen: 'F03.00', trigger: 'MORE', type: 'inline_expansion', componentRef: 'JURNL_BUTTON_SECONDARY', navigationResult: 'EXPANDS THE COMING LIST ON TODAY.', authorityFile: AUTH, sharing: 'distinct' },
    { id: 'F03.IN.ACTIVITY', sourceScreen: 'F03.00', trigger: 'ACTIVITY', type: 'route_transition', componentRef: 'JURNL_BUTTON_SECONDARY', navigationResult: 'OPENS F04 ACTIVITY.', authorityFile: AUTH, sharing: 'distinct' },
    { id: 'F03.NAV.BACK', sourceScreen: 'F03.00', trigger: 'BACK TO SETUP', type: 'route_transition', componentRef: 'JURNL_ICON_BUTTON', navigationResult: 'RETURNS TO F02.08.', authorityFile: AUTH, sharing: 'shared' },
  ],
  dataObjects: [
    { id: 'TODAY_HOME', description: 'THE DAILY READING', fields: ['cash', 'upcoming', 'protected', 'safeToSpend', 'attention'], persistence: 'SESSION', notes: 'CASH AND MOVEMENTS ARE MOCK OR ADDED. SAFE TO SPEND IS DERIVED. NO LIVE BANK.' },
  ],
  globalComponents: [
    { id: 'JURNL_BUTTON_PRIMARY', scope: 'GLOBAL', primitive: 'BUTTON', description: 'SEE WHY' },
    { id: 'JURNL_BUTTON_SECONDARY', scope: 'GLOBAL', primitive: 'BUTTON', description: 'QUIET ACTIONS' },
    { id: 'JURNL_DRAWER_LONG', scope: 'GLOBAL', primitive: 'DRAWER', description: 'SEE WHY AND QUICK ADD' },
    { id: 'JURNL_NAV', scope: 'GLOBAL', primitive: 'NAV', description: 'HOME MONEY PLUS PLAN CREDIT' },
  ],
  familyComponents: [
    { id: 'JURNL_TRANSACTION_ROW', scope: 'FAMILY', primitive: 'ROW', description: 'SHARED WITH ACTIVITY' },
  ],
  globalAssets: [
    { id: 'JURNL.FONT.DISPLAY', assetClass: 'GLOBAL_INHERITED', scope: 'GLOBAL_INHERITED', status: 'CANONICAL', source: 'INSTRUMENT SERIF' },
    { id: 'JURNL.FONT.FUNCTIONAL', assetClass: 'GLOBAL_INHERITED', scope: 'GLOBAL_INHERITED', status: 'CANONICAL', source: 'BARLOW SEMI CONDENSED' },
  ],
  familyAssets: [
    { id: 'TODAY.ENVIRONMENT.DAY.001', assetClass: 'FAMILY_BACKGROUND', scope: 'FAMILY', status: 'IN_REVIEW', source: 'DERIVED_FROM_AUTHORITY', filePath: 'src/projects/jurnl/families/F03_TODAY/ENVIRONMENTS/F03_ENVIRONMENT_DAY.jpg', format: 'jpg', nativeWidth: 2016, nativeHeight: 3584, routes: ['today'], runtimeStatus: 'PLATE' },
    { id: 'TODAY.UI.SURFACES', assetClass: 'IMPLEMENTATION_COMPONENT', scope: 'FAMILY', status: 'CODE_CONSTRUCTED', source: 'LIVE TYPE AND BONE PANELS. NO RASTER BUTTON OR PANEL SKIN.' },
  ],
  iconRequirements: ['BACK', 'INFO', 'CHECK', 'ALERT', 'CLOSE', 'PLUS', 'DOCUMENT', 'CLOCK', 'ACCOUNT', 'DOWNLOAD', 'SEARCH', 'FILTER', 'MONEY'].map((label) => ({
    id: label,
    label,
    variants: ['LINEAR'] as ('LINEAR' | 'FILLED')[],
    authorityFile: 'src/projects/jurnl/runtime/components/icons.tsx',
    implementation: 'LIVE_CODE_SVG' as const,
  })),
  responsive: [
    { id: 'MOBILE', width: 393, height: 852, primary: true, rule: 'NARROW LEFT COLUMN ON THE BONE WALL. THE WINDOW STAYS OPEN.' },
    { id: 'TABLET', width: 834, height: 1194, primary: false, rule: 'COLUMN STAYS 280PX AT THE LEFT. IT DOES NOT STRETCH.' },
    { id: 'DESKTOP', width: 1440, height: 900, primary: false, rule: 'COLUMN AT 72PX. PLATE BREATHES ACROSS THE STAGE.' },
  ],
  brandExpressionLevel: 'EDITORIAL',
  generationSettings: { model: 'GPT IMAGE 2.5 SUNBURST', resolution: '4K', aspect: '9:16', autoEnhance: false, creditsPerGeneration: 316 },
  generationBudget: JURNL_F03_BUDGET,
  assetPolicy: {
    assetFirstRequired: true,
    resolution: 'RESOLVED',
    reason: null,
    excludedSources: ['FULL SCREEN AUTHORITY AS RUNTIME', 'SCREENSHOT CROP'],
    evidence: ['1 ENVIRONMENT PLATE', '0 RASTER PANELS', '0 RASTER BUTTONS', 'AUTHORITY IS REFERENCE ONLY'],
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
  supersession: { supersedes: ['F03.BOUNDARY'], supersededBy: null },
  journeys: [{ id: 'TODAY', label: 'TODAY', path: ['F02.08', 'F03.00', 'F04.00'] }],
  claims: { withheld: 0, flagged: 0, rule: 'NO PAYWALL. SAFE TO SPEND IS LABELED AS A COMPUTED SIGNAL. FIGURES ARE PREVIEW.' },
};
