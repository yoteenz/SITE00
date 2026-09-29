/**
 * ASSET RECEIPT LEDGER — the ONLY place fulfilled visual material is declared.
 *
 * Flow:  Grok output → canonical asset id → receipt (here) → declared slot → component renders it.
 * Composer appends receipts; components never import image files directly and never guess filenames.
 * Sonnet ships this EMPTY on purpose: no visual material was generated or mounted by Sonnet.
 */

import type { HubAssetReceipt } from './types.js';

export const HUB_ASSET_RECEIPTS: readonly HubAssetReceipt[] = [];
