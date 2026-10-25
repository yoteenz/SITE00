import type { Unknowable } from './types.js';

/**
 * Media inspection and frame extraction contracts (§26). Implementations read the stored copy of a take; nothing is
 * generated. The node implementation (node/ffmpeg.ts) uses ffprobe and ffmpeg.
 */

export type MediaProbeResult = {
  runtimeSec: Unknowable<number>;
  width: Unknowable<number>;
  height: Unknowable<number>;
  frameRate: Unknowable<number>;
  frameCount: Unknowable<number>;
  audioPresent: Unknowable<boolean>;
};

export interface MediaProbe {
  probe(bytes: Uint8Array, mimeType: string): Promise<MediaProbeResult>;
}

export type ExtractedFrame = { png: Uint8Array; width: number; height: number };

export interface FrameExtractor {
  /** Frame `frameIndex` (0-based, decode order) as a PNG. */
  extract(bytes: Uint8Array, frameIndex: number): Promise<ExtractedFrame>;
}

/** Reduced aspect ratio from a resolution, e.g. 1080×1920 → 9:16. */
export function aspectOf(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const g = gcd(width, height);
  return `${width / g}:${height / g}`;
}

/** A probe that knows nothing. Used where no media tooling exists; every field stays UNKNOWN. */
export const NO_PROBE: MediaProbe = {
  async probe() {
    return { runtimeSec: 'UNKNOWN', width: 'UNKNOWN', height: 'UNKNOWN', frameRate: 'UNKNOWN', frameCount: 'UNKNOWN', audioPresent: 'UNKNOWN' };
  },
};
