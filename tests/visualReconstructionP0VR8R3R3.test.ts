/**
 * P0.VR.8R3R3 — Capture API connectivity + runtime transport proof.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildCaptureTransportHealthResponse,
  classifyFetchFailure,
  classifyHttpStatus,
  classifyResponseBody,
  deriveTransportHealthStatus,
  P0_VR_8R3R3_BUILD,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/client.js';
import { detectInvalidApiBaseUrl } from '../src/site00/services/captureApiFetch';
import { resolveSite00ApiBase, site00ApiUrl } from '../src/utils/site00ApiBase';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.8R3R3 — Capture transport recovery', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('1. CaptureTransportHealth module exists', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureTransportReceipt.ts')).toContain(
      'CaptureTransportHealth',
    );
  });

  it('2. health endpoint in page-mirror API', () => {
    expect(read('api/site00/page-mirror.ts')).toContain("'health'");
    expect(read('api/site00/page-mirror.ts')).toContain('buildCaptureTransportHealthResponse');
  });

  it('3. CORS on page-mirror', () => {
    expect(read('api/site00/page-mirror.ts')).toContain('handleCaptureCorsPreflight');
    expect(read('api/_lib/site00Capture/captureCors.ts')).toContain('site00.com');
  });

  it('4. captureApiFetch uses site00ApiUrl', () => {
    expect(read('src/site00/services/captureApiFetch.ts')).toContain('site00ApiUrl');
    expect(read('src/site00/components/designWorkspace/usePageMirror.ts')).toContain('captureApiFetch');
  });

  it('5. invalid API base on host without configured API', () => {
    vi.stubGlobal('window', { location: { hostname: 'unknown-static-host.example.com', protocol: 'https:' } });
    expect(resolveSite00ApiBase()).toBe('');
    expect(detectInvalidApiBaseUrl()).toBeNull();
    expect(deriveTransportHealthStatus(['INVALID_API_BASE_URL'])).toBe('MISCONFIGURED');
  });

  it('6. mixed content blocked', () => {
    expect(
      classifyFetchFailure(new Error('blocked'), {
        pageProtocol: 'https:',
        apiBaseUrl: 'http://api.site00.com',
      }),
    ).toBe('MIXED_CONTENT_BLOCKED');
  });

  it('7. site00.com resolves Railway API', () => {
    vi.stubGlobal('window', { location: { hostname: 'site00.com', protocol: 'https:' } });
    expect(resolveSite00ApiBase()).toBe('https://api.site00.com');
    expect(site00ApiUrl('/api/site00/page-mirror')).toBe('https://api.site00.com/api/site00/page-mirror');
  });

  it('8. classify HTTP 404', () => {
    expect(classifyHttpStatus(404)).toBe('ENDPOINT_NOT_FOUND');
  });

  it('9. classify HTTP 401 auth failed', () => {
    expect(classifyHttpStatus(401)).toBe('AUTH_FAILED');
  });

  it('10. classify HTTP 500', () => {
    expect(classifyHttpStatus(500)).toBe('SERVER_5XX');
  });

  it('11. classify HTML response invalid', () => {
    expect(classifyResponseBody('<html><body>404</body></html>', 'text/html')).toBe('INVALID_API_RESPONSE');
  });

  it('12. classify fetch failure timeout', () => {
    expect(classifyFetchFailure(new DOMException('Aborted', 'AbortError'))).toBe('REQUEST_TIMEOUT');
  });

  it('13. classify fetch failure network', () => {
    expect(classifyFetchFailure(new TypeError('Failed to fetch'))).toBe('API_UNREACHABLE');
  });

  it('14. derive transport health status', () => {
    expect(deriveTransportHealthStatus([])).toBe('HEALTHY');
    expect(deriveTransportHealthStatus(['INVALID_API_BASE_URL'])).toBe('MISCONFIGURED');
    expect(deriveTransportHealthStatus(['WORKER_UNAVAILABLE'])).toBe('DEGRADED');
    expect(deriveTransportHealthStatus(['API_UNREACHABLE'])).toBe('UNAVAILABLE');
  });

  it('15. server health response shape', () => {
    const health = buildCaptureTransportHealthResponse();
    expect(health.apiBuild).toBeTruthy();
    expect(health.workerBuild).toBeTruthy();
    expect(health.contractVersion).toBe('capture-run-v1');
    expect(health.serverTime).toBeTruthy();
  });

  it('16. build v263', () => {
    expect(P0_VR_8R3R3_BUILD).toBe('v263');
  });

  it('17. transport preflight before refresh', () => {
    expect(read('src/site00/components/designWorkspace/usePageMirror.ts')).toContain('checkCaptureTransportHealth');
    expect(read('src/site00/components/designWorkspace/usePageMirror.ts')).toContain("transport.status !== 'HEALTHY'");
  });

  it('18. retry connection UX', () => {
    const panel = read('src/site00/components/designWorkspace/DesignPagesTabPanel.tsx');
    const founder = read('src/site00/components/designWorkspace/founderCapture/FounderCaptureExperience.tsx');
    expect(
      panel.includes('FounderCaptureExperience') ||
        founder.includes('CHECK AGAIN') ||
        panel.includes('RETRY CONNECTION') ||
        panel.includes('RETRY HEALTH CHECK'),
    ).toBe(true);
    expect(read('src/site00/components/designWorkspace/DesignCaptureOrchestrationInspector.tsx')).toContain('TRANSPORT');
  });

  it('19. no generic NETWORK_ERROR only path', () => {
    expect(read('src/site00/components/designWorkspace/usePageMirror.ts')).not.toContain("'NETWORK_ERROR'");
  });

  it('20. checkCaptureTransportHealth service', () => {
    expect(read('src/site00/services/checkCaptureTransportHealth.ts')).toContain('view=health');
  });
});
