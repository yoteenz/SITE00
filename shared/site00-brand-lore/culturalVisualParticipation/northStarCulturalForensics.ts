/**
 * North-star cultural image participation forensics.
 */

import type { FounderMarketingNorthStarArtifact } from '../brandMarketingExpression/types.js';
import type { CulturalImageParticipationCalibration } from './types.js';

export function evaluateNorthStarCulturalParticipation(
  northStar: FounderMarketingNorthStarArtifact,
): CulturalImageParticipationCalibration {
  const hasPortrait = northStar.panels.some((p) => /portrait|cultural|archive|photo|object|magazine/i.test(p.surfaceNotes.join(' ')));
  const hasHuman = northStar.panels.some((p) => /portrait|human|photo|kiosk|wall/i.test(p.surfaceNotes.join(' ') + p.makerTraces.join(' ')));

  return {
    calibrationId: `cipc-${northStar.id}`,
    northStarId: northStar.id,
    humanPresence: hasHuman ? 'PASS' : 'FAIL',
    culturalImageUse: hasPortrait ? 'PASS' : 'FAIL',
    archivalImageUse: northStar.panels.some((p) => /archive|newspaper|clipping/i.test(p.surfaceNotes.join(' '))) ? 'PASS' : 'FAIL',
    artisticRange: 'PASS',
    photographicRange: hasHuman ? 'PASS' : 'FAIL',
    objectRange: northStar.panels.some((p) => /object|product|kiosk|desk/i.test(p.surfaceNotes.join(' '))) ? 'PASS' : 'FAIL',
    visualHumor: 'PASS',
    nostalgia: northStar.panels.some((p) => /archive|decade|remember/i.test(p.headline + p.topicDomain)) ? 'PASS' : 'FAIL',
    fashionStyleParticipation: 'PASS',
    imageTypeRelationship: 'PASS',
    visualSurprise: 'PASS',
    emotionalEntry: hasHuman ? 'PASS' : 'FAIL',
    classification: 'CULTURAL_IMAGE_PARTICIPATION_CALIBRATION',
    identityAuthority: 'NONE',
    evaluatedAt: new Date().toISOString(),
  };
}

export function northStarCulturalNotFinalIdentity(cal: CulturalImageParticipationCalibration): boolean {
  return cal.identityAuthority === 'NONE';
}
