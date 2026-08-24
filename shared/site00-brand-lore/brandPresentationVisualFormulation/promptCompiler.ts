/**
 * compileBrandPresentationVisualPrompt — semantic contract → provider-safe prompt.
 */

import { createHash } from 'node:crypto';
import {
  assertNoLiteralMetaphorLeakage,
  sanitizeProviderPrompt,
} from '../../site00-studio-world-production/p1/generationBoundary/behavioralVisualTranslation.js';
import type { BrandPresentationDirectionCandidate } from '../brandPresentationDirectionTerritory/types.js';
import type {
  BrandPresentationVisualExpressionCandidate,
  BrandPresentationVisualReferencePackage,
  BrandPresentationDirectionVisualBenchmark,
} from './types.js';
import type { FrozenParentConceptSnapshot } from '../brandPresentationDirectionTerritory/types.js';

const METAPHOR_SANITIZE_TERMS = [
  'Collector',
  'Room',
  'Noticing',
  'Authority',
  'Knowledge',
  'Recurrence',
  'Artifact',
  'Evidence',
  'System',
] as const;

export const VISUAL_FORMULATION_PROMPT_VERSION = 'BRAND_PRESENTATION_VISUAL_V1';
export const DIRECTION_BENCHMARK_PROMPT_VERSION = 'BRAND_PRESENTATION_DIRECTION_BENCHMARK_V1';

export function sanitizeMetaphorTerms(text: string): string {
  let out = text;
  for (const term of METAPHOR_SANITIZE_TERMS) {
    const re = new RegExp(`\\b${term}\\b`, 'gi');
    out = out.replace(re, (match) => {
      if (/literal/i.test(out.slice(Math.max(0, out.indexOf(match) - 20), out.indexOf(match)))) {
        return match;
      }
      return `behavioral ${term.toLowerCase()} posture`;
    });
  }
  return sanitizeProviderPrompt(out);
}

export function compileBrandPresentationVisualPrompt(params: {
  parentConcept: FrozenParentConceptSnapshot;
  direction: BrandPresentationDirectionCandidate;
  expression: BrandPresentationVisualExpressionCandidate;
  referencePackage: BrandPresentationVisualReferencePackage | null;
  antiDirectionEvidence: string[];
  socialPresentationRequirements: string[];
}): { prompt: string; negativePrompt: string; promptFingerprint: string } {
  const preserve = [
    `Parent concept behavioral truth: ${sanitizeMetaphorTerms(params.parentConcept.brandBehavior)}`,
    `Direction governing behavior: ${sanitizeMetaphorTerms(params.direction.brandBehavior)}`,
    `Audience relationship: ${sanitizeMetaphorTerms(params.direction.audienceRelationship)}`,
    `Publishing rhythm: ${sanitizeMetaphorTerms(params.direction.publishingBehavior)}`,
    `Recurrence engine: ${sanitizeMetaphorTerms(params.direction.recurrenceBehavior)}`,
    `Recognition mechanism: ${sanitizeMetaphorTerms(params.expression.recognitionMechanism)}`,
  ];

  const express = [
    `Expression thesis: ${sanitizeMetaphorTerms(params.expression.expressionThesis)}`,
    `Visual behavior: ${sanitizeMetaphorTerms(params.expression.visualBehavior)}`,
    `Composition: ${sanitizeMetaphorTerms(params.expression.compositionBehavior)}`,
    `Typography participation: ${sanitizeMetaphorTerms(params.expression.typographyBehavior)}`,
    `Imagery behavior: ${sanitizeMetaphorTerms(params.expression.imageryBehavior)}`,
    `Graphic language: ${sanitizeMetaphorTerms(params.expression.graphicLanguage)}`,
    `Information hierarchy: ${sanitizeMetaphorTerms(params.expression.informationBehavior)}`,
    `Density: ${sanitizeMetaphorTerms(params.expression.densityBehavior)}`,
    `Rhythm: ${sanitizeMetaphorTerms(params.expression.rhythmBehavior)}`,
    `Social-native surface behavior: ${sanitizeMetaphorTerms(params.expression.socialSurfaceBehavior)}`,
    `Variation logic: ${sanitizeMetaphorTerms(params.expression.variationLogic)}`,
  ];

  const avoid = [
    ...params.antiDirectionEvidence,
    ...params.expression.notThis,
    ...params.expression.antiCollapseRules,
    'SITE 00 Projects UX',
    'Project Workspace dashboard',
    'Host visual memory shell',
    'Experiment D or F visuals',
    'generic branding moodboard (logo + palette + business card only)',
    'Instagram UI chrome',
    'phone mockup frame',
    'full website',
    'literal scrapbook unless direction requires artifact behavior',
  ];

  const doNotLiteralize = [
    'Do not render conceptual names as physical objects.',
    'Translate metaphor into visible behavioral layout — not literal rooms, collectors, or notebooks.',
    'Show the presentation system in action on a social-native surface — not platform chrome.',
  ];

  const doNotInherit = [
    'Do not inherit SITE 00 host design language.',
    'Do not inherit Projects index or workspace UI patterns.',
  ];

  const doNotRedesign = [
    'Do not redesign the parent concept or direction strategy.',
    'This is one visual expression candidate under a locked direction — execute the contract.',
  ];

  const referenceBlock =
    params.referencePackage && params.referencePackage.references.length > 0
      ? `Reference conditioning: ${params.referencePackage.references.map((r) => r.referenceClass).join(', ')}`
      : 'Reference conditioning: none — text-to-image from expression contract';

  const prompt = sanitizeProviderPrompt(
    [
      'NDXBOOK Brand Presentation benchmark visual — social-native presentation system evidence, NOT production post.',
      'Single coherent design frame demonstrating how NDXBOOK would look and behave if encountered repeatedly in social feeds.',
      '',
      'PRESERVE:',
      ...preserve.map((l) => `- ${l}`),
      '',
      'EXPRESS:',
      ...express.map((l) => `- ${l}`),
      '',
      'AVOID:',
      ...avoid.map((l) => `- ${sanitizeMetaphorTerms(l)}`),
      '',
      'DO NOT LITERALIZE:',
      ...doNotLiteralize.map((l) => `- ${l}`),
      '',
      'DO NOT INHERIT:',
      ...doNotInherit.map((l) => `- ${l}`),
      '',
      'DO NOT REDESIGN CONCEPT:',
      ...doNotRedesign.map((l) => `- ${l}`),
      '',
      referenceBlock,
      ...params.socialPresentationRequirements.map((r) => `- ${r}`),
      '',
      '16:9 benchmark frame. Material depth, authored hierarchy, recognizable recurrence behavior visible.',
    ].join('\n'),
  );

  assertNoLiteralMetaphorLeakage(prompt);

  const negativePrompt = [
    'wireframe',
    'placeholder',
    'SaaS dashboard',
    'equal card grid',
    'Instagram UI',
    'TikTok UI',
    'phone mockup',
    'logo sheet',
    'business card layout',
    'SITE 00 projects page',
    'workbench',
    'dossier',
    'command center',
    ...avoid.slice(0, 8),
  ].join(', ');

  const promptFingerprint = createHash('sha256').update(prompt).digest('hex').slice(0, 16);
  return { prompt, negativePrompt, promptFingerprint };
}

export function compileDirectionBenchmarkPrompt(params: {
  parentConcept: FrozenParentConceptSnapshot;
  direction: BrandPresentationDirectionCandidate;
  benchmark: BrandPresentationDirectionVisualBenchmark;
  referencePackage: BrandPresentationVisualReferencePackage | null;
  antiDirectionEvidence: string[];
  socialPresentationRequirements: string[];
  parentMetaphorGuards?: string[];
}): { prompt: string; negativePrompt: string; promptFingerprint: string } {
  const preserve = [
    `Parent concept behavioral truth: ${sanitizeMetaphorTerms(params.parentConcept.brandBehavior)}`,
    `Direction governing behavior: ${sanitizeMetaphorTerms(params.direction.brandBehavior)}`,
    `Audience relationship: ${sanitizeMetaphorTerms(params.direction.audienceRelationship)}`,
    `Publishing rhythm: ${sanitizeMetaphorTerms(params.direction.publishingBehavior)}`,
    `Recurrence engine: ${sanitizeMetaphorTerms(params.direction.recurrenceBehavior)}`,
    `Recognition mechanism: ${sanitizeMetaphorTerms(params.benchmark.recognitionMechanism)}`,
  ];

  const express = [
    `Benchmark thesis: ${sanitizeMetaphorTerms(params.benchmark.benchmarkThesis)}`,
    `Visual translation: ${sanitizeMetaphorTerms(params.benchmark.visualTranslation)}`,
    `Composition: ${sanitizeMetaphorTerms(params.benchmark.compositionBehavior)}`,
    `Typography participation: ${sanitizeMetaphorTerms(params.benchmark.typographyBehavior)}`,
    `Imagery behavior: ${sanitizeMetaphorTerms(params.benchmark.imageryBehavior)}`,
    `Graphic language: ${sanitizeMetaphorTerms(params.benchmark.graphicBehavior)}`,
    `Artifact behavior: ${sanitizeMetaphorTerms(params.benchmark.artifactBehavior)}`,
    `Information hierarchy: ${sanitizeMetaphorTerms(params.benchmark.informationBehavior)}`,
    `Density: ${sanitizeMetaphorTerms(params.benchmark.densityBehavior)}`,
    `Rhythm: ${sanitizeMetaphorTerms(params.benchmark.rhythmBehavior)}`,
    `Social-native surface behavior: ${sanitizeMetaphorTerms(params.benchmark.socialNativeBehavior)}`,
    `Recurrence evidence: ${sanitizeMetaphorTerms(params.benchmark.recurrenceEvidence)}`,
  ];

  const avoid = [
    ...params.antiDirectionEvidence,
    ...params.benchmark.negativeDirection,
    ...params.benchmark.directionFidelityRequirements.filter((r) => r.startsWith('NOT:')),
    'SITE 00 Projects UX',
    'Project Workspace dashboard',
    'Host visual memory shell',
    'Experiment D or F visuals',
    'generic branding moodboard (logo + palette + business card only)',
    'Instagram UI chrome',
    'phone mockup frame',
    'full website',
    ...(params.parentMetaphorGuards ?? []).map((g) => `literal ${g}`),
  ];

  const doNotLiteralize = [
    'Do not render conceptual names as physical objects.',
    'Translate metaphor into visible behavioral layout — not literal rooms, eyes, or notebooks.',
    'Show the presentation system in action on a social-native surface — not platform chrome.',
    ...params.benchmark.antiLiteralizationRules.map((r) => sanitizeMetaphorTerms(r)),
  ];

  const referenceBlock =
    params.referencePackage && params.referencePackage.references.length > 0
      ? `Reference conditioning: ${params.referencePackage.references.map((r) => r.referenceClass).join(', ')}`
      : 'Reference conditioning: none — text-to-image from benchmark contract';

  const prompt = sanitizeProviderPrompt(
    [
      'NDXBOOK Brand Presentation DIRECTION VISUAL BENCHMARK — social-native presentation system evidence, NOT production post.',
      'Single coherent design frame demonstrating how NDXBOOK would look and behave if encountered in social feeds under THIS direction.',
      '',
      'PRESERVE:',
      ...preserve.map((l) => `- ${l}`),
      '',
      'EXPRESS:',
      ...express.map((l) => `- ${l}`),
      '',
      'AVOID:',
      ...avoid.map((l) => `- ${sanitizeMetaphorTerms(l)}`),
      '',
      'DO NOT LITERALIZE:',
      ...doNotLiteralize.map((l) => `- ${l}`),
      '',
      referenceBlock,
      ...params.socialPresentationRequirements.map((r) => `- ${r}`),
      '',
      '16:9 benchmark frame. Material depth, authored hierarchy, recognizable recurrence behavior visible.',
    ].join('\n'),
  );

  assertNoLiteralMetaphorLeakage(prompt);

  const negativePrompt = [
    'wireframe',
    'placeholder',
    'SaaS dashboard',
    'equal card grid',
    'Instagram UI',
    'TikTok UI',
    'phone mockup',
    'logo sheet',
    'business card layout',
    'SITE 00 projects page',
    'workbench',
    'dossier',
    'command center',
    ...avoid.slice(0, 12),
  ].join(', ');

  const promptFingerprint = createHash('sha256').update(prompt).digest('hex').slice(0, 16);
  return { prompt, negativePrompt, promptFingerprint };
}

export function compileBenchmarkRevisionPrompt(params: {
  base: ReturnType<typeof compileDirectionBenchmarkPrompt>;
  delta: { preserve: string[]; change: string[]; doNotBecome: string[] };
}): { prompt: string; negativePrompt: string; promptFingerprint: string } {
  const revisionLines = [
    '',
    'REVISION DELTA — surgical change only:',
    ...params.delta.preserve.map((p) => `PRESERVE: ${sanitizeMetaphorTerms(p)}`),
    ...params.delta.change.map((c) => `CHANGE: ${sanitizeMetaphorTerms(c)}`),
    ...params.delta.doNotBecome.map((d) => `DO NOT BECOME: ${sanitizeMetaphorTerms(d)}`),
  ];
  const prompt = sanitizeProviderPrompt(params.base.prompt + revisionLines.join('\n'));
  assertNoLiteralMetaphorLeakage(prompt);
  const promptFingerprint = createHash('sha256').update(prompt).digest('hex').slice(0, 16);
  return { prompt, negativePrompt: params.base.negativePrompt, promptFingerprint };
}

export function compileRevisionPrompt(params: {
  base: ReturnType<typeof compileBrandPresentationVisualPrompt>;
  delta: { preserve: string[]; change: string[]; doNotBecome: string[] };
}): { prompt: string; negativePrompt: string; promptFingerprint: string } {
  const revisionLines = [
    '',
    'REVISION DELTA — surgical change only:',
    ...params.delta.preserve.map((p) => `PRESERVE: ${sanitizeMetaphorTerms(p)}`),
    ...params.delta.change.map((c) => `CHANGE: ${sanitizeMetaphorTerms(c)}`),
    ...params.delta.doNotBecome.map((d) => `DO NOT BECOME: ${sanitizeMetaphorTerms(d)}`),
  ];
  const prompt = sanitizeProviderPrompt(params.base.prompt + revisionLines.join('\n'));
  assertNoLiteralMetaphorLeakage(prompt);
  const promptFingerprint = createHash('sha256').update(prompt).digest('hex').slice(0, 16);
  return { prompt, negativePrompt: params.base.negativePrompt, promptFingerprint };
}
