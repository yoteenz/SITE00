import type { ProviderCapability } from './types.js';

/** Provider capability check — no silent text fallback when reference input is unsupported. */
export function getProviderReferenceCapability(provider: string, model: string): ProviderCapability {
  const p = provider.toLowerCase();
  const m = model.toLowerCase();
  if (p === 'openart' && (m.includes('gpt-image') || m.includes('image'))) {
    return { supportsReferenceInput: true };
  }
  if (p === 'fal' && (m.includes('edit') || m.includes('image-to-image') || m.includes('i2i'))) {
    return { supportsReferenceInput: true };
  }
  if (p === 'fal' && m.includes('flux') && m.includes('redux')) {
    return { supportsReferenceInput: true };
  }
  return { supportsReferenceInput: false };
}

export function providerSupportsReferenceInput(provider: string, model: string): boolean {
  return getProviderReferenceCapability(provider, model).supportsReferenceInput;
}
