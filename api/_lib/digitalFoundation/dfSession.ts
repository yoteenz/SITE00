import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const COOKIE_NAME = 'df_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const REENTRY_CODE_TTL_MS = 15 * 60 * 1000;

type DfSessionRecord = {
  session_id: string;
  artifact_id: string;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
};

type ReentryChallenge = {
  email: string;
  artifact_id: string;
  code_hash: string;
  expires_at: string;
  attempts: number;
};

const sessions = new Map<string, DfSessionRecord>();
const reentryByEmail = new Map<string, ReentryChallenge>();

function nowIso(): string {
  return new Date().toISOString();
}

function hashCode(code: string): string {
  return createHash('sha256').update(code, 'utf8').digest('hex');
}

function parseCookies(req: VercelRequest): Record<string, string> {
  const raw = req.headers.cookie ?? '';
  const out: Record<string, string> = {};
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join('='));
  }
  return out;
}

export function readDfSessionId(req: VercelRequest): string | null {
  const id = parseCookies(req)[COOKIE_NAME];
  return id && id.length >= 16 ? id : null;
}

function setSessionCookie(res: VercelResponse, sessionId: string, maxAgeSec: number): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`,
  );
}

export function clearSessionCookie(res: VercelResponse): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

export function createDfSession(artifactId: string): DfSessionRecord {
  const session_id = randomBytes(32).toString('base64url');
  const rec: DfSessionRecord = {
    session_id,
    artifact_id: artifactId,
    created_at: nowIso(),
    last_seen_at: nowIso(),
    expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
  sessions.set(session_id, rec);
  return rec;
}

export function touchDfSession(sessionId: string): DfSessionRecord | null {
  const rec = sessions.get(sessionId);
  if (!rec) return null;
  if (new Date(rec.expires_at).getTime() < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  rec.last_seen_at = nowIso();
  return rec;
}

export function resolveDfSessionArtifactId(sessionId: string | null): string | null {
  if (!sessionId) return null;
  const rec = touchDfSession(sessionId);
  return rec?.artifact_id ?? null;
}

export function establishDfSessionForArtifact(artifactId: string, res: VercelResponse): string {
  const rec = createDfSession(artifactId);
  setSessionCookie(res, rec.session_id, Math.floor(SESSION_TTL_MS / 1000));
  return rec.session_id;
}

export function issueReentryCode(artifactId: string, email: string): { code: string; expires_at: string } {
  const normalized = email.trim().toLowerCase();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  reentryByEmail.set(normalized, {
    email: normalized,
    artifact_id: artifactId,
    code_hash: hashCode(code),
    expires_at: new Date(Date.now() + REENTRY_CODE_TTL_MS).toISOString(),
    attempts: 0,
  });
  return { code, expires_at: reentryByEmail.get(normalized)!.expires_at };
}

export function verifyReentryCode(email: string, code: string): { ok: true; artifact_id: string } | { ok: false } {
  const normalized = email.trim().toLowerCase();
  const challenge = reentryByEmail.get(normalized);
  if (!challenge) return { ok: false };
  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    reentryByEmail.delete(normalized);
    return { ok: false };
  }
  challenge.attempts += 1;
  if (challenge.attempts > 8) {
    reentryByEmail.delete(normalized);
    return { ok: false };
  }
  const a = Buffer.from(challenge.code_hash, 'utf8');
  const b = Buffer.from(hashCode(code.trim()), 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false };
  reentryByEmail.delete(normalized);
  return { ok: true, artifact_id: challenge.artifact_id };
}

/** Test helper */
export function resetDfSessionsForTest(): void {
  sessions.clear();
  reentryByEmail.clear();
}
