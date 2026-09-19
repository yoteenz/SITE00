/**
 * P0.DEPLOY.1 — Unified SITE 00 continuous deployment pipeline.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_DEPLOY_1_BUILD,
  buildReleaseId,
  shortCommitSha,
  buildReleaseManifest,
  parseReleaseManifest,
  describeCurrentDeploymentTopology,
  defaultProductionTarget,
  validateProductionDeploymentConfig,
  resolveCpanelDeployStrategy,
  checkReleaseCompatibility,
  checkBackendOnlyCompatibility,
  buildProductionReleaseReceipt,
  resolveReleaseStatus,
  DEFAULT_ROLLBACK_POLICY,
  resolveLastKnownGoodRelease,
  buildRollbackReceipt,
  recordReleaseFromReceipt,
  listReleaseHistory,
  resetReleaseHistoryForTest,
  parseBackendHealthPayload,
  parseFrontendHealthFromManifest,
  runProductionSmokeChecks,
  FRONTEND_OWNED_GLOBS,
  CPANEL_HOST_PRESERVE_EXCLUDES,
  buildFrontendDeploymentManifest,
  acquireProductionDeploymentLock,
  releaseProductionDeploymentLock,
  resetProductionDeploymentLockForTest,
  RELEASE_PIPELINE_STAGES,
} from '../shared/site00-release-engine/index.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.DEPLOY.1 — Release pipeline', () => {
  beforeEach(() => {
    resetReleaseHistoryForTest();
    resetProductionDeploymentLockForTest();
  });

  it('1. release engine module exists', () => {
    expect(read('shared/site00-release-engine/releasePipeline.ts')).toContain('ReleasePipeline');
  });

  it('2. deployment topology documents frontend + backend', () => {
    const topo = describeCurrentDeploymentTopology();
    expect(topo.frontend.buildOutput).toBe('dist/');
    expect(topo.frontend.productionDomain).toBe('https://site00.com');
    expect(topo.backend.host).toBe('Railway');
    expect(topo.backend.healthPath).toBe('/api/health');
    expect(topo.backend.productionDomain).toBe('https://api.site00.com');
  });

  it('3. production target defaults', () => {
    const target = defaultProductionTarget();
    expect(target.targetId).toBe('site00-production');
    expect(target.frontendStrategy).toBe('cpanel_ftp');
    expect(target.backendStrategy).toBe('railway_auto');
  });

  it('4. validateProductionDeploymentConfig on main', () => {
    const v = validateProductionDeploymentConfig({
      GITHUB_REF_NAME: 'main',
      VITE_SUPABASE_URL: 'https://x.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anon',
      VITE_API_BASE: 'https://api.site00.com',
    });
    expect(v.valid).toBe(true);
    expect(v.messages).toHaveLength(0);
  });

  it('5. main branch gate warns off main', () => {
    const v = validateProductionDeploymentConfig({ GITHUB_REF_NAME: 'feature/x' });
    expect(v.messages.some((m) => m.includes('main'))).toBe(true);
  });

  it('6. release ID format', () => {
    expect(buildReleaseId(P0_DEPLOY_1_BUILD, 'abc1234567890')).toBe(`site00-${P0_DEPLOY_1_BUILD}-abc1234`);
    expect(shortCommitSha('abcdef1234567890')).toBe('abcdef1');
  });

  it('7. release manifest build + parse', () => {
    const m = buildReleaseManifest({ commitSha: 'abc1234567890', bundleEntry: '/assets/index.js' });
    expect(m.version).toBe(P0_DEPLOY_1_BUILD);
    expect(m.releaseId).toContain(`site00-${P0_DEPLOY_1_BUILD}`);
    const parsed = parseReleaseManifest(m);
    expect(parsed?.frontendBuild).toBe(P0_DEPLOY_1_BUILD);
  });

  it('8. manifest script exists', () => {
    expect(read('scripts/site00-generate-release-manifest.mjs')).toContain('release-manifest.json');
  });

  it('9. backend health receipt parsing', () => {
    const r = parseBackendHealthPayload({
      ok: true,
      release: {
        releaseId: `site00-${P0_DEPLOY_1_BUILD}-abc1234`,
        commitSha: 'abc1234',
        apiBuild: P0_DEPLOY_1_BUILD,
        workerBuild: P0_DEPLOY_1_BUILD,
        contractVersion: 'capture-run-v1',
        serviceReady: true,
      },
    });
    expect(r.serviceReady).toBe(true);
    expect(r.apiBuild).toBe(P0_DEPLOY_1_BUILD);
  });

  it('10. frontend health from manifest', () => {
    const m = buildReleaseManifest({ commitSha: 'abc1234' });
    const f = parseFrontendHealthFromManifest(m);
    expect(f.ok).toBe(true);
    expect(f.version).toBe(P0_DEPLOY_1_BUILD);
  });

  it('11. production smoke checks', () => {
    const ok = runProductionSmokeChecks('<div id="root"></div><script src="/assets/index.js"></script>');
    expect(ok.ok).toBe(true);
    const bad = runProductionSmokeChecks('<html></html>');
    expect(bad.ok).toBe(false);
  });

  it('12. cpanel strategy prefers SSH when configured', () => {
    const ssh = resolveCpanelDeployStrategy({
      GODADDY_SSH_HOST: 'h',
      GODADDY_SSH_USER: 'u',
      GODADDY_SSH_PRIVATE_KEY: 'k',
    });
    expect(ssh.strategy).toBe('github_actions_ssh_rsync');
    expect(ssh.staleAssetCleanup).toBe(true);
  });

  it('13. cpanel strategy falls back to FTP', () => {
    const ftp = resolveCpanelDeployStrategy({
      GODADDY_FTP_HOST: 'h',
      GODADDY_FTP_USERNAME: 'u',
      GODADDY_FTP_PASSWORD: 'p',
    });
    expect(ftp.strategy).toBe('github_actions_ftp');
  });

  it('14. cpanel strategy manual zip when no credentials', () => {
    const fb = resolveCpanelDeployStrategy({});
    expect(fb.strategy).toBe('manual_zip_fallback');
    expect(fb.autoPromoteSupported).toBe(false);
  });

  it('15. frontend owned path manifest', () => {
    const fm = buildFrontendDeploymentManifest('dist');
    expect(fm.ownedPaths).toContain('index.html');
    expect(fm.ownedPaths).toContain('release-manifest.json');
    expect(fm.preserveExcludes).toEqual(CPANEL_HOST_PRESERVE_EXCLUDES);
    expect(FRONTEND_OWNED_GLOBS).toContain('assets/**');
  });

  it('16. .cpanel.yml exists for optional git deploy', () => {
    expect(read('.cpanel.yml')).toContain('deployment:');
  });

  it('17. compatibility pass when versions match', () => {
    const m = buildReleaseManifest({ commitSha: 'abc' });
    const b = parseBackendHealthPayload({ ok: true, release: { apiBuild: P0_DEPLOY_1_BUILD, workerBuild: P0_DEPLOY_1_BUILD, releaseId: m.releaseId, serviceReady: true } });
    const f = parseFrontendHealthFromManifest(m);
    const c = checkReleaseCompatibility(m, b, f);
    expect(c.compatible).toBe(true);
    expect(c.status).toBe('COMPATIBLE');
  });

  it('17b. backend-only compatibility when frontend not deployed', () => {
    const b = parseBackendHealthPayload({
      ok: true,
      release: {
        apiBuild: P0_DEPLOY_1_BUILD,
        workerBuild: P0_DEPLOY_1_BUILD,
        releaseId: `site00-${P0_DEPLOY_1_BUILD}-abc1234`,
        serviceReady: true,
      },
    });
    const pass = checkBackendOnlyCompatibility(b, P0_DEPLOY_1_BUILD);
    expect(pass.compatible).toBe(true);
    expect(pass.status).toBe('COMPATIBLE');
    const fail = checkBackendOnlyCompatibility(b, 'v999');
    expect(fail.compatible).toBe(false);
    expect(fail.status).toBe('VERSION_MISMATCH');
  });

  it('18. VERSION_MISMATCH detection', () => {
    const m = buildReleaseManifest({ commitSha: 'abc', version: 'v280' });
    const b = parseBackendHealthPayload({ ok: true, release: { apiBuild: 'v279', workerBuild: 'v279', serviceReady: true } });
    const f = parseFrontendHealthFromManifest({ ...m, frontendBuild: 'v280' });
    const c = checkReleaseCompatibility(m, b, f);
    expect(c.status).toBe('VERSION_MISMATCH');
    expect(c.compatible).toBe(false);
  });

  it('19. production release receipt', () => {
    const m = buildReleaseManifest({ commitSha: 'abc1234' });
    const receipt = buildProductionReleaseReceipt({
      releaseId: m.releaseId,
      commitSha: m.commitSha,
      manifest: m,
      backend: parseBackendHealthPayload({ ok: true, release: { apiBuild: P0_DEPLOY_1_BUILD, workerBuild: P0_DEPLOY_1_BUILD, releaseId: m.releaseId, serviceReady: true } }),
      frontend: parseFrontendHealthFromManifest(m),
      stageResults: { COMPLETE: 'PASS', VERIFY_COMPATIBILITY: 'PASS', VERIFY_FRONTEND: 'PASS', VERIFY_BACKEND: 'PASS' },
      errors: [],
    });
    expect(receipt.status).toBe('READY');
    expect(receipt.frontendVersion).toBe(P0_DEPLOY_1_BUILD);
  });

  it('20. partial status on backend verify fail', () => {
    const status = resolveReleaseStatus({
      releaseId: 'x',
      commitSha: 'abc',
      manifest: null,
      backend: null,
      frontend: null,
      stageResults: { VERIFY_BACKEND: 'FAIL' },
      errors: [],
    });
    expect(status).toBe('PARTIAL');
  });

  it('21. pipeline stages count', () => {
    expect(RELEASE_PIPELINE_STAGES).toHaveLength(9);
    expect(RELEASE_PIPELINE_STAGES[0]).toBe('VALIDATE');
    expect(RELEASE_PIPELINE_STAGES.at(-1)).toBe('COMPLETE');
  });

  it('22. production workflow exists', () => {
    const wf = read('.github/workflows/site00-production-deploy.yml');
    expect(wf).toContain('site00-production');
    expect(wf).toContain('workflow_dispatch');
    expect(wf).toContain('verify_backend');
  });

  it('22b. CI test job supplies Supabase env + Playwright install', () => {
    const wf = read('.github/workflows/site00-production-deploy.yml');
    expect(wf).toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(wf).toContain('INSTALL_PLAYWRIGHT');
    expect(wf).toMatch(/SUPABASE_URL.*VITE_SUPABASE_URL|VITE_SUPABASE_URL.*SUPABASE_URL/);
  });

  it('22c. deploy_frontend checks out repo before SSH deploy script', () => {
    const wf = read('.github/workflows/site00-production-deploy.yml');
    const deployBlock = wf.slice(wf.indexOf('deploy_frontend:'));
    const sshStep = deployBlock.indexOf('Deploy dist/ via SSH rsync');
    const checkoutBeforeSsh =
      deployBlock.indexOf('actions/checkout@v4') !== -1 &&
      deployBlock.indexOf('actions/checkout@v4') < sshStep;
    expect(checkoutBeforeSsh).toBe(true);
    expect(deployBlock).toContain('bash scripts/site00-cpanel-deploy.sh dist');
  });

  it('22d. cPanel method resolver prefers FTP when both SSH and FTP configured (GoDaddy)', () => {
    expect(read('scripts/site00-resolve-cpanel-deploy-method.sh')).toContain('GODADDY_SSH_PRIVATE_KEY');
    expect(read('scripts/site00-resolve-cpanel-deploy-method.sh')).toContain('Default when both configured: FTP');
    const wf = read('.github/workflows/site00-production-deploy.yml');
    expect(wf).toContain('site00-resolve-cpanel-deploy-method.sh');
    expect(wf).toContain('cpanel_method');
  });

  it('22e. SSH rsync uses clean-shell options for cPanel dirty bashrc', () => {
    const script = read('scripts/site00-cpanel-deploy.sh');
    expect(script).toContain('ssh -T');
    expect(script).toContain('protocol version mismatch');
    expect(script).toContain('--rsync-path');
    expect(script).toContain('bash --noprofile --norc');
  });

  it('22f. workflow FTP fallback when SSH rsync fails', () => {
    const wf = read('.github/workflows/site00-production-deploy.yml');
    expect(wf).toContain('continue-on-error: true');
    expect(wf).toContain('ftp_available');
    expect(wf).toContain('Confirm frontend deploy succeeded');
  });

  it('23. legacy godaddy workflow deprecated on push', () => {
    const legacy = read('.github/workflows/deploy-godaddy.yml');
    expect(legacy).toContain('DEPRECATED');
    expect(legacy).not.toMatch(/push:\s*\n\s*branches:\s*\[main\]/);
  });

  it('24. deployment lock prevents overlap', () => {
    expect(acquireProductionDeploymentLock('ci-1', `site00-${P0_DEPLOY_1_BUILD}-abc`)).toBe(true);
    expect(acquireProductionDeploymentLock('ci-2', `site00-${P0_DEPLOY_1_BUILD}-def`)).toBe(false);
    expect(releaseProductionDeploymentLock('ci-1')).toBe(true);
  });

  it('25. rollback policy no auto smoke rollback', () => {
    expect(DEFAULT_ROLLBACK_POLICY.autoRollbackOnSmokeWarning).toBe(false);
  });

  it('26. last known good release', () => {
    recordReleaseFromReceipt({ releaseId: 'a', version: 'v1', commitSha: '1', status: 'FAILED' });
    recordReleaseFromReceipt({ releaseId: 'b', version: 'v2', commitSha: '2', status: 'READY' });
    expect(resolveLastKnownGoodRelease(listReleaseHistory())).toBe('b');
  });

  it('27. rollback receipt', () => {
    const rb = buildRollbackReceipt({ fromRelease: 'bad', toRelease: 'b', reason: 'critical' });
    expect(rb.frontendStatus).toBe('ROLLED_BACK');
  });

  it('28. release history tracking', () => {
    recordReleaseFromReceipt({ releaseId: 'x', version: P0_DEPLOY_1_BUILD, commitSha: 'abc', status: 'READY' });
    expect(listReleaseHistory()).toHaveLength(1);
  });

  it('29. cache headers for manifest in .htaccess', () => {
    const htaccess = read('public/.htaccess');
    expect(htaccess).toMatch(/release-manifest/);
    expect(htaccess).toContain('no-cache');
    expect(htaccess).toContain('ErrorDocument 404');
    expect(htaccess).toMatch(/SymLinksIfOwnerMatch|FollowSymLinks/);
    expect(htaccess).toMatch(/projects\|services/);
    expect(htaccess).toContain('FallbackResource');
  });

  it('29b. SPA fallback 404.html ships with frontend bundle', () => {
    expect(read('public/404.html')).toContain('location.replace');
    expect(read('shared/site00-release-engine/frontendDeploymentManifest.ts')).toContain('404.html');
  });

  it('30. server health includes release block', () => {
    expect(read('server/index.ts')).toContain('release:');
    expect(read('server/index.ts')).toContain('P0_DEPLOY_1_BUILD');
  });

  it('31. emergency zip marked fallback', () => {
    expect(read('scripts/package-cpanel-deploy.sh')).toContain('EMERGENCY');
  });

  it('32. MORE deployments UI route', () => {
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('deployments');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3r1/designWizardSteps.ts')).toContain(
      "'deployments'",
    );
  });

  it('33. architecture doc exists', () => {
    expect(read('docs/architecture/SITE00_PRODUCTION_DEPLOYMENT_P0DEPLOY1.md')).toContain('CURRENT_DEPLOYMENT_TOPOLOGY');
  });
});
