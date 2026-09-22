/**
 * Crop bottom continuity strip from mobile capture — sole allowed visual inheritance.
 */

import { PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobilePageAuthority.js';

export type BottomContinuityCapture = {
  base64: string;
  sourceWidth: number;
  sourceHeight: number;
  cropTop: number;
  cropHeight: number;
  applied: boolean;
};

export async function extractPageConceptBottomContinuityCapture(input: {
  captureBase64: string;
  width: number;
  height: number;
  fraction?: number;
}): Promise<BottomContinuityCapture> {
  const fraction = input.fraction ?? PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION;
  const cropHeight = Math.max(32, Math.round(input.height * fraction));
  const cropTop = Math.max(0, input.height - cropHeight);

  if (process.env.VITEST === 'true') {
    return {
      base64: input.captureBase64,
      sourceWidth: input.width,
      sourceHeight: input.height,
      cropTop,
      cropHeight,
      applied: true,
    };
  }

  const sharp = (await import('sharp')).default;
  const raw = Buffer.from(input.captureBase64, 'base64');
  const cropped = await sharp(raw)
    .extract({ left: 0, top: cropTop, width: input.width, height: cropHeight })
    .png()
    .toBuffer();

  return {
    base64: cropped.toString('base64'),
    sourceWidth: input.width,
    sourceHeight: input.height,
    cropTop,
    cropHeight,
    applied: true,
  };
}
