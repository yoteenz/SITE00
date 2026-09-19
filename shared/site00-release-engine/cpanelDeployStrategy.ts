/**
 * P0.DEPLOY.1 — cPanel deployment strategy resolution.
 */

export type CpanelDeployStrategy = 'github_actions_ftp' | 'github_actions_ssh_rsync' | 'cpanel_git' | 'manual_zip_fallback';

export type CpanelStrategyResolution = {
  strategy: CpanelDeployStrategy;
  reason: string;
  autoPromoteSupported: boolean;
  staleAssetCleanup: boolean;
  atomicPromotion: boolean;
};

export function resolveCpanelDeployStrategy(env: Record<string, string | undefined> = {}): CpanelStrategyResolution {
  if (env.GODADDY_SSH_HOST && env.GODADDY_SSH_USER && env.GODADDY_SSH_PRIVATE_KEY) {
    return {
      strategy: 'github_actions_ssh_rsync',
      reason: 'SSH credentials configured — prefer rsync sync with stale asset cleanup',
      autoPromoteSupported: true,
      staleAssetCleanup: true,
      atomicPromotion: false,
    };
  }
  if (env.GODADDY_FTP_HOST && env.GODADDY_FTP_USERNAME && env.GODADDY_FTP_PASSWORD) {
    return {
      strategy: 'github_actions_ftp',
      reason: 'FTP credentials configured — FTP-Deploy-Action with dangerous-clean-slate + host excludes',
      autoPromoteSupported: true,
      staleAssetCleanup: true,
      atomicPromotion: false,
    };
  }
  return {
    strategy: 'manual_zip_fallback',
    reason: 'No cPanel deploy credentials — emergency ZIP fallback only',
    autoPromoteSupported: false,
    staleAssetCleanup: false,
    atomicPromotion: false,
  };
}
