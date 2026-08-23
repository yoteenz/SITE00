import { describe, expect, it } from 'vitest';
import {
  buildHostReferenceStoragePath,
  hostReferenceStoragePathCandidates,
  legacyHostReferenceStoragePath,
} from './referenceStoragePaths.js';
import { isFalAccessibleReferenceUrl, isPlaceholderReferenceUrl } from './referencePublicUrl.js';

describe('referencePublicUrl', () => {
  it('flags vitest.local and localhost as placeholders', () => {
    expect(isPlaceholderReferenceUrl('https://vitest.local/foo.webp')).toBe(true);
    expect(isPlaceholderReferenceUrl('http://127.0.0.1/foo.webp')).toBe(true);
    expect(isPlaceholderReferenceUrl(null)).toBe(true);
  });

  it('requires real https URLs outside vitest', () => {
    const prev = process.env.VITEST;
    delete process.env.VITEST;
    try {
      expect(isFalAccessibleReferenceUrl('https://vitest.local/foo.webp')).toBe(false);
      expect(
        isFalAccessibleReferenceUrl('https://example.supabase.co/storage/v1/object/public/live-preview/foo.webp'),
      ).toBe(true);
    } finally {
      process.env.VITEST = prev;
    }
  });
});

describe('referenceStoragePaths', () => {
  it('uses canonical capture paths', () => {
    expect(buildHostReferenceStoragePath('/control', 'DESKTOP')).toBe(
      'visual-references/site00/host/desktop/control.webp',
    );
    expect(buildHostReferenceStoragePath('/', 'DESKTOP')).toBe('visual-references/site00/host/desktop/origin.webp');
    expect(buildHostReferenceStoragePath('/projects', 'MOBILE')).toBe(
      'visual-references/site00/host/mobile/projects.webp',
    );
  });

  it('includes legacy seed paths as hydration candidates', () => {
    const candidates = hostReferenceStoragePathCandidates('/control', 'DESKTOP');
    expect(candidates).toContain('visual-references/site00/host/desktop/control.webp');
    expect(candidates).toContain(legacyHostReferenceStoragePath('/control', 'DESKTOP'));
  });
});
