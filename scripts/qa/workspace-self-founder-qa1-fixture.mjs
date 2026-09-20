/**
 * Builds localStorage fixture for WORKSPACE_SELF founder QA (no provider spend).
 */
import {
  compileAndFreezeFunctionContract,
  createInitialWorkspaceSelfState,
} from '../../shared/site00-design-workspace-production/workspaceSelfConcept/workflow.js';
import {
  applyWorkspaceSelfCapturePair,
  beginWorkspaceSelfCaptureSet,
} from '../../shared/site00-design-workspace-production/workspaceSelfConcept/captureWorkflow.js';
import {
  applyCreativePipelineSet,
  beginWorkspaceConceptSet,
  mergeGenerationArtifactsIntoConcepts,
  registerGenerationJobs,
} from '../../shared/site00-design-workspace-production/workspaceSelfConcept/generationWorkflow.js';
import { WORKSPACE_SELF_PIPELINE_SCHEMA_SINGLE } from '../../shared/site00-design-workspace-production/workspaceSelfConcept/pipelineLegacy.js';
import { activateWorkspaceConcept, selectViewportConceptForReview } from '../../shared/site00-design-workspace-production/workspaceSelfConcept/reviewState.js';

const PNG_1X1 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function job(conceptId, viewport, captureSetId, gpt2Id, ctxId) {
  return {
    artifactId: `wsga-${conceptId}-${viewport}`,
    conceptId,
    renditionSlot: conceptId,
    territoryId: gpt2Id,
    viewport,
    captureSetId,
    functionContractId: 'wsfc-qa',
    creativeBriefSetId: 'wsp-qa',
    creativeContextId: ctxId,
    creativeDirectionId: ctxId,
    gpt2ConceptId: gpt2Id,
    sourceGpt2ConceptId: gpt2Id,
    provider: 'NBP',
    model: 'fal-ai/nano-banana-pro/edit',
    providerJobId: 'qa-job',
    promptVersion: 'qa',
    createdAt: new Date().toISOString(),
    status: 'READY',
    artifactPath: null,
    imageUri: PNG_1X1,
    width: viewport === 'MOBILE' ? 390 : 1440,
    height: viewport === 'MOBILE' ? 844 : 1024,
    renditionDirective: `QA rendition ${conceptId}`,
  };
}

export function buildQaWorkflowState() {
  let s = compileAndFreezeFunctionContract(createInitialWorkspaceSelfState());
  s = beginWorkspaceSelfCaptureSet(s, { build: 'qa-fixture', createdBy: 'kateenaarmstrong@gmail.com' });
  const captureSetId = s.activeCaptureSetId;
  s = applyWorkspaceSelfCapturePair(s, {
    captureSetId,
    build: 'qa-fixture',
    createdBy: 'kateenaarmstrong@gmail.com',
    route: '/projects/design/ndxbook',
    mobile: { captureId: 'qa-m', artifactPath: 'local://qa-m' },
    desktop: { captureId: 'qa-d', artifactPath: 'local://qa-d' },
  });

  const ctxId = 'wctx-qa-single';
  const gpt2Id = 'wg2-qa-single';
  const pipelineSet = {
    pipelineSetId: 'wsp-qa',
    targetId: s.targetId,
    captureSetId,
    functionContractId: s.functionContract.contractId,
    schemaVersion: WORKSPACE_SELF_PIPELINE_SCHEMA_SINGLE,
    creativeContext: {
      creativeContextId: ctxId,
      targetId: s.targetId,
      captureSetId,
      functionContractId: s.functionContract.contractId,
      identityContext: 'SITE 00 QA',
      pageOrWorkspacePurpose: 'Workspace self concept review',
      requiredContent: 'Gallery, rail, compare',
      functionalRequirements: 'Immutable contract',
      visualProblems: 'None in QA',
      hierarchyPriorities: 'GPT2 then renditions',
      creativeLatitude: 'Moderate',
      visualDirection: 'Editorial',
      spatialDirection: 'Split',
      responsiveDirection: 'Mobile stack',
      immutableRules: ['routes'],
      createdAt: new Date().toISOString(),
      cgptProvider: 'qa',
      cgptModel: 'qa',
    },
    gpt2AuthorityConcept: {
      conceptId: gpt2Id,
      creativeContextId: ctxId,
      targetId: s.targetId,
      name: 'GPT2 Authority — Unified Workspace',
      premise: 'Single concept for all renditions',
      compositionStrategy: 'Editorial split',
      hierarchyStrategy: 'Project first',
      interactionPresentation: 'Recessed controls',
      visualLanguage: 'SITE 00 host',
      responsiveIntent: 'Mobile + desktop pairs',
      authorityImage: PNG_1X1,
      layoutStrategy: 'Panels',
      mobileComposition: 'Stack',
      desktopComposition: 'Split',
      preservedFunctions: ['tabs'],
      prohibitedChanges: ['routes'],
      gpt2Provider: 'qa',
      gpt2Model: 'qa',
      createdAt: new Date().toISOString(),
    },
    renditions: ['CONCEPT_A', 'CONCEPT_B', 'CONCEPT_C'].map((slot) => ({
      renditionId: `wrend-${slot}-qa`,
      conceptSetId: 'wscs-qa',
      slot,
      sourceGpt2ConceptId: gpt2Id,
      mobileArtifactId: `wsga-${slot}-MOBILE`,
      desktopArtifactId: `wsga-${slot}-DESKTOP`,
      status: 'READY',
      renditionDirective: `Rendition ${slot}`,
    })),
    createdAt: new Date().toISOString(),
  };

  s = applyCreativePipelineSet(s, pipelineSet);
  s = beginWorkspaceConceptSet(s, {
    captureSetId,
    functionContractId: s.functionContract.contractId,
    creativeBriefSetId: pipelineSet.pipelineSetId,
    createdBy: 'kateenaarmstrong@gmail.com',
  });
  const jobs = ['CONCEPT_A', 'CONCEPT_B', 'CONCEPT_C'].flatMap((id) => [
    job(id, 'MOBILE', captureSetId, gpt2Id, ctxId),
    job(id, 'DESKTOP', captureSetId, gpt2Id, ctxId),
  ]);
  s = registerGenerationJobs(s, jobs);
  s = mergeGenerationArtifactsIntoConcepts(s);
  s = activateWorkspaceConcept(s, 'CONCEPT_A');
  s = selectViewportConceptForReview(s, 'MOBILE', 'CONCEPT_B');
  s = selectViewportConceptForReview(s, 'DESKTOP', 'CONCEPT_C');
  s = {
    ...s,
    generationStatus: 'READY_FOR_REVIEW',
    reviewUi: {
      ...s.reviewUi,
      inspectedConceptId: null,
      compareOpen: false,
      fullscreenOpen: false,
    },
  };
  return s;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(buildQaWorkflowState()));
}
