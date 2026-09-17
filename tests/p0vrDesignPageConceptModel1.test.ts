/**
 * P0.VR.DESIGN-PAGE-CONCEPT-MODEL1
 */

import { describe, expect, it } from 'vitest';

import {
  CREATIVE_LAYER_MODEL,
  GPT2_PAGE_CONCEPT_GENERATION_CONTRACT,
  buildDesignPageProvenancePresentation,
  listCampaignEntriesForProject,
  listPageConceptCandidates,
  listSiteDesignPagesForProject,
} from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { buildOpusPageContextContract } from '../shared/site00-design-workspace-production/designProjectBinding/pageContext.js';
import {
  defaultDesignPageTargetForShell,
  designPageTargetLines,
  resolveDesignPageTargetForShell,
} from '../src/site00/components/designBench/production/designProductionPageTarget';
import { resolvePageViewportBundle } from '../shared/site00-design-workspace-production/designProjectBinding/pageViewportAuthority.js';

describe('P0.VR.DESIGN-PAGE-CONCEPT-MODEL1', () => {
  it('default active target is NDXBOOK Overview — not Entry 001', () => {
    const target = defaultDesignPageTargetForShell('ndxbook');
    expect(target.screenId).toBe('overview');
    expect(target.pageId).toBe('ndxbook:overview');
    expect(designPageTargetLines(target)).toEqual(['NDXBOOK', 'OVERVIEW', 'PROJECT OVERVIEW']);
    expect(resolveDesignPageTargetForShell('ndxbook').pageRole).toBe('PROJECT_OVERVIEW');
  });

  it('site page tree excludes campaign-as-page orphan rows', () => {
    const pages = listSiteDesignPagesForProject('ndxbook');
    expect(pages.some((p) => p.screenId === 'entry-001-concept')).toBe(false);
    expect(pages.some((p) => p.screenId === 'overview')).toBe(true);
  });

  it('campaign entries are provenance objects — separate from page ids', () => {
    const entries = listCampaignEntriesForProject('ndxbook');
    expect(entries.map((e) => e.entryId)).toContain('entry-001');
    const overview = listSiteDesignPagesForProject('ndxbook').find((p) => p.screenId === 'overview');
    expect(overview?.pageId).not.toContain('entry-001');
  });

  it('does not fabricate GPT2 page concept candidates for Overview', () => {
    const overview = listSiteDesignPagesForProject('ndxbook').find((p) => p.screenId === 'overview');
    expect(overview).toBeTruthy();
    expect(listPageConceptCandidates('ndxbook', overview!.pageId)).toEqual([]);
  });

  it('GPT2 page concept generation contract is defined', () => {
    expect(CREATIVE_LAYER_MODEL).toBe('GPT2');
    expect(GPT2_PAGE_CONCEPT_GENERATION_CONTRACT.outputShape).toBe('MULTIPLE_PAGE_CONCEPT_TERRITORIES');
  });

  it('Overview hero resolves to page reference — not Entry 001 mobile-master', () => {
    const overview = listSiteDesignPagesForProject('ndxbook').find((p) => p.screenId === 'overview');
    expect(overview?.mobilePreviewUrl).toBeTruthy();
    expect(overview!.mobilePreviewUrl).toContain('mobile-overview');
    expect(overview!.mobilePreviewUrl).not.toContain('mobile-master');
    const bundle = resolvePageViewportBundle('ndxbook', overview!.pageId);
    expect(bundle?.auth.mobileAuthorityUrl).toContain('mobile-overview');
  });

  it('Opus handoff contract includes page concept layer fields', () => {
    const overview = listSiteDesignPagesForProject('ndxbook').find((p) => p.screenId === 'overview')!;
    const contract = buildOpusPageContextContract('ndxbook', overview.pageId);
    expect(contract?.pageConceptCreativeLayer).toBe('GPT2');
    expect(contract?.selectedPageConceptId).toBeNull();
    expect(contract?.campaignContentInputs).toContain('entry-001');
  });

  it('provenance lists page and informed-by campaign entries', () => {
    const prov = buildDesignPageProvenancePresentation('ndxbook', 'ndxbook:overview', 'Overview', 'PROJECT_OVERVIEW');
    expect(prov.activePageLabel).toBe('OVERVIEW');
    expect(prov.informedBy.some((x) => x.includes('ENTRY'))).toBe(true);
    expect(prov.creativeLayer).toBe('GPT2');
  });
});
