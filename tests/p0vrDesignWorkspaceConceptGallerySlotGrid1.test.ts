/**
 * P0.VR — Concept gallery A/B/C slot grid (stable column layout)
 */

import { describe, expect, it } from 'vitest';

import {
  mapPageConceptGalleryCurrentByMobileSlot,
  resolvePageConceptGalleryMobileSlotLabel,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryMobileSlotGrid.js';

describe('pageConceptGalleryMobileSlotGrid', () => {
  it('resolves slot from slotLabel or CONCEPT version string', () => {
    expect(resolvePageConceptGalleryMobileSlotLabel({ slotLabel: 'B' })).toBe('B');
    expect(resolvePageConceptGalleryMobileSlotLabel({ version: 'CONCEPT C' })).toBe('C');
  });

  it('maps partial current generation into fixed A/B/C columns', () => {
    const mapped = mapPageConceptGalleryCurrentByMobileSlot([
      { slotLabel: 'A', version: 'CONCEPT A' },
      { slotLabel: 'C', version: 'CONCEPT C' },
    ]);
    expect(mapped.A?.slotLabel).toBe('A');
    expect(mapped.B).toBeNull();
    expect(mapped.C?.slotLabel).toBe('C');
  });

  it('assigns unslotted candidates to first free column in order', () => {
    const mapped = mapPageConceptGalleryCurrentByMobileSlot([{ version: 'ENTRY' }]);
    expect(mapped.A).toEqual({ version: 'ENTRY' });
    expect(mapped.B).toBeNull();
    expect(mapped.C).toBeNull();
  });
});
