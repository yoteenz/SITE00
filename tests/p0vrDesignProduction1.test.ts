/**
 * P0.VR.DESIGN-PRODUCTION1 — frozen contract + production readiness / workflow guards.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  assertContractFrozenForProduction,
  readComposerContractJson,
} from '../shared/site00-design-workspace-production/composerContractFreeze.js';
import {
  createInitialDesignProductionState,
  loadDesignProductionState,
  saveDesignProductionState,
} from '../shared/site00-design-workspace-production/designProductionStore.js';
import { computeDesignReadiness } from '../shared/site00-design-workspace-production/designReadinessEngine.js';
import {
  lockAuthorityPair,
  moveToBuild,
  openPairReview,
  submitAuthorityReview,
} from '../shared/site00-design-workspace-production/designProductionActions.js';
import { buildDesignProductionizationReceipt } from '../shared/site00-design-workspace-production/designProductionReceipt.js';
import { NDXBOOK_DESIGN_CHILD_INHERITANCE } from '../shared/site00-design-workspace-production/childInheritanceContract.js';

const root = resolve(__dirname, '..');
const read = (relative: string) => readFileSync(resolve(root, relative), 'utf8');

function hashComposerContractDocument(contract: Record<string, unknown>): string {
  const clone = { ...contract };
  delete clone.contractFreezeMetadata;
  return createHash('sha256').update(JSON.stringify(clone), 'utf8').digest('hex');
}

const contractFromDocs = JSON.parse(read('docs/design-workspace/composer-contract.json')) as Record<
  string,
  unknown
>;

const FD_IDS = ['FD-01', 'FD-02', 'FD-03', 'FD-04', 'FD-05', 'FD-06', 'FD-07', 'FD-08', 'FD-09'];

const founder = { email: 'kateenaarmstrong@gmail.com', isFounder: true };
const notFounder = { email: 'guest@example.com', isFounder: false };

describe('DESIGN-PRODUCTION1 — contract frozen', () => {
  const contract = readComposerContractJson();

  it('has version 2.0.0 and nine founder decisions', () => {
    expect(contract.version).toBe('2.0.0');
    expect((contractFromDocs.founderDecisions as { id: string }[]).map((d) => d.id)).toEqual(FD_IDS);
    expect(contractFromDocs.UNRESOLVED_DECISIONS).toEqual([]);
  });

  it('is FROZEN_FOR_PRODUCTIONIZATION with stable hash metadata', () => {
    expect(contractFromDocs.COMPOSER_CONTRACT_STATUS).toBe('FROZEN_FOR_PRODUCTIONIZATION');
    const meta = contractFromDocs.contractFreezeMetadata as { contractHash: string };
    expect(meta.contractHash).toBe(hashComposerContractDocument(contractFromDocs));
    assertContractFrozenForProduction(contractFromDocs);
    assertContractFrozenForProduction(contract);
  });

  it('rejects decorative 82% in twin opus content shell', () => {
    const content = read('src/site00/components/designBench/opusDirect/twinOpusDirectContent.ts');
    expect(content).not.toMatch(/percent:\s*82/);
    expect(content).toContain('TWIN_OPUS_DIRECT_READINESS_SHELL');
  });
});

describe('DESIGN-PRODUCTION1 — readiness engine', () => {
  it('computes passed/applicable gates deterministically', () => {
    const state = createInitialDesignProductionState('ndxbook');
    const receipt = computeDesignReadiness(state);
    expect(receipt.applicableGates).toBeGreaterThan(0);
    expect(receipt.readinessPercent).not.toBe(82);
    expect(receipt.passedGates).toBeLessThanOrEqual(receipt.applicableGates);
    expect(receipt.buildEligible).toBe(false);
  });

  it('blocks move to build until authority workflow completes', () => {
    let state = createInitialDesignProductionState('ndxbook');
    expect(() => moveToBuild(state, founder)).toThrow(/MOVE_TO_BUILD_BLOCKED/);

    state = openPairReview(state, founder);
    state = submitAuthorityReview(state, founder, 'APPROVE');
    state = lockAuthorityPair(state, founder);
    expect(state.packageStatus).toBe('BUILD_REVIEW_READY');

    const moved = moveToBuild(state, founder);
    expect(moved.workflowStage).toBe('BUILD');
    expect(moved.packageStatus).toBe('READY_FOR_PRODUCTIONIZATION');
    expect(moved.buildPackage).toBeTruthy();
  });

  it('enforces founder-only mutations', () => {
    const state = createInitialDesignProductionState('ndxbook');
    expect(() => lockAuthorityPair(state, notFounder)).toThrow(/FOUNDER_ONLY/);
    expect(() => moveToBuild(state, notFounder)).toThrow(/FOUNDER_ONLY/);
  });
});

describe('DESIGN-PRODUCTION1 — UI wiring guards', () => {
  it('binds projectSlug and production overlays', () => {
    const page = read('src/site00/pages/DesignTwinOpusDirectPage.tsx');
    const screen = read('src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx');
    expect(page).toContain('useParams');
    expect(page).toContain('projectSlug');
    expect(screen).toContain('TwinOpusDirectOverlays');
    expect(screen).toContain('openOverflowMenu');
    expect(screen).toContain('openCreativeContext');
    expect(screen).toContain('openHostModuleNav');
  });

  it('shares workspace hook between canonical and list', () => {
    const workspace = read('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
    expect(workspace).toContain('useTwinOpusDirectProduction');
    expect(workspace).not.toMatch(/percent:\s*82/);
  });
});

describe('DESIGN-PRODUCTION1 — inheritance + receipt', () => {
  it('defines child inheritance contract', () => {
    expect(NDXBOOK_DESIGN_CHILD_INHERITANCE.inherits.length).toBeGreaterThanOrEqual(8);
  });

  it('emits DesignProductionizationReceipt', () => {
    const state = createInitialDesignProductionState('ndxbook');
    const receipt = buildDesignProductionizationReceipt(state);
    expect(receipt.contractVersion).toBe('2.0.0');
    expect(receipt.implementedInteractions.length).toBeGreaterThanOrEqual(9);
    expect(receipt.eventTaxonomy).toHaveLength(11);
  });
});

describe('DESIGN-PRODUCTION1 — persistence key', () => {
  it('uses project-scoped storage', () => {
    const state = createInitialDesignProductionState('NDXBOOK');
    const saved = saveDesignProductionState(state);
    const loaded = loadDesignProductionState('ndxbook');
    expect(loaded.projectId).toBe('ndxbook');
    expect(saved.storeVersion).toBe(1);
  });
});
