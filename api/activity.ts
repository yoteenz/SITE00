import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth.js';
import { getSupabaseUser } from './_lib/supabase.js';

/** POST /api/activity – record a user activity event (authenticated). Body: { eventType, payload? } */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const eventType = (body.eventType || body.event_type || '').toString().trim();
  if (!eventType) return res.status(400).json({ error: 'eventType required' });

  const payload = body.payload && typeof body.payload === 'object' ? body.payload : {};

  try {
    const supabase = getSupabaseUser(user.accessToken);
    const { error } = await supabase.from('user_activity').insert({
      user_id: user.id,
      event_type: eventType,
      payload: payload,
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
