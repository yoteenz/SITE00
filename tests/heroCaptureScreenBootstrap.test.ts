/**
 * Hero CAPTURE SCREEN — design screen registry must hydrate before Playwright capture.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearDesignScreenRegistryForTest, findDesignScreen } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/designScreenRegistry.js';

vi.mock('../shared/site00-studio-world-production/visualReconstruction/render/ControlledReferenceRenderer.js', () => ({
  renderControlledReference: vi.fn(async () => ({
    screenshotPath: '/tmp/mock.png',
    finalUrl: 'http://127.0.0.1:5174/projects/ndxbook/overview?designPreview=1',
    pageNotFound: false,
    httpStatus: 200,
    anchorFound: true,
  })),
}));

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    readFileSync: vi.fn(() => Buffer.from('mock-png')),
  };
});

describe('hero capture screen bootstrap', () => {
  beforeEach(() => {
    clearDesignScreenRegistryForTest();
  });

  it('registers ndxbook design screens before resolving capture target', async () => {
    expect(findDesignScreen('ndxbook', 'overview')).toBeNull();
    const { captureImplementationSnapshot } = await import(
      '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js'
    );
    const snap = await captureImplementationSnapshot({
      projectId: 'ndxbook',
      screenId: 'overview',
      viewportClass: 'mobile',
      baseUrl: 'http://127.0.0.1:5174',
      route: '/projects/ndxbook',
    });
    expect(findDesignScreen('ndxbook', 'overview')).not.toBeNull();
    expect(snap).not.toBeNull();
    expect(snap?.route).toContain('/projects/ndxbook');
  });
});
