import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolveCaptureIndexRow } from '../src/site00/components/designWorkspace/captureNowClient.js';
import type { PageVisualIndexRow } from '../src/site00/components/designWorkspace/DesignPagesVisualIndex';

const rows: PageVisualIndexRow[] = [
  {
    screenId: 'desktop-overview',
    displayName: 'NDXBOOK OVERVIEW',
    route: '/projects/ndxbook',
    normalizedRoute: '/projects/ndxbook',
    mobile: null,
    referenceUrl: null,
    neverCaptured: false,
    resolvedCaptureState: 'CAPTURE_READY',
    pageCaptureStatus: 'CURRENT',
    isStale: false,
    missingImplementation: false,
  },
];

describe('capture now after design authority upload', () => {
  it('resolves overview screenId against desktop-overview mirror row', () => {
    const row = resolveCaptureIndexRow(rows, 'overview', 'ndxbook');
    expect(row?.screenId).toBe('desktop-overview');
  });

  it('resolves site00 overview alias to homepage mirror row', () => {
    const siteRows: PageVisualIndexRow[] = [
      {
        screenId: 'homepage',
        displayName: 'SITE 00 Homepage',
        route: '/',
        normalizedRoute: '/',
        mobile: null,
        referenceUrl: null,
        neverCaptured: true,
        resolvedCaptureState: 'NEVER_CAPTURED',
        pageCaptureStatus: 'NEVER_CAPTURED',
        isStale: false,
        missingImplementation: false,
      },
    ];
    expect(resolveCaptureIndexRow(siteRows, 'overview', 'site00')?.screenId).toBe('homepage');
    expect(resolveCaptureIndexRow(siteRows, 'homepage', 'site00')?.screenId).toBe('homepage');
  });

  it('replace authority dialog closes on local-only save', () => {
    const src = readFileSync('src/site00/components/designWorkspace/pageFamily/ReplaceDesignAuthorityDialog.tsx', 'utf8');
    expect(src).toContain('onReplaced(resolved.warning)');
    expect(src).toContain('onClose()');
  });

  it('does not remount capture panel on authority refresh', () => {
    const src = readFileSync('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx', 'utf8');
    expect(src).toContain('key={activePageId}');
    expect(src).not.toContain('authorityRefreshNonce}`}');
  });
});
