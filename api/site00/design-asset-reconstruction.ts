/**
 * P0.VR.4 / P0.VR.4R1 — Design asset reconstruction API.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { join } from 'node:path';
import {
  detectAndRegisterAssets,
  dispatchReconstructionGeneration,
  persistApprovedAssetToSupabase,
  applyAssetToLivePage,
  listReconstructionAssets,
  getReconstructionAsset,
  approveAssetLoveIt,
  buildSystemInspectorLineage,
  discoverAllProviderCapabilities,
  runProjectsRedPlanetGoldenTest,
  buildPersistStoragePath,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr4/index.js';
import {
  checkFalProviderHealth,
  runLiveProjectsHeaderPlanetAcceptance,
  getLiveBindingSlot,
  getProjectsHeaderPlanetBinding,
  applyLiveBindingSlot,
  loadLiveBindingsFromRepo,
  saveLiveBindingsToRepo,
  uploadCanonicalAsset,
  hashBuffer,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr4r1/index.js';
import { buildProjectsGoldenScreenshotSource } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr4/projectsGoldenTest.js';
import { PROJECTS_GOLDEN_TEST } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr4/constants.js';
import { isTemporaryProviderUrl } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr4/supabaseStorage.js';
import {
  getCropRecord,
  getDispatchCounts,
  runDesignGenerationPreflight,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr4r2/index.js';
import { downloadUrlToBuffer } from '../_lib/site00Assts/storage.js';
import {
  createAssetJob,
  getAssetJob,
  addSourceUpload,
  updateJobInstruction,
  runJobDetection,
  summarizeAssetJobPlan,
  applyCropConfirmationActions,
  confirmAssetCrops,
  reconstructConfirmedAssets,
  approveReconstructedVersion,
  uploadReconstructedAssets,
  bindReconstructedAssets,
  listAllPresets,
  saveDesignInstructionPreset,
  suggestInstructionPresets,
  parseFounderInstruction,
  linkFidelityContract,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr5/index.js';
import {
  confirmReferenceInterpretation,
  getExecutionHandoffForContract,
  getFidelityContract,
  getFidelityContractByReference,
  ingestReferenceWithFidelityContract,
  listFidelityContracts,
  runFidelityQaIteration,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr7/index.js';
import { formatInterpretationSummary } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr7/implementationPlan.js';
import {
  founderVerifyVisualMatch,
  getComparisonSession,
  getComparisonSessionByContract,
  getComparisonSessionByReference,
  getExecutionEnvelopeForContract,
  listComparisonSessions,
  onImplementationComplete,
  runVisualConvergenceIteration,
  startVisualConvergenceForContract,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/index.js';

const REPO_ROOT = join(process.cwd());

function envConfig() {
  return {
    falKey: process.env.FAL_KEY,
    ideogramApiKey: process.env.IDEOGRAM_API_KEY,
    pixelcutApiKey: process.env.PIXELCUT_API_KEY,
  };
}

async function loadBindingsWithResolvedUrls(): Promise<void> {
  const { getSite00AssetPublicUrl } = await import('../_lib/site00Assts/storage.js');
  loadLiveBindingsFromRepo(REPO_ROOT, getSite00AssetPublicUrl);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await loadBindingsWithResolvedUrls();
  const action = String(req.query.action ?? req.body?.action ?? 'capabilities');

  try {
    if (req.method === 'GET') {
      if (action === 'capabilities') {
        const caps = discoverAllProviderCapabilities(envConfig());
        const health = checkFalProviderHealth(envConfig());
        return res.status(200).json({ ok: true, capabilities: caps, falHealth: health });
      }
      if (action === 'provider_health') {
        return res.status(200).json({ ok: true, health: checkFalProviderHealth(envConfig()) });
      }
      if (action === 'list') {
        const projectId = String(req.query.projectId ?? '');
        const assets = listReconstructionAssets(projectId ? { projectId } : undefined);
        return res.status(200).json({ ok: true, assets });
      }
      if (action === 'bindings') {
        const slotId = String(req.query.slotId ?? '');
        const slot = slotId ? getLiveBindingSlot(slotId) : getProjectsHeaderPlanetBinding();
        return res.status(200).json({
          ok: true,
          slot: slot
            ? {
                slotId: slot.slotId,
                currentAssetUrl: slot.currentAssetUrl,
                currentVersion: slot.currentVersion,
                previousAssetUrl: slot.previousAssetUrl,
                updatedAt: slot.updatedAt,
              }
            : null,
        });
      }
      if (action === 'inspect') {
        const assetId = String(req.query.assetId ?? '');
        const lineage = buildSystemInspectorLineage(assetId);
        const asset = getReconstructionAsset(assetId);
        const binding = getProjectsHeaderPlanetBinding();
        return res.status(200).json({
          ok: true,
          asset,
          lineage: {
            ...lineage,
            bindingRoute: binding?.route ?? null,
            bindingComponent: binding?.componentPath ?? null,
            bindingSlot: binding?.assetSlot ?? null,
            canonicalUrl: binding?.currentAssetUrl ?? null,
            verificationScreenshot: null,
          },
        });
      }
      if (action === 'preset_list') {
        return res.status(200).json({ ok: true, presets: listAllPresets() });
      }
      if (action === 'job_get') {
        const jobId = String(req.query.jobId ?? '');
        const job = getAssetJob(jobId);
        if (!job) return res.status(404).json({ ok: false, error: 'Job not found' });
        return res.status(200).json({ ok: true, job, plan: summarizeAssetJobPlan(job) });
      }
      if (action === 'fidelity_get') {
        const contractId = String(req.query.contractId ?? '');
        const referenceId = String(req.query.referenceId ?? '');
        const contract = contractId
          ? getFidelityContract(contractId)
          : referenceId
            ? getFidelityContractByReference(referenceId)
            : null;
        if (!contract) return res.status(404).json({ ok: false, error: 'Contract not found' });
        const interpretation = contract.implementationPlan
          ? formatInterpretationSummary(contract.implementationPlan)
          : null;
        const handoff = getExecutionHandoffForContract(contract.contractId);
        return res.status(200).json({ ok: true, contract, interpretation, handoff });
      }
      if (action === 'fidelity_list') {
        const projectId = String(req.query.projectId ?? '');
        const contracts = listFidelityContracts(projectId ? { projectId } : undefined);
        return res.status(200).json({ ok: true, contracts });
      }
      if (action === 'convergence_get') {
        const sessionId = String(req.query.sessionId ?? '');
        const contractId = String(req.query.contractId ?? '');
        const referenceId = String(req.query.referenceId ?? '');
        const session = sessionId
          ? getComparisonSession(sessionId)
          : contractId
            ? getComparisonSessionByContract(contractId)
            : referenceId
              ? getComparisonSessionByReference(referenceId)
              : null;
        if (!session) return res.status(404).json({ ok: false, error: 'Session not found' });
        const envelope = getExecutionEnvelopeForContract(session.contractId);
        return res.status(200).json({ ok: true, session, envelope });
      }
      if (action === 'convergence_list') {
        const projectId = String(req.query.projectId ?? '');
        const sessions = listComparisonSessions(projectId ? { projectId } : undefined);
        return res.status(200).json({ ok: true, sessions });
      }
      return res.status(400).json({ ok: false, error: 'Unknown GET action' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const body = req.body ?? {};

    switch (action) {
      case 'job_create': {
        const job = createAssetJob({
          workspaceId: String(body.workspaceId ?? 'design-workspace'),
          projectId: String(body.projectId),
          pageId: String(body.pageId),
          route: String(body.route),
          founderInstruction: body.founderInstruction ? String(body.founderInstruction) : '',
          selectedPresetId: body.selectedPresetId ?? null,
        });
        return res.status(200).json({ ok: true, job, plan: summarizeAssetJobPlan(job) });
      }
      case 'job_add_upload': {
        const uploadJob = getAssetJob(String(body.jobId));
        if (!uploadJob) return res.status(404).json({ ok: false, error: 'Job not found' });
        const referenceId = `ref-upload-${uploadJob.jobId}-${Date.now()}`;
        const contract = ingestReferenceWithFidelityContract({
          referenceId,
          projectId: uploadJob.projectId,
          pageId: uploadJob.pageId,
          route: uploadJob.route,
          viewport: (body.viewport as 'mobile' | 'tablet' | 'desktop') ?? 'mobile',
          referenceWidth: body.imageWidth ? Number(body.imageWidth) : undefined,
          referenceHeight: body.imageHeight ? Number(body.imageHeight) : undefined,
          founderInstruction: uploadJob.founderInstruction || null,
        });
        const job = addSourceUpload(String(body.jobId), {
          url: String(body.url),
          fileName: body.fileName ? String(body.fileName) : null,
          sourcePage: body.sourcePage ? String(body.sourcePage) : null,
          sourceRoute: body.sourceRoute ? String(body.sourceRoute) : null,
          imageWidth: body.imageWidth ? Number(body.imageWidth) : undefined,
          imageHeight: body.imageHeight ? Number(body.imageHeight) : undefined,
          fidelityContractId: contract.contractId,
        });
        if (!job) return res.status(404).json({ ok: false, error: 'Job not found' });
        linkFidelityContract(job.jobId, contract.contractId);
        const interpretation = contract.implementationPlan
          ? formatInterpretationSummary(contract.implementationPlan)
          : null;
        return res.status(200).json({
          ok: true,
          job,
          plan: summarizeAssetJobPlan(job),
          fidelityContract: contract,
          interpretation,
        });
      }
      case 'fidelity_confirm': {
        const contract = confirmReferenceInterpretation(String(body.contractId));
        if (!contract) return res.status(404).json({ ok: false, error: 'Contract not found' });
        return res.status(200).json({ ok: true, contract });
      }
      case 'fidelity_qa': {
        const contract = runFidelityQaIteration(
          String(body.contractId),
          body.liveCaptureAvailable === true,
          body.liveGeometryHints,
        );
        if (!contract) return res.status(404).json({ ok: false, error: 'Contract not found' });
        return res.status(200).json({ ok: true, contract });
      }
      case 'convergence_start': {
        const session = startVisualConvergenceForContract(String(body.contractId));
        if (!session) return res.status(404).json({ ok: false, error: 'Contract not found or convergence not required' });
        return res.status(200).json({ ok: true, session });
      }
      case 'convergence_run': {
        const session = runVisualConvergenceIteration({
          sessionId: String(body.sessionId),
          referencePath: String(body.referencePath ?? '/reference.png'),
          livePath: String(body.livePath ?? '/live.png'),
          liveWidth: Number(body.liveWidth ?? 390),
          liveHeight: Number(body.liveHeight ?? 844),
          liveGeometryHints: body.liveGeometryHints,
        });
        if (!session) return res.status(404).json({ ok: false, error: 'Session not found' });
        return res.status(200).json({ ok: true, session });
      }
      case 'convergence_implementation_complete': {
        const result = onImplementationComplete({
          contractId: String(body.contractId),
          referencePath: String(body.referencePath ?? '/reference.png'),
          livePath: String(body.livePath ?? '/live.png'),
          liveWidth: Number(body.liveWidth ?? 390),
          liveHeight: Number(body.liveHeight ?? 844),
          liveGeometryHints: body.liveGeometryHints,
        });
        if (!result.contract) return res.status(404).json({ ok: false, error: 'Contract not found' });
        return res.status(200).json({ ok: true, ...result });
      }
      case 'convergence_founder_verify': {
        const session = founderVerifyVisualMatch(String(body.sessionId));
        if (!session) return res.status(404).json({ ok: false, error: 'Session not found' });
        return res.status(200).json({ ok: true, session });
      }
      case 'fidelity_ingest': {
        const contract = ingestReferenceWithFidelityContract({
          referenceId: String(body.referenceId),
          projectId: String(body.projectId),
          pageId: String(body.pageId),
          route: String(body.route),
          viewport: (body.viewport as 'mobile' | 'tablet' | 'desktop') ?? 'mobile',
          referenceWidth: body.referenceWidth ? Number(body.referenceWidth) : undefined,
          referenceHeight: body.referenceHeight ? Number(body.referenceHeight) : undefined,
          founderInstruction: body.founderInstruction ? String(body.founderInstruction) : null,
        });
        const interpretation = contract.implementationPlan
          ? formatInterpretationSummary(contract.implementationPlan)
          : null;
        return res.status(200).json({ ok: true, contract, interpretation });
      }
      case 'job_update_instruction': {
        const job = updateJobInstruction(String(body.jobId), {
          founderInstruction: String(body.founderInstruction ?? ''),
          selectedPresetId: body.selectedPresetId ?? null,
        });
        if (!job) return res.status(404).json({ ok: false, error: 'Job not found' });
        return res.status(200).json({ ok: true, job, plan: summarizeAssetJobPlan(job) });
      }
      case 'job_detect': {
        const job = runJobDetection(String(body.jobId), body.explicitCount ? Number(body.explicitCount) : undefined);
        if (!job) return res.status(404).json({ ok: false, error: 'Job not found' });
        return res.status(200).json({ ok: true, job, plan: summarizeAssetJobPlan(job) });
      }
      case 'job_crop_actions': {
        const job = getAssetJob(String(body.jobId));
        if (!job) return res.status(404).json({ ok: false, error: 'Job not found' });
        const cropState = applyCropConfirmationActions(job, body.actions ?? []);
        return res.status(200).json({ ok: cropState.ok, job: cropState.job, cropState });
      }
      case 'job_confirm_crops': {
        const job = getAssetJob(String(body.jobId));
        if (!job) return res.status(404).json({ ok: false, error: 'Job not found' });
        const result = confirmAssetCrops(job, { approveSubset: body.approveSubset });
        return res.status(200).json({
          ok: result.ok,
          job: result.job,
          blocker: result.blocker,
          confirmedCount: result.confirmedCount,
        });
      }
      case 'job_reconstruct': {
        const job = getAssetJob(String(body.jobId));
        if (!job) return res.status(404).json({ ok: false, error: 'Job not found' });
        const result = reconstructConfirmedAssets(job, {
          explicitFounderAction: body.explicitFounderAction === true,
          approvedSubset: body.approvedSubset,
          simulate: body.simulate !== false,
        });
        return res.status(200).json({
          ok: result.ok,
          blocked: result.blocked,
          blocker: result.blocker,
          versions: result.versions,
          dispatchCount: result.dispatchCount,
          job: result.job,
        });
      }
      case 'job_approve_version': {
        const job = getAssetJob(String(body.jobId));
        if (!job) return res.status(404).json({ ok: false, error: 'Job not found' });
        approveReconstructedVersion(job, String(body.versionId), body.approved === true);
        return res.status(200).json({ ok: true, job });
      }
      case 'job_upload': {
        const job = getAssetJob(String(body.jobId));
        if (!job) return res.status(404).json({ ok: false, error: 'Job not found' });
        const { uploaded, job: updated } = uploadReconstructedAssets(job, body.versionIds ?? []);
        return res.status(200).json({ ok: uploaded.length > 0, uploaded, job: updated });
      }
      case 'job_bind': {
        const job = getAssetJob(String(body.jobId));
        if (!job) return res.status(404).json({ ok: false, error: 'Job not found' });
        const { bound, job: updated } = bindReconstructedAssets(job, body.versionIds ?? []);
        return res.status(200).json({ ok: bound > 0, bound, job: updated });
      }
      case 'preset_save': {
        const preset = saveDesignInstructionPreset({
          name: String(body.name),
          instructionTemplate: String(body.instructionTemplate),
          intentType: body.intentType,
          assetTypes: body.assetTypes ?? [],
          multiAsset: body.multiAsset === true,
          orderingRule: body.orderingRule,
          backgroundPolicy: body.backgroundPolicy,
          replacementBehavior: body.replacementBehavior,
          targetScope: body.targetScope ?? null,
          fromJobId: body.fromJobId ? String(body.fromJobId) : undefined,
        });
        return res.status(200).json({ ok: true, preset });
      }
      case 'preset_suggest': {
        const parsed = parseFounderInstruction(String(body.founderInstruction ?? ''));
        const suggested = suggestInstructionPresets({
          founderInstruction: String(body.founderInstruction ?? ''),
          intentType: body.intentType ?? parsed.intentType,
          multiAsset: body.multiAsset ?? parsed.multiAsset,
        });
        return res.status(200).json({ ok: true, suggested });
      }
      case 'detect': {
        const assets = detectAndRegisterAssets({
          source: body.source,
          hints: body.hints ?? [],
          screenshotBasePath: body.screenshotBasePath ?? '',
        });
        return res.status(200).json({ ok: true, assets });
      }
      case 'extract_crop': {
        const result = await runLiveProjectsHeaderPlanetAcceptance({
          repoRoot: REPO_ROOT,
          falKey: process.env.FAL_KEY,
          explicitFounderAction: false,
          extractCropOnly: true,
          founderAdjustedBounds: body.founderAdjustedBounds ?? null,
          skipLiveFal: true,
        });
        const cropRecord = result.assetId ? getCropRecord(result.assetId) : null;
        const asset = result.assetId ? getReconstructionAsset(result.assetId) : null;
        return res.status(200).json({ ok: !result.blocked, result, cropRecord, asset });
      }
      case 'approve_crop': {
        const assetId = String(body.assetId);
        const cropRecord = getCropRecord(assetId);
        if (!cropRecord?.cropChecksum) {
          return res.status(400).json({ ok: false, error: 'CROP_NOT_APPROVED: no crop checksum' });
        }
        const { approveProjectsHeaderPlanetCrop } = await import(
          '../../shared/site00-studio-world-production/visualReconstruction/p0vr4r2/projectsHeaderPlanetCropService.js'
        );
        const approved = approveProjectsHeaderPlanetCrop(assetId, cropRecord.cropChecksum);
        return res.status(200).json({ ok: Boolean(approved), cropRecord: approved });
      }
      case 'preflight': {
        const assetId = String(body.assetId);
        const cropRecord = getCropRecord(assetId);
        const asset = getReconstructionAsset(assetId);
        const health = checkFalProviderHealth(envConfig());
        const preflight = runDesignGenerationPreflight({
          coordinate: cropRecord,
          assetType: asset?.assetType ?? 'HERO_OBJECT',
          cropPreviewUrl: asset?.referenceCropUrl ?? null,
          cropPreviewValid: Boolean(asset?.referenceCropUrl),
          providerAvailable: health.liveDispatchAllowed,
          explicitFounderAction: body.explicitFounderAction === true,
          cropApproved: cropRecord?.locked === true,
        });
        const counts = getDispatchCounts(assetId);
        return res.status(200).json({ ok: preflight.pass, preflight, dispatchCounts: counts, cropRecord });
      }
      case 'generate': {
        if (body.live === true) {
          const cropRecord = getCropRecord(String(body.assetId ?? ''));
          if (!cropRecord?.locked && body.cropApproved !== true) {
            const preflight = runDesignGenerationPreflight({
              coordinate: cropRecord,
              assetType: 'HERO_OBJECT',
              cropPreviewUrl: null,
              cropPreviewValid: Boolean(cropRecord),
              providerAvailable: checkFalProviderHealth(envConfig()).liveDispatchAllowed,
              explicitFounderAction: body.explicitFounderAction === true,
              cropApproved: false,
            });
            return res.status(200).json({
              ok: false,
              blocked: true,
              blocker: preflight.blocker ?? 'GENERATION_BLOCKED_BY_CROP_QA',
              preflight,
            });
          }
          const result = await runLiveProjectsHeaderPlanetAcceptance({
            repoRoot: REPO_ROOT,
            falKey: process.env.FAL_KEY,
            explicitFounderAction: body.explicitFounderAction === true,
            cropApproved: body.cropApproved === true || cropRecord?.locked === true,
            founderLoveIt: false,
            applyToPage: false,
            founderAdjustedBounds: body.founderAdjustedBounds ?? null,
          });
          const asset = result.assetId ? getReconstructionAsset(result.assetId) : null;
          const counts = result.assetId ? getDispatchCounts(result.assetId) : null;
          return res.status(200).json({
            ok: !result.blocked,
            blocked: result.blocked,
            blocker: result.blocker,
            result,
            asset,
            dispatchCounts: counts,
          });
        }
        const result = dispatchReconstructionGeneration({
          assetId: String(body.assetId),
          explicitFounderAction: body.explicitFounderAction === true,
          env: envConfig(),
        });
        const asset = getReconstructionAsset(String(body.assetId));
        return res.status(200).json({ ok: !result.blocked, result, asset });
      }
      case 'approve': {
        const asset = approveAssetLoveIt(String(body.assetId));
        return res.status(200).json({ ok: Boolean(asset), asset });
      }
      case 'persist_live': {
        const assetId = String(body.assetId);
        const asset = getReconstructionAsset(assetId);
        if (!asset || asset.founderJudgment !== 'LOVE_IT') {
          return res.status(400).json({ ok: false, error: 'FOUNDER_APPROVAL_MISSING' });
        }
        const sourceUrl = asset.cleanedAssetUrl ?? asset.generatedAssetUrl;
        if (!sourceUrl || isTemporaryProviderUrl(sourceUrl)) {
          return res.status(400).json({ ok: false, error: 'No valid source for persistence' });
        }
        const buffer = await downloadUrlToBuffer(sourceUrl);
        const version = Number(body.version ?? 1);
        const storagePath = buildPersistStoragePath(asset, version);
        const upload = await uploadCanonicalAsset({ storagePath, buffer, mimeType: 'image/png' });
        const persisted = persistApprovedAssetToSupabase({
          assetId,
          supabaseUrl: upload.publicUrl,
          storage: {
            bucket: 'live-preview',
            path: storagePath,
            mimeType: 'image/png',
            width: 0,
            height: 0,
            alpha: true,
            checksum: hashBuffer(buffer),
            createdAt: new Date().toISOString(),
          },
        });
        return res.status(200).json({ ok: Boolean(persisted), asset: persisted, supabasePath: storagePath });
      }
      case 'apply_to_page': {
        const assetId = String(body.assetId);
        const asset = getReconstructionAsset(assetId);
        if (!asset || asset.founderJudgment !== 'LOVE_IT') {
          return res.status(400).json({ ok: false, error: 'FOUNDER_APPROVAL_MISSING' });
        }
        let url = body.canonicalUrl as string | undefined;
        if (!url && asset.storage?.path) {
          const { getSite00AssetPublicUrl } = await import('../_lib/site00Assts/storage.js');
          url = getSite00AssetPublicUrl(asset.storage.path);
        }
        if (!url || isTemporaryProviderUrl(url)) {
          return res.status(400).json({ ok: false, error: 'TEMP_PROVIDER_URL_IN_LIVE_UI' });
        }
        const binding = applyLiveBindingSlot({
          assetId,
          canonicalUrl: url,
          storagePath: asset.storage?.path ?? String(body.storagePath ?? ''),
          version: Number(body.version ?? 1),
        });
        saveLiveBindingsToRepo(REPO_ROOT);
        applyAssetToLivePage({
          assetId,
          componentPath: PROJECTS_GOLDEN_TEST.componentPath,
          componentName: PROJECTS_GOLDEN_TEST.componentName,
          assetSlot: PROJECTS_GOLDEN_TEST.assetSlot,
          canonicalUrl: url,
        });
        return res.status(200).json({ ok: true, binding, supabasePath: asset.storage?.path ?? null });
      }
      case 'persist': {
        const asset = persistApprovedAssetToSupabase({
          assetId: String(body.assetId),
          supabaseUrl: String(body.supabaseUrl),
          storage: body.storage,
        });
        return res.status(200).json({ ok: Boolean(asset), asset });
      }
      case 'bind': {
        const asset = applyAssetToLivePage({
          assetId: String(body.assetId),
          componentPath: String(body.componentPath),
          componentName: String(body.componentName),
          assetSlot: String(body.assetSlot),
          canonicalUrl: String(body.canonicalUrl),
        });
        return res.status(200).json({ ok: Boolean(asset), asset });
      }
      case 'live_acceptance': {
        const result = await runLiveProjectsHeaderPlanetAcceptance({
          repoRoot: REPO_ROOT,
          falKey: process.env.FAL_KEY,
          explicitFounderAction: body.explicitFounderAction === true,
          founderLoveIt: body.founderLoveIt === true,
          applyToPage: body.applyToPage !== false,
        });
        return res.status(200).json({ ok: result.passed, result });
      }
      case 'golden_test': {
        const result = runProjectsRedPlanetGoldenTest();
        return res.status(200).json({ ok: result.passed, result });
      }
      case 'dispatch_skins_candidate': {
        if (body.explicitFounderAction !== true) {
          return res.status(400).json({ ok: false, error: 'EXPLICIT_FOUNDER_ACTION_REQUIRED' });
        }
        const falKey = process.env.FAL_KEY?.trim();
        if (!falKey) {
          return res.status(200).json({
            ok: false,
            outputUrl: null,
            error: 'FAL_KEY_MISSING',
            retryAvailable: true,
          });
        }
        const sourceCropUrl = String(body.sourceCropUrl ?? '');
        const prompt = String(body.prompt ?? '');
        if (!sourceCropUrl || !prompt) {
          return res.status(400).json({ ok: false, error: 'MISSING_SOURCE_OR_PROMPT' });
        }
        try {
          const { fal } = await import('@fal-ai/client');
          fal.config({ credentials: falKey });
          const absUrl = sourceCropUrl.startsWith('http')
            ? sourceCropUrl
            : `${String(process.env.VITE_SITE_URL ?? 'http://localhost:5174')}${sourceCropUrl}`;
          const model = 'openai/gpt-image-2/edit';
          const result = await fal.subscribe(model, {
            input: {
              prompt,
              image_urls: [absUrl],
              image_size: 'auto',
              quality: 'high',
              num_images: 1,
              output_format: 'webp',
            },
          });
          const outputUrl = (result as { data?: { images?: Array<{ url?: string }> } })?.data?.images?.[0]?.url ?? null;
          return res.status(200).json({ ok: Boolean(outputUrl), outputUrl, retryAvailable: !outputUrl });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return res.status(200).json({ ok: false, outputUrl: null, error: message, retryAvailable: true });
        }
      }
      default:
        return res.status(400).json({ ok: false, error: `Unknown action: ${action}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: message });
  }
}
