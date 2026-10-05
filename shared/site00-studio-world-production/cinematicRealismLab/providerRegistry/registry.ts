/**
 * Provider registry + capability matrix.
 */

import { LANE_TO_PROVIDER } from '../constants.js';
import type {
  CinematicRealismLaneId,
  CinematicRealismProviderId,
  RealismLaneDefinition,
  RealismProviderCapability,
} from '../types.js';

const BASE_PROVIDERS: RealismProviderCapability[] = [
  {
    providerId: 'HIGGSFIELD',
    label: 'Higgsfield',
    readiness: 'SCHEMA_REVIEW_REQUIRED',
    capabilities: {
      textToImage: true,
      imageToVideo: true,
      referenceImage: true,
      multiReference: false,
      identityConsistency: true,
      lipSync: false,
      aspectRatios: ['9:16', '16:9', '1:1'],
      maxClipDurationSec: 10,
      cameraMotionControl: 'MODERATE',
      styleAdherence: 'HIGH',
    },
    costEstimateUsdPerClip: 0.45,
    latencyEstimateSec: 120,
    strengthDomains: ['cinematic polish', 'social-native motion', 'still quality'],
    weaknessDomains: ['long-form continuity', 'complex dialogue'],
    schemaStatus: 'SCHEMA_REVIEW_REQUIRED',
    enabled: true,
  },
  {
    providerId: 'MINIMAX_HAILUO',
    label: 'MiniMax / Hailuo',
    readiness: 'AUTH_REQUIRED',
    capabilities: {
      textToImage: false,
      imageToVideo: true,
      referenceImage: true,
      multiReference: true,
      identityConsistency: true,
      lipSync: true,
      aspectRatios: ['9:16', '16:9'],
      maxClipDurationSec: 6,
      cameraMotionControl: 'LIMITED',
      styleAdherence: 'MEDIUM',
    },
    costEstimateUsdPerClip: 0.35,
    latencyEstimateSec: 90,
    strengthDomains: ['motion realism', 'social reels', 'reference animation'],
    weaknessDomains: ['fine editorial still control'],
    schemaStatus: 'DOCUMENTED',
    enabled: true,
  },
  {
    providerId: 'KLING',
    label: 'Kling',
    readiness: 'AUTH_REQUIRED',
    capabilities: {
      textToImage: true,
      imageToVideo: true,
      referenceImage: true,
      multiReference: true,
      identityConsistency: true,
      lipSync: false,
      aspectRatios: ['9:16', '16:9', '1:1'],
      maxClipDurationSec: 10,
      cameraMotionControl: 'STRONG',
      styleAdherence: 'HIGH',
    },
    costEstimateUsdPerClip: 0.5,
    latencyEstimateSec: 150,
    strengthDomains: ['camera motion', 'environment stability', 'luxury scenes'],
    weaknessDomains: ['hand close-ups', 'subtle dialogue'],
    schemaStatus: 'DOCUMENTED',
    enabled: true,
  },
  {
    providerId: 'VEO',
    label: 'Veo',
    readiness: 'AUTH_REQUIRED',
    capabilities: {
      textToImage: false,
      imageToVideo: true,
      referenceImage: true,
      multiReference: false,
      identityConsistency: false,
      lipSync: false,
      aspectRatios: ['16:9', '9:16'],
      maxClipDurationSec: 8,
      cameraMotionControl: 'MODERATE',
      styleAdherence: 'HIGH',
    },
    costEstimateUsdPerClip: 0.6,
    latencyEstimateSec: 180,
    strengthDomains: ['cinematic motion', 'lighting coherence'],
    weaknessDomains: ['identity lock', 'fine prop control'],
    schemaStatus: 'SCHEMA_REVIEW_REQUIRED',
    enabled: true,
  },
  {
    providerId: 'RUNWAY',
    label: 'Runway',
    readiness: 'READY',
    capabilities: {
      textToImage: true,
      imageToVideo: true,
      referenceImage: true,
      multiReference: false,
      identityConsistency: false,
      lipSync: false,
      aspectRatios: ['16:9', '9:16', '1:1'],
      maxClipDurationSec: 10,
      cameraMotionControl: 'STRONG',
      styleAdherence: 'MEDIUM',
    },
    costEstimateUsdPerClip: 0.4,
    latencyEstimateSec: 100,
    strengthDomains: ['motion tools', 'established pipeline'],
    weaknessDomains: ['luxury taste calibration', 'identity continuity'],
    schemaStatus: 'DOCUMENTED',
    enabled: true,
  },
  {
    providerId: 'GENERIC_STILL',
    label: 'Generic Still Provider',
    readiness: 'READY',
    capabilities: {
      textToImage: true,
      imageToVideo: false,
      referenceImage: true,
      multiReference: true,
      identityConsistency: true,
      lipSync: false,
      aspectRatios: ['9:16', '4:5', '16:9'],
      maxClipDurationSec: null,
      cameraMotionControl: 'NONE',
      styleAdherence: 'HIGH',
    },
    costEstimateUsdPerClip: 0.08,
    latencyEstimateSec: 30,
    strengthDomains: ['hero still', 'continuity anchor'],
    weaknessDomains: ['motion'],
    schemaStatus: 'DOCUMENTED',
    enabled: true,
  },
  {
    providerId: 'HYBRID_CONTROLLER',
    label: 'Hybrid Still → Video Controller',
    readiness: 'READY',
    capabilities: {
      textToImage: true,
      imageToVideo: true,
      referenceImage: true,
      multiReference: true,
      identityConsistency: true,
      lipSync: false,
      aspectRatios: ['9:16', '16:9'],
      maxClipDurationSec: 10,
      cameraMotionControl: 'MODERATE',
      styleAdherence: 'HIGH',
    },
    costEstimateUsdPerClip: 0.55,
    latencyEstimateSec: 200,
    strengthDomains: ['still-first workflow', 'continuity', 'lane comparison'],
    weaknessDomains: ['latency', 'multi-vendor orchestration'],
    schemaStatus: 'DOCUMENTED',
    enabled: true,
  },
];

export const REALISM_LANE_DEFINITIONS: RealismLaneDefinition[] = [
  {
    laneId: 'LANE_A_HIGGSFIELD',
    label: 'Lane A — Higgsfield-first',
    primaryProviderId: 'HIGGSFIELD',
    workflowKind: 'DIRECT_VIDEO',
    description: 'Direct video generation with Higgsfield cinematic bias.',
  },
  {
    laneId: 'LANE_B_MINIMAX',
    label: 'Lane B — MiniMax / Hailuo-first',
    primaryProviderId: 'MINIMAX_HAILUO',
    workflowKind: 'DIRECT_VIDEO',
    description: 'Social-native motion with reference animation support.',
  },
  {
    laneId: 'LANE_C_KLING',
    label: 'Lane C — Kling-first',
    primaryProviderId: 'KLING',
    workflowKind: 'DIRECT_VIDEO',
    description: 'Strong camera motion and environment stability.',
  },
  {
    laneId: 'LANE_D_VEO',
    label: 'Lane D — Veo-first',
    primaryProviderId: 'VEO',
    workflowKind: 'DIRECT_VIDEO',
    description: 'Cinematic motion with Google Veo lane.',
  },
  {
    laneId: 'LANE_E_RUNWAY',
    label: 'Lane E — Runway-first',
    primaryProviderId: 'RUNWAY',
    workflowKind: 'DIRECT_VIDEO',
    description: 'Established Runway Gen motion pipeline.',
  },
  {
    laneId: 'LANE_F_HYBRID_STILL_VIDEO',
    label: 'Lane F — Hybrid Still → Video',
    primaryProviderId: 'HYBRID_CONTROLLER',
    workflowKind: 'STILL_FIRST',
    description: 'Hero still approval then animate via selected video provider.',
  },
  {
    laneId: 'LANE_G_FUTURE',
    label: 'Lane G — Future Provider',
    primaryProviderId: 'GENERIC_STILL',
    workflowKind: 'PROVIDER_RELAY',
    description: 'Reserved adapter slot for future providers.',
  },
];

export function getProviderRegistry(): RealismProviderCapability[] {
  return BASE_PROVIDERS.map((p) => ({ ...p, capabilities: { ...p.capabilities } }));
}

export function getProviderCapability(providerId: CinematicRealismProviderId): RealismProviderCapability | null {
  return getProviderRegistry().find((p) => p.providerId === providerId) ?? null;
}

export function getLaneDefinition(laneId: CinematicRealismLaneId): RealismLaneDefinition | null {
  return REALISM_LANE_DEFINITIONS.find((l) => l.laneId === laneId) ?? null;
}

export function resolveProviderForLane(laneId: CinematicRealismLaneId): CinematicRealismProviderId {
  return LANE_TO_PROVIDER[laneId];
}

export function listReadyLanes(): RealismLaneDefinition[] {
  return REALISM_LANE_DEFINITIONS.filter((lane) => {
    const provider = getProviderCapability(resolveProviderForLane(lane.laneId));
    return provider?.enabled && provider.readiness !== 'DISABLED';
  });
}

export function estimateLaneCostUsd(laneId: CinematicRealismLaneId): number | null {
  const provider = getProviderCapability(resolveProviderForLane(laneId));
  return provider?.costEstimateUsdPerClip ?? null;
}
