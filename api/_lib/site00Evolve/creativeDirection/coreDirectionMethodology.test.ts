import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { resetEvolveStore } from '../memoryStore.js';
import { resetConnectionMemory } from '../providers/connectionService.js';
import { resetNdxbookImportMemory, runNdxbookLegacyImport } from '../providers/ndxbookLegacyImportService.js';
import { resetPage001Memory } from '../providers/page001CandidateService.js';
import {
  resetCreativeDirectionMemory,
  ensureCreativeDirectionEngagement,
  recordFounderDecision,
} from './engagementService.js';
import { extractCoreDna, allBranchesPassLineageTest } from './coreDirection.js';
import { NDXBOOK_CORE_DIRECTIONS, NDXBOOK_BRANCH_LINEAGE } from './coreDirectionDefinitions.js';
import { branchPassesLineageTest, coreDirectionGateStatus, expansionFreedomFor } from './types.js';
import type { CreativeTerritory } from './types.js';

/**
 * Validates the Core Direction Formation + Controlled Expansion methodology
 * (docs/site00/CORE_DIRECTION_METHODOLOGY.md) against the NDXBOOK validation
 * example — Stage A (Core Direction Board), the Founder Core-Direction Gate,
 * Stage B (Branch Lineage), and DNA extraction timing.
 */
describe('SITE 00 Core Direction Formation + Controlled Expansion methodology', () => {
  beforeEach(async () => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
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

  const rendererKeys = ['index_signal', 'editorial_utility', 'kinetic_field'] as const;

  it('1. every core direction has a fully populated Core Direction Board (§2)', () => {
    for (const key of rendererKeys) {
      const cd = NDXBOOK_CORE_DIRECTIONS[key];
      expect(cd.directionName.length).toBeGreaterThan(0);
      expect(cd.bigIdea.length).toBeGreaterThan(10);
      expect(cd.oneLineThesis.length).toBeGreaterThan(0);
      expect(cd.brandConnection.length).toBeGreaterThan(10);
      expect(cd.culturalReference.length).toBeGreaterThan(10);
      expect(cd.emotionalPromise.length).toBeGreaterThan(10);
      expect(cd.visualMetaphor.length).toBeGreaterThan(5);
      expect(cd.governingBehavior.length).toBeGreaterThan(5);
      expect(cd.materialImageryLanguage.length).toBeGreaterThan(10);
      expect(cd.typographicAttitude.length).toBeGreaterThan(10);
      expect(cd.coreColorLogic.length).toBeGreaterThan(10);
      expect(cd.signatureDevices.length).toBeGreaterThan(0);
      expect(cd.primaryBrandArtifact.length).toBeGreaterThan(10);
      expect(cd.proprietaryQuality.length).toBeGreaterThan(10);
      expect(cd.antiDirection.length).toBeGreaterThan(0);
    }
  });

  it('2. the three core directions are conceptually distinct, not palette variants of one idea (§2)', () => {
    const theses = rendererKeys.map((k) => NDXBOOK_CORE_DIRECTIONS[k].oneLineThesis);
    const behaviors = rendererKeys.map((k) => NDXBOOK_CORE_DIRECTIONS[k].governingBehavior);
    const metaphors = rendererKeys.map((k) => NDXBOOK_CORE_DIRECTIONS[k].visualMetaphor);
    expect(new Set(theses).size).toBe(3);
    expect(new Set(behaviors).size).toBe(3);
    expect(new Set(metaphors).size).toBe(3);
  });

  it('3. every core direction declares an explicit anti-direction (what it must never become)', () => {
    for (const key of rendererKeys) {
      expect(NDXBOOK_CORE_DIRECTIONS[key].antiDirection.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('4. every branch declaration passes the seven-question lineage test (§8)', () => {
    for (const key of rendererKeys) {
      const branches = NDXBOOK_BRANCH_LINEAGE[key];
      expect(branches.length).toBeGreaterThan(0);
      for (const branch of branches) {
        expect(branchPassesLineageTest(branch)).toBe(true);
      }
    }
  });

  it('5. Editorial Utility declares its nine approved editorial branches (§13)', () => {
    expect(NDXBOOK_BRANCH_LINEAGE.editorial_utility).toHaveLength(9);
  });

  it('6. Index Signal declares nine signal behaviors with its OWN logical structure, not a copy of Editorial Utility (§13)', () => {
    expect(NDXBOOK_BRANCH_LINEAGE.index_signal).toHaveLength(9);
    const editorialNames = new Set(NDXBOOK_BRANCH_LINEAGE.editorial_utility.map((b) => b.branchName));
    for (const branch of NDXBOOK_BRANCH_LINEAGE.index_signal) {
      expect(editorialNames.has(branch.branchName)).toBe(false);
    }
  });

  it('7. Kinetic Field declares ten motion-principle branches with its OWN logical structure (§13)', () => {
    expect(NDXBOOK_BRANCH_LINEAGE.kinetic_field).toHaveLength(10);
    for (const branch of NDXBOOK_BRANCH_LINEAGE.kinetic_field) {
      expect(branch.motionBehavior).toBeTruthy();
    }
  });

  it('8. every branch names how it differs from its siblings, not just a description of itself (§8 Q7)', () => {
    for (const key of rendererKeys) {
      for (const branch of NDXBOOK_BRANCH_LINEAGE[key]) {
        expect(branch.differentiation.length).toBeGreaterThan(15);
        expect(branch.coreLineage.length).toBeGreaterThan(15);
      }
    }
  });

  it('9. no territory is founder-approved by default — gate starts CORE_DIRECTION_PENDING (§5)', async () => {
    const engagement = await ensureCreativeDirectionEngagement('ndxbook');
    for (const territory of engagement.territories) {
      expect(coreDirectionGateStatus(territory.lifecycleState)).toBe('CORE_DIRECTION_PENDING');
    }
    expect(engagement.visualDna.status).toBe('INCOMPLETE');
    expect(engagement.visualDna.conceptDna).toBeNull();
  });

  it('10. expansion freedom is LOW before core approval, per the creative freedom model (§12)', async () => {
    const engagement = await ensureCreativeDirectionEngagement('ndxbook');
    for (const territory of engagement.territories) {
      const freedom = expansionFreedomFor(territory.lifecycleState);
      expect(freedom.level).toBe('LOW');
      expect(freedom.conceptDriftTolerance).toBe('LOW');
    }
  });

  it('11. every territory carries its own coreDirection + branchLineage end to end through the engagement (§6–7)', async () => {
    const engagement = await ensureCreativeDirectionEngagement('ndxbook');
    for (const territory of engagement.territories) {
      expect(territory.coreDirection).toBeTruthy();
      expect(territory.coreDirection.directionName).toBe(territory.name);
      expect(allBranchesPassLineageTest(territory)).toBe(true);
    }
  });

  it('12. Concept DNA is null until CORE_DIRECTION_APPROVED, then extracted from the Core Direction Board (§6)', async () => {
    const engagement = await ensureCreativeDirectionEngagement('ndxbook');
    const territoryId = engagement.territories[0].id;

    const approved = await recordFounderDecision('ndxbook', {
      type: 'APPROVE',
      selectedTerritoryId: territoryId,
      by: 'founder@test.com',
    });

    expect(coreDirectionGateStatus(approved.lifecycle_state)).toBe('CORE_DIRECTION_APPROVED');
    expect(approved.visualDna.status).toBe('APPROVED');
    expect(approved.visualDna.conceptDna).not.toBeNull();
    const dna = approved.visualDna.conceptDna!;
    expect(dna.conceptRules.length).toBeGreaterThan(0);
    expect(dna.visualRules.length).toBeGreaterThan(0);
    expect(dna.compositionRules.length).toBeGreaterThan(0);
    expect(dna.imageRules.length).toBeGreaterThan(0);
    expect(dna.materialRules.length).toBeGreaterThan(0);
    expect(dna.typographyRules.length).toBeGreaterThan(0);
    expect(dna.colorRules.length).toBeGreaterThan(0);
    expect(dna.motionRules.length).toBeGreaterThan(0);
    expect(dna.contentBehavior.length).toBeGreaterThan(0);
    expect(dna.signatureDevices.length).toBeGreaterThan(0);
    expect(dna.prohibitedDrift.length).toBeGreaterThan(0);

    const approvedTerritory = approved.territories.find((t) => t.id === territoryId)!;
    expect(expansionFreedomFor(approvedTerritory.lifecycleState).level).toBe('HIGH');
  });

  it('13. extractCoreDna is a pure function of the territory\u2019s own Core Direction Board + lineage-tested branches', async () => {
    const engagement = await ensureCreativeDirectionEngagement('ndxbook');
    const territory: CreativeTerritory = engagement.territories[1];
    const dna = extractCoreDna(territory);
    expect(dna.prohibitedDrift).toEqual(territory.coreDirection.antiDirection);
    expect(dna.signatureDevices).toEqual(
      expect.arrayContaining(territory.coreDirection.signatureDevices),
    );
  });

  it('14. REFINE/REJECT never advances the gate past CORE_DIRECTION_REVISION_REQUESTED — no silent approval', async () => {
    const engagement = await ensureCreativeDirectionEngagement('ndxbook');
    const refined = await recordFounderDecision('ndxbook', {
      type: 'REFINE',
      selectedTerritoryId: engagement.territories[0].id,
      refinementNotes: 'test',
      by: 'founder@test.com',
    });
    expect(coreDirectionGateStatus(refined.lifecycle_state)).toBe('CORE_DIRECTION_REVISION_REQUESTED');
    expect(refined.visualDna.status).not.toBe('APPROVED');
    expect(refined.visualDna.conceptDna).toBeNull();
  });

  it('15. HYBRIDIZE (SELECTED) stays CORE_DIRECTION_PENDING — DNA is proposed but not locked (§6, §12)', async () => {
    const engagement = await ensureCreativeDirectionEngagement('ndxbook');
    const hybridized = await recordFounderDecision('ndxbook', {
      type: 'HYBRIDIZE',
      selectedTerritoryId: engagement.territories[0].id,
      hybridSelections: [{ territoryId: engagement.territories[1].id, elements: ['typography'] }],
      by: 'founder@test.com',
    });
    expect(coreDirectionGateStatus(hybridized.lifecycle_state)).toBe('CORE_DIRECTION_PENDING');
    expect(hybridized.visualDna.status).toBe('PROPOSED');
    expect(hybridized.visualDna.conceptDna).toBeNull();
    expect(expansionFreedomFor(hybridized.territories[0].lifecycleState).level).toBe('LOW');
  });
});
