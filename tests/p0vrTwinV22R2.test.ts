/**
 * P0.VR.TWINV2.2R2 — Host-shell exclusion + client-canvas generation boundary.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  VISUAL_OWNERSHIP,
  P0_VR_TWIN_V22R2_BUILD,
  TWIN_V2_HOST_BOUNDARY_VIOLATION,
  GENERATED_HOST_BOTTOM_NAV_LABELS,
  buildNdxbookMobileTwinV2CanvasBoundary,
  buildDefaultNdxbookMobileHostShellContract,
  detectGeneratedHostArtifacts,
  sanitizeConceptForHostBoundary,
  assertNoGeneratedHostArtifactsInClientBuild,
  applyBlueprintOwnershipTags,
  buildHostShellCompositePreview,
  defaultTwinV2VisualGenerationContract,
  TWIN_V2_CLIENT_CANVAS_GENERATION_BOUNDARY,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/index.js';
import {
  createConceptDirectedTwinSession,
  mergeVisualConceptApiResult,
  composeConceptDirectedTwinV2,
  approveActiveConceptCandidate,
  assertV1Isolation,
  buildVisualConceptPrompt,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import {
  ensureConceptGallery,
  getActiveConceptCandidate,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import {
  computeConceptBuildReadiness,
  canBuildConcept,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/computeConceptBuildReadiness.js';
import { generateConceptBlueprint } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/generateConceptBlueprint.js';
import { P0_VR_TWIN_V22_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/constants.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.TWINV2.2R2 host boundary contract', () => {
  it('1–5 VisualOwnership and TwinV2CanvasBoundary regions', () => {
    expect(VISUAL_OWNERSHIP).toContain('HOST_OWNED_LOCKED');
    expect(VISUAL_OWNERSHIP).toContain('CLIENT_OWNED_CREATIVE');
    expect(VISUAL_OWNERSHIP).toContain('DEVICE_CHROME_EXCLUDED');
    const boundary = buildNdxbookMobileTwinV2CanvasBoundary('ndxbook:/overview');
    expect(boundary.hostRegions.some((r) => r.regionId === 'host-bottom-nav')).toBe(true);
    expect(boundary.clientRegions.some((r) => r.regionId === 'client-hero')).toBe(true);
    expect(boundary.excludedRegions.some((r) => r.ownership === 'DEVICE_CHROME_EXCLUDED')).toBe(true);
    expect(boundary.contentCanvasBounds.h).toBeLessThan(0.9);
  });

  it('6–9 bottom/top host nav excluded from generation contract', () => {
    expect(GENERATED_HOST_BOTTOM_NAV_LABELS).toEqual(['HOME', 'PROJECTS', 'CREATE', 'MESSAGES', 'ACCOUNT']);
    expect(defaultTwinV2VisualGenerationContract().clientCanvasOnly).toBe(true);
    expect(TWIN_V2_CLIENT_CANVAS_GENERATION_BOUNDARY).toMatch(/Do not generate/);
    expect(read('api/site00/twin-v2-visual-concept.ts')).toContain('clientCanvasOnly: true');
  });

  it('10–12 ConceptBlueprint ownership + GeneratedHostArtifact detection', () => {
    const session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'hb-1' });
    let bp = generateConceptBlueprint({
      conceptId: 'cc-hb',
      creativeDirection: session.creativeDirection!,
      blueprintGrammar: session.blueprintGrammar,
      imageUrl: '/concept.jpg',
    });
    bp = applyBlueprintOwnershipTags(bp, { fullPageConceptImage: true });
    expect(bp.objects.some((o) => o.objectId === 'obj-generated-host-bottom-nav')).toBe(true);
    const artifacts = detectGeneratedHostArtifacts({ conceptId: 'cc-hb', blueprint: bp });
    expect(artifacts.some((a) => a.artifactType === 'INVENTED_BOTTOM_NAV')).toBe(true);
    expect(artifacts.some((a) => a.artifactType === 'INVENTED_TOP_HEADER')).toBe(true);
  });

  it('11–13 sanitize preserves client design; original image preserved', () => {
    const session = mergeVisualConceptApiResult(
      createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'san-1' }),
      { action: 'generate', imageUrl: '/strong-concept.jpg', imageStorageRef: 'ref-strong' },
    );
    const hydrated = ensureConceptGallery(session);
    const c = getActiveConceptCandidate(hydrated)!;
    const raw = hydrated.conceptGallery!.blueprints[c.conceptBlueprintId];
    const sanitized = sanitizeConceptForHostBoundary({
      conceptId: c.conceptId,
      pageId: c.pageId,
      blueprint: applyBlueprintOwnershipTags(raw, { fullPageConceptImage: true }),
      originalConceptImageUrl: c.visualAssetUrl,
    });
    expect(sanitized.originalConceptImagePreserved).toBe(true);
    expect(sanitized.sanitizedBlueprint.objects.some((o) => o.objectId === 'obj-generated-host-bottom-nav')).toBe(false);
    expect(sanitized.sanitizedBlueprint.objects.length).toBeGreaterThan(0);
    expect(hydrated.history[0].imageUrl).toBe('/strong-concept.jpg');
  });

  it('14–17 HostShellContract + real host nav component refs', () => {
    const contract = buildDefaultNdxbookMobileHostShellContract();
    expect(contract.hostBottomNavComponent).toBe('TwinSite00HostBottomNav');
    expect(contract.pageMountPoint).toContain('client-canvas');
    expect(read('src/site00/components/reconstruction/ConceptDirectedNdxOverviewTwinV2.tsx')).toContain(
      'TwinSite00HostBottomNav',
    );
    expect(read('src/site00/components/reconstruction/ConceptDirectedNdxOverviewTwinV2.tsx')).toContain(
      'site00-twin-v2-ndx__client-canvas',
    );
  });

  it('17–20 assertNoGeneratedHostArtifacts + readiness HOST BOUNDARY', () => {
    const session = ensureConceptGallery(
      mergeVisualConceptApiResult(
        createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'rdy-1' }),
        { action: 'generate', imageUrl: '/c.jpg', imageStorageRef: null },
      ),
    );
    const c = getActiveConceptCandidate(session)!;
    const readiness = c.buildReadiness;
    expect(readiness.hostBoundaryReady).toBe(true);
    expect(readiness.visualReady && readiness.blueprintReady && readiness.hostBoundaryReady).toBe(true);
    const sanitized = Object.values(session.conceptGallery!.sanitizedBlueprints)[0];
    expect(() => assertNoGeneratedHostArtifactsInClientBuild(sanitized)).not.toThrow();
    const dirty = applyBlueprintOwnershipTags(
      generateConceptBlueprint({
        conceptId: 'x',
        creativeDirection: session.creativeDirection!,
        blueprintGrammar: session.blueprintGrammar,
        imageUrl: '/c.jpg',
      }),
      { fullPageConceptImage: true },
    );
    expect(() => assertNoGeneratedHostArtifactsInClientBuild(dirty)).toThrow(TWIN_V2_HOST_BOUNDARY_VIOLATION);
  });

  it('20–22 current concept ready after sanitization; future prompt boundary', () => {
    const session = ensureConceptGallery(
      mergeVisualConceptApiResult(
        createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'ready-1' }),
        { action: 'generate', imageUrl: '/existing.jpg', imageStorageRef: 'stored' },
      ),
    );
    const c = getActiveConceptCandidate(session)!;
    expect(c.buildReadiness.status).toBe('READY_TO_BUILD');
    expect(canBuildConcept(c.buildReadiness, false)).toBe(false);
    const approved = approveActiveConceptCandidate(session);
    const ac = getActiveConceptCandidate(approved)!;
    expect(canBuildConcept(ac.buildReadiness, true)).toBe(true);
    const prompt = buildVisualConceptPrompt({
      pageIntent: session.pageIntent,
      functionGraph: session.functionGraph,
      brandContext: session.brandContext,
      blueprintGrammar: session.blueprintGrammar,
      creativeDirection: session.creativeDirection!,
      viewport: 'mobile',
      clientCanvasOnly: true,
    });
    expect(prompt).toContain('client canvas only');
    expect(prompt).toContain('Do not generate');
  });

  it('22–24 host-composited preview + build PASS + V1/live isolation', () => {
    const preview = buildHostShellCompositePreview({
      conceptId: 'cc-prev',
      originalConceptImageUrl: '/a.jpg',
      clientCanvasImageUrl: '/a.jpg',
      hostShellContract: buildDefaultNdxbookMobileHostShellContract(),
    });
    expect(preview.previewKind).toBe('PRODUCT_COMPOSITE');
    expect(read('src/site00/components/designWorkspace/pageFamily/TwinV2HostShellCompositePreview.tsx')).toContain(
      'TwinSite00HostBottomNav',
    );
    let session = approveActiveConceptCandidate(
      ensureConceptGallery(
        mergeVisualConceptApiResult(
          createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'bld-1' }),
          { action: 'generate', imageUrl: '/b.jpg', imageStorageRef: null },
        ),
      ),
    );
    const { sessionPatch } = composeConceptDirectedTwinV2(session);
    expect(sessionPatch.renderedTwin?.componentRef).toBe('ConceptDirectedNdxOverviewTwinV2');
    expect(assertV1Isolation().v1PipelineUntouched).toBe(true);
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/composeFromExecutablePackage.ts')).not.toContain(
      'promoteTwinToLive',
    );
    expect(P0_VR_TWIN_V22_BUILD).toBe('v356');
    expect(P0_VR_TWIN_V22R2_BUILD).toBe('v356');
  });
});
