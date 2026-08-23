/**
 * P0.5 Production Methodology Audit — artifact integrity and methodology invariants.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { WORLD_FORMATION_IMPLEMENTED } from '../shared/site00-project-intelligence/types.js';
import { WORLD_FORMATION_IMPLEMENTED as WORLD_FORMATION_BRAND_LORE } from '../shared/site00-brand-lore/worldFormation/futureContracts.js';
import { EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION } from '../shared/site00-brand-lore/experienceExpression/constants.js';
import { mergeCapabilityVerifications } from '../shared/site00-studio-world-execution/capabilityVerification.js';

const AUDIT_DIR = join(process.cwd(), 'audit');

const P05_ARTIFACTS = [
  'production-system-inventory.json',
  'production-methodology-maturity.json',
  'current-vs-required-pipelines.json',
  'actor-responsibility-matrix.json',
  'production-orchestration-analysis.json',
  'dependency-invalidation-analysis.json',
  'quality-gate-analysis.json',
  'cross-medium-intelligence-analysis.json',
  'failure-mode-analysis.json',
  'unknown-unknown-findings.json',
  'production-remediation-roadmap.json',
  'studio-world-production-operating-model.md',
  'SITE00_P0.5_PRODUCTION_METHODOLOGY_AUDIT.md',
];

describe('P0.5 Production Methodology Audit artifacts', () => {
  for (const file of P05_ARTIFACTS) {
    it(`includes ${file}`, () => {
      const path = join(AUDIT_DIR, file);
      expect(existsSync(path)).toBe(true);
      expect(readFileSync(path, 'utf8').length).toBeGreaterThan(100);
    });
  }

  it('production-system-inventory classifies Product Expression as MISSING', () => {
    const inv = JSON.parse(readFileSync(join(AUDIT_DIR, 'production-system-inventory.json'), 'utf8')) as {
      systems: Array<{ id: string; classification: string }>;
    };
    const pe = inv.systems.find((s) => s.id === 'product-expression');
    expect(pe?.classification).toBe('MISSING');
  });

  it('maturity matrix does not inflate Product Expression', () => {
    const mat = JSON.parse(readFileSync(join(AUDIT_DIR, 'production-methodology-maturity.json'), 'utf8')) as {
      disciplines: Record<string, { methodologyMaturity: string }>;
    };
    expect(mat.disciplines.APPLICATION_PRODUCT.methodologyMaturity).toBe('NONE');
  });

  it('current-vs-required pipelines identify site architecture gap', () => {
    const pipes = JSON.parse(readFileSync(join(AUDIT_DIR, 'current-vs-required-pipelines.json'), 'utf8')) as {
      pipelines: { SITE: { missingStages: string[] } };
    };
    expect(pipes.pipelines.SITE.missingStages).toContain('Site architecture');
  });

  it('dependency analysis reports no formal invalidation graph', () => {
    const dep = JSON.parse(readFileSync(join(AUDIT_DIR, 'dependency-invalidation-analysis.json'), 'utf8')) as {
      formalGraphExists: boolean;
      staleArtifactRisk: string;
    };
    expect(dep.formalGraphExists).toBe(false);
    expect(dep.staleArtifactRisk).toBe('HIGH');
  });

  it('quality gate analysis documents orchestration false readiness', () => {
    const qg = JSON.parse(readFileSync(join(AUDIT_DIR, 'quality-gate-analysis.json'), 'utf8')) as {
      falseReadiness: Array<{ id: string }>;
    };
    expect(qg.falseReadiness.some((f) => f.id === 'FR-003')).toBe(true);
  });

  it('remediation roadmap blocks Product Expression implementation', () => {
    const road = JSON.parse(readFileSync(join(AUDIT_DIR, 'production-remediation-roadmap.json'), 'utf8')) as {
      priorities: { P2: { issues: Array<{ implement?: boolean }> } };
    };
    expect(road.priorities.P2.issues.every((i) => i.implement === false)).toBe(true);
  });

  it('failure modes rank Composer creative drift as critical', () => {
    const fm = JSON.parse(readFileSync(join(AUDIT_DIR, 'failure-mode-analysis.json'), 'utf8')) as {
      rankedCritical: string[];
    };
    expect(fm.rankedCritical).toContain('FM-02');
  });
});

describe('P0.5 experimental and methodology invariants', () => {
  it('World Formation remains unimplemented', () => {
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(WORLD_FORMATION_BRAND_LORE).toBe(false);
  });

  it('Experiment D snapshot remains frozen v1', () => {
    expect(EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION).toBe(1);
  });

  it('Composer capability is not production verified', () => {
    const caps = mergeCapabilityVerifications([]);
    const composer = caps.find((c) => c.capabilityId === 'COMPOSER_ORCHESTRATION');
    expect(composer?.verificationStatus).not.toBe('PRODUCTION_VERIFIED');
  });

  it('visual memory is not canon — reference roles are evidence', () => {
    const cross = JSON.parse(readFileSync(join(AUDIT_DIR, 'cross-medium-intelligence-analysis.json'), 'utf8')) as {
      sharedCorrectly: Array<{ intelligence: string; rule?: string }>;
    };
    const vr = cross.sharedCorrectly.find((s) => s.intelligence === 'Visual Reference Memory');
    expect(vr?.rule).toContain('EVIDENCE');
  });
});
