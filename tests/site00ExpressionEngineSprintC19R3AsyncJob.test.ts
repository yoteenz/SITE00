/**
 * C1.9R3 async job polling tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMeridianLiveJob,
  resetMeridianLiveJobs,
  serializeMeridianLiveJobPoll,
  startC19R3MeridianLiveJob,
} from '../api/_lib/site00ExpressionEngine/meridianLiveJobService.js';
import {
  resetBrandLanguageStore,
  initBrandLanguageStore,
} from '../api/_lib/site00ExpressionEngine/brandLanguage/brandLanguageSupabaseStore.js';
import {
  resetCampaignCopyStore,
  initCampaignCopyStore,
} from '../api/_lib/site00ExpressionEngine/campaignCopy/campaignCopyStore.js';
import {
  resetCreativeIntelligenceStore,
  initCreativeIntelligenceStore,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeIntelligenceStore.js';
import { resetMeridianLiveProofStore } from '../api/_lib/site00ExpressionEngine/meridianLiveProofStore.js';

describe('C1.9R3 async Meridian live job', () => {
  beforeEach(() => {
    process.env.VITEST = 'true';
    resetMeridianLiveJobs();
    resetBrandLanguageStore();
    resetCampaignCopyStore();
    resetCreativeIntelligenceStore();
    resetMeridianLiveProofStore();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('POST start returns immediately with jobId', () => {
    const started = Date.now();
    const job = startC19R3MeridianLiveJob();
    const elapsed = Date.now() - started;
    expect(elapsed).toBeLessThan(500);
    expect(job.jobId).toBeTruthy();
    expect(['QUEUED', 'RUNNING']).toContain(job.status);
  });

  it('GET poll completes with view payload', async () => {
    const job = startC19R3MeridianLiveJob();
    let polled = getMeridianLiveJob(job.jobId)!;
    const deadline = Date.now() + 120_000;
    while (polled.status !== 'COMPLETED' && polled.status !== 'FAILED' && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 100));
      polled = getMeridianLiveJob(job.jobId)!;
    }
    expect(polled.status).toBe('COMPLETED');
    const payload = serializeMeridianLiveJobPoll(polled);
    expect(payload.view).toBeTruthy();
    expect(payload.sprint).toBe('C1.9R3_LIVE_POST_REDEPLOY');
  });

  it('reuses in-flight job instead of starting duplicate', () => {
    const a = startC19R3MeridianLiveJob();
    const b = startC19R3MeridianLiveJob();
    expect(a.jobId).toBe(b.jobId);
  });
});
