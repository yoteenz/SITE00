import fs from 'node:fs';
import path from 'node:path';
import type { BlockedReason, GenerationRequest } from './types.js';

/** Full page first. The environment plate is derived from that page. */
export const AUTHORITY_FIRST_PATH = 'JURNL/MANIFEST/JURNL_AUTHORITY_FIRST.json';

const DENIED = new Set(['SUPERSEDED', 'INVALID', 'INVALID_METHOD', 'REFERENCE_ONLY']);

export type AuthorityFirstCheck =
  | { status: 'PASS' }
  | { status: 'BLOCKED'; blockedReason: Extract<BlockedReason, 'AUTHORITY_FIRST_REQUIRED'> };

type AuthorityRow = {
  authority_type?: string;
  status?: string;
  derivation_allowed?: boolean;
};

/**
 * A JURNL environment plate cannot be the primary creative step.
 * It may dispatch only when the attached reference is a full page
 * the registry allows as a derivation source.
 */
export function validateAuthorityFirstPlate(request: GenerationRequest, repoRoot: string): AuthorityFirstCheck {
  if (request.projectId.toUpperCase() !== 'JURNL') return { status: 'PASS' };
  if (request.generationClass !== 'ENVIRONMENT_PLATE') return { status: 'PASS' };
  if (request.derivationSourceType !== 'FULL_PAGE') {
    return { status: 'BLOCKED', blockedReason: 'AUTHORITY_FIRST_REQUIRED' };
  }

  const hint = request.referenceAuthorityIdHint?.trim() ?? '';
  if (!hint) return { status: 'BLOCKED', blockedReason: 'AUTHORITY_FIRST_REQUIRED' };

  const file = path.join(repoRoot, AUTHORITY_FIRST_PATH);
  if (!fs.existsSync(file)) return { status: 'BLOCKED', blockedReason: 'AUTHORITY_FIRST_REQUIRED' };
  const doc = JSON.parse(fs.readFileSync(file, 'utf8')) as {
    full_page_authorities?: Record<string, AuthorityRow>;
  };
  const row = doc.full_page_authorities?.[hint];
  if (!row) return { status: 'BLOCKED', blockedReason: 'AUTHORITY_FIRST_REQUIRED' };
  if (row.authority_type !== 'FULL_PAGE') return { status: 'BLOCKED', blockedReason: 'AUTHORITY_FIRST_REQUIRED' };
  if (row.derivation_allowed !== true) return { status: 'BLOCKED', blockedReason: 'AUTHORITY_FIRST_REQUIRED' };
  if (DENIED.has(String(row.status ?? ''))) return { status: 'BLOCKED', blockedReason: 'AUTHORITY_FIRST_REQUIRED' };
  return { status: 'PASS' };
}
