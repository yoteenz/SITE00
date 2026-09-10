/**
 * P0.DEPLOY.1 — Current deployment topology (audited from repo).
 */

import type { DeploymentTarget } from './types.js';
import {
  P0_DEPLOY_1_BUILD,
  SITE00_PRODUCTION_API_URL,
  SITE00_PRODUCTION_FRONTEND_URL,
} from './constants.js';

export type CurrentDeploymentTopology = {
  frontend: {
    stack: 'React 19 + Vite 5';
    buildOutput: 'dist/';
    productionHost: 'GoDaddy cPanel (static public_html)';
    productionDomain: string;
    deploymentMechanism: 'GitHub Actions → FTP/SFTP (primary); ZIP manual (emergency fallback)';
    versionSource: 'shared/site00-release-engine/constants.ts + release-manifest.json';
  };
  backend: {
    stack: 'Express + tsx (server/index.ts)';
    host: 'Railway';
    startCommand: 'npm run start:api';
    builder: 'NIXPACKS (nixpacks.toml)';
    healthPath: '/api/health';
    productionDomain: string;
    deploymentMechanism: 'Railway auto-deploy from main';
    versionSource: 'P0_DEPLOY_1_BUILD + /api/health release receipt';
    workerBoot: 'startCaptureWorker() on API boot';
  };
  releaseTrigger: 'merge/push to main';
};

export function describeCurrentDeploymentTopology(): CurrentDeploymentTopology {
  return {
    frontend: {
      stack: 'React 19 + Vite 5',
      buildOutput: 'dist/',
      productionHost: 'GoDaddy cPanel (static public_html)',
      productionDomain: SITE00_PRODUCTION_FRONTEND_URL,
      deploymentMechanism: 'GitHub Actions → FTP/SFTP (primary); ZIP manual (emergency fallback)',
      versionSource: 'shared/site00-release-engine/constants.ts + release-manifest.json',
    },
    backend: {
      stack: 'Express + tsx (server/index.ts)',
      host: 'Railway',
      startCommand: 'npm run start:api',
      builder: 'NIXPACKS (nixpacks.toml)',
      healthPath: '/api/health',
      productionDomain: SITE00_PRODUCTION_API_URL,
      deploymentMechanism: 'Railway auto-deploy from main',
      versionSource: 'P0_DEPLOY_1_BUILD + /api/health release receipt',
      workerBoot: 'startCaptureWorker() on API boot',
    },
    releaseTrigger: 'merge/push to main',
  };
}

export function defaultProductionTarget(): DeploymentTarget {
  return {
    targetId: 'site00-production',
    projectId: 'site00',
    environment: 'production',
    frontendStrategy: 'cpanel_ftp',
    frontendHost: SITE00_PRODUCTION_FRONTEND_URL,
    backendStrategy: 'railway_auto',
    backendHost: SITE00_PRODUCTION_API_URL,
    buildCommand: 'npm run build',
    outputDir: 'dist',
    releasePath: '/public_html',
    verificationUrl: SITE00_PRODUCTION_FRONTEND_URL,
    enabled: true,
  };
}

export const CURRENT_RELEASE_BUILD = P0_DEPLOY_1_BUILD;
