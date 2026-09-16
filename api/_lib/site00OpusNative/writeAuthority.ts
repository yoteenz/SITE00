/**
 * P0.VR.OPUS-NATIVE2 — Phase 6, 7, 8, 9: resolving capability into paths.
 *
 * Three questions, answered in one place so the panel, the context compiler
 * and the tool layer cannot disagree about them:
 *
 *   1. what capability does this intent require?
 *   2. what capability does this surface permit right now?
 *   3. which concrete files and directories does that capability open?
 *
 * The third question is the one that makes the ladder real. A mode is not a
 * label the model is asked to respect; it resolves to an explicit allowlist
 * that the sandbox enforces byte-for-byte, and a mode the founder has not
 * granted resolves to a shorter list rather than a stern instruction.
 */

import path from 'node:path';

import {
  DESIGN_AGENT_INTENT_SPECS,
  READ_ONLY_POLICY,
  writeModeAtLeast,
  writeModeRank,
  type DesignAgentIntent,
  type DesignSurfaceWritePolicy,
  type DesignWriteMode,
  type FounderWriteGrant,
  type WriteAuthorizationRequest,
} from '../../../shared/site00-opus-native/writePolicy.js';
import { isInspectablePath } from './contextCompiler.js';
import type { DesignSurfaceEntry } from './designSurfaceRegistry.js';

/**
 * Which of a surface's declared file groups each mode opens. Expressed as a
 * function of the registry entry rather than a static list, so registering a
 * new surface never requires touching the ladder.
 */
function filesForMode(surface: DesignSurfaceEntry, mode: DesignWriteMode): string[] {
  const files: string[] = [];
  if (!writeModeAtLeast(mode, 'STYLE_ONLY')) return files;
  files.push(...surface.styles);
  if (writeModeAtLeast(mode, 'COMPONENT_ONLY')) files.push(...surface.components);
  if (writeModeAtLeast(mode, 'PAGE_EDIT')) {
    files.push(...surface.stateHooks, ...surface.contentModules);
  }
  if (writeModeAtLeast(mode, 'PAGE_CREATE')) files.push(...surface.routeRegistryFiles);
  return [...new Set(files)].filter(isInspectablePath);
}

/**
 * NATIVE1's `writable` list is still honoured, as a floor rather than as the
 * whole answer. The proof surface declared exactly one writable stylesheet and
 * that intent should survive the ladder, so the standing policy is the union
 * of the mode's resolved files and whatever the entry explicitly listed.
 */
export function policyForMode(
  surface: DesignSurfaceEntry,
  mode: DesignWriteMode,
  grant?: FounderWriteGrant,
): DesignSurfaceWritePolicy {
  if (mode === 'READ_ONLY') return { ...READ_ONLY_POLICY };

  const creating = writeModeAtLeast(mode, 'PAGE_CREATE');
  const explicit = surface.writable.filter(isInspectablePath);
  const allowedFiles = [...new Set([...filesForMode(surface, mode), ...explicit])].sort();

  return {
    mode,
    allowedFiles,
    allowedDirectories: creating ? [...surface.allowedCreateDirectories] : [],
    allowNewFiles: creating,
    /**
     * Phase 9. Never implied by a mode, at any rung. Only an explicit,
     * separately-worded founder grant turns this on, because the founder
     * approving "create a child page" has not thereby approved replacing a
     * Grok-approved plate inside it.
     */
    allowAssetReferenceChanges: grant?.allowAssetReferenceChanges === true,
    allowStateChanges: writeModeAtLeast(mode, 'PAGE_EDIT'),
    allowRouteCreation: creating && surface.routeRegistryFiles.length > 0,
    /**
     * Shared modules are the parent's property. A derivative that needs the
     * shell changed is a change to the parent and belongs in a sprint against
     * the parent, not in a side effect of creating a child.
     */
    allowSharedComponentChanges: false,
  };
}

export interface ResolvedWriteAuthority {
  intent: DesignAgentIntent;
  requestedMode: DesignWriteMode;
  permittedMode: DesignWriteMode;
  standingMode: DesignWriteMode;
  maxGrantableMode: DesignWriteMode;
  policy: DesignSurfaceWritePolicy;
  /** Null when the run may proceed. Populated when the founder must answer. */
  authorizationRequest: WriteAuthorizationRequest | null;
  /** True when a founder grant is what raised the ceiling for this run. */
  grantApplied: boolean;
}

/**
 * Phase 7. A grant is clamped to the surface's own ceiling rather than
 * trusted: the request arrives over HTTP, and a surface that declares itself
 * ungrantable past COMPONENT_ONLY must stay that way even if a caller asks for
 * DERIVATIVE_CREATE. The clamp is silent on purpose — the authorization
 * request that comes back states the real ceiling, so the founder sees the
 * truth rather than a rejected-request error.
 */
export function resolveWriteAuthority(input: {
  surface: DesignSurfaceEntry;
  intent: DesignAgentIntent;
  route: string;
  grant?: FounderWriteGrant | null;
}): ResolvedWriteAuthority {
  const { surface, intent, route } = input;
  const spec = DESIGN_AGENT_INTENT_SPECS[intent];
  const requestedMode = spec.requiredMode;
  const standingMode = surface.standingWriteMode;
  const maxGrantableMode = surface.maxGrantableWriteMode;

  let permittedMode = standingMode;
  let grantApplied = false;
  if (input.grant) {
    const clamped =
      writeModeRank(input.grant.mode) > writeModeRank(maxGrantableMode)
        ? maxGrantableMode
        : input.grant.mode;
    if (writeModeRank(clamped) > writeModeRank(permittedMode)) {
      permittedMode = clamped;
      grantApplied = true;
    }
  }

  const policy = policyForMode(surface, permittedMode, input.grant ?? undefined);

  let authorizationRequest: WriteAuthorizationRequest | null = null;
  if (writeModeRank(requestedMode) > writeModeRank(permittedMode)) {
    const wanted = policyForMode(surface, requestedMode);
    authorizationRequest = {
      pageId: surface.pageId,
      route,
      intent,
      requestedMode,
      permittedMode,
      maxGrantableMode,
      additionalFiles: wanted.allowedFiles.filter((file) => !policy.allowedFiles.includes(file)),
      additionalDirectories: wanted.allowedDirectories.filter(
        (dir) => !policy.allowedDirectories.includes(dir),
      ),
      reason:
        surface.writeFirewallReason ??
        `${surface.pageId} stands at ${standingMode}. "${spec.label}" needs ${requestedMode}.`,
      grantable: writeModeRank(requestedMode) <= writeModeRank(maxGrantableMode),
    };
  }

  return {
    intent,
    requestedMode,
    permittedMode,
    standingMode,
    maxGrantableMode,
    policy,
    authorizationRequest,
    grantApplied,
  };
}

/**
 * Phase 9 — the asset firewall, checked against edit *content* rather than
 * file path.
 *
 * A component file can be perfectly in scope while the specific edit swaps a
 * Grok-approved plate for something else. OPUS-ASSET-PERSISTENCE1 established
 * that asset identity on these surfaces is a separate authority with its own
 * lineage, so path-level permission is the wrong granularity and would let the
 * exact regression that sprint fixed back in through a different door.
 */
const ASSET_REFERENCE_PATTERN = /(\.(?:png|jpe?g|webp|avif|svg|gif))\b/i;

export interface AssetGuardVerdict {
  blocked: boolean;
  reason: string | null;
}

export function checkAssetMutation(
  edits: Array<{ file: string; find: string; replace: string }>,
  surface: DesignSurfaceEntry,
  policy: DesignSurfaceWritePolicy,
): AssetGuardVerdict {
  if (policy.allowAssetReferenceChanges) return { blocked: false, reason: null };

  for (const edit of edits) {
    const protectedFile = surface.protectedAssets.some(
      (guarded) => edit.file === guarded || edit.file.startsWith(guarded),
    );
    const touchesAssetLiteral =
      ASSET_REFERENCE_PATTERN.test(edit.find) || ASSET_REFERENCE_PATTERN.test(edit.replace);

    if (protectedFile) {
      return {
        blocked: true,
        reason: `${edit.file} carries approved asset identity for ${surface.pageId}. ASSET_MUTATION is BLOCKED by default and was not granted for this run.`,
      };
    }
    // An edit that neither removes nor introduces an asset reference cannot
    // change asset identity, whatever else it does to the file.
    if (touchesAssetLiteral && referenceSetChanged(edit.find, edit.replace)) {
      return {
        blocked: true,
        reason: `the edit to ${edit.file} changes an asset reference. Asset identity belongs to the approved manifest${surface.assetManifestPath ? ` (${surface.assetManifestPath})` : ''}; ASSET_MUTATION is BLOCKED by default and was not granted for this run.`,
      };
    }
  }
  return { blocked: false, reason: null };
}

function referenceSetChanged(find: string, replace: string): boolean {
  const extract = (text: string) =>
    new Set((text.match(/[\w./\-]+\.(?:png|jpe?g|webp|avif|svg|gif)/gi) ?? []).map((s) => s.toLowerCase()));
  const before = extract(find);
  const after = extract(replace);
  if (before.size !== after.size) return true;
  for (const item of before) if (!after.has(item)) return true;
  return false;
}

/**
 * Phase 10/14 — a path proposed for creation. Directory containment is checked
 * after normalisation so `allowed/../../etc` cannot pose as an allowed path.
 */
export function isCreatablePath(relative: string, policy: DesignSurfaceWritePolicy): boolean {
  if (!policy.allowNewFiles) return false;
  if (!isInspectablePath(relative)) return false;
  const normalized = path.posix.normalize(relative);
  if (normalized.startsWith('..')) return false;
  return policy.allowedDirectories.some((dir) => {
    const base = dir.endsWith('/') ? dir : `${dir}/`;
    return normalized.startsWith(base);
  });
}
