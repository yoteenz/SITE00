import type { ReferenceRegistryEntry } from './types.js';

/** Built-in SITE 00 managed project references (extend per project; not JURNL-only). */
export const SITE00_REFERENCE_REGISTRY: readonly ReferenceRegistryEntry[] = [
  {
    authorityId: 'REFERENCE_F01.00_WELCOME_APPROVED',
    projectId: 'JURNL',
    status: 'APPROVED',
    familyId: 'F01',
    screenId: 'F01.00',
    paths: [
      'JURNL/F01_ENTRY/AUTHORITIES/REFERENCE_F01.00_WELCOME_APPROVED.jpg',
      'src/projects/jurnl/families/F01_ENTRY/AUTHORITIES/REFERENCE_F01.00_WELCOME_APPROVED.jpg',
    ],
  },
  {
    authorityId: 'F02.00_SETUP_PARENT',
    projectId: 'JURNL',
    status: 'CANONICAL',
    familyId: 'F02',
    screenId: 'F02.00',
    paths: [
      'src/projects/jurnl/families/F02_SETUP/AUTHORITIES/F02.00_SETUP_PARENT.jpg',
      'JURNL/F02_SETUP/PARENT/F02.00_SETUP_PARENT.jpg',
    ],
  },
  {
    authorityId: 'F03.00_TODAY_AUTHORITY_FIRST',
    projectId: 'JURNL',
    status: 'IN_REVIEW',
    familyId: 'F03',
    screenId: 'F03.00',
    paths: ['src/projects/jurnl/families/F03_TODAY/AUTHORITIES/F03.00_TODAY_AUTHORITY_FIRST.jpg'],
  },
  {
    authorityId: 'F03.00_LIVE_STRUCTURE',
    projectId: 'JURNL',
    status: 'IN_REVIEW',
    familyId: 'F03',
    screenId: 'F03.00',
    paths: ['src/projects/jurnl/families/F03_TODAY/REFERENCES/F03.00_LIVE_STRUCTURE.jpg'],
  },
  {
    authorityId: 'F03.00_TODAY_PARENT',
    projectId: 'JURNL',
    status: 'IN_REVIEW',
    familyId: 'F03',
    screenId: 'F03.00',
    paths: ['src/projects/jurnl/families/F03_TODAY/AUTHORITIES/F03.00_TODAY_PARENT.jpg'],
  },
  {
    authorityId: 'F04.00_ACTIVITY_PARENT',
    projectId: 'JURNL',
    status: 'IN_REVIEW',
    familyId: 'F04',
    screenId: 'F04.00',
    paths: ['src/projects/jurnl/families/F04_ACTIVITY/AUTHORITIES/F04.00_ACTIVITY_PARENT.jpg'],
  },
  {
    authorityId: 'F09_ACCOUNT_DRAWER_OVERLAY_SOURCE',
    projectId: 'JURNL',
    status: 'APPROVED',
    familyId: 'F09',
    screenId: 'F09.ACCOUNT.DRAWER',
    paths: ['JURNL/F09_SAFE/AUTHORITIES/F09_ACCOUNT_DRAWER_OVERLAY_SOURCE.jpg'],
  },
  {
    authorityId: 'F09_QUICK_ADD_OVERLAY_SOURCE',
    projectId: 'JURNL',
    status: 'APPROVED',
    familyId: 'F09',
    screenId: 'F09.QUICK_ADD',
    paths: ['JURNL/F09_SAFE/AUTHORITIES/F09_QUICK_ADD_OVERLAY_SOURCE.jpg'],
  },
];

/** Explicit cross-project shared assets (empty until registered). */
export const SITE00_SHARED_GLOBAL_REFERENCES: readonly ReferenceRegistryEntry[] = [];

export function listRegistryForProject(projectId: string): ReferenceRegistryEntry[] {
  const pid = projectId.toUpperCase();
  return [
    ...SITE00_REFERENCE_REGISTRY.filter((e) => e.projectId.toUpperCase() === pid),
    ...SITE00_SHARED_GLOBAL_REFERENCES.filter((e) => e.sharedGlobal),
  ];
}
