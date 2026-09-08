/**
 * B5.2 — Entry 001 visual continuity extracted from approved archive evidence.
 */

import type { Entry001VisualContinuitySummary } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import { ENTRY001_APPROVED_ARCHIVE } from '../../../config/entry001CampaignAssets.js';

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
};

export function styleContinuityLockedFromArchive(approvedArchiveCount: number): boolean {
  const threshold = 6;
  return approvedArchiveCount >= threshold && ENTRY001_APPROVED_ARCHIVE.length >= threshold;
}
