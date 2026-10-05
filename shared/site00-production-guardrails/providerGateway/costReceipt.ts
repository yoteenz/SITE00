import fs from 'node:fs';
import path from 'node:path';
import type { GenerationClass } from '../types.js';

export type CostReceiptStatus = 'ESTIMATED' | 'COMPLETED' | 'FAILED' | 'BLOCKED';

export type CostReceipt = {
  receiptId: string;
  requestId: string;
  authorizationId: string | null;
  projectId: string;
  familyId: string;
  visualId: string;
  generationClass: GenerationClass;
  provider: string;
  model: string;
  estimatedCredits: number | null;
  actualCredits: number | null;
  spendKind: 'PRODUCTIVE' | 'RETRY' | 'REPAIR' | 'FAILED' | 'REFUNDED';
  status: CostReceiptStatus;
  referenceAuthorityId: string | null;
  environmentPlateOrigin?: 'DERIVED_FROM_AUTHORITY' | 'NET_NEW_EXPLORATION';
  plateAuthorityId?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

const memoryReceipts: CostReceipt[] = [];

export function resetCostReceiptsForTests(): void {
  memoryReceipts.length = 0;
}

export function listCostReceiptsForTests(): readonly CostReceipt[] {
  return memoryReceipts;
}

export type CostReceiptWriter = {
  write(receipt: CostReceipt): Promise<void>;
};

export function createMemoryCostReceiptWriter(): CostReceiptWriter {
  return {
    async write(receipt) {
      memoryReceipts.push(receipt);
    },
  };
}

/** Append-only JSONL under repo data dir — durable without requiring new DB migration this sprint. */
export function createJsonlCostReceiptWriter(repoRoot: string): CostReceiptWriter {
  const dir = path.join(repoRoot, 'data', 'production-cost-receipts');
  return {
    async write(receipt) {
      memoryReceipts.push(receipt);
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, 'gateway-receipts.jsonl');
      fs.appendFileSync(file, `${JSON.stringify(receipt)}\n`, 'utf8');
    },
  };
}

export function buildCostReceipt(partial: Omit<CostReceipt, 'receiptId' | 'createdAt'>): CostReceipt {
  return {
    ...partial,
    receiptId: `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
}
