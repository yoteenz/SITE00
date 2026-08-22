import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import {
  confirmMarketingPayment,
  getMarketingEngagementPayload,
  listMarketingEngagementsAdmin,
  provisionMarketingEngagement,
  syncMarketingEngagement,
} from '../_lib/marketingEngagements/service.js';
import { studioWorldIntegrationStatus } from '../_lib/studioWorld/client.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const action = String(req.query.action ?? '');
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};

  try {
    if (req.method === 'GET') {
      switch (action) {
        case 'list':
          return res.status(200).json({
            engagements: await listMarketingEngagementsAdmin(),
            integrationStatus: studioWorldIntegrationStatus(),
          });
        case 'detail': {
          const id = String(req.query.id ?? '');
          return res.status(200).json(await syncMarketingEngagement(id));
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    if (req.method === 'POST') {
      const postAction = String(body.action ?? action);
      switch (postAction) {
        case 'confirm-payment':
          return res.status(200).json(await confirmMarketingPayment(String(body.id), admin.email, true));
        case 'provision':
          return res.status(200).json(await provisionMarketingEngagement(String(body.id)));
        case 'sync':
          return res.status(200).json(await syncMarketingEngagement(String(body.id)));
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[admin marketing]', e);
    return res.status(500).json({ error: 'Admin marketing operation failed' });
  }
}
