import { readFileSync } from 'node:fs';
import type { TwinV4GoldenAuthority } from './twinV42Types.js';

export function loadGoldenPngBufferForNode(authority: TwinV4GoldenAuthority): Buffer {
  if (authority.artifactUrl.startsWith('file://')) {
    const path = decodeURIComponent(authority.artifactUrl.slice('file://'.length));
    return readFileSync(path);
  }
  throw new Error('loadGoldenPngBufferForNode requires file:// fixture in tests');
}
