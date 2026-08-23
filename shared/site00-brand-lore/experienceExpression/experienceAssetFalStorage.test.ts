import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const storageMocks = vi.hoisted(() => ({
  site00StorageObjectExists: vi.fn(async () => false),
  getSite00AssetPublicUrl: vi.fn((path: string) => `https://storage.test/${path}`),
  uploadSite00AssetBuffer: vi.fn(async (path: string) => ({
    storagePath: path,
    publicUrl: `https://storage.test/${path}`,
  })),
  downloadUrlToBuffer: vi.fn(async () => Buffer.from('webp')),
}));

vi.mock('../../../api/_lib/site00Assts/storage.js', () => storageMocks);

describe('experienceAssetFalProvider storage reuse', () => {
  beforeEach(() => {
    vi.resetModules();
    storageMocks.site00StorageObjectExists.mockReset();
    storageMocks.uploadSite00AssetBuffer.mockClear();
    delete process.env.VITEST;
    process.env.FAL_KEY = 'test-key';
  });

  afterEach(() => {
    process.env.VITEST = 'true';
    delete process.env.FAL_KEY;
  });

  it('reuses existing storage object instead of calling FAL again', async () => {
    storageMocks.site00StorageObjectExists.mockResolvedValue(true);
    const { generateDesignProofAssetViaFal } = await import('./experienceAssetFalProvider.js');

    const result = await generateDesignProofAssetViaFal({
      requirement: {
        id: 'site00-projects-index-host-environment',
        assetRole: 'HOST_ENVIRONMENT',
        category: 'ENVIRONMENT',
        purpose: 'Host environment plate',
        missing: true,
        reusable: false,
        reusableAssetId: null,
        generationAllowed: true,
        idempotencyKey: 'test-key',
      },
      storagePath: 'site00/visual-development/site00_projects_index/host_environment-desktop.webp',
      artDirectionSummary: 'Layered evidence hierarchy',
      proofConcept: 'Projects index',
      owner: 'SITE00',
      functionalSummary: 'Project list, workbench',
      antiDirection: ['wireframe'],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.provider).toBe('storage-reuse');
      expect(result.publicUrl).toContain('host_environment-desktop.webp');
    }
    expect(storageMocks.uploadSite00AssetBuffer).not.toHaveBeenCalled();
  });
});
