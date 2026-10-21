import fs from 'node:fs';

export type VideoOutputProbe = {
  fileExists: boolean;
  fileHash: string | null;
  fileSizeBytes: number | null;
  decodable: boolean;
  durationSec: number | null;
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
  hasAudio: boolean | null;
  codec: string | null;
};

export type OutputValidationResult =
  | { ok: true; probe: VideoOutputProbe }
  | { ok: false; reason: 'FILE_MISSING' | 'CORRUPT_OUTPUT' | 'NOT_VIDEO' | 'STATIC_IMAGE' };

/** Lightweight validation without ffprobe — full probe requires manual import path + ffprobe on canonical env. */
export function validateVideoOutputFile(absPath: string): OutputValidationResult {
  if (!fs.existsSync(absPath)) {
    return { ok: false, reason: 'FILE_MISSING' };
  }
  const stat = fs.statSync(absPath);
  if (stat.size < 1024) {
    return { ok: false, reason: 'CORRUPT_OUTPUT' };
  }
  const ext = absPath.toLowerCase();
  if (ext.endsWith('.jpg') || ext.endsWith('.png') || ext.endsWith('.webp')) {
    return { ok: false, reason: 'STATIC_IMAGE' };
  }
  if (!ext.endsWith('.mp4') && !ext.endsWith('.webm') && !ext.endsWith('.mov')) {
    return { ok: false, reason: 'NOT_VIDEO' };
  }
  return {
    ok: true,
    probe: {
      fileExists: true,
      fileHash: null,
      fileSizeBytes: stat.size,
      decodable: true,
      durationSec: null,
      width: null,
      height: null,
      aspectRatio: null,
      hasAudio: null,
      codec: null,
    },
  };
}
