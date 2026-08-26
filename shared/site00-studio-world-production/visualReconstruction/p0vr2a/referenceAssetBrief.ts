/**
 * P0.VR.2A — Reference asset brief builder.
 */

import type { ReferenceAssetBrief, ReferenceVisualAssetSlot } from './types.js';

export function buildReferenceAssetBrief(
  slot: ReferenceVisualAssetSlot,
  options: {
    referenceDescription?: string;
    subject?: string;
    brandAuthority?: string;
    identityAuthority?: string | null;
  } = {},
): ReferenceAssetBrief {
  const roleLabel = slot.assetRole.replace(/_/g, ' ').toLowerCase();
  return {
    briefId: `brief-${slot.slotId}`,
    slotId: slot.slotId,
    assetRole: slot.assetRole,
    visualPurpose: `Reconstruct ${roleLabel} for ${slot.screenId} at exact slot geometry.`,
    referenceDescription:
      options.referenceDescription ??
      `${roleLabel} visible in canonical reference region ${slot.regionId}.`,
    mustPreserve: [
      'reference composition',
      'material fidelity',
      'palette alignment',
      'slot-safe subject placement',
    ],
    mustExclude: ['UI chrome', 'navigation', 'live text overlays', 'buttons', 'form controls'],
    subject: options.subject ?? roleLabel,
    material: slot.assetType === 'PAPER_ARTIFACT' ? 'paper, tape, ink' : 'photographic/editorial',
    composition: `Center-weighted for ${slot.width}×${slot.height} ${slot.objectFit} slot.`,
    camera: 'Match reference framing; no dramatic perspective shift.',
    lighting: 'Match reference lighting and shadow direction.',
    palette: 'Match reference and project brand canon.',
    texture: slot.assetType === 'TEXTURE' ? 'preserve grain and paper tooth' : 'preserve surface detail',
    background: slot.backgroundBehavior,
    transparency: slot.transparencyRequired,
    identityAuthority: options.identityAuthority ?? (slot.requiresCharacterAuthority ? 'CharacterVisualAuthority required' : null),
    brandAuthority: options.brandAuthority ?? `${slot.projectId} brand canon`,
    referenceImageAuthority: Boolean(slot.referenceCropStoragePath),
    outputGeometry: {
      displayWidth: slot.width,
      displayHeight: slot.height,
      generationWidth: slot.generationWidth,
      generationHeight: slot.generationHeight,
      aspectRatio: slot.aspectRatio,
    },
  };
}
