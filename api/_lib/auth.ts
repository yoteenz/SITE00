/**
 * Get authenticated user from request (Bearer token from Supabase Auth).
 * Returns { id, email, accessToken } or null.
 *
 * Uses Supabase Auth REST (`/auth/v1/user`) so Railway/Node hosts without native
 * WebSocket (Node < 22) do not crash during token validation.
 */
import { VercelRequest } from '@vercel/node';

type SupabaseAuthUserResponse = {
  id?: string;
  email?: string | null;
};

export async function getAuthUser(
  req: VercelRequest,
): Promise<{ id: string; email: string; accessToken: string } | null> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) return null;

  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!baseUrl || !anonKey) return null;

  try {
    const res = await fetch(`${baseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: anonKey,
      },
    });
    if (!res.ok) return null;

    const user = (await res.json()) as SupabaseAuthUserResponse;
    if (!user?.id) return null;

    return {
      id: user.id,
      email: user.email ?? '',
      accessToken: token,
    };
  } catch {
    return null;
  }
}
