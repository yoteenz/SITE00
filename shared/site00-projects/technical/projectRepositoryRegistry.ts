/**
 * B5.10 — Explicit project → repository bindings. No silent guessing.
 */

export type ProjectRepositoryBindingStatus = 'BOUND' | 'UNRESOLVED' | 'NOT_APPLICABLE';

export type ProjectRepositoryBinding = {
  projectId: string;
  status: ProjectRepositoryBindingStatus;
  provider: 'GITHUB';
  repositoryOwner: string | null;
  repositoryName: string | null;
  repositoryUrl: string | null;
  defaultBranch: string | null;
  notes: string | null;
};

const BINDINGS: Record<string, ProjectRepositoryBinding> = {
  'frontal-slayer': {
    projectId: 'frontal-slayer',
    status: 'BOUND',
    provider: 'GITHUB',
    repositoryOwner: 'yoteenz',
    repositoryName: 'fsbw',
    repositoryUrl: 'https://github.com/yoteenz/fsbw',
    defaultBranch: 'master',
    notes: 'SHARED PHYSICAL REPO — FRONTAL SLAYER LOGICAL SYSTEM',
  },
  'studio-world': {
    projectId: 'studio-world',
    status: 'BOUND',
    provider: 'GITHUB',
    repositoryOwner: 'yoteenz',
    repositoryName: 'SITE00',
    repositoryUrl: 'https://github.com/yoteenz/SITE00',
    defaultBranch: 'main',
    notes: 'PLATFORM REPO — STUDIO WORLD INFRASTRUCTURE + WEBSITE',
  },
  ndxbook: {
    projectId: 'ndxbook',
    status: 'BOUND',
    provider: 'GITHUB',
    repositoryOwner: 'yoteenz',
    repositoryName: 'SITE00',
    repositoryUrl: 'https://github.com/yoteenz/SITE00',
    defaultBranch: 'main',
    notes: 'EVOLVE / CREATIVE INTELLIGENCE — SITE00 REPO SUBSYSTEM',
  },
  'all-in-one-enterprises': {
    projectId: 'all-in-one-enterprises',
    status: 'UNRESOLVED',
    provider: 'GITHUB',
    repositoryOwner: null,
    repositoryName: null,
    repositoryUrl: null,
    defaultBranch: null,
    notes: 'REQUIRES FOUNDER REPOSITORY SELECTION — ORCHESTRATION METADATA UNVERIFIED',
  },
  'astral-world': {
    projectId: 'astral-world',
    status: 'UNRESOLVED',
    provider: 'GITHUB',
    repositoryOwner: null,
    repositoryName: null,
    repositoryUrl: null,
    defaultBranch: null,
    notes: 'REQUIRES FOUNDER REPOSITORY CONNECTION DURING PROJECT SETUP',
  },
};

export function getProjectRepositoryBinding(projectId: string): ProjectRepositoryBinding {
  return (
    BINDINGS[projectId] ?? {
      projectId,
      status: 'UNRESOLVED',
      provider: 'GITHUB',
      repositoryOwner: null,
      repositoryName: null,
      repositoryUrl: null,
      defaultBranch: null,
      notes: 'NO REPOSITORY BINDING CONFIGURED',
    }
  );
}

export function listBoundProjectIds(): string[] {
  return Object.values(BINDINGS)
    .filter((b) => b.status === 'BOUND')
    .map((b) => b.projectId);
}

export function projectRequiresRepositoryConnection(projectId: string): boolean {
  const binding = getProjectRepositoryBinding(projectId);
  return binding.status !== 'NOT_APPLICABLE';
}

export function projectHasTechnicalIntelligenceCapability(enabledCapabilities: string[]): boolean {
  return enabledCapabilities.some((c) =>
    ['BUILDER', 'PRODUCTION', 'BUILD', 'DEPLOYMENT', 'CONTROL_ROOM'].includes(c.toUpperCase()),
  );
}
