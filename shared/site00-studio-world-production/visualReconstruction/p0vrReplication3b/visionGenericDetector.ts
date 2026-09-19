import { GENERIC_VISION_PHRASES } from './constants.js';
import type { VisionReplicationObservation } from './types.js';

export function isVisionOutputTooGeneric(observation: VisionReplicationObservation): boolean {
  const blob = `${observation.authorityDescription} ${observation.twinDescription}`.toLowerCase();
  const wordCount = observation.authorityDescription.split(/\s+/).length;
  if (wordCount < 12) return true;
  for (const phrase of GENERIC_VISION_PHRASES) {
    if (blob.includes(phrase) && observation.literalCorrections.length < 2) return true;
  }
  if (observation.regionId === 'hero-editorial') {
    const structural =
      blob.includes('slice') ||
      blob.includes('lime') ||
      blob.includes('subregion') ||
      blob.includes('column') ||
      blob.includes('overlay') ||
      blob.includes('grayscale');
    if (!structural && observation.missingElements.length < 2) return true;
  }
  return false;
}
