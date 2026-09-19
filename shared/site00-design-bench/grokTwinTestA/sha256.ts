export async function sha256HexFromBytes(bytes: ArrayBuffer | Uint8Array): Promise<string> {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const copy = view.slice();
    const digest = await globalThis.crypto.subtle.digest('SHA-256', copy);
    return toHex(new Uint8Array(digest));
  }
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(Buffer.from(view)).digest('hex');
}

export async function sha256HexFromBuffer(buffer: Uint8Array): Promise<string> {
  return sha256HexFromBytes(buffer);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
