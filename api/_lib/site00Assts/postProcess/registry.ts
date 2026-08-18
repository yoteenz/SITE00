import type { PostProcessorDefinition } from './types.js';

/** Extensible post-processor registry — loader sprint implements BACKGROUND_REMOVE_VIDEO only. */
export const POST_PROCESSORS: PostProcessorDefinition[] = [
  {
    id: 'BACKGROUND_REMOVE_VIDEO',
    label: 'Video background removal',
    provider: 'fal',
    acceptedInputTypes: ['video'],
    outputTypes: ['video/webm'],
    reviewRequired: true,
    models: [
      {
        modelId: 'bria/video/background-removal/v3',
        label: 'Bria VRMBG 3.0',
        notes: 'Temporal video matting; webm_vp9 + Transparent background. Primary candidate for luminous red geometry.',
        defaultSettings: {
          background_color: 'Transparent',
          output_container_and_codec: 'webm_vp9',
          preserve_audio: false,
        },
      },
      {
        modelId: 'fal-ai/ben/v2/video',
        label: 'Ben v2 Video BG-RM',
        notes: 'Fallback candidate — webm output with alpha when Bria loses glow.',
        defaultSettings: {
          output_format: 'webm',
        },
      },
    ],
  },
];

export function getPostProcessor(id: string): PostProcessorDefinition | undefined {
  return POST_PROCESSORS.find((p) => p.id === id);
}

export function getPostProcessModel(processorId: string, modelId: string) {
  const proc = getPostProcessor(processorId);
  return proc?.models.find((m) => m.modelId === modelId);
}
