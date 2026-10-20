import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  BUILDER_DISAPPEARANCE_CAUSE,
  BUILDER_LAST_WORKING_REVIEW_SHA,
  DIGITAL_FOUNDATION_BUILDER_MANIFEST,
  builderManifestAnchorIds,
} from '../src/site00/pages/foundation/digitalFoundationBuilderManifest';
import { reviewEntriesForIndex } from '../src/site00/pages/foundation/digitalFoundationReviewRegistry';

describe('digital foundation builder manifest', () => {
  const previewHost = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPreviewHost.tsx', 'utf8');
  const registry = readFileSync('src/site00/pages/foundation/digitalFoundationReviewRegistry.ts', 'utf8');

  it('documents hybrid website builder rooms (not intake P03)', () => {
    expect(BUILDER_LAST_WORKING_REVIEW_SHA).toMatch(/^[0-9a-f]{8}$/);
    expect(BUILDER_DISAPPEARANCE_CAUSE).toContain('2693662b');
    expect(DIGITAL_FOUNDATION_BUILDER_MANIFEST.pages).toHaveLength(5);
    expect(DIGITAL_FOUNDATION_BUILDER_MANIFEST.pages.every((p) => p.exportName === 'BuilderStudio')).toBe(true);
    expect(DIGITAL_FOUNDATION_BUILDER_MANIFEST.intakeConfigurator.anchorIds).toContain('df-r-P03');
  });

  it('registers every manifest anchor in the review registry', () => {
    const indexAnchors = new Set(reviewEntriesForIndex().map((e) => e.anchorId));
    for (const anchor of builderManifestAnchorIds()) {
      expect(indexAnchors.has(anchor)).toBe(true);
    }
  });

  it('mounts website builder embeds and intake P03 configure in the preview host', () => {
    expect(previewHost).toContain('DigitalFoundationReviewBuilderStudioEmbed');
    expect(previewHost).toContain('ReviewP03ConfigureSurface');
    expect(previewHost).toContain('intakeConfiguratorAnchorIds');
    for (const anchor of builderManifestAnchorIds()) {
      expect(registry).toContain(anchor.replace('df-r-bldr-', ''));
    }
    expect(registry).toContain('df-r-bldr-${room}');
  });
});
