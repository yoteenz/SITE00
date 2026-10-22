import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FOUNDER_WORKSPACE_MOBILE_BOTTOM_NAV,
  FOUNDER_WORKSPACE_SIDEBAR_NAV,
} from '../src/site00/admin/founder-workspace/config/navigation';
import { REFERRAL_COMMISSION_POLICY } from '../src/site00/admin/founder-workspace/config/referralPolicy';
import { REFERRAL_OVERLAY_IDS, WORKSPACE_OVERLAY_IDS } from '../src/site00/admin/founder-workspace/overlay/overlayRegistry';
import { SITE00_FOUNDER_READINESS_PATH } from '../src/utils/auth/site00AuthRedirect';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('IDNTY founder workspace implementation', () => {
  it('registers seven sidebar destinations with Referrals before System', () => {
    expect(FOUNDER_WORKSPACE_SIDEBAR_NAV.map((n) => n.id)).toEqual([
      'overview',
      'foundations',
      'reviews',
      'operations',
      'correspondence',
      'referrals',
      'system',
    ]);
  });

  it('preserves mobile bottom nav without Referrals tab', () => {
    const labels = FOUNDER_WORKSPACE_MOBILE_BOTTOM_NAV.map((n) => n.label);
    expect(labels).toEqual(['Home', 'Foundations', 'Create', 'Reviews', 'System']);
    expect(labels).not.toContain('Referrals');
  });

  it('wires admin routes for founder-workspace shell', () => {
    const routes = read('src/routes/Site00AdminRoutes.tsx');
    expect(routes).toContain('site00/founder-workspace/*');
    expect(routes).toContain('IdntyFounderWorkspaceApp');
  });

  it('redirects legacy foundation-readiness to workspace system', () => {
    const routes = read('src/routes/Site00AdminRoutes.tsx');
    expect(routes).toContain('Navigate to="/admin/site00/founder-workspace/system"');
  });

  it('auth return path targets workspace overview', () => {
    expect(SITE00_FOUNDER_READINESS_PATH).toBe('/admin/site00/founder-workspace/overview');
  });

  it('registers 20 workspace + 20 referral overlay families', () => {
    expect(WORKSPACE_OVERLAY_IDS).toHaveLength(20);
    expect(REFERRAL_OVERLAY_IDS).toHaveLength(20);
  });

  it('list API exposes intake_state for G-01 column', () => {
    expect(read('api/admin/site00-foundation.ts')).toContain('intake_state: a.intake_state');
  });

  it('respects commission cap policy constants', () => {
    expect(REFERRAL_COMMISSION_POLICY.universalCapUsd).toBe(50);
    expect(REFERRAL_COMMISSION_POLICY.standardUsd).toBe(25);
    expect(REFERRAL_COMMISSION_POLICY.paymentEvidenceRequired).toBe(true);
  });

  it('uses Opus2 desktop title scale in CSS (52px not 68px)', () => {
    const css = read('src/site00/admin/founder-workspace/styles/idnty-founder-workspace.css');
    expect(css).toContain('font-size: 52px');
    expect(css).not.toMatch(/font-size:\s*68px/);
  });
});
