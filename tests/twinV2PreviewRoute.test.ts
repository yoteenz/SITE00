/**
 * Twin V2 preview URL must survive session ids that embed page routes (slashes).
 */

import { describe, expect, it } from 'vitest';
import {
  buildTwinV2PreviewRoute,
  decodeTwinV2PreviewSessionId,
  encodeTwinV2PreviewSessionId,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/buildTwinV2Route.js';
describe('Twin V2 preview route encoding', () => {
  it('encode/decode round-trip for slashy session ids', () => {
    const sessionId = 'twin-v2-ndxbook-ndxbook:/projects/ndxbook-1234567890';
    const encoded = encodeTwinV2PreviewSessionId(sessionId);
    expect(encoded).not.toContain('/');
    expect(decodeTwinV2PreviewSessionId(encoded)).toBe(sessionId);
  });

  it('buildTwinV2PreviewRoute keeps session id in one path segment', () => {
    const sessionId = 'twin-v2-ndxbook-ndxbook:/projects/ndxbook-999';
    const path = buildTwinV2PreviewRoute('ndxbook', sessionId);
    expect(path).toBe(`/projects/ndxbook/debug/twin-v2/${encodeURIComponent(sessionId)}`);
    expect(path.split('/debug/twin-v2/')[1]).toBe(encodeTwinV2PreviewSessionId(sessionId));
  });
});
