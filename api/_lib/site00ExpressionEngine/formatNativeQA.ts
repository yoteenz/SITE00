/**
 * Expression Engine V0 — format-native QA (blocking).
 */

import type { EntryFormat, FormatNativeQAResult } from '../../../shared/site00-expression-engine/types.js';
import { FORMAT_NATIVE_CONTRACTS } from '../../../shared/site00-expression-engine/formatContracts.js';

export type FormatNativeQAInput = {
  sourceFormat: EntryFormat;
  targetFormat: EntryFormat;
  adaptationKind: 'RESIZE' | 'REFRAME' | 'REEDIT' | 'REWRITE' | 'REGENERATE' | 'NATIVE';
  sameAssetFingerprint?: boolean;
};

export function runFormatNativeQA(input: FormatNativeQAInput): FormatNativeQAResult {
  const failures: string[] = [];
  const contract = FORMAT_NATIVE_CONTRACTS[input.targetFormat];

  if (input.adaptationKind === 'RESIZE' && input.sourceFormat !== input.targetFormat) {
    failures.push(
      `FORMAT_NATIVE_QA FAIL: ${input.targetFormat} requires native behavior — resize from ${input.sourceFormat} blocked`,
    );
  }

  if (input.sourceFormat === 'REEL' && input.targetFormat === 'CAROUSEL' && input.adaptationKind === 'RESIZE') {
    failures.push('REEL ≠ MOVING CAROUSEL — resize-only adaptation blocked');
  }

  if (input.sourceFormat === 'CAROUSEL' && input.targetFormat === 'REEL' && input.adaptationKind === 'RESIZE') {
    failures.push('CAROUSEL slides cannot become REEL by resize — native cinematic behavior required');
  }

  if (input.targetFormat === 'STORY' && input.adaptationKind === 'RESIZE' && input.sourceFormat === 'CAROUSEL') {
    failures.push('STORY ≠ RESIZED FEED TILE — native story behavior required');
  }

  if (input.targetFormat === 'TIKTOK' && input.sourceFormat === 'REEL' && input.adaptationKind === 'RESIZE') {
    failures.push('TIKTOK ≠ AUTOMATIC REEL REPOST — native TikTok translation required');
  }

  if (input.targetFormat === 'X' && input.adaptationKind === 'RESIZE') {
    failures.push('X ≠ CAPTION COPY-PASTE — thread-native translation required');
  }

  if (input.sameAssetFingerprint && input.adaptationKind === 'RESIZE') {
    failures.push('Identical asset fingerprint across formats — resize-only clone detected');
  }

  return {
    passed: failures.length === 0,
    format: input.targetFormat,
    failures,
    blocking: failures.length > 0,
  };
}

export function storyResizeOnlyFails(): FormatNativeQAResult {
  return runFormatNativeQA({
    sourceFormat: 'CAROUSEL',
    targetFormat: 'STORY',
    adaptationKind: 'RESIZE',
    sameAssetFingerprint: true,
  });
}

export function tiktokReelDuplicateFails(): FormatNativeQAResult {
  return runFormatNativeQA({
    sourceFormat: 'REEL',
    targetFormat: 'TIKTOK',
    adaptationKind: 'RESIZE',
    sameAssetFingerprint: true,
  });
}

export function reelVsCarouselDistinct(): { reel: FormatNativeQAResult; carousel: FormatNativeQAResult } {
  return {
    reel: runFormatNativeQA({
      sourceFormat: 'CAROUSEL',
      targetFormat: 'REEL',
      adaptationKind: 'NATIVE',
    }),
    carousel: runFormatNativeQA({
      sourceFormat: 'REEL',
      targetFormat: 'CAROUSEL',
      adaptationKind: 'NATIVE',
    }),
  };
}

export function formatRequiresNativeBehavior(format: EntryFormat): boolean {
  return Boolean(FORMAT_NATIVE_CONTRACTS[format]?.qaRules.length);
}
