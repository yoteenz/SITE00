import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bootstrapB43 } from '../api/_lib/site00ExpressionEngine/entry002B43Bootstrap.js';
import {
  ENTRY_002_REEL_KF_AUTHORITATIVE_PROVENANCE,
} from '../shared/site00-expression-engine/entry002ReelKeyframeProvenance.js';
import {
  getGenerationReceipt,
  resetLineageStore,
} from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';

vi.mock('../api/_lib/site00Assts/storage.js', () => ({
  site00StorageObjectExists: vi.fn(async () => true),
  getSite00AssetPublicUrl: vi.fn(
    (path: string) => `https://storage.test/${path}`,
  ),
}));

describe('Expression Engine Sprint B4.3 — Provenance reconciliation + review surfacing', () => {
  beforeEach(() => {
    resetLineageStore();
  });

  it('1. reconciles Record A as superseded and Record B as authoritative', async () => {
    const b43 = await bootstrapB43();
    expect(b43.provenanceStatus).toBe('RECONCILED');
    expect(b43.relationshipSummary).toContain('Record A');
    expect(b43.relationshipSummary).toContain('Record B');
    for (const p of b43.provenance) {
      expect(p.executedModel).toBe('fal-ai/flux-pro/v1.1');
      expect(p.requestedModel).toBe('fal-ai/flux-pro/v1.1');
      expect(p.fallbackUsed).toBe(false);
      expect(p.supersededExecutions.length).toBe(1);
      expect(p.supersededExecutions[0].executedModel).toBe('openai/gpt-image-2');
      expect(p.supersededExecutions[0].fallbackUsed).toBe(true);
    }
  });

  it('2. authoritative generation receipt uses executed model not contradictory claims', async () => {
    const b43 = await bootstrapB43();
    for (const p of b43.provenance) {
      const receipt = getGenerationReceipt(p.generationReceiptId)!;
      expect(receipt.model).toBe('fal-ai/flux-pro/v1.1');
      expect(receipt.provider).toBe('fal-flux');
      expect(receipt.promptLineage).toContain('executed-model:fal-ai/flux-pro/v1.1');
      expect(receipt.promptLineage).toContain('fallback-used:NO');
    }
  });

  it('3. surfaces three review frames with public URLs — no new generation', async () => {
    const b43 = await bootstrapB43();
    expect(b43.reviewFrames.length).toBe(3);
    expect(b43.reviewFrames.map((f) => f.role)).toEqual(['START', 'MID', 'END']);
    for (const frame of b43.reviewFrames) {
      expect(frame.actualFileExists).toBe(true);
      expect(frame.previewUrl).toContain('storage.test');
      expect(frame.founderJudgment).toBe('UNREVIEWED');
    }
  });

  it('4. pinned provider request IDs match authoritative manifest', async () => {
    const b43 = await bootstrapB43();
    for (const manifest of ENTRY_002_REEL_KF_AUTHORITATIVE_PROVENANCE) {
      const p = b43.provenance.find((r) => r.role === manifest.role)!;
      expect(p.providerRequestId).toBe(manifest.providerRequestId);
      expect(p.generationReceiptId).toBe(manifest.generationReceiptId);
    }
  });

  it('5. founder judgment remains UNREVIEWED — QA not converted to approval', async () => {
    const b43 = await bootstrapB43();
    expect(b43.qaAdvisory).toBe('PASS — NOT FOUNDER APPROVAL');
    expect(b43.reviewFrames.every((f) => f.founderJudgment === 'UNREVIEWED')).toBe(true);
    expect(b43.motionBlocked).toBe(true);
    expect(b43.klingBlocked).toBe(true);
  });
});
