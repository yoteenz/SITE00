import { describe, expect, it } from 'vitest';

import {
  isPageCaptureDisplayableArtifact,
  pageCaptureDisplaySrc,
} from '../shared/site00-design-workspace-production/designPageCapture.js';

describe('page capture display artifact guard', () => {
  it('accepts CDN and data URLs', () => {
    expect(isPageCaptureDisplayableArtifact('data:image/png;base64,abc')).toBe(true);
    expect(isPageCaptureDisplayableArtifact('https://cdn.site00.com/snap.webp')).toBe(true);
    expect(isPageCaptureDisplayableArtifact('/visual-references/founder/x.png')).toBe(true);
  });

  it('rejects live route URLs saved from failed snapshots', () => {
    expect(isPageCaptureDisplayableArtifact('https://site00.com/projects/ndxbook')).toBe(false);
    expect(isPageCaptureDisplayableArtifact('/projects/ndxbook/overview')).toBe(false);
    expect(pageCaptureDisplaySrc('https://site00.com/projects/ndxbook')).toBeNull();
  });
});
