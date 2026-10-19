import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  formatReferralActivityTime,
  referralActivityFromRegistry,
} from '../src/site00/admin/founder-workspace/data/referralActivityEvents';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('IDNTY founder workspace acceptance (slice 3)', () => {
  it('registry uses container-query five-column layout at ≥920px', () => {
    const css = read('src/site00/admin/founder-workspace/styles/idnty-founder-workspace.css');
    expect(css).toContain('container-type: inline-size');
    expect(css).toContain('@container (min-width: 920px)');
    expect(css).toContain('.ifw-registry__head');
  });

  it('FoundationsRegistry renders five data columns in row markup', () => {
    const reg = read('src/site00/admin/founder-workspace/foundations/FoundationsRegistry.tsx');
    expect(reg).toContain('ifw-registry__col--intake');
    expect(reg).toContain('ifw-registry__col--next');
    expect(reg).toContain('ifw-registry__col--activity');
    expect(reg).toContain('data-testid="foundations-registry-row"');
  });

  it('OL-07 shares RegistryFilterProvider with Foundations toolbar', () => {
    const app = read('src/site00/admin/founder-workspace/FounderWorkspaceApp.tsx');
    expect(app).toContain('RegistryFilterProvider');
    const ol7 = read('src/site00/admin/founder-workspace/overlays/bodies/WorkspaceOverlayBody.tsx');
    expect(ol7).toContain('useRegistryFilters');
    expect(ol7).toContain('Ol07RegistryFilters');
    const page = read('src/site00/admin/founder-workspace/pages/FoundationsPage.tsx');
    expect(page).toContain('useRegistryFilters');
    expect(page).not.toContain("openOverlay('OL-07')");
    expect(page).toContain("openOverlay('OL-07'");
  });

  it('referral activity derives from attributed registry rows only', () => {
    const events = referralActivityFromRegistry(
      [
        {
          artifact_id: 'a1',
          public_token: 't1',
          state: 'LEAD',
          payment_state: 'NONE',
          created_at: '2026-01-01T00:00:00Z',
          referral_source_id: 'src-1',
          business_name: 'Acme',
        },
        {
          artifact_id: 'a2',
          public_token: 't2',
          state: 'LEAD',
          payment_state: 'NONE',
          created_at: '2026-01-02T00:00:00Z',
          referral_source_id: null,
          business_name: 'No ref',
        },
      ],
      [{ referral_source_id: 'src-1', kind: 'STANDARD', label: 'Partner A', active: true }],
    );
    expect(events).toHaveLength(1);
    expect(events[0]?.partner_label).toBe('Partner A');
    expect(events[0]?.verb).toContain('Attributed');
  });

  it('formats referral activity timestamps for display', () => {
    const s = formatReferralActivityTime('2026-03-15T14:30:00Z');
    expect(s.length).toBeGreaterThan(4);
  });

  it('Referrals activity section documents backend event API gap', () => {
    const page = read('src/site00/admin/founder-workspace/pages/ReferralsPage.tsx');
    expect(page).toContain('referralActivityFromRegistry');
    expect(page).toContain('/api/admin/referrals/events');
    expect(page).toContain('ifw-activity-stream');
  });
});
