import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import type { MarketingServiceCategory } from '../../shared/site00-marketing/types.js';
import {
  authorizeMarketingEngagement,
  confirmMarketingPayment,
  createMarketingEngagement,
  getMarketingEngagementPayload,
  listMarketingEngagementsForClient,
  provisionMarketingEngagement,
  submitMarketingReviewAction,
  syncMarketingEngagement,
  updateMarketingIntake,
  updateMarketingScope,
} from '../_lib/marketingEngagements/service.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const action = String(req.query.action ?? '');
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};

  try {
    if (req.method === 'GET') {
      switch (action) {
        case 'list':
          return res.status(200).json({ engagements: await listMarketingEngagementsForClient(user.email) });
        case 'detail': {
          const id = String(req.query.id ?? '');
          if (!id) return res.status(400).json({ error: 'id required' });
          return res.status(200).json(await syncMarketingEngagement(id, user.email));
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    if (req.method === 'POST') {
      const postAction = String(body.action ?? action);
      switch (postAction) {
        case 'create':
          return res.status(200).json(
            await createMarketingEngagement({
              clientEmail: user.email,
              clientUserId: user.id,
              serviceCategory: String(body.serviceCategory ?? 'campaign') as MarketingServiceCategory,
              campaignName: body.campaignName ? String(body.campaignName) : undefined,
            }),
          );
        case 'update-intake':
          return res.status(200).json(
            await updateMarketingIntake(String(body.id), user.email, body.intake ?? {}, {
              markComplete: Boolean(body.markComplete),
            }),
          );
        case 'update-scope':
          return res.status(200).json(await updateMarketingScope(String(body.id), user.email, body.scope ?? {}));
        case 'authorize':
          return res.status(200).json(await authorizeMarketingEngagement(String(body.id), user.email));
        case 'confirm-payment':
          return res.status(200).json(await confirmMarketingPayment(String(body.id), user.email));
        case 'provision':
          return res.status(200).json(await provisionMarketingEngagement(String(body.id)));
        case 'sync':
          return res.status(200).json(await syncMarketingEngagement(String(body.id), user.email));
        case 'review-action':
          return res.status(200).json(
            await submitMarketingReviewAction({
              engagementId: String(body.id),
              clientEmail: user.email,
              clientUserId: user.id,
              reviewId: String(body.reviewId),
              action: body.reviewActionType as 'APPROVE' | 'REQUEST_REVISION' | 'SELECT_DIRECTION',
              note: body.note ? String(body.note) : undefined,
              directionId: body.directionId ? String(body.directionId) : undefined,
            }),
          );
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    if (msg === 'ENGAGEMENT NOT FOUND') return res.status(404).json({ error: 'Engagement not found' });
    if (msg === 'PAYMENT NOT CONFIRMED') return res.status(409).json({ error: 'Payment not confirmed' });
    console.error('[marketing-engagements]', e);
    return res.status(500).json({ error: 'We could not complete this operation. Try again.' });
  }
}
