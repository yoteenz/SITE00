/**
 * cPanel deploy method resolution for CI vs local.
 */

import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const script = join(process.cwd(), 'scripts/site00-resolve-cpanel-deploy-method.sh');

function resolveMethod(env: Record<string, string>): string {
  return execFileSync('bash', [script], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  }).trim();
}

const bothCreds = {
  GODADDY_SSH_HOST: 'ssh.example.com',
  GODADDY_SSH_USER: 'user',
  GODADDY_SSH_PRIVATE_KEY: 'fake-key',
  GODADDY_FTP_HOST: 'ftp.example.com',
  GODADDY_FTP_USERNAME: 'ftpuser',
  GODADDY_FTP_PASSWORD: 'secret',
};

describe('site00-resolve-cpanel-deploy-method.sh', () => {
  it('prefers FTP on GitHub Actions even when GODADDY_SSH_DEPLOY_ENABLED=true', () => {
    expect(
      resolveMethod({
        ...bothCreds,
        GITHUB_ACTIONS: 'true',
        GODADDY_SSH_DEPLOY_ENABLED: 'true',
      }),
    ).toBe('ftp');
  });

  it('allows SSH preference outside GitHub Actions when SSH deploy enabled', () => {
    expect(
      resolveMethod({
        ...bothCreds,
        GODADDY_SSH_DEPLOY_ENABLED: 'true',
      }),
    ).toBe('ssh');
  });

  it('defaults to FTP when both credential sets exist locally', () => {
    expect(resolveMethod({ ...bothCreds })).toBe('ftp');
  });
});
