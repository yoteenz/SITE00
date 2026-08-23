/**
 * Reference-specific prompt compiler — explicit preserve/ignore/do-not-inherit per reference.
 */

import type { VisualReferencePackage, VisualReferencePackageEntry } from './types.js';

function formatReferenceBlock(index: number, entry: VisualReferencePackageEntry): string {
  const num = String(index + 1).padStart(2, '0');
  const lines = [
    `REFERENCE ${num} — ${entry.label}`,
    entry.whyIncluded,
  ];

  if (entry.preserve.length > 0) {
    lines.push('PRESERVE:');
    for (const p of entry.preserve) lines.push(`- ${p}`);
  }
  if (entry.ignore.length > 0) {
    lines.push('IGNORE:');
    for (const p of entry.ignore) lines.push(`- ${p}`);
  }
  if (entry.doNotInherit.length > 0) {
    lines.push('DO NOT INHERIT:');
    for (const p of entry.doNotInherit) lines.push(`- ${p}`);
  }

  return lines.join('\n');
}

export function compileReferenceConditionedPrompt(params: {
  referencePackage: VisualReferencePackage;
  basePrompt: string;
  negativePrompt: string;
}): { prompt: string; negativePrompt: string; referenceInstructions: string } {
  const blocks = params.referencePackage.references.map((ref, i) => formatReferenceBlock(i, ref));
  const referenceInstructions = [
    'VISUAL REFERENCE AUTHORITY INSTRUCTIONS',
    'Each reference declares what may and may not be inherited.',
    'References do not all mean "copy this."',
    ...blocks,
    ...(params.referencePackage.authorityInstructions.length > 0
      ? ['GLOBAL AUTHORITY:', ...params.referencePackage.authorityInstructions.map((a) => `- ${a}`)]
      : []),
    ...(params.referencePackage.preserveInstructions.length > 0
      ? ['PRESERVE GLOBALLY:', ...params.referencePackage.preserveInstructions.map((p) => `- ${p}`)]
      : []),
    ...(params.referencePackage.transformInstructions.length > 0
      ? ['TRANSFORM:', ...params.referencePackage.transformInstructions.map((t) => `- ${t}`)]
      : []),
    ...(params.referencePackage.ignoreInstructions.length > 0
      ? ['IGNORE GLOBALLY:', ...params.referencePackage.ignoreInstructions.map((i) => `- ${i}`)]
      : []),
    ...(params.referencePackage.antiDirectionInstructions.length > 0
      ? ['ANTI-DIRECTION (REJECT):', ...params.referencePackage.antiDirectionInstructions.map((a) => `- ${a}`)]
      : []),
    params.referencePackage.clientHostBoundary,
    ...(params.referencePackage.functionalConstraints.length > 0
      ? ['FUNCTIONAL CONSTRAINTS:', ...params.referencePackage.functionalConstraints.map((f) => `- ${f}`)]
      : []),
  ].join('\n');

  const prompt = [params.basePrompt, referenceInstructions].join('\n\n');
  const negativePrompt = [
    params.negativePrompt,
    ...params.referencePackage.antiDirectionInstructions,
  ].join(', ');

  return { prompt, negativePrompt, referenceInstructions };
}

export function structuralOnlyConditioningApplied(entry: VisualReferencePackageEntry): boolean {
  return (
    entry.approvalStatus === 'STRUCTURAL_REFERENCE' ||
    entry.authority.STYLE === 'STRUCTURAL_ONLY' ||
    entry.roles.includes('STRUCTURAL_HIERARCHY')
  );
}

export function strictHostConditioningApplied(package_: VisualReferencePackage): boolean {
  return package_.strictHostVisualConditioning;
}

export function negativeReferenceInstructions(entry: VisualReferencePackageEntry): string[] {
  if (entry.approvalStatus !== 'NEGATIVE_REFERENCE' && !entry.roles.includes('NEGATIVE_REFERENCE')) return [];
  return entry.doNotInherit;
}
