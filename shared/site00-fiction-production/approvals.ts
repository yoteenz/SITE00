import type { FictionApprovalStatus } from '../site00-fiction-canon/types.js';
import { APPROVAL_DOMAINS, type ApprovalDomain, type ApprovalRecord, type ApprovalState } from './types.js';

export class ApprovalError extends Error {}

export const FOUNDER_ACTOR = 'founder';

const TRANSITIONS: Record<ApprovalState, ApprovalState[]> = {
  NOT_SUBMITTED: ['DRAFT'],
  DRAFT: ['IN_REVIEW', 'SUPERSEDED'],
  IN_REVIEW: ['APPROVED', 'CHANGES_REQUESTED', 'REJECTED'],
  CHANGES_REQUESTED: ['DRAFT', 'SUPERSEDED'],
  REJECTED: ['DRAFT', 'SUPERSEDED'],
  APPROVED: ['SUPERSEDED'],
  SUPERSEDED: [],
};

const FOUNDER_ONLY: ApprovalState[] = ['APPROVED', 'CHANGES_REQUESTED', 'REJECTED'];

/** A domain may be approved only when these domains are approved for the same release (or, for assets, for every referenced asset). */
export const DOMAIN_PREREQUISITES: Record<ApprovalDomain, ApprovalDomain[]> = {
  STORY_STRUCTURE: [],
  SCREENPLAY: ['STORY_STRUCTURE'],
  CHARACTER_VISUAL_IDENTITY: [],
  CHARACTER_VOICE: [],
  SET: [],
  WARDROBE: [],
  SHOT_PLAN: ['SCREENPLAY'],
  GENERATED_VIDEO: ['SHOT_PLAN', 'CHARACTER_VISUAL_IDENTITY', 'CHARACTER_VOICE', 'SET', 'WARDROBE'],
  FINAL_EDIT: ['GENERATED_VIDEO'],
};

export function newRecord(subjectId: string, domain: ApprovalDomain): ApprovalRecord {
  if (!APPROVAL_DOMAINS.includes(domain)) throw new ApprovalError(`unknown domain ${domain}`);
  return { subjectId, domain, state: 'NOT_SUBMITTED', version: 1, actor: null, decidedAt: null, note: null, history: [] };
}

export type PrerequisiteLookup = (domain: ApprovalDomain) => ApprovalState[];

/**
 * Moves one record. Never touches another domain: approval in one domain does not approve anything downstream.
 * `prerequisites` returns the states of every record in a prerequisite domain that this subject depends on.
 */
export function transition(
  record: ApprovalRecord,
  to: ApprovalState,
  actor: string,
  at: string,
  note: string | null = null,
  prerequisites?: PrerequisiteLookup,
): ApprovalRecord {
  if (!TRANSITIONS[record.state].includes(to)) throw new ApprovalError(`${record.domain} ${record.subjectId}: ${record.state} → ${to} is not allowed`);
  if (FOUNDER_ONLY.includes(to) && actor !== FOUNDER_ACTOR) throw new ApprovalError(`${to} requires the founder; got ${actor}`);
  if (to === 'APPROVED') {
    for (const dep of DOMAIN_PREREQUISITES[record.domain]) {
      const states = prerequisites?.(dep) ?? [];
      if (!states.length || states.some((s) => s !== 'APPROVED')) {
        throw new ApprovalError(`${record.domain} ${record.subjectId}: ${dep} must be approved first (${states.join(', ') || 'no record'})`);
      }
    }
  }
  const decided = FOUNDER_ONLY.includes(to);
  return {
    ...record,
    state: to,
    actor: decided ? actor : record.actor,
    decidedAt: decided ? at : record.decidedAt,
    note: note ?? record.note,
    history: [...record.history, { from: record.state, to, actor, at, note }],
  };
}

/** A revised artifact supersedes the approved version and restarts review at DRAFT. */
export function revise(record: ApprovalRecord, actor: string, at: string, note: string): [ApprovalRecord, ApprovalRecord] {
  if (record.state === 'IN_REVIEW' || record.state === 'NOT_SUBMITTED' || record.state === 'SUPERSEDED') {
    throw new ApprovalError(`${record.domain} ${record.subjectId}: cannot revise from ${record.state}`);
  }
  const old = transition(record, 'SUPERSEDED', actor, at, note);
  const next: ApprovalRecord = {
    ...newRecord(record.subjectId, record.domain),
    version: record.version + 1,
    state: 'DRAFT',
    history: [{ from: 'NOT_SUBMITTED', to: 'DRAFT', actor, at, note }],
  };
  return [old, next];
}

export function toFictionApprovalStatus(state: ApprovalState): FictionApprovalStatus {
  if (state === 'APPROVED') return 'FOUNDER_APPROVED';
  if (state === 'REJECTED') return 'FOUNDER_REJECTED';
  if (state === 'DRAFT' || state === 'IN_REVIEW' || state === 'CHANGES_REQUESTED') return 'PENDING_REVIEW';
  return 'DEFERRED';
}

export type ApprovalBook = { schemaVersion: string; generatedFrom: string; rules: string[]; records: ApprovalRecord[] };

export function findRecords(book: ApprovalBook, domain: ApprovalDomain, subjectPrefix?: string): ApprovalRecord[] {
  return book.records.filter((r) => r.domain === domain && (!subjectPrefix || r.subjectId === subjectPrefix || r.subjectId.startsWith(`${subjectPrefix}/`)));
}

export const APPROVAL_RULES = [
  'Nine separate domains: STORY STRUCTURE, SCREENPLAY, CHARACTER VISUAL IDENTITY, CHARACTER VOICE, SET, WARDROBE, SHOT PLAN, GENERATED VIDEO, FINAL EDIT.',
  'Only the founder can approve, reject or request changes.',
  'Approving one domain never approves another. Each downstream domain needs its own decision.',
  'A domain cannot be approved until its prerequisite domains are approved.',
  'A revision supersedes the approved version and restarts review at DRAFT.',
];
