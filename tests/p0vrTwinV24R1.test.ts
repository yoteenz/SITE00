/**
 * P0.VR.TWINV2.4R1 — Compiler route enforcement.
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
  resolveTwinV2ImplementationStrategy,
  assertVisualCompilerRoute,
  traceBuildThisConceptCallPath,
  P0_VR_TWIN_V24R1_BUILD,
  runConceptVisualToCodeCompiler,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV24R1/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function approvedSession() {
  let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'v24r1-1' });
  session = mergeVisualConceptApiResult(session, {
    action: 'generate',
    imageUrl: '/concept-v24.jpg',
    imageStorageRef: 'ref-v24',
  });
  session = approveActiveConceptCandidate(ensureConceptGallery(session));
  return prepareConceptDirectedTwinV2Build(session);
}

describe('P0.VR.TWINV2.4R1 compiler routing', () => {
  it('1–3 BUILD call path + strategy resolver', () => {
    const path = traceBuildThisConceptCallPath();
    expect(path.steps[0]).toBe('BUILD THIS CONCEPT');
    expect(path.steps).toContain('buildTwinV2ViaVisualCompiler');
    expect(path.steps).toContain('ConceptVisualCompilerTwinV2 (render mount)');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/composeFromExecutablePackage.ts')).toContain(
      'buildTwinV2ViaVisualCompiler',
    );
    const session = approvedSession();
    const active = session.conceptGallery!.candidates.find((c) => c.conceptId === session.conceptGallery!.activeConceptId)!;
    const strategy = resolveTwinV2ImplementationStrategy({
      conceptId: active.conceptId,
      approvalStatus: active.founderJudgment,
      executionPackageId: `ecp-${active.conceptId}`,
      visualAuthorityId: active.conceptId,
    });
    expect(strategy).toBe('VISUAL_TO_CODE_COMPILER');
  });

  it('4–8 old renderer bypass + assertVisualCompilerRoute', () => {
    expect(read('src/site00/components/reconstruction/resolveConceptDirectedTwinV2Renderer.tsx')).toContain(
      'ConceptVisualCompilerTwinV2',
    );
    expect(read('src/site00/components/reconstruction/resolveConceptDirectedTwinV2Renderer.tsx')).not.toContain(
      'ConceptDirectedPackageTwinV2',
    );
    assertVisualCompilerRoute({
      buildAction: 'BUILD_THIS_CONCEPT',
      resolvedStrategy: 'VISUAL_TO_CODE_COMPILER',
      compilerInvoked: true,
      oldRendererInvoked: false,
      fallbackUsed: false,
      visualAuthorityAttached: true,
      compilerRunId: 'test',
      sourceGenerationId: 'src-test',
      renderTwinId: 'twin-test',
      status: 'PASS',
    });
  });

  it('9–14 visual authority + compiler receipts on build', () => {
    const session = approvedSession();
    const pkg = Object.values(session.conceptGallery!.packages)[0];
    const active = session.conceptGallery!.candidates.find((c) => c.conceptId === session.conceptGallery!.activeConceptId)!;
    const artifacts = runConceptVisualToCodeCompiler({ session, pkg, active });
    expect(artifacts.compilerInputReceipt.visualAuthorityAttached).toBe(true);
    expect(artifacts.imageInputAudit.imageAnalysisPerformed).toBe(true);
    expect(artifacts.compilerOutputAudit.regionsDetected).toBeGreaterThan(0);
    expect(artifacts.visualImplementationPlan.planId).toMatch(/^vip-/);
  });

  it('15–20 compose uses compiler + v375 + no PACKAGE_DRIVEN mode', () => {
    const session = approvedSession();
    const { sessionPatch } = composeConceptDirectedTwinV2(session);
    expect(sessionPatch.buildRef).toBe(P0_VR_TWIN_V24R1_BUILD);
    expect(sessionPatch.renderedTwin?.buildMode).toBe('VISUAL_TO_CODE_COMPILER');
    expect(sessionPatch.renderedTwin?.componentRef).toBe('ConceptVisualCompilerTwinV2');
    expect(sessionPatch.renderedTwin?.buildMode).not.toBe('PACKAGE_DRIVEN_SOURCE_GENERATION');
    expect(sessionPatch.twinV2VisualCompiler?.strategyRoutingReceipt.oldRendererInvoked).toBe(false);
  });

  it('21–24 v374 invalidation + UI + isolation', () => {
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
    expect(sessionPatch.twinV2BuildHistory?.some((h) => h.status === 'FAILED_WRONG_IMPLEMENTATION_STRATEGY')).toBe(true);
    expect(read('src/site00/components/designWorkspace/pageFamily/PageConceptDirectedTwinV2Experience.tsx')).toContain(
      'VISUAL_TO_CODE_COMPILER',
    );
    expect(assertV1Isolation().v1PipelineUntouched).toBe(true);
  });
});
