import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { site00AsstsLocalApiPlugin } from './scripts/vite-site00-assts-local-api.mjs';

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
      'import.meta.env.VITE_APP_BUILD_ID': JSON.stringify(buildId),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(buildId),
      'import.meta.env.VITE_SITE00_ROOT': JSON.stringify('1'),
    },
    plugins: [
      react(cloudMobilePreview ? { fastRefresh: false } : undefined),
      ...(command === 'serve' ? [site00AsstsLocalApiPlugin()] : []),
      ...(cloudMobilePreview ? [stripViteClientForCloudPreviewPlugin(), cloudPreviewNoCachePlugin()] : []),
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
