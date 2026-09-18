/**
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 — Grok staged assets (no live model in this module).
 */

export type GrokAssetMode =
  | 'PAGE_ASSET_PACK'
  | 'SINGLE_ASSET'
  | 'ICON_SYSTEM'
  | 'REPLACE_ASSET'
  | 'ASSET_VARIATION';

export type GrokAttachmentClass =
  | 'REFERENCE'
  | 'CURRENT_SCREEN'
  | 'GOLDEN'
  | 'STYLE_REFERENCE'
  | 'ASSET_TO_MODIFY';

export type GrokStagedAsset = {
  assetId: string;
  projectId: string;
  pageId: string;
  slot: string;
  format: string;
  width: number;
  height: number;
  previewDataUrl: string;
  status: 'STAGED' | 'APPROVED' | 'REJECTED';
  origin: 'GROK';
  runId: string;
  createdAt: string;
};

export type GrokAssetRun = {
  runId: string;
  projectId: string;
  pageId: string;
  conceptId: string | null;
  viewport: string;
  mode: GrokAssetMode;
  prompt: string;
  attachments: readonly { name: string; class: GrokAttachmentClass; dataUrl: string }[];
  outputs: readonly string[];
  approvedOutputs: readonly string[];
  rejectedOutputs: readonly string[];
  model: 'GROK';
  estimatedCostUsd: number | null;
  timestamp: string;
};

const STAGED_KEY = 'site00:design-grok-staged:v1';
const RUNS_KEY = 'site00:design-grok-runs:v1';

export function listStagedGrokAssets(projectId: string, pageId: string): GrokStagedAsset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STAGED_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as GrokStagedAsset[];
    return all.filter((a) => a.projectId === projectId && a.pageId === pageId && a.status === 'STAGED');
  } catch {
    return [];
  }
}

export function listApprovedGrokAssets(projectId: string, pageId: string): GrokStagedAsset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STAGED_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as GrokStagedAsset[];
    return all.filter((a) => a.projectId === projectId && a.pageId === pageId && a.status === 'APPROVED');
  } catch {
    return [];
  }
}

export function persistStagedGrokAsset(asset: GrokStagedAsset): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STAGED_KEY);
    const all = raw ? (JSON.parse(raw) as GrokStagedAsset[]) : [];
    const next = [...all.filter((a) => a.assetId !== asset.assetId), asset];
    window.localStorage.setItem(STAGED_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function approveGrokStagedAsset(assetId: string): GrokStagedAsset | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STAGED_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as GrokStagedAsset[];
    let approved: GrokStagedAsset | null = null;
    const next = all.map((a) => {
      if (a.assetId !== assetId) return a;
      approved = { ...a, status: 'APPROVED' as const };
      return approved;
    });
    window.localStorage.setItem(STAGED_KEY, JSON.stringify(next));
    return approved;
  } catch {
    return null;
  }
}

export function appendGrokAssetRun(run: GrokAssetRun): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(RUNS_KEY);
    const all = raw ? (JSON.parse(raw) as GrokAssetRun[]) : [];
    window.localStorage.setItem(RUNS_KEY, JSON.stringify([run, ...all].slice(0, 50)));
  } catch {
    /* quota */
  }
}

/** Fixture output — no live Grok API call. */
export function createFixtureGrokStagedAsset(input: {
  projectId: string;
  pageId: string;
  slot: string;
  runId: string;
}): GrokStagedAsset {
  const asset: GrokStagedAsset = {
    assetId: `grok-fixture-${Date.now()}`,
    projectId: input.projectId,
    pageId: input.pageId,
    slot: input.slot,
    format: 'PNG',
    width: 512,
    height: 512,
    previewDataUrl:
      'data:image/svg+xml,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="#101010" width="100%" height="100%"/><text x="50%" y="50%" fill="#c8ff00" font-family="monospace" font-size="18" text-anchor="middle">GROK FIXTURE</text></svg>`,
      ),
    status: 'STAGED',
    origin: 'GROK',
    runId: input.runId,
    createdAt: new Date().toISOString(),
  };
  persistStagedGrokAsset(asset);
  return asset;
}
