import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { emailCanvasUsesSite00Dna, resolveBrandForCampaign } from '../shared/site00-correspondence-studio/brandFirewall.js';
import { planClientDelivery, isApprovedForClientExport, clientSafeCommentFilter } from '../shared/site00-correspondence-studio/delivery/planClientDelivery.js';
import { DEVICE_PREVIEW_WIDTHS, REPOSITORY_PREVIEW_WIDTHS } from '../shared/site00-correspondence-studio/devicePreview.js';
import { R3_EDITORIAL_IMPORT_CONTRACT, listR3TemplateIds, r2VersionId, r3VersionId } from '../shared/site00-correspondence-studio/import/r3EditorialImport.js';
import { R4_PREMIUM_IMPORT_CONTRACT, listR4TemplateIds, r4VersionId } from '../shared/site00-correspondence-studio/import/r4PremiumImport.js';
import { fndatn01VersionId, listFndatn01TemplateIds } from '../shared/site00-correspondence-studio/import/fndatn01PackImport.js';
import {
  OPUS_V2_BENCHMARK_IMPORT_CONTRACT,
  applyOpusV2BenchmarkImport,
  listOpusBenchmarkTemplateIds,
} from '../shared/site00-correspondence-studio/import/opusV2BenchmarkImport.js';
import {
  DIGITAL_FOUNDATION_TEMPLATE_COUNT,
  buildDigitalFoundationWorkspaceManifest,
} from '../shared/site00-correspondence-studio/manifests/digital-foundation-lifecycle.js';
import { getCorrespondenceWorkspace, registeredTemplateCount, resetCorrespondenceWorkspaceCache } from '../shared/site00-correspondence-studio/workspace.js';

describe('Correspondence Studio workspace', () => {
  it('registers 22 Digital Foundation template IDs', () => {
    expect(DIGITAL_FOUNDATION_TEMPLATE_COUNT).toBe(22);
    const m = buildDigitalFoundationWorkspaceManifest();
    expect(Object.keys(m.templates)).toHaveLength(22);
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

  it('keeps R3, V2 and the R2 territories registered under R4', () => {
    resetCorrespondenceWorkspaceCache();
    expect(R3_EDITORIAL_IMPORT_CONTRACT.auto_approve).toBe(false);
    const m = getCorrespondenceWorkspace();
    for (const row of R3_EDITORIAL_IMPORT_CONTRACT.emails) {
      const t = m.templates[row.template_id];
      const ids = t.versions.map((v) => v.version_id);
      expect(ids).toContain(r3VersionId(row.benchmark_id));
      expect(ids).toContain(r4VersionId(row.template_id));
      expect(t.current_version_id).toBe(
        listFndatn01TemplateIds().includes(row.template_id) ? fndatn01VersionId(row.template_id) : r4VersionId(row.template_id),
      );
      expect(ids).toContain(`${row.benchmark_id}@v2-editorial-benchmark`);
      for (const letter of ['A', 'B', 'C']) expect(ids).toContain(r2VersionId(row.benchmark_id, letter));
      for (const v of t.versions.filter((x) => /@r[234]-/.test(x.version_id))) expect(v.review_state).toBe('founder_review');
    }
    expect(listR3TemplateIds()).toEqual(['personal-foundation-invitation', 'foundation-complete', 'M06']);
  });

  it('publishes every R2 and R3 preview it registers', () => {
    resetCorrespondenceWorkspaceCache();
    const m = getCorrespondenceWorkspace();
    for (const id of listR3TemplateIds()) {
      for (const v of m.templates[id].versions) {
        if (v.preview_source.kind !== 'repository_html' || !v.preview_source.publicPreviewPath) continue;
        expect(fs.existsSync(path.join('public', v.preview_source.publicPreviewPath)), v.version_id).toBe(true);
        expect(fs.existsSync(v.preview_source.repoPath), v.version_id).toBe(true);
      }
    }
  });

  it('previews repository HTML in a 1024 desktop context', () => {
    expect(REPOSITORY_PREVIEW_WIDTHS).toEqual({ mobile: 390, tablet: 768, desktop: 1024 });
  });

  it('does not cache the benchmark-free manifest as the default workspace', () => {
    resetCorrespondenceWorkspaceCache();
    getCorrespondenceWorkspace({ includeOpusBenchmarks: false });
    expect(getCorrespondenceWorkspace().templates.M06.current_version_id).toBe(r4VersionId('M06'));
  });

  it('registers an R4 premium version for the 20 original templates, current unless FNDATN-01 supersedes it', () => {
    resetCorrespondenceWorkspaceCache();
    expect(R4_PREMIUM_IMPORT_CONTRACT.auto_approve).toBe(false);
    const m = getCorrespondenceWorkspace();
    const reminders = ['intake-resume-reminder', 'quote-expiry-reminder'];
    expect(listR4TemplateIds()).toHaveLength(DIGITAL_FOUNDATION_TEMPLATE_COUNT - reminders.length);
    expect(new Set(listR4TemplateIds())).toEqual(new Set(Object.keys(m.templates).filter((id) => !reminders.includes(id))));
    for (const id of listR4TemplateIds()) {
      const t = m.templates[id];
      const v = t.versions.find((x) => x.version_id === r4VersionId(id));
      expect(t.current_version_id).toBe(listFndatn01TemplateIds().includes(id) ? fndatn01VersionId(id) : r4VersionId(id));
      expect(v?.review_state).toBe('founder_review');
      expect(t.versions.length).toBeGreaterThan(1);
    }
  });

  it('publishes every R4 preview and keeps the asset classes consistent with the matrix', () => {
    resetCorrespondenceWorkspaceCache();
    const m = getCorrespondenceWorkspace();
    const matrix = JSON.parse(fs.readFileSync('docs/site00/idnty/visual-authority/email-v2/r4/PREMIUM_ASSET_MATRIX.json', 'utf8'));
    for (const row of R4_PREMIUM_IMPORT_CONTRACT.emails) {
      const v = m.templates[row.template_id].versions.find((x) => x.version_id === r4VersionId(row.template_id))!;
      expect(v.preview_source.kind).toBe('repository_html');
      if (v.preview_source.kind !== 'repository_html') continue;
      expect(fs.existsSync(path.join('public', v.preview_source.publicPreviewPath!)), row.template_id).toBe(true);
      expect(fs.existsSync(v.preview_source.repoPath), row.template_id).toBe(true);
      const entry = matrix.templates.find((t: { template_id: string }) => t.template_id === row.template_id);
      expect(entry.visual_class).toBe(row.visual_class);
      expect(entry.premium_assets).toEqual(row.premium_assets);
    }
    expect(matrix.counts).toEqual({ P1: 10, P2: 4, P3: 6 });
    expect(fs.existsSync(path.join('public', R4_PREMIUM_IMPORT_CONTRACT.review_artifact))).toBe(true);
  });
});
