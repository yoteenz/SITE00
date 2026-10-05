/** Normalized provider errors — never expose secrets */

import type { ProviderErrorCode } from './types.js';

export class ProviderError extends Error {
  constructor(
    public readonly code: ProviderErrorCode,
    message: string,
    public readonly retryable = false,
    public readonly providerKey?: string,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export function normalizeProviderError(err: unknown, providerKey?: string): ProviderError {
  if (err instanceof ProviderError) return err;
  const message = err instanceof Error ? err.message : 'Provider error';
  if (message.includes('PUBLISHING_DISABLED')) {
    return new ProviderError('PUBLISHING_DISABLED', message, false, providerKey);
  }
  if (message.includes('REQUIRES_SECURE_CONFIGURATION')) {
    return new ProviderError('REQUIRES_SECURE_CONFIGURATION', message, false, providerKey);
  }
  return new ProviderError('PROVIDER_UNAVAILABLE', message, true, providerKey);
}

export function safeErrorMessage(err: unknown): string {
  if (err instanceof ProviderError) return err.message;
  return err instanceof Error ? err.message : 'Unknown provider error';
}
