/**
 * Reference pack system.
 */

import { createHash } from 'node:crypto';
import type { RealismReferenceItem, RealismReferencePack, RealismReferenceType } from '../types.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function createReferenceItem(params: {
  type: RealismReferenceType;
  label: string;
  source: string;
  url?: string | null;
  role: string;
  authorityLevel?: RealismReferenceItem['authorityLevel'];
  founderApproved?: boolean;
  continuityCritical?: boolean;
}): RealismReferenceItem {
  return {
    referenceId: `ref-${fp({ label: params.label, source: params.source, at: Date.now() })}`,
    type: params.type,
    label: params.label,
    source: params.source,
    url: params.url ?? null,
    approvalState: params.founderApproved ? 'FOUNDER_APPROVED' : 'DRAFT',
    role: params.role,
    authorityLevel: params.authorityLevel ?? 'MEDIUM',
    founderApproved: params.founderApproved ?? false,
    continuityCritical: params.continuityCritical ?? false,
  };
}

export function createReferencePack(label: string, items: RealismReferenceItem[]): RealismReferencePack {
  return {
    packId: `pack-${fp({ label, items: items.map((i) => i.referenceId) })}`,
    label,
    items,
    fingerprint: fp(items),
    createdAt: new Date().toISOString(),
  };
}

export function approveReferenceItem(pack: RealismReferencePack, referenceId: string): RealismReferencePack {
  return {
    ...pack,
    items: pack.items.map((item) =>
      item.referenceId === referenceId
        ? { ...item, approvalState: 'FOUNDER_APPROVED', founderApproved: true, continuityCritical: item.continuityCritical || item.authorityLevel === 'CONTINUITY_CRITICAL' }
        : item,
    ),
    fingerprint: fp(pack.items),
  };
}

export function listContinuityCriticalReferences(pack: RealismReferencePack | null): RealismReferenceItem[] {
  if (!pack) return [];
  return pack.items.filter((i) => i.continuityCritical || i.authorityLevel === 'CONTINUITY_CRITICAL');
}

export function mergeReferencePacks(base: RealismReferencePack, overlay: RealismReferencePack): RealismReferencePack {
  const merged = [...base.items, ...overlay.items.filter((o) => !base.items.some((b) => b.referenceId === o.referenceId))];
  return createReferencePack(`${base.label} + ${overlay.label}`, merged);
}
