import { describe, expect, it } from 'vitest';
import { galleryEntriesForZone } from '../src/site00/pages/foundation/digitalFoundationReviewZones';
import { resolveReviewEntry } from '../src/site00/pages/foundation/digitalFoundationReviewRegistry';

const AUTHORITY_SCREENS: { ref: string; anchor: string; zone: 'CLIENT_QUEUE' | 'CLIENT_PORTAL' | 'CLIENT_COMPLETION' | 'FOUNDER' }[] = [
  { ref: '10', anchor: 'df-r-needs-you-approval', zone: 'CLIENT_PORTAL' },
  { ref: '11', anchor: 'df-r-complete', zone: 'CLIENT_COMPLETION' },
  { ref: '13A', anchor: 'df-r-OVERVIEW', zone: 'CLIENT_PORTAL' },
  { ref: '13A-detail', anchor: 'df-r-record-domain', zone: 'CLIENT_PORTAL' },
  { ref: '13', anchor: 'df-r-founder-foundation_pipeline', zone: 'FOUNDER' },
  { ref: '14', anchor: 'df-r-founder-project_command', zone: 'FOUNDER' },
  { ref: '15', anchor: 'df-r-founder-execution_workbench', zone: 'FOUNDER' },
];

describe('digital foundation lifecycle recovery registry', () => {
  it('registers authority screens with distinct anchors in lifecycle zones', () => {
    for (const row of AUTHORITY_SCREENS) {
      const entry = resolveReviewEntry(row.anchor);
      expect(entry, row.ref).toBeTruthy();
      const zoneAnchors = galleryEntriesForZone(row.zone).map((e) => e.anchorId);
      expect(zoneAnchors, row.ref).toContain(row.anchor);
    }
  });

  it('separates pre-activation queue from active portal zone', () => {
    const queue = galleryEntriesForZone('CLIENT_QUEUE').map((e) => e.anchorId);
    const portal = galleryEntriesForZone('CLIENT_PORTAL').map((e) => e.anchorId);
    expect(queue).toContain('df-r-post-intake-submitted');
    expect(portal).toContain('df-r-OVERVIEW');
    expect(portal).not.toContain('df-r-post-intake-submitted');
  });
});
