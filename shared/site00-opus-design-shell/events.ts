export const OPUS_SHELL_EVENTS = [
  'opus_shell_package_created',
  'opus_shell_generation_requested',
  'opus_shell_generation_started',
  'opus_shell_cache_hit',
  'opus_shell_cache_created',
  'opus_shell_generation_completed',
  'opus_shell_generation_failed',
  'opus_shell_revision_created',
  'opus_shell_change_requested',
  'opus_shell_approved',
  'composer_shell_handoff_created',
] as const;

export type OpusShellEventType = (typeof OPUS_SHELL_EVENTS)[number];

export type OpusShellEventRecord = {
  type: OpusShellEventType;
  at: string;
  packageId?: string;
  shellResultId?: string;
  revisionId?: string;
  detail?: string;
};
