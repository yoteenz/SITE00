/**
 * P0.VR.CAPTURE.1R3B — Founder design workspace cloud snapshot merge rules.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  applyFounderDesignWorkspaceSnapshot,
  buildFounderDesignWorkspaceSnapshot,
  resetFounderDesignSnapshotMetaForTest,
  type FounderDesignWorkspaceSnapshot,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/founderDesignWorkspaceSnapshot.js';
import {
  recordDesignAuthorityVersion,
  resetDesignAuthorityVersionsForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/designAuthorityVersion.js';
import {
  resetPageViewportCaptureStoreForTest,
  savePageViewportCapture,
  buildPageViewportCapture,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageViewportCapture.js';
import { clearCurrentAuthorityPointersForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/currentAuthorityPointer.js';

describe('founder design workspace snapshot', () => {
  beforeEach(() => {
    resetDesignAuthorityVersionsForTest();
    resetPageViewportCaptureStoreForTest();
    clearCurrentAuthorityPointersForTest();
    resetFounderDesignSnapshotMetaForTest();
  });

  it('builds snapshot without data URLs', () => {
    recordDesignAuthorityVersion({
      authorityVersionId: 'authv_test',
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      screenId: 'overview',
      viewport: 'mobile',
      route: '/projects/ndxbook',
      referenceId: 'ref1',
      assetRef: 'https://cdn.example.com/authority.webp',
      storagePath: 'site00/visual-references/founder/ndxbook/page-authority/overview-mobile.webp',
      status: 'CURRENT',
      approvedAt: '2026-09-12T00:00:00.000Z',
      supersededAt: null,
      supersededBy: null,
      source: 'FOUNDER_UPLOAD',
      createdAt: '2026-09-12T00:00:00.000Z',
    });

    savePageViewportCapture(
      buildPageViewportCapture({
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        viewport: 'mobile',
        captureId: 'cap_test',
        route: '/projects/ndxbook',
        resolvedRuntimePath: '/projects/ndxbook',
        imageRef: 'https://cdn.example.com/capture.webp',
        status: 'CAPTURE_READY',
      }),
    );

    const snapshot = buildFounderDesignWorkspaceSnapshot('ndxbook');
    expect(snapshot.authorityVersions).toHaveLength(1);
    expect(snapshot.captures).toHaveLength(1);
    expect(snapshot.authorityVersions[0]?.assetRef).toContain('https://');
  });

  it('applies remote snapshot when local is empty', () => {
    const remote: FounderDesignWorkspaceSnapshot = {
      version: 1,
      projectId: 'ndxbook',
      savedAt: '2026-09-12T12:00:00.000Z',
      authorityVersions: [
        {
          authorityVersionId: 'authv_remote',
          projectId: 'ndxbook',
          pageId: 'ndxbook:/projects/ndxbook',
          screenId: 'overview',
          viewport: 'mobile',
          route: '/projects/ndxbook',
          referenceId: 'ref1',
          assetRef: 'https://cdn.example.com/authority.webp',
          storagePath: 'site00/visual-references/founder/ndxbook/page-authority/overview-mobile.webp',
          status: 'CURRENT',
          approvedAt: '2026-09-12T11:00:00.000Z',
          supersededAt: null,
          supersededBy: null,
          source: 'FOUNDER_UPLOAD',
          createdAt: '2026-09-12T11:00:00.000Z',
        },
      ],
      authorityPointers: {
        'ndxbook:ndxbook:/projects/ndxbook:mobile': 'authv_remote',
      },
      captures: [
        buildPageViewportCapture({
          projectId: 'ndxbook',
          pageId: 'ndxbook:/projects/ndxbook',
          viewport: 'mobile',
          captureId: 'cap_remote',
          route: '/projects/ndxbook',
          resolvedRuntimePath: '/projects/ndxbook',
          imageRef: 'https://cdn.example.com/capture.webp',
          status: 'CAPTURE_READY',
        }),
      ],
      canonicalRegistry: { references: [], canons: [] },
    };

    const result = applyFounderDesignWorkspaceSnapshot(remote);
    expect(result.applied).toBe(true);
    const rebuilt = buildFounderDesignWorkspaceSnapshot('ndxbook');
    expect(rebuilt.captures.some((c) => c.captureId === 'cap_remote')).toBe(true);
    expect(rebuilt.authorityVersions.some((v) => v.authorityVersionId === 'authv_remote')).toBe(true);
  });
});
