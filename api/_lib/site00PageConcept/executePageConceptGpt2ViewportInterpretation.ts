import { renderPageGpt2DirectJob } from './renderPageGpt2DirectJob.js';
import type { PageGpt2ViewportInterpretationPackage } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2ViewportInterpretationPackage.js';
import type { PageConceptGeneratedArtifact } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

export type ViewportInterpretationRenderResult = {
  job: PageConceptGeneratedArtifact;
  interpretationId: string;
  version: string;
  imageUri: string;
  providerJobId: string;
};

function parseMobileAuthorityB64(imageUri: string | null): string {
  if (!imageUri?.trim()) throw new Error('VIEWPORT_INTERPRETATION_BLOCKED: MOBILE_AUTHORITY_REQUIRED');
  const m = imageUri.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (m?.[1]) return m[1];
  if (!imageUri.includes('data:')) return imageUri;
  throw new Error('VIEWPORT_INTERPRETATION_BLOCKED: MOBILE_AUTHORITY_PARSE_FAILED');
}

export async function executePageConceptGpt2ViewportInterpretation(input: {
  pkg: PageGpt2ViewportInterpretationPackage;
  artifactId: string;
  interpretationId: string;
  version: string;
  planMeta: {
    projectId: string;
    pageId: string;
    captureSetId: string;
    projectContextVersion: string;
    pageContextVersion: string;
    functionContractId: string;
    creativeInjectionId: string;
    selectedMobileConceptId: string;
  };
  width: number;
  height: number;
  dryRun?: boolean;
}): Promise<ViewportInterpretationRenderResult> {
  const viewport = input.pkg.target;
  const provider = viewport === 'TABLET' ? 'GPT2_TABLET' : 'GPT2_DESKTOP';

  if (process.env.VITEST === 'true' || input.dryRun) {
    const imageUri = `data:image/png;base64,${Buffer.from(`vitest-${viewport}-${input.interpretationId}`, 'utf8').toString('base64')}`;
    return {
      interpretationId: input.interpretationId,
      version: input.version,
      imageUri,
      providerJobId: `vitest-${provider}`,
      job: {
        artifactId: input.artifactId,
        projectId: input.planMeta.projectId,
        pageId: input.planMeta.pageId,
        renditionSlot: 'RENDITION_A',
        viewport,
        captureSetId: input.planMeta.captureSetId,
        projectContextVersion: input.planMeta.projectContextVersion,
        pageContextVersion: input.planMeta.pageContextVersion,
        functionContractId: input.planMeta.functionContractId,
        creativeInjectionId: input.planMeta.creativeInjectionId,
        gpt2AuthorityConceptId: input.planMeta.selectedMobileConceptId,
        renditionId: input.interpretationId,
        provider,
        model: input.pkg.model,
        providerJobId: `vitest-${provider}`,
        promptVersion: input.pkg.promptVersion,
        createdAt: new Date().toISOString(),
        status: 'READY',
        artifactPath: null,
        imageUri,
        width: input.width,
        height: input.height,
      },
    };
  }

  const authorityB64 = parseMobileAuthorityB64(
    input.pkg.mobileAuthorityBase64.startsWith('data:') ?
      input.pkg.mobileAuthorityBase64
    : `data:image/png;base64,${input.pkg.mobileAuthorityBase64}`,
  );

  const render = await renderPageGpt2DirectJob({
    package: {
      prompt: input.pkg.prompt,
      authorityBase64: authorityB64,
      inspector: {
        visualAuthorityPresent: true,
        skinContractVersion: input.pkg.lineage.skinContractVersion,
        cgptDirectionId: input.pkg.lineage.cgptBriefId,
        functionContractVersion: input.pkg.lineage.functionContractVersion,
        currentScreenshotRole: 'OMITTED',
        promptVersion: input.pkg.promptVersion,
      },
      lineage: {
        renderLaneType: 'GPT2_DIRECT',
        renderMode: 'NBP_FULL_SET',
        viewport: viewport === 'TABLET' ? 'MOBILE' : 'DESKTOP',
        authorityArtifactId: input.pkg.lineage.mobileArtifactId,
        authoritySourceRunId: input.interpretationId,
      },
    },
    width: input.width,
    height: input.height,
  });

  const imageUri = `data:image/png;base64,${render.imageBase64}`;
  return {
    interpretationId: input.interpretationId,
    version: input.version,
    imageUri,
    providerJobId: render.providerJobId,
    job: {
      artifactId: input.artifactId,
      projectId: input.planMeta.projectId,
      pageId: input.planMeta.pageId,
      renditionSlot: 'RENDITION_A',
      viewport,
      captureSetId: input.planMeta.captureSetId,
      projectContextVersion: input.planMeta.projectContextVersion,
      pageContextVersion: input.planMeta.pageContextVersion,
      functionContractId: input.planMeta.functionContractId,
      creativeInjectionId: input.planMeta.creativeInjectionId,
      gpt2AuthorityConceptId: input.planMeta.selectedMobileConceptId,
      renditionId: input.interpretationId,
      provider,
      model: render.model,
      providerJobId: render.providerJobId,
      promptVersion: input.pkg.promptVersion,
      createdAt: new Date().toISOString(),
      status: 'READY',
      artifactPath: null,
      imageUri,
      width: input.width,
      height: input.height,
    },
  };
}
