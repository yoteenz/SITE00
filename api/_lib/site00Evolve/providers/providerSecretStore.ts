/**
 * ProviderSecretStore — server-side credential abstraction.
 * Raw secrets NEVER stored on connection rows or returned to clients.
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';
import { randomUUID } from 'node:crypto';
import { getSupabaseAdmin } from '../../supabase.js';

export type SecretStoreResult =
  | { ok: true; secretRef: string }
  | { ok: false; code: 'REQUIRES_SECURE_CONFIGURATION'; message: string };

const memSecrets = new Map<string, Record<string, unknown>>();

export function useMemorySecretStore(): boolean {
  return process.env.EVOLVE_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

export function isSecretEncryptionConfigured(): boolean {
  return Boolean(process.env.EVOLVE_PROVIDER_SECRET_KEY?.trim());
}

function deriveKey(): Buffer {
  const raw = process.env.EVOLVE_PROVIDER_SECRET_KEY ?? '';
  return createHash('sha256').update(raw).digest();
}

function encryptPayload(payload: Record<string, unknown>): string {
  const key = deriveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const json = JSON.stringify(payload);
  const enc = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decryptPayload(blob: string): Record<string, unknown> {
  const buf = Buffer.from(blob, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const key = deriveKey();
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  return JSON.parse(dec) as Record<string, unknown>;
}

export function validateSecretStoreConfiguration(): { configured: boolean; message: string } {
  if (useMemorySecretStore()) return { configured: true, message: 'memory test mode' };
  if (!isSecretEncryptionConfigured()) {
    return {
      configured: false,
      message:
        'REQUIRES_SECURE_CONFIGURATION — set EVOLVE_PROVIDER_SECRET_KEY server-side before storing provider credentials',
    };
  }
  return { configured: true, message: 'encryption key configured' };
}

export async function storeProviderCredential(opts: {
  organizationId: string;
  providerKey: string;
  secretType?: string;
  payload: Record<string, unknown>;
  expiresAt?: string | null;
}): Promise<SecretStoreResult> {
  const validation = validateSecretStoreConfiguration();
  if (!validation.configured) {
    return { ok: false, code: 'REQUIRES_SECURE_CONFIGURATION', message: validation.message };
  }

  const secretRef = randomUUID();
  const secretType = opts.secretType ?? 'OAUTH_TOKEN';

  if (useMemorySecretStore()) {
    memSecrets.set(secretRef, { ...opts.payload, _org: opts.organizationId, _provider: opts.providerKey });
    return { ok: true, secretRef };
  }

  const encrypted_payload = encryptPayload(opts.payload);
  const { error } = await getSupabaseAdmin().from('site00_provider_secrets').upsert(
    {
      id: secretRef,
      organization_id: opts.organizationId,
      provider_key: opts.providerKey,
      secret_type: secretType,
      encrypted_payload,
      expires_at: opts.expiresAt ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'organization_id,provider_key,secret_type' },
  );
  if (error) throw error;
  return { ok: true, secretRef };
}

export async function getProviderCredential(
  secretRef: string,
  organizationId: string,
): Promise<Record<string, unknown> | null> {
  if (useMemorySecretStore()) {
    const cred = memSecrets.get(secretRef);
    if (!cred || cred._org !== organizationId) return null;
    const { _org, _provider, ...rest } = cred;
    return rest;
  }

  const { data, error } = await getSupabaseAdmin()
    .from('site00_provider_secrets')
    .select('*')
    .eq('id', secretRef)
    .eq('organization_id', organizationId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (!isSecretEncryptionConfigured()) return null;
  return decryptPayload(String(data.encrypted_payload));
}

export async function deleteProviderCredential(secretRef: string, organizationId: string): Promise<void> {
  if (useMemorySecretStore()) {
    memSecrets.delete(secretRef);
    return;
  }
  await getSupabaseAdmin()
    .from('site00_provider_secrets')
    .delete()
    .eq('id', secretRef)
    .eq('organization_id', organizationId);
}

export function redactForLogs(obj: Record<string, unknown>): Record<string, unknown> {
  const forbidden = ['access_token', 'refresh_token', 'client_secret', 'api_key', 'password', 'token'];
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (forbidden.some((f) => k.toLowerCase().includes(f))) out[k] = '[REDACTED]';
    else out[k] = v;
  }
  return out;
}

export function resetSecretStoreMemory(): void {
  memSecrets.clear();
}
