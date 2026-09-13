/**
 * P0.VR.TWINV2.1 — Concept-directed Twin V2 parallel pipeline.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { site00ClientApiUrl } from '../shared/site00-studio-world-production/site00ClientApiBase.js';
import {
  P0_VR_TWIN_V21_BUILD,
  DEFAULT_TWIN_GENERATION_MODE,
  resolveTwinGenerationMode,
  isConceptDirectedV2,
  createConceptDirectedTwinSession,
  buildNdxOverviewPageIntent,
  buildNdxOverviewFunctionGraph,
  buildNdxCreativeBrandContext,
  extractBlueprintGrammarFromForensicNdx,
  runPageCreativeDirector,
  buildVisualModelInputPackage,
  buildVisualConceptPrompt,
  mergeVisualConceptApiResult,
  applyApproveVisualConcept,
  composeConceptDirectedTwinV2,
  buildTwinV2PreviewRoute,
  assertV1Isolation,
  isTwinV2PilotEligible,
  approveActiveConceptCandidate,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.TWINV2.1 concept-directed twin V2', () => {
  it('1. TwinGenerationMode defaults to forensic V1', () => {
    expect(DEFAULT_TWIN_GENERATION_MODE).toBe('FORENSIC_REPLICATION_V1');
    expect(resolveTwinGenerationMode(null)).toBe('FORENSIC_REPLICATION_V1');
    expect(isConceptDirectedV2('CONCEPT_DIRECTED_V2')).toBe(true);
  });

  it('2. V1 isolation — separate storage and no shell-first edits', () => {
    const iso = assertV1Isolation();
    expect(iso.v1PipelineUntouched).toBe(true);
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/executeShellFirstNdxReplication.ts')).not.toContain(
      'p0vrTwinV21',
    );
    expect(read('src/site00/components/reconstruction/ForensicBlueprintNdxOverviewTwin.tsx')).not.toContain('ConceptDirected');
  });

  it('3–7. session intent function brand grammar direction', () => {
    const session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'ndxbook:/projects/ndxbook/overview' });
    expect(session.generationMode).toBe('CONCEPT_DIRECTED_V2');
    expect(session.pageIntent.primaryUser).toBe('FOUNDER');
    expect(session.functionGraph.routes.some((r) => r.includes('ndxbook'))).toBe(true);
    expect(session.brandContext.colorLanguage.join(' ')).toMatch(/lime|black|white/i);
    expect(session.blueprintGrammar.informationBands.length).toBeGreaterThan(3);
    expect(session.creativeDirection?.creativePremise).toMatch(/NDXBOOK/i);
    expect(session.status).toBe('TWIN_V2_DIRECTION_READY');
  });

  it('8. PageCreativeDirector standalone', () => {
    const dir = runPageCreativeDirector({
      pageIntent: buildNdxOverviewPageIntent(),
      functionGraph: buildNdxOverviewFunctionGraph(),
      brandContext: buildNdxCreativeBrandContext(),
      blueprintGrammar: extractBlueprintGrammarFromForensicNdx(),
    });
    expect(dir.constraints.join(' ')).toMatch(/dashboard|SaaS/i);
  });

  it('9–10. visual model input package and prompt policy', () => {
    const session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview' });
    const pkg = buildVisualModelInputPackage(session);
    expect(pkg.model).toBe('openai/gpt-image-2');
    const prompt = buildVisualConceptPrompt({
      ...pkg,
      creativeDirection: session.creativeDirection!,
    });
    expect(prompt).toMatch(/NOT a screenshot recreation/);
    expect(prompt).not.toMatch(/MAKE SOMETHING SIMILAR/);
  });

  it('11–16. founder visual flow approve regenerate refine history', () => {
    let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'p1', sessionId: 's1' });
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/assets/concept-a.jpg',
      imageStorageRef: null,
    });
    expect(session.history[0].label).toMatch(/CONCEPT/);
    expect(session.sourceGeneration.codeAllowed).toBe(false);
    session = mergeVisualConceptApiResult(session, {
      action: 'regenerate',
      imageUrl: '/assets/concept-b.jpg',
      imageStorageRef: null,
    });
    expect(session.history.length).toBe(2);
    const approvedId = session.history[1].versionId;
    session = applyApproveVisualConcept(session, approvedId);
    expect(session.approvedVisualAuthority?.versionId).toBe(approvedId);
    expect(session.sourceGeneration.codeAllowed).toBe(true);
    expect(session.history.find((h) => h.versionId === approvedId)?.status).toBe('APPROVED');
  });

  it('17. no code before approval', () => {
    const session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'p2' });
    expect(() => composeConceptDirectedTwinV2(session)).toThrow(/CODE_BLOCKED/);
  });

  it('18–21. build after approval composer route function binding', () => {
    let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'p3', sessionId: 'sess-build' });
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/c.jpg',
      imageStorageRef: null,
    });
    session = approveActiveConceptCandidate(session);
    const { sessionPatch, functionBindingSummary } = composeConceptDirectedTwinV2(session);
    expect(sessionPatch.renderedTwin?.componentRef).toBe('ConceptVisualCompilerTwinV2');
    expect(sessionPatch.renderedTwin?.buildMode).toBe('VISUAL_TO_CODE_COMPILER');
    expect(functionBindingSummary.length).toBeGreaterThan(0);
    expect(buildTwinV2PreviewRoute('ndxbook', 'sess-build')).toBe('/projects/ndxbook/debug/twin-v2/sess-build');
    const slashy = 'twin-v2-ndxbook-ndxbook:/projects/ndxbook-1789263564104';
    expect(buildTwinV2PreviewRoute('ndxbook', slashy)).toBe(
      `/projects/ndxbook/debug/twin-v2/${encodeURIComponent(slashy)}`,
    );
    expect(buildTwinV2PreviewRoute('ndxbook', slashy)).not.toContain('/projects/ndxbook-1789263564104');
  });

  it('22–24. UI route comparison fidelity receipt', () => {
    expect(read('src/site00/config/routes.ts')).toContain('projectTwinV2Concept');
    expect(read('src/site00/components/designWorkspace/pageFamily/PageUpgradeReplicationExperience.tsx')).toContain('CREATE TWIN V2');
    expect(read('src/site00/components/designWorkspace/pageFamily/PageConceptDirectedTwinV2Experience.tsx')).toContain('APPROVE');
    expect(read('src/site00/components/designWorkspace/pageFamily/ConceptDirectedTwinGallery.tsx')).toContain('TWIN V2 — CONCEPTS');
    expect(read('api/site00/twin-v2-visual-concept.ts')).toContain('gpt-image-2');
  });

  it('25–26. no live mutation no V1 mutation in V2 module', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/conceptDirectedTwinV2Composer.ts')).not.toContain(
      'promoteTwinToLive',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx')).toContain('twinV2Open');
  });

  it('27. spend guard on API and client', () => {
    expect(read('api/site00/twin-v2-visual-concept.ts')).toContain('founderConfirmedSpend');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/requestTwinV2VisualConcept.ts')).toContain(
      'founderConfirmedSpend: true',
    );
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/requestTwinV2VisualConcept.ts')).toContain(
      'site00ClientApiUrl',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/PageConceptDirectedTwinV2Experience.tsx')).toContain('Confirm spend');
  });

  it('visual concept fetch omits credentials (CORS-safe cross-origin)', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/requestTwinV2VisualConcept.ts')).toContain(
      "credentials: 'omit'",
    );
    expect(read('api/site00/twin-v2-visual-concept.ts')).toContain('FAL_KEY_MISSING');
    expect(read('api/site00/twin-v2-visual-concept.ts')).toContain("const { fal } = await import('@fal-ai/client')");
  });

  it('visual concept API uses Railway on fsbw-dev when VITE_API_BASE empty', () => {
    const prev = globalThis.window;
    // @ts-expect-error test shim
    globalThis.window = { location: { hostname: '00.fsbw-dev.com', origin: 'https://00.fsbw-dev.com' } };
    try {
      expect(site00ClientApiUrl('/api/site00/twin-v2-visual-concept')).toBe(
        'https://api.site00.com/api/site00/twin-v2-visual-concept',
      );
    } finally {
      globalThis.window = prev;
    }
  });

  it('28. build PASS ref', () => {
    expect(P0_VR_TWIN_V21_BUILD).toBe('v341');
  });

  it('pilot eligibility ndxbook overview mobile only', () => {
    expect(
      isTwinV2PilotEligible({
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook/overview',
        viewport: 'mobile',
        route: '/projects/ndxbook/overview',
      }),
    ).toBe(true);
    expect(
      isTwinV2PilotEligible({
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        viewport: 'mobile',
        route: '/projects/ndxbook',
        isRootOverview: true,
      }),
    ).toBe(true);
    expect(
      isTwinV2PilotEligible({
        projectId: 'other',
        pageId: 'x',
        viewport: 'mobile',
      }),
    ).toBe(false);
  });

  it('CREATE TWIN V2 visible on all replication experience states', () => {
    const src = read('src/site00/components/designWorkspace/pageFamily/PageUpgradeReplicationExperience.tsx');
    expect(src).toContain('site00-pur__twin-v2-entry--persistent');
    expect(src.indexOf('twinV2Entry')).toBeLessThan(src.indexOf('site00-pur__rail'));
  });
});
