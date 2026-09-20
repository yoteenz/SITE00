/**
 * P0.VR.OPUS-NATIVE-SHELL-SERVICE1 — staged visual shell only (no production writes).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getAuthUser } from '../_lib/auth.js';
import { isFounderPrivilegedAccount } from '../_lib/site00Access/accessModel.js';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import {
  assertScopedContextOnly,
  compileOpusDesignShellPackage,
  packageIncludesWholeRepo,
} from '../../shared/site00-opus-design-shell/contextCompiler.js';
import { evaluateOpusDesignShellEligibility } from '../../shared/site00-opus-design-shell/eligibility.js';
import { OPUS_DESIGN_SHELL_MODEL } from '../../shared/site00-opus-design-shell/constants.js';
import type {
  ComposerShellImplementationPackage,
  OpusDesignShellEligibilityInput,
  OpusDesignShellPackage,
  OpusShellRevision,
} from '../../shared/site00-opus-design-shell/types.js';
import { isAnthropicConfigured, modelAvailabilityBlocked } from '../_lib/site00OpusDesignShell/config.js';
import {
  appendEvent,
  getHandoff,
  getPackage,
  getResult,
  latestResultForPackage,
  listEvents,
  listRevisionsForResult,
  saveHandoff,
  savePackage,
  saveResult,
  saveRevision,
} from '../_lib/site00OpusDesignShell/persistence.js';
import { runOpusDesignShellGeneration } from '../_lib/site00OpusDesignShell/runShellGeneration.js';

type Body = {
  action:
    | 'preflight'
    | 'create_package'
    | 'run'
    | 'request_changes'
    | 'approve'
    | 'composer_handoff'
    | 'get';
  eligibility?: OpusDesignShellEligibilityInput;
  package?: OpusDesignShellPackage;
  packageId?: string;
  shellResultId?: string;
  founderConfirmedRun?: boolean;
  founderInstruction?: string;
  changeInstruction?: string;
  mode?: 'CREATE' | 'REFINE';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const packageId = typeof req.query.packageId === 'string' ? req.query.packageId : '';
    const shellResultId = typeof req.query.shellResultId === 'string' ? req.query.shellResultId : '';
    return res.status(200).json({
      ok: true,
      model: OPUS_DESIGN_SHELL_MODEL,
      anthropicConfigured: isAnthropicConfigured(),
      package: packageId ? getPackage(packageId) : null,
      result: shellResultId ? getResult(shellResultId) : packageId ? latestResultForPackage(packageId) : null,
      events: packageId ? listEvents(packageId) : [],
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const authed = await getAuthUser(req);
  const email = authed?.email ?? null;
  if (!email) return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
  if (!isFounderPrivilegedAccount(email)) return res.status(403).json({ ok: false, error: 'FOUNDER_ONLY' });

  const body = (typeof req.body === 'object' && req.body ? req.body : {}) as Body;

  try {
    if (body.action === 'preflight') {
      const input = body.eligibility;
      if (!input) return res.status(400).json({ ok: false, error: 'ELIGIBILITY_REQUIRED' });
      const enriched: OpusDesignShellEligibilityInput = {
        ...input,
        anthropicConfigured: isAnthropicConfigured(),
        modelAvailable: !modelAvailabilityBlocked(),
      };
      const hasExisting = Boolean(body.packageId && latestResultForPackage(body.packageId));
      const eligibility = evaluateOpusDesignShellEligibility(enriched, hasExisting);
      return res.status(200).json({ ok: true, eligibility, model: OPUS_DESIGN_SHELL_MODEL });
    }

    if (body.action === 'create_package') {
      const input = body.eligibility;
      if (!input) return res.status(400).json({ ok: false, error: 'ELIGIBILITY_REQUIRED' });
      const enriched: OpusDesignShellEligibilityInput = {
        ...input,
        anthropicConfigured: isAnthropicConfigured(),
        modelAvailable: !modelAvailabilityBlocked(),
      };
      const eligibility = evaluateOpusDesignShellEligibility(enriched, false);
      if (!eligibility.eligible) {
        return res.status(422).json({ ok: false, error: eligibility.blockedCode, reason: eligibility.blockedReason });
      }
      const pkg = compileOpusDesignShellPackage({
        targetType: input.targetType,
        projectId: input.projectId,
        pageId: input.pageId,
        workspaceTargetId: input.workspaceTargetId,
        authorityPairId: `pair-${input.pageId ?? input.workspaceTargetId}`,
        mobileAuthorityArtifactId: input.projectId ? `${input.projectId}:mobile-auth` : 'mobile-auth',
        desktopAuthorityArtifactId: input.projectId ? `${input.projectId}:desktop-auth` : 'desktop-auth',
        currentMobileCaptureId: input.hasMobileCapture ? 'mobile-cap' : null,
        currentDesktopCaptureId: input.hasDesktopCapture ? 'desktop-cap' : null,
        functionContractId: input.hasFunctionContract ? `fc-${input.pageId ?? 'workspace'}` : 'missing',
        componentMap: [{ id: 'twin-opus-shell', label: 'Twin Opus workspace', role: 'presentation' }],
        founderInstruction: body.founderInstruction ?? null,
        createdBy: email,
      });
      assertScopedContextOnly(pkg.relevantSourceFiles);
      if (packageIncludesWholeRepo(pkg)) {
        return res.status(422).json({ ok: false, error: 'SCOPE_VIOLATION' });
      }
      savePackage(pkg);
      appendEvent({ type: 'opus_shell_package_created', at: new Date().toISOString(), packageId: pkg.packageId });
      return res.status(200).json({ ok: true, package: pkg });
    }

    if (body.action === 'run') {
      if (body.founderConfirmedRun !== true) {
        return res.status(400).json({ ok: false, error: 'SPEND_GUARD', reason: 'Explicit RUN OPUS confirmation required.' });
      }
      const pkg = body.package ?? (body.packageId ? getPackage(body.packageId) : null);
      if (!pkg) return res.status(404).json({ ok: false, error: 'PACKAGE_NOT_FOUND' });
      appendEvent({
        type: 'opus_shell_generation_requested',
        at: new Date().toISOString(),
        packageId: pkg.packageId,
      });
      appendEvent({ type: 'opus_shell_generation_started', at: new Date().toISOString(), packageId: pkg.packageId });
      const result = await runOpusDesignShellGeneration(pkg, body.mode ?? 'CREATE');
      saveResult(result);
      const cacheEvent =
        result.usageReceipt.cacheReadInputTokens > 0 ? 'opus_shell_cache_hit' : 'opus_shell_cache_created';
      appendEvent({
        type: cacheEvent,
        at: new Date().toISOString(),
        packageId: pkg.packageId,
        shellResultId: result.shellResultId,
      });
      appendEvent({
        type: 'opus_shell_generation_completed',
        at: new Date().toISOString(),
        packageId: pkg.packageId,
        shellResultId: result.shellResultId,
      });
      const revision: OpusShellRevision = {
        revisionId: `odrev-${Date.now()}`,
        shellResultId: result.shellResultId,
        parentRevisionId: null,
        instruction: pkg.founderInstruction ?? null,
        artifacts: result.proposedFiles,
        usage: result.usageReceipt,
        status: result.status,
        createdAt: result.createdAt,
      };
      saveRevision(revision);
      appendEvent({
        type: 'opus_shell_revision_created',
        at: revision.createdAt,
        packageId: pkg.packageId,
        shellResultId: result.shellResultId,
        revisionId: revision.revisionId,
      });
      return res.status(200).json({ ok: true, result, revision, productionWriteAccess: false });
    }

    if (body.action === 'request_changes') {
      const shellResultId = body.shellResultId;
      if (!shellResultId || !body.changeInstruction?.trim()) {
        return res.status(400).json({ ok: false, error: 'CHANGE_INSTRUCTION_REQUIRED' });
      }
      const prior = getResult(shellResultId);
      if (!prior) return res.status(404).json({ ok: false, error: 'RESULT_NOT_FOUND' });
      const pkg = getPackage(prior.packageId);
      if (!pkg) return res.status(404).json({ ok: false, error: 'PACKAGE_NOT_FOUND' });
      const nextPkg: OpusDesignShellPackage = {
        ...pkg,
        packageId: `${pkg.packageId}-rev-${Date.now()}`,
        founderInstruction: body.changeInstruction.trim(),
        createdAt: new Date().toISOString(),
      };
      savePackage(nextPkg);
      appendEvent({
        type: 'opus_shell_change_requested',
        at: new Date().toISOString(),
        packageId: nextPkg.packageId,
        detail: body.changeInstruction.slice(0, 120),
      });
      if (body.founderConfirmedRun !== true) {
        return res.status(200).json({ ok: true, package: nextPkg, awaitingRun: true });
      }
      const result = await runOpusDesignShellGeneration(nextPkg, 'REFINE');
      saveResult(result);
      const parentRev = listRevisionsForResult(shellResultId).at(-1)?.revisionId ?? null;
      const revision: OpusShellRevision = {
        revisionId: `odrev-${Date.now()}`,
        shellResultId: result.shellResultId,
        parentRevisionId: parentRev,
        instruction: body.changeInstruction.trim(),
        artifacts: result.proposedFiles,
        usage: result.usageReceipt,
        status: result.status,
        createdAt: result.createdAt,
      };
      saveRevision(revision);
      appendEvent({
        type: 'opus_shell_revision_created',
        at: revision.createdAt,
        packageId: nextPkg.packageId,
        shellResultId: result.shellResultId,
        revisionId: revision.revisionId,
      });
      return res.status(200).json({ ok: true, result, revision, productionWriteAccess: false });
    }

    if (body.action === 'approve') {
      const shellResultId = body.shellResultId;
      if (!shellResultId) return res.status(400).json({ ok: false, error: 'RESULT_REQUIRED' });
      const result = getResult(shellResultId);
      if (!result) return res.status(404).json({ ok: false, error: 'RESULT_NOT_FOUND' });
      const approved = { ...result, status: 'APPROVED' as const };
      saveResult(approved);
      appendEvent({
        type: 'opus_shell_approved',
        at: new Date().toISOString(),
        packageId: approved.packageId,
        shellResultId,
      });
      return res.status(200).json({ ok: true, result: approved, composerHandoffReady: true });
    }

    if (body.action === 'composer_handoff') {
      const shellResultId = body.shellResultId;
      if (!shellResultId) return res.status(400).json({ ok: false, error: 'RESULT_REQUIRED' });
      const result = getResult(shellResultId);
      if (!result || result.status !== 'APPROVED') {
        return res.status(422).json({ ok: false, error: 'SHELL_NOT_APPROVED' });
      }
      const pkg = getPackage(result.packageId);
      if (!pkg) return res.status(404).json({ ok: false, error: 'PACKAGE_NOT_FOUND' });
      const revision = listRevisionsForResult(shellResultId).at(-1);
      const handoff: ComposerShellImplementationPackage = {
        packageId: `cship-${Date.now()}`,
        opusShellRevisionId: revision?.revisionId ?? shellResultId,
        authorityPairId: pkg.authorityPairId,
        functionContractId: pkg.functionContractId,
        approvedPresentationFiles: result.proposedFiles,
        approvedCssArtifacts: result.cssArtifacts,
        currentProductionComponentMap: pkg.componentMap,
        implementationRules: [
          'Composer integrates approved staged shell into production.',
          'Opus must not write production files directly.',
        ],
        immutableBehaviorRules: pkg.forbiddenMutationScope,
        createdAt: new Date().toISOString(),
      };
      saveHandoff(handoff);
      appendEvent({
        type: 'composer_shell_handoff_created',
        at: handoff.createdAt,
        packageId: pkg.packageId,
        shellResultId,
        revisionId: handoff.opusShellRevisionId,
      });
      return res.status(200).json({ ok: true, handoff });
    }

    return res.status(400).json({ ok: false, error: 'UNKNOWN_ACTION' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OPUS_SHELL_ERROR';
    appendEvent({
      type: 'opus_shell_generation_failed',
      at: new Date().toISOString(),
      packageId: body.packageId,
      detail: message.slice(0, 200),
    });
    const status =
      message.startsWith('BLOCKED_') ? 422
      : message === 'INVALID_OUTPUT' || message.startsWith('API_FAILED') ? 502
      : 500;
    return res.status(status).json({ ok: false, error: message });
  }
}
