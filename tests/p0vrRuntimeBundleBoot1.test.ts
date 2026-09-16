/**
 * P0.VR.RUNTIME.BUNDLE-BOOT1 — guard against Node-only VR deps in SPA dist.
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readImageDimensionsFromBytes } from '../shared/site00-studio-world-production/visualReconstruction/imageBytesDimensions.js';
import { TWIN_V41_PROJECT_STYLE_FIREWALL } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/twinV41StyleFirewall.js';

const ROOT = process.cwd();
const DIST_ASSETS = join(ROOT, 'dist', 'assets');

const FORBIDDEN_IN_CLIENT = [
  'pngjs',
  '.inherits(',
  'TYPE_IHDR',
  'PNG_SIGNATURE',
  'node:fs',
  'node:child_process',
  'debuglog("sharp")',
];

describe('P0.VR.RUNTIME.BUNDLE-BOOT1 client bundle guards', () => {
  it('client-safe shared types import without pulling compile pipeline', () => {
    expect(TWIN_V41_PROJECT_STYLE_FIREWALL.forbidV3ImplementationCards).toBe(true);
    const png = new Uint8Array(24);
    png.set([137, 80, 78, 71, 13, 10, 26, 10]);
    png[16] = 0;
    png[17] = 0;
    png[18] = 3;
    png[19] = 32;
    png[20] = 0;
    png[21] = 0;
    png[22] = 6;
    png[23] = 64;
    expect(readImageDimensionsFromBytes(png)).toEqual({ width: 800, height: 1600 });
  });

  it('production dist assets exclude pngjs/sharp/node-only VR strings', () => {
    const hasDistJs =
      existsSync(DIST_ASSETS) &&
      readdirSync(DIST_ASSETS, { withFileTypes: true }).some((d) => d.isFile() && d.name.endsWith('.js'));
    if (!hasDistJs) {
      execSync('npm run build', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    }
    execSync('node scripts/verify-production-dist.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    const files = readdirSync(DIST_ASSETS).filter((f) => f.endsWith('.js'));
    expect(files.length).toBeGreaterThan(0);
    const hits: string[] = [];
    for (const file of files) {
      const src = readFileSync(join(DIST_ASSETS, file), 'utf8');
      for (const needle of FORBIDDEN_IN_CLIENT) {
        if (src.includes(needle)) hits.push(`${file}: ${needle}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
