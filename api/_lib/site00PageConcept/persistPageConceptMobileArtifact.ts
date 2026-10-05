import { createHash } from 'node:crypto';

import { uploadSite00AssetBuffer } from '../site00Assts/storage.js';
import { logPageConceptGpt2MobileEvent } from './pageConceptGpt2MobileObservability.js';
import type { PageMobileConceptSlotId } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js';

export async function persistPageConceptMobileArtifact(input: {
  runId: string;
  projectId: string;
  pageId: string;
  conceptSlot: PageMobileConceptSlotId;
  artifactId: string;
  providerJobId: string;
  imageBase64: string;
  cgptBriefId: string;
  skinVersion: string;
}): Promise<{ storagePath: string; publicUrl: string; checksum: string; artifactId: string }> {
  const buffer = Buffer.from(input.imageBase64, 'base64');
  const checksum = createHash('sha256').update(buffer).digest('hex');
  const safeRun = input.runId.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 48);
  const storagePath = `site00/page-concept/${input.projectId}/${input.pageId}/${safeRun}/${input.conceptSlot}.png`;

  if (process.env.VITEST === 'true') {
    return {
      storagePath,
      publicUrl: `data:image/png;base64,${input.imageBase64}`,
      checksum,
      artifactId: input.artifactId,
    };
  }

  const { publicUrl, storagePath: stored } = await uploadSite00AssetBuffer(storagePath, buffer, 'image/png', {
    upsert: true,
  });

  logPageConceptGpt2MobileEvent('GPT2_MOBILE_ARTIFACT_PERSISTED', {
    runId: input.runId,
    conceptSlot: input.conceptSlot,
    providerJobId: input.providerJobId,
    artifactId: input.artifactId,
  });

  return { storagePath: stored, publicUrl, checksum, artifactId: input.artifactId };
}
