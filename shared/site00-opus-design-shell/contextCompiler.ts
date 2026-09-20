import {
  OPUS_SHELL_ALLOWED_MUTATION_SCOPE,
  OPUS_SHELL_FORBIDDEN_MUTATION_SCOPE,
  OPUS_SHELL_HOST_CONTRACT_VERSION,
  OPUS_SHELL_MAX_SCOPED_SOURCE_FILES,
  OPUS_SHELL_SCOPED_SOURCE_GLOBS,
} from './constants.js';
import type { OpusDesignShellPackage } from './types.js';

export type CompileShellPackageInput = {
  targetType: 'PAGE' | 'WORKSPACE_SELF';
  projectId?: string;
  pageId?: string;
  workspaceTargetId?: string;
  authorityPairId: string;
  mobileAuthorityArtifactId: string;
  desktopAuthorityArtifactId: string;
  currentMobileCaptureId?: string | null;
  currentDesktopCaptureId?: string | null;
  functionContractId: string;
  projectDesignSystemVersion?: string | null;
  componentMap: readonly { id: string; label: string; role: string }[];
  founderInstruction?: string | null;
  createdBy: string;
};

/** Compile a minimised package — never includes whole repo. */
export function compileOpusDesignShellPackage(input: CompileShellPackageInput): OpusDesignShellPackage {
  const relevantSourceFiles = [...OPUS_SHELL_SCOPED_SOURCE_GLOBS].slice(0, OPUS_SHELL_MAX_SCOPED_SOURCE_FILES);
  const now = new Date().toISOString();
  const packageId = `odsp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    packageId,
    targetType: input.targetType,
    projectId: input.projectId,
    pageId: input.pageId,
    workspaceTargetId: input.workspaceTargetId,
    authorityPairId: input.authorityPairId,
    mobileAuthorityArtifactId: input.mobileAuthorityArtifactId,
    desktopAuthorityArtifactId: input.desktopAuthorityArtifactId,
    currentMobileCaptureId: input.currentMobileCaptureId ?? null,
    currentDesktopCaptureId: input.currentDesktopCaptureId ?? null,
    functionContractId: input.functionContractId,
    site00HostContractVersion: OPUS_SHELL_HOST_CONTRACT_VERSION,
    projectDesignSystemVersion: input.projectDesignSystemVersion ?? null,
    componentMap: input.componentMap,
    relevantSourceFiles,
    currentVisualTokens: ['--site00-chartreuse', '--site00-console-border', '--tod-artboard-width'],
    founderInstruction: input.founderInstruction ?? null,
    allowedMutationScope: [...OPUS_SHELL_ALLOWED_MUTATION_SCOPE],
    forbiddenMutationScope: [...OPUS_SHELL_FORBIDDEN_MUTATION_SCOPE],
    createdAt: now,
    createdBy: input.createdBy,
  };
}

/** Guard: repo root paths outside scoped allowlist must not ship. */
export function assertScopedContextOnly(files: readonly string[]): void {
  const forbiddenRoots = ['supabase/', 'api/', 'server/', 'migrations/', '.git/'];
  for (const file of files) {
    const norm = file.replace(/\\/g, '/');
    if (forbiddenRoots.some((root) => norm.includes(root))) {
      throw new Error(`SCOPE_VIOLATION:${file}`);
    }
    if (files.length > OPUS_SHELL_MAX_SCOPED_SOURCE_FILES) {
      throw new Error('SCOPE_VIOLATION:TOO_MANY_FILES');
    }
  }
}

export function packageIncludesWholeRepo(pkg: OpusDesignShellPackage): boolean {
  return pkg.relevantSourceFiles.some((f) => f === '**/*' || f.includes('node_modules'));
}
