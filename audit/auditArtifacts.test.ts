/**
 * Audit artifact integrity — ensures master assurance deliverables exist.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const AUDIT_DIR = join(process.cwd(), 'audit');

const REQUIRED_ARTIFACTS = [
  'findings.json',
  'readiness-matrix.json',
  'system-dependency-graph.json',
  'provider-capability-audit.json',
  'live-verification-gaps.json',
  'provenance-audit.json',
  'state-machine-audit.json',
  'remediation-roadmap.json',
  'SITE00_STUDIO_WORLD_MASTER_ASSURANCE_AUDIT.md',
];

describe('Master Assurance Audit artifacts', () => {
  for (const file of REQUIRED_ARTIFACTS) {
    it(`includes ${file}`, () => {
      const path = join(AUDIT_DIR, file);
      expect(existsSync(path)).toBe(true);
      expect(readFileSync(path, 'utf8').length).toBeGreaterThan(50);
    });
  }

  it('findings.json has critical persistence finding MA-001', () => {
    const findings = JSON.parse(readFileSync(join(AUDIT_DIR, 'findings.json'), 'utf8')) as {
      findings: Array<{ id: string; severity: string }>;
    };
    const ma001 = findings.findings.find((f) => f.id === 'MA-001');
    expect(ma001?.severity).toBe('CRITICAL');
  });

  it('remediation roadmap blocks Product Expression and World Formation', () => {
    const roadmap = JSON.parse(readFileSync(join(AUDIT_DIR, 'remediation-roadmap.json'), 'utf8')) as {
      continuePauseMatrix: Record<string, { status: string }>;
    };
    expect(roadmap.continuePauseMatrix.PRODUCT_EXPRESSION.status).toBe('BLOCKED');
    expect(roadmap.continuePauseMatrix.WORLD_FORMATION.status).toBe('BLOCKED');
  });
});
