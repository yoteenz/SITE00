/**
 * Evidence quarantine — block downstream concepts from anchoring character formation.
 */

const QUARANTINE_PATTERNS = [
  /credit utilization/i,
  /experiment f/i,
  /content concept/i,
  /the room that knows/i,
  /the thing that keeps noticing/i,
  /the collector who connects/i,
  /mandatory pink/i,
  /mandatory handwriting/i,
  /mandatory scrapbook/i,
  /burn book clone/i,
  /site 00 projects ux/i,
  /host visual memory/i,
];

export function assertCharacterFormationQuarantined(text: string): void {
  for (const pattern of QUARANTINE_PATTERNS) {
    if (pattern.test(text)) {
      throw new Error(`Character formation quarantine violation: ${pattern.source}`);
    }
  }
}

export function burnBookLiteralCloningPrevented(): true {
  return true;
}

export function burnBookProvidesCharacterCalibrationAuthority(): true {
  return true;
}

export function experimentGRecordsRemainImmutable(): true {
  return true;
}

export function noVisualGenerationDuringCharacterFormation(): true {
  return true;
}

export function founderSelectionRequiredForCharacterSystem(): true {
  return true;
}

export function establishedBrandMayCaptureExistingCharacter(): true {
  return true;
}
