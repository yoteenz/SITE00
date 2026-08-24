/**
 * P0.5E.4A — Forensic audit of P0.5E.4 founder-facing UX (internal vs calibration experience).
 */

export type FounderCalibrationForensic = {
  existingFounderUxProblems: string[];
  internalMethodologyExposed: string[];
  existingEvidencePreserved: string[];
};

export function buildFounderCalibrationForensic(): FounderCalibrationForensic {
  return {
    existingFounderUxProblems: [
      'Tab-based 12-section survey exposed founder to 28 domains without adaptive sequencing',
      'Trait pill matrices with SYSTEM_SEEDED · HYPOTHESIS metadata as primary labels',
      'Scenarios required founder to assemble behavior from unexplained response lists',
      'Abstract intelligence dimensions shown as founder-facing confirmation targets',
      '18 visual hypotheses as repetitive individual judgments',
      'No CONTINUE CALIBRATION single-moment workflow',
    ],
    internalMethodologyExposed: [
      'PSYCHOLOGY · SYSTEM_SEEDED · HYPOTHESIS on trait cards',
      'Authority and confidence states in primary view',
      'Diagnostic classifications (CONTRADICTION_DETECTION, PATTERN_RECOGNITION)',
      'Casting readiness blocking gates in primary navigation',
    ],
    existingEvidencePreserved: [
      'P0.5E.4 discovery ledger and founder judgments',
      'Scenario bank and behavioral implications',
      'Contradiction, flaw, intelligence, voice, book, visual seeds',
      'YES_I_KNOW_HER gate and casting readiness evaluation',
      'P0.5E.5 continuity pipeline upstream compatibility',
    ],
  };
}
