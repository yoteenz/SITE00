export type ReadinessBreakdown = {
  contentReadiness: number;
  creativeReadiness: number;
  assetReadiness: number;
  accessReadiness: number;
  dependencyReadiness: number;
  approvalReadiness: number;
  productionReadiness: number;
};

export function computeReadiness(input: {
  deliverablesComplete: number;
  deliverablesTotal: number;
  assetsPresent: number;
  assetsRequired: number;
  accessConnected: number;
  accessRequired: number;
  dependenciesClear: number;
  dependenciesTotal: number;
  approvalsClear: number;
  approvalsTotal: number;
}): ReadinessBreakdown {
  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 100);

  const contentReadiness = pct(input.deliverablesComplete, input.deliverablesTotal);
  const creativeReadiness = contentReadiness;
  const assetReadiness = pct(input.assetsPresent, input.assetsRequired);
  const accessReadiness = pct(input.accessConnected, input.accessRequired);
  const dependencyReadiness = pct(input.dependenciesClear, input.dependenciesTotal);
  const approvalReadiness = pct(input.approvalsClear, input.approvalsTotal);

  const productionReadiness = Math.round(
    (contentReadiness +
      creativeReadiness +
      assetReadiness +
      accessReadiness +
      dependencyReadiness +
      approvalReadiness) /
      6,
  );

  return {
    contentReadiness,
    creativeReadiness,
    assetReadiness,
    accessReadiness,
    dependencyReadiness,
    approvalReadiness,
    productionReadiness,
  };
}

export function phaseAwareAccessRequired(
  requiredPhase: string,
  currentPhase: string,
  connectionState: string,
): boolean {
  const phaseOrder = ['DISCOVERY', 'DESIGN', 'BUILD', 'LAUNCH'];
  const reqIdx = phaseOrder.indexOf(requiredPhase);
  const curIdx = phaseOrder.indexOf(currentPhase);
  if (reqIdx === -1 || curIdx === -1) return connectionState !== 'CONNECTED';
  if (curIdx < reqIdx) return false;
  return connectionState !== 'CONNECTED' && connectionState !== 'NOT_REQUIRED';
}
