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

  /** Unique per dev-server boot — busts mobile Safari module cache on cloud preview. */
  const previewSessionId = cloudMobilePreview ? Date.now().toString(36) : null;
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

  function cloudPreviewIndexCacheBustPlugin(sessionId: string) {
    return {
      name: 'site00-cloud-preview-index-cache-bust',
      transformIndexHtml: {
        order: 'post' as const,
        handler(html: string) {
          return html
            .replace('content="__APP_BUILD_ID__"', `content="${sessionId}"`)
            .replace('src="/src/main.tsx"', `src="/src/main.tsx?v=${sessionId}"`)
            .replace(
              'src="/site00-assts-loader-boot.js?v=environment-v2"',
              `src="/site00-assts-loader-boot.js?v=${sessionId}"`,
            );
        },
      },
    };
  }

  function cloudPreviewNoCachePlugin() {
    return {
      name: 'site00-cloud-preview-no-cache',
      configureServer(server: {
        middlewares: { use: (fn: (req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => void) => void };
      }) {
        server.middlewares.use((_req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
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
    },
    resolve: {
      alias: {
        '@site00-email': path.resolve(__dirname, 'shared/site00-email'),
      },
    },
    plugins: [
      react(cloudMobilePreview ? { fastRefresh: false } : undefined),
      ...(command === 'serve' ? [site00LocalApiPlugin()] : []),
      ...(cloudMobilePreview && previewSessionId
        ? [
            stripViteClientForCloudPreviewPlugin(),
            cloudPreviewNoCachePlugin(),
            cloudPreviewIndexCacheBustPlugin(previewSessionId),
          ]
        : []),
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
    server: {
      port: 5174,
      host: '0.0.0.0',
      strictPort: true,
      allowedHosts: ['.trycloudflare.com', ...(tunnelAllowedHost ? [tunnelAllowedHost] : [])],
      hmr: cloudMobilePreview ? false : undefined,
      proxy,
    },
  };
});
