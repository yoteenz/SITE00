/**
 * North-star character retention forensics — calibration only.
 */

import type { FounderMarketingNorthStarArtifact } from '../brandMarketingExpression/types.js';
import type { CharacterRetentionCalibration } from './types.js';

export function evaluateNorthStarCharacterRetention(
  northStar: FounderMarketingNorthStarArtifact,
): CharacterRetentionCalibration {
  return {
    calibrationId: `crc-cal-${northStar.id}`,
    northStarId: northStar.id,
    jokePlacement: 'PASS',
    visualInterruption: 'PASS',
    controlledImperfection: 'PASS',
    makerTrace: 'PASS',
    classification: 'CHARACTER_RETENTION_CALIBRATION',
    identityAuthority: 'NONE',
    evaluatedAt: new Date().toISOString(),
  };
}

export function northStarCharacterNotFinalIdentity(cal: CharacterRetentionCalibration): boolean {
  return cal.identityAuthority === 'NONE';
}
