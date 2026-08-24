import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getClientProjectsPayload } from '../_lib/site00Production/clientStudio.js';
import { getSite00ProjectsIndexPayload, resolveSite00Project } from '../_lib/site00Projects/projectResolver.js';
import { isFounderProjectSlug } from '../_lib/site00Projects/projectRegistry.js';
import {
  canAccessFounderProjectAsOwner,
  canAccessFounderProjectIndex,
} from '../_lib/site00Access/accessModel.js';
import {
  getCreativeDirectionPayload,
  recordFounderDecision,
} from '../_lib/site00Evolve/creativeDirection/engagementService.js';
import { orgIdFromSlug } from '../_lib/site00Evolve/orgRegistry.js';
import { submitOrgLoreCalibration, getOrReconcileBrandLoreForOrg } from '../_lib/site00BrandLore/loreService.js';
import {
  getOrCreateActivePersonalityReplay,
  saveReplayPersonalityAnswers,
  completeReplayPersonalityIntake,
  resolvePersonalityReplayResumeStepId,
  getPersonalityReplay,
  executePersonalityReplayDownstream,
  getReplayExecutionDiagnosticForId,
} from '../_lib/site00Evolve/creativeDirection/personalityReplay/replayService.js';
import {
  executeSixDirectionConsistencyValidation,
  setSixDirectionFounderJudgment,
} from '../_lib/site00Evolve/creativeDirection/personalityReplay/sixDirectionConsistencyService.js';
import {
  executeCanonicalCreativeRangeValidation,
  getCanonicalCreativeRangeRun,
  getCanonicalRangePreflight,
  setCanonicalRangeFounderJudgment,
} from '../_lib/site00Evolve/creativeDirection/canonicalCreativeRange/canonicalCreativeRangeService.js';
import {
  executeCanonicalCarouselExpansion,
  getCarouselExpansionPreflight,
  getCanonicalCarouselExpansionRun,
  setCarouselDirectionFounderVerdict,
  setCarouselSlideFounderJudgment,
} from '../_lib/site00Evolve/creativeDirection/canonicalCarouselExpansion/canonicalCarouselExpansionService.js';
import {
  executeExperimentDHeroGeneration,
  formExperimentDTerritories,
  getSixConceptHeroRangeRun,
  setExperimentDHeroJudgment,
} from '../_lib/site00Evolve/creativeDirection/conceptTerritoryExperiment/experimentDService.js';
import {
  formSixConcepts,
  getSixConceptReformationRun,
  prepareExperimentFSnapshot,
  reformExperimentFSet,
  setExperimentFConceptJudgment,
} from '../_lib/site00Evolve/creativeDirection/conceptTerritoryV2Experiment/experimentFService.js';
import {
  formSixBrandPresentationConcepts,
  getBrandPresentationConceptFormationRun,
  prepareExperimentGSnapshot,
  reformExperimentGSet,
  setExperimentGConceptJudgment,
} from '../_lib/site00Evolve/creativeDirection/brandPresentationConceptExperiment/experimentGService.js';
import {
  formSixBrandCharacterTerritories,
  getBrandCharacterFormationRun,
  prepareBrandCharacterSnapshot,
  reformBrandCharacterSet,
  setBrandCharacterJudgment,
  compileSelectedBrandCharacterSystem,
  developBrandCharacter,
} from '../_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterService.js';
import {
  getBrandCharacterReadinessState,
  evaluateAndPersistBrandCharacterReadiness,
  submitBrandCharacterDeepeningAnswer,
  setBrandCharacterReadinessOverride,
  evaluateNdxbookCharacterReadinessReport,
} from '../_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterReadinessService.js';
import {
  getBrandCharacterSynthesisState,
  prepareBrandCharacterSynthesis,
  runCompositeBrandCharacterSynthesis,
  setBrandCharacterSynthesisJudgment,
  compileSynthesisBrandCharacterSystem,
  formulateBrandCharacterArtifactProofs,
  generateBrandCharacterArtifactProofAsset,
  setBrandCharacterArtifactProofJudgment,
} from '../_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterSynthesisService.js';
import {
  formBrandPresentationDirections,
  getBrandPresentationDirectionFormationRun,
  prepareBrandPresentationDirectionParents,
  reviseBrandPresentationDirection,
  setBrandPresentationDirectionJudgment,
  estimateDirectionFormationCost,
} from '../_lib/site00Evolve/creativeDirection/brandPresentationDirectionExperiment/directionService.js';
import {
  formulateVisualExpressions,
  generateFinalistVisuals,
  getBrandPresentationVisualFormulationRun,
  prepareVisualFormulationRun,
  reviseDirectionBenchmark,
  reviseVisualExpression,
  selectBrandPresentationWinner,
  setDirectionBenchmarkJudgment,
  setVisualExpressionJudgment,
  setVisualFinalistSelection,
  estimateVisualGenerationCost,
} from '../_lib/site00Evolve/creativeDirection/brandPresentationVisualFormulationExperiment/visualFormulationService.js';
import { getExperimentFMethodologyOverlay } from '../../shared/site00-brand-lore/brandPresentationConceptTerritory/experimentFInterpretation.js';
import { getExperimentDMethodologyOverlay } from '../../shared/site00-brand-lore/conceptTerritoryV2/experimentDInterpretation.js';
import {
  compileExperienceImplementationContractForConcept,
  compileExperienceAssetDirectionForConcept,
  compileExperienceAssetManifestForConcept,
  generateExperienceAssetVisualDevelopment,
  promoteExperienceAssetToProduction,
  formExperienceConcepts,
  generateExperienceVisualDevelopment,
  getExperienceExpressionRun,
  refreshExperienceExpressionRun,
  selectExperienceTestTerritory,
  setExperienceConceptJudgment,
  estimateVisualDevelopmentCost,
} from '../_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/experimentEService.js';
import {
  composeNdxbookHeroFrame,
  compileNdxbookHeroFrameSubset,
  generateNdxbookHeroAssets,
  getProjectWorkspaceHeroRun,
  prepareNdxbookHeroPrerequisites,
  refreshProjectWorkspaceHeroRun,
  setNdxbookHeroJudgment,
} from '../_lib/site00Evolve/creativeDirection/projectWorkspace/projectWorkspaceService.js';
import {
  generateVisualDevelopmentDesignProof,
  generateReferenceConditionedDesignProof,
  getProjectWorkspaceVisualDevelopmentRun,
  orchestrateVisualDevelopmentImplementation,
  prepareVisualDevelopmentImplementation,
  refreshProjectWorkspaceVisualDevelopmentRun,
  refreshVisualDevelopmentReferences,
  compileVisualDevelopmentReferencePackage,
  excludeVisualDevelopmentReference,
  generateMissingInterfaceAssets,
  prepareComposedInterfaceSurface,
  setVisualDevelopmentProofJudgment,
} from '../_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/visualDevelopmentService.js';
import {
  getCreativeLineageLibrary,
  normalizeNdxbookCreativeLineage,
  runNdxbookForensicAudit,
  updateCreativeAssetProduction,
  createWinningWorldPromotionPlan,
  promoteWinningWorld,
  saveSalvageReviewAction,
  selectAssetForLaunchSeed,
  reconcileNdxbookLaunchSeedSemantics,
} from '../_lib/site00Evolve/creativeLineage/creativeLineageService.js';
import {
  recordFounderCreativeJudgment,
  createRevisionSpecDraft,
  updateCreativeRevisionSpec,
  compileRevisionSpec,
  getRevisionHistory,
  attemptGenerateRevision,
  approveRevisionSpecForGeneration,
  getRevisionComparisonState,
  setPreferredRevisionVersion,
  runFounderJudgmentForensicAudit,
} from '../_lib/site00Evolve/creativeLineage/founderJudgmentRevisionService.js';
import type { CarouselExecuteMode } from '../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import type { CreativeLineageLibraryFilters } from '../../shared/site00-brand-lore/creativeLineage/types.js';
import type { ProjectExperienceClass } from '../../shared/site00-world-intake/constants.js';
import {
  compileProjectIntelligenceManifest,
  getProjectIntelligenceState,
  resolveExperienceClassForProject,
} from '../_lib/site00ProjectIntelligence/projectIntelligenceService.js';
import { listStudioWorldRuns, listCapabilityVerifications } from '../_lib/site00StudioWorldExecution/storeAdapter.js';
import { mergeCapabilityVerifications } from '../../shared/site00-studio-world-execution/capabilityVerification.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function json(res: VercelResponse, status: number, payload: unknown): void {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(payload);
}

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (!req.body) return null;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return req.body as Record<string, unknown>;
}

/** Authenticated project index + canonical client project-owner API */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return json(res, 405, {
      ok: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
      source: 'site00_project_resolver',
    });
  }

  const user = await getAuthUser(req);
  if (!user?.email) {
    return json(res, 401, {
      ok: false,
      error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      source: 'site00_project_resolver',
    });
  }

  const action = String(req.query.action ?? (req.method === 'POST' ? parseBody(req)?.action : '') ?? 'index');

  try {
    switch (action) {
      case 'index': {
        const clientPayload = await getClientProjectsPayload(user.email, user.id);
        const clientProjects = (clientPayload.projects ?? [])
          .filter((p) => !isFounderProjectSlug(p.slug))
          .map((p) => ({ id: p.id, slug: p.slug, name: p.name, studioRoute: p.studioRoute }));

        if (!canAccessFounderProjectIndex(user.email)) {
          return json(res, 200, {
            ok: true,
            projects: [],
            source: 'site00_project_resolver',
            summary: {
              total: clientProjects.length,
              founderIndex: 0,
              clientProjects: clientProjects.length,
              partial: 0,
            },
            clientProjects,
          });
        }

        const payload = await getSite00ProjectsIndexPayload(clientProjects);
        return json(res, 200, payload);
      }
      case 'detail': {
        const slug = String(req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_project_resolver',
          });
        }
        if (isFounderProjectSlug(slug) && !canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_project_resolver',
          });
        }
        const detail = await resolveSite00Project(slug);
        if (!detail) {
          return json(res, 404, {
            ok: false,
            error: { code: 'NOT_FOUND', message: 'Project not found' },
            source: 'site00_project_resolver',
          });
        }
        return json(res, 200, { ok: true, project: detail, source: 'site00_project_resolver' });
      }
      case 'creative_direction': {
        const slug = String(req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_project_resolver',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_project_resolver',
          });
        }
        const payload = await getCreativeDirectionPayload(slug);
        const orgId = orgIdFromSlug(slug);
        const loreProfile = orgId ? await getOrReconcileBrandLoreForOrg(orgId, slug) : null;
        const appetitePayload = orgId
          ? await (async () => {
              const { getCreativeAppetiteInspectorPayload } = await import(
                '../_lib/site00BrandLore/creativeAppetiteService.js'
              );
              return getCreativeAppetiteInspectorPayload(slug, orgId);
            })()
          : null;
        return json(res, 200, {
          ...payload,
          brandLoreCalibrationAnswers: loreProfile?.rawLoreAnswers ?? {},
          ...(appetitePayload ?? {}),
        });
      }
      case 'creative_direction_decision': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_project_resolver',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_project_resolver',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_project_resolver',
          });
        }
        const type = String(body.type ?? '') as 'APPROVE' | 'REFINE' | 'HYBRIDIZE' | 'REJECT';
        if (!['APPROVE', 'REFINE', 'HYBRIDIZE', 'REJECT'].includes(type)) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_DECISION', message: 'Invalid decision type' },
            source: 'site00_project_resolver',
          });
        }
        const engagement = await recordFounderDecision(slug, {
          type,
          selectedTerritoryId: body.selectedTerritoryId ? String(body.selectedTerritoryId) : undefined,
          hybridSelections: Array.isArray(body.hybridSelections)
            ? (body.hybridSelections as Array<{ territoryId: string; elements: string[] }>)
            : undefined,
          refinementNotes: body.refinementNotes ? String(body.refinementNotes) : undefined,
          rejectedTerritoryIds: Array.isArray(body.rejectedTerritoryIds)
            ? body.rejectedTerritoryIds.map(String)
            : undefined,
          by: user.email,
        });
        return json(res, 200, { ok: true, engagement, source: 'canonical_founder_decision_service' });
      }
      case 'lore_calibration_submit': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_project_resolver',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_project_resolver',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_project_resolver',
          });
        }
        const orgId = orgIdFromSlug(slug);
        if (!orgId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'ORG_NOT_REGISTERED', message: 'Organization not registered' },
            source: 'site00_project_resolver',
          });
        }
        const answers = (body.answers ?? {}) as Record<string, string | string[]>;
        const personalityAnswers = (body.personalityAnswers ?? {}) as Record<string, string | string[]>;
        if (
          (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) &&
          (!personalityAnswers || Object.keys(personalityAnswers).length === 0)
        ) {
          return json(res, 400, {
            ok: false,
            error: { code: 'ANSWERS_REQUIRED', message: 'At least one calibration answer required' },
            source: 'site00_project_resolver',
          });
        }
        const { invalidateCreativeDirectionEngagement } = await import(
          '../_lib/site00Evolve/creativeDirection/engagementService.js'
        );
        await submitOrgLoreCalibration({
          orgId,
          orgSlug: slug,
          answers,
          personalityAnswers: Object.keys(personalityAnswers).length ? personalityAnswers : undefined,
        });
        // Force the next `creative_direction` read to re-resolve readiness from the just-updated
        // profile instead of returning this org's cached in-memory engagement (see engagementService.ts).
        invalidateCreativeDirectionEngagement(slug);
        const payload = await getCreativeDirectionPayload(slug);
        return json(res, 200, { ok: true, ...payload, source: 'site00_lore_calibration' });
      }
      case 'personality_calibration_submit': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_personality_calibration',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_personality_calibration',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_calibration',
          });
        }
        const orgId = orgIdFromSlug(slug);
        if (!orgId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'ORG_NOT_REGISTERED', message: 'Organization not registered' },
            source: 'site00_personality_calibration',
          });
        }
        const personalityAnswers = (body.personalityAnswers ?? body.answers ?? {}) as Record<
          string,
          string | string[]
        >;
        if (!personalityAnswers || Object.keys(personalityAnswers).length === 0) {
          return json(res, 400, {
            ok: false,
            error: { code: 'ANSWERS_REQUIRED', message: 'At least one personality answer required' },
            source: 'site00_personality_calibration',
          });
        }
        const { submitOrgPersonalityCalibration } = await import('../_lib/site00BrandLore/loreService.js');
        const { invalidateCreativeDirectionEngagement } = await import(
          '../_lib/site00Evolve/creativeDirection/engagementService.js'
        );
        await submitOrgPersonalityCalibration({ orgId, orgSlug: slug, personalityAnswers });
        invalidateCreativeDirectionEngagement(slug);
        const payload = await getCreativeDirectionPayload(slug);
        return json(res, 200, { ok: true, ...payload, source: 'site00_personality_calibration' });
      }
      case 'creative_appetite_submit': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_creative_appetite',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_creative_appetite',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_creative_appetite',
          });
        }
        const orgId = orgIdFromSlug(slug);
        if (!orgId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'ORG_NOT_REGISTERED', message: 'Organization not registered' },
            source: 'site00_creative_appetite',
          });
        }
        const appetiteAnswers = (body.answers ?? body.appetiteAnswers ?? {}) as Record<string, string | string[]>;
        if (!appetiteAnswers || typeof appetiteAnswers !== 'object' || Object.keys(appetiteAnswers).length === 0) {
          return json(res, 400, {
            ok: false,
            error: { code: 'ANSWERS_REQUIRED', message: 'At least one appetite answer required' },
            source: 'site00_creative_appetite',
          });
        }
        const { submitOrgCreativeAppetite, getCreativeAppetiteInspectorPayload } = await import(
          '../_lib/site00BrandLore/creativeAppetiteService.js'
        );
        const { invalidateCreativeDirectionEngagement } = await import(
          '../_lib/site00Evolve/creativeDirection/engagementService.js'
        );
        await submitOrgCreativeAppetite({ orgId, orgSlug: slug, appetiteAnswers });
        invalidateCreativeDirectionEngagement(slug);
        const payload = await getCreativeDirectionPayload(slug);
        const inspector = await getCreativeAppetiteInspectorPayload(slug, orgId);
        return json(res, 200, {
          ok: true,
          ...payload,
          ...inspector,
          source: 'site00_creative_appetite',
        });
      }
      case 'personality_replay_bootstrap': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, {
            ok: false,
            error: { code: 'NDXBOOK_ONLY', message: 'Personality replay is NDX BOOK only' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const orgId = orgIdFromSlug(slug)!;
        const replay = await getOrCreateActivePersonalityReplay({
          organizationId: orgId,
          orgSlug: slug,
          createdBy: user.email,
        });
        const resumeStepId = resolvePersonalityReplayResumeStepId(replay.rawPersonalityAnswers);
        return json(res, 200, {
          ok: true,
          replay,
          resumeStepId,
          source: 'site00_personality_replay',
        });
      }
      case 'personality_replay_save': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_personality_replay',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        const replayId = String(body.replayId ?? '');
        if (slug !== 'ndxbook' || !replayId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'ndxbook slug and replayId required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const replay = await saveReplayPersonalityAnswers({
          replayId,
          answers: (body.answers ?? {}) as Record<string, string | string[]>,
          completedSteps: body.completedSteps as string[] | undefined,
        });
        return json(res, 200, { ok: true, replay, source: 'site00_personality_replay' });
      }
      case 'personality_replay_complete': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_personality_replay',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        const replayId = String(body.replayId ?? '');
        if (slug !== 'ndxbook' || !replayId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'ndxbook slug and replayId required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const replay = await completeReplayPersonalityIntake(replayId);
        return json(res, 200, { ok: true, replay, source: 'site00_personality_replay' });
      }
      case 'personality_replay_get': {
        const slug = String(req.query.slug ?? '');
        const replayId = String(req.query.replayId ?? '');
        if (slug !== 'ndxbook' || !replayId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'ndxbook slug and replayId required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const replay = await getPersonalityReplay(replayId);
        return replay
          ? json(res, 200, { ok: true, replay, source: 'site00_personality_replay' })
          : json(res, 404, {
              ok: false,
              error: { code: 'REPLAY_NOT_FOUND', message: 'Replay not found' },
              source: 'site00_personality_replay',
            });
      }
      case 'personality_replay_diagnostic': {
        const slug = String(req.query.slug ?? '');
        const replayId = String(req.query.replayId ?? '');
        if (slug !== 'ndxbook' || !replayId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'ndxbook slug and replayId required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const diagnostic = await getReplayExecutionDiagnosticForId(replayId);
        return diagnostic
          ? json(res, 200, { ok: true, diagnostic, source: 'site00_personality_replay' })
          : json(res, 404, {
              ok: false,
              error: { code: 'REPLAY_NOT_FOUND', message: 'Replay not found' },
              source: 'site00_personality_replay',
            });
      }
      case 'personality_replay_execute': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_personality_replay',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        const replayId = String(body.replayId ?? '');
        if (slug !== 'ndxbook' || !replayId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'ndxbook slug and replayId required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const existing = await getPersonalityReplay(replayId);
        if (!existing) {
          return json(res, 404, {
            ok: false,
            error: { code: 'REPLAY_NOT_FOUND', message: 'Replay not found' },
            source: 'site00_personality_replay',
          });
        }
        if (existing.status === 'COMPARISON_READY' || existing.comparisonReport) {
          return json(res, 200, { ok: true, replay: existing, source: 'site00_personality_replay' });
        }
        if (process.env.VITEST === 'true') {
          const replay = await executePersonalityReplayDownstream(replayId);
          return json(res, 200, { ok: true, replay, source: 'site00_personality_replay' });
        }
        void executePersonalityReplayDownstream(replayId).catch((err) => {
          console.error('[personality-replay] resume execution failed', err);
        });
        const replay = await getPersonalityReplay(replayId);
        return json(res, 202, { ok: true, replay, source: 'site00_personality_replay' });
      }
      case 'personality_replay_six_direction_execute': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_personality_replay',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        const replayId = String(body.replayId ?? '');
        if (slug !== 'ndxbook' || !replayId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'ndxbook slug and replayId required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const existing = await getPersonalityReplay(replayId);
        if (!existing) {
          return json(res, 404, {
            ok: false,
            error: { code: 'REPLAY_NOT_FOUND', message: 'Replay not found' },
            source: 'site00_personality_replay',
          });
        }
        if (existing.sixDirectionConsistency?.status === 'COMPLETE') {
          return json(res, 200, { ok: true, replay: existing, source: 'site00_personality_replay' });
        }
        if (process.env.VITEST === 'true') {
          const replay = await executeSixDirectionConsistencyValidation(replayId);
          return json(res, 200, { ok: true, replay, source: 'site00_personality_replay' });
        }
        void executeSixDirectionConsistencyValidation(replayId).catch((err) => {
          console.error('[personality-replay] six-direction consistency failed', err);
        });
        const replay = await getPersonalityReplay(replayId);
        return json(res, 202, { ok: true, replay, source: 'site00_personality_replay' });
      }
      case 'personality_replay_six_direction_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_personality_replay',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const replayId = String(body.replayId ?? '');
        const comparisonIndex = Number(body.comparisonIndex ?? 0);
        const judgment = body.judgment as 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_NDXBOOK' | null;
        if (slug !== 'ndxbook' || !replayId || !comparisonIndex) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'slug, replayId, comparisonIndex required' },
            source: 'site00_personality_replay',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_personality_replay',
          });
        }
        const replay = await setSixDirectionFounderJudgment({ replayId, comparisonIndex, judgment });
        return json(res, 200, { ok: true, replay, source: 'site00_personality_replay' });
      }
      case 'canonical_creative_range_preflight': {
        if (req.method !== 'GET' && req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'GET or POST required' } });
        }
        const slug = String(req.query.slug ?? parseBody(req)?.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const preflight = await getCanonicalRangePreflight();
        return json(res, 200, { ok: true, preflight, source: 'site00_canonical_creative_range' });
      }
      case 'canonical_creative_range_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await getCanonicalCreativeRangeRun();
        return json(res, 200, { ok: true, run, source: 'site00_canonical_creative_range' });
      }
      case 'canonical_creative_range_execute': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const existing = await getCanonicalCreativeRangeRun();
        if (existing?.status === 'COMPLETE') {
          return json(res, 200, { ok: true, run: existing, source: 'site00_canonical_creative_range' });
        }
        if (process.env.VITEST === 'true') {
          const run = await executeCanonicalCreativeRangeValidation();
          return json(res, 200, { ok: true, run, source: 'site00_canonical_creative_range' });
        }
        void executeCanonicalCreativeRangeValidation().catch((err) => {
          console.error('[canonical-creative-range] execute failed', err);
        });
        const run = await getCanonicalCreativeRangeRun();
        return json(res, 202, { ok: true, run, source: 'site00_canonical_creative_range' });
      }
      case 'canonical_creative_range_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const comparisonIndex = Number(body.comparisonIndex ?? 0);
        const judgment = body.judgment as 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_NDXBOOK' | null;
        if (slug !== 'ndxbook' || !comparisonIndex) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const { run, lineage } = await setCanonicalRangeFounderJudgment({ comparisonIndex, judgment });
        return json(res, 200, { ok: true, run, lineage, source: 'site00_canonical_creative_range' });
      }
      case 'canonical_carousel_expansion_preflight': {
        if (req.method !== 'GET' && req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'GET or POST required' } });
        }
        const slug = String(req.query.slug ?? parseBody(req)?.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const preflight = await getCarouselExpansionPreflight();
        return json(res, 200, { ok: true, preflight, source: 'site00_canonical_carousel_expansion' });
      }
      case 'canonical_carousel_expansion_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await getCanonicalCarouselExpansionRun();
        return json(res, 200, { ok: true, run, source: 'site00_canonical_carousel_expansion' });
      }
      case 'canonical_carousel_expansion_execute': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        const mode = String(body.mode ?? 'ALL_REMAINING') as CarouselExecuteMode;
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        if (process.env.VITEST === 'true') {
          const run = await executeCanonicalCarouselExpansion({ mode });
          return json(res, 200, { ok: true, run, source: 'site00_canonical_carousel_expansion' });
        }
        void executeCanonicalCarouselExpansion({ mode }).catch((err) => {
          console.error('[canonical-carousel-expansion] execute failed', err);
        });
        const run = await getCanonicalCarouselExpansionRun();
        return json(res, 202, { ok: true, run, source: 'site00_canonical_carousel_expansion' });
      }
      case 'canonical_carousel_expansion_slide_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const comparisonIndex = Number(body.comparisonIndex ?? 0);
        const slideNumber = Number(body.slideNumber ?? 0);
        const judgment = body.judgment as 'LOVE_IT' | 'REVISE' | 'PROMISING_REFINE' | 'NOT_FOR_ME' | null;
        if (slug !== 'ndxbook' || !comparisonIndex || !slideNumber) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const { run, lineage } = await setCarouselSlideFounderJudgment({ comparisonIndex, slideNumber, judgment });
        return json(res, 200, { ok: true, run, lineage, source: 'site00_canonical_carousel_expansion' });
      }
      case 'canonical_carousel_expansion_direction_verdict': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const comparisonIndex = Number(body.comparisonIndex ?? 0);
        const verdict = body.verdict as
          | 'LOVE_THIS_DIRECTION'
          | 'KEEP_IN_CONTENTION'
          | 'BEAUTIFUL_BUT_TOO_NARROW'
          | 'TOO_REPETITIVE'
          | 'NOT_NDXBOOK'
          | null;
        const note = body.note as string | null | undefined;
        if (slug !== 'ndxbook' || !comparisonIndex) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setCarouselDirectionFounderVerdict({ comparisonIndex, verdict, note });
        return json(res, 200, { ok: true, run, source: 'site00_canonical_carousel_expansion' });
      }
      case 'experiment_d_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await getSixConceptHeroRangeRun();
        const methodologyOverlay = getExperimentDMethodologyOverlay();
        return json(res, 200, { ok: true, run, methodologyOverlay, source: 'site00_experiment_d' });
      }
      case 'experiment_d_form_territories': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await formExperimentDTerritories();
        return json(res, 200, { ok: true, run, source: 'site00_experiment_d' });
      }
      case 'experiment_d_execute_heroes': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        if (process.env.VITEST === 'true') {
          const run = await executeExperimentDHeroGeneration();
          return json(res, 200, { ok: true, run, source: 'site00_experiment_d' });
        }
        void executeExperimentDHeroGeneration().catch((err) => {
          console.error('[experiment-d] hero generation failed', err);
        });
        const run = await getSixConceptHeroRangeRun();
        return json(res, 202, { ok: true, run, source: 'site00_experiment_d' });
      }
      case 'experiment_d_hero_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const comparisonIndex = Number(body.comparisonIndex ?? 0);
        const judgment = body.judgment as
          | 'LOVE_THE_CONCEPT'
          | 'PROMISING_REFINE'
          | 'TOO_CLOSE_TO_ANOTHER'
          | 'NOT_NDXBOOK'
          | null;
        const tooCloseSibling = body.tooCloseSibling ? String(body.tooCloseSibling) : null;
        if (slug !== 'ndxbook' || !comparisonIndex) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setExperimentDHeroJudgment({ comparisonIndex, judgment, tooCloseSibling });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_d' });
      }
      case 'experiment_f_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await getSixConceptReformationRun();
        return json(res, 200, {
          ok: true,
          run,
          methodologyOverlay: getExperimentFMethodologyOverlay(),
          source: 'site00_experiment_f',
        });
      }
      case 'experiment_f_prepare_snapshot': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await prepareExperimentFSnapshot();
        return json(res, 200, { ok: true, run, source: 'site00_experiment_f' });
      }
      case 'experiment_f_form_concepts': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await formSixConcepts();
        return json(res, 200, { ok: true, run, source: 'site00_experiment_f' });
      }
      case 'experiment_f_concept_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const conceptId = String(body.conceptId ?? '');
        const judgment = body.judgment as
          | 'LOVE_THE_CONCEPT'
          | 'PROMISING_DEVELOP'
          | 'TOO_CLOSE'
          | 'NOT_NDXBOOK'
          | 'REFORM_SET'
          | null;
        if (slug !== 'ndxbook' || !conceptId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setExperimentFConceptJudgment({
          conceptId,
          judgment,
          note: body.note ? String(body.note) : null,
        });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_f' });
      }
      case 'experiment_f_reform_set': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await reformExperimentFSet();
        return json(res, 200, { ok: true, run, source: 'site00_experiment_f' });
      }
      case 'experiment_h_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await getBrandCharacterFormationRun();
        return json(res, 200, { ok: true, run, source: 'site00_experiment_h' });
      }
      case 'experiment_h_prepare_snapshot': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await prepareBrandCharacterSnapshot();
        return json(res, 200, { ok: true, run, source: 'site00_experiment_h' });
      }
      case 'experiment_h_form_characters': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await formSixBrandCharacterTerritories({ forceRetry: body.forceRetry === true });
        return json(res, 200, {
          ok: true,
          run,
          background: run.status === 'FORMING' && process.env.VITEST !== 'true',
          source: 'site00_experiment_h',
        });
      }
      case 'experiment_h_character_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const characterId = String(body.characterId ?? '');
        const judgment = body.judgment as
          | 'LOVE_THE_CHARACTER'
          | 'PROMISING_DEVELOP'
          | 'TOO_GENERIC'
          | 'TOO_PERFORMATIVE'
          | 'TOO_INTERNET'
          | 'TOO_ACADEMIC'
          | 'TOO_STYLE_DEPENDENT'
          | 'TOO_CLOSE_TO_ANOTHER'
          | 'CULTURALLY_HOLLOW'
          | 'NOT_NDXBOOK'
          | 'REFORM_SET'
          | null;
        if (slug !== 'ndxbook' || !characterId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setBrandCharacterJudgment({
          characterId,
          judgment,
          note: body.note ? String(body.note) : null,
        });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_h' });
      }
      case 'experiment_h_reform_set': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await reformBrandCharacterSet();
        return json(res, 200, {
          ok: true,
          run,
          background: run.status === 'FORMING' && process.env.VITEST !== 'true',
          source: 'site00_experiment_h',
        });
      }
      case 'experiment_h_develop_character': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const territoryId = String(body.territoryId ?? '');
        if (slug !== 'ndxbook' || !territoryId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const result = await developBrandCharacter({
          territoryId,
          founderDelta: body.founderDelta ?? null,
        });
        return json(res, 200, {
          ok: true,
          run: result.run,
          development: result.development,
          source: 'site00_experiment_h',
        });
      }
      case 'experiment_h_compile_system': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const characterId = String(body.characterId ?? '');
        const developmentId = body.developmentId ? String(body.developmentId) : undefined;
        if (slug !== 'ndxbook' || !characterId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const result = await compileSelectedBrandCharacterSystem({ characterId, developmentId });
        return json(res, 200, {
          ok: true,
          run: result.run,
          system: result.system,
          source: 'site00_experiment_h',
        });
      }
      case 'experiment_h_readiness_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const record = await getBrandCharacterReadinessState('ndxbook');
        return json(res, 200, { ok: true, record, source: 'site00_experiment_h_readiness' });
      }
      case 'experiment_h_readiness_evaluate': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const report = await evaluateNdxbookCharacterReadinessReport();
        return json(res, 200, { ok: true, ...report, source: 'site00_experiment_h_readiness' });
      }
      case 'experiment_h_deepening_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const record = await getBrandCharacterReadinessState('ndxbook');
        return json(res, 200, {
          ok: true,
          module: record?.deepeningModule ?? null,
          evaluation: record?.latestEvaluation ?? null,
          source: 'site00_experiment_h_deepening',
        });
      }
      case 'experiment_h_deepening_answer': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const questionId = String(body.questionId ?? '');
        const rawAnswer = String(body.rawAnswer ?? '');
        if (slug !== 'ndxbook' || !questionId || !rawAnswer.trim()) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const record = await submitBrandCharacterDeepeningAnswer({
          projectId: 'ndxbook',
          questionId,
          rawAnswer,
        });
        return json(res, 200, { ok: true, record, source: 'site00_experiment_h_deepening' });
      }
      case 'experiment_h_readiness_override': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const overrideReason = String(body.overrideReason ?? '');
        if (slug !== 'ndxbook' || !overrideReason.trim()) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const record = await setBrandCharacterReadinessOverride({
          projectId: 'ndxbook',
          overrideReason,
          missingDomains: Array.isArray(body.missingDomains) ? body.missingDomains : [],
          founderId: body.founderId ? String(body.founderId) : null,
        });
        return json(res, 200, { ok: true, record, source: 'site00_experiment_h_readiness' });
      }
      case 'experiment_h_synthesis_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await getBrandCharacterSynthesisState('ndxbook');
        return json(res, 200, { ok: true, run, source: 'site00_experiment_h_synthesis' });
      }
      case 'experiment_h_synthesis_prepare': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await prepareBrandCharacterSynthesis({ projectId: 'ndxbook' });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_h_synthesis' });
      }
      case 'experiment_h_synthesis_run': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await runCompositeBrandCharacterSynthesis({ projectId: 'ndxbook' });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_h_synthesis' });
      }
      case 'experiment_h_synthesis_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const judgment = body.judgment as string;
        if (slug !== 'ndxbook' || !judgment) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setBrandCharacterSynthesisJudgment({
          projectId: 'ndxbook',
          judgment: judgment as never,
          note: body.note ? String(body.note) : null,
        });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_h_synthesis' });
      }
      case 'experiment_h_synthesis_compile_system': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await compileSynthesisBrandCharacterSystem({ projectId: 'ndxbook' });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_h_synthesis' });
      }
      case 'experiment_h_artifact_proofs_formulate': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await formulateBrandCharacterArtifactProofs({ projectId: 'ndxbook' });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_h_artifact_proofs' });
      }
      case 'experiment_h_artifact_proof_generate': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const proofId = String(body.proofId ?? '');
        if (slug !== 'ndxbook' || !proofId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await generateBrandCharacterArtifactProofAsset({ projectId: 'ndxbook', proofId });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_h_artifact_proofs' });
      }
      case 'experiment_h_artifact_proof_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const proofId = String(body.proofId ?? '');
        const judgment = body.judgment as string;
        if (slug !== 'ndxbook' || !proofId || !judgment) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setBrandCharacterArtifactProofJudgment({
          projectId: 'ndxbook',
          proofId,
          judgment: judgment as never,
          note: body.note ? String(body.note) : null,
        });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_h_artifact_proofs' });
      }
      case 'experiment_g_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await getBrandPresentationConceptFormationRun();
        return json(res, 200, { ok: true, run, source: 'site00_experiment_g' });
      }
      case 'experiment_g_prepare_snapshot': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await prepareExperimentGSnapshot();
        return json(res, 200, { ok: true, run, source: 'site00_experiment_g' });
      }
      case 'experiment_g_form_concepts': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await formSixBrandPresentationConcepts({
          forceRetry: body.forceRetry === true,
        });
        return json(res, 200, {
          ok: true,
          run,
          background: run.status === 'FORMING' && process.env.VITEST !== 'true',
          source: 'site00_experiment_g',
        });
      }
      case 'experiment_g_concept_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const conceptId = String(body.conceptId ?? '');
        const judgment = body.judgment as
          | 'LOVE_THE_CONCEPT'
          | 'PROMISING_DEVELOP'
          | 'TOO_CLOSE_TO_ANOTHER'
          | 'TOO_CONTENT_SPECIFIC'
          | 'NOT_NDXBOOK'
          | 'REFORM_SET'
          | null;
        if (slug !== 'ndxbook' || !conceptId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setExperimentGConceptJudgment({
          conceptId,
          judgment,
          note: body.note ? String(body.note) : null,
        });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_g' });
      }
      case 'experiment_g_reform_set': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await reformExperimentGSet();
        return json(res, 200, {
          ok: true,
          run,
          background: run.status === 'FORMING' && process.env.VITEST !== 'true',
          source: 'site00_experiment_g',
        });
      }
      case 'experiment_g_direction_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await getBrandPresentationDirectionFormationRun();
        return json(res, 200, { ok: true, run, source: 'site00_experiment_g_direction' });
      }
      case 'experiment_g_direction_prepare': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await prepareBrandPresentationDirectionParents();
        const costPreview = estimateDirectionFormationCost(run.parentConceptSnapshots.length);
        return json(res, 200, { ok: true, run, costPreview, source: 'site00_experiment_g_direction' });
      }
      case 'experiment_g_direction_form': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await formBrandPresentationDirections({ forceRetry: body.forceRetry === true });
        const costPreview = estimateDirectionFormationCost(3);
        return json(res, 200, {
          ok: true,
          run,
          costPreview,
          background: run.status === 'FORMING' && process.env.VITEST !== 'true',
          source: 'site00_experiment_g_direction',
        });
      }
      case 'experiment_g_direction_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const directionId = String(body.directionId ?? '');
        const judgment = body.judgment as
          | 'LOVE_THE_DIRECTION'
          | 'PROMISING_DEVELOP'
          | 'TOO_CLOSE_TO_SIBLING'
          | 'DRIFTS_FROM_CONCEPT'
          | 'TOO_CONTENT_SPECIFIC'
          | 'TOO_FORMAT_SPECIFIC'
          | 'TOO_STYLE_DEPENDENT'
          | 'NOT_NDXBOOK'
          | null;
        if (slug !== 'ndxbook' || !directionId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setBrandPresentationDirectionJudgment({
          directionId,
          judgment,
          note: body.note ? String(body.note) : null,
        });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_g_direction' });
      }
      case 'experiment_g_direction_revise': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const directionId = String(body.directionId ?? '');
        if (slug !== 'ndxbook' || !directionId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await reviseBrandPresentationDirection({
          directionId,
          preserve: Array.isArray(body.preserve) ? body.preserve.map(String) : [],
          change: Array.isArray(body.change) ? body.change.map(String) : [],
          doNotBecome: Array.isArray(body.doNotBecome) ? body.doNotBecome.map(String) : [],
        });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_g_direction' });
      }
      case 'experiment_g_visual_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await prepareVisualFormulationRun();
        return json(res, 200, { ok: true, run, source: 'site00_experiment_g_visual' });
      }
      case 'experiment_g_visual_finalist': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const directionId = String(body.directionId ?? '');
        const selected = body.selected !== false;
        if (slug !== 'ndxbook' || !directionId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        try {
          const run = await setVisualFinalistSelection({
            directionId,
            selected,
            selectedBy: user.email ?? 'founder',
          });
          return json(res, 200, { ok: true, run, source: 'site00_experiment_g_visual' });
        } catch (err) {
          return json(res, 400, {
            ok: false,
            error: { code: 'FINALIST_GATE', message: err instanceof Error ? err.message : 'Finalist selection failed' },
          });
        }
      }
      case 'experiment_g_visual_formulate': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        await prepareVisualFormulationRun();
        const run = await formulateVisualExpressions({ forceRetry: body.forceRetry === true });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_g_visual' });
      }
      case 'experiment_g_visual_generate': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        let run = await getBrandPresentationVisualFormulationRun();
        if (!run) run = await prepareVisualFormulationRun();
        const costPreview = estimateVisualGenerationCost(run);
        const updated = await generateFinalistVisuals();
        return json(res, 200, {
          ok: true,
          run: updated,
          costPreview,
          source: 'site00_experiment_g_visual',
        });
      }
      case 'experiment_g_visual_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const expressionId = String(body.expressionId ?? '');
        const benchmarkId = String(body.benchmarkId ?? '');
        const judgment = body.judgment as
          | 'LOVE_THIS_EXPRESSION'
          | 'PROMISING_REVISE'
          | 'NOT_THIS_EXPRESSION'
          | 'MISREPRESENTS_DIRECTION'
          | 'TOO_GENERIC'
          | 'TOO_LITERAL'
          | 'TOO_STYLE_DEPENDENT'
          | 'LOVE_THIS_DIRECTION'
          | 'NOT_THIS_DIRECTION'
          | 'MISREPRESENTS_THE_DIRECTION'
          | 'VISUAL_DOES_NOT_HELP_ME_JUDGE'
          | null;
        if (slug !== 'ndxbook' || (!expressionId && !benchmarkId)) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = benchmarkId
          ? await setDirectionBenchmarkJudgment({
              benchmarkId,
              judgment,
              note: body.note ? String(body.note) : null,
            })
          : await setVisualExpressionJudgment({
              expressionId,
              judgment,
              note: body.note ? String(body.note) : null,
            });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_g_visual' });
      }
      case 'experiment_g_visual_revise': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const expressionId = String(body.expressionId ?? '');
        const benchmarkId = String(body.benchmarkId ?? '');
        if (slug !== 'ndxbook' || (!expressionId && !benchmarkId)) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = benchmarkId
          ? await reviseDirectionBenchmark({
              benchmarkId,
              preserve: Array.isArray(body.preserve) ? body.preserve.map(String) : [],
              change: Array.isArray(body.change) ? body.change.map(String) : [],
              doNotBecome: Array.isArray(body.doNotBecome) ? body.doNotBecome.map(String) : [],
            })
          : await reviseVisualExpression({
              expressionId,
              preserve: Array.isArray(body.preserve) ? body.preserve.map(String) : [],
              change: Array.isArray(body.change) ? body.change.map(String) : [],
              doNotBecome: Array.isArray(body.doNotBecome) ? body.doNotBecome.map(String) : [],
            });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_g_visual' });
      }
      case 'experiment_g_visual_winner': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const expressionId = String(body.expressionId ?? '');
        const benchmarkId = String(body.benchmarkId ?? '');
        if (slug !== 'ndxbook' || (!expressionId && !benchmarkId)) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await selectBrandPresentationWinner({
          expressionId: expressionId || undefined,
          benchmarkId: benchmarkId || undefined,
          selectedBy: user.email ?? 'founder',
        });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_g_visual' });
      }
      case 'experiment_e_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        let run = await getExperienceExpressionRun();
        if (!run) run = await refreshExperienceExpressionRun();
        return json(res, 200, { ok: true, run, source: 'site00_experiment_e' });
      }
      case 'experiment_e_select_territory': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await selectExperienceTestTerritory({
          territoryId: body.territoryId ? String(body.territoryId) : null,
          directionName: body.directionName ? String(body.directionName) : null,
        });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_e' });
      }
      case 'experiment_e_form_concepts': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await formExperienceConcepts();
        return json(res, 200, { ok: true, run, source: 'site00_experiment_e' });
      }
      case 'experiment_e_generate_visuals': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const conceptIndex = body.conceptIndex ? Number(body.conceptIndex) : undefined;
        const allConcepts = Boolean(body.allConcepts);
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await generateExperienceVisualDevelopment({ conceptIndex, allConcepts });
        const costPreview = estimateVisualDevelopmentCost(allConcepts ? 3 : 1);
        return json(res, 200, { ok: true, run, costPreview, source: 'site00_experiment_e' });
      }
      case 'experiment_e_concept_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const conceptIndex = Number(body.conceptIndex ?? 0);
        const judgment = body.judgment as
          | 'LOVE_THE_EXPERIENCE'
          | 'PROMISING_EXPLORE'
          | 'NOT_FOR_THIS_PROJECT'
          | 'TOO_TEMPLATE_LIKE'
          | 'TOO_CLOSE_TO_ANOTHER'
          | null;
        if (slug !== 'ndxbook' || !conceptIndex) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setExperienceConceptJudgment({ conceptIndex, judgment });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_e' });
      }
      case 'experiment_e_compile_contract': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const conceptIndex = Number(body.conceptIndex ?? 0);
        if (slug !== 'ndxbook' || !conceptIndex) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await compileExperienceImplementationContractForConcept(conceptIndex);
        return json(res, 200, { ok: true, run, source: 'site00_experiment_e' });
      }
      case 'experiment_e_compile_asset_direction': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const conceptIndex = Number(body.conceptIndex ?? 0);
        if (slug !== 'ndxbook' || !conceptIndex) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await compileExperienceAssetDirectionForConcept(conceptIndex);
        return json(res, 200, { ok: true, run, source: 'site00_experiment_e' });
      }
      case 'experiment_e_compile_asset_manifest': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const conceptIndex = Number(body.conceptIndex ?? 0);
        if (slug !== 'ndxbook' || !conceptIndex) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await compileExperienceAssetManifestForConcept(conceptIndex);
        return json(res, 200, { ok: true, run, source: 'site00_experiment_e' });
      }
      case 'experiment_e_generate_asset_visuals': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const conceptIndex = Number(body.conceptIndex ?? 0);
        if (slug !== 'ndxbook' || !conceptIndex) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await generateExperienceAssetVisualDevelopment({
          conceptIndex,
          action: body.action ? String(body.action) as 'GENERATE_VISUAL_DEVELOPMENT' | 'GENERATE_SELECTED_ASSET_FAMILY' | 'GENERATE_REQUIRED_PRODUCTION_ASSETS' | 'REGENERATE_SELECTED_ASSET' : undefined,
          assetFamily: body.assetFamily ? String(body.assetFamily) : undefined,
          requirementIds: Array.isArray(body.requirementIds) ? body.requirementIds.map(String) : undefined,
        });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_e' });
      }
      case 'experiment_e_promote_asset': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const assetId = String(body.assetId ?? '');
        if (slug !== 'ndxbook' || !assetId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await promoteExperienceAssetToProduction({
          assetId,
          promotedBy: user.email ?? 'founder',
        });
        return json(res, 200, { ok: true, run, source: 'site00_experiment_e' });
      }
      case 'project_workspace_hero_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        let run = await getProjectWorkspaceHeroRun(slug);
        if (!run) run = await refreshProjectWorkspaceHeroRun(slug);
        return json(res, 200, { ok: true, run, source: 'site00_project_workspace' });
      }
      case 'project_workspace_compile_hero_subset': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await compileNdxbookHeroFrameSubset();
        return json(res, 200, { ok: true, run, source: 'site00_project_workspace' });
      }
      case 'project_workspace_prepare_hero': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await prepareNdxbookHeroPrerequisites();
        return json(res, 200, { ok: true, run, source: 'site00_project_workspace' });
      }
      case 'project_workspace_generate_hero': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await generateNdxbookHeroAssets();
        return json(res, 200, { ok: true, run, source: 'site00_project_workspace' });
      }
      case 'project_workspace_compose_hero': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await composeNdxbookHeroFrame();
        return json(res, 200, { ok: true, run, source: 'site00_project_workspace' });
      }
      case 'project_workspace_hero_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const judgment = body.judgment as 'LOVE_THE_DIRECTION' | 'PROMISING_REVISE' | 'NOT_THE_DIRECTION' | null;
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setNdxbookHeroJudgment(judgment ?? null);
        return json(res, 200, { ok: true, run, source: 'site00_project_workspace' });
      }
      case 'visual_development_get': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        let run = await getProjectWorkspaceVisualDevelopmentRun(slug);
        if (!run) run = await refreshProjectWorkspaceVisualDevelopmentRun(slug);
        return json(res, 200, { ok: true, run, source: 'site00_visual_development' });
      }
      case 'visual_development_generate': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const proofId = body.proofId as 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
        if (slug !== 'ndxbook' || !proofId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await generateVisualDevelopmentDesignProof(proofId);
        return json(res, 200, { ok: true, run, source: 'site00_visual_development' });
      }
      case 'visual_development_refresh_references': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const proofId = body.proofId as 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
        if (slug !== 'ndxbook' || !proofId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await refreshVisualDevelopmentReferences(proofId);
        return json(res, 200, { ok: true, run, source: 'site00_visual_reference' });
      }
      case 'visual_development_compile_references': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const proofId = body.proofId as 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
        if (slug !== 'ndxbook' || !proofId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await compileVisualDevelopmentReferencePackage(proofId, {
          excludedReferenceIds: body.excludedReferenceIds as string[] | undefined,
        });
        return json(res, 200, { ok: true, run, source: 'site00_visual_reference' });
      }
      case 'visual_development_generate_reference_conditioned': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const proofId = body.proofId as 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
        if (slug !== 'ndxbook' || !proofId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await generateReferenceConditionedDesignProof(proofId);
        return json(res, 200, { ok: true, run, source: 'site00_visual_reference' });
      }
      case 'visual_development_exclude_reference': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const proofId = body.proofId as 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
        const referenceId = String(body.referenceId ?? '');
        if (slug !== 'ndxbook' || !proofId || !referenceId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await excludeVisualDevelopmentReference(proofId, referenceId);
        return json(res, 200, { ok: true, run, source: 'site00_visual_reference' });
      }
      case 'visual_development_prepare_interface': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const proofId = body.proofId as 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
        if (slug !== 'ndxbook' || proofId !== 'SITE00_PROJECTS_INDEX') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await prepareComposedInterfaceSurface(proofId);
        return json(res, 200, { ok: true, run, source: 'site00_visual_development' });
      }
      case 'visual_development_generate_assets': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const proofId = body.proofId as 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
        if (slug !== 'ndxbook' || proofId !== 'SITE00_PROJECTS_INDEX') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await generateMissingInterfaceAssets(proofId);
        return json(res, 200, { ok: true, run, source: 'site00_visual_development' });
      }
      case 'visual_development_judgment': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const proofId = body.proofId as 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
        const judgment = body.judgment as 'LOVE_THE_DIRECTION' | 'PROMISING_REVISE' | 'NOT_THE_DIRECTION' | null;
        if (slug !== 'ndxbook' || !proofId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await setVisualDevelopmentProofJudgment({
          proofId,
          judgment,
          revisionNote: body.revisionNote ?? null,
        });
        return json(res, 200, { ok: true, run, source: 'site00_visual_development' });
      }
      case 'visual_development_prepare_implementation': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const proofId = body.proofId as 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
        if (slug !== 'ndxbook' || !proofId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const run = await prepareVisualDevelopmentImplementation(proofId);
        return json(res, 200, { ok: true, run, source: 'site00_visual_development' });
      }
      case 'visual_development_orchestrate': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        const proofId = body.proofId as 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
        if (slug !== 'ndxbook' || !proofId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const { run, orchestrationPackageId, orchestrationStatus, orchestrationDispatched } =
          await orchestrateVisualDevelopmentImplementation(proofId);
        return json(res, 200, {
          ok: true,
          run,
          orchestrationPackageId,
          orchestrationStatus,
          orchestrationDispatched,
          source: 'site00_visual_development',
        });
      }
      case 'creative_lineage_forensic_audit': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const report = await runNdxbookForensicAudit();
        return json(res, 200, { ok: true, report, source: 'site00_creative_lineage' });
      }
      case 'creative_lineage_normalize': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const slug = String(parseBody(req)?.slug ?? req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const result = await normalizeNdxbookCreativeLineage();
        return json(res, 200, { ok: true, ...result, source: 'site00_creative_lineage' });
      }
      case 'creative_lineage_library': {
        const slug = String(req.query.slug ?? '');
        const section = String(req.query.section ?? 'ALL') as CreativeLineageLibraryFilters['section'];
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const library = await getCreativeLineageLibrary({ section });
        return json(res, 200, { ok: true, library, source: 'site00_creative_lineage' });
      }
      case 'creative_lineage_asset_update': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook' || !body.assetId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const asset = await updateCreativeAssetProduction({
          assetId: String(body.assetId),
          productionState: body.productionState,
          reuseState: body.reuseState,
          reviewState: body.reviewState,
          founderNotes: body.founderNotes,
        });
        return json(res, 200, { ok: true, asset, source: 'site00_creative_lineage' });
      }
      case 'creative_lineage_promotion_plan': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const plan = await createWinningWorldPromotionPlan({
          winningDirectionId: String(body.winningDirectionId),
          winningDirectionName: String(body.winningDirectionName),
          winningWorldId: String(body.winningWorldId),
          founderDecisionId: body.founderDecisionId ?? null,
          governingWorld: body.governingWorld ?? {},
        });
        return json(res, 200, { ok: true, plan, source: 'site00_creative_lineage' });
      }
      case 'creative_lineage_promote_world': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook' || !body.planId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const result = await promoteWinningWorld(String(body.planId));
        return json(res, 200, { ok: true, ...result, source: 'site00_creative_lineage' });
      }
      case 'creative_lineage_salvage_action': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const review = await saveSalvageReviewAction({
          winningDirectionId: String(body.winningDirectionId),
          losingDirectionId: String(body.losingDirectionId),
          itemId: String(body.itemId),
          action: body.action,
        });
        return json(res, 200, { ok: true, review, source: 'site00_creative_lineage' });
      }
      case 'founder_creative_judgment_record': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook' || !body.assetId || !body.founderAction) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const result = await recordFounderCreativeJudgment({
          assetId: String(body.assetId),
          founderAction: body.founderAction as 'LOVE_IT' | 'REVISE' | 'NOT_FOR_ME' | 'PROMISING_REFINE' | null,
          judgmentReason: body.judgmentReason != null ? String(body.judgmentReason) : null,
          carouselRunGenerating: Boolean(body.carouselRunGenerating),
        });
        return json(res, 200, { ok: true, ...result, source: 'site00_founder_judgment' });
      }
      case 'founder_revision_spec_create': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook' || !body.parentAssetId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const spec = await createRevisionSpecDraft({
          parentAssetId: String(body.parentAssetId),
          founderOriginalNote: body.founderOriginalNote != null ? String(body.founderOriginalNote) : undefined,
          categoryNotes: body.categoryNotes as Record<string, string> | undefined,
          lockedElements: body.lockedElements as never,
          mutableElements: body.mutableElements as never,
          severity: body.severity as never,
          branchId: body.branchId != null ? String(body.branchId) : null,
        });
        return json(res, 200, { ok: true, spec, source: 'site00_founder_revision' });
      }
      case 'founder_revision_spec_update': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook' || !body.revisionId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const spec = await updateCreativeRevisionSpec({
          revisionId: String(body.revisionId),
          founderOriginalNote: body.founderOriginalNote != null ? String(body.founderOriginalNote) : undefined,
          categoryNotes: body.categoryNotes as Record<string, string> | undefined,
          lockedElements: body.lockedElements as never,
          mutableElements: body.mutableElements as never,
          severity: body.severity as never,
          requestedAssetExchange: body.requestedAssetExchange as never,
          requestedCopyChanges: body.requestedCopyChanges as string[] | undefined,
          requestedColorChanges: body.requestedColorChanges as string[] | undefined,
          requestedTypographyChanges: body.requestedTypographyChanges as string[] | undefined,
          status: body.status as never,
        });
        return json(res, 200, { ok: true, spec, source: 'site00_founder_revision' });
      }
      case 'founder_revision_spec_compile': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook' || !body.revisionId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const compiled = await compileRevisionSpec(String(body.revisionId));
        return json(res, 200, { ok: true, ...compiled, source: 'site00_founder_revision' });
      }
      case 'founder_revision_history': {
        const slug = String(req.query.slug ?? '');
        const assetId = String(req.query.assetId ?? '');
        if (slug !== 'ndxbook' || !assetId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const history = await getRevisionHistory(assetId);
        return json(res, 200, { ok: true, history, source: 'site00_founder_revision' });
      }
      case 'founder_revision_spec_approve': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook' || !body.revisionId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const spec = await approveRevisionSpecForGeneration(String(body.revisionId));
        return json(res, 200, { ok: true, spec, source: 'site00_founder_revision' });
      }
      case 'founder_revision_comparison': {
        const slug = String(req.query.slug ?? '');
        const revisionId = String(req.query.revisionId ?? '');
        if (slug !== 'ndxbook' || !revisionId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const result = await getRevisionComparisonState(revisionId);
        return json(res, 200, { ok: true, ...result, source: 'site00_founder_revision' });
      }
      case 'founder_revision_preferred_version': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook' || !body.rootAssetId || !body.preferredAssetId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const asset = await setPreferredRevisionVersion({
          rootAssetId: String(body.rootAssetId),
          preferredAssetId: String(body.preferredAssetId),
        });
        return json(res, 200, { ok: true, asset, source: 'site00_founder_revision' });
      }
      case 'founder_revision_generate': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook' || !body.revisionId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const result = await attemptGenerateRevision(String(body.revisionId), {
          technicalRetry: Boolean(body.technicalRetry),
        });
        return json(res, 200, { ok: true, result, source: 'site00_founder_revision' });
      }
      case 'founder_judgment_forensic_audit': {
        const slug = String(req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const report = await runFounderJudgmentForensicAudit();
        return json(res, 200, { ok: true, report, source: 'site00_founder_judgment' });
      }
      case 'creative_lineage_launch_seed_select': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (slug !== 'ndxbook' || !body.assetId) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const result = await selectAssetForLaunchSeed(String(body.assetId));
        return json(res, 200, { ok: true, ...result, source: 'site00_creative_lineage' });
      }
      case 'creative_lineage_launch_seed_reconcile': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const slug = String(parseBody(req)?.slug ?? req.query.slug ?? '');
        if (slug !== 'ndxbook') {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'ndxbook only' } });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const result = await reconcileNdxbookLaunchSeedSemantics();
        return json(res, 200, { ok: true, ...result, source: 'site00_creative_lineage' });
      }
      case 'project_intelligence_manifest_get': {
        const slug = String(req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const state = await getProjectIntelligenceState(slug);
        return json(res, 200, {
          ok: true,
          ...state,
          readiness: state.readiness ?? 'PROJECT_INTELLIGENCE_NOT_STARTED',
          formationGate: state.formationGate ?? { allowed: false, reason: 'Manifest not compiled' },
          source: 'site00_project_intelligence',
        });
      }
      case 'project_intelligence_manifest_compile': {
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: { code: 'POST_REQUIRED', message: 'POST required' } });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const detail = await resolveSite00Project(slug);
        if (!detail) {
          return json(res, 404, { ok: false, error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' } });
        }
        const experienceClass = resolveExperienceClassForProject({
          projectSlug: slug,
          override: (body.experienceClass as ProjectExperienceClass | undefined) ?? null,
        });
        const { manifest, readiness } = await compileProjectIntelligenceManifest({
          projectId: detail.organizationUuid,
          projectSlug: slug,
          experienceClass,
        });
        const formationGate = (await getProjectIntelligenceState(slug)).formationGate;
        return json(res, 200, {
          ok: true,
          manifest,
          readiness,
          formationGate,
          source: 'site00_project_intelligence',
        });
      }
      case 'studio_world_execution_debug': {
        const slug = String(req.query.slug ?? '');
        if (!canAccessFounderProjectAsOwner(user.email, slug || 'ndxbook')) {
          return json(res, 403, { ok: false, error: { code: 'PROJECT_ACCESS_DENIED', message: 'Denied' } });
        }
        const runs = await listStudioWorldRuns({ projectSlug: slug || undefined, limit: 25 });
        const persistedCapabilities = await listCapabilityVerifications();
        const capabilities = mergeCapabilityVerifications(persistedCapabilities);
        return json(res, 200, {
          ok: true,
          runs,
          capabilities,
          source: 'site00_studio_world_execution',
        });
      }
      default:
        return json(res, 400, {
          ok: false,
          error: { code: 'UNKNOWN_ACTION', message: 'Unknown action' },
          source: 'site00_project_resolver',
        });
    }
  } catch (e) {
    console.error('[api/site00/projects]', e);
    const msg = e instanceof Error ? e.message : 'Internal error';
    if (msg === 'Replay not found') {
      return json(res, 404, {
        ok: false,
        error: { code: 'REPLAY_NOT_FOUND', message: msg },
        source: 'site00_personality_replay',
      });
    }
    return json(res, 500, {
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: msg },
      source: 'site00_project_resolver',
    });
  }
}
