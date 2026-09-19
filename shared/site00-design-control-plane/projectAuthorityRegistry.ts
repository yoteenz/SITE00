/**
 * P0.BRIDGE.1B — Canonical managed-project source repo + execution mode authority.
 */

export const P0_BRIDGE_1B_LINEAGE = 'P0.BRIDGE.1B-SITE00' as const;

export type ManagedProjectExecutionMode =
  | 'SITE00_NATIVE'
  | 'CROSS_REPO_FSBW'
  | 'RUNTIME_BINDING_ONLY'
  | 'SOURCE_CODE_REQUIRED';

export type ProjectAuthorityRecord = {
  projectKey: string;
  displayName: string;
  sourceRepo: string | null;
  sourceProjectKey: string | null;
  executionMode: ManagedProjectExecutionMode;
  externalRepoBridgeRequired: boolean;
  websiteScopeOnly?: boolean;
};

const AUTHORITY: Record<string, ProjectAuthorityRecord> = {
  site00: {
    projectKey: 'site00',
    displayName: 'SITE 00',
    sourceRepo: 'yoteenz/SITE00',
    sourceProjectKey: null,
    executionMode: 'SITE00_NATIVE',
    externalRepoBridgeRequired: false,
  },
  ndxbook: {
    projectKey: 'ndxbook',
    displayName: 'NDXBOOK',
    sourceRepo: 'yoteenz/SITE00',
    sourceProjectKey: 'ndxbook',
    executionMode: 'SITE00_NATIVE',
    externalRepoBridgeRequired: false,
  },
  'frontal-slayer': {
    projectKey: 'frontal-slayer',
    displayName: 'FRONTAL SLAYER',
    sourceRepo: 'yoteenz/fsbw',
    sourceProjectKey: 'frontal-slayer',
    executionMode: 'CROSS_REPO_FSBW',
    externalRepoBridgeRequired: true,
  },
  'all-in-one-enterprises': {
    projectKey: 'all-in-one-enterprises',
    displayName: 'ALL IN ONE ENTERPRISES',
    sourceRepo: 'yoteenz/fsbw',
    sourceProjectKey: 'all-in-one-enterprises',
    executionMode: 'CROSS_REPO_FSBW',
    externalRepoBridgeRequired: true,
  },
  'studio-world': {
    projectKey: 'studio-world',
    displayName: 'STUDIO WORLD WEBSITE',
    sourceRepo: 'yoteenz/fsbw',
    sourceProjectKey: 'studio-world',
    executionMode: 'CROSS_REPO_FSBW',
    externalRepoBridgeRequired: true,
    websiteScopeOnly: true,
  },
};

export function getProjectAuthority(projectKey: string): ProjectAuthorityRecord | null {
  return AUTHORITY[projectKey] ?? null;
}

export function listSite00NativeProjectKeys(): string[] {
  return Object.values(AUTHORITY)
    .filter((a) => a.executionMode === 'SITE00_NATIVE')
    .map((a) => a.projectKey);
}

export function listFsbwBridgeProjectKeys(): string[] {
  return Object.values(AUTHORITY)
    .filter((a) => a.executionMode === 'CROSS_REPO_FSBW')
    .map((a) => a.projectKey);
}

export function isFsbwBridgeProject(projectKey: string): boolean {
  return getProjectAuthority(projectKey)?.executionMode === 'CROSS_REPO_FSBW';
}

export function isSite00NativeProject(projectKey: string): boolean {
  return getProjectAuthority(projectKey)?.executionMode === 'SITE00_NATIVE';
}
