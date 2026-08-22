/**
 * SITE 00 standalone API server — mounts `api/` Vercel handlers on Express for Railway / Node hosts.
 */
import express from 'express';
import { API_ROUTES } from './routes.js';
import { loadEnvFiles } from './loadEnvFiles.js';
import { createVercelRequest, createVercelResponse } from './vercelAdapter.js';
import { ANTHROPIC_CREATIVE_MODEL } from '../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/config.js';
import { resolveCreativeIntelligenceProviderConfig } from '../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/providerConfig.js';

function applyServerEnv(): void {
  const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  const env = { ...process.env, ...loadEnvFiles(mode) } as Record<string, string | undefined>;
  const pairs: Array<[string, string | undefined]> = [
    ['SUPABASE_URL', env.SUPABASE_URL || env.VITE_SUPABASE_URL],
    ['SUPABASE_ANON_KEY', env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY],
    ['SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY],
    ['SESSION_COOKIE_SECRET', env.SESSION_COOKIE_SECRET],
    ['SESSION_COOKIE_SECURE', env.SESSION_COOKIE_SECURE],
    ['ADMIN_EMAILS', env.ADMIN_EMAILS || env.VITE_ADMIN_EMAILS],
    ['FAL_KEY', env.FAL_KEY],
    ['ANTHROPIC_API_KEY', env.ANTHROPIC_API_KEY],
    ['SITE00_CREATIVE_INTELLIGENCE_MODEL', env.SITE00_CREATIVE_INTELLIGENCE_MODEL],
    ['ANTHROPIC_CREATIVE_MODEL', env.ANTHROPIC_CREATIVE_MODEL],
    ['STUDIO_ASSETS_BUCKET', env.STUDIO_ASSETS_BUCKET],
    ['SITE00_ASSTS_BUCKET', env.SITE00_ASSTS_BUCKET],
    ['SITE00_ASSTS_LOADER_GEOMETRY_SECRET', env.SITE00_ASSTS_LOADER_GEOMETRY_SECRET],
  ];
  for (const [key, value] of pairs) {
    if (value && !process.env[key]) process.env[key] = value;
  }
}

applyServerEnv();

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  const provider = resolveCreativeIntelligenceProviderConfig();
  res.json({
    ok: true,
    service: 'site00-api',
    creativeIntelligence: {
      status: provider.status,
      providerId: provider.providerId,
      modelId: ANTHROPIC_CREATIVE_MODEL,
    },
  });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'site00-api' });
});

for (const { path, handler } of API_ROUTES) {
  app.all(path, async (req, res, next) => {
    try {
      await handler(createVercelRequest(req), createVercelResponse(res));
    } catch (err) {
      next(err);
    }
  });
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  console.error('[site00-api]', err);
  if (!res.headersSent) {
    res.status(500).json({ error: message });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`[site00-api] listening on http://0.0.0.0:${port}`);
});
