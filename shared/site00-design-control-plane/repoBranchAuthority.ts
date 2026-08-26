/**
 * P0.BRIDGE.1B — Repo default-branch authority (not blindly hardcoded).
 */

import type { Site00RepoBindingRow } from './types.js';

/** Resolved from GitHub defaultBranchRef at sprint time; override via env in production. */
export const REPO_BRANCH_AUTHORITY: Record<
  string,
  { defaultBranch: string; allowedBranches: readonly string[]; discoverySource: string }
> = {
  'yoteenz/SITE00': {
    defaultBranch: process.env.SITE00_DEFAULT_BRANCH ?? 'main',
    allowedBranches: ['main'],
    discoverySource: 'github:defaultBranchRef',
  },
  'yoteenz/fsbw': {
    defaultBranch: process.env.FSBW_DEFAULT_BRANCH ?? 'master',
    allowedBranches: ['master', 'main'],
    discoverySource: 'github:defaultBranchRef',
  },
};

export function getRepoDefaultBranch(sourceRepo: string | null | undefined): string | null {
  if (!sourceRepo) return null;
  return REPO_BRANCH_AUTHORITY[sourceRepo]?.defaultBranch ?? null;
}

export function validateRepoBindingBranch(input: {
  sourceRepo: string | null;
  defaultBranch: string;
}): { valid: boolean; expectedBranch: string | null; error?: string } {
  if (!input.sourceRepo) {
    return { valid: true, expectedBranch: null };
  }
  const authority = REPO_BRANCH_AUTHORITY[input.sourceRepo];
  if (!authority) {
    return { valid: true, expectedBranch: input.defaultBranch };
  }
  if (!authority.allowedBranches.includes(input.defaultBranch)) {
    return {
      valid: false,
      expectedBranch: authority.defaultBranch,
      error: `Branch ${input.defaultBranch} not allowed for ${input.sourceRepo}; expected ${authority.defaultBranch}`,
    };
  }
  return { valid: true, expectedBranch: authority.defaultBranch };
}

export function normalizeBindingDefaultBranch(binding: Site00RepoBindingRow, sourceRepo: string | null): string {
  const configured = getRepoDefaultBranch(sourceRepo);
  return configured ?? binding.defaultBranch;
}
