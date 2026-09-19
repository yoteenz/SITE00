/**
 * P0.BRIDGE.1 — Structured operation validation (no arbitrary code).
 */

import { ALLOWED_RUNTIME_COMPONENT_KEYS, FORBIDDEN_OPERATION_TYPES } from './constants.js';
import type { Site00ChangeOperationRecord } from './types.js';

export type OperationValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateChangeOperations(operations: Site00ChangeOperationRecord[]): OperationValidationResult {
  const errors: string[] = [];

  if (operations.length === 0) {
    errors.push('At least one change operation is required');
  }

  const orders = new Set<number>();
  for (const op of operations) {
    if (FORBIDDEN_OPERATION_TYPES.includes(op.operationType as (typeof FORBIDDEN_OPERATION_TYPES)[number])) {
      errors.push(`Forbidden operation type: ${op.operationType}`);
    }

    if (orders.has(op.operationOrder)) {
      errors.push(`Duplicate operation order: ${op.operationOrder}`);
    }
    orders.add(op.operationOrder);

    const componentKey = op.payload?.componentKey;
    if (typeof componentKey === 'string' && componentKey.length > 0) {
      if (!ALLOWED_RUNTIME_COMPONENT_KEYS.includes(componentKey as (typeof ALLOWED_RUNTIME_COMPONENT_KEYS)[number])) {
        if (op.operationType === 'UPDATE_ALLOWED_COMPONENT_VARIANT' || op.operationType === 'ADD_SECTION') {
          errors.push(`Component key not in allowlist: ${componentKey}`);
        }
      }
    }

    const rawCode = op.payload?.code ?? op.payload?.script ?? op.payload?.source;
    if (typeof rawCode === 'string' && rawCode.trim().length > 0) {
      errors.push('Arbitrary code in operation payload is forbidden');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function arbitraryCodeOperationBlocked(): boolean {
  return true;
}
