/**
 * P0.DEPLOY.1 — Pre-deploy configuration validation (fail closed).
 */

import type { DeploymentErrorCode } from './types.js';
import { defaultProductionTarget } from './deploymentTopology.js';
import { buildFrontendDeploymentManifest } from './frontendDeploymentManifest.js';

export type DeploymentConfigValidation = {
  valid: boolean;
  errors: DeploymentErrorCode[];
  messages: string[];
  target: ReturnType<typeof defaultProductionTarget>;
  frontendManifest: ReturnType<typeof buildFrontendDeploymentManifest>;
  secretsPresent: {
    viteSupabaseUrl: boolean;
    viteSupabaseAnonKey: boolean;
    viteApiBase: boolean;
    godaddyFtp: boolean;
    godaddySsh: boolean;
  };
};

export function validateProductionDeploymentConfig(env: Record<string, string | undefined> = {}): DeploymentConfigValidation {
  const errors: DeploymentErrorCode[] = [];
  const messages: string[] = [];
  const branch = env.GITHUB_REF_NAME ?? env.BRANCH ?? 'unknown';

  if (branch !== 'main' && env.REQUIRE_MAIN_BRANCH !== 'false') {
    messages.push(`Expected branch main, got ${branch}`);
  }

  const secretsPresent = {
    viteSupabaseUrl: Boolean(env.VITE_SUPABASE_URL?.trim()),
    viteSupabaseAnonKey: Boolean(env.VITE_SUPABASE_ANON_KEY?.trim()),
    viteApiBase: Boolean(env.VITE_API_BASE?.trim()),
    godaddyFtp: Boolean(env.GODADDY_FTP_HOST && env.GODADDY_FTP_USERNAME && env.GODADDY_FTP_PASSWORD),
    godaddySsh: Boolean(env.GODADDY_SSH_HOST && env.GODADDY_SSH_USER),
  };

  if (!secretsPresent.viteSupabaseUrl || !secretsPresent.viteSupabaseAnonKey) {
    messages.push('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  }
  if (!secretsPresent.viteApiBase) {
    messages.push('Missing VITE_API_BASE');
  }

  const target = defaultProductionTarget();
  const frontendManifest = buildFrontendDeploymentManifest(target.outputDir);

  return {
    valid: messages.length === 0,
    errors,
    messages,
    target,
    frontendManifest,
    secretsPresent,
  };
}
