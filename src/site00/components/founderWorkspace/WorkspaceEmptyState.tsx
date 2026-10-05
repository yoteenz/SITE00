export { FounderEmptyState as WorkspaceEmptyState } from './FounderWorkspaceShell';

export const WORKSPACE_EMPTY_PRESETS = {
  noWorkNeedsEye: {
    title: 'NO WORK NEEDS YOUR EYE',
    body: 'Everything currently in production can keep moving.',
  },
  noLiveSignals: {
    title: 'NO LIVE SIGNALS YET',
    body: 'Nothing deserves promotion to a pattern right now.',
  },
  noAssetGenerated: {
    title: 'NO ASSET GENERATED',
    body: 'This slot is waiting for its current contract.',
  },
  voiceNotCast: {
    title: 'VOICE NOT CAST',
    body: 'Character language exists. Embodied voice remains unresolved.',
  },
} as const;
