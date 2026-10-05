import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { ForensicImplementationSpec } from './forensicTypes.js';
import type { ForensicImplementationCodingPrompt } from './forensicTypes.js';

export const FORENSIC_PROMPT_OPENING =
  'REBUILD THE LIVE TWIN PAGE TO MATCH THE APPROVED ACTUAL USING THE FORENSIC UI BLUEPRINT AS THE MEASURED IMPLEMENTATION SPEC.' as const;

export function buildForensicImplementationCodingPrompt(input: {
  spec: ForensicImplementationSpec;
  forensicBlueprintId: string;
  actualHash: string;
}): ForensicImplementationCodingPrompt {
  const fullText = [
    FORENSIC_PROMPT_OPENING,
    '',
    'DO NOT INTERPRET THE PAGE FROM SEMANTIC SECTION NAMES.',
    'FOLLOW THE FORENSIC OBJECT POSITIONS, DIMENSIONS, HIERARCHY, SPACING, TYPOGRAPHY, VISUAL WEIGHT, AND ASSET PLACEMENT.',
    'THE ACTUAL IMAGE REMAINS THE VISUAL AUTHORITY.',
    'THE FORENSIC BLUEPRINT TELLS YOU HOW TO RECONSTRUCT IT.',
    '',
    `forensicBlueprintId: ${input.forensicBlueprintId}`,
    `forensicSpecId: ${input.spec.id}`,
    `forensicSpecHash: ${input.spec.hash}`,
    `actualHash: ${input.actualHash}`,
  ].join('\n');

  return {
    id: `ficp-${fnv1aHex(fullText).slice(0, 12)}`,
    fullText,
    hash: fnv1aHex(fullText),
    injected: true,
  };
}
