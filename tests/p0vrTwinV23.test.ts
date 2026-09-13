/**
 * P0.VR.TWINV2.3 — Execution lineage + package-driven builder.
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
import {
  ensureConceptGallery,
  getActiveConceptCandidate,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import {
  P0_VR_TWIN_V23R1_BUILD,
  DEFAULT_TWIN_V2_BUILD_POLICY,
  buildTwinV2FromPackage,
  buildTwinV2,
  traceActiveApprovedConceptLineage,
  validateExecutableConceptPackage,
  buildExecutablePackageAttachmentReceipt,
  assertTwinV2RenderMatchesApprovedLineage,
  assertNoGhostedAuthorityImageInSource,
  getBuilderEntryPointTrace,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV23/index.js';
import { P0_VR_TWIN_V23R1_BUILD as V23R1_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV23R1/constants.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function approvedSession() {
  let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'v23-1' });
  session = mergeVisualConceptApiResult(session, {
    action: 'generate',
    imageUrl: '/concept-v23.jpg',
    imageStorageRef: 'ref-v23',
  });
  session = approveActiveConceptCandidate(ensureConceptGallery(session));
  return prepareConceptDirectedTwinV2Build(session);
}

describe('P0.VR.TWINV2.3 package-driven builder', () => {
  it('1–3 lineage trace + concept/package ID consistency', () => {
    const session = approvedSession();
    const trace = traceActiveApprovedConceptLineage(session);
    const active = getActiveConceptCandidate(session)!;
    expect(trace.lineageConsistent).toBe(true);
    expect(trace.activeConceptId).toBe(active.conceptId);
    expect(trace.executablePackageId).toBe(`ecp-${active.conceptId}`);
  });

  it('4–5 attachment receipt + package validation', () => {
    const session = approvedSession();
    const pkg = Object.values(session.conceptGallery!.packages)[0];
    const validation = validateExecutableConceptPackage(pkg);
    expect(validation.ok).toBe(true);
    const receipt = buildExecutablePackageAttachmentReceipt(pkg, pkg.packageId);
    expect(receipt.status).toBe('PASS');
    expect(receipt.visualAttached && receipt.blueprintAttached).toBe(true);
  });

  it('6–8 builder requires package; no page-intent-only compose', () => {
    expect(getBuilderEntryPointTrace().inputType).toBe('ExecutableConceptPackage');
    expect(getBuilderEntryPointTrace().fallbacksAvailable).toEqual([]);
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/conceptDirectedTwinV2Composer.ts')).toContain(
      'composeConceptDirectedTwinV2FromPackage',
    );
    const bare = approvedSession();
    bare.conceptGallery = { ...bare.conceptGallery!, packages: {} };
    expect(() => composeConceptDirectedTwinV2(bare)).toThrow(/ExecutableConceptPackage/);
  });

  it('9–11 incomplete package fails closed; build policy', () => {
    expect(DEFAULT_TWIN_V2_BUILD_POLICY.requiresExecutablePackage).toBe(true);
    expect(DEFAULT_TWIN_V2_BUILD_POLICY.allowsSemanticFallback).toBe(false);
    const session = approvedSession();
    const pkg = { ...Object.values(session.conceptGallery!.packages)[0], hostShellContract: undefined };
    const v = validateExecutableConceptPackage(pkg);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.code).toBe('TWIN_V2_EXECUTABLE_PACKAGE_INCOMPLETE');
  });

  it('12–15 build produces source + object coverage + package renderer', () => {
    const session = approvedSession();
    const { sessionPatch, artifacts } = buildTwinV2FromPackage(session);
    expect(sessionPatch.renderedTwin?.componentRef).toBe('ConceptDirectedPackageTwinV2');
    expect(sessionPatch.renderedTwin?.buildMode).toBe('PACKAGE_DRIVEN_SOURCE_GENERATION');
    expect(artifacts.sourceGenerationReceipt.fallbackUsed).toBe(false);
    expect(artifacts.objectCoverage.blueprintObjectCount).toBeGreaterThan(0);
    expect(read('src/site00/components/reconstruction/NdxTwinDomArtboard.tsx')).not.toContain('authority-ghost');
  });

  it('16–19 typography/colors/assets/functions from package sources', () => {
    const domRenderer = read('src/site00/components/reconstruction/NdxTwinDomArtboard.tsx');
    expect(domRenderer).toContain('blueprint.typography');
    expect(domRenderer).toContain('functionGraph');
    expect(read('src/site00/components/reconstruction/ConceptDirectedPackageTwinV2.tsx')).toContain(
      'buildDomFirstTranslation',
    );
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV23R1/sectionTemplates.ts')).toContain(
      'functionBindingId',
    );
  });

  it('20–23 PACKAGE_DRIVEN mode, provenance, render receipt, lineage assert', () => {
    const session = approvedSession();
    const { sessionPatch, artifacts } = buildTwinV2FromPackage(session);
    const merged = { ...session, ...sessionPatch };
    const active = getActiveConceptCandidate(session)!;
    const assert = assertTwinV2RenderMatchesApprovedLineage({
      session: merged,
      approvedConcept: active,
      packageId: artifacts.lineage.executablePackageId,
      blueprintId: artifacts.lineage.executionBlueprintId,
    });
    expect(assert.pass).toBe(true);
    expect(artifacts.renderReceipt.packageId).toBe(artifacts.lineage.executablePackageId);
    expect(artifacts.sourceProvenance[0].packageId).toBe(artifacts.lineage.executablePackageId);
  });

  it('24–26 fidelity receipt + generic/ghost guards', () => {
    assertNoGhostedAuthorityImageInSource(read('src/site00/components/reconstruction/ConceptDirectedPackageTwinV2.tsx'));
    const session = approvedSession();
    const { artifacts } = buildTwinV2FromPackage(session);
    expect(artifacts.fidelityReceipt.status).not.toBe('PENDING');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/composeFromExecutablePackage.ts')).toContain(
      'buildTwinV2FromPackage',
    );
  });

  it('27–29 bad twin history + V1/live untouched', () => {
    let session = approvedSession();
    session = {
      ...session,
      renderedTwin: {
        renderMode: 'TWIN_V2_CONCEPT_DIRECTED_NDX_OVERVIEW',
        componentRef: 'ConceptDirectedNdxOverviewTwinV2',
        builtAt: new Date().toISOString(),
      },
    };
    const { sessionPatch } = buildTwinV2FromPackage(session);
    expect(sessionPatch.twinV2BuildHistory?.some((h) => h.status === 'FAILED_PACKAGE_LINEAGE')).toBe(true);
    expect(assertV1Isolation().v1PipelineUntouched).toBe(true);
    expect(read('src/site00/components/reconstruction/ConceptDirectedNdxOverviewTwinV2.tsx')).not.toContain('promoteTwinToLive');
  });

  it('30 buildTwinV2({ package }) API + PASS build', () => {
    const session = approvedSession();
    const pkg = Object.values(session.conceptGallery!.packages)[0];
    const result = buildTwinV2({ package: pkg, session });
    expect(result.sessionPatch.buildRef).toBe(V23R1_BUILD);
    expect(result.artifacts.buildMode).toBe('PACKAGE_DRIVEN_SOURCE_GENERATION');
    const { sessionPatch } = composeConceptDirectedTwinV2(session);
    expect(sessionPatch.twinV2Execution?.buildStage).toBe('COMPLETE');
  });

  it('UI: execution lineage + build stages', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageConceptDirectedTwinV2Experience.tsx')).toContain(
      'EXECUTION LINEAGE',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/PageConceptDirectedTwinV2Experience.tsx')).toContain(
      'PACKAGE',
    );
  });
});
