import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(import.meta.dirname, '..');
const REGISTRY = path.join(ROOT, 'JURNL/MANIFEST/IDENTITY_RECOVERY_V1/RECOVERED_IDENTITY_REGISTRY.json');
const FIDELITY = path.join(ROOT, 'JURNL/MANIFEST/IDENTITY_RECOVERY_V1/reports/JURNL_IDENTITY_FIDELITY_REPORT.json');
const MANIFEST = path.join(ROOT, 'JURNL/MANIFEST/REFERENCE_HYGIENE_V1/JURNL_REFERENCE_MANIFEST_V1.json');
const SUPERSEDED = path.join(ROOT, 'public/site00/projects/jurnl/brand/jurnl-logo-official.png');

describe('JURNL identity forensic recovery', () => {
  it('registers F09 lockup candidate and excludes superseded vertical mark', () => {
    const reg = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
    expect(reg.registration_status).toBe('RECOVERED_CANDIDATE_FOUNDER_CONFIRMATION_PENDING');
    expect(reg.final_canonical_approved).toBe(false);
    expect(reg.superseded_predecessor).toContain('jurnl-logo-official.png');
    expect(reg.primary_approved_editorial_lockup.path).toContain('F09_LOCKUP.png');
    expect(fs.existsSync(path.join(ROOT, reg.primary_approved_editorial_lockup.path))).toBe(true);
    expect(fs.existsSync(SUPERSEDED)).toBe(true);
  });

  it('passes component fidelity and pack preservation', () => {
    const fidelity = JSON.parse(fs.readFileSync(FIDELITY, 'utf8'));
    expect(fidelity.component_fidelity_pass).toBe(true);
    expect(fidelity.reextract_sprig_matches_committed).toBe(true);
    expect(fidelity.reextract_word_matches_committed).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    expect(manifest.superseded_identity_paths).toContain('public/site00/projects/jurnl/brand/jurnl-logo-official.png');
    expect(Object.keys(manifest.packs)).toHaveLength(6);
    expect(manifest.recovered_canonical_candidate).toContain('F09_LOCKUP.png');
  });
});
