/**
 * P0.VR.PAGE-CONCEPT-API-CAPTURE-VALIDATION-FIX1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as cgpt from '../api/_lib/site00PageConcept/generatePageCreativeInjection.js';
import * as gpt2 from '../api/_lib/site00PageConcept/generatePageGpt2AuthorityConcept.js';
import * as nbp from '../api/_lib/site00PageConcept/renderPageNbpJob.js';
import {
  pageConceptGenerationDryRun,
  runPageConceptGeneration,
} from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import { buildPageConceptGenerationPlan } from '../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import { classifyPageConceptCaptureTransport } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationRequest.js';
import { evaluatePageConceptReadiness } from '../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { validateIncomingPageConceptCaptures } from '../shared/site00-design-workspace-production/pageConceptPipeline/validateIncomingPageConceptCaptures.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const pages = listSiteDesignPagesForProject(PROJECT);
  const overview = pages.find((p) => p.pageId === 'overview' || p.route?.includes('overview'));
  return overview?.pageId ?? pages[0]!.pageId;
}

describe('P0.VR.PAGE-CONCEPT-API-CAPTURE-VALIDATION-FIX1', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('valid Mobile + Desktop artifactUrl accepted when server-accessible', () => {
    const v = validateIncomingPageConceptCaptures({
      projectId: PROJECT,
      pageId: 'overview',
      mobileCapture: {
        captureId: 'm-url',
        viewport: 'MOBILE',
        artifactUrl: 'https://site00.com/captures/m.png',
        width: 390,
        height: 844,
      },
      desktopCapture: {
        captureId: 'd-url',
        viewport: 'DESKTOP',
        artifactUrl: 'https://site00.com/captures/d.png',
        width: 1440,
        height: 900,
      },
    });
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.mobileTransport).toBe('url');
      expect(v.desktopTransport).toBe('url');
    }
  });

  it('valid Mobile + Desktop artifactBase64 accepted', () => {
    const v = validateIncomingPageConceptCaptures({
      projectId: PROJECT,
      pageId: overviewPageId(),
      mobileCapture: { captureId: 'm-b64', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd-b64', artifactBase64: 'bbb', width: 1440, height: 900 },
    });
    expect(v).toEqual({ ok: true, mobileTransport: 'base64', desktopTransport: 'base64' });
  });

  it('mixed URL/base64 accepted', () => {
    const v = validateIncomingPageConceptCaptures({
      projectId: PROJECT,
      pageId: overviewPageId(),
      mobileCapture: { captureId: 'm-b64', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: {
        captureId: 'd-url',
        artifactUrl: 'https://cdn.example.com/d.png',
        width: 1440,
        height: 900,
      },
    });
    expect(v.ok).toBe(true);
  });

  it('missing Mobile returns exact error', () => {
    const v = validateIncomingPageConceptCaptures({
      projectId: PROJECT,
      pageId: overviewPageId(),
      desktopCapture: { captureId: 'd1', artifactBase64: 'x', width: 1440, height: 900 },
    });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.code).toBe('BLOCKED_MOBILE_CAPTURE_PAYLOAD_MISSING');
  });

  it('missing Desktop returns exact error', () => {
    const v = validateIncomingPageConceptCaptures({
      projectId: PROJECT,
      pageId: overviewPageId(),
      mobileCapture: { captureId: 'm1', artifactBase64: 'x', width: 390, height: 844 },
    });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.code).toBe('BLOCKED_DESKTOP_CAPTURE_PAYLOAD_MISSING');
  });

  it('browser-only URL rejected with exact reason', () => {
    expect(classifyPageConceptCaptureTransport({
      captureId: 'b',
      artifactUrl: 'blob:https://site00.com/x',
      width: 1,
      height: 1,
    })).toBe('unsupported_url');
    const v = validateIncomingPageConceptCaptures({
      projectId: PROJECT,
      pageId: overviewPageId(),
      mobileCapture: { captureId: 'm', artifactUrl: 'blob:abc', width: 390, height: 844 },
      desktopCapture: { captureId: 'd', artifactBase64: 'x', width: 1440, height: 900 },
    });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.code).toBe('BLOCKED_MOBILE_CAPTURE_ARTIFACT_UNREADABLE');
  });

  it('canonical page id accepted via trustIncomingCaptures plan path without registry', () => {
    const pageId = overviewPageId();
    expect(evaluatePageConceptReadiness(PROJECT, pageId)).toBe('BLOCKED_NO_SOURCE_CAPTURE');
    expect(() => buildPageConceptGenerationPlan(PROJECT, pageId, { trustIncomingCaptures: true })).not.toThrow();
  });

  it('incoming validator does not reference localStorage or browser capture resolver', () => {
    const src = read(
      'shared/site00-design-workspace-production/pageConceptPipeline/validateIncomingPageConceptCaptures.ts',
    );
    expect(src).not.toMatch(/localStorage\.|getItem\(/);
    expect(src).not.toContain('resolveCurrentPageCapture');
    expect(src).not.toContain('getPageConceptSourceCaptures');
  });

  it('dry-run returns READY_FOR_PROVIDER_DISPATCH without provider calls', () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const cgptSpy = vi.spyOn(cgpt, 'generatePageCreativeInjection');
    const gpt2Spy = vi.spyOn(gpt2, 'generatePageGpt2AuthorityConcept');
    const nbpSpy = vi.spyOn(nbp, 'renderPageNbpJob');

    const dry = pageConceptGenerationDryRun({
      state,
      mobileCapture: { captureId: 'm-live', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd-live', artifactBase64: 'bbb', width: 1440, height: 900 },
    });

    expect(dry.ok).toBe(true);
    if (dry.ok) {
      expect(dry.readiness).toBe('READY_FOR_PROVIDER_DISPATCH');
      expect(dry.serverCaptureValidation).toBe('PASS');
    }
    expect(cgptSpy).not.toHaveBeenCalled();
    expect(gpt2Spy).not.toHaveBeenCalled();
    expect(nbpSpy).not.toHaveBeenCalled();
  });

  it('production-shaped POST payload passes dry-run (no browser capture registry)', async () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const dry = pageConceptGenerationDryRun({
      state,
      mobileCapture: {
        captureId: 'cap-mobile-prod-shape',
        artifactBase64: 'iVBORw0KGgo=',
        width: 390,
        height: 844,
      },
      desktopCapture: {
        captureId: 'cap-desktop-prod-shape',
        artifactUrl: 'https://site00.com/design-captures/desktop.png',
        width: 1440,
        height: 900,
      },
    });
    expect(dry.ok).toBe(true);

    const cgptSpy = vi.spyOn(cgpt, 'generatePageCreativeInjection').mockResolvedValue({} as never);
    vi.spyOn(gpt2, 'generatePageGpt2AuthorityConcept').mockResolvedValue({} as never);
    vi.spyOn(nbp, 'renderPageNbpJob').mockResolvedValue({ providerJobId: 'j', imageBase64: 'x' } as never);

    await runPageConceptGeneration({
      state,
      founderConfirmedSpend: true,
      mobileCapture: {
        captureId: 'cap-mobile-prod-shape',
        artifactBase64: 'iVBORw0KGgo=',
        width: 390,
        height: 844,
      },
      desktopCapture: {
        captureId: 'cap-desktop-prod-shape',
        artifactBase64: 'bbb',
        width: 1440,
        height: 900,
      },
    });
    expect(cgptSpy).toHaveBeenCalled();
  });

  it('API route uses shared dry-run and does not dispatch providers on trace', () => {
    const api = read('api/site00/page-concept-generation.ts');
    expect(api).toContain('pageConceptGenerationDryRun');
    expect(api).toContain('READY_FOR_PROVIDER_DISPATCH');
    expect(api).toContain('trustIncomingCaptures');
    expect(api).not.toContain('localStorage');
  });

  it('runPageConceptGeneration uses validateIncomingPageConceptCaptures before plan', () => {
    const runSrc = read('api/_lib/site00PageConcept/runPageConceptGeneration.ts');
    expect(runSrc).toContain('validateIncomingPageConceptCaptures');
    expect(runSrc).toContain('trustIncomingCaptures: true');
  });
});
