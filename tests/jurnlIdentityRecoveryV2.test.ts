import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(import.meta.dirname, '..');
const REGISTRY = path.join(ROOT, 'JURNL/MANIFEST/IDENTITY_RECOVERY_V1/RECOVERED_IDENTITY_REGISTRY.json');
const TECH = path.join(ROOT, 'JURNL/MANIFEST/IDENTITY_RECOVERY_V2/reports/JURNL_CANONICAL_ASSET_TECHNICAL_REPORT.json');
const INVENTORY = path.join(ROOT, 'JURNL/MANIFEST/IDENTITY_RECOVERY_V2/JURNL_CANONICAL_ASSET_SOURCE_INVENTORY.json');

describe('JURNL identity canonical extraction V2', () => {
  it('updates the existing registry with separated status fields (no parallel registry)', () => {
    const reg = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
    expect(reg.identity_design_status).toBe('CONFIRMED_EXISTING_AUTHORITY');
    expect(reg.canonical_identity_lineage).toBe('CANONICAL_IDENTITY_LINEAGE_CONFIRMED');
    expect(reg.component_fidelity_status).toBe('PASS');
    expect(reg.runtime_migration_status).toBe('NOT_STARTED');
    expect(reg.production_asset_status).toBe('PARTIAL');
    expect(reg.founder_review_status).toBe('PENDING_CONFIRMATION');
    expect(reg.id).toBe('JURNL_RECOVERED_IDENTITY_REGISTRY_V1');
  });

  it('documents transparency QA and does not claim full-frame clean logo', () => {
    const tech = JSON.parse(fs.readFileSync(TECH, 'utf8'));
    expect(tech.v2_candidate_matches_committed_layers).toBe(true);
    expect(tech.fidelity.component_layer_fidelity).toBe(true);
    expect(tech.production_readiness.F09_LOCKUP_full_frame).toBe('BLOCKED_BACKGROUND_CONTAMINATION');
    expect(tech.component_results.clean_primary_horizontal_logo).toBe('PARTIAL');
    expect(fs.existsSync(path.join(ROOT, tech.qa_artifacts.transparency_board))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, tech.qa_artifacts.fidelity_board))).toBe(true);
  });

  it('inventory lists F09 lineage and superseded mark with valid paths', () => {
    const inv = JSON.parse(fs.readFileSync(INVENTORY, 'utf8'));
    expect(inv.entries.length).toBeGreaterThanOrEqual(8);
    const lockup = inv.entries.find((e: { asset_id: string }) => e.asset_id === 'ID-002');
    expect(lockup?.source_path).toContain('F09_LOCKUP.png');
    expect(fs.existsSync(path.join(ROOT, lockup.source_path))).toBe(true);
    const bad = inv.entries.find((e: { asset_id: string }) => e.asset_id === 'ID-001');
    expect(bad?.candidate_role).toContain('SUPERSEDED');
  });
});
