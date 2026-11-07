/**
 * Provider access-token vault: AES-256-GCM, key held by the API process only.
 *
 * JURNL_BANK_TOKEN_KEY: 32 random bytes, base64. JURNL_BANK_TOKEN_KEY_VERSION: integer (rotation).
 * Optional JURNL_BANK_TOKEN_KEY_PREVIOUS (+ _VERSION) keeps old ciphertexts readable during rotation.
 * The plaintext token exists only in memory for the duration of one provider call. It is never logged, never
 * returned by an API response, and never written anywhere but the jurnl_bank_item_secrets ciphertext column.
 */
import crypto from 'node:crypto';

export type SealedToken = { key_version: number; iv: string; ciphertext: string; auth_tag: string };

type Key = { version: number; key: Buffer };

function readKey(b64: string | undefined, version: string | undefined): Key | null {
  if (!b64) return null;
  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32) throw new Error('JURNL_BANK_TOKEN_KEY_INVALID');
  const v = Number(version ?? '1');
  if (!Number.isInteger(v) || v < 1) throw new Error('JURNL_BANK_TOKEN_KEY_VERSION_INVALID');
  return { version: v, key };
}

export class TokenVault {
  private readonly current: Key;
  private readonly byVersion = new Map<number, Buffer>();

  constructor(current: Key, previous: Key | null = null) {
    this.current = current;
    this.byVersion.set(current.version, current.key);
    if (previous && previous.version !== current.version) this.byVersion.set(previous.version, previous.key);
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env): TokenVault | null {
    const current = readKey(env.JURNL_BANK_TOKEN_KEY, env.JURNL_BANK_TOKEN_KEY_VERSION);
    if (!current) return null;
    const previous = readKey(env.JURNL_BANK_TOKEN_KEY_PREVIOUS, env.JURNL_BANK_TOKEN_KEY_PREVIOUS_VERSION);
    return new TokenVault(current, previous);
  }

  get keyVersion(): number {
    return this.current.version;
  }

  /** The item id is bound as additional authenticated data: a ciphertext moved to another item will not open. */
  seal(plaintext: string, itemId: string): SealedToken {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.current.key, iv);
    cipher.setAAD(Buffer.from(`jurnl-bank-item:${itemId}`, 'utf8'));
    const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    return { key_version: this.current.version, iv: iv.toString('base64'), ciphertext: ct.toString('base64'), auth_tag: cipher.getAuthTag().toString('base64') };
  }

  open(sealed: SealedToken, itemId: string): string {
    const key = this.byVersion.get(sealed.key_version);
    if (!key) throw new Error('JURNL_BANK_TOKEN_KEY_VERSION_UNAVAILABLE');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(sealed.iv, 'base64'));
    decipher.setAAD(Buffer.from(`jurnl-bank-item:${itemId}`, 'utf8'));
    decipher.setAuthTag(Buffer.from(sealed.auth_tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(sealed.ciphertext, 'base64')), decipher.final()]).toString('utf8');
  }
}

/** Redacts anything shaped like a provider token or secret before a message reaches a log line. */
export function redactSecrets(text: string): string {
  return text
    .replace(/(access|public|link|processor)-(sandbox|development|production)-[A-Za-z0-9-]+/g, '$1-$2-[REDACTED]')
    .replace(/("?(secret|access_token|public_token|client_secret|PLAID-SECRET)"?\s*[:=]\s*)"?[^",\s}]+"?/gi, '$1"[REDACTED]"');
}
