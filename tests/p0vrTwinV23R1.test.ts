/**
 * P0.VR.TWINV2.3R1 — DOM-first execution + raster crop prohibition.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createConceptDirectedTwinSession,
  mergeVisualConceptApiResult,
  composeConceptDirectedTwinV2,
  approveActiveConceptCandidate,
  prepareConceptDirectedTwinV2Build,
  assertV1Isolation,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import { ensureConceptGallery } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import {
  TWIN_V2_RENDER_PRIMITIVE_POLICY,
  auditBlueprintDepth,
  buildDomFirstTranslation,
  classifyLegacySectionRenderStrategies,
  expandExecutionBlueprintObjects,
  imageSlotPurityGuard,
  stripDebugCopy,
  P0_VR_TWIN_V23R1_BUILD,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV23R1/index.js';
import { P0_VR_TWIN_V24R1_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV24R1/constants.js';
import { buildTwinV2FromPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV23/buildTwinV2FromPackage.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function approvedSession() {
  let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'r1-1' });
  session = mergeVisualConceptApiResult(session, {
    action: 'generate',
    imageUrl: '/concept-r1.jpg',
    imageStorageRef: 'ref-r1',
  });
  session = approveActiveConceptCandidate(ensureConceptGallery(session));
  return prepareConceptDirectedTwinV2Build(session);
}

describe('P0.VR.TWINV2.3R1 DOM-first translation', () => {
  it('1–2 render primitive policy + legacy failure classification', () => {
    expect(TWIN_V2_RENDER_PRIMITIVE_POLICY.text).toBe('DOM');
    expect(TWIN_V2_RENDER_PRIMITIVE_POLICY.progress).toBe('DOM_CSS');
    const legacy = classifyLegacySectionRenderStrategies();
    expect(legacy.find((s) => s.section === 'progress')?.renderStrategy).toBe('FULL_REGION_IMAGE');
  });

  it('3–5 shallow blueprint audit + expanded object count', () => {
    const session = approvedSession();
    const pkg = Object.values(session.conceptGallery!.packages)[0];
    const audit = auditBlueprintDepth(pkg.blueprint);
    expect(audit.shallow).toBe(true);
    const expanded = expandExecutionBlueprintObjects(pkg, session.pageIntent, session.functionGraph);
    expect(expanded.length).toBeGreaterThan(30);
  });

  it('6–9 no Preserve function in user-facing renderer', () => {
    const renderer = read('src/site00/components/reconstruction/NdxTwinDomArtboard.tsx');
    expect(renderer).not.toContain('Preserve function');
    expect(stripDebugCopy('Preserve function: hero')).toBe('hero');
    expect(read('src/site00/components/reconstruction/ConceptDirectedPackageTwinV2.tsx')).not.toContain('authority-ghost');
    expect(read('src/site00/components/reconstruction/ConceptDirectedPackageTwinV2.tsx')).not.toContain('slot-image');
  });

  it('10–14 dom bindings + progress/metrics/activity DOM', () => {
    const session = approvedSession();
    const pkg = Object.values(session.conceptGallery!.packages)[0];
    const dom = buildDomFirstTranslation({ pkg, pageIntent: session.pageIntent, functionGraph: session.functionGraph });
    expect(dom.domBindings.every((b) => b.renderPrimitive !== 'IMAGE_ASSET' || b.assetSlotId)).toBe(true);
    expect(dom.domRealityReceipt.liveProgressPrimitive).toBe(true);
    expect(dom.domRealityReceipt.liveMetricsPrimitive).toBe(true);
    expect(dom.domRealityReceipt.liveActivityPrimitive).toBe(true);
    expect(dom.sourceTranslationReceipt.authorityCropCount).toBe(0);
  });

  it('15–18 image slot purity + no full authority in DOM renderer', () => {
    const fail = imageSlotPurityGuard({
      slotId: 'x',
      objectId: 'full_page',
      role: 'approved_visual_authority',
      assetType: 'image',
      visualDescription: '',
      sourceStrategy: 'GENERATED_CONCEPT_ASSET',
      sourceAsset: '/a.jpg',
      derivedAsset: null,
      generationRequired: false,
      crop: null,
      fit: 'cover',
      position: 'center',
      resolution: '375',
      status: 'RESOLVED',
    });
    expect(fail.pass).toBe(false);
    expect(read('src/site00/components/reconstruction/NdxTwinDomArtboard.tsx')).toContain('progressbar');
    expect(read('src/site00/components/reconstruction/NdxTwinDomArtboard.tsx')).toContain('site00-twin-v2-dom__nav-btn');
  });

  it('19–22 BUILD THIS CONCEPT uses visual compiler (v375); legacy path keeps DOM translation', () => {
    const session = approvedSession();
    const { sessionPatch } = composeConceptDirectedTwinV2(session);
    expect(sessionPatch.buildRef).toBe(P0_VR_TWIN_V24R1_BUILD);
    expect(sessionPatch.twinV2VisualCompiler?.strategyRoutingReceipt.resolvedStrategy).toBe(
      'VISUAL_TO_CODE_COMPILER',
    );
    expect(sessionPatch.twinV2VisualCompiler?.compilerInputReceipt.visualAuthorityAttached).toBe(true);

    const legacy = buildTwinV2FromPackage(session);
    expect(legacy.sessionPatch.buildRef).toBe(P0_VR_TWIN_V23R1_BUILD);
    expect(legacy.sessionPatch.twinV2DomTranslation?.sourceTranslationReceipt.status).toBe('PASS');
    expect(legacy.sessionPatch.twinV2DomTranslation?.expandedObjects.length).toBeGreaterThan(30);
  });

  it('23–29 lineage retained, V1/live untouched, PASS build', () => {
    let session = approvedSession();
    session = {
      ...session,
      renderedTwin: {
        renderMode: 'TWIN_V2_PACKAGE_DRIVEN_NDX_OVERVIEW',
        componentRef: 'ConceptDirectedPackageTwinV2',
        builtAt: new Date().toISOString(),
        sourcePackageId: Object.values(session.conceptGallery!.packages)[0].packageId,
        sourceConceptId: session.conceptGallery!.activeConceptId!,
        sourceBlueprintId: 'bp',
        buildMode: 'PACKAGE_DRIVEN_SOURCE_GENERATION',
      },
    };
    const { sessionPatch } = composeConceptDirectedTwinV2(session);
    expect(sessionPatch.twinV2BuildHistory?.some((h) => h.status === 'FAILED_WRONG_IMPLEMENTATION_STRATEGY')).toBe(
      true,
    );
    expect(sessionPatch.twinV2Execution?.lineage.executablePackageId).toBeDefined();
    expect(assertV1Isolation().v1PipelineUntouched).toBe(true);
  });
});
