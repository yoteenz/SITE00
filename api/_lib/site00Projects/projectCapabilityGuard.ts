/**
 * Project capability guard — replaces NDXBOOK-only architectural guards.
 */

import type { VercelResponse } from '@vercel/node';
import {
  capabilityForAction,
  hasProjectCapability,
  type ProjectCapability,
} from '../../../shared/site00-projects/capabilities.js';

export type CapabilityGuardErrorBody = {
  ok: false;
  error: {
    code: 'PROJECT_CAPABILITY_UNAVAILABLE' | 'PROJECT_NOT_FOUND' | 'INVALID_REQUEST';
    message: string;
    capability?: ProjectCapability;
    projectSlug?: string;
  };
  source: string;
};

function json(res: VercelResponse, status: number, body: CapabilityGuardErrorBody): void {
  res.status(status).json(body);
}

/** Returns true when access is allowed; sends error response and returns false otherwise. */
export function denyUnlessProjectCapability(
  res: VercelResponse,
  slug: string,
  capability: ProjectCapability,
  source: string,
): boolean {
  if (!slug.trim()) {
    json(res, 400, {
      ok: false,
      error: { code: 'INVALID_REQUEST', message: 'slug required' },
      source,
    });
    return false;
  }
  if (!hasProjectCapability(slug, capability)) {
    json(res, 403, {
      ok: false,
      error: {
        code: 'PROJECT_CAPABILITY_UNAVAILABLE',
        message: `Capability ${capability} is not available for project ${slug}`,
        capability,
        projectSlug: slug,
      },
      source,
    });
    return false;
  }
  return true;
}

/** Resolve capability from action name and guard. */
export function denyUnlessActionCapability(
  res: VercelResponse,
  slug: string,
  action: string,
  source: string,
): boolean {
  const capability = capabilityForAction(action);
  if (!capability) {
    return true;
  }
  return denyUnlessProjectCapability(res, slug, capability, source);
}

/** Count remaining architectural ndxbook slug guards (audit diagnostic). */
export function isNdxbookArchitecturalGuardPattern(line: string): boolean {
  return /slug\s*!==\s*['"]ndxbook['"]/.test(line);
}
