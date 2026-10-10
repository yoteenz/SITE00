/**
 * Blueprint review model — what a client and the founder can be told about a submitted Builder Blueprint.
 *
 * Reads only what the canonical BUILDER intake records: the intake status, the versioned
 * `BuilderSpatialSubmittedPayload` (`current` + `history`) and the revision requests in the draft envelope.
 * Nothing here mutates, and no state is shown that the server record does not support.
 */
import type { IntakeDetail, IntakeStatus } from '../../../shared/site00-intakes/types';
import { normalizeIntakeStatus } from '../../../shared/site00-intakes/types';
import type {
  BuilderSpatialBlueprintSubmission,
  BuilderSpatialRevisionRequest,
  BuilderSpatialSubmittedPayload,
} from '../../../shared/site00-builder-spatial-intake/types';
import { parseSubmittedPayload } from '../builder-experience/spatialStudio/buildSubmissionPayload';
import { parseBuilderSpatialDraft } from '../builder-experience/spatialStudio/intakeDraft';
import type { BlueprintSessionSnapshot } from '../builder-experience/spatialStudio';
import { FEEL_BY_ID, PACE_OPTIONS, PATH_OPTIONS, WORK_MODULE_BY_ID } from './studioModel';

/* ─────────────────────────────── payload access ─────────────────────────────── */

export function spatialSubmission(intake: Pick<IntakeDetail, 'submittedPayload'> | null | undefined): BuilderSpatialSubmittedPayload | null {
  return parseSubmittedPayload(intake?.submittedPayload ?? null);
}

/** Every submitted version, oldest first. The original is never replaced: resubmission moves it into `history`. */
export function blueprintVersions(payload: BuilderSpatialSubmittedPayload | null): BuilderSpatialBlueprintSubmission[] {
  if (!payload) return [];
  return [...(payload.history ?? []), payload.current].sort((a, b) => a.version - b.version);
}

export function versionSnapshot(submission: BuilderSpatialBlueprintSubmission): BlueprintSessionSnapshot {
  return submission.snapshot as unknown as BlueprintSessionSnapshot;
}

/**
 * Revision requests, oldest first. While a revision is open the newest request lives only in the draft envelope;
 * after resubmission it is copied into the submitted payload. The draft envelope is the superset.
 */
export function revisionRequests(intake: Pick<IntakeDetail, 'draftPayload' | 'submittedPayload'> | null | undefined): BuilderSpatialRevisionRequest[] {
  const envelope = parseBuilderSpatialDraft(intake?.draftPayload ?? null);
  const submitted = spatialSubmission(intake);
  const list = envelope?.revisionRequests ?? submitted?.revisionRequests ?? [];
  return [...list].sort((a, b) => Date.parse(a.requestedAt) - Date.parse(b.requestedAt));
}

export function revisionOpen(intake: Pick<IntakeDetail, 'draftPayload'> | null | undefined): boolean {
  return Boolean(parseBuilderSpatialDraft(intake?.draftPayload ?? null)?.revisionOpen);
}

/** The request that applies to a version: the latest one recorded against that version. */
export function requestForVersion(requests: BuilderSpatialRevisionRequest[], version: number): BuilderSpatialRevisionRequest | null {
  const matching = requests.filter((r) => r.forSubmissionVersion === version);
  return matching[matching.length - 1] ?? null;
}

/* ─────────────────────────────── client stages ─────────────────────────────── */

export type ClientReviewStage =
  | 'DRAFT'
  | 'SUBMISSION_RECEIVED'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUESTED'
  | 'REVISION_SUBMITTED'
  | 'ACCEPTED'
  | 'CLOSED';

export type ClientReviewState = {
  stage: ClientReviewStage;
  status: IntakeStatus | null;
  label: string;
  sub: string;
  /** The submitted version this state refers to (the one under review, or the one a revision was asked for). */
  version: number | null;
  submittedAt: string | null;
  request: { message: string; requestedAt: string; forVersion: number } | null;
  projectId: string | null;
  /** The Blueprint can be edited (no submission yet, or the founder reopened it). */
  editable: boolean;
};

/**
 * The client's post-submission state. Only states the record supports:
 *   SUBMITTED (first version)  → SUBMISSION RECEIVED · AWAITING FOUNDER REVIEW
 *   SUBMITTED (a later version) → REVISION SUBMITTED
 *   IN_REVIEW                  → UNDER REVIEW
 *   ACTIVE + revisionOpen      → REVISION REQUESTED
 *   CONVERTED                  → ACCEPTED (NEXT STEP AVAILABLE when a project is linked)
 *   ARCHIVED                   → CLOSED
 * A refined commercial estimate has no contract yet, so REFINED ESTIMATE AVAILABLE is never shown.
 */
export function clientReviewState(intake: IntakeDetail | null | undefined): ClientReviewState {
  const base: ClientReviewState = {
    stage: 'DRAFT',
    status: null,
    label: '',
    sub: '',
    version: null,
    submittedAt: null,
    request: null,
    projectId: null,
    editable: true,
  };
  if (!intake) return base;
  const status = normalizeIntakeStatus(intake.status);
  const submitted = spatialSubmission(intake);
  const current = submitted?.current ?? null;
  const common = {
    ...base,
    status,
    version: current?.version ?? null,
    submittedAt: current?.submittedAt ?? intake.submittedAt,
    projectId: intake.projectId,
  };

  switch (status) {
    case 'SUBMITTED': {
      const revised = (current?.version ?? 1) > 1;
      return {
        ...common,
        stage: revised ? 'REVISION_SUBMITTED' : 'SUBMISSION_RECEIVED',
        label: revised ? 'REVISION SUBMITTED' : 'SUBMISSION RECEIVED',
        sub: 'AWAITING FOUNDER REVIEW',
        editable: false,
      };
    }
    case 'IN_REVIEW':
      return { ...common, stage: 'UNDER_REVIEW', label: 'UNDER REVIEW', sub: 'SITE 00 IS REVIEWING YOUR BLUEPRINT', editable: false };
    case 'CONVERTED':
      return {
        ...common,
        stage: 'ACCEPTED',
        label: 'ACCEPTED',
        sub: intake.projectId ? 'NEXT STEP AVAILABLE' : 'SITE 00 WILL CONTACT YOU WITH THE NEXT STEP',
        editable: false,
      };
    case 'ARCHIVED':
      return { ...common, stage: 'CLOSED', label: 'CLOSED', sub: 'THIS BLUEPRINT IS NO LONGER ACTIVE', editable: false };
    default: {
      if (current && revisionOpen(intake)) {
        const request = requestForVersion(revisionRequests(intake), current.version);
        return {
          ...common,
          stage: 'REVISION_REQUESTED',
          label: 'REVISION REQUESTED',
          sub: `SITE 00 ASKED FOR CHANGES TO VERSION ${current.version}`,
          request: request
            ? { message: request.message, requestedAt: request.requestedAt, forVersion: request.forSubmissionVersion }
            : null,
          editable: true,
        };
      }
      return { ...common, editable: true };
    }
  }
}

/* ─────────────────────────────── founder stages ─────────────────────────────── */

export type FounderReviewStage =
  | 'NOT_SUBMITTED'
  | 'AWAITING_REVIEW'
  | 'IN_REVIEW'
  | 'REVISION_REQUESTED'
  | 'REVISED_AWAITING_REVIEW'
  | 'CONVERTED'
  | 'ARCHIVED';

export const FOUNDER_STAGE_LABEL: Record<FounderReviewStage, string> = {
  NOT_SUBMITTED: 'NOT SUBMITTED',
  AWAITING_REVIEW: 'AWAITING REVIEW',
  IN_REVIEW: 'IN REVIEW',
  REVISION_REQUESTED: 'REVISION REQUESTED · WAITING ON CLIENT',
  REVISED_AWAITING_REVIEW: 'REVISED · AWAITING REVIEW',
  CONVERTED: 'CONVERTED · PROJECT',
  ARCHIVED: 'ARCHIVED',
};

export function founderReviewStage(intake: IntakeDetail): FounderReviewStage {
  const status = normalizeIntakeStatus(intake.status);
  const current = spatialSubmission(intake)?.current ?? null;
  if (status === 'CONVERTED') return 'CONVERTED';
  if (status === 'ARCHIVED') return 'ARCHIVED';
  if (status === 'IN_REVIEW') return 'IN_REVIEW';
  if (status === 'SUBMITTED') return (current?.version ?? 1) > 1 ? 'REVISED_AWAITING_REVIEW' : 'AWAITING_REVIEW';
  if (current && revisionOpen(intake)) return 'REVISION_REQUESTED';
  return 'NOT_SUBMITTED';
}

/** Which founder actions the record allows right now (mirrors the server's own transition rules). */
export function founderActions(intake: IntakeDetail): { markInReview: boolean; requestRevision: boolean } {
  const status = normalizeIntakeStatus(intake.status);
  const submitted = Boolean(spatialSubmission(intake));
  return {
    markInReview: status === 'SUBMITTED',
    requestRevision: submitted && (status === 'SUBMITTED' || status === 'IN_REVIEW'),
  };
}

/**
 * Guard against an outdated decision. The founder decides on the version they are looking at; if the record has
 * moved on (a newer submission, or a status change) the action must not proceed. Checked against a fresh read
 * immediately before the mutation, because the admin API does not accept an expected version.
 */
export function staleDecisionReason(fresh: IntakeDetail, seen: { version: number | null; status: IntakeStatus }): string | null {
  const freshVersion = spatialSubmission(fresh)?.current.version ?? null;
  const freshStatus = normalizeIntakeStatus(fresh.status);
  if (freshVersion !== seen.version) {
    return `VERSION ${freshVersion ?? '—'} ARRIVED WHILE YOU WERE REVIEWING VERSION ${seen.version ?? '—'}. RELOADED — REVIEW THE NEW VERSION FIRST.`;
  }
  if (freshStatus !== seen.status) {
    return `THIS BLUEPRINT MOVED FROM ${seen.status.replace(/_/g, ' ')} TO ${freshStatus.replace(/_/g, ' ')}. RELOADED — CHECK IT BEFORE DECIDING.`;
  }
  return null;
}

/* ─────────────────────────────── readable facts + diff ─────────────────────────────── */

export type VersionFacts = {
  version: number;
  submittedAt: string;
  estimatorVersion: string;
  place: string;
  feel: string;
  modules: string;
  pace: string;
  notes: string;
  buildKind: string;
  level: string;
  structure: string;
  visualSystem: string;
  pages: string[];
  capabilities: string[];
  investment: string | null;
  window: string | null;
  confidence: string | null;
  delivery: string | null;
  ready: boolean;
  blockers: string[];
};

function line(snapshot: BlueprintSessionSnapshot, key: string): string {
  return snapshot.blueprint?.lines?.find((l) => l.key === key)?.value ?? '—';
}

/** A submitted version as plain facts — so nobody has to read the JSON to understand it. */
export function versionFacts(submission: BuilderSpatialBlueprintSubmission): VersionFacts {
  const s = submission.spatialState;
  const snap = versionSnapshot(submission);
  const pages = (snap.blueprint?.experiences ?? []).flatMap((g) => g.items.map((i) => `${i.label} · ${i.depth}`));
  return {
    version: submission.version,
    submittedAt: submission.submittedAt,
    estimatorVersion: submission.estimatorVersion,
    place: s.placePath ? PATH_OPTIONS.find((p) => p.id === s.placePath)?.label ?? s.placePath : '—',
    feel: s.feelVibe ? FEEL_BY_ID[s.feelVibe]?.label ?? s.feelVibe : '—',
    modules: s.workModules.map((id) => WORK_MODULE_BY_ID[id]?.label ?? id).join(' · ') || '—',
    pace: s.pace ? PACE_OPTIONS.find((p) => p.id === s.pace)?.label ?? s.pace : '—',
    notes: s.paceNotes?.trim() ?? '',
    buildKind: line(snap, 'BUILD'),
    level: line(snap, 'LEVEL'),
    structure: line(snap, 'STRUCTURE') !== '—' ? line(snap, 'STRUCTURE') : line(snap, 'WORLD'),
    visualSystem: line(snap, 'EXPRESSION'),
    pages,
    capabilities: (snap.blueprint?.capabilities ?? []).map((c) => (c.comesWith ? `${c.verb} (COMES WITH)` : c.verb)),
    investment: snap.estimate?.investment ?? null,
    window: snap.estimate?.productionWindow ?? null,
    confidence: snap.estimate?.confidence?.label ?? null,
    delivery: snap.estimate?.delivery?.selected ?? null,
    ready: snap.submission_ready,
    blockers: snap.submission_blockers ?? [],
  };
}

export const DIFF_FIELDS: { key: keyof VersionFacts; label: string }[] = [
  { key: 'place', label: 'PLACE' },
  { key: 'feel', label: 'FEEL' },
  { key: 'modules', label: 'WORK' },
  { key: 'pace', label: 'PACE' },
  { key: 'notes', label: 'CLIENT NOTE' },
  { key: 'level', label: 'BUILD LEVEL' },
  { key: 'structure', label: 'STRUCTURE' },
  { key: 'visualSystem', label: 'VISUAL SYSTEM' },
  { key: 'investment', label: 'INITIAL INVESTMENT' },
  { key: 'window', label: 'INITIAL WINDOW' },
  { key: 'estimatorVersion', label: 'ESTIMATOR' },
];

export type FactChange = { label: string; from: string; to: string };

export function diffVersions(from: VersionFacts, to: VersionFacts): FactChange[] {
  const out: FactChange[] = [];
  for (const field of DIFF_FIELDS) {
    const a = String(from[field.key] ?? '—') || '—';
    const b = String(to[field.key] ?? '—') || '—';
    if (a !== b) out.push({ label: field.label, from: a, to: b });
  }
  return out;
}

/** A revision request and the client's answer to it: the next submitted version, if there is one. */
export type RevisionExchange = {
  request: BuilderSpatialRevisionRequest;
  response: BuilderSpatialBlueprintSubmission | null;
  changes: FactChange[];
};

export function revisionExchanges(intake: IntakeDetail): RevisionExchange[] {
  const versions = blueprintVersions(spatialSubmission(intake));
  return revisionRequests(intake).map((request) => {
    const asked = versions.find((v) => v.version === request.forSubmissionVersion) ?? null;
    const response = versions.find((v) => v.version > request.forSubmissionVersion && Date.parse(v.submittedAt) >= Date.parse(request.requestedAt)) ?? null;
    return {
      request,
      response,
      changes: asked && response ? diffVersions(versionFacts(asked), versionFacts(response)) : [],
    };
  });
}

/* ─────────────────────────────── status track ─────────────────────────────── */

export type TrackStepState = 'done' | 'current' | 'attention' | 'pending';
export type TrackStep = { key: 'SUBMIT' | 'REVIEW' | 'DECISION'; label: string; sub: string; state: TrackStepState };

/**
 * The three steps a Blueprint goes through with SITE 00, derived only from the record's review stage. A step is
 * marked done only when the intake record holds it; nothing here anticipates the founder's decision.
 */
export function reviewTrack(stage: ClientReviewStage, version: number | null = null): TrackStep[] {
  const v = version ? ` · V${version}` : '';
  const submitted = stage !== 'DRAFT';
  const decided = stage === 'ACCEPTED' || stage === 'REVISION_REQUESTED' || stage === 'CLOSED';
  const decision: TrackStep =
    stage === 'ACCEPTED'
      ? { key: 'DECISION', label: 'ACCEPTED', sub: 'NEXT STEP FROM SITE 00', state: 'done' }
      : stage === 'REVISION_REQUESTED'
        ? { key: 'DECISION', label: 'CHANGES REQUESTED', sub: 'EDIT AND RESUBMIT', state: 'attention' }
        : stage === 'CLOSED'
          ? { key: 'DECISION', label: 'CLOSED', sub: 'NO LONGER ACTIVE', state: 'done' }
          : { key: 'DECISION', label: 'SITE 00 REPLIES', sub: 'BY EMAIL', state: 'pending' };
  return [
    { key: 'SUBMIT', label: submitted ? 'SUBMITTED' : 'SUBMIT', sub: submitted ? `RECEIVED${v}` : 'THIS VERSION', state: submitted ? 'done' : 'current' },
    {
      key: 'REVIEW',
      label: 'FOUNDER REVIEW',
      sub: stage === 'UNDER_REVIEW' ? 'IN PROGRESS' : decided ? 'COMPLETE' : submitted ? 'AWAITING REVIEW' : 'NEXT',
      state: decided ? 'done' : submitted ? 'current' : 'pending',
    },
    decision,
  ];
}
