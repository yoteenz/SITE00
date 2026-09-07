/**
 * Expression Engine V0 — task-class production routing (brand-agnostic).
 */

import type {
  ProductionTaskClass,
  RouteProductionToolInput,
  RouteProductionToolResult,
} from '../../../shared/site00-expression-engine/types.js';

const TASK_CLASS_PROVIDERS: Record<ProductionTaskClass, { recommended: string[]; allowed: string[] }> = {
  IMAGE_GENERATION: {
    recommended: ['fal-flux', 'fal-gpt-image'],
    allowed: ['fal-flux', 'fal-gpt-image', 'fal-recraft', 'openart'],
  },
  IMAGE_EDIT: {
    recommended: ['fal-gpt-image-edit', 'fal-flux-inpaint'],
    allowed: ['fal-gpt-image-edit', 'fal-flux-inpaint'],
  },
  IMAGE_REFERENCE_FIDELITY: {
    recommended: ['fal-flux-reference', 'fal-ip-adapter'],
    allowed: ['fal-flux-reference', 'fal-ip-adapter', 'fal-gpt-image'],
  },
  VIDEO_START_END_FRAME: {
    recommended: ['fal-kling', 'fal-minimax'],
    allowed: ['fal-kling', 'fal-minimax', 'fal-runway'],
  },
  VIDEO_CHARACTER_CONTINUITY: {
    recommended: ['fal-kling-character', 'fal-minimax'],
    allowed: ['fal-kling-character', 'fal-minimax'],
  },
  TTS_DIALOGUE: {
    recommended: ['elevenlabs', 'fal-tts'],
    allowed: ['elevenlabs', 'fal-tts', 'openai-tts'],
  },
  SOUND_EFFECT: {
    recommended: ['elevenlabs-sfx', 'fal-audio'],
    allowed: ['elevenlabs-sfx', 'fal-audio'],
  },
  MUSIC: {
    recommended: ['fal-music', 'suno-api'],
    allowed: ['fal-music', 'suno-api'],
  },
  LIP_SYNC: {
    recommended: ['fal-lipsync'],
    allowed: ['fal-lipsync', 'fal-sync'],
  },
  UPSCALE: {
    recommended: ['fal-clarity-upscaler'],
    allowed: ['fal-clarity-upscaler', 'fal-esrgan'],
  },
  COMPOSITING: {
    recommended: ['internal-compositor', 'fal-flux-inpaint'],
    allowed: ['internal-compositor', 'fal-flux-inpaint'],
  },
  TYPOGRAPHY: {
    recommended: ['code-native-typography', 'fal-gpt-image'],
    allowed: ['code-native-typography', 'fal-gpt-image'],
  },
  EDITING: {
    recommended: ['internal-editor'],
    allowed: ['internal-editor'],
  },
};

export function routeProductionTool(input: RouteProductionToolInput): RouteProductionToolResult {
  const routing = TASK_CLASS_PROVIDERS[input.taskClass];
  if (!routing) {
    throw new Error(`Unknown task class: ${input.taskClass}`);
  }

  return {
    taskClass: input.taskClass,
    recommendedProviders: [...routing.recommended],
    allowedProviders: [...routing.allowed],
    autoDispatch: false,
  };
}

export function routingIsBrandAgnostic(brandId: string): boolean {
  return !Object.values(TASK_CLASS_PROVIDERS).some((p) =>
    [...p.recommended, ...p.allowed].some((provider) => provider.includes(brandId)),
  );
}
