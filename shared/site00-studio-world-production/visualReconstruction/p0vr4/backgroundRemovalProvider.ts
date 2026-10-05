/**
 * P0.VR.4 — Background removal provider abstraction.
 * Supports Ideogram, Pixelcut, FAL models with configurable fallback.
 */

export type BackgroundRemovalProviderId = 'AUTO' | 'IDEOGRAM' | 'PIXELCUT' | 'FAL_BRIA' | 'FAL_BIREFNET';

export type BackgroundRemovalProviderSlot = {
  id: BackgroundRemovalProviderId;
  label: string;
  provider: string;
  model: string | null;
  available: boolean;
  unavailableReason?: string;
};

export type DesignBackgroundRemovalProvider = {
  selectProvider(
    preference: BackgroundRemovalProviderId,
    available: BackgroundRemovalProviderSlot[],
  ): BackgroundRemovalProviderSlot | null;
  defaultFallbackOrder: BackgroundRemovalProviderId[];
};

const FAL_BRIA = {
  id: 'FAL_BRIA' as const,
  label: 'FAL Bria',
  provider: 'fal',
  model: 'fal-ai/bria/background/remove',
};

const FAL_BIREFNET = {
  id: 'FAL_BIREFNET' as const,
  label: 'FAL BiRefNet',
  provider: 'fal',
  model: 'fal-ai/birefnet/v2',
};

const IDEOGRAM_SLOT: BackgroundRemovalProviderSlot = {
  id: 'IDEOGRAM',
  label: 'Ideogram',
  provider: 'ideogram',
  model: null,
  available: false,
  unavailableReason: 'IDEOGRAM UNAVAILABLE IN CURRENT PROVIDER CONFIGURATION',
};

const PIXELCUT_SLOT: BackgroundRemovalProviderSlot = {
  id: 'PIXELCUT',
  label: 'Pixelcut',
  provider: 'pixelcut',
  model: null,
  available: false,
  unavailableReason: 'PIXELCUT UNAVAILABLE IN CURRENT PROVIDER CONFIGURATION',
};

export function discoverBackgroundRemovalProviders(env?: {
  ideogramApiKey?: string;
  pixelcutApiKey?: string;
  falKey?: string;
}): BackgroundRemovalProviderSlot[] {
  const falAvailable = Boolean(env?.falKey?.trim());
  const slots: BackgroundRemovalProviderSlot[] = [
    {
      ...FAL_BRIA,
      available: falAvailable,
      unavailableReason: falAvailable ? undefined : 'FAL_KEY not configured',
    },
    {
      ...FAL_BIREFNET,
      available: falAvailable,
      unavailableReason: falAvailable ? undefined : 'FAL_KEY not configured',
    },
    {
      ...IDEOGRAM_SLOT,
      available: Boolean(env?.ideogramApiKey?.trim()),
      unavailableReason: env?.ideogramApiKey?.trim()
        ? undefined
        : 'IDEOGRAM UNAVAILABLE IN CURRENT PROVIDER CONFIGURATION',
      model: env?.ideogramApiKey?.trim() ? 'ideogram/background-remove' : null,
    },
    {
      ...PIXELCUT_SLOT,
      available: Boolean(env?.pixelcutApiKey?.trim()),
      unavailableReason: env?.pixelcutApiKey?.trim()
        ? undefined
        : 'PIXELCUT UNAVAILABLE IN CURRENT PROVIDER CONFIGURATION',
      model: env?.pixelcutApiKey?.trim() ? 'pixelcut/background-remove' : null,
    },
  ];
  return slots;
}

export const DEFAULT_BACKGROUND_REMOVAL_FALLBACK_ORDER: BackgroundRemovalProviderId[] = [
  'IDEOGRAM',
  'PIXELCUT',
  'FAL_BIREFNET',
  'FAL_BRIA',
];

export function resolveBackgroundRemovalProvider(
  preference: BackgroundRemovalProviderId,
  available: BackgroundRemovalProviderSlot[],
  fallbackOrder: BackgroundRemovalProviderId[] = DEFAULT_BACKGROUND_REMOVAL_FALLBACK_ORDER,
): BackgroundRemovalProviderSlot | null {
  if (preference !== 'AUTO') {
    const chosen = available.find((s) => s.id === preference);
    if (chosen?.available && chosen.model) return chosen;
    if (chosen && !chosen.available) return null;
  }

  for (const id of fallbackOrder) {
    const slot = available.find((s) => s.id === id);
    if (slot?.available && slot.model) return slot;
  }

  const anyFal = available.find((s) => s.available && s.provider === 'fal' && s.model);
  return anyFal ?? null;
}

export function ideogramProviderSupported(available: BackgroundRemovalProviderSlot[]): boolean {
  const slot = available.find((s) => s.id === 'IDEOGRAM');
  return Boolean(slot?.available && slot.model);
}

export function pixelcutProviderSupported(available: BackgroundRemovalProviderSlot[]): boolean {
  const slot = available.find((s) => s.id === 'PIXELCUT');
  return Boolean(slot?.available && slot.model);
}

export function ideogramDoesNotFabricateEndpoint(available: BackgroundRemovalProviderSlot[]): boolean {
  const slot = available.find((s) => s.id === 'IDEOGRAM');
  if (!slot) return true;
  if (!slot.available) return slot.model === null;
  return Boolean(slot.model);
}
