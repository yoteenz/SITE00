/**
 * P0.DEPLOY.1 — Unified release ID generation.
 */

import { P0_DEPLOY_1_BUILD } from './constants.js';

export function shortCommitSha(sha: string): string {
  return sha.replace(/^v/, '').slice(0, 7);
}

export function buildReleaseId(version: string, commitSha: string): string {
  const short = shortCommitSha(commitSha);
  const ver = version.replace(/^v/, '');
  return `site00-v${ver}-${short}`;
}

export function defaultReleaseVersion(): string {
  return P0_DEPLOY_1_BUILD;
}
