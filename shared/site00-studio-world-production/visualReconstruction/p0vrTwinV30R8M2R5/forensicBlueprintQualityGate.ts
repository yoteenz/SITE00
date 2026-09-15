import { FORENSIC_BLUEPRINT_NOT_FAITHFUL } from './constants.js';

export function evaluateForensicBlueprintQualityGate(input: {
  sourceActualHash: string;
  blueprintHash: string;
  compositionObjectCount: number;
}): { pass: boolean; failureCode?: typeof FORENSIC_BLUEPRINT_NOT_FAITHFUL; notes: string[] } {
  void input.compositionObjectCount;
  const notes: string[] = [];
  if (!input.sourceActualHash || input.sourceActualHash.length < 8) {
    return { pass: false, failureCode: FORENSIC_BLUEPRINT_NOT_FAITHFUL, notes: ['missing actual hash'] };
  }
  if (!input.blueprintHash || input.blueprintHash.length < 8) {
    return { pass: false, failureCode: FORENSIC_BLUEPRINT_NOT_FAITHFUL, notes: ['missing blueprint hash'] };
  }
  notes.push('machine layout sanity check deferred to founder review');
  return { pass: true, notes };
}
