import { describe, expect, it } from 'vitest';
import { runGreenfieldMap2Pipeline } from '../map2/map2Orchestrator';
import { bootstrapGreenfieldWorkspace, bootstrapSite00IngestWorkspace } from '../workspace/bootstrap';
import {
  compileMasterPackFiles,
  compileSonnetLitePackFiles,
  emitOpenArtManifest,
  emitSonnetBatch,
  evaluateSonnetBatchReadiness,
  ingestOpenArtManifest,
  orderIngestedByPlan,
  validatePackSize,
  sumPackBytes,
  LITE_BLOCK_MB,
  existingLocationCustomExperience,
  selectConcept,
  approveGraph,
  hybridizeConcept,
  pushConcept,
} from '../workspace/index';
import { applyReviewAction, createReviewFromPlan, combineReviews } from '../map2/authorityReview';

describe('MAP2 workspace bootstrap', () => {
  it('greenfield and site00 ingest modes', () => {
    const gf = bootstrapGreenfieldWorkspace('lumina-atelier');
    expect(gf.mode).toBe('GREENFIELD');
    expect(gf.pipeline.concept_set?.concepts).toHaveLength(3);
    const s00 = bootstrapSite00IngestWorkspace('site00');
    expect(s00.mode).toBe('INGEST');
    expect(s00.site00_authority_count).toBeGreaterThan(30);
    expect(s00.pipeline.graph?.custom_experiences.some((c) => c.name === 'Existing Location')).toBe(true);
  });
});

describe('concept workspace actions', () => {
  it('select, push, hybridize', () => {
    let s = bootstrapGreenfieldWorkspace('lumina-atelier');
    s = selectConcept(s, 'DIR_B_PRODUCT_LAB');
    expect(s.pipeline.gate_0.status).toBe('APPROVED');
    s = pushConcept(s, 'DIR_A_EDITORIAL_HOUSE', 'More immersive');
    s = hybridizeConcept(s, 'DIR_B_PRODUCT_LAB', 'DIR_C_IMMERSIVE_DESTINATION', ['SHOWROOM'], 'hybrid note');
    expect(s.pipeline.gate_0.hybrid?.resulting_concept_id).toBeTruthy();
  });
});

describe('OpenArt emit and ingest', () => {
  it('manifest emit and id-based ingest', () => {
    const pipeline = runGreenfieldMap2Pipeline();
    const { records } = emitOpenArtManifest(pipeline.intelligence!.project_id, pipeline.authority_plan);
    expect(records.length).toBeGreaterThan(0);
    const manifest = {
      batch_id: 'test',
      project_id: pipeline.intelligence!.project_id,
      entries: records.map((r) => ({
        authority_id: r.authority_id,
        candidate_id: `${r.authority_id}_c1`,
        generation_id: `g_${r.authority_id}`,
        family_id: r.family_id,
        surface: r.surface,
        version: 1,
        expected_filename: r.expected_filename,
        byte_length: 500_000,
      })),
    };
    const result = ingestOpenArtManifest(manifest, pipeline.authority_plan, []);
    expect(result.ok).toBe(true);
    const ordered = orderIngestedByPlan(pipeline.authority_plan, result.assets);
    expect(ordered[0].authority_id).toBe(pipeline.authority_plan[0].authority_id);
  });

  it('rejects invalid ingest', () => {
    const pipeline = runGreenfieldMap2Pipeline();
    const bad = ingestOpenArtManifest(
      { batch_id: 'x', project_id: 'p', entries: [{ authority_id: 'NOPE', candidate_id: 'c', generation_id: 'g', family_id: 'f', surface: 'MOBILE_WEB', version: 1, expected_filename: 'a.jpg', byte_length: 1 }] },
      pipeline.authority_plan,
      [],
    );
    expect(bad.ok).toBe(false);
  });
});

describe('authority pack and lite limit', () => {
  it('blocks pack over 30MB', () => {
    const pipeline = runGreenfieldMap2Pipeline();
    const assets = pipeline.authority_plan.map((p, i) => ({
      asset_id: `a${i}`,
      authority_id: p.authority_id,
      candidate_id: 'c',
      generation_id: 'g',
      family_id: p.family_id,
      surface: p.surface,
      version: 1,
      canonical_filename: `${i}.jpg`,
      byte_length: 8 * 1024 * 1024,
      storage_hint: '',
      superseded: false,
    }));
    const master = compileMasterPackFiles({
      project_id: 'p',
      graph: pipeline.graph!,
      families: pipeline.families,
      surfaces: pipeline.surface_expressions,
      plan: pipeline.authority_plan,
      assets,
      lineage: {},
    });
    const lite = compileSonnetLitePackFiles(master);
    const v = validatePackSize(sumPackBytes(lite));
    expect(v.level).toBe('block');
    expect(v.total_mb).toBeGreaterThan(LITE_BLOCK_MB);
  });
});

describe('Sonnet batch readiness', () => {
  it('blocked until ingest complete', () => {
    const pipeline = runGreenfieldMap2Pipeline();
    const r = evaluateSonnetBatchReadiness('b1', pipeline, [], true);
    expect(['WAITING_FOR_AUTHORITY', 'WAITING_FOR_INGEST']).toContain(r.status);
    const approvedPipeline = {
      ...pipeline,
      authority_plan: pipeline.authority_plan.map((a) => ({ ...a, approval_status: 'APPROVED' as const })),
      gate_c: { ...pipeline.gate_c, status: 'APPROVED' as const },
    };
    const ingested = pipeline.authority_plan.map((p, i) => ({
      asset_id: `a${i}`,
      authority_id: p.authority_id,
      candidate_id: 'c',
      generation_id: 'g',
      family_id: p.family_id,
      surface: p.surface,
      version: 1,
      canonical_filename: `${i}.jpg`,
      byte_length: 1000,
      storage_hint: '',
      superseded: false,
    }));
    const ready = evaluateSonnetBatchReadiness('b1', approvedPipeline, ingested, true);
    expect(ready.status).toBe('SONNET_READY');
  });

  it('emits json md and sprint', () => {
    const pipeline = runGreenfieldMap2Pipeline();
    const emit = emitSonnetBatch({
      batch_id: 'b1',
      project_id: 'p',
      mode: 'GREENFIELD',
      graph: pipeline.graph!,
      families: pipeline.families,
      plan: pipeline.authority_plan,
      pack_filename: 'lite.json',
      status: 'SONNET_READY',
    });
    expect(emit.markdown).toContain('Sonnet batch');
    expect(emit.sprint_prompt).toContain('SPRINT:');
  });
});

describe('authority review lineage', () => {
  it('combine preserves lineage', () => {
    const a = createReviewFromPlan({ authority_id: '01_X', surface: 'MOBILE_WEB' } as never, 1);
    const b = { ...a, candidate_id: 'other' };
    const combined = combineReviews(a, b);
    expect(combined.combined_from.length).toBe(2);
    applyReviewAction(a, 'APPROVED');
    expect(a.approved_at).toBeTruthy();
  });
});

describe('existing location unit', () => {
  it('registers custom experience', () => {
    const cx = existingLocationCustomExperience();
    expect(cx.inherits_from).toContain('REPAIR_WORKFLOW');
  });
});

describe('graph approval from workspace', () => {
  it('approves and compiles families', () => {
    let s = bootstrapGreenfieldWorkspace('lumina-atelier');
    if (s.pipeline.graph && !s.pipeline.graph.approved) {
      s = approveGraph(s);
    }
    expect(s.pipeline.families.length).toBeGreaterThan(0);
  });
});
