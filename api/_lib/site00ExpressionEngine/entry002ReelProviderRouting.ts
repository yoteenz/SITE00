/**
 * Sprint B4 — Entry 002 REEL provider routing (autoDispatch: false).
 */

import type { ProductionRoutingRecommendation } from '../../../shared/site00-expression-engine/types.js';
import { routeProductionTool } from './productionRouting.js';
import {
  ENTRY_002_TERRITORY_ID,
  ENTRY_002_WORLD_ID,
  ENTRY_002_ARTIFACT_ID,
} from './entry002Blueprint.js';
import { NDXBOOK_PROOF_BRAND_ID } from '../../../shared/site00-expression-engine/constants.js';

function reelRoute(
  taskClass: ProductionRoutingRecommendation['taskClass'],
): ProductionRoutingRecommendation {
  const route = routeProductionTool({
    taskClass,
    format: 'REEL',
    brandId: NDXBOOK_PROOF_BRAND_ID,
    entryId: 'entry-002',
  });
  const modelByProvider: Record<string, string> = {
    'fal-flux': 'fal-ai/flux-pro',
    'fal-gpt-image': 'gpt-image-1',
    'fal-kling': 'kling-v2',
    'fal-kling-character': 'kling-v2-character',
    'elevenlabs': 'eleven_multilingual_v2',
    'elevenlabs-sfx': 'eleven_sfx_v2',
    'fal-music': 'fal-music-v1',
    'internal-editor': 'site00-editor',
    'code-native-typography': 'site00-native',
    'internal-compositor': 'site00-compositor',
  };
  const primary = route.recommendedProviders[0] ?? 'manual';
  const fallback = route.allowedProviders.find((p) => p !== primary) ?? primary;

  const inputAssets = [
    `world:${ENTRY_002_WORLD_ID}`,
    `artifact:${ENTRY_002_ARTIFACT_ID}`,
    'cover-authority:phone',
    'chapter:ndxbook-chapter-01',
  ];

  return {
    taskClass,
    format: 'REEL',
    recommendedProvider: primary,
    recommendedModel: modelByProvider[primary] ?? primary,
    why: `B4 REEL ${taskClass} — staged production under approved cover authority; autoDispatch false`,
    inputAssets,
    outputContract: `REEL native ${taskClass} output for ${ENTRY_002_TERRITORY_ID}`,
    textFidelityRequirement: taskClass === 'TYPOGRAPHY' ? 'EXACT_TITLE_THESIS' : 'CONTROLLED',
    referenceFidelityRequirement:
      taskClass === 'IMAGE_GENERATION' || taskClass === 'VIDEO_START_END_FRAME' ? 'HIGH' : 'MEDIUM',
    fallbackProvider: fallback,
    autoDispatch: false,
  };
}

export function compileEntry002ReelProviderRouting(): ProductionRoutingRecommendation[] {
  return [
    reelRoute('IMAGE_GENERATION'),
    reelRoute('IMAGE_EDIT'),
    reelRoute('IMAGE_REFERENCE_FIDELITY'),
    reelRoute('VIDEO_START_END_FRAME'),
    reelRoute('VIDEO_CHARACTER_CONTINUITY'),
    reelRoute('TTS_DIALOGUE'),
    reelRoute('SOUND_EFFECT'),
    reelRoute('MUSIC'),
    reelRoute('COMPOSITING'),
    reelRoute('TYPOGRAPHY'),
    reelRoute('EDITING'),
  ];
}
