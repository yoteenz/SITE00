/**
 * P0.VR.CONCEPT-A-AUTHORITY-SANITIZE-BEFORE-PROMOTION1
 */

import { describe, expect, it } from 'vitest';

import {
  buildAuthorityArtifactSanitationMap,
  buildPassingSanitationReceiptForTest,
  buildSanitizedAuthorityArtifactId,
  registerAuthorityArtifactSanitationLineage,
  sanitizeAuthorityConceptArtifact,
  SELECTED_AUTHORITY_ARTIFACT_NOT_SANITIZED,
  validateAuthorityArtifactSanitationReceipt,
  validateScreenshotSanitationMap,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptAuthorityArtifactSanitation.js';
import { validateConceptCanvas } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportCanvasContract.js';
import {
  emptyProjectVisualAuthorityRegistry,
  promoteProjectVisualAuthority,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/projectVisualAuthority.js';

const ORIGINAL = 'ndxbook:overview:MOBILE_CONCEPT_A:run-1';

describe('P0.VR concept A sanitize before promotion', () => {
  it('validates screenshot sanitation map product bounds', () => {
    const map = buildAuthorityArtifactSanitationMap({
      captureId: ORIGINAL,
      captureWidth: 780,
      captureHeight: 1688,
    });
    expect(validateScreenshotSanitationMap(map).ok).toBe(true);
    expect(validateConceptCanvas({ width: 780, height: 1688 }).ok).toBe(true);
  });

  it('sanitizes contaminated tall capture to canonical canvas without design flag', async () => {
    const receipt = await sanitizeAuthorityConceptArtifact({
      originalArtifactId: ORIGINAL,
      captureBase64: Buffer.from('fake-png').toString('base64'),
      width: 390,
      height: 844,
    });
    expect(receipt.ok).toBe(true);
    expect(receipt.sanitizedArtifactId).toBe(buildSanitizedAuthorityArtifactId(ORIGINAL));
    expect(receipt.designChanged).toBe(false);
    expect(receipt.canonicalCanvas).toBe(true);
    expect(receipt.deviceChromeRemoved).toBe(true);
    expect(receipt.browserChromeRemoved).toBe(true);
    expect(receipt.letterboxingRemoved).toBe(true);
  });

  it('blocks promotion without sanitation receipt', () => {
    expect(() =>
      promoteProjectVisualAuthority({
        registry: emptyProjectVisualAuthorityRegistry(),
        projectId: 'ndxbook',
        sourcePageId: 'ndxbook:overview',
        sourceConceptId: 'mc-a',
        sourceTerritoryId: null,
        sourceArtifactId: ORIGINAL,
        sourceViewport: 'MOBILE',
        artifactWidth: 780,
        artifactHeight: 1688,
        artifactStatus: 'READY',
        sanitationReceipt: {
          ok: false,
          errorCode: SELECTED_AUTHORITY_ARTIFACT_NOT_SANITIZED,
          originalArtifactId: ORIGINAL,
          sanitizedArtifactId: null,
          deviceChromeRemoved: false,
          browserChromeRemoved: false,
          letterboxingRemoved: false,
          canonicalCanvas: false,
          productBoundsPass: false,
          designChanged: false,
          map: null,
          sanitizedPreviewBase64: null,
        },
        compile: { cgptBrief: null, skinContract: null, webTerritory: null, ndxBrief: null },
      }),
    ).toThrow(SELECTED_AUTHORITY_ARTIFACT_NOT_SANITIZED);
  });

  it('promotes using sanitized artifact id and preserves original lineage', () => {
    const receipt = buildPassingSanitationReceiptForTest(ORIGINAL);
    expect(validateAuthorityArtifactSanitationReceipt(receipt).ok).toBe(true);
    const lineageRegistry = registerAuthorityArtifactSanitationLineage({
      registry: { bySanitizedId: {}, sanitizedPreviewBase64: {} },
      lineage: {
        relation: 'SANITIZED_FROM',
        originalArtifactId: ORIGINAL,
        sanitizedArtifactId: receipt.sanitizedArtifactId!,
        sanitizedAt: new Date().toISOString(),
        width: 780,
        height: 1688,
      },
      sanitizedPreviewBase64: 'abc',
    });
    expect(lineageRegistry.bySanitizedId[receipt.sanitizedArtifactId!]?.relation).toBe('SANITIZED_FROM');

    const { record } = promoteProjectVisualAuthority({
      registry: emptyProjectVisualAuthorityRegistry(),
      projectId: 'ndxbook',
      sourcePageId: 'ndxbook:overview',
      sourceConceptId: 'mc-a',
      sourceTerritoryId: null,
      sourceArtifactId: receipt.sanitizedArtifactId!,
      sourceViewport: 'MOBILE',
      artifactWidth: 780,
      artifactHeight: 1688,
      artifactStatus: 'READY',
      sanitationReceipt: receipt,
      compile: { cgptBrief: null, skinContract: null, webTerritory: null, ndxBrief: null },
    });
    expect(record.sourceArtifactId).toBe(receipt.sanitizedArtifactId);
    expect(record.sourceOriginalArtifactId).toBe(ORIGINAL);
  });
});
