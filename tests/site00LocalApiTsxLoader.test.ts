import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import { describe, expect, it } from 'vitest';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

describe('site00 Vite local API handler bundle', () => {
  it('bundles Digital Foundation admin handler without tsx runtime', async () => {
    const file = 'api/admin/site00-foundation.ts';
    const outPath = path.join(ROOT, 'node_modules/.cache/site00-vite-local-api-test', 'site00-foundation.mjs');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await esbuild.build({
      entryPoints: [path.join(ROOT, file)],
      outfile: outPath,
      format: 'esm',
      platform: 'node',
      bundle: true,
      logLevel: 'silent',
      plugins: [
        {
          name: 'external-node-modules',
          setup(build) {
            build.onResolve({ filter: /.*/ }, (args) => {
              if (args.path.startsWith('.') || path.isAbsolute(args.path)) return null;
              return { path: args.path, external: true };
            });
          },
        },
      ],
    });
    const mod = await import(pathToFileURL(outPath).href);
    expect(typeof mod.default).toBe('function');
  });
});
