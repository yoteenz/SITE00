import fs from 'node:fs';
import path from 'node:path';
import { familyKey } from '../site00-production-guardrails/familyEnvironmentDistinctness.js';
import type { CostReceipt } from '../site00-production-guardrails/providerGateway/costReceipt.js';
import type { JurnlLineageRecord } from './types.js';

const MATRIX_PATH = 'JURNL/MANIFEST/JURNL_FAMILY_EXPRESSION_MATRIX.json';

function resolveLedgerPath(repoRoot: string, familyId: string): string | null {
  const key = familyKey(familyId);
  const candidates = [
    path.join(repoRoot, 'JURNL', `${key}_TODAY`, 'MANIFEST', `${key}_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_ACTIVITY`, 'MANIFEST', `${key}_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_ENTRY`, 'MANIFEST', `${key}_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_SETUP`, 'MANIFEST', 'GENERATION_LEDGER.json'),
    path.join(repoRoot, 'JURNL', `${key}_MONEY`, 'MANIFEST', `${key}_PARENT_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_INCOME`, 'MANIFEST', `${key}_PARENT_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_UPCOMING`, 'MANIFEST', `${key}_PARENT_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_PLAN`, 'MANIFEST', `${key}_PARENT_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_SAFE`, 'MANIFEST', `${key}_PARENT_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_PURCHASES`, 'MANIFEST', `${key}_PARENT_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_TRIPS`, 'MANIFEST', `${key}_PARENT_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_CREDIT`, 'MANIFEST', `${key}_PARENT_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_PAYDOWN`, 'MANIFEST', `${key}_PARENT_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_GOALS`, 'MANIFEST', `${key}_PARENT_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_AHEAD`, 'MANIFEST', `${key}_PARENT_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'JURNL', `${key}_RECORDS`, 'MANIFEST', `${key}_PARENT_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'src/projects/jurnl/families', `${key}_TODAY`, 'MANIFEST', `${key}_GENERATION_LEDGER.json`),
    path.join(repoRoot, 'src/projects/jurnl/families', `${key}_ACTIVITY`, 'MANIFEST', `${key}_GENERATION_LEDGER.json`),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  const matrixFile = path.join(repoRoot, MATRIX_PATH);
  if (fs.existsSync(matrixFile)) {
    const matrix = JSON.parse(fs.readFileSync(matrixFile, 'utf8')) as {
      families?: Record<string, { repo_folder?: string }>;
    };
    const folder = matrix.families?.[key]?.repo_folder;
    if (folder) {
      const parentLedger = path.join(repoRoot, folder, 'MANIFEST', `${key}_PARENT_GENERATION_LEDGER.json`);
      if (fs.existsSync(parentLedger)) return parentLedger;
      const genLedger = path.join(repoRoot, folder, 'MANIFEST', `${key}_GENERATION_LEDGER.json`);
      if (fs.existsSync(genLedger)) return genLedger;
    }
  }
  return null;
}

export function createJurnlFamilyLedgerCostReceiptWriter(repoRoot: string): {
  write: (receipt: CostReceipt) => Promise<void>;
  writeLineage: (lineage: JurnlLineageRecord) => Promise<void>;
} {
  return {
    async write(receipt) {
      const ledgerPath = resolveLedgerPath(repoRoot, receipt.familyId);
      if (!ledgerPath) return;
      const doc = JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) as Record<string, unknown>;
      const gatewayReceipts = (doc.gateway_receipts as unknown[]) ?? [];
      gatewayReceipts.push(receipt);
      doc.gateway_receipts = gatewayReceipts;
      doc.last_gateway_receipt_at = receipt.createdAt;
      fs.writeFileSync(ledgerPath, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
    },
    async writeLineage(lineage) {
      const ledgerPath = resolveLedgerPath(repoRoot, lineage.familyId);
      if (!ledgerPath) return;
      const doc = JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) as Record<string, unknown>;
      const entries = (doc.gateway_lineage as unknown[]) ?? [];
      entries.push(lineage);
      doc.gateway_lineage = entries;
      doc.last_gateway_lineage_at = lineage.createdAt;
      fs.writeFileSync(ledgerPath, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
    },
  };
}
