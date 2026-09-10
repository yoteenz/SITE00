/**
 * P0.VR.8R3R5 — Railway / deploy build strategy detection.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type DeploymentStrategy = 'DOCKER' | 'NIXPACKS' | 'RAILPACK' | 'OTHER';

export type DeploymentBuildReceipt = {
  strategy: DeploymentStrategy;
  sourceOfTruthFile: string;
  baseImage: string;
  nodeVersion: string;
  systemPackages: string[];
  playwrightInstallStep: string;
};

/** Ubuntu 24.04 Noble t64 names — must match nixpacks.toml + playwright nativeDeps ubuntu24.04-x64 */
const PLAYWRIGHT_APT_DEPS = [
  'ca-certificates',
  'fonts-liberation',
  'fonts-noto-color-emoji',
  'libasound2t64',
  'libatk-bridge2.0-0t64',
  'libatk1.0-0t64',
  'libatspi2.0-0t64',
  'libcairo2',
  'libcups2t64',
  'libdbus-1-3',
  'libdrm2',
  'libgbm1',
  'libglib2.0-0t64',
  'libnspr4',
  'libnss3',
  'libpango-1.0-0',
  'libx11-6',
  'libxcb1',
  'libxcomposite1',
  'libxdamage1',
  'libxext6',
  'libxfixes3',
  'libxkbcommon0',
  'libxrandr2',
] as const;

export function detectDeploymentStrategy(repoRoot = process.cwd()): DeploymentStrategy {
  if (existsSync(join(repoRoot, 'Dockerfile'))) return 'DOCKER';
  if (existsSync(join(repoRoot, 'nixpacks.toml'))) return 'NIXPACKS';
  if (existsSync(join(repoRoot, 'railpack.toml'))) return 'RAILPACK';
  const railwayToml = join(repoRoot, 'railway.toml');
  if (existsSync(railwayToml)) {
    const raw = readFileSync(railwayToml, 'utf8');
    if (/builder\s*=\s*["']NIXPACKS["']/i.test(raw)) return 'NIXPACKS';
    if (/builder\s*=\s*["']DOCKERFILE["']/i.test(raw)) return 'DOCKER';
  }
  return 'OTHER';
}

export function resolveDeploymentSourceOfTruth(repoRoot = process.cwd()): string {
  const strategy = detectDeploymentStrategy(repoRoot);
  if (strategy === 'DOCKER') return 'Dockerfile';
  if (strategy === 'NIXPACKS') return 'nixpacks.toml';
  if (strategy === 'RAILPACK') return 'railpack.toml';
  return 'package.json';
}

export function buildDeploymentBuildReceipt(repoRoot = process.cwd()): DeploymentBuildReceipt {
  const strategy = detectDeploymentStrategy(repoRoot);
  const sourceOfTruthFile = resolveDeploymentSourceOfTruth(repoRoot);
  const nodeVersion = process.version.replace(/^v/, '');

  let baseImage = 'unknown';
  if (strategy === 'NIXPACKS') baseImage = 'nixpacks/ubuntu (Railway Nixpacks builder)';
  else if (strategy === 'DOCKER') baseImage = 'Dockerfile-defined';
  else if (strategy === 'RAILPACK') baseImage = 'Railpack-defined';

  return {
    strategy,
    sourceOfTruthFile,
    baseImage,
    nodeVersion,
    systemPackages: strategy === 'NIXPACKS' ? [...PLAYWRIGHT_APT_DEPS] : [],
    playwrightInstallStep: 'npx playwright install chromium (build phase; PLAYWRIGHT_BROWSERS_PATH persisted)',
  };
}

export { PLAYWRIGHT_APT_DEPS };
