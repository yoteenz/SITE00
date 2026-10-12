import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import { describe, expect, it } from 'vitest';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const LOCAL_API_ESBUILD = {
  format: 'esm' as const,
  platform: 'node' as const,
  target: 'es2022' as const,
  bundle: true,
  logLevel: 'silent' as const,
  plugins: [
    {
      name: 'external-node-modules',
      setup(build: esbuild.PluginBuild) {
        build.onResolve({ filter: /.*/ }, (args) => {
          if (args.path.startsWith('.') || path.isAbsolute(args.path)) return null;
          return { path: args.path, external: true };
        });
      },
    },
  ],
};

async function bundleHandler(file: string, cacheName: string) {
  const outPath = path.join(ROOT, 'node_modules/.cache/site00-vite-local-api-test', cacheName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await esbuild.build({
    entryPoints: [path.join(ROOT, file)],
    outfile: outPath,
    ...LOCAL_API_ESBUILD,
  });
  return import(pathToFileURL(outPath).href);
}

describe('site00 Vite local API handler bundle', () => {
  it('bundles Digital Foundation admin handler without tsx runtime', async () => {
    const mod = await bundleHandler('api/admin/site00-foundation.ts', 'site00-foundation.mjs');
    expect(typeof mod.default).toBe('function');
  });

  it('bundles intakes handler (BLDR / preview tunnel dependency chain)', async () => {
    const mod = await bundleHandler('api/site00/intakes.ts', 'site00-intakes.mjs');
    expect(typeof mod.default).toBe('function');
  });
});
