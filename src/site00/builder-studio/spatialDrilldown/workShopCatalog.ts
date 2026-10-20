import { CAPABILITY_BY_ID } from '../../builder-experience/registry';
import type { BuilderSelection, CapabilityId } from '../../builder-experience/types';
import { effectiveCapabilities } from '../../builder-experience/rules';
import type { InclusionStatus, WorkSubOptionId } from './types';

export type WorkSubOptionView = {
  id: WorkSubOptionId;
  label: string;
  plain: string;
  status: InclusionStatus;
  capability: CapabilityId | null;
  blockedReason: string | null;
};

/** Source-grounded SHOP / SELL sub-scope for the WORK vertical slice. */
export function shopSubOptions(selection: BuilderSelection): WorkSubOptionView[] {
  const caps = new Set(effectiveCapabilities(selection));
  const shopOn = caps.has('SELL');
  return [
    {
      id: 'CATALOG_CHECKOUT',
      label: 'CATALOG · BAG · CHECKOUT',
      plain: CAPABILITY_BY_ID.SELL.plain.toUpperCase(),
      status: shopOn ? 'INCLUDED' : 'UNAVAILABLE',
      capability: 'SELL',
      blockedReason: shopOn ? null : 'ADD SHOP IN ROOM 03 TO INCLUDE SELL.',
    },
    {
      id: 'PAYMENTS',
      label: 'TAKE PAYMENT',
      plain: CAPABILITY_BY_ID.PAYMENTS.plain.toUpperCase(),
      status: shopOn ? 'INCLUDED' : 'UNAVAILABLE',
      capability: 'PAYMENTS',
      blockedReason: shopOn ? null : 'INCLUDED WITH SELL WHEN SHOP IS ON.',
    },
    {
      id: 'CUSTOMER_ACCOUNTS',
      label: 'CUSTOMER ACCOUNTS',
      plain: 'OPTIONAL ACCOUNTS FOR RETURNING BUYERS AND ORDER HISTORY.',
      status: caps.has('ACCOUNTS') ? 'SELECTED' : shopOn ? 'OPTIONAL' : 'UNAVAILABLE',
      capability: 'ACCOUNTS',
      blockedReason: shopOn ? null : 'REQUIRES SHOP FIRST.',
    },
  ];
}

export function canToggleAccounts(selection: BuilderSelection): { ok: true } | { ok: false; reason: string } {
  const caps = effectiveCapabilities(selection);
  if (!caps.includes('SELL')) return { ok: false, reason: 'SHOP MUST BE ON TO ADD ACCOUNTS FOR BUYERS.' };
  return { ok: true };
}

export function selectionWithAccounts(selection: BuilderSelection, on: boolean): BuilderSelection {
  const set = new Set(selection.capabilities);
  if (on) set.add('ACCOUNTS');
  else set.delete('ACCOUNTS');
  return { ...selection, capabilities: [...set] };
}
