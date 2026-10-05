import type { BlockedReason, GenerationRequest } from './types.js';

export type FamilyOutputProject = {
  productProjectId: string;
  familyId: string;
  provider: string;
  providerProjectId: string;
  providerProjectName: string;
  repoFolder: string;
};

/**
 * One provider project per family. New families are added here before the first paid generation.
 * Do not dispatch a family into another family's project.
 */
export const FAMILY_OUTPUT_PROJECTS: readonly FamilyOutputProject[] = [
  {
    productProjectId: 'JURNL',
    familyId: 'F01',
    provider: 'OpenArt',
    providerProjectId: 'TToQavm9coU1QGPRfEzU',
    providerProjectName: 'JURNL F01 Entry Family Production',
    repoFolder: 'JURNL/F01_ENTRY',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F02',
    provider: 'OpenArt',
    providerProjectId: 'rVShOWFblztGdIxRYHmL',
    providerProjectName: 'JURNL F02 Setup Family Production',
    repoFolder: 'JURNL/F02_SETUP',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F03',
    provider: 'OpenArt',
    providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
    providerProjectName: 'JURNL F03 Today Family Production',
    repoFolder: 'JURNL/F03_TODAY',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F04',
    provider: 'OpenArt',
    providerProjectId: 'KUfyzoatdwpaYBkq2Mf8',
    providerProjectName: 'JURNL F04 Activity Family Production',
    repoFolder: 'JURNL/F04_ACTIVITY',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F05',
    provider: 'OpenArt',
    providerProjectId: 'ga30cJVwkccjlXta8io5',
    providerProjectName: 'JURNL F05 Money',
    repoFolder: 'JURNL/F05_MONEY',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F06',
    provider: 'OpenArt',
    providerProjectId: 'JFXLEG7wQ6DUgqE3MdUB',
    providerProjectName: 'JURNL F06 Income',
    repoFolder: 'JURNL/F06_INCOME',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F07',
    provider: 'OpenArt',
    providerProjectId: 'OQSZBlCKnjwwdIR9GVTZ',
    providerProjectName: 'JURNL F07 Upcoming',
    repoFolder: 'JURNL/F07_UPCOMING',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F08',
    provider: 'OpenArt',
    providerProjectId: 'd9ZoZo4gUWHNO7GSifZa',
    providerProjectName: 'JURNL F08 Plan',
    repoFolder: 'JURNL/F08_PLAN',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F09',
    provider: 'OpenArt',
    providerProjectId: 'VdiPtgVqb21sYl003uox',
    providerProjectName: 'JURNL F09 Safe to Spend',
    repoFolder: 'JURNL/F09_SAFE',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F10',
    provider: 'OpenArt',
    providerProjectId: 'SffNHRCKiMIzvkXj69ev',
    providerProjectName: 'JURNL F10 Purchases',
    repoFolder: 'JURNL/F10_PURCHASES',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F11',
    provider: 'OpenArt',
    providerProjectId: 'ntqFD6JfvalK7DFjPt06',
    providerProjectName: 'JURNL F11 Trips',
    repoFolder: 'JURNL/F11_TRIPS',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F12',
    provider: 'OpenArt',
    providerProjectId: 'nCNdLAPPEv0tktgrsK0y',
    providerProjectName: 'JURNL F12 Credit',
    repoFolder: 'JURNL/F12_CREDIT',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F13',
    provider: 'OpenArt',
    providerProjectId: 'osNSPebd9uRKeVDeUUvK',
    providerProjectName: 'JURNL F13 Paydown',
    repoFolder: 'JURNL/F13_PAYDOWN',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F14',
    provider: 'OpenArt',
    providerProjectId: 'P1jCjl8WWXxIHAdd1QX8',
    providerProjectName: 'JURNL F14 Goals',
    repoFolder: 'JURNL/F14_GOALS',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F15',
    provider: 'OpenArt',
    providerProjectId: 'tXsxlD6FabwcTqapXhX4',
    providerProjectName: 'JURNL F15 Ahead',
    repoFolder: 'JURNL/F15_AHEAD',
  },
  {
    productProjectId: 'JURNL',
    familyId: 'F16',
    provider: 'OpenArt',
    providerProjectId: 'VWnHI2MSaQJSTXacl66i',
    providerProjectName: 'JURNL F16 Records',
    repoFolder: 'JURNL/F16_RECORDS',
  },
];

export function normalizeFamilyId(familyId: string): string {
  const head = familyId.trim().toUpperCase().split(/[_\s]/)[0] ?? '';
  return head;
}

export function lookupFamilyOutputProject(productProjectId: string, familyId: string): FamilyOutputProject | null {
  const product = productProjectId.trim().toUpperCase();
  const family = normalizeFamilyId(familyId);
  return (
    FAMILY_OUTPUT_PROJECTS.find(
      (row) => row.productProjectId.toUpperCase() === product && normalizeFamilyId(row.familyId) === family,
    ) ?? null
  );
}

function isManagedFamily(request: GenerationRequest): boolean {
  return request.projectId.trim().toUpperCase() === 'JURNL' && /^F\d+$/i.test(normalizeFamilyId(request.familyId));
}

export type FamilyOutputProjectCheck =
  | { status: 'PASS'; providerProjectId: string; providerProjectName: string; repoFolder: string }
  | { status: 'BLOCKED'; blockedReason: Extract<BlockedReason, 'FAMILY_PROJECT_REQUIRED' | 'FAMILY_PROJECT_MISMATCH'> };

/** Block paid dispatch unless the job targets that family's own provider project. */
export function validateFamilyOutputProject(request: GenerationRequest): FamilyOutputProjectCheck {
  const row = lookupFamilyOutputProject(request.projectId, request.familyId);
  const destination = request.providerProjectId?.trim() || '';

  if (!row) {
    if (isManagedFamily(request) || destination) {
      return { status: 'BLOCKED', blockedReason: 'FAMILY_PROJECT_REQUIRED' };
    }
    return { status: 'PASS', providerProjectId: '', providerProjectName: '', repoFolder: '' };
  }

  if (!destination) {
    return { status: 'BLOCKED', blockedReason: 'FAMILY_PROJECT_REQUIRED' };
  }
  if (destination !== row.providerProjectId) {
    return { status: 'BLOCKED', blockedReason: 'FAMILY_PROJECT_MISMATCH' };
  }
  return {
    status: 'PASS',
    providerProjectId: row.providerProjectId,
    providerProjectName: row.providerProjectName,
    repoFolder: row.repoFolder,
  };
}
