/**
 * JURNL runtime entitlements — the UI's only monetization question is "does this account have CAPABILITY X?".
 *
 * Today: no billing exists, so every account resolves to the default (free) plan. In the design workspace the source
 * is DESIGN_PREVIEW; otherwise NONE. Client resolutions are presentation-only (never authoritative): paid data and
 * compute are authorized by a trusted backend (shared/site00-monetization/serverAuthorization.ts).
 * Invisible to F01 — no DOM, no copy.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { clientGate, hasCapability, resolveEntitlements, usageLimitFor, type ResolvedEntitlements } from '../../../../../shared/site00-monetization/entitlements.js';
import { JURNL_MONETIZATION_CONTRACT } from '../../data/monetization/contract';

const Ctx = createContext<ResolvedEntitlements | null>(null);

export function JurnlEntitlementsProvider({ mode, value, children }: { mode: 'design-preview' | 'production'; value?: ResolvedEntitlements; children: ReactNode }) {
  const resolved = useMemo(
    () => value ?? resolveEntitlements(JURNL_MONETIZATION_CONTRACT, { source: mode === 'design-preview' ? 'DESIGN_PREVIEW' : 'NONE', subscription: null }),
    [mode, value],
  );
  return <Ctx.Provider value={resolved}>{children}</Ctx.Provider>;
}

/** Resolved entitlements, or null outside a provider (callers must treat null as "withhold"). */
export const useJurnlEntitlements = () => useContext(Ctx);
export const useCapability = (capability: string) => hasCapability(useContext(Ctx), capability);
export const useCapabilityGate = (capability: string) => clientGate(useContext(Ctx), capability);
export function useUsageLimit(capability: string) {
  const e = useContext(Ctx);
  return e ? usageLimitFor(e, capability) : null;
}
