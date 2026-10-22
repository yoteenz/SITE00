import { KLING4_PROVIDER_LIMITS } from '../capability/kling4CapabilityMatrix.js';
import type { ShotExecutionContract, ShotKeyframeSpec } from '../types/schemas.js';

export type KeyframeCompileIssue =
  | 'INVALID_KEYFRAME_ORDER'
  | 'INVALID_TIMESTAMP'
  | 'UNSUPPORTED_DURATION'
  | 'EXCESS_KEYFRAMES'
  | 'MISSING_START_FRAME'
  | 'UNSUPPORTED_ASPECT_RATIO';

export type KeyframeCompileResult =
  | {
      ok: true;
      providerKeyframes: Array<{ role: string; assetId: string; timestampSec: number }>;
      durationSec: number;
      aspectRatio: string;
    }
  | {
      ok: false;
      issue: KeyframeCompileIssue;
      detail: string;
      /** Deterministic split proposal when keyframes exceed provider cap — requires founder review. */
      shotSplitPlan?: Array<{ shotId: string; keyframeAssetIds: string[]; note: string }>;
    };

export function compileStoryboardKeyframesToProvider(
  contract: ShotExecutionContract,
  providerMiddleFrameLimit = KLING4_PROVIDER_LIMITS.maxMiddleKeyframesArtlistUi,
): KeyframeCompileResult {
  const frames = [...contract.keyframes].sort((a, b) => a.timestampSec - b.timestampSec);
  const start = frames.find((f) => f.role === 'START');
  if (!start) {
    return { ok: false, issue: 'MISSING_START_FRAME', detail: 'Start frame required for Kling 4 image-to-video path.' };
  }

  for (let i = 1; i < frames.length; i += 1) {
    if (frames[i]!.timestampSec < frames[i - 1]!.timestampSec) {
      return { ok: false, issue: 'INVALID_KEYFRAME_ORDER', detail: 'Keyframes must be timestamp-ordered.' };
    }
  }

  if (contract.expectedDurationSec < KLING4_PROVIDER_LIMITS.minDurationSec) {
    return {
      ok: false,
      issue: 'UNSUPPORTED_DURATION',
      detail: `Duration ${contract.expectedDurationSec}s below minimum ${KLING4_PROVIDER_LIMITS.minDurationSec}s`,
    };
  }
  if (contract.expectedDurationSec > KLING4_PROVIDER_LIMITS.maxDurationSec) {
    return {
      ok: false,
      issue: 'UNSUPPORTED_DURATION',
      detail: `Duration ${contract.expectedDurationSec}s above maximum ${KLING4_PROVIDER_LIMITS.maxDurationSec}s`,
    };
  }

  const middleCount = frames.filter((f) => f.role === 'MIDDLE').length;
  if (middleCount > providerMiddleFrameLimit) {
    const split = proposeDeterministicShotSplit(contract.shotId, frames, providerMiddleFrameLimit);
    return {
      ok: false,
      issue: 'EXCESS_KEYFRAMES',
      detail: `Middle keyframes ${middleCount} exceed provider limit ${providerMiddleFrameLimit}.`,
      shotSplitPlan: split,
    };
  }

  if (
    !KLING4_PROVIDER_LIMITS.supportedAspectRatios.includes(
      contract.expectedAspectRatio as (typeof KLING4_PROVIDER_LIMITS.supportedAspectRatios)[number],
    ) &&
    contract.expectedAspectRatio !== '9:16'
  ) {
    return {
      ok: false,
      issue: 'UNSUPPORTED_ASPECT_RATIO',
      detail: `Aspect ratio ${contract.expectedAspectRatio} not in supported set.`,
    };
  }

  for (const f of frames) {
    if (f.timestampSec < 0 || f.timestampSec > contract.expectedDurationSec) {
      return {
        ok: false,
        issue: 'INVALID_TIMESTAMP',
        detail: `Keyframe ${f.assetId} timestamp ${f.timestampSec}s out of range.`,
      };
    }
  }

  return {
    ok: true,
    providerKeyframes: frames.map((f) => ({
      role: f.role,
      assetId: f.assetId,
      timestampSec: f.timestampSec,
    })),
    durationSec: contract.expectedDurationSec,
    aspectRatio: contract.expectedAspectRatio,
  };
}

function proposeDeterministicShotSplit(
  shotId: string,
  frames: ShotKeyframeSpec[],
  limit: number,
): Array<{ shotId: string; keyframeAssetIds: string[]; note: string }> {
  const chunks: ShotKeyframeSpec[][] = [];
  let current: ShotKeyframeSpec[] = [];
  let middleInChunk = 0;
  for (const frame of frames) {
    if (frame.role === 'MIDDLE') {
      if (middleInChunk >= limit) {
        chunks.push(current);
        current = [frames.find((f) => f.role === 'START') ?? frame];
        middleInChunk = 0;
      }
      middleInChunk += 1;
    }
    current.push(frame);
  }
  if (current.length) chunks.push(current);

  return chunks.map((chunk, index) => ({
    shotId: `${shotId}-SPLIT-${String(index + 1).padStart(2, '0')}`,
    keyframeAssetIds: chunk.map((c) => c.assetId),
    note: 'Auto split for provider keyframe cap — founder must approve before dispatch.',
  }));
}
