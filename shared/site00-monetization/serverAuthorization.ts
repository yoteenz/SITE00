/**
 * SERVER AUTHORIZATION BOUNDARY.
 *
 *   UI gating      → client (entitlements.ts `clientGate`) — presentation only.
 *   Authorization  → trusted backend (this module) — the only place paid data or compute is released.
 *
 * A backend must resolve entitlements itself (from its billing provider / database) with source SERVER_VERIFIED.
 * Entitlements sent by a client are never trusted: CSS visibility or client state is not security.
 */

import { capabilityById, type ProjectMonetizationContract, type UsageLimit } from './contract.js';
import { hasCapability, type ResolvedEntitlements } from './entitlements.js';

export type AuthorizationResult =
  | { allowed: true; status: 200; capability: string }
  | { allowed: false; status: 401 | 402 | 403 | 503; capability: string; reason: string };

const UNAVAILABLE = new Set(['OFFLINE_BILLING', 'ENTITLEMENT_LOAD_FAILURE', 'PROVIDER_UNAVAILABLE']);

export function authorizeCapability(c: ProjectMonetizationContract, e: ResolvedEntitlements, capability: string): AuthorizationResult {
  const def = capabilityById(c, capability);
  if (!def) return { allowed: false, status: 403, capability, reason: 'UNKNOWN_CAPABILITY' };
  if (e.projectId !== c.projectId) return { allowed: false, status: 403, capability, reason: 'PROJECT_MISMATCH' };
  if (e.source !== 'SERVER_VERIFIED' || !e.authoritative) return { allowed: false, status: 401, capability, reason: 'UNTRUSTED_ENTITLEMENT_SOURCE' };
  if (def.safetyFloor) return { allowed: true, status: 200, capability };
  if (def.surfaceStatus === 'DISABLED') return { allowed: false, status: 403, capability, reason: 'SURFACE_DISABLED' };
  if (e.status === 'FALLBACK' && e.failure && UNAVAILABLE.has(e.failure) && !hasCapability(e, capability)) {
    return { allowed: false, status: 503, capability, reason: e.failure };
  }
  if (!hasCapability(e, capability)) return { allowed: false, status: 402, capability, reason: e.failure ?? 'CAPABILITY_REQUIRED' };
  return { allowed: true, status: 200, capability };
}

/** Usage check for metered capabilities. A limit whose number is not decided yet cannot be enforced → deny (fail closed). */
export function checkUsage(limit: UsageLimit | null, used: number): { allowed: boolean; remaining: number | null; reason: string } {
  if (!limit) return { allowed: false, remaining: null, reason: 'NO_LIMIT_DEFINED' };
  if (limit.period === 'UNLIMITED' || limit.tier === 'UNLIMITED') return { allowed: true, remaining: null, reason: 'UNLIMITED' };
  if (limit.amount === null) return { allowed: false, remaining: null, reason: 'LIMIT_TBD' };
  const remaining = Math.max(0, limit.amount - used);
  return { allowed: remaining > 0, remaining, reason: remaining > 0 ? 'WITHIN_LIMIT' : 'LIMIT_REACHED' };
}
