/**
 * QA-ONLY Digital Foundation API harness. Never deployed, never imported by the app.
 *
 *   npx tsx scripts/site00/df-client-qa/qa-df-api-server.ts
 *
 * - `/api/site00/digital-foundation-artifact` is Composer's REAL public handler on the service's in-memory store.
 * - `/__qa/df/*` drive the founder / Stripe side that a client browser cannot: create a link, mark a reviewed quote
 *   commercially ready, deliver the checkout-completed webhook through the real webhook path, record a refund.
 *   They call the real service functions; nothing here prices, schedules or changes state on its own.
 *
 * Refuses to start with Supabase persistence or a Stripe key configured: no client data, no live payments.
 */
import express from 'express';
import artifactHandler from '../../../api/site00/digital-foundation-artifact.js';
import {
  applyManualQuoteAdjustment,
  createArtifactForLead,
  createClientAction,
  markQuoteCommerciallyReady,
  materializeFixtureScenario,
  recordRefund,
} from '../../../api/_lib/digitalFoundation/service.js';
import { simulateStripeCheckoutCompleted } from '../../../api/_lib/digitalFoundation/payment/webhookHandler.js';
import { memGetArtifactByToken, memGetQuote, memSaveQuote } from '../../../api/_lib/digitalFoundation/memoryStore.js';
import { createVercelRequest, createVercelResponse } from '../../../server/vercelAdapter.js';

if (process.env.SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE === '1') {
  console.error('[qa-df] refusing to start: Supabase persistence is on (memory store only).');
  process.exit(1);
}
if (process.env.STRIPE_SECRET_KEY || process.env.SITE00_STRIPE_SECRET_KEY) {
  console.error('[qa-df] refusing to start: a Stripe key is set (no live or test payments from QA).');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production') {
  console.error('[qa-df] refusing to start in production mode.');
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: '1mb' }));

app.all('/api/site00/digital-foundation-artifact', async (req, res, next) => {
  try {
    await artifactHandler(createVercelRequest(req), createVercelResponse(res));
  } catch (err) {
    next(err);
  }
});

function artifactFor(token: unknown) {
  const a = memGetArtifactByToken(String(token ?? ''));
  if (!a) throw new Error('ARTIFACT_NOT_FOUND');
  return a;
}

const qa = express.Router();
/** Express 4 does not forward rejected promises to the error handler. */
const wrap =
  (fn: (req: express.Request, res: express.Response) => unknown) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) =>
    Promise.resolve()
      .then(() => fn(req, res))
      .catch(next);

qa.post('/create', wrap((req, res) => {
  const b = req.body ?? {};
  const a = createArtifactForLead({
    business_name: b.business_name ?? null,
    contact_name: b.contact_name ?? null,
    contact_email: b.contact_email ?? null,
    referral_kind: b.referral_kind ?? 'DIRECT',
  });
  res.json({ token: a.public_token });
}));

qa.post('/fixture', wrap(async (req, res) => {
  const { token } = await materializeFixtureScenario(String(req.body?.scenario ?? ''));
  res.json({ token });
}));

qa.post('/founder-ready', wrap((req, res) => {
  const q = markQuoteCommerciallyReady(artifactFor(req.body?.token).artifact_id);
  res.json({ quote_version: q.quote_version, founder_commercial_ready: q.founder_commercial_ready });
}));

qa.post('/adjust', wrap((req, res) => {
  const q = applyManualQuoteAdjustment(artifactFor(req.body?.token).artifact_id, Number(req.body?.minor ?? 0));
  res.json({ quote_version: q.quote_version });
}));

/** Delivers checkout.session.completed through the real webhook confirmation path (test mode, no Stripe). */
qa.post('/webhook-paid', wrap(async (req, res) => {
  const a = artifactFor(req.body?.token);
  if (!a.quote_id) throw new Error('QUOTE_NOT_FOUND');
  await simulateStripeCheckoutCompleted({ artifact_id: a.artifact_id, quote_id: a.quote_id });
  res.json({ ok: true });
}));

qa.post('/refund', wrap((req, res) => {
  recordRefund(artifactFor(req.body?.token).artifact_id, { qa: true });
  res.json({ ok: true });
}));

qa.post('/client-action', wrap((req, res) => {
  const r = createClientAction({
    artifact_id: artifactFor(req.body?.token).artifact_id,
    action_type: req.body?.action_type ?? 'AUTHORIZE_PROVIDER',
    title: String(req.body?.title ?? 'Authorize provider access'),
    detail: String(req.body?.detail ?? 'Approve SITE 00 as a delegate on your provider account.'),
  });
  res.json({ request_id: r.request_id });
}));

/** Ages the current quote past its expiry so the expired-quote state can be inspected. */
qa.post('/expire-quote', wrap((req, res) => {
  const a = artifactFor(req.body?.token);
  const q = a.quote_id ? memGetQuote(a.quote_id) : undefined;
  if (!q) throw new Error('QUOTE_NOT_FOUND');
  q.expires_at = new Date(Date.now() - 60_000).toISOString();
  memSaveQuote(q);
  res.json({ ok: true });
}));

app.use('/__qa/df', qa);
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
});

app.get('/health', (_req, res) => res.json({ ok: true, store: 'memory', qa: 'digital-foundation' }));

const port = Number(process.env.QA_DF_PORT) || 3110;
const server = app.listen(port, '127.0.0.1', () => console.log(`[qa-df] memory-store DF API on http://127.0.0.1:${port}`));
server.keepAliveTimeout = 120_000;
server.headersTimeout = 125_000;
