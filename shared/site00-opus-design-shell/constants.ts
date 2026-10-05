/** P0.VR.OPUS-NATIVE-SHELL-SERVICE1 — hard-bound model; no silent substitution. */
export const OPUS_DESIGN_SHELL_MODEL = 'claude-opus-5' as const;

export const OPUS_DESIGN_SHELL_API_PATH = '/api/site00/opus-design-shell';

export const OPUS_SHELL_ALLOWED_MUTATION_SCOPE = [
  'shell geometry',
  'layout hierarchy',
  'presentation markup',
  'visual components',
  'component arrangement',
  'CSS',
  'spacing',
  'typography treatment',
  'surface composition',
  'responsive composition',
  'visual tokens',
  'panel composition',
  'display hierarchy',
] as const;

export const OPUS_SHELL_FORBIDDEN_MUTATION_SCOPE = [
  'routes',
  'routing logic',
  'application state',
  'Supabase',
  'persistence',
  'APIs',
  'backend logic',
  'provider orchestration',
  'event taxonomy',
  'permissions',
  'business rules',
  'handlers',
  'migrations',
  'production deployment',
  'implementation wiring',
] as const;

export const OPUS_SHELL_HOST_CONTRACT_VERSION = 'site00-opus-shell-v1';

/** Max presentation source files included in one shell request (cost guard). */
export const OPUS_SHELL_MAX_SCOPED_SOURCE_FILES = 24;

export const OPUS_SHELL_SCOPED_SOURCE_GLOBS = [
  'src/site00/components/designBench/opusDirect/**',
  'src/site00/styles/site00-twin-opus-direct.css',
  'src/site00/styles/site00-twin-opus-list.css',
  'src/site00/styles/site00-page-concept-generator.css',
  'shared/site00-design-workspace-production/designAiConsolePresentation.ts',
] as const;
