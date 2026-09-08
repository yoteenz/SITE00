/**
 * B5.2 — Entry 001 visual continuity extracted from approved archive evidence.
 */

import type { Entry001VisualContinuitySummary } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';

export const ENTRY001_VISUAL_CONTINUITY: Entry001VisualContinuitySummary = {
  entryId: 'entry-001',
  palette: ['cream / off-white field', 'solid black typography', 'lime accent — underline, circle, scribble'],
  material: ['torn paper edges', 'taped collage', 'archival paper texture', 'binder clip / tape grammar'],
  typography: [
    'large condensed black display (WHO TF IS WE?)',
    'typewriter / editorial secondary text',
    'margin annotation hierarchy',
  ],
  imageLanguage: [
    'black-and-white Britney photography',
    'cropped archival portraits',
    'torn-edge image frames',
    'tabloid / paparazzi collage',
  ],
  annotation: [
    'lime underline',
    'lime circle over eyes',
    'lime scribble',
    'black tape strips',
    'handwritten margin notes',
  ],
  composition: [
    'editorial collage',
    'asymmetric but controlled',
    'high-contrast headline + archival portrait',
  ],
  tone: ['editorial', 'cultural critique', 'archival', 'confrontational', 'reflective'],
  formatLanguage: {
    CAROUSEL_SLIDE: [
      'dense editorial hierarchy',
      'multi-panel progression',
      'cream/black/lime',
      'torn paper',
      'Britney archival imagery',
    ],
    STORY_FRAME: [
      'strong single statement',
      'vertical framing',
      'simplified copy',
      'high-impact focal image',
    ],
    REEL_COVER: [
      'one decisive headline',
      'one strong archival portrait',
      'reduced information density',
    ],
  },
};

export function formatContinuityForType(
  assetType: import('../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js').Entry001AssetType,
): string[] {
  const base = ENTRY001_VISUAL_CONTINUITY.formatLanguage?.[assetType];
  if (base?.length) return base;
  if (assetType === 'HIGHLIGHT_ICON') {
    return ['square crop', 'lime accent minimal', 'recognizable at small size'];
  }
  if (assetType === 'REEL') {
    return ['9:16 cinematic', 'broadcast interruption grammar'];
  }
  if (assetType === 'TIKTOK' || assetType === 'X_POST') {
    return ['platform-native aspect', 'preserve cream/black/lime palette'];
  }
  return ['preserve cream/black/lime palette', 'editorial collage grammar'];
}

export function styleContinuityLockedFromArchive(approvedArchiveCount: number): boolean {
  const threshold = 6;
  return approvedArchiveCount >= threshold;
}
