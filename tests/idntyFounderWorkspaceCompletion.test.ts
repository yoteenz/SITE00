import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  OVERLAY_META,
  REFERRAL_OVERLAY_IDS,
  WORKSPACE_OVERLAY_IDS,
} from '../src/site00/admin/founder-workspace/overlay/overlayRegistry';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('IDNTY founder workspace completion (slice 2)', () => {
  it('registers canonical OL titles from Opus registry', () => {
    expect(OVERLAY_META['OL-01'].title).toBe('Create foundation');
    expect(OVERLAY_META['OL-04'].title).toContain('Search');
    expect(OVERLAY_META['OL-15'].title).toContain('gated');
  });

  it('implements overlay body router for workspace and referral families', () => {
    const body = read('src/site00/admin/founder-workspace/overlays/OverlayBody.tsx');
    expect(body).toContain('WorkspaceOverlayBody');
    expect(body).toContain('ReferralOverlayBody');
  });

  it('mounts every workspace overlay id in WorkspaceOverlayBody switch', () => {
    const ws = read('src/site00/admin/founder-workspace/overlays/bodies/WorkspaceOverlayBody.tsx');
    for (const id of WORKSPACE_OVERLAY_IDS) {
      if (id === 'OL-01') continue;
      expect(ws).toContain(`case '${id}':`);
    }
  });

  it('exposes triggers for all referral overlays on Referrals page', () => {
    const page = read('src/site00/admin/founder-workspace/pages/ReferralsPage.tsx');
    for (const id of REFERRAL_OVERLAY_IDS) {
      expect(page).toContain(id);
    }
  });

  it('shell exposes search, notifications, account, and OL-01 create', () => {
    const shell = read('src/site00/admin/founder-workspace/shell/FounderWorkspaceShell.tsx');
    expect(shell).toContain("openOverlay('OL-04')");
    expect(shell).toContain("openOverlay('OL-05')");
    expect(shell).toContain("openOverlay('OL-18'");
    expect(shell).toContain("openOverlay('OL-01')");
  });

  it('foundation admin API exposes workbench actions used by overlays', () => {
    const api = read('src/site00/admin/services/foundationAdminApi.ts');
    expect(api).toContain('quoteCommercialReady');
    expect(api).toContain('startTask');
    expect(api).toContain('sendMessage');
  });

  it('overlay host supports responsive geometry classes', () => {
    const host = read('src/site00/admin/founder-workspace/overlay/OverlayHost.tsx');
    expect(host).toContain('overlayGeometryForViewport');
    expect(host).toContain('ifw-overlay-host__panel--');
  });
});
