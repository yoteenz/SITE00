/**
 * P0.VR.3L — Shared shell registry + dependency graph.
 */

import { EXPERIENCE_PAGE_TEMPLATES } from '../p0vr3g/constants.js';
import type { RepoOwnedProjectId, SharedShellDependencyGraph, SharedShellRecord } from './types.js';

const SHELLS: SharedShellRecord[] = [
  {
    shellId: 'site00-information-shell',
    projectId: 'SITE00',
    shellType: 'INFORMATION_SHELL',
    componentPaths: ['src/site00/components/experience/Site00ExperiencePage.tsx'],
    consumerFamilyIds: [EXPERIENCE_PAGE_TEMPLATES.INFORMATION.templateId],
    consumerPageIds: ['guide', 'sound', 'faq', 'contact', 'about', 'support'],
    responsiveAuthority: 'PUBLIC_PAGE',
    version: 1,
  },
  {
    shellId: 'site00-auth-shell',
    projectId: 'SITE00',
    shellType: 'AUTH_SHELL',
    componentPaths: ['src/site00/components/experience/Site00AuthExperiencePage.tsx'],
    consumerFamilyIds: [EXPERIENCE_PAGE_TEMPLATES.AUTH.templateId],
    consumerPageIds: ['sign-in', 'forgot-password', 'reset-password'],
    responsiveAuthority: 'AUTH_SPLIT',
    version: 1,
  },
  {
    shellId: 'site00-complex-shell',
    projectId: 'SITE00',
    shellType: 'PUBLIC_WEBSITE_SHELL',
    componentPaths: ['src/site00/components/experience/Site00ComplexPageShell.tsx'],
    consumerFamilyIds: [EXPERIENCE_PAGE_TEMPLATES.COMPLEX.templateId],
    consumerPageIds: ['blueprints', 'account-profile', 'brand-page'],
    responsiveAuthority: 'PUBLIC_PAGE',
    version: 1,
  },
  {
    shellId: 'ndxbook-workspace-shell',
    projectId: 'NDXBOOK',
    shellType: 'WORKSPACE_SHELL',
    componentPaths: [
      'src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx',
      'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx',
    ],
    consumerFamilyIds: [EXPERIENCE_PAGE_TEMPLATES.NDXBOOK_WORKSPACE.templateId],
    consumerPageIds: ['overview', 'campaign-board', 'content-ops', 'cultural-intelligence'],
    responsiveAuthority: 'WORKSPACE_SHELL',
    version: 1,
  },
  {
    shellId: 'ndx-character-lab-shell',
    projectId: 'NDXBOOK',
    shellType: 'LAB_SHELL',
    componentPaths: [
      'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx',
      'src/site00/components/founderWorkspace/CharacterLabOperateLayer.tsx',
    ],
    consumerFamilyIds: ['ndxbook-character-lab-family'],
    consumerPageIds: ['character-lab'],
    materialScreenIds: ['language-lab', 'voice-lab', 'casting'],
    responsiveAuthority: 'WORKSPACE_SHELL',
    version: 1,
  },
];

const shellVersions = new Map<string, number>(SHELLS.map((s) => [s.shellId, s.version]));
const familyVersions = new Map<string, number>();

export function listSharedShells(projectId?: RepoOwnedProjectId): SharedShellRecord[] {
  return SHELLS.filter((s) => !projectId || s.projectId === projectId);
}

export function getSharedShell(shellId: string): SharedShellRecord | null {
  return SHELLS.find((s) => s.shellId === shellId) ?? null;
}

export function getShellVersion(shellId: string): number {
  return shellVersions.get(shellId) ?? 1;
}

export function bumpShellVersion(shellId: string): number {
  const next = (shellVersions.get(shellId) ?? 1) + 1;
  shellVersions.set(shellId, next);
  const shell = SHELLS.find((s) => s.shellId === shellId);
  if (shell) shell.version = next;
  return next;
}

export function getDesignFamilyVersion(familyId: string): number {
  return familyVersions.get(familyId) ?? 1;
}

export function bumpDesignFamilyVersion(familyId: string): number {
  const next = (familyVersions.get(familyId) ?? 1) + 1;
  familyVersions.set(familyId, next);
  return next;
}

export function buildSharedShellDependencyGraph(projectId: RepoOwnedProjectId): SharedShellDependencyGraph {
  const shells = listSharedShells(projectId);
  const edges: SharedShellDependencyGraph['edges'] = [];

  for (const shell of shells) {
    for (const pageId of shell.consumerPageIds) {
      edges.push({ shellId: shell.shellId, pageId });
    }
    for (const familyId of shell.consumerFamilyIds) {
      edges.push({ shellId: shell.shellId, familyId });
    }
    for (const materialScreenId of shell.materialScreenIds ?? []) {
      edges.push({ shellId: shell.shellId, materialScreenId, pageId: shell.consumerPageIds[0] });
    }
  }

  return { projectId, shells, edges };
}

export function resolveShellForTarget(input: {
  projectId: RepoOwnedProjectId;
  experiencePageId: string | null;
  materialScreenId: string | null;
}): SharedShellRecord | null {
  if (input.experiencePageId === 'character-lab') {
    return getSharedShell('ndx-character-lab-shell');
  }
  if (input.projectId === 'SITE00') {
    return getSharedShell('site00-information-shell');
  }
  return getSharedShell('ndxbook-workspace-shell');
}

export function clearSharedShellRegistryForTest(): void {
  for (const shell of SHELLS) {
    shellVersions.set(shell.shellId, 1);
    shell.version = 1;
  }
  familyVersions.clear();
}
