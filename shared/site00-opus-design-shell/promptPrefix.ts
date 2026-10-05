import {
  OPUS_SHELL_ALLOWED_MUTATION_SCOPE,
  OPUS_SHELL_FORBIDDEN_MUTATION_SCOPE,
  OPUS_SHELL_HOST_CONTRACT_VERSION,
} from './constants.js';

/**
 * Stable prefix for Anthropic prompt caching (≥512 tokens on Opus 5).
 * Must change rarely — edits invalidate cache.
 */
export function buildOpusDesignShellStableSystemPrefix(): string {
  const allowed = OPUS_SHELL_ALLOWED_MUTATION_SCOPE.join('\n- ');
  const forbidden = OPUS_SHELL_FORBIDDEN_MUTATION_SCOPE.join('\n- ');
  return [
    'YOU ARE THE SITE 00 VISUAL DESIGN SHELL AGENT.',
    'YOU MAY REDESIGN PRESENTATION.',
    'YOU MAY NOT IMPLEMENT APPLICATION LOGIC.',
    'KEEP FUNCTION. REBUILD LOOK. REFERENCE = DESIGN AUTHORITY.',
    '',
    `HOST CONTRACT: ${OPUS_SHELL_HOST_CONTRACT_VERSION}`,
    '',
    'COMPOSER / OPUS FIREWALL',
    'Output is STAGED_VISUAL_SHELL only — never PRODUCTION_IMPLEMENTATION.',
    'Do not modify routes, handlers, state, Supabase, APIs, or persistence.',
    '',
    'ALLOWED MUTATION SCOPE:',
    `- ${allowed}`,
    '',
    'FORBIDDEN MUTATION SCOPE:',
    `- ${forbidden}`,
    '',
    'OUTPUT CONTRACT (JSON inside a single fenced code block labeled opus_design_shell_result):',
    '{ summary, shellStrategy, proposedFiles[{path,summary,stagedContent}], visualComponents[], cssArtifacts[], responsiveNotes[], beforeAfterNotes[], preservedFunctionConfirmation, forbiddenMutationConfirmation }',
    '',
    'TYPOGRAPHY / RESPONSIVE DOCTRINE',
    'Mobile-first. Respect Twin Opus artboard grammar. No rounded outer device frame on direct recon surfaces.',
    'Use existing design tokens where present; propose token deltas explicitly in cssArtifacts notes.',
    '',
    'QA',
    'Confirm forbidden scopes were not violated in forbiddenMutationConfirmation.',
    'Confirm behavior preservation in preservedFunctionConfirmation.',
  ].join('\n');
}

/** Dynamic target context — never cached as long-lived prefix. */
export function buildOpusDesignShellDynamicUserContext(pkg: {
  targetType: string;
  projectId?: string;
  pageId?: string;
  workspaceTargetId?: string;
  functionContractId: string;
  componentMap: readonly { id: string; label: string; role: string }[];
  relevantSourceFiles: readonly string[];
  currentVisualTokens: readonly string[];
  founderInstruction?: string | null;
  mode: 'CREATE' | 'REFINE';
}): string {
  return [
    `MODE: ${pkg.mode} DESIGN SHELL`,
    `TARGET: ${pkg.targetType} ${pkg.projectId ?? ''} ${pkg.pageId ?? pkg.workspaceTargetId ?? ''}`.trim(),
    `FUNCTION CONTRACT: ${pkg.functionContractId}`,
    '',
    'COMPONENT MAP:',
    ...pkg.componentMap.map((c) => `- ${c.id}: ${c.label} (${c.role})`),
    '',
    'SCOPED SOURCE FILES (presentation only):',
    ...pkg.relevantSourceFiles.map((f) => `- ${f}`),
    '',
    'VISUAL TOKENS:',
    ...pkg.currentVisualTokens.map((t) => `- ${t}`),
    '',
    pkg.founderInstruction ? `FOUNDER INSTRUCTION:\n${pkg.founderInstruction}` : 'FOUNDER INSTRUCTION: (none)',
  ].join('\n');
}
