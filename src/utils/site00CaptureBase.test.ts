import { describe, expect, it, vi } from 'vitest';
import { isPreviewCaptureHost, resolveFounderCaptureBaseUrl } from './site00CaptureBase';

describe('resolveFounderCaptureBaseUrl', () => {
  it('uses current preview origin on fsbw-dev hosts', () => {
    const hostname = ['site00', '.fsbw-dev.com'].join('');
    const origin = ['https:/', '/', hostname].join('');
    vi.stubGlobal('window', { location: { hostname, origin } });
    expect(resolveFounderCaptureBaseUrl()).toBe(origin);
    expect(isPreviewCaptureHost()).toBe(true);
  });

  it('uses current origin on production apex', () => {
    vi.stubGlobal('window', { location: { hostname: 'site00.com', origin: 'https://site00.com' } });
    expect(resolveFounderCaptureBaseUrl()).toBe('https://site00.com');
    expect(isPreviewCaptureHost()).toBe(false);
  });
});
