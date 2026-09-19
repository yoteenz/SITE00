/**
 * P0.BRIDGE.1 — Managed project runtime capability registry.
 * P0.BRIDGE.1B — SITE00-native implementation mode for native projects.
 */

import type { ManagedProjectRuntimeCapability, Site00ChangeExecutionClass, Site00ImplementationMode } from './types.js';
import { RUNTIME_SAFE_CHANGE_TYPES, SOURCE_CODE_CHANGE_TYPES } from './constants.js';
import type { StructuredChangeOperationType } from './types.js';
import { getProjectAuthority } from './projectAuthorityRegistry.js';
import { resolveImplementationMode } from './resolveChangeExecutionTarget.js';

const PROJECT_CAPABILITIES: Record<string, ManagedProjectRuntimeCapability[]> = {
  site00: ['CONTENT_RUNTIME', 'ASSET_RUNTIME', 'TOKEN_RUNTIME', 'SECTION_ORDER_RUNTIME', 'COMPONENT_VARIANT_RUNTIME'],
  ndxbook: ['CONTENT_RUNTIME', 'ASSET_RUNTIME', 'TOKEN_RUNTIME', 'SOURCE_CODE_REQUIRED'],
  'frontal-slayer': ['CONTENT_RUNTIME', 'ASSET_RUNTIME', 'TOKEN_RUNTIME', 'SOURCE_CODE_REQUIRED'],
  'all-in-one-enterprises': ['CONTENT_RUNTIME', 'ASSET_RUNTIME', 'TOKEN_RUNTIME', 'SOURCE_CODE_REQUIRED'],
  'studio-world': ['CONTENT_RUNTIME', 'ASSET_RUNTIME', 'TOKEN_RUNTIME', 'SOURCE_CODE_REQUIRED'],
};

const OPERATION_CAPABILITY: Partial<Record<StructuredChangeOperationType, ManagedProjectRuntimeCapability>> = {
  UPDATE_PAGE_METADATA: 'CONTENT_RUNTIME',
  UPDATE_CONTENT_BINDING: 'CONTENT_RUNTIME',
  CHANGE_ASSET_BINDING: 'ASSET_RUNTIME',
  UPDATE_DESIGN_TOKEN: 'TOKEN_RUNTIME',
  REORDER_SECTION: 'SECTION_ORDER_RUNTIME',
  UPDATE_ALLOWED_COMPONENT_VARIANT: 'COMPONENT_VARIANT_RUNTIME',
  CHANGE_SHARED_SHELL: 'SOURCE_CODE_REQUIRED',
  REGISTER_ROUTE: 'SOURCE_CODE_REQUIRED',
  REGISTER_TAB: 'SOURCE_CODE_REQUIRED',
  UPDATE_RESPONSIVE_RULE: 'SOURCE_CODE_REQUIRED',
  ADD_SECTION: 'SOURCE_CODE_REQUIRED',
  REMOVE_SECTION: 'SOURCE_CODE_REQUIRED',
};

export function listProjectRuntimeCapabilities(projectKey: string): ManagedProjectRuntimeCapability[] {
  return PROJECT_CAPABILITIES[projectKey] ?? ['SOURCE_CODE_REQUIRED'];
}

export function classifyChangeExecution(
  changeType: string,
  operations: Array<{ operationType: StructuredChangeOperationType; requiredCapability?: ManagedProjectRuntimeCapability | null }>,
  projectKey: string,
): { executionClass: Site00ChangeExecutionClass; implementationMode: Site00ImplementationMode; fallbackReason?: string } {
  const authority = getProjectAuthority(projectKey);

  if ((SOURCE_CODE_CHANGE_TYPES as readonly string[]).includes(changeType)) {
    const impl = authority
      ? resolveImplementationMode(authority.executionMode, 'SOURCE_CODE_MATERIALIZATION')
      : { mode: 'SOURCE_REPO_CHANGE' as const, label: 'SOURCE REPO CHANGE' };
    return { executionClass: 'SOURCE_CODE_MATERIALIZATION', implementationMode: impl.mode };
  }

  const caps = listProjectRuntimeCapabilities(projectKey);
  for (const op of operations) {
    const needed = op.requiredCapability ?? OPERATION_CAPABILITY[op.operationType] ?? 'SOURCE_CODE_REQUIRED';
    if (needed === 'SOURCE_CODE_REQUIRED' || !caps.includes(needed)) {
      const impl = authority
        ? resolveImplementationMode(authority.executionMode, 'SOURCE_CODE_MATERIALIZATION')
        : { mode: 'SOURCE_REPO_CHANGE' as const, label: 'SOURCE REPO CHANGE' };
      return {
        executionClass: 'SOURCE_CODE_MATERIALIZATION',
        implementationMode: impl.mode,
        fallbackReason: `Operation ${op.operationType} requires ${needed}`,
      };
    }
  }

  if ((RUNTIME_SAFE_CHANGE_TYPES as readonly string[]).includes(changeType)) {
    const impl = authority
      ? resolveImplementationMode(authority.executionMode, 'RUNTIME_SAFE_BINDING')
      : { mode: 'RUNTIME_BINDING' as const, label: 'RUNTIME BINDING' };
    return { executionClass: 'RUNTIME_SAFE_BINDING', implementationMode: impl.mode };
  }

  const impl = authority
    ? resolveImplementationMode(authority.executionMode, 'SOURCE_CODE_MATERIALIZATION')
    : { mode: 'SOURCE_REPO_CHANGE' as const, label: 'SOURCE REPO CHANGE' };
  return {
    executionClass: 'SOURCE_CODE_MATERIALIZATION',
    implementationMode: impl.mode,
    fallbackReason: 'Change type not runtime-safe',
  };
}

export function studioWorldNativeInfrastructureTargetable(): boolean {
  return false;
}
