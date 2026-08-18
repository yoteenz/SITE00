/**
 * Vite dev middleware: serve /api/admin/site00-assts locally (tsx + Supabase service role).
 * Used when Vercel preview proxy returns 402 DEPLOYMENT_DISABLED or before ASSTS API is deployed.
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { loadEnv } from 'vite';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);

function applyAsstsServerEnv() {
  const env = loadEnv('development', ROOT, '');
  const pairs = [
    ['SUPABASE_URL', env.SUPABASE_URL || env.VITE_SUPABASE_URL],
    ['SUPABASE_ANON_KEY', env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY],
    ['SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY],
    ['ADMIN_EMAILS', env.ADMIN_EMAILS || env.VITE_ADMIN_EMAILS],
    ['FAL_KEY', env.FAL_KEY],
    ['STUDIO_ASSETS_BUCKET', env.STUDIO_ASSETS_BUCKET],
  ];
  for (const [key, value] of pairs) {
    if (value && !process.env[key]) process.env[key] = value;
  }
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8') || ''));
    req.on('error', reject);
  });
}

function createVercelResponseAdapter(res) {
  let statusCode = 200;
  return {
    setHeader(key, value) {
      res.setHeader(key, value);
      return this;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      if (!res.headersSent) {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      res.end(JSON.stringify(payload));
    },
    end(data) {
      res.statusCode = statusCode;
      res.end(data);
    },
  };
}

export function site00AsstsLocalApiPlugin() {
  /** @type {Promise<(req: unknown, res: unknown) => Promise<void>> | null} */
  let handlerPromise = null;

  async function loadHandler() {
    if (!handlerPromise) {
      handlerPromise = (async () => {
        const tsxApi = pathToFileURL(require.resolve('tsx/esm/api')).href;
        const { register } = await import(tsxApi);
        register();
        const mod = await import(pathToFileURL(path.join(ROOT, 'api/admin/site00-assts.ts')).href);
        return mod.default;
      })();
    }
    return handlerPromise;
  }

  return {
    name: 'site00-assts-local-api',
    configureServer(server) {
      applyAsstsServerEnv();

      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url ?? '';
        const pathname = rawUrl.split('?')[0] ?? '';
        if (pathname !== '/api/admin/site00-assts') return next();

        applyAsstsServerEnv();

        try {
          const handler = await loadHandler();
          const parsed = new URL(rawUrl, 'http://127.0.0.1');
          const query = Object.fromEntries(parsed.searchParams.entries());
          let body = '';
          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            body = await readRequestBody(req);
          }

          const vercelReq = {
            method: req.method,
            url: rawUrl,
            query,
            headers: req.headers,
            body: body.trim() ? (() => {
              try {
                return JSON.parse(body);
              } catch {
                return body;
              }
            })() : undefined,
          };

          await handler(vercelReq, createVercelResponseAdapter(res));
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          res.end(JSON.stringify({ error: message, code: 'ASSTS_LOCAL_API_ERROR' }));
        }
      });

      console.log('[vite] ASSTS local API: /api/admin/site00-assts served on this dev server (not Vercel proxy).');
    },
  };
}
