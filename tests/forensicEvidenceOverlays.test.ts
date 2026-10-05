/**
 * P0.VR.DIAG.1R1 — Forensic overlay helpers.
 */

import { describe, expect, it } from 'vitest';
import { resolveAllRegionForensics } from '../src/site00/components/designWorkspace/pageFamily/ForensicEvidenceOverlays.js';
import type { PageVisualDiagnosis } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageVisualDiagnosis.js';

describe('ForensicEvidenceOverlays', () => {
  it('resolveAllRegionForensics falls back to topVisualDifferences when allRegionForensics missing', () => {
    const diagnosis = {
      findings: [],
      topFindings: [],
      topVisualDifferences: [
        {
          evidenceId: 'ev-host',
          regionName: 'HOST HEADER',
          metric: 'height',
          authority: '52px',
          current: '52px',
          delta: '0px · 0%',
          confidence: 'MEDIUM',
          correction: '—',
          impactScore: 1,
        },
      ],
      summary: '',
      detectedAt: '2026-01-01T00:00:00.000Z',
    } as PageVisualDiagnosis;

    const regions = resolveAllRegionForensics(diagnosis);
    expect(regions).toHaveLength(1);
    expect(regions[0]?.regionId).toBe('ev-host');
    expect(regions[0]?.dimensions?.[0]?.authority).toBe('52px');
  });
});
