/**
 * Capture API CORS — fsbw-dev preview host must reach api.site00.com.
 */

import { describe, expect, it } from 'vitest';
import { isCaptureCorsOriginAllowed } from '../api/_lib/site00Capture/captureCors.js';
import {
  formatCaptureTransportError,
  isRecoverableAuthorityUploadError,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/formatCaptureTransportError.js';

describe('capture CORS + authority upload errors', () => {
  it('allows apex fsbw-dev preview host via hostname suffix', () => {
    const origin = ['https:/', '/site00', '.fsbw-dev.com'].join('');
    expect(isCaptureCorsOriginAllowed(origin)).toBe(true);
  });

  it('allows fsbw-dev subdomains', () => {
    expect(isCaptureCorsOriginAllowed('https://preview.fsbw-dev.com')).toBe(true);
  });

  it('formats API_UNREACHABLE for founders', () => {
    expect(formatCaptureTransportError('API_UNREACHABLE')).toContain('UNREACHABLE');
  });

  it('marks API_UNREACHABLE recoverable for local fallback', () => {
    expect(isRecoverableAuthorityUploadError('API_UNREACHABLE')).toBe(true);
  });
});
