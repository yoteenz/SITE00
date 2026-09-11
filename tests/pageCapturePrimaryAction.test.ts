import { describe, expect, it } from 'vitest';
import {
  resolvePageCapturePrimaryLabel,
  shouldOfferPageUpgrade,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageCapturePrimaryAction.js';

describe('pageCapturePrimaryAction', () => {
  it('never shows UPGRADE label when upgrade gate is closed', () => {
    expect(
      resolvePageCapturePrimaryLabel({
        upgradeAllowed: false,
        liveState: 'VERIFYING_PREVIEW',
        nextActionLabel: 'UPGRADE THIS PAGE',
        hasStoredCapture: true,
      }),
    ).toBe('RECAPTURE');
  });

  it('shows CAPTURE NOW when no stored capture and upgrade blocked', () => {
    expect(
      resolvePageCapturePrimaryLabel({
        upgradeAllowed: false,
        liveState: 'NONE',
        nextActionLabel: 'UPGRADE THIS PAGE',
        hasStoredCapture: false,
      }),
    ).toBe('CAPTURE NOW');
  });

  it('requires both previews PASS before upgrade actions', () => {
    expect(
      shouldOfferPageUpgrade({
        upgradeAllowed: true,
        liveState: 'READY',
        designPreviewStatus: 'FAIL',
        livePreviewStatus: 'PASS',
        hasStoredCapture: true,
      }),
    ).toBe(false);
    expect(
      shouldOfferPageUpgrade({
        upgradeAllowed: true,
        liveState: 'READY',
        designPreviewStatus: 'PASS',
        livePreviewStatus: 'UNKNOWN',
        hasStoredCapture: true,
      }),
    ).toBe(false);
  });
});
