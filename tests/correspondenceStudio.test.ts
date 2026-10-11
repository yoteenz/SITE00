import { describe, expect, it } from 'vitest';
import { emailCanvasUsesSite00Dna, resolveBrandForCampaign } from '../shared/site00-correspondence-studio/brandFirewall.js';
import { planClientDelivery, isApprovedForClientExport, clientSafeCommentFilter } from '../shared/site00-correspondence-studio/delivery/planClientDelivery.js';
import { DEVICE_PREVIEW_WIDTHS } from '../shared/site00-correspondence-studio/devicePreview.js';
import {
  OPUS_V2_BENCHMARK_IMPORT_CONTRACT,
  applyOpusV2BenchmarkImport,
  listOpusBenchmarkTemplateIds,
} from '../shared/site00-correspondence-studio/import/opusV2BenchmarkImport.js';
import { DIGITAL_FOUNDATION_TEMPLATE_COUNT, buildDigitalFoundationWorkspaceManifest } from '../shared/site00-correspondence-studio/manifests/digital-foundation-lifecycle.js';
import { getCorrespondenceWorkspace, registeredTemplateCount } from '../shared/site00-correspondence-studio/workspace.js';

describe('Correspondence Studio workspace', () => {
  it('registers 20 Digital Foundation template IDs', () => {
    expect(DIGITAL_FOUNDATION_TEMPLATE_COUNT).toBe(20);
    const m = buildDigitalFoundationWorkspaceManifest();
    expect(Object.keys(m.templates)).toHaveLength(20);
    expect(m.templates['personal-foundation-invitation']).toBeDefined();
    expect(m.templates.M06).toBeDefined();
  });

  it('imports Opus benchmarks without auto-approve', () => {
    expect(OPUS_V2_BENCHMARK_IMPORT_CONTRACT.auto_approve).toBe(false);
    const m = applyOpusV2BenchmarkImport({ apply: true });
    for (const id of listOpusBenchmarkTemplateIds()) {
      const t = m.templates[id];
      expect(t.current_version_id).toContain('v2-editorial-benchmark');
      expect(t.versions.find((v) => v.version_id === t.current_version_id)?.review_state).toBe('founder_review');
    }
  });

  it('brand firewall keeps client example off SITE 00 DNA', () => {
    const m = getCorrespondenceWorkspace({ includeOpusBenchmarks: false });
    const site = resolveBrandForCampaign(m, 'site00-dna');
    const client = resolveBrandForCampaign(m, 'client-brand-example');
    expect(emailCanvasUsesSite00Dna(site)).toBe(true);
    expect(emailCanvasUsesSite00Dna(client)).toBe(false);
  });

  it('device preview supports mobile, tablet, desktop widths', () => {
    expect(DEVICE_PREVIEW_WIDTHS.mobile).toBe(390);
    expect(DEVICE_PREVIEW_WIDTHS.tablet).toBe(768);
    expect(DEVICE_PREVIEW_WIDTHS.desktop).toBe(680);
  });

  it('client delivery excludes unapproved templates', () => {
    const m = applyOpusV2BenchmarkImport({ apply: true });
    const { emails, rejected_unapproved } = planClientDelivery({
      manifest: m,
      campaign_id: 'client-lifecycle',
      package_slug: 'TEST',
      version_states: {},
      assets: {},
    });
    expect(emails).toHaveLength(0);
    expect(rejected_unapproved.length).toBe(registeredTemplateCount(m));
  });

  it('client delivery includes only approved versions', () => {
    const m = applyOpusV2BenchmarkImport({ apply: true });
    const version_states: Record<string, string> = {};
    version_states[`personal-foundation-invitation::B01@v2-editorial-benchmark`] = 'approved';
    const { emails } = planClientDelivery({
      manifest: m,
      campaign_id: 'client-lifecycle',
      package_slug: 'TEST',
      version_states: version_states as Record<string, import('../shared/site00-correspondence-studio/types.js').ReviewState>,
      assets: { 'personal-foundation-invitation': { copyPath: 'COPY.md' } },
    });
    expect(emails).toHaveLength(1);
    expect(emails[0].include_html).toBe(false);
    expect(isApprovedForClientExport('founder_review')).toBe(false);
  });

  it('strips internal comments from client export filter', () => {
    const out = clientSafeCommentFilter([
      { visibility: 'internal', body: 'secret' },
      { visibility: 'client_safe', body: 'ok' },
    ] as { visibility: string; body: string }[]);
    expect(out).toHaveLength(1);
    expect(out[0].body).toBe('ok');
  });
});
