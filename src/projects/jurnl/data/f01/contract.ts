/**
 * JURNL F01 ENTRY — FamilyProductionContract instance (first proof case of the project-agnostic contract).
 */

import {
  FAMILY_PRODUCTION_CONTRACT_VERSION,
  type FamilyInteractionType,
  type FamilyProductionContract,
} from '../../../../../shared/site00-product-families/familyProductionContract.js';
import { assetPolicyFor } from '../../../../../shared/site00-product-families/assetFirstPolicy.js';
import { buildFamilyBudgetRecord, type ProjectBudgetBaseline } from '../../../../../shared/site00-product-families/productionBudget.js';
import { F01_CLAIMS } from './copy';
import { F01_INTERACTION_MANIFEST } from './interactionBindings';
import { F01_SCREENS, F01_STATES, F01_STATE_SHEETS } from './screens';
import { JURNL_F01_MONETIZATION } from '../monetization/familyMonetization';

export const JURNL_BUDGET_BASELINE: ProjectBudgetBaseline = {
  projectId: 'JURNL',
  generation: { model: 'GPT IMAGE 2.5 SUNBURST', resolution: '2K', aspect: '9:16', autoEnhance: false, creditsPerGeneration: 170 },
  creditPriceUsd: 0.003,
  purchaseUnit: { credits: 5000, usd: 15 },
  baseEstimateCredits: 42331,
  realisticRangeCredits: [52000, 53100],
  safeCeilingCredits: 60000,
};

/**
 * F01 predates the budget contract: spend is known from the motherboard log (~20 family generations ≈ 3,484
 * credits; plus the harvest-proof parent and the 10-sheet uppercase interaction regen) but credits before/after
 * were never captured. Recorded as LEGACY_PARTIAL; F02 is the first TRACKED family.
 */
export const JURNL_F01_BUDGET = buildFamilyBudgetRecord(JURNL_BUDGET_BASELINE, [], {
  familyId: 'F01',
  tracking: 'LEGACY_PARTIAL',
  creditsBefore: null,
  creditsAfter: null,
  familyCredits: 3484 + 170 + 10 * 170 + 10 * 170,
  assetGenerations: 0,
  screenGenerations: 15,
  interactionGenerations: 21,
  recoveryGenerations: 0,
  notes:
    'RECONSTRUCTED FROM MOTHERBOARD: F01 FULL FAMILY (~3,484) + HARVEST PROOF PARENT (1 × 170) + INTERACTION AUTHORITY (10 × 170) + UPPERCASE REGEN (10 × 170). CREDITS BEFORE/AFTER NOT CAPTURED.',
});

const AUTH = (file: string) => `public/site00/projects/jurnl/f01/authorities/${file}`;

export const JURNL_F01_CONTRACT: FamilyProductionContract = {
  contractVersion: FAMILY_PRODUCTION_CONTRACT_VERSION,
  familyId: 'F01',
  familyName: 'ENTRY',
  projectId: 'JURNL',
  purpose:
    'GET A PERSON INTO JURNL CALMLY: CREATE OR RECOVER AN ACCOUNT, VERIFY EMAIL, SET UP FACE ID AND DEVICE TRUST, UNDERSTAND PRIVACY AND SECURITY, THEN HAND OFF TO F02 SETUP.',
  parentScreen: 'F01.00',
  screens: F01_SCREENS.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.id === 'F01.00' ? 'PARENT' : 'CHILD',
    parentId: s.id === 'F01.00' ? null : 'F01.00',
    runtimeRoute: s.route,
    authorityFile: AUTH(s.authority),
    approvalStatus: s.id === 'F01.00' ? 'FOUNDER_APPROVED' : 'IMPLEMENTATION_READY',
    implementationStatus: 'IMPLEMENTED',
    stateIds: F01_STATES.filter((st) => st.screenId === s.id).map((st) => st.id),
    ...(s.id === 'F01.13' ? { bridgeTo: 'F02' } : {}),
  })),
  states: F01_STATES.map((s) => ({
    id: s.id,
    label: s.label,
    screenId: s.screenId,
    authorityFile: AUTH(F01_STATE_SHEETS[s.sheet]),
    implemented: true,
  })),
  interactions: F01_INTERACTION_MANIFEST.interactions.map((row) => ({
    id: row.interaction_id,
    sourceScreen: row.source_screen,
    trigger: row.trigger,
    type: row.interaction_type as FamilyInteractionType,
    componentRef: row.component_reference,
    navigationResult: row.navigation_result,
    authorityFile: row.authority_file,
    sharing: row.shared_or_distinct as 'shared' | 'distinct' | 'shared_shell_distinct_content',
  })),
  dataObjects: [
    { id: 'ACCOUNT', description: 'THE PERSON SIGNING UP', fields: ['firstName', 'lastName', 'email', 'emailVerified'], persistence: 'UNRESOLVED', notes: 'PROVIDER UNRESOLVED — DESIGN-PREVIEW ADAPTER HOLDS IT IN DEVICE STORAGE.' },
    { id: 'SESSION', description: 'SIGNED-IN SESSION', fields: ['status', 'keepSignedIn'], persistence: 'SESSION' },
    { id: 'REMEMBERED_ACCOUNTS', description: 'ACCOUNTS SAVED ON THIS DEVICE (RETURNING USER)', fields: ['email', 'displayName', 'initials'], persistence: 'DEVICE' },
    { id: 'BIOMETRIC_PREFERENCE', description: 'FACE ID DECISION', fields: ['state', 'method'], persistence: 'DEVICE', notes: 'NATIVE BRIDGE REQUIRED FOR A REAL BIOMETRIC LOCK.' },
    { id: 'DEVICE_TRUST', description: 'THIS DEVICE TRUSTED OR NOT', fields: ['state'], persistence: 'DEVICE' },
    { id: 'PRIVACY_PREFERENCES', description: 'AI ACCESS CHOICES + EXPORT REQUEST', fields: ['personalizedInsights', 'smartCategorization', 'budgetRecommendations', 'naturalLanguage', 'marketTrends', 'exportRequested'], persistence: 'DEVICE' },
  ],
  globalComponents: [
    { id: 'JURNL_BUTTON_PRIMARY', scope: 'GLOBAL', primitive: 'BUTTON', description: 'DEEP EMERALD, SQUARE-ROUNDED, UPPERCASE' },
    { id: 'JURNL_BUTTON_SECONDARY', scope: 'GLOBAL', primitive: 'BUTTON', description: 'BONE / IVORY, SUBTLE NEUTRAL BORDER' },
    { id: 'JURNL_INPUT', scope: 'GLOBAL', primitive: 'INPUT', description: 'IVORY FIELD, UPPERCASE LABEL' },
    { id: 'JURNL_CHECKBOX', scope: 'GLOBAL', primitive: 'CHECKBOX', description: 'SQUARE-ROUNDED (NEVER CIRCULAR)' },
    { id: 'JURNL_TOGGLE', scope: 'GLOBAL', primitive: 'TOGGLE', description: 'SQUARE-ROUNDED TRACK AND KNOB' },
  ],
  familyComponents: Object.keys(
    Object.fromEntries(F01_INTERACTION_MANIFEST.interactions.map((r) => [r.component_reference, 1])),
  ).map((id) => ({ id, scope: 'FAMILY' as const, primitive: id.replace(/^JURNL_/, ''), description: 'F01 INTERACTION PRIMITIVE' })),
  globalAssets: [
    { id: 'JURNL.LOGO.OFFICIAL', assetClass: 'GLOBAL_INHERITED', scope: 'GLOBAL_INHERITED', status: 'CANONICAL', source: 'REFERENCE/REFERENCE_JURNL_LOGO_OFFICIAL.jpg → public/site00/projects/jurnl/brand/jurnl-logo-official.png' },
    { id: 'JURNL.FONT.DISPLAY', assetClass: 'GLOBAL_INHERITED', scope: 'GLOBAL_INHERITED', status: 'CANONICAL', source: 'INSTRUMENT SERIF (OFL) — FASHION CONDENSED DISPLAY' },
    { id: 'JURNL.FONT.FUNCTIONAL', assetClass: 'GLOBAL_INHERITED', scope: 'GLOBAL_INHERITED', status: 'CANONICAL', source: 'BARLOW SEMI CONDENSED (OFL) — CONDENSED SANS' },
  ],
  familyAssets: [
    { id: 'ENTRY.ENV.PLASTER_LIGHT', assetClass: 'FAMILY_BACKGROUND', scope: 'FAMILY', status: 'CODE_CONSTRUCTED', source: 'CSS + SVG NOISE (runtime/components/Environment.tsx)' },
    { id: 'ENTRY.ARCH.WINDOW_COAST', assetClass: 'ARCHITECTURAL_LAYER', scope: 'FAMILY', status: 'CODE_CONSTRUCTED', source: 'SVG' },
    { id: 'ENTRY.MATERIAL.CURTAIN', assetClass: 'MATERIAL_TEXTURE', scope: 'FAMILY', status: 'CODE_CONSTRUCTED', source: 'SVG GRADIENT FOLDS' },
    { id: 'ENTRY.MATERIAL.TRAVERTINE', assetClass: 'MATERIAL_TEXTURE', scope: 'FAMILY', status: 'CODE_CONSTRUCTED', source: 'CSS + SVG NOISE' },
    { id: 'ENTRY.BOTANICAL.OLIVE', assetClass: 'BOTANICAL', scope: 'FAMILY', status: 'CODE_CONSTRUCTED', source: 'SVG' },
    { id: 'ENTRY.LIGHT.SUN', assetClass: 'LIGHT_OVERLAY', scope: 'FAMILY', status: 'CODE_CONSTRUCTED', source: 'CSS GRADIENT SHAFTS' },
    { id: 'ENTRY.OBJECT.BOOKS', assetClass: 'ISOLATED_OBJECT', scope: 'FAMILY', status: 'CODE_CONSTRUCTED', source: 'CSS (LIVE "JURNL" SPINE TEXT)' },
    { id: 'ENTRY.OBJECT.BOWL', assetClass: 'ISOLATED_OBJECT', scope: 'FAMILY', status: 'CODE_CONSTRUCTED', source: 'SVG' },
    { id: 'ENTRY.OBJECT.BUST', assetClass: 'ISOLATED_OBJECT', scope: 'FAMILY', status: 'MISSING', source: 'NONE', notes: 'NOT RECONSTRUCTED IN CODE (WOULD BE INVENTED ART). NEEDS A CANONICAL ISOLATED ASSET — ASSET-FIRST.' },
    { id: 'ENTRY.OBJECT.SOFA_CUSHIONS', assetClass: 'ISOLATED_OBJECT', scope: 'FAMILY', status: 'CODE_CONSTRUCTED', source: 'CSS' },
    { id: 'ENTRY.HARVEST.V1', assetClass: 'ISOLATED_OBJECT', scope: 'FAMILY', status: 'NOT_CANONICAL', source: 'JURNL/F01_ENTRY/ASSETS (FAILED HARVEST, 50%)', notes: 'EXCLUDED FROM RUNTIME.' },
    { id: 'ENTRY.UI.CONTROLS', assetClass: 'IMPLEMENTATION_COMPONENT', scope: 'FAMILY', status: 'CODE_CONSTRUCTED', source: 'COMPONENTS — NEVER RASTER' },
  ],
  iconRequirements: [
    'BACK', 'CLOSE', 'EMAIL', 'PASSWORD', 'SHOW PASSWORD', 'HIDE PASSWORD', 'CHECK', 'ERROR', 'INFO', 'APPLE', 'GOOGLE', 'FACE ID / BIOMETRIC',
    'TRUSTED DEVICE', 'SECURITY', 'PRIVACY', 'VERIFIED', 'ACCOUNT', 'SWITCH ACCOUNT', 'RESEND', 'EXTERNAL / OPEN APP', 'RETRY', 'OFFLINE', 'SUCCESS',
  ].map((label) => ({
    id: label.replace(/[^A-Z]+/g, '_').replace(/^_|_$/g, ''),
    label,
    variants: ['LINEAR', 'FILLED'] as ('LINEAR' | 'FILLED')[],
    authorityFile: 'ICONS/F01_ICON_PACK_SHEET.png',
    implementation: 'LIVE_CODE_SVG' as const,
  })),
  responsive: [
    { id: 'MOBILE', width: 393, height: 852, primary: true, rule: 'AUTHORITY COMPOSITION. FULL-BLEED ENVIRONMENT, 32PX COLUMN MARGINS.' },
    { id: 'TABLET', width: 834, height: 1194, primary: false, rule: 'ENVIRONMENT EXPANDS; CONTENT COLUMN CAPPED AT 480PX; HIERARCHY UNCHANGED.' },
    { id: 'DESKTOP', width: 1440, height: 900, primary: false, rule: 'SPLIT: CONTENT COLUMN (440PX) OVER PLASTER, ARCHITECTURE OPENS ON THE RIGHT. NO UPSCALED MOBILE.' },
  ],
  brandExpressionLevel: 'EDITORIAL',
  generationSettings: JURNL_BUDGET_BASELINE.generation,
  generationBudget: JURNL_F01_BUDGET,
  assetPolicy: assetPolicyFor({
    legacyPilot: true,
    reason:
      'F01 IS THE LEGACY PILOT FROM BEFORE ASSET-FIRST. PARENT → REVERSE-EXTRACT FAILED FORMAL PROOF (14 ATTEMPTED / 7 ISOLATED / 50%; TRANSPARENT + MATERIAL EXTRACTION FAILED). F01 IS IMPLEMENTED FROM AUTHORITIES WITH CODE-CONSTRUCTED ENVIRONMENT; NO HARVESTED RASTER IS MOUNTED.',
    evidence: ['14 ATTEMPTED · 7 ISOLATED · 50%', 'TRANSPARENT OBJECT EXTRACTION FAILED', 'MATERIAL EXTRACTION FAILED', 'ARCHITECTURAL EXTRACTION PASSED', 'SCREENSHOT-CROP CONTAMINATION'],
    excludedSources: ['JURNL/F01_ENTRY/ASSETS/**', 'JURNL/F01_ENTRY/OVERLAYS/**', 'JURNL/F01_ENTRY/ASSET_HARVEST_PROOF1/**', 'JURNL/F01_ENTRY/SHEETS/SHEET_A_F01_CANONICAL_HARVEST.png', 'JURNL/F01_ENTRY/MANIFEST/COMPONENT_REFERENCES/**'],
  }),
  approvalStatus: 'IMPLEMENTATION_READY',
  implementationStatus: 'LIVE_QA_PASSED',
  qaStatus: 'LIVE_PASS',
  founderApproval: { approved: false, approvedAt: null, note: 'F01.00 PARENT IS FOUNDER-APPROVED. THE FAMILY AWAITS FOUNDER RUNTIME REVIEW.' },
  lineage: {
    parentAuthority: 'AUTHORITIES/REFERENCE_F01.00_WELCOME_APPROVED.jpg',
    sourceSprints: [
      'P0.JURNL.F01-ENTRY-FULL-FAMILY-PRODUCTION1',
      'P0.JURNL.F01-ASSET-HARVEST-RECOVERY1',
      'P0.JURNL.F01-PARENT-ASSET-HARVEST-PROOF1',
      'P0.JURNL.F01-INTERACTION-AUTHORITY-COMPLETE1',
      'P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1',
    ],
  },
  monetization: JURNL_F01_MONETIZATION,
  journeys: [
    { id: 'NEW', label: 'NEW ACCOUNT', path: ['F01.00', 'F01.01', 'F01.02', 'F01.09', 'F01.10', 'F01.11', 'F01.12', 'F01.13'] },
    { id: 'SIGN_IN', label: 'SIGN IN', path: ['F01.00', 'F01.03', 'F01.09', 'F01.10', 'F01.13'] },
    { id: 'RETURNING', label: 'RETURNING', path: ['F01.04', 'F01.13'] },
    { id: 'RECOVERY', label: 'RECOVERY', path: ['F01.03', 'F01.05', 'F01.06', 'F01.07', 'F01.08', 'F01.03'] },
  ],
  claims: {
    withheld: F01_CLAIMS.filter((c) => c.status === 'WITHHELD').length,
    flagged: F01_CLAIMS.filter((c) => c.status === 'FLAGGED_REQUIRES_SUBSTANTIATION').length,
    rule: 'NO BANK-LEVEL / ENCRYPTION / FRAUD / AUDIT / DATA-SALE CLAIMS WITHOUT A VERIFIED SYSTEM',
  },
  supersession: {
    supersedes: ['JURNL/F01_ENTRY/ASSETS (HARVEST V1 — NOT CANONICAL)', 'MANIFEST/F01_IMPLEMENTATION_MAPPING.md ASSET USAGE ("COMPOSITED FROM ASSETS/ENTRY.*")'],
    supersededBy: null,
  },
};
