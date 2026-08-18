/**
 * Get authenticated user from request (Bearer token from Supabase Auth).
 * Returns { id, email, accessToken } or null.
 */
import { VercelRequest } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export async function getAuthUser(req: VercelRequest): Promise<{ id: string; email: string; accessToken: string } | null> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return { id: user.id, email: user.email ?? '', accessToken: token };
}
