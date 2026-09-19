/**
 * Mock Creative Intelligence provider for tests — never used in production paths.
 */

import { randomUUID } from 'node:crypto';
import type {
  CoreDirectionCritiqueResult,
  CoreDirectionFormationInput,
  CoreDirectionFormationResult,
  CreativeIntelligenceProvider,
  FormedCoreDirection,
  ReviseCoreDirectionsInput,
} from './types.js';

function mockDirections(input: CoreDirectionFormationInput): FormedCoreDirection[] {
  const base = input.worldMetaphor ?? 'brand world';
  return [
    {
      directionId: randomUUID(),
      directionName: 'SIGNAL ARCHIVE',
      bigIdea: `A living archive where ${base} becomes evidence others missed.`,
      oneLineThesis: 'FIND WHAT OTHERS FILE AWAY.',
      brandConnection: input.brandBelief ?? 'Grounded in brand belief.',
      loreLineage: [`worldMetaphor: ${base}`, ...(input.founderConfirmedCanon.slice(0, 2) || ['brand lore'])],
      conceptualAncestor: 'Field research dossiers',
      culturalReference: 'Field research dossiers',
      emotionalPromise: input.emotionalPromise?.[0] ?? 'Clarity through observation',
      audienceRole: 'Insider witness',
      brandRole: 'Interpreter of hidden patterns',
      visualMetaphor: 'Indexed evidence under cold light',
      governingBehavior: 'CATALOGUING — sorting signal from ambient noise',
      materialImageryLanguage: (input.materialVocabulary ?? ['paper', 'stamp']).join(', '),
      imageryLanguage: 'Macro evidence photography with index marks',
      typographicAttitude: 'Monospace metadata with confident sans headlines',
      coreColorLogic: 'Neutral archive base with one instrument accent',
      colorLogic: 'Neutral archive base with one instrument accent',
      signatureDevices: ['Index stamps', 'Coordinate overlays'],
      primaryBrandArtifact: 'Annotated index card proving a finding',
      motionSeed: 'Slow scan line across evidence',
      socialExpressionHypothesis: 'Carousel of one finding per slide with metadata rail',
      proprietaryQuality: 'Behavioral cataloguing tied to specific lore tensions',
      antiDirection: input.creativeAntiPatterns?.slice(0, 2) ?? ['generic dashboard'],
      risks: ['Could drift into UI mockup if not guarded'],
      qualityConfidence: 'HIGH',
    },
    {
      directionId: randomUUID(),
      directionName: 'EDITORIAL INTERVENTION',
      bigIdea: `Editorial voice interrupts complacent narratives about ${base}.`,
      oneLineThesis: 'SAY THE QUIET PART IN PRINT.',
      brandConnection: input.brandBelief ?? 'Grounded in brand belief.',
      loreLineage: [`culturalOpposition: ${(input.culturalOpposition ?? ['complacency']).join(', ')}`],
      conceptualAncestor: 'Independent magazine annotation rituals',
      culturalReference: 'Independent magazine annotation rituals',
      emotionalPromise: input.emotionalPromise?.[1] ?? input.emotionalPromise?.[0] ?? 'Permission to be opinionated',
      audienceRole: 'Co-conspirator reader',
      brandRole: 'Editor who marks the record',
      visualMetaphor: 'Margin notes interrupting official text',
      governingBehavior: 'ANNOTATION — marking and interrupting existing information',
      materialImageryLanguage: 'Uncoated paper, marker, translucent tape',
      imageryLanguage: 'Editorial spreads with physical interruption',
      typographicAttitude: 'Serif accent wordmark, sans headlines, small-caps labels',
      coreColorLogic: 'Paper/ink foundation with one intervention accent only',
      colorLogic: 'Paper/ink foundation with one intervention accent only',
      signatureDevices: ['Margin marks', 'Torn inserts'],
      primaryBrandArtifact: 'Annotated editorial spread fragment',
      motionSeed: 'Marker stroke revealing a redaction',
      socialExpressionHypothesis: 'Single-image editorial card with handwritten interruption',
      proprietaryQuality: 'Annotation behavior derived from lore, not generic editorial clean',
      antiDirection: ['Pinterest moodboard', 'SaaS layout'],
      risks: ['Could become scrapbook if material language over-indexed'],
      qualityConfidence: 'HIGH',
    },
    {
      directionId: randomUUID(),
      directionName: 'KINETIC FIELD',
      bigIdea: `Movement and tempo express how ${base} actually behaves in culture.`,
      oneLineThesis: 'FEEL THE FIELD SHIFT.',
      brandConnection: input.brandBelief ?? 'Grounded in brand belief.',
      loreLineage: [`audienceRitual: ${(input.audienceRitual ?? ['scroll']).join(', ')}`],
      conceptualAncestor: 'Live score notation for cultural tempo',
      culturalReference: 'Live score notation for cultural tempo',
      emotionalPromise: 'You feel ahead of the ambient rhythm',
      audienceRole: 'Participant in motion',
      brandRole: 'Conductor of cultural tempo',
      visualMetaphor: 'Waveforms crossing a field grid',
      governingBehavior: 'PULSING — rhythm and tempo as primary visual behavior',
      materialImageryLanguage: 'Gradient fields, motion trails, grid substrates',
      imageryLanguage: 'Abstract motion fields with human scale anchors',
      typographicAttitude: 'Geometric sans with kinetic tracking shifts',
      coreColorLogic: 'Dark field with kinetic accent pulses',
      colorLogic: 'Dark field with kinetic accent pulses',
      signatureDevices: ['Pulse markers', 'Trail vectors'],
      primaryBrandArtifact: 'Looping motion seed card',
      motionSeed: 'Three-beat pulse loop',
      socialExpressionHypothesis: 'Short motion-first social clip with typographic beat',
      proprietaryQuality: 'Tempo behavior tied to audience ritual lore',
      antiDirection: ['Static poster brand', 'Stock gradient wallpaper'],
      risks: ['Motion could overpower concept without artifact anchor'],
      qualityConfidence: 'HIGH',
    },
  ];
}

export function createMockCreativeIntelligenceProvider(): CreativeIntelligenceProvider {
  return {
    providerId: 'mock',
    capability: {
      providerId: 'mock',
      modelId: 'mock-model',
      supportsStructuredOutput: true,
      supportsLongContext: true,
      supportsVision: false,
      supportsToolUse: false,
      maxContext: 128_000,
      status: 'AVAILABLE',
    },
    async formCoreDirections(input: CoreDirectionFormationInput): Promise<CoreDirectionFormationResult> {
      return { directions: mockDirections(input), rationaleSummary: 'mock formation' };
    },
    async critiqueCoreDirections(
      _input: CoreDirectionFormationInput,
      candidates: FormedCoreDirection[],
    ): Promise<CoreDirectionCritiqueResult> {
      return {
        critiques: candidates.map((c) => ({
          directionId: c.directionId,
          directionName: c.directionName,
          overall: 'PASS',
          dimensions: { BRAND_GROUNDEDNESS: 'PASS', CONCEPT_STRENGTH: 'PASS' },
          failureReasons: [],
          revisionGuidance: null,
        })),
        distinctiveness: {
          passed: true,
          duplicatePairs: [],
          worldDifferentiationQuestion: 'If names and colors disappeared, would these still feel like three different worlds?',
          worldDifferentiationAnswer: 'Yes',
        },
        revisionRequired: false,
        failedDirectionIds: [],
      };
    },
    async reviseCoreDirections(input: ReviseCoreDirectionsInput): Promise<CoreDirectionFormationResult> {
      return { directions: mockDirections(input.formationInput) };
    },
  };
}

export function createFailingMockCreativeIntelligenceProvider(): CreativeIntelligenceProvider {
  const failThird = (input: CoreDirectionFormationInput) => {
    const dirs = mockDirections(input);
    dirs[2] = {
      ...dirs[2],
      loreLineage: ['worldMetaphor: generic'],
      socialExpressionHypothesis: 'Homepage hero with SaaS dashboard layout for the brand site',
    };
    return dirs;
  };

  return {
    providerId: 'mock-fail',
    capability: {
      providerId: 'mock-fail',
      modelId: 'mock-model',
      supportsStructuredOutput: true,
      supportsLongContext: true,
      supportsVision: false,
      supportsToolUse: false,
      maxContext: 128_000,
      status: 'AVAILABLE',
    },
    async formCoreDirections(input: CoreDirectionFormationInput): Promise<CoreDirectionFormationResult> {
      return { directions: failThird(input), rationaleSummary: 'mock failing formation' };
    },
    async critiqueCoreDirections(
      _input: CoreDirectionFormationInput,
      candidates: FormedCoreDirection[],
    ): Promise<CoreDirectionCritiqueResult> {
      return {
        critiques: candidates.map((c) => ({
          directionId: c.directionId,
          directionName: c.directionName,
          overall: c.directionName === 'KINETIC FIELD' ? 'FAIL' : 'PASS',
          dimensions: { BRAND_GROUNDEDNESS: c.directionName === 'KINETIC FIELD' ? 'FAIL' : 'PASS' },
          failureReasons: c.directionName === 'KINETIC FIELD' ? ['Website-first concept'] : [],
          revisionGuidance: c.directionName === 'KINETIC FIELD' ? 'Remove website framing' : null,
        })),
        distinctiveness: {
          passed: true,
          duplicatePairs: [],
          worldDifferentiationQuestion: 'worlds?',
          worldDifferentiationAnswer: 'Yes',
        },
        revisionRequired: true,
        failedDirectionIds: candidates.filter((c) => c.directionName === 'KINETIC FIELD').map((c) => c.directionId),
      };
    },
    async reviseCoreDirections(input: ReviseCoreDirectionsInput): Promise<CoreDirectionFormationResult> {
      return { directions: failThird(input.formationInput) };
    },
  };
}
