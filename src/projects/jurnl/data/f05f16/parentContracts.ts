/**
 * F05–F16 parent-only production contracts (W0.7). Structure registered; children remain later waves.
 */

import {
  FAMILY_PRODUCTION_CONTRACT_VERSION,
  type FamilyProductionContract,
} from '../../../../../shared/site00-product-families/familyProductionContract.js';
import { buildFamilyBudgetRecord } from '../../../../../shared/site00-product-families/productionBudget.js';
import { JURNL_BUDGET_BASELINE, JURNL_F01_BUDGET } from '../f01/contract';
import { JURNL_F04_BUDGET } from '../f04/contract';
import { PARENTS } from '../parents/catalog';
import type { RuntimeCoverage } from '../../../../../shared/site00-product-families/familyGate.js';

function parentContract(spec: (typeof PARENTS)[number]): FamilyProductionContract {
  const id = spec.id;
  return {
    contractVersion: FAMILY_PRODUCTION_CONTRACT_VERSION,
    familyId: id,
    familyName: spec.name,
    projectId: 'JURNL',
    purpose: spec.question,
    parentScreen: spec.screenId,
    screens: [
      {
        id: spec.screenId,
        name: spec.name,
        role: 'PARENT',
        parentId: null,
        runtimeRoute: spec.route,
        authorityFile: null,
        approvalStatus: 'NOT_STARTED',
        implementationStatus: 'IN_PROGRESS',
        stateIds: [`${spec.screenId}.PLACEHOLDER`],
        bridgeTo: undefined,
      },
    ],
    states: [{ id: `${spec.screenId}.PLACEHOLDER`, label: 'PREVIEW PARENT', screenId: spec.screenId, authorityFile: null, implemented: true }],
    interactions: [
      { id: `${id}.IN.QUICK_ADD`, sourceScreen: spec.screenId, trigger: 'QUICK ADD', type: 'bottom_drawer', componentRef: 'JURNL_DRAWER_LONG', navigationResult: 'GLOBAL QUICK ADD', authorityFile: 'src/projects/jurnl/data/parents/catalog.ts', sharing: 'shared' },
      { id: `${id}.NAV.TODAY`, sourceScreen: spec.screenId, trigger: 'TODAY', type: 'route_transition', componentRef: 'JURNL_BUTTON_UTILITY', navigationResult: 'F03.00', authorityFile: 'src/projects/jurnl/data/parents/catalog.ts', sharing: 'shared' },
    ],
    dataObjects: [],
    globalComponents: [{ id: 'JURNL_NAV', scope: 'GLOBAL', primitive: 'NAV', description: 'BOTTOM NAV DOCK' }],
    familyComponents: [],
    globalAssets: [],
    familyAssets: [],
    iconRequirements: ['BACK', 'INFO', 'PLUS'].map((label) => ({
      id: label,
      label,
      variants: ['LINEAR'] as ('LINEAR' | 'FILLED')[],
      authorityFile: 'src/projects/jurnl/runtime/components/icons.tsx',
      implementation: 'LIVE_CODE_SVG' as const,
    })),
    responsive: [
      { id: 'MOBILE', width: 393, height: 852, primary: true, rule: 'PARENT AUTHORITY + PREVIEW SIGNAL.' },
      { id: 'TABLET', width: 834, height: 1194, primary: false, rule: 'SAME STRUCTURE, WIDER STAGE.' },
      { id: 'DESKTOP', width: 1440, height: 900, primary: false, rule: 'SAME STRUCTURE, DESKTOP STAGE.' },
    ],
    brandExpressionLevel: 'EDITORIAL',
    generationSettings: { model: 'NONE', resolution: 'PARENT AUTHORITY', aspect: '9:16', autoEnhance: false, creditsPerGeneration: 0 },
    generationBudget: buildFamilyBudgetRecord(JURNL_BUDGET_BASELINE, [JURNL_F01_BUDGET, JURNL_F04_BUDGET], {
      familyId: id,
      tracking: 'TRACKED',
      creditsBefore: 0,
      creditsAfter: 0,
      assetGenerations: 0,
      screenGenerations: 0,
      interactionGenerations: 0,
      recoveryGenerations: 0,
      notes: 'WAVE 0 REGISTRATION ONLY — NO NEW GENERATION.',
    }),
    assetPolicy: {
      assetFirstRequired: true,
      resolution: 'UNRESOLVED',
      reason: null,
      excludedSources: ['CHILD ROUTES NOT BUILT'],
      evidence: [spec.plateOrigin, `INTERFERENCE ${spec.interference}`],
    },
    approvalStatus: 'NOT_STARTED',
    implementationStatus: 'IN_PROGRESS',
    qaStatus: 'NOT_RUN',
    founderApproval: { approved: false, approvedAt: null, note: 'PARENT REVIEW ONLY — NOT APPROVED FOR LAUNCH.' },
    lineage: { parentAuthority: spec.plateOrigin, sourceSprints: ['P0.JURNL.WAVE0-FOUNDATIONS'], notes: spec.summary },
    supersession: { supersedes: [], supersededBy: null },
    journeys: [{ id: id, label: spec.name, path: [spec.screenId] }],
    claims: { withheld: 0, flagged: 0, rule: 'PREVIEW COMPOSITION — NOT LIVE DATA.' },
  };
}

export const JURNL_F05_CONTRACT = parentContract(PARENTS.find((p) => p.id === 'F05')!);
export const JURNL_F06_CONTRACT = parentContract(PARENTS.find((p) => p.id === 'F06')!);
export const JURNL_F07_CONTRACT = parentContract(PARENTS.find((p) => p.id === 'F07')!);
export const JURNL_F08_CONTRACT = parentContract(PARENTS.find((p) => p.id === 'F08')!);
export const JURNL_F09_CONTRACT = parentContract(PARENTS.find((p) => p.id === 'F09')!);
export const JURNL_F10_CONTRACT = parentContract(PARENTS.find((p) => p.id === 'F10')!);
export const JURNL_F11_CONTRACT = parentContract(PARENTS.find((p) => p.id === 'F11')!);
export const JURNL_F12_CONTRACT = parentContract(PARENTS.find((p) => p.id === 'F12')!);
export const JURNL_F13_CONTRACT = parentContract(PARENTS.find((p) => p.id === 'F13')!);
export const JURNL_F14_CONTRACT = parentContract(PARENTS.find((p) => p.id === 'F14')!);
export const JURNL_F15_CONTRACT = parentContract(PARENTS.find((p) => p.id === 'F15')!);
export const JURNL_F16_CONTRACT = parentContract(PARENTS.find((p) => p.id === 'F16')!);

export function parentCoverage(familyId: string): RuntimeCoverage {
  return {
    screens: [`${familyId}.00`],
    states: [`${familyId}.00.PLACEHOLDER`],
    interactions: [`${familyId}.IN.QUICK_ADD`, `${familyId}.NAV.TODAY`],
    components: ['JURNL_NAV', 'JURNL_BUTTON_UTILITY'],
    responsive: ['MOBILE', 'TABLET', 'DESKTOP'],
  };
}

export const JURNL_F05_COVERAGE = parentCoverage('F05');
export const JURNL_F06_COVERAGE = parentCoverage('F06');
export const JURNL_F07_COVERAGE = parentCoverage('F07');
export const JURNL_F08_COVERAGE = parentCoverage('F08');
export const JURNL_F09_COVERAGE = parentCoverage('F09');
export const JURNL_F10_COVERAGE = parentCoverage('F10');
export const JURNL_F11_COVERAGE = parentCoverage('F11');
export const JURNL_F12_COVERAGE = parentCoverage('F12');
export const JURNL_F13_COVERAGE = parentCoverage('F13');
export const JURNL_F14_COVERAGE = parentCoverage('F14');
export const JURNL_F15_COVERAGE = parentCoverage('F15');
export const JURNL_F16_COVERAGE = parentCoverage('F16');
