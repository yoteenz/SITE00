import { assessProviderAccess } from '../capability/providerAccessAssessment.js';
import type { ReferenceReadinessResult, ShotExecutionContract } from '../types/schemas.js';
import type {
  CinematicVideoProviderAdapter,
  CompiledProviderRequest,
  ProviderCapabilityValidation,
  ProviderJobHandle,
} from './adapterContract.js';

/**
 * Artlist Kling 4 adapter — MANUAL_SUBMISSION by default.
 * Does not perform paid API calls; produces founder-review execution packets.
 */
export class ArtlistKling4Adapter implements CinematicVideoProviderAdapter {
  providerId = 'artlist-kling-4';
  modelId = 'kling-4.0';
  automationMode = assessProviderAccess().artlistAutomation;

  validateCapabilities(contract: ShotExecutionContract): ProviderCapabilityValidation {
    const unsupported: string[] = [];
    if (this.automationMode !== 'API_AUTOMATED') {
      unsupported.push('Automated submitJob — use Artlist AI Toolkit UI or authorized MCP with founder approval.');
    }
    if (contract.outputResolution === '4K') {
      unsupported.push('4K — Artlist UI advertises 720p/1080p only.');
    }
    return {
      ok: unsupported.length === 0 || this.automationMode === 'MANUAL_SUBMISSION',
      mode: this.automationMode,
      unsupportedRequirements: unsupported,
    };
  }

  validateReferences(readiness: ReferenceReadinessResult): { ok: boolean; detail?: string } {
    if (!readiness.ok) {
      return { ok: false, detail: `${readiness.blockedReason}: ${readiness.detail}` };
    }
    return { ok: true };
  }

  compileRequest(
    contract: ShotExecutionContract,
    compiledKeyframes: Record<string, unknown>,
  ): CompiledProviderRequest {
    const refs = contract.referenceManifest.references.map((r) => ({
      assetId: r.assetId,
      role: r.referenceRole,
      localPublicPath: r.fileLocation.replace(/^public/, ''),
      hash: r.contentHash,
    }));

    const payload = {
      model: this.modelId,
      durationSec: contract.expectedDurationSec,
      aspectRatio: contract.expectedAspectRatio,
      resolution: contract.outputResolution,
      keyframes: compiledKeyframes,
      references: refs,
      prompt: [
        contract.actionDescription,
        contract.cameraDirection,
        contract.cameraMovement,
        contract.performanceDirection,
        contract.lightingDirection,
        contract.negativeConstraints.join('; '),
      ].join('\n'),
      motionAuthority: contract.motionAuthority,
      identityLocks: contract.identityContinuity,
    };

    return {
      provider: this.providerId,
      model: this.modelId,
      mode: this.automationMode,
      payload,
      manualInstructions:
        'Open Artlist AI Toolkit → Kling 4.0. Upload reference images from the manifest public paths. ' +
        'Set start/end frames from START_FRAME and END_FRAME roles. Paste prompt block from payload.prompt. ' +
        'Do not spend credits until founder confirms preflight report and spend authorization.',
    };
  }

  async submitJob(): Promise<ProviderJobHandle> {
    return {
      providerJobId: null,
      state: 'NOT_SUBMITTED',
      error: 'API_AUTOMATED submit disabled — MANUAL_SUBMISSION mode.',
    };
  }

  reportProviderError(error: unknown): { code: string; message: string; retrySafe: boolean } {
    const message = error instanceof Error ? error.message : String(error);
    return { code: 'ARTLIST_KLING4_MANUAL_MODE', message, retrySafe: false };
  }
}

export const artlistKling4Adapter = new ArtlistKling4Adapter();
