/**
 * JURNL data modes. Exactly one is active per runtime, and every snapshot records the mode it was created in.
 *
 *   DESIGN_PREVIEW    the SITE 00 design workspace. Explicitly labelled synthetic sample data (MOCK_ENTRIES, the two
 *                     sample accounts, sample bills) is allowed here and only here.
 *   PROVIDER_SANDBOX  a real JURNL account connected to the provider's sandbox (synthetic institution data supplied by
 *                     the provider). Starts empty. Never mixed with production.
 *   PRODUCTION        a real JURNL account with real financial records. Starts empty: no sample transactions, no sample
 *                     accounts, no invented balances, no sample bills.
 *
 * Preview data is never imported into a sandbox or production account: device caches are keyed by mode, the server
 * refuses DESIGN_PREVIEW snapshots, and importSnapshotForUser drops a snapshot whose mode does not match.
 */

export type JurnlDataMode = 'DESIGN_PREVIEW' | 'PROVIDER_SANDBOX' | 'PRODUCTION';

let active: JurnlDataMode = 'DESIGN_PREVIEW';
const listeners = new Set<(m: JurnlDataMode) => void>();

export function getRepositoryDataMode(): JurnlDataMode {
  return active;
}

/** Internal: deviceRepository listens to swap its cache when the mode changes. */
export function onRepositoryDataModeChange(fn: (m: JurnlDataMode) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setRepositoryDataMode(mode: JurnlDataMode): void {
  if (mode === active) return;
  active = mode;
  listeners.forEach((l) => l(mode));
}

/** Runtime mode → data mode. A production runtime is PRODUCTION unless the deployment is explicitly a sandbox. */
export function dataModeForRuntime(runtimeMode: 'design-preview' | 'production', envMode?: string | null): JurnlDataMode {
  if (runtimeMode === 'design-preview') return 'DESIGN_PREVIEW';
  return envMode === 'PROVIDER_SANDBOX' ? 'PROVIDER_SANDBOX' : 'PRODUCTION';
}

export function viteDataModeSetting(): string | null {
  return (import.meta as unknown as { env?: { VITE_JURNL_DATA_MODE?: string } }).env?.VITE_JURNL_DATA_MODE ?? null;
}

/** Sample (synthetic) data may appear only in the design preview. Legacy snapshots without a mode are preview data. */
export function allowsSampleData(snapshotMode?: JurnlDataMode | null): boolean {
  return (snapshotMode ?? active) === 'DESIGN_PREVIEW' && active === 'DESIGN_PREVIEW';
}

export function isRealDataMode(mode: JurnlDataMode = active): boolean {
  return mode !== 'DESIGN_PREVIEW';
}
