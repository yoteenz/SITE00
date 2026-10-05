/**
 * P0.DEPLOY.1 — Prevents overlapping cPanel frontend promotions.
 */

export type ProductionDeploymentLock = {
  locked: boolean;
  owner: string | null;
  releaseId: string | null;
  acquiredAt: string | null;
};

let lock: ProductionDeploymentLock = {
  locked: false,
  owner: null,
  releaseId: null,
  acquiredAt: null,
};

export function acquireProductionDeploymentLock(owner: string, releaseId: string): boolean {
  if (lock.locked) return false;
  lock = {
    locked: true,
    owner,
    releaseId,
    acquiredAt: new Date().toISOString(),
  };
  return true;
}

export function releaseProductionDeploymentLock(owner: string): boolean {
  if (!lock.locked || lock.owner !== owner) return false;
  lock = { locked: false, owner: null, releaseId: null, acquiredAt: null };
  return true;
}

export function getProductionDeploymentLock(): ProductionDeploymentLock {
  return { ...lock };
}

export function resetProductionDeploymentLockForTest(): void {
  lock = { locked: false, owner: null, releaseId: null, acquiredAt: null };
}
