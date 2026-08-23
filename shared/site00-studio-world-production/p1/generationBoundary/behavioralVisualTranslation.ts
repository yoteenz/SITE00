/**
 * Translates workspace methodology terms into provider-safe behavioral instructions.
 */

const PROHIBITED_STYLE_METAPHORS = [
  'workbench',
  'dossier',
  'active piece',
  'review tray',
  'on the bench',
  'case file',
  'command center',
  'detective file',
] as const;

export type MetaphorLeakageResult = {
  detected: boolean;
  terms: string[];
};

export function literalMetaphorLeakageDetected(text: string): MetaphorLeakageResult {
  const lower = text.toLowerCase();
  const terms = PROHIBITED_STYLE_METAPHORS.filter((term) => {
    if (!lower.includes(term)) return false;
    if (lower.includes(`not literal ${term}`)) return false;
    if (lower.includes(`behavioral ${term}`)) return false;
    if (lower.includes(`no literal ${term}`)) return false;
    return true;
  });
  return { detected: terms.length > 0, terms: [...terms] };
}

export function assertNoLiteralMetaphorLeakage(text: string): void {
  const leak = literalMetaphorLeakageDetected(text);
  if (leak.detected) {
    throw new Error(`LITERAL_METAPHOR_LEAKAGE_BLOCKED: ${leak.terms.join(', ')}`);
  }
}

export function compileBehavioralVisualTranslation(params: {
  compositionalHierarchy: string[];
  interactionGrammar?: string[];
  informationHierarchy?: string[];
}): string {
  const lines = [
    'Create an asymmetric working interface in which one current project receives dominant visual priority.',
    'Founder judgments interrupt the hierarchy at appropriate moments when work awaits review.',
    'Supporting projects remain secondary; historical work recedes spatially.',
    'Structural sophistication through layered evidence — not literal archive, workshop, or case-file imagery.',
    'SITE 00 host visual language remains authoritative — shell, navigation, typography, and spatial atmosphere.',
  ];
  for (const h of params.compositionalHierarchy) {
    lines.push(`Hierarchy behavior: ${h}`);
  }
  for (const g of params.interactionGrammar ?? []) {
    lines.push(`Interaction: ${g}`);
  }
  for (const i of params.informationHierarchy ?? []) {
    lines.push(`Information: ${i}`);
  }
  return lines.join('\n');
}

export function sanitizeProviderPrompt(text: string): string {
  return text
    .replace(/\bworkbench\b/gi, 'asymmetric active-work focal zone')
    .replace(/\bdossier\b/gi, 'layered evidence structure')
    .replace(/\bactive piece\b/gi, 'dominant current-work artifact')
    .replace(/\breview tray\b/gi, 'founder judgment queue band')
    .replace(/\bon the bench\b/gi, 'secondary project cluster')
    .replace(/\bcase file\b/gi, 'evidence layering');
}
