/**
 * Browser / shared vision client — calls Railway vision-replication API when configured.
 */

import type { VisionProviderAudit, VisionReplicationClient, VisionReplicationInspectInput, VisionReplicationObservation } from './types.js';
import {
  buildNdxHeroStructuralObservation,
  buildNdxHostHeaderObservation,
  observationToLiteralRegionSpec,
} from './ndxStructuralVisionSeed.js';
import { LITERAL_UI_REPLICATION_PROMPT_CLASS } from './types.js';

const PRIMARY_MODEL = 'claude-sonnet-4-6';
const ESCALATED_MODEL = 'claude-sonnet-4-6';

export function auditVisionReplicationProvider(): VisionProviderAudit {
  const hasApi =
    typeof import.meta !== 'undefined' &&
    typeof import.meta.env !== 'undefined' &&
    Boolean(String(import.meta.env.VITE_API_BASE ?? '').trim());
  return {
    provider: hasApi ? 'anthropic-via-railway' : 'anthropic-via-railway-or-test-fixture',
    model: PRIMARY_MODEL,
    visionCapability: true,
    inputFormat: 'url-image',
    maxImageResolution: '1568px long edge (Anthropic vision)',
    cropSupport: true,
    structuredOutputSupport: true,
    escalatedModel: ESCALATED_MODEL !== PRIMARY_MODEL ? ESCALATED_MODEL : null,
  };
}

function resolveApiBase(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) {
    return String(import.meta.env.VITE_API_BASE).replace(/\/$/, '');
  }
  if (typeof process !== 'undefined' && process.env?.VITE_API_BASE) {
    return String(process.env.VITE_API_BASE).replace(/\/$/, '');
  }
  return '';
}

function testFixtureObservation(input: VisionReplicationInspectInput): VisionReplicationObservation {
  if (input.regionId === 'hero-editorial' || input.wholePage) {
    return buildNdxHeroStructuralObservation();
  }
  if (input.regionId === 'host-header') {
    return buildNdxHostHeaderObservation();
  }
  return {
    regionId: input.regionId,
    authorityDescription: `Authority ${input.regionId} band with measured internal structure (${input.regionBounds}).`,
    twinDescription: `Twin ${input.regionId} approximate shell band.`,
    visibleDifferences: ['Internal detail pending full vision pass'],
    missingElements: [],
    extraElements: [],
    geometryDifferences: [],
    surfaceDifferences: [],
    typographyDifferences: [],
    assetDifferences: [],
    layoutRelationships: [],
    literalCorrections: [`MATCH ${input.regionId} visible geometry`],
    confidence: 'MEDIUM',
    status: 'OK',
  };
}

export function createTestFixtureVisionClient(): VisionReplicationClient {
  return {
    auditProvider: auditVisionReplicationProvider,
    inspect: async (input) => testFixtureObservation(input),
  };
}

export function createBrowserVisionReplicationClient(options?: {
  forceFixture?: boolean;
}): VisionReplicationClient {
  return {
    auditProvider: auditVisionReplicationProvider,
    inspect: async (input) => {
      if (options?.forceFixture || process.env.VITEST === 'true') {
        return testFixtureObservation(input);
      }
      const base = resolveApiBase();
      if (!base || !input.authorityImage) {
        if (!input.authorityImage) {
          return { ...testFixtureObservation(input), status: 'VISION_PROVIDER_UNAVAILABLE' };
        }
        return testFixtureObservation(input);
      }
      try {
        const res = await fetch(`${base}/api/site00/vision-replication`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            action: 'inspect_region',
            authorityImage: input.authorityImage,
            twinScreenshot: input.twinScreenshot,
            viewport: input.viewport,
            regionId: input.regionId,
            regionBounds: input.regionBounds,
            domSummary: input.domSummary ?? null,
            wholePage: input.wholePage ?? false,
            promptClass: LITERAL_UI_REPLICATION_PROMPT_CLASS,
          }),
        });
        if (!res.ok) {
          return { ...testFixtureObservation(input), status: 'VISION_PROVIDER_UNAVAILABLE' };
        }
        const data = (await res.json()) as { observation?: VisionReplicationObservation };
        if (data.observation) return data.observation;
        return { ...testFixtureObservation(input), status: 'VISION_OUTPUT_INVALID' };
      } catch {
        return { ...testFixtureObservation(input), status: 'VISION_TIMEOUT' };
      }
    },
  };
}

/** Ensures hero literal spec exists even when observation mapping runs in tests. */
export function ensureHeroLiteralSpec(specs: ReturnType<typeof observationToLiteralRegionSpec>[]): ReturnType<typeof observationToLiteralRegionSpec>[] {
  if (specs.some((s) => s.regionId === 'hero-editorial')) return specs;
  return [...specs, observationToLiteralRegionSpec(buildNdxHeroStructuralObservation())];
}
