/**
 * JURNL runtime entitlements — the UI's only monetization question is "does this account have CAPABILITY X?".
 *
 * Client resolutions are presentation-only (never authoritative): paid data and compute are authorized by a trusted
 * backend (shared/site00-monetization/serverAuthorization.ts). Optional `authorization` carries SERVER_VERIFIED rows
 * from GET /api/jurnl/entitlements. Optional `planPreview` simulates public plan UI without changing authorization.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { clientGate, hasCapability, resolveEntitlements, usageLimitFor, type ResolvedEntitlements } from '../../../../../shared/site00-monetization/entitlements.js';
import { JURNL_MONETIZATION_CONTRACT } from '../../data/monetization/contract';
import { mergePresentationEntitlements, type PlanPreviewState } from './presentationEntitlements';

const UiCtx = createContext<ResolvedEntitlements | null>(null);
const AuthCtx = createContext<ResolvedEntitlements | null>(null);
const PreviewCtx = createContext<PlanPreviewState | null>(null);

export function JurnlEntitlementsProvider({
  mode,
  value,
  authorization,
  planPreview,
  children,
}: {
  mode: 'design-preview' | 'production';
  /** @deprecated prefer `authorization` for server-verified rows */
  value?: ResolvedEntitlements;
  authorization?: ResolvedEntitlements;
  planPreview?: PlanPreviewState | null;
  children: ReactNode;
}) {
  const auth = useMemo(
    () =>
      authorization ??
      value ??
      resolveEntitlements(JURNL_MONETIZATION_CONTRACT, { source: mode === 'design-preview' ? 'DESIGN_PREVIEW' : 'NONE', subscription: null }),
    [authorization, value, mode],
  );
  const ui = useMemo(() => mergePresentationEntitlements(auth, planPreview ?? null), [auth, planPreview]);
  return (
    <AuthCtx.Provider value={auth}>
      <PreviewCtx.Provider value={planPreview ?? null}>
        <UiCtx.Provider value={ui}>{children}</UiCtx.Provider>
      </PreviewCtx.Provider>
    </AuthCtx.Provider>
  );
}

/** Presentation entitlements (respects plan preview simulation). */
export const useJurnlEntitlements = () => useContext(UiCtx);
/** Trusted authorization entitlements — use before calling paid APIs; server re-validates. */
export const useJurnlAuthorizationEntitlements = () => useContext(AuthCtx);
export const useJurnlPlanPreview = () => useContext(PreviewCtx);
export const useCapability = (capability: string) => hasCapability(useContext(UiCtx), capability);
export const useCapabilityGate = (capability: string) => clientGate(useContext(UiCtx), capability);
export function useUsageLimit(capability: string) {
  const e = useContext(UiCtx);
  return e ? usageLimitFor(e, capability) : null;
}
