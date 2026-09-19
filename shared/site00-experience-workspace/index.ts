export * from './types.js';
export * from './pipelineModel.js';
export * from './moduleAvailability.js';
export * from './fixtures.js';
export * from './store.js';
export * from './paths.js';
export * from './events.js';
export * from './toolRegistry.js';

export const EXPERIENCE_AGENT_ROLES = [
  {
    agent: 'ASTRA' as const,
    label: 'ASTRA',
    responsibilities: [
      'Experience direction',
      'Scene/world reasoning',
      'Production planning',
      'Visual/spatial review',
      'Software workflow coordination',
      'Current build vs target analysis',
    ],
  },
  {
    agent: 'CODEX' as const,
    label: 'CODEX',
    responsibilities: [
      'Automation & scripting',
      'DCC / Unreal integration support',
      'Validators & exporters',
      'Build automation',
      'Integration testing code',
    ],
  },
];
