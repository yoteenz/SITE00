import { OPUS_DESIGN_SHELL_API_PATH } from '../../../shared/site00-opus-design-shell/constants.js';
import type {
  ComposerShellImplementationPackage,
  OpusDesignShellEligibility,
  OpusDesignShellEligibilityInput,
  OpusDesignShellPackage,
  OpusDesignShellResult,
  OpusShellRevision,
} from '../../../shared/site00-opus-design-shell/types.js';
import { apiFetch } from '../../utils/api.js';

async function post<T>(body: Record<string, unknown>): Promise<T> {
  const res = await apiFetch(OPUS_DESIGN_SHELL_API_PATH, { method: 'POST', body });
  const json = (await res.json()) as T & { ok?: boolean; error?: string; reason?: string };
  if (!res.ok || json.ok === false) {
    throw new Error(json.reason ?? json.error ?? `OPUS_SHELL_${res.status}`);
  }
  return json;
}

export async function fetchOpusDesignShellServiceInfo(): Promise<{
  model: string;
  anthropicConfigured: boolean;
}> {
  const res = await apiFetch(`${OPUS_DESIGN_SHELL_API_PATH}`, { method: 'GET' });
  const json = (await res.json()) as { model: string; anthropicConfigured: boolean };
  return { model: json.model, anthropicConfigured: json.anthropicConfigured };
}

export async function preflightOpusDesignShell(
  eligibility: OpusDesignShellEligibilityInput,
  packageId?: string,
): Promise<OpusDesignShellEligibility> {
  const json = await post<{ eligibility: OpusDesignShellEligibility }>({
    action: 'preflight',
    eligibility,
    packageId,
  });
  return json.eligibility;
}

export async function createOpusDesignShellPackage(
  eligibility: OpusDesignShellEligibilityInput,
  founderInstruction?: string,
): Promise<OpusDesignShellPackage> {
  const json = await post<{ package: OpusDesignShellPackage }>({
    action: 'create_package',
    eligibility,
    founderInstruction,
  });
  return json.package;
}

export async function runOpusDesignShell(input: {
  package: OpusDesignShellPackage;
  mode: 'CREATE' | 'REFINE';
  founderConfirmedRun: true;
}): Promise<{ result: OpusDesignShellResult; revision: OpusShellRevision }> {
  return post({
    action: 'run',
    package: input.package,
    mode: input.mode,
    founderConfirmedRun: true,
  });
}

export async function requestOpusShellChanges(input: {
  shellResultId: string;
  changeInstruction: string;
  founderConfirmedRun?: boolean;
}): Promise<{ package?: OpusDesignShellPackage; result?: OpusDesignShellResult; awaitingRun?: boolean }> {
  return post({
    action: 'request_changes',
    shellResultId: input.shellResultId,
    changeInstruction: input.changeInstruction,
    founderConfirmedRun: input.founderConfirmedRun,
  });
}

export async function approveOpusShell(shellResultId: string): Promise<OpusDesignShellResult> {
  const json = await post<{ result: OpusDesignShellResult }>({ action: 'approve', shellResultId });
  return json.result;
}

export async function createComposerShellHandoff(
  shellResultId: string,
): Promise<ComposerShellImplementationPackage> {
  const json = await post<{ handoff: ComposerShellImplementationPackage }>({
    action: 'composer_handoff',
    shellResultId,
  });
  return json.handoff;
}
