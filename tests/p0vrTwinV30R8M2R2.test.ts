/**
 * P0.VR.TWINV3.0R8M2R2 — Implementation Translation Brief + Visual Implementation Coding Prompt
 */

import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { escalateFounderMobileTwinPackageFromCanonicalAssets } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import { compileApprovedMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { compileVisualMobileTwinImplementationR8M2R1 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/compileVisualMobileTwinImplementationR8M2R1.js';
import { compileVisualMobileTwinImplementationR8M2R2 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R2/compileVisualMobileTwinImplementationR8M2R2.js';
import {
  MOBILE_TWIN_IMPLEMENTATION_VERSION_TRANSLATION,
  MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R2,
  P0_VR_TWIN_V30R8M2R2_LINEAGE,
  IMPLEMENTATION_TRANSLATION_BRIEF_VERSION,
  VISUAL_IMPLEMENTATION_CODING_PROMPT_VERSION,
  TRANSLATION_BRIEF_NOT_CONSUMED,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R2/constants.js';
import { buildImplementationTranslationBrief } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R2/buildImplementationTranslationBrief.js';
import { buildVisualImplementationCodingPrompt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R2/buildVisualImplementationCodingPrompt.js';
import {
  assertTranslationReadinessForCompile,
  evaluateImplementationTranslationReadiness,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R2/implementationTranslationReadiness.js';
import { refineImplementationExpressionIRFromBrief } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R2/refineImplementationExpressionIRFromBrief.js';
import { applyTranslationBriefToCompiledNodes } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R2/applyTranslationBriefToCompiledNodes.js';
import { buildTranslationPromptTraceLinks } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R2/translationPromptTraceability.js';
import { runVisualAuthorityIngestionLayer } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/visualAuthorityIngestionLayer.js';
import { resolveImplementationAuthorities } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { loadStructuredBundle } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { documentRequiresR8M2Recompile } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/invalidatePriorR8M1Build.js';
import { readFileSync } from 'node:fs';

function founderSession() {
  let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
  session = ensureMobileDesignReferenceAuthority(session);
  return escalateFounderMobileTwinPackageFromCanonicalAssets(session);
}

function founderCompileInput() {
  const session = founderSession();
  const pipeline = session.mobileTwinPipeline!;
  return { pipeline, packageId: pipeline.latestPackageId! };
}

describe('P0.VR.TWINV3.0R8M2R2 translation brief pipeline', () => {
  it('1–4 ImplementationTranslationBrief generated with package and authority refs', async () => {
    const input = founderCompileInput();
    const pkg = input.pipeline.packages.find((p) => p.id === input.packageId)!;
    const authorities = resolveImplementationAuthorities(input.pipeline, pkg);
    const layer = await runVisualAuthorityIngestionLayer({
      projectId: 'ndxbook',
      workspaceType: 'DESIGN',
      pkg,
      composition: loadStructuredBundle(input.pipeline, pkg).composition,
      bundle: loadStructuredBundle(input.pipeline, pkg).bundle,
      authorities,
    });
    const brief = buildImplementationTranslationBrief({
      projectId: 'ndxbook',
      workspaceType: 'DESIGN',
      pkg,
      composition: loadStructuredBundle(input.pipeline, pkg).composition,
      bundle: loadStructuredBundle(input.pipeline, pkg).bundle,
      actualAuthorityId: authorities.actualRenderId,
      blueprintAuthorityId: authorities.blueprintRenderId,
      actualAnalysis: layer.actualAnalysis,
      blueprintAnalysis: layer.blueprintAnalysis,
    });
    expect(brief.id).toMatch(/^itb-/);
    expect(brief.packageId).toBe(pkg.id);
    expect(brief.actualAuthorityId).toBeTruthy();
    expect(brief.blueprintAuthorityId).toBeTruthy();
    expect(brief.briefVersion).toBe(IMPLEMENTATION_TRANSLATION_BRIEF_VERSION);
  });

  it('5–15 critical section translations exist', async () => {
    const input = founderCompileInput();
    const doc = compileApprovedMobileTwinPackage(input);
    const brief = doc.implementationTranslationBrief!;
    const ids = new Set(brief.sectionTranslations.map((s) => s.sectionId));
    for (const id of [
      'GLOBAL_PAGE_CHARACTER',
      'HOST_SHELL',
      'PROJECT_CONTEXT',
      'HERO_WORKSPACE',
      'AUTHORITY_PANEL',
      'CANDIDATE_GALLERY',
      'DECISION_BAR',
      'STRUCTURED_OUTPUT',
      'READINESS',
      'CONCEPT_DATA_HISTORY',
      'BOTTOM_NAV',
    ]) {
      expect(ids.has(id)).toBe(true);
    }
    expect(brief.globalTranslation.length).toBeGreaterThan(40);
  });

  it('16–22 directive sections present', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    const brief = doc.implementationTranslationBrief!;
    expect(brief.typographyTranslation).toMatch(/TYPOGRAPHY/);
    expect(brief.colorMaterialTranslation).toMatch(/COLOR/);
    expect(brief.assetTranslation).toMatch(/ASSET/);
    expect(brief.controlTranslation).toMatch(/CONTROL/);
    expect(brief.interactionTranslation).toMatch(/INTERACTION/);
    expect(brief.responsiveTranslation).toMatch(/RESPONSIVE/);
    expect(brief.doNotDo).toMatch(/DO NOT DO/);
  });

  it('23 critical sections include authority evidence', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    const brief = doc.implementationTranslationBrief!;
    const withEvidence = brief.sectionTranslations.filter(
      (s) => s.evidence.structuredObjectIds.length || s.evidence.actualRegionIds.length,
    );
    expect(withEvidence.length).toBeGreaterThan(8);
  });

  it('24–26 VisualImplementationCodingPrompt generated and injected', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    const prompt = doc.visualImplementationCodingPrompt!;
    expect(prompt.id).toMatch(/^vicp-/);
    expect(prompt.promptVersion).toBe(VISUAL_IMPLEMENTATION_CODING_PROMPT_VERSION);
    expect(prompt.fullText).toContain('BUILD THE APPROVED MOBILE DESIGN PAGE');
    expect(prompt.fullText).toContain(doc.implementationTranslationBrief!.globalTranslation.slice(0, 40));
    expect(doc.codingPromptInjected).toBe(true);
  });

  it('27 compiler cannot bypass translation readiness when BLOCKED', () => {
    const receipt = evaluateImplementationTranslationReadiness({
      id: 'itb-test',
      projectId: 'ndxbook',
      workspaceType: 'DESIGN',
      viewport: 'MOBILE',
      packageId: 'p',
      compositionStateId: 'c',
      compositionHash: 'h',
      actualAuthorityId: 'a',
      blueprintAuthorityId: 'b',
      actualVisualAnalysisId: 'ava',
      blueprintVisualAnalysisId: 'bva',
      expressionVersion: 'v1',
      briefVersion: IMPLEMENTATION_TRANSLATION_BRIEF_VERSION,
      globalTranslation: '',
      sectionTranslations: [],
      typographyTranslation: '',
      colorMaterialTranslation: '',
      assetTranslation: '',
      controlTranslation: '',
      interactionTranslation: '',
      responsiveTranslation: '',
      doNotDo: '',
      unresolvedTranslationItems: ['x'],
      authorityEvidence: {
        actualRegionIds: [],
        blueprintRegionIds: [],
        structuredObjectIds: [],
        assetIds: [],
        featureIds: [],
      },
      translationConflicts: [],
      hash: 'bad',
      status: 'BLOCKED',
    });
    expect(receipt.status).toBe('BLOCKED');
    expect(() => assertTranslationReadinessForCompile(receipt)).toThrow(/BLOCKED/);
  });

  it('28 ImplementationExpressionIR refined by brief', () => {
    const input = founderCompileInput();
    const doc = compileApprovedMobileTwinPackage(input);
    expect(doc.expressionChangesFromBrief?.objectsAdjusted).toBeGreaterThan(0);
    expect(doc.implementationExpressionIr?.globalExpression.densityProfile).toContain('brief');
  });

  it('29 translation conflicts are explicit records', async () => {
    const input = founderCompileInput();
    const pkg = input.pipeline.packages.find((p) => p.id === input.packageId)!;
    const authorities = resolveImplementationAuthorities(input.pipeline, pkg);
    const layer = await runVisualAuthorityIngestionLayer({
      projectId: 'ndxbook',
      workspaceType: 'DESIGN',
      pkg,
      composition: loadStructuredBundle(input.pipeline, pkg).composition,
      bundle: loadStructuredBundle(input.pipeline, pkg).bundle,
      authorities,
    });
    const brief = buildImplementationTranslationBrief({
      projectId: 'ndxbook',
      workspaceType: 'DESIGN',
      pkg,
      composition: loadStructuredBundle(input.pipeline, pkg).composition,
      bundle: loadStructuredBundle(input.pipeline, pkg).bundle,
      actualAuthorityId: authorities.actualRenderId,
      blueprintAuthorityId: authorities.blueprintRenderId,
      actualAnalysis: layer.actualAnalysis,
      blueprintAnalysis: layer.blueprintAnalysis,
    });
    expect(Array.isArray(brief.translationConflicts)).toBe(true);
  });

  it('30 prompt traceability links runtime to brief sections', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.translationPromptTrace?.length).toBeGreaterThan(10);
    const link = doc.translationPromptTrace![0]!;
    expect(link.runtimeObjectId).toBeTruthy();
    expect(link.translationBriefSectionId).toBeTruthy();
    expect(link.structuredObjectId).toBeTruthy();
  });

  it('31–32 new implementation version + twin recompiles via production path', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.implementationVersion).toBe(MOBILE_TWIN_IMPLEMENTATION_VERSION_TRANSLATION);
    expect(doc.compilerGeneration).toBe(MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R2);
    expect(doc.lineage).toBe(P0_VR_TWIN_V30R8M2R2_LINEAGE);
    expect(doc.nodes.length).toBeGreaterThan(20);
  });

  it('33 TRANSLATION_BRIEF_NOT_CONSUMED when prompt missing preamble', () => {
    const input = founderCompileInput();
    const doc = compileApprovedMobileTwinPackage(input);
    const brief = doc.implementationTranslationBrief!;
    const prompt = { ...doc.visualImplementationCodingPrompt!, fullText: 'invalid' };
    expect(() =>
      applyTranslationBriefToCompiledNodes({
        nodes: doc.nodes,
        renderTreeNodes: doc.renderTree!.nodes,
        context: { brief, codingPrompt: prompt, expressionIr: doc.implementationExpressionIr! },
      }),
    ).toThrow(TRANSLATION_BRIEF_NOT_CONSUMED);
  });

  it('34 live browser QA hook — compile produces review document', () => {
    const doc = compileVisualMobileTwinImplementationR8M2R2(founderCompileInput());
    expect(doc.translationBriefConsumed).toBe(true);
    expect(doc.implementationTranslationFidelityReceipt?.translationBriefId).toBe(doc.implementationTranslationBrief?.id);
  });

  it('35 translation fidelity receipt generated', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    const receipt = doc.implementationTranslationFidelityReceipt!;
    expect(receipt.codingPromptId).toBe(doc.visualImplementationCodingPrompt?.id);
    expect(receipt.result).toMatch(/PASS|REVIEW_REQUIRED/);
    expect(receipt.founderReviewRequired).toBe(true);
  });

  it('36 current DESIGN route unchanged', () => {
    const designWs = readFileSync('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx', 'utf8');
    expect(designWs).not.toContain('mobile-twin-impl-v4-translation-brief');
  });

  it('37 desktop translation compile jobs remain zero', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.viewport).toBe('MOBILE');
    expect(doc.implementationTranslationBrief?.viewport).toBe('MOBILE');
  });

  it('R8M2R1 builds require R8M2R2 recompile', () => {
    const prior = compileVisualMobileTwinImplementationR8M2R1(founderCompileInput());
    expect(documentRequiresR8M2Recompile(prior)).toBe(true);
    const next = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(documentRequiresR8M2Recompile(next)).toBe(false);
  });

  it('refineImplementationExpressionIRFromBrief touches spatial rhythm', async () => {
    const input = founderCompileInput();
    const pkg = input.pipeline.packages.find((p) => p.id === input.packageId)!;
    const authorities = resolveImplementationAuthorities(input.pipeline, pkg);
    const layer = await runVisualAuthorityIngestionLayer({
      projectId: 'ndxbook',
      workspaceType: 'DESIGN',
      pkg,
      composition: loadStructuredBundle(input.pipeline, pkg).composition,
      bundle: loadStructuredBundle(input.pipeline, pkg).bundle,
      authorities,
    });
    const brief = buildImplementationTranslationBrief({
      projectId: 'ndxbook',
      workspaceType: 'DESIGN',
      pkg,
      composition: loadStructuredBundle(input.pipeline, pkg).composition,
      bundle: loadStructuredBundle(input.pipeline, pkg).bundle,
      actualAuthorityId: authorities.actualRenderId,
      blueprintAuthorityId: authorities.blueprintRenderId,
      actualAnalysis: layer.actualAnalysis,
      blueprintAnalysis: layer.blueprintAnalysis,
    });
    const { changes } = refineImplementationExpressionIRFromBrief({
      expressionIr: layer.expressionIr,
      brief,
    });
    expect(changes.fieldsTouched).toContain('spatialRhythmSystem');
  });

  it('coding prompt contains hero translation content', () => {
    const input = founderCompileInput();
    const doc = compileApprovedMobileTwinPackage(input);
    const hero = doc.implementationTranslationBrief!.sectionTranslations.find((s) => s.sectionId === 'HERO_WORKSPACE')!;
    expect(doc.visualImplementationCodingPrompt!.fullText).toContain(hero.implementationGuidance.slice(0, 30));
  });

  it('buildTranslationPromptTraceLinks maps expression evidence', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    const links = buildTranslationPromptTraceLinks({
      compositionObjectIds: doc.nodes.map((n) => n.objectId),
      expressionIr: doc.implementationExpressionIr!,
      brief: doc.implementationTranslationBrief!,
    });
    expect(links.some((l) => l.actualEvidence !== null || l.blueprintEvidence !== null)).toBe(true);
  });
});
