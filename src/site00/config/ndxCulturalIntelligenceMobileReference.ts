/**
 * P0.VR.1D.10 — Mobile Cultural Intelligence full-screen reference snapshot.
 */

export const NDX_CULTURAL_INTELLIGENCE_REFERENCE_PATH =
  '/visual-references/founder/ndxbook/mobile-cultural-intelligence-fullscreen-reference.png';

export const NDX_CI_TABS = ['LIVE SIGNALS', 'WEEKLY FORECAST', 'ARCHIVE'] as const;
export const NDX_CI_ACTIVE_TAB = 'LIVE SIGNALS';

export type NdxCiSignalRow = { label: string; score: string };

export const NDX_CI_TOP_SIGNALS: NdxCiSignalRow[] = [
  { label: 'SUBSCRIPTION FATIGUE', score: '0.92' },
  { label: 'LOYALTY LANGUAGE DRIFT', score: '0.76' },
  { label: 'QUIET LUXURY SIGNAL', score: '0.71' },
  { label: 'CORPORATE MEMO LANGUAGE', score: '0.68' },
  { label: 'LAYOFF LANGUAGE SHIFT', score: '0.64' },
];

export const NDX_CI_RADAR_LABELS = ['Business', 'Technology', 'Money', 'Context', 'Life', 'Books'] as const;
