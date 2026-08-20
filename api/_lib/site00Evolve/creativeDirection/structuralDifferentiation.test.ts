import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  generateTerritories,
  buildComparison,
  specimenSetsAreDistinct,
  TERRITORY_SPECIMEN_SETS,
  COMMON_COMPARISON_ANCHORS,
} from './territories.js';
import { synthesizeCreativeBrief } from './intelligenceBrief.js';
import {
  resetCreativeDirectionMemory,
  getCreativeDirectionPayload,
  recordFounderDecision,
  queueFalGenerationJobs,
} from './engagementService.js';
import { resetEvolveStore } from '../memoryStore.js';
import { resetConnectionMemory } from '../providers/connectionService.js';
import { resetNdxbookImportMemory, runNdxbookLegacyImport } from '../providers/ndxbookLegacyImportService.js';
import { resetPage001Memory, getPage001Candidate } from '../providers/page001CandidateService.js';
import { orgIdFromSlug } from '../orgRegistry.js';
import { getContentBrainByOrgId } from '../storeAdapter.js';
import { isGlobalPublishingEnabled } from '../providers/publishingFence.js';

const INDEX_CATALOG_TYPES = [
  'brand_index_card',
  'page_catalog_system',
  'volume_registry',
  'cross_reference_map',
  'navigation_archive_strip',
  'graphic_language',
];

const EDITORIAL_TYPES = [
  'magazine_volume_opener',
  'feature_article_opener',
  'knowledge_page',
  'quote_insight_card',
  'article_sequence',
  'typography_spread',
];

const KINETIC_TYPES = [
  'motion_title_frame',
  'hook_frame_916',
  'motion_sequence_3frame',
  'page_number_transition',
  'volume_stinger',
  'signal_graphic',
  'dark_light_inversion',
];

describe('Creative Direction structural differentiation', () => {
  beforeEach(async () => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
    vi.stubEnv('EVOLVE_EXTERNAL_PUBLISHING_ENABLED', '');
    vi.stubEnv('FAL_KEY', '');
    resetEvolveStore();
    resetConnectionMemory();
    resetNdxbookImportMemory();
    resetPage001Memory();
    resetCreativeDirectionMemory();
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('1. Index Signal uses index_signal renderer', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    const t = payload.engagement.territories.find((x) => x.index === 1)!;
    expect(t.rendererKey).toBe('index_signal');
  });

  it('2. Editorial Utility uses editorial_utility renderer', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    const t = payload.engagement.territories.find((x) => x.index === 2)!;
    expect(t.rendererKey).toBe('editorial_utility');
  });

  it('3. Kinetic Field uses kinetic_field renderer', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    const t = payload.engagement.territories.find((x) => x.index === 3)!;
    expect(t.rendererKey).toBe('kinetic_field');
  });

  it('4. three territories do not resolve to the same renderer', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    const keys = payload.engagement.territories.map((t) => t.rendererKey);
    expect(new Set(keys).size).toBe(3);
  });

  it('5. territory specimen lists are not identical', () => {
    expect(specimenSetsAreDistinct()).toBe(true);
    expect(TERRITORY_SPECIMEN_SETS.index_signal.join()).not.toBe(TERRITORY_SPECIMEN_SETS.editorial_utility.join());
  });

  it('6. Index Signal includes index/catalog-native specimens', () => {
    for (const type of INDEX_CATALOG_TYPES) {
      expect(TERRITORY_SPECIMEN_SETS.index_signal).toContain(type);
    }
  });

  it('7. Editorial Utility includes editorial-native specimens', () => {
    for (const type of EDITORIAL_TYPES) {
      expect(TERRITORY_SPECIMEN_SETS.editorial_utility).toContain(type);
    }
  });

  it('8. Kinetic Field includes motion/storyboard-native specimens', () => {
    for (const type of KINETIC_TYPES) {
      expect(TERRITORY_SPECIMEN_SETS.kinetic_field).toContain(type);
    }
  });

  it('9. common anchor Page 001 exists in all three', () => {
    expect(TERRITORY_SPECIMEN_SETS.index_signal).toContain('page_001_indexed');
    expect(TERRITORY_SPECIMEN_SETS.editorial_utility).toContain('page_001_editorial');
    expect(TERRITORY_SPECIMEN_SETS.kinetic_field).toContain('page_001_kinetic');
    expect(COMMON_COMPARISON_ANCHORS).toEqual(expect.arrayContaining(['page_001_indexed', 'page_001_editorial', 'page_001_kinetic']));
  });

  it('10. Page 001 visual structure differs by territory (specimen type)', () => {
    const a = TERRITORY_SPECIMEN_SETS.index_signal.find((s) => s.startsWith('page_001'));
    const b = TERRITORY_SPECIMEN_SETS.editorial_utility.find((s) => s.startsWith('page_001'));
    const c = TERRITORY_SPECIMEN_SETS.kinetic_field.find((s) => s.startsWith('page_001'));
    expect(new Set([a, b, c]).size).toBe(3);
  });

  it('11. typography systems differ structurally', () => {
    expect(TERRITORY_SPECIMEN_SETS.index_signal).toContain('typography_system');
    expect(TERRITORY_SPECIMEN_SETS.editorial_utility).toContain('typography_spread');
    expect(TERRITORY_SPECIMEN_SETS.kinetic_field).toContain('typography_system');
    expect(TERRITORY_SPECIMEN_SETS.editorial_utility).not.toContain('graphic_language');
  });

  it('12. graphic-language systems differ structurally', () => {
    expect(TERRITORY_SPECIMEN_SETS.index_signal).toContain('graphic_language');
    expect(TERRITORY_SPECIMEN_SETS.kinetic_field).toContain('signal_graphic');
    expect(TERRITORY_SPECIMEN_SETS.editorial_utility).not.toContain('graphic_language');
    expect(TERRITORY_SPECIMEN_SETS.editorial_utility).not.toContain('signal_graphic');
  });

  it('13. motion systems differ structurally', () => {
    expect(TERRITORY_SPECIMEN_SETS.index_signal).toContain('motion_storyboard');
    expect(TERRITORY_SPECIMEN_SETS.kinetic_field).toContain('motion_sequence_3frame');
    expect(TERRITORY_SPECIMEN_SETS.kinetic_field).toContain('motion_storyboard');
    expect(TERRITORY_SPECIMEN_SETS.index_signal).not.toContain('motion_sequence_3frame');
  });

  it('14. volume system supports all five canonical volumes', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    const brief = payload.engagement.creativeBrief;
    const territories = generateTerritories(brief);
    for (const t of territories) {
      expect(t.crossVolumeBehavior).toBeTruthy();
      expect(JSON.stringify(t)).toMatch(/MONEY|five volume|5 volume|volume/i);
    }
    expect(TERRITORY_SPECIMEN_SETS.index_signal).toContain('volume_registry');
    expect(TERRITORY_SPECIMEN_SETS.editorial_utility).toContain('volume_color_system');
    expect(TERRITORY_SPECIMEN_SETS.kinetic_field).toContain('volume_stinger');
  });

  it('15. no territory auto-promotes to Visual DNA', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.visualDna.status).toBe('INCOMPLETE');
    for (const t of payload.engagement.territories) {
      expect(t.lifecycleState).toBe('PROPOSED');
    }
  });

  it('16. recommendation remains non-approval', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.comparison.evolveRecommendation.isApproval).toBe(false);
  });

  it('17. APPROVE remains explicit', async () => {
    let payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.visualDna.status).toBe('INCOMPLETE');
    await recordFounderDecision('ndxbook', {
      type: 'APPROVE',
      selectedTerritoryId: payload.engagement.territories[0].id,
      by: 'founder@test.com',
    });
    payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.visualDna.status).toBe('APPROVED');
  });

  it('18. REFINE persists founder notes', async () => {
    await recordFounderDecision('ndxbook', {
      type: 'REFINE',
      refinementNotes: 'More index density on archive strip',
      by: 'founder@test.com',
    });
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.founderDecision?.refinementNotes).toContain('archive strip');
    expect(payload.engagement.lifecycle_state).toBe('REVISION_REQUESTED');
  });

  it('19. HYBRIDIZE retains provenance from multiple territories', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    const t1 = payload.engagement.territories[0];
    const t2 = payload.engagement.territories[2];
    await recordFounderDecision('ndxbook', {
      type: 'HYBRIDIZE',
      selectedTerritoryId: t1.id,
      hybridSelections: [{ territoryId: t2.id, elements: ['motion', 'kinetic type'] }],
      refinementNotes: 'KEEP: index taxonomy · REMOVE: cold palette',
      by: 'founder@test.com',
    });
    const after = await getCreativeDirectionPayload('ndxbook');
    expect(after.engagement.founderDecision?.hybridSelections?.length).toBeGreaterThan(0);
    expect(after.engagement.visualDna.provenance.hybridContributions).toBeTruthy();
  });

  it('20. rejected lace-mastery intelligence remains excluded', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.legacyReference.laceMastery.status).toBe('REJECTED_MISATTRIBUTED');
    const entries = await getContentBrainByOrgId(orgIdFromSlug('ndxbook')!);
    const lace = entries.find((e) => (e.metadata as Record<string, unknown>)?.import_key === 'rejected.lace_mastery');
    expect(lace).toBeTruthy();
  });

  it('21. legacy indigo/slate remains reference-only', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.legacyReference.indigoSlate.promotedToCanon).toBe(false);
  });

  it('22. NDXBOOK canonical voice remains preserved', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.knownIntelligence.length).toBeGreaterThan(2);
    expect(payload.engagement.creativeBrief.provenance.source).toBe('CONTENT_BRAIN');
  });

  it('23. Page 001 remains NOT_APPROVED', () => {
    const candidate = getPage001Candidate('ndxbook');
    expect(candidate?.publicationApproval).toBe('NOT_APPROVED');
  });

  it('24. publishing remains DISABLED', () => {
    expect(isGlobalPublishingEnabled()).toBe(false);
  });

  it('25. no FAL requirement for structural specimen rendering', async () => {
    const result = await queueFalGenerationJobs('ndxbook');
    expect(result.skipped).toBe(true);
    const payload = await getCreativeDirectionPayload('ndxbook');
    for (const t of payload.engagement.territories) {
      for (const s of t.specimens) {
        expect(s.status).toBe('SPEC_RENDERED');
      }
    }
  });

  it('26–32. buildComparison and generateTerritories integrity', () => {
    const brief = synthesizeCreativeBrief('ndxbook', [], 5);
    const territories = generateTerritories(brief);
    const comparison = buildComparison(territories);
    expect(territories).toHaveLength(3);
    expect(comparison.dimensions.length).toBeGreaterThan(5);
    expect(comparison.evolveRecommendation.isApproval).toBe(false);
    for (const t of territories) {
      expect(t.specimens.length).toBeGreaterThanOrEqual(10);
      expect(t.specimens[0].renderSpec.rendererKey).toBe(t.rendererKey);
    }
  });
});
