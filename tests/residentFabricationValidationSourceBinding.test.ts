import { describe, expect, it } from 'vitest';
import {
  listValidationSourceBindings,
  resolveValidationSourceBinding,
  VALIDATION_RESIDENT_IDS,
} from '../shared/site00-studio-world/resident-fabrication/validationSourceBinding.js';

const CASTING = 'studio-world-residents/casting-thumbnails-v1/';
const SUPERSEDED = 'production-authority-assets/shared/residents/';

describe('validationSourceBinding', () => {
  it('resolves all 8 residents with casting-thumbnails work look and season1 body', () => {
    const bindings = listValidationSourceBindings();
    expect(bindings).toHaveLength(8);
    for (const b of bindings) {
      expect(b.workLookAuthority.repoPath).toContain(CASTING);
      expect(b.identityFaceAuthority.repoPath).toBe(b.workLookAuthority.repoPath);
      expect(b.bodyGeometryAuthority.repoPath).toContain('season1-v1/');
      expect(b.bodyGeometryAuthority.repoPath).toContain('01-natural-authority');
      expect(b.workLookAuthority.repoPath).not.toContain(SUPERSEDED);
    }
  });

  it('matches expected Etta casting thumbnail filename', () => {
    const etta = resolveValidationSourceBinding('SW-001');
    expect(etta.workLookAuthority.repoPath).toBe(
      'public/site00/studio-world-residents/casting-thumbnails-v1/SW-RESIDENT-001_ETTA_VALE.jpg',
    );
    expect(etta.bodyGeometryAuthority.repoPath).toContain('etta-vale__natural-full-body');
  });

  it('covers SW-001 through SW-008', () => {
    expect(VALIDATION_RESIDENT_IDS).toHaveLength(8);
    for (const id of VALIDATION_RESIDENT_IDS) {
      expect(() => resolveValidationSourceBinding(id)).not.toThrow();
    }
  });
});
