/**
 * C1.9R3 — Deployment identity for Railway acceptance (no secrets).
 */

import { execSync } from 'node:child_process';
import { ANTHROPIC_CREATIVE_MODEL } from '../site00Evolve/creativeDirection/creativeIntelligence/config.js';

export type DeploymentIdentity = {
  deploymentCommit: string | null;
  deploymentTimestamp: string;
  providerModel: string;
  environmentMode: string;
};

export function getDeploymentIdentity(): DeploymentIdentity {
  let deploymentCommit: string | null = null;
  try {
    deploymentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().slice(0, 12);
  } catch {
    deploymentCommit =
      process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 12) ??
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ??
      null;
  }

  return {
    deploymentCommit,
    deploymentTimestamp: new Date().toISOString(),
    providerModel: ANTHROPIC_CREATIVE_MODEL,
    environmentMode: process.env.NODE_ENV ?? 'production',
  };
}
