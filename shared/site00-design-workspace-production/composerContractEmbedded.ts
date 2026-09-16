/** Browser-safe contract snapshot — full JSON lives in docs/design-workspace/composer-contract.json */
export const COMPOSER_CONTRACT_EMBEDDED = {
  version: '2.0.0',
  COMPOSER_CONTRACT_STATUS: 'FROZEN_FOR_PRODUCTIONIZATION',
  UNRESOLVED_DECISIONS: [] as unknown[],
  contractFreezeMetadata: {
    contractVersion: '2.0.0',
    contractHash: '2e96937727052b0fc5e868fb3a8ab3d2152ccf1d2e2b045028395fcfc567d9e8',
    frozenAt: '2026-09-16T00:00:00.000Z',
    frozenBy: 'COMPOSER',
    sourcePR: null,
    designAuthorityVersion: 'design-authority-v1',
    COMPOSER_CONTRACT_STATUS: 'FROZEN_FOR_PRODUCTIONIZATION',
  },
} as const;
