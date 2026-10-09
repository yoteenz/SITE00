import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createArtifactForLead } from './service.js';
import { resetDigitalFoundationMemoryStore, memGetArtifactByToken, getDfMemoryState } from './memoryStore.js';
import {
  mergePreviewSnapshotFromDisk,
  previewSnapshotPath,
  writePreviewSnapshotFromState,
} from './previewMemorySnapshot.js';

describe('previewMemorySnapshot', () => {
  const env = process.env;
  let tmpDir = '';

  afterEach(() => {
    process.env = { ...env };
    resetDigitalFoundationMemoryStore();
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('round-trips artifacts through shared snapshot file', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'df-preview-'));
    process.env.NODE_ENV = 'development';
    process.env.SITE00_CLOUD_MOBILE_PREVIEW = '1';
    process.env.SITE00_DF_PREVIEW_SNAPSHOT_PATH = path.join(tmpDir, 'snap.json');

    resetDigitalFoundationMemoryStore();
    const artifact = createArtifactForLead({ business_name: 'Snap test', referral_kind: 'DIRECT' });
    writePreviewSnapshotFromState(getDfMemoryState());

    resetDigitalFoundationMemoryStore();
    delete process.env.SITE00_CLOUD_MOBILE_PREVIEW;
    const fresh = getDfMemoryState();
    expect(memGetArtifactByToken(artifact.public_token)).toBeUndefined();
    process.env.SITE00_CLOUD_MOBILE_PREVIEW = '1';
    mergePreviewSnapshotFromDisk(fresh);
    expect(memGetArtifactByToken(artifact.public_token)?.artifact_id).toBe(artifact.artifact_id);
    expect(previewSnapshotPath()).toContain('snap.json');
  });
});
