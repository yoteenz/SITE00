import { captureApiFetch } from './captureApiFetch.js';
import type { PageConceptGenerationState } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type { PageConceptViewportFamilyAction } from '../../../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';

const PATH = '/api/site00/page-concept-viewport-family';

export async function pageConceptViewportFamilyActionApi(input: {
  action: PageConceptViewportFamilyAction['type'];
  state: PageConceptGenerationState;
  conceptId?: string;
  viewport?: 'MOBILE' | 'TABLET' | 'DESKTOP';
  imageUri?: string;
  dryRun?: boolean;
}): Promise<{
  state: PageConceptGenerationState;
  jobs?: readonly import('../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js').PageConceptGeneratedArtifact[];
}> {
  const result = await captureApiFetch<{ ok: boolean; state?: PageConceptGenerationState; jobs?: unknown; error?: string }>(
    PATH,
    {
      method: 'POST',
      body: {
        action: input.action,
        state: input.state,
        conceptId: input.conceptId,
        viewport: input.viewport,
        imageUri: input.imageUri,
        dryRun: input.dryRun,
      },
    },
  );
  if (result.status !== 200 || !result.ok || !result.data?.state) {
    throw new Error(result.data?.error ?? 'VIEWPORT_FAMILY_ACTION_FAILED');
  }
  return { state: result.data.state, jobs: result.data.jobs as never };
}
