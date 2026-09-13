import type { ConceptAssetSlot } from '../p0vrTwinV22/types.js';

const UI_CONTAMINATION_ROLES = ['nav', 'metric', 'progress', 'activity', 'masthead', 'button'];

export function imageSlotPurityGuard(slot: ConceptAssetSlot): { pass: boolean; reason?: string } {
  if (slot.sourceStrategy !== 'CONCEPT_REGION_DERIVATION' && slot.sourceStrategy !== 'GENERATED_CONCEPT_ASSET') {
    return { pass: true };
  }
  const role = slot.role.toLowerCase();
  if (slot.objectId === 'full_page') {
    return { pass: false, reason: 'full authority frame not allowed in DOM-first twin' };
  }
  for (const needle of UI_CONTAMINATION_ROLES) {
    if (role.includes(needle)) {
      return { pass: false, reason: `TWIN_V2_IMAGE_SLOT_UI_CONTAMINATION: ${needle}` };
    }
  }
  if (slot.crop && !role.includes('photo') && !role.includes('media') && !role.includes('editorial')) {
    return { pass: false, reason: 'band crop on non-media slot' };
  }
  return { pass: true };
}
