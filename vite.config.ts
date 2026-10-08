import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { site00LocalApiPlugin } from './scripts/vite-site00-local-api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  let apiTarget = (
    env.VITE_DEV_PROXY_TARGET ||
    env.VITE_API_BASE ||
    process.env.VITE_DEV_PROXY_TARGET ||
    process.env.VITE_API_BASE ||
    ''
  ).trim();

  const proxy = apiTarget
    ? {
        '/api': {
          target: apiTarget.replace(/\/$/, ''),
          changeOrigin: true,
        },
      }
    : undefined;

  const buildId =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    (mode === 'development' ? 'dev-local' : Date.now().toString(36));

  const cloudMobilePreview =
    command === 'serve' &&
    (process.env.SITE00_CLOUD_MOBILE_PREVIEW === '1' ||
      process.env.SITE00_CLOUD_MOBILE_PREVIEW === 'true');
  const cloudPreviewDevLocalApi =
    cloudMobilePreview && command === 'serve' && mode === 'development';

  /** HMR dev only — never transform dist/index.html during `vite preview` (would serve /src/main.tsx). */
  const cloudPreviewDevServer =
    cloudMobilePreview && command === 'serve' && mode === 'development';

  /** Cloud preview: stable stamp by default (same until redeploy); set SITE00_CLOUD_PREVIEW_STABLE=0 to bust every Vite boot. */
  const previewSessionUnstable =
    cloudMobilePreview &&
    (process.env.SITE00_CLOUD_PREVIEW_STABLE === '0' ||
      process.env.SITE00_CLOUD_PREVIEW_STABLE === 'false');
  const previewSessionId = cloudPreviewDevServer
    ? previewSessionUnstable
      ? Date.now().toString(36)
      : String(buildId).slice(0, 12)
    : null;
  const effectiveBuildId = previewSessionId ?? buildId;

  const tunnelHostname = (
    process.env.SITE00_CLOUDFLARE_TUNNEL_HOSTNAME ||
    process.env.CLOUDFLARE_TUNNEL_HOSTNAME ||
    ''
  ).trim();
  let tunnelAllowedHost: string | undefined;
  if (tunnelHostname) {
    try {
      tunnelAllowedHost = new URL(
        tunnelHostname.includes('://') ? tunnelHostname : `https://${tunnelHostname}`,
      ).hostname;
    } catch {
      tunnelAllowedHost = tunnelHostname.replace(/^https?:\/\//, '').split('/')[0];
    }
  }

  function stripViteClientForCloudPreviewPlugin() {
    return {
      name: 'strip-vite-client-site00-cloud-preview',
      transformIndexHtml: {
        order: 'post' as const,
        handler(html: string) {
          return html.replace(/\s*<script type="module" src="\/@vite\/client"><\/script>\s*/g, '\n');
        },
      },
    };
  }

  function indexBuildStampPlugin(stamp: string) {
    return {
      name: 'site00-index-build-stamp',
      transformIndexHtml: {
        order: 'post' as const,
        handler(html: string) {
          let next = html
            .replace('content="__APP_BUILD_ID__"', `content="${stamp}"`)
            .replace('src="/src/main.tsx"', `src="/src/main.tsx?v=${stamp}"`)
            .replace(
              'src="/site00-assts-boot-recovery.js"',
              `src="/site00-assts-boot-recovery.js?v=${stamp}"`,
            )
            .replace(
              'src="/site00-assts-loader-boot.js?v=environment-v2"',
              `src="/site00-assts-loader-boot.js?v=${stamp}"`,
            );
          if (cloudMobilePreview) {
            const previewMeta =
              `<meta name="site00-cloud-preview" content="1" />` +
              (tunnelAllowedHost
                ? `\n    <meta name="site00-preview-hostname" content="${tunnelAllowedHost}" />`
                : '');
            next = next.replace('</head>', `    ${previewMeta}\n  </head>`);
          }
          return next;
        },
      },
    };
  }

  function verifyClientBundlePlugin() {
    return {
      name: 'site00-verify-client-bundle',
      closeBundle() {
        if (command !== 'build') return;
        execSync('node scripts/verify-production-dist.mjs', { stdio: 'inherit', cwd: process.cwd() });
      },
    };
  }

  function readPreviewCommitStamp(): string {
    const fromEnv = (
      process.env.SITE00_PREVIEW_COMMIT_SHA ||
      process.env.GITHUB_SHA ||
      ''
    )
      .trim()
      .slice(0, 12);
    if (fromEnv) return fromEnv;
    try {
      const manifestPath = path.resolve(__dirname, 'dist/release-manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as { commitSha?: string };
      return String(manifest.commitSha ?? '').slice(0, 12);
    } catch {
      return '';
    }
  }

  /**
   * Hashed preview assets must be cacheable at the Cloudflare edge.
   * Blanket `CDN-Cache-Control: no-store` forces every JS, CSS, font, and plate
   * through the tunnel. The tunnel then answers `429` with
   * `cf-int-tunnel-request-limit-hit: global`, and the phone drops the layout
   * CSS or the plate. HTML stays no-store. Filenames are content hashes.
   */
  function cloudPreviewAssetCachePlugin() {
    const cache = 'public, max-age=31536000, immutable';
    return {
      name: 'site00-cloud-preview-asset-cache',
      configurePreviewServer(server: {
        middlewares: { use: (fn: (req: { url?: string }, res: { setHeader: (k: string, v: string) => void; writeHead: (...args: unknown[]) => unknown }, next: () => void) => void) => void };
      }) {
        server.middlewares.use((req, res, next) => {
          const pathOnly = (req.url || '').split('?')[0];
          const cacheable =
            /^\/assets\/.+\.[A-Za-z0-9_-]{6,}\.[a-z0-9]+$/i.test(pathOnly) ||
            /^\/site00\/projects\/jurnl\/fonts\/.+\.woff2$/i.test(pathOnly);
          if (!cacheable) {
            next();
            return;
          }
          const origSet = res.setHeader.bind(res);
          const origWrite = res.writeHead.bind(res);
          const apply = (name: string, value: unknown) => {
            const key = name.toLowerCase();
            if (key === 'cache-control' || key === 'cdn-cache-control') return origSet(name, cache);
            if (key === 'surrogate-control') return origSet(name, 'max-age=31536000');
            if (key === 'pragma') return origSet(name, '');
            return origSet(name, value as string);
          };
          res.setHeader = apply;
          res.writeHead = (...args: unknown[]) => {
            const last = args[args.length - 1];
            if (last && typeof last === 'object' && !Array.isArray(last)) {
              const headers = last as Record<string, unknown>;
              for (const key of Object.keys(headers)) {
                const folded = key.toLowerCase();
                if (folded === 'cache-control' || folded === 'cdn-cache-control') headers[key] = cache;
                else if (folded === 'surrogate-control') headers[key] = 'max-age=31536000';
                else if (folded === 'pragma') delete headers[key];
              }
              headers['Cache-Control'] = cache;
              headers['CDN-Cache-Control'] = cache;
            }
            return origWrite(...args);
          };
          origSet('Cache-Control', cache);
          origSet('CDN-Cache-Control', cache);
          next();
        });
      },
    };
  }

  function cloudPreviewNoCachePlugin() {
    const previewCommit = readPreviewCommitStamp();
    return {
      name: 'site00-cloud-preview-no-cache',
      configureServer(server: {
        middlewares: { use: (fn: (req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => void) => void };
      }) {
        server.middlewares.use((_req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('CDN-Cache-Control', 'no-store');
          res.setHeader('Surrogate-Control', 'no-store');
          if (previewCommit) {
            res.setHeader('X-Site00-Preview-Commit', previewCommit);
          }
          next();
        });
      },
    };
  }

  return {
    define: {
      'import.meta.env.VITE_APP_BUILD_ID': JSON.stringify(effectiveBuildId),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(effectiveBuildId),
      'import.meta.env.VITE_SITE00_ROOT': JSON.stringify('1'),
      'import.meta.env.VITE_SITE00_CLOUD_PREVIEW': JSON.stringify(cloudMobilePreview ? '1' : '0'),
      'import.meta.env.VITE_SITE00_PREVIEW_LOCAL_API': JSON.stringify(
        cloudPreviewDevLocalApi ? '1' : '0',
      ),
      'import.meta.env.VITE_SITE00_EC_PREVIEW_GUEST': JSON.stringify(
        process.env.VITE_SITE00_EC_PREVIEW_GUEST === '1' ? '1' : '0',
      ),
      'import.meta.env.VITE_SITE00_CLIENT_APP_PREVIEW': JSON.stringify(
        process.env.VITE_SITE00_CLIENT_APP_PREVIEW === '1' ? '1' : '0',
      ),
    },
    resolve: {
      alias: [
        { find: '@site00-email', replacement: path.resolve(__dirname, 'shared/site00-email') },
        // Playwright must stay server-only; shared twin-build modules use dynamic import('playwright').
        {
          find: 'playwright/package.json',
          replacement: path.resolve(__dirname, 'scripts/vite-browser-stubs/playwright-package.json'),
        },
        {
          find: 'playwright',
          replacement: path.resolve(__dirname, 'scripts/vite-browser-stubs/playwright.ts'),
        },
        {
          find: /^chromium-bidi(\/.*)?$/,
          replacement: path.resolve(__dirname, 'scripts/vite-browser-stubs/chromium-bidi-empty.ts'),
        },
        {
          find: /^sharp(\/.*)?$/,
          replacement: path.resolve(__dirname, 'scripts/vite-browser-stubs/sharp.ts'),
        },
        {
          find: /^pngjs(\/.*)?$/,
          replacement: path.resolve(__dirname, 'scripts/vite-browser-stubs/pngjs.ts'),
        },
      ],
    },
    plugins: [
      cloudPreviewAssetCachePlugin(),
      react(cloudPreviewDevServer ? { fastRefresh: false } : undefined),
      ...(command === 'serve' ? [site00LocalApiPlugin()] : []),
      ...(cloudPreviewDevServer && previewSessionId
        ? [stripViteClientForCloudPreviewPlugin(), cloudPreviewNoCachePlugin(), indexBuildStampPlugin(previewSessionId)]
        : []),
      ...(cloudMobilePreview && command === 'serve' && !cloudPreviewDevServer
        ? [cloudPreviewNoCachePlugin()]
        : []),
      ...(command === 'build' ? [indexBuildStampPlugin(effectiveBuildId.slice(0, 12)), verifyClientBundlePlugin()] : []),
    ],
    base: '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
          manualChunks: (id) => {
            if (id.includes('node_modules')) return 'vendor';
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    preview: {
      port: 5174,
      host: '0.0.0.0',
      strictPort: true,
      headers: {
        // Browsers revalidate. The edge may keep a short copy so a burst of
        // document requests does not trip the tunnel's global request limit.
        'Cache-Control': 'no-cache',
        'CDN-Cache-Control': 'public, max-age=120',
        'Surrogate-Control': 'max-age=120',
      },
    },
    server: {
      port: 5174,
      host: '0.0.0.0',
      strictPort: true,
      watch: {
        ignored: ['**/.worktrees/**', '**/dist/**', '**/JURNL/**'],
      },
      allowedHosts: ['.trycloudflare.com', ...(tunnelAllowedHost ? [tunnelAllowedHost] : [])],
      hmr: cloudMobilePreview
        ? false
        : tunnelAllowedHost
          ? {
              host: tunnelAllowedHost,
              protocol: 'wss',
              clientPort: 443,
            }
          : undefined,
      proxy,
    },
  };
});
