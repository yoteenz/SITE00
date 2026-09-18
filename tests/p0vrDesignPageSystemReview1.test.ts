/**
 * P0.VR.DESIGN-PAGE-SYSTEM-REVIEW1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { buildPageSystemReviewModel } from '../shared/site00-design-workspace-production/designPageSystemReview.js';
import { getDesignBoundPageByScreen } from '../shared/site00-design-workspace-production/designProjectBinding/designPageRegistry.js';
import { TWIN_OPUS_DIRECT_OUTPUT_TITLE } from '../src/site00/components/designBench/opusDirect/twinOpusDirectContent.js';

describe('P0.VR.DESIGN-PAGE-SYSTEM-REVIEW1', () => {
  it('uses PAGE SYSTEM REVIEW title instead of structured output', () => {
    expect(TWIN_OPUS_DIRECT_OUTPUT_TITLE).toBe('PAGE SYSTEM REVIEW');
  });

  it('lists direct child from registry parent relationship', () => {
    const contentOps = getDesignBoundPageByScreen('ndxbook', 'content-ops');
    expect(contentOps).toBeTruthy();
    const model = buildPageSystemReviewModel('ndxbook', contentOps!.pageId, 'MOBILE');
    expect(model.directChildCount).toBe(1);
    expect(model.children[0]?.screenId).toBe('campaign-board');
  });

  it('does not surface Entry001 evidence pack in assets panel model', () => {
    const overview = getDesignBoundPageByScreen('ndxbook', 'overview');
    const model = buildPageSystemReviewModel('ndxbook', overview!.pageId, 'MOBILE');
    expect(model.assets.every((a) => !a.slot.includes('ENTRY001'))).toBe(true);
  });

  it('maps interaction coverage from registry', () => {
    const overview = getDesignBoundPageByScreen('ndxbook', 'overview');
    const model = buildPageSystemReviewModel('ndxbook', overview!.pageId, 'MOBILE');
    expect(model.interactionSummary.total).toBeGreaterThan(20);
    expect(model.interactions.length).toBe(model.interactionSummary.total);
  });

  it('mounts DesignPageSystemReviewSection in canonical workspace', () => {
    const src = readFileSync(
      join(import.meta.dirname, '../src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx'),
      'utf8',
    );
    expect(src).toContain('DesignPageSystemReviewSection');
    expect(src).not.toContain('outputColumns.map');
  });
});
