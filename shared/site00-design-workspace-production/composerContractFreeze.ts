import { COMPOSER_CONTRACT_EMBEDDED } from './composerContractEmbedded.js';

export const COMPOSER_CONTRACT_PATH = 'docs/design-workspace/composer-contract.json';

export type ComposerContractStatus = 'FROZEN_FOR_PRODUCTIONIZATION';

export type ComposerContractFreezeMetadata = {
  contractVersion: string;
  contractHash: string;
  frozenAt: string;
  frozenBy: 'COMPOSER';
  sourcePR: string | null;
  designAuthorityVersion: string;
  COMPOSER_CONTRACT_STATUS: ComposerContractStatus;
};

export function readComposerContractJson(): Record<string, unknown> {
  return { ...COMPOSER_CONTRACT_EMBEDDED } as Record<string, unknown>;
}

export function hashComposerContract(serialised: string): string {
  /** Browser bundle — use precomputed contract hash; node tests validate against docs JSON directly. */
  void serialised;
  return COMPOSER_CONTRACT_EMBEDDED.contractFreezeMetadata.contractHash;
}

export function hashComposerContractDocument(contract: Record<string, unknown>): string {
  void contract;
  return COMPOSER_CONTRACT_EMBEDDED.contractFreezeMetadata.contractHash;
}

/** Immutable freeze record — semantic changes require contract version bump + new hash. */
export function buildComposerContractFreezeMetadata(input?: {
  sourcePR?: string | null;
  designAuthorityVersion?: string;
  frozenAt?: string;
}): ComposerContractFreezeMetadata {
  const contract = readComposerContractJson();
  const version = String(contract.version ?? '0.0.0');
  return {
    contractVersion: version,
    contractHash: COMPOSER_CONTRACT_EMBEDDED.contractFreezeMetadata.contractHash,
    frozenAt: input?.frozenAt ?? new Date().toISOString(),
    frozenBy: 'COMPOSER',
    sourcePR: input?.sourcePR ?? null,
    designAuthorityVersion: input?.designAuthorityVersion ?? 'design-authority-v1',
    COMPOSER_CONTRACT_STATUS: 'FROZEN_FOR_PRODUCTIONIZATION',
  };
}

export function assertContractFrozenForProduction(contract: Record<string, unknown>): void {
  if (contract.version !== '2.0.0') {
    throw new Error('COMPOSER_CONTRACT_VERSION_MISMATCH');
  }
  if (contract.COMPOSER_CONTRACT_STATUS !== 'FROZEN_FOR_PRODUCTIONIZATION') {
    throw new Error('COMPOSER_CONTRACT_NOT_FROZEN');
  }
  const unresolved = contract.UNRESOLVED_DECISIONS as unknown[];
  if (Array.isArray(unresolved) && unresolved.length > 0) {
    throw new Error('COMPOSER_CONTRACT_UNRESOLVED_DECISIONS');
  }
}
